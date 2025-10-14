
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import SimpleGradebook from '@/components/teacher/SimpleGradebook';

const AssignmentGradebookPage = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('class');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/teacher/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <GraduationCap className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Assignment Gradebook</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {classId ? (
          <SimpleGradebook classId={classId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a class from your dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentGradebookPage;
