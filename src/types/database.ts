// ============================================================
// DATABASE TYPES — named aliases over the generated schema
// The real source of truth is database.generated.ts (pulled
// directly from the "Midas pen" Supabase project). This file
// just gives every table/enum a friendly name so the rest of
// the app doesn't need to change.
// ============================================================

import type { Database, Tables, Enums } from "./database.generated";

export type { Database, Json } from "./database.generated";

// ─── ENUMS ──────────────────────────────────────────────────

export type UserRole = Enums<"user_role">;
export type ManhwaStatus = Enums<"manhwa_status">;
export type DownloadFormat = Enums<"download_format">;
export type ReportStatus = Enums<"report_status">;
export type ReportReason = Enums<"report_reason">;
export type ModerationAction = Enums<"moderation_action">;

// ─── TABLE ROW TYPES ────────────────────────────────────────

export type Profile = Tables<"profiles">;
export type UserSettings = Tables<"user_settings">;
export type Genre = Tables<"genres">;
export type Tag = Tables<"tags">;
export type Manhwa = Tables<"manhwa">;
export type Chapter = Tables<"chapters">;
export type Panel = Tables<"panels">;
export type Download = Tables<"downloads">;
export type Library = Tables<"library">;
export type ReadingProgress = Tables<"reading_progress">;
export type Comment = Tables<"comments">;
export type Review = Tables<"reviews">;
export type Analytics = Tables<"analytics">;
export type Notification = Tables<"notifications">;
export type Report = Tables<"reports">;
export type AdminStats = Tables<"admin_stats">;

// ─── COMPOSED / JOINED TYPES ────────────────────────────────

export type ManhwaWithRelations = Manhwa & {
  genres: Genre[];
  tags: Tag[];
};

export type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "id" | "display_name" | "avatar_url" | "role">;
};

export type ReviewWithProfile = Review & {
  profiles: Pick<Profile, "id" | "display_name" | "avatar_url">;
};
