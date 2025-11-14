-- Create teacher_analysis_reviews table to track teacher actions on AI analyses
CREATE TABLE IF NOT EXISTS public.teacher_analysis_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.submission_analyses(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('accepted', 'modified', 'override_score', 'notes_added')),
  changes_made JSONB,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.teacher_analysis_reviews ENABLE ROW LEVEL SECURITY;

-- Teachers can insert their own reviews
CREATE POLICY "Teachers can insert their reviews"
  ON public.teacher_analysis_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_user_id);

-- Teachers can view their own reviews
CREATE POLICY "Teachers can view their reviews"
  ON public.teacher_analysis_reviews
  FOR SELECT
  USING (auth.uid() = teacher_user_id);

-- Teachers can view reviews for submissions in their classes
CREATE POLICY "Teachers can view class reviews"
  ON public.teacher_analysis_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submission_analyses sa
      JOIN assignment_submissions asub ON asub.id = sa.submission_id
      JOIN class_assignments_new ca ON ca.id = asub.assignment_id
      JOIN classes c ON c.id = ca.class_id
      JOIN teacher_profiles tp ON tp.id = c.teacher_id
      WHERE sa.id = teacher_analysis_reviews.analysis_id
        AND tp.user_id = auth.uid()
    )
  );

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.teacher_analysis_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'developer')
    )
  );

-- Create index for faster queries
CREATE INDEX idx_teacher_analysis_reviews_analysis ON public.teacher_analysis_reviews(analysis_id);
CREATE INDEX idx_teacher_analysis_reviews_teacher ON public.teacher_analysis_reviews(teacher_user_id);
CREATE INDEX idx_teacher_analysis_reviews_action ON public.teacher_analysis_reviews(action_type);

-- Create updated_at trigger
CREATE TRIGGER update_teacher_analysis_reviews_updated_at
  BEFORE UPDATE ON public.teacher_analysis_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add teacher_reviewed and teacher_modified columns to submission_analyses if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submission_analyses' 
    AND column_name = 'teacher_reviewed'
  ) THEN
    ALTER TABLE public.submission_analyses 
    ADD COLUMN teacher_reviewed BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'submission_analyses' 
    AND column_name = 'teacher_modified'
  ) THEN
    ALTER TABLE public.submission_analyses 
    ADD COLUMN teacher_modified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;