import React from 'react';
import { Navigate } from 'react-router-dom';
import { useImpersonation } from '@/contexts/ImpersonationContext';

interface DeveloperRouteProps {
  children: React.ReactNode;
}

const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ children }) => {
  const { isDeveloper } = useImpersonation();

  if (!isDeveloper) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DeveloperRoute;