import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DemoEnvironmentResponse {
  success: boolean;
  message: string;
  data?: {
    teacher: {
      email: string;
      password: string;
      name: string;
      userId: string;
    };
    student: {
      email: string;
      password: string;
      name: string;
      userId: string;
    };
    class: {
      id: string;
      name: string;
    };
    lessons: string[];
    assignments: string[];
    submissions: string[];
    grades: Record<string, string>;
  };
  error?: string;
}

export const useSeedDemoEnvironment = () => {
  return useMutation({
    mutationFn: async (): Promise<DemoEnvironmentResponse> => {
      console.log('🌱 Calling seed-demo-environment edge function...');
      
      const { data, error } = await supabase.functions.invoke('seed-demo-environment', {
        body: {}
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to seed demo environment');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to seed demo environment');
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Demo Environment Created',
        description: `Successfully created "${data.data?.class.name}" with complete demo setup`,
      });

      // Log credentials to console for easy access
      console.log('📋 Demo Environment Credentials:');
      console.log('Teacher:', data.data?.teacher);
      console.log('Student:', data.data?.student);
      console.table([
        { 
          Role: 'Teacher', 
          Email: data.data?.teacher.email, 
          Password: data.data?.teacher.password,
          Name: data.data?.teacher.name
        },
        { 
          Role: 'Student', 
          Email: data.data?.student.email, 
          Password: data.data?.student.password,
          Name: data.data?.student.name
        }
      ]);
      console.log('Class ID:', data.data?.class.id);
      console.log('Lessons:', data.data?.lessons);
      console.log('Assignments:', data.data?.assignments);
      console.log('Grades:', data.data?.grades);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to seed demo environment:', error);
      toast({
        title: 'Failed to Seed Demo Environment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
