
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ClassOverviewHeader } from '@/components/teacher/ClassOverviewHeader';
import { LessonSelectionPanel } from '@/components/teacher/LessonSelectionPanel';
import { ClassLessonsPanel } from '@/components/teacher/ClassLessonsPanel';
import { AssignmentSelectionPanel } from '@/components/teacher/AssignmentSelectionPanel';
import { StudentPreview } from '@/components/teacher/StudentPreview';
import { StudentRosterPanel } from '@/components/teacher/StudentRosterPanel';

const ClassManagementPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState('lessons');

  if (!classId) {
    return <div className="p-6">Class not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Ribbon */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/teacher/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 mr-4" />
              <h1 className="text-lg font-semibold text-gray-900">Class Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ClassOverviewHeader classId={classId} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lessons" className="mt-6">
            <ClassLessonsPanel classId={classId} />
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            <StudentRosterPanel classId={classId} />
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-6">
            <AssignmentSelectionPanel classId={classId} />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <StudentPreview classId={classId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassManagementPage;
