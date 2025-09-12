-- SECURITY FIX: Remove public access to demo_users table to prevent email harvesting
-- This removes the overly permissive policy that allows public read access to email addresses

-- Drop the problematic policy that allows public access to all operations
DROP POLICY IF EXISTS "System can manage demo users" ON public.demo_users;

-- The existing authenticated-only policies will remain:
-- 1. "Authenticated users can view demo users" - for legitimate dashboard access
-- 2. "Restrict demo users to authenticated access" - additional protection

-- Edge functions will still work because they use service role access which bypasses RLS
-- This fix prevents unauthorized email harvesting while maintaining all legitimate functionality

-- Verify the remaining policies are secure
-- (The remaining policies only allow authenticated users to view demo user data)