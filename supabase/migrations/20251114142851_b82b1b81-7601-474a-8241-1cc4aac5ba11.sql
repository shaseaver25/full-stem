-- Create student_submissions table
CREATE TABLE IF NOT EXISTS public.student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'analyzing', 'analyzed', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create submission_analyses table
CREATE TABLE IF NOT EXISTS public.submission_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.student_submissions(id) ON DELETE CASCADE,
  rubric_id UUID,
  rubric_scores JSONB DEFAULT '{}'::jsonb,
  overall_mastery TEXT CHECK (overall_mastery IN ('emerging', 'developing', 'proficient', 'advanced')),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  strengths JSONB DEFAULT '[]'::jsonb,
  areas_for_growth JSONB DEFAULT '[]'::jsonb,
  misconceptions JSONB DEFAULT '[]'::jsonb,
  personalized_feedback TEXT,
  recommended_action TEXT,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_used TEXT,
  raw_model_output JSONB DEFAULT '{}'::jsonb,
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_modified BOOLEAN DEFAULT FALSE,
  teacher_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create content_embeddings table
CREATE TABLE IF NOT EXISTS public.content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('assignment', 'lesson', 'rubric', 'quiz', 'exemplar', 'resource')),
  content_id UUID NOT NULL,
  pinecone_id TEXT NOT NULL UNIQUE,
  embedded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_content_embedding UNIQUE (content_type, content_id)
);

-- Enable RLS
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_submissions
CREATE POLICY "Students can insert their own submissions"
  ON public.student_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own submissions"
  ON public.student_submissions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions"
  ON public.student_submissions FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view submissions for their assignments"
  ON public.student_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments_new ca
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE ca.id = student_submissions.assignment_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update submission status"
  ON public.student_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments_new ca
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE ca.id = student_submissions.assignment_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can view all submissions"
  ON public.student_submissions FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

-- RLS Policies for submission_analyses
CREATE POLICY "Students can view analyses of their submissions"
  ON public.submission_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_submissions ss
      WHERE ss.id = submission_analyses.submission_id
      AND ss.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view analyses for their class submissions"
  ON public.submission_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_submissions ss
      JOIN public.class_assignments_new ca ON ss.assignment_id = ca.id
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE ss.id = submission_analyses.submission_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update analyses for their class submissions"
  ON public.submission_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.student_submissions ss
      JOIN public.class_assignments_new ca ON ss.assignment_id = ca.id
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE ss.id = submission_analyses.submission_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analyses"
  ON public.submission_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analyses"
  ON public.submission_analyses FOR UPDATE
  USING (true);

CREATE POLICY "Developers can view all analyses"
  ON public.submission_analyses FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

-- RLS Policies for content_embeddings
CREATE POLICY "Teachers can view embeddings for their content"
  ON public.content_embeddings FOR SELECT
  USING (
    (content_type = 'assignment' AND EXISTS (
      SELECT 1 FROM public.class_assignments_new ca
      JOIN public.classes c ON ca.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE ca.id = content_embeddings.content_id
      AND tp.user_id = auth.uid()
    ))
    OR
    (content_type = 'lesson' AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.classes c ON l.class_id = c.id
      JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
      WHERE l.id = content_embeddings.content_id
      AND tp.user_id = auth.uid()
    ))
  );

CREATE POLICY "System can manage embeddings"
  ON public.content_embeddings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Developers can view all embeddings"
  ON public.content_embeddings FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

-- Create indexes for performance
CREATE INDEX idx_student_submissions_student_id ON public.student_submissions(student_id);
CREATE INDEX idx_student_submissions_assignment_id ON public.student_submissions(assignment_id);
CREATE INDEX idx_student_submissions_status ON public.student_submissions(status);
CREATE INDEX idx_student_submissions_submitted_at ON public.student_submissions(submitted_at DESC);

CREATE INDEX idx_submission_analyses_submission_id ON public.submission_analyses(submission_id);
CREATE INDEX idx_submission_analyses_overall_mastery ON public.submission_analyses(overall_mastery);
CREATE INDEX idx_submission_analyses_teacher_reviewed ON public.submission_analyses(teacher_reviewed);
CREATE INDEX idx_submission_analyses_analyzed_at ON public.submission_analyses(analyzed_at DESC);

CREATE INDEX idx_content_embeddings_content_type_id ON public.content_embeddings(content_type, content_id);
CREATE INDEX idx_content_embeddings_pinecone_id ON public.content_embeddings(pinecone_id);
CREATE INDEX idx_content_embeddings_embedded_at ON public.content_embeddings(embedded_at DESC);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_student_submissions_updated_at
  BEFORE UPDATE ON public.student_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submission_analyses_updated_at
  BEFORE UPDATE ON public.submission_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();