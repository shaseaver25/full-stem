import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to enforce MFA for privileged roles
 * Redirects to MFA setup if user has developer or system_admin role but MFA is not enabled
 * Redirects to MFA verify if MFA is enabled but not verified in JWT
 */
export const useMFAEnforcement = () => {
  const { user } = useAuth();
  const { roles } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Temporary bypass for specific users during troubleshooting
  const bypassEmails = ['shannon@creatempls.org'];
  const isBypassUser = user?.email && bypassEmails.includes(user.email);

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
    enabled: !!user && (roles.includes('developer') || roles.includes('system_admin')),
  });

  useEffect(() => {
    if (!user || roles.length === 0) return;

    // Skip MFA enforcement for bypass users
    if (isBypassUser) return;

    // Check if role requires MFA
    const requiresMFA = roles.includes('developer') || roles.includes('system_admin');
    
    // Skip enforcement on MFA pages
    const isMFAPage = location.pathname.startsWith('/auth/setup-mfa') || 
                      location.pathname.startsWith('/auth/verify-mfa');
    
    if (requiresMFA && !isMFAPage) {
      // Check if MFA is enabled in profile
      if (!profile?.mfa_enabled) {
        // Store return URL for after MFA setup
        sessionStorage.setItem('mfa_return_url', location.pathname);
        navigate('/auth/setup-mfa');
        return;
      }

      // Check if MFA is verified in JWT claims
      const mfaVerified = user.app_metadata?.mfa_verified;
      const mfaVerifiedAt = user.app_metadata?.mfa_verified_at;
      
      // Check if verification is expired (12 hours)
      const isExpired = mfaVerifiedAt 
        ? (Date.now() - new Date(mfaVerifiedAt).getTime()) > (12 * 60 * 60 * 1000)
        : true;

      if (!mfaVerified || isExpired) {
        // Store return URL for after MFA verification
        sessionStorage.setItem('mfa_return_url', location.pathname);
        navigate('/auth/verify-mfa');
      }
    }
  }, [user, roles, profile, navigate, location]);

  return {
    requiresMFA: roles.includes('developer') || roles.includes('system_admin'),
    mfaEnabled: profile?.mfa_enabled ?? false,
    mfaVerified: user?.app_metadata?.mfa_verified ?? false,
  };
};
