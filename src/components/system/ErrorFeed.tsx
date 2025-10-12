import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ErrorEntry {
  id: string;
  message: string;
  component?: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
}

interface ErrorFeedProps {
  errors: ErrorEntry[];
  isLoading?: boolean;
}

export const ErrorFeed = ({ errors, isLoading }: ErrorFeedProps) => {
  const severityConfig = {
    error: { color: 'destructive', icon: '🔴' },
    warning: { color: 'secondary', icon: '🟡' },
    info: { color: 'default', icon: '🔵' },
  };

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Errors & Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent Errors & Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent errors or events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => {
                const config = severityConfig[error.severity];
                return (
                  <div
                    key={error.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="text-lg">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.color as any} className="text-xs">
                          {error.severity.toUpperCase()}
                        </Badge>
                        {error.component && (
                          <span className="text-xs text-muted-foreground">
                            {error.component}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium break-words">
                        {error.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
