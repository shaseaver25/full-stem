import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Flag, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Temporary type definitions until Supabase types are regenerated
interface QuizComponentData {
  id: string;
  title: string;
  instructions: string | null;
  time_limit_minutes: number | null;
  attempts_allowed: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  show_correct_answers: 'immediately' | 'after_submission' | 'never';
  pass_threshold_percentage: number;
  points_total: number;
}

interface QuizStudentViewProps {
  componentId: string;
}

interface QuizData {
  id: string;
  title: string;
  instructions: string;
  time_limit_minutes: number | null;
  attempts_allowed: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  show_correct_answers: 'immediately' | 'after_submission' | 'never';
  pass_threshold_percentage: number;
  points_total: number;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question_order: number;
  question_type: string;
  question_text: string;
  points: number;
  hint_text?: string;
  explanation?: string;
  options: QuizOption[];
}

interface QuizOption {
  id: string;
  option_order: number;
  option_text: string;
  is_correct: boolean;
}

export function QuizStudentView({ componentId }: QuizStudentViewProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; explanation?: string }>>({});

  useEffect(() => {
    loadQuiz();
  }, [componentId]);

  useEffect(() => {
    if (started && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, timeRemaining]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const { data: quizComponent, error: quizError } = await (supabase as any)
        .from('quiz_components')
        .select('*')
        .eq('component_id', componentId)
        .single();

      if (quizError) throw quizError;

      const { data: questions, error: questionsError } = await (supabase as any)
        .from('quiz_questions')
        .select('*, quiz_question_options(*)')
        .eq('quiz_component_id', quizComponent.id)
        .order('question_order');

      if (questionsError) throw questionsError;

      const formattedQuestions: QuizQuestion[] = questions.map((q: any) => ({
        id: q.id,
        question_order: q.question_order,
        question_type: q.question_type,
        question_text: q.question_text,
        points: q.points,
        hint_text: q.hint_text,
        explanation: q.explanation,
        options: (q.quiz_question_options || [])
          .sort((a: any, b: any) => a.option_order - b.option_order)
          .map((opt: any) => ({
            id: opt.id,
            option_order: opt.option_order,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }))
      }));

      setQuizData({
        id: quizComponent.id,
        title: quizComponent.title,
        instructions: quizComponent.instructions,
        time_limit_minutes: quizComponent.time_limit_minutes,
        attempts_allowed: quizComponent.attempts_allowed,
        randomize_questions: quizComponent.randomize_questions,
        randomize_answers: quizComponent.randomize_answers,
        show_correct_answers: quizComponent.show_correct_answers,
        pass_threshold_percentage: quizComponent.pass_threshold_percentage,
        points_total: quizComponent.points_total,
        questions: formattedQuestions
      });
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setStarted(true);
    if (quizData?.time_limit_minutes) {
      setTimeRemaining(quizData.time_limit_minutes * 60);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!quizData) return;

    try {
      // Calculate score
      let totalScore = 0;
      const newFeedback: Record<string, { correct: boolean; explanation?: string }> = {};

      quizData.questions.forEach(question => {
        const userAnswer = answers[question.id];
        let isCorrect = false;

        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          const correctOption = question.options.find(opt => opt.is_correct);
          isCorrect = userAnswer === correctOption?.id;
        } else if (question.question_type === 'multiple_select') {
          const correctOptionIds = question.options.filter(opt => opt.is_correct).map(opt => opt.id);
          const userAnswerArray = userAnswer || [];
          isCorrect = correctOptionIds.length === userAnswerArray.length && 
                      correctOptionIds.every(id => userAnswerArray.includes(id));
        }

        if (isCorrect) {
          totalScore += question.points;
        }

        newFeedback[question.id] = {
          correct: isCorrect,
          explanation: question.explanation
        };
      });

      setScore(totalScore);
      setFeedback(newFeedback);
      setCompleted(true);

      // Save attempt to database
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await (supabase as any).from('quiz_attempts').insert({
          quiz_component_id: quizData.id,
          student_id: userData.user.id,
          attempt_number: 1, // TODO: Track actual attempt number
          score: totalScore,
          max_score: quizData.points_total,
          percentage: (totalScore / quizData.points_total) * 100,
          time_spent_seconds: quizData.time_limit_minutes 
            ? (quizData.time_limit_minutes * 60) - (timeRemaining || 0)
            : 0,
          answers: answers
        });
      }

      toast({
        title: 'Quiz Submitted',
        description: `You scored ${totalScore}/${quizData.points_total} (${Math.round((totalScore / quizData.points_total) * 100)}%)`
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="p-4">Loading quiz...</div>;
  }

  if (!quizData) {
    return <div className="p-4">Quiz not found</div>;
  }

  // Start Screen
  if (!started && !completed) {
    return (
      <Card className="bg-cyan-50 border-cyan-900">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-cyan-900" />
          <CardTitle className="text-2xl text-cyan-900">Quiz Ready</CardTitle>
          <p className="text-lg font-semibold">{quizData.title}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-8 text-sm">
            <div>📋 {quizData.questions.length} Questions</div>
            {quizData.time_limit_minutes && <div>⏱️ {quizData.time_limit_minutes} Minutes</div>}
            <div>💯 {quizData.points_total} Points</div>
          </div>

          {quizData.instructions && (
            <div className="bg-background p-4 rounded-lg">
              <p className="font-semibold mb-2">Instructions:</p>
              <p className="text-sm">{quizData.instructions}</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Button onClick={startQuiz} size="lg">
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completion Screen
  if (completed && score !== null) {
    const percentage = Math.round((score / quizData.points_total) * 100);
    const passed = percentage >= quizData.pass_threshold_percentage;

    return (
      <Card className="bg-cyan-50 border-cyan-900">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">{passed ? '🎉' : '📚'}</div>
          <CardTitle className="text-2xl text-cyan-900">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-cyan-900 mb-2">
              {score}/{quizData.points_total}
            </div>
            <div className="text-3xl font-semibold">{percentage}%</div>
          </div>

          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span>✅ Correct:</span>
              <span className="font-semibold">
                {Object.values(feedback).filter(f => f.correct).length}/{quizData.questions.length} questions
              </span>
            </div>
            <div className="flex justify-between">
              <span>⭐ Status:</span>
              <span className={`font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {passed ? 'PASSED' : 'NEEDS REVIEW'} ({quizData.pass_threshold_percentage}% required)
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              Review Answers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz In Progress
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isAnswered = currentQuestion.id in answers;

  return (
    <Card className="bg-cyan-50 border-cyan-900">
      <CardHeader>
        <div className="flex items-center justify-between text-sm">
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-cyan-900">
              <Clock className="h-4 w-4" />
              <span>Time Remaining: {formatTime(timeRemaining)}</span>
            </div>
          )}
          <div>Question {currentQuestionIndex + 1} of {quizData.questions.length}</div>
          <div>Score: {Object.values(feedback).reduce((sum, f) => sum + (f.correct ? 1 : 0), 0)}/{quizData.points_total} pts</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-lg">
                Question {currentQuestionIndex + 1} ({currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''})
              </p>
              <p className="mt-2">{currentQuestion.question_text}</p>
            </div>
            {currentQuestion.hint_text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {showHint[currentQuestion.id] ? 'Hide' : 'Show'} Hint
              </Button>
            )}
          </div>

          {showHint[currentQuestion.id] && currentQuestion.hint_text && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
              💡 <strong>Hint:</strong> {currentQuestion.hint_text}
            </div>
          )}

          {/* Multiple Choice / True-False */}
          {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
            <RadioGroup
              value={answers[currentQuestion.id]}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg bg-background hover:bg-accent">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Multiple Select */}
          {currentQuestion.question_type === 'multiple_select' && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg bg-background hover:bg-accent">
                  <Checkbox
                    id={option.id}
                    checked={(answers[currentQuestion.id] || []).includes(option.id)}
                    onCheckedChange={(checked) => {
                      const current = answers[currentQuestion.id] || [];
                      handleAnswer(
                        currentQuestion.id,
                        checked
                          ? [...current, option.id]
                          : current.filter((id: string) => id !== option.id)
                      );
                    }}
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Navigation */}
        <div className="border-t pt-4">
          <div className="flex gap-2 flex-wrap mb-4">
            {quizData.questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={idx === currentQuestionIndex ? 'default' : answers[q.id] ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setCurrentQuestionIndex(idx)}
                className="w-10 h-10"
              >
                {idx + 1}
                {answers[q.id] && '✓'}
              </Button>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <Button
              variant="ghost"
              onClick={() => setFlagged(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
            >
              <Flag className={flagged[currentQuestion.id] ? 'fill-current' : ''} />
              Flag for Review
            </Button>

            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submitQuiz} variant="default">
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
