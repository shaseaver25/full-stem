-- SECURITY FIX: Secure the magic_tokens table to prevent email harvesting
-- This removes public access while maintaining legitimate functionality

-- Remove the dangerous public policies that expose email addresses
DROP POLICY IF EXISTS "Magic tokens are publicly readable for consumption" ON public.magic_tokens;
DROP POLICY IF EXISTS "System can manage magic tokens" ON public.magic_tokens;

-- Create secure policies that don't expose email addresses to the public
-- Edge functions will continue to work via service role access

-- Allow only token validation without exposing email addresses
-- This policy allows checking if a token exists and is valid without exposing emails
CREATE POLICY "Allow token validation without email exposure" 
ON public.magic_tokens 
FOR SELECT 
TO public
USING (
  -- Only allow reading if the request matches the exact token
  -- This prevents bulk email harvesting while allowing token validation
  token = current_setting('app.current_token', true)
);

-- System operations (edge functions) use service role and bypass RLS
-- No additional policies needed for legitimate system operations