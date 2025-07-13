
import { useState } from 'react';
import { Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource, LessonComponent } from '@/types/buildClassTypes';

export const useBuildClassActions = (
  lessons: Lesson[],
  assignments: Assignment[],
  classroomActivities: ClassroomActivity[],
  individualActivities: IndividualActivity[],
  resources: Resource[],
  currentLesson: Partial<Lesson> & { components?: LessonComponent[] },
  currentAssignment: Partial<Assignment>,
  currentClassroomActivity: Partial<ClassroomActivity>,
  currentIndividualActivity: Partial<IndividualActivity>,
  currentResource: Partial<Resource>,
  setCurrentLesson: React.Dispatch<React.SetStateAction<Partial<Lesson> & { components?: LessonComponent[] }>>,
  setCurrentAssignment: React.Dispatch<React.SetStateAction<Partial<Assignment>>>,
  setCurrentClassroomActivity: React.Dispatch<React.SetStateAction<Partial<ClassroomActivity>>>,
  setCurrentIndividualActivity: React.Dispatch<React.SetStateAction<Partial<IndividualActivity>>>,
  setCurrentResource: React.Dispatch<React.SetStateAction<Partial<Resource>>>
) => {
  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        title: currentLesson.title!,
        description: currentLesson.description!,
        objectives: currentLesson.objectives || [''],
        videos: currentLesson.videos || [],
        materials: currentLesson.materials || [''],
        instructions: currentLesson.instructions || '',
        duration: currentLesson.duration || 60,
        order: currentLesson.order || lessons.length + 1,
        desmosEnabled: currentLesson.desmosEnabled,
        desmosType: currentLesson.desmosType,
        components: currentLesson.components || [],
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
        order: lessons.length + 2,
        components: [],
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
    const index = lessons.findIndex(lesson => lesson.id === id);
    if (index > -1) lessons.splice(index, 1);
  };

  const removeAssignment = (id: string) => {
    const index = assignments.findIndex(assignment => assignment.id === id);
    if (index > -1) assignments.splice(index, 1);
  };

  const removeClassroomActivity = (id: string) => {
    const index = classroomActivities.findIndex(activity => activity.id === id);
    if (index > -1) classroomActivities.splice(index, 1);
  };

  const removeIndividualActivity = (id: string) => {
    const index = individualActivities.findIndex(activity => activity.id === id);
    if (index > -1) individualActivities.splice(index, 1);
  };

  const removeResource = (id: string) => {
    const index = resources.findIndex(resource => resource.id === id);
    if (index > -1) resources.splice(index, 1);
  };

  return {
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
  };
};
