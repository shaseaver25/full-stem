-- Create table for storing OAuth tokens securely
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token_enc BYTEA,
  refresh_token_enc BYTEA,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tokens
CREATE POLICY "Users can view own tokens"
  ON public.user_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert tokens (via triggers/functions)
CREATE POLICY "System can insert tokens"
  ON public.user_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON public.user_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_tokens_updated_at
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions for encryption/decryption
CREATE OR REPLACE FUNCTION public.encrypt_token(token_text TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_key TEXT;
BEGIN
  -- Get encryption key from config (same as MFA)
  app_key := current_setting('app.settings')::json->>'mfa_encryption_key';
  
  -- Encrypt the token
  RETURN pgp_sym_encrypt(token_text, app_key);
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to encrypt token: %', SQLERRM;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(user_id_param UUID, provider_param TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_key TEXT;
  decrypted_access TEXT;
BEGIN
  -- Get encryption key from config
  app_key := current_setting('app.settings')::json->>'mfa_encryption_key';
  
  -- Decrypt the access token
  SELECT pgp_sym_decrypt(access_token_enc, app_key)::TEXT
  INTO decrypted_access
  FROM public.user_tokens
  WHERE user_id = user_id_param AND provider = provider_param;
  
  RETURN decrypted_access;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to decrypt token: %', SQLERRM;
    RETURN NULL;
END;
$$;