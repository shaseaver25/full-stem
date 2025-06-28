
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for teachers to insert notifications for their students
CREATE POLICY "Teachers can create notifications for their students" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.classes c ON s.class_id = c.id
      WHERE s.id::text = user_id::text AND c.teacher_id = auth.uid()
    )
  );

-- Add index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create function to send grade notification
CREATE OR REPLACE FUNCTION send_grade_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_user_id UUID;
  assignment_title TEXT;
  grade_value NUMERIC;
BEGIN
  -- Get student user ID and assignment details
  SELECT 
    sub.user_id,
    a.title,
    NEW.grade
  INTO 
    student_user_id,
    assignment_title,
    grade_value
  FROM public.assignment_submissions sub
  JOIN public.assignments a ON sub.assignment_id = a.id
  WHERE sub.id = NEW.submission_id;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    metadata
  ) VALUES (
    student_user_id,
    'Assignment Graded',
    'Your assignment "' || assignment_title || '" has been graded. You received a score of ' || grade_value || '.',
    'grade',
    jsonb_build_object(
      'assignment_title', assignment_title,
      'grade', grade_value,
      'submission_id', NEW.submission_id,
      'assignment_id', (SELECT assignment_id FROM public.assignment_submissions WHERE id = NEW.submission_id)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new grades
CREATE TRIGGER trigger_send_grade_notification
  AFTER INSERT ON public.assignment_grades
  FOR EACH ROW EXECUTE FUNCTION send_grade_notification();

-- Create trigger for updated grades
CREATE TRIGGER trigger_send_grade_update_notification
  AFTER UPDATE ON public.assignment_grades
  FOR EACH ROW 
  WHEN (OLD.grade IS DISTINCT FROM NEW.grade OR OLD.feedback IS DISTINCT FROM NEW.feedback)
  EXECUTE FUNCTION send_grade_notification();
