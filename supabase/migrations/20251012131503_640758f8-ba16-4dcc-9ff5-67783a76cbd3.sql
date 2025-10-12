-- Step 1: Add system_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'system_admin';

-- Add allowed_ips column for IP restriction (optional security feature)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS allowed_ips text[];

-- Add mfa_enabled column for tracking MFA status
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false;

-- Add index for better performance on allowed_ips lookups
CREATE INDEX IF NOT EXISTS idx_profiles_allowed_ips ON public.profiles USING GIN(allowed_ips) WHERE allowed_ips IS NOT NULL;

-- Comment on the new role
COMMENT ON TYPE public.app_role IS 'Application roles: student, teacher, parent, admin, system_admin (platform oversight), super_admin (legacy), developer';