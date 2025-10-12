-- Remove only the problematic policies on classes
DROP POLICY IF EXISTS "teacher_owns_class" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their own classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view their enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Developers read-only: classes" ON public.classes;
DROP POLICY IF EXISTS "Block developer writes: classes" ON public.classes;