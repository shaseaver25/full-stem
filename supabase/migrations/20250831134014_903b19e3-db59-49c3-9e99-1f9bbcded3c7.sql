-- Seed seaversix@gmail.com as SUPER_ADMIN if they exist
-- Insert super admin role for the specified user if they exist
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'seaversix@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;