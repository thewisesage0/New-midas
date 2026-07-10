// ============================================================
// AUTO-GENERATED — do not edit by hand.
// Generated from the live "Midas pen" Supabase project schema.
// Regenerate with: supabase gen types typescript --project-id yzhnejcbqlspcgduobiy
// ============================================================

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
  public: {
    Tables: {
      analytics: {
        Row: {
          chapter_id: string | null
          created_at: string
          event: string
          id: string
          manhwa_id: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          event: string
          id?: string
          manhwa_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          event?: string
          id?: string
          manhwa_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manhwa_id: string
          number: number
          release_date: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manhwa_id: string
          number: number
          release_date?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manhwa_id?: string
          number?: number
          release_date?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapters_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          chapter_id: string | null
          created_at: string
          deleted: boolean
          id: string
          is_author: boolean
          likes: number
          manhwa_id: string
          parent_id: string | null
          pinned: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          chapter_id?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          is_author?: boolean
          likes?: number
          manhwa_id: string
          parent_id?: string | null
          pinned?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          chapter_id?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          is_author?: boolean
          likes?: number
          manhwa_id?: string
          parent_id?: string | null
          pinned?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          created_at: string
          download_count: number | null
          file_url: string
          format: Database["public"]["Enums"]["download_format"]
          id: string
          manhwa_id: string
          name: string
          size_bytes: number | null
        }
        Insert: {
          created_at?: string
          download_count?: number | null
          file_url: string
          format: Database["public"]["Enums"]["download_format"]
          id?: string
          manhwa_id: string
          name: string
          size_bytes?: number | null
        }
        Update: {
          created_at?: string
          download_count?: number | null
          file_url?: string
          format?: Database["public"]["Enums"]["download_format"]
          id?: string
          manhwa_id?: string
          name?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "downloads_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      library: {
        Row: {
          id: string
          manhwa_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          manhwa_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          manhwa_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manhwa: {
        Row: {
          author_id: string | null
          banner_url: string | null
          blurb: string | null
          cover_url: string | null
          created_at: string
          id: string
          rating: number | null
          slug: string | null
          status: Database["public"]["Enums"]["manhwa_status"]
          title: string
          updated_at: string
          views: number
          year: number | null
        }
        Insert: {
          author_id?: string | null
          banner_url?: string | null
          blurb?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["manhwa_status"]
          title: string
          updated_at?: string
          views?: number
          year?: number | null
        }
        Update: {
          author_id?: string | null
          banner_url?: string | null
          blurb?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["manhwa_status"]
          title?: string
          updated_at?: string
          views?: number
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manhwa_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manhwa_genres: {
        Row: {
          genre_id: string
          manhwa_id: string
        }
        Insert: {
          genre_id: string
          manhwa_id: string
        }
        Update: {
          genre_id?: string
          manhwa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manhwa_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manhwa_genres_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
        ]
      }
      manhwa_tags: {
        Row: {
          manhwa_id: string
          tag_id: string
        }
        Insert: {
          manhwa_id: string
          tag_id: string
        }
        Update: {
          manhwa_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manhwa_tags_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manhwa_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_log: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action"]
          admin_id: string
          comment_id: string | null
          created_at: string
          id: string
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action"]
          admin_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action"]
          admin_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_log_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      panels: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          image_url: string
          position: number
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          image_url: string
          position: number
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          image_url?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "panels_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          chapter_id: string
          id: string
          manhwa_id: string
          pct: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          id?: string
          manhwa_id: string
          pct?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          id?: string
          manhwa_id?: string
          pct?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          comment_id: string | null
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          manhwa_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          manhwa_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          manhwa_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_manhwa_id_fkey"
            columns: ["manhwa_id"]
            isOneToOne: false
            referencedRelation: "manhwa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notifications_comments: boolean | null
          notifications_new_chapter: boolean | null
          reading_mode: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_comments?: boolean | null
          notifications_new_chapter?: boolean | null
          reading_mode?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_comments?: boolean | null
          notifications_new_chapter?: boolean | null
          reading_mode?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_stats: {
        Row: {
          total_chapters: number | null
          total_comments: number | null
          total_downloads: number | null
          total_manhwa: number | null
          total_readers: number | null
          total_views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_chapter_views: {
        Args: { chapter_id: string }
        Returns: undefined
      }
      increment_download_count: {
        Args: { download_id: string }
        Returns: undefined
      }
      increment_manhwa_views: {
        Args: { manhwa_id: string }
        Returns: undefined
      }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      search_manhwa: {
        Args: { query: string }
        Returns: {
          author_id: string | null
          banner_url: string | null
          blurb: string | null
          cover_url: string | null
          created_at: string
          id: string
          rating: number | null
          slug: string | null
          status: Database["public"]["Enums"]["manhwa_status"]
          title: string
          updated_at: string
          views: number
          year: number | null
        }[]
      }
      show_limit: { Args: Record<string, never>; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      download_format: "PDF" | "EPUB"
      manhwa_status: "Ongoing" | "Completed" | "Hiatus"
      moderation_action: "warn" | "delete" | "ban"
      report_reason:
        | "spam"
        | "harassment"
        | "spoiler"
        | "inappropriate"
        | "other"
      report_status: "pending" | "reviewed" | "dismissed"
      user_role: "reader" | "admin"
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
      download_format: ["PDF", "EPUB"],
      manhwa_status: ["Ongoing", "Completed", "Hiatus"],
      moderation_action: ["warn", "delete", "ban"],
      report_reason: [
        "spam",
        "harassment",
        "spoiler",
        "inappropriate",
        "other",
      ],
      report_status: ["pending", "reviewed", "dismissed"],
      user_role: ["reader", "admin"],
    },
  },
} as const
