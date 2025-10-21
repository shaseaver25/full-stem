import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DemoClassResponse {
  success: boolean;
  message: string;
  data?: {
    teacher: {
      email: string;
      password: string;
      name: string;
    };
    student: {
      email: string;
      password: string;
      name: string;
    };
    class: {
      id: string;
      name: string;
    };
    lessons: string[];
    assignments: string[];
  };
  error?: string;
}

export const useCreateDemoClass = () => {
  return useMutation({
    mutationFn: async (): Promise<DemoClassResponse> => {
      console.log('🎓 Calling create-demo-class edge function...');
      
      const { data, error } = await supabase.functions.invoke('create-demo-class', {
        body: {}
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to create demo class');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create demo class');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Demo Class Created',
        description: `Successfully created "${data.data?.class.name}" with demo teacher and student accounts`,
      });

      // Log credentials to console for easy access
      console.log('📋 Demo Class Credentials:');
      console.log('Teacher:', data.data?.teacher);
      console.log('Student:', data.data?.student);
      console.table([
        { Role: 'Teacher', Email: data.data?.teacher.email, Password: data.data?.teacher.password },
        { Role: 'Student', Email: data.data?.student.email, Password: data.data?.student.password }
      ]);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to create demo class:', error);
      toast({
        title: 'Failed to Create Demo Class',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
