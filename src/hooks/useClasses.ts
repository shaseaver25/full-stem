// Additional hooks for backward compatibility and missing functionality

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Fetch all classes for a teacher
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Create a new class
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (classData: {
      name: string;
      subject?: string;
      grade_level?: string;
      description?: string;
      max_students?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('classes')
        .insert({
          ...classData,
          teacher_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newClass) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Class created',
        description: `${newClass.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error creating class:', error);
      toast({
        title: 'Error creating class',
        description: 'Failed to create class. Please try again.',
        variant: 'destructive',
      });
    },
  });
};