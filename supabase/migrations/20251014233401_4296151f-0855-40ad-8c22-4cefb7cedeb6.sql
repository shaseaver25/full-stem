-- Fix infinite recursion in student_parent_relationships RLS policy
-- Drop the existing policy that's causing recursion
DROP POLICY IF EXISTS "Parents can view their student relationships" ON public.student_parent_relationships;

-- Create a simpler policy that avoids recursion
CREATE POLICY "Parents can view their student relationships"
ON public.student_parent_relationships
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_profiles pp
    WHERE pp.id = student_parent_relationships.parent_id
    AND pp.user_id = auth.uid()
  )
);

-- Also ensure students can see their own parent relationships
CREATE POLICY "Students can view their parent relationships"
ON public.student_parent_relationships
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_parent_relationships.student_id
    AND s.user_id = auth.uid()
  )
);