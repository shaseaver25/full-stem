
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { HelpHint } from '@/components/common/HelpHint';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { useClassCreation } from '@/hooks/useClassCreation';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { useClassApi } from '@/hooks/useClassApi';
import { useClassCourses } from '@/hooks/useClassCourses';
import { toast } from '@/hooks/use-toast';

const BuildLessonPage = () => {
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
    setLessons,
    setAssignments,
    setClassroomActivities,
    setIndividualActivities,
    setResources,
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
    setLessons,
    setAssignments,
    setClassroomActivities,
    setIndividualActivities,
    setResources,
    setCurrentLesson,
    setCurrentAssignment,
    setCurrentClassroomActivity,
    setCurrentIndividualActivity,
    setCurrentResource
  );

  const { createClass, updateClass, useClassWithContent } = useClassApi();
  const { classCourses } = useClassCourses(classId);

  // Load existing class data if editing
  const { data: existingClassData, isLoading } = useClassWithContent(classId || '');

  // Load existing class data into form when editing
  useEffect(() => {
    if (existingClassData && classId) {
      const classInfo = existingClassData.class;
      
      if (classInfo) {
        handleClassDataChange('title', classInfo.title || '');
        handleClassDataChange('description', classInfo.description || '');
        handleClassDataChange('gradeLevel', classInfo.grade_level || '');
        handleClassDataChange('subject', classInfo.subject || '');
        handleClassDataChange('duration', classInfo.duration || '');
        handleClassDataChange('instructor', classInfo.instructor || '');
        handleClassDataChange('schedule', classInfo.schedule || '');
        handleClassDataChange('learningObjectives', classInfo.learning_objectives || '');
        handleClassDataChange('prerequisites', classInfo.prerequisites || '');
        handleClassDataChange('maxStudents', classInfo.max_students || 25);
      }
    }
  }, [existingClassData, classId, handleClassDataChange]);

  const handleSaveClass = async () => {
    if (!classData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a lesson title before saving.",
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
        updateClass({
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
        
        toast({
          title: "Success!",
          description: "Lesson updated successfully.",
        });
      } else {
        createClass(classDataToSave);
        
        toast({
          title: "Success!",
          description: "Lesson created successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson. Please try again.",
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
            <div className="text-lg">Loading lesson data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold">Build Lesson</h1>
          <HelpHint
            text="Create a new lesson with components, assignments, and activities. Upload a syllabus to auto-populate the lesson information."
            learnMoreUrl="https://docs.lovable.dev/features/build-lesson"
          />
        </div>
        <BuildClassHeader
          completionPercentage={getCompletionPercentage()}
          onSave={handleSaveClass}
          isSaving={isSaving}
        />

        {classCourses.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Courses</h3>
            <div className="flex flex-wrap gap-2">
              {classCourses.map((classCourse) => (
                <span key={classCourse.id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {classCourse.track}
                </span>
              ))}
            </div>
          </div>
        )}

        <BuildClassTabs
          classData={classData}
          handleClassDataChange={handleClassDataChange}
        />
      </div>
    </div>
  );
};

export default BuildLessonPage;
