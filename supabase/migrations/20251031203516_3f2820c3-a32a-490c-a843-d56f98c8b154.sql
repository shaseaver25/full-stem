-- Add 'quiz' to the allowed component types
ALTER TABLE lesson_components 
DROP CONSTRAINT lesson_components_component_type_check;

ALTER TABLE lesson_components 
ADD CONSTRAINT lesson_components_component_type_check 
CHECK (component_type = ANY (ARRAY[
  'slides'::text, 
  'page'::text, 
  'video'::text, 
  'discussion'::text, 
  'codingEditor'::text, 
  'coding_editor'::text, 
  'desmos'::text, 
  'activity'::text, 
  'assignment'::text, 
  'assessment'::text, 
  'reflection'::text, 
  'instructions'::text, 
  'resources'::text, 
  'formativeCheck'::text, 
  'formative_check'::text, 
  'checklist'::text,
  'quiz'::text
]));