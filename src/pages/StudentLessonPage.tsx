import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import InlineReadAloud from '@/components/InlineReadAloud';
import HorizontalLessonViewer from '@/components/lesson/HorizontalLessonViewer';

const StudentLessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  // Fetch lesson with only student-visible content
  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['studentLesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          classes (name, grade_level, subject),
          lesson_components (*)
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Lesson not found. <Button onClick={() => navigate(-1)} variant="link">Go Back</Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { classes: classInfo, lesson_components } = lesson;
  
  // Filter for student-visible components (enabled, non-teacher materials)
  const studentComponents = (lesson_components || [])
    .filter((c: any) => c.enabled && !c.is_assignable)
    .sort((a: any, b: any) => a.order - b.order);

  const assignmentComponents = (lesson_components || [])
    .filter((c: any) => c.enabled && c.is_assignable)
    .sort((a: any, b: any) => a.order - b.order);

  const componentTypeLabels: Record<string, string> = {
    slides: 'PowerPoint/Slides',
    page: 'Reading',
    video: 'Video',
    discussion: 'Discussion',
    activity: 'Activity',
    assignment: 'Assignment',
    instructions: 'Instructions',
    multimedia: 'Multimedia',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Teacher Preview Notice Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-background text-foreground">Teacher Preview</Badge>
            <span className="text-sm">This is how students see this lesson</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/classes/${lesson.class_id}`)}
            className="text-primary-foreground hover:bg-primary/90"
          >
            Exit Preview
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {lesson.title}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {lesson.duration} minutes
              </Badge>
              {classInfo?.grade_level && <Badge variant="outline">{classInfo.grade_level}</Badge>}
              {classInfo?.subject && <Badge variant="outline">{classInfo.subject}</Badge>}
            </div>
            {lesson.description && (
              <p className="text-muted-foreground mt-3">{lesson.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                What You'll Learn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.objectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content - Horizontal Progression */}
        {studentComponents.length > 0 && (
          <HorizontalLessonViewer
            components={studentComponents as any}
            lessonTitle={lesson.title}
            totalDuration={lesson.duration}
            onComplete={() => {
              // Optional: Track completion or show celebration
              console.log('Lesson completed!');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StudentLessonPage;
