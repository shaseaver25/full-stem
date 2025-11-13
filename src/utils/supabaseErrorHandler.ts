import { PostgrestError } from '@supabase/supabase-js';

export interface ParsedError {
  title: string;
  description: string;
  canRetry: boolean;
  errorType: 'validation' | 'constraint' | 'network' | 'permission' | 'unknown';
  technicalDetails?: string;
}

export function parseSupabaseError(error: any): ParsedError {
  // Network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      canRetry: true,
      errorType: 'network',
      technicalDetails: error.message,
    };
  }

  // PostgrestError (database errors)
  if (error.code) {
    // Check constraint violations (like component_type)
    if (error.code === '23514' || error.message?.includes('check constraint')) {
      const constraintMatch = error.message?.match(/violates check constraint "([^"]+)"/);
      const constraintName = constraintMatch?.[1];
      
      if (constraintName?.includes('component_type')) {
        return {
          title: 'Invalid Component Type',
          description: 'One or more components have an invalid type. Please remove or fix invalid components and try again.',
          canRetry: false,
          errorType: 'constraint',
          technicalDetails: error.message,
        };
      }
      
      return {
        title: 'Validation Error',
        description: 'The data you\'re trying to save doesn\'t meet the database requirements. Please review your content.',
        canRetry: false,
        errorType: 'constraint',
        technicalDetails: error.message,
      };
    }

    // Foreign key violations
    if (error.code === '23503') {
      return {
        title: 'Reference Error',
        description: 'This lesson references data that no longer exists (e.g., deleted class). Please refresh and try again.',
        canRetry: false,
        errorType: 'constraint',
        technicalDetails: error.message,
      };
    }

    // Not null violations
    if (error.code === '23502') {
      const columnMatch = error.message?.match(/column "([^"]+)"/);
      const columnName = columnMatch?.[1];
      return {
        title: 'Missing Required Data',
        description: `Required field "${columnName || 'unknown'}" is missing. Please fill in all required fields.`,
        canRetry: false,
        errorType: 'validation',
        technicalDetails: error.message,
      };
    }

    // Permission denied
    if (error.code === '42501' || error.code === 'PGRST301') {
      return {
        title: 'Permission Denied',
        description: 'You don\'t have permission to save this lesson. Please contact your administrator.',
        canRetry: false,
        errorType: 'permission',
        technicalDetails: error.message,
      };
    }
  }

  // Row Level Security policy violations
  if (error.message?.includes('row-level security')) {
    return {
      title: 'Security Policy Violation',
      description: 'Unable to save due to security restrictions. Ensure you\'re logged in and have the correct permissions.',
      canRetry: true,
      errorType: 'permission',
      technicalDetails: error.message,
    };
  }

  // Generic/unknown errors
  return {
    title: 'Unexpected Error',
    description: 'Something went wrong while saving. Please try again or contact support if the issue persists.',
    canRetry: true,
    errorType: 'unknown',
    technicalDetails: error.message || 'No error message provided',
  };
}

/**
 * Helper to determine if an operation should be retried based on error type
 */
export function shouldRetryError(error: any): boolean {
  const parsed = parseSupabaseError(error);
  return parsed.canRetry && ['network', 'unknown'].includes(parsed.errorType);
}
