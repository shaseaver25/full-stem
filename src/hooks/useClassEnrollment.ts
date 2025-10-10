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

      // Step 1: Get student ID from students table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !studentData) {
        throw new Error('Student profile not found. Please complete your profile setup.');
      }

      // Step 2: Find class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, teacher_id')
        .eq('class_code', data.classCode.toUpperCase())
        .single();

      if (classError || !classData) {
        return {
          success: false,
          error: 'No class found with that code. Please check the code and try again.'
        };
      }

      // Step 3: Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', studentData.id)
        .maybeSingle();

      if (enrollmentCheckError) {
        throw new Error('Error checking enrollment status');
      }

      if (existingEnrollment) {
        return {
          success: false,
          error: `You're already enrolled in ${classData.name}!`
        };
      }

      // Step 4: Enroll student
      const { error: enrollError } = await supabase
        .from('class_students')
        .insert({
          class_id: classData.id,
          student_id: studentData.id,
          status: 'active'
        });

      if (enrollError) {
        throw new Error('Failed to enroll in class. Please try again.');
      }

      return {
        success: true,
        classTitle: classData.name
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
