/**
 * Rate Limiting Usage Examples
 * 
 * This file demonstrates how to use the rate limiting system
 * in various scenarios throughout the application.
 * 
 * NOTE: This is an example file for reference.
 * The patterns shown here can be applied in actual components.
 */

import { limitedFetch, limitedFetchJSON, RateLimitError } from '@/utils/limitedFetch';
import { getRateLimiter } from '@/middleware/rateLimit';
import { supabase } from '@/integrations/supabase/client';
import { env } from '@/utils/env';

// =============================================================================
// Example 1: Authentication with Rate Limiting
// =============================================================================

/**
 * Login with automatic rate limiting
 */
export async function loginWithRateLimit(email: string, password: string) {
  try {
    const response = await limitedFetch(
      `${env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        rateLimitKey: 'AUTH_LOGIN',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          email,
          password,
          gotrue_meta_security: {},
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof RateLimitError) {
      const seconds = Math.ceil(error.retryAfter / 1000);
      throw new Error(`Too many login attempts. Please wait ${seconds} seconds.`);
    }
    throw error;
  }
}

// =============================================================================
// Example 2: MFA Verification
// =============================================================================

/**
 * Verify MFA code with strict rate limiting
 */
export async function verifyMFAWithRateLimit(code: string) {
  try {
    const data = await limitedFetchJSON('/api/mfa/verify', {
      method: 'POST',
      rateLimitKey: 'MFA_VERIFY',
      body: JSON.stringify({ code }),
    });
    
    return data;
  } catch (error) {
    if (error instanceof RateLimitError) {
      const seconds = Math.ceil(error.retryAfter / 1000);
      throw new Error(
        `Too many verification attempts. Please wait ${seconds} seconds before trying again.`
      );
    }
    throw error;
  }
}

// =============================================================================
// Example 3: Password Reset
// =============================================================================

/**
 * Request password reset with rate limiting
 */
export async function resetPasswordWithRateLimit(email: string) {
  const limiter = getRateLimiter('PASSWORD_RESET');
  const status = limiter.getStatus();
  
  if (!status.allowed) {
    const minutes = Math.ceil((status.resetAt - Date.now()) / 60000);
    throw new Error(
      `Too many password reset requests. Please try again in ${minutes} minute(s).`
    );
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    // Consume rate limit token manually since we're using Supabase client
    limiter.attempt();
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

// =============================================================================
// Example 4: React Hook Integration Pattern
// =============================================================================

/**
 * Pattern for custom hook with rate-limited mutations
 * 
 * In a .tsx file, you would implement like:
 * 
 * ```tsx
 * import { useState } from 'react';
 * 
 * export function useRateLimitedMutation<TData, TVariables>(
 *   mutationFn: (variables: TVariables) => Promise<TData>,
 *   rateLimitKey: string
 * ) {
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState<Error | null>(null);
 *   const [data, setData] = useState<TData | null>(null);
 *   
 *   const mutate = async (variables: TVariables) => {
 *     setLoading(true);
 *     setError(null);
 *     
 *     try {
 *       const result = await mutationFn(variables);
 *       setData(result);
 *       return result;
 *     } catch (err) {
 *       if (err instanceof RateLimitError) {
 *         const seconds = Math.ceil(err.retryAfter / 1000);
 *         setError(new Error(`Rate limit exceeded. Retry in ${seconds}s.`));
 *       } else {
 *         setError(err as Error);
 *       }
 *       throw err;
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   
 *   return { mutate, loading, error, data };
 * }
 * ```
 */

// =============================================================================
// Example 5: Supabase Query with Rate Limiting
// =============================================================================

/**
 * Fetch data from Supabase with rate limiting
 * Note: This wraps the underlying fetch made by Supabase
 */
export async function fetchStudentsWithRateLimit(classId: string) {
  // For Supabase queries, the rate limiting happens at the fetch level
  // The Supabase client makes HTTP requests internally
  
  // Option 1: Use Supabase directly (client-side rate limits apply at network level)
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId);
  
  if (error) throw error;
  return data;
  
  // Option 2: For mutations, you can manually check rate limits first
  // const limiter = getRateLimiter('MUTATION');
  // const status = limiter.getStatus();
  // if (!status.allowed) {
  //   throw new RateLimitError('Rate limit exceeded', status.retryAfter || 0, status.resetAt);
  // }
  // Then proceed with mutation and consume token
  // limiter.attempt();
}

// =============================================================================
// Example 6: Batch Operations with Rate Limiting
// =============================================================================

/**
 * Perform batch operations with rate limit awareness
 */
export async function batchUpdateWithRateLimit<T>(
  items: T[],
  updateFn: (item: T) => Promise<void>
) {
  const limiter = getRateLimiter('MUTATION');
  const results: { item: T; success: boolean; error?: Error }[] = [];
  
  for (const item of items) {
    const status = limiter.getStatus();
    
    if (!status.allowed) {
      // Wait for token refill
      await new Promise(resolve => setTimeout(resolve, status.resetAt - Date.now()));
    }
    
    try {
      await updateFn(item);
      limiter.attempt();
      results.push({ item, success: true });
    } catch (error) {
      results.push({ item, success: false, error: error as Error });
    }
  }
  
  return results;
}

// =============================================================================
// Example 7: UI Feedback Pattern for Rate Limits
// =============================================================================

/**
 * Pattern for showing rate limit status in UI
 * 
 * In a .tsx file, implement a hook like:
 * 
 * ```tsx
 * import { useState, useEffect } from 'react';
 * 
 * export function useRateLimitStatus(rateLimitKey: string) {
 *   const [status, setStatus] = useState({ allowed: true, tokensRemaining: 0 });
 *   
 *   useEffect(() => {
 *     const limiter = getRateLimiter(rateLimitKey);
 *     const updateStatus = () => {
 *       const currentStatus = limiter.getStatus();
 *       setStatus(currentStatus);
 *     };
 *     
 *     updateStatus();
 *     const interval = setInterval(updateStatus, 1000);
 *     return () => clearInterval(interval);
 *   }, [rateLimitKey]);
 *   
 *   return status;
 * }
 * ```
 * 
 * Use in component to show remaining attempts or cooldown timer
 */

/**
 * Get rate limit status for display
 */
export function getRateLimitStatusForDisplay(rateLimitKey: string) {
  const limiter = getRateLimiter(rateLimitKey);
  const status = limiter.getStatus();
  
  return {
    allowed: status.allowed,
    tokensRemaining: status.tokensRemaining,
    resetAt: new Date(status.resetAt),
    secondsUntilReset: Math.ceil((status.resetAt - Date.now()) / 1000),
  };
}

// =============================================================================
// Example 8: Testing Rate Limits
// =============================================================================

/**
 * Test rate limiting in development
 */
export async function testRateLimits() {
  const limiter = getRateLimiter('AUTH_LOGIN');
  
  console.log('Testing rate limits...');
  
  // Reset limiter
  limiter.reset();
  console.log('✓ Limiter reset');
  
  // Make allowed requests
  for (let i = 0; i < 5; i++) {
    const result = limiter.attempt();
    console.log(`Request ${i + 1}:`, result);
  }
  
  // Try one more (should be denied)
  const deniedResult = limiter.attempt();
  console.log('Expected denial:', deniedResult);
  
  if (!deniedResult.allowed) {
    console.log(`✓ Rate limit working. Retry after ${deniedResult.retryAfter}ms`);
  }
  
  // Wait for refill
  await new Promise(resolve => setTimeout(resolve, deniedResult.retryAfter || 0));
  
  // Try again (should be allowed)
  const allowedAgain = limiter.attempt();
  console.log('After waiting:', allowedAgain);
  
  if (allowedAgain.allowed) {
    console.log('✓ Token refill working');
  }
}

// Run in development console:
// import { testRateLimits } from '@/examples/rateLimitUsage.example';
// testRateLimits();
