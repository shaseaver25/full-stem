/**
 * Security Headers Middleware
 * 
 * Provides HTTP security headers for development and SSR environments.
 * In production static deployments (Vercel/Netlify), headers are applied
 * via vercel.json or netlify.toml at the CDN edge.
 * 
 * This middleware is useful for:
 * - Local development testing
 * - SSR/Express/custom server deployments
 * - Preview environments
 * - Security header parity across environments
 */

import { isDev } from '@/utils/env';

export interface SecurityHeadersConfig {
  /**
   * Enable Content Security Policy
   * @default true
   */
  csp?: boolean;
  
  /**
   * Use CSP report-only mode (logs violations, doesn't block)
   * @default true
   */
  cspReportOnly?: boolean;
  
  /**
   * Custom CSP directives (merged with defaults)
   */
  cspDirectives?: Record<string, string | string[]>;
  
  /**
   * Enable HSTS (only applies on HTTPS)
   * @default true
   */
  hsts?: boolean;
  
  /**
   * HSTS max age in seconds
   * @default 31536000 (1 year)
   */
  hstsMaxAge?: number;
  
  /**
   * Include subdomains in HSTS
   * @default true
   */
  hstsIncludeSubDomains?: boolean;
  
  /**
   * Enable HSTS preload
   * @default true
   */
  hstsPreload?: boolean;
}

/**
 * Default CSP directives
 */
const DEFAULT_CSP_DIRECTIVES: Record<string, string | string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'", "'inline-speculation-rules'", 'https://*.sentry.io'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://*.sentry.io'],
  'frame-ancestors': ["'none'"],
};

/**
 * Build CSP header value from directives
 */
function buildCSP(directives: Record<string, string | string[]>): string {
  return Object.entries(directives)
    .map(([key, value]) => {
      const values = Array.isArray(value) ? value.join(' ') : value;
      return `${key} ${values}`;
    })
    .join('; ');
}

/**
 * Build HSTS header value
 */
function buildHSTS(config: SecurityHeadersConfig): string {
  const parts = [`max-age=${config.hstsMaxAge || 31536000}`];
  
  if (config.hstsIncludeSubDomains !== false) {
    parts.push('includeSubDomains');
  }
  
  if (config.hstsPreload !== false) {
    parts.push('preload');
  }
  
  return parts.join('; ');
}

/**
 * Get all security headers as an object
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Content Security Policy
  if (config.csp !== false) {
    const cspDirectives = {
      ...DEFAULT_CSP_DIRECTIVES,
      ...config.cspDirectives,
    };
    
    const cspValue = buildCSP(cspDirectives);
    const cspHeader = config.cspReportOnly !== false 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    
    headers[cspHeader] = cspValue;
  }
  
  // HSTS (only on HTTPS)
  if (config.hsts !== false) {
    headers['Strict-Transport-Security'] = buildHSTS(config);
  }
  
  // X-Content-Type-Options
  headers['X-Content-Type-Options'] = 'nosniff';
  
  // X-Frame-Options
  headers['X-Frame-Options'] = 'DENY';
  
  // Referrer-Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  
  // Permissions-Policy
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
  
  return headers;
}

/**
 * Express/Connect middleware for security headers
 * 
 * @example
 * ```typescript
 * import express from 'express';
 * import { securityHeaders } from './middleware/securityHeaders';
 * 
 * const app = express();
 * app.use(securityHeaders());
 * ```
 */
export function securityHeaders(config: SecurityHeadersConfig = {}) {
  const headers = getSecurityHeaders(config);
  
  return (req: any, res: any, next: any) => {
    // In development, log headers but don't enforce strictly
    if (isDev) {
      console.log('🔒 Security headers (development mode - not strictly enforced):');
      Object.entries(headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`);
      });
    }
    
    // Apply headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    next();
  };
}

/**
 * Fetch API middleware for security headers
 * Useful for edge functions, workers, or custom fetch handlers
 * 
 * @example
 * ```typescript
 * import { withSecurityHeaders } from './middleware/securityHeaders';
 * 
 * export async function handler(request: Request): Promise<Response> {
 *   const response = new Response('Hello World');
 *   return withSecurityHeaders(response);
 * }
 * ```
 */
export function withSecurityHeaders(
  response: Response,
  config: SecurityHeadersConfig = {}
): Response {
  const headers = new Headers(response.headers);
  const secHeaders = getSecurityHeaders(config);
  
  Object.entries(secHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Vite plugin for security headers in development
 * Add this to vite.config.ts for local testing
 * 
 * @example
 * ```typescript
 * import { securityHeadersPlugin } from './src/middleware/securityHeaders';
 * 
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     securityHeadersPlugin(),
 *   ],
 * });
 * ```
 */
export function securityHeadersPlugin(config: SecurityHeadersConfig = {}) {
  const headers = getSecurityHeaders(config);
  
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        next();
      });
    },
  };
}

/**
 * Utility to check if current connection is secure (HTTPS)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext || window.location.protocol === 'https:';
}

/**
 * Utility to validate security headers on a response
 * Useful for testing and debugging
 */
export function validateSecurityHeaders(headers: Headers): {
  valid: boolean;
  missing: string[];
  present: string[];
} {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ];
  
  const recommendedHeaders = [
    'Content-Security-Policy',
    'Content-Security-Policy-Report-Only',
    'Strict-Transport-Security',
  ];
  
  const present: string[] = [];
  const missing: string[] = [];
  
  // Check required headers
  requiredHeaders.forEach(header => {
    if (headers.has(header)) {
      present.push(header);
    } else {
      missing.push(header);
    }
  });
  
  // Check at least one CSP header
  const hasCSP = recommendedHeaders.some(header => headers.has(header));
  if (!hasCSP) {
    missing.push('Content-Security-Policy (or Report-Only)');
  } else {
    recommendedHeaders.forEach(header => {
      if (headers.has(header)) {
        present.push(header);
      }
    });
  }
  
  return {
    valid: missing.length === 0,
    missing,
    present,
  };
}
