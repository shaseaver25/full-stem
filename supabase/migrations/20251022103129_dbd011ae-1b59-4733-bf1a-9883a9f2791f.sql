-- Add admin role to teacher@test.com user
INSERT INTO public.user_roles (user_id, role)
VALUES ('d5f08cd5-ea56-47bf-a1e2-a119a489533e', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;