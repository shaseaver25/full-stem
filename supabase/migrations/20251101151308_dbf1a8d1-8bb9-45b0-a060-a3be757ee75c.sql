-- Add text response support to poll_responses table
ALTER TABLE poll_responses 
ADD COLUMN IF NOT EXISTS response_text TEXT;