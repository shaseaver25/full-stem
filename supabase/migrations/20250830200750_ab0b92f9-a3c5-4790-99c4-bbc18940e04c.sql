-- FINAL SECURITY FIX: Remove overly permissive policies on profiles table
-- The scanner still detects that profiles table is accessible to authenticated users

-- Remove the overly broad policy that grants access to all authenticated users
DROP POLICY IF EXISTS "Users can view and edit their own profile" ON public.profiles;

-- Keep the specific restrictive policies that properly limit access
-- These should be sufficient:
-- - "Users can insert their own profile" (INSERT with auth.uid() = id check)
-- - "Users can update their own profile" (UPDATE with auth.uid() = id)  
-- - "Users can view their own profile" (SELECT with auth.uid() = id)

-- Verify no other overly permissive policies exist
-- The remaining policies should only allow users to access their own profile data

-- ADDITIONAL FIX: Ensure parent_profiles also has proper restrictions
-- Remove any overly broad policies if they exist
DROP POLICY IF EXISTS "Authenticated users can access parent profiles" ON public.parent_profiles;

-- The existing "Parents can view and edit their own profile" should be sufficient
-- as it uses user_id = auth.uid() which properly restricts access