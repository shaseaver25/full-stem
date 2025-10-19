
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

// Accessibility testing in development
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    if (axe && axe.default) {
      const axeCore = axe.default;
      axeCore(StrictMode, createRoot, 1000, {
        rules: [
          // Configure axe-core rules for comprehensive testing
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'label', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'aria-hidden-focus', enabled: true },
          { id: 'aria-valid-attr', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
          { id: 'keyboard-focus', enabled: true },
        ]
      });
      console.log('🔍 Accessibility monitoring active (axe-core) - Check console for violations');
    }
  }).catch((err) => {
    console.warn('Could not load axe-core for accessibility testing:', err);
  });
}

// Initialize Sentry for production error logging
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    environment: import.meta.env.MODE,
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Sentry.ErrorBoundary 
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">
              We've been notified and are working on a fix. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && (
              <details className="text-left text-sm">
                <summary className="cursor-pointer font-medium">Error Details (Dev Only)</summary>
                <pre className="mt-2 p-4 bg-muted rounded overflow-auto">
                  {error?.toString()}
                </pre>
              </details>
            )}
            <button 
              onClick={resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      showDialog={false}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
