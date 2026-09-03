# TrimStack — Project Setup Specification

## Problem (verbatim from research)
> How can companies eliminate unused SaaS subscriptions efficiently?
>
> Organizations accumulate wasteful spending on dozens of SaaS subscriptions with inactive user seats, forgotten trial conversions, and redundant tools purchased by different departments because finance teams lack centralized visibility into all software expenditures and automated alerts for license optimization opportunities.

**ITCH Score: 83.4** — Severity 9 · TAM 90 · Whitespace 8 · Frequency 9

## Product Definition
**TrimStack** is a B2B web application that gives finance teams centralized visibility into all company SaaS subscriptions and automatically flags license optimization opportunities (wasted spend) with actionable alerts.

**Primary user**: Finance/ops team member at a 50–500 person company.
**Core value moment**: User opens the dashboard and immediately sees (a) total SaaS spend, (b) dollars being wasted this month, and (c) a prioritized list of specific actions to recover money.

## MVP Scope — EXACT Requirements (nothing more)

### F1. Subscription Registry (core)
- CRUD for SaaS subscriptions with fields: name, vendor, category (enum: dev, design, marketing, sales, productivity, security, analytics, hr, other), monthly cost (USD), billing cycle (monthly/annual), renewal date, seats provisioned, seats active (last 30 days), owning department, status (active / trial / cancelled), notes.
- List view of all subscriptions, sortable by cost and renewal date, searchable by name/vendor.
- Seed data: 24 realistic demo subscriptions on first run (idempotent — never duplicates).

### F2. Waste Detection Engine (core)
Runs on demand (button: "Run analysis" — no background jobs) and computes per-subscription flags:
1. **Inactive seats**: provisioned > active; waste = cost × (provisioned − active) / provisioned.
2. **Upcoming renewal**: renewal date within 30 days.
3. **Trial drift**: status = trial AND renewal date within 14 days (auto-conversion risk).
4. **Duplicate spend**: ≥2 active subscriptions in the same category owned by different departments → flags all but the cheapest as duplicates.
Each flag carries a potential monthly savings figure where computable.

### F3. Optimization Alerts (core)
- Alerts panel listing all flags sorted by potential savings (desc), each with: type, subscription, $ impact, one-line recommendation ("Downgrade 47 unused seats in Figma…").
- Alert actions: Resolve (marks resolved, records action taken) and Dismiss.
- Resolved alert shows recovery total in dashboard "Recovered" metric.

### F4. Dashboard (core)
Metrics at top: total monthly spend, projected annual spend, wasted monthly $ (sum of open flags), recovered $ (resolved), waste as % of spend.
Below: alerts panel (F3), subscriptions table (F1), upcoming renewals (next 60 days) mini-list.

### F5. Waste Report Export (core)
- "Export CSV" button producing a finance-friendly CSV of all open alerts (subscription, flag type, monthly savings, recommendation, status).

### F6. Marketing Landing Page (week-3 growth)
- Single static landing page: headline, problem stats, how-it-works (3 steps), CTA to app. Linked from app nav. Used for launch content in Phase 7.

## Non-Functional Requirements
- Light/Dark/System theme toggle in header (persisted in localStorage).
- Responsive: usable at 375px, 768px, 1280px+.
- Accessibility: semantic HTML, WCAG 2.1 AA color contrast, keyboard navigable.
- Performance: dashboard interactive < 3s locally; API p95 < 200ms.
- Security: input validation on all API endpoints (Zod); no secrets in repo; parameterized queries.

## Explicitly OUT of Scope (v1)
SSO/login, SaaS vendor integrations (Okta/Slack/SSO APIs), email sending, background schedulers/cron, multi-tenancy, payments, AI recommendations, mobile apps, i18n.

> Manual-entry registry + on-demand analysis is the wedge. Integrations are v2 once we have users.

## Technical Stack (decided by orchestrator for NEXUS-Sprint speed)
- **Monorepo layout**: `trimstack/` → `server/` + `web/`
- **Backend**: Node 26 + Express 5 + TypeScript, better-sqlite3 (file DB, zero-config, seeded idempotently), Zod validation, REST API with JSON error envelope.
- **Frontend**: React 19 + Vite + TypeScript, Tailwind CSS v4, no heavy UI libs — hand-built components from design system.
- **Testing**: Vitest for unit tests (waste engine must have unit tests); Playwright for E2E + screenshot capture script `qa-playwright-capture.sh` producing `qa-screenshots/` (desktop/tablet/mobile/dark-mode/interaction before-afters + test-results.json).
- **DevOps**: Dockerfile, GitHub Actions CI (typecheck → lint → unit tests → build), `npm run verify` script running the full local gate.

## Definition of Done (per task)
Task is done when: implementation matches spec, typecheck + unit tests pass, and Evidence Collector QA produces screenshot evidence of it working. Pipeline advances only on QA PASS.

## Success Criteria for MVP Launch
1. New user can understand their SaaS waste in < 60 seconds from landing on dashboard.
2. All four waste flags produce correct savings math (unit-tested).
3. CSV export opens clean in Excel/Numbers.
4. Reality Check certification with screenshot evidence of every user journey.
