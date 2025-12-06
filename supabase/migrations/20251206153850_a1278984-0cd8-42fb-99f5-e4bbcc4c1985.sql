-- Fix: Lesson Components Publicly Readable to All Authenticated Users
-- Drop the overly permissive policy that uses 'true' qualifier
DROP POLICY IF EXISTS "Authenticated users can view lesson components" ON public.lesson_components;

-- Create proper policy for students: only see non-teacher-only components from enrolled, published classes
CREATE POLICY "Students view enrolled class lesson components"
ON public.lesson_components
FOR SELECT
USING (
  (teacher_only = false OR teacher_only IS NULL) AND
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN class_students cs ON cs.class_id = c.id
    JOIN students s ON s.id = cs.student_id
    WHERE l.id = lesson_components.lesson_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
    AND c.published = true
  )
);

-- Create policy for teachers: can see all components from their classes (including teacher_only)
CREATE POLICY "Teachers view their class lesson components"
ON public.lesson_components
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE l.id = lesson_components.lesson_id
    AND tp.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN class_teachers ct ON ct.class_id = c.id
    JOIN teacher_profiles tp ON tp.id = ct.teacher_id
    WHERE l.id = lesson_components.lesson_id
    AND tp.user_id = auth.uid()
  )
);

-- Developers can view all for debugging (read-only)
CREATE POLICY "Developers view all lesson components"
ON public.lesson_components
FOR SELECT
USING (
  has_role(auth.uid(), 'developer'::app_role)
);