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
        // Fetch user role from database
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          setUserRole(data?.role as UserRole);
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

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(userRole);

  // Access denied - redirect to 403 page
  if (!hasAccess) {
    return <Navigate to="/access-denied" state={{ from: location.pathname, userRole }} replace />;
  }

  // User has access - render children
  return <>{children}</>;
};

export default RequireRole;
