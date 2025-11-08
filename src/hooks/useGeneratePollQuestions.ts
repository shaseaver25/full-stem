import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratePollParams {
  lessonId: string;
  pollType: 'single_choice' | 'rating_scale' | 'word_cloud';
  questionCount: number;
  context?: string;
}

export const useGeneratePollQuestions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ lessonId, pollType, questionCount, context }: GeneratePollParams) => {
      const { data, error } = await supabase.functions.invoke('generate-poll-questions', {
        body: { lessonId, pollType, questionCount, context },
      });

      if (error) throw error;
      return data.pollQuestions;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'AI generated poll questions!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate polls: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
