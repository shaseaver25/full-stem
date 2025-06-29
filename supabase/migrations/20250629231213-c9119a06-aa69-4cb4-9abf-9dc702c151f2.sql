
-- Create table for published assignments that can be assigned to classes
CREATE TABLE public.published_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_assignment_id UUID REFERENCES public.class_assignments_new(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  lesson_id BIGINT REFERENCES public."Lessons"("Lesson ID") ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  file_types_allowed TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
  max_files INTEGER DEFAULT 5,
  allow_text_response BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for class-wide messages and announcements
CREATE TABLE public.class_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'announcement' CHECK (message_type IN ('announcement', 'general', 'urgent')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for direct teacher-student messages
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL, -- Can be teacher or student user_id
  recipient_id UUID NOT NULL, -- Can be teacher or student user_id
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for message recipients (for tracking who has read class messages)
CREATE TABLE public.message_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.class_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.published_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;

-- Create policies for published_assignments
CREATE POLICY "Teachers can manage published assignments for their classes" ON public.published_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = published_assignments.class_id 
      AND classes.teacher_id = (
        SELECT teacher_profiles.id FROM public.teacher_profiles 
        WHERE teacher_profiles.user_id = auth.uid()
      )
    )
  );

-- Students can view published assignments for their enrolled classes
CREATE POLICY "Students can view published assignments" ON public.published_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.class_id = published_assignments.class_id
      AND students.id = auth.uid()
    )
  );

-- Create policies for class_messages
CREATE POLICY "Teachers can manage messages for their classes" ON public.class_messages
  FOR ALL USING (
    teacher_id = (
      SELECT teacher_profiles.id FROM public.teacher_profiles 
      WHERE teacher_profiles.user_id = auth.uid()
    )
  );

-- Students can view messages for their enrolled classes
CREATE POLICY "Students can view class messages" ON public.class_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.class_id = class_messages.class_id
      AND students.id = auth.uid()
    )
  );

-- Create policies for direct_messages
CREATE POLICY "Users can view their own direct messages" ON public.direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.direct_messages
  FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Create policies for message_recipients
CREATE POLICY "Users can manage their message receipt status" ON public.message_recipients
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_published_assignments_class_id ON public.published_assignments(class_id);
CREATE INDEX idx_published_assignments_lesson_id ON public.published_assignments(lesson_id);
CREATE INDEX idx_class_messages_class_id ON public.class_messages(class_id);
CREATE INDEX idx_class_messages_teacher_id ON public.class_messages(teacher_id);
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_class_id ON public.direct_messages(class_id);
CREATE INDEX idx_message_recipients_message_id ON public.message_recipients(message_id);
CREATE INDEX idx_message_recipients_user_id ON public.message_recipients(user_id);
