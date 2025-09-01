import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource, LessonComponent } from '@/types/buildClassTypes';

export interface CourseJSON {
  class_details: {
    title: string;
    grade_level: string;
    duration: string;
    subject: string;
    description: string;
  };
  lessons: Array<{
    title: string;
    components: Array<{
      type: string;
      description: string;
    }>;
  }>;
  assignments: Array<{
    title: string;
    instructions: string;
    rubric: Record<string, string>;
  }>;
  classroom_activities: Array<{
    title: string;
    steps: string[];
    materials: string[];
  }>;
  individual_activities: Array<{
    title: string;
    steps: string[];
    materials: string[];
  }>;
  resources: Array<{
    type: string;
    title: string;
    link: string;
  }>;
}

export const transformCourseData = (courseJSON: CourseJSON) => {
  // Transform class details
  const classData: ClassData = {
    title: courseJSON.class_details.title,
    description: courseJSON.class_details.description,
    gradeLevel: courseJSON.class_details.grade_level,
    subject: courseJSON.class_details.subject,
    duration: courseJSON.class_details.duration,
    instructor: '',
    schedule: '',
    learningObjectives: '',
    prerequisites: '',
    maxStudents: 25
  };

  // Transform lessons with components
  const lessons: Lesson[] = courseJSON.lessons.map((lesson, index) => {
    const components: LessonComponent[] = lesson.components.map((comp, compIndex) => ({
      id: `comp-${index}-${compIndex}`,
      type: comp.type,
      content: { description: comp.description },
      order: compIndex + 1
    }));

    return {
      id: `lesson-${index + 1}`,
      title: lesson.title,
      description: lesson.components.map(c => c.description).join(' '),
      objectives: [''],
      videos: [],
      materials: [''],
      instructions: lesson.components.find(c => c.type === 'instructions')?.description || '',
      duration: 60,
      order: index + 1,
      components
    };
  });

  // Transform assignments
  const assignments: Assignment[] = courseJSON.assignments.map((assignment, index) => ({
    id: `assignment-${index + 1}`,
    title: assignment.title,
    description: assignment.instructions.substring(0, 100) + '...',
    dueDate: '',
    instructions: assignment.instructions,
    rubric: typeof assignment.rubric === 'object' ? 
      Object.entries(assignment.rubric).map(([key, value]) => `${key}: ${value}`).join('\n') : 
      assignment.rubric,
    maxPoints: 100
  }));

  // Transform classroom activities
  const classroomActivities: ClassroomActivity[] = courseJSON.classroom_activities.map((activity, index) => ({
    id: `classroom-${index + 1}`,
    title: activity.title,
    description: activity.steps.join(' '),
    duration: 30,
    materials: activity.materials,
    instructions: activity.steps.join('\n')
  }));

  // Transform individual activities
  const individualActivities: IndividualActivity[] = courseJSON.individual_activities.map((activity, index) => ({
    id: `individual-${index + 1}`,
    title: activity.title,
    description: activity.steps.join(' '),
    estimatedTime: 20,
    instructions: activity.steps.join('\n'),
    resources: activity.materials
  }));

  // Transform resources
  const resources: Resource[] = courseJSON.resources.map((resource, index) => ({
    id: `resource-${index + 1}`,
    title: resource.title,
    type: resource.type as 'pdf' | 'link' | 'video' | 'document',
    url: resource.link,
    description: ''
  }));

  return {
    classData,
    lessons,
    assignments,
    classroomActivities,
    individualActivities,
    resources
  };
};