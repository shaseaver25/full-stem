-- Add dark_mode column to accessibility_settings table
ALTER TABLE accessibility_settings 
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;