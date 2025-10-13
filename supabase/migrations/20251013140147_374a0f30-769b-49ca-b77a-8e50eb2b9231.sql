-- Step 1: Drop the existing foreign key constraint
ALTER TABLE class_assignments_new 
  DROP CONSTRAINT IF EXISTS class_assignments_new_lesson_id_fkey;

-- Step 2: Drop policies that depend on lesson_id on assignments table
DROP POLICY IF EXISTS "Authenticated users can view assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments for their classes" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments for their classes" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments via class assignments" ON assignments;

-- Step 3: Update class_assignments_new to use UUID for lesson_id
ALTER TABLE class_assignments_new 
  ALTER COLUMN lesson_id TYPE uuid USING lesson_id::text::uuid;

-- Step 4: Add new foreign key constraint pointing to the lessons table (with UUIDs)
ALTER TABLE class_assignments_new
  ADD CONSTRAINT class_assignments_new_lesson_id_fkey 
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- Step 5: Recreate the policies
CREATE POLICY "Authenticated users can view assignments" ON assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    JOIN class_assignments_new ca ON ca.class_id = cs.class_id
    WHERE s.user_id = auth.uid() 
      AND ca.lesson_id::text = assignments.lesson_id::text
  ) 
  OR EXISTS (
    SELECT 1
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    JOIN class_assignments_new ca ON ca.class_id = c.id
    WHERE tp.user_id = auth.uid() 
      AND ca.lesson_id::text = assignments.lesson_id::text
  )
);

CREATE POLICY "Teachers can manage assignments via class assignments" ON assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM class_assignments_new ca
    JOIN classes c ON ca.class_id = c.id
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE ca.lesson_id::text = assignments.lesson_id::text 
      AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM class_assignments_new ca
    JOIN classes c ON ca.class_id = c.id
    JOIN teacher_profiles tp ON c.teacher_id = tp.id
    WHERE ca.lesson_id::text = assignments.lesson_id::text 
      AND tp.user_id = auth.uid()
  )
);

-- Step 6: Update the RPC function
CREATE OR REPLACE FUNCTION public.rpc_assign_lesson_to_class(
  p_class_id uuid,
  p_lesson_id uuid,
  p_component_ids uuid[],
  p_due_at timestamp with time zone,
  p_release_at timestamp with time zone DEFAULT NULL,
  p_options jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  v_assignment_id uuid; 
BEGIN
  -- Create the assignment
  INSERT INTO public.class_assignments_new(
    class_id, lesson_id, selected_components, due_at, release_at, options
  ) VALUES (
    p_class_id, p_lesson_id, to_jsonb(p_component_ids), p_due_at, p_release_at, p_options
  ) RETURNING id INTO v_assignment_id;

  -- Auto-create submissions for enrolled students
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT v_assignment_id, s.user_id, 'assigned'
  FROM public.class_students cs
  JOIN public.students s ON s.id = cs.student_id
  WHERE cs.class_id = p_class_id 
    AND cs.status = 'active' 
    AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  RETURN v_assignment_id; 
END;
$function$;