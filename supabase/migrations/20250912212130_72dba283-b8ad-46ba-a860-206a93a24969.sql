-- COMPREHENSIVE LMS CORE MIGRATION (Fixed Syntax)
-- Implements student auth bridge, enrollment, assignment consolidation, and RLS security

-- 1) Add user bridge and indexes for students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add unique constraint safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_unique') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Add foreign key safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_fkey') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- 2) Create proper class enrollment junction table
CREATE TABLE IF NOT EXISTS public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- 3) Consolidate assignments - ensure canonical columns exist
ALTER TABLE public.class_assignments_new
  ADD COLUMN IF NOT EXISTS selected_components jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS release_at timestamptz,
  ADD COLUMN IF NOT EXISTS due_at timestamptz;

-- Update selected_components to NOT NULL with default if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_assignments_new' AND column_name = 'selected_components') THEN
        ALTER TABLE public.class_assignments_new ALTER COLUMN selected_components SET DEFAULT '[]'::jsonb;
        UPDATE public.class_assignments_new SET selected_components = '[]'::jsonb WHERE selected_components IS NULL;
        ALTER TABLE public.class_assignments_new ALTER COLUMN selected_components SET NOT NULL;
    END IF;
END $$;

-- Update options to NOT NULL with default if it exists  
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_assignments_new' AND column_name = 'options') THEN
        ALTER TABLE public.class_assignments_new ALTER COLUMN options SET DEFAULT '{}'::jsonb;
        UPDATE public.class_assignments_new SET options = '{}'::jsonb WHERE options IS NULL;
        ALTER TABLE public.class_assignments_new ALTER COLUMN options SET NOT NULL;
    END IF;
END $$;

-- Migrate any legacy rows (no-op if empty)
INSERT INTO public.class_assignments_new (id, class_id, lesson_id, selected_components, options, release_at, due_at, created_at)
SELECT id, class_id, lesson_id, COALESCE(selected_components,'[]'::jsonb), COALESCE(options,'{}'::jsonb), release_at, due_at, created_at
FROM public.published_assignments
ON CONFLICT (id) DO NOTHING;

-- Back-compat views (safe to keep until app is fully updated)
CREATE OR REPLACE VIEW public.class_assignments AS SELECT * FROM public.class_assignments_new;
CREATE OR REPLACE VIEW public.published_assignments AS SELECT * FROM public.class_assignments_new;

-- 4) Add submission storage linkage columns
ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overrides jsonb DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.assignment_submissions(student_id);

-- 5) RLS Core Policies
-- Classes RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teacher_owns_class" ON public.classes;
CREATE POLICY "teacher_owns_class" ON public.classes
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- Class roster RLS
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roster_teacher_crud" ON public.class_students;
CREATE POLICY "roster_teacher_crud" ON public.class_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_students.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_students.class_id AND c.teacher_id = auth.uid())
  );

-- Students RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_reads_self" ON public.students;
CREATE POLICY "student_reads_self" ON public.students
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "teacher_reads_roster" ON public.students;
CREATE POLICY "teacher_reads_roster" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_students cs
      JOIN public.classes c ON c.id = cs.class_id
      WHERE cs.student_id = students.id AND c.teacher_id = auth.uid()
    )
  );

-- Assignments RLS
ALTER TABLE public.class_assignments_new ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teacher_manage_assignments" ON public.class_assignments_new;
CREATE POLICY "teacher_manage_assignments" ON public.class_assignments_new
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_assignments_new.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_assignments_new.class_id AND c.teacher_id = auth.uid())
  );

-- Submissions RLS
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_crud_own_submission" ON public.assignment_submissions;
CREATE POLICY "student_crud_own_submission" ON public.assignment_submissions
  FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "teacher_reads_writes_class_submissions" ON public.assignment_submissions;
CREATE POLICY "teacher_reads_writes_class_submissions" ON public.assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments_new a
      JOIN public.classes c ON c.id = a.class_id
      WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid()
    )
  );

-- 6) Storage Policies (assignment-submissions bucket)
-- Student uploads policy
DROP POLICY IF EXISTS "student_uploads" ON storage.objects;
CREATE POLICY "student_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND (position('student/' in name) = 1)
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Student reads own files
DROP POLICY IF EXISTS "student_reads_own" ON storage.objects;
CREATE POLICY "student_reads_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND (position('student/' in name) = 1)
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Teacher reads class files
DROP POLICY IF EXISTS "teacher_reads_class_files" ON storage.objects;
CREATE POLICY "teacher_reads_class_files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND EXISTS (
      SELECT 1
      FROM public.assignment_submissions s
      JOIN public.class_assignments_new a ON a.id = s.assignment_id
      JOIN public.classes c ON c.id = a.class_id
      WHERE (
        'student/' || s.student_id::text || '/assignment/' || s.assignment_id::text
      ) = substring(name from '^([^/]+/[^/]+/[^/]+/[^/]+)')
        AND c.teacher_id = auth.uid()
    )
  );

-- 7) Security Definer Functions (RPCs)
-- Enroll students function
CREATE OR REPLACE FUNCTION public.rpc_enroll_students(p_class_id uuid, p_student_ids uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.class_students(class_id, student_id)
  SELECT p_class_id, sid FROM unnest(p_student_ids) AS sid
  ON CONFLICT (class_id, student_id) DO NOTHING;
END; $$;

-- Assign lesson to class function
CREATE OR REPLACE FUNCTION public.rpc_assign_lesson_to_class(
  p_class_id uuid,
  p_lesson_id uuid,
  p_component_ids uuid[],
  p_due_at timestamptz,
  p_release_at timestamptz,
  p_options jsonb DEFAULT '{}'::jsonb,
  p_per_student_overrides jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_assignment_id uuid; BEGIN
  INSERT INTO public.class_assignments_new(class_id, lesson_id, selected_components, due_at, release_at, options)
  VALUES (p_class_id, p_lesson_id, to_jsonb(p_component_ids), p_due_at, p_release_at, p_options)
  RETURNING id INTO v_assignment_id;

  INSERT INTO public.assignment_submissions(assignment_id, student_id, status)
  SELECT v_assignment_id, cs.student_id, 'assigned'
  FROM public.class_students cs
  WHERE cs.class_id = p_class_id
  ON CONFLICT DO NOTHING;

  UPDATE public.assignment_submissions s
  SET overrides = COALESCE(s.overrides, '{}'::jsonb) || o.ov
  FROM (
    SELECT (elem->>'student_id')::uuid AS sid, (elem - 'student_id') AS ov
    FROM jsonb_array_elements(COALESCE(p_per_student_overrides, '[]'::jsonb)) elem
  ) o
  WHERE s.assignment_id = v_assignment_id AND s.student_id = o.sid;

  RETURN v_assignment_id; END; $$;

-- Backfill assignments for new student
CREATE OR REPLACE FUNCTION public.rpc_backfill_assignments_for_student(p_class_id uuid, p_student_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.assignment_submissions(assignment_id, student_id, status)
  SELECT a.id, p_student_id, 'assigned'
  FROM public.class_assignments_new a
  WHERE a.class_id = p_class_id
  ON CONFLICT DO NOTHING;
$$;