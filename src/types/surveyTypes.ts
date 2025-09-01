export interface SurveyOption {
  label: string;
  tags: string[];
}

export interface SurveyQuestion {
  id: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'short_text' | 'long_text';
  prompt: string;
  options?: SurveyOption[];
  max_select?: number;
  true_tags?: string[];
  false_tags?: string[];
  tags_on_answer?: string[];
}

export interface Survey {
  survey_id: string;
  title: string;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  id?: string;
  student_id: string;
  question_id: string;
  answer_value: any;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface StudentProfile {
  id?: string;
  student_id: string;
  profile_json: ProfileData;
  survey_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileData {
  learning_styles: string[];
  top_interests: string[];
  motivation_triggers: string[];
  support_needs: string[];
  ai_recommendations: {
    project_templates: string[];
    assignment_preferences: {
      presentation_modes: string[];
      scaffolds: string[];
    };
  };
  preferred_name?: string;
  notes?: string;
}

// Learning styles enum
export const LEARNING_STYLES = {
  visual: 'Visual',
  auditory: 'Auditory', 
  read_write: 'Read/Write',
  kinesthetic: 'Kinesthetic'
} as const;

// Interests enum
export const INTERESTS = {
  art_music: 'Art & Music',
  gaming_coding: 'Gaming & Coding',
  community_help: 'Community Help',
  building_tinkering: 'Building & Tinkering',
  reading_writing: 'Reading & Writing',
  sports_movement: 'Sports & Movement',
  robotics: 'Robotics',
  ai_creation: 'AI Creation'
} as const;

// Motivation triggers enum
export const MOTIVATION_TRIGGERS = {
  creativity: 'Creativity',
  logic: 'Logic',
  collaboration: 'Collaboration',
  hands_on_challenge: 'Hands-on Challenge'
} as const;

// Support needs enum
export const SUPPORT_NEEDS = {
  needs_tts: 'Text-to-Speech',
  needs_translation: 'Translation',
  step_by_step: 'Step-by-step Instructions',
  frequent_breaks: 'Frequent Breaks',
  partner_work: 'Partner Work',
  quiet_time: 'Quiet Time',
  visual_examples: 'Visual Examples',
  extra_practice: 'Extra Practice',
  hands_on_retry: 'Hands-on Retry'
} as const;