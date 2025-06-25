
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdaptiveContentBox from '@/components/lesson/AdaptiveContentBox';
import LessonStatusNav from '@/components/lesson/LessonStatusNav';
import ReadAloudToggler from '@/components/ReadAloudToggler';
import { useLessonData } from '@/hooks/useLessonData';
import { useLessonProgressUpdate } from '@/hooks/useLessonProgressUpdate';
import { useAuth } from '@/contexts/AuthContext';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const [showPersonalizedView, setShowPersonalizedView] = useState(false);
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

  const toggleLessonView = () => {
    setShowPersonalizedView(!showPersonalizedView);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
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
    const errorMessage = error instanceof Error ? error.message : String(error || 'Lesson not found. Please check the lesson ID and try again.');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const content = getContentForReadingLevel();
  const translatedContent = getTranslatedContent();

  // Convert the old UserProgress format to the new format for compatibility
  const convertedUserProgress = userProgress ? {
    lesson_id: userProgress['Lesson ID'],
    user_id: userProgress['User ID'],
    status: userProgress.Completed ? 'Completed' as const : 'Not Started' as const,
    progress_percentage: userProgress.Completed ? 100 : 0,
    id: '', // placeholder
    created_at: '', // placeholder
    updated_at: '', // placeholder
    started_at: null,
    completed_at: null,
    date_completed: null
  } : null;

  // Get the lesson text for read-aloud functionality
  const lessonText = content || lesson.text || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
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
          {/* Read Aloud Toggler */}
          <Card>
            <CardContent className="p-6">
              <ReadAloudToggler
                lessonText={lessonText}
                lessonId={lesson['Lesson ID'].toString()}
              />
            </CardContent>
          </Card>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <Button 
              onClick={toggleLessonView}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
            >
              Toggle Profile Requests
            </Button>
          </div>

          {/* Default Lesson View - Google Doc iframe */}
          {!showPersonalizedView && (
            <Card className="w-full">
              <CardContent className="p-0">
                <iframe 
                  src="https://docs.google.com/document/d/1U8cD5O28L4HFNVsfNpchR08RIDiPdj1C99EEV7YaKxo/preview" 
                  width="100%" 
                  height="600px" 
                  style={{ border: 'none' }}
                  title="Lesson Content"
                />
              </CardContent>
            </Card>
          )}

          {/* Personalized Lesson View */}
          {showPersonalizedView && (
            <div className="space-y-8">
              {/* Adaptive Content Box */}
              <AdaptiveContentBox
                content={content}
                translatedContent={translatedContent}
                readingLevel={null} // Will be determined inside the component
                lessonTitle={lesson.Title || `Lesson ${lesson['Lesson ID']}`}
              />
            </div>
          )}

          {/* Lesson Status and Navigation */}
          <LessonStatusNav
            userProgress={convertedUserProgress}
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
