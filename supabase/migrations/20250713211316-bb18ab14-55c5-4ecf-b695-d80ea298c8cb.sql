-- Add developer role to your account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'developer'::app_role 
FROM auth.users 
WHERE email = 'shannon@creatempls.org'
ON CONFLICT (user_id, role) DO NOTHING;