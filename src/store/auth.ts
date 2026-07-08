import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { authService, profileService } from "@/services/auth.service";
import type { Profile } from "@/types/database";

export type Role = "admin" | "reader";

// Same external shape as the old mock store — zero component changes needed
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

  _setUserFromProfile: (profile: Profile) => void;
  _clear: () => void;
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
  loading: true,

  _setUserFromProfile(profile: Profile) {
    set({ user: mapProfileToUser(profile), profile, loading: false });
  },

  _clear() {
    set({ user: null, profile: null, loading: false });
  },

  _init() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await profileService.getProfile(session.user.id);
        if (profile) get()._setUserFromProfile(profile);
        else set({ loading: false });
      } else {
        get()._clear();
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await profileService.getProfile(session.user.id);
        if (profile) get()._setUserFromProfile(profile);
        else set({ loading: false });
      } else {
        set({ loading: false });
      }
    });

    return () => subscription.unsubscribe();
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
    get()._setUserFromProfile(profile);
    return { ok: true };
  },

  async loginReader(email, password) {
    const result = await authService.signIn(email, password);
    if (!result.ok) return { ok: false, error: result.error };
    const profile = await profileService.getProfile(result.session.user.id);
    if (!profile) return { ok: false, error: "Profile not found." };
    get()._setUserFromProfile(profile);
    return { ok: true };
  },

  async signupReader(name, email, password) {
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const result = await authService.signUp(email, password, name);
    if (!result.ok) return { ok: false, error: result.error };
    const loginResult = await authService.signIn(email, password);
    if (!loginResult.ok) return { ok: true };
    const profile = await profileService.getProfile(loginResult.session.user.id);
    if (profile) get()._setUserFromProfile(profile);
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
    set((s) => ({
      user: s.user ? { ...s.user, ...patch } : null,
    }));
  },

  async logout() {
    await authService.signOut();
    get()._clear();
  },
}));
