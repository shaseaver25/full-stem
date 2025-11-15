import { useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/common/StatusChip";
import { useTeacherSubmissions } from "@/hooks/useTeacherSubmissions";
import { StudentAnalysisReviewModal } from "@/components/teacher/StudentAnalysisReviewModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, RotateCcw, FileText, Sparkles, Loader2, Eye } from "lucide-react";

export default function TeacherAssignmentDetail() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { submissions, isLoading, requestResubmission, isRequestingResubmission, createSignedUrl } = useTeacherSubmissions(assignmentId!);
  const [resubmissionReason, setResubmissionReason] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [selectedSubmissionForModal, setSelectedSubmissionForModal] = useState<{ id: string; user_id: string; student_name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analyses for all submissions
  const { data: analyses } = useQuery({
    queryKey: ['submission-analyses', assignmentId],
    queryFn: async () => {
      const submissionIds = submissions.map(s => s.id);
      if (submissionIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('submission_analyses')
        .select('submission_id, id')
        .in('submission_id', submissionIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!submissions && submissions.length > 0
  });

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

  const handleAnalyze = async (submissionId: string) => {
    setIsAnalyzing(submissionId);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-submission', {
        body: {
          submissionId: submissionId,
          rubricId: null
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Analysis Complete',
        description: 'AI analysis has been completed for this submission'
      });
      
      // Refresh the analyses list
      queryClient.invalidateQueries({ queryKey: ['submission-analyses', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', assignmentId] });
      
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze submission',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(null);
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
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/teacher/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link to={`/student/assignments/${assignmentId}`} target="_blank" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>View as Student</span>
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
                        <>
                          {/* Analyze with AI / View Analysis Button */}
                          {(() => {
                            const hasAnalysis = analyses?.some(a => a.submission_id === submission.id);
                            const analyzing = isAnalyzing === submission.id;
                            
                            if (hasAnalysis) {
                              return (
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedSubmissionForModal({
                                    id: submission.id,
                                    user_id: submission.user_id,
                                    student_name: submission.student_name
                                  })}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Analysis
                                </Button>
                              );
                            }
                            
                            return (
                              <Button
                                size="sm"
                                onClick={() => handleAnalyze(submission.id)}
                                disabled={analyzing}
                              >
                                {analyzing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-1" />
                                    Analyze with AI
                                  </>
                                )}
                              </Button>
                            );
                          })()}
                          
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
                        </>
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

      {/* Analysis Review Modal */}
      {selectedSubmissionForModal && (
        <StudentAnalysisReviewModal
          submission={selectedSubmissionForModal}
          onClose={() => setSelectedSubmissionForModal(null)}
          onReviewed={() => {
            queryClient.invalidateQueries({ queryKey: ['submission-analyses', assignmentId] });
            queryClient.invalidateQueries({ queryKey: ['teacher', 'submissions', assignmentId] });
            setSelectedSubmissionForModal(null);
          }}
        />
      )}
    </div>
  );
}