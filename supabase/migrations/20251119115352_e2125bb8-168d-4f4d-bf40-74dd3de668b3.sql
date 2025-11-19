-- Add policy for developers and admins to view all profiles
CREATE POLICY "Developers and admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'developer'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add policy for developers and admins to view all user roles
CREATE POLICY "Developers and admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'developer'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add policy for developers and admins to view all students data
CREATE POLICY "Developers and admins can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'developer'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);