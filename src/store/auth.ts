import { create } from "zustand";
import { authService, profileService } from "@/services/auth.service";
import type { Profile } from "@/types/database";

export type Role = "admin" | "reader";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
};

type State = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;

  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginReader: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signupReader: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (patch: Partial<Pick<User, "name" | "avatar">>) => Promise<void>;
  logout: () => Promise<void>;

  // Called by boot() in main.tsx
  _setUserFromProfile: (profile: Profile) => void;
  _clear: () => void;
  // Keep _init as no-op for any leftover references
  _init: () => void;
};

function mapProfileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.display_name || profile.username || profile.email.split("@")[0],
    role: profile.role as Role,
    avatar: profile.avatar_url ?? undefined,
    createdAt: profile.created_at,
  };
}

export const useAuth = create<State>((set, get) => ({
  user: null,
  profile: null,
  loading: true, // starts true, boot() resolves it

  _setUserFromProfile(profile) {
    set({ user: mapProfileToUser(profile), profile, loading: false });
  },

  _clear() {
    set({ user: null, profile: null, loading: false });
  },

  _init() {
    // No-op — boot() in main.tsx handles this now
  },

  async loginAdmin(email, password) {
    const result = await authService.signIn(email, password);
    if (!result.ok) return { ok: false, error: result.error };
    const profile = await profileService.getProfile(result.session.user.id);
    if (!profile) return { ok: false, error: "Profile not found." };
    if (profile.role !== "admin") {
      await authService.signOut();
      return { ok: false, error: "Access denied. Not an admin account." };
    }
    // Note: main.tsx's onAuthStateChange listener will pick up the SIGNED_IN
    // event and set the user automatically — no need to duplicate that here.
    return { ok: true };
  },

  async loginReader(email, password) {
    const result = await authService.signIn(email, password);
    if (!result.ok) return { ok: false, error: result.error };
    // Note: main.tsx's onAuthStateChange listener will pick up the SIGNED_IN
    // event and set the user automatically — no need to duplicate that here.
    return { ok: true };
  },

  async signupReader(name, email, password) {
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const result = await authService.signUp(email, password, name);
    if (!result.ok) return { ok: false, error: result.error };
    // Auto sign-in after signup — onAuthStateChange will pick up the
    // resulting SIGNED_IN event and set the user automatically.
    await authService.signIn(email, password);
    return { ok: true };
  },

  async resetPassword(email) {
    const result = await authService.resetPassword(email);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true };
  },

  async updateProfile(patch) {
    const u = get().user;
    if (!u) return;
    await profileService.updateProfile(u.id, {
      display_name: patch.name,
      avatar_url: patch.avatar,
    });
    set((s) => ({ user: s.user ? { ...s.user, ...patch } : null }));
  },

  async logout() {
    await authService.signOut();
    get()._clear();
  },
}));
