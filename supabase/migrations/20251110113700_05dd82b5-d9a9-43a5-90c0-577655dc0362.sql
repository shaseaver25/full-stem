-- Drop existing admin policy and create a new one for developers/admins
DROP POLICY IF EXISTS "Admins can view all AI logs" ON ai_usage_logs;

-- Create policy for developers to view all AI logs (including those with null user_ids)
CREATE POLICY "Developers can view all AI logs"
ON ai_usage_logs
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('developer', 'admin', 'system_admin', 'super_admin')
  )
);