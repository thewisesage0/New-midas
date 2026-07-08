import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useManhwa } from "@/store/manhwa";
import { useManhwaList } from "@/hooks/queries";
import { panelService, downloadService } from "@/services/manhwa.service";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Upload } from "lucide-react";

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="font-tech text-[10px] uppercase tracking-widest text-flame">{label}{required && " *"}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 text-sm text-ivory outline-none focus:border-flame/60" />
    </label>
  );
}

export function AdminChapterPage() {
  const { createChapter, addDownload } = useManhwa();
  const { data: liveManhwa = [] } = useManhwaList();
  const navigate = useNavigate();
  const [mid, setMid] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [panels, setPanels] = useState<string[]>([]);
  const [panelInput, setPanelInput] = useState("");
  const [dlName, setDlName] = useState("");
  const [dlFormat, setDlFormat] = useState<"PDF" | "EPUB">("PDF");
  const [dlUrl, setDlUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // File upload refs
  const panelFileRef = useRef<HTMLInputElement>(null);
  const dlFileRef = useRef<HTMLInputElement>(null);
  const [uploadingPanels, setUploadingPanels] = useState(false);

  // Panel file upload
  const handlePanelFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !mid) return;
    setUploadingPanels(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in. Please sign in again.");
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await panelService.uploadPanel(`temp-${mid}`, files[i], panels.length + i);
        urls.push(url);
      }
      setPanels(prev => [...prev, ...urls]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setUploadingPanels(false);
    }
  };

  // Download file upload
  const handleDlFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mid) return;
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in. Please sign in again.");
      const url = await downloadService.uploadFile(mid, file, dlFormat);
      setDlUrl(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : JSON.stringify(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim()) return setErr("Title is required.");
    if (!mid) return setErr("Select a manhwa.");
    setBusy(true);
    try {
      await createChapter(mid, { title, description: desc, releaseDate: date, panels });
      if (dlName && dlUrl) {
        await addDownload({ manhwaId: mid, name: dlName, format: dlFormat, url: dlUrl });
      }
      navigate({ to: "/admin/manage" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create chapter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8 max-w-2xl">
      <header>
        <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Upload</p>
        <h1 className="mt-2 font-display text-4xl text-ivory text-glow-flame">New Chapter</h1>
      </header>

      {/* Manhwa select */}
      <div>
        <span className="font-tech text-[10px] uppercase tracking-widest text-flame">Series *</span>
        <select value={mid} onChange={(e) => setMid(e.target.value)} className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 text-sm text-ivory outline-none focus:border-flame/60">
          {liveManhwa.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      <Field label="Chapter Title" value={title} onChange={setTitle} required />
      <Field label="Description" value={desc} onChange={setDesc} />
      <Field label="Release Date" value={date} onChange={setDate} type="date" required />

      {/* Panels */}
      <div className="space-y-3">
        <span className="font-tech text-[10px] uppercase tracking-widest text-flame">Panels</span>

        {/* File upload */}
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={() => panelFileRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-flame/40 bg-flame/10 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all">
            <Upload className="w-3 h-3" />
            {uploadingPanels ? "Uploading…" : "Upload Images"}
          </button>
          <input ref={panelFileRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePanelFiles} />

          {/* Or add by URL */}
          <div className="flex gap-2 flex-1 min-w-[240px]">
            <input
              value={panelInput}
              onChange={(e) => setPanelInput(e.target.value)}
              placeholder="Or paste image URL…"
              className="flex-1 bg-obsidian/60 border border-flame/20 rounded-full px-5 py-2.5 text-sm text-ivory outline-none focus:border-flame/60"
            />
            <button type="button" onClick={() => { if (panelInput.trim()) { setPanels(p => [...p, panelInput.trim()]); setPanelInput(""); } }}
              className="rounded-full border border-flame/40 bg-flame/10 px-4 py-2.5 text-flame hover:bg-flame/20 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {panels.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {panels.map((p, i) => (
              <div key={i} className="relative group aspect-[3/4] rounded overflow-hidden border border-flame/20">
                <img src={p} alt={`Panel ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setPanels(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 rounded-full bg-obsidian/80 p-1 text-red-400 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 font-tech text-[9px] text-ivory/60 bg-obsidian/60 px-1 rounded">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        <p className="font-tech text-[10px] text-steel">{panels.length} panel{panels.length !== 1 ? "s" : ""} added</p>
      </div>

      {/* Download */}
      <div className="glass-dark rounded-xl border border-flame/10 p-5 space-y-4">
        <p className="font-tech text-[10px] uppercase tracking-widest text-flame">Download File (optional)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="File Name" value={dlName} onChange={setDlName} />
          <div>
            <span className="font-tech text-[10px] uppercase tracking-widest text-flame">Format</span>
            <select value={dlFormat} onChange={(e) => setDlFormat(e.target.value as "PDF" | "EPUB")} className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 text-sm text-ivory outline-none focus:border-flame/60">
              <option value="PDF">PDF</option>
              <option value="EPUB">EPUB</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <button type="button" onClick={() => dlFileRef.current?.click()}
            className="flex items-center gap-2 rounded-full border border-flame/40 bg-flame/10 px-5 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/20 transition-all">
            <Upload className="w-3 h-3" /> Upload File
          </button>
          <input ref={dlFileRef} type="file" accept=".pdf,.epub" className="hidden" onChange={handleDlFile} />
          {dlUrl && <p className="font-tech text-[10px] text-green-400 truncate max-w-xs">✓ File uploaded</p>}
        </div>
        <Field label="Or paste file URL" value={dlUrl} onChange={setDlUrl} />
      </div>

      {err && <p className="font-tech text-[10px] uppercase tracking-widest text-red-400">{err}</p>}

      <button type="submit" disabled={busy}
        className="rounded-full border border-flame bg-flame/15 px-8 py-3 font-tech text-xs uppercase tracking-[0.3em] text-ivory hover:bg-flame/30 transition-all glow-flame-sm disabled:opacity-50">
        {busy ? "Creating…" : "Create Chapter"}
      </button>
    </form>
  );
}
