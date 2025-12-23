import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys, cachePresets } from '@/config/queryClient';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

/**
 * Hook to fetch and cache user roles from the user_roles table
 * Uses React Query for persistent caching across page navigations
 */
export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: roles = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.userRoles.byUser(user?.id ?? 'anonymous'),
    queryFn: async (): Promise<AppRole[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data?.map(r => r.role) || [];
    },
    // Only run query when we have a user
    enabled: !!user?.id && !authLoading,
    // Use stable cache preset - roles rarely change
    ...cachePresets.stable,
    // Don't retry too aggressively for roles
    retry: 2,
  });

  /**
   * Invalidate the roles cache - call this after role changes
   */
  const invalidateRoles = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userRoles.byUser(user.id) 
      });
    }
  };

  return { 
    roles, 
    isLoading: authLoading || isLoading,
    refetch,
    invalidateRoles,
  };
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: AppRole) => {
  const { roles, isLoading } = useUserRole();
  return {
    hasRole: roles.includes(role),
    isLoading,
  };
};

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (allowedRoles: AppRole[]) => {
  const { roles, isLoading } = useUserRole();
  return {
    hasAnyRole: roles.some(role => allowedRoles.includes(role)),
    isLoading,
  };
};
