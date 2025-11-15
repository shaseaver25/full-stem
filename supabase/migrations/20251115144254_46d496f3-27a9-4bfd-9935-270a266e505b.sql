
-- Drop the old policies with incorrect table reference
DROP POLICY IF EXISTS "Teachers can view analyses for their class submissions" ON public.submission_analyses;
DROP POLICY IF EXISTS "Teachers can update analyses for their class submissions" ON public.submission_analyses;
DROP POLICY IF EXISTS "Students can view analyses of their submissions" ON public.submission_analyses;

-- Create corrected policies with proper table names
CREATE POLICY "Teachers can view analyses for their class submissions"
ON public.submission_analyses
FOR SELECT
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
);

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
);

CREATE POLICY "Students can view analyses of their submissions"
ON public.submission_analyses
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions asub
    WHERE asub.id = submission_analyses.submission_id
    AND asub.user_id = auth.uid()
  )
);

-- Add index to improve performance of RLS checks
CREATE INDEX IF NOT EXISTS idx_submission_analyses_submission_id 
ON public.submission_analyses(submission_id);
