
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAssignmentSubmissions, SubmissionWithDetails } from '@/hooks/useAssignmentSubmissions';
import GradingModal from './GradingModal';
import { Download, FileText, GraduationCap, Calendar, User, Filter } from 'lucide-react';

const AssignmentSubmissionsDashboard = () => {
  const [showUngradedOnly, setShowUngradedOnly] = useState(false);
  const { submissions, loading, refetch } = useAssignmentSubmissions(showUngradedOnly);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);

  const handleGradeSubmission = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setGradingModalOpen(true);
  };

  const handleGradeSubmitted = () => {
    refetch();
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Assignment Submissions
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label htmlFor="ungraded-filter" className="text-sm font-medium">
                Ungraded only
              </Label>
              <Switch
                id="ungraded-filter"
                checked={showUngradedOnly}
                onCheckedChange={setShowUngradedOnly}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {showUngradedOnly ? 'No ungraded submissions found' : 'No submitted assignments found'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {showUngradedOnly 
                  ? 'All submissions have been graded!' 
                  : 'Submissions will appear here once students submit their work'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium">{submission.student_name}</p>
                            {submission.student_email && (
                              <p className="text-sm text-gray-500">{submission.student_email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{submission.assignment_title}</p>
                        {submission.text_response && (
                          <Badge variant="outline" className="mt-1">
                            Has Text Response
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(submission.submitted_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(submission.submitted_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.has_grade ? (
                          <Badge variant="secondary">Graded</Badge>
                        ) : (
                          <Badge variant="destructive">Ungraded</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.file_urls && submission.file_urls.length > 0 ? (
                          <div className="space-y-1">
                            {submission.file_urls.map((fileUrl, index) => {
                              const fileName = submission.file_names?.[index] || `File ${index + 1}`;
                              return (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(fileUrl, fileName)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  {fileName}
                                </Button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No files</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleGradeSubmission(submission)}
                          size="sm"
                          variant={submission.has_grade ? "outline" : "default"}
                        >
                          {submission.has_grade ? "Edit Grade" : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <GradingModal
        open={gradingModalOpen}
        onOpenChange={setGradingModalOpen}
        submission={selectedSubmission}
        onGradeSubmitted={handleGradeSubmitted}
      />
    </div>
  );
};

export default AssignmentSubmissionsDashboard;
