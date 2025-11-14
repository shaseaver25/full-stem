import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, FileText } from 'lucide-react';
import { StudentAnalysisReviewModal } from './StudentAnalysisReviewModal';

interface SubmissionWithAnalysis {
  id: string;
  user_id: string;
  status: string;
  submitted_at: string;
  student_name: string;
  analysis?: {
    id: string;
    overall_mastery: string;
    confidence_score: number;
    teacher_reviewed: boolean;
    teacher_modified: boolean;
  };
}

interface TeacherAnalysisReviewProps {
  assignmentId: string;
}

const masteryColors = {
  novice: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  developing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  proficient: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export function TeacherAnalysisReview({ assignmentId }: TeacherAnalysisReviewProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithAnalysis | null>(null);

  const { data: submissions, isLoading, refetch } = useQuery({
    queryKey: ['assignment-submissions-analysis', assignmentId],
    queryFn: async () => {
      const { data: subs, error: subsError } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          user_id,
          status,
          submitted_at,
          profiles!inner(full_name)
        `)
        .eq('assignment_id', assignmentId)
        .in('status', ['submitted', 'analyzed', 'graded'])
        .order('submitted_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch analyses for each submission
      const submissionsWithAnalysis = await Promise.all(
        (subs || []).map(async (sub: any) => {
          const { data: analysis } = await supabase
            .from('submission_analyses')
            .select('id, overall_mastery, confidence_score, teacher_reviewed, teacher_modified')
            .eq('submission_id', sub.id)
            .order('created_at', { ascending: false })
            .maybeSingle();

          return {
            id: sub.id,
            user_id: sub.user_id,
            status: sub.status,
            submitted_at: sub.submitted_at,
            student_name: sub.profiles?.full_name || 'Unknown Student',
            analysis: analysis || undefined,
          };
        })
      );

      return submissionsWithAnalysis as SubmissionWithAnalysis[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const analyzedCount = submissions?.filter(s => s.analysis).length || 0;
  const reviewedCount = submissions?.filter(s => s.analysis?.teacher_reviewed).length || 0;
  const modifiedCount = submissions?.filter(s => s.analysis?.teacher_modified).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reviewedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{modifiedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submissions?.map((submission) => (
          <Card
            key={submission.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedSubmission(submission)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{submission.student_name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                {submission.analysis?.teacher_reviewed && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {submission.analysis ? (
                  <>
                    <Badge className={masteryColors[submission.analysis.overall_mastery as keyof typeof masteryColors] || masteryColors.developing}>
                      {submission.analysis.overall_mastery}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(submission.analysis.confidence_score * 100).toFixed(0)}%
                    </div>
                    {submission.analysis.teacher_modified && (
                      <Badge variant="outline" className="text-xs">
                        Modified
                      </Badge>
                    )}
                  </>
                ) : submission.status === 'analyzed' ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>No analysis yet</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <StudentAnalysisReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onReviewed={refetch}
        />
      )}
    </div>
  );
}
