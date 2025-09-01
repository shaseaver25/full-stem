import { useState, useEffect } from 'react';
import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource, Video, LessonComponent } from '@/types/buildClassTypes';

interface InitialClassData {
  classData: ClassData;
  lessons: Lesson[];
  assignments: Assignment[];
  classroomActivities: ClassroomActivity[];
  individualActivities: IndividualActivity[];
  resources: Resource[];
}

export const useClassCreationWithInitialData = (initialData?: InitialClassData) => {
  const [classData, setClassData] = useState<ClassData>({
    title: '',
    description: '',
    gradeLevel: '',
    subject: '',
    duration: '',
    instructor: '',
    schedule: '',
    learningObjectives: '',
    prerequisites: '',
    maxStudents: 25
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classroomActivities, setClassroomActivities] = useState<ClassroomActivity[]>([]);
  const [individualActivities, setIndividualActivities] = useState<IndividualActivity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  // Initialize with provided data
  useEffect(() => {
    if (initialData) {
      setClassData(initialData.classData);
      setLessons(initialData.lessons);
      setAssignments(initialData.assignments);
      setClassroomActivities(initialData.classroomActivities);
      setIndividualActivities(initialData.individualActivities);
      setResources(initialData.resources);
    }
  }, [initialData]);

  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson> & { components?: LessonComponent[] }>({
    title: '',
    description: '',
    objectives: [''],
    videos: [{ id: Date.now().toString(), url: '', title: '' }],
    materials: [''],
    instructions: '',
    duration: 60,
    order: lessons.length + 1,
    components: [],
  });

  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    dueDate: '',
    instructions: '',
    rubric: '',
    maxPoints: 100
  });

  const [currentClassroomActivity, setCurrentClassroomActivity] = useState<Partial<ClassroomActivity>>({
    title: '',
    description: '',
    duration: 30,
    materials: [''],
    instructions: ''
  });

  const [currentIndividualActivity, setCurrentIndividualActivity] = useState<Partial<IndividualActivity>>({
    title: '',
    description: '',
    estimatedTime: 20,
    instructions: '',
    resources: ['']
  });

  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({
    title: '',
    type: 'pdf',
    url: '',
    description: ''
  });

  const handleClassDataChange = (field: string, value: string | number) => {
    setClassData(prev => ({ ...prev, [field]: value }));
  };

  const addVideoToLesson = () => {
    const newVideo: Video = {
      id: Date.now().toString(),
      url: '',
      title: ''
    };
    setCurrentLesson(prev => ({
      ...prev,
      videos: [...(prev.videos || []), newVideo]
    }));
  };

  const removeVideoFromLesson = (videoId: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      videos: prev.videos?.filter(video => video.id !== videoId) || []
    }));
  };

  const updateLessonVideo = (videoId: string, field: 'url' | 'title', value: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      videos: prev.videos?.map(video => 
        video.id === videoId ? { ...video, [field]: value } : video
      ) || []
    }));
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 8;
    
    if (classData.title) completed++;
    if (classData.description) completed++;
    if (classData.gradeLevel) completed++;
    if (classData.subject) completed++;
    if (lessons.length > 0) completed++;
    if (assignments.length > 0) completed++;
    if (classroomActivities.length > 0) completed++;
    if (individualActivities.length > 0) completed++;
    
    return (completed / total) * 100;
  };

  return {
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
  };
};