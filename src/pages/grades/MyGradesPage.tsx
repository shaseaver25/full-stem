import { useState } from 'react';
import { useStudentGrades } from '@/hooks/useStudentGrades';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Sparkles, TrendingUp, Award, BookOpen } from 'lucide-react';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getGradeColor = (grade: number) => {
  if (grade >= 90) return 'text-green-600';
  if (grade >= 80) return 'text-blue-600';
  if (grade >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const getGradeLetter = (grade: number) => {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};

export default function MyGradesPage() {
  const { data: grades, isLoading, error, refetch } = useStudentGrades();
  const { toast } = useToast();
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});
  const [performanceSummary, setPerformanceSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const calculateAverageGrade = () => {
    if (!grades || grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + (g.grade || 0), 0);
    return Math.round(total / grades.length);
  };

  const generateAIFeedback = async (submissionId: string, submissionText?: string, grade?: number, teacherFeedback?: string) => {
    setLoadingFeedback(prev => ({ ...prev, [submissionId]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          submissionId,
          submissionText: submissionText || 'No submission text available',
          grade,
          teacherFeedback,
          preferredLanguage: 'en', // TODO: Get from student profile
        },
      });

      if (error) {
        if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
          toast({
            title: "Please wait",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
          toast({
            title: "Service Unavailable",
            description: "AI feedback is temporarily unavailable.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "✨ AI Tips Generated!",
        description: "Personalized learning tips have been added to your submission.",
      });

      // Refresh the grades data to show the new AI feedback
      refetch();

    } catch (err) {
      console.error('Error generating AI feedback:', err);
      toast({
        title: "Error",
        description: "Failed to generate AI tips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const generatePerformanceSummary = async () => {
    if (!grades || grades.length === 0) {
      setPerformanceSummary("Complete some assignments to see your personalized performance summary!");
      return;
    }

    setLoadingSummary(true);

    try {
      const gradesData = grades.map(g => ({
        assignmentTitle: g.assignment_title,
        grade: g.grade,
        teacherFeedback: g.feedback,
      }));

      const { data, error } = await supabase.functions.invoke('generate-performance-summary', {
        body: {
          grades: gradesData,
          preferredLanguage: 'en', // TODO: Get from student profile
        },
      });

      if (error) {
        if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
          toast({
            title: "Please wait",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setPerformanceSummary(data.summary);

    } catch (err) {
      console.error('Error generating performance summary:', err);
      toast({
        title: "Error",
        description: "Failed to generate performance summary.",
        variant: "destructive",
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">My Grades</h1>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load grades. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const averageGrade = calculateAverageGrade();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            My Grades
          </h1>
          <p className="text-muted-foreground">
            Track your progress and get personalized learning tips
          </p>
        </div>

        {/* Overall Statistics */}
        {grades && grades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className={`text-4xl font-bold ${getGradeColor(averageGrade)}`}>
                    {averageGrade}% ({getGradeLetter(averageGrade)})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Graded Assignments</p>
                  <p className="text-2xl font-semibold">{grades.length}</p>
                </div>
              </div>
              <Progress value={averageGrade} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* AI Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              AI-powered insights about your academic progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <p>Analyzing your progress...</p>
              </div>
            ) : performanceSummary ? (
              <div className="space-y-3">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {performanceSummary}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={generatePerformanceSummary}
                >
                  Refresh Summary
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Get personalized insights about your strengths and areas for growth
                </p>
                <Button 
                  onClick={generatePerformanceSummary}
                  disabled={!grades || grades.length === 0}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment List */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Graded Assignments
          </h2>
          
          {!grades || grades.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg mb-2">No graded assignments yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your grades will appear here once your teacher reviews your submissions
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {grades.map((submission) => (
                <AccordionItem 
                  key={submission.id} 
                  value={submission.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="text-left">
                        <p className="font-medium">{submission.assignment_title}</p>
                        <p className="text-sm text-muted-foreground">{submission.class_name}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getGradeColor(submission.grade || 0)} border-current`}
                      >
                        {submission.grade}% ({getGradeLetter(submission.grade || 0)})
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{formatDate(submission.submitted_at)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p className="font-medium">{formatDate(submission.due_at)}</p>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-2">Teacher Feedback</p>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{submission.feedback}</p>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Learning Tips
                          </p>
                          {!submission.ai_feedback && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateAIFeedback(
                                submission.id,
                                submission.text_response,
                                submission.grade,
                                submission.feedback
                              )}
                              disabled={loadingFeedback[submission.id]}
                            >
                              {loadingFeedback[submission.id] ? (
                                <>
                                  <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 mr-2" />
                                  Generate Tips
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {submission.ai_feedback ? (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {submission.ai_feedback}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-2"
                              onClick={() => generateAIFeedback(
                                submission.id,
                                submission.text_response,
                                submission.grade,
                                submission.feedback
                              )}
                              disabled={loadingFeedback[submission.id]}
                            >
                              Regenerate
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Click "Generate Tips" to get personalized AI feedback on your work
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
