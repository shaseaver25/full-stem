import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Edit, RotateCw, FileText, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InlineReadAloud from '@/components/InlineReadAloud';
import { SubmissionAnalysisFeedback } from '@/components/submission/SubmissionAnalysisFeedback';

interface StudentAnalysisReviewModalProps {
  submission: {
    id: string;
    user_id: string;
    student_name: string;
  };
  onClose: () => void;
  onReviewed: () => void;
}

export function StudentAnalysisReviewModal({
  submission,
  onClose,
  onReviewed,
}: StudentAnalysisReviewModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState('');
  const [editedStrengths, setEditedStrengths] = useState<string[]>([]);
  const [editedGrowth, setEditedGrowth] = useState<string[]>([]);
  const [teacherNotes, setTeacherNotes] = useState('');

  // Fetch submission details
  const { data: submissionData, isLoading: submissionLoading } = useQuery({
    queryKey: ['submission-detail', submission.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:class_assignments_new!inner(title)
        `)
        .eq('id', submission.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['submission-analysis-detail', submission.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submission_analyses')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setEditedFeedback(data.personalized_feedback || '');
        setEditedStrengths((data.strengths as string[]) || []);
        setEditedGrowth((data.areas_for_growth as string[]) || []);
        setTeacherNotes(data.teacher_notes || '');
      }
      
      return data;
    },
  });

  // Accept AI feedback mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!analysis?.id) throw new Error('No analysis found');

      // Mark as reviewed
      const { error: updateError } = await supabase
        .from('submission_analyses')
        .update({ teacher_reviewed: true, teacher_modified: false })
        .eq('id', analysis.id);

      if (updateError) throw updateError;

      // Track action
      await supabase.from('teacher_analysis_reviews').insert({
        analysis_id: analysis.id,
        teacher_user_id: user?.id,
        action_type: 'accepted',
        changes_made: null,
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'AI feedback accepted' });
      queryClient.invalidateQueries({ queryKey: ['submission-analysis-detail'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions-analysis'] });
      onReviewed();
      onClose();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to accept feedback', variant: 'destructive' });
    },
  });

  // Modify feedback mutation
  const modifyMutation = useMutation({
    mutationFn: async () => {
      if (!analysis?.id) throw new Error('No analysis found');

      const changes = {
        original_feedback: analysis.personalized_feedback,
        new_feedback: editedFeedback,
        original_strengths: analysis.strengths,
        new_strengths: editedStrengths,
        original_growth: analysis.areas_for_growth,
        new_growth: editedGrowth,
      };

      // Update analysis
      const { error: updateError } = await supabase
        .from('submission_analyses')
        .update({
          personalized_feedback: editedFeedback,
          strengths: editedStrengths,
          areas_for_growth: editedGrowth,
          teacher_reviewed: true,
          teacher_modified: true,
        })
        .eq('id', analysis.id);

      if (updateError) throw updateError;

      // Track modification
      await supabase.from('teacher_analysis_reviews').insert({
        analysis_id: analysis.id,
        teacher_user_id: user?.id,
        action_type: 'modified',
        changes_made: changes,
      });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Feedback updated' });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['submission-analysis-detail'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-submissions-analysis'] });
      onReviewed();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update feedback', variant: 'destructive' });
    },
  });

  // Add teacher notes mutation
  const notesMutation = useMutation({
    mutationFn: async () => {
      if (!analysis?.id) throw new Error('No analysis found');

      const { error } = await supabase
        .from('submission_analyses')
        .update({ teacher_notes: teacherNotes })
        .eq('id', analysis.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Notes saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['submission-analysis-detail', submission.id] });
      onReviewed();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    },
  });

  if (submissionLoading || analysisLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analysis) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Analysis Available</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This submission hasn't been analyzed yet.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{submission.student_name}'s Submission Review</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="student-view">Student View</TabsTrigger>
            <TabsTrigger value="work">Student Work</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {/* Mastery Badge */}
            <div className="flex items-center justify-between">
              <Badge className="text-base px-4 py-1">
                {analysis.overall_mastery} ({(analysis.confidence_score * 100).toFixed(0)}% confidence)
              </Badge>
              {analysis.teacher_reviewed && (
                <Badge variant="outline" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Reviewed
                </Badge>
              )}
            </div>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personalized Feedback</CardTitle>
              </CardHeader>
               <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedFeedback}
                    onChange={(e) => setEditedFeedback(e.target.value)}
                    rows={4}
                    className="mb-2"
                  />
                ) : (
                  <InlineReadAloud text={analysis.personalized_feedback || ''} className="text-muted-foreground" />
                )}
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(isEditing ? editedStrengths : (analysis.strengths as string[]) || []).map((strength, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={strength}
                          onChange={(e) => {
                            const newStrengths = [...editedStrengths];
                            newStrengths[i] = e.target.value;
                            setEditedStrengths(newStrengths);
                          }}
                          className="flex-1 border rounded px-2 py-1"
                        />
                      ) : (
                        <InlineReadAloud text={strength} />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(isEditing ? editedGrowth : (analysis.areas_for_growth as string[]) || []).map((area, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600">→</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={area}
                          onChange={(e) => {
                            const newGrowth = [...editedGrowth];
                            newGrowth[i] = e.target.value;
                            setEditedGrowth(newGrowth);
                          }}
                          className="flex-1 border rounded px-2 py-1"
                        />
                      ) : (
                        <InlineReadAloud text={area} />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Teacher Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher Notes (Private)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Add private notes about this submission..."
                  rows={3}
                />
                <Button
                  onClick={() => notesMutation.mutate()}
                  disabled={!teacherNotes || notesMutation.isPending}
                  className="mt-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending || analysis.teacher_reviewed}
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {analysis.teacher_reviewed ? 'Already Accepted' : 'Accept AI Feedback'}
                  </Button>
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Modify Feedback
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="ghost">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => modifyMutation.mutate()}
                    disabled={modifyMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="student-view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Preview: Student's View of Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This is exactly what the student sees on their submission page.
                </p>
                <SubmissionAnalysisFeedback
                  analysis={{
                    overall_mastery: analysis.overall_mastery as 'novice' | 'developing' | 'proficient' | 'advanced',
                    confidence_score: analysis.confidence_score,
                    personalized_feedback: analysis.personalized_feedback,
                    strengths: analysis.strengths as string[],
                    areas_for_growth: analysis.areas_for_growth as string[],
                    misconceptions: analysis.misconceptions ? (analysis.misconceptions as string[]) : undefined,
                    recommended_actions: analysis.recommended_action ? [analysis.recommended_action as string] : undefined,
                    rubric_scores: analysis.rubric_scores ? (analysis.rubric_scores as any[]) : undefined,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submission Files</CardTitle>
              </CardHeader>
              <CardContent>
                {submissionData?.files && Array.isArray(submissionData.files) && submissionData.files.length > 0 ? (
                  <ul className="space-y-2">
                    {submissionData.files.map((file: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No files submitted</p>
                )}
              </CardContent>
            </Card>

            {submissionData?.text_response && (
              <Card>
                <CardHeader>
                  <CardTitle>Text Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <InlineReadAloud text={submissionData.text_response} className="whitespace-pre-wrap" />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
