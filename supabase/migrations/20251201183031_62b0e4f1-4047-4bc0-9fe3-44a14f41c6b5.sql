-- Create class_assessments table
CREATE TABLE class_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  total_points INTEGER DEFAULT 100,
  time_limit_minutes INTEGER,
  due_date TIMESTAMPTZ,
  allow_multiple_attempts BOOLEAN DEFAULT false,
  show_correct_answers BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  benchmark_document_url TEXT,
  benchmark_document_name TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE class_assessments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage assessments in their classes
CREATE POLICY "Teachers can manage class assessments"
ON class_assessments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM classes c
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE c.id = class_assessments.class_id
    AND tp.user_id = auth.uid()
  )
);

-- Students can view published assessments in their enrolled classes
CREATE POLICY "Students can view published class assessments"
ON class_assessments FOR SELECT
USING (
  published = true
  AND EXISTS (
    SELECT 1 FROM class_students cs
    JOIN students s ON s.id = cs.student_id
    WHERE cs.class_id = class_assessments.class_id
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  )
);

-- Developers can view all
CREATE POLICY "Developers can view all assessments"
ON class_assessments FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create class_assessment_questions table
CREATE TABLE class_assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES class_assessments(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  question_text TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  display_order INTEGER NOT NULL,
  options JSONB,
  correct_answer TEXT,
  rubric TEXT,
  max_length INTEGER,
  source_lesson_id UUID REFERENCES lessons(id),
  ai_generated BOOLEAN DEFAULT false,
  from_benchmark BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE class_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Teachers can manage questions for their assessments
CREATE POLICY "Teachers can manage assessment questions"
ON class_assessment_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM class_assessments ca
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE ca.id = class_assessment_questions.assessment_id
    AND tp.user_id = auth.uid()
  )
);

-- Students can view questions for published assessments
CREATE POLICY "Students can view assessment questions"
ON class_assessment_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM class_assessments ca
    JOIN class_students cs ON cs.class_id = ca.class_id
    JOIN students s ON s.id = cs.student_id
    WHERE ca.id = class_assessment_questions.assessment_id
    AND ca.published = true
    AND s.user_id = auth.uid()
    AND cs.status = 'active'
  )
);

-- Developers can view all
CREATE POLICY "Developers can view all questions"
ON class_assessment_questions FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create class_assessment_submissions table
CREATE TABLE class_assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES class_assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  score NUMERIC(5,2),
  max_score INTEGER,
  auto_graded BOOLEAN DEFAULT false,
  needs_manual_grading BOOLEAN DEFAULT false,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id, attempt_number)
);

-- Enable RLS
ALTER TABLE class_assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can manage their own submissions
CREATE POLICY "Students can manage own assessment submissions"
ON class_assessment_submissions FOR ALL
USING (student_id = auth.uid());

-- Teachers can view/grade submissions for their classes
CREATE POLICY "Teachers can manage class assessment submissions"
ON class_assessment_submissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM class_assessments ca
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE ca.id = class_assessment_submissions.assessment_id
    AND tp.user_id = auth.uid()
  )
);

-- Developers can view all
CREATE POLICY "Developers can view all submissions"
ON class_assessment_submissions FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));

-- Create class_assessment_answers table
CREATE TABLE class_assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES class_assessment_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES class_assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  selected_option_id TEXT,
  is_correct BOOLEAN,
  points_earned NUMERIC(5,2),
  points_possible INTEGER,
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- Enable RLS
ALTER TABLE class_assessment_answers ENABLE ROW LEVEL SECURITY;

-- Students can manage their own answers
CREATE POLICY "Students can manage own assessment answers"
ON class_assessment_answers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM class_assessment_submissions
    WHERE class_assessment_submissions.id = class_assessment_answers.submission_id
    AND class_assessment_submissions.student_id = auth.uid()
  )
);

-- Teachers can view/grade answers
CREATE POLICY "Teachers can manage assessment answers"
ON class_assessment_answers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM class_assessment_submissions sub
    JOIN class_assessments ca ON ca.id = sub.assessment_id
    JOIN classes c ON c.id = ca.class_id
    JOIN teacher_profiles tp ON tp.id = c.teacher_id
    WHERE sub.id = class_assessment_answers.submission_id
    AND tp.user_id = auth.uid()
  )
);

-- Developers can view all
CREATE POLICY "Developers can view all answers"
ON class_assessment_answers FOR SELECT
USING (has_role(auth.uid(), 'developer'::app_role));