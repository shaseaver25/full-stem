import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { useAdminProfile } from './useAdminProfile';

export interface SearchResult {
  type: string;
  name: string;
  id: string;
  route: string;
  metadata: Record<string, any>;
}

export const useGlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { roles } = useUserRole();
  const { profile: adminProfile } = useAdminProfile();
  
  // Get highest role for search permissions
  const role = roles.length > 0 ? roles.reduce((highest, current) => {
    const ROLE_RANK: Record<string, number> = {
      student: 1, parent: 2, teacher: 3, admin: 4, system_admin: 5, super_admin: 6, developer: 7
    };
    return (ROLE_RANK[current] || 0) > (ROLE_RANK[highest] || 0) ? current : highest;
  }, roles[0]) : 'student';

  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', searchQuery, role],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase.rpc('global_search', {
        search_query: searchQuery,
        user_role: role,
        org_name: adminProfile?.organization_name || null,
      });

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      return data as SearchResult[];
    },
    enabled: searchQuery.length >= 2,
  });

  return {
    searchQuery,
    setSearchQuery,
    results: results || [],
    isLoading,
  };
};
