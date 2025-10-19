-- Create AI lesson history table for tracking usage and costs
CREATE TABLE IF NOT EXISTS public.ai_lesson_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  model_provider text DEFAULT 'openai' NOT NULL,
  model_name text,
  input_tokens int,
  output_tokens int,
  estimated_cost numeric(10,4),
  prompt_preview text,
  response_preview text,
  created_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.ai_lesson_history ENABLE ROW LEVEL SECURITY;

-- Admins and developers can view all AI usage
CREATE POLICY "Admins and developers can view all AI usage"
  ON public.ai_lesson_history
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'developer'::app_role)
  );

-- Users can view their own AI usage
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_lesson_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert AI usage logs
CREATE POLICY "System can insert AI usage logs"
  ON public.ai_lesson_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_ai_lesson_history_user_id ON public.ai_lesson_history(user_id);
CREATE INDEX idx_ai_lesson_history_created_at ON public.ai_lesson_history(created_at DESC);
CREATE INDEX idx_ai_lesson_history_provider ON public.ai_lesson_history(model_provider);