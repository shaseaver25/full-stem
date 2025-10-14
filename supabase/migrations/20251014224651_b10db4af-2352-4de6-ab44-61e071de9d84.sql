-- Fix infinite recursion in student_parent_relationships RLS policy
-- The issue is that can_view_student() queries student_parent_relationships,
-- which has an RLS policy that may be causing recursion

-- Drop the existing policy
DROP POLICY IF EXISTS "Parents can view their student relationships" ON public.student_parent_relationships;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Parents can view their student relationships"
ON public.student_parent_relationships
FOR SELECT
TO public
USING (
  -- Parents can see their own relationships
  parent_id IN (
    SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()
  )
);