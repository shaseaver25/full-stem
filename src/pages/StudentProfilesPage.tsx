import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { StudentProfilesView } from '@/components/teacher/StudentProfilesView';

const StudentProfilesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/teacher"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Student Profiles</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentProfilesView />
      </div>
    </div>
  );
};

export default StudentProfilesPage;