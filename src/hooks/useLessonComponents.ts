import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LessonComponent {
  id: string;
  lesson_id: string;
  component_type: string;
  content: any;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  teacher_only?: boolean;
  created_at: string;
  updated_at: string;
}

export const useLessonComponents = (lessonId: string | number) => {
  return useQuery({
    queryKey: ['lesson-components', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_components')
        .select('*')
        .eq('lesson_id', String(lessonId))
        .eq('enabled', true)
        .order('order');
      
      if (error) throw error;
      return data as LessonComponent[];
    },
    enabled: !!lessonId,
  });
};

export const useCreateLessonComponents = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (components: Omit<LessonComponent, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('lesson_components')
        .insert(components)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ 
          queryKey: ['lesson-components', variables[0].lesson_id] 
        });
      }
    },
  });
};

export const useUpdateLessonComponent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LessonComponent> }) => {
      const { data, error } = await supabase
        .from('lesson_components')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && data[0]) {
        queryClient.invalidateQueries({ 
          queryKey: ['lesson-components', data[0].lesson_id] 
        });
      }
    },
  });
};