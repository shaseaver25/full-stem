-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_type TEXT,
  organization_name TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_activity_log
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins view their own organization's activity
CREATE POLICY "Admins view own org activity"
ON public.admin_activity_log
FOR SELECT
USING (
  organization_name IN (
    SELECT organization_name FROM public.admin_profiles WHERE user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'developer'::app_role)
);

-- Policy: Admins can insert their own activity
CREATE POLICY "Admins insert own activity"
ON public.admin_activity_log
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Create global search function
CREATE OR REPLACE FUNCTION public.global_search(
  search_query TEXT,
  user_role TEXT DEFAULT NULL,
  org_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  type TEXT,
  name TEXT,
  id UUID,
  route TEXT,
  metadata JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Search classes (teachers and admins)
  IF user_role IN ('teacher', 'admin', 'super_admin', 'developer') THEN
    RETURN QUERY
    SELECT 
      'class'::TEXT,
      c.name::TEXT,
      c.id,
      ('/classes/' || c.id)::TEXT,
      jsonb_build_object(
        'description', c.description,
        'status', c.status
      )
    FROM public.classes c
    WHERE c.name ILIKE '%' || search_query || '%'
      AND (
        user_role IN ('super_admin', 'developer')
        OR c.teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
      )
    LIMIT 10;
  END IF;

  -- Search lessons (all authenticated users)
  RETURN QUERY
  SELECT 
    'lesson'::TEXT,
    l.title::TEXT,
    l.id,
    ('/lesson/' || l.id)::TEXT,
    jsonb_build_object(
      'description', l.description,
      'duration', l.duration
    )
  FROM public.lessons l
  WHERE l.title ILIKE '%' || search_query || '%'
  LIMIT 10;

  -- Search content library (teachers and admins)
  IF user_role IN ('teacher', 'admin', 'super_admin', 'developer') THEN
    RETURN QUERY
    SELECT 
      'content'::TEXT,
      cl.title::TEXT,
      cl.id,
      ('/content')::TEXT,
      jsonb_build_object(
        'content_type', cl.content_type,
        'subject', cl.subject
      )
    FROM public.content_library cl
    WHERE cl.title ILIKE '%' || search_query || '%'
      AND cl.is_published = true
    LIMIT 10;
  END IF;

  -- Search students (teachers viewing their own students)
  IF user_role IN ('teacher', 'super_admin', 'developer') THEN
    RETURN QUERY
    SELECT 
      'student'::TEXT,
      (s.first_name || ' ' || s.last_name)::TEXT,
      s.id,
      ('/teacher/students')::TEXT,
      jsonb_build_object(
        'grade_level', s.grade_level,
        'email', p.email
      )
    FROM public.students s
    LEFT JOIN public.profiles p ON p.id = s.user_id
    WHERE (s.first_name ILIKE '%' || search_query || '%' 
           OR s.last_name ILIKE '%' || search_query || '%')
      AND (
        user_role IN ('super_admin', 'developer')
        OR EXISTS (
          SELECT 1 FROM public.class_students cs
          JOIN public.classes c ON c.id = cs.class_id
          WHERE cs.student_id = s.id
            AND c.teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid())
        )
      )
    LIMIT 10;
  END IF;
END;
$$;