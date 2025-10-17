
import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import LessonHeader from '@/components/lesson/LessonHeader';
import LessonControls from '@/components/lesson/LessonControls';
import LessonSkeleton from '@/components/lesson/LessonSkeleton';
import EnhancedLessonControls from '@/components/lesson/EnhancedLessonControls';
import LessonContent from '@/components/lesson/LessonContent';
import LessonStatusNav from '@/components/lesson/LessonStatusNav';
import ReadAloudDemoGuide from '@/components/lesson/ReadAloudDemoGuide';
import { useLessonPageLogicOptimized } from '@/hooks/useLessonPageLogicOptimized';
import { useGlobalSetting } from '@/hooks/useGlobalSettings';
import { RealTimeTranslationProvider } from '@/components/translation/RealTimeTranslationProvider';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';

// Lazy load heavy components
const VideoSection = lazy(() => import('@/components/lesson/VideoSection'));
const AssignmentSection = lazy(() => import('@/components/assignments/AssignmentSection'));
const AdaptiveLearningEngine = lazy(() => import('@/components/adaptive/AdaptiveLearningEngine'));
const SmartTranslationWidget = lazy(() => import('@/components/translation/SmartTranslationWidget'));
const ModularLessonView = lazy(() => import('@/components/lesson/ModularLessonView'));
const DesmosSection = lazy(() => import('@/components/lesson/DesmosSection'));

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data: layoutSetting } = useGlobalSetting('lesson_view_mode');
  
  const {
    user,
    lesson,
    userProgress,
    essentialLoading,
    secondaryLoading,
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
  } = useLessonPageLogicOptimized(lessonId || '');

  // Show progressive loading - core content first, then secondary features
  if (essentialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="text-center">
                <div className="text-lg font-medium">Loading lesson content...</div>
                <div className="text-sm text-gray-500 mt-1">Lesson ID: {lessonId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    const errorMessage = error instanceof Error ? error.message : String(error || 'Lesson not found. Please check the lesson ID and try again.');
    
    console.error('LessonPage error:', {
      error,
      lessonId,
      hasLesson: !!lesson,
      errorType: typeof error
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>{errorMessage}</div>
                <div className="text-sm opacity-75">Lesson ID: {lessonId}</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  console.log('LessonPage: Rendering with data:', {
    lessonId,
    hasLesson: !!lesson,
    lessonTitle,
    essentialLoading,
    secondaryLoading,
    videoUrl,
    layoutMode: layoutSetting?.setting_value || 'scroll'
  });

  const layoutMode = layoutSetting?.setting_value || 'scroll';
  const useModularLayout = layoutMode === 'modular';

  // Modular layout with lazy loading
  if (useModularLayout) {
    return (
      <RealTimeTranslationProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <Header />
          <MobileOptimizedLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Suspense fallback={<LessonSkeleton type="full" />}>
                <ModularLessonView 
                  lessonId={lessonId || ''} 
                  lessonTitle={lessonTitle}
                  fullLessonText={fullLessonText}
                />
              </Suspense>
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
          {/* Demo Guide */}
          <ReadAloudDemoGuide />

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

            {/* Core Content Section - loads immediately */}
            <LessonContent
              showPersonalizedView={showPersonalizedView}
              lessonContent={lessonContent}
              lessonTitle={lessonTitle}
              liveTranslatedContent={liveTranslatedContent}
              liveTranslationLanguage={liveTranslationLanguage}
            />

            {/* Video Section - lazy loaded */}
            <Suspense fallback={<LessonSkeleton type="content" />}>
              <VideoSection 
                videoUrl={videoUrl}
                title={`${lessonTitle} - Video Tutorial`}
              />
            </Suspense>

            {/* Assignment Section - lazy loaded */}
            <Suspense fallback={<LessonSkeleton type="assignment" />}>
              <AssignmentSection lessonId={lessonId || ''} />
            </Suspense>

            {/* Adaptive Learning Engine - lazy loaded, only if secondary data is ready */}
            {user && !secondaryLoading && (
              <Suspense fallback={<LessonSkeleton type="adaptive" />}>
                <AdaptiveLearningEngine 
                  userId={user.id} 
                  classId={undefined}
                />
              </Suspense>
            )}

            {/* Desmos Tool Section - lazy loaded */}
            {lesson.desmos_enabled && lesson.desmos_type && (
              <Suspense fallback={<LessonSkeleton type="content" />}>
                <DesmosSection desmosType={lesson.desmos_type} />
              </Suspense>
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
