import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import UnifiedGradebook from '@/components/teacher/UnifiedGradebook';

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
        <UnifiedGradebook />
      </div>
    </div>
  );
};

export default UnifiedGradebookPage;