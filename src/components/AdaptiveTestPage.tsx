import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EXAMPLE_WORK = `Photosynthesis is when plants make food from sunlight. They use chlorophyll in their leaves. The sun's energy helps them convert water and CO2 into glucose.

Plants need sunlight, water, and carbon dioxide to make food. The process happens in the chloroplasts. Without photosynthesis, there wouldn't be any oxygen for us to breathe.

I think photosynthesis is very important for all living things on Earth.`;

const MASTERY_COLORS = {
  emerging: 'bg-yellow-500',
  developing: 'bg-blue-500',
  proficient: 'bg-green-500',
  advanced: 'bg-purple-500',
};

const MASTERY_TEXT_COLORS = {
  emerging: 'text-yellow-700',
  developing: 'text-blue-700',
  proficient: 'text-green-700',
  advanced: 'text-purple-700',
};

export function AdaptiveTestPage() {
  const [studentWork, setStudentWork] = useState(EXAMPLE_WORK);
  const [submissionId, setSubmissionId] = useState('');
  const [rubricId, setRubricId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleCreateSubmission = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a submission');
      }

      // Create a test assignment first (we need one to link to)
      const { data: assignment, error: assignmentError } = await supabase
        .from('class_assignments_new')
        .select('id')
        .limit(1)
        .single();

      let assignmentId = assignment?.id;

      if (assignmentError || !assignmentId) {
        // If no assignment exists, we'll need to create a test class and assignment
        toast({
          title: 'Setup Required',
          description: 'You need at least one class and assignment to test this feature.',
          variant: 'destructive',
        });
        return;
      }

      // Check if submission already exists for this assignment
      const { data: existingSubmission } = await supabase
        .from('assignment_submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();

      let submission;
      
      if (existingSubmission) {
        // Update existing submission
        const { data: updated, error: updateError } = await supabase
          .from('assignment_submissions')
          .update({
            text_response: studentWork,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSubmission.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        submission = updated;
      } else {
        // Create new submission
        const { data: created, error: createError } = await supabase
          .from('assignment_submissions')
          .insert({
            user_id: user.id,
            assignment_id: assignmentId,
            text_response: studentWork,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        submission = created;
      }

      setSubmissionId(submission.id);
      toast({
        title: 'Submission Created',
        description: 'Test submission has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create submission',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!submissionId) {
      toast({
        title: 'Missing Information',
        description: 'Please create a submission first',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-submission', {
        body: {
          submissionId,
          rubricId: rubricId || null,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze submission');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'AI has finished analyzing the submission.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Adaptive Assessment Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered submission analysis with personalized feedback
          </p>
        </div>

        {/* Section 1: Create Test Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </span>
              Create Test Submission
            </CardTitle>
            <CardDescription>
              Enter student work to analyze (or use the pre-filled example)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Student Work</label>
              <Textarea
                value={studentWork}
                onChange={(e) => setStudentWork(e.target.value)}
                rows={8}
                placeholder="Enter student work here..."
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={handleCreateSubmission}
              disabled={isCreating || !studentWork}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Test Submission
                </>
              )}
            </Button>
            {submissionId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Submission Created!</p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  ID: {submissionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Analyze Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </span>
              Analyze Submission
            </CardTitle>
            <CardDescription>
              Run AI analysis on the submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Submission ID</label>
                <Input
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  placeholder="Enter submission ID"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rubric ID (Optional)</label>
                <Input
                  value={rubricId}
                  onChange={(e) => setRubricId(e.target.value)}
                  placeholder="Leave empty for general analysis"
                  className="font-mono"
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !submissionId}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Display Results */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </span>
                Analysis Results
              </CardTitle>
              <CardDescription>AI-generated assessment and feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Metrics */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Overall Mastery Level
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'capitalize text-white',
                        MASTERY_COLORS[analysis.overall_mastery as keyof typeof MASTERY_COLORS]
                      )}
                    >
                      {analysis.overall_mastery}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Confidence Score
                  </p>
                  <p className="text-2xl font-bold">
                    {(analysis.confidence_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Personalized Feedback */}
              {analysis.personalized_feedback && (
                <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Personalized Feedback
                  </h4>
                  <p className="text-sm leading-relaxed">{analysis.personalized_feedback}</p>
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas for Growth */}
              {analysis.areas_for_growth && analysis.areas_for_growth.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                      <TrendingUp className="h-5 w-5" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.areas_for_growth.map((area: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Misconceptions */}
              {analysis.misconceptions && analysis.misconceptions.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Misconceptions to Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.misconceptions.map((misconception: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{misconception}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Actions */}
              {analysis.recommended_action && (
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <p className="text-sm text-muted-foreground">{analysis.recommended_action}</p>
                </div>
              )}

              {/* Rubric Scores */}
              {analysis.rubric_scores && Object.keys(analysis.rubric_scores).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rubric Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analysis.rubric_scores).map(([criterionId, score]: [string, any]) => (
                        <div key={criterionId} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Criterion {criterionId.slice(0, 8)}</p>
                            {score.feedback && (
                              <p className="text-xs text-muted-foreground mt-1">{score.feedback}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {score.score}/{score.maxScore}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdaptiveTestPage;
