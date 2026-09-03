# Design System: TrimStack

> Source of truth for all TrimStack UI (app + landing). Generated via the stitch-design-taste method (Google Stitch). The UX Architect translates these rules into Tailwind v4 tokens; frontend tasks implement against this document. QA validates contrast and component conformance against it.

## 1. Visual Theme & Atmosphere

A **financial cockpit with editorial calm**. The atmosphere is a well-lit FP&A office at month-end: clinical, precise, quietly confident. Surfaces stay calm and quiet — the *numbers* are loud. Density sits at **7/10** (data-dense tables, compact metrics) with variance **4/10** inside the app (finance users need scannable predictability; asymmetry is reserved for the landing page) and **7/10** on the landing page. Motion intensity **5/10**: fluid, spring-physics feedback on every interaction; no cinematic choreography, no decoration for its own sake. Trust is the product — the interface must feel like it audits itself.

## 2. Color Palette & Roles

One palette across light and dark. One accent. Status hues are semantic (they report data), never decorative.

### Light theme
- **Canvas White** (#F6F7F8) — app background surface
- **Pure Surface** (#FFFFFF) — cards, modals, table surface fill
- **Charcoal Ink** (#1B1E23) — primary text (never pure black)
- **Muted Steel** (#5F6570) — secondary text, descriptions, metadata (4.54:1 on Canvas White — AA pass, verified)
- **Whisper Border** (#E4E6EA) — 1px structural lines, table row dividers
- **Signal Emerald** (#087A52) — the single accent: CTAs, active states, focus rings, Recovered metric (saturation ~74%, under the 80% bar; white-on-emerald text = 4.9:1 AA pass, verified)

### Dark theme
- **Graphite Canvas** (#111317) — app background
- **Charcoal Surface** (#191C21) — cards, modals, table surface
- **Ink on Dark** (#E8EAED) — primary text
- **Steel Whisper** (#A7ADBA) — secondary text (7.0:1 on Graphite Canvas — AA pass, verified)
- **Night Border** (#2A2E35) — structural lines
- **Signal Emerald** (#2DB98A) — accent, dark-mode calibrated (still one accent)

### Semantic status hues (report data, not decorate)
- **Waste Amber** (#8A5A00 light / #E0A93E dark) — wasted $, inactive-seats and trial-drift flags, "waste %" emphasis (light: 4.7:1 on Canvas White — AA pass)
- **Risk Amber** (#9A4A08 light / #E0862E dark) — upcoming-renewal flags (light: 4.9:1 on Canvas White — AA pass)
- Neutral Zinc — cancelled status, null-savings risk notices

Rules: **max 1 accent** (Signal Emerald). No purple, no neon, no gradients on UI chrome, no pure black (#000000) anywhere. Status hues appear only where data justifies them — never as decoration. All text pairs verified ≥ 4.5:1 for AA.

## 3. Typography Rules

- **UI/Display:** Geist — track-tight headings (letter-spacing −0.01em to −0.02em), weight-driven hierarchy (600/500/400), never size-screaming; H1 1.875rem max in-app
- **Body:** Geist — relaxed leading (1.6), 65ch max measure, Muted Steel color for secondary prose
- **Numbers:** **Geist Mono with tabular numerals for ALL currency, seat counts, dates, and metrics** — high-density override (density > 7 rule): every dollar figure, seat ratio, and renewal date in tables, metric cards, and alert impact lines is mono. Numbers are the loudest element on screen
- **Banned:** Inter (everywhere), generic serifs (everywhere — this is a dashboard), system-ui as the primary identity font

## 4. Component Stylings

- **Buttons:** Flat fill. Primary = Signal Emerald fill, white text; secondary = ghost with Whisper Border. Tactile −1px translate + 98% scale on :active. Focus ring 2px accent, offset 2px. **No outer glows, no gradient buttons, no custom cursors.**
- **Cards:** Used ONLY where elevation communicates hierarchy — the five metric cards and the alerts panel. Generous 1rem radius (not 2.5rem — density 7 is not a gallery), diffused whisper shadow tinted to the canvas hue. Tables do NOT get cards: they use border-top dividers on the canvas.
- **Metric strip:** NOT five equal cards. One hero metric — **Wasted Monthly** — at 2× visual weight (larger mono figure, Waste Amber figure color), flanked by the four secondary metrics at equal, restrained scale. Asymmetry communicates priority: the waste number is the product's thesis.
- **Inputs:** Label above, helper text optional, error text below in Risk Amber. Focus ring accent. No floating labels. Number inputs mono.
- **Tables:** Sticky header, row height 44px minimum, mono numbers right-aligned, status badges = dot + label (not filled pills). Sortable headers are buttons with visible direction indicators and aria-sort.
- **Loaders:** Skeleton shimmer matching exact layout dimensions. No circular spinners anywhere.
- **Empty states:** Composed, quiet moments — e.g., pre-analysis: a faded spark-line glyph + "Run analysis to detect waste." Never a blank box, never clip-art.
- **Alerts panel rows:** flag-type badge (semantic hue), subscription name (UI font), $ impact in mono (Waste Amber for savings figures; "Risk" label for null-savings), one-line recommendation in body size. Actions are quiet ghost buttons; destructive-adjacent (dismiss) is plain, not red.

## 5. Layout Principles

- **App:** max-width 1400px centered. 12-col CSS Grid. Metrics strip → alerts panel (2fr) + renewals mini-list (1fr) split → subscriptions table full-width. Panel/table sections separated by whitespace and border-top dividers, not nested cards.
- **Landing:** asymmetric split hero — left-aligned headline, never centered (variance > 4). Inline image typography: small rounded photos/visuals embedded at type-height inside the headline as visual punctuation (stack below headline on mobile). No overlapping elements — every element owns clean spatial zones.
- No 3-column equal card rows anywhere (the "how it works" steps use a 2-col zig-zag or numbered asymmetric grid).
- CSS Grid over flexbox math; no `calc()` percentage hacks. Full-height sections use `min-h-[100dvh]`, never `h-screen`.
- Generous internal padding (24px+ inside panels); compact but breathable tables.

## 6. Motion & Interaction

- Spring physics default: stiffness 100, damping 20 — weighty, premium. No linear easing on interactive elements.
- Staggered cascade reveals for alert rows and table rows (40ms waterfall, max ~400ms total) — never instant mass-mount.
- Perpetual micro-loop: skeleton shimmer while loading; subtle 2s pulse on the "Run analysis" primary button ONLY while an analysis is in flight.
- Animate **exclusively** `transform` and `opacity`. Never `top/left/width/height`.
- Respect `prefers-reduced-motion`: all cascades and pulses collapse to opacity-only.

## 7. Responsive Rules

- Below 768px: every multi-column layout collapses to single column. No exceptions. No horizontal page scroll (deliberate in-table scroll with sticky first column is the only sanctioned overflow).
- Headlines scale via `clamp()`. Body minimum 1rem. All touch targets ≥ 44px (table rows comply via 44px row height).
- Landing inline images stack below the headline on mobile.
- Desktop nav collapses to a clean mobile menu.

## 8. Anti-Patterns (Banned — QA enforces)

- No emojis anywhere in UI or copy
- No Inter font; no generic serif; no serif in the dashboard
- No pure black (#000000); no neon or outer-glow shadows; no oversaturated accents
- No 3-column equal card rows; no centered hero (landing); no nested cards-inside-cards
- No overlapping or absolutely-stacked content
- No custom mouse cursors; no gradient text on large headers
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Supercharge"
- No fake round numbers or invented claims on the landing page ("$12,499.99 saved on average") — problem stats stay generic and honest
- No filler UI text: "Scroll to explore", "Swipe down", bouncing chevrons
- No broken stock images — use picsum.photos or purpose-built SVG only; demo vendor data uses recognizable real SaaS names (Figma, GitHub, Slack) as seed content, which is intentional demo realism, not placeholder slop
