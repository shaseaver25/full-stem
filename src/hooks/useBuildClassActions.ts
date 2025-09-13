
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
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>,
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>,
  setClassroomActivities: React.Dispatch<React.SetStateAction<ClassroomActivity[]>>,
  setIndividualActivities: React.Dispatch<React.SetStateAction<IndividualActivity[]>>,
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  setCurrentLesson: React.Dispatch<React.SetStateAction<Partial<Lesson> & { components?: LessonComponent[] }>>,
  setCurrentAssignment: React.Dispatch<React.SetStateAction<Partial<Assignment>>>,
  setCurrentClassroomActivity: React.Dispatch<React.SetStateAction<Partial<ClassroomActivity>>>,
  setCurrentIndividualActivity: React.Dispatch<React.SetStateAction<Partial<IndividualActivity>>>,
  setCurrentResource: React.Dispatch<React.SetStateAction<Partial<Resource>>>
) => {
  const addLesson = () => {
    if (currentLesson.title?.trim()) {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        title: currentLesson.title!,
        description: currentLesson.description || '',
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
      setLessons([...lessons, newLesson]);
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
      setAssignments([...assignments, newAssignment]);
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
      setClassroomActivities([...classroomActivities, newActivity]);
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
      setIndividualActivities([...individualActivities, newActivity]);
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
      setResources([...resources, newResource]);
      setCurrentResource({
        title: '',
        type: 'pdf',
        url: '',
        description: ''
      });
    }
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const removeClassroomActivity = (id: string) => {
    setClassroomActivities(classroomActivities.filter(activity => activity.id !== id));
  };

  const removeIndividualActivity = (id: string) => {
    setIndividualActivities(individualActivities.filter(activity => activity.id !== id));
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
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
