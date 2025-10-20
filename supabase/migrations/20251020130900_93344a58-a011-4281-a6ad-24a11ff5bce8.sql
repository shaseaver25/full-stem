-- Create class_weekly_digests table
CREATE TABLE public.class_weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}',
  variant TEXT NOT NULL CHECK (variant IN ('teacher', 'student', 'parent')),
  teacher_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  sent_to_parents BOOLEAN DEFAULT FALSE,
  posted_to_feed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, week_start, variant)
);

-- Enable RLS
ALTER TABLE public.class_weekly_digests ENABLE ROW LEVEL SECURITY;

-- Teachers can manage digests for their classes
CREATE POLICY "Teachers can manage their class digests"
ON public.class_weekly_digests
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_weekly_digests.class_id
    AND tp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_weekly_digests.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Students can view student-variant digests for their classes
CREATE POLICY "Students can view student digests"
ON public.class_weekly_digests
FOR SELECT
USING (
  variant = 'student' 
  AND EXISTS (
    SELECT 1 
    FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = class_weekly_digests.class_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  )
);

-- Create indices
CREATE INDEX idx_class_digests_class_week ON public.class_weekly_digests(class_id, week_start, variant);
CREATE INDEX idx_class_digests_created ON public.class_weekly_digests(created_at);

-- Create trigger
CREATE TRIGGER update_class_weekly_digests_updated_at
BEFORE UPDATE ON public.class_weekly_digests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();