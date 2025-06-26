
-- Enable RLS on the classes table if not already enabled
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows teachers to create their own classes
CREATE POLICY "Teachers can create their own classes" 
  ON public.classes 
  FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

-- Create policy that allows teachers to view their own classes
CREATE POLICY "Teachers can view their own classes" 
  ON public.classes 
  FOR SELECT 
  USING (auth.uid() = teacher_id);

-- Create policy that allows teachers to update their own classes
CREATE POLICY "Teachers can update their own classes" 
  ON public.classes 
  FOR UPDATE 
  USING (auth.uid() = teacher_id);

-- Create policy that allows teachers to delete their own classes
CREATE POLICY "Teachers can delete their own classes" 
  ON public.classes 
  FOR DELETE 
  USING (auth.uid() = teacher_id);
