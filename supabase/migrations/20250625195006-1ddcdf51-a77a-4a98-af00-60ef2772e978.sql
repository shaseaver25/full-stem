
-- Create grade categories table
CREATE TABLE public.grade_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default grade categories
INSERT INTO public.grade_categories (name, weight, color) VALUES
('Lessons', 70.00, '#10B981'),
('Assignments', 20.00, '#F59E0B'),
('Participation', 10.00, '#8B5CF6');

-- Create grades table with correct table reference
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id INTEGER REFERENCES public."Lessons"("Lesson ID"),
  assignment_id UUID REFERENCES public.assignments(id),
  category_id UUID REFERENCES public.grade_categories(id) NOT NULL,
  points_earned DECIMAL(8,2),
  points_possible DECIMAL(8,2) NOT NULL,
  percentage DECIMAL(5,2),
  letter_grade TEXT,
  comments TEXT,
  graded_by UUID NOT NULL,
  graded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100),
  CONSTRAINT valid_points CHECK (points_earned >= 0 AND points_possible > 0),
  CONSTRAINT grade_source_check CHECK (
    (lesson_id IS NOT NULL AND assignment_id IS NULL) OR
    (lesson_id IS NULL AND assignment_id IS NOT NULL)
  )
);

-- Create gradebook summary table for calculated grades
CREATE TABLE public.gradebook_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  course_track TEXT NOT NULL DEFAULT 'Excel',
  overall_percentage DECIMAL(5,2),
  overall_letter_grade TEXT,
  category_grades JSONB,
  last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_track)
);

-- Enable RLS on all tables
ALTER TABLE public.grade_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gradebook_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for grade_categories (read-only for teachers)
CREATE POLICY "Teachers can view grade categories" 
  ON public.grade_categories 
  FOR SELECT 
  TO authenticated
  USING (true);

-- RLS policies for grades (teachers can manage grades for their students)
CREATE POLICY "Teachers can view all grades" 
  ON public.grades 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert grades" 
  ON public.grades 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = graded_by);

CREATE POLICY "Teachers can update grades they created" 
  ON public.grades 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = graded_by);

-- RLS policies for gradebook_summary
CREATE POLICY "Teachers can view gradebook summary" 
  ON public.gradebook_summary 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "System can manage gradebook summary" 
  ON public.gradebook_summary 
  FOR ALL 
  TO authenticated
  USING (true);

-- Create function to calculate letter grade from percentage
CREATE OR REPLACE FUNCTION public.calculate_letter_grade(percentage DECIMAL)
RETURNS TEXT AS $$
BEGIN
  IF percentage >= 97 THEN RETURN 'A+';
  ELSIF percentage >= 93 THEN RETURN 'A';
  ELSIF percentage >= 90 THEN RETURN 'A-';
  ELSIF percentage >= 87 THEN RETURN 'B+';
  ELSIF percentage >= 83 THEN RETURN 'B';
  ELSIF percentage >= 80 THEN RETURN 'B-';
  ELSIF percentage >= 77 THEN RETURN 'C+';
  ELSIF percentage >= 73 THEN RETURN 'C';
  ELSIF percentage >= 70 THEN RETURN 'C-';
  ELSIF percentage >= 67 THEN RETURN 'D+';
  ELSIF percentage >= 63 THEN RETURN 'D';
  ELSIF percentage >= 60 THEN RETURN 'D-';
  ELSE RETURN 'F';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate percentage and letter grade
CREATE OR REPLACE FUNCTION public.calculate_grade_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate percentage
  IF NEW.points_earned IS NOT NULL THEN
    NEW.percentage = (NEW.points_earned / NEW.points_possible) * 100;
  END IF;
  
  -- Calculate letter grade
  IF NEW.percentage IS NOT NULL THEN
    NEW.letter_grade = public.calculate_letter_grade(NEW.percentage);
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_metrics_trigger
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_grade_metrics();
