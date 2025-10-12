-- Create unified activity_log table for organization-wide tracking
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('student', 'teacher', 'admin', 'super_admin', 'developer')),
  admin_type text,
  organization_name text,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_role ON public.activity_log(role);
CREATE INDEX idx_activity_log_organization ON public.activity_log(organization_name);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Students see their own activity
CREATE POLICY "Students see own activity"
ON public.activity_log
FOR SELECT
USING (
  auth.uid() = user_id
  AND role = 'student'
);

-- Policy: Teachers see their students' activity
CREATE POLICY "Teachers see their students activity"
ON public.activity_log
FOR SELECT
USING (
  role IN ('student', 'teacher')
  AND (
    -- Teachers can see their own activity
    auth.uid() = user_id
    OR
    -- Teachers can see their students' activity
    (
      role = 'student'
      AND EXISTS (
        SELECT 1 
        FROM public.class_students cs
        JOIN public.students s ON s.id = cs.student_id
        JOIN public.classes c ON c.id = cs.class_id
        JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
        WHERE s.user_id = activity_log.user_id
        AND tp.user_id = auth.uid()
      )
    )
  )
);

-- Policy: Admins see organization activity
CREATE POLICY "Admins see organization activity"
ON public.activity_log
FOR SELECT
USING (
  -- Admins can see all activity in their organization
  organization_name IN (
    SELECT ap.organization_name 
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
    AND ap.organization_name IS NOT NULL
  )
  OR
  -- Super admins and developers see everything
  has_role(auth.uid(), 'super_admin'::app_role)
  OR
  has_role(auth.uid(), 'developer'::app_role)
);

-- Policy: All authenticated users can insert their own activity
CREATE POLICY "Users can insert own activity"
ON public.activity_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Migrate existing admin_activity_log data to activity_log
INSERT INTO public.activity_log (user_id, role, admin_type, organization_name, action, details, created_at)
SELECT 
  user_id,
  'admin' as role,
  admin_type,
  organization_name,
  action,
  details,
  created_at
FROM public.admin_activity_log
ON CONFLICT DO NOTHING;