-- Fix lesson_components.lesson_id to be UUID instead of bigint
-- Step 1: Drop dependent RLS policies
DROP POLICY IF EXISTS "Teachers can manage lesson components for their classes" ON lesson_components;
DROP POLICY IF EXISTS "Students can view lesson components for their classes" ON lesson_components;
DROP POLICY IF EXISTS "Developers read-only: lesson_components" ON lesson_components;
DROP POLICY IF EXISTS "Authenticated users can view lesson components" ON lesson_components;

-- Step 2: Clear existing data (necessary for schema change)
TRUNCATE TABLE lesson_components;

-- Step 3: Drop and recreate the column with correct type
ALTER TABLE lesson_components DROP COLUMN lesson_id;
ALTER TABLE lesson_components ADD COLUMN lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE;

-- Step 4: Create index for performance
CREATE INDEX idx_lesson_components_lesson_id ON lesson_components(lesson_id);

-- Step 5: Recreate RLS policies with correct references
CREATE POLICY "Authenticated users can view lesson components"
  ON lesson_components FOR SELECT
  USING (true);

CREATE POLICY "Developers read-only: lesson_components"
  ON lesson_components FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "Teachers can manage lesson components for their classes"
  ON lesson_components FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN teacher_profiles tp ON tp.id = c.teacher_id
      WHERE l.id = lesson_components.lesson_id
      AND tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN teacher_profiles tp ON tp.id = c.teacher_id
      WHERE l.id = lesson_components.lesson_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view lesson components for their classes"
  ON lesson_components FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN classes c ON c.id = l.class_id
      JOIN class_students cs ON cs.class_id = c.id
      JOIN students s ON s.id = cs.student_id
      WHERE l.id = lesson_components.lesson_id
      AND s.user_id = auth.uid()
    )
  );