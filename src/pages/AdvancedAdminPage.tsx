
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdvancedAdminPanel from '@/components/admin/AdvancedAdminPanel';

const AdvancedAdminPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdvancedAdminPanel />
      </div>
    </div>
  );
};

export default AdvancedAdminPage;
