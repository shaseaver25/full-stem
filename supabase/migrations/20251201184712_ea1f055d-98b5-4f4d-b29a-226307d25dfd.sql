-- Clean up ALL existing policies on class_teachers, including recursive ones
DROP POLICY IF EXISTS "Admins can manage all teacher assignments" ON class_teachers;
DROP POLICY IF EXISTS "Admins view all class teachers" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers manage all class teachers" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers manage co-teachers" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers view class co-teachers" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can insert assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can manage teacher assignments for their classes" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can view their assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers view own co-teaching assignments" ON class_teachers;

-- Ensure RLS is enabled
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- Recreate a minimal, non-recursive policy set

-- 1) Teachers see their own co-teaching rows
CREATE POLICY "Teachers view own co-teaching assignments"
  ON class_teachers
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
    )
  );

-- 2) Primary teachers see all co-teachers for their classes
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

-- 3) Primary teachers can manage co-teachers (insert/update/delete) for their classes
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

-- 4) Admins / super_admins / developers can view all rows
CREATE POLICY "Admins view all class teachers"
  ON class_teachers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'developer'::app_role)
  );
