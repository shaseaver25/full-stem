-- Update RLS policy for lesson_components to allow authenticated users to manage them
DROP POLICY IF EXISTS "Developers can manage lesson components" ON public.lesson_components;

-- Create new policy allowing authenticated users to manage lesson components
CREATE POLICY "Authenticated users can manage lesson components" 
ON public.lesson_components 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);