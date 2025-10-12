import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface SystemAdminProfile {
  mfa_enabled: boolean;
  allowed_ips: string[] | null;
}

export const useSystemAdmin = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  const isSystemAdmin = role === 'system_admin' || role === 'developer';

  // Fetch system admin profile details
  const { data: profile, isLoading } = useQuery({
    queryKey: ['system-admin-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('mfa_enabled, allowed_ips')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as SystemAdminProfile;
    },
    enabled: !!user && isSystemAdmin,
  });

  // MFA enforcement check
  const requiresMFA = isSystemAdmin && !profile?.mfa_enabled;

  // IP restriction check (if implemented)
  const checkIPRestriction = async () => {
    if (!profile?.allowed_ips || profile.allowed_ips.length === 0) {
      return true; // No IP restriction
    }

    try {
      // In a real implementation, you would check against the user's actual IP
      // This would require a backend endpoint to get the client IP
      // For now, we'll skip the actual check but log the requirement
      console.log('IP restriction enabled for system admin', profile.allowed_ips);
      return true;
    } catch (error) {
      console.error('IP check failed:', error);
      return false;
    }
  };

  // Check MFA and redirect if needed
  useEffect(() => {
    if (requiresMFA && !isLoading) {
      console.warn('System admin requires MFA setup');
      // In production, redirect to MFA setup page
      // navigate('/auth/setup-mfa');
    }
  }, [requiresMFA, isLoading, navigate]);

  return {
    isSystemAdmin,
    profile,
    isLoading,
    requiresMFA,
    checkIPRestriction,
  };
};
