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
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Priority order: developer > super_admin > system_admin > admin > teacher > parent > student
    const rolePriority: UserRole[] = ['developer', 'super_admin', 'system_admin', 'admin', 'teacher', 'parent', 'student'];
    const userRoles = data.map(r => r.role as UserRole);
    const highestRole = rolePriority.find(role => userRoles.includes(role)) || userRoles[0];
    
    return highestRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const redirectToRoleDashboard = async (userId: string, navigate: (path: string) => void) => {
  // Check if user logged in through teacher portal
  const isTeacherPortalLogin = sessionStorage.getItem('teacherPortalLogin') === 'true';
  console.log('🔍 redirectToRoleDashboard called:', { userId, isTeacherPortalLogin });
  
  if (isTeacherPortalLogin) {
    console.log('🎓 Teacher portal login detected, skipping role-based redirect');
    return;
  }

  // Retry logic to wait for role to be assigned (especially for new OAuth users)
  let role: UserRole | null = null;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!role && attempts < maxAttempts) {
    role = await getUserRole(userId);
    
    if (!role) {
      console.log(`⏳ Waiting for role assignment... (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between attempts
      attempts++;
    }
  }
  
  if (role) {
    console.log(`✅ Role found: ${role}, redirecting...`);
    const dashboardPath = getRoleDashboardPath(role);
    navigate(dashboardPath);
  } else {
    console.warn('⚠️ No role found after retries, redirecting to home');
    // Default fallback if no role found after all retries
    navigate('/');
  }
};
