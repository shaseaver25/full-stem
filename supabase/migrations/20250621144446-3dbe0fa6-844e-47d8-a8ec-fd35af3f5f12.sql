
-- Re-enable Row Level Security on the Lessons table
ALTER TABLE public."Lessons" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read lessons (public access)
CREATE POLICY "Anyone can view lessons" 
  ON public."Lessons" 
  FOR SELECT 
  USING (true);
