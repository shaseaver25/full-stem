import { z } from 'zod';

/**
 * Environment Variable Schema
 * 
 * Validates all environment variables at runtime with proper type safety.
 * Critical variables are required in production, optional in development.
 */
const envSchema = z.object({
  // Vite built-in environment variables
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
  
  // Supabase Configuration (Required in Production)
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'Supabase publishable key is required').optional(),
  VITE_SUPABASE_PROJECT_ID: z.string().optional(),
  
  // External Services (Optional)
  VITE_GOOGLE_API_KEY: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
});

type Env = z.infer<typeof envSchema>;

/**
 * Production-critical environment variables that MUST be present in production builds
 */
const PRODUCTION_REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
] as const;

/**
 * Validate and parse environment variables
 * @throws {Error} If validation fails or required production vars are missing
 */
function validateEnv(): Env {
  const rawEnv = {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  };

  // Parse with Zod schema
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  const env = result.data;

  // In production, enforce critical variables
  if (env.PROD) {
    const missingVars = PRODUCTION_REQUIRED_VARS.filter(
      varName => !rawEnv[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `PRODUCTION BUILD ERROR: Missing required environment variables:\n` +
        `${missingVars.map(v => `  - ${v}`).join('\n')}\n\n` +
        `Please check your .env file or deployment configuration.\n` +
        `See docs/ENV_HARDENING.md for details.`
      );
    }
  }

  return env;
}

/**
 * Validated and typed environment variables
 * 
 * Usage:
 * ```ts
 * import { env } from '@/utils/env';
 * 
 * if (env.DEV) {
 *   console.log('Development mode');
 * }
 * 
 * const supabaseUrl = env.VITE_SUPABASE_URL;
 * ```
 */
export const env = validateEnv();

/**
 * Type-safe helper to check if we're in development
 */
export const isDev = env.DEV;

/**
 * Type-safe helper to check if we're in production
 */
export const isProd = env.PROD;

/**
 * Get environment mode
 */
export const getMode = () => env.MODE;
