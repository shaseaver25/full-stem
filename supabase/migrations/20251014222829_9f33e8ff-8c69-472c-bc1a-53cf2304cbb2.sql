-- Create discussion threads table
CREATE TABLE public.discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.class_assignments_new(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (class_id IS NOT NULL OR lesson_id IS NOT NULL OR assignment_id IS NOT NULL)
);

-- Create discussion replies table with nested support
CREATE TABLE public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Create discussion reactions table
CREATE TABLE public.discussion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id, emoji),
  UNIQUE(reply_id, user_id, emoji),
  CHECK ((thread_id IS NOT NULL AND reply_id IS NULL) OR (thread_id IS NULL AND reply_id IS NOT NULL))
);

-- Create discussion attachments table
CREATE TABLE public.discussion_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK ((thread_id IS NOT NULL AND reply_id IS NULL) OR (thread_id IS NULL AND reply_id IS NOT NULL))
);

-- Create typing indicators table
CREATE TABLE public.discussion_typing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Enable RLS
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_typing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion_threads
CREATE POLICY "Users in class can view threads"
  ON public.discussion_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_students cs
      JOIN public.students s ON s.id = cs.student_id
      WHERE cs.class_id = discussion_threads.class_id AND s.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE c.id = discussion_threads.class_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users in class can create threads"
  ON public.discussion_threads FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND (
      EXISTS (
        SELECT 1 FROM public.class_students cs
        JOIN public.students s ON s.id = cs.student_id
        WHERE cs.class_id = discussion_threads.class_id AND s.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
        WHERE c.id = discussion_threads.class_id AND tp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can moderate threads"
  ON public.discussion_threads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE c.id = discussion_threads.class_id AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete threads"
  ON public.discussion_threads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE c.id = discussion_threads.class_id AND tp.user_id = auth.uid()
    )
  );

-- RLS Policies for discussion_replies
CREATE POLICY "Users in class can view replies"
  ON public.discussion_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      WHERE dt.id = discussion_replies.thread_id
      AND (
        EXISTS (
          SELECT 1 FROM public.class_students cs
          JOIN public.students s ON s.id = cs.student_id
          WHERE cs.class_id = dt.class_id AND s.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.classes c
          JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
          WHERE c.id = dt.class_id AND tp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create replies"
  ON public.discussion_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies"
  ON public.discussion_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can delete any reply"
  ON public.discussion_replies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.discussion_threads dt
      JOIN public.classes c ON c.id = dt.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE dt.id = discussion_replies.thread_id AND tp.user_id = auth.uid()
    )
  );

-- RLS Policies for reactions
CREATE POLICY "Users can view reactions"
  ON public.discussion_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON public.discussion_reactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments"
  ON public.discussion_attachments FOR SELECT
  USING (true);

CREATE POLICY "Users can upload attachments"
  ON public.discussion_attachments FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- RLS Policies for typing indicators
CREATE POLICY "Users can view typing indicators"
  ON public.discussion_typing FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own typing indicator"
  ON public.discussion_typing FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_threads_class ON public.discussion_threads(class_id);
CREATE INDEX idx_threads_lesson ON public.discussion_threads(lesson_id);
CREATE INDEX idx_threads_assignment ON public.discussion_threads(assignment_id);
CREATE INDEX idx_threads_last_activity ON public.discussion_threads(last_activity_at DESC);
CREATE INDEX idx_replies_thread ON public.discussion_replies(thread_id);
CREATE INDEX idx_replies_parent ON public.discussion_replies(parent_id);
CREATE INDEX idx_reactions_thread ON public.discussion_reactions(thread_id);
CREATE INDEX idx_reactions_reply ON public.discussion_reactions(reply_id);
CREATE INDEX idx_typing_thread ON public.discussion_typing(thread_id);

-- Create function to update last_activity_at on threads
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.discussion_threads
  SET last_activity_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update thread activity on new reply
CREATE TRIGGER update_thread_activity_on_reply
AFTER INSERT ON public.discussion_replies
FOR EACH ROW
EXECUTE FUNCTION update_thread_activity();

-- Enable realtime for all discussion tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_typing;