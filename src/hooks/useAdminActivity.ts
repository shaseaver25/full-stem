import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from './useUserRole';
import { useAdminProfile } from './useAdminProfile';

interface ActivityLog {
  id: string;
  user_id: string;
  role: string | null;
  admin_type: string | null;
  organization_name: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

interface LogActivityParams {
  action: string;
  details?: Record<string, any>;
}

export const useAdminActivity = (timeFilter: 'today' | 'week' | 'all' = 'all') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useUserRole();
  const { profile: adminProfile } = useAdminProfile();

  // Fetch activity logs from unified activity_log table
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-log', timeFilter, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply time filter
      if (timeFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user && (role === 'admin' || role === 'super_admin' || role === 'developer'),
  });

  // Log activity mutation
  const logActivityMutation = useMutation({
    mutationFn: async ({ action, details = {} }: LogActivityParams) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          role: 'admin',
          admin_type: adminProfile?.admin_type || null,
          organization_name: adminProfile?.organization_name || null,
          action,
          details,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
    },
    onError: (error) => {
      console.error('Failed to log activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to log activity',
        variant: 'destructive',
      });
    },
  });

  return {
    activities,
    isLoading,
    logActivity: logActivityMutation.mutate,
  };
};

// Helper function for easy activity logging
export const logAdminAction = async (
  userId: string,
  action: string,
  details: Record<string, any> = {}
) => {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      role: 'admin',
      action,
      details,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
