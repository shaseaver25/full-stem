import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StudentPreference {
  student_email: string | null;
  parents: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    relationship_type: string | null;
  }[];
}

export const useStudentPreferences = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['student-preferences', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID required');

      // Get student's user_id and email
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData?.user_id) return { student_email: null, parents: [] };

      // Get student email from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', studentData.user_id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Get parent relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('student_parent_relationships')
        .select('relationship_type, parent_id')
        .eq('student_id', studentId);

      if (relationshipsError) throw relationshipsError;
      if (!relationships || relationships.length === 0) {
        return { 
          student_email: profileData?.email || null, 
          parents: [] 
        };
      }

      // Get parent profiles
      const parentIds = relationships.map(r => r.parent_id);
      const { data: parentProfiles, error: parentError } = await supabase
        .from('parent_profiles')
        .select('id, user_id, first_name, last_name, phone_number')
        .in('id', parentIds);

      if (parentError) throw parentError;
      if (!parentProfiles) {
        return { 
          student_email: profileData?.email || null, 
          parents: [] 
        };
      }

      // Get parent emails
      const userIds = parentProfiles.map(p => p.user_id);
      const { data: parentEmailData, error: emailError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (emailError) throw emailError;

      // Combine data
      const parents = parentProfiles.map(parent => {
        const relationship = relationships.find(r => r.parent_id === parent.id);
        const emailProfile = parentEmailData?.find(p => p.id === parent.user_id);

        return {
          id: parent.id,
          first_name: parent.first_name,
          last_name: parent.last_name,
          email: emailProfile?.email || null,
          phone_number: parent.phone_number,
          relationship_type: relationship?.relationship_type || null,
        };
      });

      return {
        student_email: profileData?.email || null,
        parents,
      };
    },
    enabled: !!studentId,
  });
};
