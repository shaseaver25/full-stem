-- Create developer permissions
INSERT INTO public.user_role_permissions (role, permission) VALUES
('developer', 'read_users'),
('developer', 'write_users'),
('developer', 'read_classes'),
('developer', 'write_classes'),
('developer', 'read_content'),
('developer', 'write_content'),
('developer', 'read_grades'),
('developer', 'read_analytics'),
('developer', 'write_analytics'),
('developer', 'system_admin'),
('developer', 'manage_permissions');

-- Create impersonation log table
CREATE TABLE public.impersonation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL,
  impersonated_user_id UUID,
  impersonated_role TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  actions_performed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on impersonation logs
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for impersonation logs
CREATE POLICY "Developers can view impersonation logs"
ON public.impersonation_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can create impersonation logs"
ON public.impersonation_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'developer'::app_role) AND developer_id = auth.uid());

CREATE POLICY "Developers can update their own impersonation logs"
ON public.impersonation_logs 
FOR UPDATE 
USING (has_role(auth.uid(), 'developer'::app_role) AND developer_id = auth.uid());

-- Create developer settings table
CREATE TABLE public.developer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL UNIQUE,
  ip_restrictions INET[] DEFAULT NULL,
  two_factor_enabled BOOLEAN DEFAULT false,
  staging_access BOOLEAN DEFAULT true,
  production_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on developer settings
ALTER TABLE public.developer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for developer settings
CREATE POLICY "Developers can view their own settings"
ON public.developer_settings 
FOR SELECT 
USING (developer_id = auth.uid() AND has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Developers can update their own settings"
ON public.developer_settings 
FOR ALL
USING (developer_id = auth.uid() AND has_role(auth.uid(), 'developer'::app_role));

-- Create function to check if user is developer
CREATE OR REPLACE FUNCTION public.is_developer(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT has_role(_user_id, 'developer'::app_role)
$$;