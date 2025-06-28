
-- Create rubrics table
CREATE TABLE public.rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_points NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rubric criteria table
CREATE TABLE public.rubric_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rubric_id UUID NOT NULL REFERENCES public.rubrics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_points NUMERIC NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rubric grades table to store individual criterion scores
CREATE TABLE public.rubric_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  criterion_id UUID NOT NULL REFERENCES public.rubric_criteria(id) ON DELETE CASCADE,
  points_earned NUMERIC NOT NULL DEFAULT 0,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(submission_id, criterion_id)
);

-- Enable RLS on all rubric tables
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_grades ENABLE ROW LEVEL SECURITY;

-- Create policies for rubrics (teachers can manage rubrics for their assignments)
CREATE POLICY "Teachers can view rubrics for their assignments" 
  ON public.rubrics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create rubrics for their assignments" 
  ON public.rubrics 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update rubrics for their assignments" 
  ON public.rubrics 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
    )
  );

-- Create policies for rubric criteria
CREATE POLICY "Teachers can view criteria for their rubrics" 
  ON public.rubric_criteria 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.rubrics r
      JOIN public.assignments a ON r.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE r.id = rubric_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create criteria for their rubrics" 
  ON public.rubric_criteria 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rubrics r
      JOIN public.assignments a ON r.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE r.id = rubric_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update criteria for their rubrics" 
  ON public.rubric_criteria 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.rubrics r
      JOIN public.assignments a ON r.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE r.id = rubric_id AND c.teacher_id = auth.uid()
    )
  );

-- Create policies for rubric grades
CREATE POLICY "Teachers can view rubric grades for their assignments" 
  ON public.rubric_grades 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignment_submissions sub
      JOIN public.assignments a ON sub.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE sub.id = submission_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create rubric grades for their assignments" 
  ON public.rubric_grades 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignment_submissions sub
      JOIN public.assignments a ON sub.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE sub.id = submission_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update rubric grades for their assignments" 
  ON public.rubric_grades 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignment_submissions sub
      JOIN public.assignments a ON sub.assignment_id = a.id
      JOIN public.classes c ON a.lesson_id IN (
        SELECT ca.lesson_id FROM public.class_assignments ca WHERE ca.class_id = c.id
      )
      WHERE sub.id = submission_id AND c.teacher_id = auth.uid()
    )
  );

-- Add trigger to update rubric total_points when criteria change
CREATE OR REPLACE FUNCTION update_rubric_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rubrics 
  SET total_points = (
    SELECT COALESCE(SUM(max_points), 0) 
    FROM public.rubric_criteria 
    WHERE rubric_id = COALESCE(NEW.rubric_id, OLD.rubric_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.rubric_id, OLD.rubric_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rubric_total_points
  AFTER INSERT OR UPDATE OR DELETE ON public.rubric_criteria
  FOR EACH ROW EXECUTE FUNCTION update_rubric_total_points();
