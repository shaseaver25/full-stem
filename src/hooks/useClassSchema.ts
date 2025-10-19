import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateCourseSchema, type CourseSchemaProps } from '@/utils/schemaGenerators';

/**
 * Hook to generate Course schema for a specific class
 * Fetches real data from Supabase and returns schema.org JSON-LD
 */
export const useClassSchema = (classId: string | undefined) => {
  const { data: classData, isLoading } = useQuery({
    queryKey: ['class-schema', classId],
    queryFn: async () => {
      if (!classId) return null;

      const { data: classInfo, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          subject,
          teacher_id
        `)
        .eq('id', classId)
        .maybeSingle();

      if (classError) throw classError;
      if (!classInfo) return null;

      // Fetch teacher profile separately
      let teacherName = 'TailorEDU Instructor';
      if (classInfo.teacher_id) {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('user_id')
          .eq('id', classInfo.teacher_id)
          .maybeSingle();

        if (teacherProfile?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', teacherProfile.user_id)
            .maybeSingle();

          if (profile?.full_name) {
            teacherName = profile.full_name;
          }
        }
      }

      return {
        ...classInfo,
        teacherName
      };
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!classData || isLoading) {
    return null;
  }

  const teacherName = classData.teacherName;

  const courseSchemaProps: CourseSchemaProps = {
    id: classData.id,
    name: classData.name,
    description: classData.description,
    subject: classData.subject,
    instructor: {
      name: teacherName,
    },
  };

  return generateCourseSchema(courseSchemaProps);
};
