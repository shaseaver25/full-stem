import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';

interface ActivityLog {
  id: string;
  user_id: string;
  role: string;
  admin_type: string | null;
  organization_name: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface UseActivityLogOptions {
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  roleFilter?: string;
  limit?: number;
}

export const useActivityLog = (options: UseActivityLogOptions = {}) => {
  const { user } = useAuth();
  const { roles } = useUserRole();
  const { timeFilter = 'all', roleFilter, limit = 100 } = options;
  
  // Get highest role for permissions
  const role = roles.length > 0 ? roles.reduce((highest, current) => {
    const ROLE_RANK: Record<string, number> = {
      student: 1, parent: 2, teacher: 3, admin: 4, system_admin: 5, super_admin: 6, developer: 7
    };
    return (ROLE_RANK[current] || 0) > (ROLE_RANK[highest] || 0) ? current : highest;
  }, roles[0]) : null;

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['activity-log', timeFilter, roleFilter, user?.id, role],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('activity_log')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
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
      } else if (timeFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('created_at', monthAgo.toISOString());
      }

      // Apply role filter
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });

  return {
    activities: activities || [],
    isLoading,
    refetch,
  };
};
