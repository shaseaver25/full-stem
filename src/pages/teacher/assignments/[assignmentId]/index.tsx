import { useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/common/StatusChip";
import { useTeacherSubmissions } from "@/hooks/useTeacherSubmissions";
import { ArrowLeft, Download, RotateCcw, FileText } from "lucide-react";

export default function TeacherAssignmentDetail() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { submissions, isLoading, requestResubmission, isRequestingResubmission, createSignedUrl } = useTeacherSubmissions(assignmentId!);
  const [resubmissionReason, setResubmissionReason] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');

  const handleRequestResubmission = () => {
    if (selectedSubmissionId && resubmissionReason.trim()) {
      requestResubmission({
        submissionId: selectedSubmissionId,
        reason: resubmissionReason.trim()
      });
      setResubmissionReason('');
      setSelectedSubmissionId('');
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const signedUrl = await createSignedUrl(filePath);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
    const draft = submissions.filter(s => s.status === 'draft').length;
    const returned = submissions.filter(s => s.status === 'returned').length;
    
    return { total, submitted, draft, returned };
  };

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

  const stats = getSubmissionStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/teacher/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Assignment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Assignment Submissions</CardTitle>
          <CardDescription>
            Review student submissions and provide feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.returned}</div>
              <div className="text-sm text-muted-foreground">Returned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.student_name}</div>
                      <div className="text-sm text-muted-foreground">{submission.student_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={submission.status} size="sm" />
                    {submission.return_reason && (
                      <div className="text-xs text-orange-600 mt-1">
                        Reason: {submission.return_reason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.files && submission.files.length > 0 ? (
                      <div className="space-y-1">
                        {submission.files.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDownloadFile(file.path, file.name)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No files</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.submitted_at ? (
                      new Date(submission.submitted_at).toLocaleString()
                    ) : (
                      <span className="text-muted-foreground">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {(submission.status === 'submitted' || submission.status === 'graded') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSubmissionId(submission.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Request Resubmission
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Resubmission</DialogTitle>
                              <DialogDescription>
                                Ask {submission.student_name} to resubmit their work. Provide a reason for the request.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="reason">Reason for resubmission</Label>
                                <Input
                                  id="reason"
                                  value={resubmissionReason}
                                  onChange={(e) => setResubmissionReason(e.target.value)}
                                  placeholder="e.g., Please include your calculations..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleRequestResubmission}
                                disabled={!resubmissionReason.trim() || isRequestingResubmission}
                              >
                                {isRequestingResubmission ? 'Sending...' : 'Request Resubmission'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {submissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}