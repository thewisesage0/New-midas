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
  // (Previously there was a second, separate getSession() call doing the
  // same restoration in parallel — the two raced each other and could
  // clobber each other's result, which is why login sometimes appeared
  // to silently fail on reload.)
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await profileService.getProfile(session.user.id);
      if (profile) useAuth.getState()._setUserFromProfile(profile);
      else useAuth.getState()._clear();
    } else {
      useAuth.getState()._clear();
    }
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
