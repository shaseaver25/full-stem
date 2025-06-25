
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';

interface LessonData {
  'Lesson ID': number;
  Title: string | null;
  Description: string | null;
  Track: string | null;
  Order: number | null;
  text: string | null;
  'Text (Grade 3)': string | null;
  'Text (Grade 5)': string | null;
  'Text (Grade 8)': string | null;
  'Text (High School)': string | null;
  texta: string | null;
  'Translated Content': any;
  'Source Doc URL': string | null;
  slug: string | null;
}

interface UserProgress {
  'Lesson ID': number;
  'User ID': string;
  Completed: boolean;
}

export const useLessonData = (lessonId: string) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();

  const { data: lesson, error, isLoading: loading } = useQuery({
    queryKey: ['lesson', lessonId],
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
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', lessonId, user?.id],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!lessonId || !user?.id) return null;

      // Try the new user_progress table first
      const { data: newData, error: newError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('lesson_id', parseInt(lessonId))
        .eq('user_id', user.id)
        .maybeSingle();

      if (!newError && newData) {
        // Convert new format to old format for compatibility
        return {
          'Lesson ID': newData.lesson_id,
          'User ID': newData.user_id,
          Completed: newData.status === 'Completed'
        } as UserProgress;
      }

      // If new table doesn't work, return null (old UserProgress table doesn't exist)
      console.log('No user progress found or table does not exist');
      return null;
    },
    enabled: !!user?.id,
  });

  const getContentForReadingLevel = () => {
    if (!lesson) return null;
    
    // Get reading level from user preferences, default to Grade 5
    const userReadingLevel = preferences?.['Reading Level'] || 'Grade 5';
    const readingLevelKey = `Text (${userReadingLevel})` as keyof LessonData;
    
    console.log('User reading level:', userReadingLevel);
    console.log('Reading level key:', readingLevelKey);
    console.log('Available content keys:', Object.keys(lesson));
    
    // Try to get content for the user's reading level
    let content = lesson[readingLevelKey] as string | null;
    
    // Fallback to other reading levels if not available
    if (!content) {
      content = lesson['Text (Grade 5)'] || lesson['Text (Grade 3)'] || lesson['Text (Grade 8)'] || lesson['Text (High School)'] || lesson.text;
    }
    
    console.log('Selected content length:', content?.length || 0);
    return content;
  };

  const getTranslatedContent = () => {
    if (!lesson || !preferences?.['Preferred Language']) return null;
    
    const translatedContent = lesson['Translated Content'];
    const preferredLanguage = preferences['Preferred Language'];
    
    console.log('Translated content:', translatedContent);
    console.log('Preferred language:', preferredLanguage);
    
    if (!translatedContent) return null;
    
    // If translatedContent is a JSON object, try to find the translation
    if (typeof translatedContent === 'object' && translatedContent !== null) {
      // Try different language code formats
      const languageKeys = [
        preferredLanguage.toLowerCase(),
        preferredLanguage.toLowerCase().substring(0, 2), // First 2 letters
        preferredLanguage,
      ];
      
      for (const key of languageKeys) {
        if (translatedContent[key]) {
          console.log('Found translation for key:', key);
          return translatedContent[key];
        }
      }
    }
    
    // If translatedContent is a string, return it directly
    if (typeof translatedContent === 'string') {
      return translatedContent;
    }
    
    console.log('No translation found for language:', preferredLanguage);
    return null;
  };

  return {
    lesson,
    userProgress,
    loading,
    error,
    getContentForReadingLevel,
    getTranslatedContent,
  };
};
