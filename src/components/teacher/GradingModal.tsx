
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
import { useGradebook } from '@/hooks/useGradebook';
import { SubmissionWithDetails } from '@/hooks/useAssignmentSubmissions';
import { Download, FileText, Image, Video } from 'lucide-react';

interface GradingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: SubmissionWithDetails | null;
  onGradeSubmitted: () => void;
}

const GradingModal = ({ open, onOpenChange, submission, onGradeSubmitted }: GradingModalProps) => {
  const [pointsEarned, setPointsEarned] = useState('');
  const [pointsPossible, setPointsPossible] = useState('100');
  const [comments, setComments] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { categories, addGrade } = useGradebook();

  // Reset form when modal opens with new submission
  useEffect(() => {
    if (submission && open) {
      setPointsEarned('');
      setComments('');
      // Set default category (first one available)
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }
  }, [submission, open, categories]);

  const handleSubmitGrade = async () => {
    if (!submission || !pointsEarned || !pointsPossible || !categoryId) return;

    const success = await addGrade({
      student_id: submission.user_id,
      assignment_id: submission.assignment_id,
      category_id: categoryId,
      points_earned: parseFloat(pointsEarned),
      points_possible: parseFloat(pointsPossible),
      comments: comments || undefined,
    });

    if (success) {
      onGradeSubmitted();
      onOpenChange(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Assignment Submission</DialogTitle>
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
                          <Badge variant="outline" className="text-xs">{fileType}</Badge>
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

          {/* Grading Form */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium text-gray-600 mb-3 block">Grade Assignment</Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="pointsEarned">Points Earned</Label>
                  <Input
                    id="pointsEarned"
                    type="number"
                    value={pointsEarned}
                    onChange={(e) => setPointsEarned(e.target.value)}
                    placeholder="Enter points earned"
                  />
                </div>
                <div>
                  <Label htmlFor="pointsPossible">Points Possible</Label>
                  <Input
                    id="pointsPossible"
                    type="number"
                    value={pointsPossible}
                    onChange={(e) => setPointsPossible(e.target.value)}
                  />
                </div>
              </div>
              
              {categories.length > 0 && (
                <div className="mb-4">
                  <Label htmlFor="category">Grade Category</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.weight}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add feedback or comments for the student..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitGrade}
                  disabled={!pointsEarned || !pointsPossible || !categoryId}
                >
                  Submit Grade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradingModal;
