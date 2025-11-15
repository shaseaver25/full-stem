import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInsertDemoSubmissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { data, error } = await supabase.functions.invoke('insert-demo-submissions', {
        body: { assignmentId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['demo-submissions'] });
      toast({
        title: 'Submissions Created',
        description: `Successfully inserted ${data.count} student submissions`,
      });
      console.log('Submission IDs:', data.submissions);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};
