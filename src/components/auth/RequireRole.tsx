import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { hasPermission, type UserRole } from '@/utils/roleUtils';

// Auth bypass flag - disabled for normal operation
const AUTH_BYPASS_MODE = false;

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [checking, setChecking] = useState(!AUTH_BYPASS_MODE);

  useEffect(() => {
    // If bypass mode is enabled, skip role checking
    if (AUTH_BYPASS_MODE) {
      setChecking(false);
      return;
    }

    const checkUserRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setUserRoles([]);
        } else {
          setUserRoles((data?.map(r => r.role) || []) as UserRole[]);
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        setUserRoles([]);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  // In bypass mode, allow everything
  if (AUTH_BYPASS_MODE) {
    return <>{children}</>;
  }

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

  if (userRoles.length === 0) {
    console.warn('User has no roles assigned');
    return <Navigate to="/" replace />;
  }

  // Developer has access to everything
  if (userRoles.includes('developer')) {
    return <>{children}</>;
  }

  // Check if user has any of the allowed roles
  const hasAccess = userRoles.some(role => allowedRoles.includes(role));

  if (!hasAccess) {
    console.warn(`Access denied: User roles "${userRoles.join(', ')}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
