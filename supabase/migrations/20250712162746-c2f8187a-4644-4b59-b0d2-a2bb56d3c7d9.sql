-- Add developer role to the user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('cf2c5df9-4976-4c21-a5d7-2015dea61f1d', 'developer'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;