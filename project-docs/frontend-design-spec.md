# TrimStack Frontend Design Spec — Implementation Foundation

> **Status**: AUTHORITATIVE for frontend Tasks 14–23 and 26. Where a task file and this document disagree, this document (with `DESIGN.md`) wins unless the PM says otherwise.
> **Sources**: `project-docs/DESIGN.md` (visual system, Stitch-based) · `project-tasks/trimstack-tasklist.md` (task consumers) · `project-docs/api-contract.md` (API shapes).
> **Stack**: React 19 + Vite + TypeScript strict + Tailwind CSS v4 (CSS-first). No UI libraries. No animation libraries.

---

## 1. Tailwind v4 Token Mapping

Paste this into `web/src/styles/theme.css` (the ONLY global stylesheet). Geist fonts via npm: `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` (import both in `main.tsx`; if a package name 404s at install time, fall back to `@fontsource/geist-sans`-style naming or self-host — never fall back to Inter/system identity fonts).

```css
@import "tailwindcss";

/* Class-based dark mode (v4 official pattern) */
@custom-variant dark (&:where(.dark, .dark *));

/* Raw theme variables — light defaults, .dark overrides */
:root {
  --ts-canvas: #F6F7F8;
  --ts-surface: #FFFFFF;
  --ts-text: #1B1E23;
  --ts-text-muted: #5F6570;
  --ts-border: #E4E6EA;
  --ts-accent: #087A52;
  --ts-accent-text: #FFFFFF;   /* on-accent text */
  --ts-waste: #8A5A00;
  --ts-risk: #9A4A08;
  --ts-neutral: #6E7480;       /* cancelled status text (AA on canvas) */
  --ts-skeleton: #E9EBEE;
}
.dark {
  --ts-canvas: #111317;
  --ts-surface: #191C21;
  --ts-text: #E8EAED;
  --ts-text-muted: #A7ADBA;
  --ts-border: #2A2E35;
  --ts-accent: #2DB98A;
  --ts-accent-text: #0B1512;   /* dark ink on bright emerald (7:1) */
  --ts-waste: #E0A93E;
  --ts-risk: #E0862E;
  --ts-neutral: #9BA1AC;
  --ts-skeleton: #232830;
}

/* Tailwind theme mapping — utilities become bg-canvas, text-ink, border-hairline, etc. */
@theme inline {
  --color-canvas: var(--ts-canvas);
  --color-surface: var(--ts-surface);
  --color-ink: var(--ts-text);
  --color-muted: var(--ts-text-muted);
  --color-hairline: var(--ts-border);
  --color-accent: var(--ts-accent);
  --color-on-accent: var(--ts-accent-text);
  --color-waste: var(--ts-waste);
  --color-risk: var(--ts-risk);
  --color-neutralbadge: var(--ts-neutral);
  --color-skeleton: var(--ts-skeleton);

  --font-sans: "Geist Variable", "Geist", ui-sans-serif, sans-serif;
  --font-mono: "Geist Mono Variable", "Geist Mono", ui-monospace, monospace;

  --radius-card: 1rem;
  --shadow-whisper: 0 1px 2px rgb(27 30 35 / 0.04), 0 4px 16px rgb(27 30 35 / 0.05);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-strong: cubic-bezier(0.22, 1, 0.36, 1);
}

/* Global base */
html { scroll-behavior: smooth; }
body {
  background: var(--ts-canvas);
  color: var(--ts-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
/* Tabular mono numerals — every number, currency, date, seat count, percentage */
.num, table td.mono, .metric-value, input[type="number"], input[type="date"] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
/* Focus visibility — never remove */
:focus-visible {
  outline: 2px solid var(--ts-accent);
  outline-offset: 2px;
}
/* Skeleton shimmer */
@keyframes ts-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--ts-skeleton) 25%, color-mix(in srgb, var(--ts-skeleton) 60%, var(--ts-surface)) 50%, var(--ts-skeleton) 75%);
  background-size: 800px 100%;
  animation: ts-shimmer 1.6s linear infinite;
  border-radius: 6px;
}
/* Analysis-in-flight pulse — the ONLY perpetual micro-loop */
@keyframes ts-pulse {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ts-accent) 35%, transparent); }
  50% { box-shadow: 0 0 0 6px transparent; }
}
.analysis-running { animation: ts-pulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .skeleton, .analysis-running { animation: none; }
  * { transition-duration: 0.01ms !important; }
}
```

**Token summary**: 11 semantic colors × 2 themes · 1 sans (Geist) + 1 mono (Geist Mono) · 1 radius (1rem) · 1 shadow (whisper) · 2 easings. No other colors may be introduced — inline hex values in components are a QA fail.

## 2. Theme System Architecture

- **Storage key**: `trimstack-theme` (localStorage). Values: `"light" | "dark" | "system"`.
- **Application**: `document.documentElement.classList.toggle("dark", resolved === "dark")` where `resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme`.
- **Live system tracking**: in `system` mode, a `matchMedia` change listener re-resolves and re-applies — no reload (NFR).
- **FOUC prevention**: inline script in `index.html` `<head>` BEFORE any stylesheet loads: read `localStorage.getItem("trimstack-theme")`, resolve, apply `.dark` class immediately. ~6 lines, no external file.
- **Toggle (ThemeToggle component)**: single native `<button aria-label="Theme: {state}. Activate to switch to {next}.">` cycling Light → Dark → System → Light. Shows the CURRENT state text label + a small SVG icon (sun/moon/monitor — hand-drawn SVG, no icon library). Persist on every change. Announce via `aria-live="polite"` span is NOT required — the aria-label update suffices.
- **QA gate**: reload persistence (E2E), live OS-switch flip in System mode, both themes AA.

## 3. Information Architecture

- **Routes**: `/` = Dashboard (default). `/landing` = Landing page. Nav links bidirectional: header shows "TrimStack" wordmark + links "Dashboard" and "Landing". No router library needed — use lightweight state-based view switch in `App.tsx` (two views) OR `history` pushState; keep it dependency-free and keyboard accessible.
- **Landmarks**: `<header>` (site header), `<nav aria-label="Primary">`, `<main id="main-content">`. Skip link: `<a class="skip-link" href="#main-content">Skip to content</a>` — visually hidden until focused, then top-left pinned surface chip.
- **Dashboard layout order (F4, exact)**:
  1. **Metric strip** — asymmetric: **Wasted Monthly** hero card at 2× weight (span 2 grid cols on desktop; mono figure at `text-4xl`, Waste Amber `text-waste`), flanked by 4 secondary metric cards (Total Monthly Spend, Projected Annual Spend, Recovered, Waste %). Hero card gets the whisper shadow + 1rem radius; secondary cards are flat surface with hairline borders only — hierarchy through weight, not uniform elevation.
  2. **Middle row**: AlertsPanel (2fr) + RenewalsList (1fr) in a CSS Grid; stacks below 768px.
  3. **Subscriptions table** — full width, canvas-level with border-top divider (NOT a card — DESIGN.md §4).
- **Toolbar**: "Run analysis" primary button + "Export CSV" secondary button live in the alerts panel header row.

## 4. Component Specs

All components live in `web/src/components/`, pages in `web/src/pages/`. Common states everywhere: **loading** = skeleton shimmer matching exact final layout (no spinners), **empty** = composed quiet moment (copy below), **error** = inline message block (surface bg, hairline border, `text-risk` heading "Something went wrong", body from the API envelope `error.message`, plus a "Try again" ghost button where a retry makes sense).

**Header** — sticky, surface bg, hairline bottom border, height 56px. Left: wordmark "TrimStack" (Geist 600, no logo image — typography is the logo). Right: nav links (underline offset on hover, `aria-current="page"` for active view) + ThemeToggle. At <768px: links collapse into a disclosure menu button (`aria-expanded`), full-width surface panel below header.

**ThemeToggle** — see §2. Icon-only mode <768px (with aria-label); text+icon above.

**MetricCard** — props: `{ label, value, format: "usd" | "usd0" | "pct", hero?: boolean, tone?: "default" | "waste" | "recovered" }`. Renders label (`text-xs uppercase tracking-wide text-muted`), value (`num` class; hero: `text-4xl`, secondary: `text-2xl`). USD format: `$X,XXX.XX` via `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })` (usd0 = no cents for annual projection). Waste % hero tone: `text-waste`; Recovered tone: `text-accent`. Loading: two skeleton bars (label 60% width, value 80% × 40px height).

**SubscriptionsTable** — full F1 field set: Name, Vendor, Category, Monthly Cost, Billing Cycle, Renewal Date, Seats (active/provisioned), Department, Status, Notes. Sticky `thead` (surface bg, hairline bottom). Row min-height 44px, `border-t hairline` between rows. Numbers/costs/dates in `num` class, costs right-aligned. **Sort**: Cost + Renewal Date headers are `<button>` with `aria-sort="{ascending|descending|none}"` and a visible chevron rotating via CSS; click toggles asc/desc; refetch from server params (`sort`, `order`). **Search**: input in panel header, `type="search"`, `aria-label="Search subscriptions by name or vendor"`, debounce 250ms, server param `q`. **StatusBadge** — dot (8px, status color: active=accent, trial=waste, cancelled=neutralbadge) + text label, `text-xs`. **Mobile (<768px): STACKED CARDS** — chosen over horizontal scroll because finance review on phones needs name+cost+seats co-visible without scroll-hunting; implementation: `table, thead { display: none }`, each `tr` becomes a surface card (`display:block; border hairline; radius-card`), each `td` shows `::before { content: attr(data-label); }` label in muted text, `data-label` set on every cell. Name/cost emphasized; notes truncated to 2 lines (`line-clamp-2`).
- Row actions: Edit / Delete ghost buttons (aria-label "Edit {name}", "Delete {name}") — visible on hover on desktop, always visible on mobile.

**SubscriptionForm + Modal** — Modal: `role="dialog" aria-modal="true" aria-labelledby` form title, overlay `bg-ink/40`, surface panel `radius-card` + whisper shadow, Esc closes, overlay click closes, focus trap (first focus → tab cycle inside → return focus to trigger on close). Form grid: 2 cols ≥768px, 1 col below. Labels ABOVE inputs (never floating). Fields per F1: name*, vendor*, category (select, 9 values), monthly cost* (number, step 0.01, min 0.01), billing cycle (select), renewal date (date input), seats provisioned* (number, min 0), seats active* (number, min 0, helper "Active in last 30 days"), department*, status (select), notes (textarea). **Client validation mirrors Zod**: required, cost > 0, seatsActive ≤ seatsProvisioned (cross-field — show on the seats-active field: "Active seats cannot exceed provisioned seats"), valid date. Inline errors: `text-risk text-sm` below field, `aria-invalid="true"` + `aria-describedby` wiring. Submit = primary button "Add subscription" / "Save changes"; pending state disables + "Saving…". Server 400 → map envelope `details` onto the same inline errors. Delete = separate confirmation Modal variant ("Delete {name}? This removes its alerts too." — Cancel / Delete ghost-red? NO red fills: destructive button is ghost with `text-risk` label).

**AlertsPanel** — surface panel, whisper shadow, `radius-card`. Header row: title "Optimization alerts" + count badge (mono) + toolbar (RunAnalysisButton primary, ExportButton secondary). Body: list of open alerts sorted by savings desc (server order), each row: FlagTypeBadge, subscription name (600 weight), $ impact (mono, `text-waste`, e.g. `+$287.14/mo`) or "Risk" label (muted, mono) for null-savings, recommendation (muted, 1 line, truncate w/ title attr), actions: "Resolve" (ghost, accent text) + "Dismiss" (ghost, muted). Rows: 40ms stagger-in cascade (max ~400ms; `animation-delay: calc(var(--i) * 40ms)` with `--i` row index, capped at 10). Empty states: never-run → faded spark-line SVG glyph + "Run analysis to detect waste." ; no-open-flags → quiet check glyph + "No open alerts. Your stack looks clean." Loading: 5 skeleton rows.
- **FlagTypeBadge** — text label + 6px dot: Inactive seats (waste), Upcoming renewal (risk), Trial drift (waste), Duplicate spend (waste). `text-xs` + border hairline pill (outline pill, not filled — DESIGN.md "dot + label" style).

**RunAnalysisButton** — primary: accent bg, on-accent text, "Run analysis", `:active` scale(0.98) translate −1px (spring ease). While in flight: disabled + "Analyzing…" + `analysis-running` pulse class (the ONLY perpetual loop). On success: refetch alerts + dashboard metrics (shared refresh via a `useDashboardData` re-fetch trigger — prop callback or context event; NO state library).

**ResolveDialog** — small Modal variant: title "Resolve alert", shows alert summary line (type — subscription — $ impact), textarea "What did you do?" (`actionTaken`, required — submit disabled until non-empty, `aria-label`), Cancel / "Resolve" primary. On success: alert leaves list, Recovered metric visibly increases (no reload — the refetch trigger).

**RenewalsList** — narrow panel (1fr). Title "Upcoming renewals" + 60-day count (mono). Rows: name (600), date (mono, human "Mar 14" + muted "in 12 days" relative hint — compute from today, update on render), cost right-aligned mono. Sorted soonest first (server order). Empty: "No renewals in the next 60 days." Loading: 4 skeleton rows. Compact rows 44px.

**ExportButton** — secondary ghost: "Export CSV". Disabled when open-alerts count = 0 with `title="No open alerts to export"` + `aria-disabled`. Click → `window.location.assign("/api/export/alerts.csv")` (browser-native download of `trimstack-waste-report.csv`).

**Landing** (`web/src/pages/Landing.tsx`) — F6 exact: (1) **Headline**: left-aligned asymmetric hero (never centered), Geist 600, `clamp(2.25rem, 5vw, 3.5rem)`, track-tight; inline image typography: 1–2 small rounded photos at type-height inside the headline (picsum.photos, `inline-block h-[0.9em] rounded-md align-baseline`, alt "") — stack hidden below 768px. Subhead one muted paragraph (≤65ch). Single CTA: primary accent button "Open the dashboard" → `/`. NO secondary link. (2) **Problem stats**: honest generic framing (no invented numbers): three short stat-style claims sourced from the research framing (inactive seats, forgotten trial conversions, redundant departmental tools) in an asymmetric 2-col arrangement or horizontal band — NOT 3 equal cards. (3) **How it works**: 3 steps (Add your subscriptions → Run the waste analysis → Resolve alerts and recover spend) in a 2-col zig-zag or numbered asymmetric grid, mono step numerals. (4) **CTA** — repeat primary CTA. Minimal footer: wordmark + link back to dashboard. Same tokens/themes; `min-h-[100dvh]` hero section; section spacing `clamp(3rem, 8vw, 6rem)`.

## 5. Responsive Strategy

| Breakpoint | Behavior |
|---|---|
| **≥1280px** | Full 12-col grid: metric strip (hero spans 2), 2fr+1fr middle row, full table |
| **768–1279px** | Metric strip 3-col (hero full-width row above), middle row stacks, table full |
| **<768px** | EVERYTHING single column (no exceptions). Header collapses to disclosure menu. Table → stacked cards (§4). Landing inline images hidden (stack as block below headline). Metric strip: hero first, secondary metrics 2×2 grid. Renewals/alerts stack. Touch targets ≥44px everywhere (row height, buttons, toggle) |

No horizontal page scroll at 375px — the ONLY sanctioned overflow is inside pre/code if any (none expected).

## 6. Motion Spec (pure CSS — no libraries)

- **Spring approximation**: `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot ~1.056 — for discrete state changes: button active, modal in, badge hover). For row cascades and panel transitions use `--ease-out-strong: cubic-bezier(0.22, 1, 0.36, 1)` (no overshoot — overshooting rows read as chaos, spring read as weighty snap).
- **Cascades**: alert + table rows fade/translate-in with 40ms stagger, cap total 400ms (`animation-delay` min(var(--i) * 40ms, 400ms) pattern via inline `--i`).
- **Micro-feedback**: buttons `:active { transform: translateY(-1px) scale(0.98); }` with spring ease, 120ms. Panels/cards hover: none on data surfaces (calm); interactive ghost buttons get hairline→accent border transition 150ms.
- **In-flight pulse**: only `.analysis-running` (§1 keyframes).
- **Reduced motion**: all animations/transitions collapse to opacity-only or 0.01ms (§1 media query).
- Animate ONLY `transform`/`opacity`. Never `top/left/width/height`.

## 7. Per-Component Accessibility Checklist (dev re-verifies before each task)

- [ ] Contrast: all text pairs from §1 tokens (pre-verified AA — do NOT introduce new colors): ink/muted on canvas & surface, on-accent on accent, waste/risk on canvas & surface — in BOTH themes
- [ ] Sortable headers: `<button>` + `aria-sort` + visible direction glyph
- [ ] Icon-only buttons: `aria-label` (ThemeToggle mobile, any glyph buttons)
- [ ] Modals (Modal, ResolveDialog): `role="dialog"`, `aria-modal`, labelled title, Esc close, overlay-click close, focus trap, focus return to trigger
- [ ] Tables: `<th scope="col">`, caption via `aria-label` on table, mobile cards keep `data-label`s
- [ ] Forms: label-for 1:1, errors `aria-invalid` + `aria-describedby`, helper text linked
- [ ] Keyboard journey: nav → skip link → metrics → table sort/search → add form → run analysis → resolve dialog → export — all reachable and operable without a mouse
- [ ] Live regions: alerts count changes announced via `aria-live="polite"` on the count badge only

## 8. Anti-Pattern Pre-Flight (read before EVERY frontend task)

1. No emojis anywhere (UI, copy, code comments) 2. No Inter / system-ui identity font 3. No pure black `#000` 4. No purple, neon, gradients on UI chrome 5. No 3-column equal card rows (metric strip is asymmetric; landing uses zig-zag) 6. No cards inside cards (table is canvas-level; modal panels are flat) 7. No overlapping/absolute-stacked content 8. No spinners (skeletons only) 9. No floating labels 10. No "Elevate/Seamless/Unleash/Next-Gen/Supercharge" copy 11. No invented stats on landing (honest generic claims only) 12. No filled colored pills (outline pills + dots only) 13. No animation/UI libraries 14. No inline hex values (use tokens) 15. No `h-screen` (`min-h-[100dvh]` where full-height needed) 16. No custom mouse cursors 17. Numbers are ALWAYS mono/tabular 18. Motion: transform/opacity only, reduced-motion respected.

---

*Authority chain: `DESIGN.md` (intent) → this spec (implementation rules) → task acceptance criteria (verification). Conflicts: PM arbitrates.*
