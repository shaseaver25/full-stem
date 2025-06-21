
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Lesson, UserProgress } from '@/types/courseTypes';

interface LessonData extends Lesson {
  'Content': string | null;
  'Text (Grade 3)': string | null;
  'Text (Grade 5)': string | null;
  'Text (Grade 8)': string | null;
  'Text (High School)': string | null;
  'Translated Content': any;
}

export const useLessonData = (lessonId: string) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonData = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('Lessons')
        .select('*')
        .eq('Lesson ID', parseInt(lessonId))
        .single();

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        setError('Failed to load lesson data');
        return;
      }

      setLesson(lessonData);

      // Fetch user progress if user is authenticated
      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('lesson_id, status, progress_percentage, completed_at, date_completed')
          .eq('user_id', user.id)
          .eq('lesson_id', parseInt(lessonId))
          .maybeSingle();

        if (progressError) {
          console.error('Error fetching progress:', progressError);
        } else if (progressData) {
          setUserProgress({
            lesson_id: progressData.lesson_id,
            status: progressData.status as 'Not Started' | 'In Progress' | 'Completed',
            progress_percentage: progressData.progress_percentage || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      setError('Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [lessonId, user]);

  const getContentForReadingLevel = (): string => {
    if (!lesson) return '';
    
    const readingLevel = preferences?.['Reading Level'];
    
    switch (readingLevel) {
      case 'Grade 3':
        return lesson['Text (Grade 3)'] || lesson['Content'] || '';
      case 'Grade 5':
        return lesson['Text (Grade 5)'] || lesson['Content'] || '';
      case 'Grade 8':
        return lesson['Text (Grade 8)'] || lesson['Content'] || '';
      case 'High School':
        return lesson['Text (High School)'] || lesson['Content'] || '';
      default:
        return lesson['Content'] || lesson['Text (Grade 5)'] || '';
    }
  };

  const getTranslatedContent = (): string | null => {
    if (!lesson || !preferences?.['Preferred Language']) return null;
    
    const translatedContent = lesson['Translated Content'];
    if (!translatedContent || typeof translatedContent !== 'object') return null;
    
    // Simple language code mapping - in production, you'd want more robust language detection
    const languageCode = preferences['Preferred Language'].toLowerCase().substring(0, 2);
    return translatedContent[languageCode] || null;
  };

  return {
    lesson,
    userProgress,
    loading,
    error,
    getContentForReadingLevel,
    getTranslatedContent,
    refetch: fetchLessonData
  };
};
