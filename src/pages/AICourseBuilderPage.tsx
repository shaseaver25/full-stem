import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { useClassCreationWithInitialData } from '@/hooks/useClassCreationWithInitialData';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { useClassApi } from '@/hooks/useClassApi';
import { transformCourseData } from '@/utils/courseDataTransformer';
import { aiCourseJSON } from '@/data/aiCourseData';
import { toast } from '@/hooks/use-toast';

const AICourseBuilderPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  
  // Transform the AI course data
  const transformedData = transformCourseData(aiCourseJSON);
  
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
  } = useClassCreationWithInitialData(transformedData);

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

  const { createClass, isCreating } = useClassApi();

  const handleSaveClass = () => {
    if (!classData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a class title before saving.",
        variant: "destructive",
      });
      return;
    }

    const classDataToSave = {
      classData,
      lessons,
      assignments,
      classroomActivities,
      individualActivities,
      resources
    };

    // Create new class using mutation
    createClass(classDataToSave);
    
    // Navigate to teacher dashboard to see the created course
    setTimeout(() => {
      navigate('/teacher/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI Course Builder - Pre-loaded Course
          </h1>
          <p className="text-gray-600">
            Review and customize this pre-built AI course before saving.
          </p>
        </div>

        <BuildClassHeader
          completionPercentage={getCompletionPercentage()}
          onSave={handleSaveClass}
          isSaving={isCreating}
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

export default AICourseBuilderPage;