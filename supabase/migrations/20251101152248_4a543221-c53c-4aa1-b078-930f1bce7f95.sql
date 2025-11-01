-- Temporarily disable the trigger to allow migration
ALTER TABLE classes DISABLE TRIGGER auto_set_teacher_id;

-- Create classes for Applied AI Conference session time blocks
DO $$
DECLARE
  conference_teacher_id uuid;
  keynote_class_id uuid;
  block1_class_id uuid;
  block2_class_id uuid;
  block3_class_id uuid;
BEGIN
  -- Get first available teacher profile for conference management
  SELECT id INTO conference_teacher_id FROM teacher_profiles LIMIT 1;
  
  IF conference_teacher_id IS NULL THEN
    RAISE EXCEPTION 'No teacher profile found. Please create a teacher profile first.';
  END IF;
  
  -- Create classes for different session time slots
  INSERT INTO classes (name, subject, description, published, grade_level, school_year, teacher_id)
  VALUES 
    ('Applied AI Conference - Keynotes & Featured', 
     'Artificial Intelligence', 
     'Keynote presentations and featured sessions at the Applied AI Conference 2025',
     true,
     'Professional Development',
     '2025',
     conference_teacher_id)
  RETURNING id INTO keynote_class_id;

  INSERT INTO classes (name, subject, description, published, grade_level, school_year, teacher_id)
  VALUES 
    ('Applied AI Conference - Session Block 1', 
     'Artificial Intelligence', 
     'First session block of presentations at the Applied AI Conference 2025',
     true,
     'Professional Development',
     '2025',
     conference_teacher_id)
  RETURNING id INTO block1_class_id;

  INSERT INTO classes (name, subject, description, published, grade_level, school_year, teacher_id)
  VALUES 
    ('Applied AI Conference - Session Block 2', 
     'Artificial Intelligence', 
     'Second session block of presentations at the Applied AI Conference 2025',
     true,
     'Professional Development',
     '2025',
     conference_teacher_id)
  RETURNING id INTO block2_class_id;

  INSERT INTO classes (name, subject, description, published, grade_level, school_year, teacher_id)
  VALUES 
    ('Applied AI Conference - Session Block 3', 
     'Artificial Intelligence', 
     'Third session block of presentations at the Applied AI Conference 2025',
     true,
     'Professional Development',
     '2025',
     conference_teacher_id)
  RETURNING id INTO block3_class_id;

  RAISE NOTICE 'Created conference classes successfully';

END $$;

-- Re-enable the trigger
ALTER TABLE classes ENABLE TRIGGER auto_set_teacher_id;

-- Add helpful comments
COMMENT ON TABLE classes IS 'Classes represent session time blocks in the conference. Each class contains multiple lessons (individual session talks).';
COMMENT ON TABLE lessons IS 'Lessons represent individual conference sessions/talks within a time block (class).';