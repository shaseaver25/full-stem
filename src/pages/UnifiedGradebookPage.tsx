import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UnifiedGradebookPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/teacher/dashboard" className="flex items-center text-muted-foreground hover:text-foreground mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <GraduationCap className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold">Gradebook</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unified Gradebook</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gradebook is loading...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This is a temporary placeholder. The full gradebook functionality will load once all components are properly connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedGradebookPage;