import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export type View = "dashboard" | "landing";

interface HeaderProps {
  view: View;
  onNavigate: (view: View) => void;
}

export function Header({ view, onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links: Array<{ label: string; target: View }> = [
    { label: "Dashboard", target: "dashboard" },
    { label: "Landing", target: "landing" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            className="font-sans text-base font-semibold tracking-tight text-ink"
            onClick={() => onNavigate("dashboard")}
          >
            TrimStack
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
            {links.map(({ label, target }) => (
              <button
                key={target}
                type="button"
                aria-current={view === target ? "page" : undefined}
                className={`min-h-11 border-b-2 px-1 text-sm transition-colors duration-150 ${
                  view === target
                    ? "border-accent font-medium text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
                onClick={() => onNavigate(target)}
              >
                {label}
              </button>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-hairline text-ink"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Primary" className="border-t border-hairline bg-surface px-4 py-2 sm:hidden">
            {links.map(({ label, target }) => (
              <button
                key={target}
                type="button"
                aria-current={view === target ? "page" : undefined}
                className={`block w-full min-h-11 rounded-lg px-2 text-left text-sm ${
                  view === target ? "font-medium text-accent" : "text-muted"
                }`}
                onClick={() => {
                  onNavigate(target);
                  setMenuOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-hairline focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
    </>
  );
}
