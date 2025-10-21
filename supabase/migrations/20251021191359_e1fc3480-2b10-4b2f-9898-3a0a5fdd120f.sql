-- Create student_goals table if not exists
CREATE TABLE IF NOT EXISTS public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  target_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table if not exists (for lesson progress tracking)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  date_completed TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_goals
CREATE POLICY "Students can manage their own goals"
ON public.student_goals
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_goals.student_id
    AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_goals.student_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view their students' goals"
ON public.student_goals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM class_students cs
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = student_goals.student_id
    AND tp.user_id = auth.uid()
  )
);

-- RLS Policies for user_progress
CREATE POLICY "Users can manage their own progress"
ON public.user_progress
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can view their students' progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM students s
    JOIN class_students cs ON cs.student_id = s.id
    JOIN classes c ON c.id = cs.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE s.user_id = user_progress.user_id
    AND tp.user_id = auth.uid()
  )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_student_goals_student_id ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_status ON public.student_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);

-- Add update triggers
CREATE OR REPLACE FUNCTION update_student_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_goals_updated_at
BEFORE UPDATE ON public.student_goals
FOR EACH ROW
EXECUTE FUNCTION update_student_goals_updated_at();

CREATE TRIGGER trigger_update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();