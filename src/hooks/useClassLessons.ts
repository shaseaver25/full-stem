import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClassLesson {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  order_index: number;
  duration: number | null;
  created_at: string;
  updated_at: string;
  objectives: string[] | null;
  materials: string[] | null;
}

export function useClassLessons(classId: string | undefined) {
  return useQuery({
    queryKey: ['class-lessons', classId],
    queryFn: async () => {
      if (!classId) throw new Error('Class ID is required');

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', classId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as ClassLesson[];
    },
    enabled: !!classId,
  });
}
