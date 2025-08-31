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
      audit_logs: {
        Row: {
          action: string
          actor_role: string
          actor_user_id: string
          created_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          due_date: string | null
          id: string
          instructions: string | null
          max_points: number | null
          rubric: string | null
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_points?: number | null
          rubric?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          max_points?: number | null
          rubric?: string | null
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
      classes: {
        Row: {
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
      impersonation_logs: {
        Row: {
          actions_performed: Json | null
          created_at: string
          developer_id: string
          id: string
          impersonated_role: string | null
          impersonated_user_id: string | null
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          language_code: string | null
          lesson_id: number
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
          language_code?: string | null
          lesson_id: number
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
          language_code?: string | null
          lesson_id?: number
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
      rubric_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_points: number
          name: string
          order_index: number
          rubric_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_points: number
          name: string
          order_index?: number
          rubric_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_points?: number
          name?: string
          order_index?: number
          rubric_id?: string
          updated_at?: string
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
      rubric_grades: {
        Row: {
          created_at: string
          criterion_id: string
          feedback: string | null
          id: string
          points_earned: number
          submission_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterion_id: string
          feedback?: string | null
          id?: string
          points_earned?: number
          submission_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterion_id?: string
          feedback?: string | null
          id?: string
          points_earned?: number
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_grades_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "rubric_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_grades_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      rubrics: {
        Row: {
          assignment_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          total_points: number
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
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
      super_admin_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_letter_grade: {
        Args: { percentage: number }
        Returns: string
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
      is_developer: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "developer" | "super_admin"
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
      app_role: ["admin", "moderator", "user", "developer", "super_admin"],
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
