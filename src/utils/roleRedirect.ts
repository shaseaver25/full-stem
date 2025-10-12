import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin' | 'system_admin' | 'developer';

export const getRoleDashboardPath = (role: UserRole): string => {
  const rolePaths: Record<UserRole, string> = {
    student: '/dashboard/student',
    teacher: '/teacher/dashboard',
    parent: '/dashboard/parent',
    admin: '/dashboard/admin/analytics',
    super_admin: '/super-admin',
    system_admin: '/system-dashboard',
    developer: '/dev'
  };
  
  return rolePaths[role] || '/';
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data?.role as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const redirectToRoleDashboard = async (userId: string, navigate: (path: string) => void) => {
  const role = await getUserRole(userId);
  
  if (role) {
    const dashboardPath = getRoleDashboardPath(role);
    navigate(dashboardPath);
  } else {
    // Default fallback if no role found
    navigate('/');
  }
};
