import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DemoEnvironmentResponse {
  success: boolean;
  message: string;
  data?: {
    teacher: {
      email: string;
      password: string;
      name?: string;
      userId: string;
    };
    students: Array<{
      email: string;
      password: string;
      name: string;
      userId: string;
    }>;
    class: {
      id: string;
      name: string;
      subject: string;
    };
    assignments: string[];
    submissions: number;
    analyzed: number;
  };
  error?: string;
  stats?: {
    students_created: number;
    assignments_created: number;
    submissions_created: number;
    analyses_completed: number;
  };
}

export const useSeedDemoEnvironment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reset: boolean = false): Promise<DemoEnvironmentResponse> => {
      console.log(`🌱 ${reset ? 'Resetting' : 'Seeding'} demo environment...`);
      
      const { data, error } = await supabase.functions.invoke('seed-demo-classroom', {
        body: { reset }
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
    onSuccess: (data, reset) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['demo-class'] });
      queryClient.invalidateQueries({ queryKey: ['demo-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['demo-submissions'] });
      
      const stats = data.stats || {
        students_created: 0,
        assignments_created: 0,
        submissions_created: 0,
        analyses_completed: 0
      };

      toast({
        title: reset ? '🔄 Demo Environment Reset' : '✅ Demo Environment Created',
        description: `Class: ${data.data?.class.name} • ${stats.students_created} students • ${stats.assignments_created} assignments • ${stats.submissions_created} submissions`,
        duration: 10000,
      });

      // Log credentials to console for easy access
      console.log('📋 Demo Environment Ready!');
      console.log('━'.repeat(50));
      console.log('Teacher Account:', {
        email: data.data?.teacher.email,
        password: data.data?.teacher.password,
        userId: data.data?.teacher.userId
      });
      console.log('━'.repeat(50));
      console.log(`Students: ${stats.students_created} accounts created`);
      if (data.data?.students && data.data.students.length > 0) {
        console.log('Sample Student:', {
          email: data.data.students[0].email,
          password: data.data.students[0].password,
          name: data.data.students[0].name
        });
      }
      console.log('━'.repeat(50));
      console.log('Statistics:', {
        class: data.data?.class.name,
        students: stats.students_created,
        assignments: stats.assignments_created,
        submissions: stats.submissions_created,
        analyzed: stats.analyses_completed
      });
      console.log('━'.repeat(50));
      console.log('🎯 Navigate to /demo/adaptive-classroom to view the demo');
    },
    onError: (error: Error) => {
      console.error('❌ Failed to seed demo environment:', error);
      toast({
        title: 'Seeding Failed',
        description: error.message || 'Failed to create demo environment. Check console for details.',
        variant: 'destructive',
        duration: 8000,
      });
    }
  });
};
