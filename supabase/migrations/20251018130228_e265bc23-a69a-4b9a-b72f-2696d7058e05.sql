
-- Remove enrollments for students without valid user accounts
DELETE FROM class_students
WHERE student_id IN (
  SELECT id FROM students WHERE user_id IS NULL
);

-- Optionally, clean up student records that have no enrollments and no user_id
-- (keeping this commented for now in case we want to keep the records)
-- DELETE FROM students WHERE user_id IS NULL AND id NOT IN (SELECT student_id FROM class_students);
