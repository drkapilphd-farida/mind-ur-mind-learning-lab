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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_cost_log: {
        Row: {
          chunk_id: string | null
          created_at: string
          document_id: string | null
          error_message: string | null
          estimated_cost_cents: number
          feature: string
          id: string
          input_tokens: number
          model_id: string
          output_tokens: number
          processing_time_ms: number
          request_id: string
          success: boolean
        }
        Insert: {
          chunk_id?: string | null
          created_at?: string
          document_id?: string | null
          error_message?: string | null
          estimated_cost_cents: number
          feature: string
          id?: string
          input_tokens: number
          model_id: string
          output_tokens: number
          processing_time_ms: number
          request_id: string
          success: boolean
        }
        Update: {
          chunk_id?: string | null
          created_at?: string
          document_id?: string | null
          error_message?: string | null
          estimated_cost_cents?: number
          feature?: string
          id?: string
          input_tokens?: number
          model_id?: string
          output_tokens?: number
          processing_time_ms?: number
          request_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_cost_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_events: {
        Row: {
          cost_cents: number | null
          created_at: string
          event_type: string
          id: string
          input_tokens: number | null
          learning_session_id: string | null
          metadata: Json
          model: string
          output_tokens: number | null
          provider: string
          user_id: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string
          event_type: string
          id?: string
          input_tokens?: number | null
          learning_session_id?: string | null
          metadata?: Json
          model: string
          output_tokens?: number | null
          provider: string
          user_id: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string
          event_type?: string
          id?: string
          input_tokens?: number | null
          learning_session_id?: string | null
          metadata?: Json
          model?: string
          output_tokens?: number | null
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_events_learning_session_id_fkey"
            columns: ["learning_session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string
          id: string
          issued_at: string
          token: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          issued_at?: string
          token?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          issued_at?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_intelligence_blueprints: {
        Row: {
          chapter_order: number
          content_hash: string
          created_at: string
          data: Json
          document_id: string
          id: string
          updated_at: string
        }
        Insert: {
          chapter_order: number
          content_hash: string
          created_at?: string
          data: Json
          document_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          chapter_order?: number
          content_hash?: string
          created_at?: string
          data?: Json
          document_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_intelligence_blueprints_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          created_at: string
          id: string
          school_member_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          school_member_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          school_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_school_member_id_fkey"
            columns: ["school_member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          class_id: string
          created_at: string
          id: string
          school_member_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          school_member_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          school_member_id?: string
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
            foreignKeyName: "class_teachers_school_member_id_fkey"
            columns: ["school_member_id"]
            isOneToOne: false
            referencedRelation: "school_members"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          grade_level: string | null
          id: string
          name: string
          school_id: string
          section: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_level?: string | null
          id?: string
          name: string
          school_id: string
          section?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_level?: string | null
          id?: string
          name?: string
          school_id?: string
          section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          price_cents: number
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          price_cents?: number
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          price_cents?: number
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_quantum_sessions: {
        Row: {
          accuracy_percent: number
          id: string
          occurred_at: string
          reading_score: number
          reading_wpm: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          accuracy_percent: number
          id?: string
          occurred_at?: string
          reading_score: number
          reading_wpm: number
          user_id: string
          xp_earned: number
        }
        Update: {
          accuracy_percent?: number
          id?: string
          occurred_at?: string
          reading_score?: number
          reading_wpm?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      document_chunk_cache: {
        Row: {
          chunk_order: number
          content_hash: string
          created_at: string
          data: Json
          document_id: string
          id: string
          updated_at: string
        }
        Insert: {
          chunk_order: number
          content_hash: string
          created_at?: string
          data: Json
          document_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          chunk_order?: number
          content_hash?: string
          created_at?: string
          data?: Json
          document_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunk_cache_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_progress: {
        Row: {
          blueprints_generated: number
          chunks_enriched: number
          created_at: string
          document_id: string
          error_message: string | null
          id: string
          knowledge_graph_done: boolean
          learning_analysis_done: boolean
          learning_assets_generated: number
          locked_at: string | null
          stage: string
          total_chapters: number
          total_chunks: number
          updated_at: string
        }
        Insert: {
          blueprints_generated?: number
          chunks_enriched?: number
          created_at?: string
          document_id: string
          error_message?: string | null
          id?: string
          knowledge_graph_done?: boolean
          learning_analysis_done?: boolean
          learning_assets_generated?: number
          locked_at?: string | null
          stage?: string
          total_chapters?: number
          total_chunks?: number
          updated_at?: string
        }
        Update: {
          blueprints_generated?: number
          chunks_enriched?: number
          created_at?: string
          document_id?: string
          error_message?: string | null
          id?: string
          knowledge_graph_done?: boolean
          learning_analysis_done?: boolean
          learning_assets_generated?: number
          locked_at?: string | null
          stage?: string
          total_chapters?: number
          total_chunks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_progress_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_summary: {
        Row: {
          claude_calls: number
          created_at: string
          document_id: string
          estimated_cost_cents: number
          id: string
          input_tokens: number
          output_tokens: number
          processed_chunks: number
          processing_time_ms: number
          reused_chunks: number
          skipped_calls: number
          total_chunks: number
          updated_at: string
        }
        Insert: {
          claude_calls: number
          created_at?: string
          document_id: string
          estimated_cost_cents: number
          id?: string
          input_tokens: number
          output_tokens: number
          processed_chunks: number
          processing_time_ms: number
          reused_chunks: number
          skipped_calls: number
          total_chunks: number
          updated_at?: string
        }
        Update: {
          claude_calls?: number
          created_at?: string
          document_id?: string
          estimated_cost_cents?: number
          id?: string
          input_tokens?: number
          output_tokens?: number
          processed_chunks?: number
          processing_time_ms?: number
          reused_chunks?: number
          skipped_calls?: number
          total_chunks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_summary_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: string
          learning_project_id: string | null
          mime_type: string | null
          size_bytes: number | null
          status: string
          storage_path: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learning_project_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_project_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_learning_project_id_fkey"
            columns: ["learning_project_id"]
            isOneToOne: false
            referencedRelation: "learning_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_performance_sessions: {
        Row: {
          accuracy_percent: number
          domain: string
          exercise_id: string
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          accuracy_percent: number
          domain: string
          exercise_id: string
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          accuracy_percent?: number
          domain?: string
          exercise_id?: string
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          id: string
          key: string
          plan_id: string | null
          updated_at: string
          user_id: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          plan_id?: string | null
          updated_at?: string
          user_id?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          plan_id?: string | null
          updated_at?: string
          user_id?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_progress: {
        Row: {
          completed_at: string | null
          exercise_id: string
          id: string
          lab_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          exercise_id: string
          id?: string
          lab_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          exercise_id?: string
          id?: string
          lab_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          display_name: string | null
          family_id: string
          id: string
          member_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          family_id: string
          id?: string
          member_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          family_id?: string
          id?: string
          member_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      fixation_sessions: {
        Row: {
          accuracy_percent: number | null
          completed: boolean
          duration_seconds: number
          exercise_type: string
          id: string
          level: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          accuracy_percent?: number | null
          completed?: boolean
          duration_seconds: number
          exercise_type: string
          id?: string
          level: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          accuracy_percent?: number | null
          completed?: boolean
          duration_seconds?: number
          exercise_type?: string
          id?: string
          level?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_discovery_sessions: {
        Row: {
          completed: boolean
          events: Json
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          events: Json
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          events?: Json
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_learning_content: {
        Row: {
          created_at: string
          data: Json
          document_id: string
          id: string
          mode_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          document_id: string
          id?: string
          mode_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          document_id?: string
          id?: string
          mode_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_learning_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      image_persistence_sessions: {
        Row: {
          completed: boolean
          duration_seconds: number
          id: string
          image_used: string
          notes: string | null
          observation_response: string | null
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          duration_seconds: number
          id?: string
          image_used: string
          notes?: string | null
          observation_response?: string | null
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          duration_seconds?: number
          id?: string
          image_used?: string
          notes?: string | null
          observation_response?: string | null
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journey_baseline_diagnostics: {
        Row: {
          accuracy_percent: number
          id: string
          occurred_at: string
          raw_wpm: number
          true_baseline_wpm: number
          user_id: string
        }
        Insert: {
          accuracy_percent: number
          id?: string
          occurred_at?: string
          raw_wpm: number
          true_baseline_wpm: number
          user_id: string
        }
        Update: {
          accuracy_percent?: number
          id?: string
          occurred_at?: string
          raw_wpm?: number
          true_baseline_wpm?: number
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          focus_percent: number
          full_name: string
          id: string
          memory_percent: number
          reading_wpm: number
          whatsapp_number: string
        }
        Insert: {
          created_at?: string
          focus_percent: number
          full_name: string
          id?: string
          memory_percent: number
          reading_wpm: number
          whatsapp_number: string
        }
        Update: {
          created_at?: string
          focus_percent?: number
          full_name?: string
          id?: string
          memory_percent?: number
          reading_wpm?: number
          whatsapp_number?: string
        }
        Relationships: []
      }
      learning_asset_bundles: {
        Row: {
          chapter_order: number
          content_hash: string
          created_at: string
          data: Json
          document_id: string
          id: string
          updated_at: string
        }
        Insert: {
          chapter_order: number
          content_hash: string
          created_at?: string
          data: Json
          document_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          chapter_order?: number
          content_hash?: string
          created_at?: string
          data?: Json
          document_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_asset_bundles_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          processed_content: Json | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          processed_content?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          processed_content?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_projects: {
        Row: {
          created_at: string
          description: string | null
          family_id: string | null
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          family_id?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_projects_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          learning_project_id: string | null
          session_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          learning_project_id?: string | null
          session_type: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          learning_project_id?: string | null
          session_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_learning_project_id_fkey"
            columns: ["learning_project_id"]
            isOneToOne: false
            referencedRelation: "learning_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          content_url: string | null
          course_id: string
          created_at: string
          duration_seconds: number
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_url?: string | null
          course_id: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_url?: string | null
          course_id?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_discovery_sessions: {
        Row: {
          completed: boolean
          events: Json
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          events: Json
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          events?: Json
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_conversation_turns: {
        Row: {
          content: string
          created_at: string
          id: string
          mentor_session_id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentor_session_id: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentor_session_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_conversation_turns_mentor_session_id_fkey"
            columns: ["mentor_session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_passport_snapshots: {
        Row: {
          achievement_count: number
          growth_percent: number | null
          latest_ai_summary: string
          observation_style: string
          primary_trait: string
          updated_at: string
          user_id: string
          visual_dna_level: string
          visual_intelligence_score: number
        }
        Insert: {
          achievement_count: number
          growth_percent?: number | null
          latest_ai_summary: string
          observation_style: string
          primary_trait: string
          updated_at?: string
          user_id: string
          visual_dna_level: string
          visual_intelligence_score: number
        }
        Update: {
          achievement_count?: number
          growth_percent?: number | null
          latest_ai_summary?: string
          observation_style?: string
          primary_trait?: string
          updated_at?: string
          user_id?: string
          visual_dna_level?: string
          visual_intelligence_score?: number
        }
        Relationships: []
      }
      partner_resources: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_published: boolean
          resource_type: string
          scheduled_at: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          resource_type: string
          scheduled_at?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean
          resource_type?: string
          scheduled_at?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      persistence_challenge_sessions: {
        Row: {
          completed: boolean
          duration_seconds: number
          id: string
          image_id: string
          journal_notes: string | null
          occurred_at: string
          reflection_response: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          duration_seconds: number
          id?: string
          image_id: string
          journal_notes?: string | null
          occurred_at?: string
          reflection_response: string
          user_id: string
        }
        Update: {
          completed?: boolean
          duration_seconds?: number
          id?: string
          image_id?: string
          journal_notes?: string | null
          occurred_at?: string
          reflection_response?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          billing_interval: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          max_family_members: number | null
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          billing_interval: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          max_family_members?: number | null
          name: string
          price_cents?: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          max_family_members?: number | null
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          completed: boolean
          duration_ms: number
          exercise_id: string
          id: string
          lab_id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed: boolean
          duration_ms: number
          exercise_id: string
          id?: string
          lab_id: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          duration_ms?: number
          exercise_id?: string
          id?: string
          lab_id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          selected_reading_goal: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          selected_reading_goal?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          selected_reading_goal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qsr_reading_assessments: {
        Row: {
          completed_at: string
          document_id: string
          id: string
          overall_wpm: number
          reading_style: string
          recommendation_reason: string
          recommended_mode: string
          stage_results: Json
          user_id: string
        }
        Insert: {
          completed_at?: string
          document_id: string
          id?: string
          overall_wpm: number
          reading_style: string
          recommendation_reason: string
          recommended_mode: string
          stage_results: Json
          user_id: string
        }
        Update: {
          completed_at?: string
          document_id?: string
          id?: string
          overall_wpm?: number
          reading_style?: string
          recommendation_reason?: string
          recommended_mode?: string
          stage_results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qsr_reading_assessments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      qsr_reading_speed_samples: {
        Row: {
          document_id: string
          id: string
          mode: string
          recorded_at: string
          user_id: string
          wpm: number | null
        }
        Insert: {
          document_id: string
          id?: string
          mode: string
          recorded_at?: string
          user_id: string
          wpm?: number | null
        }
        Update: {
          document_id?: string
          id?: string
          mode?: string
          recorded_at?: string
          user_id?: string
          wpm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qsr_reading_speed_samples_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_document_analysis_cache: {
        Row: {
          ai_summary: string
          content_hash: string
          created_at: string
          feynman_challenge: Json
          hit_count: number
          keywords: string[]
          last_hit_at: string | null
          mnemonics: Json
          model_id: string
          quiz_questions: Json
          reading_text: string | null
          spider_notes: Json
          subject_lens: Json
          target_language: string
        }
        Insert: {
          ai_summary: string
          content_hash: string
          created_at?: string
          feynman_challenge: Json
          hit_count?: number
          keywords: string[]
          last_hit_at?: string | null
          mnemonics: Json
          model_id: string
          quiz_questions: Json
          reading_text?: string | null
          spider_notes: Json
          subject_lens: Json
          target_language: string
        }
        Update: {
          ai_summary?: string
          content_hash?: string
          created_at?: string
          feynman_challenge?: Json
          hit_count?: number
          keywords?: string[]
          last_hit_at?: string | null
          mnemonics?: Json
          model_id?: string
          quiz_questions?: Json
          reading_text?: string | null
          spider_notes?: Json
          subject_lens?: Json
          target_language?: string
        }
        Relationships: []
      }
      quantum_document_sessions: {
        Row: {
          correct_answers_count: number
          id: string
          occurred_at: string
          quantum_document_id: string
          total_questions_count: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_answers_count: number
          id?: string
          occurred_at?: string
          quantum_document_id: string
          total_questions_count: number
          user_id: string
          xp_earned: number
        }
        Update: {
          correct_answers_count?: number
          id?: string
          occurred_at?: string
          quantum_document_id?: string
          total_questions_count?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quantum_document_sessions_quantum_document_id_fkey"
            columns: ["quantum_document_id"]
            isOneToOne: false
            referencedRelation: "quantum_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_documents: {
        Row: {
          ai_summary: string | null
          created_at: string
          feynman_challenge: Json | null
          id: string
          keywords: string[] | null
          mnemonics: Json | null
          quiz_questions: Json | null
          raw_text: string
          reading_text: string | null
          spider_notes: Json | null
          subject_lens: Json | null
          target_language: string
          title: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          feynman_challenge?: Json | null
          id?: string
          keywords?: string[] | null
          mnemonics?: Json | null
          quiz_questions?: Json | null
          raw_text: string
          reading_text?: string | null
          spider_notes?: Json | null
          subject_lens?: Json | null
          target_language?: string
          title: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          feynman_challenge?: Json | null
          id?: string
          keywords?: string[] | null
          mnemonics?: Json | null
          quiz_questions?: Json | null
          raw_text?: string
          reading_text?: string | null
          spider_notes?: Json | null
          subject_lens?: Json | null
          target_language?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_discovery_sessions: {
        Row: {
          completed: boolean
          events: Json
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          events: Json
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          events?: Json
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_intelligence_sessions: {
        Row: {
          accuracy_percent: number
          attention_level: string | null
          attention_score: number
          category: string
          completed: boolean
          completion_percent: number
          comprehension_percent: number
          difficulty: string
          focus_mode: boolean
          hints_used: number
          id: string
          mode: string | null
          occurred_at: string
          passage_id: string
          pause_count: number
          reading_intelligence_score: number
          reading_time_ms: number
          resume_count: number
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy_percent: number
          attention_level?: string | null
          attention_score?: number
          category: string
          completed?: boolean
          completion_percent?: number
          comprehension_percent: number
          difficulty: string
          focus_mode?: boolean
          hints_used?: number
          id?: string
          mode?: string | null
          occurred_at?: string
          passage_id: string
          pause_count?: number
          reading_intelligence_score: number
          reading_time_ms: number
          resume_count?: number
          user_id: string
          wpm: number
        }
        Update: {
          accuracy_percent?: number
          attention_level?: string | null
          attention_score?: number
          category?: string
          completed?: boolean
          completion_percent?: number
          comprehension_percent?: number
          difficulty?: string
          focus_mode?: boolean
          hints_used?: number
          id?: string
          mode?: string | null
          occurred_at?: string
          passage_id?: string
          pause_count?: number
          reading_intelligence_score?: number
          reading_time_ms?: number
          resume_count?: number
          user_id?: string
          wpm?: number
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      school_ai_usage_log: {
        Row: {
          id: string
          occurred_at: string
          quantum_document_id: string | null
          school_id: string
          user_id: string
        }
        Insert: {
          id?: string
          occurred_at?: string
          quantum_document_id?: string | null
          school_id: string
          user_id: string
        }
        Update: {
          id?: string
          occurred_at?: string
          quantum_document_id?: string | null
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_ai_usage_log_quantum_document_id_fkey"
            columns: ["quantum_document_id"]
            isOneToOne: false
            referencedRelation: "quantum_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_ai_usage_log_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_members: {
        Row: {
          created_at: string
          id: string
          role: string
          roll_number: string | null
          school_id: string
          status: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          roll_number?: string | null
          school_id: string
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          roll_number?: string | null
          school_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          logo_url: string | null
          max_students: number
          monthly_ai_quota: number
          name: string
          owner_id: string
          slug: string
          status: string
          tier: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          logo_url?: string | null
          max_students?: number
          monthly_ai_quota?: number
          name: string
          owner_id: string
          slug: string
          status?: string
          tier?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          logo_url?: string | null
          max_students?: number
          monthly_ai_quota?: number
          name?: string
          owner_id?: string
          slug?: string
          status?: string
          tier?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      smart_notes: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          document_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_notes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          family_id: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_id?: string | null
          id?: string
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          family_id?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tratak_mission_sessions: {
        Row: {
          analyzer_data: Json | null
          completed: boolean
          duration_seconds: number
          id: string
          level_number: number | null
          mission_id: string
          observation_notes: string | null
          occurred_at: string
          reflection_response: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          analyzer_data?: Json | null
          completed?: boolean
          duration_seconds: number
          id?: string
          level_number?: number | null
          mission_id: string
          observation_notes?: string | null
          occurred_at?: string
          reflection_response?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          analyzer_data?: Json | null
          completed?: boolean
          duration_seconds?: number
          id?: string
          level_number?: number | null
          mission_id?: string
          observation_notes?: string | null
          occurred_at?: string
          reflection_response?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      universal_learning_objects: {
        Row: {
          created_at: string
          data: Json
          document_id: string
          id: string
          ulo_id: string
          ulo_version_revision: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          document_id: string
          id?: string
          ulo_id: string
          ulo_version_revision: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          document_id?: string
          id?: string
          ulo_id?: string
          ulo_version_revision?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "universal_learning_objects_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      visual_preparation_sessions: {
        Row: {
          completed: boolean
          duration_seconds: number
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          duration_seconds: number
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          duration_seconds?: number
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_active_family_member: {
        Args: { p_family_id: string }
        Returns: boolean
      }
      is_active_school_member: {
        Args: { p_school_id: string }
        Returns: boolean
      }
      is_class_student: { Args: { p_class_id: string }; Returns: boolean }
      is_class_teacher: { Args: { p_class_id: string }; Returns: boolean }
      is_franchise_partner: { Args: never; Returns: boolean }
      is_school_admin: { Args: { p_school_id: string }; Returns: boolean }
      is_school_admin_for_class: {
        Args: { p_class_id: string }
        Returns: boolean
      }
      shares_family_with: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      shares_school_with: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      verify_certificate: {
        Args: { p_token: string }
        Returns: {
          certificate_id: string
          course_id: string
          course_slug: string
          course_title: string
          issued_at: string
          student_name: string
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
