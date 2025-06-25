
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

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/teacher/auth" replace />;
  }

  if (!profile) {
    console.log('No profile, redirecting to onboarding');
    return <Navigate to="/teacher/onboarding" replace />;
  }

  console.log('Profile found:', { onboarding_completed: profile.onboarding_completed });

  // If we require onboarding to be completed but it's not
  if (requireOnboarding && !profile.onboarding_completed) {
    console.log('Onboarding required but not completed, redirecting to onboarding');
    return <Navigate to="/teacher/onboarding" replace />;
  }

  // If we're on the onboarding page but onboarding is already completed
  if (!requireOnboarding && profile.onboarding_completed) {
    console.log('On onboarding page but already completed, redirecting to dashboard');
    return <Navigate to="/teacher/dashboard" replace />;
  }

  console.log('Allowing access to current page');
  return <>{children}</>;
};

export default ProtectedTeacherRoute;
