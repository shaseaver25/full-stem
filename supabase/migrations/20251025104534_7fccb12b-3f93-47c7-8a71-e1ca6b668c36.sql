-- Disable MFA for shannon@creatempls.org
UPDATE profiles
SET 
  mfa_enabled = false,
  mfa_backup_codes = NULL,
  mfa_backup_codes_used = '[]'::jsonb,
  mfa_secret_enc = NULL,
  updated_at = now()
WHERE email = 'shannon@creatempls.org';

-- Clear any active rate limits
DELETE FROM mfa_rate_limits
WHERE user_id = (SELECT id FROM profiles WHERE email = 'shannon@creatempls.org');

-- Log the manual MFA disable action
INSERT INTO mfa_audit_log (user_id, action, success, ip_address, user_agent)
VALUES (
  (SELECT id FROM profiles WHERE email = 'shannon@creatempls.org'),
  'mfa_disabled_manually',
  true,
  '127.0.0.1',
  'Admin Action - Database Migration'
);