import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Check, X } from 'lucide-react';
import { useGeneratePollQuestions } from '@/hooks/useGeneratePollQuestions';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PollAIGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  onAddQuestions: (questions: any[]) => void;
}

export const PollAIGenerationModal = ({
  open,
  onOpenChange,
  lessonId,
  onAddQuestions,
}: PollAIGenerationModalProps) => {
  const [pollType, setPollType] = useState<'single_choice' | 'rating_scale' | 'word_cloud'>('single_choice');
  const [questionCount, setQuestionCount] = useState(3);
  const [context, setContext] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const generateMutation = useGeneratePollQuestions();

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        lessonId,
        pollType,
        questionCount,
        context: context || undefined,
      });

      setGeneratedQuestions(result || []);
      const allIds = new Set<string>((result || []).map((q: any) => q.id as string));
      setSelectedQuestions(allIds);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleToggleQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const handleAddSelected = () => {
    const selected = generatedQuestions.filter(q => selectedQuestions.has(q.id));
    onAddQuestions(selected);
    onOpenChange(false);
    // Reset
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    setContext('');
  };

  const handleRegenerate = () => {
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Poll Questions with AI
          </DialogTitle>
          <DialogDescription>
            Let AI create engaging poll questions based on your lesson content
          </DialogDescription>
        </DialogHeader>

        {generatedQuestions.length === 0 ? (
          <div className="space-y-6">
            <div>
              <Label>Poll Type</Label>
              <Select value={pollType} onValueChange={(v: any) => setPollType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="rating_scale">Rating Scale</SelectItem>
                  <SelectItem value="word_cloud">Word Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Questions: {questionCount}</Label>
              <Slider
                value={[questionCount]}
                onValueChange={(v) => setQuestionCount(v[0])}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Additional Context (Optional)</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Focus on key vocabulary terms"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
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
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedQuestions.size} of {generatedQuestions.length} selected
              </p>
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                Regenerate
              </Button>
            </div>

            <div className="space-y-3">
              {generatedQuestions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleToggleQuestion(question.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {question.question || question.prompt}
                        </p>
                        {question.options && (
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {question.options.map((opt: string, idx: number) => (
                              <li key={idx} className={idx === question.bestOption ? 'text-green-600 font-medium' : ''}>
                                {idx === question.bestOption && '✓ '}
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                        {question.scale && (
                          <p className="text-sm text-muted-foreground">{question.scale}</p>
                        )}
                        {question.explanation && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleAddSelected}
              disabled={selectedQuestions.size === 0}
              className="w-full"
            >
              Add {selectedQuestions.size} Question{selectedQuestions.size !== 1 ? 's' : ''} to Poll
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
