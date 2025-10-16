-- Fix infinite recursion in students table RLS policies
-- The issue: class_students policy "Students can view their own enrollments" 
-- directly queries students table, creating circular dependency

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Students can view their own enrollments" ON class_students;

-- The good policy using security definer function already exists:
-- "Students can view their enrollments" using get_student_id_for_user()
-- So we don't need to create a replacement