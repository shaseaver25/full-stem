-- Add is_assignable column to lesson_components
ALTER TABLE lesson_components
ADD COLUMN is_assignable BOOLEAN DEFAULT FALSE;

-- Update existing Assignment type components to be assignable
UPDATE lesson_components
SET is_assignable = TRUE
WHERE component_type = 'assignment';

-- Add comment for documentation
COMMENT ON COLUMN lesson_components.is_assignable IS 'Indicates if this component should appear in the Assignments tab and be assignable to students';