
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
  file_urls?: string[];
  file_names?: string[];
  file_types?: string[];
  submitted_at?: string;
  last_edited_at: string;
  status: 'draft' | 'submitted';
  created_at: string;
  updated_at: string;
}
