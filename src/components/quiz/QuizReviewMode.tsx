import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizReviewModeProps {
  attemptId: string;
  onClose: () => void;
}

interface ReviewQuestion {
  id: string;
  question_order: number;
  question_type: string;
  question_text: string;
  points: number;
  explanation?: string;
  options: Array<{
    id: string;
    option_text: string;
    is_correct: boolean;
  }>;
  userAnswer: any;
  isCorrect: boolean;
}

export function QuizReviewMode({ attemptId, onClose }: QuizReviewModeProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadReviewData();
  }, [attemptId]);

  const loadReviewData = async () => {
    setLoading(true);
    try {
      // Load attempt data
      const { data: attemptData, error: attemptError } = await (supabase as any)
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;
      setAttempt(attemptData);

      // Load quiz questions
      const { data: questionsData, error: questionsError } = await (supabase as any)
        .from('quiz_questions')
        .select('*, quiz_question_options(*)')
        .eq('quiz_component_id', attemptData.quiz_component_id)
        .order('question_order');

      if (questionsError) throw questionsError;

      // Process questions with user answers
      const reviewQuestions: ReviewQuestion[] = questionsData.map((q: any) => {
        const userAnswer = attemptData.answers[q.id];
        let isCorrect = false;

        // Determine if answer was correct
        if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
          const correctOption = q.quiz_question_options.find((opt: any) => opt.is_correct);
          isCorrect = userAnswer === correctOption?.id;
        } else if (q.question_type === 'multiple_select') {
          const correctOptionIds = q.quiz_question_options
            .filter((opt: any) => opt.is_correct)
            .map((opt: any) => opt.id);
          const userAnswerArray = userAnswer || [];
          isCorrect = correctOptionIds.length === userAnswerArray.length && 
                      correctOptionIds.every((id: string) => userAnswerArray.includes(id));
        } else if (q.question_type === 'short_answer') {
          const correctAnswers = q.quiz_question_options.map((opt: any) => 
            opt.option_text.toLowerCase().trim()
          );
          const userAnswerText = (userAnswer || '').toLowerCase().trim();
          isCorrect = correctAnswers.includes(userAnswerText);
        } else if (q.question_type === 'fill_blank') {
          const userAnswers = userAnswer || [];
          const correctAnswers = q.quiz_question_options.map((opt: any) => 
            opt.option_text.toLowerCase().trim()
          );
          isCorrect = correctAnswers.length === userAnswers.length &&
                      correctAnswers.every((correct: string, idx: number) => 
                        userAnswers[idx]?.toLowerCase().trim() === correct
                      );
        }

        return {
          id: q.id,
          question_order: q.question_order,
          question_type: q.question_type,
          question_text: q.question_text,
          points: q.points,
          explanation: q.explanation,
          options: q.quiz_question_options.map((opt: any) => ({
            id: opt.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          })),
          userAnswer,
          isCorrect
        };
      });

      setQuestions(reviewQuestions);
    } catch (error) {
      console.error('Error loading review data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz review',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading review...</div>;
  }

  if (!attempt || questions.length === 0) {
    return <div className="p-4">No review data available</div>;
  }

  const currentQuestion = questions[currentIndex];
  const correctCount = questions.filter(q => q.isCorrect).length;
  const percentage = Math.round((attempt.score / attempt.max_score) * 100);

  return (
    <Card className="bg-cyan-50 border-cyan-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-900">Review Your Answers</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Review
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <div>Question {currentIndex + 1} of {questions.length}</div>
          <div>Your Score: {attempt.score}/{attempt.max_score} ({percentage}%)</div>
          <div className={percentage >= 70 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {percentage >= 70 ? '✅ Passed' : '📚 Needs Review'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentQuestion.isCorrect 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {currentQuestion.isCorrect ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">
                Question {currentQuestion.question_order}
              </p>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                currentQuestion.isCorrect 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.isCorrect ? `+${currentQuestion.points} pts` : '0 pts'}
              </span>
            </div>
            <p className="mt-2">{currentQuestion.question_text}</p>
          </div>
        </div>

        {/* Answer Display - Multiple Choice / True-False */}
        {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const isUserAnswer = currentQuestion.userAnswer === option.id;
              const isCorrectAnswer = option.is_correct;
              
              return (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border-2 ${
                    isCorrectAnswer
                      ? 'bg-green-50 border-green-500'
                      : isUserAnswer
                      ? 'bg-red-50 border-red-500'
                      : 'bg-background border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.option_text}</span>
                    {isCorrectAnswer && <span className="text-green-700 font-semibold">✓ Correct</span>}
                    {isUserAnswer && !isCorrectAnswer && <span className="text-red-700 font-semibold">Your Answer</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Answer Display - Multiple Select */}
        {currentQuestion.question_type === 'multiple_select' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select all that apply:</p>
            {currentQuestion.options.map((option) => {
              const userAnswers = currentQuestion.userAnswer || [];
              const isUserAnswer = userAnswers.includes(option.id);
              const isCorrectAnswer = option.is_correct;
              
              return (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border-2 ${
                    isCorrectAnswer && isUserAnswer
                      ? 'bg-green-50 border-green-500'
                      : isCorrectAnswer && !isUserAnswer
                      ? 'bg-yellow-50 border-yellow-500'
                      : isUserAnswer && !isCorrectAnswer
                      ? 'bg-red-50 border-red-500'
                      : 'bg-background border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.option_text}</span>
                    <div className="flex items-center gap-2">
                      {isCorrectAnswer && <span className="text-green-700 font-semibold">✓ Should Select</span>}
                      {isUserAnswer && <span className="text-blue-700 font-semibold">You Selected</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Answer Display - Short Answer */}
        {currentQuestion.question_type === 'short_answer' && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg ${
              currentQuestion.isCorrect 
                ? 'bg-green-50 border-2 border-green-500' 
                : 'bg-red-50 border-2 border-red-500'
            }`}>
              <p className="text-sm font-semibold mb-1">Your Answer:</p>
              <p>{currentQuestion.userAnswer || '(No answer provided)'}</p>
            </div>
            <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <p className="text-sm font-semibold mb-1">Acceptable Answers:</p>
              <ul className="list-disc list-inside">
                {currentQuestion.options.map((opt) => (
                  <li key={opt.id}>{opt.option_text}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Answer Display - Fill in the Blank */}
        {currentQuestion.question_type === 'fill_blank' && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const userAnswer = (currentQuestion.userAnswer || [])[idx] || '';
              const isCorrect = userAnswer.toLowerCase().trim() === option.option_text.toLowerCase().trim();
              
              return (
                <div key={option.id}>
                  <p className="text-sm font-semibold mb-2">Blank {idx + 1}:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg ${
                      isCorrect 
                        ? 'bg-green-50 border-2 border-green-500' 
                        : 'bg-red-50 border-2 border-red-500'
                    }`}>
                      <p className="text-xs text-muted-foreground">Your Answer:</p>
                      <p className="font-medium">{userAnswer || '(No answer)'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border-2 border-green-500">
                      <p className="text-xs text-muted-foreground">Correct Answer:</p>
                      <p className="font-medium">{option.option_text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation */}
        {currentQuestion.explanation && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Explanation:</strong> {currentQuestion.explanation}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Navigation */}
        <div className="border-t pt-4">
          <div className="flex gap-2 flex-wrap mb-4">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={idx === currentIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 ${
                  q.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {correctCount} of {questions.length} correct
              </p>
            </div>

            <Button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === questions.length - 1}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
