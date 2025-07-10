import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClassCourse {
  id: string;
  class_id: string;
  track: string;
  created_at: string;
}

export const useClassCourses = (classId?: string) => {
  const [classCourses, setClassCourses] = useState<ClassCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassCourses = async () => {
    if (!classId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('class_courses')
        .select('*')
        .eq('class_id', classId);

      if (error) {
        console.error('Error fetching class courses:', error);
        return;
      }

      setClassCourses(data || []);
    } catch (error) {
      console.error('Error fetching class courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassCourses();
  }, [classId]);

  return {
    classCourses,
    loading,
    refetch: fetchClassCourses,
  };
};