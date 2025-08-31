import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfileSimplified } from '@/hooks/useTeacherProfileSimplified';

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
    // If no profile exists, redirect to onboarding
    if (!profile) {
      console.log('No profile exists, redirecting to onboarding');
      return <Navigate to="/teacher/onboarding" replace />;
    }
    
    // If profile exists but onboarding not completed, redirect to onboarding
    if (!profile.onboarding_completed) {
      console.log('Profile exists but onboarding not completed, redirecting to onboarding');
      return <Navigate to="/teacher/onboarding" replace />;
    }
    
    // If we reach here, profile exists and onboarding is completed
    console.log('Profile exists and onboarding completed, allowing access');
    return <>{children}</>;
  }

  // For routes that don't require onboarding completion, just allow access
  console.log('Route does not require onboarding, allowing access');
  return <>{children}</>;
};

export default ProtectedTeacherRoute;
