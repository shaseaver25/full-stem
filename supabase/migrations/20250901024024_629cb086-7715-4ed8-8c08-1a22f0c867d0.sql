-- Fix RLS policies for classes table to ensure teachers can see their classes

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Teachers can view their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON classes;

-- Create correct policies that check teacher_profiles relationship
CREATE POLICY "Teachers can view their own classes" 
ON classes FOR SELECT 
USING (teacher_id IN (
  SELECT id FROM teacher_profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Teachers can update their own classes" 
ON classes FOR UPDATE 
USING (teacher_id IN (
  SELECT id FROM teacher_profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Teachers can delete their own classes" 
ON classes FOR DELETE 
USING (teacher_id IN (
  SELECT id FROM teacher_profiles 
  WHERE user_id = auth.uid()
));

-- Fix insert policy to set correct teacher_id
DROP POLICY IF EXISTS "Teachers can create their own classes" ON classes;
CREATE POLICY "Teachers can create their own classes" 
ON classes FOR INSERT 
WITH CHECK (teacher_id IN (
  SELECT id FROM teacher_profiles 
  WHERE user_id = auth.uid()
));