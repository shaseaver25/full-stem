import { supabase } from '@/integrations/supabase/client';
import { getRoleDashboardPath, UserRole, ROLE_RANK } from './roleUtils';

export const redirectUserByRole = async (userId: string, navigate: (path: string) => void) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) throw error;

    // Get highest priority role
    const roles = (data?.map(r => r.role) || []) as UserRole[];
    
    console.log('Roles fetched for user:', roles);
    
    if (roles.length === 0) {
      console.log('No roles found, redirecting to home');
      navigate('/');
      return;
    }
    
    const highestRole = roles.reduce((highest, current) => {
      return ROLE_RANK[current] > ROLE_RANK[highest] ? current : highest;
    }, roles[0]);

    console.log('Highest role selected:', highestRole);
    
    const path = getRoleDashboardPath(highestRole);
    
    console.log(`Redirecting ${highestRole} to ${path}`);
    navigate(path);
  } catch (error) {
    console.error('Error in redirectUserByRole:', error);
    navigate('/');
  }
};

// Alias for backwards compatibility
export const redirectToRoleDashboard = redirectUserByRole;
