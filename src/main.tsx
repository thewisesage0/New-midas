import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree";
import { useAuth } from "@/store/auth";
import { useManhwa } from "@/store/manhwa";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/auth.service";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}

// ─── BOOT — called once before React renders, immune to StrictMode ───
let booted = false;
function boot() {
  if (booted) return;
  booted = true;

  // Auth state listener — also fires immediately on load with the current
  // session (Supabase's INITIAL_SESSION event), so this single listener
  // covers both "restore session on reload" and all subsequent changes.
  //
  // IMPORTANT: this callback must stay synchronous. Supabase serializes all
  // auth operations (sign in, sign out, token refresh, session restore)
  // behind an internal lock, and awaiting inside this callback directly
  // holds that lock until the await resolves — if anything about that await
  // stalls even briefly, every future auth call (including the next login
  // attempt) hangs forever waiting for the lock, with no error thrown.
  // Deferring the async work with setTimeout releases the lock immediately
  // and runs our profile fetch afterward instead. This is Supabase's own
  // documented workaround for this exact deadlock.
  supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(async () => {
      if (session?.user) {
        const profile = await profileService.getProfile(session.user.id);
        if (profile) useAuth.getState()._setUserFromProfile(profile);
        else useAuth.getState()._clear();
      } else {
        useAuth.getState()._clear();
      }
    }, 0);
  });

  // Load manhwa data
  useManhwa.getState()._load();
}

boot();

// ─── REACT TREE ──────────────────────────────────────────────

function UserDataLoader() {
  const userId = useAuth(s => s.user?.id);
  const loadUserData = useManhwa(s => s.loadUserData);
  useEffect(() => {
    if (userId) loadUserData(userId);
  }, [userId, loadUserData]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserDataLoader />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(<App />);
