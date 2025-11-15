-- Drop and recreate the UPDATE policy with better performance
DROP POLICY IF EXISTS "Teachers can update analyses for their class submissions" ON public.submission_analyses;

-- Create optimized UPDATE policy for teachers
CREATE POLICY "Teachers can update analyses for their class submissions"
ON public.submission_analyses
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions asub
    JOIN public.class_assignments_new ca ON asub.assignment_id = ca.id
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE asub.id = submission_analyses.submission_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions asub
    JOIN public.class_assignments_new ca ON asub.assignment_id = ca.id
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE asub.id = submission_analyses.submission_id
    AND tp.user_id = auth.uid()
  )
);

-- Add INSERT policy for teachers to create analyses
CREATE POLICY "Teachers can insert analyses for their class submissions"
ON public.submission_analyses
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions asub
    JOIN public.class_assignments_new ca ON asub.assignment_id = ca.id
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE asub.id = submission_analyses.submission_id
    AND tp.user_id = auth.uid()
  )
);

-- Add indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id 
ON public.assignment_submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_class_assignments_new_class_id 
ON public.class_assignments_new(class_id);

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id 
ON public.classes(teacher_id);

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id 
ON public.teacher_profiles(user_id);