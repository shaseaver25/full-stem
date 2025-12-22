import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// TEMPORARY: Auth bypass flag - must match AuthContext
const AUTH_BYPASS_MODE = true;

// All roles for bypass mode
const BYPASS_ROLES = ['developer', 'super_admin', 'admin', 'teacher', 'student', 'parent'];

/**
 * Hook to fetch and manage user roles from the user_roles table
 * Returns all roles the user has
 */
export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<string[]>(AUTH_BYPASS_MODE ? BYPASS_ROLES : []);
  const [isLoading, setIsLoading] = useState(!AUTH_BYPASS_MODE);

  useEffect(() => {
    // If bypass mode is enabled, grant all roles immediately
    if (AUTH_BYPASS_MODE) {
      setRoles(BYPASS_ROLES);
      setIsLoading(false);
      return;
    }

    // Wait for auth to finish loading before checking roles
    if (authLoading) {
      setIsLoading(true);
      return;
    }

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

    // Note: Real-time subscriptions disabled to prevent React Strict Mode issues
    // Roles will be fetched on mount and when user changes
    // If real-time updates are needed, implement at component level instead
  }, [user?.id, authLoading]);

  return { roles, isLoading };
};
