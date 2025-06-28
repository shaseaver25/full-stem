
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AssignmentGradeRow } from '@/hooks/useAssignmentGradebook';

interface EditGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: AssignmentGradeRow;
  onUpdate: (gradeId: string, updates: { grade: number; feedback?: string }) => Promise<boolean>;
}

const EditGradeModal = ({ isOpen, onClose, grade, onUpdate }: EditGradeModalProps) => {
  const [gradeValue, setGradeValue] = useState(grade.grade.toString());
  const [feedback, setFeedback] = useState(grade.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gradeNumber = parseFloat(gradeValue);
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }

    setIsSubmitting(true);
    
    const success = await onUpdate(grade.id, {
      grade: gradeNumber,
      feedback: feedback.trim() || undefined,
    });

    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setGradeValue(grade.grade.toString());
    setFeedback(grade.feedback || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Grade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Student</Label>
            <p className="text-sm text-gray-600">{grade.student_name}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700">Assignment</Label>
            <p className="text-sm text-gray-600">{grade.assignment_title}</p>
          </div>
          
          <div>
            <Label htmlFor="grade">Grade (%)</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Enter feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Grade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGradeModal;
