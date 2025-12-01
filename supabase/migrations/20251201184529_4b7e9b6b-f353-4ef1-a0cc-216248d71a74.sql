-- Drop ALL existing policies on class_teachers to start clean
DROP POLICY IF EXISTS "Teachers can view own assignments" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers can view class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can insert own assignments" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers manage class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Admins view all class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can view their class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can insert their class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers can manage class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Admins can view all class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers view own co-teaching assignments" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers view class co-teachers" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers manage co-teachers" ON class_teachers;
DROP POLICY IF EXISTS "Admins view all class teachers" ON class_teachers;

-- Ensure RLS is enabled
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Teachers can view their own co-teaching assignments
-- Properly joins through teacher_profiles to match teacher_id with user_id
CREATE POLICY "Teachers view own co-teaching assignments"
  ON class_teachers
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Primary teachers can view all co-teachers for classes they created
-- Joins classes -> teacher_profiles to verify primary teacher ownership
CREATE POLICY "Primary teachers view class co-teachers"
  ON class_teachers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teacher_profiles tp ON c.teacher_id = tp.id
      WHERE c.id = class_teachers.class_id
      AND tp.user_id = auth.uid()
    )
  );

-- Policy 3: Primary teachers can manage (INSERT/UPDATE/DELETE) co-teachers for their classes
CREATE POLICY "Primary teachers manage co-teachers"
  ON class_teachers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN teacher_profiles tp ON c.teacher_id = tp.id
      WHERE c.id = class_teachers.class_id
      AND tp.user_id = auth.uid()
    )
  );

-- Policy 4: Admins and developers can view all class_teachers records
CREATE POLICY "Admins view all class teachers"
  ON class_teachers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'developer'::app_role)
  );