import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/common/StatusChip";
import { useSubmission } from "@/hooks/useSubmission";
import { FileList } from "@/components/submission/FileList";
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StudentAssignmentDetail() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const { submission, isLoading, resubmit } = useSubmission(assignmentId!);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Assignment not found</p>
            <Button asChild className="mt-4">
              <Link to="/student">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = submission.status === 'assigned' || submission.status === 'draft' || submission.status === 'returned';
  const isSubmitted = submission.status === 'submitted' || submission.status === 'graded';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/student" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">Assignment Details</CardTitle>
              <div className="flex items-center space-x-4">
                <StatusChip status={submission.status} />
                {submission.submitted_at && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Instructions</h3>
            <div className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
              View assignment instructions and requirements here.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Reason */}
      {submission.return_reason && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Returned for revision:</strong> {submission.return_reason}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Submission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Your Submission</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileList 
            files={submission.files || []} 
            canEdit={false}
          />
          
          {submission.files?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files submitted yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {submission.status === 'returned' && (
            <Button onClick={() => resubmit()} variant="outline">
              Start Resubmission
            </Button>
          )}
        </div>
        
        <div className="space-x-2">
          {canEdit && (
            <Button asChild>
              <Link to={`/student/assignments/${assignmentId}/submit`}>
                {submission.status === 'assigned' ? 'Start Submission' : 'Continue Working'}
              </Link>
            </Button>
          )}
          
          {isSubmitted && submission.files && submission.files.length > 0 && (
            <Button variant="outline" asChild>
              <Link to={`/student/assignments/${assignmentId}/submit`}>
                View Submitted Files
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}