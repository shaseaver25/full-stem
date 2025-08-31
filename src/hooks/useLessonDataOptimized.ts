import { useState, useEffect, useMemo } from 'react';
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

  // Core lesson data - loads first
  const { 
    data: lesson, 
    error, 
    isLoading: essentialLoading 
  } = useQuery({
    queryKey: ['lesson-core', lessonId],
    queryFn: async (): Promise<LessonData | null> => {
      if (!lessonId) return null;

      const { data, error } = await supabase
        .from('Lessons')
        .select('*')
        .eq('Lesson ID', parseInt(lessonId))
        .single();

      if (error) {
        console.error('Error fetching lesson:', error);
        throw error;
      }

      return data as LessonData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // User progress - loads after core lesson
  const { 
    data: userProgress,
    isLoading: progressLoading
  } = useQuery({
    queryKey: ['userProgress-optimized', lessonId, user?.id],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!lessonId || !user?.id) return null;

      const { data: newData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('lesson_id', parseInt(lessonId))
        .eq('user_id', user.id)
        .maybeSingle();

      if (newData) {
        return {
          'Lesson ID': newData.lesson_id,
          'User ID': newData.user_id,
          Completed: newData.status === 'Completed'
        } as UserProgress;
      }

      return null;
    },
    enabled: !!user?.id && !!lesson,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const secondaryLoading = progressLoading;

  const getContentForReadingLevel = useMemo(() => {
    return () => {
      if (!lesson) return null;
      
      const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
      const readingLevelKey = `Text (${userReadingLevel})` as keyof LessonData;
      
      let content = lesson[readingLevelKey] as string | null;
      
      if (!content) {
        content = lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || lesson['Text (High School)'] || lesson.Text;
      }
      
      return content;
    };
  }, [lesson, preferences]);

  const getTranslatedContent = useMemo(() => {
    return () => {
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

  return {
    lesson,
    userProgress,
    essentialLoading,
    secondaryLoading,
    error,
    getContentForReadingLevel,
    getTranslatedContent,
  };
};