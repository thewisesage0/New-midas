import { Link } from "@tanstack/react-router";
import { useManhwa } from "@/store/manhwa";
import { useAdminStats, useAdminTopManhwa, useAdminRecentUploads } from "@/hooks/queries";
import { BookOpen, Eye, MessageSquare, TrendingUp, Users, Layers } from "lucide-react";

function Stat({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: React.ElementType; hint?: string }) {
  return (
    <div className="relative glass-dark rounded-2xl border border-flame/20 p-5 magnetic-glow overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 gradient-radial-ember opacity-50 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-flame">{label}</p>
          <p className="mt-2 font-display text-4xl text-ivory text-glow-flame">{value}</p>
          {hint && <p className="mt-1 font-sans text-[11px] text-steel">{hint}</p>}
        </div>
        <span className="grid place-items-center w-10 h-10 rounded-full border border-flame/40 bg-flame/10 text-flame">
          <Icon className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}

function fmt(n: number | null | undefined): string {
  const v = n ?? 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

export function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: topManhwa } = useAdminTopManhwa();
  const { data: recentUploads } = useAdminRecentUploads();

  // Fallback to local store for optimistic counts while loading
  const { manhwa, chapters, comments } = useManhwa();

  return (
    <div className="space-y-8">
      <header>
        <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Analytics</p>
        <h1 className="mt-2 font-display text-4xl text-ivory text-glow-flame">Dashboard</h1>
        <p className="mt-1 font-luxury italic text-ivory/60 text-sm">Live platform intelligence.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total Readers"  value={stats ? fmt(stats.total_readers)  : "—"} icon={Users}         hint="Registered accounts" />
        <Stat label="Total Views"    value={stats ? fmt(stats.total_views)     : "—"} icon={Eye}           hint="Across all series" />
        <Stat label="Total Comments" value={stats ? fmt(stats.total_comments)  : fmt(comments.length)} icon={MessageSquare}  hint="Reader engagement" />
        <Stat label="Total Chapters" value={stats ? fmt(stats.total_chapters)  : fmt(chapters.length)} icon={BookOpen}       hint="Uploaded chapters" />
        <Stat label="Total Series"   value={stats ? fmt(stats.total_manhwa)    : fmt(manhwa.length)}   icon={Layers}         hint="Active manhwa" />
        <Stat label="Downloads"      value={stats ? fmt(stats.total_downloads) : "—"} icon={TrendingUp}    hint="All time" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Series */}
        <div className="glass-dark rounded-2xl border border-flame/20 p-5">
          <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame mb-4">// Top Series</p>
          <div className="space-y-3">
            {(topManhwa ?? manhwa.slice(0, 5)).map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3">
                <span className="font-sans text-sm text-ivory truncate">{m.title}</span>
                <span className="font-tech text-[11px] text-flame shrink-0">{fmt("views" in m ? m.views : 0)} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-dark rounded-2xl border border-flame/20 p-5">
          <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame mb-4">// Recent Uploads</p>
          <div className="space-y-3">
            {(recentUploads ?? chapters.slice(0, 5)).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3">
                <span className="font-sans text-sm text-ivory truncate">
                  {/* @ts-ignore — manhwa join may or may not be present */}
                  {c.manhwa?.title ?? ("manhwaId" in c ? c.manhwaId : "")} — Ch. {"number" in c ? c.number : ""}
                </span>
                <span className="font-tech text-[11px] text-steel shrink-0">
                  {"releaseDate" in c ? c.releaseDate : ("release_date" in c ? (c as { release_date: string }).release_date : "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/manage"  className="rounded-full border border-flame/40 bg-flame/10 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all">Manage Library →</Link>
        <Link to="/admin/chapter" className="rounded-full border border-flame/40 bg-flame/10 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all">Upload Chapter →</Link>
        <Link to="/admin/comments" className="rounded-full border border-flame/40 bg-flame/10 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all">Moderate Comments →</Link>
      </div>
    </div>
  );
}
