-- Create rubrics table
CREATE TABLE IF NOT EXISTS public.rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignment_id uuid REFERENCES public.class_assignments_new(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create rubric_criteria table
CREATE TABLE IF NOT EXISTS public.rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id uuid NOT NULL REFERENCES public.rubrics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  max_points integer NOT NULL DEFAULT 4,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rubrics_assignment_id ON public.rubrics(assignment_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_created_by ON public.rubrics(created_by);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_id ON public.rubric_criteria(rubric_id);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_order ON public.rubric_criteria(rubric_id, order_index);

-- Enable RLS
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rubrics
CREATE POLICY "Teachers can manage their rubrics"
  ON public.rubrics
  FOR ALL
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.class_assignments_new a
      JOIN public.classes c ON c.id = a.class_id
      JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
      WHERE a.id = rubrics.assignment_id
      AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view rubrics for their assignments"
  ON public.rubrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments_new a
      JOIN public.class_students cs ON cs.class_id = a.class_id
      JOIN public.students s ON s.id = cs.student_id
      WHERE a.id = rubrics.assignment_id
      AND s.user_id = auth.uid()
      AND cs.status = 'active'
    )
  );

CREATE POLICY "Developers can read rubrics"
  ON public.rubrics
  FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

-- RLS Policies for rubric_criteria
CREATE POLICY "Teachers can manage rubric criteria"
  ON public.rubric_criteria
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rubrics r
      WHERE r.id = rubric_criteria.rubric_id
      AND (
        r.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.class_assignments_new a
          JOIN public.classes c ON c.id = a.class_id
          JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
          WHERE a.id = r.assignment_id
          AND tp.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can view rubric criteria"
  ON public.rubric_criteria
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rubrics r
      JOIN public.class_assignments_new a ON a.id = r.assignment_id
      JOIN public.class_students cs ON cs.class_id = a.class_id
      JOIN public.students s ON s.id = cs.student_id
      WHERE r.id = rubric_criteria.rubric_id
      AND s.user_id = auth.uid()
      AND cs.status = 'active'
    )
  );

CREATE POLICY "Developers can read rubric criteria"
  ON public.rubric_criteria
  FOR SELECT
  USING (has_role(auth.uid(), 'developer'::app_role));

-- Add trigger to update rubrics updated_at
CREATE TRIGGER update_rubrics_updated_at
  BEFORE UPDATE ON public.rubrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rubric_criteria_updated_at
  BEFORE UPDATE ON public.rubric_criteria
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();