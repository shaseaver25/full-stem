-- Update decrypt_token function to work with the correct column names
CREATE OR REPLACE FUNCTION public.decrypt_token(user_id_param uuid, provider_param text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  app_key TEXT;
  decrypted_access TEXT;
BEGIN
  -- Get encryption key from config
  app_key := current_setting('app.settings', true)::json->>'mfa_encryption_key';
  
  -- If key not found, use default
  IF app_key IS NULL THEN
    app_key := 'default_key_please_configure';
  END IF;
  
  -- Decrypt the access token from access_token_enc column
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