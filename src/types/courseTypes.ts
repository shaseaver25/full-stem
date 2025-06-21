
export interface Lesson {
  'Lesson ID': number;
  Title: string;
  Description: string;
  Order: number;
  Track: string;
}

export interface UserProgress {
  lesson_id: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress_percentage: number;
}

export interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}
