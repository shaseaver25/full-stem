import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useGlobalSettings = () => {
  return useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data as GlobalSetting[];
    },
  });
};

export const useGlobalSetting = (key: string) => {
  return useQuery({
    queryKey: ['global-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('setting_key', key)
        .single();
      
      if (error) throw error;
      return data as GlobalSetting;
    },
  });
};

export const useUpdateGlobalSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase
        .from('global_settings')
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-settings'] });
      queryClient.invalidateQueries({ queryKey: ['global-setting'] });
    },
  });
};