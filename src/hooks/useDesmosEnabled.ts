import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDesmosEnabled = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['lesson-desmos-enabled', lessonId],
    queryFn: async () => {
      if (!lessonId) return { enabled: false, type: null };

      const { data, error } = await supabase
        .from('lessons')
        .select('desmos_enabled, desmos_type')
        .eq('id', lessonId)
        .single();

      if (error) {
        console.error('Error fetching Desmos settings:', error);
        return { enabled: false, type: null };
      }

      return {
        enabled: data?.desmos_enabled || false,
        type: data?.desmos_type || null,
      };
    },
    enabled: !!lessonId,
    staleTime: 30000, // Cache for 30 seconds
  });
};
