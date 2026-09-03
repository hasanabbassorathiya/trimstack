# TrimStack Development Tasks

**Project**: TrimStack — B2B SaaS spend-visibility web app (Startup MVP, NEXUS-Sprint mode)
**Source of truth**: `trimstack/project-specs/trimstack-setup.md` (this task list quotes it verbatim; where interpretation was needed it is marked as a **PM Clarification** and flagged in Technical Notes)
**Monorepo root**: `trimstack/` → `server/` + `web/` (+ root-level Playwright/QA tooling)

---

## Specification Summary

**Original Requirements (verbatim from spec)**:

### F1. Subscription Registry (core)
> "CRUD for SaaS subscriptions with fields: name, vendor, category (enum: dev, design, marketing, sales, productivity, security, analytics, hr, other), monthly cost (USD), billing cycle (monthly/annual), renewal date, seats provisioned, seats active (last 30 days), owning department, status (active / trial / cancelled), notes."
> "List view of all subscriptions, sortable by cost and renewal date, searchable by name/vendor."
> "Seed data: 24 realistic demo subscriptions on first run (idempotent — never duplicates)."

### F2. Waste Detection Engine (core)
> "Runs on demand (button: 'Run analysis' — no background jobs) and computes per-subscription flags:
> 1. **Inactive seats**: provisioned > active; waste = cost × (provisioned − active) / provisioned.
> 2. **Upcoming renewal**: renewal date within 30 days.
> 3. **Trial drift**: status = trial AND renewal date within 14 days (auto-conversion risk).
> 4. **Duplicate spend**: ≥2 active subscriptions in the same category owned by different departments → flags all but the cheapest as duplicates.
> Each flag carries a potential monthly savings figure where computable."

### F3. Optimization Alerts (core)
> "Alerts panel listing all flags sorted by potential savings (desc), each with: type, subscription, $ impact, one-line recommendation ('Downgrade 47 unused seats in Figma…')."
> "Alert actions: Resolve (marks resolved, records action taken) and Dismiss."
> "Resolved alert shows recovery total in dashboard 'Recovered' metric."

### F4. Dashboard (core)
> "Metrics at top: total monthly spend, projected annual spend, wasted monthly $ (sum of open flags), recovered $ (resolved), waste as % of spend. Below: alerts panel (F3), subscriptions table (F1), upcoming renewals (next 60 days) mini-list."

### F5. Waste Report Export (core)
> "'Export CSV' button producing a finance-friendly CSV of all open alerts (subscription, flag type, monthly savings, recommendation, status)."

### F6. Marketing Landing Page (week-3 growth)
> "Single static landing page: headline, problem stats, how-it-works (3 steps), CTA to app. Linked from app nav. Used for launch content in Phase 7."

### Non-Functional Requirements (verbatim)
> - "Light/Dark/System theme toggle in header (persisted in localStorage)."
> - "Responsive: usable at 375px, 768px, 1280px+."
> - "Accessibility: semantic HTML, WCAG 2.1 AA color contrast, keyboard navigable."
> - "Performance: dashboard interactive < 3s locally; API p95 < 200ms."
> - "Security: input validation on all API endpoints (Zod); no secrets in repo; parameterized queries."

### Explicitly OUT of Scope (v1) — do NOT build these
> "SSO/login, SaaS vendor integrations (Okta/Slack/SSO APIs), email sending, background schedulers/cron, multi-tenancy, payments, AI recommendations, mobile apps, i18n."

### Definition of Done (per task, verbatim)
> "Task is done when: implementation matches spec, typecheck + unit tests pass, and Evidence Collector QA produces screenshot evidence of it working. Pipeline advances only on QA PASS."

**Technical Stack (verbatim)**:
> - "**Monorepo layout**: `trimstack/` → `server/` + `web/`"
> - "**Backend**: Node 26 + Express 5 + TypeScript, better-sqlite3 (file DB, zero-config, seeded idempotently), Zod validation, REST API with JSON error envelope."
> - "**Frontend**: React 19 + Vite + TypeScript, Tailwind CSS v4, no heavy UI libs — hand-built components from design system."
> - "**Testing**: Vitest for unit tests (waste engine must have unit tests); Playwright for E2E + screenshot capture script `qa-playwright-capture.sh` producing `qa-screenshots/` (desktop/tablet/mobile/dark-mode/interaction before-afters + test-results.json)."
> - "**DevOps**: Dockerfile, GitHub Actions CI (typecheck → lint → unit tests → build), `npm run verify` script running the full local gate."

**Success Criteria (verbatim)**:
> 1. "New user can understand their SaaS waste in < 60 seconds from landing on dashboard."
> 2. "All four waste flags produce correct savings math (unit-tested)."
> 3. "CSV export opens clean in Excel/Numbers."
> 4. "Reality Check certification with screenshot evidence of every user journey."

---

## Phase Plan (dependency order)

| Phase | Tasks | Focus | Rough timing |
|---|---|---|---|
| Phase 0 — Scaffold | 1–3 | Monorepo, server workspace, web workspace | Day 1 |
| Phase 1 — Backend foundation | 4–7 | DB schema, idempotent seed, Zod validation, F1 CRUD API | Days 2–3 |
| Phase 2 — Waste engine | 8–9 | Detection engine (pure module) + mandatory unit tests | Days 3–4 |
| Phase 3 — Feature API | 10–13 | F2 analysis, F3 alert actions, F4 summary, F5 CSV export | Days 4–5 |
| Phase 4 — Frontend | 14–23 | Shell/theme, dashboard, table, form, alerts, renewals, export, responsive/a11y pass | Days 5–9 |
| Phase 5 — QA tooling & CI | 24–25 | `qa-playwright-capture.sh` + E2E, GitHub Actions + Dockerfile + `npm run verify` | Days 9–10 |
| Phase 6 — Landing page | 26 | F6 static landing page | Week 3 |
| Phase 7 — Integration & certification | 27 | Full-journey E2E, performance, Reality Check evidence pack | Week 3 |

---

## Development Tasks

### [ ] Task 1: Root Monorepo Scaffold
**Phase 0 — Scaffold**
**Description**: Create the `trimstack/` monorepo root with npm workspaces covering `server/` and `web/`, shared TypeScript config, and root scripts (`typecheck`, `lint`, `test`, `build`, `verify`). The `verify` script chains the spec's full local gate: typecheck → lint → unit tests → build. Create `.gitignore` (node_modules, dist, `server/data/*.sqlite`, `qa-screenshots/`, `test-results/`, playwright artifacts) and a `.env.example` (placeholders only — no real secrets ever committed).
**Acceptance Criteria**:
- `npm install` at `trimstack/` root resolves both workspaces without errors
- Root scripts exist and run (may trivially pass until Tasks 2–3 flesh out the workspaces): `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run verify`
- `tsconfig.base.json` shared config with `strict: true` referenced by both workspace tsconfigs
- `.gitignore` excludes the SQLite data files, build output, and QA screenshot output
- `.env.example` documents every env var (see Technical Notes) with placeholder values; repo contains zero real secrets

**Files to Create/Edit**:
- `package.json` (root, workspaces + scripts)
- `tsconfig.base.json`
- `.gitignore`
- `.env.example`
- `README.md` (short: how to install/run the local gate)
- `server/package.json` (stub so workspace resolves)
- `web/package.json` (stub so workspace resolves)

**Reference**: "Monorepo layout: `trimstack/` → `server/` + `web/`"; DevOps bullet ("`npm run verify` script running the full local gate")

---

### [ ] Task 2: Server Workspace Scaffold (Express 5 + Error Envelope)
**Phase 0 — Scaffold**
**Description**: Stand up the `server/` workspace: Node 26 + Express 5 + TypeScript with `better-sqlite3`, `zod`, and `vitest` installed. Create the app factory (`app.ts`), entry module (`index.ts`), a global JSON error envelope middleware (shape: `{ "error": { "message": string, "details"?: array } }` with correct HTTP status codes), a 404 catch-all, and a `GET /api/health` endpoint. Add a Vitest config plus one trivial smoke test so `npm test -w server` runs. CORS enabled for the local Vite origin (see Technical Notes for ports).
**Acceptance Criteria**:
- `server/` typecheck passes (`tsc --noEmit`) under strict mode
- `GET /api/health` returns `200` with `{ "status": "ok" }` JSON
- Malformed JSON request body returns `400` with the JSON error envelope (no stack traces leaked)
- Zod validation errors map to `400` with `details` array (verified by a unit test hitting the middleware path)
- Unknown routes return `404` with the error envelope
- Vitest runs and the smoke test passes

**Files to Create/Edit**:
- `server/package.json`
- `server/tsconfig.json`
- `server/vitest.config.ts`
- `server/src/index.ts` (entry — starts listener; the file exists but no task instruction ever starts the server)
- `server/src/app.ts` (app factory)
- `server/src/middleware/errorHandler.ts`
- `server/src/routes/health.ts`
- `server/src/__tests__/health.test.ts`

**Reference**: "Backend: Node 26 + Express 5 + TypeScript, better-sqlite3 (file DB, zero-config, seeded idempotently), Zod validation, REST API with JSON error envelope."; NFR "input validation on all API endpoints (Zod)"

---

### [ ] Task 3: Web Workspace Scaffold (React 19 + Vite + Tailwind v4)
**Phase 0 — Scaffold**
**Description**: Stand up the `web/` workspace: React 19 + Vite + TypeScript with Tailwind CSS v4 (via the `@tailwindcss/vite` plugin, CSS-first config — no `tailwind.config.js` needed). Create the entry (`main.tsx`), a minimal `App.tsx` that renders a placeholder dashboard shell, base `theme.css` with Tailwind import and design tokens (light + dark CSS variables). Add ESLint + typecheck scripts and a production build config.
**Acceptance Criteria**:
- `npm run build -w web` produces a `dist/` bundle with no errors
- `web/` typecheck passes under strict mode
- Tailwind v4 utility classes compile and apply (verified by a class present in the shell)
- Vite dev config proxies `/api` to the local server origin (see Technical Notes) so the frontend can call the API same-origin in dev
- App shell renders placeholder content with no console errors

**Files to Create/Edit**:
- `web/package.json`
- `web/vite.config.ts`
- `web/tsconfig.json` (+ `tsconfig.node.json` if Vite requires)
- `web/index.html`
- `web/src/main.tsx`
- `web/src/App.tsx`
- `web/src/styles/theme.css`

**Reference**: "Frontend: React 19 + Vite + TypeScript, Tailwind CSS v4, no heavy UI libs — hand-built components from design system."

---

### [ ] Task 4: Database Schema + Connection Module
**Phase 1 — Backend foundation**
**Description**: Create the better-sqlite3 file-backed database module and schema. DB file lives at `server/data/trimstack.sqlite` (path overridable via `DB_PATH` env; the `data/` dir and file are gitignored). Schema applied idempotently on boot via `CREATE TABLE IF NOT EXISTS`:
- `subscriptions`: `id`, `name`, `vendor`, `category` (9-value enum), `monthly_cost` (REAL, USD), `billing_cycle` (monthly/annual), `renewal_date` (ISO date string), `seats_provisioned` (int), `seats_active` (int, last 30 days), `owning_department`, `status` (active/trial/cancelled), `notes`, `created_at`, `updated_at`
- `flags`: `id`, `subscription_id` (FK), `flag_type` (inactive_seats / upcoming_renewal / trial_drift / duplicate_spend), `status` (open/resolved/dismissed), `estimated_monthly_savings` (REAL, nullable), `recommendation` (TEXT), `detected_at`, `resolved_at` (nullable), `action_taken` (nullable), unique key on (`subscription_id`, `flag_type`)
All access goes through prepared statements — no string-concatenated SQL anywhere.
**Acceptance Criteria**:
- Booting the server twice in a row does not error and does not duplicate schema/rows (idempotent DDL)
- Every query in the codebase uses a better-sqlite3 prepared statement with bound parameters (grep-verifiable: zero template-literal SQL)
- `DB_PATH` env var overrides the default file location
- Flag rows enforce uniqueness on (`subscription_id`, `flag_type`) at the DB level
- Unit test creates a temp DB, applies schema, inserts and reads back a subscription row

**Files to Create/Edit**:
- `server/src/db/database.ts`
- `server/src/db/schema.ts`
- `server/data/.gitkeep`
- `server/src/__tests__/database.test.ts`
- `.gitignore` (confirm `server/data/*.sqlite` excluded)

**Reference**: "better-sqlite3 (file DB, zero-config, seeded idempotently)"; NFR "parameterized queries"; F1 field list

---

### [ ] Task 5: Idempotent Seed — 24 Realistic Demo Subscriptions
**Phase 1 — Backend foundation**
**Description**: Write the seed module that runs on first boot only: if the `subscriptions` table is non-empty, skip entirely; otherwise insert exactly **24 realistic demo subscriptions** (recognizable SaaS vendors — e.g. Figma, GitHub, Slack, Notion, Zoom, Datadog, HubSpot, 1Password — spread across all 9 categories and several owning departments) with realistic seats, costs, renewal dates, and statuses. The seed **must include data that triggers all four waste flags** when analysis runs (≥1 subscription with `seats_provisioned > seats_active`, ≥1 renewal within 30 days, ≥1 trial with renewal within 14 days, ≥1 duplicate-spend cluster: 2+ active subs in the same category owned by different departments), plus a few clean subscriptions that produce no flags. Renewal dates must be computed **relative to seed time** (e.g. `now + N days`) so the demo never goes stale — with the fixed 24-row catalog stored as data.
**Acceptance Criteria**:
- First boot on an empty DB seeds exactly 24 subscriptions (asserted by unit test on a temp DB)
- Second boot on the seeded DB still has exactly 24 rows — seed never duplicates ("idempotent — never duplicates")
- Deleting the DB file and rebooting re-seeds 24 rows
- Seed data triggers at least one instance of each of the four flag types (asserted by running the engine from Task 8, or temporarily by direct formula check in the test)
- All 9 categories and ≥3 owning departments are represented; ≥1 subscription is `trial`, ≥1 is `cancelled`

**Files to Create/Edit**:
- `server/src/db/seedData.ts` (the 24-row catalog with relative date offsets)
- `server/src/db/seed.ts` (first-run guard + insert via prepared statements)
- `server/src/__tests__/seed.test.ts`

**Reference**: F1 — "Seed data: 24 realistic demo subscriptions on first run (idempotent — never duplicates)."

---

### [ ] Task 6: Zod Validation Layer
**Phase 1 — Backend foundation**
**Description**: Create the shared Zod schemas and a `validate` helper/middleware used by every route:
- `subscriptionCreateSchema` / `subscriptionUpdateSchema` covering all F1 fields: `name` (non-empty string), `vendor` (string), `category` enum (dev, design, marketing, sales, productivity, security, analytics, hr, other), `monthlyCost` (positive number), `billingCycle` enum (monthly/annual), `renewalDate` (ISO date string, valid calendar date), `seatsProvisioned` (int ≥ 0), `seatsActive` (int ≥ 0, **≤ seatsProvisioned**), `owningDepartment` (string), `status` enum (active/trial/cancelled), `notes` (string, optional)
- `resolveAlertSchema` requiring a non-empty `actionTaken` string
Rejected payloads return `400` with the error envelope including per-field `details`. Update schemas make all fields optional but re-validate cross-field rules (seats) when present.
**Acceptance Criteria**:
- Invalid category/status/billingCycle enum values are rejected with a 400 and field-level details
- `monthlyCost ≤ 0`, non-integer seats, negative seats, and invalid dates are rejected
- `seatsActive > seatsProvisioned` is rejected (cross-field validation)
- Valid payloads parse to a typed object consumed by routes
- Unit tests cover each rejection case + the happy path (Vitest)

**Files to Create/Edit**:
- `server/src/validation/schemas.ts`
- `server/src/validation/validate.ts`
- `server/src/__tests__/validation.test.ts`

**Reference**: NFR — "Security: input validation on all API endpoints (Zod)"; F1 field definitions

---

### [ ] Task 7: F1 Subscription CRUD Endpoints
**Phase 1 — Backend foundation**
**Description**: Implement the subscription registry REST endpoints, all validated via Task 6 schemas and all using prepared statements:
- `GET /api/subscriptions` — list all; supports `q` (search by name OR vendor, case-insensitive), `sort` (`cost` | `renewal`), `order` (`asc` | `desc`, default desc). Sorting/searching done server-side (SQL `ORDER BY` + `WHERE`, parameterized).
- `GET /api/subscriptions/:id` — single or 404
- `POST /api/subscriptions` — create (201)
- `PUT /api/subscriptions/:id` — update (404 if missing)
- `DELETE /api/subscriptions/:id` — delete (204; cascades/deletes its flag rows so stale alerts don't dangle)
Route tests use supertest (or direct app invocation) against a temp seeded DB.
**Acceptance Criteria**:
- All five operations work end-to-end against a temp DB (route tests)
- `?q=fig` matches subscriptions by name or vendor case-insensitively; `?sort=cost&order=desc` returns highest monthly cost first; `?sort=renewal&order=asc` returns soonest renewal first
- Missing id returns 404 with the error envelope; invalid body returns 400 with details
- Deleting a subscription removes its flags (no orphan rows — verified by test)
- Full response field set matches the F1 spec fields exactly (no extra invented fields)

**Files to Create/Edit**:
- `server/src/routes/subscriptions.ts`
- `server/src/app.ts` (mount router)
- `server/src/__tests__/subscriptions.routes.test.ts`

**Reference**: F1 — "CRUD for SaaS subscriptions…" + "List view of all subscriptions, sortable by cost and renewal date, searchable by name/vendor."

---

### [ ] Task 8: Waste-Detection Engine (Pure Module)
**Phase 2 — Waste engine**
**Description**: Implement the four detectors as a **pure, DB-free TypeScript module** — `analyzeSubscriptions(subscriptions, today?: Date): Flag[]` — so it is fully unit-testable:
1. **Inactive seats**: for non-cancelled subscriptions where `seatsProvisioned > seatsActive`: `savings = monthlyCost × (provisioned − active) / provisioned`
2. **Upcoming renewal**: `renewalDate` within 30 days (inclusive, see PM Clarification) — savings `null` (not computable)
3. **Trial drift**: `status = trial` AND renewal within 14 days — savings `null` (auto-conversion risk notice)
4. **Duplicate spend**: group active subscriptions by category; a group with ≥2 subs owned by **different departments** flags all but the cheapest as duplicates; savings = flagged subscription's `monthlyCost` (see PM Clarification)
Each returned flag carries: `subscriptionId`, `flagType`, `estimatedMonthlySavings` (nullable), and a **one-line recommendation** (e.g. "Downgrade 47 unused seats in Figma…", "Cancel duplicate analytics tool — keep the cheapest"). `today` is injectable for deterministic tests (defaults to real current date).
**Acceptance Criteria**:
- Module has zero imports from the DB layer — pure function of its inputs
- All four flag types implement the exact spec formulas (no rounding drift; savings to 2 decimal places)
- Deterministic: same input + same `today` → identical output
- Recommendation strings are one line and include the subscription name and concrete action
- Duplicate detection only considers `status = active` subs; cancelled subs never produce flags (test-covered)

**Files to Create/Edit**:
- `server/src/engine/wasteEngine.ts`
- `server/src/engine/types.ts` (shared `Flag` / `FlagType` types)

**Reference**: F2 — all four flag definitions and formulas; "Each flag carries a potential monthly savings figure where computable."

---

### [ ] Task 9: Waste-Engine Unit Tests (Mandatory)
**Phase 2 — Waste engine**
**Description**: Write the comprehensive Vitest suite for Task 8. **This suite is a spec success criterion ("All four waste flags produce correct savings math (unit-tested)") — non-negotiable.** Use a fixed `today` date and hand-built fixtures.
**Acceptance Criteria — each of the four flag types has dedicated tests covering**:
- **Inactive seats**: exact math `cost × (provisioned − active) / provisioned` (e.g. 60 provisioned, 13 active, $230/mo → $180.17 to 2dp); no flag when `provisioned === active` or `active > provisioned`; no flag for cancelled subs; waste scales with the unused-seat fraction
- **Upcoming renewal**: flagged at exactly 30 days out and at 1 day out; not flagged at 31 days; not flagged for past-due/cancelled subs
- **Trial drift**: trial + renewal at exactly 14 days → flagged; trial + 15 days → not; active (non-trial) + 14 days → not (only the renewal flag applies)
- **Duplicate spend**: 3 active same-category subs in 2 different departments → the 2 more expensive are flagged, cheapest is not; savings per flagged sub = its own monthly cost; same-department duplicates → no flag; category with only 1 active sub → no flag; cheapest-sub tie broken deterministically (by name)
- **Boundary/math assertions**: penny-exact savings values; flags sorted or sortable by savings; empty input → no flags; all tests run green under `npm test -w server`

**Files to Create/Edit**:
- `server/src/engine/__tests__/wasteEngine.test.ts`
- `server/src/engine/__tests__/fixtures.ts` (reusable subscription fixtures)

**Reference**: F2 formulas; Success Criteria #2 — "All four waste flags produce correct savings math (unit-tested)."

---

### [ ] Task 10: F2 Analysis Run + Alerts List Endpoints
**Phase 3 — Feature API**
**Description**: Wire the engine to the API — **on demand only, no background jobs**:
- `POST /api/analysis/run` — loads all subscriptions from the DB, runs `analyzeSubscriptions`, then **upserts** flags into the `flags` table keyed on (`subscription_id`, `flag_type`): newly detected flags insert as `open`; re-detected flags refresh `estimated_monthly_savings`, `recommendation`, and `detected_at`; flags that are already `resolved`/`dismissed` **keep their status** (a re-run never resets recovery history); flags no longer detected (problem fixed) and still `open` are closed/removed from the open list. Returns a run summary (`flagsByType` counts, `totalPotentialMonthlySavings`).
- `GET /api/alerts?status=open` — lists flags (joined with subscription name/vendor) sorted by `estimated_monthly_savings` DESC, nulls last.
- **First-run bootstrap**: immediately after the initial seed on a fresh DB, invoke the analysis once (inline, at boot — still no scheduler/cron) so a brand-new install shows waste on the dashboard the first time it's opened (Success Criterion #1).
**Acceptance Criteria**:
- `POST /api/analysis/run` twice in a row produces no duplicate flag rows (unique key respected — test-verified)
- Resolving an alert then re-running analysis keeps it resolved (Recovered metric does not reset)
- Alerts endpoint returns flags sorted by potential savings desc, nulls (renewal/trial) last
- Fresh-DB boot (seed + bootstrap analysis) leaves the dashboard data ready with zero user actions
- Route tests cover run → list → re-run idempotency

**Files to Create/Edit**:
- `server/src/routes/analysis.ts`
- `server/src/routes/alerts.ts`
- `server/src/db/flagsRepository.ts` (upsert/list logic, prepared statements)
- `server/src/db/seed.ts` (trigger one-time bootstrap analysis after first seed)
- `server/src/__tests__/analysis.routes.test.ts`

**Reference**: F2 — "Runs on demand (button: 'Run analysis' — no background jobs)"; F3 — "Alerts panel listing all flags sorted by potential savings (desc)"; Success Criterion #1; NFR excludes "background schedulers/cron"

---

### [ ] Task 11: F3 Alert Resolve/Dismiss Endpoints
**Phase 3 — Feature API**
**Description**: Implement alert lifecycle actions:
- `POST /api/alerts/:id/resolve` — body `{ "actionTaken": "..." }` (validated by Task 6 `resolveAlertSchema`); sets `status = resolved`, stores `action_taken`, stamps `resolved_at`. Only valid on an `open` alert.
- `POST /api/alerts/:id/dismiss` — sets `status = dismissed`. Only valid on an `open` alert.
Acting on a non-open (already resolved/dismissed) or missing alert returns `409`/`404` respectively with the error envelope. Resolved savings feed the dashboard "Recovered" metric via Task 12.
**Acceptance Criteria**:
- Resolve records the action-taken text and a timestamp (both persisted — test-verified)
- Dismiss sets status without touching recovery totals
- Resolving then re-running analysis does not resurrect the alert as open
- Invalid/empty `actionTaken` → 400; unknown id → 404; double-resolve → 409
- Route tests cover resolve, dismiss, and each error case

**Files to Create/Edit**:
- `server/src/routes/alerts.ts` (extend)
- `server/src/db/flagsRepository.ts` (extend)
- `server/src/__tests__/alerts.routes.test.ts`

**Reference**: F3 — "Alert actions: Resolve (marks resolved, records action taken) and Dismiss."; "Resolved alert shows recovery total in dashboard 'Recovered' metric."

---

### [ ] Task 12: F4 Dashboard Summary Endpoint
**Phase 3 — Feature API**
**Description**: Implement `GET /api/dashboard/summary` returning:
- `totalMonthlySpend` — sum of `monthly_cost` for status `active` + `trial` subscriptions (cancelled = not spending; see PM Clarification)
- `projectedAnnualSpend` — `totalMonthlySpend × 12`
- `wastedMonthly` — sum of `estimated_monthly_savings` across **open** flags
- `recoveredTotal` — sum of `estimated_monthly_savings` across **resolved** flags
- `wastePercent` — `wastedMonthly / totalMonthlySpend × 100` (0 if spend is 0)
- `upcomingRenewals` — subscriptions with renewal date in the next 60 days (inclusive), sorted soonest first: `{ name, vendor, renewalDate, monthlyCost }` — feeds the F4 mini-list
All math in a small pure function with its own unit tests, plus a route test.
**Acceptance Criteria**:
- Every metric matches a hand-computed value from the seeded fixture in tests (penny-exact)
- Renewals list contains only dates ≤ 60 days out, sorted ascending, and excludes cancelled subs
- `wastePercent` handles zero-spend without dividing by zero (returns 0)
- p95 latency comfortably < 200ms for a 24-sub dataset (assert response time in test as a sanity ceiling, e.g. < 200ms single-call)

**Files to Create/Edit**:
- `server/src/routes/dashboard.ts`
- `server/src/engine/metrics.ts` (pure metric calculations)
- `server/src/engine/__tests__/metrics.test.ts`
- `server/src/__tests__/dashboard.routes.test.ts`

**Reference**: F4 — "Metrics at top: total monthly spend, projected annual spend, wasted monthly $ (sum of open flags), recovered $ (resolved), waste as % of spend… upcoming renewals (next 60 days) mini-list."; NFR "API p95 < 200ms"

---

### [ ] Task 13: F5 CSV Export Endpoint
**Phase 3 — Feature API**
**Description**: Implement `GET /api/export/alerts.csv`: streams/returns a finance-friendly CSV of **all open alerts** with columns exactly: `subscription, flag type, monthly savings, recommendation, status`. CSV writer must: quote fields containing commas/quotes/newlines (RFC 4180), escape inner quotes by doubling, use CRLF line endings, emit a UTF-8 BOM so Excel/Numbers detect encoding, and set `Content-Type: text/csv; charset=utf-8` + `Content-Disposition: attachment; filename="trimstack-waste-report.csv"`.
**Acceptance Criteria**:
- Exported CSV contains exactly the five spec columns, in order, for every open alert
- Fields containing commas/quotes (recommendations will) are properly quoted and parse cleanly (test parses the CSV back and compares rows)
- Opens clean in Excel/Numbers: UTF-8 BOM present, no mangled encoding, correct column split (manual spot-check documented with a screenshot during QA)
- Empty open-alerts set → CSV with header row only (not an error)
- Unit tests cover escaping (comma, quote, newline) and the header row

**Files to Create/Edit**:
- `server/src/routes/export.ts`
- `server/src/export/csv.ts` (pure CSV serializer)
- `server/src/__tests__/export.routes.test.ts` + `server/src/export/__tests__/csv.test.ts`

**Reference**: F5 — "'Export CSV' button producing a finance-friendly CSV of all open alerts (subscription, flag type, monthly savings, recommendation, status)."; Success Criterion #3

---

### [ ] Task 14: Web API Client + Shared Types
**Phase 4 — Frontend**
**Description**: Create the typed API layer for the frontend: a small `fetch` wrapper that prefixes `/api`, parses the JSON error envelope into typed errors (surfacing `message` + `details`), and exposes typed functions: `listSubscriptions({q, sort, order})`, `getSubscription`, `createSubscription`, `updateSubscription`, `deleteSubscription`, `runAnalysis`, `listAlerts`, `resolveAlert`, `dismissAlert`, `getDashboardSummary`, `getAlertsCsvUrl`. Mirror the server's TS types (`Subscription`, `Flag`/`Alert`, `DashboardSummary`, `AnalysisRunSummary`) in `web/src/api/types.ts` (duplicated deliberately — no cross-workspace import machinery; keep the two files in sync).
**Acceptance Criteria**:
- All API functions are typed end-to-end (no `any` on public surfaces)
- Non-2xx responses throw a typed error carrying the envelope's message and field details
- CSV export returns a URL/blob trigger (not JSON-parsed)
- Typecheck passes; a small unit test exercises error-envelope parsing with a mocked fetch

**Files to Create/Edit**:
- `web/src/api/client.ts`
- `web/src/api/types.ts`
- `web/src/api/__tests__/client.test.ts` (Vitest setup in web if not present; otherwise a typecheck-only assertion — keep minimal)

**Reference**: "REST API with JSON error envelope"; all of F1–F5 (consumer side)

---

### [ ] Task 15: App Shell + Header Nav + Light/Dark/System Theme Toggle
**Phase 4 — Frontend**
**Description**: Build the app shell: header (product name, nav links: Dashboard, Landing), main landmark, and the **three-state theme toggle (Light / Dark / System)** per the NFR. Theme state persists in `localStorage` under a documented key; `System` follows `prefers-color-scheme` and reacts live to OS changes; the toggle applies Tailwind's dark class strategy on `<html>`. Add a skip-to-content link and visible focus styles (a11y foundation for Task 23). Define the base layout: max-width container, page padding, and metric/table spacing tokens used by later tasks.
**Acceptance Criteria**:
- Toggle cycles Light → Dark → System; selection persists across page reloads (localStorage)
- In System mode, changing the OS appearance flips the app live without reload
- Dark mode styles apply via the `dark` class on `<html>`; both themes meet AA contrast for text
- Toggle is a native button, keyboard operable, with an aria-label announcing current state
- App shell renders with semantic `<header>`, `<nav>`, `<main>` landmarks; typecheck passes

**Files to Create/Edit**:
- `web/src/App.tsx` (shell + routing between Dashboard/Landing)
- `web/src/components/Header.tsx`
- `web/src/components/ThemeToggle.tsx`
- `web/src/hooks/useTheme.ts`
- `web/src/styles/theme.css` (dark variables, focus styles)

**Reference**: NFR — "Light/Dark/System theme toggle in header (persisted in localStorage)."; F6 — "Linked from app nav" (nav link created here, target lands in Task 26)

---

### [ ] Task 16: Dashboard Metrics Cards (F4)
**Phase 4 — Frontend**
**Description**: Build the dashboard page top section with the **five spec metrics** as cards: Total Monthly Spend, Projected Annual Spend, Wasted Monthly (open flags), Recovered (resolved), and Waste as % of Spend. Data from `getDashboardSummary()`; include loading skeleton and error states. Cards refresh when the app emits an analysis/resolve event (simple shared state or refetch trigger — no state library required).
**Acceptance Criteria**:
- All five metrics render, labeled exactly per spec intent (total monthly spend, projected annual spend, wasted monthly $, recovered $, waste as % of spend)
- Values match the summary endpoint (spot-check against API response in QA)
- Currency formatted as USD ($X,XXX.XX); percent formatted with 1 decimal
- Loading and error states render without layout shift
- After running analysis or resolving an alert, metrics update without a full page reload

**Files to Create/Edit**:
- `web/src/pages/Dashboard.tsx`
- `web/src/components/MetricCard.tsx`
- `web/src/hooks/useDashboardData.ts` (or equivalent local state hook)

**Reference**: F4 — "Metrics at top: total monthly spend, projected annual spend, wasted monthly $ (sum of open flags), recovered $ (resolved), waste as % of spend."

---

### [ ] Task 17: Subscriptions Table UI (Sort + Search)
**Phase 4 — Frontend**
**Description**: Build the subscriptions table listing **all** F1 fields: name, vendor, category, monthly cost, billing cycle, renewal date, seats provisioned/active, owning department, status (as a badge), notes. Column headers **Cost** and **Renewal Date** are sortable (server-side via Task 7 params, asc/desc toggle with visible sort indicator); a search input filters by name/vendor (server-side `q`). At 375px the table degrades to a stacked/card layout (or horizontally scrollable with all data reachable — pick one, keep it usable).
**Acceptance Criteria**:
- All 24 seeded subscriptions render on load with every spec field visible
- Clicking Cost toggles asc/desc (verified by observing the first row change); same for Renewal Date
- Typing in search filters by name or vendor (case-insensitive)
- Status shows as a distinct badge (active/trial/cancelled); seats shown as `active/provisioned`
- Table is keyboard navigable (headers are buttons), sortable controls have aria-labels, and layout is usable at 375px

**Files to Create/Edit**:
- `web/src/components/SubscriptionsTable.tsx`
- `web/src/components/StatusBadge.tsx`
- `web/src/hooks/useSubscriptions.ts`

**Reference**: F1 — "List view of all subscriptions, sortable by cost and renewal date, searchable by name/vendor."; F4 — "subscriptions table (F1)"

---

### [ ] Task 18: Subscription Create/Edit/Delete UI (F1 CRUD)
**Phase 4 — Frontend**
**Description**: Build the CRUD form: an "Add subscription" button opening a modal (or inline panel) with fields for every F1 property — text inputs (name, vendor, department, notes), selects for category (9 values), billing cycle, status; number inputs for monthly cost and seats; a date input for renewal date. Edit reuses the same form prefilled; delete asks for confirmation. Client-side validation mirrors the Zod rules (positive cost, seats_active ≤ seats_provisioned) with inline error messages; the server remains the source of truth.
**Acceptance Criteria**:
- Creating a subscription closes the form, shows a success state, and the new row appears in the table (without reload)
- Editing pre-fills all fields; saving persists changes visible in the table
- Deleting requires confirmation and removes the row
- Invalid input (e.g. seats active > provisioned, cost ≤ 0) shows inline errors before submit; server 400s also render field details
- Modal traps focus, closes on Esc/overlay click, and returns focus to the trigger button (a11y)

**Files to Create/Edit**:
- `web/src/components/SubscriptionForm.tsx`
- `web/src/components/Modal.tsx`
- `web/src/components/SubscriptionsTable.tsx` (edit/delete row actions)

**Reference**: F1 — "CRUD for SaaS subscriptions with fields: name, vendor, category…"

---

### [ ] Task 19: Run Analysis Button + Alerts Panel (F2/F3 UI)
**Phase 4 — Frontend**
**Description**: Build the alerts experience: a prominent **"Run analysis"** button (per spec — on demand, no background jobs) that calls `runAnalysis()` then refreshes the alerts list and dashboard metrics. The alerts panel lists **open flags sorted by potential savings (desc)**, each row showing: flag type (labeled badge: Inactive seats / Upcoming renewal / Trial drift / Duplicate spend), subscription name, **$ impact** (or a risk label when savings is null), and the one-line recommendation. Empty state before the first run: "Run analysis to detect waste."
**Acceptance Criteria**:
- "Run analysis" button triggers the API run and the panel + metrics update without page reload; a pending state shows while running
- Alerts render sorted by savings desc; null-savings alerts (renewal/trial drift) sort after savings-bearing alerts
- Each alert displays exactly: type, subscription, $ impact, recommendation (all four per spec)
- Empty state (no open flags / never run) renders helpful copy, not a blank box
- Panel is reachable and readable at 375px and in dark mode

**Files to Create/Edit**:
- `web/src/components/AlertsPanel.tsx`
- `web/src/components/RunAnalysisButton.tsx`
- `web/src/components/FlagTypeBadge.tsx`
- `web/src/hooks/useAlerts.ts`

**Reference**: F2 — "Runs on demand (button: 'Run analysis'…)"; F3 — "Alerts panel listing all flags sorted by potential savings (desc), each with: type, subscription, $ impact, one-line recommendation"; F4 — "alerts panel (F3)"

---

### [ ] Task 20: Alert Resolve/Dismiss Actions UI
**Phase 4 — Frontend**
**Description**: Add per-alert actions: **Resolve** opens a small dialog requiring an "action taken" note (e.g. "Downgraded to 50 seats"), submits `resolveAlert`, and removes the alert from the open list; **Dismiss** removes it without recovery. After resolving, the dashboard **Recovered** metric visibly increases by that alert's savings. Provide undo-free but non-destructive UX: dismissed/resolved alerts simply leave the open list (status filter default is open).
**Acceptance Criteria**:
- Resolve requires non-empty action text (button disabled until entered); submitting records it and the alert leaves the open list
- Recovered metric increases by the resolved alert's savings immediately (no reload)
- Dismiss removes the alert and does NOT change Recovered
- Both actions show a brief pending state and handle API errors with a visible message
- Actions are keyboard operable; the resolve dialog traps focus and closes on Esc

**Files to Create/Edit**:
- `web/src/components/AlertsPanel.tsx` (extend with actions)
- `web/src/components/ResolveDialog.tsx`
- `web/src/hooks/useAlerts.ts` (extend)

**Reference**: F3 — "Alert actions: Resolve (marks resolved, records action taken) and Dismiss."; "Resolved alert shows recovery total in dashboard 'Recovered' metric."

---

### [ ] Task 21: Upcoming Renewals Mini-List (F4)
**Phase 4 — Frontend**
**Description**: Build the dashboard mini-list of **upcoming renewals in the next 60 days**, sourced from `getDashboardSummary().upcomingRenewals`: subscription name, renewal date (human-friendly, e.g. "Mar 14" + relative "in 12 days"), and monthly cost. Sorted soonest-first; empty state ("No renewals in the next 60 days") when the list is empty.
**Acceptance Criteria**:
- Renders only renewals ≤ 60 days out, soonest first (spot-check against seeded data)
- Each row shows name, date, and cost; dates include a relative hint
- Empty state renders when no renewals qualify
- Compact layout that works at 375px and in dark mode

**Files to Create/Edit**:
- `web/src/components/RenewalsList.tsx`
- `web/src/pages/Dashboard.tsx` (compose into layout below metrics, per F4)

**Reference**: F4 — "upcoming renewals (next 60 days) mini-list"

---

### [ ] Task 22: CSV Export Button (F5 UI)
**Phase 4 — Frontend**
**Description**: Add the **"Export CSV"** button (placement: alerts panel header or dashboard toolbar) that downloads the open-alerts report from `GET /api/export/alerts.csv`. Use a direct navigation/blob download so the browser saves `trimstack-waste-report.csv`. Disabled (with tooltip/reason) when there are no open alerts.
**Acceptance Criteria**:
- Clicking the button downloads a file that **opens clean in Excel/Numbers** (verified during QA with a screenshot of the opened file — columns split correctly, no encoding artifacts)
- Filename is `trimstack-waste-report.csv`; button disabled or hidden when no open alerts exist
- Works at all breakpoints and in both themes; keyboard operable

**Files to Create/Edit**:
- `web/src/components/ExportButton.tsx`
- `web/src/components/AlertsPanel.tsx` or `web/src/pages/Dashboard.tsx` (placement)

**Reference**: F5 — "'Export CSV' button producing a finance-friendly CSV of all open alerts"; Success Criterion #3

---

### [ ] Task 23: Responsive + Accessibility Conformance Pass
**Phase 4 — Frontend (final polish before QA tooling)**
**Description**: Systematic conformance pass across dashboard, table, form, alerts panel, renewals list, and header at **375px / 768px / 1280px+** in **both themes**: fix overflow/clipping, verify WCAG 2.1 AA contrast on all text/badge/UI colors, complete the keyboard journey (tab order logical, focus visible, Esc closes modals, focus restored), semantic landmarks, aria-labels on icon-only buttons, and `<table>` semantics with proper header cells.
**Acceptance Criteria**:
- No horizontal overflow or clipped content at 375px on any core view (allow deliberate table scroll with data reachable)
- All text/icon/badge color pairs pass AA contrast (4.5:1 text, 3:1 large/UI) in light AND dark themes — spot-check with a contrast tool, record values
- Full keyboard journey works: nav → metrics → table sort/search → add/edit form → run analysis → resolve alert → export, without a mouse
- Screen-reader spot-check: landmarks + button labels announced correctly
- No functional regressions; typecheck + unit tests still pass

**Files to Create/Edit**:
- `web/src/styles/theme.css` (contrast/token fixes)
- Targeted fixes across `web/src/components/*` and `web/src/pages/*` as found

**Reference**: NFRs — "Responsive: usable at 375px, 768px, 1280px+"; "Accessibility: semantic HTML, WCAG 2.1 AA color contrast, keyboard navigable"

---

### [ ] Task 24: Playwright E2E Specs + `qa-playwright-capture.sh` Capture Script
**Phase 5 — QA tooling**
**Description**: Create the root-level QA capture infrastructure: `qa-playwright-capture.sh` + Playwright config + core E2E specs. The script runs the Playwright suite against an **already-running** app (it must NOT start any servers — the orchestrator owns dev-server lifecycle; it accepts `BASE_URL`, default per Technical Notes) and produces `qa-screenshots/` with the spec-mandated captures: **desktop (1280) / tablet (768) / mobile (375) viewport sets, dark-mode captures, and interaction before-afters** (run-analysis before/after, resolve-alert before/after), plus a machine-readable **`test-results.json`**. Core specs: dashboard loads with metrics, subscriptions sort/search, run analysis produces alerts, resolve/dismiss updates Recovered, export downloads a CSV, theme toggle persists.
**Acceptance Criteria**:
- `./qa-playwright-capture.sh` (from `trimstack/`) runs the full suite and exits 0 on pass, non-zero on any failure — **contains zero server-start or background-process commands**
- `qa-screenshots/` is produced containing: desktop, tablet, and mobile captures of the dashboard; a dark-mode capture; before/after pairs for run-analysis and resolve-alert
- `test-results.json` is written summarizing pass/fail per spec
- Each core journey spec (metrics, sort/search, run analysis, resolve, export, theme) passes against the seeded demo data
- Script accepts `BASE_URL` env override (default: the web origin from Technical Notes)

**Files to Create/Edit**:
- `qa-playwright-capture.sh` (root of `trimstack/`, executable)
- `playwright.config.ts` (root; projects for 3 viewport sizes + dark mode)
- `e2e/dashboard.spec.ts`
- `e2e/subscriptions.spec.ts`
- `e2e/alerts.spec.ts`
- `e2e/export.spec.ts`
- `e2e/theme.spec.ts`

**Reference**: "Playwright for E2E + screenshot capture script `qa-playwright-capture.sh` producing `qa-screenshots/` (desktop/tablet/mobile/dark-mode/interaction before-afters + test-results.json)"; Definition of Done (screenshot evidence)

---

### [ ] Task 25: CI Pipeline + Dockerfile + `npm run verify`
**Phase 5 — QA tooling**
**Description**: Finalize DevOps per spec: GitHub Actions workflow (`.github/workflows/ci.yml`) running on push + PR with the exact spec gate order — **typecheck → lint → unit tests → build** — across both workspaces (Node 26). Add a production `Dockerfile` (multi-stage: install → build server + web → lean runtime) and `.dockerignore`, and finalize the root `npm run verify` script chaining the same four gates locally.
**Acceptance Criteria**:
- CI workflow YAML is valid and runs the four gates in order; a failing gate fails the pipeline (verify ordering by reading the workflow + observing a run)
- Both workspaces typecheck, lint, and build cleanly in CI on a fresh checkout
- Unit tests (including the mandatory waste-engine suite) run in CI and pass
- `npm run verify` at the repo root runs typecheck → lint → unit tests → build and exits 0 on the current tree
- `Dockerfile` multi-stage builds (validated locally or in CI when Docker is available; orchestrator/QA executes the build — no task instruction starts containers or servers)
- No secrets in the workflow; CI uses only public registry installs

**Files to Create/Edit**:
- `.github/workflows/ci.yml`
- `Dockerfile`
- `.dockerignore`
- `package.json` (finalize `verify` script)

**Reference**: "DevOps: Dockerfile, GitHub Actions CI (typecheck → lint → unit tests → build), `npm run verify` script running the full local gate."; NFR "no secrets in repo"

---

### [ ] Task 26: Marketing Landing Page (F6)
**Phase 6 — Landing**
**Description**: Build the single static landing page: **headline**, **problem stats** (draw from the spec's research framing — companies accumulate dozens of SaaS subscriptions with inactive seats, forgotten trial conversions, redundant departmental tools; keep claims generic, no invented numbers), **how-it-works in 3 steps** (1. Add your subscriptions → 2. Run the waste analysis → 3. Resolve alerts and recover spend), and a **CTA to the app** (button linking to the dashboard). Page is linked from the app nav (header link from Task 15). Hand-built with Tailwind v4 — no UI libraries, no animation libraries. Nothing beyond the four spec elements + minimal footer.
**Acceptance Criteria**:
- Page contains exactly the four spec sections: headline, problem stats, how-it-works (3 steps), CTA — plus a link back to the app
- CTA navigates to the dashboard route; app header links to the landing page (bidirectional, verified by click-through)
- Responsive at 375/768/1280+ and supports light + dark themes
- Semantic HTML, AA contrast, keyboard navigable
- No scope creep: no pricing, no testimonials, no email capture, no blog (out-of-scope guard)

**Files to Create/Edit**:
- `web/src/pages/Landing.tsx`
- `web/src/App.tsx` (route + nav wiring)

**Reference**: F6 — "Single static landing page: headline, problem stats, how-it-works (3 steps), CTA to app. Linked from app nav. Used for launch content in Phase 7."

---

### [ ] Task 27: Final Integration, Full-Journey E2E + Reality Check Evidence Pack
**Phase 7 — Integration & certification**
**Description**: Final integration task: verify the whole product end-to-end and assemble the certification evidence. Add full user-journey specs: (a) **60-second value moment** — land on dashboard (fresh seeded install) and see total spend, wasted $, and prioritized actions without any clicks; (b) add subscription → run analysis → resolve with action note → Recovered increases; (c) dismiss flow; (d) CSV export journey including download assertion; (e) theme toggle persistence across reload; (f) landing → CTA → dashboard. Add a performance spec asserting dashboard interactive < 3s locally and key API calls < 200ms. Run `qa-playwright-capture.sh` to produce the complete `qa-screenshots/` evidence set + `test-results.json`, and hand to Reality Check with journeys mapped to screenshots.
**Acceptance Criteria**:
- Fresh-install journey test: with a newly seeded DB, the dashboard immediately shows all five metrics and open alerts with zero user actions (Success Criterion #1)
- Every user journey has a passing E2E spec AND corresponding screenshot evidence in `qa-screenshots/` (Success Criterion #4)
- Performance spec passes: dashboard interactive < 3s locally; sampled API calls (list, summary, analysis run, export) each < 200ms
- `npm run verify` passes at root (typecheck → lint → unit tests → build)
- Complete evidence pack: `qa-screenshots/` (desktop/tablet/mobile/dark-mode/before-afters) + `test-results.json` + journey→screenshot index delivered for Reality Check certification
- All previous task acceptance criteria still hold (no regressions)

**Files to Create/Edit**:
- `e2e/full-journey.spec.ts`
- `e2e/performance.spec.ts`
- `e2e/README.md` (journey → screenshot evidence index)
- `qa-playwright-capture.sh` (extend if new capture targets needed)

**Reference**: All success criteria — "1. New user can understand their SaaS waste in < 60 seconds… 2. All four waste flags produce correct savings math (unit-tested)… 3. CSV export opens clean in Excel/Numbers. 4. Reality Check certification with screenshot evidence of every user journey."; NFR performance

---

## Quality Requirements

- [ ] **Per-task gate**: `npm run typecheck` and unit tests (`npm test`) must pass before a task is submitted to QA — no exceptions, including "small" UI fixes
- [ ] **Dev→QA loop**: every task goes through implementation → Evidence Collector QA (screenshot evidence of it working, via `qa-playwright-capture.sh` or targeted captures) → PASS advances the pipeline; FAIL returns to the developer with notes. Expect 2–3 revision cycles on UI-heavy tasks (Tasks 16–22, 26) — this is normal, not a failure
- [ ] **No background processes**: task instructions and scripts NEVER start servers, watchers, or daemons, and NEVER append `&` to commands — the orchestrator owns the dev-server lifecycle (server + web run continuously during the sprint)
- [ ] **No server startup in scripts**: `qa-playwright-capture.sh` and CI assume a running app / provision their own CI steps; neither starts dev servers in the background
- [ ] **Scope discipline**: if it isn't in F1–F6 or the NFRs, it doesn't get built. The out-of-scope list (SSO/login, vendor integrations, email, schedulers/cron, multi-tenancy, payments, AI recommendations, mobile apps, i18n) is enforced — pushback on additions is expected and correct
- [ ] **Security**: Zod validation on every endpoint; prepared (parameterized) statements for every query; no secrets in the repo (`.env.example` placeholders only)
- [ ] **Responsive + accessible**: 375px / 768px / 1280px+ usable; semantic HTML; WCAG 2.1 AA contrast; keyboard navigable — verified in Task 23 and re-verified by capture script at every phase
- [ ] **Evidence retention**: `qa-screenshots/` + `test-results.json` are regenerated per capture run and archived with the phase they certify; final pack lives with Task 27
- [ ] **Definition of Done (spec, verbatim)**: "Task is done when: implementation matches spec, typecheck + unit tests pass, and Evidence Collector QA produces screenshot evidence of it working. Pipeline advances only on QA PASS."

---

## Technical Notes

**Development Stack (exact, from spec — governs over any other defaults)**:
- Monorepo: `trimstack/` → `server/` (Node 26, Express 5, TypeScript strict, better-sqlite3, Zod) + `web/` (React 19, Vite, TypeScript, Tailwind CSS v4)
- Testing: Vitest (unit — waste-engine suite is mandatory), Playwright (E2E + `qa-playwright-capture.sh`)
- DevOps: Dockerfile, GitHub Actions (typecheck → lint → unit tests → build), `npm run verify`
- No Laravel/Livewire/FluxUI, no WordPress, no heavy UI libraries — hand-built components only

**Ports & URLs (fixed for the whole sprint to avoid drift)**:
- Server API: `http://localhost:3001` (`PORT` env, default 3001)
- Web dev server: `http://localhost:5173` (Vite default), with `/api` proxied to `:3001`
- `qa-playwright-capture.sh` default `BASE_URL=http://localhost:5173`

**API surface (as tasked above)**:
- `GET/POST /api/subscriptions`, `GET/PUT/DELETE /api/subscriptions/:id`
- `POST /api/analysis/run`, `GET /api/alerts?status=open`
- `POST /api/alerts/:id/resolve` (`{ actionTaken }`), `POST /api/alerts/:id/dismiss`
- `GET /api/dashboard/summary`, `GET /api/export/alerts.csv`, `GET /api/health`
- JSON error envelope everywhere: `{ "error": { "message": string, "details"?: [...] } }`

**PM Clarifications (interpretations locked to prevent developer confusion — challenge via the PM, not unilaterally)**:
1. **`monthly_cost` is always the monthly-equivalent USD amount** (annual-billed subs store `annual_price / 12`); `billing_cycle` is renewal-UX metadata only. Projected annual spend = total monthly × 12.
2. **Savings per flag type**: inactive seats = `cost × (provisioned − active) / provisioned` (spec formula); duplicate spend = the flagged (non-cheapest) subscription's own monthly cost (the redundant tool is eliminated; the cheapest is retained); upcoming renewal and trial drift carry `null` savings ("where computable") and render as risk notices.
3. **"Within 30 days" is inclusive** (0–30 days from today); trial drift = trial status AND renewal within 14 days inclusive.
4. **Duplicate detection**: only `status = active` subs; same category; ≥2 subs with **different** owning departments; cheapest-by-cost is exempt (tie broken by name for determinism); all others in the cluster are flagged.
5. **Cancelled subscriptions** produce no waste flags and are excluded from spend totals and duplicate detection, but remain visible in the registry (status filterable/searchable like any row).
6. **Flag upserts preserve alert history**: flags are keyed (`subscription_id`, `flag_type`); re-running analysis refreshes open flags but never resets `resolved`/`dismissed` status — this is what keeps the Recovered metric stable.
7. **First-run bootstrap analysis** (inline after initial seed, no scheduler/cron) exists solely to satisfy Success Criterion #1 — the dashboard shows waste immediately on a fresh install; afterwards analysis runs only via the "Run analysis" button.
8. **Spend metric** = sum of `monthly_cost` for `active` + `trial` subscriptions (trials project their conversion cost; cancelled = $0).

**Timeline Expectations (realistic)**:
- Phase 0 (Day 1) → Phase 1 (Days 2–3) → Phase 2 (Days 3–4) → Phase 3 (Days 4–5) → Phase 4 (Days 5–9, the longest — UI tasks iterate with QA) → Phase 5 (Days 9–10) → Phase 6 + 7 (Week 3, landing + certification)
- 27 tasks × ~30–60 min of focused implementation each, plus QA/revision cycles → roughly a 2-week MVP build for one full-time developer (faster with a dev+QA pair), landing the F6 page in week 3 per spec
- Risk areas to watch: seed idempotency (Task 5), flag upsert semantics (Task 10), CSV escaping (Task 13), and 375px table layout (Tasks 17/23) — these are where past projects most often needed a second revision cycle
