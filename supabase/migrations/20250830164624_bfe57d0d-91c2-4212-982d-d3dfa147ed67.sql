-- Fix security vulnerability: Restrict lesson content access to authenticated users only

-- Drop overly permissive policies for lesson_components table
DROP POLICY IF EXISTS "Anyone can view lesson components" ON public.lesson_components;

-- Drop overly permissive policies for Lessons table  
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.Lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.Lessons;
DROP POLICY IF EXISTS "Public can view lessons" ON public.Lessons;

-- Create secure policies for lesson_components table
CREATE POLICY "Authenticated users can view lesson components" 
ON public.lesson_components 
FOR SELECT 
TO authenticated
USING (true);

-- Create secure policies for Lessons table
CREATE POLICY "Authenticated users can view lessons" 
ON public.Lessons 
FOR SELECT 
TO authenticated
USING (true);

-- Keep existing management policies for lesson_components (already secure)
-- The "Authenticated users can manage lesson components" policy already requires auth.uid() IS NOT NULL