import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileEdit, RefreshCw, Save, ArrowLeft, Bug } from 'lucide-react';
import { type FormattedError } from '@/utils/error';

interface EditorErrorBoundaryProps {
  children: ReactNode;
  /** Document/content ID being edited */
  documentId?: string;
  /** Type of editor (lesson, assignment, etc.) */
  editorType?: string;
  /** Callback to trigger save before reset */
  onBeforeReset?: () => Promise<void>;
}

/**
 * Specialized Error Boundary for Editor Components
 * 
 * Provides editor-specific error handling with data recovery options.
 * Attempts to preserve unsaved work when possible.
 */
export function EditorErrorBoundary({ 
  children, 
  documentId,
  editorType = 'Editor',
  onBeforeReset,
}: EditorErrorBoundaryProps) {
  return (
    <ErrorBoundary
      context={{ 
        component: 'Editor', 
        metadata: { documentId, editorType } 
      }}
      fallback={(error: FormattedError, reset: () => void) => (
        <EditorErrorFallback 
          error={error} 
          onReset={reset} 
          editorType={editorType}
          onBeforeReset={onBeforeReset}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

interface EditorErrorFallbackProps {
  error: FormattedError;
  onReset: () => void;
  editorType: string;
  onBeforeReset?: () => Promise<void>;
}

function EditorErrorFallback({ 
  error, 
  onReset, 
  editorType,
  onBeforeReset,
}: EditorErrorFallbackProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveAttempted, setSaveAttempted] = React.useState(false);

  const handleSaveAndReset = async () => {
    if (onBeforeReset) {
      setIsSaving(true);
      try {
        await onBeforeReset();
        setSaveAttempted(true);
      } catch (e) {
        console.error('Failed to save before reset:', e);
      } finally {
        setIsSaving(false);
      }
    }
    onReset();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isDatabaseError = error.category === 'database' || error.category === 'timeout';
  const isValidationError = error.category === 'validation';

  return (
    <div className="flex items-center justify-center p-6 min-h-[400px]">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <FileEdit className="h-6 w-6 text-amber-500" />
          </div>
          <CardTitle>{editorType} Error</CardTitle>
          <CardDescription>
            {isDatabaseError
              ? 'Unable to save your changes. Your work may be preserved locally.'
              : isValidationError
                ? 'There was a problem with the content. Please review and try again.'
                : 'Something went wrong in the editor.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warning about unsaved changes */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Your recent changes may not have been saved. 
              We recommend copying any important content before refreshing.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {onBeforeReset && (
              <Button 
                onClick={handleSaveAndReset} 
                variant="default"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Try Again
                  </>
                )}
              </Button>
            )}
            
            {error.canRetry && (
              <Button onClick={onReset} variant={onBeforeReset ? 'outline' : 'default'}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again (Without Saving)
              </Button>
            )}

            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="ghost" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={handleRefresh} variant="ghost" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Save status */}
          {saveAttempted && (
            <p className="text-sm text-green-600 dark:text-green-400 text-center">
              ✓ Save attempted - your work may be preserved
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

export default EditorErrorBoundary;
