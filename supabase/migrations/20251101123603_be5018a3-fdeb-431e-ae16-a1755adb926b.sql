-- Add performance indexes for conference polling with 600+ concurrent users
-- These indexes will dramatically speed up queries under load

-- Index for poll responses lookup by poll and user
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_user 
ON poll_responses(poll_component_id, user_id);

-- Index for poll responses count queries
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_id 
ON poll_responses(poll_component_id);

-- Index for lesson components by lesson
CREATE INDEX IF NOT EXISTS idx_lesson_components_lesson 
ON lesson_components(lesson_id);

-- Index for poll options by poll component
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_component 
ON poll_options(poll_component_id);

-- Add composite index for faster anonymous poll lookups
CREATE INDEX IF NOT EXISTS idx_poll_responses_anonymous 
ON poll_responses(poll_component_id, is_anonymous) 
WHERE is_anonymous = true;

-- Analyze tables to update query planner statistics
ANALYZE poll_responses;
ANALYZE lesson_components;
ANALYZE poll_options;
ANALYZE poll_components;