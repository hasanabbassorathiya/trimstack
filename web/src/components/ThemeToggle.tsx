import { useTheme, type Theme } from "../hooks/useTheme";

const LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, next, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-hairline bg-surface px-3 text-sm text-ink transition-colors duration-150 active:translate-y-[-1px] active:scale-[0.98]"
      aria-label={`Theme: ${LABELS[theme]}. Activate to switch to ${LABELS[next]}.`}
      onClick={() => setTheme(next)}
    >
      {theme === "light" && <SunIcon />}
      {theme === "dark" && <MoonIcon />}
      {theme === "system" && <MonitorIcon />}
      <span className="hidden sm:inline" aria-hidden="true">
        {LABELS[theme]}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 13.75h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
