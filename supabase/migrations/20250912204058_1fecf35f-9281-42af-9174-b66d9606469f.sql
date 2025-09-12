-- Check if class_students table exists, if not create it
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID NOT NULL, -- References users but can't FK to auth.users
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- Add missing columns to class_assignments_new if they don't exist
ALTER TABLE public.class_assignments_new 
ADD COLUMN IF NOT EXISTS selected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS release_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS due_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lesson_id BIGINT REFERENCES public."Lessons"("Lesson ID") ON DELETE SET NULL;

-- Add missing columns to assignment_submissions if they don't exist
ALTER TABLE public.assignment_submissions 
ADD COLUMN IF NOT EXISTS overrides JSONB;

-- Create students table if it doesn't exist (for referencing)
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

-- Enable RLS on new tables
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for class_students
CREATE POLICY "Teachers can manage class roster" 
ON public.class_students 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = class_students.class_id AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = class_students.class_id AND tp.user_id = auth.uid()
  )
);

-- Create RLS policies for students
CREATE POLICY "Teachers can view all students for enrollment" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teacher_profiles tp 
    WHERE tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own profile" 
ON public.students 
FOR SELECT 
USING (user_id = auth.uid());

-- Update class_assignments_new policies to handle lesson assignments
DROP POLICY IF EXISTS "Teachers can manage their class assignments" ON public.class_assignments_new;
CREATE POLICY "Teachers can manage class assignments" 
ON public.class_assignments_new 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = class_assignments_new.class_id AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c 
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = class_assignments_new.class_id AND tp.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);