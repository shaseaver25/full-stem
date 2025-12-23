/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error formatting, classification, and logging
 * with Sentry-ready configuration for production monitoring.
 */

import * as Sentry from "@sentry/react";
import { env, isDev, isProd } from "./env";
import { parseSupabaseError, type ParsedError } from "./supabaseErrorHandler";

// ============================================================================
// Error Types & Classifications
// ============================================================================

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export type ErrorCategory = 
  | 'auth'
  | 'database' 
  | 'network'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'rate_limit'
  | 'storage'
  | 'api'
  | 'render'
  | 'unknown'
  | 'fatal';

export interface ErrorContext {
  page?: string;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface FormattedError {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  context: ErrorContext;
  originalError?: unknown;
  stack?: string;
  canRetry: boolean;
  retryAfter?: number;
}

// ============================================================================
// Error Detection Patterns
// ============================================================================

const ERROR_PATTERNS: Record<ErrorCategory, RegExp[]> = {
  // Network & Connection Errors
  network: [
    /failed to fetch/i,
    /network error/i,
    /net::err_/i,
    /connection refused/i,
    /connection reset/i,
    /cors/i,
  ],
  
  // Database & Supabase Errors
  timeout: [
    /connection timeout/i,
    /statement timeout/i,
    /canceling statement due to statement timeout/i,
    /connection terminated/i,
    /connection terminated due to connection timeout/i,
    /SUPABASE_INTERNAL_ERROR/i,
    /54[0-9]{3}/i, // PostgreSQL timeout error codes (54000-54999)
    /non_json_error_response/i,
    /unexpected token/i,
    /json parse error/i,
    /unexpected end of json/i,
    /is not valid json/i,
  ],
  
  // Auth Errors
  auth: [
    /jwt expired/i,
    /invalid token/i,
    /not authenticated/i,
    /session expired/i,
    /invalid refresh token/i,
    /_refreshAccessToken/i,
    /_callRefreshToken/i,
  ],
  
  // Rate Limiting
  rate_limit: [
    /rate limit/i,
    /too many requests/i,
    /429/i,
  ],
  
  // Permission Errors
  permission: [
    /permission denied/i,
    /row-level security/i,
    /rls/i,
    /forbidden/i,
    /unauthorized/i,
    /42501/i,
    /PGRST301/i,
  ],
  
  // Storage Errors
  storage: [
    /storage error/i,
    /bucket not found/i,
    /file not found/i,
    /upload failed/i,
  ],
  
  // Database errors
  database: [],
  
  // Validation errors
  validation: [
    /validation error/i,
    /invalid input/i,
  ],
  
  // API errors
  api: [
    /api error/i,
    /service unavailable/i,
  ],
  
  // Render errors (caught by error boundaries)
  render: [],
  
  // Unknown errors
  unknown: [],
  
  // Fatal errors
  fatal: [],
};

// ============================================================================
// Error Classification
// ============================================================================

function classifyError(error: unknown): { category: ErrorCategory; severity: ErrorSeverity } {
  const errorString = getErrorString(error);
  
  // Check each pattern category
  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(errorString)) {
        return {
          category: category as ErrorCategory,
          severity: getSeverityForCategory(category as ErrorCategory),
        };
      }
    }
  }
  
  // Check for Supabase-specific errors
  if (isSupabaseError(error)) {
    const parsed = parseSupabaseError(error);
    return {
      category: mapSupabaseCategory(parsed.errorType),
      severity: parsed.canRetry ? 'warning' : 'error',
    };
  }
  
  return { category: 'unknown', severity: 'error' };
}

function getSeverityForCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case 'timeout':
    case 'network':
    case 'rate_limit':
      return 'warning';
    case 'auth':
    case 'permission':
      return 'error';
    case 'fatal':
      return 'fatal';
    default:
      return 'error';
  }
}

function mapSupabaseCategory(type: ParsedError['errorType']): ErrorCategory {
  switch (type) {
    case 'network': return 'network';
    case 'permission': return 'permission';
    case 'validation':
    case 'constraint': return 'validation';
    default: return 'database';
  }
}

function isSupabaseError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error;
}

function getErrorString(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error);
  }
  return String(error);
}

// ============================================================================
// User-Friendly Messages
// ============================================================================

function getUserMessage(category: ErrorCategory, originalMessage: string): string {
  switch (category) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'timeout':
      return 'The request took too long to complete. Please try again in a moment.';
    case 'auth':
      return 'Your session has expired. Please sign in again to continue.';
    case 'permission':
      return "You don't have permission to perform this action.";
    case 'rate_limit':
      return "Too many requests. Please wait a moment before trying again.";
    case 'validation':
      return 'The data provided is invalid. Please check your input and try again.';
    case 'storage':
      return 'There was a problem with file storage. Please try again.';
    case 'database':
      return 'There was a problem saving your data. Please try again.';
    case 'api':
      return 'An external service is unavailable. Please try again later.';
    case 'render':
      return 'Something went wrong displaying this page. Please refresh.';
    default:
      return 'An unexpected error occurred. Please try again or contact support.';
  }
}

// ============================================================================
// Error Formatting
// ============================================================================

function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatError(
  error: unknown,
  context: ErrorContext = {}
): FormattedError {
  const { category, severity } = classifyError(error);
  const errorString = getErrorString(error);
  const message = error instanceof Error ? error.message : errorString;
  
  // Determine if retry is appropriate
  const canRetry = ['network', 'timeout', 'rate_limit'].includes(category);
  const retryAfter = category === 'rate_limit' ? 30000 : undefined;
  
  return {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    category,
    severity,
    message,
    userMessage: getUserMessage(category, message),
    context: {
      ...context,
      page: context.page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    },
    originalError: isDev ? error : undefined,
    stack: error instanceof Error ? error.stack : undefined,
    canRetry,
    retryAfter,
  };
}

// ============================================================================
// Console Error Aggregation
// ============================================================================

interface AggregatedError {
  count: number;
  firstSeen: string;
  lastSeen: string;
  error: FormattedError;
}

const errorAggregator = new Map<string, AggregatedError>();
const AGGREGATION_WINDOW_MS = 60000; // 1 minute

function getErrorKey(error: FormattedError): string {
  return `${error.category}:${error.message.slice(0, 100)}`;
}

export function aggregateError(error: FormattedError): AggregatedError {
  const key = getErrorKey(error);
  const existing = errorAggregator.get(key);
  
  if (existing) {
    existing.count++;
    existing.lastSeen = error.timestamp;
    return existing;
  }
  
  const aggregated: AggregatedError = {
    count: 1,
    firstSeen: error.timestamp,
    lastSeen: error.timestamp,
    error,
  };
  
  errorAggregator.set(key, aggregated);
  
  // Clean up old entries periodically
  setTimeout(() => {
    errorAggregator.delete(key);
  }, AGGREGATION_WINDOW_MS);
  
  return aggregated;
}

export function getAggregatedErrors(): AggregatedError[] {
  return Array.from(errorAggregator.values());
}

export function clearAggregatedErrors(): void {
  errorAggregator.clear();
}

// ============================================================================
// Centralized Error Logging
// ============================================================================

export function logError(
  error: unknown,
  context: ErrorContext = {}
): FormattedError {
  const formatted = formatError(error, context);
  const aggregated = aggregateError(formatted);
  
  // Console logging (development + first occurrence)
  if (isDev || aggregated.count === 1) {
    const logMethod = formatted.severity === 'fatal' ? console.error :
                      formatted.severity === 'error' ? console.error :
                      formatted.severity === 'warning' ? console.warn : console.log;
    
    logMethod(
      `[${formatted.category.toUpperCase()}] ${formatted.message}`,
      {
        id: formatted.id,
        context: formatted.context,
        canRetry: formatted.canRetry,
        ...(aggregated.count > 1 ? { occurrences: aggregated.count } : {}),
      }
    );
  }
  
  // Sentry logging (production)
  if (isProd && env.VITE_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setLevel(formatted.severity as Sentry.SeverityLevel);
      scope.setTag('error_category', formatted.category);
      scope.setTag('error_id', formatted.id);
      scope.setTag('can_retry', String(formatted.canRetry));
      
      if (formatted.context.page) {
        scope.setTag('page', formatted.context.page);
      }
      if (formatted.context.action) {
        scope.setTag('action', formatted.context.action);
      }
      if (formatted.context.component) {
        scope.setTag('component', formatted.context.component);
      }
      if (formatted.context.userId) {
        scope.setUser({ id: formatted.context.userId });
      }
      
      scope.setContext('error_details', {
        userMessage: formatted.userMessage,
        metadata: formatted.context.metadata,
        aggregationCount: aggregated.count,
      });
      
      Sentry.captureException(error);
    });
  }
  
  return formatted;
}

// ============================================================================
// Specialized Error Handlers
// ============================================================================

/**
 * Handle non-JSON response errors (common with proxy/CDN issues)
 */
export function handleNonJsonError(
  response: Response | unknown,
  context: ErrorContext = {}
): FormattedError {
  const error = new Error(
    `Non-JSON error response: ${response instanceof Response ? response.status : 'unknown status'}`
  );
  return logError(error, { ...context, action: 'non_json_response' });
}

/**
 * Handle database timeout errors
 */
export function handleDatabaseTimeout(
  error: unknown,
  context: ErrorContext = {}
): FormattedError {
  return logError(error, { 
    ...context, 
    action: 'database_timeout',
    metadata: { 
      ...context.metadata,
      errorType: 'timeout',
    },
  });
}

/**
 * Handle auth token refresh errors
 */
export function handleAuthError(
  error: unknown,
  context: ErrorContext = {}
): FormattedError {
  return logError(error, { ...context, action: 'auth_failure' });
}

// ============================================================================
// Error Boundary Helper
// ============================================================================

export function captureRenderError(
  error: Error,
  errorInfo: React.ErrorInfo,
  context: ErrorContext = {}
): FormattedError {
  return logError(error, {
    ...context,
    action: 'render_error',
    metadata: {
      ...context.metadata,
      componentStack: errorInfo.componentStack,
    },
  });
}

// ============================================================================
// Re-exports for backwards compatibility
// ============================================================================

export { setErrorUser, clearErrorUser, addBreadcrumb } from './errorLogging';
