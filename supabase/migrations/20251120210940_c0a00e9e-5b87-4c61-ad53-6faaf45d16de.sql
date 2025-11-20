-- Add hint analytics columns to pivot_conversations
ALTER TABLE pivot_conversations
ADD COLUMN IF NOT EXISTS hints_requested INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS solved_after_hint BOOLEAN;

-- Create function to update hint analytics
CREATE OR REPLACE FUNCTION update_hint_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation when hint is used
  IF NEW.was_used = true THEN
    UPDATE pivot_conversations
    SET hints_requested = hints_requested + 1,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS hint_analytics_trigger ON pivot_hints;
CREATE TRIGGER hint_analytics_trigger
  AFTER INSERT OR UPDATE ON pivot_hints
  FOR EACH ROW
  EXECUTE FUNCTION update_hint_analytics();