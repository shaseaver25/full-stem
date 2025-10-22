-- Add admin role alongside developer role for shannon@creatempls.org
INSERT INTO public.user_roles (user_id, role)
VALUES ('cfd7fe19-bcf7-43a6-9df2-7bf112cbfbc7', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add super_admin for completeness
INSERT INTO public.user_roles (user_id, role)
VALUES ('cfd7fe19-bcf7-43a6-9df2-7bf112cbfbc7', 'super_admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;