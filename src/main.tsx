import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree";
import { useAuth } from "@/store/auth";
import { useManhwa } from "@/store/manhwa";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Bootstraps Supabase auth listener and initial data load exactly once
function AppBootstrap({ children }: { children: React.ReactNode }) {
  const _init = useAuth(s => s._init);
  const _load = useManhwa(s => s._load);

  useEffect(() => {
    const cleanup = _init();
    _load();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

// Load user-specific data (library, progress) when auth state settles
function UserDataLoader() {
  const user = useAuth(s => s.user);
  const loadUserData = useManhwa(s => s.loadUserData);

  useEffect(() => {
    if (user?.id) loadUserData(user.id);
  }, [user?.id, loadUserData]);

  return null;
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppBootstrap>
        <UserDataLoader />
        <RouterProvider router={router} />
      </AppBootstrap>
    </QueryClientProvider>
  </StrictMode>,
);
