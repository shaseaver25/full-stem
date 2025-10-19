# Rate Limiting

## Overview

TailorEDU implements client-side rate limiting to prevent abuse, protect backend resources, and ensure fair usage. The rate limiting system uses a hybrid approach combining token bucket and sliding window algorithms with intelligent backoff strategies.

## Architecture

### Dual Algorithm Approach

```
┌─────────────────────────────────────────────────┐
│ Request Flow                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Client Request                                 │
│       ↓                                         │
│  Token Bucket Check                             │
│       ↓                                         │
│  Sliding Window Check                           │
│       ↓                                         │
│  Minimum Delay Check                            │
│       ↓                                         │
│  [Allowed] → Execute Request                    │
│  [Denied]  → Exponential Backoff + Jitter       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Token Bucket Algorithm

**Purpose**: Smooth rate limiting allowing burst traffic up to a limit

**How it works**:
1. Bucket starts with maximum tokens
2. Each request consumes 1 token
3. Tokens refill at constant rate
4. Request denied if no tokens available

**Benefits**:
- Allows controlled bursts
- Smooth refill prevents hard cutoffs
- Predictable behavior

### Sliding Window Algorithm

**Purpose**: Prevent sustained high-frequency attacks

**How it works**:
1. Track timestamps of all requests in window
2. Remove requests older than window duration
3. Deny if request count exceeds maximum

**Benefits**:
- Prevents gaming token bucket
- Time-based limits
- Simple to reason about

## Rate Limit Configurations

### Authentication Endpoints

#### Login (`AUTH_LOGIN`)
```typescript
{
  maxRequests: 5,        // Max 5 attempts per window
  windowMs: 60000,       // 1 minute window
  refillRate: 0.1,       // 1 token per 10 seconds
  maxTokens: 5,          // Bucket capacity
  minDelay: 2000,        // 2 seconds between attempts
}
```

**Why strict?**
- Prevents brute force attacks
- Protects against credential stuffing
- Rate: 5 attempts per minute max

#### MFA Verification (`MFA_VERIFY`)
```typescript
{
  maxRequests: 3,        // Max 3 attempts per window
  windowMs: 60000,       // 1 minute window
  refillRate: 0.05,      // 1 token per 20 seconds
  maxTokens: 3,          // Bucket capacity
  minDelay: 3000,        // 3 seconds between attempts
}
```

**Why very strict?**
- MFA codes are time-sensitive
- Prevents brute force of 6-digit codes
- Rate: 3 attempts per minute max

#### Signup (`AUTH_SIGNUP`)
```typescript
{
  maxRequests: 3,        // Max 3 signups per window
  windowMs: 600000,      // 10 minutes window
  refillRate: 0.005,     // 1 token per 200 seconds
  maxTokens: 3,          // Bucket capacity
  minDelay: 5000,        // 5 seconds between signups
}
```

**Why moderate?**
- Prevents spam account creation
- Allows legitimate retries
- Rate: 3 signups per 10 minutes

#### Password Reset (`PASSWORD_RESET`)
```typescript
{
  maxRequests: 3,        // Max 3 resets per window
  windowMs: 300000,      // 5 minutes window
  refillRate: 0.01,      // 1 token per 100 seconds
  maxTokens: 3,          // Bucket capacity
  minDelay: 1000,        // 1 second between requests
}
```

**Why moderate?**
- Prevents email bombing
- Allows legitimate users to retry
- Rate: 3 resets per 5 minutes

### Data Operations

#### Mutations (`MUTATION`)
```typescript
{
  maxRequests: 30,       // Max 30 mutations per window
  windowMs: 60000,       // 1 minute window
  refillRate: 1,         // 1 token per second
  maxTokens: 30,         // Bucket capacity
  minDelay: 100,         // 100ms between mutations
}
```

**Applies to**: POST, PUT, PATCH, DELETE requests

**Why lenient?**
- Normal usage needs rapid mutations
- Batch operations common
- Rate: 30 mutations per minute

#### Queries (`QUERY`)
```typescript
{
  maxRequests: 100,      // Max 100 queries per window
  windowMs: 60000,       // 1 minute window
  refillRate: 5,         // 5 tokens per second
  maxTokens: 100,        // Bucket capacity
  minDelay: 0,           // No minimum delay
}
```

**Applies to**: GET requests

**Why very lenient?**
- Read-heavy applications
- Pagination and filtering
- Rate: 100 queries per minute

## Usage

### Basic Usage

```typescript
import { limitedFetch } from '@/utils/limitedFetch';

// Automatic rate limiting based on URL and method
const response = await limitedFetch('https://api.example.com/data', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
});
```

### Specify Rate Limit Key

```typescript
// Explicit rate limit configuration
const response = await limitedFetch('/api/auth/login', {
  method: 'POST',
  rateLimitKey: 'AUTH_LOGIN',
  body: JSON.stringify({ email, password }),
});
```

### Custom Configuration

```typescript
// Override default limits for specific case
const response = await limitedFetch('/api/special', {
  rateLimitKey: 'MUTATION',
  rateLimitConfig: {
    maxRequests: 10,
    windowMs: 5000,
  },
});
```

### JSON Convenience Wrapper

```typescript
import { limitedFetchJSON } from '@/utils/limitedFetch';

// Automatic JSON parsing
const data = await limitedFetchJSON<UserData>('/api/user', {
  method: 'GET',
});
```

### Preset Options

```typescript
import { createLimitedFetch } from '@/utils/limitedFetch';

// Create fetch with preset options
const authFetch = createLimitedFetch({
  rateLimitKey: 'AUTH_LOGIN',
  headers: {
    'Authorization': 'Bearer token',
  },
});

// Use with custom URL
const response = await authFetch('/api/login', {
  method: 'POST',
});
```

## Automatic Endpoint Detection

The system automatically determines rate limit keys based on URL patterns:

| URL Pattern | Rate Limit Key | Max Rate |
|-------------|----------------|----------|
| `/auth/v1/token` | `AUTH_LOGIN` | 5/min |
| `/auth/v1/signup` | `AUTH_SIGNUP` | 3/10min |
| `/auth/v1/recover` | `PASSWORD_RESET` | 3/5min |
| Contains `mfa` or `verify` | `MFA_VERIFY` | 3/min |
| POST/PUT/DELETE | `MUTATION` | 30/min |
| GET | `QUERY` | 100/min |

## Retry Strategies

### Exponential Backoff with Jitter

**Formula**: `baseDelay * 2^attempt ± 30% jitter`

**Why jitter?**
- Prevents thundering herd problem
- Distributes retries over time
- More resilient to transient failures

**Default Configuration**:
```typescript
{
  maxRetries: 3,        // Max 3 retry attempts
  backoffBase: 1000,    // Start at 1 second
  backoffMax: 30000,    // Cap at 30 seconds
}
```

**Backoff Schedule**:
```
Attempt 0: 1s   ± 300ms  (700ms - 1.3s)
Attempt 1: 2s   ± 600ms  (1.4s - 2.6s)
Attempt 2: 4s   ± 1.2s   (2.8s - 5.2s)
Attempt 3: 8s   ± 2.4s   (5.6s - 10.4s)
```

### Client-Side vs Server-Side Rate Limits

**Client-Side (Token Bucket)**:
- Proactive prevention
- No network request if limited
- Instant feedback

**Server-Side (429 Response)**:
- Fallback protection
- Respects `Retry-After` header
- Same backoff strategy

## Error Handling

### RateLimitError

```typescript
import { RateLimitError } from '@/middleware/rateLimit';

try {
  await limitedFetch('/api/data');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${error.retryAfter}ms`);
    console.log(`Reset at ${new Date(error.resetAt)}`);
  }
}
```

### Error Types

| Error | Cause | Recovery |
|-------|-------|----------|
| `RateLimitError` | Client-side limit reached | Wait `retryAfter` ms |
| `429 Response` | Server-side limit reached | Automatic retry with backoff |
| `AbortError` | Request cancelled | Don't retry |
| `NetworkError` | Connection failed | Automatic retry |

## Storage & Persistence

### Development Mode

**Storage**: `localStorage`

**Key Format**: `rate_limit_{endpoint_key}`

**Example**:
```
rate_limit_AUTH_LOGIN: {
  tokens: 4.2,
  lastRefill: 1640000000000,
  requests: [1640000001000, 1640000002000]
}
```

### Production Mode

**Storage**: `localStorage`

**Key Format**: `rate_limit_{hash(endpoint_key + client_id)}`

**Client ID**: Session-based unique identifier

**Security**: Keys hashed to prevent tampering

## Monitoring & Debugging

### Check Rate Limit Status

```typescript
import { getRateLimiter } from '@/middleware/rateLimit';

const limiter = getRateLimiter('AUTH_LOGIN');
const status = limiter.getStatus();

console.log('Tokens remaining:', status.tokensRemaining);
console.log('Reset at:', new Date(status.resetAt));
```

### Reset Rate Limiter

```typescript
// Useful for testing or manual override
const limiter = getRateLimiter('AUTH_LOGIN');
limiter.reset();
```

### Development Logging

In development mode, rate limit events are logged:

```
⚠️ Rate limit reached for AUTH_LOGIN. Retry after 2000ms
⚠️ Server rate limit (429). Retrying after 5000ms...
⚠️ Request failed (NetworkError). Retrying in 2000ms...
```

## Performance Impact

### Overhead

- **Token calculation**: < 1ms
- **Storage I/O**: < 5ms
- **Memory**: ~1KB per endpoint

### Optimization

- Lazy initialization
- In-memory caching
- Batch storage updates

## Security Considerations

### Client-Side Limitations

**Not a Security Boundary**:
- Can be bypassed in browser DevTools
- localStorage can be cleared
- Requests can be made outside app

**Defense in Depth**:
- Server-side rate limiting required
- This is a UX enhancement
- Reduces unnecessary load

### Best Practices

✅ **DO**:
- Use as first line of defense
- Combine with server-side limits
- Monitor for abuse patterns

❌ **DON'T**:
- Rely solely on client-side limits
- Store sensitive data in rate limit keys
- Use for security-critical operations

## Integration Examples

### Supabase Auth

```typescript
import { supabase } from '@/integrations/supabase/client';
import { limitedFetch } from '@/utils/limitedFetch';

// Wrap Supabase auth calls
async function login(email: string, password: string) {
  // Note: Supabase client handles its own fetch
  // For custom auth flows, wrap the fetch:
  
  const response = await limitedFetch(
    `${supabaseUrl}/auth/v1/token`,
    {
      method: 'POST',
      rateLimitKey: 'AUTH_LOGIN',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        email,
        password,
        gotrue_meta_security: {},
      }),
    }
  );
  
  return response.json();
}
```

### React Query Integration

```typescript
import { useQuery } from '@tanstack/react-query';
import { limitedFetchJSON } from '@/utils/limitedFetch';

function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => limitedFetchJSON(`/api/users/${userId}`),
    retry: false, // limitedFetch handles retries
  });
}
```

### Custom Hook

```typescript
import { useState } from 'react';
import { limitedFetch, RateLimitError } from '@/utils/limitedFetch';

function useRateLimitedMutation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mutate = async (url: string, options: RequestInit) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await limitedFetch(url, options);
      const data = await response.json();
      return data as T;
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError(new Error(`Too many requests. Please wait ${Math.ceil(err.retryAfter / 1000)} seconds.`));
      } else {
        setError(err as Error);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { mutate, loading, error };
}
```

## Testing

### Unit Tests

```typescript
import { RateLimiter, calculateBackoff } from '@/middleware/rateLimit';

describe('RateLimiter', () => {
  it('allows requests under limit', () => {
    const limiter = new RateLimiter('TEST', {
      maxRequests: 5,
      windowMs: 60000,
      refillRate: 1,
      maxTokens: 5,
    });
    
    const result = limiter.attempt();
    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(4);
  });
  
  it('blocks requests over limit', () => {
    const limiter = new RateLimiter('TEST', {
      maxRequests: 1,
      windowMs: 60000,
      refillRate: 0.01,
      maxTokens: 1,
    });
    
    limiter.attempt(); // First request
    const result = limiter.attempt(); // Second request
    
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });
});

describe('calculateBackoff', () => {
  it('increases exponentially', () => {
    const backoff0 = calculateBackoff(0, 1000, 30000, 0);
    const backoff1 = calculateBackoff(1, 1000, 30000, 0);
    const backoff2 = calculateBackoff(2, 1000, 30000, 0);
    
    expect(backoff1).toBe(backoff0 * 2);
    expect(backoff2).toBe(backoff0 * 4);
  });
  
  it('caps at max delay', () => {
    const backoff = calculateBackoff(10, 1000, 5000, 0);
    expect(backoff).toBeLessThanOrEqual(5000);
  });
});
```

### Integration Tests

```typescript
import { limitedFetch } from '@/utils/limitedFetch';

describe('limitedFetch', () => {
  it('retries on rate limit', async () => {
    let attempts = 0;
    
    // Mock fetch to return 429 twice, then 200
    global.fetch = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts <= 2) {
        return Promise.resolve(new Response(null, { status: 429 }));
      }
      return Promise.resolve(new Response('{"success":true}', { status: 200 }));
    });
    
    const response = await limitedFetch('/api/test', {
      maxRetries: 3,
      backoffBase: 100, // Fast test
    });
    
    expect(response.status).toBe(200);
    expect(attempts).toBe(3);
  });
});
```

## Troubleshooting

### Issue: Too Many Rate Limit Errors

**Symptoms**: Frequent `RateLimitError` during normal usage

**Causes**:
- Limits too strict for use case
- Multiple tabs/windows sharing limits
- Automated scripts hitting limits

**Solutions**:
1. Increase rate limits for endpoint
2. Use separate storage per tab (sessionStorage)
3. Implement queue system
4. Debounce/throttle UI interactions

### Issue: Rate Limits Not Working

**Symptoms**: Requests go through despite being over limit

**Debugging**:
```typescript
import { getRateLimiter } from '@/middleware/rateLimit';

// Check limiter status
const limiter = getRateLimiter('AUTH_LOGIN');
console.log('Status:', limiter.getStatus());

// Verify storage
console.log('Stored:', localStorage.getItem('rate_limit_AUTH_LOGIN'));
```

**Common Causes**:
- `skipRateLimit: true` option
- Storage cleared/unavailable
- Incorrect endpoint key

### Issue: Backoff Too Aggressive

**Symptoms**: Long wait times between retries

**Solution**: Adjust backoff parameters
```typescript
await limitedFetch('/api/data', {
  backoffBase: 500,    // Reduce base delay
  backoffMax: 5000,    // Reduce max delay
});
```

## Related Documentation

- [Security Headers](./SECURITY_HEADERS.md) - HTTP security configuration
- [Environment Hardening](./ENV_HARDENING.md) - Environment variable security
- [Performance Audit](./PERFORMANCE_AUDIT.md) - Query optimization

## Changelog

- **2025-01-19**: Initial rate limiting implementation
  - Token bucket algorithm
  - Sliding window tracking
  - Exponential backoff with jitter
  - Automatic endpoint detection
  - Comprehensive error handling
  - localStorage persistence
