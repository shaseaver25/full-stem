import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { UserRole, getRoleDashboardPath } from '@/utils/roleRedirect';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RequireRole = ({ children, allowedRoles }: RequireRoleProps) => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        // Fetch all user roles from database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setUserRole(null);
        } else if (data && data.length > 0) {
          // Priority order: developer > super_admin > system_admin > admin > teacher > parent > student
          const rolePriority: UserRole[] = ['developer', 'super_admin', 'system_admin', 'admin', 'teacher', 'parent', 'student'];
          const userRoles = data.map(r => r.role as UserRole);
          const highestRole = rolePriority.find(role => userRoles.includes(role)) || userRoles[0];
          setUserRole(highestRole);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      } finally {
        setChecking(false);
      }
    };

    checkUserRole();
  }, [user]);

  // Show loading state
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // No role found - redirect to home
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // Developer role has universal access to all routes
  const isDeveloper = userRole === 'developer';
  
  // Check if user's role is in the allowed roles
  const hasAccess = isDeveloper || allowedRoles.includes(userRole);

  // Access denied - redirect to 403 page
  if (!hasAccess) {
    return <Navigate to="/access-denied" state={{ from: location.pathname, userRole }} replace />;
  }

  // User has access - render children
  return <>{children}</>;
};

export default RequireRole;
