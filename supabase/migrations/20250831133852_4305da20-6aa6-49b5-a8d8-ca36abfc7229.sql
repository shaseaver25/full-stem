-- Add SUPER_ADMIN role to existing app_role enum
ALTER TYPE public.app_role ADD VALUE 'super_admin';