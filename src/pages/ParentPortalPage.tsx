
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ParentPortal from '@/components/parent/ParentPortal';

const ParentPortalPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ParentPortal />
      </div>
    </div>
  );
};

export default ParentPortalPage;
