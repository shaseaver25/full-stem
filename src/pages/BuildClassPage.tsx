
import React, { useState } from 'react';
import Header from '@/components/Header';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { useClassCreation } from '@/hooks/useClassCreation';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { saveClass } from '@/services/classService';
import { useToast } from '@/hooks/use-toast';

const BuildClassPage = () => {
  const { toast } = useToast();
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

  const handleSaveClass = async () => {
    setIsSaving(true);
    
    const classDataToSave = {
      classData,
      lessons,
      assignments,
      classroomActivities,
      individualActivities,
      resources
    };

    const result = await saveClass(classDataToSave);
    
    if (result.success) {
      toast({
        title: "Success!",
        description: "Class saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save class. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

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
