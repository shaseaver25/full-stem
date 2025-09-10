-- Security fix: Restrict access to demo_users table to prevent email harvesting
-- Replace the overly permissive policy that allows public read access

-- Drop the existing public read policy that exposes email addresses
DROP POLICY IF EXISTS "Demo users are publicly readable" ON public.demo_users;

-- Create a secure policy that restricts read access to authenticated users only
CREATE POLICY "Restrict demo users to authenticated access" 
ON public.demo_users 
FOR SELECT 
TO authenticated
USING (true);