-- Update RLS policy to allow authenticated users to update the lesson view mode setting
DROP POLICY IF EXISTS "Developers can manage global settings" ON public.global_settings;

CREATE POLICY "Anyone can update lesson view mode setting" 
ON public.global_settings 
FOR UPDATE 
USING (setting_key = 'lesson_view_mode')
WITH CHECK (setting_key = 'lesson_view_mode');

CREATE POLICY "Developers can manage other global settings" 
ON public.global_settings 
FOR ALL 
USING (is_developer(auth.uid()) AND setting_key != 'lesson_view_mode');