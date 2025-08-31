
import React from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import LessonHeader from '@/components/lesson/LessonHeader';
import LessonControls from '@/components/lesson/LessonControls';
import EnhancedLessonControls from '@/components/lesson/EnhancedLessonControls';
import LessonContent from '@/components/lesson/LessonContent';
import LessonStatusNav from '@/components/lesson/LessonStatusNav';
import VideoSection from '@/components/lesson/VideoSection';
import AssignmentSection from '@/components/assignments/AssignmentSection';
import AdaptiveLearningEngine from '@/components/adaptive/AdaptiveLearningEngine';
import SmartTranslationWidget from '@/components/translation/SmartTranslationWidget';
import { RealTimeTranslationProvider } from '@/components/translation/RealTimeTranslationProvider';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import ModularLessonView from '@/components/lesson/ModularLessonView';
import DesmosSection from '@/components/lesson/DesmosSection';
import { useLessonPageLogic } from '@/hooks/useLessonPageLogic';
import { useGlobalSetting } from '@/hooks/useGlobalSettings';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data: layoutSetting } = useGlobalSetting('lesson_view_mode');
  
  const {
    user,
    lesson,
    userProgress,
    loading,
    error,
    showPersonalizedView,
    liveTranslatedContent,
    liveTranslationLanguage,
    lessonTitle,
    lessonDescription,
    lessonContent,
    fullLessonText,
    videoUrl,
    updating,
    handleMarkComplete,
    toggleLessonView,
    handleLiveTranslationComplete
  } = useLessonPageLogic(lessonId || '');

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

  console.log('Lesson data:', lesson);
  console.log('Full lesson text for read-aloud:', fullLessonText.substring(0, 200) + '...');
  console.log('Show personalized view:', showPersonalizedView);
  console.log('Dynamic video URL:', videoUrl);

  const layoutMode = layoutSetting?.setting_value || 'scroll';
  const useModularLayout = layoutMode === 'modular';

  // Modular layout
  if (useModularLayout) {
    return (
      <RealTimeTranslationProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <Header />
          <MobileOptimizedLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
              <ModularLessonView 
                lessonId={lessonId || ''} 
                lessonTitle={lessonTitle}
                fullLessonText={fullLessonText}
              />
            </div>
          </MobileOptimizedLayout>
        </div>
      </RealTimeTranslationProvider>
    );
  }

  // Traditional scroll layout
  return (
    <RealTimeTranslationProvider>
      <MobileOptimizedLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <LessonHeader 
            lessonTitle={lessonTitle}
            lessonDescription={lessonDescription}
          />

          <div className="space-y-8">
            {/* Enhanced Lesson Controls with Advanced Read Aloud */}
            <EnhancedLessonControls
              showPersonalizedView={showPersonalizedView}
              onToggleLessonView={toggleLessonView}
              fullLessonText={fullLessonText}
              lessonId={lesson['Lesson ID'].toString()}
            />

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

            {/* Content Section */}
            <LessonContent
              showPersonalizedView={showPersonalizedView}
              lessonContent={lessonContent}
              lessonTitle={lessonTitle}
              liveTranslatedContent={liveTranslatedContent}
              liveTranslationLanguage={liveTranslationLanguage}
            />

            {/* Assignment Section */}
            <AssignmentSection lessonId={lessonId || ''} />

            {/* Desmos Tool Section */}
            {lesson.desmos_enabled && lesson.desmos_type && (
              <DesmosSection desmosType={lesson.desmos_type} />
            )}

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
      </MobileOptimizedLayout>
    </RealTimeTranslationProvider>
  );
};

export default LessonPage;
