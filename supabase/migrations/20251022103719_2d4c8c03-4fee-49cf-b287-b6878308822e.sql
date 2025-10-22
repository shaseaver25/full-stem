-- Create admin profile for shannon@creatempls.org
INSERT INTO public.admin_profiles (user_id, admin_type, organization_name, onboarding_completed)
VALUES (
  'cfd7fe19-bcf7-43a6-9df2-7bf112cbfbc7',
  'school',
  'CreateMPLS',
  true
)
ON CONFLICT (user_id) DO UPDATE
SET onboarding_completed = true;