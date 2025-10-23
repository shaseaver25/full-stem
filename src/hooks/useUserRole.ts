import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to fetch and manage user roles from the user_roles table
 * Returns all roles the user has
 */
export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchUserRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;
        
        setRoles(data?.map(r => r.role) || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();

    // Subscribe to real-time updates with unique channel per user
    const channelName = `user-role-changes-${user.id}`;
    const channel = supabase.channel(channelName);
    
    // Set up subscription with error handling
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔁 Role change detected, refetching roles');
          fetchUserRoles();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Role subscription active');
        }
      });

    return () => {
      supabase.removeChannel(channel).catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [user?.id]);

  return { roles, isLoading };
};
