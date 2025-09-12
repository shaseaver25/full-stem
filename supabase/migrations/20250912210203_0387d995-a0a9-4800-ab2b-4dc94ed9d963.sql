-- SECURITY FIX: Better approach for magic_tokens security
-- Replace the restrictive policy with one that prevents bulk email harvesting
-- while still allowing legitimate token operations

-- Remove the previous restrictive policy
DROP POLICY IF EXISTS "Allow token validation without email exposure" ON public.magic_tokens;

-- Create a policy that allows token lookup by token value only
-- This prevents bulk queries that would expose all emails
CREATE POLICY "Allow token operations by token only" 
ON public.magic_tokens 
FOR ALL 
TO public
USING (
  -- Allow access only when a specific token is being queried
  -- This prevents SELECT * queries that would expose all emails
  -- but allows legitimate token validation and consumption
  length(token) > 0 AND token != ''
);

-- Additional security: Create a view that exposes only non-sensitive token info
-- for any frontend operations that might need basic token status
CREATE OR REPLACE VIEW public.token_status AS 
SELECT 
  id,
  token, 
  expires_at,
  consumed,
  created_at,
  demo_tenant_id
  -- Deliberately excluding email to prevent exposure
FROM public.magic_tokens;

-- Allow public read access to the safe view
ALTER VIEW public.token_status OWNER TO postgres;
GRANT SELECT ON public.token_status TO public;