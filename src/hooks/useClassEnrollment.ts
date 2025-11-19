import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EnrollmentData {
  classCode: string;
}

interface EnrollmentResult {
  success: boolean;
  classTitle?: string;
  error?: string;
}

export const useClassEnrollment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollmentData): Promise<EnrollmentResult> => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Use the secure RPC function that bypasses RLS
      const { data: result, error } = await supabase
        .rpc('join_class_by_code', {
          _user_id: user.id,
          _class_code: data.classCode
        })
        .maybeSingle();

      // Handle RPC errors
      if (error) {
        throw new Error('Failed to process enrollment. Please try again.');
      }

      // Handle business logic responses from the RPC
      if (!result?.success) {
        return {
          success: false,
          error: result?.error || 'Unable to join class. Please try again.'
        };
      }

      return {
        success: true,
        classTitle: result.class_name
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
        toast({
          title: '🎉 Successfully Enrolled!',
          description: `You've joined ${result.classTitle}!`,
        });
      } else if (result.error) {
        toast({
          title: 'Enrollment Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Something went wrong',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};
