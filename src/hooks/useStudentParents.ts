import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ParentInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  relationship_type: string | null;
  phone_number: string | null;
}

export const useStudentParents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-parents', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get student ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) return [];

      // Get parent relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('student_parent_relationships')
        .select(`
          relationship_type,
          parent_id
        `)
        .eq('student_id', studentData.id);

      if (relationshipsError) throw relationshipsError;
      if (!relationships || relationships.length === 0) return [];

      // Get parent profiles
      const parentIds = relationships.map(r => r.parent_id);
      const { data: parentProfiles, error: profilesError } = await supabase
        .from('parent_profiles')
        .select('id, user_id, first_name, last_name, phone_number')
        .in('id', parentIds);

      if (profilesError) throw profilesError;
      if (!parentProfiles) return [];

      // Get parent emails from auth.users via profiles table
      const userIds = parentProfiles.map(p => p.user_id);
      const { data: profiles, error: emailError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (emailError) throw emailError;

      // Combine all data
      const parents: ParentInfo[] = parentProfiles.map(parent => {
        const relationship = relationships.find(r => r.parent_id === parent.id);
        const profile = profiles?.find(p => p.id === parent.user_id);

        return {
          id: parent.id,
          first_name: parent.first_name,
          last_name: parent.last_name,
          email: profile?.email || null,
          relationship_type: relationship?.relationship_type || null,
          phone_number: parent.phone_number,
        };
      });

      return parents;
    },
    enabled: !!user?.id,
  });
};
