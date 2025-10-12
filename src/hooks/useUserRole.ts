import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/utils/roleRedirect';

/**
 * Hook to fetch and manage user role
 * Returns the user's role from the database
 */
export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Only log error if it's not a "no rows" error (user might not have role yet)
          if (error.code !== 'PGRST116') {
            console.error('Error fetching user role:', error);
          }
          setRole(null);
        } else {
          setRole(data?.role as UserRole);
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    // Set up real-time subscription for role changes
    // Create a unique channel for each hook instance to avoid subscription conflicts
    if (user?.id) {
      // Use a random ID to ensure each hook instance gets its own channel
      const uniqueId = Math.random().toString(36).substring(7);
      const channelName = `user_role_${user.id}_${uniqueId}`;
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Role change detected:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setRole((payload.new as any).role as UserRole);
            } else if (payload.eventType === 'DELETE') {
              setRole(null);
            }
          }
        )
        .subscribe();

      return () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }

    return () => {};
  }, [user]);

  return { role, loading };
};
