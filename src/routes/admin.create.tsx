import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useManhwa } from "@/store/manhwa";
import { manhwaService } from "@/services/manhwa.service";
import { supabase } from "@/lib/supabase";
import { X, Plus, Upload, ImagePlus, Loader2 } from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────

const GENRE_OPTIONS = [
  "Werewolf", "Dark Romance", "Fantasy", "Romance", "Paranormal",
  "Revenge", "Mafia", "Thriller", "Sci-Fi", "Lycan", "Contemporary",
  "New Adult", "Sports", "Action", "Mystery", "Horror",
];

const STATUS_OPTIONS = ["Ongoing", "Completed", "Hiatus"] as const;

// ─── SMALL REUSABLE BITS ─────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-tech text-[10px] uppercase tracking-widest text-flame">{children}</span>;
}

function TextInput({ value, onChange, placeholder, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 text-sm text-ivory placeholder-steel/50 outline-none focus:border-flame/60 transition-all"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-xl px-5 py-3 text-sm text-ivory placeholder-steel/50 outline-none focus:border-flame/60 transition-all resize-none"
    />
  );
}

// ─── IMAGE UPLOAD FIELD ──────────────────────────────────────

function ImageUploadField({
  label, hint, value, onChange, bucket, path,
}: {
  label: string; hint: string; value: string; onChange: (url: string) => void;
  bucket: "covers" | "banners"; path: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in. Please sign in again.");

      const ext = file.name.split(".").pop();
      const fullPath = `${path}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fullPath, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-0.5 font-sans text-[11px] text-steel">{hint}</p>
      <div className="mt-2 flex gap-3 flex-wrap items-start">
        {/* Preview */}
        {value && (
          <div className={`relative overflow-hidden rounded-lg border border-flame/30 ${bucket === "covers" ? "w-24 h-36" : "w-48 h-20"}`}>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 rounded-full bg-obsidian/80 p-1 text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-flame/40 bg-flame/10 px-4 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? "Uploading…" : "Upload Image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <p className="font-tech text-[9px] text-steel">or paste a URL below</p>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="w-64 bg-obsidian/60 border border-flame/20 rounded-full px-4 py-2 text-xs text-ivory placeholder-steel/50 outline-none focus:border-flame/60"
          />
        </div>
      </div>
      {err && <p className="mt-1 font-tech text-[10px] text-red-400">{err}</p>}
    </div>
  );
}

// ─── GENRE / TAG PICKER ──────────────────────────────────────

function ChipPicker({
  label, options, selected, onToggle, customInput, onAddCustom,
}: {
  label: string; options: string[]; selected: string[];
  onToggle: (v: string) => void; customInput: string;
  onAddCustom: (v: string) => void;
}) {
  const [input, setInput] = useState(customInput);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`rounded-full px-3 py-1.5 font-tech text-[9px] uppercase tracking-widest border transition-all ${
              selected.includes(o)
                ? "border-flame bg-flame/20 text-ivory"
                : "border-flame/20 text-steel hover:border-flame/50 hover:text-ivory"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {/* Custom entry */}
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (input.trim()) { onAddCustom(input.trim()); setInput(""); } } }}
          placeholder="Add custom…"
          className="flex-1 max-w-[200px] bg-obsidian/60 border border-flame/20 rounded-full px-4 py-2 text-xs text-ivory placeholder-steel/50 outline-none focus:border-flame/60"
        />
        <button
          type="button"
          onClick={() => { if (input.trim()) { onAddCustom(input.trim()); setInput(""); } }}
          className="rounded-full border border-flame/40 bg-flame/10 px-3 py-2 text-flame hover:bg-flame/20"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {selected.length > 0 && (
        <p className="mt-2 font-tech text-[9px] text-steel">
          Selected: {selected.join(", ")}
        </p>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────

export function AdminCreateManhwaPage() {
  const navigate = useNavigate();
  const { createManhwa } = useManhwa();

  // Form state
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [status, setStatus] = useState<"Ongoing" | "Completed" | "Hiatus">("Ongoing");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [coverUrl, setCoverUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [authorNote, setAuthorNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Slug auto-generated from title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const toggleTag = (t: string) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const addCustomGenre = (g: string) => {
    if (!genres.includes(g)) setGenres((prev) => [...prev, g]);
  };

  const addCustomTag = (t: string) => {
    if (!tags.includes(t)) setTags((prev) => [...prev, t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!title.trim()) return setErr("Title is required.");
    if (!blurb.trim()) return setErr("Blurb is required.");
    if (genres.length === 0) return setErr("Select at least one genre.");

    setBusy(true);
    try {
      const created = await createManhwa({
        title: title.trim(),
        blurb: blurb.trim(),
        status,
        year: parseInt(year) || new Date().getFullYear(),
        cover: coverUrl || `https://picsum.photos/seed/${slug}/600/900`,
        banner: bannerUrl || undefined,
        genres,
        tags,
        views: 0,
        rating: 0,
      });

      // If admin note, save as a pinned comment so it shows on the manhwa page
      if (authorNote.trim()) {
        // Fire and forget — non-critical
        supabase.from("comments").insert({
          manhwa_id: created.id,
          user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
          body: authorNote.trim(),
          pinned: true,
          is_author: true,
        });
      }

      navigate({ to: "/admin/manage" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create manhwa. Check your Supabase connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Header */}
      <header>
        <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Create</p>
        <h1 className="mt-2 font-display text-4xl text-ivory text-glow-flame">New Manhwa</h1>
        <p className="mt-1 font-luxury italic text-ivory/60 text-sm">
          Fill in the details. Chapters can be added after.
        </p>
      </header>

      {/* Basic info */}
      <div className="glass-dark rounded-2xl border border-flame/20 p-6 space-y-5">
        <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame">// Basic Info</p>

        <div>
          <Label>Title *</Label>
          <TextInput value={title} onChange={setTitle} placeholder="e.g. Rise of the Dormant Hybrid" required />
          {title && <p className="mt-1 font-tech text-[9px] text-steel">slug: /{slug}</p>}
        </div>

        <div>
          <Label>Blurb / Synopsis *</Label>
          <TextArea value={blurb} onChange={setBlurb} placeholder="What is this manhwa about? Hook the reader in 2–4 sentences." rows={5} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status *</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 text-sm text-ivory outline-none focus:border-flame/60"
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <Label>Year</Label>
            <TextInput value={year} onChange={setYear} placeholder={String(new Date().getFullYear())} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="glass-dark rounded-2xl border border-flame/20 p-6 space-y-6">
        <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame">// Images</p>

        <ImageUploadField
          label="Cover Image *"
          hint="Portrait ratio recommended — 600×900px minimum"
          value={coverUrl}
          onChange={setCoverUrl}
          bucket="covers"
          path={`${slug || "manhwa"}-cover`}
        />

        <ImageUploadField
          label="Banner Image"
          hint="Wide ratio — 1600×700px recommended. Shows on the detail page."
          value={bannerUrl}
          onChange={setBannerUrl}
          bucket="banners"
          path={`${slug || "manhwa"}-banner`}
        />
      </div>

      {/* Genres */}
      <div className="glass-dark rounded-2xl border border-flame/20 p-6 space-y-5">
        <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame">// Classification</p>

        <ChipPicker
          label="Genres * (select all that apply)"
          options={GENRE_OPTIONS}
          selected={genres}
          onToggle={toggleGenre}
          customInput=""
          onAddCustom={addCustomGenre}
        />

        <ChipPicker
          label="Tags (more specific descriptors)"
          options={[
            "fated mates", "wolfless heroine", "powerful alpha", "revenge arc",
            "second chance", "forbidden desire", "captive romance", "feral alpha",
            "dark king", "enemies to lovers", "slow burn", "hidden identity",
            "arranged marriage", "fake dating", "dark fantasy", "rejection",
          ]}
          selected={tags}
          onToggle={toggleTag}
          customInput=""
          onAddCustom={addCustomTag}
        />
      </div>

      {/* Author note */}
      <div className="glass-dark rounded-2xl border border-flame/20 p-6 space-y-3">
        <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame">// Author Note (optional)</p>
        <p className="font-sans text-[11px] text-steel">This will be pinned as an author comment on the manhwa page.</p>
        <TextArea
          value={authorNote}
          onChange={setAuthorNote}
          placeholder="A message to your readers about this series…"
          rows={3}
        />
      </div>

      {/* Preview card */}
      {(title || coverUrl) && (
        <div className="glass-dark rounded-2xl border border-flame/20 p-6">
          <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-flame mb-4">// Preview</p>
          <div className="flex gap-4">
            <div className="w-20 h-28 rounded-lg overflow-hidden border border-flame/20 shrink-0 bg-obsidian/60">
              {coverUrl
                ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full grid place-items-center"><ImagePlus className="w-6 h-6 text-steel/40" /></div>
              }
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl text-ivory">{title || "Untitled"}</h3>
              <div className="flex gap-1.5 flex-wrap mt-1">
                <span className="rounded-full border border-flame/30 px-2 py-0.5 font-tech text-[9px] uppercase tracking-widest text-flame">{status}</span>
                {genres.slice(0, 3).map(g => (
                  <span key={g} className="rounded-full border border-flame/15 px-2 py-0.5 font-tech text-[9px] uppercase tracking-widest text-steel">{g}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-ivory/60 line-clamp-2">{blurb || "No blurb yet."}</p>
            </div>
          </div>
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3">
          <p className="font-tech text-[10px] uppercase tracking-widest text-red-400">{err}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 flex-wrap pb-8">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-full border border-flame bg-flame/15 px-8 py-3 font-tech text-xs uppercase tracking-[0.3em] text-ivory hover:bg-flame/30 transition-all glow-flame-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Create Manhwa"}
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/admin/manage" })}
          className="rounded-full border border-border px-8 py-3 font-tech text-xs uppercase tracking-[0.3em] text-steel hover:text-ivory hover:border-flame/40 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
