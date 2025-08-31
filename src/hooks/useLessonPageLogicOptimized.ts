import { useState, useMemo } from 'react';
import { useLessonDataOptimized } from './useLessonDataOptimized';
import { useLessonProgressUpdate } from './useLessonProgressUpdate';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from './useUserPreferences';

export const useLessonPageLogicOptimized = (lessonId: string) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [showPersonalizedView, setShowPersonalizedView] = useState(false);
  const [liveTranslatedContent, setLiveTranslatedContent] = useState<string | null>(null);
  const [liveTranslationLanguage, setLiveTranslationLanguage] = useState<string | null>(null);

  const { 
    lesson, 
    userProgress, 
    essentialLoading, 
    secondaryLoading,
    error, 
    getContentForReadingLevel, 
    getTranslatedContent 
  } = useLessonDataOptimized(lessonId);
  
  const { markLessonComplete, updating } = useLessonProgressUpdate();

  const handleMarkComplete = async () => {
    if (lesson) {
      await markLessonComplete(lesson['Lesson ID']);
    }
  };

  const toggleLessonView = () => {
    setShowPersonalizedView(!showPersonalizedView);
  };

  const handleLiveTranslationComplete = (translatedContent: string, language: string) => {
    setLiveTranslatedContent(translatedContent);
    setLiveTranslationLanguage(language);
  };

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

  // Make content calculation reactive to preference changes
  const content = useMemo(() => {
    if (!lesson) return null;
    
    const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
    const readingLevelKey = `Text (${userReadingLevel})`;
    
    let selectedContent = lesson[readingLevelKey as keyof typeof lesson] as string | null;
    
    if (!selectedContent) {
      selectedContent = lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || lesson['Text (High School)'] || lesson.Text;
    }
    
    return selectedContent;
  }, [lesson, preferences]);

  const translatedContent = useMemo(() => {
    return getTranslatedContent();
  }, [getTranslatedContent, preferences]);

  // Essential lesson info that loads first
  const lessonTitle = lesson?.Title || `Lesson ${lesson?.['Lesson ID'] || ''}`;
  const lessonDescription = lesson?.Description || '';
  const lessonContent = content || lesson?.Text || lesson?.['Text (Grade 5)'] || lesson?.['Text (Grade 3)'] || lesson?.['Text (Grade 8)'] || 'No content available for this lesson.';
  
  // Combine all text content for comprehensive read-aloud
  const fullLessonText = `${lessonTitle}. ${lessonDescription ? lessonDescription + '. ' : ''}${lessonContent}`;

  return {
    user,
    lesson,
    userProgress: convertedUserProgress,
    essentialLoading,
    secondaryLoading,
    error,
    showPersonalizedView,
    liveTranslatedContent,
    liveTranslationLanguage,
    content,
    translatedContent,
    lessonTitle,
    lessonDescription,
    lessonContent,
    fullLessonText,
    videoUrl: lesson?.video_url || null,
    updating,
    handleMarkComplete,
    toggleLessonView,
    handleLiveTranslationComplete
  };
};