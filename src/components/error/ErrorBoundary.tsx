import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureRenderError, type ErrorContext, type FormattedError } from '@/utils/error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to render on error */
  fallback?: ReactNode | ((error: FormattedError, reset: () => void) => ReactNode);
  /** Context for error logging */
  context?: ErrorContext;
  /** Called when an error is caught */
  onError?: (error: FormattedError) => void;
  /** Whether to show technical details in development */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: FormattedError | null;
  errorCount: number;
}

/**
 * Generic Error Boundary Component
 * 
 * Catches React render errors and displays a fallback UI.
 * Logs errors with full context to the centralized error system.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const formattedError = captureRenderError(error, errorInfo, this.props.context);
    
    this.setState(prev => ({ 
      error: formattedError,
      errorCount: prev.errorCount + 1,
    }));
    
    this.props.onError?.(formattedError);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onRefresh={this.handleRefresh}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails}
          errorCount={this.state.errorCount}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Default Error Fallback Component
// ============================================================================

interface DefaultErrorFallbackProps {
  error: FormattedError;
  onReset: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
  showDetails?: boolean;
  errorCount: number;
}

function DefaultErrorFallback({
  error,
  onReset,
  onRefresh,
  onGoHome,
  showDetails = import.meta.env.DEV,
  errorCount,
}: DefaultErrorFallbackProps) {
  const showRetry = error.canRetry && errorCount < 3;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>{error.userMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {showRetry && (
              <Button onClick={onReset} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={onRefresh} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={onGoHome} variant="ghost" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Error Details (Dev Mode) */}
          {showDetails && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md overflow-auto max-h-48">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  <strong>Error ID:</strong> {error.id}
                  {'\n'}
                  <strong>Category:</strong> {error.category}
                  {'\n'}
                  <strong>Severity:</strong> {error.severity}
                  {'\n'}
                  <strong>Message:</strong> {error.message}
                  {'\n'}
                  <strong>Page:</strong> {error.context.page || 'Unknown'}
                  {'\n'}
                  <strong>Component:</strong> {error.context.component || 'Unknown'}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      <strong>Stack Trace:</strong>
                      {'\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </div>
            </details>
          )}

          {/* Error ID for support */}
          <p className="text-xs text-center text-muted-foreground">
            Error ID: <code className="bg-muted px-1 py-0.5 rounded">{error.id}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
