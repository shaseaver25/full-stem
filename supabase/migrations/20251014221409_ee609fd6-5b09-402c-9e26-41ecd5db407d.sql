-- Add RLS policy to allow users to read their own roles
CREATE POLICY "Users can read their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);