
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import { useAssignments } from '@/hooks/useAssignments';
import { useAuth } from '@/contexts/AuthContext';

interface AssignmentSectionProps {
  lessonId: string;
}

const AssignmentSection: React.FC<AssignmentSectionProps> = ({ lessonId }) => {
  const { user } = useAuth();
  const {
    assignments,
    submissions,
    isLoading,
    textResponse,
    setTextResponse,
    uploadedFiles,
    setUploadedFiles,
    lastSaved,
    submitAssignment,
    isSubmitting,
    uploadFile,
  } = useAssignments(lessonId);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const assignment = assignments?.[0]; // For now, handle the first assignment
  const submission = submissions?.find(s => s.assignment_id === assignment?.id);

  // Load existing submission data
  useEffect(() => {
    if (submission && submission.status === 'draft') {
      setTextResponse(submission.text_response || '');
    }
  }, [submission, setTextResponse]);

  const handleFileUpload = async (files: File[]) => {
    if (!assignment) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const urls = await Promise.all(
        files.map(file => uploadFile(file, assignment.id))
      );
      setFileUrls(prev => [...prev, ...urls]);
    } catch (error) {
      setUploadError('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;

    // Upload any pending files
    if (uploadedFiles.length > 0) {
      await handleFileUpload(uploadedFiles);
    }

    submitAssignment({
      assignmentId: assignment.id,
      textResponse,
      fileUrls,
      fileNames: uploadedFiles.map(f => f.name),
      fileTypes: uploadedFiles.map(f => f.type),
    });
  };

  const handleFileUploadChange = (files: File[]) => {
    setUploadedFiles(files);
    setUploadError(null);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading assignments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>📝 Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No assignments available for this lesson.</p>
        </CardContent>
      </Card>
    );
  }

  const isSubmitted = submission?.status === 'submitted';
  const hasContent = textResponse.trim() || uploadedFiles.length > 0 || fileUrls.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 {assignment.title}
          {isSubmitted && <CheckCircle className="h-5 w-5 text-green-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <div 
            className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: assignment.instructions }}
          />
        </div>

        {/* Submission Status */}
        {isSubmitted && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Assignment submitted at {new Date(submission.submitted_at!).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}

        {/* Your Response Section */}
        {!isSubmitted && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Response</h3>
              {lastSaved && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Draft saved at {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Text Response */}
            {assignment.allow_text_response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Written Response
                </label>
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[120px] w-full"
                  disabled={isSubmitted}
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload
              </label>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={handleFileUploadChange}
                allowedTypes={assignment.file_types_allowed}
                maxFiles={assignment.max_files}
                onError={setUploadError}
              />
            </div>

            {/* Upload Error */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !hasContent || !user || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium"
              >
                {isSubmitting || isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isUploading ? 'Uploading...' : 'Submitting...'}
                  </div>
                ) : (
                  'Submit Assignment'
                )}
              </Button>
            </div>

            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please sign in to submit assignments.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Submitted Response (Read-only) */}
        {isSubmitted && submission && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Submitted Response</h3>
            
            {submission.text_response && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Written Response
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="whitespace-pre-wrap">{submission.text_response}</p>
                </div>
              </div>
            )}

            {submission.file_names && submission.file_names.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submitted Files
                </label>
                <div className="space-y-2">
                  {submission.file_names.map((fileName, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentSection;
