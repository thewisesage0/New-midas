import { useState } from "react";
import { useAllComments, useDeleteComment, usePinComment, useLikeComment, useAddComment } from "@/hooks/queries";
import { useAuth } from "@/store/auth";
import { Pin, Trash2, Reply, Heart, Loader2 } from "lucide-react";

export function AdminCommentsPage() {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useAllComments();
  const deleteComment = useDeleteComment();
  const pinComment = usePinComment();
  const likeComment = useLikeComment();
  const addComment = useAddComment();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const sorted = [...comments].sort(
    (a, b) => (Number(!!b.pinned) - Number(!!a.pinned)) || (+new Date(b.created_at) - +new Date(a.created_at))
  );

  const handleReply = async () => {
    if (!replyTo || !body.trim() || !user) return;
    setBusy(true);
    const target = comments.find(c => c.id === replyTo);
    if (target) {
      await addComment.mutateAsync({
        manhwa_id: target.manhwa_id,
        chapter_id: target.chapter_id ?? undefined,
        user_id: user.id,
        body: body.trim(),
        parent_id: replyTo,
      });
    }
    setBody("");
    setReplyTo(null);
    setBusy(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 pt-20 text-steel">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-tech text-[10px] uppercase tracking-widest">Loading comments…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Moderation</p>
        <h1 className="mt-2 font-display text-4xl text-ivory text-glow-flame">Comments</h1>
        <p className="mt-1 font-luxury italic text-ivory/60 text-sm">Pin, prune, and reply with the author badge.</p>
      </header>

      <div className="glass-dark rounded-2xl border border-flame/20 divide-y divide-flame/10">
        {sorted.length === 0 && <p className="p-6 text-sm text-steel">No comments yet.</p>}
        {sorted.map((c) => (
          <div key={c.id} className={`p-5 ${c.pinned ? "bg-flame/5" : ""}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-sm tracking-widest text-ivory">{c.profiles?.display_name ?? "Reader"}</span>
              {c.is_author && (
                <span className="rounded-full border border-flame bg-flame/20 px-2 py-0.5 font-tech text-[9px] text-flame">Author</span>
              )}
              {c.pinned && (
                <span className="rounded-full border border-ivory/20 bg-ivory/10 px-2 py-0.5 font-tech text-[9px] text-ivory/60">Pinned</span>
              )}
              <span className="ml-auto font-tech text-[10px] text-steel">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 font-sans text-sm text-ivory/80 leading-relaxed">{c.body}</p>
            <div className="mt-3 flex gap-3 flex-wrap">
              <button
                onClick={() => pinComment.mutate({ id: c.id, pinned: !c.pinned })}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-tech text-[9px] uppercase tracking-widest border transition-all ${c.pinned ? "border-flame text-flame bg-flame/10" : "border-border text-steel hover:border-flame/40 hover:text-ivory"}`}
              >
                <Pin className="w-3 h-3" /> {c.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={() => setReplyTo(c.id === replyTo ? null : c.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-tech text-[9px] uppercase tracking-widest border border-border text-steel hover:border-flame/40 hover:text-ivory transition-all"
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
              <button
                onClick={() => likeComment.mutate({ commentId: c.id, userId: user?.id ?? "" })}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-tech text-[9px] uppercase tracking-widest border border-border text-steel hover:border-flame/40 hover:text-ivory transition-all"
              >
                <Heart className="w-3 h-3" /> {c.likes}
              </button>
              <button
                onClick={() => deleteComment.mutate(c.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-tech text-[9px] uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-400/10 transition-all ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>

            {replyTo === c.id && (
              <div className="mt-4 flex gap-3">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Author reply…"
                  className="flex-1 bg-obsidian/60 border border-flame/20 rounded-full px-4 py-2.5 text-sm text-ivory outline-none focus:border-flame/60"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleReply}
                  className="rounded-full border border-flame bg-flame/15 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/30 transition-all disabled:opacity-50"
                >
                  {busy ? "…" : "Send"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
