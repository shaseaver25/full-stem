/**
 * Client-Side Rate Limiter
 * 
 * Implements token bucket algorithm for rate limiting API calls.
 * Prevents client abuse and implements intelligent backoff strategies.
 * 
 * Features:
 * - Token bucket algorithm for smooth rate limiting
 * - Sliding window tracking for burst detection
 * - localStorage persistence (development/demo)
 * - X-Forwarded-For hashing (production edge)
 * - Automatic backoff with jitter
 * - Per-endpoint rate limit configuration
 */

import { isDev, isProd } from '@/utils/env';

/**
 * Rate limit configuration for different endpoint types
 */
export interface RateLimitConfig {
  /**
   * Maximum requests per window
   */
  maxRequests: number;
  
  /**
   * Window duration in milliseconds
   */
  windowMs: number;
  
  /**
   * Token refill rate (tokens per second)
   */
  refillRate: number;
  
  /**
   * Maximum tokens in bucket
   */
  maxTokens: number;
  
  /**
   * Minimum delay between requests (ms)
   */
  minDelay?: number;
}

/**
 * Token bucket state
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
  requests: number[];
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  tokensRemaining: number;
  resetAt: number;
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints (strict)
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    refillRate: 0.1, // 1 token per 10 seconds
    maxTokens: 5,
    minDelay: 2000, // 2 second minimum between attempts
  },
  
  // MFA verification (very strict)
  MFA_VERIFY: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
    refillRate: 0.05, // 1 token per 20 seconds
    maxTokens: 3,
    minDelay: 3000, // 3 seconds minimum
  },
  
  // Password reset (moderate)
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    refillRate: 0.01, // 1 token per 100 seconds
    maxTokens: 3,
    minDelay: 1000,
  },
  
  // Signup (moderate)
  AUTH_SIGNUP: {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    refillRate: 0.005, // 1 token per 200 seconds
    maxTokens: 3,
    minDelay: 5000,
  },
  
  // POST/PUT/DELETE mutations (lenient)
  MUTATION: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    refillRate: 1, // 1 token per second
    maxTokens: 30,
    minDelay: 100,
  },
  
  // GET queries (very lenient)
  QUERY: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    refillRate: 5, // 5 tokens per second
    maxTokens: 100,
    minDelay: 0,
  },
};

/**
 * Storage key prefix for rate limit data
 */
const STORAGE_PREFIX = 'rate_limit_';

/**
 * Rate limiter class implementing token bucket algorithm
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private storageKey: string;
  private bucket: TokenBucket;
  
  constructor(
    private endpointKey: string,
    config?: Partial<RateLimitConfig>
  ) {
    // Get base config or use default
    const baseConfig = RATE_LIMITS[endpointKey] || RATE_LIMITS.QUERY;
    this.config = { ...baseConfig, ...config };
    
    // Generate storage key (use hash in production)
    this.storageKey = this.generateStorageKey(endpointKey);
    
    // Load or initialize bucket
    this.bucket = this.loadBucket();
  }
  
  /**
   * Generate storage key for rate limit data
   */
  private generateStorageKey(key: string): string {
    if (isDev) {
      // In development, use plain key
      return `${STORAGE_PREFIX}${key}`;
    }
    
    // In production, hash the key with IP info if available
    const ipHash = this.getClientIdentifier();
    return `${STORAGE_PREFIX}${this.simpleHash(key + ipHash)}`;
  }
  
  /**
   * Get client identifier (IP hash in production, session in dev)
   */
  private getClientIdentifier(): string {
    if (typeof window === 'undefined') return 'server';
    
    // Try to get forwarded IP from headers (requires server-side support)
    // In client-side, we use a session identifier
    let identifier = sessionStorage.getItem('_client_id');
    
    if (!identifier) {
      identifier = this.generateSessionId();
      sessionStorage.setItem('_client_id', identifier);
    }
    
    return identifier;
  }
  
  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Simple hash function for storage keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Load bucket from storage or create new
   */
  private loadBucket(): TokenBucket {
    try {
      const stored = localStorage.getItem(this.storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          tokens: parsed.tokens || this.config.maxTokens,
          lastRefill: parsed.lastRefill || Date.now(),
          requests: (parsed.requests || []).filter(
            (time: number) => time > Date.now() - this.config.windowMs
          ),
        };
      }
    } catch (error) {
      if (isDev) {
        console.warn('Failed to load rate limit bucket:', error);
      }
    }
    
    return {
      tokens: this.config.maxTokens,
      lastRefill: Date.now(),
      requests: [],
    };
  }
  
  /**
   * Save bucket to storage
   */
  private saveBucket(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bucket));
    } catch (error) {
      // Fail silently in production, warn in dev
      if (isDev) {
        console.warn('Failed to save rate limit bucket:', error);
      }
    }
  }
  
  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsedMs = now - this.bucket.lastRefill;
    const elapsedSeconds = elapsedMs / 1000;
    
    // Calculate tokens to add
    const tokensToAdd = elapsedSeconds * this.config.refillRate;
    
    // Add tokens up to max
    this.bucket.tokens = Math.min(
      this.config.maxTokens,
      this.bucket.tokens + tokensToAdd
    );
    
    this.bucket.lastRefill = now;
  }
  
  /**
   * Clean old requests from sliding window
   */
  private cleanOldRequests(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.bucket.requests = this.bucket.requests.filter(time => time > cutoff);
  }
  
  /**
   * Check if request is allowed and consume token
   */
  public attempt(): RateLimitResult {
    this.refillTokens();
    this.cleanOldRequests();
    
    const now = Date.now();
    
    // Check sliding window limit
    if (this.bucket.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.bucket.requests[0];
      const retryAfter = oldestRequest + this.config.windowMs - now;
      
      return {
        allowed: false,
        retryAfter: Math.max(0, retryAfter),
        tokensRemaining: Math.floor(this.bucket.tokens),
        resetAt: oldestRequest + this.config.windowMs,
      };
    }
    
    // Check token bucket
    if (this.bucket.tokens < 1) {
      const timeUntilToken = (1 - this.bucket.tokens) / this.config.refillRate * 1000;
      
      return {
        allowed: false,
        retryAfter: Math.ceil(timeUntilToken),
        tokensRemaining: 0,
        resetAt: now + timeUntilToken,
      };
    }
    
    // Check minimum delay
    if (this.config.minDelay && this.bucket.requests.length > 0) {
      const lastRequest = this.bucket.requests[this.bucket.requests.length - 1];
      const timeSinceLastRequest = now - lastRequest;
      
      if (timeSinceLastRequest < this.config.minDelay) {
        const retryAfter = this.config.minDelay - timeSinceLastRequest;
        
        return {
          allowed: false,
          retryAfter,
          tokensRemaining: Math.floor(this.bucket.tokens),
          resetAt: now + retryAfter,
        };
      }
    }
    
    // Allow request - consume token
    this.bucket.tokens -= 1;
    this.bucket.requests.push(now);
    this.saveBucket();
    
    return {
      allowed: true,
      tokensRemaining: Math.floor(this.bucket.tokens),
      resetAt: now + (this.config.maxTokens - this.bucket.tokens) / this.config.refillRate * 1000,
    };
  }
  
  /**
   * Reset rate limiter (useful for testing or manual override)
   */
  public reset(): void {
    this.bucket = {
      tokens: this.config.maxTokens,
      lastRefill: Date.now(),
      requests: [],
    };
    this.saveBucket();
  }
  
  /**
   * Get current status without consuming token
   */
  public getStatus(): RateLimitResult {
    this.refillTokens();
    this.cleanOldRequests();
    
    return {
      allowed: this.bucket.tokens >= 1,
      tokensRemaining: Math.floor(this.bucket.tokens),
      resetAt: Date.now() + (this.config.maxTokens - this.bucket.tokens) / this.config.refillRate * 1000,
    };
  }
}

/**
 * Global rate limiter instances cache
 */
const rateLimiters = new Map<string, RateLimiter>();

/**
 * Get or create rate limiter for endpoint
 */
export function getRateLimiter(
  endpointKey: string,
  config?: Partial<RateLimitConfig>
): RateLimiter {
  const cacheKey = `${endpointKey}_${JSON.stringify(config || {})}`;
  
  if (!rateLimiters.has(cacheKey)) {
    rateLimiters.set(cacheKey, new RateLimiter(endpointKey, config));
  }
  
  return rateLimiters.get(cacheKey)!;
}

/**
 * Exponential backoff with jitter
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  jitterFactor: number = 0.3
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  
  // Add jitter: ±30% random variation
  const jitter = exponentialDelay * jitterFactor * (Math.random() * 2 - 1);
  
  return Math.max(0, Math.floor(exponentialDelay + jitter));
}

/**
 * Wait for specified duration with optional abort
 */
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    
    const timeout = setTimeout(resolve, ms);
    
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public resetAt: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
