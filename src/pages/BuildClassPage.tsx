
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { useClassCreation } from '@/hooks/useClassCreation';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { useClassApi } from '@/hooks/useClassApi';
import { toast } from '@/hooks/use-toast';

const BuildClassPage = () => {
  const { classId } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    classData,
    lessons,
    assignments,
    classroomActivities,
    individualActivities,
    resources,
    currentLesson,
    currentAssignment,
    currentClassroomActivity,
    currentIndividualActivity,
    currentResource,
    setCurrentLesson,
    setCurrentAssignment,
    setCurrentClassroomActivity,
    setCurrentIndividualActivity,
    setCurrentResource,
    handleClassDataChange,
    addVideoToLesson,
    removeVideoFromLesson,
    updateLessonVideo,
    getCompletionPercentage
  } = useClassCreation();

  const {
    addLesson,
    addAssignment,
    addClassroomActivity,
    addIndividualActivity,
    addResource,
    removeLesson,
    removeAssignment,
    removeClassroomActivity,
    removeIndividualActivity,
    removeResource
  } = useBuildClassActions(
    lessons,
    assignments,
    classroomActivities,
    individualActivities,
    resources,
    currentLesson,
    currentAssignment,
    currentClassroomActivity,
    currentIndividualActivity,
    currentResource,
    setCurrentLesson,
    setCurrentAssignment,
    setCurrentClassroomActivity,
    setCurrentIndividualActivity,
    setCurrentResource
  );

  const { createClass, updateClass, useClassWithContent } = useClassApi();

  // Load existing class data if editing
  const { data: existingClassData, isLoading } = useClassWithContent(classId || '');

  // Load existing class data into form when editing
  useEffect(() => {
    if (existingClassData && classId) {
      const { class: classInfo, lessons: existingLessons } = existingClassData;
      
      // Update class data
      handleClassDataChange('title', classInfo.title);
      handleClassDataChange('description', classInfo.description || '');
      handleClassDataChange('gradeLevel', classInfo.grade_level || '');
      handleClassDataChange('subject', classInfo.subject || '');
      handleClassDataChange('duration', classInfo.duration || '');
      handleClassDataChange('instructor', classInfo.instructor || '');
      handleClassDataChange('schedule', classInfo.schedule || '');
      handleClassDataChange('learningObjectives', classInfo.learning_objectives || '');
      handleClassDataChange('prerequisites', classInfo.prerequisites || '');
      handleClassDataChange('maxStudents', classInfo.max_students || 25);
      
      // TODO: Load lessons and activities data
      // This would require updating the useClassCreation hook to accept initial data
    }
  }, [existingClassData, classId]);

  const handleSaveClass = async () => {
    if (!classData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a class title before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const classDataToSave = {
        classData,
        lessons,
        assignments,
        classroomActivities,
        individualActivities,
        resources
      };

      if (classId) {
        // Update existing class
        await updateClass({
          id: classId,
          data: {
            title: classData.title,
            description: classData.description,
            grade_level: classData.gradeLevel,
            subject: classData.subject,
            duration: classData.duration,
            instructor: classData.instructor,
            schedule: classData.schedule,
            learning_objectives: classData.learningObjectives,
            prerequisites: classData.prerequisites,
            max_students: classData.maxStudents,
          }
        });
      } else {
        // Create new class
        const newClass = await new Promise<any>((resolve, reject) => {
          createClass(classDataToSave);
        });
        
        // Navigate to the edit page for the new class
        if (newClass && typeof newClass === 'object' && 'id' in newClass) {
          navigate(`/admin/build-class/${newClass.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "Error",
        description: "Failed to save class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && classId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading class data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BuildClassHeader
          completionPercentage={getCompletionPercentage()}
          onSave={handleSaveClass}
          isSaving={isSaving}
        />

        <BuildClassTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          classData={classData}
          handleClassDataChange={handleClassDataChange}
          lessons={lessons}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
          addLesson={addLesson}
          removeLesson={removeLesson}
          addVideoToLesson={addVideoToLesson}
          removeVideoFromLesson={removeVideoFromLesson}
          updateLessonVideo={updateLessonVideo}
          classroomActivities={classroomActivities}
          currentClassroomActivity={currentClassroomActivity}
          setCurrentClassroomActivity={setCurrentClassroomActivity}
          addClassroomActivity={addClassroomActivity}
          removeClassroomActivity={removeClassroomActivity}
          individualActivities={individualActivities}
          currentIndividualActivity={currentIndividualActivity}
          setCurrentIndividualActivity={setCurrentIndividualActivity}
          addIndividualActivity={addIndividualActivity}
          removeIndividualActivity={removeIndividualActivity}
          assignments={assignments}
          currentAssignment={currentAssignment}
          setCurrentAssignment={setCurrentAssignment}
          addAssignment={addAssignment}
          removeAssignment={removeAssignment}
          resources={resources}
          currentResource={currentResource}
          setCurrentResource={setCurrentResource}
          addResource={addResource}
          removeResource={removeResource}
          getCompletionPercentage={getCompletionPercentage}
        />
      </div>
    </div>
  );
};

export default BuildClassPage;
