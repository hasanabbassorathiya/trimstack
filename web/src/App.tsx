import { useState } from "react";
import { Header, type View } from "./components/Header";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="min-h-dvh bg-canvas">
      <Header view={view} onNavigate={setView} />
      <main id="main-content" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {view === "dashboard" ? (
          <Dashboard />
        ) : (
          <Landing onOpenDashboard={() => setView("dashboard")} />
        )}
      </main>
    </div>
  );
}
