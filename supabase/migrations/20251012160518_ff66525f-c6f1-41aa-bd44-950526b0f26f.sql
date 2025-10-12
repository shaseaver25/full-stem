-- Create feature_toggles table for experimental features
CREATE TABLE IF NOT EXISTS public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  environment TEXT NOT NULL DEFAULT 'staging',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feature_toggles
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

-- Developers and system admins can manage feature toggles
CREATE POLICY "Developers and system admins can manage feature toggles"
ON public.feature_toggles
FOR ALL
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  has_role(auth.uid(), 'system_admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Update activity_log to support impersonation tracking
ALTER TABLE public.activity_log 
ADD COLUMN IF NOT EXISTS is_impersonation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS impersonated_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS impersonated_role TEXT;

-- Create index for better performance on developer queries
CREATE INDEX IF NOT EXISTS idx_activity_log_developer 
ON public.activity_log(user_id, created_at DESC) 
WHERE role = 'developer';

CREATE INDEX IF NOT EXISTS idx_activity_log_impersonation 
ON public.activity_log(is_impersonation, created_at DESC) 
WHERE is_impersonation = true;

-- Trigger for updated_at on feature_toggles
CREATE OR REPLACE FUNCTION public.update_feature_toggle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_toggles_updated_at
BEFORE UPDATE ON public.feature_toggles
FOR EACH ROW
EXECUTE FUNCTION public.update_feature_toggle_timestamp();

-- Prevent developers from modifying critical production tables
-- Block INSERT operations for developers
CREATE POLICY "Developers cannot insert students"
ON public.students
FOR INSERT
WITH CHECK (NOT has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers cannot update students"
ON public.students
FOR UPDATE
USING (NOT has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers cannot delete students"
ON public.students
FOR DELETE
USING (NOT has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers cannot insert grades"
ON public.grades
FOR INSERT
WITH CHECK (NOT has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers cannot update grades"
ON public.grades
FOR UPDATE
USING (NOT has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers cannot delete grades"
ON public.grades
FOR DELETE
USING (NOT has_role(auth.uid(), 'developer'::app_role));

-- Developers can read all data for debugging purposes
CREATE POLICY "Developers can read all students"
ON public.students
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can read all grades"
ON public.grades
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can read all classes"
ON public.classes
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can read all assignments"
ON public.class_assignments_new
FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));