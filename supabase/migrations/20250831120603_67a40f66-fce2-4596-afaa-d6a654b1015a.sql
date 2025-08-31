-- Add policy to allow demo users to access base assignments for lessons
CREATE POLICY "Demo users can access lesson assignments" 
ON public.assignments 
FOR ALL 
USING (true);