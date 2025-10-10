import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useStudentAssignmentDetail } from '@/hooks/useStudentAssignmentDetail';
import { useAssignmentMutations } from '@/hooks/useAssignmentMutations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Calendar } from 'lucide-react';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No due date';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface SubmissionFormData {
  text_response: string;
  file_link: string;
}

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, error } = useStudentAssignmentDetail(id || '');
  const { submitAssignment, isSubmitting } = useAssignmentMutations();

  const { register, handleSubmit, formState: { errors } } = useForm<SubmissionFormData>({
    defaultValues: {
      text_response: '',
      file_link: '',
    },
  });

  const onSubmit = async (formData: SubmissionFormData) => {
    if (!id) return;

    submitAssignment({
      assignmentId: id,
      textResponse: formData.text_response,
      fileUrls: formData.file_link ? [formData.file_link] : [],
      fileNames: [],
      fileTypes: [],
    }, {
      onSuccess: () => {
        toast({
          title: "✅ Assignment Submitted!",
          description: "Your work has been submitted successfully.",
        });
        navigate('/assignments');
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to submit assignment. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/assignments" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Link>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load assignment. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { assignment, submission } = data;
  const isPastDue = assignment.due_at && new Date(assignment.due_at) < new Date();
  const isSubmitted = submission?.status === 'submitted';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/assignments" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>

        {/* Assignment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1 text-base">
                  <span>{assignment.class_name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due {formatDate(assignment.due_at)}</span>
                  </div>
                </CardDescription>
              </div>
              {isSubmitted && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Submitted
                </Badge>
              )}
              {!isSubmitted && isPastDue && (
                <Badge variant="destructive">Past Due</Badge>
              )}
            </div>
          </CardHeader>
          {assignment.description && (
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{assignment.description}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submission Section */}
        {isSubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Submitted on</p>
                <p className="font-medium">{formatDate(submission.submitted_at)}</p>
              </div>
              
              {submission.submission_text && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Response</p>
                  <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {submission.submission_text}
                  </div>
                </div>
              )}
              
              {submission.submission_link && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Link</p>
                  <a 
                    href={submission.submission_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {submission.submission_link}
                  </a>
                </div>
              )}

              {submission.grade !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Grade</p>
                  <p className="font-medium text-lg">{submission.grade}%</p>
                </div>
              )}

              {submission.feedback && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Teacher Feedback</p>
                  <div className="p-4 bg-primary/10 rounded-md">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
              <CardDescription>
                Complete your assignment by providing a written response or a link to your work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text_response">Your Response</Label>
                  <Textarea
                    id="text_response"
                    {...register('text_response', { 
                      required: 'Please provide a response or a link to your work' 
                    })}
                    placeholder="Write your response here..."
                    rows={8}
                    className="resize-none"
                  />
                  {errors.text_response && (
                    <p className="text-sm text-destructive">{errors.text_response.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_link">Link (optional)</Label>
                  <Input
                    id="file_link"
                    {...register('file_link')}
                    placeholder="https://example.com/your-work"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can provide a link to a Google Doc, video, or other online resource
                  </p>
                </div>

                {isPastDue && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">This assignment is past due. You can still submit, but it may be marked as late.</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
