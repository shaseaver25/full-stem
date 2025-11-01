-- Add 'poll' to the lesson_components component_type check constraint
ALTER TABLE public.lesson_components DROP CONSTRAINT IF EXISTS lesson_components_component_type_check;

ALTER TABLE public.lesson_components 
ADD CONSTRAINT lesson_components_component_type_check 
CHECK (component_type IN (
  'slides',
  'page', 
  'video',
  'quiz',
  'poll',
  'discussion',
  'codingEditor',
  'desmos',
  'activity',
  'assignment',
  'assessment',
  'reflection',
  'instructions',
  'resources'
));