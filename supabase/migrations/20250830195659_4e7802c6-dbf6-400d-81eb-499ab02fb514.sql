-- Security Enhancement: Protect Educational Content and Tighten Access Controls

-- 1. CRITICAL: Secure the Lessons table - Remove public access
DROP POLICY IF EXISTS "Anyone can view lessons" ON public."Lessons";
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public."Lessons";
DROP POLICY IF EXISTS "Public can view lessons" ON public."Lessons";

-- Create secure policy for Lessons table - only authenticated users can view
CREATE POLICY "Authenticated users can view lessons" 
ON public."Lessons" 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Secure global_settings table - restrict to authenticated users for most settings
DROP POLICY IF EXISTS "Anyone can view global settings" ON public.global_settings;

-- Allow authenticated users to view global settings
CREATE POLICY "Authenticated users can view global settings" 
ON public.global_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the specific lesson view mode policy for authenticated users
DROP POLICY IF EXISTS "Anyone can update lesson view mode setting" ON public.global_settings;

CREATE POLICY "Authenticated users can update lesson view mode setting" 
ON public.global_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND setting_key = 'lesson_view_mode')
WITH CHECK (auth.uid() IS NOT NULL AND setting_key = 'lesson_view_mode');

-- 3. Secure content_library published content - require authentication
DROP POLICY IF EXISTS "Published content is readable by authenticated users" ON public.content_library;

CREATE POLICY "Authenticated users can view published content" 
ON public.content_library 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_published = true);