import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, BookOpen, Target, Clock, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LessonPlan {
  title: string;
  introduction?: string;
  objectives?: string[];
  mainContent?: string;
  activities?: Array<{
    title: string;
    description: string;
    duration?: string;
  }>;
  assessmentQuestions?: Array<{
    question: string;
    type: string;
    options?: string[];
  }>;
  differentiation?: {
    support: string;
    extension: string;
  };
  materials?: string[];
  closure?: string;
  content?: string;
  rawText?: boolean;
}

export default function TeacherDemoPage() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [duration, setDuration] = useState('45 minutes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic Required',
        description: 'Please enter a lesson topic.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLessonPlan(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-lesson', {
        body: {
          topic: topic.trim(),
          gradeLevel: gradeLevel.trim() || 'middle school',
          learningObjectives: learningObjectives.trim(),
          duration: duration.trim() || '45 minutes',
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.lessonPlan) {
        setLessonPlan(data.lessonPlan);
        toast({
          title: 'Lesson Generated!',
          description: 'Your AI-powered lesson plan is ready.',
        });
      } else {
        throw new Error('No lesson plan returned');
      }
    } catch (err: any) {
      console.error('Error generating lesson:', err);
      const errorMessage = err.message || 'Failed to generate lesson. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-10 w-10" />
            <h1 className="text-4xl font-bold">AI Lesson Generator</h1>
          </div>
          <p className="text-xl text-white/90">
            Create comprehensive, engaging lesson plans in seconds with AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
                <CardDescription>
                  Tell us what you'd like to teach, and AI will generate a complete lesson plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Lesson Topic *
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, The Water Cycle, Fractions"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Grade Level */}
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Input
                    id="gradeLevel"
                    placeholder="e.g., 6th grade, high school, elementary"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Lesson Duration
                  </Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 45 minutes, 1 hour"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {/* Learning Objectives */}
                <div className="space-y-2">
                  <Label htmlFor="objectives" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Learning Objectives (Optional)
                  </Label>
                  <Textarea
                    id="objectives"
                    placeholder="What should students learn? List specific goals..."
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    disabled={isGenerating}
                    rows={3}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Lesson...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Lesson Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI-Powered Features
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 space-y-2">
                <ul className="list-disc list-inside space-y-1">
                  <li>Clear learning objectives</li>
                  <li>Engaging activities and examples</li>
                  <li>Assessment questions</li>
                  <li>Differentiation strategies</li>
                  <li>Materials list</li>
                  <li>Real-world connections</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Generated Lesson */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {lessonPlan && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="text-2xl">{lessonPlan.title}</CardTitle>
                  <CardDescription>AI-Generated Lesson Plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {lessonPlan.rawText ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {lessonPlan.content}
                      </pre>
                    </div>
                  ) : (
                    <>
                      {/* Introduction */}
                      {lessonPlan.introduction && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Introduction
                          </h3>
                          <p className="text-muted-foreground">{lessonPlan.introduction}</p>
                        </div>
                      )}

                      {/* Objectives */}
                      {lessonPlan.objectives && lessonPlan.objectives.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Learning Objectives
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {lessonPlan.objectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Main Content */}
                      {lessonPlan.mainContent && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Main Content</h3>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {lessonPlan.mainContent}
                          </p>
                        </div>
                      )}

                      {/* Activities */}
                      {lessonPlan.activities && lessonPlan.activities.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Activities</h3>
                          <div className="space-y-3">
                            {lessonPlan.activities.map((activity, i) => (
                              <Card key={i} className="bg-muted/50">
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-1">
                                    {activity.title}
                                    {activity.duration && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        ({activity.duration})
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assessment Questions */}
                      {lessonPlan.assessmentQuestions && lessonPlan.assessmentQuestions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Assessment</h3>
                          <div className="space-y-3">
                            {lessonPlan.assessmentQuestions.map((q, i) => (
                              <Card key={i} className="bg-muted/50">
                                <CardContent className="pt-4">
                                  <p className="font-medium mb-2">
                                    {i + 1}. {q.question}
                                  </p>
                                  {q.options && q.options.length > 0 && (
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                      {q.options.map((opt, j) => (
                                        <li key={j}>{opt}</li>
                                      ))}
                                    </ul>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Differentiation */}
                      {lessonPlan.differentiation && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Differentiation</h3>
                          <div className="grid gap-3">
                            <Card className="bg-yellow-50 border-yellow-200">
                              <CardContent className="pt-4">
                                <h4 className="font-semibold text-yellow-900 mb-1">Support</h4>
                                <p className="text-sm text-yellow-800">
                                  {lessonPlan.differentiation.support}
                                </p>
                              </CardContent>
                            </Card>
                            <Card className="bg-green-50 border-green-200">
                              <CardContent className="pt-4">
                                <h4 className="font-semibold text-green-900 mb-1">Extension</h4>
                                <p className="text-sm text-green-800">
                                  {lessonPlan.differentiation.extension}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                      {/* Materials */}
                      {lessonPlan.materials && lessonPlan.materials.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Materials Needed</h3>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {lessonPlan.materials.map((material, i) => (
                              <li key={i}>{material}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Closure */}
                      {lessonPlan.closure && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Closure</h3>
                          <p className="text-muted-foreground">{lessonPlan.closure}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {!lessonPlan && !error && !isGenerating && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated lesson plan will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
