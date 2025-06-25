
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';

interface ProtectedTeacherRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedTeacherRoute: React.FC<ProtectedTeacherRouteProps> = ({ 
  children, 
  requireOnboarding = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useTeacherProfile();

  console.log('ProtectedTeacherRoute Debug:', {
    user: !!user,
    profile,
    requireOnboarding,
    authLoading,
    profileLoading,
    currentPath: window.location.pathname
  });

  // Show loading while auth or profile is loading
  if (authLoading || profileLoading) {
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

  // If no profile exists yet, redirect to onboarding (unless already there)
  if (!profile && window.location.pathname !== '/teacher/onboarding') {
    console.log('No profile, redirecting to onboarding');
    return <Navigate to="/teacher/onboarding" replace />;
  }

  // If profile exists and onboarding is completed
  if (profile && profile.onboarding_completed) {
    // If we're on onboarding page but already completed, go to dashboard
    if (window.location.pathname === '/teacher/onboarding') {
      console.log('On onboarding page but already completed, redirecting to dashboard');
      return <Navigate to="/teacher/dashboard" replace />;
    }
    
    // If we require onboarding completion and it's done, allow access
    if (requireOnboarding) {
      console.log('Onboarding completed, allowing access to protected route');
      return <>{children}</>;
    }
  }

  // If profile exists but onboarding is not completed
  if (profile && !profile.onboarding_completed) {
    // If we require onboarding but it's not completed, redirect to onboarding
    if (requireOnboarding && window.location.pathname !== '/teacher/onboarding') {
      console.log('Onboarding required but not completed, redirecting to onboarding');
      return <Navigate to="/teacher/onboarding" replace />;
    }
    
    // If we're on onboarding page and onboarding is not completed, allow access
    if (window.location.pathname === '/teacher/onboarding') {
      console.log('On onboarding page and onboarding not completed, allowing access');
      return <>{children}</>;
    }
  }

  // Default: allow access
  console.log('Default: allowing access to current page');
  return <>{children}</>;
};

export default ProtectedTeacherRoute;
