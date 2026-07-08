// ============================================================
// DATABASE TYPES — generated from schema
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = "reader" | "admin";
export type ManhwaStatus = "Ongoing" | "Completed" | "Hiatus";
export type DownloadFormat = "PDF" | "EPUB";
export type ReportStatus = "pending" | "reviewed" | "dismissed";
export type ReportReason = "spam" | "harassment" | "spoiler" | "inappropriate" | "other";
export type ModerationAction = "warn" | "delete" | "ban";

// ─── TABLE ROW TYPES ────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  notifications_new_chapter: boolean;
  notifications_comments: boolean;
  reading_mode: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

export type Genre = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Manhwa = {
  id: string;
  slug: string | null;
  title: string;
  cover_url: string | null;
  banner_url: string | null;
  status: ManhwaStatus;
  blurb: string | null;
  year: number | null;
  views: number;
  rating: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ManhwaWithRelations = Manhwa & {
  genres: Genre[];
  tags: Tag[];
};

export type Chapter = {
  id: string;
  manhwa_id: string;
  number: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  release_date: string;
  views: number;
  created_at: string;
  updated_at: string;
};

export type Panel = {
  id: string;
  chapter_id: string;
  position: number;
  image_url: string;
  created_at: string;
};

export type Download = {
  id: string;
  manhwa_id: string;
  name: string;
  format: DownloadFormat;
  file_url: string;
  size_bytes: number | null;
  download_count: number;
  created_at: string;
};

export type Library = {
  id: string;
  user_id: string;
  manhwa_id: string;
  saved_at: string;
};

export type ReadingProgress = {
  id: string;
  user_id: string;
  manhwa_id: string;
  chapter_id: string;
  pct: number;
  updated_at: string;
};

export type Comment = {
  id: string;
  manhwa_id: string;
  chapter_id: string | null;
  user_id: string;
  parent_id: string | null;
  body: string;
  likes: number;
  pinned: boolean;
  is_author: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string | null;
};

export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "id" | "display_name" | "avatar_url" | "role">;
};

export type Review = {
  id: string;
  manhwa_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "id" | "display_name" | "avatar_url">;
};

export type Analytics = {
  id: string;
  manhwa_id: string | null;
  chapter_id: string | null;
  user_id: string | null;
  event: string;
  metadata: Json | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  comment_id: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type AdminStats = {
  total_readers: number;
  total_manhwa: number;
  total_chapters: number;
  total_comments: number;
  total_views: number;
  total_downloads: number;
};

// ─── DATABASE SCHEMA TYPE ───────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
      user_settings: { Row: UserSettings; Insert: Partial<UserSettings> & { user_id: string }; Update: Partial<UserSettings> };
      genres: { Row: Genre; Insert: Omit<Genre, "id">; Update: Partial<Genre> };
      tags: { Row: Tag; Insert: Omit<Tag, "id">; Update: Partial<Tag> };
      manhwa: { Row: Manhwa; Insert: Omit<Manhwa, "id" | "views" | "rating" | "created_at" | "updated_at"> & Partial<Pick<Manhwa, "id" | "views" | "rating">>; Update: Partial<Manhwa> };
      manhwa_genres: { Row: { manhwa_id: string; genre_id: string }; Insert: { manhwa_id: string; genre_id: string }; Update: never };
      manhwa_tags: { Row: { manhwa_id: string; tag_id: string }; Insert: { manhwa_id: string; tag_id: string }; Update: never };
      chapters: { Row: Chapter; Insert: Omit<Chapter, "id" | "views" | "created_at" | "updated_at"> & Partial<Pick<Chapter, "id" | "views">>; Update: Partial<Chapter> };
      panels: { Row: Panel; Insert: Omit<Panel, "id" | "created_at">; Update: Partial<Panel> };
      downloads: { Row: Download; Insert: Omit<Download, "id" | "download_count" | "created_at">; Update: Partial<Download> };
      library: { Row: Library; Insert: Omit<Library, "id" | "saved_at">; Update: never };
      reading_progress: { Row: ReadingProgress; Insert: Omit<ReadingProgress, "id" | "updated_at">; Update: Partial<ReadingProgress> };
      comments: { Row: Comment; Insert: Omit<Comment, "id" | "likes" | "pinned" | "is_author" | "deleted" | "created_at" | "updated_at">; Update: Partial<Comment> };
      comment_likes: { Row: { comment_id: string; user_id: string }; Insert: { comment_id: string; user_id: string }; Update: never };
      reviews: { Row: Review; Insert: Omit<Review, "id" | "created_at" | "updated_at">; Update: Partial<Review> };
      analytics: { Row: Analytics; Insert: Omit<Analytics, "id" | "created_at">; Update: never };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "read" | "created_at">; Update: Partial<Notification> };
      reports: { Row: Report; Insert: Omit<Report, "id" | "status" | "resolved_by" | "resolved_at" | "created_at">; Update: Partial<Report> };
    };
    Views: {
      admin_stats: { Row: AdminStats };
    };
    Functions: {
      search_manhwa: { Args: { query: string }; Returns: Manhwa[] };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      manhwa_status: ManhwaStatus;
      download_format: DownloadFormat;
    };
  };
};
