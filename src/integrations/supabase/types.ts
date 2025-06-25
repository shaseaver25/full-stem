export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          file_names: string[] | null
          file_types: string[] | null
          file_urls: string[] | null
          id: string
          last_edited_at: string | null
          status: string | null
          submitted_at: string | null
          text_response: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          file_names?: string[] | null
          file_types?: string[] | null
          file_urls?: string[] | null
          id?: string
          last_edited_at?: string | null
          status?: string | null
          submitted_at?: string | null
          text_response?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          file_names?: string[] | null
          file_types?: string[] | null
          file_urls?: string[] | null
          id?: string
          last_edited_at?: string | null
          status?: string | null
          submitted_at?: string | null
          text_response?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_text_response: boolean | null
          created_at: string
          file_types_allowed: string[] | null
          id: string
          instructions: string
          lesson_id: number
          max_files: number | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_text_response?: boolean | null
          created_at?: string
          file_types_allowed?: string[] | null
          id?: string
          instructions: string
          lesson_id: number
          max_files?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_text_response?: boolean | null
          created_at?: string
          file_types_allowed?: string[] | null
          id?: string
          instructions?: string
          lesson_id?: number
          max_files?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
        ]
      }
      class_assignments: {
        Row: {
          assigned_date: string | null
          class_id: string
          created_at: string | null
          due_date: string | null
          id: string
          lesson_id: number
        }
        Insert: {
          assigned_date?: string | null
          class_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          lesson_id: number
        }
        Update: {
          assigned_date?: string | null
          class_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          grade_level: string | null
          id: string
          name: string
          school_year: string | null
          subject: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grade_level?: string | null
          id?: string
          name: string
          school_year?: string | null
          subject?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grade_level?: string | null
          id?: string
          name?: string
          school_year?: string | null
          subject?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          weight: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          weight?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      gradebook_summary: {
        Row: {
          category_grades: Json | null
          course_track: string
          created_at: string
          id: string
          last_calculated: string
          overall_letter_grade: string | null
          overall_percentage: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          category_grades?: Json | null
          course_track?: string
          created_at?: string
          id?: string
          last_calculated?: string
          overall_letter_grade?: string | null
          overall_percentage?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          category_grades?: Json | null
          course_track?: string
          created_at?: string
          id?: string
          last_calculated?: string
          overall_letter_grade?: string | null
          overall_percentage?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          assignment_id: string | null
          category_id: string
          comments: string | null
          created_at: string
          graded_at: string
          graded_by: string
          id: string
          lesson_id: number | null
          letter_grade: string | null
          percentage: number | null
          points_earned: number | null
          points_possible: number
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          category_id: string
          comments?: string | null
          created_at?: string
          graded_at?: string
          graded_by: string
          id?: string
          lesson_id?: number | null
          letter_grade?: string | null
          percentage?: number | null
          points_earned?: number | null
          points_possible: number
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          category_id?: string
          comments?: string | null
          created_at?: string
          graded_at?: string
          graded_by?: string
          id?: string
          lesson_id?: number | null
          letter_grade?: string | null
          percentage?: number | null
          points_earned?: number | null
          points_possible?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "grade_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
        ]
      }
      lesson_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          id: string
          lesson_id: number
          rating: number | null
          suggested_improvements: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          lesson_id: number
          rating?: number | null
          suggested_improvements?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          lesson_id?: number
          rating?: number | null
          suggested_improvements?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_feedback_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
          {
            foreignKeyName: "lesson_feedback_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Lessons: {
        Row: {
          Description: string | null
          "Lesson ID": number
          Order: number | null
          slug: string | null
          "Source Doc URL": string | null
          text: string | null
          "Text (Grade 3)": string | null
          "Text (Grade 5)": string | null
          "Text (Grade 8)": string | null
          texta: string | null
          Title: string | null
          Track: string | null
          "Translated Content": Json | null
        }
        Insert: {
          Description?: string | null
          "Lesson ID": number
          Order?: number | null
          slug?: string | null
          "Source Doc URL"?: string | null
          text?: string | null
          "Text (Grade 3)"?: string | null
          "Text (Grade 5)"?: string | null
          "Text (Grade 8)"?: string | null
          texta?: string | null
          Title?: string | null
          Track?: string | null
          "Translated Content"?: Json | null
        }
        Update: {
          Description?: string | null
          "Lesson ID"?: number
          Order?: number | null
          slug?: string | null
          "Source Doc URL"?: string | null
          text?: string | null
          "Text (Grade 3)"?: string | null
          "Text (Grade 5)"?: string | null
          "Text (Grade 8)"?: string | null
          texta?: string | null
          Title?: string | null
          Track?: string | null
          "Translated Content"?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: number
          needs_attention: boolean | null
          progress_percentage: number | null
          started_at: string | null
          status: string | null
          student_id: string
          time_spent: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: number
          needs_attention?: boolean | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          student_id: string
          time_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: number
          needs_attention?: boolean | null
          progress_percentage?: number | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          time_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string
          created_at: string | null
          first_name: string
          grade_level: string | null
          id: string
          iep_accommodations: string[] | null
          interests: string[] | null
          language_preference: string | null
          last_name: string
          learning_style: string | null
          reading_level: string | null
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          first_name: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name: string
          learning_style?: string | null
          reading_level?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          first_name?: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name?: string
          learning_style?: string | null
          reading_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          scheduled_at: string | null
          session_type: string
          status: string | null
          teacher_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          session_type: string
          status?: string | null
          teacher_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          session_type?: string
          status?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          certification_status: string | null
          created_at: string | null
          grade_levels: string[] | null
          id: string
          onboarding_completed: boolean | null
          pd_hours: number | null
          school_name: string | null
          subjects: string[] | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          certification_status?: string | null
          created_at?: string | null
          grade_levels?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          pd_hours?: number | null
          school_name?: string | null
          subjects?: string[] | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          certification_status?: string | null
          created_at?: string | null
          grade_levels?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          pd_hours?: number | null
          school_name?: string | null
          subjects?: string[] | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      "User Preferences": {
        Row: {
          "Enable Read-Aloud": boolean | null
          "Enable Translation View": boolean | null
          "Preferred Language": string | null
          "Reading Level": string | null
          "Text Speed": string | null
          "User Email": string
        }
        Insert: {
          "Enable Read-Aloud"?: boolean | null
          "Enable Translation View"?: boolean | null
          "Preferred Language"?: string | null
          "Reading Level"?: string | null
          "Text Speed"?: string | null
          "User Email": string
        }
        Update: {
          "Enable Read-Aloud"?: boolean | null
          "Enable Translation View"?: boolean | null
          "Preferred Language"?: string | null
          "Reading Level"?: string | null
          "Text Speed"?: string | null
          "User Email"?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_completed: string | null
          id: string
          lesson_id: number
          progress_percentage: number | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_completed?: string | null
          id?: string
          lesson_id: number
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_completed?: string | null
          id?: string
          lesson_id?: number
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_letter_grade: {
        Args: { percentage: number }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
