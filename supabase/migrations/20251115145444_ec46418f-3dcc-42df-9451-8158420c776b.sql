-- Create a security definer function to check if teacher can modify analysis
CREATE OR REPLACE FUNCTION public.can_teacher_modify_analysis(_analysis_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.submission_analyses sa
    JOIN public.assignment_submissions asub ON asub.id = sa.submission_id
    JOIN public.class_assignments_new ca ON asub.assignment_id = ca.id
    JOIN public.classes c ON ca.class_id = c.id
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE sa.id = _analysis_id
    AND tp.user_id = _user_id
  )
$$;

-- Drop and recreate the UPDATE policy with the optimized function
DROP POLICY IF EXISTS "Teachers can update analyses for their class submissions" ON public.submission_analyses;

CREATE POLICY "Teachers can update analyses for their class submissions"
ON public.submission_analyses
FOR UPDATE
TO public
USING (public.can_teacher_modify_analysis(id, auth.uid()))
WITH CHECK (public.can_teacher_modify_analysis(id, auth.uid()));