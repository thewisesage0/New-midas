import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  manhwaService,
  chapterService,
  panelService,
  commentService,
  reviewService,
  libraryService,
  progressService,
  downloadService,
  adminService,
} from "@/services/manhwa.service";
import type { Comment, Review } from "@/types/database";

// ─── QUERY KEYS ──────────────────────────────────────────────

export const QK = {
  manhwaAll: ["manhwa"] as const,
  manhwaById: (id: string) => ["manhwa", id] as const,
  manhwaSearch: (q: string) => ["manhwa", "search", q] as const,
  chaptersByManhwa: (mid: string) => ["chapters", mid] as const,
  chapterById: (id: string) => ["chapter", id] as const,
  chaptersLatest: ["chapters", "latest"] as const,
  panelsByChapter: (cid: string) => ["panels", cid] as const,
  commentsByManhwa: (mid: string) => ["comments", "manhwa", mid] as const,
  commentsByChapter: (cid: string) => ["comments", "chapter", cid] as const,
  commentsAll: ["comments", "all"] as const,
  reviewsByManhwa: (mid: string) => ["reviews", mid] as const,
  library: (uid: string) => ["library", uid] as const,
  progress: (uid: string) => ["progress", uid] as const,
  downloadsByManhwa: (mid: string) => ["downloads", mid] as const,
  adminStats: ["admin", "stats"] as const,
  adminTopManhwa: ["admin", "top-manhwa"] as const,
  adminRecentUploads: ["admin", "recent-uploads"] as const,
  adminTimeline: ["admin", "timeline"] as const,
} as const;

// ─── MANHWA HOOKS ────────────────────────────────────────────

export function useManhwaList() {
  return useQuery({
    queryKey: QK.manhwaAll,
    queryFn: () => manhwaService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useManhwaById(id: string | undefined) {
  return useQuery({
    queryKey: QK.manhwaById(id ?? ""),
    queryFn: () => manhwaService.getById(id!),
    enabled: !!id,
  });
}

export function useManhwaSearch(query: string) {
  return useQuery({
    queryKey: QK.manhwaSearch(query),
    queryFn: () => manhwaService.search(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 30,
  });
}

export function useCreateManhwa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: manhwaService.create.bind(manhwaService),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.manhwaAll }),
  });
}

export function useUpdateManhwa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof manhwaService.update>[1] }) =>
      manhwaService.update(id, patch),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: QK.manhwaAll });
      qc.invalidateQueries({ queryKey: QK.manhwaById(id) });
    },
  });
}

export function useDeleteManhwa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manhwaService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.manhwaAll }),
  });
}

// ─── CHAPTER HOOKS ───────────────────────────────────────────

export function useChapters(manhwaId: string | undefined) {
  return useQuery({
    queryKey: QK.chaptersByManhwa(manhwaId ?? ""),
    queryFn: () => chapterService.getByManhwa(manhwaId!),
    enabled: !!manhwaId,
  });
}

export function useChapterById(id: string | undefined) {
  return useQuery({
    queryKey: QK.chapterById(id ?? ""),
    queryFn: () => chapterService.getById(id!),
    enabled: !!id,
  });
}

export function useLatestChapters(limit = 10) {
  return useQuery({
    queryKey: [...QK.chaptersLatest, limit],
    queryFn: () => chapterService.getLatest(limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof chapterService.create>[0]) => chapterService.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: QK.chaptersByManhwa(vars.manhwa_id) });
      qc.invalidateQueries({ queryKey: QK.chaptersLatest });
    },
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof chapterService.update>[1] }) =>
      chapterService.update(id, patch),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: QK.chapterById(id) });
    },
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, manhwaId }: { id: string; manhwaId: string }) => chapterService.delete(id),
    onSuccess: (_d, { manhwaId }) => {
      qc.invalidateQueries({ queryKey: QK.chaptersByManhwa(manhwaId) });
    },
  });
}

export function useTrackView() {
  return useMutation({
    mutationFn: ({ chapterId, manhwaId }: { chapterId: string; manhwaId: string }) =>
      chapterService.trackView(chapterId, manhwaId),
  });
}

// ─── PANEL HOOKS ─────────────────────────────────────────────

export function usePanels(chapterId: string | undefined) {
  return useQuery({
    queryKey: QK.panelsByChapter(chapterId ?? ""),
    queryFn: () => panelService.getByChapter(chapterId!),
    enabled: !!chapterId,
    staleTime: Infinity, // panels rarely change
  });
}

// ─── COMMENT HOOKS ───────────────────────────────────────────

export function useCommentsByManhwa(manhwaId: string | undefined) {
  return useQuery({
    queryKey: QK.commentsByManhwa(manhwaId ?? ""),
    queryFn: () => commentService.getByManhwa(manhwaId!),
    enabled: !!manhwaId,
  });
}

export function useCommentsByChapter(chapterId: string | undefined) {
  return useQuery({
    queryKey: QK.commentsByChapter(chapterId ?? ""),
    queryFn: () => commentService.getByChapter(chapterId!),
    enabled: !!chapterId,
  });
}

export function useAllComments() {
  return useQuery({
    queryKey: QK.commentsAll,
    queryFn: () => commentService.getAll(),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof commentService.create>[0]) => commentService.create(payload),
    onSuccess: (_d, vars) => {
      if (vars.chapter_id) qc.invalidateQueries({ queryKey: QK.commentsByChapter(vars.chapter_id) });
      else qc.invalidateQueries({ queryKey: QK.commentsByManhwa(vars.manhwa_id) });
      qc.invalidateQueries({ queryKey: QK.commentsAll });
    },
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => commentService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function usePinComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => commentService.pin(id, pinned),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

export function useLikeComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, userId }: { commentId: string; userId: string }) =>
      commentService.toggleLike(commentId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments"] }),
  });
}

// ─── REVIEW HOOKS ────────────────────────────────────────────

export function useReviews(manhwaId: string | undefined) {
  return useQuery({
    queryKey: QK.reviewsByManhwa(manhwaId ?? ""),
    queryFn: () => reviewService.getByManhwa(manhwaId!),
    enabled: !!manhwaId,
  });
}

export function useUpsertReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof reviewService.upsert>[0]) => reviewService.upsert(payload),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: QK.reviewsByManhwa(vars.manhwa_id) }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, manhwaId }: { id: string; manhwaId: string }) => reviewService.delete(id),
    onSuccess: (_d, { manhwaId }) => qc.invalidateQueries({ queryKey: QK.reviewsByManhwa(manhwaId) }),
  });
}

// ─── LIBRARY HOOKS ───────────────────────────────────────────

export function useLibrary(userId: string | undefined) {
  return useQuery({
    queryKey: QK.library(userId ?? ""),
    queryFn: () => libraryService.getSaved(userId!),
    enabled: !!userId,
  });
}

export function useToggleLibrary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, manhwaId }: { userId: string; manhwaId: string }) =>
      libraryService.toggle(userId, manhwaId),
    onSuccess: (_d, { userId }) => qc.invalidateQueries({ queryKey: QK.library(userId) }),
  });
}

// ─── READING PROGRESS HOOKS ──────────────────────────────────

export function useReadingProgress(userId: string | undefined) {
  return useQuery({
    queryKey: QK.progress(userId ?? ""),
    queryFn: () => progressService.getAll(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useSaveProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, manhwaId, chapterId, pct }: { userId: string; manhwaId: string; chapterId: string; pct: number }) =>
      progressService.save(userId, manhwaId, chapterId, pct),
    onSuccess: (_d, { userId }) => qc.invalidateQueries({ queryKey: QK.progress(userId) }),
  });
}

// ─── DOWNLOAD HOOKS ──────────────────────────────────────────

export function useDownloads(manhwaId: string | undefined) {
  return useQuery({
    queryKey: QK.downloadsByManhwa(manhwaId ?? ""),
    queryFn: () => downloadService.getByManhwa(manhwaId!),
    enabled: !!manhwaId,
  });
}

export function useAddDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof downloadService.create>[0]) => downloadService.create(payload),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: QK.downloadsByManhwa(vars.manhwa_id) }),
  });
}

// ─── ADMIN HOOKS ─────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: QK.adminStats,
    queryFn: () => adminService.getStats(),
    staleTime: 1000 * 60,
  });
}

export function useAdminTopManhwa() {
  return useQuery({
    queryKey: QK.adminTopManhwa,
    queryFn: () => adminService.getTopManhwa(5),
  });
}

export function useAdminRecentUploads() {
  return useQuery({
    queryKey: QK.adminRecentUploads,
    queryFn: () => adminService.getRecentUploads(5),
  });
}

export function useAdminTimeline(days = 30) {
  return useQuery({
    queryKey: [...QK.adminTimeline, days],
    queryFn: () => adminService.getViewsTimeline(days),
  });
}
