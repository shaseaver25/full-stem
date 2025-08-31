-- Seed demo data for comprehensive platform demonstration

-- Insert demo lessons into the Lessons table
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Order", "Track", "Text") VALUES
(1001, 'Introduction to Algebra', 'Learn the fundamentals of algebraic expressions and equations', 1, 'Mathematics', 'Welcome to algebra! In this lesson, we will explore the basics of algebraic thinking. Algebra is the branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. We will start with simple expressions and work our way up to solving linear equations. By the end of this lesson, you will understand how to manipulate algebraic expressions and solve for unknown variables.'),
(1002, 'Geometric Shapes and Properties', 'Explore basic geometric shapes and their properties', 2, 'Mathematics', 'Geometry is all around us! In this lesson, we will examine various geometric shapes including triangles, squares, rectangles, and circles. We will learn about their properties such as perimeter, area, and angles. Understanding these fundamental concepts will help you recognize patterns in the world around you and solve practical problems involving space and measurement.'),
(1003, 'Introduction to Shakespeare', 'Discover the works of William Shakespeare and their lasting impact', 1, 'English Literature', 'William Shakespeare is widely regarded as the greatest writer in the English language. In this lesson, we will explore his life, times, and most famous works including Romeo and Juliet, Hamlet, and Macbeth. We will analyze his use of language, themes, and character development that continue to resonate with audiences today.'),
(1004, 'The Scientific Method', 'Learn how scientists investigate and understand our world', 1, 'Science', 'The scientific method is the foundation of all scientific inquiry. In this lesson, we will learn the steps of forming hypotheses, designing experiments, collecting data, and drawing conclusions. We will explore famous scientific discoveries and learn how to think critically about evidence and results.'),
(1005, 'Ancient Civilizations', 'Journey through the great civilizations of the ancient world', 1, 'History', 'From the pyramids of Egypt to the philosophy of ancient Greece, we will explore the remarkable achievements of ancient civilizations. Learn about their innovations, cultures, governments, and lasting contributions to modern society.');

-- Insert demo teacher profiles (linking to existing auth system)
INSERT INTO teacher_profiles (id, user_id, first_name, last_name, email, subject_specialization, years_experience, school_or_district, onboarding_completed) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.johnson@demo.edu', 'Mathematics', 8, 'Demo Elementary School', true),
(gen_random_uuid(), gen_random_uuid(), 'Michael', 'Chen', 'michael.chen@demo.edu', 'English Literature', 12, 'Demo Middle School', true),
(gen_random_uuid(), gen_random_uuid(), 'Emily', 'Rodriguez', 'emily.rodriguez@demo.edu', 'Science', 5, 'Demo High School', true);

-- Insert demo classes
WITH teacher_ids AS (
  SELECT id as teacher_id, first_name, subject_specialization 
  FROM teacher_profiles 
  WHERE email LIKE '%@demo.edu'
)
INSERT INTO classes (id, teacher_id, name, grade_level, subject, school_year, description, duration, instructor, schedule, learning_objectives, prerequisites, published, status, max_students) 
SELECT 
  gen_random_uuid(),
  teacher_id,
  CASE 
    WHEN subject_specialization = 'Mathematics' THEN '7th Grade Algebra'
    WHEN subject_specialization = 'English Literature' THEN '9th Grade Literature'
    WHEN subject_specialization = 'Science' THEN '8th Grade Physical Science'
  END,
  CASE 
    WHEN subject_specialization = 'Mathematics' THEN '7th Grade'
    WHEN subject_specialization = 'English Literature' THEN '9th Grade'
    WHEN subject_specialization = 'Science' THEN '8th Grade'
  END,
  subject_specialization,
  '2024-2025',
  CASE 
    WHEN subject_specialization = 'Mathematics' THEN 'Introduction to algebraic concepts and problem-solving skills'
    WHEN subject_specialization = 'English Literature' THEN 'Explore classic literature and develop critical reading skills'
    WHEN subject_specialization = 'Science' THEN 'Hands-on exploration of physics and chemistry principles'
  END,
  '50 minutes',
  first_name,
  'MWF 10:00-10:50 AM',
  CASE 
    WHEN subject_specialization = 'Mathematics' THEN 'Students will solve linear equations and understand algebraic relationships'
    WHEN subject_specialization = 'English Literature' THEN 'Students will analyze literary themes and improve writing skills'
    WHEN subject_specialization = 'Science' THEN 'Students will understand scientific methods and basic physics principles'
  END,
  CASE 
    WHEN subject_specialization = 'Mathematics' THEN 'Basic arithmetic and number sense'
    WHEN subject_specialization = 'English Literature' THEN 'Reading comprehension at grade level'
    WHEN subject_specialization = 'Science' THEN 'Elementary math and reading skills'
  END,
  true,
  'published',
  25
FROM teacher_ids;

-- Insert demo students for each class
WITH class_data AS (
  SELECT id as class_id, name as class_name FROM classes WHERE published = true
),
demo_students AS (
  SELECT 
    gen_random_uuid() as student_id,
    'Alex Johnson' as student_name,
    'alex.johnson@student.demo.edu' as email
  UNION ALL SELECT gen_random_uuid(), 'Maria Garcia', 'maria.garcia@student.demo.edu'
  UNION ALL SELECT gen_random_uuid(), 'James Wilson', 'james.wilson@student.demo.edu'
  UNION ALL SELECT gen_random_uuid(), 'Emma Davis', 'emma.davis@student.demo.edu'
  UNION ALL SELECT gen_random_uuid(), 'David Kim', 'david.kim@student.demo.edu'
)
INSERT INTO students (id, class_id, first_name, last_name, email, enrollment_date)
SELECT 
  student_id,
  class_id,
  split_part(student_name, ' ', 1),
  split_part(student_name, ' ', 2),
  email,
  now()
FROM class_data
CROSS JOIN demo_students;

-- Insert demo lessons for each class
WITH class_lesson_mapping AS (
  SELECT 
    c.id as class_id,
    CASE 
      WHEN c.subject = 'Mathematics' THEN ARRAY[1001, 1002]
      WHEN c.subject = 'English Literature' THEN ARRAY[1003]
      WHEN c.subject = 'Science' THEN ARRAY[1004]
      ELSE ARRAY[1005]
    END as lesson_ids
  FROM classes c
  WHERE c.published = true
)
INSERT INTO lessons (id, class_id, title, description, objectives, materials, duration, order_index, content)
SELECT 
  gen_random_uuid(),
  clm.class_id,
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
    ),
    'resources', jsonb_build_array(
      jsonb_build_object('title', 'Study Guide', 'url', '#', 'type', 'pdf'),
      jsonb_build_object('title', 'Video Tutorial', 'url', '#', 'type', 'video')
    )
  )
FROM class_lesson_mapping clm
CROSS JOIN LATERAL unnest(clm.lesson_ids) as lesson_id
JOIN "Lessons" l ON l."Lesson ID" = lesson_id;

-- Insert demo assignments
WITH lesson_assignments AS (
  SELECT 
    l.id as lesson_id,
    l.title as lesson_title,
    l.class_id
  FROM lessons l
)
INSERT INTO assignments (id, lesson_id, title, instructions, allow_text_response, max_files, file_types_allowed)
SELECT 
  gen_random_uuid(),
  (SELECT l."Lesson ID" FROM "Lessons" l WHERE l."Title" = la.lesson_title LIMIT 1),
  'Assignment: ' || la.lesson_title,
  'Complete the following exercises based on the lesson material. Show your work and explain your reasoning. Submit your completed work as a PDF or typed response.',
  true,
  3,
  ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'png']
FROM lesson_assignments la;

-- Insert demo content library items
INSERT INTO content_library (id, title, description, content_type, subject, grade_level, tags, created_by, is_published)
SELECT 
  gen_random_uuid(),
  'Demo ' || title || ' Resource',
  'Comprehensive teaching resource for ' || title,
  CASE 
    WHEN random() < 0.5 THEN 'document'
    ELSE 'video'
  END,
  CASE 
    WHEN "Track" = 'Mathematics' THEN 'Mathematics'
    WHEN "Track" = 'English Literature' THEN 'English'
    WHEN "Track" = 'Science' THEN 'Science'
    ELSE 'History'
  END,
  'Middle School',
  ARRAY["Track", 'demo', 'resource'],
  (SELECT id FROM teacher_profiles LIMIT 1),
  true
FROM "Lessons"
WHERE "Lesson ID" IN (1001, 1002, 1003, 1004, 1005);

-- Insert demo student progress
WITH student_lesson_progress AS (
  SELECT 
    s.id as student_id,
    l."Lesson ID" as lesson_id,
    (random() * 100)::integer as progress_percent,
    CASE 
      WHEN random() < 0.3 THEN 'Not Started'
      WHEN random() < 0.7 THEN 'In Progress'
      ELSE 'Completed'
    END as status
  FROM students s
  CROSS JOIN "Lessons" l
  WHERE l."Lesson ID" IN (1001, 1002, 1003, 1004, 1005)
)
INSERT INTO user_progress (id, user_id, lesson_id, progress_percentage, status, started_at, completed_at)
SELECT 
  gen_random_uuid(),
  student_id,
  lesson_id,
  progress_percent,
  status,
  CASE WHEN status != 'Not Started' THEN now() - interval '1 day' * random() * 7 ELSE null END,
  CASE WHEN status = 'Completed' THEN now() - interval '1 hour' * random() * 24 ELSE null END
FROM student_lesson_progress;