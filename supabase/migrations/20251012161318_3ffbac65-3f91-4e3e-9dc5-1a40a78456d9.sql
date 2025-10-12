-- Add MFA secret column to profiles for TOTP storage
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
ADD COLUMN IF NOT EXISTS mfa_backup_codes TEXT[];

-- Add index for faster MFA lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mfa_enabled 
ON public.profiles(mfa_enabled) 
WHERE mfa_enabled = true;

-- Create table for MFA verification attempts (rate limiting)
CREATE TABLE IF NOT EXISTS public.mfa_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET
);

-- Enable RLS on MFA verification attempts
ALTER TABLE public.mfa_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own MFA attempts
CREATE POLICY "Users can view their own MFA attempts"
ON public.mfa_verification_attempts
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert MFA attempts
CREATE POLICY "System can log MFA attempts"
ON public.mfa_verification_attempts
FOR INSERT
WITH CHECK (true);

-- Clean up old MFA attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_mfa_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.mfa_verification_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;