/**
 * Rate-Limited Fetch Wrapper
 * 
 * Wraps native fetch with automatic rate limiting, backoff, and retry logic.
 * Integrates with the rate limiter middleware for consistent enforcement.
 */

import {
  getRateLimiter,
  calculateBackoff,
  wait,
  RateLimitError,
  type RateLimitConfig,
} from '@/middleware/rateLimit';
import { isDev } from '@/utils/env';

// Re-export for convenience
export { RateLimitError };

/**
 * Options for limited fetch
 */
export interface LimitedFetchOptions extends RequestInit {
  /**
   * Rate limit endpoint key
   * @default Determined from URL and method
   */
  rateLimitKey?: string;
  
  /**
   * Custom rate limit configuration
   */
  rateLimitConfig?: Partial<RateLimitConfig>;
  
  /**
   * Maximum retry attempts on rate limit
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Base delay for backoff (ms)
   * @default 1000
   */
  backoffBase?: number;
  
  /**
   * Maximum delay for backoff (ms)
   * @default 30000
   */
  backoffMax?: number;
  
  /**
   * Skip rate limiting
   * @default false
   */
  skipRateLimit?: boolean;
}

/**
 * Determine rate limit key from URL and method
 */
function determineRateLimitKey(url: string, method: string = 'GET'): string {
  const urlLower = url.toLowerCase();
  const methodUpper = method.toUpperCase();
  
  // Auth endpoints
  if (urlLower.includes('/auth/v1/token')) {
    return 'AUTH_LOGIN';
  }
  if (urlLower.includes('/auth/v1/signup')) {
    return 'AUTH_SIGNUP';
  }
  if (urlLower.includes('/auth/v1/recover')) {
    return 'PASSWORD_RESET';
  }
  if (urlLower.includes('/auth/v1/user') && methodUpper === 'PUT') {
    return 'PASSWORD_RESET';
  }
  
  // MFA endpoints
  if (urlLower.includes('mfa') || urlLower.includes('verify')) {
    return 'MFA_VERIFY';
  }
  
  // PostgREST mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper)) {
    return 'MUTATION';
  }
  
  // Default to query
  return 'QUERY';
}

/**
 * Check if response indicates rate limiting
 */
function isRateLimited(response: Response): boolean {
  return response.status === 429;
}

/**
 * Extract retry-after from response
 */
function getRetryAfter(response: Response): number | undefined {
  const retryAfter = response.headers.get('Retry-After');
  
  if (!retryAfter) return undefined;
  
  // Try parsing as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }
  
  // Try parsing as date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }
  
  return undefined;
}

/**
 * Rate-limited fetch with automatic backoff and retry
 */
export async function limitedFetch(
  url: string | URL,
  options: LimitedFetchOptions = {}
): Promise<Response> {
  const {
    rateLimitKey,
    rateLimitConfig,
    maxRetries = 3,
    backoffBase = 1000,
    backoffMax = 30000,
    skipRateLimit = false,
    ...fetchOptions
  } = options;
  
  const urlString = url.toString();
  const method = fetchOptions.method || 'GET';
  
  // Skip rate limiting if requested or in development with flag
  if (skipRateLimit) {
    return fetch(url, fetchOptions);
  }
  
  // Determine rate limit key
  const limitKey = rateLimitKey || determineRateLimitKey(urlString, method);
  const limiter = getRateLimiter(limitKey, rateLimitConfig);
  
  let lastError: Error | undefined;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      // Check rate limit before attempt
      const limitResult = limiter.attempt();
      
      if (!limitResult.allowed) {
        if (isDev) {
          console.warn(
            `Rate limit reached for ${limitKey}. ` +
            `Retry after ${limitResult.retryAfter}ms`
          );
        }
        
        // If this is the last attempt, throw error
        if (attempt >= maxRetries) {
          throw new RateLimitError(
            `Rate limit exceeded for ${limitKey}. Try again later.`,
            limitResult.retryAfter || 0,
            limitResult.resetAt
          );
        }
        
        // Wait and retry
        const waitTime = limitResult.retryAfter || calculateBackoff(
          attempt,
          backoffBase,
          backoffMax
        );
        
        await wait(waitTime, fetchOptions.signal);
        attempt++;
        continue;
      }
      
      // Make request
      const response = await fetch(url, fetchOptions);
      
      // Check if server-side rate limited
      if (isRateLimited(response)) {
        const retryAfter = getRetryAfter(response) || calculateBackoff(
          attempt,
          backoffBase,
          backoffMax
        );
        
        if (attempt >= maxRetries) {
          throw new RateLimitError(
            `Server rate limit exceeded. Try again later.`,
            retryAfter,
            Date.now() + retryAfter
          );
        }
        
        if (isDev) {
          console.warn(
            `Server rate limit (429). Retrying after ${retryAfter}ms...`
          );
        }
        
        await wait(retryAfter, fetchOptions.signal);
        attempt++;
        continue;
      }
      
      // Success - return response
      return response;
      
    } catch (error) {
      // Handle abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      
      // Handle rate limit errors
      if (error instanceof RateLimitError) {
        throw error;
      }
      
      // Handle network errors with retry
      lastError = error as Error;
      
      if (attempt >= maxRetries) {
        break;
      }
      
      // Exponential backoff for network errors
      const waitTime = calculateBackoff(attempt, backoffBase, backoffMax);
      
      if (isDev) {
        console.warn(
          `Request failed (${error}). Retrying in ${waitTime}ms...`
        );
      }
      
      await wait(waitTime, fetchOptions.signal);
      attempt++;
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Request failed after all retries');
}

/**
 * Convenience wrapper for JSON requests
 */
export async function limitedFetchJSON<T = any>(
  url: string | URL,
  options: LimitedFetchOptions = {}
): Promise<T> {
  const response = await limitedFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return response.json();
}

/**
 * Create a rate-limited fetch function with preset options
 */
export function createLimitedFetch(
  defaultOptions: LimitedFetchOptions = {}
): typeof limitedFetch {
  return (url: string | URL, options: LimitedFetchOptions = {}) => {
    return limitedFetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });
  };
}
