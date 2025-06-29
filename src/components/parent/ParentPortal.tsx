
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import StudentSelector from './StudentSelector';
import StudentProgress from './StudentProgress';
import MessagesList from './MessagesList';
import StudentProfile from './StudentProfile';
import MessageComposer from './MessageComposer';
import EmptyStudentsState from './EmptyStudentsState';

const ParentPortal = () => {
  const {
    students,
    selectedStudent,
    setSelectedStudent,
    progress,
    messages,
    loading,
    fetchStudentProgress,
    sendMessage
  } = useParentDashboard();

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    fetchStudentProgress(student.id);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading parent portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parent Portal</h1>
        {selectedStudent && (
          <MessageComposer 
            selectedStudent={selectedStudent} 
            onSendMessage={sendMessage}
          />
        )}
      </div>

      {students.length === 0 ? (
        <EmptyStudentsState />
      ) : (
        <>
          <StudentSelector 
            students={students}
            selectedStudent={selectedStudent}
            onStudentSelect={handleStudentSelect}
          />

          {selectedStudent && (
            <Tabs defaultValue="progress" className="space-y-4">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="profile">Student Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                <StudentProgress 
                  progress={progress}
                  studentName={selectedStudent.first_name}
                />
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <MessagesList messages={messages} />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <StudentProfile student={selectedStudent} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

export default ParentPortal;
