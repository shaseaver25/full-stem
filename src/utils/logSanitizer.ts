/**
 * Whitelist of safe keys that can be logged
 * These keys should never contain PII
 */
const SAFE_KEYS = [
  'assignment_id',
  'class_id',
  'role_from',
  'role_to',
  'route',
  'action',
  'timestamp',
  'lesson_id',
  'course_id',
  'component_id',
  'status',
  'duration',
  'success',
] as const;

/**
 * Hash a value using SHA-256 for correlation without exposing PII
 * Uses Web Crypto API for browser compatibility
 */
export const hashValue = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Sanitize an object by removing any keys that aren't in the whitelist
 * and hashing any user/student IDs
 */
export const sanitizeLogData = async (data: Record<string, any>): Promise<Record<string, any>> => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip if key is not in whitelist
    if (!SAFE_KEYS.includes(key as any)) {
      // Hash user/student IDs for correlation
      if (key === 'user_id' || key === 'student_id') {
        sanitized[`${key}_hash`] = typeof value === 'string' ? await hashValue(value) : null;
      }
      continue;
    }

    // Skip arrays and nested objects that might contain PII
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      continue;
    }

    // Only add primitive values
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitize an array of actions performed during impersonation
 */
export const sanitizeActionsArray = (actions: any[]): any[] => {
  if (!Array.isArray(actions)) {
    return [];
  }

  // Note: Since sanitizeLogData is now async, we need to handle this synchronously
  // For now, we'll just filter to safe fields without hashing
  return actions.map(action => {
    if (typeof action === 'object' && action !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(action)) {
        if (SAFE_KEYS.includes(key as any) && 
            (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    return null;
  }).filter(Boolean);
};

/**
 * Check if a log entry contains common PII patterns
 * Used for validation before inserting into database
 */
export const containsPII = (data: any): boolean => {
  if (!data) return false;
  
  const str = JSON.stringify(data).toLowerCase();
  
  // Check for common PII patterns
  const piiPatterns = [
    /email/,
    /first_name/,
    /last_name/,
    /phone/,
    /address/,
    /ssn/,
    /@\w+\.\w+/, // Email pattern
    /\d{3}-\d{2}-\d{4}/, // SSN pattern
  ];

  return piiPatterns.some(pattern => pattern.test(str));
};

/**
 * Sanitize metadata for activity logging (synchronous version)
 */
export const sanitizeActivityMetadata = (metadata: Record<string, any>): Record<string, any> => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  // Warn if PII detected
  if (containsPII(metadata)) {
    console.warn('⚠️ PII detected in activity log metadata, sanitizing...');
  }

  // Synchronous sanitization without hashing
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SAFE_KEYS.includes(key as any) && 
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Create a safe log entry for impersonation
 */
export const createSafeImpersonationLog = (params: {
  roleFrom: string;
  roleTo: string;
  route?: string;
  action?: string;
  classId?: string;
}): Record<string, any> => {
  return {
    role_from: params.roleFrom,
    role_to: params.roleTo,
    route: params.route || '',
    action: params.action || 'navigate',
    timestamp: new Date().toISOString(),
    ...(params.classId && { class_id: params.classId }),
  };
};
