-- Drop the existing teacher-only insert policy
DROP POLICY IF EXISTS "Teachers can create students" ON public.students;

-- Create a new policy that allows teachers, admins, super_admins, and developers to insert students
CREATE POLICY "Teachers and admins can create students" 
ON public.students 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);