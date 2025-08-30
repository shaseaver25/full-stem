
import { useState, useMemo } from 'react';
import { useLessonData } from './useLessonData';
import { useLessonProgressUpdate } from './useLessonProgressUpdate';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from './useUserPreferences';

export const useLessonPageLogic = (lessonId: string) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [showPersonalizedView, setShowPersonalizedView] = useState(false);
  const [liveTranslatedContent, setLiveTranslatedContent] = useState<string | null>(null);
  const [liveTranslationLanguage, setLiveTranslationLanguage] = useState<string | null>(null);

  const { 
    lesson, 
    userProgress, 
    loading, 
    error, 
    getContentForReadingLevel, 
    getTranslatedContent 
  } = useLessonData(lessonId);
  
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
    
    // Get reading level from user preferences, default to Grade 5
    const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
    const readingLevelKey = `Text (${userReadingLevel})`;
    
    console.log('User reading level:', userReadingLevel);
    console.log('Reading level key:', readingLevelKey);
    
    // Try to get content for the user's reading level
    let selectedContent = lesson[readingLevelKey as keyof typeof lesson] as string | null;
    
    // Fallback to other reading levels if not available
    if (!selectedContent) {
      selectedContent = lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || lesson['Text (High School)'] || lesson.Text;
    }
    
    console.log('Selected content length:', selectedContent?.length || 0);
    console.log('Selected content preview:', selectedContent?.substring(0, 100) + '...');
    return selectedContent;
  }, [lesson, preferences]);

  const translatedContent = useMemo(() => {
    return getTranslatedContent();
  }, [getTranslatedContent, preferences]);

  // Get comprehensive lesson text for read-aloud functionality
  const lessonTitle = lesson?.Title || `Lesson ${lesson?.['Lesson ID'] || ''}`;
  const lessonDescription = lesson?.Description || '';
  const lessonContent = content || lesson?.Text || lesson?.['Text (Grade 5)'] || lesson?.['Text (Grade 3)'] || lesson?.['Text (Grade 8)'] || 'No content available for this lesson.';
  
  // Combine all text content for comprehensive read-aloud
  const fullLessonText = `${lessonTitle}. ${lessonDescription ? lessonDescription + '. ' : ''}${lessonContent}`;

  return {
    user,
    lesson,
    userProgress: convertedUserProgress,
    loading,
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
