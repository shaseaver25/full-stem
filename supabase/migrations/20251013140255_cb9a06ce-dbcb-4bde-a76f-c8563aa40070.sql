-- Update the RPC function to accept and insert title, description, instructions, and rubric
CREATE OR REPLACE FUNCTION public.rpc_assign_lesson_to_class(
  p_class_id uuid,
  p_lesson_id uuid,
  p_component_ids uuid[],
  p_due_at timestamp with time zone,
  p_release_at timestamp with time zone DEFAULT NULL,
  p_options jsonb DEFAULT '{}'::jsonb,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_instructions text DEFAULT NULL,
  p_rubric text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  v_assignment_id uuid;
  v_title text;
BEGIN
  -- Use provided title or default to lesson title
  v_title := COALESCE(
    p_title,
    (SELECT title FROM lessons WHERE id = p_lesson_id LIMIT 1)
  );

  -- Create the assignment
  INSERT INTO public.class_assignments_new(
    class_id, 
    lesson_id, 
    title,
    description,
    instructions,
    rubric,
    selected_components, 
    due_at, 
    release_at, 
    options
  ) VALUES (
    p_class_id, 
    p_lesson_id,
    v_title,
    p_description,
    p_instructions,
    p_rubric,
    to_jsonb(p_component_ids), 
    p_due_at, 
    p_release_at, 
    p_options
  ) RETURNING id INTO v_assignment_id;

  -- Auto-create submissions for enrolled students
  INSERT INTO public.assignment_submissions(assignment_id, user_id, status)
  SELECT v_assignment_id, s.user_id, 'assigned'
  FROM public.class_students cs
  JOIN public.students s ON s.id = cs.student_id
  WHERE cs.class_id = p_class_id 
    AND cs.status = 'active' 
    AND s.user_id IS NOT NULL
  ON CONFLICT DO NOTHING;

  RETURN v_assignment_id; 
END;
$function$;