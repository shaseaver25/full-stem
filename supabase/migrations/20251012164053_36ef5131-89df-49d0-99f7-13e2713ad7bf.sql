-- =====================================================
-- DEVELOPER ACCESS LOCKDOWN - READ-ONLY PRODUCTION (FIXED)
-- =====================================================

-- =====================================================
-- STEP 1: Drop ALL existing developer policies (clean slate)
-- =====================================================

DO $$ 
BEGIN
  -- Students policies
  DROP POLICY IF EXISTS "Developers can manage students" ON students;
  DROP POLICY IF EXISTS "Developers cannot insert students" ON students;
  DROP POLICY IF EXISTS "Developers cannot update students" ON students;
  DROP POLICY IF EXISTS "Developers cannot delete students" ON students;
  DROP POLICY IF EXISTS "Developers can view students (read-only)" ON students;

  -- Grades policies
  DROP POLICY IF EXISTS "Developers can manage grades" ON grades;
  DROP POLICY IF EXISTS "Developers cannot insert grades" ON grades;
  DROP POLICY IF EXISTS "Developers cannot update grades" ON grades;
  DROP POLICY IF EXISTS "Developers cannot delete grades" ON grades;
  DROP POLICY IF EXISTS "Developers can view grades (read-only)" ON grades;

  -- Teacher profiles policies
  DROP POLICY IF EXISTS "Developers can manage teacher profiles" ON teacher_profiles;
  DROP POLICY IF EXISTS "Developers cannot insert teacher profiles" ON teacher_profiles;
  DROP POLICY IF EXISTS "Developers cannot update teacher profiles" ON teacher_profiles;
  DROP POLICY IF EXISTS "Developers cannot delete teacher profiles" ON teacher_profiles;
  DROP POLICY IF EXISTS "Developers can view teacher profiles (read-only)" ON teacher_profiles;

  -- Parent profiles policies
  DROP POLICY IF EXISTS "Developers can manage parent profiles" ON parent_profiles;
  DROP POLICY IF EXISTS "Developers cannot insert parent profiles" ON parent_profiles;
  DROP POLICY IF EXISTS "Developers cannot update parent profiles" ON parent_profiles;
  DROP POLICY IF EXISTS "Developers cannot delete parent profiles" ON parent_profiles;
  DROP POLICY IF EXISTS "Developers can view parent profiles (read-only)" ON parent_profiles;

  -- Classes policies
  DROP POLICY IF EXISTS "Developers can manage classes" ON classes;
  DROP POLICY IF EXISTS "Developers cannot insert classes" ON classes;
  DROP POLICY IF EXISTS "Developers cannot update classes" ON classes;
  DROP POLICY IF EXISTS "Developers cannot delete classes" ON classes;
  DROP POLICY IF EXISTS "Developers can view classes (read-only)" ON classes;

  -- Assignment submissions policies
  DROP POLICY IF EXISTS "Developers can manage assignment submissions" ON assignment_submissions;
  DROP POLICY IF EXISTS "Developers cannot insert submissions" ON assignment_submissions;
  DROP POLICY IF EXISTS "Developers cannot update submissions" ON assignment_submissions;
  DROP POLICY IF EXISTS "Developers cannot delete submissions" ON assignment_submissions;
END $$;

-- =====================================================
-- STEP 2: Create read-only SELECT policies
-- =====================================================

CREATE POLICY "Developers read-only: students"
ON students FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: grades"
ON grades FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: teacher_profiles"
ON teacher_profiles FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: parent_profiles"
ON parent_profiles FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: classes"
ON classes FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: lessons"
ON lessons FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: activities"
ON activities FOR SELECT
USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers read-only: lesson_components"
ON lesson_components FOR SELECT
USING (has_role(auth.uid(), 'developer'));

-- =====================================================
-- STEP 3: Block writes on production tables
-- =====================================================

CREATE POLICY "Block developer writes: students"
ON students FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

CREATE POLICY "Block developer writes: grades"
ON grades FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

CREATE POLICY "Block developer writes: teacher_profiles"
ON teacher_profiles FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

CREATE POLICY "Block developer writes: parent_profiles"
ON parent_profiles FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

CREATE POLICY "Block developer writes: classes"
ON classes FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

CREATE POLICY "Block developer writes: assignment_submissions"
ON assignment_submissions FOR ALL
USING (NOT has_role(auth.uid(), 'developer'))
WITH CHECK (NOT has_role(auth.uid(), 'developer'));

-- =====================================================
-- STEP 4: Create sandbox tables
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dev_sandbox_students (
  LIKE public.students INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.dev_sandbox_grades (
  LIKE public.grades INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.dev_sandbox_classes (
  LIKE public.classes INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.dev_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  operation TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  environment TEXT DEFAULT 'development',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dev_sandbox_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_sandbox_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_sandbox_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Allow full access to sandbox tables
-- =====================================================

CREATE POLICY "Developers full access: sandbox_students"
ON dev_sandbox_students FOR ALL
USING (has_role(auth.uid(), 'developer'))
WITH CHECK (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers full access: sandbox_grades"
ON dev_sandbox_grades FOR ALL
USING (has_role(auth.uid(), 'developer'))
WITH CHECK (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers full access: sandbox_classes"
ON dev_sandbox_classes FOR ALL
USING (has_role(auth.uid(), 'developer'))
WITH CHECK (has_role(auth.uid(), 'developer'));

CREATE POLICY "Developers manage: activity_log"
ON dev_activity_log FOR ALL
USING (has_role(auth.uid(), 'developer'))
WITH CHECK (has_role(auth.uid(), 'developer'));

-- =====================================================
-- STEP 6: Helper functions
-- =====================================================

CREATE OR REPLACE FUNCTION public.seed_dev_sandbox_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'developer') THEN
    RAISE EXCEPTION 'Only developers can seed sandbox data';
  END IF;

  DELETE FROM dev_sandbox_grades;
  DELETE FROM dev_sandbox_students;
  DELETE FROM dev_sandbox_classes;

  INSERT INTO dev_sandbox_students 
  SELECT * FROM students WHERE is_demo = true LIMIT 10;

  INSERT INTO dev_sandbox_classes
  SELECT * FROM classes WHERE published = true LIMIT 5;

  INSERT INTO dev_activity_log (developer_id, action, metadata)
  VALUES (auth.uid(), 'Seeded sandbox data', jsonb_build_object('timestamp', now()));
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_dev_sandbox()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'developer') THEN
    RAISE EXCEPTION 'Only developers can reset sandbox';
  END IF;

  TRUNCATE TABLE dev_sandbox_grades CASCADE;
  TRUNCATE TABLE dev_sandbox_students CASCADE;
  TRUNCATE TABLE dev_sandbox_classes CASCADE;

  INSERT INTO dev_activity_log (developer_id, action, metadata)
  VALUES (auth.uid(), 'Reset sandbox', jsonb_build_object('timestamp', now()));
END;
$$;