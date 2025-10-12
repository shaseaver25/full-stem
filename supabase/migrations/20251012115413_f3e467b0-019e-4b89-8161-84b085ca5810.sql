-- =============================================
-- ROLE-BASED ACCESS CONTROL (RBAC) POLICIES
-- =============================================
-- This migration strengthens RLS policies across all tables
-- to enforce role-based permissions at the database level

-- =============================================
-- TEACHER_PROFILES TABLE
-- =============================================
DROP POLICY IF EXISTS "Teachers can view their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Admins can view all teacher profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Admins can manage all teacher profiles" ON teacher_profiles;

CREATE POLICY "Teachers can view their own profile"
ON teacher_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Teachers can update their own profile"
ON teacher_profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all teacher profiles"
ON teacher_profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Admins can manage all teacher profiles"
ON teacher_profiles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- =============================================
-- PARENT_PROFILES TABLE
-- =============================================
DROP POLICY IF EXISTS "Parents can view their own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Parents can update their own profile" ON parent_profiles;
DROP POLICY IF EXISTS "Admins can view all parent profiles" ON parent_profiles;
DROP POLICY IF EXISTS "Teachers can view parent profiles of their students" ON parent_profiles;

CREATE POLICY "Parents can view their own profile"
ON parent_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Parents can update their own profile"
ON parent_profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all parent profiles"
ON parent_profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Teachers can view parent profiles of their students"
ON parent_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM student_parent_relationships spr
    JOIN students s ON s.id = spr.student_id
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE spr.parent_id = parent_profiles.id
    AND tp.user_id = auth.uid()
  )
);

-- =============================================
-- CLASSES TABLE
-- =============================================
DROP POLICY IF EXISTS "Teachers can view their own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can manage their own classes" ON classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON classes;
DROP POLICY IF EXISTS "Admins can view all classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage all classes" ON classes;

CREATE POLICY "Teachers can view their own classes"
ON classes
FOR SELECT
USING (
  teacher_id IN (
    SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage their own classes"
ON classes
FOR ALL
USING (
  teacher_id IN (
    SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their enrolled classes"
ON classes
FOR SELECT
USING (
  id IN (
    SELECT cs.class_id 
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all classes"
ON classes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

CREATE POLICY "Admins can manage all classes"
ON classes
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- =============================================
-- GRADES TABLE
-- =============================================
DROP POLICY IF EXISTS "Students can view their own grades" ON grades;
DROP POLICY IF EXISTS "Teachers can view grades for their classes" ON grades;
DROP POLICY IF EXISTS "Teachers can manage grades for their classes" ON grades;
DROP POLICY IF EXISTS "Parents can view their children's grades" ON grades;

CREATE POLICY "Students can view their own grades"
ON grades
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view grades for their classes"
ON grades
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM students s
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE s.id = grades.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage grades for their classes"
ON grades
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM students s
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE s.id = grades.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Parents can view their children's grades"
ON grades
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM student_parent_relationships spr
    JOIN parent_profiles pp ON pp.id = spr.parent_id
    WHERE spr.student_id = grades.student_id
    AND pp.user_id = auth.uid()
    AND spr.can_view_grades = true
  )
);

-- =============================================
-- CLASS_STUDENTS TABLE
-- =============================================
DROP POLICY IF EXISTS "Teachers can view their class students" ON class_students;
DROP POLICY IF EXISTS "Teachers can manage their class students" ON class_students;
DROP POLICY IF EXISTS "Students can view their own enrollment" ON class_students;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON class_students;

CREATE POLICY "Teachers can view their class students"
ON class_students
FOR SELECT
USING (
  class_id IN (
    SELECT c.id 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage their class students"
ON class_students
FOR ALL
USING (
  class_id IN (
    SELECT c.id 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own enrollment"
ON class_students
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all enrollments"
ON class_students
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (user_id = auth.uid());

-- =============================================
-- USER_PROGRESS TABLE
-- =============================================
DROP POLICY IF EXISTS "Students can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Teachers can view student progress in their classes" ON user_progress;

CREATE POLICY "Students can view their own progress"
ON user_progress
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Students can update their own progress"
ON user_progress
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student progress in their classes"
ON user_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM students s
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE s.user_id = user_progress.user_id
    AND tp.user_id = auth.uid()
  )
);