
-- Add developer role to mel@creatempls.org
INSERT INTO public.user_roles (user_id, role)
VALUES ('fcc8af6f-1d5e-4f02-a18f-587ba667e717', 'developer')
ON CONFLICT (user_id, role) DO NOTHING;
