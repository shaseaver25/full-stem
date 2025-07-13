import React from 'react';
import Header from '@/components/Header';
import CourseEditor from '@/components/admin/CourseEditor';

const CourseEditorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CourseEditor />
      </div>
    </div>
  );
};

export default CourseEditorPage;