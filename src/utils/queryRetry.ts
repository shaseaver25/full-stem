/**
 * Query Retry Utility with Exponential Backoff
 * 
 * Provides retry logic for async operations with configurable backoff,
 * timeout handling, and integration with the error handling system.
 */

import { formatError, type ErrorCategory, type FormattedError } from './error';

// ============================================================================
// Configuration Types
// ============================================================================

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Initial delay in ms before first retry (default: 500) */
  initialDelay: number;
  /** Maximum delay in ms between retries (default: 5000) */
  maxDelay: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier: number;
  /** Timeout for each attempt in ms (default: 10000) */
  timeout: number;
  /** Jitter factor to randomize delays (0-1, default: 0.1) */
  jitterFactor: number;
}

export interface RetryState {
  attempt: number;
  totalAttempts: number;
  lastError: FormattedError | null;
  isRetrying: boolean;
  nextRetryIn: number | null;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: FormattedError;
  attempts: number;
  totalTime: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 2,
  timeout: 10000,
  jitterFactor: 0.1,
};

// Preset configurations for different scenarios
export const RETRY_PRESETS = {
  /** For critical auth operations */
  auth: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 2,
    timeout: 8000,
  },
  /** For dashboard data queries */
  query: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 3,
    timeout: 15000,
  },
  /** For background operations */
  background: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 10000,
    timeout: 30000,
  },
  /** For quick operations */
  quick: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 2,
    initialDelay: 250,
    maxDelay: 2000,
    timeout: 5000,
  },
} as const;

// ============================================================================
// Retryable Error Detection
// ============================================================================

/** Error categories that should trigger automatic retry */
const RETRYABLE_CATEGORIES: ErrorCategory[] = [
  'network',
  'timeout',
  'rate_limit',
];

/** Error categories that should fail immediately (no retry) */
const PERMANENT_ERROR_CATEGORIES: ErrorCategory[] = [
  'auth',
  'permission',
  'validation',
];

export function isRetryableError(error: FormattedError): boolean {
  return RETRYABLE_CATEGORIES.includes(error.category);
}

export function isPermanentError(error: FormattedError): boolean {
  return PERMANENT_ERROR_CATEGORIES.includes(error.category);
}

// ============================================================================
// Backoff Calculation
// ============================================================================

/**
 * Calculate delay with exponential backoff and jitter
 */
export function calculateBackoff(
  attempt: number,
  config: RetryConfig
): number {
  const { initialDelay, maxDelay, backoffMultiplier, jitterFactor } = config;
  
  // Exponential backoff: delay = initial * (multiplier ^ attempt)
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);
  
  return Math.max(0, Math.round(cappedDelay + jitter));
}

// ============================================================================
// Timeout Wrapper
// ============================================================================

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Operation timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  fallback?: () => T
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (fallback) {
        try {
          resolve(fallback());
        } catch (e) {
          reject(new TimeoutError(timeout));
        }
      } else {
        reject(new TimeoutError(timeout));
      }
    }, timeout);
    
    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// ============================================================================
// Sleep Utility
// ============================================================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Main Retry Function
// ============================================================================

export type RetryCallback = (state: RetryState) => void;

export interface RetryOptions<T> {
  config?: Partial<RetryConfig>;
  /** Callback for retry state changes */
  onStateChange?: RetryCallback;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: FormattedError) => boolean;
  /** Context for error formatting */
  context?: {
    page?: string;
    component?: string;
    action?: string;
  };
  /** Fallback value if all retries fail */
  fallback?: T;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Execute an async operation with retry logic and exponential backoff
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions<T> = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options.config };
  const startTime = Date.now();
  let lastError: FormattedError | null = null;
  
  const updateState = (state: Partial<RetryState>) => {
    options.onStateChange?.({
      attempt: 0,
      totalAttempts: config.maxRetries + 1,
      lastError: null,
      isRetrying: false,
      nextRetryIn: null,
      ...state,
    });
  };
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    // Check for cancellation
    if (options.signal?.aborted) {
      const abortError = formatError(new Error('Operation cancelled'), options.context);
      return {
        success: false,
        error: abortError,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      };
    }
    
    updateState({
      attempt,
      totalAttempts: config.maxRetries + 1,
      isRetrying: attempt > 0,
      lastError,
    });
    
    try {
      // Execute with timeout
      const result = await withTimeout(operation(), config.timeout);
      
      updateState({
        attempt,
        isRetrying: false,
        lastError: null,
      });
      
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = formatError(error, options.context);
      
      // Check if error is permanent (no retry)
      const isRetryable = options.isRetryable?.(lastError) ?? isRetryableError(lastError);
      
      if (isPermanentError(lastError) || !isRetryable) {
        updateState({
          attempt,
          isRetrying: false,
          lastError,
        });
        
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1,
          totalTime: Date.now() - startTime,
        };
      }
      
      // Calculate delay for next retry (if not last attempt)
      if (attempt < config.maxRetries) {
        const delay = calculateBackoff(attempt, config);
        
        updateState({
          attempt,
          isRetrying: true,
          lastError,
          nextRetryIn: delay,
        });
        
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted
  updateState({
    attempt: config.maxRetries,
    isRetrying: false,
    lastError,
    nextRetryIn: null,
  });
  
  // Return fallback if provided
  if (options.fallback !== undefined) {
    return {
      success: true,
      data: options.fallback,
      attempts: config.maxRetries + 1,
      totalTime: Date.now() - startTime,
    };
  }
  
  return {
    success: false,
    error: lastError ?? formatError(new Error('Unknown error after retries'), options.context),
    attempts: config.maxRetries + 1,
    totalTime: Date.now() - startTime,
  };
}

// ============================================================================
// Specialized Retry Functions
// ============================================================================

/**
 * Retry an auth operation with auth-specific settings
 */
export function retryAuth<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions<T>, 'config'> = {}
): Promise<RetryResult<T>> {
  return retryAsync(operation, {
    ...options,
    config: RETRY_PRESETS.auth,
    context: { ...options.context, component: 'auth' },
  });
}

/**
 * Retry a query operation with query-specific settings
 */
export function retryQuery<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions<T>, 'config'> = {}
): Promise<RetryResult<T>> {
  return retryAsync(operation, {
    ...options,
    config: RETRY_PRESETS.query,
    context: { ...options.context, component: 'query' },
  });
}

/**
 * Retry a background operation with relaxed settings
 */
export function retryBackground<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions<T>, 'config'> = {}
): Promise<RetryResult<T>> {
  return retryAsync(operation, {
    ...options,
    config: RETRY_PRESETS.background,
    context: { ...options.context, component: 'background' },
  });
}
