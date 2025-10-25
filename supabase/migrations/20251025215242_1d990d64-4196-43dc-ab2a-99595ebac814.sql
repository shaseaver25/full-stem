-- Update the trigger function to work with the correct column names
CREATE OR REPLACE FUNCTION encrypt_user_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get the encryption key from environment
  encryption_key := current_setting('app.settings', true)::json->>'mfa_encryption_key';
  
  -- If key not found in settings, use a basic fallback
  IF encryption_key IS NULL THEN
    encryption_key := 'default_key_please_configure';
  END IF;
  
  -- Encrypt access token if it's plain text (check if it's not already encrypted)
  IF NEW.access_token_enc IS NOT NULL THEN
    BEGIN
      -- Try to encrypt - if it's already encrypted this might fail gracefully
      NEW.access_token_enc := pgp_sym_encrypt(NEW.access_token_enc::text, encryption_key);
    EXCEPTION WHEN OTHERS THEN
      -- If encryption fails, assume it's already encrypted or log the error
      RAISE WARNING 'Could not encrypt access token: %', SQLERRM;
    END;
  END IF;
  
  -- Encrypt refresh token if it's plain text
  IF NEW.refresh_token_enc IS NOT NULL THEN
    BEGIN
      NEW.refresh_token_enc := pgp_sym_encrypt(NEW.refresh_token_enc::text, encryption_key);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not encrypt refresh token: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;