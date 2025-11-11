// Additional hooks for backward compatibility and missing functionality

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Fetch all classes for a teacher (or all classes if developer)
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      // Check if user is a developer
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id);

      const isDeveloper = roles?.some(r => r.role === 'developer');

      // If developer, fetch all classes
      if (isDeveloper) {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        // Filter out conference classes
        return (data || []).filter(cls => !cls.name?.startsWith('Applied AI Conference'));
      }

      // Otherwise, fetch only teacher's classes
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!teacherProfile) throw new Error('Teacher profile not found');

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter out conference classes
      return (data || []).filter(cls => !cls.name?.startsWith('Applied AI Conference'));
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

      // Get the teacher profile first
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!teacherProfile) throw new Error('Teacher profile not found');

      const { data, error } = await supabase
        .from('classes')
        .insert({
          ...classData,
          teacher_id: teacherProfile.id,
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