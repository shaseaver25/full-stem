-- Ensure class_students table exists with proper structure
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'withdrawn')),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.class_students;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.class_students;
DROP POLICY IF EXISTS "Teachers can enroll students in their classes" ON public.class_students;

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view students in their classes"
ON public.class_students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Teachers can enroll students in their classes
CREATE POLICY "Teachers can enroll students in their classes"
ON public.class_students
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Teachers can update student enrollments in their classes
CREATE POLICY "Teachers can update enrollments in their classes"
ON public.class_students
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Teachers can remove students from their classes
CREATE POLICY "Teachers can remove students from their classes"
ON public.class_students
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments"
ON public.class_students
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_class_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_class_students_updated_at ON public.class_students;

CREATE TRIGGER update_class_students_updated_at
BEFORE UPDATE ON public.class_students
FOR EACH ROW
EXECUTE FUNCTION public.update_class_students_updated_at();