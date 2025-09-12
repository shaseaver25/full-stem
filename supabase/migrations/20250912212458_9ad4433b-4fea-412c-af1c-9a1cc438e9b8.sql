-- LMS CORE ARCHITECTURE MIGRATION (Final)
-- Implements student auth bridge, enrollment system, and secure RLS policies

-- 1) Add user bridge to students table for authentication
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

-- 2) Create class enrollment junction table
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

-- 3) Add file storage columns to assignment submissions (using user_id)
ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overrides jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.assignment_submissions(user_id);

-- 4) Row Level Security Policies

-- Enable RLS on core tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Classes: Teachers own their classes
DROP POLICY IF EXISTS "teacher_owns_class" ON public.classes;
CREATE POLICY "teacher_owns_class" ON public.classes
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- Students: Can view self, teachers can view their roster
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

-- Class enrollment: Teachers manage their class rosters
DROP POLICY IF EXISTS "roster_teacher_crud" ON public.class_students;
CREATE POLICY "roster_teacher_crud" ON public.class_students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_students.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_students.class_id AND c.teacher_id = auth.uid())
  );

-- Assignments: Teachers manage assignments for their classes
DROP POLICY IF EXISTS "teacher_manage_assignments" ON public.class_assignments_new;
CREATE POLICY "teacher_manage_assignments" ON public.class_assignments_new
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_assignments_new.class_id AND c.teacher_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_assignments_new.class_id AND c.teacher_id = auth.uid())
  );

-- Submissions: Students manage own, teachers see class submissions (using user_id)
DROP POLICY IF EXISTS "student_crud_own_submission" ON public.assignment_submissions;
CREATE POLICY "student_crud_own_submission" ON public.assignment_submissions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "teacher_reads_class_submissions" ON public.assignment_submissions;
CREATE POLICY "teacher_reads_class_submissions" ON public.assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments_new a
      JOIN public.classes c ON c.id = a.class_id
      WHERE a.id = assignment_submissions.assignment_id AND c.teacher_id = auth.uid()
    )
  );

-- 5) Storage Policies for Assignment Files
-- Student uploads to their folder
DROP POLICY IF EXISTS "student_uploads" ON storage.objects;
CREATE POLICY "student_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-submissions'
    AND (position('student/' in name) = 1)
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Students read own files
DROP POLICY IF EXISTS "student_reads_own" ON storage.objects;
CREATE POLICY "student_reads_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'assignment-submissions'
    AND (position('student/' in name) = 1)
    AND split_part(name, '/', 2) = auth.uid()::text
  );

-- Teachers read class submission files
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
        'student/' || s.user_id::text || '/assignment/' || s.assignment_id::text
      ) = substring(name from '^([^/]+/[^/]+/[^/]+/[^/]+)')
        AND c.teacher_id = auth.uid()
    )
  );

-- 6) Helper Functions for Complex Operations
-- Enroll multiple students in a class
CREATE OR REPLACE FUNCTION public.rpc_enroll_students(p_class_id uuid, p_student_ids uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.class_students(class_id, student_id)
  SELECT p_class_id, sid FROM unnest(p_student_ids) AS sid
  ON CONFLICT (class_id, student_id) DO NOTHING;
END; $$;

-- Create assignment and auto-create submissions for enrolled students
CREATE OR REPLACE FUNCTION public.rpc_assign_lesson_to_class(
  p_class_id uuid,
  p_lesson_id uuid,
  p_component_ids uuid[],
  p_due_at timestamptz,
  p_release_at timestamptz DEFAULT NULL,
  p_options jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE 
  v_assignment_id uuid; 
BEGIN
  -- Create the assignment
  INSERT INTO public.class_assignments_new(
    class_id, lesson_id, selected_components, due_at, release_at, options
  ) VALUES (
    p_class_id, p_lesson_id, to_jsonb(p_component_ids), p_due_at, p_release_at, p_options
  ) RETURNING id INTO v_assignment_id;

  -- Auto-create submissions for enrolled students (using their user_id)
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT v_assignment_id, s.user_id, 'assigned'
  FROM public.class_students cs
  JOIN public.students s ON s.id = cs.student_id
  WHERE cs.class_id = p_class_id AND cs.status = 'active' AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  RETURN v_assignment_id; 
END; $$;

-- Backfill assignments when enrolling new students
CREATE OR REPLACE FUNCTION public.rpc_backfill_assignments_for_student(p_class_id uuid, p_student_id uuid)
RETURNS void 
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT a.id, s.user_id, 'assigned'
  FROM public.class_assignments_new a
  JOIN public.students s ON s.id = p_student_id
  WHERE a.class_id = p_class_id AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;
$$;