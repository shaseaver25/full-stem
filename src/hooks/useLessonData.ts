
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LessonData {
  'Lesson ID': number;
  Title: string | null;
  Description: string | null;
  Track: string | null;
  Order: number | null;
  Content: string | null;
  'Text (Grade 3)': string | null;
  'Text (Grade 5)': string | null;
  'Text (Grade 8)': string | null;
  'Text (Grade X)': string | null;
  'Translated Content': any;
  'Source Doc URL': string | null;
}

interface UserProgress {
  'Lesson ID': number;
  'User ID': string;
  Completed: boolean;
}

export const useLessonData = (lessonId: string) => {
  const { user } = useAuth();
  const [readingLevel, setReadingLevel] = useState<string | null>(null);

  useEffect(() => {
    // Determine user's reading level here based on user data or preferences
    // For now, let's just set it to Grade 5 as a default
    setReadingLevel('Text (Grade 5)');
  }, [user]);

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
    if (!lesson || !readingLevel) return null;
    return lesson[readingLevel] || lesson.Content || null;
  };

  const getTranslatedContent = () => {
    if (!lesson) return null;
    return lesson['Translated Content'] || null;
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
