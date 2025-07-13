-- Fix the user_roles entry with correct user ID
DELETE FROM public.user_roles WHERE user_id != 'f7bf1000-c393-41fe-bdce-4d80dbcf954f';

INSERT INTO public.user_roles (user_id, role)
VALUES ('f7bf1000-c393-41fe-bdce-4d80dbcf954f', 'developer'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;