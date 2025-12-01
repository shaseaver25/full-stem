-- Drop the problematic recursive RLS policy on class_teachers
DROP POLICY IF EXISTS "Teachers can manage their class assignments" ON class_teachers;

-- Create simple, non-recursive RLS policies for class_teachers
-- Teachers can view their own assignments
CREATE POLICY "Teachers can view their assignments"
ON class_teachers
FOR SELECT
USING (teacher_id IN (
  SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
));

-- Teachers can insert their own assignments
CREATE POLICY "Teachers can insert assignments"
ON class_teachers
FOR INSERT
WITH CHECK (teacher_id IN (
  SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
));

-- Primary teachers (from classes table) can manage all assignments for their class
CREATE POLICY "Primary teachers manage all class teachers"
ON class_teachers
FOR ALL
USING (class_id IN (
  SELECT id FROM classes WHERE teacher_id IN (
    SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
  )
));

-- Admins and developers can view all
CREATE POLICY "Admins view all class teachers"
ON class_teachers
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'developer'::app_role)
);