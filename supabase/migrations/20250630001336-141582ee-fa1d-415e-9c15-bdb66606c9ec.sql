
-- Create the core tables for the TailorEDU class creation system

-- Classes table (enhanced from existing structure)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS content_metadata jsonb DEFAULT '{}';

-- Create lessons table with proper relationships
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  objectives text[],
  content jsonb DEFAULT '{}',
  materials text[],
  duration integer DEFAULT 60,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  activity_type text NOT NULL DEFAULT 'general',
  resources jsonb DEFAULT '[]',
  instructions text,
  estimated_time integer DEFAULT 30,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(class_id, order_index);
CREATE INDEX IF NOT EXISTS idx_activities_lesson_id ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_activities_order ON activities(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_classes_published ON classes(published, created_at);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- Enable RLS on new tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lessons
CREATE POLICY "Teachers can manage their class lessons" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = lessons.class_id 
      AND classes.teacher_id IN (
        SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view published class lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = lessons.class_id 
      AND classes.published = true
    )
  );

-- Create RLS policies for activities
CREATE POLICY "Teachers can manage their lesson activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN classes ON lessons.class_id = classes.id
      WHERE lessons.id = activities.lesson_id 
      AND classes.teacher_id IN (
        SELECT id FROM teacher_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view published lesson activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN classes ON lessons.class_id = classes.id
      WHERE lessons.id = activities.lesson_id 
      AND classes.published = true
    )
  );

-- Create function to update class status and published_at
CREATE OR REPLACE FUNCTION update_class_publication()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
    NEW.status = 'published';
  ELSIF NEW.published = false AND OLD.published = true THEN
    NEW.published_at = NULL;
    NEW.status = 'draft';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for class publication
DROP TRIGGER IF EXISTS trigger_update_class_publication ON classes;
CREATE TRIGGER trigger_update_class_publication
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_class_publication();
