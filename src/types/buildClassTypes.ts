
export interface Video {
  id: string;
  url: string;
  title: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  videos: Video[];
  materials: string[];
  instructions: string;
  duration: number;
  order: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  instructions: string;
  rubric: string;
  maxPoints: number;
}

export interface ClassroomActivity {
  id: string;
  title: string;
  description: string;
  duration: number;
  materials: string[];
  instructions: string;
}

export interface IndividualActivity {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  instructions: string;
  resources: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  description: string;
}

export interface ClassData {
  title: string;
  description: string;
  gradeLevel: string;
  subject: string;
  duration: string;
  instructor: string;
  schedule: string;
  learningObjectives: string;
  prerequisites: string;
  maxStudents: number;
}
