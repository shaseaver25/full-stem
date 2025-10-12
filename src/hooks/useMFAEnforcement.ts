import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to enforce MFA for privileged roles
 * Redirects to MFA setup if user has developer or system_admin role but MFA is not enabled
 */
export const useMFAEnforcement = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['mfa-status', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('mfa_enabled')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && (role === 'developer' || role === 'system_admin'),
  });

  useEffect(() => {
    if (!user || !role) return;

    // Check if role requires MFA
    const requiresMFA = role === 'developer' || role === 'system_admin';
    
    // Skip enforcement on MFA pages
    const isMFAPage = location.pathname.startsWith('/auth/setup-mfa') || 
                      location.pathname.startsWith('/auth/verify-mfa');
    
    if (requiresMFA && !profile?.mfa_enabled && !isMFAPage) {
      // Store return URL for after MFA setup
      sessionStorage.setItem('mfa_return_url', location.pathname);
      navigate('/auth/setup-mfa');
    }
  }, [user, role, profile, navigate, location]);

  return {
    requiresMFA: role === 'developer' || role === 'system_admin',
    mfaEnabled: profile?.mfa_enabled ?? false,
  };
};
