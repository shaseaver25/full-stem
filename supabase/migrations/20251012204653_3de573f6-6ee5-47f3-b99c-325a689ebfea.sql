-- Fix infinite recursion in classes table RLS policies
-- Drop all existing policies on classes table
DROP POLICY IF EXISTS "Teachers can insert their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their class lessons" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their classroom activities" ON public.classes;
DROP POLICY IF EXISTS "Users can view published class lessons" ON public.classes;
DROP POLICY IF EXISTS "Students can view published classes" ON public.classes;
DROP POLICY IF EXISTS "Public can view published classes" ON public.classes;

-- Create new policies that avoid recursion by checking teacher_profiles instead of classes
CREATE POLICY "Teachers can create classes" ON public.classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id IN (
      SELECT id FROM public.teacher_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their classes" ON public.classes
  FOR SELECT
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM public.teacher_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their classes" ON public.classes
  FOR UPDATE
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM public.teacher_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete their classes" ON public.classes
  FOR DELETE
  TO authenticated
  USING (
    teacher_id IN (
      SELECT id FROM public.teacher_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow students to view published classes
CREATE POLICY "Students can view published classes" ON public.classes
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Allow public viewing of published classes (for class codes, etc.)
CREATE POLICY "Public can view published classes" ON public.classes
  FOR SELECT
  TO anon
  USING (published = true);