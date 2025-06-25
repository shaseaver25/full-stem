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
      [_ in never]: never
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
