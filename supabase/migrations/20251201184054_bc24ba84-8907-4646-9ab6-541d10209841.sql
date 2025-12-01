
-- Drop any existing policies on class_teachers
DROP POLICY IF EXISTS "Teachers can view their class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Teachers can insert their class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Primary teachers can manage class assignments" ON class_teachers;
DROP POLICY IF EXISTS "Admins can view all class assignments" ON class_teachers;

-- Enable RLS on class_teachers
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Teachers can view their own assignments
CREATE POLICY "Teachers can view own assignments"
  ON class_teachers
  FOR SELECT
  USING (teacher_id = auth.uid());

-- Policy 2: Teachers can view assignments for classes they created
CREATE POLICY "Primary teachers can view class assignments"
  ON class_teachers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_teachers.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policy 3: Teachers can insert themselves as co-teachers (with approval)
CREATE POLICY "Teachers can insert own assignments"
  ON class_teachers
  FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- Policy 4: Primary teachers can manage all assignments for their classes
CREATE POLICY "Primary teachers manage class assignments"
  ON class_teachers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_teachers.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Policy 5: Developers and super admins can view all
CREATE POLICY "Admins view all class assignments"
  ON class_teachers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('developer', 'super_admin')
    )
  );
