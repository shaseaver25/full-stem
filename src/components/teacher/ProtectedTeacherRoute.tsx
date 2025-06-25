
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

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/teacher/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/teacher/onboarding" replace />;
  }

  if (requireOnboarding && !profile.onboarding_completed) {
    return <Navigate to="/teacher/onboarding" replace />;
  }

  if (!requireOnboarding && !profile.onboarding_completed) {
    return <Navigate to="/teacher/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedTeacherRoute;
