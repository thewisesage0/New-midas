import { supabase } from "@/lib/supabase";
import type { Manhwa, ManhwaWithRelations, Chapter, Panel, Download, Comment, CommentWithProfile, Review, ReviewWithProfile, AdminStats } from "@/types/database";

// ─── MANHWA SERVICE ──────────────────────────────────────────

export const manhwaService = {

  async getAll(): Promise<ManhwaWithRelations[]> {
    const { data, error } = await supabase
      .from("manhwa")
      .select(`
        *,
        manhwa_genres(genres(id, name)),
        manhwa_tags(tags(id, name))
      `)
      .order("views", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(normalizeRelations);
  },

  async getById(id: string): Promise<ManhwaWithRelations | null> {
    const { data, error } = await supabase
      .from("manhwa")
      .select(`
        *,
        manhwa_genres(genres(id, name)),
        manhwa_tags(tags(id, name))
      `)
      .eq("id", id)
      .single();
    if (error) return null;
    return normalizeRelations(data);
  },

  async search(query: string): Promise<ManhwaWithRelations[]> {
    const { data, error } = await supabase.rpc("search_manhwa", { query });
    if (error) throw error;
    // Re-fetch with relations for clean shape
    if (!data?.length) return [];
    const ids = data.map((m: Manhwa) => m.id);
    const { data: full, error: err2 } = await supabase
      .from("manhwa")
      .select(`*, manhwa_genres(genres(id, name)), manhwa_tags(tags(id, name))`)
      .in("id", ids);
    if (err2) throw err2;
    return (full ?? []).map(normalizeRelations);
  },

  async create(payload: {
    title: string;
    status: Manhwa["status"];
    blurb?: string;
    cover_url?: string;
    banner_url?: string;
    year?: number;
    genres: string[];
    tags: string[];
  }): Promise<Manhwa> {
    const { genres, tags, ...rest } = payload;

    const { data, error } = await supabase
      .from("manhwa")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;

    // Attach genres
    if (genres.length) {
      const genreRows = await resolveGenreIds(genres);
      await supabase.from("manhwa_genres").insert(genreRows.map(gid => ({ manhwa_id: data.id, genre_id: gid })));
    }
    // Attach tags
    if (tags.length) {
      const tagRows = await resolveTagIds(tags);
      await supabase.from("manhwa_tags").insert(tagRows.map(tid => ({ manhwa_id: data.id, tag_id: tid })));
    }

    return data;
  },

  async update(id: string, patch: Partial<Omit<Manhwa, "id">> & { genres?: string[]; tags?: string[] }) {
    const { genres, tags, ...rest } = patch;

    if (Object.keys(rest).length) {
      const { error } = await supabase.from("manhwa").update(rest).eq("id", id);
      if (error) throw error;
    }

    if (genres) {
      await supabase.from("manhwa_genres").delete().eq("manhwa_id", id);
      const genreIds = await resolveGenreIds(genres);
      await supabase.from("manhwa_genres").insert(genreIds.map(gid => ({ manhwa_id: id, genre_id: gid })));
    }
    if (tags) {
      await supabase.from("manhwa_tags").delete().eq("manhwa_id", id);
      const tagIds = await resolveTagIds(tags);
      await supabase.from("manhwa_tags").insert(tagIds.map(tid => ({ manhwa_id: id, tag_id: tid })));
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("manhwa").delete().eq("id", id);
    if (error) throw error;
  },

  async incrementView(id: string) {
    const { error } = await supabase.rpc("increment_manhwa_views", { manhwa_id: id });
    if (error) {
      // Fallback: log an analytics event instead
      await supabase.from("analytics").insert({ manhwa_id: id, event: "manhwa_view" });
    }
  },

  async uploadCover(manhwaId: string, file: File, bucket: "covers" | "banners"): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${manhwaId}/${bucket === "banners" ? "banner" : "cover"}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};

// ─── CHAPTER SERVICE ─────────────────────────────────────────

export const chapterService = {

  async getByManhwa(manhwaId: string): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("manhwa_id", manhwaId)
      .order("number", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Chapter | null> {
    const { data, error } = await supabase.from("chapters").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  },

  async getLatest(limit = 10): Promise<(Chapter & { manhwa: Pick<Manhwa, "id" | "title" | "cover_url"> })[]> {
    const { data, error } = await supabase
      .from("chapters")
      .select("*, manhwa(id, title, cover_url)")
      .order("release_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as never;
  },

  async create(payload: {
    manhwa_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    release_date?: string;
    panels: { image_url: string; position: number }[];
  }): Promise<Chapter> {
    const { panels, ...rest } = payload;

    // Get next chapter number
    const { data: existing } = await supabase
      .from("chapters")
      .select("number")
      .eq("manhwa_id", rest.manhwa_id)
      .order("number", { ascending: false })
      .limit(1);
    const number = existing?.length ? (existing[0].number + 1) : 1;

    const { data, error } = await supabase
      .from("chapters")
      .insert({ ...rest, number, release_date: rest.release_date ?? new Date().toISOString().slice(0, 10) })
      .select()
      .single();
    if (error) throw error;

    if (panels.length) {
      await supabase.from("panels").insert(panels.map(p => ({ chapter_id: data.id, ...p })));
    }

    return data;
  },

  async update(id: string, patch: Partial<Chapter>) {
    const { error } = await supabase.from("chapters").update(patch).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) throw error;
  },

  async trackView(chapterId: string, manhwaId: string) {
    await supabase.from("analytics").insert({ chapter_id: chapterId, manhwa_id: manhwaId, event: "chapter_view" });
    const { error } = await supabase.rpc("increment_chapter_views", { chapter_id: chapterId });
    if (error) {
      // Fallback: manual increment if the RPC function is unavailable
      const { data } = await supabase.from("chapters").select("views").eq("id", chapterId).single();
      if (data) {
        await supabase.from("chapters").update({ views: (data.views ?? 0) + 1 }).eq("id", chapterId);
      }
    }
  },
};

// ─── PANEL SERVICE ───────────────────────────────────────────

export const panelService = {

  async getByChapter(chapterId: string): Promise<Panel[]> {
    const { data, error } = await supabase
      .from("panels")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async uploadPanel(chapterId: string, file: File, position: number): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${chapterId}/${position.toString().padStart(4, "0")}.${ext}`;
    const { error } = await supabase.storage.from("chapter-panels").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("chapter-panels").getPublicUrl(path);
    return data.publicUrl;
  },

  async addPanel(chapterId: string, imageUrl: string, position: number): Promise<Panel> {
    const { data, error } = await supabase
      .from("panels")
      .insert({ chapter_id: chapterId, image_url: imageUrl, position })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePanel(id: string) {
    const { error } = await supabase.from("panels").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── DOWNLOAD SERVICE ────────────────────────────────────────

export const downloadService = {

  async getByManhwa(manhwaId: string): Promise<Download[]> {
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .eq("manhwa_id", manhwaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: Omit<Download, "id" | "download_count" | "created_at">): Promise<Download> {
    const { data, error } = await supabase.from("downloads").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("downloads").delete().eq("id", id);
    if (error) throw error;
  },

  async trackDownload(id: string) {
    await supabase.from("analytics").insert({ event: "download", metadata: { download_id: id } });
  },

  async uploadFile(manhwaId: string, file: File, format: "PDF" | "EPUB"): Promise<string> {
    const path = `${manhwaId}/${format.toLowerCase()}-${Date.now()}.${format.toLowerCase()}`;
    const { error } = await supabase.storage.from("downloads").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("downloads").getPublicUrl(path);
    return data.publicUrl;
  },
};

// ─── LIBRARY SERVICE ─────────────────────────────────────────

export const libraryService = {

  async getSaved(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("library")
      .select("manhwa_id")
      .eq("user_id", userId);
    if (error) return [];
    return (data ?? []).map(r => r.manhwa_id);
  },

  async toggle(userId: string, manhwaId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from("library")
      .select("id")
      .eq("user_id", userId)
      .eq("manhwa_id", manhwaId)
      .single();

    if (existing) {
      await supabase.from("library").delete().eq("user_id", userId).eq("manhwa_id", manhwaId);
      return false; // removed
    } else {
      await supabase.from("library").insert({ user_id: userId, manhwa_id: manhwaId });
      return true; // added
    }
  },
};

// ─── READING PROGRESS SERVICE ────────────────────────────────

export const progressService = {

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*, chapters(id, number, title, manhwa_id)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async save(userId: string, manhwaId: string, chapterId: string, pct: number) {
    const { error } = await supabase
      .from("reading_progress")
      .upsert(
        { user_id: userId, manhwa_id: manhwaId, chapter_id: chapterId, pct, updated_at: new Date().toISOString() },
        { onConflict: "user_id,manhwa_id" }
      );
    if (error) throw error;
  },
};

// ─── COMMENT SERVICE ─────────────────────────────────────────

export const commentService = {

  async getByManhwa(manhwaId: string): Promise<CommentWithProfile[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(id, display_name, avatar_url, role)")
      .eq("manhwa_id", manhwaId)
      .eq("deleted", false)
      .is("chapter_id", null)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CommentWithProfile[];
  },

  async getByChapter(chapterId: string): Promise<CommentWithProfile[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(id, display_name, avatar_url, role)")
      .eq("chapter_id", chapterId)
      .eq("deleted", false)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CommentWithProfile[];
  },

  async getAll(): Promise<CommentWithProfile[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(id, display_name, avatar_url, role), manhwa(title)")
      .eq("deleted", false)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CommentWithProfile[];
  },

  async create(payload: {
    manhwa_id: string;
    chapter_id?: string;
    user_id: string;
    body: string;
    parent_id?: string;
  }): Promise<Comment> {
    const { data, error } = await supabase.from("comments").insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, body: string) {
    const { error } = await supabase
      .from("comments")
      .update({ body, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    // Soft delete
    const { error } = await supabase
      .from("comments")
      .update({ deleted: true })
      .eq("id", id);
    if (error) throw error;
  },

  async pin(id: string, pinned: boolean) {
    const { error } = await supabase.from("comments").update({ pinned }).eq("id", id);
    if (error) throw error;
  },

  async toggleLike(commentId: string, userId: string): Promise<"liked" | "unliked"> {
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId);
      return "unliked";
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId });
      return "liked";
    }
  },
};

// ─── REVIEW SERVICE ──────────────────────────────────────────

export const reviewService = {

  async getByManhwa(manhwaId: string): Promise<ReviewWithProfile[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles(id, display_name, avatar_url)")
      .eq("manhwa_id", manhwaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ReviewWithProfile[];
  },

  async upsert(payload: { manhwa_id: string; user_id: string; rating: number; body?: string }) {
    const { data, error } = await supabase
      .from("reviews")
      .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "manhwa_id,user_id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  },
};

// ─── ADMIN SERVICE ───────────────────────────────────────────

export const adminService = {

  async getStats(): Promise<AdminStats> {
    const { data, error } = await supabase.from("admin_stats").select("*").single();
    if (error) throw error;
    return data as AdminStats;
  },

  async getTopManhwa(limit = 5): Promise<Manhwa[]> {
    const { data, error } = await supabase
      .from("manhwa")
      .select("*")
      .order("views", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getRecentUploads(limit = 5): Promise<Chapter[]> {
    const { data, error } = await supabase
      .from("chapters")
      .select("*, manhwa(title)")
      .order("release_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as never;
  },

  async getViewsTimeline(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase
      .from("analytics")
      .select("created_at, event")
      .in("event", ["chapter_view", "manhwa_view"])
      .gte("created_at", since.toISOString());
    if (error) throw error;
    return data ?? [];
  },
};

// ─── HELPERS ─────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRelations(m: any): ManhwaWithRelations {
  return {
    ...m,
    genres: (m.manhwa_genres ?? []).map((r: { genres: { id: string; name: string } }) => r.genres).filter(Boolean),
    tags: (m.manhwa_tags ?? []).map((r: { tags: { id: string; name: string } }) => r.tags).filter(Boolean),
  };
}

async function resolveGenreIds(names: string[]): Promise<string[]> {
  const { data } = await supabase.from("genres").select("id, name").in("name", names);
  return (data ?? []).map(g => g.id);
}

async function resolveTagIds(names: string[]): Promise<string[]> {
  // Upsert tags that don't exist
  for (const name of names) {
    await supabase.from("tags").upsert({ name }, { onConflict: "name", ignoreDuplicates: true });
  }
  const { data } = await supabase.from("tags").select("id, name").in("name", names);
  return (data ?? []).map(t => t.id);
}
