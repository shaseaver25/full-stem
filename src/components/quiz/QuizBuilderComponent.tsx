import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Plus, Trash2, MoveUp, MoveDown, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question_order: number;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank' | 'multiple_select';
  question_text: string;
  question_image_url?: string;
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

interface QuizBuilderProps {
  componentId: string;
  onUpdate?: () => void;
}

export function QuizBuilderComponent({ componentId, onUpdate }: QuizBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Quiz settings
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [attemptsAllowed, setAttemptsAllowed] = useState(-1);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeAnswers, setRandomizeAnswers] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<'immediately' | 'after_submission' | 'never'>('after_submission');
  const [passThreshold, setPassThreshold] = useState(70);
  
  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizComponentId, setQuizComponentId] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [componentId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Load quiz component
      const { data: quizData, error: quizError } = await (supabase as any)
        .from('quiz_components')
        .select('*')
        .eq('component_id', componentId)
        .maybeSingle();

      if (quizError && quizError.code !== 'PGRST116') throw quizError;

      if (quizData) {
        setQuizComponentId(quizData.id);
        setTitle(quizData.title);
        setInstructions(quizData.instructions || '');
        setTimeLimitMinutes(quizData.time_limit_minutes);
        setAttemptsAllowed(quizData.attempts_allowed);
        setRandomizeQuestions(quizData.randomize_questions);
        setRandomizeAnswers(quizData.randomize_answers);
        setShowCorrectAnswers(quizData.show_correct_answers);
        setPassThreshold(quizData.pass_threshold_percentage);

        // Load questions
        const { data: questionsData, error: questionsError } = await (supabase as any)
          .from('quiz_questions')
          .select('*, quiz_question_options(*)')
          .eq('quiz_component_id', quizData.id)
          .order('question_order');

        if (questionsError) throw questionsError;

        const loadedQuestions: QuizQuestion[] = questionsData.map((q: any) => ({
          id: q.id,
          question_order: q.question_order,
          question_type: q.question_type,
          question_text: q.question_text,
          question_image_url: q.question_image_url,
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

        setQuestions(loadedQuestions);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Quiz title is required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      // Calculate total points
      const pointsTotal = questions.reduce((sum, q) => sum + q.points, 0);

      // Upsert quiz component
      const { data: quizData, error: quizError } = await (supabase as any)
        .from('quiz_components')
        .upsert({
          id: quizComponentId || undefined,
          component_id: componentId,
          title,
          instructions,
          time_limit_minutes: timeLimitMinutes,
          attempts_allowed: attemptsAllowed,
          randomize_questions: randomizeQuestions,
          randomize_answers: randomizeAnswers,
          show_correct_answers: showCorrectAnswers,
          pass_threshold_percentage: passThreshold,
          points_total: pointsTotal
        })
        .select()
        .single();

      if (quizError) throw quizError;
      
      const savedQuizId = quizData.id;
      setQuizComponentId(savedQuizId);

      // Delete existing questions and options (cascade will handle options)
      if (quizComponentId) {
        await (supabase as any)
          .from('quiz_questions')
          .delete()
          .eq('quiz_component_id', quizComponentId);
      }

      // Insert questions and options
      for (const question of questions) {
        const { data: questionData, error: questionError } = await (supabase as any)
          .from('quiz_questions')
          .insert({
            quiz_component_id: savedQuizId,
            question_order: question.question_order,
            question_type: question.question_type,
            question_text: question.question_text,
            question_image_url: question.question_image_url,
            points: question.points,
            hint_text: question.hint_text,
            explanation: question.explanation
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert options for this question
        if (question.options.length > 0) {
          const optionsToInsert = question.options.map(opt => ({
            question_id: questionData.id,
            option_order: opt.option_order,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }));

          const { error: optionsError } = await (supabase as any)
            .from('quiz_question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      toast({
        title: 'Success',
        description: 'Quiz saved successfully'
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type: QuizQuestion['question_type']) => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question_order: questions.length,
      question_type: type,
      question_text: '',
      points: 1,
      options: type === 'multiple_choice' 
        ? [
            { id: crypto.randomUUID(), option_order: 0, option_text: '', is_correct: false },
            { id: crypto.randomUUID(), option_order: 1, option_text: '', is_correct: false },
            { id: crypto.randomUUID(), option_order: 2, option_text: '', is_correct: false },
            { id: crypto.randomUUID(), option_order: 3, option_text: '', is_correct: false }
          ]
        : type === 'true_false'
        ? [
            { id: crypto.randomUUID(), option_order: 0, option_text: 'True', is_correct: false },
            { id: crypto.randomUUID(), option_order: 1, option_text: 'False', is_correct: false }
          ]
        : []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((q, i) => q.question_order = i);
    setQuestions(updated);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }
    const updated = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    updated.forEach((q, i) => q.question_order = i);
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    question.options.push({
      id: crypto.randomUUID(),
      option_order: question.options.length,
      option_text: '',
      is_correct: false
    });
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<QuizOption>) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = { 
      ...updated[questionIndex].options[optionIndex], 
      ...updates 
    };
    setQuestions(updated);
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    updated[questionIndex].options.forEach((opt, i) => opt.option_order = i);
    setQuestions(updated);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    
    if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
      // Single selection - uncheck all others
      question.options.forEach((opt, i) => {
        opt.is_correct = i === optionIndex;
      });
    } else if (question.question_type === 'multiple_select') {
      // Multiple selection - toggle
      question.options[optionIndex].is_correct = !question.options[optionIndex].is_correct;
    }
    
    setQuestions(updated);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (loading) {
    return <div className="p-4">Loading quiz...</div>;
  }

  return (
    <Card className="bg-cyan-50 border-cyan-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-900">
          <CheckCircle2 className="h-5 w-5" />
          Quiz/Interactive Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Title */}
        <div className="space-y-2">
          <Label htmlFor="quiz-title">Quiz Title *</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to Photosynthesis"
            className="bg-background"
          />
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="quiz-instructions">Instructions (optional)</Label>
          <Textarea
            id="quiz-instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Provide instructions for students..."
            rows={3}
            className="bg-background"
          />
        </div>

        {/* Quiz Settings */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-base">Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Limit */}
            <div className="flex items-center gap-4">
              <Label htmlFor="time-limit" className="w-32">⏱️ Time Limit:</Label>
              <Input
                id="time-limit"
                type="number"
                value={timeLimitMinutes || ''}
                onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="minutes (blank = none)"
                className="w-40"
              />
            </div>

            {/* Attempts Allowed */}
            <div className="flex items-center gap-4">
              <Label htmlFor="attempts" className="w-32">🔄 Attempts:</Label>
              <Input
                id="attempts"
                type="number"
                value={attemptsAllowed === -1 ? '' : attemptsAllowed}
                onChange={(e) => setAttemptsAllowed(e.target.value ? parseInt(e.target.value) : -1)}
                placeholder="-1 = unlimited"
                className="w-40"
              />
            </div>

            {/* Randomize Options */}
            <div className="flex items-center justify-between">
              <Label htmlFor="randomize-questions">☑️ Randomize Questions</Label>
              <Switch
                id="randomize-questions"
                checked={randomizeQuestions}
                onCheckedChange={setRandomizeQuestions}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="randomize-answers">☑️ Randomize Answer Order</Label>
              <Switch
                id="randomize-answers"
                checked={randomizeAnswers}
                onCheckedChange={setRandomizeAnswers}
              />
            </div>

            {/* Show Correct Answers */}
            <div className="space-y-2">
              <Label>Show Correct Answers:</Label>
              <RadioGroup value={showCorrectAnswers} onValueChange={(v: any) => setShowCorrectAnswers(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediately" id="immediately" />
                  <Label htmlFor="immediately">Immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after_submission" id="after_submission" />
                  <Label htmlFor="after_submission">After Submission</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Never</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Pass Threshold */}
            <div className="flex items-center gap-4">
              <Label htmlFor="pass-threshold" className="w-32">Pass Threshold:</Label>
              <Input
                id="pass-threshold"
                type="number"
                min="0"
                max="100"
                value={passThreshold}
                onChange={(e) => setPassThreshold(parseInt(e.target.value) || 70)}
                className="w-20"
              />
              <span>%</span>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-base">Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Question Dropdown */}
            <Select onValueChange={(v) => addQuestion(v as QuizQuestion['question_type'])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Add Question" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                <SelectItem value="multiple_select">Multiple Select</SelectItem>
              </SelectContent>
            </Select>

            {/* Question List */}
            {questions.map((question, qIndex) => (
              <Card key={question.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Points:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) || 1 })}
                        className="w-16 h-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Type */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={question.question_type}
                      onValueChange={(v) => updateQuestion(qIndex, { question_type: v as QuizQuestion['question_type'] })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                        <SelectItem value="multiple_select">Multiple Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label>Question Text:</Label>
                    <Textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(qIndex, { question_text: e.target.value })}
                      placeholder="Enter your question..."
                      rows={2}
                    />
                  </div>

                  {/* Options for MC/TF/MS */}
                  {['multiple_choice', 'true_false', 'multiple_select'].includes(question.question_type) && (
                    <div className="space-y-2">
                      <Label>Answer Options:</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <input
                            type={question.question_type === 'multiple_select' ? 'checkbox' : 'radio'}
                            checked={option.is_correct}
                            onChange={() => setCorrectAnswer(qIndex, oIndex)}
                            className="cursor-pointer"
                          />
                          <Input
                            value={option.option_text}
                            onChange={(e) => updateOption(qIndex, oIndex, { option_text: e.target.value })}
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            className="flex-1"
                            disabled={question.question_type === 'true_false'}
                          />
                          {question.question_type !== 'true_false' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {question.question_type === 'multiple_choice' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Hint */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" /> Hint (optional):
                    </Label>
                    <Input
                      value={question.hint_text || ''}
                      onChange={(e) => updateQuestion(qIndex, { hint_text: e.target.value })}
                      placeholder="Optional hint for students..."
                    />
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label>ℹ️ Explanation (shown after):</Label>
                    <Textarea
                      value={question.explanation || ''}
                      onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                      placeholder="Explain the correct answer..."
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestion(qIndex, 'up')}
                      disabled={qIndex === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveQuestion(qIndex, 'down')}
                      disabled={qIndex === questions.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No questions yet. Add your first question above.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Points */}
        <div className="text-lg font-semibold">
          Total Points: {totalPoints}
        </div>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button onClick={saveQuiz} disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
