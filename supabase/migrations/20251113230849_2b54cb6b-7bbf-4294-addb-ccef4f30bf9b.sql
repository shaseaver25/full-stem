-- AI Tutor Feature: Socratic questioning assistant for students
-- FERPA-compliant, rate-limited, teacher-monitored

-- Table 1: Conversation tracking
CREATE TABLE IF NOT EXISTS public.ai_tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_conversations_user ON public.ai_tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conversations_lesson ON public.ai_tutor_conversations(lesson_id);

-- Table 2: Message storage
CREATE TABLE IF NOT EXISTS public.ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_tutor_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokens_used INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation ON public.ai_tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_created ON public.ai_tutor_messages(created_at);

-- Table 3: Daily usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS public.ai_tutor_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  questions_asked INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, lesson_id, date)
);

CREATE INDEX IF NOT EXISTS idx_tutor_usage_user_date ON public.ai_tutor_usage(user_id, date);

-- Function: Increment usage counter
CREATE OR REPLACE FUNCTION public.increment_tutor_usage(
  p_user_id UUID,
  p_lesson_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_tutor_usage (user_id, lesson_id, date, questions_asked)
  VALUES (p_user_id, p_lesson_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, lesson_id, date)
  DO UPDATE SET questions_asked = ai_tutor_usage.questions_asked + 1;
END;
$$;

-- RLS Policies for ai_tutor_conversations
ALTER TABLE public.ai_tutor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.ai_tutor_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.ai_tutor_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_tutor_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view conversations for their lessons"
  ON public.ai_tutor_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.classes c ON l.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE l.id = lesson_id AND tp.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_tutor_messages
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON public.ai_tutor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_tutor_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.ai_tutor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_tutor_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view messages for their lesson conversations"
  ON public.ai_tutor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_tutor_conversations conv
      JOIN public.lessons l ON conv.lesson_id = l.id
      JOIN public.classes c ON l.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE conv.id = conversation_id AND tp.user_id = auth.uid()
    )
  );

-- RLS Policies for ai_tutor_usage
ALTER TABLE public.ai_tutor_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.ai_tutor_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.ai_tutor_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage via function"
  ON public.ai_tutor_usage FOR UPDATE
  USING (true);

CREATE POLICY "Teachers can view usage for their lessons"
  ON public.ai_tutor_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.classes c ON l.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE l.id = lesson_id AND tp.user_id = auth.uid()
    )
  );