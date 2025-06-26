
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassOverviewHeader } from '@/components/teacher/ClassOverviewHeader';
import { LessonSelectionPanel } from '@/components/teacher/LessonSelectionPanel';
import { AssignmentSelectionPanel } from '@/components/teacher/AssignmentSelectionPanel';
import { StudentPreview } from '@/components/teacher/StudentPreview';

const ClassManagementPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState('lessons');

  if (!classId) {
    return <div className="p-6">Class not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ClassOverviewHeader classId={classId} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">Lesson Management</TabsTrigger>
            <TabsTrigger value="assignments">Assignment Settings</TabsTrigger>
            <TabsTrigger value="preview">Student Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lessons" className="mt-6">
            <LessonSelectionPanel classId={classId} />
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
