-- Create core tables needed for class management
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  grade_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add columns to existing tables
ALTER TABLE public.class_assignments_new 
ADD COLUMN IF NOT EXISTS selected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS release_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS due_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lesson_id BIGINT REFERENCES public."Lessons"("Lesson ID") ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Teachers manage class roster" ON public.class_students FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = class_students.class_id AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers view students" ON public.students FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.teacher_profiles WHERE user_id = auth.uid())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);