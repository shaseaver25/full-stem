import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Bug } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { isDev, isProd, env } from '@/utils/env';
import { toast } from 'sonner';

/**
 * Development-only component to test Sentry integration
 * Shows current Sentry status and allows triggering test errors
 */
export function SentryTestButton() {
  const [testSent, setTestSent] = useState(false);
  
  const hasSentryDsn = !!env.VITE_SENTRY_DSN;
  const sentryActive = isProd && hasSentryDsn;

  const triggerTestError = () => {
    try {
      // Capture a test message
      Sentry.captureMessage('Sentry test message - integration verified', 'info');
      
      // Also capture a test exception
      Sentry.captureException(new Error('Sentry test error - integration verified'), {
        tags: {
          test: 'true',
          context: 'SentryTestButton',
        },
        extra: {
          timestamp: new Date().toISOString(),
          environment: env.MODE,
        },
      });
      
      setTestSent(true);
      toast.success('Test error sent to Sentry!', {
        description: sentryActive 
          ? 'Check your Sentry dashboard for the error.' 
          : 'Note: Sentry only captures in production.',
      });
    } catch (error) {
      toast.error('Failed to send test error', {
        description: String(error),
      });
    }
  };

  // Show in development OR when ?sentry-test=true is in URL (for production testing)
  const showTestButton = isDev || new URLSearchParams(window.location.search).get('sentry-test') === 'true';
  if (!showTestButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bug className="h-5 w-5 text-muted-foreground" />
        <span className="font-semibold text-sm">Sentry Status</span>
      </div>
      
      <div className="space-y-2 text-xs mb-3">
        <div className="flex items-center gap-2">
          {hasSentryDsn ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span>DSN: {hasSentryDsn ? 'Configured' : 'Not set'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {sentryActive ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span>Status: {sentryActive ? 'Active (prod)' : isDev ? 'Dev mode (inactive)' : 'Inactive'}</span>
        </div>
      </div>

      <Button
        onClick={triggerTestError}
        variant={testSent ? 'outline' : 'default'}
        size="sm"
        className="w-full"
      >
        {testSent ? 'Test Sent ✓' : 'Send Test Error'}
      </Button>
      
      {isDev && !sentryActive && (
        <p className="text-xs text-muted-foreground mt-2">
          Sentry only captures errors in production builds.
        </p>
      )}
    </div>
  );
}
