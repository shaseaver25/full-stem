-- Add demo data without deleting existing data to avoid foreign key conflicts

-- Insert demo lessons (use new IDs to avoid conflicts)
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Order", "Track", "Text") VALUES
(2001, 'Demo: Introduction to Algebra', 'Learn the fundamentals of algebraic expressions and equations', 1, 'Mathematics', 'Welcome to algebra! In this lesson, we will explore the basics of algebraic thinking. Algebra is the branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. We will start with simple expressions and work our way up to solving linear equations. By the end of this lesson, you will understand how to manipulate algebraic expressions and solve for unknown variables.'),
(2002, 'Demo: Geometric Shapes and Properties', 'Explore basic geometric shapes and their properties', 2, 'Mathematics', 'Geometry is all around us! In this lesson, we will examine various geometric shapes including triangles, squares, rectangles, and circles. We will learn about their properties such as perimeter, area, and angles. Understanding these fundamental concepts will help you recognize patterns in the world around you and solve practical problems involving space and measurement.'),
(2003, 'Demo: Introduction to Shakespeare', 'Discover the works of William Shakespeare and their lasting impact', 1, 'English Literature', 'William Shakespeare is widely regarded as the greatest writer in the English language. In this lesson, we will explore his life, times, and most famous works including Romeo and Juliet, Hamlet, and Macbeth. We will analyze his use of language, themes, and character development that continue to resonate with audiences today.');

-- Create demo teacher profile (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teacher_profiles WHERE school_name = 'Demo Elementary School') THEN
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
  END IF;
END $$;

-- Create demo class (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Demo: 7th Grade Math') THEN
    INSERT INTO classes (id, teacher_id, name, grade_level, subject, school_year, description, published, status, max_students, instructor, duration, schedule)
    SELECT 
      gen_random_uuid(),
      tp.id,
      'Demo: 7th Grade Math',
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
    FROM teacher_profiles tp 
    WHERE tp.school_name = 'Demo Elementary School' 
    LIMIT 1;
  END IF;
END $$;

-- Create demo students
DO $$
DECLARE
  demo_class_id UUID;
BEGIN
  SELECT id INTO demo_class_id FROM classes WHERE name = 'Demo: 7th Grade Math' LIMIT 1;
  
  IF demo_class_id IS NOT NULL THEN
    -- Only insert if students don't already exist
    IF NOT EXISTS (SELECT 1 FROM students WHERE first_name = 'DemoAlex' AND class_id = demo_class_id) THEN
      INSERT INTO students (id, class_id, first_name, last_name, grade_level, reading_level) VALUES
      (gen_random_uuid(), demo_class_id, 'DemoAlex', 'Johnson', '7th Grade', 'Grade Level'),
      (gen_random_uuid(), demo_class_id, 'DemoMaria', 'Garcia', '7th Grade', 'Grade Level'),
      (gen_random_uuid(), demo_class_id, 'DemoJames', 'Wilson', '7th Grade', 'Grade Level');
    END IF;
  END IF;
END $$;

-- Create demo lessons for the class
DO $$
DECLARE
  demo_class_id UUID;
BEGIN
  SELECT id INTO demo_class_id FROM classes WHERE name = 'Demo: 7th Grade Math' LIMIT 1;
  
  IF demo_class_id IS NOT NULL THEN
    -- Insert demo lessons if they don't exist
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE title = 'Demo: Introduction to Algebra' AND class_id = demo_class_id) THEN
      INSERT INTO lessons (id, class_id, title, description, objectives, materials, duration, order_index, content)
      SELECT
        gen_random_uuid(),
        demo_class_id,
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
      FROM "Lessons" l
      WHERE l."Lesson ID" IN (2001, 2002, 2003);
    END IF;
  END IF;
END $$;