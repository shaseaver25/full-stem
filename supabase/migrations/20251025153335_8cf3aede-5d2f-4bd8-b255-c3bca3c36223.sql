-- Create onedrive_attachments table for storing OneDrive file metadata
CREATE TABLE public.onedrive_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_component_id UUID REFERENCES public.lesson_components(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  web_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onedrive_attachments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_onedrive_attachments_lesson_component ON public.onedrive_attachments(lesson_component_id);
CREATE INDEX idx_onedrive_attachments_owner ON public.onedrive_attachments(owner_id);

-- Teachers can manage their own OneDrive attachments
CREATE POLICY "Teachers can manage their own onedrive attachments"
ON public.onedrive_attachments
FOR ALL
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM lesson_components lc
    JOIN lessons l ON l.id = lc.lesson_id
    JOIN classes c ON c.id = l.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE lc.id = onedrive_attachments.lesson_component_id
      AND tp.user_id = auth.uid()
  )
)
WITH CHECK (owner_id = auth.uid());

-- Students can view OneDrive attachments in their enrolled classes
CREATE POLICY "Students can view onedrive attachments in their classes"
ON public.onedrive_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM lesson_components lc
    JOIN lessons l ON l.id = lc.lesson_id
    JOIN classes c ON c.id = l.class_id
    JOIN class_students cs ON cs.class_id = c.id
    JOIN students s ON s.id = cs.student_id
    WHERE lc.id = onedrive_attachments.lesson_component_id
      AND s.user_id = auth.uid()
      AND cs.status = 'active'
  )
);

-- Admins can view all OneDrive attachments
CREATE POLICY "Admins can view all onedrive attachments"
ON public.onedrive_attachments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onedrive_attachments_updated_at
BEFORE UPDATE ON public.onedrive_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();