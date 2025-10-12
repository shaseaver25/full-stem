-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted column for MFA secret
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_secret_enc bytea;

-- Create security definer function to decrypt MFA secrets
CREATE OR REPLACE FUNCTION public.decrypt_mfa_secret(uid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_key text;
  secret text;
BEGIN
  -- Get encryption key from config
  app_key := current_setting('app.settings')::json->>'mfa_encryption_key';
  
  -- Decrypt the secret
  SELECT pgp_sym_decrypt(mfa_secret_enc, app_key)::text
  INTO secret
  FROM public.profiles
  WHERE id = uid;
  
  RETURN secret;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to decrypt MFA secret: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Create function to encrypt and store MFA secret
CREATE OR REPLACE FUNCTION public.encrypt_mfa_secret(uid uuid, secret_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_key text;
BEGIN
  -- Get encryption key from config
  app_key := current_setting('app.settings')::json->>'mfa_encryption_key';
  
  -- Encrypt and store the secret
  UPDATE public.profiles
  SET mfa_secret_enc = pgp_sym_encrypt(secret_text, app_key),
      updated_at = now()
  WHERE id = uid;
END;
$$;

-- Add constraint to prevent PII in impersonation logs
ALTER TABLE public.impersonation_logs
  ADD CONSTRAINT no_pii_in_impersonation_logs 
  CHECK (
    NOT (actions_performed::text ~* '(email|first_name|last_name|phone|address)')
  );

-- Add constraint to prevent PII in activity logs (using correct column: details)
ALTER TABLE public.activity_log
  ADD CONSTRAINT no_pii_in_activity 
  CHECK (
    NOT (details::text ~* '(email|first_name|last_name|phone|address)')
  );

-- Add tracking for backup code usage
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_backup_codes_used jsonb DEFAULT '[]'::jsonb;

-- Add rate limiting table for MFA attempts
CREATE TABLE IF NOT EXISTS public.mfa_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_count integer NOT NULL DEFAULT 1,
  locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.mfa_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for MFA rate limits
CREATE POLICY "Users can view their own rate limits"
  ON public.mfa_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON public.mfa_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add audit logging for MFA operations
CREATE TABLE IF NOT EXISTS public.mfa_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  success boolean NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mfa_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for MFA audit log
CREATE POLICY "System admins can view MFA audit logs"
  ON public.mfa_audit_log
  FOR SELECT
  USING (
    has_role(auth.uid(), 'system_admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  );

CREATE POLICY "System can insert MFA audit logs"
  ON public.mfa_audit_log
  FOR INSERT
  WITH CHECK (true);