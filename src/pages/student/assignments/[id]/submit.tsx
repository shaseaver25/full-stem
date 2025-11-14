import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusChip } from "@/components/common/StatusChip";
import { SubmissionUploader } from "@/components/submission/SubmissionUploader";
import { FileList } from "@/components/submission/FileList";
import { SubmissionAnalysisFeedback } from "@/components/submission/SubmissionAnalysisFeedback";
import { useSubmission } from "@/hooks/useSubmission";
import { useSubmissionAnalysis } from "@/hooks/useSubmissionAnalysis";
import { ArrowLeft, AlertCircle, CheckCircle, Upload, Loader2 } from "lucide-react";

export default function StudentAssignmentSubmit() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { submission, isLoading, addFile, removeFile, submit, resubmit, isSubmitting, isRemoving } = useSubmission(assignmentId!);
  const { data: analysis, isLoading: isAnalysisLoading } = useSubmissionAnalysis(submission?.id || '');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Warn before navigating away if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submission?.status === 'draft' && submission.files?.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submission]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
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
            <div className="flex gap-2 justify-center mt-4">
              <Button asChild variant="outline">
                <Link to="/student">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
              <Button asChild>
                <Link to="/student">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = submission.status === 'assigned' || submission.status === 'draft' || submission.status === 'returned';
  const hasFiles = submission.files && submission.files.length > 0;
  const isSubmitted = submission.status === 'submitted' || submission.status === 'graded';

  const handleSubmit = () => {
    if (!hasFiles) return;
    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    submit();
    setShowConfirmation(false);
    navigate(`/student/assignments/${assignmentId}`);
  };

  // Show success page if already submitted
  if (isSubmitted && !canEdit) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/student/assignments/${assignmentId}`} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Assignment</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <CardTitle className="text-2xl">Assignment Submitted Successfully!</CardTitle>
            <CardDescription>
              Your assignment was submitted on {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'unknown date'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <StatusChip status={submission.status} />
              </div>
              
              <FileList files={submission.files || []} canEdit={false} />
              
              <div className="text-center space-y-2">
                <Button asChild variant="outline">
                  <Link to="/student">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show analyzing state or feedback */}
        {!analysis && (
          <Card>
            <CardContent className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-semibold">Analyzing Your Submission...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Our AI is reviewing your work and preparing personalized feedback.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show AI feedback when ready */}
        {analysis && <SubmissionAnalysisFeedback analysis={analysis} />}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/student/assignments/${assignmentId}`} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Details</span>
            </Link>
          </Button>
        </div>
        <StatusChip status={submission.status} />
      </div>

      {/* Return reason alert */}
      {submission.return_reason && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Returned for revision:</strong> {submission.return_reason}
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Section */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Files</span>
            </CardTitle>
            <CardDescription>
              Upload your assignment files. You can upload multiple files up to 100MB each.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionUploader
              assignmentId={assignmentId!}
              onFileUploaded={addFile}
            />
          </CardContent>
        </Card>
      )}

      {/* Current Files */}
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>
            {canEdit ? 'Files you have uploaded for this assignment' : 'Your submitted files'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileList 
            files={submission.files || []} 
            onRemove={canEdit ? removeFile : undefined}
            canEdit={canEdit && !isRemoving}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {hasFiles ? (
              `${submission.files?.length || 0} file(s) ready for submission`
            ) : (
              'Upload at least one file to submit'
            )}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!hasFiles || isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <strong>Are you sure you want to submit this assignment?</strong>
              <p className="text-sm mt-2">
                Once submitted, you will not be able to make changes unless your teacher allows resubmission.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={confirmSubmit} size="sm">
                Yes, Submit
              </Button>
              <Button onClick={() => setShowConfirmation(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}