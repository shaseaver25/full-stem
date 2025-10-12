import React from 'react';
import Header from '@/components/Header';
import { HelpHint } from '@/components/common/HelpHint';
import CourseEditor from '@/components/admin/CourseEditor';

const CourseEditorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Course Editor</h1>
          <HelpHint
            text="Manually create and edit course content, lessons, and activities. Perfect for customizing existing courses or building from scratch."
            learnMoreUrl="https://docs.lovable.dev/features/course-editor"
          />
        </div>
        <CourseEditor />
      </div>
    </div>
  );
};

export default CourseEditorPage;