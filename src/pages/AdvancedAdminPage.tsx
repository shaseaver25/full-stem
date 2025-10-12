import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { HelpHint } from '@/components/common/HelpHint';
import AdvancedAdminPanel from '@/components/admin/AdvancedAdminPanel';

const AdvancedAdminPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Advanced Settings' },
          ]}
        />
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Advanced Settings</h1>
          <HelpHint
            text="Manage system settings, user roles, backups, and performance monitoring. Use these tools carefully as they affect the entire system."
            learnMoreUrl="https://docs.lovable.dev/features/admin"
          />
        </div>
        <AdvancedAdminPanel />
      </div>
    </div>
  );
};

export default AdvancedAdminPage;
