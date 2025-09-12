-- SECURITY FIX: Final secure implementation for magic_tokens
-- Remove the problematic view and implement a clean RLS-only solution

-- Drop the view that's causing security warnings
DROP VIEW IF EXISTS public.token_status;

-- Remove the current policy and implement the most secure approach
DROP POLICY IF EXISTS "Allow token operations by token only" ON public.magic_tokens;

-- Implement the most secure policy: completely restrict public access
-- Only edge functions (via service role) can access this table
-- This completely prevents email harvesting while maintaining functionality
CREATE POLICY "No public access to magic tokens" 
ON public.magic_tokens 
FOR ALL 
TO public
USING (false);

-- Edge functions use service role and bypass RLS, so they will continue to work
-- Frontend operations should go through edge functions, not direct table access
-- This completely eliminates the email harvesting attack vector