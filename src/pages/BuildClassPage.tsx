import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import Header from '@/components/Header';
import ClassDetailsForm from '@/components/build-class/ClassDetailsForm';
import LessonsForm from '@/components/build-class/LessonsForm';
import { ClassroomActivitiesForm, IndividualActivitiesForm } from '@/components/build-class/ActivitiesForm';
import AssignmentsForm from '@/components/build-class/AssignmentsForm';
import ResourcesForm from '@/components/build-class/ResourcesForm';
import ClassPreview from '@/components/build-class/ClassPreview';
import { useClassCreation } from '@/hooks/useClassCreation';
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

  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      const newLesson = {
        id: Date.now().toString(),
        title: currentLesson.title!,
        description: currentLesson.description!,
        objectives: currentLesson.objectives || [''],
        videos: currentLesson.videos || [],
        materials: currentLesson.materials || [''],
        instructions: currentLesson.instructions || '',
        duration: currentLesson.duration || 60,
        order: currentLesson.order || lessons.length + 1
      };
      lessons.push(newLesson);
      setCurrentLesson({
        title: '',
        description: '',
        objectives: [''],
        videos: [{ id: Date.now().toString(), url: '', title: '' }],
        materials: [''],
        instructions: '',
        duration: 60,
        order: lessons.length + 2
      });
    }
  };

  const addAssignment = () => {
    if (currentAssignment.title && currentAssignment.description) {
      const newAssignment = {
        id: Date.now().toString(),
        title: currentAssignment.title!,
        description: currentAssignment.description!,
        dueDate: currentAssignment.dueDate || '',
        instructions: currentAssignment.instructions || '',
        rubric: currentAssignment.rubric || '',
        maxPoints: currentAssignment.maxPoints || 100
      };
      assignments.push(newAssignment);
      setCurrentAssignment({
        title: '',
        description: '',
        dueDate: '',
        instructions: '',
        rubric: '',
        maxPoints: 100
      });
    }
  };

  const addClassroomActivity = () => {
    if (currentClassroomActivity.title && currentClassroomActivity.description) {
      const newActivity = {
        id: Date.now().toString(),
        title: currentClassroomActivity.title!,
        description: currentClassroomActivity.description!,
        duration: currentClassroomActivity.duration || 30,
        materials: currentClassroomActivity.materials || [''],
        instructions: currentClassroomActivity.instructions || ''
      };
      classroomActivities.push(newActivity);
      setCurrentClassroomActivity({
        title: '',
        description: '',
        duration: 30,
        materials: [''],
        instructions: ''
      });
    }
  };

  const addIndividualActivity = () => {
    if (currentIndividualActivity.title && currentIndividualActivity.description) {
      const newActivity = {
        id: Date.now().toString(),
        title: currentIndividualActivity.title!,
        description: currentIndividualActivity.description!,
        estimatedTime: currentIndividualActivity.estimatedTime || 20,
        instructions: currentIndividualActivity.instructions || '',
        resources: currentIndividualActivity.resources || ['']
      };
      individualActivities.push(newActivity);
      setCurrentIndividualActivity({
        title: '',
        description: '',
        estimatedTime: 20,
        instructions: '',
        resources: ['']
      });
    }
  };

  const addResource = () => {
    if (currentResource.title && currentResource.url) {
      const newResource = {
        id: Date.now().toString(),
        title: currentResource.title!,
        type: currentResource.type as 'pdf' | 'link' | 'video' | 'document',
        url: currentResource.url!,
        description: currentResource.description || ''
      };
      resources.push(newResource);
      setCurrentResource({
        title: '',
        type: 'pdf',
        url: '',
        description: ''
      });
    }
  };

  const removeLesson = (id: string) => {
    lessons.filter(lesson => lesson.id !== id)
  };

  const removeAssignment = (id: string) => {
    assignments.filter(assignment => assignment.id !== id)
  };

  const removeClassroomActivity = (id: string) => {
    classroomActivities.filter(activity => activity.id !== id)
  };

  const removeIndividualActivity = (id: string) => {
    individualActivities.filter(activity => activity.id !== id)
  };

  const removeResource = (id: string) => {
    resources.filter(resource => resource.id !== id)
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <RouterLink to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </RouterLink>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Build New Class</h1>
              <p className="text-gray-600">Create a comprehensive learning experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <Progress value={getCompletionPercentage()} className="w-32" />
            </div>
            <Button 
              onClick={handleSaveClass} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Class'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="details">Class Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="classroom-activities">Classroom Activities</TabsTrigger>
            <TabsTrigger value="individual-activities">Individual Activities</TabsTrigger>
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

          <TabsContent value="classroom-activities" className="space-y-6">
            <ClassroomActivitiesForm
              activities={classroomActivities}
              currentActivity={currentClassroomActivity}
              setCurrentActivity={setCurrentClassroomActivity}
              addActivity={addClassroomActivity}
              removeActivity={removeClassroomActivity}
            />
          </TabsContent>

          <TabsContent value="individual-activities" className="space-y-6">
            <IndividualActivitiesForm
              activities={individualActivities}
              currentActivity={currentIndividualActivity}
              setCurrentActivity={setCurrentIndividualActivity}
              addActivity={addIndividualActivity}
              removeActivity={removeIndividualActivity}
            />
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
      </div>
    </div>
  );
};

export default BuildClassPage;
