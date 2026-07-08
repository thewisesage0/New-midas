import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EmberField } from "@/components/EmberField";
import { SectionHeading } from "@/components/SectionHeading";
import { useAuth } from "@/store/auth";
import { useManhwaList, useLatestChapters, useLibrary, useReadingProgress } from "@/hooks/queries";
import { BookOpen, Bookmark, Eye, Star, Search, Lock, Loader2 } from "lucide-react";

export function ManhwaListPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("All");

  // Always fetch fresh from Supabase — bypasses the store cache entirely
  const { data: manhwa = [], isLoading: manhwaLoading } = useManhwaList();
  const { data: latestChapters = [] } = useLatestChapters(6);
  const { data: savedIds = [] } = useLibrary(user?.id);
  const { data: progressData = [] } = useReadingProgress(user?.id);

  // All hooks before any conditional return
  const genres = useMemo(() => {
    const s = new Set<string>();
    manhwa.forEach((m) => m.genres.forEach((g) => s.add(g.name)));
    return ["All", ...Array.from(s)];
  }, [manhwa]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return manhwa.filter((m) => {
      if (genre !== "All" && !m.genres.some(g => g.name === genre)) return false;
      if (!term) return true;
      return (
        m.title.toLowerCase().includes(term) ||
        (m.blurb ?? "").toLowerCase().includes(term) ||
        m.genres.some((g) => g.name.toLowerCase().includes(term)) ||
        m.tags.some((t) => t.name.toLowerCase().includes(term))
      );
    });
  }, [manhwa, q, genre]);

  const trending = useMemo(() =>
    [...manhwa].sort((a, b) => b.views - a.views).slice(0, 4),
    [manhwa]
  );

  const featured = manhwa[0] ?? null;

  const continueList = useMemo(() => {
    if (!progressData.length) return [];
    return (progressData as { manhwa_id: string; chapter_id: string; pct: number; updated_at: string }[])
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
      .map(p => ({ m: manhwa.find(x => x.id === p.manhwa_id), p }))
      .filter((x): x is { m: NonNullable<typeof x.m>; p: typeof x.p } => !!x.m);
  }, [progressData, manhwa]);

  // Not logged in
  if (!user) {
    return (
      <div className="relative min-h-screen pt-32 pb-24 px-6 overflow-hidden grid place-items-center">
        <EmberField count={40} />
        <div className="relative text-center max-w-md">
          <div className="mb-6 grid place-items-center">
            <div className="w-16 h-16 rounded-full border border-flame/40 bg-flame/10 grid place-items-center">
              <Lock className="w-7 h-7 text-flame" />
            </div>
          </div>
          <h1 className="font-display text-5xl text-ivory text-glow-flame">Members Only</h1>
          <p className="mt-4 font-luxury italic text-ivory/60 text-lg">The archive is sealed. Sign in to enter.</p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-flame bg-flame/20 px-8 py-3 font-tech text-xs uppercase tracking-[0.3em] text-ivory hover:bg-flame/30 glow-flame-sm transition-all"
          >
            Enter the Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">

      {/* Featured hero */}
      {featured && (
        <section className="relative mx-auto max-w-7xl px-6 mb-20">
          <div className="relative overflow-hidden rounded-3xl border border-flame/20 glass-dark grain">
            <div
              className="absolute inset-0 opacity-60"
              style={{ backgroundImage: `url(${featured.banner_url ?? featured.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
            <EmberField count={30} />
            <div className="relative grid md:grid-cols-2 gap-10 p-10 md:p-16 min-h-[60vh] items-center">
              <div>
                <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Featured</p>
                <h1 className="mt-4 font-display text-6xl md:text-8xl text-ivory leading-[0.9] text-glow-flame">{featured.title}</h1>
                <p className="mt-5 font-luxury italic text-lg text-ivory/80 max-w-xl">{featured.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.genres.map((g) => (
                    <span key={g.id} className="rounded-full glass-dark border border-flame/30 px-3 py-1 font-tech text-[10px] uppercase tracking-[0.25em] text-ivory/80">{g.name}</span>
                  ))}
                </div>
                <div className="mt-8 flex gap-3">
                  <Link
                    to="/manhwa/$id"
                    params={{ id: featured.id }}
                    className="inline-flex items-center gap-2 rounded-full border border-flame bg-flame/20 px-6 py-3 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/30 transition-all"
                  >
                    <BookOpen className="w-4 h-4" /> Read Now
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center items-center">
                <img
                  src={featured.cover_url ?? ""}
                  alt={featured.title}
                  className="h-[60vh] w-auto object-cover rounded-2xl shadow-[0_30px_60px_-20px_rgba(255,42,26,0.5)] border border-flame/30"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search + filter */}
      <section className="mx-auto max-w-7xl px-6 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 glass-dark rounded-full border border-flame/30 px-5 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-flame shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, genres, tags…"
              className="flex-1 bg-transparent outline-none font-sans text-sm text-ivory placeholder:text-steel/60"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full border px-4 py-2 font-tech text-[10px] uppercase tracking-[0.25em] transition-all ${genre === g ? "border-flame bg-flame/20 text-ivory" : "border-flame/20 text-steel hover:text-ivory hover:border-flame/40"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Continue reading */}
      {continueList.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 mb-16">
          <SectionHeading eyebrow="Continue Reading" title="Pick Up Where You Stopped" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
            {continueList.slice(0, 4).map(({ m, p }) => (
              <Link key={m.id} to="/manhwa/$id/$chapter" params={{ id: m.id, chapter: p.chapter_id }} className="group">
                <div className="relative overflow-hidden rounded-xl border border-flame/20 glass-dark">
                  <img src={m.cover_url ?? ""} alt={m.title} className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-flame/20">
                    <div className="h-full bg-flame" style={{ width: `${Math.min(100, p.pct)}%` }} />
                  </div>
                </div>
                <p className="mt-3 font-display text-sm tracking-widest text-ivory group-hover:text-flame transition-colors">{m.title}</p>
                <p className="font-tech text-[10px] text-steel uppercase tracking-widest">{Math.round(p.pct)}% read</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 mb-16">
          <SectionHeading eyebrow="Trending Now" title="Burning the Charts" />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {trending.map((m, i) => (
              <Link key={m.id} to="/manhwa/$id" params={{ id: m.id }} className="group relative">
                <span className="absolute -top-3 -left-3 z-10 grid place-items-center w-10 h-10 rounded-full border border-flame bg-obsidian font-display text-flame text-2xl">
                  {i + 1}
                </span>
                <div className="relative overflow-hidden rounded-2xl border border-flame/20 glass-dark aspect-[2/3]">
                  <img src={m.cover_url ?? ""} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="font-display text-lg tracking-widest text-ivory">{m.title}</p>
                    <div className="mt-1 flex gap-3 font-tech text-[9px] text-flame uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {m.views >= 1000 ? `${(m.views / 1000).toFixed(1)}k` : m.views}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {Number(m.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All manhwa */}
      <section className="mx-auto max-w-7xl px-6 mb-20">
        <SectionHeading eyebrow="The Archive" title={genre === "All" ? "All Manhwa" : genre} />
        {manhwaLoading ? (
          <div className="mt-10 flex items-center gap-3 text-steel">
            <Loader2 className="w-4 h-4 animate-spin text-flame" />
            <span className="font-tech text-[10px] uppercase tracking-widest">Loading series…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-10 font-sans text-sm text-steel">No manhwa found.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((m) => (
              <Link key={m.id} to="/manhwa/$id" params={{ id: m.id }} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-flame/20 glass-dark aspect-[2/3]">
                  <img src={m.cover_url ?? ""} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/30 to-transparent" />
                  {savedIds.includes(m.id) && (
                    <span className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full bg-flame/80 text-ivory">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="font-tech text-[9px] uppercase tracking-[0.3em] text-flame">{m.status}</p>
                    <p className="mt-1 font-display text-lg tracking-widest text-ivory">{m.title}</p>
                    <p className="mt-1 font-sans text-[11px] text-ivory/60 line-clamp-2">{m.blurb}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest chapters */}
      {latestChapters.length > 0 && (
        <section className="mx-auto max-w-7xl px-6">
          <SectionHeading eyebrow="Latest Chapters" title="Fresh From the Press" />
          <div className="mt-8 glass-dark rounded-2xl border border-flame/20 divide-y divide-flame/10">
            {latestChapters.map((c: { id: string; number: number; title: string; release_date: string; manhwa: { id: string; title: string; cover_url: string | null } | null }) => {
              if (!c.manhwa) return null;
              return (
                <Link
                  key={c.id}
                  to="/manhwa/$id/$chapter"
                  params={{ id: c.manhwa.id, chapter: c.id }}
                  className="flex items-center gap-4 p-4 hover:bg-flame/5 transition-colors group"
                >
                  <img src={c.manhwa.cover_url ?? ""} alt={c.manhwa.title} className="w-14 h-20 object-cover rounded-md border border-flame/20" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base tracking-widest text-ivory truncate group-hover:text-flame transition-colors">{c.manhwa.title}</p>
                    <p className="font-sans text-xs text-steel truncate">Ch. {c.number} — {c.title}</p>
                  </div>
                  <p className="font-tech text-[10px] uppercase tracking-widest text-flame whitespace-nowrap">
                    {new Date(c.release_date).toLocaleDateString()}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
