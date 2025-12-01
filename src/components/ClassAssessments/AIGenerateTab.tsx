import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIGenerateTabProps {
  classId: string;
  onSuccess: () => void;
}

interface Lesson {
  id: string;
  title: string;
  component_count: number;
}

export const AIGenerateTab = ({ classId, onSuccess }: AIGenerateTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  
  const [title, setTitle] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(20);
  const [multipleChoice, setMultipleChoice] = useState(70);
  const [trueFalse, setTrueFalse] = useState(20);
  const [shortAnswer, setShortAnswer] = useState(10);
  const [essay, setEssay] = useState(0);
  const [difficulty, setDifficulty] = useState('mixed');
  const [focusAreas, setFocusAreas] = useState('');

  useEffect(() => {
    fetchLessons();
  }, [classId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          lesson_components(count)
        `)
        .eq('class_id', classId)
        .order('order_index');

      if (error) throw error;

      const lessonsWithCounts = data?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        component_count: lesson.lesson_components?.[0]?.count || 0,
      })) || [];

      setLessons(lessonsWithCounts);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lessons',
        variant: 'destructive',
      });
    } finally {
      setLoadingLessons(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    const newSet = new Set(selectedLessonIds);
    if (newSet.has(lessonId)) {
      newSet.delete(lessonId);
    } else {
      newSet.add(lessonId);
    }
    setSelectedLessonIds(newSet);
  };

  const totalPercentage = multipleChoice + trueFalse + shortAnswer + essay;
  const isValidPercentage = totalPercentage === 100;

  const handleGenerate = async () => {
    if (!user || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an assessment title',
        variant: 'destructive',
      });
      return;
    }

    if (selectedLessonIds.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one lesson',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidPercentage) {
      toast({
        title: 'Error',
        description: 'Question type percentages must total 100%',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-class-assessment', {
        body: {
          classId,
          lessonIds: Array.from(selectedLessonIds),
          assessmentTitle: title,
          numberOfQuestions,
          questionTypes: {
            multipleChoice,
            trueFalse,
            shortAnswer,
            essay,
          },
          difficulty,
          focusAreas: focusAreas || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assessment generated successfully',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error generating assessment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate assessment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedComponentCount = lessons
    .filter(l => selectedLessonIds.has(l.id))
    .reduce((sum, l) => sum + l.component_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Generate Assessment from Lesson Content</p>
          <p className="text-muted-foreground">
            AI will analyze your selected lessons and create comprehensive assessment questions
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="ai-title">Assessment Title *</Label>
        <Input
          id="ai-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Unit 1 Comprehensive Assessment"
        />
      </div>

      <div>
        <Label className="mb-2 block">Select Lessons to Include</Label>
        {loadingLessons ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No lessons found in this class
          </Card>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="p-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lesson-${lesson.id}`}
                    checked={selectedLessonIds.has(lesson.id)}
                    onCheckedChange={() => toggleLesson(lesson.id)}
                  />
                  <Label
                    htmlFor={`lesson-${lesson.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium">{lesson.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({lesson.component_count} components)
                    </span>
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedLessonIds.size > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Selected: {selectedLessonIds.size} lessons, {selectedComponentCount} content components
          </p>
        )}
      </div>

      <Card className="p-4 space-y-4">
        <h4 className="font-medium">Generation Settings</h4>

        <div>
          <Label htmlFor="num-questions">Number of Questions: {numberOfQuestions}</Label>
          <Slider
            id="num-questions"
            value={[numberOfQuestions]}
            onValueChange={([value]) => setNumberOfQuestions(value)}
            min={5}
            max={50}
            step={5}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="mb-2 block">Question Types</Label>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="mc">Multiple Choice</Label>
                <span className="text-sm text-muted-foreground">{multipleChoice}%</span>
              </div>
              <Slider
                id="mc"
                value={[multipleChoice]}
                onValueChange={([value]) => setMultipleChoice(value)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="tf">True/False</Label>
                <span className="text-sm text-muted-foreground">{trueFalse}%</span>
              </div>
              <Slider
                id="tf"
                value={[trueFalse]}
                onValueChange={([value]) => setTrueFalse(value)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="sa">Short Answer</Label>
                <span className="text-sm text-muted-foreground">{shortAnswer}%</span>
              </div>
              <Slider
                id="sa"
                value={[shortAnswer]}
                onValueChange={([value]) => setShortAnswer(value)}
                max={100}
                step={5}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="essay">Essay</Label>
                <span className="text-sm text-muted-foreground">{essay}%</span>
              </div>
              <Slider
                id="essay"
                value={[essay]}
                onValueChange={([value]) => setEssay(value)}
                max={100}
                step={5}
              />
            </div>

            {!isValidPercentage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Total percentage must equal 100% (currently {totalPercentage}%)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="focus">Focus Areas (optional)</Label>
          <Input
            id="focus"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            placeholder="e.g., Key concepts, vocabulary, problem-solving"
          />
        </div>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Cost Estimate:</strong> ~$0.15 per generation
          <br />
          <strong>Rate limit:</strong> 3 generations per day
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleGenerate}
          disabled={loading || !isValidPercentage || selectedLessonIds.size === 0}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
};