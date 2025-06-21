
import React from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdaptiveContentBox from '@/components/lesson/AdaptiveContentBox';
import LessonStatusNav from '@/components/lesson/LessonStatusNav';
import { useLessonData } from '@/hooks/useLessonData';
import { useLessonProgressUpdate } from '@/hooks/useLessonProgressUpdate';
import { useAuth } from '@/contexts/AuthContext';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const { 
    lesson, 
    userProgress, 
    loading, 
    error, 
    getContentForReadingLevel, 
    getTranslatedContent 
  } = useLessonData(lessonId || '');
  
  const { markLessonComplete, updating } = useLessonProgressUpdate();

  const handleMarkComplete = async () => {
    if (lesson) {
      await markLessonComplete(lesson['Lesson ID']);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg">Loading lesson...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Lesson not found. Please check the lesson ID and try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const content = getContentForReadingLevel();
  const translatedContent = getTranslatedContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {lesson.Title || `Lesson ${lesson['Lesson ID']}`}
            </CardTitle>
            {lesson.Description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {lesson.Description}
              </p>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-8">
          {/* Adaptive Content Box */}
          <AdaptiveContentBox
            content={content}
            translatedContent={translatedContent}
            readingLevel={null} // Will be determined inside the component
            lessonTitle={lesson.Title || `Lesson ${lesson['Lesson ID']}`}
          />

          {/* Lesson Status and Navigation */}
          <LessonStatusNav
            userProgress={userProgress}
            lessonId={lesson['Lesson ID']}
            trackName={lesson.Track?.toLowerCase() || 'excel'}
            onMarkComplete={handleMarkComplete}
            updating={updating}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
