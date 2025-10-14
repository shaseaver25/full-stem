-- Create table for Google Drive file attachments
CREATE TABLE IF NOT EXISTS public.drive_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_component_id UUID REFERENCES public.lesson_components(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  web_view_link TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX idx_drive_attachments_component ON public.drive_attachments(lesson_component_id);
CREATE INDEX idx_drive_attachments_owner ON public.drive_attachments(owner_id);

-- Enable RLS
ALTER TABLE public.drive_attachments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own Drive attachments
CREATE POLICY "Teachers can manage their own drive attachments"
  ON public.drive_attachments
  FOR ALL
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.lesson_components lc
      JOIN public.lessons l ON l.id = lc.lesson_id
      JOIN public.classes c ON c.id = l.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE lc.id = drive_attachments.lesson_component_id
        AND tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
  );

-- Students can view drive attachments in their enrolled classes
CREATE POLICY "Students can view drive attachments in their classes"
  ON public.drive_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lesson_components lc
      JOIN public.lessons l ON l.id = lc.lesson_id
      JOIN public.classes c ON c.id = l.class_id
      JOIN public.class_students cs ON cs.class_id = c.id
      JOIN public.students s ON s.id = cs.student_id
      WHERE lc.id = drive_attachments.lesson_component_id
        AND s.user_id = auth.uid()
        AND cs.status = 'active'
    )
  );

-- Admins and developers can view all attachments
CREATE POLICY "Admins can view all drive attachments"
  ON public.drive_attachments
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'developer'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_drive_attachments_updated_at
  BEFORE UPDATE ON public.drive_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();