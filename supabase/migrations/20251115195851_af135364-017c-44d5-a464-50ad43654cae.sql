-- Allow students to create discussion threads for lessons they have access to
CREATE POLICY "Students can create discussion threads for their lessons"
ON discussion_threads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if lesson_id is set and student is enrolled in a class that has this lesson
  (lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN class_students cs ON cs.class_id = c.id
    JOIN students s ON s.id = cs.student_id
    WHERE l.id = discussion_threads.lesson_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  ))
  OR
  -- Allow if assignment_id is set and student has access to that assignment
  (assignment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM class_assignments_new ca
    JOIN classes c ON c.id = ca.class_id
    JOIN class_students cs ON cs.class_id = c.id
    JOIN students s ON s.id = cs.student_id
    WHERE ca.id = discussion_threads.assignment_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  ))
  OR
  -- Allow if class_id is set and student is enrolled
  (class_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = discussion_threads.class_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  ))
);

-- Allow teachers to create discussion threads for their lessons
CREATE POLICY "Teachers can create discussion threads for their lessons"
ON discussion_threads
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if lesson_id is set and teacher owns the class
  (lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM lessons l
    JOIN classes c ON l.class_id = c.id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE l.id = discussion_threads.lesson_id
    AND tp.user_id = auth.uid()
  ))
  OR
  -- Allow if assignment_id is set and teacher owns the class
  (assignment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM class_assignments_new ca
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE ca.id = discussion_threads.assignment_id
    AND tp.user_id = auth.uid()
  ))
  OR
  -- Allow if class_id is set and teacher owns the class
  (class_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = discussion_threads.class_id
    AND tp.user_id = auth.uid()
  ))
);