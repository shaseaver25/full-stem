-- Create table to link classes with lesson tracks/courses
CREATE TABLE public.class_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL,
  track TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.class_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers to manage their class courses
CREATE POLICY "Teachers can manage courses for their classes" 
ON public.class_courses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_courses.class_id 
    AND classes.teacher_id IN (
      SELECT teacher_profiles.id 
      FROM teacher_profiles 
      WHERE teacher_profiles.user_id = auth.uid()
    )
  )
);

-- Add foreign key constraint
ALTER TABLE public.class_courses 
ADD CONSTRAINT class_courses_class_id_fkey 
FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;