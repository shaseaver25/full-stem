import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';

export interface LessonData {
  'Lesson ID': number;
  Title: string | null;
  Description: string | null;
  Track: string | null;
  Order: number | null;
  Text: string | null;
  'Text (Grade 3)': string | null;
  'Text (Grade 5)': string | null;
  'Text (Grade 8)': string | null;
  'Text (High School)': string | null;
  Texta: string | null;
  'Translated Content': any;
  'Source Doc URL': string | null;
  slug: string | null;
  video_url: string | null;
  desmos_enabled: boolean | null;
  desmos_type: 'calculator' | 'geometry' | null;
}

interface UserProgress {
  'Lesson ID': number;
  'User ID': string;
  Completed: boolean;
}

interface LessonDataOptimized {
  lesson: LessonData | null;
  userProgress: UserProgress | null;
  essentialLoading: boolean;
  secondaryLoading: boolean;
  error: any;
  getContentForReadingLevel: () => string | null;
  getTranslatedContent: () => any;
}

export const useLessonDataOptimized = (lessonId: string): LessonDataOptimized => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();

  console.log('useLessonDataOptimized: Starting with lessonId:', lessonId);

  // Core lesson data - loads COMPLETELY INDEPENDENTLY
  const { 
    data: lesson, 
    error, 
    isLoading: essentialLoading 
  } = useQuery({
    queryKey: ['lesson-independent', lessonId],
    queryFn: async (): Promise<LessonData | null> => {
      console.log('Fetching lesson data for ID:', lessonId);
      
      if (!lessonId || lessonId === 'undefined') {
        console.warn('Invalid lessonId:', lessonId);
        return null;
      }

      try {
        // Try new lessons table first (UUID-based)
        const { data: newLesson, error: newError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle();

        if (newLesson) {
          console.log('Lesson data fetched from new table:', newLesson.title);
          // Map new schema to old schema for backwards compatibility
          return {
            'Lesson ID': 0, // Not used anymore
            Title: newLesson.title,
            Description: newLesson.description,
            Track: null,
            Order: newLesson.order_index,
            Text: JSON.stringify(newLesson.content), // Store content JSON as text
            'Text (Grade 3)': null,
            'Text (Grade 5)': null,
            'Text (Grade 8)': null,
            'Text (High School)': null,
            Texta: null,
            'Translated Content': null,
            'Source Doc URL': null,
            slug: null,
            video_url: newLesson.materials?.[0] || null,
            desmos_enabled: newLesson.desmos_enabled,
            desmos_type: newLesson.desmos_type as 'calculator' | 'geometry' | null,
          } as LessonData;
        }

        // Fallback to old Lessons table (bigint-based)
        const numericId = parseInt(lessonId);
        if (!isNaN(numericId)) {
          const { data: oldLesson, error: oldError } = await supabase
            .from('Lessons')
            .select('*')
            .eq('Lesson ID', numericId)
            .maybeSingle();

          if (oldLesson) {
            console.log('Lesson data fetched from old table:', oldLesson.Title);
            return oldLesson as LessonData;
          }
          
          if (oldError) {
            console.error('Error fetching from old lessons:', oldError);
          }
        }

        console.log('No lesson found in either table');
        return null;
      } catch (err) {
        console.error('Exception in lesson fetch:', err);
        throw err;
      }
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes - lessons rarely change
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // User progress - loads INDEPENDENTLY and ASYNCHRONOUSLY
  const { 
    data: userProgress,
    isLoading: progressLoading
  } = useQuery({
    queryKey: ['userProgress-independent', lessonId, user?.id],
    queryFn: async (): Promise<UserProgress | null> => {
      console.log('Fetching user progress for lessonId:', lessonId, 'userId:', user?.id);
      
      if (!lessonId || !user?.id || lessonId === 'undefined') {
        console.log('Skipping user progress fetch - missing data');
        return null;
      }

      try {
        const { data: newData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('lesson_id', parseInt(lessonId))
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('User progress fetched:', newData ? 'Found' : 'Not found');

        if (newData) {
          return {
            'Lesson ID': newData.lesson_id,
            'User ID': newData.user_id,
            Completed: newData.status === 'Completed'
          } as UserProgress;
        }

        return null;
      } catch (err) {
        console.error('Error fetching user progress:', err);
        // Don't throw - user progress is optional
        return null;
      }
    },
    enabled: !!user?.id && !!lessonId && lessonId !== 'undefined',
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    retry: 1, // Only retry once for user data
  });

  const secondaryLoading = progressLoading;

  const getContentForReadingLevel = useMemo(() => {
    return () => {
      if (!lesson) return null;
      
      // Use preferences if available, otherwise default to Grade 5
      const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
      const readingLevelKey = `Text (${userReadingLevel})` as keyof LessonData;
      
      let content = lesson[readingLevelKey] as string | null;
      
      // Fallback hierarchy - always show something
      if (!content) {
        content = lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || lesson['Text (High School)'] || lesson.Text;
      }
      
      return content;
    };
  }, [lesson, preferences]);

  const getTranslatedContent = useMemo(() => {
    return () => {
      // Return null if no lesson OR no preferred language
      if (!lesson || !preferences?.['Preferred Language']) return null;
      
      const translatedContent = lesson['Translated Content'];
      const preferredLanguage = preferences['Preferred Language'];
      
      if (!translatedContent) return null;
      
      if (typeof translatedContent === 'object' && translatedContent !== null) {
        const languageKeys = [
          preferredLanguage.toLowerCase(),
          preferredLanguage.toLowerCase().substring(0, 2),
          preferredLanguage,
        ];
        
        for (const key of languageKeys) {
          if (translatedContent[key]) {
            return translatedContent[key];
          }
        }
      }
      
      if (typeof translatedContent === 'string') {
        return translatedContent;
      }
      
      return null;
    };
  }, [lesson, preferences]);

  console.log('useLessonDataOptimized: Returning state', {
    hasLesson: !!lesson,
    lessonTitle: lesson?.Title,
    essentialLoading,
    progressLoading,
    error: error?.message
  });

  return {
    lesson,
    userProgress,
    essentialLoading,
    secondaryLoading: progressLoading,
    error,
    getContentForReadingLevel,
    getTranslatedContent,
  };
};