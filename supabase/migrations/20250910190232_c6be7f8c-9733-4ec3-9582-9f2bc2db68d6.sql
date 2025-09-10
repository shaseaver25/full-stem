-- Security fix: Restrict access to demo_users table to prevent email harvesting
-- Replace the overly permissive policy that allows public read access

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Demo users are publicly readable" ON public.demo_users;

-- Create a more secure policy that only allows authenticated users to read demo user data 
CREATE POLICY "Authenticated users can view demo users" 
ON public.demo_users 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the system management policy for the edge functions (uses service role)
-- This policy already exists and doesn't need changes:
-- "System can manage demo users" allows ALL operations with USING (true)
-- which works with the service role key used by edge functions