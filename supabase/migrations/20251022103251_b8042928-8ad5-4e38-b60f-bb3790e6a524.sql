-- Add developer role to shannon@creatempls.org
INSERT INTO public.user_roles (user_id, role)
VALUES ('cfd7fe19-bcf7-43a6-9df2-7bf112cbfbc7', 'developer'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;