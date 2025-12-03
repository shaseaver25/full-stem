-- Create proctoring_events table to log integrity events
CREATE TABLE public.proctoring_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_attempt_id UUID REFERENCES public.class_assessment_submissions(id) ON DELETE CASCADE,
  assignment_submission_id UUID REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- At least one reference must be set
  CONSTRAINT proctoring_events_has_reference CHECK (
    quiz_attempt_id IS NOT NULL OR assignment_submission_id IS NOT NULL
  )
);

-- Add proctoring settings to class_assessments
ALTER TABLE public.class_assessments
ADD COLUMN IF NOT EXISTS proctoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proctoring_strictness TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS max_violations INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS auto_submit_on_violations BOOLEAN DEFAULT false;

-- Add integrity score to submissions
ALTER TABLE public.class_assessment_submissions
ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS integrity_reviewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS integrity_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS integrity_reviewed_by UUID REFERENCES public.profiles(id);

-- Enable RLS
ALTER TABLE public.proctoring_events ENABLE ROW LEVEL SECURITY;

-- Students can insert their own proctoring events
CREATE POLICY "Students can insert proctoring events for their submissions"
ON public.proctoring_events
FOR INSERT
WITH CHECK (
  (quiz_attempt_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.class_assessment_submissions s
    WHERE s.id = quiz_attempt_id AND s.student_id = auth.uid()
  ))
  OR
  (assignment_submission_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.assignment_submissions s
    WHERE s.id = assignment_submission_id AND s.user_id = auth.uid()
  ))
);

-- Students can view their own proctoring events
CREATE POLICY "Students can view their own proctoring events"
ON public.proctoring_events
FOR SELECT
USING (
  (quiz_attempt_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.class_assessment_submissions s
    WHERE s.id = quiz_attempt_id AND s.student_id = auth.uid()
  ))
  OR
  (assignment_submission_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.assignment_submissions s
    WHERE s.id = assignment_submission_id AND s.user_id = auth.uid()
  ))
);

-- Teachers can view proctoring events for their classes
CREATE POLICY "Teachers can view proctoring events for their classes"
ON public.proctoring_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.class_assessment_submissions s
    JOIN public.class_assessments a ON a.id = s.assessment_id
    JOIN public.classes c ON c.id = a.class_id
    LEFT JOIN public.class_teachers ct ON ct.class_id = c.id
    WHERE s.id = quiz_attempt_id
    AND (c.teacher_id = (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
         OR ct.teacher_id = (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()))
  )
  OR
  EXISTS (
    SELECT 1 FROM public.assignment_submissions s
    JOIN public.class_assignments_new a ON a.id = s.assignment_id
    JOIN public.classes c ON c.id = a.class_id
    LEFT JOIN public.class_teachers ct ON ct.class_id = c.id
    WHERE s.id = assignment_submission_id
    AND (c.teacher_id = (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
         OR ct.teacher_id = (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()))
  )
);

-- Index for performance
CREATE INDEX idx_proctoring_events_quiz_attempt ON public.proctoring_events(quiz_attempt_id);
CREATE INDEX idx_proctoring_events_assignment ON public.proctoring_events(assignment_submission_id);
CREATE INDEX idx_proctoring_events_timestamp ON public.proctoring_events(timestamp);