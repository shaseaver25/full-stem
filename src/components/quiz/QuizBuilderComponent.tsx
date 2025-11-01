import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Plus, Trash2, MoveUp, MoveDown, Lightbulb, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

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
  initialData?: any;
  onSave: (quizData: any) => void;
  lessonId?: string;
}

export function QuizBuilderComponent({ initialData, onSave, lessonId }: QuizBuilderProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // AI Generation state
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCountAI, setQuestionCountAI] = useState(5);
  const [difficultyAI, setDifficultyAI] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  // Quiz settings
  const [title, setTitle] = useState(initialData?.title || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(initialData?.timeLimitMinutes || null);
  const [attemptsAllowed, setAttemptsAllowed] = useState(initialData?.attemptsAllowed || -1);
  const [randomizeQuestions, setRandomizeQuestions] = useState(initialData?.randomizeQuestions || false);
  const [randomizeAnswers, setRandomizeAnswers] = useState(initialData?.randomizeAnswers || false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<'immediately' | 'after_submission' | 'never'>(initialData?.showCorrectAnswers || 'after_submission');
  const [passThreshold, setPassThreshold] = useState(initialData?.passThreshold || 70);
  
  // Questions
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions || []);

  const saveQuiz = () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Quiz title is required',
        variant: 'destructive'
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one question',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const pointsTotal = questions.reduce((sum, q) => sum + q.points, 0);

      const quizData = {
        title,
        instructions,
        timeLimitMinutes,
        attemptsAllowed,
        randomizeQuestions,
        randomizeAnswers,
        showCorrectAnswers,
        passThreshold,
        pointsTotal,
        questions
      };

      console.log('📝 Quiz Builder: Quiz data prepared:', quizData);
      onSave(quizData);

      toast({
        title: 'Quiz Configured ✅',
        description: 'Remember to click "Save Lesson" to persist changes to the database!',
        duration: 5000
      });
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
        : type === 'short_answer'
        ? [
            { id: crypto.randomUUID(), option_order: 0, option_text: '', is_correct: true }
          ]
        : type === 'fill_blank'
        ? [
            { id: crypto.randomUUID(), option_order: 0, option_text: '', is_correct: true }
          ]
        : type === 'multiple_select'
        ? [
            { id: crypto.randomUUID(), option_order: 0, option_text: '', is_correct: false },
            { id: crypto.randomUUID(), option_order: 1, option_text: '', is_correct: false }
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
    const isCorrect = question.question_type === 'short_answer' || question.question_type === 'fill_blank';
    question.options.push({
      id: crypto.randomUUID(),
      option_order: question.options.length,
      option_text: '',
      is_correct: isCorrect
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

  const generateQuestionsWithAI = async () => {
    if (!lessonId) {
      toast({
        title: 'Error',
        description: 'Lesson ID is required to generate questions',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setShowAIDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
        body: {
          lessonId,
          questionCount: questionCountAI,
          questionTypes: ['multiple_choice'],
          difficulty: difficultyAI
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'insufficient_content') {
          toast({
            title: '⚠️ Insufficient Lesson Content',
            description: data.message,
            variant: 'destructive',
            duration: 7000
          });
          return;
        }
        throw new Error(data.error);
      }

      console.log('AI generated questions:', data);
      
      if (data.questions && data.questions.length > 0) {
        setGeneratedQuestions(data.questions);
        setShowPreviewDialog(true);
        setPreviewIndex(0);
        
        toast({
          title: '✨ Questions Generated!',
          description: `Generated ${data.questions.length} questions. Review them before adding to your quiz.`,
        });
      } else {
        throw new Error('No questions were generated');
      }

    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: '❌ Generation Failed',
        description: error.message || 'Failed to generate quiz questions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addGeneratedQuestions = () => {
    const newQuestions = [...questions, ...generatedQuestions];
    newQuestions.forEach((q, i) => q.question_order = i);
    setQuestions(newQuestions);
    setShowPreviewDialog(false);
    setGeneratedQuestions([]);
    
    toast({
      title: '✅ Questions Added!',
      description: `Added ${generatedQuestions.length} AI-generated questions to your quiz.`,
    });
  };

  const deleteGeneratedQuestion = (index: number) => {
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    if (updated.length === 0) {
      setShowPreviewDialog(false);
      toast({
        title: 'All Questions Removed',
        description: 'No questions to add. Generate new ones or create manually.',
      });
    } else if (previewIndex >= updated.length) {
      setPreviewIndex(updated.length - 1);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

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
            {/* AI Generate Button */}
            {lessonId && (
              <Button
                onClick={() => setShowAIDialog(true)}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 mb-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    ✨ Generate Questions with AI
                  </>
                )}
              </Button>
            )}

            {lessonId && (
              <div className="text-center text-sm text-muted-foreground my-2">
                ────────────── OR ──────────────
              </div>
            )}

            {/* Add Question Dropdown */}
            <Select onValueChange={(v) => addQuestion(v as QuizQuestion['question_type'])}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Add Question Manually" />
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

                  {/* Short Answer - Correct Answers */}
                  {question.question_type === 'short_answer' && (
                    <div className="space-y-3">
                      <Alert className="bg-blue-50 border-blue-200">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm">
                          <strong>AI-Powered Grading:</strong> Short answer questions are automatically graded using AI. 
                          The AI will compare student answers to your acceptable answers and determine if they're semantically similar, 
                          even if the wording is different. You can review and override AI grades later.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-2">
                        <Label>Acceptable Answers (case-insensitive):</Label>
                        <p className="text-xs text-muted-foreground">Add all acceptable variations of the correct answer. The AI will use these as reference points.</p>
                        {question.options.map((option, oIndex) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <Input
                              value={option.option_text}
                              onChange={(e) => updateOption(qIndex, oIndex, { option_text: e.target.value })}
                              placeholder={`Acceptable answer ${oIndex + 1}`}
                              className="flex-1"
                            />
                            {question.options.length > 1 && (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Alternative Answer
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Fill in the Blank - Correct Answers */}
                  {question.question_type === 'fill_blank' && (
                    <div className="space-y-2">
                      <Label>Correct Answers for Each Blank (case-insensitive):</Label>
                      <p className="text-xs text-muted-foreground">Add one correct answer for each blank in your question.</p>
                      {question.options.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-16">Blank {oIndex + 1}:</span>
                          <Input
                            value={option.option_text}
                            onChange={(e) => updateOption(qIndex, oIndex, { option_text: e.target.value })}
                            placeholder={`Answer for blank ${oIndex + 1}`}
                            className="flex-1"
                          />
                          {question.options.length > 1 && (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Another Blank
                      </Button>
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

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              ✨ AI Quiz Generator
            </DialogTitle>
            <DialogDescription>
              I'll analyze your lesson content and create quiz questions based on the material students have learned.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>💡 Tips for Better Questions:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Add more detailed content to your lesson for better questions</li>
                  <li>• Include key vocabulary and concepts in your Pages</li>
                  <li>• Currently using Page content only (MVP version)</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>STEP 1: How many questions?</Label>
                <Select value={String(questionCountAI)} onValueChange={(v) => setQuestionCountAI(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>STEP 2: Question type</Label>
                <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  ✓ Multiple Choice (MVP - only type available currently)
                </div>
              </div>

              <div className="space-y-2">
                <Label>STEP 3: Difficulty level</Label>
                <RadioGroup value={difficultyAI} onValueChange={setDifficultyAI}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="font-normal cursor-pointer">
                      Easy - Basic recall and comprehension
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="font-normal cursor-pointer">
                      Medium - Application and analysis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="font-normal cursor-pointer">
                      Hard - Synthesis and evaluation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="font-normal cursor-pointer">
                      Mixed - Variety of difficulty levels
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                📊 Points per question: 2 (can be adjusted after generation)
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAIDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={generateQuestionsWithAI} disabled={isGenerating} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Generated Questions Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Review AI-Generated Questions
            </DialogTitle>
            <DialogDescription>
              📊 Generated {generatedQuestions.length} questions based on your lesson content. Review each question below and click "Add to Quiz" when satisfied.
            </DialogDescription>
          </DialogHeader>

          {generatedQuestions.length > 0 && (
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                  disabled={previewIndex === 0}
                >
                  ◀ Previous
                </Button>
                <span className="text-sm font-medium">
                  Question {previewIndex + 1} of {generatedQuestions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewIndex(Math.min(generatedQuestions.length - 1, previewIndex + 1))}
                  disabled={previewIndex === generatedQuestions.length - 1}
                >
                  Next ▶
                </Button>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Question Type: Multiple Choice
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      Points: {generatedQuestions[previewIndex].points}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-3">{generatedQuestions[previewIndex].question_text}</p>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Options:</Label>
                      {generatedQuestions[previewIndex].options.map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <div className={`w-6 h-6 flex items-center justify-center rounded ${opt.is_correct ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                            {opt.is_correct ? '✓' : String.fromCharCode(65 + i)}
                          </div>
                          <span className={opt.is_correct ? 'font-medium' : ''}>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {generatedQuestions[previewIndex].hint_text && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Hint:</p>
                          <p className="text-sm text-blue-700">{generatedQuestions[previewIndex].hint_text}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedQuestions[previewIndex].explanation && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Explanation:</p>
                          <p className="text-sm text-green-700">{generatedQuestions[previewIndex].explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteGeneratedQuestion(previewIndex)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete This Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-3 flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={addGeneratedQuestions} className="flex-1 bg-green-600 hover:bg-green-700">
              ✅ Add All to Quiz ({generatedQuestions.length} questions)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
