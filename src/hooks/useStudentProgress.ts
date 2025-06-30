
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentProgress {
  lesson_id: number;
  lesson_title: string;
  status: string;
  progress_percentage: number;
  completed_at: string;
  time_spent: number;
}

export const useStudentProgress = () => {
  const [progress, setProgress] = useState<StudentProgress[]>([]);

  const fetchStudentProgress = async (studentId: string) => {
    try {
      const { data } = await supabase
        .from('student_progress')
        .select(`
          lesson_id,
          status,
          progress_percentage,
          completed_at,
          time_spent,
          Lessons (Title)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      const progressData = data?.map(item => ({
        lesson_id: item.lesson_id,
        lesson_title: item.Lessons?.Title || 'Unknown Lesson',
        status: item.status,
        progress_percentage: item.progress_percentage,
        completed_at: item.completed_at,
        time_spent: item.time_spent
      })) || [];

      setProgress(progressData);
      return progressData;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return [];
    }
  };

  return {
    progress,
    fetchStudentProgress
  };
};
