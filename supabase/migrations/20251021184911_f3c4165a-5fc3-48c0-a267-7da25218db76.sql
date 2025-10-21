
-- Enroll the demo student in the "Ai for Teachers Part 1" class
INSERT INTO class_students (class_id, student_id, status)
SELECT 
  c.id as class_id,
  s.id as student_id,
  'active' as status
FROM classes c
CROSS JOIN students s
WHERE s.user_id IN (
  SELECT id FROM auth.users WHERE email = 'student@test.com'
)
AND c.name ILIKE '%ai%teacher%'
ON CONFLICT (class_id, student_id) DO NOTHING;
