
-- First create the app_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Enable RLS on user_roles if not already enabled
DO $$ BEGIN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create has_role function if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Now create the remaining tables
CREATE TABLE public.content_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_type text NOT NULL DEFAULT 'document',
  file_url text,
  thumbnail_url text,
  metadata jsonb DEFAULT '{}',
  tags text[],
  subject text,
  grade_level text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_published boolean DEFAULT false,
  version_number integer DEFAULT 1
);

CREATE TABLE public.content_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id uuid REFERENCES public.content_library(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  changes_summary text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.parent_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  preferred_contact_method text DEFAULT 'email',
  emergency_contact boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.student_parent_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.parent_profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL DEFAULT 'parent',
  can_view_grades boolean DEFAULT true,
  can_view_attendance boolean DEFAULT true,
  can_receive_communications boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

CREATE TABLE public.parent_teacher_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id uuid REFERENCES public.parent_profiles(id) NOT NULL,
  teacher_id uuid REFERENCES public.teacher_profiles(id) NOT NULL,
  student_id uuid REFERENCES public.students(id) NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  sender_type text NOT NULL,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TYPE public.permission_type AS ENUM (
  'read_users', 'write_users', 'delete_users',
  'read_classes', 'write_classes', 'delete_classes',
  'read_content', 'write_content', 'delete_content',
  'read_grades', 'write_grades', 'delete_grades',
  'read_analytics', 'write_analytics',
  'system_admin', 'backup_data', 'manage_permissions'
);

CREATE TABLE public.user_role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission permission_type NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

CREATE TABLE public.backup_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  file_path text,
  file_size bigint,
  started_by uuid REFERENCES auth.users(id) NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  error_message text,
  metadata jsonb DEFAULT '{}'
);

CREATE TABLE public.performance_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Teachers can manage their content" ON public.content_library
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Published content is readable by authenticated users" ON public.content_library
  FOR SELECT USING (is_published = true);

CREATE POLICY "Parents can view and edit their own profile" ON public.parent_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Parents can view their student relationships" ON public.student_parent_relationships
  FOR SELECT USING (
    parent_id IN (SELECT id FROM public.parent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents and teachers can view their messages" ON public.parent_teacher_messages
  FOR SELECT USING (
    (parent_id IN (SELECT id FROM public.parent_profiles WHERE user_id = auth.uid())) OR
    (teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Parents and teachers can create messages" ON public.parent_teacher_messages
  FOR INSERT WITH CHECK (
    (parent_id IN (SELECT id FROM public.parent_profiles WHERE user_id = auth.uid()) AND sender_type = 'parent') OR
    (teacher_id IN (SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()) AND sender_type = 'teacher')
  );

CREATE POLICY "Admins only for role permissions" ON public.user_role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins only for backup logs" ON public.backup_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins only for performance metrics" ON public.performance_metrics
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default role permissions
INSERT INTO public.user_role_permissions (role, permission) VALUES
  ('admin', 'read_users'), ('admin', 'write_users'), ('admin', 'delete_users'),
  ('admin', 'read_classes'), ('admin', 'write_classes'), ('admin', 'delete_classes'),
  ('admin', 'read_content'), ('admin', 'write_content'), ('admin', 'delete_content'),
  ('admin', 'read_grades'), ('admin', 'write_grades'), ('admin', 'delete_grades'),
  ('admin', 'read_analytics'), ('admin', 'write_analytics'),
  ('admin', 'system_admin'), ('admin', 'backup_data'), ('admin', 'manage_permissions'),
  ('moderator', 'read_users'), ('moderator', 'read_classes'), ('moderator', 'write_classes'),
  ('moderator', 'read_content'), ('moderator', 'write_content'),
  ('moderator', 'read_grades'), ('moderator', 'write_grades'),
  ('moderator', 'read_analytics'),
  ('user', 'read_content'), ('user', 'read_grades');

-- Function to check user permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission permission_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.user_role_permissions urp ON ur.role = urp.role
    WHERE ur.user_id = _user_id
      AND urp.permission = _permission
  )
$$;

-- Function to create content version
CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.title != NEW.title OR OLD.description != NEW.description OR OLD.file_url != NEW.file_url) THEN
    INSERT INTO public.content_versions (
      content_id, version_number, title, description, file_url, 
      changes_summary, created_by
    ) VALUES (
      NEW.id, NEW.version_number, NEW.title, NEW.description, NEW.file_url,
      'Content updated', NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for content versioning
CREATE TRIGGER content_versioning_trigger
  AFTER UPDATE ON public.content_library
  FOR EACH ROW EXECUTE FUNCTION public.create_content_version();
