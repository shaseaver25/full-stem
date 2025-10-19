import * as Sentry from "@sentry/react";
import { env, isProd } from "@/utils/env";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Only active in production when VITE_SENTRY_DSN is configured
 */
export const initSentry = () => {
  if (isProd && env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN,
      environment: env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.2, // Capture 20% of transactions for performance monitoring
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      // Optional: Enable debug mode in development
      debug: false,
      
      // Filter out known benign errors
      beforeSend(event, hint) {
        const error = hint.originalException;
        
        // Filter out browser extension errors
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);
          if (
            message.includes('Extension context invalidated') ||
            message.includes('chrome-extension://') ||
            message.includes('moz-extension://')
          ) {
            return null;
          }
        }
        
        return event;
      },
    });
  }
};

export default Sentry;
