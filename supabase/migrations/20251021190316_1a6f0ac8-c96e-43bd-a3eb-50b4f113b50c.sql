-- Add RLS policies to class_students table (serves as student_class_relationships)

-- Enable RLS if not already enabled
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.class_students;
DROP POLICY IF EXISTS "Teachers can view enrollments in their classes" ON public.class_students;
DROP POLICY IF EXISTS "Teachers can manage enrollments in their classes" ON public.class_students;
DROP POLICY IF EXISTS "Admins have full access" ON public.class_students;

-- Students can select their own enrollment records
CREATE POLICY "Students can view their own enrollments"
ON public.class_students
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = class_students.student_id
    AND s.user_id = auth.uid()
  )
);

-- Teachers can select enrollments for classes they own
CREATE POLICY "Teachers can view enrollments in their classes"
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

-- Teachers can insert/update/delete enrollments in their classes
CREATE POLICY "Teachers can manage enrollments in their classes"
ON public.class_students
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_students.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Admins and Developers have full access
CREATE POLICY "Admins have full access to class enrollments"
ON public.class_students
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON public.class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_status ON public.class_students(status);

-- Create composite unique index to prevent duplicate enrollments
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_students_unique_enrollment 
ON public.class_students(student_id, class_id) 
WHERE status = 'active';

-- Add comment to clarify table purpose
COMMENT ON TABLE public.class_students IS 'Links students to classes (enrollment/relationship table). Each row represents a student enrolled in a specific class.';
