
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { toast } from '@/hooks/use-toast';

export interface Class {
  id: string;
  name: string;
  grade_level: string | null;
  subject: string | null;
  teacher_id: string;
  school_year: string | null;
  created_at: string | null;
  updated_at: string | null;
  published?: boolean;
  description?: string | null;
  duration?: string | null;
  instructor?: string | null;
  schedule?: string | null;
  learning_objectives?: string | null;
  prerequisites?: string | null;
  max_students?: number | null;
}

export const useClasses = (publishedOnly: boolean = false) => {
  const { user } = useAuth();
  const { profile } = useTeacherProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('classes').select('*');
      
      if (publishedOnly) {
        // Fetch all published classes for teachers to browse
        query = query.eq('published', true);
      } else if (profile) {
        // Fetch only user's own classes
        query = query.eq('teacher_id', profile.id);
      } else {
        setLoading(false);
        return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to load classes.",
          variant: "destructive",
        });
        return;
      }

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData: {
    name: string;
    grade_level: string;
    subject: string;
    school_year?: string;
    courses?: string[];
  }) => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "Teacher profile not found. Please complete your profile setup.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: classData.name,
          grade_level: classData.grade_level,
          subject: classData.subject,
          teacher_id: profile.id,
          school_year: classData.school_year || new Date().getFullYear().toString(),
          published: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating class:', error);
        toast({
          title: "Error",
          description: "Failed to create class. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Create class-course relationships if courses were selected
      if (classData.courses && classData.courses.length > 0) {
        const classCourseData = classData.courses.map(track => ({
          class_id: data.id,
          track: track
        }));

        const { error: courseError } = await supabase
          .from('class_courses')
          .insert(classCourseData);

        if (courseError) {
          console.error('Error linking courses to class:', courseError);
          // Don't fail the whole operation, just log the error
        }
      }

      // Auto-populate lessons from selected courses
      if (classData.courses && classData.courses.length > 0) {
        try {
          // Fetch lessons from selected tracks
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('Lessons')
            .select('*')
            .in('Track', classData.courses)
            .order('Order', { ascending: true });

          if (!lessonsError && lessonsData && lessonsData.length > 0) {
            // Create class lessons from the template lessons
            const classLessonsData = lessonsData.map((lesson, index) => ({
              class_id: data.id,
              title: lesson.Title || `Lesson ${lesson['Lesson ID']}`,
              description: lesson.Description || '',
              objectives: lesson.Description ? [lesson.Description] : [],
              materials: [],
              instructions: lesson.Text || '',
              duration: 60, // Default duration
              order_index: index,
            }));

            const { error: insertLessonsError } = await supabase
              .from('lessons')
              .insert(classLessonsData);

            if (insertLessonsError) {
              console.error('Error creating lessons from courses:', insertLessonsError);
            }
          }
        } catch (err) {
          console.error('Error auto-populating lessons:', err);
        }
      }

      // Add the new class to the local state
      setClasses(prev => [data, ...prev]);
      
      toast({
        title: "Success!",
        description: classData.courses && classData.courses.length > 0 
          ? "Class created successfully with lessons from selected courses."
          : "Class created successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      // Remove from local state
      setClasses(prev => prev.filter(cls => cls.id !== classId));
      
      toast({
        title: "Success!",
        description: "Class deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user, profile, publishedOnly]);

  return {
    classes,
    loading,
    createClass,
    deleteClass,
    refetch: fetchClasses,
  };
};
