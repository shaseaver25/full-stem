import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuestionBankManager } from './QuestionBankManager';
import { type QuestionBankQuestion } from '@/hooks/useQuestionBank';

interface QuestionBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestions: (questions: QuestionBankQuestion[]) => void;
}

export const QuestionBankModal = ({
  open,
  onOpenChange,
  onAddQuestions,
}: QuestionBankModalProps) => {
  const handleAddToQuiz = (questions: QuestionBankQuestion[]) => {
    onAddQuestions(questions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Question Bank</DialogTitle>
          <DialogDescription>
            Select questions from your question bank to add to this quiz
          </DialogDescription>
        </DialogHeader>
        <QuestionBankManager onAddToQuiz={handleAddToQuiz} />
      </DialogContent>
    </Dialog>
  );
};
