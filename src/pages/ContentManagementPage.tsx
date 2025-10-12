
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ContentLibrary from '@/components/content/ContentLibrary';
import Header from '@/components/Header';

const ContentManagementPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ContentLibrary />
      </div>
    </div>
  );
};

export default ContentManagementPage;
