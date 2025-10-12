-- Step 2: Create system_admin helper function (now that enum value is committed)
CREATE OR REPLACE FUNCTION public.is_system_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT has_role(_user_id, 'system_admin'::app_role)
$$;

-- Update RLS policies to include system_admin alongside super_admin
-- Activity log policy for system admins
DROP POLICY IF EXISTS "Admins see organization activity" ON public.activity_log;
CREATE POLICY "Admins see organization activity"
ON public.activity_log
FOR SELECT
USING (
  -- Admins can see all activity in their organization
  organization_name IN (
    SELECT ap.organization_name 
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
    AND ap.organization_name IS NOT NULL
  )
  OR
  -- System admins, super admins and developers see everything
  has_role(auth.uid(), 'system_admin'::app_role)
  OR
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Audit logs policy for system admins
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "System and super admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'system_admin'::app_role)
  OR
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Performance metrics policy for system admins
DROP POLICY IF EXISTS "Admins only for performance metrics" ON public.performance_metrics;
CREATE POLICY "Admins and system admins for performance metrics"
ON public.performance_metrics
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR
  has_role(auth.uid(), 'system_admin'::app_role)
  OR
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Backup logs policy for system admins
DROP POLICY IF EXISTS "Admins only for backup logs" ON public.backup_logs;
CREATE POLICY "Admins and system admins for backup logs"
ON public.backup_logs
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR
  has_role(auth.uid(), 'system_admin'::app_role)
  OR
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  has_role(auth.uid(), 'developer'::app_role)
);