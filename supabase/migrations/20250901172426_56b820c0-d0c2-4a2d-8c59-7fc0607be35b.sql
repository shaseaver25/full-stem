-- Create survey responses table
CREATE TABLE survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  answer_value JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student profiles table
CREATE TABLE student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE,
  profile_json JSONB NOT NULL DEFAULT '{}',
  survey_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for survey_responses
CREATE POLICY "Students can manage their own survey responses" 
ON survey_responses 
FOR ALL 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their students' survey responses" 
ON survey_responses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM students s
  JOIN classes c ON s.class_id = c.id
  JOIN teacher_profiles tp ON c.teacher_id = tp.id
  WHERE s.id = survey_responses.student_id AND tp.user_id = auth.uid()
));

-- Create policies for student_profiles
CREATE POLICY "Students can manage their own profile" 
ON student_profiles 
FOR ALL 
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their students' profiles" 
ON student_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM students s
  JOIN classes c ON s.class_id = c.id
  JOIN teacher_profiles tp ON c.teacher_id = tp.id
  WHERE s.id = student_profiles.student_id AND tp.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_survey_responses_student_id ON survey_responses(student_id);
CREATE INDEX idx_survey_responses_question_id ON survey_responses(question_id);
CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON survey_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();