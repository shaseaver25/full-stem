export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      accessibility_settings: {
        Row: {
          created_at: string | null
          dark_mode: boolean | null
          dyslexia_font: boolean | null
          high_contrast: boolean | null
          preferred_language: string | null
          translation_enabled: boolean | null
          tts_enabled: boolean | null
          updated_at: string | null
          user_id: string
          voice_style: string | null
        }
        Insert: {
          created_at?: string | null
          dark_mode?: boolean | null
          dyslexia_font?: boolean | null
          high_contrast?: boolean | null
          preferred_language?: string | null
          translation_enabled?: boolean | null
          tts_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          voice_style?: string | null
        }
        Update: {
          created_at?: string | null
          dark_mode?: boolean | null
          dyslexia_font?: boolean | null
          high_contrast?: boolean | null
          preferred_language?: string | null
          translation_enabled?: boolean | null
          tts_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          voice_style?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          estimated_time: number | null
          id: string
          instructions: string | null
          lesson_id: string
          order_index: number
          resources: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          instructions?: string | null
          lesson_id: string
          order_index?: number
          resources?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          instructions?: string | null
          lesson_id?: string
          order_index?: number
          resources?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          admin_type: string | null
          created_at: string | null
          details: Json | null
          id: string
          impersonated_role: string | null
          impersonated_user_id: string | null
          is_impersonation: boolean | null
          organization_name: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          is_impersonation?: boolean | null
          organization_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          is_impersonation?: boolean | null
          organization_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_type: string | null
          created_at: string | null
          details: Json | null
          id: string
          organization_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          admin_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          admin_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          organization_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          admin_type: Database["public"]["Enums"]["admin_type"]
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          organization_name: string | null
          organization_size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_type?: Database["public"]["Enums"]["admin_type"]
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          organization_name?: string | null
          organization_size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_type?: Database["public"]["Enums"]["admin_type"]
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          organization_name?: string | null
          organization_size?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_feedback_history: {
        Row: {
          created_at: string | null
          feedback_text: string
          feedback_type: string
          goal_id: string | null
          id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_text: string
          feedback_type: string
          goal_id?: string | null
          id?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          feedback_text?: string
          feedback_type?: string
          goal_id?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_feedback_history_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "student_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feedback_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lesson_history: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model_name: string | null
          model_provider: string
          output_tokens: number | null
          prompt_preview: string | null
          response_preview: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_name?: string | null
          model_provider?: string
          output_tokens?: number | null
          prompt_preview?: string | null
          response_preview?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model_name?: string | null
          model_provider?: string
          output_tokens?: number | null
          prompt_preview?: string | null
          response_preview?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_tutor_conversations: {
        Row: {
          id: string
          is_flagged: boolean | null
          last_message_at: string | null
          lesson_id: string | null
          message_count: number | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_flagged?: boolean | null
          last_message_at?: string | null
          lesson_id?: string | null
          message_count?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_flagged?: boolean | null
          last_message_at?: string | null
          lesson_id?: string | null
          message_count?: number | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_conversations_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_usage: {
        Row: {
          date: string
          lesson_id: string
          questions_asked: number | null
          user_id: string
        }
        Insert: {
          date?: string
          lesson_id: string
          questions_asked?: number | null
          user_id: string
        }
        Update: {
          date?: string
          lesson_id?: string
          questions_asked?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_usage_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          action_type: string
          created_at: string
          estimated_cost: number | null
          id: string
          metadata: Json | null
          model: string | null
          organization_id: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          estimated_cost?: number | null
          id?: string
          metadata?: Json | null
          model?: string | null
          organization_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          estimated_cost?: number | null
          id?: string
          metadata?: Json | null
          model?: string | null
          organization_id?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      assignment_grades: {
        Row: {
          created_at: string
          feedback: string | null
          grade: number
          graded_at: string
          grader_user_id: string
          id: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          grade: number
          graded_at?: string
          grader_user_id: string
          id?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          grade?: number
          graded_at?: string
          grader_user_id?: string
          id?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          ai_feedback: string | null
          assignment_id: string
          created_at: string
          file_names: string[] | null
          file_types: string[] | null
          file_urls: string[] | null
          files: Json | null
          id: string
          last_edited_at: string | null
          overrides: Json | null
          return_reason: string | null
          status: string | null
          submitted_at: string | null
          text_response: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          assignment_id: string
          created_at?: string
          file_names?: string[] | null
          file_types?: string[] | null
          file_urls?: string[] | null
          files?: Json | null
          id?: string
          last_edited_at?: string | null
          overrides?: Json | null
          return_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          text_response?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          assignment_id?: string
          created_at?: string
          file_names?: string[] | null
          file_types?: string[] | null
          file_urls?: string[] | null
          files?: Json | null
          id?: string
          last_edited_at?: string | null
          overrides?: Json | null
          return_reason?: string | null
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
            referencedRelation: "class_assignments_new"
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
      audit_logs: {
        Row: {
          action: string
          actor_role: string
          actor_user_id: string
          created_at: string
          id: string
          ip_address: unknown
          payload_hash: string | null
          reason: string | null
          resource: string
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_role: string
          actor_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          payload_hash?: string | null
          reason?: string | null
          resource: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_role?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          payload_hash?: string | null
          reason?: string | null
          resource?: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          started_at: string
          started_by: string
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          started_by: string
          status?: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string
          started_by?: string
          status?: string
        }
        Relationships: []
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
      class_assignments_new: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          due_at: string | null
          due_date: string | null
          id: string
          instructions: string | null
          lesson_id: string | null
          max_points: number | null
          options: Json
          release_at: string | null
          rubric: string | null
          selected_components: Json
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          max_points?: number | null
          options?: Json
          release_at?: string | null
          rubric?: string | null
          selected_components?: Json
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          max_points?: number | null
          options?: Json
          release_at?: string | null
          rubric?: string | null
          selected_components?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_new_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assignments_new_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      class_courses: {
        Row: {
          class_id: string
          created_at: string
          id: string
          track: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          track: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          track?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_join_log: {
        Row: {
          class_id: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          join_code: string | null
          join_method: string | null
          joined_at: string | null
          student_id: string | null
          success: boolean | null
        }
        Insert: {
          class_id?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          join_code?: string | null
          join_method?: string | null
          joined_at?: string | null
          student_id?: string | null
          success?: boolean | null
        }
        Update: {
          class_id?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          join_code?: string | null
          join_method?: string | null
          joined_at?: string | null
          student_id?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "class_join_log_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_lessons: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          instructions: string | null
          materials: string[] | null
          objectives: string[] | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          instructions?: string | null
          materials?: string[] | null
          objectives?: string[] | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          instructions?: string | null
          materials?: string[] | null
          objectives?: string[] | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_messages: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          message_type: string
          priority: string
          scheduled_at: string | null
          sent_at: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          priority?: string
          scheduled_at?: string | null
          sent_at?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          message_type?: string
          priority?: string
          scheduled_at?: string | null
          sent_at?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_resources: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_resources_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_standards: {
        Row: {
          class_id: string
          created_at: string
          description: string
          id: string
          standard_code: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description: string
          id?: string
          standard_code: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string
          id?: string
          standard_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_standards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          class_id: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          class_id: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          class_id?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          added_at: string | null
          added_by: string | null
          class_id: string
          id: string
          role: string | null
          teacher_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          class_id: string
          id?: string
          role?: string | null
          teacher_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          class_id?: string
          id?: string
          role?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_weekly_digests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          class_id: string
          created_at: string | null
          id: string
          payload_json: Json
          posted_to_feed: boolean | null
          sent_to_parents: boolean | null
          teacher_approved: boolean | null
          updated_at: string | null
          variant: string
          week_end: string
          week_start: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          payload_json?: Json
          posted_to_feed?: boolean | null
          sent_to_parents?: boolean | null
          teacher_approved?: boolean | null
          updated_at?: string | null
          variant: string
          week_end: string
          week_start: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          payload_json?: Json
          posted_to_feed?: boolean | null
          sent_to_parents?: boolean | null
          teacher_approved?: boolean | null
          updated_at?: string | null
          variant?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_weekly_digests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          allow_code_join: boolean | null
          allow_qr_join: boolean | null
          class_code: string
          code_expires_at: string | null
          code_last_regenerated_at: string | null
          code_usage_count: number | null
          code_usage_limit: number | null
          content_metadata: Json | null
          created_at: string | null
          description: string | null
          duration: string | null
          grade_level: string | null
          id: string
          instructor: string | null
          learning_objectives: string | null
          max_students: number | null
          name: string
          prerequisites: string | null
          published: boolean | null
          published_at: string | null
          schedule: string | null
          school_year: string | null
          status: string | null
          subject: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          allow_code_join?: boolean | null
          allow_qr_join?: boolean | null
          class_code: string
          code_expires_at?: string | null
          code_last_regenerated_at?: string | null
          code_usage_count?: number | null
          code_usage_limit?: number | null
          content_metadata?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          grade_level?: string | null
          id?: string
          instructor?: string | null
          learning_objectives?: string | null
          max_students?: number | null
          name: string
          prerequisites?: string | null
          published?: boolean | null
          published_at?: string | null
          schedule?: string | null
          school_year?: string | null
          status?: string | null
          subject?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          allow_code_join?: boolean | null
          allow_qr_join?: boolean | null
          class_code?: string
          code_expires_at?: string | null
          code_last_regenerated_at?: string | null
          code_usage_count?: number | null
          code_usage_limit?: number | null
          content_metadata?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          grade_level?: string | null
          id?: string
          instructor?: string | null
          learning_objectives?: string | null
          max_students?: number | null
          name?: string
          prerequisites?: string | null
          published?: boolean | null
          published_at?: string | null
          schedule?: string | null
          school_year?: string | null
          status?: string | null
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
      classroom_activities: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          instructions: string | null
          materials: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          instructions?: string | null
          materials?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          instructions?: string | null
          materials?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_activities_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_join_requests: {
        Row: {
          class_id: string
          created_at: string
          id: string
          message: string | null
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          message?: string | null
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_join_requests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_join_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      content_embeddings: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          embedded_at: string
          embedding_model: string
          id: string
          metadata: Json | null
          pinecone_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          embedded_at?: string
          embedding_model?: string
          id?: string
          metadata?: Json | null
          pinecone_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          embedded_at?: string
          embedding_model?: string
          id?: string
          metadata?: Json | null
          pinecone_id?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          grade_level: string | null
          id: string
          is_published: boolean | null
          metadata: Json | null
          subject: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          version_number: number | null
        }
        Insert: {
          content_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          subject?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version_number?: number | null
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          grade_level?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          subject?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          version_number?: number | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          changes_summary: string | null
          content_id: string
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content_id: string
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          organization: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          organization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          organization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_tenants: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          seed_version: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          seed_version?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          seed_version?: string | null
          status?: string
        }
        Relationships: []
      }
      demo_users: {
        Row: {
          created_at: string
          demo_tenant_id: string
          email: string
          full_name: string
          id: string
          role: string
          school_or_district: string
        }
        Insert: {
          created_at?: string
          demo_tenant_id: string
          email: string
          full_name: string
          id?: string
          role: string
          school_or_district: string
        }
        Update: {
          created_at?: string
          demo_tenant_id?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
          school_or_district?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_users_demo_tenant_id_fkey"
            columns: ["demo_tenant_id"]
            isOneToOne: false
            referencedRelation: "demo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_activity_log: {
        Row: {
          action: string
          created_at: string | null
          developer_id: string
          environment: string | null
          id: string
          metadata: Json | null
          operation: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          developer_id: string
          environment?: string | null
          id?: string
          metadata?: Json | null
          operation?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          developer_id?: string
          environment?: string | null
          id?: string
          metadata?: Json | null
          operation?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      dev_sandbox_classes: {
        Row: {
          class_code: string | null
          content_metadata: Json | null
          created_at: string | null
          description: string | null
          duration: string | null
          grade_level: string | null
          id: string
          instructor: string | null
          learning_objectives: string | null
          max_students: number | null
          name: string
          prerequisites: string | null
          published: boolean | null
          published_at: string | null
          schedule: string | null
          school_year: string | null
          status: string | null
          subject: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          class_code?: string | null
          content_metadata?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          grade_level?: string | null
          id?: string
          instructor?: string | null
          learning_objectives?: string | null
          max_students?: number | null
          name: string
          prerequisites?: string | null
          published?: boolean | null
          published_at?: string | null
          schedule?: string | null
          school_year?: string | null
          status?: string | null
          subject?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          class_code?: string | null
          content_metadata?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          grade_level?: string | null
          id?: string
          instructor?: string | null
          learning_objectives?: string | null
          max_students?: number | null
          name?: string
          prerequisites?: string | null
          published?: boolean | null
          published_at?: string | null
          schedule?: string | null
          school_year?: string | null
          status?: string | null
          subject?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dev_sandbox_grades: {
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
        Relationships: []
      }
      dev_sandbox_students: {
        Row: {
          class_id: string | null
          created_at: string | null
          first_name: string
          grade_level: string | null
          id: string
          iep_accommodations: string[] | null
          interests: string[] | null
          language_preference: string | null
          last_name: string
          learning_style: string | null
          lesson_modifications: Json | null
          reading_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          first_name: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name: string
          learning_style?: string | null
          lesson_modifications?: Json | null
          reading_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          first_name?: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name?: string
          learning_style?: string | null
          lesson_modifications?: Json | null
          reading_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      developer_settings: {
        Row: {
          created_at: string
          developer_id: string
          id: string
          ip_restrictions: unknown[] | null
          production_access: boolean | null
          staging_access: boolean | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          developer_id: string
          id?: string
          ip_restrictions?: unknown[] | null
          production_access?: boolean | null
          staging_access?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          developer_id?: string
          id?: string
          ip_restrictions?: unknown[] | null
          production_access?: boolean | null
          staging_access?: boolean | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          attachment_urls: string[] | null
          class_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          class_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          class_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          reply_id: string | null
          thread_id: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_attachments_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_attachments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          reply_id: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_reactions_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean | null
          parent_id: string | null
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          assignment_id: string | null
          body: string
          class_id: string | null
          created_at: string
          created_by: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string
          lesson_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          body: string
          class_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string
          lesson_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string
          lesson_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_threads_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_threads_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_threads_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_typing: {
        Row: {
          id: string
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_typing_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_attachments: {
        Row: {
          created_at: string | null
          file_id: string
          file_name: string
          id: string
          lesson_component_id: string | null
          metadata: Json | null
          mime_type: string
          owner_id: string
          updated_at: string | null
          web_view_link: string
        }
        Insert: {
          created_at?: string | null
          file_id: string
          file_name: string
          id?: string
          lesson_component_id?: string | null
          metadata?: Json | null
          mime_type: string
          owner_id: string
          updated_at?: string | null
          web_view_link: string
        }
        Update: {
          created_at?: string | null
          file_id?: string
          file_name?: string
          id?: string
          lesson_component_id?: string | null
          metadata?: Json | null
          mime_type?: string
          owner_id?: string
          updated_at?: string | null
          web_view_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_attachments_lesson_component_id_fkey"
            columns: ["lesson_component_id"]
            isOneToOne: false
            referencedRelation: "lesson_components"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_toggles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          environment: string
          feature_name: string
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          environment?: string
          feature_name: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          environment?: string
          feature_name?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      focus_mode_settings: {
        Row: {
          enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      impersonation_logs: {
        Row: {
          actions_performed: Json | null
          created_at: string
          developer_id: string
          id: string
          impersonated_role: string | null
          impersonated_user_id: string | null
          ip_address: unknown
          session_end: string | null
          session_start: string
          user_agent: string | null
        }
        Insert: {
          actions_performed?: Json | null
          created_at?: string
          developer_id: string
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Update: {
          actions_performed?: Json | null
          created_at?: string
          developer_id?: string
          id?: string
          impersonated_role?: string | null
          impersonated_user_id?: string | null
          ip_address?: unknown
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      individual_activities: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          estimated_time: number | null
          id: string
          instructions: string | null
          resources: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          instructions?: string | null
          resources?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          instructions?: string | null
          resources?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_activities_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_components: {
        Row: {
          component_type: string
          content: Json
          created_at: string
          enabled: boolean | null
          id: string
          is_assignable: boolean | null
          language_code: string | null
          lesson_id: string
          order: number
          read_aloud: boolean | null
          reading_level: number | null
          updated_at: string
        }
        Insert: {
          component_type: string
          content?: Json
          created_at?: string
          enabled?: boolean | null
          id?: string
          is_assignable?: boolean | null
          language_code?: string | null
          lesson_id: string
          order?: number
          read_aloud?: boolean | null
          reading_level?: number | null
          updated_at?: string
        }
        Update: {
          component_type?: string
          content?: Json
          created_at?: string
          enabled?: boolean | null
          id?: string
          is_assignable?: boolean | null
          language_code?: string | null
          lesson_id?: string
          order?: number
          read_aloud?: boolean | null
          reading_level?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_components_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
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
      lesson_media: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          media_type: string | null
          media_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          media_type?: string | null
          media_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          media_type?: string | null
          media_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_media_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_media_notes: {
        Row: {
          created_at: string | null
          id: string
          media_id: string | null
          questions: Json | null
          recommended_next: Json | null
          summary_student: string | null
          summary_teacher: string | null
          themes: Json | null
          transcript: string | null
          translations: Json | null
          updated_at: string | null
          vocab_list: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          questions?: Json | null
          recommended_next?: Json | null
          summary_student?: string | null
          summary_teacher?: string | null
          themes?: Json | null
          transcript?: string | null
          translations?: Json | null
          updated_at?: string | null
          vocab_list?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          questions?: Json | null
          recommended_next?: Json | null
          summary_student?: string | null
          summary_teacher?: string | null
          themes?: Json | null
          transcript?: string | null
          translations?: Json | null
          updated_at?: string | null
          vocab_list?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_media_notes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "lesson_media"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_refinements: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          refined_json: Json
          student_summary: Json | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          refined_json: Json
          student_summary?: Json | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          refined_json?: Json
          student_summary?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_refinements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_refinements_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons_generated"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_videos: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "class_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          class_id: string
          content: Json | null
          created_at: string | null
          description: string | null
          desmos_enabled: boolean | null
          desmos_type: string | null
          duration: number | null
          id: string
          materials: string[] | null
          objectives: string[] | null
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          desmos_enabled?: boolean | null
          desmos_type?: string | null
          duration?: number | null
          id?: string
          materials?: string[] | null
          objectives?: string[] | null
          order_index?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          content?: Json | null
          created_at?: string | null
          description?: string | null
          desmos_enabled?: boolean | null
          desmos_type?: string | null
          duration?: number | null
          id?: string
          materials?: string[] | null
          objectives?: string[] | null
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
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
          Text: string | null
          "Text (Grade 3)": string | null
          "Text (Grade 5)": string | null
          "Text (Grade 8)": string | null
          Texta: string | null
          Title: string | null
          Track: string | null
          "Translated Content": Json | null
          video_url: string | null
        }
        Insert: {
          Description?: string | null
          "Lesson ID": number
          Order?: number | null
          slug?: string | null
          "Source Doc URL"?: string | null
          Text?: string | null
          "Text (Grade 3)"?: string | null
          "Text (Grade 5)"?: string | null
          "Text (Grade 8)"?: string | null
          Texta?: string | null
          Title?: string | null
          Track?: string | null
          "Translated Content"?: Json | null
          video_url?: string | null
        }
        Update: {
          Description?: string | null
          "Lesson ID"?: number
          Order?: number | null
          slug?: string | null
          "Source Doc URL"?: string | null
          Text?: string | null
          "Text (Grade 3)"?: string | null
          "Text (Grade 5)"?: string | null
          "Text (Grade 8)"?: string | null
          Texta?: string | null
          Title?: string | null
          Track?: string | null
          "Translated Content"?: Json | null
          video_url?: string | null
        }
        Relationships: []
      }
      lessons_generated: {
        Row: {
          created_at: string
          grade_level: string
          id: string
          lesson_json: Json
          subject: string
          teacher_id: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_level: string
          id?: string
          lesson_json: Json
          subject: string
          teacher_id?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_level?: string
          id?: string
          lesson_json?: Json
          subject?: string
          teacher_id?: string | null
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_generated_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_tokens: {
        Row: {
          consumed: boolean
          created_at: string
          demo_tenant_id: string
          email: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          consumed?: boolean
          created_at?: string
          demo_tenant_id: string
          email: string
          expires_at?: string
          id?: string
          token: string
        }
        Update: {
          consumed?: boolean
          created_at?: string
          demo_tenant_id?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "magic_tokens_demo_tenant_id_fkey"
            columns: ["demo_tenant_id"]
            isOneToOne: false
            referencedRelation: "demo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "class_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          success: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_rate_limits: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          locked_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          locked_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          locked_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mfa_verification_attempts: {
        Row: {
          attempted_at: string
          id: string
          ip_address: unknown
          success: boolean
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onedrive_attachments: {
        Row: {
          created_at: string
          file_id: string
          file_name: string
          id: string
          lesson_component_id: string | null
          metadata: Json | null
          mime_type: string
          owner_id: string
          updated_at: string
          web_url: string
        }
        Insert: {
          created_at?: string
          file_id: string
          file_name: string
          id?: string
          lesson_component_id?: string | null
          metadata?: Json | null
          mime_type: string
          owner_id: string
          updated_at?: string
          web_url: string
        }
        Update: {
          created_at?: string
          file_id?: string
          file_name?: string
          id?: string
          lesson_component_id?: string | null
          metadata?: Json | null
          mime_type?: string
          owner_id?: string
          updated_at?: string
          web_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "onedrive_attachments_lesson_component_id_fkey"
            columns: ["lesson_component_id"]
            isOneToOne: false
            referencedRelation: "lesson_components"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          created_at: string
          emergency_contact: boolean | null
          first_name: string
          id: string
          last_name: string
          phone_number: string | null
          preferred_contact_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact?: boolean | null
          first_name: string
          id?: string
          last_name: string
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact?: boolean | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_teacher_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          parent_id: string
          priority: string | null
          sender_type: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          parent_id: string
          priority?: string | null
          sender_type: string
          student_id: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          parent_id?: string
          priority?: string | null
          sender_type?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_teacher_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_messages_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          recorded_at: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          recorded_at?: string
          unit: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          recorded_at?: string
          unit?: string
          value?: number
        }
        Relationships: []
      }
      pilot_interest: {
        Row: {
          created_at: string | null
          email: string
          expected_start: string | null
          id: string
          message: string | null
          name: string
          organization: string
          program_interest: string[]
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expected_start?: string | null
          id?: string
          message?: string | null
          name: string
          organization: string
          program_interest: string[]
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expected_start?: string | null
          id?: string
          message?: string | null
          name?: string
          organization?: string
          program_interest?: string[]
          role?: string
        }
        Relationships: []
      }
      pivot_conversations: {
        Row: {
          component_id: string | null
          component_type: string | null
          created_at: string | null
          ended_at: string | null
          hints_requested: number | null
          hints_used: number | null
          id: string
          lesson_id: string | null
          question_id: string | null
          question_text: string | null
          solved_after_hint: boolean | null
          started_at: string | null
          student_id: string | null
          total_exchanges: number | null
          updated_at: string | null
          was_successful: boolean | null
        }
        Insert: {
          component_id?: string | null
          component_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          hints_requested?: number | null
          hints_used?: number | null
          id?: string
          lesson_id?: string | null
          question_id?: string | null
          question_text?: string | null
          solved_after_hint?: boolean | null
          started_at?: string | null
          student_id?: string | null
          total_exchanges?: number | null
          updated_at?: string | null
          was_successful?: boolean | null
        }
        Update: {
          component_id?: string | null
          component_type?: string | null
          created_at?: string | null
          ended_at?: string | null
          hints_requested?: number | null
          hints_used?: number | null
          id?: string
          lesson_id?: string | null
          question_id?: string | null
          question_text?: string | null
          solved_after_hint?: boolean | null
          started_at?: string | null
          student_id?: string | null
          total_exchanges?: number | null
          updated_at?: string | null
          was_successful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pivot_conversations_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pivot_conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pivot_help_requests: {
        Row: {
          assessment_id: string
          conversation_id: string | null
          created_at: string | null
          help_useful: boolean | null
          id: string
          question_id: string
          requested_at: string | null
          student_id: string
          time_on_question: number | null
          wrong_attempts: number | null
        }
        Insert: {
          assessment_id: string
          conversation_id?: string | null
          created_at?: string | null
          help_useful?: boolean | null
          id?: string
          question_id: string
          requested_at?: string | null
          student_id: string
          time_on_question?: number | null
          wrong_attempts?: number | null
        }
        Update: {
          assessment_id?: string
          conversation_id?: string | null
          created_at?: string | null
          help_useful?: boolean | null
          id?: string
          question_id?: string
          requested_at?: string | null
          student_id?: string
          time_on_question?: number | null
          wrong_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pivot_help_requests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "pivot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pivot_hints: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          hint_text: string
          id: string
          was_used: boolean | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          hint_text: string
          id?: string
          was_used?: boolean | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          hint_text?: string
          id?: string
          was_used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pivot_hints_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "pivot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pivot_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message_text: string
          message_type: string | null
          sender: string
          sequence_number: number
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_text: string
          message_type?: string | null
          sender: string
          sequence_number: number
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_text?: string
          message_type?: string | null
          sender?: string
          sequence_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pivot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "pivot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_components: {
        Row: {
          allow_anonymous: boolean | null
          allow_change_vote: boolean | null
          chart_type: string | null
          close_poll_at: string | null
          component_id: string
          created_at: string | null
          id: string
          is_closed: boolean | null
          poll_question: string
          poll_type: string
          require_participation: boolean | null
          session_title: string | null
          show_percentages: boolean | null
          show_results_timing: string | null
          show_vote_counts: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_anonymous?: boolean | null
          allow_change_vote?: boolean | null
          chart_type?: string | null
          close_poll_at?: string | null
          component_id: string
          created_at?: string | null
          id?: string
          is_closed?: boolean | null
          poll_question: string
          poll_type: string
          require_participation?: boolean | null
          session_title?: string | null
          show_percentages?: boolean | null
          show_results_timing?: string | null
          show_vote_counts?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_anonymous?: boolean | null
          allow_change_vote?: boolean | null
          chart_type?: string | null
          close_poll_at?: string | null
          component_id?: string
          created_at?: string | null
          id?: string
          is_closed?: boolean | null
          poll_question?: string
          poll_type?: string
          require_participation?: boolean | null
          session_title?: string | null
          show_percentages?: boolean | null
          show_results_timing?: string | null
          show_vote_counts?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_components_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: true
            referencedRelation: "lesson_components"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          option_order: number
          option_text: string
          poll_component_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_order: number
          option_text: string
          poll_component_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_order?: number
          option_text?: string
          poll_component_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_component_id_fkey"
            columns: ["poll_component_id"]
            isOneToOne: false
            referencedRelation: "poll_components"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          id: string
          is_anonymous: boolean | null
          poll_component_id: string
          ranking_order: Json | null
          rating_value: number | null
          responded_at: string | null
          response_text: string | null
          selected_option_ids: string[] | null
          text_response: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_anonymous?: boolean | null
          poll_component_id: string
          ranking_order?: Json | null
          rating_value?: number | null
          responded_at?: string | null
          response_text?: string | null
          selected_option_ids?: string[] | null
          text_response?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_anonymous?: boolean | null
          poll_component_id?: string
          ranking_order?: Json | null
          rating_value?: number | null
          responded_at?: string | null
          response_text?: string | null
          selected_option_ids?: string[] | null
          text_response?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_component_id_fkey"
            columns: ["poll_component_id"]
            isOneToOne: false
            referencedRelation: "poll_components"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allowed_ips: string[] | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mfa_backup_codes: string[] | null
          mfa_backup_codes_used: Json | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          mfa_secret_enc: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          allowed_ips?: string[] | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mfa_backup_codes?: string[] | null
          mfa_backup_codes_used?: Json | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_enc?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          allowed_ips?: string[] | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mfa_backup_codes?: string[] | null
          mfa_backup_codes_used?: Json | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_secret_enc?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      published_assignments: {
        Row: {
          allow_text_response: boolean | null
          class_assignment_id: string
          class_id: string
          created_at: string
          description: string | null
          due_date: string | null
          file_types_allowed: string[] | null
          id: string
          instructions: string
          is_active: boolean | null
          lesson_id: number | null
          max_files: number | null
          max_points: number | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_text_response?: boolean | null
          class_assignment_id: string
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_types_allowed?: string[] | null
          id?: string
          instructions: string
          is_active?: boolean | null
          lesson_id?: number | null
          max_files?: number | null
          max_points?: number | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_text_response?: boolean | null
          class_assignment_id?: string
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_types_allowed?: string[] | null
          id?: string
          instructions?: string
          is_active?: boolean | null
          lesson_id?: number | null
          max_files?: number | null
          max_points?: number | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_assignments_class_assignment_id_fkey"
            columns: ["class_assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "Lessons"
            referencedColumns: ["Lesson ID"]
          },
        ]
      }
      quiz_question_bank: {
        Row: {
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          hint: string | null
          id: string
          image_url: string | null
          points: number | null
          question_text: string
          question_type: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          points?: number | null
          question_text: string
          question_type: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          hint?: string | null
          id?: string
          image_url?: string | null
          points?: number | null
          question_text?: string
          question_type?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_question_bank_options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          option_order: number | null
          option_text: string
          question_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_order?: number | null
          option_text: string
          question_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_order?: number | null
          option_text?: string
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_bank_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_criteria: {
        Row: {
          created_at: string | null
          description: string
          id: string
          max_points: number
          name: string
          order_index: number
          rubric_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          max_points?: number
          name: string
          order_index?: number
          rubric_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          max_points?: number
          name?: string
          order_index?: number
          rubric_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      rubrics: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          title: string
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments_new"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goals: {
        Row: {
          ai_generated: boolean | null
          created_at: string | null
          goal_text: string
          id: string
          status: string
          student_id: string
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string | null
          goal_text: string
          id?: string
          status?: string
          student_id: string
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string | null
          goal_text?: string
          id?: string
          status?: string
          student_id?: string
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_math_sessions: {
        Row: {
          activity_id: string | null
          calculator_state: Json
          created_at: string
          id: string
          lesson_id: string | null
          session_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          calculator_state?: Json
          created_at?: string
          id?: string
          lesson_id?: string | null
          session_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          calculator_state?: Json
          created_at?: string
          id?: string
          lesson_id?: string | null
          session_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_math_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parent_relationships: {
        Row: {
          can_receive_communications: boolean | null
          can_view_attendance: boolean | null
          can_view_grades: boolean | null
          created_at: string
          id: string
          parent_id: string
          relationship_type: string
          student_id: string
        }
        Insert: {
          can_receive_communications?: boolean | null
          can_view_attendance?: boolean | null
          can_view_grades?: boolean | null
          created_at?: string
          id?: string
          parent_id: string
          relationship_type?: string
          student_id: string
        }
        Update: {
          can_receive_communications?: boolean | null
          can_view_attendance?: boolean | null
          can_view_grades?: boolean | null
          created_at?: string
          id?: string
          parent_id?: string
          relationship_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parent_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parent_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          created_at: string
          id: string
          profile_json: Json
          student_id: string
          survey_completed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_json?: Json
          student_id: string
          survey_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_json?: Json
          student_id?: string
          survey_completed_at?: string | null
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
      student_reflections: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          prompt_question: string | null
          reflection_text: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          prompt_question?: string | null
          reflection_text: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          prompt_question?: string | null
          reflection_text?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_reflections_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "student_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_reflections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_submissions: {
        Row: {
          assignment_id: string
          content: Json
          created_at: string
          id: string
          status: string
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          content?: Json
          created_at?: string
          id?: string
          status?: string
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          content?: Json
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string | null
          first_name: string
          grade_level: string | null
          id: string
          iep_accommodations: string[] | null
          interests: string[] | null
          language_preference: string | null
          last_name: string
          learning_style: string | null
          lesson_modifications: Json | null
          reading_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          first_name: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name: string
          learning_style?: string | null
          lesson_modifications?: Json | null
          reading_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          first_name?: string
          grade_level?: string | null
          id?: string
          iep_accommodations?: string[] | null
          interests?: string[] | null
          language_preference?: string | null
          last_name?: string
          learning_style?: string | null
          lesson_modifications?: Json | null
          reading_level?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      submission_analyses: {
        Row: {
          analyzed_at: string
          areas_for_growth: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          misconceptions: Json | null
          model_used: string | null
          overall_mastery: string | null
          personalized_feedback: string | null
          raw_model_output: Json | null
          recommended_action: string | null
          rubric_id: string | null
          rubric_scores: Json | null
          strengths: Json | null
          submission_id: string
          teacher_modified: boolean | null
          teacher_notes: string | null
          teacher_reviewed: boolean | null
          updated_at: string
        }
        Insert: {
          analyzed_at?: string
          areas_for_growth?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          misconceptions?: Json | null
          model_used?: string | null
          overall_mastery?: string | null
          personalized_feedback?: string | null
          raw_model_output?: Json | null
          recommended_action?: string | null
          rubric_id?: string | null
          rubric_scores?: Json | null
          strengths?: Json | null
          submission_id: string
          teacher_modified?: boolean | null
          teacher_notes?: string | null
          teacher_reviewed?: boolean | null
          updated_at?: string
        }
        Update: {
          analyzed_at?: string
          areas_for_growth?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          misconceptions?: Json | null
          model_used?: string | null
          overall_mastery?: string | null
          personalized_feedback?: string | null
          raw_model_output?: Json | null
          recommended_action?: string | null
          rubric_id?: string | null
          rubric_scores?: Json | null
          strengths?: Json | null
          submission_id?: string
          teacher_modified?: boolean | null
          teacher_notes?: string | null
          teacher_reviewed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_analyses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          reason: string | null
          updated_at: string
          user_id: string
          view_as_role: string | null
          view_as_tenant_id: string | null
          write_override_enabled: boolean | null
          write_override_expires_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          updated_at?: string
          user_id: string
          view_as_role?: string | null
          view_as_tenant_id?: string | null
          write_override_enabled?: boolean | null
          write_override_expires_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          updated_at?: string
          user_id?: string
          view_as_role?: string | null
          view_as_tenant_id?: string | null
          write_override_enabled?: boolean | null
          write_override_expires_at?: string | null
        }
        Relationships: []
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
      survey_responses: {
        Row: {
          answer_value: Json
          created_at: string
          id: string
          question_id: string
          student_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          answer_value: Json
          created_at?: string
          id?: string
          question_id: string
          student_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          answer_value?: Json
          created_at?: string
          id?: string
          question_id?: string
          student_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric: string
          status?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      teacher_analysis_reviews: {
        Row: {
          action_type: string
          analysis_id: string
          changes_made: Json | null
          created_at: string
          id: string
          teacher_notes: string | null
          teacher_user_id: string
          updated_at: string
        }
        Insert: {
          action_type: string
          analysis_id: string
          changes_made?: Json | null
          created_at?: string
          id?: string
          teacher_notes?: string | null
          teacher_user_id: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          analysis_id?: string
          changes_made?: Json | null
          created_at?: string
          id?: string
          teacher_notes?: string | null
          teacher_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_analysis_reviews_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "submission_analyses"
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
      translation_cache: {
        Row: {
          access_count: number | null
          content_hash: string
          created_at: string
          id: string
          last_accessed_at: string
          original_content: string
          source_language: string
          target_language: string
          translated_content: string
        }
        Insert: {
          access_count?: number | null
          content_hash: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          original_content: string
          source_language?: string
          target_language: string
          translated_content: string
        }
        Update: {
          access_count?: number | null
          content_hash?: string
          created_at?: string
          id?: string
          last_accessed_at?: string
          original_content?: string
          source_language?: string
          target_language?: string
          translated_content?: string
        }
        Relationships: []
      }
      translation_logs: {
        Row: {
          created_at: string | null
          id: string
          target_language: string
          text_length: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_language: string
          text_length: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          target_language?: string
          text_length?: number
          user_id?: string | null
        }
        Relationships: []
      }
      tts_cache: {
        Row: {
          audio_base64: string
          audio_mime: string
          created_at: string | null
          id: string
          language_code: string
          last_accessed: string | null
          text: string
          user_id: string | null
          voice_style: string
        }
        Insert: {
          audio_base64: string
          audio_mime?: string
          created_at?: string | null
          id?: string
          language_code: string
          last_accessed?: string | null
          text: string
          user_id?: string | null
          voice_style: string
        }
        Update: {
          audio_base64?: string
          audio_mime?: string
          created_at?: string | null
          id?: string
          language_code?: string
          last_accessed?: string | null
          text?: string
          user_id?: string | null
          voice_style?: string
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
      user_role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          access_token_enc: string | null
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token_enc: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_enc?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token_enc?: string | null
          scope?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_enc?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token_enc?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_transcripts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          language: string
          segments: Json | null
          updated_at: string | null
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          language?: string
          segments?: Json | null
          updated_at?: string | null
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          language?: string
          segments?: Json | null
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_transcripts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_translations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          language: string
          segments: Json | null
          transcript_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          language: string
          segments?: Json | null
          transcript_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          language?: string
          segments?: Json | null
          transcript_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_translations_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "video_transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          lesson_id: string | null
          mime_type: string | null
          thumbnail_url: string | null
          title: string
          transcription_error: string | null
          transcription_status: string | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          lesson_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          title: string
          transcription_error?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          lesson_id?: string | null
          mime_type?: string | null
          thumbnail_url?: string | null
          title?: string
          transcription_error?: string | null
          transcription_status?: string | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_digests: {
        Row: {
          ai_note_text: string
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          next_focus_text: string
          student_id: string
          summary_text: string
          teacher_approved: boolean | null
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          ai_note_text: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          next_focus_text: string
          student_id: string
          summary_text: string
          teacher_approved?: boolean | null
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          ai_note_text?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          next_focus_text?: string
          student_id?: string
          summary_text?: string
          teacher_approved?: boolean | null
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_digests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_join_request: {
        Args: { _request_id: string; _teacher_user_id: string }
        Returns: {
          error: string
          success: boolean
        }[]
      }
      calculate_letter_grade: { Args: { percentage: number }; Returns: string }
      can_manage_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      can_teacher_modify_analysis: {
        Args: { _analysis_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      cleanup_old_mfa_attempts: { Args: never; Returns: undefined }
      cleanup_old_tts_cache: { Args: never; Returns: undefined }
      decrypt_mfa_secret: { Args: { uid: string }; Returns: string }
      decrypt_token: {
        Args: { provider_param: string; user_id_param: string }
        Returns: string
      }
      encrypt_mfa_secret: {
        Args: { secret_text: string; uid: string }
        Returns: undefined
      }
      encrypt_token: { Args: { token_text: string }; Returns: string }
      generate_class_code: { Args: never; Returns: string }
      get_student_id_for_user: { Args: { _user_id: string }; Returns: string }
      get_teacher_profile_id: { Args: { _user_id: string }; Returns: string }
      global_search: {
        Args: { org_name?: string; search_query: string; user_role?: string }
        Returns: {
          id: string
          metadata: Json
          name: string
          route: string
          type: string
        }[]
      }
      has_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["permission_type"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_teacher_profile: { Args: { _user_id?: string }; Returns: boolean }
      increment_tutor_usage: {
        Args: { p_lesson_id: string; p_user_id: string }
        Returns: undefined
      }
      is_developer: { Args: { _user_id?: string }; Returns: boolean }
      is_student_enrolled_in_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_system_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_teacher_of_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_teacher_of_class_multi: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_teacher_of_student: {
        Args: { _student_id: string; _teacher_user_id: string }
        Returns: boolean
      }
      join_class_by_code: {
        Args: { _class_code: string; _user_id: string }
        Returns: {
          class_name: string
          error: string
          success: boolean
        }[]
      }
      record_pivot_message: {
        Args: {
          p_conversation_id: string
          p_message_text: string
          p_message_type?: string
          p_sender: string
        }
        Returns: string
      }
      refresh_system_metrics: { Args: never; Returns: undefined }
      reject_join_request: {
        Args: {
          _rejection_reason?: string
          _request_id: string
          _teacher_user_id: string
        }
        Returns: {
          error: string
          success: boolean
        }[]
      }
      request_to_join_class: {
        Args: {
          _class_code: string
          _message?: string
          _student_user_id: string
        }
        Returns: {
          class_name: string
          error: string
          request_id: string
          success: boolean
        }[]
      }
      reset_dev_sandbox: { Args: never; Returns: undefined }
      rpc_assign_lesson_to_class:
        | {
            Args: {
              p_class_id: string
              p_component_ids: string[]
              p_due_at: string
              p_lesson_id: string
              p_options?: Json
              p_release_at?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_class_id: string
              p_component_ids: string[]
              p_description?: string
              p_due_at: string
              p_instructions?: string
              p_lesson_id: string
              p_options?: Json
              p_release_at?: string
              p_rubric?: string
              p_title?: string
            }
            Returns: string
          }
      rpc_backfill_assignments_for_student: {
        Args: { p_class_id: string; p_student_id: string }
        Returns: undefined
      }
      rpc_enroll_students: {
        Args: { p_class_id: string; p_student_ids: string[] }
        Returns: undefined
      }
      seed_dev_sandbox_data: { Args: never; Returns: undefined }
      user_enrolled_class_ids: { Args: { _user_id: string }; Returns: string[] }
      user_enrolled_in_class: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_type: "school" | "homeschool" | "workforce"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "developer"
        | "super_admin"
        | "student"
        | "teacher"
        | "parent"
        | "system_admin"
      permission_type:
        | "read_users"
        | "write_users"
        | "delete_users"
        | "read_classes"
        | "write_classes"
        | "delete_classes"
        | "read_content"
        | "write_content"
        | "delete_content"
        | "read_grades"
        | "write_grades"
        | "delete_grades"
        | "read_analytics"
        | "write_analytics"
        | "system_admin"
        | "backup_data"
        | "manage_permissions"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_type: ["school", "homeschool", "workforce"],
      app_role: [
        "admin",
        "moderator",
        "user",
        "developer",
        "super_admin",
        "student",
        "teacher",
        "parent",
        "system_admin",
      ],
      permission_type: [
        "read_users",
        "write_users",
        "delete_users",
        "read_classes",
        "write_classes",
        "delete_classes",
        "read_content",
        "write_content",
        "delete_content",
        "read_grades",
        "write_grades",
        "delete_grades",
        "read_analytics",
        "write_analytics",
        "system_admin",
        "backup_data",
        "manage_permissions",
      ],
    },
  },
} as const
