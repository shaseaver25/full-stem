-- Create student_goals table
CREATE TABLE public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_feedback_history table
CREATE TABLE public.ai_feedback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.student_goals(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('insight', 'goal_suggestion', 'reflection_summary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_reflections table
CREATE TABLE public.student_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.student_goals(id) ON DELETE CASCADE,
  reflection_text TEXT NOT NULL,
  prompt_question TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_goals
CREATE POLICY "Teachers can view goals for their students"
ON public.student_goals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = student_goals.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage goals for their students"
ON public.student_goals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = student_goals.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own goals"
ON public.student_goals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_goals.student_id
    AND s.user_id = auth.uid()
  )
);

-- RLS Policies for ai_feedback_history
CREATE POLICY "Teachers can view AI feedback for their students"
ON public.ai_feedback_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = ai_feedback_history.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create AI feedback for their students"
ON public.ai_feedback_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = ai_feedback_history.student_id
    AND tp.user_id = auth.uid()
  )
);

-- RLS Policies for student_reflections
CREATE POLICY "Teachers can view reflections for their students"
ON public.student_reflections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = student_reflections.student_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can manage their own reflections"
ON public.student_reflections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_reflections.student_id
    AND s.user_id = auth.uid()
  )
);

-- Create trigger for updated_at on student_goals
CREATE TRIGGER update_student_goals_updated_at
BEFORE UPDATE ON public.student_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_student_goals_student_id ON public.student_goals(student_id);
CREATE INDEX idx_student_goals_status ON public.student_goals(status);
CREATE INDEX idx_ai_feedback_student_id ON public.ai_feedback_history(student_id);
CREATE INDEX idx_student_reflections_student_id ON public.student_reflections(student_id);
CREATE INDEX idx_student_reflections_goal_id ON public.student_reflections(goal_id);