import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

// TEMPORARY: Auth bypass flag - must match AuthContext
const AUTH_BYPASS_MODE = true;

interface DeveloperRouteProps {
  children: React.ReactNode;
}

const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ children }) => {
  const { roles, isLoading } = useUserRole();

  // In bypass mode, allow everything
  if (AUTH_BYPASS_MODE) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roles.includes('developer')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DeveloperRoute;