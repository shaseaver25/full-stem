import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusChip } from "@/components/common/StatusChip";
import { Calendar, Clock, FileText, AlertCircle, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentAssignmentPreviewProps {
  assignmentId: string;
  studentId?: string; // Optional: preview as specific student, or generic view
}

export function StudentAssignmentPreview({ assignmentId, studentId }: StudentAssignmentPreviewProps) {
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment-preview', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_assignments_new')
        .select(`
          *,
          classes(name, subject, grade_level),
          lessons(id, title, description)
        `)
        .eq('id', assignmentId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: submission, isLoading: submissionLoading } = useQuery({
    queryKey: ['submission-preview', assignmentId, studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', studentId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!studentId
  });

  if (assignmentLoading || submissionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load assignment details.</AlertDescription>
      </Alert>
    );
  }

  const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;
  const releaseDate = assignment.release_at ? new Date(assignment.release_at) : null;
  const now = new Date();
  
  const isReleased = !releaseDate || releaseDate <= now;
  const isPastDue = dueDate && dueDate < now;
  const canEdit = submission?.status === 'assigned' || submission?.status === 'draft' || submission?.status === 'returned';
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded';

  return (
    <div className="space-y-6">
      {/* Preview Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a preview of how {studentId ? 'this student sees' : 'students see'} the assignment.
        </AlertDescription>
      </Alert>

      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <div className="flex items-center space-x-4">
                {submission && <StatusChip status={submission.status as any} />}
                {!isReleased && (
                  <Badge variant="secondary">Not Released Yet</Badge>
                )}
                {isPastDue && (
                  <Badge variant="destructive">Past Due</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {releaseDate && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Released:</span>
                <span>{releaseDate.toLocaleDateString()}</span>
              </div>
            )}
            {dueDate && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due:</span>
                <span className={isPastDue ? "text-destructive font-medium" : ""}>
                  {dueDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {assignment.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <div className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {assignment.description}
              </div>
            </div>
          )}

          {assignment.instructions && (
            <div>
              <h3 className="font-medium mb-2">Instructions</h3>
              <div className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {assignment.instructions}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Section */}
      {submission ? (
        <Card>
          <CardHeader>
            <CardTitle>My Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.text_response && (
              <div>
                <h3 className="font-medium mb-2">Response</h3>
                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                  {submission.text_response}
                </div>
              </div>
            )}

            {submission.file_urls && submission.file_urls.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Files</h3>
                <div className="space-y-2">
                  {submission.file_urls.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{submission.file_names?.[idx] || `File ${idx + 1}`}</span>
                      </div>
                      <Badge variant="outline">{submission.file_types?.[idx] || 'file'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submission.submitted_at && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
              </div>
            )}

            {submission.return_reason && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Teacher Feedback:</strong> {submission.return_reason}
                </AlertDescription>
              </Alert>
            )}

            {canEdit && (
              <Button className="w-full" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment (Preview Only)
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  {studentId 
                    ? "This student hasn't started this assignment yet."
                    : "Students will see a submission form here to upload files and enter their response."}
                </AlertDescription>
              </Alert>

              {!studentId && (
                <div className="space-y-4 opacity-50">
                  <div>
                    <label className="text-sm font-medium">Response</label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                      Text entry area (disabled in preview)
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Files</label>
                    <div className="mt-2 p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      File upload area (disabled in preview)
                    </div>
                  </div>

                  <Button className="w-full" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment (Preview Only)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
