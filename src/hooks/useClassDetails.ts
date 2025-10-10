import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClassDetails {
  id: string;
  title: string;
  description: string | null;
  schedule: string | null;
  grade_level: string | null;
  subject: string | null;
  enrolled_at: string;
  teacher: {
    name: string;
    email: string;
  } | null;
}

export const useClassDetails = (classId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['class-details', classId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // First get the student ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;
      if (!studentData) throw new Error('Student profile not found');

      // Check if student is enrolled in this class
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('class_students')
        .select('enrolled_at, status')
        .eq('class_id', classId)
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;
      if (!enrollmentData) throw new Error('Not enrolled in this class');

      // Get class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      if (!classData) throw new Error('Class not found');

      // Get teacher info
      const { data: teacherData, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('user_id')
        .eq('id', (classData as any).teacher_id)
        .single();

      if (teacherError) console.warn('Could not fetch teacher profile:', teacherError);

      let teacherInfo = null;
      if (teacherData) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', teacherData.user_id)
          .single();

        if (!profileError && profileData) {
          teacherInfo = {
            name: profileData.full_name || 'Unknown',
            email: profileData.email || ''
          };
        }
      }

      const data = classData as any;
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        schedule: data.schedule,
        grade_level: data.grade_level,
        subject: data.subject,
        enrolled_at: enrollmentData.enrolled_at,
        teacher: teacherInfo
      } as ClassDetails;
    },
    enabled: !!user && !!classId,
  });
};
