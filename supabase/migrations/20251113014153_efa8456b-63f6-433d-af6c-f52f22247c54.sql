-- Drop the existing constraint that's blocking flashcards
ALTER TABLE lesson_components 
DROP CONSTRAINT IF EXISTS lesson_components_component_type_check;

-- Add updated constraint with all component types including flashcards
ALTER TABLE lesson_components 
ADD CONSTRAINT lesson_components_component_type_check 
CHECK (component_type = ANY (ARRAY[
  'slides'::text,
  'page'::text,
  'video'::text,
  'quiz'::text,
  'poll'::text,
  'discussion'::text,
  'codingEditor'::text,
  'flashcards'::text,
  'desmos'::text,
  'activity'::text,
  'assignment'::text,
  'assessment'::text,
  'reflection'::text,
  'instructions'::text,
  'resources'::text
]));