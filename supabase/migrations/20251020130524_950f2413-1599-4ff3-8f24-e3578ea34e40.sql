-- Create weekly_digests table
CREATE TABLE public.weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_text TEXT NOT NULL,
  next_focus_text TEXT NOT NULL,
  ai_note_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  teacher_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, week_start)
);

-- Enable RLS
ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;

-- Students can view their own digests
CREATE POLICY "Students can view their own digests"
ON public.weekly_digests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = weekly_digests.student_id 
    AND s.user_id = auth.uid()
  )
);

-- Students can update read status on their own digests
CREATE POLICY "Students can mark digests as read"
ON public.weekly_digests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = weekly_digests.student_id 
    AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = weekly_digests.student_id 
    AND s.user_id = auth.uid()
  )
);

-- Teachers can view digests for their students
CREATE POLICY "Teachers can view their students' digests"
ON public.weekly_digests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = weekly_digests.student_id
    AND tp.user_id = auth.uid()
  )
);

-- Teachers can manage digests for their students
CREATE POLICY "Teachers can manage their students' digests"
ON public.weekly_digests
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = weekly_digests.student_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = weekly_digests.student_id
    AND tp.user_id = auth.uid()
  )
);

-- Create index for efficient querying
CREATE INDEX idx_weekly_digests_student_week ON public.weekly_digests(student_id, week_start);
CREATE INDEX idx_weekly_digests_created ON public.weekly_digests(created_at);

-- Create trigger to update updated_at
CREATE TRIGGER update_weekly_digests_updated_at
BEFORE UPDATE ON public.weekly_digests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();