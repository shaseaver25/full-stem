-- Delete all classes except "Level 1 AI Educator Professional Development" 
-- for the teacher who owns that class

DELETE FROM classes 
WHERE teacher_id = (
  SELECT teacher_id 
  FROM classes 
  WHERE id = '2e9818da-4eb0-438e-9d96-85b5b2c1e82e'
)
AND id != '2e9818da-4eb0-438e-9d96-85b5b2c1e82e';