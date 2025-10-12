import { supabase } from '@/integrations/supabase/client';
import { sanitizeActivityMetadata } from './logSanitizer';

export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin' | 'system_admin' | 'developer';

interface LogActivityParams {
  userId: string;
  role: UserRole;
  action: string;
  details?: Record<string, any>;
  adminType?: string;
  organizationName?: string;
}

/**
 * Unified activity logger for all user roles
 * Tracks actions across students, teachers, and admins
 * All metadata is sanitized to remove PII before logging
 */
export const logUserAction = async ({
  userId,
  role,
  action,
  details = {},
  adminType,
  organizationName,
}: LogActivityParams): Promise<void> => {
  try {
    // Sanitize metadata to remove any PII
    const sanitizedDetails = sanitizeActivityMetadata(details);
    
    const { error } = await supabase.from('activity_log').insert({
      user_id: userId,
      role,
      action,
      details: sanitizedDetails,
      admin_type: adminType || null,
      organization_name: organizationName || null,
    });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Common action types for consistency
export const ActivityActions = {
  // Student actions
  STUDENT: {
    SUBMIT_ASSIGNMENT: 'Submitted Assignment',
    COMPLETE_LESSON: 'Completed Lesson',
    JOIN_CLASS: 'Joined Class',
    UPDATE_PROFILE: 'Updated Profile',
    VIEW_GRADES: 'Viewed Grades',
    START_LESSON: 'Started Lesson',
  },
  // Teacher actions
  TEACHER: {
    CREATE_CLASS: 'Created Class',
    GRADE_ASSIGNMENT: 'Graded Assignment',
    PROVIDE_FEEDBACK: 'Provided Feedback',
    UPLOAD_CONTENT: 'Uploaded Content',
    CREATE_ASSIGNMENT: 'Created Assignment',
    UPDATE_CLASS: 'Updated Class',
    ENROLL_STUDENT: 'Enrolled Student',
  },
  // Admin actions
  ADMIN: {
    CREATE_COURSE: 'Created Course',
    UPDATE_ROLE: 'Updated Role',
    CHANGE_SETTINGS: 'Changed Settings',
    MANAGE_USER: 'Managed User',
    PUBLISH_CLASS: 'Published Class',
    CREATE_BACKUP: 'Created Backup',
  },
  // System Admin actions
  SYSTEM_ADMIN: {
    TRIGGER_BACKUP: 'Triggered Database Backup',
    SYNC_CACHE: 'Synced Content Cache',
    MANAGE_API_KEYS: 'Managed API Keys',
    VIEW_AUDIT_LOG: 'Viewed Audit Log',
    SYSTEM_CONFIG: 'Updated System Configuration',
  },
} as const;
