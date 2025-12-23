import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogIn, RefreshCw } from 'lucide-react';
import { type FormattedError } from '@/utils/error';

interface AuthErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Specialized Error Boundary for Authentication Components
 * 
 * Provides auth-specific error handling and recovery options.
 */
export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  return (
    <ErrorBoundary
      context={{ component: 'Auth' }}
      fallback={(error: FormattedError, reset: () => void) => (
        <AuthErrorFallback error={error} onReset={reset} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

interface AuthErrorFallbackProps {
  error: FormattedError;
  onReset: () => void;
}

function AuthErrorFallback({ error, onReset }: AuthErrorFallbackProps) {
  const handleSignIn = () => {
    // Clear any stale auth state and redirect to login
    localStorage.removeItem('supabase.auth.token');
    window.location.href = '/auth';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isAuthError = error.category === 'auth';
  const isNetworkError = error.category === 'network' || error.category === 'timeout';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>
            {isAuthError ? 'Authentication Error' : 'Sign In Unavailable'}
          </CardTitle>
          <CardDescription>
            {isAuthError 
              ? 'Your session has expired or is invalid.'
              : isNetworkError
                ? 'Unable to connect to authentication service.'
                : 'There was a problem with authentication.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSignIn} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In Again
            </Button>
            
            {isNetworkError && (
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            )}
            
            {error.canRetry && (
              <Button onClick={onReset} variant="ghost">
                Try Again
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If this problem persists, please contact support.
            <br />
            Error ID: <code className="bg-muted px-1 py-0.5 rounded">{error.id}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthErrorBoundary;
