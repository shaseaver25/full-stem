import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  track: string;
  lessonCount: number;
  description?: string;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      // Get distinct tracks from the Lessons table
      const { data, error } = await supabase
        .from('Lessons')
        .select('Track')
        .not('Track', 'is', null)
        .not('Track', 'eq', '');

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      // Group by track and count lessons
      const trackGroups = data?.reduce((acc: Record<string, number>, lesson) => {
        const track = lesson.Track?.trim();
        if (track) {
          acc[track] = (acc[track] || 0) + 1;
        }
        return acc;
      }, {});

      // Convert to course objects
      const courseList = Object.entries(trackGroups || {}).map(([track, count]) => ({
        track,
        lessonCount: count,
        description: `${count} lessons available`
      }));

      setCourses(courseList);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    refetch: fetchCourses,
  };
};