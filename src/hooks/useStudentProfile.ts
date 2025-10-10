import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface StudentProfile {
  first_name: string;
  last_name: string;
  email: string;
  grade_level: string;
  user_id: string;
}

export const useStudentProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['studentProfile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('students')
        .select(`
          first_name,
          last_name,
          grade_level,
          user_id
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Get email from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      return {
        ...data,
        email: profileData?.email || user.email || ''
      } as StudentProfile;
    },
    enabled: !!user
  });
};

interface UpdateProfileData {
  grade_level: string;
}

export const useUpdateStudentProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('students')
        .update({
          grade_level: data.grade_level
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
