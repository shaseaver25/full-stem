-- Fix infinite recursion in students table RLS policies
-- Drop problematic and duplicate policies

-- Drop the policy using wrong column (id instead of user_id)
DROP POLICY IF EXISTS "Students can view their own profile" ON public.students;

-- Drop overly complex policy that causes recursion
DROP POLICY IF EXISTS "Students and teachers can view student data" ON public.students;

-- Drop too broad policy
DROP POLICY IF EXISTS "Teachers view students" ON public.students;

-- Drop unnecessary demo-specific policy
DROP POLICY IF EXISTS "Teachers can view demo students" ON public.students;

-- Ensure we have clean, non-recursive policies
-- These should already exist but we'll recreate them to be sure

-- 1. Students can read their own data (simple, non-recursive)
DROP POLICY IF EXISTS "student_reads_self" ON public.students;
CREATE POLICY "student_reads_self" 
ON public.students 
FOR SELECT 
USING (user_id = auth.uid());

-- 2. Teachers can read students in their classes
DROP POLICY IF EXISTS "teacher_reads_roster" ON public.students;
CREATE POLICY "teacher_reads_roster" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
    AND tp.user_id = auth.uid()
  )
);

-- 3. Teachers can manage students in their classes (already exists, verify it's correct)
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON public.students;
CREATE POLICY "Teachers can manage students in their classes" 
ON public.students 
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.class_students cs
    JOIN public.classes c ON c.id = cs.class_id
    JOIN public.teacher_profiles tp ON tp.id = c.teacher_id
    WHERE cs.student_id = students.id
    AND tp.user_id = auth.uid()
  )
);

-- 4. Parents can view their children
DROP POLICY IF EXISTS "Parents can view their children data" ON public.students;
CREATE POLICY "Parents can view their children data" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.student_parent_relationships spr
    JOIN public.parent_profiles pp ON pp.id = spr.parent_id
    WHERE spr.student_id = students.id
    AND pp.user_id = auth.uid()
  )
);