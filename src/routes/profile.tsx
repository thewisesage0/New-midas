import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { EmberField } from "@/components/EmberField";
import { useAuth } from "@/store/auth";
import { profileService } from "@/services/auth.service";
import { Camera } from "lucide-react";

export function ProfilePage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);
  if (loading) return null;
  if (!user) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await profileService.uploadAvatar(user.id, file);
      if (url) {
        await updateProfile({ avatar: url });
        setOk("Avatar updated.");
      }
    } catch {
      setErr("Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setOk(null); setErr(null);
    try {
      await updateProfile({ name });
      setOk("Profile saved.");
    } catch {
      setErr("Save failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-24 px-6 overflow-hidden">
      <EmberField count={20} />
      <div className="relative mx-auto max-w-2xl glass-dark rounded-2xl border border-flame/30 p-8">
        <p className="font-tech text-[10px] uppercase tracking-[0.5em] text-flame">// Profile</p>
        <h1 className="mt-2 font-display text-5xl text-ivory text-glow-flame">{user.name}</h1>
        <p className="mt-1 font-sans text-sm text-steel">{user.email}</p>

        {/* Avatar */}
        <div className="mt-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-flame/40 overflow-hidden bg-obsidian">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full grid place-items-center font-display text-2xl text-flame">{user.name[0]}</div>
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-flame border-2 border-background grid place-items-center hover:bg-flame/80 transition-all"
            >
              <Camera className="w-3 h-3 text-obsidian" />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <p className="font-tech text-[10px] uppercase tracking-widest text-flame">Avatar</p>
            <p className="font-sans text-xs text-steel mt-0.5">Click the camera to upload</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-4">
          <label className="block">
            <span className="font-tech text-[10px] uppercase tracking-widest text-flame">Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full bg-obsidian/60 border border-flame/20 rounded-full px-5 py-3 font-sans text-sm text-ivory outline-none focus:border-flame/60" />
          </label>

          {ok  && <p className="font-tech text-[10px] uppercase tracking-widest text-green-400">{ok}</p>}
          {err && <p className="font-tech text-[10px] uppercase tracking-widest text-red-400">{err}</p>}

          <div className="flex gap-3 flex-wrap pt-2">
            <button type="submit" disabled={busy} className="rounded-full border border-flame bg-flame/15 px-7 py-2.5 font-tech text-[10px] uppercase tracking-widest text-ivory hover:bg-flame/30 transition-all disabled:opacity-50">
              {busy ? "Saving…" : "Save Changes"}
            </button>
            <Link to="/library" className="rounded-full border border-border px-7 py-2.5 font-tech text-[10px] uppercase tracking-widest text-steel hover:text-ivory hover:border-flame/40 transition-all">
              My Library
            </Link>
            <button type="button" onClick={() => { logout(); navigate({ to: "/" }); }} className="rounded-full border border-border px-7 py-2.5 font-tech text-[10px] uppercase tracking-widest text-steel hover:text-red-400 hover:border-red-400/40 transition-all">
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
