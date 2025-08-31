-- Add SUPER_ADMIN role to existing app_role enum
ALTER TYPE public.app_role ADD VALUE 'super_admin';

-- Create audit_logs table for tracking super admin actions
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NOT NULL,
    actor_role TEXT NOT NULL,
    tenant_id UUID,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    payload_hash TEXT,
    reason TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_tenant ON public.audit_logs(tenant_id);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create super admin sessions table for tracking write override sessions
CREATE TABLE public.super_admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    write_override_enabled BOOLEAN DEFAULT FALSE,
    write_override_expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    view_as_role TEXT,
    view_as_tenant_id UUID,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on super admin sessions
ALTER TABLE public.super_admin_sessions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sessions
CREATE POLICY "Users can manage their own super admin sessions" 
ON public.super_admin_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT has_role(_user_id, 'super_admin'::app_role)
$$;

-- Add trigger to update super admin sessions timestamp
CREATE OR REPLACE FUNCTION public.update_super_admin_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_super_admin_sessions_updated_at
    BEFORE UPDATE ON public.super_admin_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_super_admin_session_timestamp();