import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Lightbulb, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Insight {
  id: string;
  feedback_text: string;
  created_at: string;
}

interface StudentInsightsPanelProps {
  insights: Insight[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function StudentInsightsPanel({
  insights,
  isLoading,
  onRefresh,
  isRefreshing,
}: StudentInsightsPanelProps) {
  const latestInsight = insights[0];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading insights...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Learning Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your learning strengths and opportunities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latestInsight ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights yet</h3>
            <p className="text-muted-foreground mb-4">
              Click "Refresh" to generate your first learning insights
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Updated {formatDistanceToNow(new Date(latestInsight.created_at), { addSuffix: true })}
            </div>

            <div className="space-y-3">
              {latestInsight.feedback_text.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{paragraph.trim()}</p>
                  </div>
                )
              ))}
            </div>

            {insights.length > 1 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Previous insights:</p>
                <div className="space-y-2">
                  {insights.slice(1, 3).map((insight) => (
                    <details key={insight.id} className="group">
                      <summary className="cursor-pointer text-sm text-primary hover:underline">
                        {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2 pl-4">
                        {insight.feedback_text.substring(0, 150)}...
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}