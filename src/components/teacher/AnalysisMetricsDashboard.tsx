import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Edit, Check, FileText } from 'lucide-react';

export function AnalysisMetricsDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analysis-metrics'],
    queryFn: async () => {
      // Fetch all teacher reviews
      const { data: reviews, error } = await supabase
        .from('teacher_analysis_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate metrics
      const total = reviews?.length || 0;
      const accepted = reviews?.filter(r => r.action_type === 'accepted').length || 0;
      const modified = reviews?.filter(r => r.action_type === 'modified').length || 0;
      const notesAdded = reviews?.filter(r => r.action_type === 'notes_added').length || 0;
      const overridden = reviews?.filter(r => r.action_type === 'override_score').length || 0;

      const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

      // Analyze modification patterns
      const modificationPatterns: Record<string, number> = {};
      reviews?.forEach(review => {
        if (review.action_type === 'modified' && review.changes_made) {
          const changes = review.changes_made as any;
          if (changes.original_feedback !== changes.new_feedback) {
            modificationPatterns['feedback'] = (modificationPatterns['feedback'] || 0) + 1;
          }
          if (JSON.stringify(changes.original_strengths) !== JSON.stringify(changes.new_strengths)) {
            modificationPatterns['strengths'] = (modificationPatterns['strengths'] || 0) + 1;
          }
          if (JSON.stringify(changes.original_growth) !== JSON.stringify(changes.new_growth)) {
            modificationPatterns['areas_for_growth'] = (modificationPatterns['areas_for_growth'] || 0) + 1;
          }
        }
      });

      const topModifications = Object.entries(modificationPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return {
        total,
        accepted,
        modified,
        notesAdded,
        overridden,
        acceptanceRate,
        topModifications,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Feedback Acceptance Rate</CardTitle>
          <CardDescription>
            Percentage of AI-generated feedback accepted without modification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{metrics.acceptanceRate.toFixed(1)}%</span>
              <Badge variant={metrics.acceptanceRate > 80 ? 'default' : 'secondary'}>
                {metrics.acceptanceRate > 80 ? 'Excellent' : 'Good'}
              </Badge>
            </div>
            <Progress value={metrics.acceptanceRate} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {metrics.accepted} of {metrics.total} reviews accepted without changes
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accepted}</div>
            <p className="text-xs text-muted-foreground">
              One-click approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">Modified</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.modified}</div>
            <p className="text-xs text-muted-foreground">
              Feedback edited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium">Notes Added</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.notesAdded}</div>
            <p className="text-xs text-muted-foreground">
              Teacher observations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-medium">Overridden</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overridden}</div>
            <p className="text-xs text-muted-foreground">
              Manual scores
            </p>
          </CardContent>
        </Card>
      </div>

      {metrics.topModifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Frequently Modified Criteria</CardTitle>
            <CardDescription>
              Areas where teachers most often adjust AI feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topModifications.map(([criterion, count]) => (
                <div key={criterion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {criterion.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} modifications
                    </span>
                  </div>
                  <Progress value={(count / metrics.modified) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">Why This Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>For Teachers:</strong> High acceptance rates mean less time grading, more time teaching. AI handles the routine, you focus on what matters.
          </p>
          <p>
            <strong>For Administrators:</strong> Quantifiable ROI. "{metrics.acceptanceRate.toFixed(0)}% AI acceptance rate" translates to measurable time savings and consistent feedback quality.
          </p>
          <p>
            <strong>For Product Development:</strong> Modification patterns reveal exactly where AI needs improvement. This data drives smarter model training.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
