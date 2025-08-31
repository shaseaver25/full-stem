export interface PersonalizeRequest {
  base_assignment: string;
  student_profile: {
    student_id: string;
    interests: string[];
    home_language: string;
    reading_level: string;
  };
  constraints: {
    must_keep_keywords: string[];
    reading_level: string;
    language_pref: string;
    max_length_words: number;
    edit_permissions: {
      allow_numbers: boolean;
      allow_rubric_edits: boolean;
    };
  };
}

export interface PersonalizeResponse {
  personalized_text: string;
  rationale: string;
  kept_keywords: string[];
  changed_elements: ("context" | "examples" | "names" | "setting")[];
  reading_level_estimate: string;
}