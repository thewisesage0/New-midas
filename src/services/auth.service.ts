import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

// ─── AUTH SERVICE ────────────────────────────────────────────

export const authService = {

  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, user: data.user };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, session: data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─── PROFILE SERVICE ─────────────────────────────────────────

export const profileService = {

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  },

  async updateProfile(userId: string, patch: { display_name?: string; avatar_url?: string; bio?: string; username?: string }) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, profile: data };
  },

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },
};
