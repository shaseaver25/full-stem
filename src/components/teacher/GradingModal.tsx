
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssignmentGrading } from '@/hooks/useAssignmentGrading';
import { useRubrics } from '@/hooks/useRubrics';
import { useRubricGrading } from '@/hooks/useRubricGrading';
import { SubmissionWithDetails } from '@/hooks/useAssignmentSubmissions';
import { Download, FileText, Image, Video, Plus } from 'lucide-react';
import RubricCreator from './RubricCreator';

interface GradingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionWithDetails | null;
  onGradeSubmitted: () => void;
}

const GradingModal = ({ open, onOpenChange, submission, onGradeSubmitted }: GradingModalProps) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rubricGrades, setRubricGrades] = useState<Record<string, { points: number; feedback: string }>>({});
  const [showRubricCreator, setShowRubricCreator] = useState(false);
  const [gradingMode, setGradingMode] = useState<'manual' | 'rubric'>('manual');
  
  const { submitGrade, loading } = useAssignmentGrading();
  const { rubrics, loading: rubricsLoading, refetch: refetchRubrics } = useRubrics(submission?.assignment_id);
  const { rubricGrades: existingRubricGrades, submitRubricGrades, loading: rubricGradingLoading } = useRubricGrading(submission?.id);

  // Reset form when modal opens with new submission
  useEffect(() => {
    if (submission && open) {
      setGrade('');
      setFeedback('');
      setRubricGrades({});
      
      // Set grading mode based on available rubrics
      if (rubrics.length > 0) {
        setGradingMode('rubric');
        
        // Pre-fill existing rubric grades
        const existingGrades: Record<string, { points: number; feedback: string }> = {};
        existingRubricGrades.forEach(grade => {
          existingGrades[grade.criterion_id] = {
            points: grade.points_earned,
            feedback: grade.feedback || ''
          };
        });
        setRubricGrades(existingGrades);
      } else {
        setGradingMode('manual');
      }
    }
  }, [submission, open, rubrics, existingRubricGrades]);

  const handleManualGradeSubmit = async () => {
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

  const handleRubricGradeSubmit = async () => {
    if (!submission || rubrics.length === 0) return;

    const currentRubric = rubrics[0]; // Assuming one rubric per assignment for now
    const grades = currentRubric.criteria.map(criterion => ({
      criterion_id: criterion.id,
      points_earned: rubricGrades[criterion.id]?.points || 0,
      feedback: rubricGrades[criterion.id]?.feedback || undefined,
    }));

    const success = await submitRubricGrades(grades);

    if (success) {
      onGradeSubmitted();
      onOpenChange(false);
    }
  };

  const updateRubricGrade = (criterionId: string, field: 'points' | 'feedback', value: number | string) => {
    setRubricGrades(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value
      }
    }));
  };

  const calculateRubricTotal = () => {
    if (rubrics.length === 0) return 0;
    const currentRubric = rubrics[0];
    return currentRubric.criteria.reduce((sum, criterion) => {
      return sum + (rubricGrades[criterion.id]?.points || 0);
    }, 0);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
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

  if (!submission) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Submission Details */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Student</Label>
                    <p className="text-lg font-semibold">{submission.student_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Assignment</Label>
                    <p className="text-lg font-semibold">{submission.assignment_title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                    <p>{new Date(submission.submitted_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge variant="secondary">{submission.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Response */}
            {submission.text_response && (
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium text-gray-600">Text Response</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-wrap">{submission.text_response}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Attachments */}
            {submission.file_urls && submission.file_urls.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium text-gray-600 mb-3 block">File Attachments</Label>
                  <div className="space-y-2">
                    {submission.file_urls.map((fileUrl, index) => {
                      const fileName = submission.file_names?.[index] || `File ${index + 1}`;
                      const fileType = submission.file_types?.[index] || '';
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(fileType)}
                            <span className="text-sm font-medium">{fileName}</span>
                            {fileType && <Badge variant="outline" className="text-xs">{fileType}</Badge>}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(fileUrl, fileName)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grading Section */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-600">Grade Submission</Label>
                  {rubrics.length === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRubricCreator(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Rubric
                    </Button>
                  )}
                </div>

                <Tabs value={gradingMode} onValueChange={(value) => setGradingMode(value as 'manual' | 'rubric')}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="manual">Manual Grading</TabsTrigger>
                    {rubrics.length > 0 && (
                      <TabsTrigger value="rubric">Rubric Grading</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade (e.g., 85)"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add feedback for the student..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleManualGradeSubmit}
                        disabled={!grade || loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Grade'}
                      </Button>
                    </div>
                  </TabsContent>

                  {rubrics.length > 0 && (
                    <TabsContent value="rubric" className="space-y-4">
                      {rubrics.map(rubric => (
                        <div key={rubric.id} className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{rubric.name}</h3>
                            {rubric.description && (
                              <p className="text-sm text-gray-600 mt-1">{rubric.description}</p>
                            )}
                          </div>

                          {rubric.criteria.map(criterion => (
                            <Card key={criterion.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{criterion.name}</h4>
                                      {criterion.description && (
                                        <p className="text-sm text-gray-600">{criterion.description}</p>
                                      )}
                                    </div>
                                    <Badge variant="outline">
                                      Max: {criterion.max_points} pts
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label htmlFor={`points-${criterion.id}`}>Points Earned</Label>
                                      <Input
                                        id={`points-${criterion.id}`}
                                        type="number"
                                        min="0"
                                        max={criterion.max_points}
                                        step="0.1"
                                        value={rubricGrades[criterion.id]?.points || ''}
                                        onChange={(e) => updateRubricGrade(criterion.id, 'points', parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`feedback-${criterion.id}`}>Feedback</Label>
                                      <Textarea
                                        id={`feedback-${criterion.id}`}
                                        value={rubricGrades[criterion.id]?.feedback || ''}
                                        onChange={(e) => updateRubricGrade(criterion.id, 'feedback', e.target.value)}
                                        placeholder="Optional feedback..."
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          <div className="p-4 bg-blue-50 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Score:</span>
                              <span className="text-xl font-bold">
                                {calculateRubricTotal()} / {rubric.total_points}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRubricGradeSubmit}
                          disabled={rubricGradingLoading}
                        >
                          {rubricGradingLoading ? 'Submitting...' : 'Submit Rubric Grade'}
                        </Button>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <RubricCreator
        open={showRubricCreator}
        onOpenChange={setShowRubricCreator}
        assignmentId={submission.assignment_id}
        onRubricCreated={refetchRubrics}
      />
    </>
  );
};

export default GradingModal;
