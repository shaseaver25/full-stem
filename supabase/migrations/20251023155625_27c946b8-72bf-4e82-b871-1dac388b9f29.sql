-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';

-- Create index for faster role lookups
CREATE INDEX idx_profiles_role ON profiles(role);

-- Migrate existing roles from user_roles to profiles (taking highest priority role)
UPDATE profiles p
SET role = CASE
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'developer') THEN 'developer'
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'super_admin') THEN 'super_admin'
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'system_admin') THEN 'system_admin'
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'admin') THEN 'admin'
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'teacher') THEN 'teacher'
  WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id AND role = 'parent') THEN 'parent'
  ELSE 'student'
END
WHERE EXISTS (SELECT 1 FROM user_roles WHERE user_id = p.id);

-- Add check constraint to ensure valid roles
ALTER TABLE profiles ADD CONSTRAINT valid_role 
CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'super_admin', 'system_admin', 'developer'));

-- Create RLS policy for profiles role access
CREATE POLICY "Users can view their own role" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile (not role)" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Note: Keep user_roles table for now as backup, but new system uses profiles.role