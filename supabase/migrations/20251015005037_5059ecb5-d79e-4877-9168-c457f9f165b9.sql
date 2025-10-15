-- Fix infinite recursion in students table RLS policies
-- First, drop ALL existing policies on students table
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'students' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON students', pol.policyname);
    END LOOP;
END $$;

-- Create simple, non-recursive policies
-- Students can view and update their own profile using direct user_id check
CREATE POLICY "Students can view their own profile"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own profile"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view students in their classes"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      JOIN teacher_profiles tp ON tp.id = c.teacher_id
      WHERE cs.student_id = students.id
        AND tp.user_id = auth.uid()
    )
  );

-- Teachers can manage students in their classes
CREATE POLICY "Teachers can update students in their classes"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      JOIN teacher_profiles tp ON tp.id = c.teacher_id
      WHERE cs.student_id = students.id
        AND tp.user_id = auth.uid()
    )
  );

-- Admins and developers can view all students
CREATE POLICY "Admins can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'developer'::app_role)
  );