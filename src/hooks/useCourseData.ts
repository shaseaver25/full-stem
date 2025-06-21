
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lesson, UserProgress } from '@/types/courseTypes';

export const useCourseData = (trackFilter: string) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonsAndProgress = useCallback(async () => {
    if (!trackFilter) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching lessons for track:', trackFilter);
      
      // Fetch lessons for the specific track
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('Lessons')
        .select('*')
        .eq('Track', trackFilter)
        .order('Order', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        throw lessonsError;
      }

      console.log('Fetched lessons:', lessonsData);

      // Fetch user progress if user is authenticated
      let progressData: UserProgress[] = [];
      if (user && lessonsData?.length) {
        const lessonIds = lessonsData.map(lesson => lesson['Lesson ID']);
        const { data: userProgressData, error: progressError } = await supabase
          .from('user_progress')
          .select('lesson_id, status, progress_percentage')
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds);

        if (progressError) {
          console.error('Error fetching user progress:', progressError);
          // Don't throw here - progress is optional, lessons can still be shown
        } else {
          // Type assertion to ensure proper typing
          progressData = (userProgressData || []).map(item => ({
            lesson_id: item.lesson_id,
            status: item.status as 'Not Started' | 'In Progress' | 'Completed',
            progress_percentage: item.progress_percentage || 0
          }));
        }
      }
      
      setLessons(lessonsData || []);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [trackFilter, user]);

  useEffect(() => {
    fetchLessonsAndProgress();
  }, [fetchLessonsAndProgress]);

  return {
    lessons,
    userProgress,
    loading,
    error,
    refetch: fetchLessonsAndProgress
  };
};
