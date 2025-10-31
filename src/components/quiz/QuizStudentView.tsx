import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Flag, Lightbulb, ChevronLeft, ChevronRight, AlertCircle, Volume2, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

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
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSave, setPendingSave] = useState(false);
  
  const { speak, isPlaying, isLoading: isSpeaking } = useTextToSpeech();

  useEffect(() => {
    loadQuiz();
  }, [componentId]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSave) {
        saveProgress();
        setPendingSave(false);
      }
      toast({
        title: 'Connection Restored',
        description: 'Your quiz progress is being saved.',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Connection Lost',
        description: 'Your answers are being saved locally.',
        variant: 'destructive'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSave]);

  // Save to localStorage for offline persistence
  useEffect(() => {
    if (started && !completed && quizData) {
      localStorage.setItem(`quiz_progress_${componentId}`, JSON.stringify({
        answers,
        currentQuestionIndex,
        timeRemaining,
        attemptNumber,
        startedAt: Date.now()
      }));
    }
  }, [answers, currentQuestionIndex, timeRemaining, started, completed]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`quiz_progress_${componentId}`);
    if (saved && !started) {
      try {
        const data = JSON.parse(saved);
        // Check if saved data is recent (within 24 hours)
        if (Date.now() - data.startedAt < 24 * 60 * 60 * 1000) {
          setAnswers(data.answers || {});
          setCurrentQuestionIndex(data.currentQuestionIndex || 0);
          setAttemptNumber(data.attemptNumber || 1);
          if (data.timeRemaining) setTimeRemaining(data.timeRemaining);
        }
      } catch (error) {
        console.error('Error restoring quiz progress:', error);
      }
    }
  }, [componentId]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (started && !completed && quizData) {
      const saveInterval = setInterval(() => {
        saveProgress();
      }, 30000); // 30 seconds

      return () => clearInterval(saveInterval);
    }
  }, [started, completed, answers, quizData]);

  useEffect(() => {
    if (started && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            submitQuiz();
            return 0;
          }
          // Show warning at 5 minutes (300 seconds)
          if (prev === 300) {
            toast({
              title: '⏰ 5 Minutes Remaining',
              description: 'You have 5 minutes left to complete the quiz.',
              variant: 'default'
            });
          }
          // Show warning at 1 minute (60 seconds)
          if (prev === 60) {
            toast({
              title: '⏰ 1 Minute Remaining!',
              description: 'Only 1 minute left to complete the quiz.',
              variant: 'destructive'
            });
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

      let formattedQuestions: QuizQuestion[] = questions.map((q: any) => ({
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

      // Apply randomization if enabled
      if (quizComponent.randomize_questions) {
        formattedQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
        formattedQuestions.forEach((q, idx) => q.question_order = idx);
      }

      if (quizComponent.randomize_answers) {
        formattedQuestions = formattedQuestions.map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5)
        }));
      }

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

  const startQuiz = async () => {
    if (!quizData) return;

    // Check existing attempts
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: attempts, error } = await (supabase as any)
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('quiz_component_id', quizData.id)
        .eq('student_id', userData.user.id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (!error && attempts && attempts.length > 0) {
        const nextAttempt = attempts[0].attempt_number + 1;
        setAttemptNumber(nextAttempt);
        
        // Check if attempts limit reached
        if (quizData.attempts_allowed !== -1 && nextAttempt > quizData.attempts_allowed) {
          toast({
            title: 'No Attempts Remaining',
            description: `You have already used all ${quizData.attempts_allowed} attempts for this quiz.`,
            variant: 'destructive'
          });
          return;
        }
        
        if (quizData.attempts_allowed !== -1) {
          setRemainingAttempts(quizData.attempts_allowed - attempts[0].attempt_number);
        }
      } else {
        setRemainingAttempts(quizData.attempts_allowed === -1 ? null : quizData.attempts_allowed - 1);
      }
    }

    setStarted(true);
    if (quizData?.time_limit_minutes) {
      setTimeRemaining(quizData.time_limit_minutes * 60);
    }

    // Create initial attempt record for auto-save
    if (userData.user && quizData) {
      const { data: newAttempt } = await (supabase as any)
        .from('quiz_attempts')
        .insert({
          quiz_component_id: quizData.id,
          student_id: userData.user.id,
          attempt_number: attemptNumber,
          score: 0,
          max_score: quizData.points_total,
          percentage: 0,
          time_spent_seconds: 0,
          answers: {},
          completed_at: null
        })
        .select()
        .single();

      if (newAttempt) {
        setCurrentAttemptId(newAttempt.id);
      }
    }
  };

  const saveProgress = async () => {
    if (!quizData || !currentAttemptId) return;

    if (!isOnline) {
      setPendingSave(true);
      return;
    }

    try {
      // Update the in-progress attempt with current answers
      await (supabase as any).from('quiz_attempts').update({
        answers: answers,
        updated_at: new Date().toISOString()
      }).eq('id', currentAttemptId);

      setLastSaved(new Date());
      setPendingSave(false);
    } catch (error) {
      console.error('Error saving progress:', error);
      setPendingSave(true);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!started || completed) return;

    if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
      e.preventDefault();
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (e.key === 'ArrowRight' && currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      e.preventDefault();
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (e.key === 'Enter' && e.ctrlKey && currentQuestionIndex === (quizData?.questions.length || 0) - 1) {
      e.preventDefault();
      submitQuiz();
    }
  }, [started, completed, currentQuestionIndex, quizData]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const speakQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length) {
      const question = quizData.questions[currentQuestionIndex];
      const textToSpeak = `Question ${currentQuestionIndex + 1}. ${question.question_text}. ${
        question.options.length > 0 
          ? question.options.map((opt, idx) => `Option ${String.fromCharCode(65 + idx)}: ${opt.option_text}`).join('. ')
          : ''
      }`;
      speak(textToSpeak);
    }
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
        } else if (question.question_type === 'short_answer') {
          // For short answer, accept any of the correct options (case-insensitive)
          const correctAnswers = question.options.map(opt => opt.option_text.toLowerCase().trim());
          const userAnswerText = (userAnswer || '').toLowerCase().trim();
          isCorrect = correctAnswers.includes(userAnswerText);
        } else if (question.question_type === 'fill_blank') {
          // For fill in blank, check if user filled all blanks correctly
          // Expected format: question.options contains correct answers for each blank
          const userAnswers = userAnswer || [];
          const correctAnswers = question.options.map(opt => opt.option_text.toLowerCase().trim());
          isCorrect = correctAnswers.length === userAnswers.length &&
                      correctAnswers.every((correct, idx) => 
                        userAnswers[idx]?.toLowerCase().trim() === correct
                      );
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

      // Save final attempt to database
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        if (currentAttemptId) {
          // Update existing attempt
          await (supabase as any).from('quiz_attempts').update({
            score: totalScore,
            percentage: (totalScore / quizData.points_total) * 100,
            time_spent_seconds: quizData.time_limit_minutes 
              ? (quizData.time_limit_minutes * 60) - (timeRemaining || 0)
              : 0,
            answers: answers,
            completed_at: new Date().toISOString()
          }).eq('id', currentAttemptId);
        } else {
          // Create new attempt
          await (supabase as any).from('quiz_attempts').insert({
            quiz_component_id: quizData.id,
            student_id: userData.user.id,
            attempt_number: attemptNumber,
            score: totalScore,
            max_score: quizData.points_total,
            percentage: (totalScore / quizData.points_total) * 100,
            time_spent_seconds: quizData.time_limit_minutes 
              ? (quizData.time_limit_minutes * 60) - (timeRemaining || 0)
              : 0,
            answers: answers
          });
        }
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

  // Clear localStorage on completion
  useEffect(() => {
    if (completed) {
      localStorage.removeItem(`quiz_progress_${componentId}`);
    }
  }, [completed, componentId]);

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

          {quizData.attempts_allowed !== -1 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {quizData.attempts_allowed} attempt{quizData.attempts_allowed > 1 ? 's' : ''} for this quiz.
              </AlertDescription>
            </Alert>
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

          {remainingAttempts !== null && remainingAttempts > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Attempts remaining: {remainingAttempts}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              Review Answers
            </Button>
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retake Quiz
              </Button>
            )}
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
            <div className={`flex items-center gap-2 ${timeRemaining <= 60 ? 'text-red-600 font-bold' : timeRemaining <= 300 ? 'text-orange-600 font-semibold' : 'text-cyan-900'}`}>
              <Clock className="h-4 w-4" />
              <span>Time Remaining: {formatTime(timeRemaining)}</span>
            </div>
          )}
          <div>Question {currentQuestionIndex + 1} of {quizData.questions.length}</div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div title="Offline - answers saved locally">
                <WifiOff className="h-4 w-4 text-red-600" />
              </div>
            )}
            {isOnline && (
              <div title="Online">
                <Wifi className="h-4 w-4 text-green-600" />
              </div>
            )}
            <span>Attempt {attemptNumber}</span>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                (Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago)
              </span>
            )}
          </div>
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
            <div className="flex gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={speakQuestion}
                disabled={isSpeaking}
                title="Read question aloud (Keyboard: R)"
              >
                <Volume2 className="h-4 w-4 mr-1" />
                {isSpeaking ? 'Speaking...' : 'Read Aloud'}
              </Button>
            </div>
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
              <p className="text-sm text-muted-foreground mb-2">Select all that apply:</p>
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

          {/* Short Answer */}
          {currentQuestion.question_type === 'short_answer' && (
            <div className="space-y-2">
              <Label htmlFor={`answer-${currentQuestion.id}`}>Your Answer:</Label>
              <Textarea
                id={`answer-${currentQuestion.id}`}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="bg-background"
              />
            </div>
          )}

          {/* Fill in the Blank */}
          {currentQuestion.question_type === 'fill_blank' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Fill in the blanks:</p>
              {currentQuestion.options.map((option, idx) => (
                <div key={option.id} className="space-y-1">
                  <Label htmlFor={`blank-${idx}`}>Blank {idx + 1}:</Label>
                  <Input
                    id={`blank-${idx}`}
                    value={(answers[currentQuestion.id] || [])[idx] || ''}
                    onChange={(e) => {
                      const current = answers[currentQuestion.id] || [];
                      const updated = [...current];
                      updated[idx] = e.target.value;
                      handleAnswer(currentQuestion.id, updated);
                    }}
                    placeholder={`Enter answer for blank ${idx + 1}`}
                    className="bg-background"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Navigation */}
        <div className="border-t pt-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Keyboard shortcuts:</strong> ← → to navigate questions | Ctrl+Enter to submit quiz
            </AlertDescription>
          </Alert>

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
