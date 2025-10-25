
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { ThemeProvider } from "next-themes";
import App from './App.tsx';
import './index.css';
import { initWebVitalsTracking } from "./utils/webVitals";
import { isDev, isProd } from "./utils/env";
import { initSentry } from "./config/sentry";

// Accessibility testing in development using axe-core
// Note: Due to StrictMode compatibility, we use jest-axe for automated testing
// Manual testing with browser extensions (axe DevTools, WAVE) recommended
if (isDev) {
  console.log('🔍 Accessibility monitoring: Use browser DevTools extensions for live testing');
  console.log('   - axe DevTools: https://www.deque.com/axe/devtools/');
  console.log('   - WAVE: https://wave.webaim.org/extension/');
  console.log('   - Run automated tests: npm run test:a11y');
}

// Initialize Sentry for production error logging
initSentry();

// Initialize Web Vitals tracking in production
if (isProd) {
  initWebVitalsTracking();
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="max-w-md w-full space-y-4 text-center">
              <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
              <p className="text-gray-600">
                We've been notified and are working on a fix. Please try refreshing the page.
              </p>
              {isDev && (
                <details className="text-left text-sm">
                  <summary className="cursor-pointer font-medium">Error Details (Dev Only)</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                    {error?.toString()}
                  </pre>
                </details>
              )}
              <button 
                onClick={resetError}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    </ThemeProvider>
  </StrictMode>
);
