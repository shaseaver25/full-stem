import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfileSimplified } from '@/hooks/useTeacherProfileSimplified';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedTeacherRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedTeacherRoute: React.FC<ProtectedTeacherRouteProps> = ({ 
  children, 
  requireOnboarding = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useTeacherProfileSimplified();
  const [isElevatedRole, setIsElevatedRole] = React.useState<boolean | null>(null);

  // Check for elevated roles (super_admin or developer)
  React.useEffect(() => {
    const checkElevatedRole = async () => {
      if (!user) {
        setIsElevatedRole(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['super_admin', 'developer']);

        if (error) {
          console.error('Error checking elevated role:', error);
          setIsElevatedRole(false);
        } else {
          setIsElevatedRole(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error checking elevated role:', error);
        setIsElevatedRole(false);
      }
    };

    checkElevatedRole();
  }, [user]);

  console.log('ProtectedTeacherRoute Debug:', {
    user: !!user,
    profile,
    requireOnboarding,
    authLoading,
    profileLoading,
    isElevatedRole,
    currentPath: window.location.pathname
  });

  // Show loading while auth or profile is loading
  if (authLoading || profileLoading || isElevatedRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/teacher/auth" replace />;
  }

  // Super admins and developers have full access to all teacher routes
  if (isElevatedRole) {
    console.log('Elevated role (super_admin/developer) - granting access');
    return <>{children}</>;
  }

  const currentPath = window.location.pathname;

  // Handle onboarding page specifically
  if (currentPath === '/teacher/onboarding') {
    // If profile exists and onboarding is completed, redirect to dashboard
    if (profile && profile.onboarding_completed) {
      console.log('On onboarding page but already completed, redirecting to dashboard');
      return <Navigate to="/teacher/dashboard" replace />;
    }
    // If no profile exists, allow onboarding to create one
    // If profile exists but not completed, allow onboarding to continue
    console.log('Allowing access to onboarding page', { profile: !!profile, completed: profile?.onboarding_completed });
    return <>{children}</>;
  }

  // Handle dashboard and other protected routes
  if (requireOnboarding) {
    // If no profile exists, create one in the background but allow access
    if (!profile) {
      console.log('No profile exists, but allowing access (will be created on first save)');
      return <>{children}</>;
    }
    
    // Always allow access - onboarding is no longer mandatory
    console.log('Allowing access regardless of onboarding status');
    return <>{children}</>;
  }

  // For routes that don't require onboarding completion, just allow access
  console.log('Route does not require onboarding, allowing access');
  return <>{children}</>;
};

export default ProtectedTeacherRoute;
