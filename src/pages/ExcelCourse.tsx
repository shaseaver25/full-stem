
import React from 'react';
import CourseOverview from '@/components/CourseOverview';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ExcelCourse = () => {
  return (
    <div>
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <CourseOverview 
        courseName="Excel for Interns" 
        trackFilter="Excel" 
      />
    </div>
  );
};

export default ExcelCourse;
