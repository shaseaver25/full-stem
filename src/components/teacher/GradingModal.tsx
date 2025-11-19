import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssignmentGrading } from '@/hooks/useAssignmentGrading';
import { SubmissionWithDetails } from '@/hooks/useAssignmentSubmissions';
import { Download, FileText, Image, Video, ExternalLink } from 'lucide-react';

interface GradingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionWithDetails | null;
  onGradeSubmitted: () => void;
}

const GradingModal = ({ open, onOpenChange, submission, onGradeSubmitted }: GradingModalProps) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const { submitGrade, loading } = useAssignmentGrading();

  // Reset form when modal opens with new submission
  useEffect(() => {
    if (submission && open) {
      setGrade('');
      setFeedback('');
    }
  }, [submission, open]);

  const handleSubmit = async () => {
    if (!submission || !grade) return;

    const success = await submitGrade({
      submission_id: submission.id,
      grade: parseFloat(grade),
      feedback: feedback || undefined,
    });

    if (success) {
      onGradeSubmitted();
      onOpenChange(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-4 w-4" />;
    if (fileType.includes('video')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Student: {submission.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={submission.status === 'submitted' ? 'default' : 'secondary'}>
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Files */}
          {submission.files && submission.files.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Submitted Files</h3>
                <div className="space-y-2">
                  {submission.files.map((file: any, index: number) => {
                    const isDriveFile = file.source === 'drive';
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getFileIcon(isDriveFile ? 'application/pdf' : (file.type || ''))}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            {isDriveFile && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Google Drive
                              </Badge>
                            )}
                          </div>
                        </div>
                        {isDriveFile ? (
                          <a
                            href={file.drive_link || file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline whitespace-nowrap ml-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in Drive
                          </a>
                        ) : (
                          <a
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline whitespace-nowrap ml-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legacy file_urls support (fallback) */}
          {(!submission.files || submission.files.length === 0) && submission.file_urls && submission.file_urls.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Submitted Files</h3>
                <div className="space-y-2">
                  {submission.file_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(submission.file_types?.[index] || '')}
                        <span className="text-sm">
                          {submission.file_names?.[index] || `File ${index + 1}`}
                        </span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Response */}
          {submission.text_response && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Text Response</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{submission.text_response}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grading Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="grade">Grade (0-100)</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !grade}
                  >
                    {loading ? 'Submitting...' : 'Submit Grade'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradingModal;
