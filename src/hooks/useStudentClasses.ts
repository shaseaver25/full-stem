import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnrolledClass {
  id: string;
  class_id: string;
  enrolled_at: string;
  classes: {
    id: string;
    name: string;
    description: string | null;
    schedule: string | null;
    grade_level: string | null;
    subject: string | null;
    teacher_id: string;
  };
  teacher?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const useStudentClasses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['studentClasses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // First, get the student ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !studentData) {
        throw new Error('Student profile not found');
      }

      // Fetch enrolled classes
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          id,
          class_id,
          enrolled_at,
          classes (
            id,
            name,
            description,
            schedule,
            grade_level,
            subject,
            teacher_id
          )
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Fetch teacher info for each class
      const classesWithTeachers = await Promise.all(
        (data || []).map(async (enrollment) => {
          if (!enrollment.classes) return enrollment;

          // Get teacher user_id from teacher_profiles
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('user_id')
            .eq('id', enrollment.classes.teacher_id)
            .single();

          if (!teacherProfile) return enrollment;

          // Get teacher name from profiles
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', teacherProfile.user_id)
            .single();

          // Parse full_name into first and last
          const fullName = teacherData?.full_name || '';
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          return {
            ...enrollment,
            teacher: {
              first_name: firstName,
              last_name: lastName
            }
          };
        })
      );

      return classesWithTeachers as EnrolledClass[];
    },
    enabled: !!user
  });
};
