import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { SchoolAdminDashboard } from '@/components/admin/SchoolAdminDashboard';
import { HomeschoolAdminDashboard } from '@/components/admin/HomeschoolAdminDashboard';
import { WorkforceAdminDashboard } from '@/components/admin/WorkforceAdminDashboard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, loading, onboardingCompleted, adminType } = useAdminProfile();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && profile && !onboardingCompleted) {
      navigate('/admin/onboarding');
    }
  }, [loading, profile, onboardingCompleted, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Render context-aware dashboard based on admin type
  const renderDashboard = () => {
    switch (adminType) {
      case 'school':
        return <SchoolAdminDashboard />;
      case 'homeschool':
        return <HomeschoolAdminDashboard />;
      case 'workforce':
        return <WorkforceAdminDashboard />;
      default:
        return <SchoolAdminDashboard />; // Default to school admin
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default AdminDashboard;
