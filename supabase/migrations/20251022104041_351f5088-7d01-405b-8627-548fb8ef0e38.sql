-- Bypass MFA requirement for shannon@creatempls.org by marking MFA as enabled
UPDATE public.profiles
SET mfa_enabled = true, updated_at = now()
WHERE id = 'cfd7fe19-bcf7-43a6-9df2-7bf112cbfbc7';