-- Simplified demo data seeding - corrected version

-- Clean up any existing demo data
DELETE FROM user_progress WHERE lesson_id IN (1001, 1002, 1003);
DELETE FROM lessons WHERE title IN ('Introduction to Algebra', 'Geometric Shapes and Properties', 'Introduction to Shakespeare');
DELETE FROM students WHERE first_name IN ('Alex', 'Maria', 'James');
DELETE FROM classes WHERE name = '7th Grade Math Demo';
DELETE FROM teacher_profiles WHERE school_name = 'Demo Elementary School';
DELETE FROM "Lessons" WHERE "Lesson ID" IN (1001, 1002, 1003);

-- Insert demo lessons
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Order", "Track", "Text") VALUES
(1001, 'Introduction to Algebra', 'Learn the fundamentals of algebraic expressions and equations', 1, 'Mathematics', 'Welcome to algebra! In this lesson, we will explore the basics of algebraic thinking. Algebra is the branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. We will start with simple expressions and work our way up to solving linear equations. By the end of this lesson, you will understand how to manipulate algebraic expressions and solve for unknown variables.'),
(1002, 'Geometric Shapes and Properties', 'Explore basic geometric shapes and their properties', 2, 'Mathematics', 'Geometry is all around us! In this lesson, we will examine various geometric shapes including triangles, squares, rectangles, and circles. We will learn about their properties such as perimeter, area, and angles. Understanding these fundamental concepts will help you recognize patterns in the world around you and solve practical problems involving space and measurement.'),
(1003, 'Introduction to Shakespeare', 'Discover the works of William Shakespeare and their lasting impact', 1, 'English Literature', 'William Shakespeare is widely regarded as the greatest writer in the English language. In this lesson, we will explore his life, times, and most famous works including Romeo and Juliet, Hamlet, and Macbeth. We will analyze his use of language, themes, and character development that continue to resonate with audiences today.');

-- Create demo teacher profile
INSERT INTO teacher_profiles (id, user_id, school_name, grade_levels, subjects, years_experience, certification_status, onboarding_completed) 
VALUES (
  gen_random_uuid(), 
  gen_random_uuid(), 
  'Demo Elementary School', 
  ARRAY['7th Grade', '8th Grade'], 
  ARRAY['Mathematics', 'English Literature'], 
  10, 
  'Certified', 
  true
);

-- Create demo class
WITH demo_teacher AS (
  SELECT id FROM teacher_profiles WHERE school_name = 'Demo Elementary School' LIMIT 1
)
INSERT INTO classes (id, teacher_id, name, grade_level, subject, school_year, description, published, status, max_students, instructor, duration, schedule)
SELECT 
  gen_random_uuid(),
  dt.id,
  '7th Grade Math Demo',
  '7th Grade', 
  'Mathematics',
  '2024-2025',
  'Demo class for mathematics lessons with interactive content and AI-powered features.',
  true,
  'published',
  30,
  'Demo Teacher',
  '50 minutes',
  'Daily 9:00-9:50 AM'
FROM demo_teacher dt;

-- Create demo students
WITH demo_class AS (
  SELECT id FROM classes WHERE name = '7th Grade Math Demo' LIMIT 1
)
INSERT INTO students (id, class_id, first_name, last_name, grade_level, reading_level)
SELECT 
  gen_random_uuid(),
  dc.id,
  'Alex',
  'Johnson',
  '7th Grade',
  'Grade Level'
FROM demo_class dc
UNION ALL
SELECT 
  gen_random_uuid(),
  dc.id,
  'Maria', 
  'Garcia',
  '7th Grade',
  'Grade Level'
FROM demo_class dc
UNION ALL
SELECT
  gen_random_uuid(),
  dc.id,
  'James',
  'Wilson', 
  '7th Grade',
  'Grade Level'
FROM demo_class dc;

-- Create demo lessons for the class
WITH demo_class AS (
  SELECT id FROM classes WHERE name = '7th Grade Math Demo' LIMIT 1
)
INSERT INTO lessons (id, class_id, title, description, objectives, materials, duration, order_index, content)
SELECT
  gen_random_uuid(),
  dc.id,
  l."Title",
  l."Description",
  ARRAY['Understand core concepts', 'Apply knowledge to solve problems', 'Develop critical thinking skills'],
  ARRAY['Textbook', 'Worksheets', 'Interactive activities'],
  60,
  l."Order",
  jsonb_build_object(
    'introduction', l."Text",
    'activities', jsonb_build_array(
      jsonb_build_object('type', 'reading', 'content', 'Read the introduction material'),
      jsonb_build_object('type', 'discussion', 'content', 'Discuss key concepts with classmates'),
      jsonb_build_object('type', 'practice', 'content', 'Complete practice exercises')
    )
  )
FROM demo_class dc
CROSS JOIN "Lessons" l
WHERE l."Lesson ID" IN (1001, 1002, 1003);

-- Create demo student progress
WITH demo_students AS (
  SELECT s.id as student_id FROM students s 
  JOIN classes c ON s.class_id = c.id 
  WHERE c.name = '7th Grade Math Demo'
)
INSERT INTO user_progress (id, user_id, lesson_id, progress_percentage, status, started_at)
SELECT 
  gen_random_uuid(),
  ds.student_id,
  l."Lesson ID",
  (random() * 80 + 20)::integer,
  CASE 
    WHEN random() < 0.4 THEN 'In Progress'
    ELSE 'Completed'
  END,
  now() - interval '1 day' * random() * 5
FROM demo_students ds
CROSS JOIN "Lessons" l
WHERE l."Lesson ID" IN (1001, 1002, 1003);