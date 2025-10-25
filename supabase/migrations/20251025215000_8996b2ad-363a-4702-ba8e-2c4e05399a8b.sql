-- Create trigger function to encrypt tokens before insert/update
CREATE OR REPLACE FUNCTION encrypt_user_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get the encryption key from environment
  encryption_key := current_setting('app.settings', true)::json->>'mfa_encryption_key';
  
  -- If key not found in settings, try to get from vault or use a default
  IF encryption_key IS NULL THEN
    -- Fall back to using the MFA_ENCRYPTION_KEY from environment
    encryption_key := 'default_key_please_configure';
  END IF;
  
  -- Encrypt access token if it's plain text
  IF NEW.access_token IS NOT NULL AND octet_length(NEW.access_token::bytea) < 500 THEN
    NEW.access_token := encode(pgp_sym_encrypt(NEW.access_token::text, encryption_key), 'base64')::bytea;
  END IF;
  
  -- Encrypt refresh token if it's plain text  
  IF NEW.refresh_token IS NOT NULL AND octet_length(NEW.refresh_token::bytea) < 500 THEN
    NEW.refresh_token := encode(pgp_sym_encrypt(NEW.refresh_token::text, encryption_key), 'base64')::bytea;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS encrypt_user_tokens_trigger ON user_tokens;

-- Create trigger
CREATE TRIGGER encrypt_user_tokens_trigger
  BEFORE INSERT OR UPDATE ON user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_user_tokens();