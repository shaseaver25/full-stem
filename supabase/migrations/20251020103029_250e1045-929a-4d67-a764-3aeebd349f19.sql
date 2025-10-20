-- Fix RLS policies for class_assignments_new to properly check teacher access
-- The issue is that teacher_id in classes references teacher_profiles.id, not auth.uid()

DROP POLICY IF EXISTS "Teachers can manage their class assignments" ON class_assignments_new;
DROP POLICY IF EXISTS "teacher_manage_assignments" ON class_assignments_new;

-- Create correct policy that joins through teacher_profiles
CREATE POLICY "Teachers can manage their class assignments" ON class_assignments_new
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_assignments_new.class_id 
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_assignments_new.class_id 
    AND tp.user_id = auth.uid()
  )
);

-- Also allow students to view assignments in their enrolled classes
CREATE POLICY "Students can view class assignments" ON class_assignments_new
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = class_assignments_new.class_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  )
);