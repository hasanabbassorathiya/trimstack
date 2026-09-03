import { useCallback, useEffect, useState } from "react";
import { Header, type View } from "./components/Header";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";

function viewFromPath(pathname: string): View {
  return pathname === "/landing" ? "landing" : "dashboard";
}

export default function App() {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));

  // Real URLs without a router library: pushState + popstate
  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((next: View) => {
    const path = next === "landing" ? "/landing" : "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setView(next);
  }, []);

  return (
    <div className="min-h-dvh bg-canvas">
      <Header view={view} onNavigate={navigate} />
      <main id="main-content" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {view === "dashboard" ? (
          <Dashboard />
        ) : (
          <Landing onOpenDashboard={() => navigate("dashboard")} />
        )}
      </main>
    </div>
  );
}
