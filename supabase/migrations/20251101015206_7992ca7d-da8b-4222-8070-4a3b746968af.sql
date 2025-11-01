-- Create poll_components table
CREATE TABLE IF NOT EXISTS public.poll_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES public.lesson_components(id) ON DELETE CASCADE,
  poll_question TEXT NOT NULL,
  poll_type TEXT NOT NULL CHECK (poll_type IN ('single_choice', 'multiple_choice', 'rating_scale', 'ranking')),
  show_results_timing TEXT DEFAULT 'after_voting' CHECK (show_results_timing IN ('before_voting', 'after_voting', 'never')),
  allow_anonymous BOOLEAN DEFAULT true,
  allow_change_vote BOOLEAN DEFAULT false,
  require_participation BOOLEAN DEFAULT false,
  close_poll_at TIMESTAMPTZ,
  is_closed BOOLEAN DEFAULT false,
  chart_type TEXT DEFAULT 'bar' CHECK (chart_type IN ('bar', 'pie', 'donut')),
  show_percentages BOOLEAN DEFAULT true,
  show_vote_counts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(component_id)
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_component_id UUID NOT NULL REFERENCES public.poll_components(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create poll_responses table
CREATE TABLE IF NOT EXISTS public.poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_component_id UUID NOT NULL REFERENCES public.poll_components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  selected_option_ids UUID[],
  rating_value INTEGER,
  ranking_order JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for non-anonymous responses
CREATE UNIQUE INDEX idx_poll_responses_user_poll 
ON public.poll_responses(poll_component_id, user_id) 
WHERE user_id IS NOT NULL;

-- Create indexes
CREATE INDEX idx_poll_responses_user ON public.poll_responses(user_id);
CREATE INDEX idx_poll_responses_poll ON public.poll_responses(poll_component_id);
CREATE INDEX idx_poll_options_poll ON public.poll_options(poll_component_id);
CREATE INDEX idx_poll_components_component ON public.poll_components(component_id);

-- Enable RLS
ALTER TABLE public.poll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poll_components
CREATE POLICY "Teachers can manage poll components"
ON public.poll_components
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.lesson_components lc
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE lc.id = poll_components.component_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view poll components"
ON public.poll_components
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lesson_components lc
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.class_students cs ON cs.class_id = c.id
    JOIN public.students s ON s.id = cs.student_id
    WHERE lc.id = poll_components.component_id
    AND s.user_id = auth.uid()
  )
);

-- RLS Policies for poll_options
CREATE POLICY "Teachers can manage poll options"
ON public.poll_options
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.poll_components pc
    JOIN public.lesson_components lc ON lc.id = pc.component_id
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE pc.id = poll_options.poll_component_id
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view poll options"
ON public.poll_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.poll_components pc
    JOIN public.lesson_components lc ON lc.id = pc.component_id
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.class_students cs ON cs.class_id = c.id
    JOIN public.students s ON s.id = cs.student_id
    WHERE pc.id = poll_options.poll_component_id
    AND s.user_id = auth.uid()
  )
);

-- RLS Policies for poll_responses
CREATE POLICY "Users can insert their own responses"
ON public.poll_responses
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR is_anonymous = true
);

CREATE POLICY "Users can update their own responses"
ON public.poll_responses
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own responses"
ON public.poll_responses
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Teachers can view all responses"
ON public.poll_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.poll_components pc
    JOIN public.lesson_components lc ON lc.id = pc.component_id
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.classes c ON c.id = l.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE pc.id = poll_responses.poll_component_id
    AND tp.user_id = auth.uid()
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_options;

-- Create trigger for updated_at
CREATE TRIGGER update_poll_components_updated_at
BEFORE UPDATE ON public.poll_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();