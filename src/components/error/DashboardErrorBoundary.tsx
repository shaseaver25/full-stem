import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, RefreshCw, Home, Bug } from 'lucide-react';
import { type FormattedError } from '@/utils/error';

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  /** Dashboard section name for context */
  section?: string;
}

/**
 * Specialized Error Boundary for Dashboard Components
 * 
 * Provides dashboard-specific error handling with data refresh options.
 */
export function DashboardErrorBoundary({ children, section = 'Dashboard' }: DashboardErrorBoundaryProps) {
  return (
    <ErrorBoundary
      context={{ component: 'Dashboard', metadata: { section } }}
      fallback={(error: FormattedError, reset: () => void) => (
        <DashboardErrorFallback error={error} onReset={reset} section={section} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

interface DashboardErrorFallbackProps {
  error: FormattedError;
  onReset: () => void;
  section: string;
}

function DashboardErrorFallback({ error, onReset, section }: DashboardErrorFallbackProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const isDatabaseError = error.category === 'database' || error.category === 'timeout';
  const isNetworkError = error.category === 'network';

  return (
    <div className="flex items-center justify-center p-6 min-h-[300px]">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-orange-500" />
          </div>
          <CardTitle>{section} Temporarily Unavailable</CardTitle>
          <CardDescription>
            {isDatabaseError
              ? 'We\'re having trouble loading your data. This is usually temporary.'
              : isNetworkError
                ? 'Unable to connect to the server. Please check your connection.'
                : 'Something went wrong while loading this section.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            {error.canRetry && (
              <Button onClick={onReset} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Section
              </Button>
            )}
            <Button onClick={handleRefresh} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={handleGoHome} variant="ghost" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Timeout-specific message */}
          {isDatabaseError && (
            <p className="text-sm text-muted-foreground text-center">
              If this persists, our database may be experiencing high load. 
              Please try again in a few minutes.
            </p>
          )}

          {/* Technical details in dev mode */}
          {import.meta.env.DEV && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md overflow-auto max-h-32">
                <pre className="text-xs whitespace-pre-wrap">
                  {error.category}: {error.message}
                </pre>
              </div>
            </details>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Error ID: <code className="bg-muted px-1 py-0.5 rounded">{error.id}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardErrorBoundary;
