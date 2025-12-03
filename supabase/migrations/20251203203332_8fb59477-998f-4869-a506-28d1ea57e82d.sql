-- Update all accessibility_settings to enable translation for users with non-English preferred language
UPDATE accessibility_settings 
SET translation_enabled = true, updated_at = now()
WHERE preferred_language IS NOT NULL 
  AND preferred_language != 'en';

-- Also update User Preferences table to enable translation view for non-English users
UPDATE "User Preferences"
SET "Enable Translation View" = true
WHERE "Preferred Language" IS NOT NULL 
  AND "Preferred Language" NOT IN ('English', 'en');