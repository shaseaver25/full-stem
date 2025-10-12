-- Create admin_type enum
CREATE TYPE public.admin_type AS ENUM ('school', 'homeschool', 'workforce');

-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_type public.admin_type NOT NULL DEFAULT 'school',
  organization_name TEXT,
  organization_size TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view their own profile"
  ON public.admin_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) AND user_id = auth.uid());

CREATE POLICY "Admins can update their own profile"
  ON public.admin_profiles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) AND user_id = auth.uid())
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND user_id = auth.uid());

CREATE POLICY "Admins can insert their own profile"
  ON public.admin_profiles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles"
  ON public.admin_profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create admin profile when admin role is assigned
CREATE OR REPLACE FUNCTION public.handle_admin_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if role is admin and profile doesn't exist
  IF NEW.role = 'admin'::app_role THEN
    INSERT INTO public.admin_profiles (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create admin profile when admin role is assigned
CREATE TRIGGER on_admin_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_role_assignment();