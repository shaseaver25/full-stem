/**
 * React Hook for Query Retry with Exponential Backoff
 * 
 * Provides a convenient way to execute async operations with
 * automatic retry logic in React components.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  retryAsync,
  type RetryConfig,
  type RetryState,
  type RetryResult,
  type RetryOptions,
  DEFAULT_RETRY_CONFIG,
  RETRY_PRESETS,
} from '@/utils/queryRetry';
import type { FormattedError } from '@/utils/error';

// ============================================================================
// Hook Types
// ============================================================================

export interface UseQueryRetryOptions<T> extends Omit<RetryOptions<T>, 'onStateChange' | 'signal'> {
  /** Automatically execute on mount */
  immediate?: boolean;
  /** Callback on successful execution */
  onSuccess?: (data: T, result: RetryResult<T>) => void;
  /** Callback on failed execution */
  onError?: (error: FormattedError, result: RetryResult<T>) => void;
  /** Callback on each retry attempt */
  onRetry?: (state: RetryState) => void;
}

export interface UseQueryRetryReturn<T> {
  /** Execute the operation */
  execute: () => Promise<RetryResult<T>>;
  /** Current retry state */
  state: RetryState;
  /** Whether the operation is currently executing */
  isLoading: boolean;
  /** Whether the operation succeeded */
  isSuccess: boolean;
  /** Whether the operation failed */
  isError: boolean;
  /** The successful result data */
  data: T | undefined;
  /** The error if failed */
  error: FormattedError | undefined;
  /** Number of attempts made */
  attempts: number;
  /** Reset the state */
  reset: () => void;
  /** Cancel the current operation */
  cancel: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialRetryState: RetryState = {
  attempt: 0,
  totalAttempts: 0,
  lastError: null,
  isRetrying: false,
  nextRetryIn: null,
};

// ============================================================================
// Main Hook
// ============================================================================

export function useQueryRetry<T>(
  operation: () => Promise<T>,
  options: UseQueryRetryOptions<T> = {}
): UseQueryRetryReturn<T> {
  const [state, setState] = useState<RetryState>(initialRetryState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<FormattedError | undefined>(undefined);
  const [attempts, setAttempts] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  
  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);
  
  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    setState(initialRetryState);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setData(undefined);
    setError(undefined);
    setAttempts(0);
  }, []);
  
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);
  
  const execute = useCallback(async (): Promise<RetryResult<T>> => {
    // Cancel any existing operation
    cancel();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (isMountedRef.current) {
      setIsLoading(true);
      setIsSuccess(false);
      setIsError(false);
      setError(undefined);
    }
    
    const result = await retryAsync(operation, {
      ...options,
      signal: abortControllerRef.current.signal,
      onStateChange: (newState) => {
        if (!isMountedRef.current) return;
        setState(newState);
        if (newState.isRetrying) {
          options.onRetry?.(newState);
        }
      },
    });
    
    if (!isMountedRef.current) {
      return result;
    }
    
    setAttempts(result.attempts);
    setIsLoading(false);
    
    if (result.success) {
      setIsSuccess(true);
      setData(result.data);
      options.onSuccess?.(result.data as T, result);
    } else {
      setIsError(true);
      setError(result.error);
      if (result.error) {
        options.onError?.(result.error, result);
      }
    }
    
    return result;
  }, [operation, options, cancel]);
  
  // Execute immediately if requested
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return {
    execute,
    state,
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    attempts,
    reset,
    cancel,
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for auth operations with auth-specific retry settings
 */
export function useAuthRetry<T>(
  operation: () => Promise<T>,
  options: Omit<UseQueryRetryOptions<T>, 'config'> = {}
): UseQueryRetryReturn<T> {
  return useQueryRetry(operation, {
    ...options,
    config: RETRY_PRESETS.auth,
    context: { ...options.context, component: 'auth' },
  });
}

/**
 * Hook for dashboard queries with query-specific retry settings
 */
export function useDashboardRetry<T>(
  operation: () => Promise<T>,
  options: Omit<UseQueryRetryOptions<T>, 'config'> = {}
): UseQueryRetryReturn<T> {
  return useQueryRetry(operation, {
    ...options,
    config: RETRY_PRESETS.query,
    context: { ...options.context, component: 'dashboard' },
  });
}

// ============================================================================
// React Query Integration
// ============================================================================

/**
 * Create a retry function compatible with React Query's retry option
 */
export function createQueryRetryFn(
  config: Partial<RetryConfig> = {}
): (failureCount: number, error: unknown) => boolean {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  return (failureCount: number, error: unknown) => {
    // Don't retry beyond max retries
    if (failureCount >= mergedConfig.maxRetries) {
      return false;
    }
    
    // Check if error is retryable
    const errorObj = error as { category?: string; code?: string; message?: string };
    
    // Permanent errors - don't retry
    if (errorObj.category === 'auth' || 
        errorObj.category === 'permission' ||
        errorObj.category === 'validation') {
      return false;
    }
    
    // Check for specific non-retryable error codes
    if (errorObj.code === 'PGRST301' || 
        errorObj.code === '42501' ||
        errorObj.message?.includes('permission denied')) {
      return false;
    }
    
    // Retryable by default for network/timeout errors
    return true;
  };
}

/**
 * Create a retry delay function compatible with React Query
 */
export function createQueryRetryDelay(
  config: Partial<RetryConfig> = {}
): (attemptIndex: number) => number {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  return (attemptIndex: number) => {
    const { initialDelay, maxDelay, backoffMultiplier, jitterFactor } = mergedConfig;
    
    const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attemptIndex);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);
    
    return Math.max(0, Math.round(cappedDelay + jitter));
  };
}

// Export presets and config for convenience
export { RETRY_PRESETS, DEFAULT_RETRY_CONFIG };
