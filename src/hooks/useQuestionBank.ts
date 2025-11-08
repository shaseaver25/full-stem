import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuestionBankQuestion {
  id: string;
  user_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank' | 'multiple_select';
  image_url?: string;
  hint?: string;
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  created_at: string;
  updated_at: string;
  options?: QuestionBankOption[];
}

export interface QuestionBankOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export const useQuestionBank = (filters?: {
  questionType?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
}) => {
  return useQuery({
    queryKey: ['question-bank', filters],
    queryFn: async () => {
      let query = supabase
        .from('quiz_question_bank')
        .select(`
          *,
          quiz_question_bank_options (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.questionType) {
        query = query.eq('question_type', filters.questionType);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.ilike('question_text', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(q => ({
        ...q,
        options: q.quiz_question_bank_options,
      })) as QuestionBankQuestion[];
    },
  });
};

export const useAddToQuestionBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (question: Omit<QuestionBankQuestion, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Insert question
      const { data: newQuestion, error: questionError } = await supabase
        .from('quiz_question_bank')
        .insert({
          user_id: user.user.id,
          question_text: question.question_text,
          question_type: question.question_type,
          image_url: question.image_url,
          hint: question.hint,
          explanation: question.explanation,
          points: question.points,
          difficulty: question.difficulty,
          tags: question.tags,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert options if provided
      if (question.options && question.options.length > 0) {
        const { error: optionsError } = await supabase
          .from('quiz_question_bank_options')
          .insert(
            question.options.map(opt => ({
              question_id: newQuestion.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
              option_order: opt.option_order,
            }))
          );

        if (optionsError) throw optionsError;
      }

      return newQuestion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({
        title: 'Success',
        description: 'Question saved to bank',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useBulkAddToQuestionBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questions: Omit<QuestionBankQuestion, 'id' | 'created_at' | 'updated_at' | 'user_id'>[]) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const results = [];

      for (const question of questions) {
        const { data: newQuestion, error: questionError } = await supabase
          .from('quiz_question_bank')
          .insert({
            user_id: user.user.id,
            question_text: question.question_text,
            question_type: question.question_type,
            image_url: question.image_url,
            hint: question.hint,
            explanation: question.explanation,
            points: question.points,
            difficulty: question.difficulty,
            tags: question.tags,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        if (question.options && question.options.length > 0) {
          const { error: optionsError } = await supabase
            .from('quiz_question_bank_options')
            .insert(
              question.options.map(opt => ({
                question_id: newQuestion.id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                option_order: opt.option_order,
              }))
            );

          if (optionsError) throw optionsError;
        }

        results.push(newQuestion);
      }

      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({
        title: 'Success',
        description: `${data.length} questions saved to bank`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save questions: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteFromQuestionBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('quiz_question_bank')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({
        title: 'Success',
        description: 'Question deleted from bank',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateQuestionBank = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuestionBankQuestion> }) => {
      const { error } = await supabase
        .from('quiz_question_bank')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank'] });
      toast({
        title: 'Success',
        description: 'Question updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update question: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
