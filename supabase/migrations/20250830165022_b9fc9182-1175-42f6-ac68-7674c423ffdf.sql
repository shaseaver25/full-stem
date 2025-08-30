-- Fix security vulnerability: Restrict assignment access to authenticated users only
-- Since the data model relationships aren't fully established yet, start with basic authentication requirement

-- Drop the overly permissive policy that allows everyone to view assignments
DROP POLICY IF EXISTS "Everyone can view assignments" ON public.assignments;

-- Create basic authenticated access policy for assignments
-- This prevents public access while maintaining functionality for logged-in users
CREATE POLICY "Authenticated users can view assignments" 
ON public.assignments 
FOR SELECT 
TO authenticated
USING (true);

-- Teachers can manage assignments (when teacher relationship is established)
-- For now, any authenticated user can manage assignments
CREATE POLICY "Authenticated users can manage assignments" 
ON public.assignments 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Note: When class enrollment and teacher relationships are properly established,
-- these policies should be updated to check specific relationships