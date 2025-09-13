
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassDetailsForm from '@/components/build-class/ClassDetailsForm';
import LessonsForm from '@/components/build-class/LessonsForm';
import { ClassroomActivitiesForm, IndividualActivitiesForm } from '@/components/build-class/ActivitiesForm';
import AssignmentsForm from '@/components/build-class/AssignmentsForm';
import ResourcesForm from '@/components/build-class/ResourcesForm';
import ClassPreview from '@/components/build-class/ClassPreview';
import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource } from '@/types/buildClassTypes';

interface BuildClassTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  classData: ClassData;
  handleClassDataChange: (field: string, value: string | number) => void;
  lessons: Lesson[];
  currentLesson: Partial<Lesson>;
  setCurrentLesson: React.Dispatch<React.SetStateAction<Partial<Lesson>>>;
  addLesson: () => void;
  removeLesson: (id: string) => void;
  addVideoToLesson: () => void;
  removeVideoFromLesson: (videoId: string) => void;
  updateLessonVideo: (videoId: string, field: 'url' | 'title', value: string) => void;
  classroomActivities: ClassroomActivity[];
  currentClassroomActivity: Partial<ClassroomActivity>;
  setCurrentClassroomActivity: React.Dispatch<React.SetStateAction<Partial<ClassroomActivity>>>;
  addClassroomActivity: () => void;
  removeClassroomActivity: (id: string) => void;
  individualActivities: IndividualActivity[];
  currentIndividualActivity: Partial<IndividualActivity>;
  setCurrentIndividualActivity: React.Dispatch<React.SetStateAction<Partial<IndividualActivity>>>;
  addIndividualActivity: () => void;
  removeIndividualActivity: (id: string) => void;
  assignments: Assignment[];
  currentAssignment: Partial<Assignment>;
  setCurrentAssignment: React.Dispatch<React.SetStateAction<Partial<Assignment>>>;
  addAssignment: () => void;
  removeAssignment: (id: string) => void;
  resources: Resource[];
  currentResource: Partial<Resource>;
  setCurrentResource: React.Dispatch<React.SetStateAction<Partial<Resource>>>;
  addResource: () => void;
  removeResource: (id: string) => void;
  getCompletionPercentage: () => number;
}

const BuildClassTabs: React.FC<BuildClassTabsProps> = ({
  activeTab,
  setActiveTab,
  classData,
  handleClassDataChange,
  lessons,
  currentLesson,
  setCurrentLesson,
  addLesson,
  removeLesson,
  addVideoToLesson,
  removeVideoFromLesson,
  updateLessonVideo,
  classroomActivities,
  currentClassroomActivity,
  setCurrentClassroomActivity,
  addClassroomActivity,
  removeClassroomActivity,
  individualActivities,
  currentIndividualActivity,
  setCurrentIndividualActivity,
  addIndividualActivity,
  removeIndividualActivity,
  assignments,
  currentAssignment,
  setCurrentAssignment,
  addAssignment,
  removeAssignment,
  resources,
  currentResource,
  setCurrentResource,
  addResource,
  removeResource,
  getCompletionPercentage
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="lessons">Lessons</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <ClassDetailsForm 
          classData={classData}
          onClassDataChange={handleClassDataChange}
        />
      </TabsContent>

      <TabsContent value="lessons" className="space-y-6">
        <LessonsForm
          lessons={lessons}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
          addLesson={addLesson}
          removeLesson={removeLesson}
          addVideoToLesson={addVideoToLesson}
          removeVideoFromLesson={removeVideoFromLesson}
          updateLessonVideo={updateLessonVideo}
        />
      </TabsContent>

      <TabsContent value="activities" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Classroom Activities</h3>
            <ClassroomActivitiesForm
              activities={classroomActivities}
              currentActivity={currentClassroomActivity}
              setCurrentActivity={setCurrentClassroomActivity}
              addActivity={addClassroomActivity}
              removeActivity={removeClassroomActivity}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Individual Activities</h3>
            <IndividualActivitiesForm
              activities={individualActivities}
              currentActivity={currentIndividualActivity}
              setCurrentActivity={setCurrentIndividualActivity}
              addActivity={addIndividualActivity}
              removeActivity={removeIndividualActivity}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="assignments" className="space-y-6">
        <AssignmentsForm
          assignments={assignments}
          currentAssignment={currentAssignment}
          setCurrentAssignment={setCurrentAssignment}
          addAssignment={addAssignment}
          removeAssignment={removeAssignment}
        />
      </TabsContent>

      <TabsContent value="resources" className="space-y-6">
        <ResourcesForm
          resources={resources}
          currentResource={currentResource}
          setCurrentResource={setCurrentResource}
          addResource={addResource}
          removeResource={removeResource}
        />
      </TabsContent>

      <TabsContent value="preview" className="space-y-6">
        <ClassPreview
          classData={classData}
          lessons={lessons}
          assignments={assignments}
          classroomActivities={classroomActivities}
          individualActivities={individualActivities}
          resources={resources}
          getCompletionPercentage={getCompletionPercentage}
        />
      </TabsContent>
    </Tabs>
  );
};

export default BuildClassTabs;
