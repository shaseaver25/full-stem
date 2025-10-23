import { supabase } from "@/integrations/supabase/client";
import { getRoleDashboardPath, type UserRole } from "./roleUtils";

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data?.role as UserRole || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const redirectToRoleDashboard = async (userId: string, navigate: (path: string) => void) => {
  const role = await getUserRole(userId);
  
  if (role) {
    const dashboardPath = getRoleDashboardPath(role);
    console.log(`Redirecting ${role} to ${dashboardPath}`);
    navigate(dashboardPath);
  } else {
    console.log('No role found, redirecting to home');
    navigate('/');
  }
};
