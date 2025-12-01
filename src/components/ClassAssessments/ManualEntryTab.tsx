import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, CheckSquare, FileText, AlignLeft, GripVertical } from 'lucide-react';

interface ManualEntryTabProps {
  classId: string;
  onSuccess: () => void;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  text: string;
  points: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  rubric?: string;
}

export const ManualEntryTab = ({ classId, onSuccess }: ManualEntryTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      points: 1,
    };

    if (type === 'multiple_choice') {
      newQuestion.options = [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false },
      ];
    } else if (type === 'true_false') {
      newQuestion.options = [
        { id: 'true', text: 'True', isCorrect: false },
        { id: 'false', text: 'False', isCorrect: false },
      ];
    }

    setQuestions([...questions, newQuestion]);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an assessment title',
        variant: 'destructive',
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one question',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('class_assessments')
        .insert({
          class_id: classId,
          title,
          description,
          instructions,
          time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
          due_date: dueDate || null,
          allow_multiple_attempts: allowMultipleAttempts,
          show_correct_answers: showCorrectAnswers,
          shuffle_questions: shuffleQuestions,
          created_by: user.id,
          total_points: questions.reduce((sum, q) => sum + q.points, 0),
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Create questions
      const questionInserts = questions.map((q, index) => ({
        assessment_id: assessment.id,
        question_type: q.type,
        question_text: q.text,
        points: q.points,
        display_order: index,
        options: q.options ? JSON.stringify(q.options) : null,
        correct_answer: q.correctAnswer || null,
        rubric: q.rubric || null,
      }));

      const { error: questionsError } = await supabase
        .from('class_assessment_questions')
        .insert(questionInserts);

      if (questionsError) throw questionsError;

      toast({
        title: 'Success',
        description: 'Assessment created successfully',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create assessment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Assessment Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Unit 1 Assessment"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of what this assessment covers"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="instructions">Instructions for Students</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Provide detailed instructions for completing this assessment"
            rows={4}
          />
        </div>

        <Card className="p-4 space-y-3">
          <h4 className="font-medium">Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="Leave empty for no limit"
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multiple-attempts"
                checked={allowMultipleAttempts}
                onCheckedChange={(checked) => setAllowMultipleAttempts(checked as boolean)}
              />
              <Label htmlFor="multiple-attempts" className="cursor-pointer">
                Allow Multiple Attempts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-answers"
                checked={showCorrectAnswers}
                onCheckedChange={(checked) => setShowCorrectAnswers(checked as boolean)}
              />
              <Label htmlFor="show-answers" className="cursor-pointer">
                Show Correct Answers After Submission
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
              />
              <Label htmlFor="shuffle" className="cursor-pointer">
                Shuffle Questions
              </Label>
            </div>
          </div>
        </Card>

        <div>
          <h4 className="font-medium mb-2">Questions ({questions.length})</h4>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('multiple_choice')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add Multiple Choice
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('true_false')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add True/False
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('short_answer')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Short Answer
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuestion('essay')}
            >
              <AlignLeft className="h-4 w-4 mr-2" />
              Add Essay
            </Button>
          </div>

          {questions.length > 0 && (
            <div className="mt-4 space-y-2">
              {questions.map((q, index) => (
                <Card key={q.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Q{index + 1}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {q.type.replace('_', ' ')}
                        </span>
                      </div>
                      <Input
                        placeholder="Question text"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[index].text = e.target.value;
                          setQuestions(updated);
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Assessment'}
        </Button>
      </div>
    </div>
  );
};