/**
 * Feature flags for the application
 * 
 * To re-enable cloud storage integrations:
 * 1. Set ENABLE_CLOUD_ATTACHMENTS to true
 * 2. Uncomment the Drive/OneDrive imports and code in LessonComponentCard.tsx
 * 3. Update UI to show all three options: Google Drive, OneDrive, and Upload File
 */

export const FEATURE_FLAGS = {
  // Temporarily disabled while cloud integrations are being stabilized
  ENABLE_CLOUD_ATTACHMENTS: false,
  
  // Local file uploads via Supabase Storage (always enabled as fallback)
  ENABLE_LOCAL_UPLOADS: true,
} as const;
