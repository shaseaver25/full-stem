import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ContentLibrary from '@/components/content/ContentLibrary';
import Header from '@/components/Header';
import { HelpHint } from '@/components/common/HelpHint';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

const ContentManagementPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Content Library' },
          ]}
        />
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Content Library</h1>
          <HelpHint
            text="Manage and organize your educational content including documents, videos, and resources. Create, edit, and share content across your organization."
            learnMoreUrl="https://docs.lovable.dev/features/content-library"
          />
        </div>
        <ContentLibrary />
      </div>
    </div>
  );
};

export default ContentManagementPage;
