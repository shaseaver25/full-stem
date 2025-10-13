-- Update the lesson_components check constraint to allow all component types
-- Drop the old constraint
ALTER TABLE lesson_components DROP CONSTRAINT IF EXISTS lesson_components_component_type_check;

-- Add updated constraint with all component types
ALTER TABLE lesson_components ADD CONSTRAINT lesson_components_component_type_check
  CHECK (component_type IN (
    'slides',
    'page',
    'video',
    'discussion',
    'codingEditor',
    'coding_editor',
    'desmos',
    'activity',
    'assignment',
    'assessment',
    'reflection',
    'instructions',
    'resources',
    'formativeCheck',
    'formative_check',
    'checklist'
  ));