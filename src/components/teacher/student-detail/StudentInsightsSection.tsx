import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface StudentInsightsSectionProps {
  studentId: string;
}

export function StudentInsightsSection({ studentId }: StudentInsightsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  // Fetch AI insights
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_feedback_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('feedback_type', 'insight')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Generate new insights
  const generateInsights = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { studentId },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['ai-insights', studentId] });
      toast({
        title: "Insights Generated",
        description: "New AI learning insights have been created.",
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const latestInsight = insights[0];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Learning Insights
              </CardTitle>
              <CardDescription>
                AI-powered analysis of learning patterns and recommendations
              </CardDescription>
            </div>
            <Button
              onClick={generateInsights}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Latest Insights */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading insights...</p>
          </CardContent>
        </Card>
      ) : latestInsight ? (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Latest Analysis</CardTitle>
                <CardDescription>
                  Generated on {format(new Date(latestInsight.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              {latestInsight.feedback_text.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <div key={index} className="flex items-start gap-3 mb-3">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{paragraph.trim()}</p>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Insights Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate AI-powered insights to understand this student's learning patterns
              </p>
              <Button onClick={generateInsights} disabled={generating}>
                {generating ? 'Generating...' : 'Generate First Insights'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Insights */}
      {insights.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historical Insights</CardTitle>
            <CardDescription>Previous AI analysis reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.slice(1).map((insight) => (
              <div
                key={insight.id}
                className="p-4 border rounded-lg space-y-2 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {format(new Date(insight.created_at), 'MMM d, yyyy')}
                  </span>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {insight.feedback_text.length > 200
                    ? `${insight.feedback_text.substring(0, 200)}...`
                    : insight.feedback_text}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}