import * as Sentry from "@sentry/react";
import { env, isDev, isProd } from "./env";

/**
 * Log an error to Sentry (production) and console (development)
 * @param error - The error to log
 * @param context - Additional context about where/why the error occurred
 */
export const logError = (error: unknown, context?: string) => {
  // Always log to console in development
  if (isDev) {
    console.error(context ? `[${context}]` : '[Error]', error);
  }

  // Send to Sentry in production if configured
  if (isProd && env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        context: context || 'unknown',
      },
    });
  }
};

/**
 * Set user context for error tracking
 * @param userId - The user's ID
 * @param email - The user's email (optional)
 */
export const setErrorUser = (userId: string, email?: string) => {
  if (isProd && env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email,
    });
  }
};

/**
 * Clear user context (on logout)
 */
export const clearErrorUser = () => {
  if (isProd && env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param category - Category of the action
 * @param level - Severity level
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'action',
  level: Sentry.SeverityLevel = 'info'
) => {
  if (env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }
};
