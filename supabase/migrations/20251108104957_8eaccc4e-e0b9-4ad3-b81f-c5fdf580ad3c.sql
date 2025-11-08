-- Enhancement #1: Quiz Question Bank Tables
CREATE TABLE quiz_question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'multiple_select')),
  image_url TEXT,
  hint TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_question_bank_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_question_bank(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  option_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for question bank
ALTER TABLE quiz_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_bank_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own question bank"
  ON quiz_question_bank FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their question bank"
  ON quiz_question_bank FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their question bank"
  ON quiz_question_bank FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their question bank"
  ON quiz_question_bank FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view options for their questions"
  ON quiz_question_bank_options FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quiz_question_bank 
    WHERE id = question_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert options for their questions"
  ON quiz_question_bank_options FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM quiz_question_bank 
    WHERE id = question_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update options for their questions"
  ON quiz_question_bank_options FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM quiz_question_bank 
    WHERE id = question_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete options for their questions"
  ON quiz_question_bank_options FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM quiz_question_bank 
    WHERE id = question_id AND user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_question_bank_user ON quiz_question_bank(user_id);
CREATE INDEX idx_question_bank_tags ON quiz_question_bank USING GIN(tags);
CREATE INDEX idx_question_bank_type ON quiz_question_bank(question_type);
CREATE INDEX idx_question_bank_difficulty ON quiz_question_bank(difficulty);

-- Enhancement #2: Word Cloud Polls
ALTER TABLE poll_components 
  DROP CONSTRAINT IF EXISTS poll_components_poll_type_check;

ALTER TABLE poll_components 
  ADD CONSTRAINT poll_components_poll_type_check 
  CHECK (poll_type IN ('single_choice', 'multiple_choice', 'rating_scale', 'ranking', 'word_cloud'));

-- Add text_response column for word cloud polls
ALTER TABLE poll_responses 
  ADD COLUMN IF NOT EXISTS text_response TEXT;

-- Enhancement #4: Quiz Images Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload quiz images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quiz-images');

CREATE POLICY "Authenticated users can view quiz images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'quiz-images');

CREATE POLICY "Users can update their own quiz images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'quiz-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own quiz images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'quiz-images' AND owner = auth.uid());

CREATE POLICY "Public can view quiz images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'quiz-images');