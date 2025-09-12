
// Lesson component types
export interface LessonComponent {
  id: string;
  type: 'activity' | 'resource' | 'quiz' | 'formative_check' | 'homework';
  title: string;
  description?: string;
  estimated_minutes?: number;
  requires_submission: boolean;
  is_required?: boolean;
  order_index: number;
}

// Lesson types (matching database structure)
export interface Lesson {
  "Lesson ID": number;
  "Title": string;
  "Description"?: string;
  "Track"?: string;
  slug?: string;
  // Mapped properties for easier access
  id: number;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  track?: string;
}

// Student and class enrollment types
export interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive';
  student: {
    id: string;
    user_id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    grade_level?: string;
    reading_level?: string;
    created_at: string;
    updated_at: string;
  };
}

// Assignment options and configuration
export interface AssignmentOptions {
  allow_resubmission?: boolean;
  grading_category?: string;
  points?: number;
  instructions?: string;
}

// Student-specific overrides for assignments
export interface StudentOverride {
  student_id: string;
  component_ids?: string[];
  reading_level?: string;
  language?: string;
  due_at_override?: string;
}

// Class assignments (new table structure)
export interface ClassAssignment {
  id: string;
  class_id: string;
  lesson_id: number;
  title: string;
  description?: string;
  selected_components: string[];
  options: AssignmentOptions;
  release_at?: string;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

// Assignment with submissions for display
export interface AssignmentWithSubmissions extends ClassAssignment {
  submissions?: AssignmentSubmission[];
  lesson?: Partial<Lesson>;
}

// Assignment wizard form data
export interface AssignmentWizardData {
  step: number;
  lessonId?: number;
  selectedComponents: string[];
  dueAt: string;
  releaseAt?: string;
  options: AssignmentOptions;
  studentOverrides: StudentOverride[];
}

// Assignment status types
export type AssignmentStatus = 'not_released' | 'open' | 'closed' | 'draft';

export interface AssignmentStatusInfo {
  status: AssignmentStatus;
  label: string;
  color: string;
}

// Legacy assignment types (for backward compatibility)
export interface Assignment {
  id: string;
  lesson_id: number;
  title: string;
  instructions: string;
  file_types_allowed: string[];
  max_files: number;
  allow_text_response: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  text_response?: string;
  file_urls?: string[] | null;
  file_names?: string[] | null;
  file_types?: string[] | null;
  submitted_at?: string;
  last_edited_at?: string;
  status: 'assigned' | 'draft' | 'submitted' | 'graded' | 'exempt';
  overrides?: Record<string, any> | null;
  files?: any[] | null;
  created_at: string;
  updated_at: string;
}
