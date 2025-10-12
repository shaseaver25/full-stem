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
  const { role } = useUserRole();
  const { profile: adminProfile } = useAdminProfile();

  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', searchQuery, role],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase.rpc('global_search', {
        search_query: searchQuery,
        user_role: role || 'student',
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
