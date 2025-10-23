import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { hasPermission, type UserRole } from '@/utils/roleUtils';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        } else {
          setUserRole(data?.role as UserRole || null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userRole) {
    console.warn('User has no role assigned');
    return <Navigate to="/" replace />;
  }

  // Developer has access to everything
  if (userRole === 'developer') {
    return <>{children}</>;
  }

  // Check if user's role is in the allowed roles list
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    console.warn(`Access denied: User role "${userRole}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
