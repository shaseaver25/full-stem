import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdaptiveContentBox from '@/components/lesson/AdaptiveContentBox';
import LessonStatusNav from '@/components/lesson/LessonStatusNav';
import ReadAloudToggler from '@/components/ReadAloudToggler';
import VideoSection from '@/components/lesson/VideoSection';
import AssignmentSection from '@/components/assignments/AssignmentSection';
import { useLessonData } from '@/hooks/useLessonData';
import { useLessonProgressUpdate } from '@/hooks/useLessonProgressUpdate';
import { useAuth } from '@/contexts/AuthContext';
import LiveTranslationBox from '@/components/lesson/LiveTranslationBox';
import { Badge } from '@/components/ui/badge';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import TouchFriendlyButton from '@/components/ui/TouchFriendlyButton';
import AdaptiveLearningEngine from '@/components/adaptive/AdaptiveLearningEngine';
import SmartTranslationWidget from '@/components/translation/SmartTranslationWidget';
import { RealTimeTranslationProvider } from '@/components/translation/RealTimeTranslationProvider';

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
  const [liveTranslatedContent, setLiveTranslatedContent] = useState<string | null>(null);
  const [liveTranslationLanguage, setLiveTranslationLanguage] = useState<string | null>(null);

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

  // Get comprehensive lesson text for read-aloud functionality
  const lessonTitle = lesson.Title || `Lesson ${lesson['Lesson ID']}`;
  const lessonDescription = lesson.Description || '';
  const lessonContent = content || lesson.text || lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || 'No content available for this lesson.';
  
  // Combine all text content for comprehensive read-aloud
  const fullLessonText = `${lessonTitle}. ${lessonDescription ? lessonDescription + '. ' : ''}${lessonContent}`;

  // Video URL for this specific lesson
  const videoUrl = "https://youtu.be/c2dcRy1X9AA";

  console.log('Lesson data:', lesson);
  console.log('Full lesson text for read-aloud:', fullLessonText.substring(0, 200) + '...');
  console.log('Show personalized view:', showPersonalizedView);

  const handleLiveTranslationComplete = (translatedContent: string, language: string) => {
    setLiveTranslatedContent(translatedContent);
    setLiveTranslationLanguage(language);
  };

  return (
    <RealTimeTranslationProvider>
      <MobileOptimizedLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {lessonTitle}
              </CardTitle>
              {lesson.Description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {lesson.Description}
                </p>
              )}
            </CardHeader>
          </Card>

          <div className="space-y-8">
            {/* Video Section */}
            <VideoSection 
              videoUrl={videoUrl}
              title={`${lessonTitle} - Video Tutorial`}
            />

            {/* Adaptive Learning Engine */}
            {user && (
              <AdaptiveLearningEngine 
                userId={user.id} 
                classId={undefined}
              />
            )}

            {/* Smart Translation Widget */}
            <SmartTranslationWidget
              content={lessonContent}
              contentId={lessonId}
              showControls={true}
              autoTranslate={false}
            />

            {/* Read Aloud Toggler */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Audio Reading</h3>
                    <p className="text-gray-600 text-sm">
                      Listen to the entire lesson content including title, description, and main content.
                    </p>
                  </div>
                  <ReadAloudToggler
                    lessonText={fullLessonText}
                    lessonId={lesson['Lesson ID'].toString()}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profile Toggle Switch */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Content View</h3>
                    <p className="text-gray-600 text-sm">
                      {showPersonalizedView 
                        ? 'Currently showing personalized content based on your profile preferences.'
                        : 'Currently showing the standard lesson format with interactive document.'
                      }
                    </p>
                  </div>
                  <TouchFriendlyButton 
                    onClick={toggleLessonView}
                    variant={showPersonalizedView ? "default" : "outline"}
                    className={`min-w-[200px] ${
                      showPersonalizedView 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'border-green-500 text-green-500 hover:bg-green-50'
                    }`}
                  >
                    {showPersonalizedView ? 'Using Profile Settings' : 'Use Profile Settings'}
                  </TouchFriendlyButton>
                </div>
              </CardContent>
            </Card>

            {/* Content Section - Switches based on toggle */}
            {!showPersonalizedView ? (
              /* Standard Google Doc View */
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Standard Lesson Content
                    {liveTranslatedContent && liveTranslationLanguage && (
                      <Badge variant="outline" className="ml-2">
                        Live translation available
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {liveTranslatedContent && liveTranslationLanguage ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">English (Original)</h3>
                        <iframe 
                          src="https://docs.google.com/document/d/1U8cD5O28L4HFNVsfNpchR08RIDiPdj1C99EEV7YaKxo/preview" 
                          width="100%" 
                          height="500px" 
                          style={{ border: 'none' }}
                          title="Lesson Content"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <h3 className="font-semibold text-sm">{liveTranslationLanguage} (Live Translation)</h3>
                        </div>
                        <div className="prose prose-sm max-w-none bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm h-[500px] overflow-y-auto">
                          <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                            {liveTranslatedContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe 
                      src="https://docs.google.com/document/d/1U8cD5O28L4HFNVsfNpchR08RIDiPdj1C99EEV7YaKxo/preview" 
                      width="100%" 
                      height="600px" 
                      style={{ border: 'none' }}
                      title="Lesson Content"
                      className="rounded-b-lg"
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Personalized Adaptive View */
              <div className="space-y-6">
                <AdaptiveContentBox
                  content={liveTranslatedContent || lessonContent}
                  translatedContent={translatedContent}
                  readingLevel={null}
                  lessonTitle={lessonTitle}
                />
              </div>
            )}

            {/* Assignment Section */}
            <AssignmentSection lessonId={lessonId || ''} />

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
      </MobileOptimizedLayout>
    </RealTimeTranslationProvider>
  );
};

export default LessonPage;
