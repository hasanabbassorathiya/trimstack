# TrimStack — 3-Week MVP Sprint Plan (NEXUS-Sprint Mode) — v2, Spec-Corrected

**Owner:** Sprint Prioritizer · **v2 correction:** Agents Orchestrator (2026-09-03)
**Timeline:** Week 1 = Sep 7–11 · Week 2 = Sep 14–18 · Week 3 = Sep 21–25, 2026
**Product:** B2B SaaS spend-visibility MVP · Itch 83.4 (severity 9, TAM 90, whitespace 8, frequency 9)
**V1 target:** Launch + Reality Check certification, **Sep 25, 2026**

---

## 0. Inputs & Honest Assumptions

- **v2 correction notice:** v1 of this plan was drafted without direct spec access and contained two spec violations, now fixed: (a) it misread F3 "Optimization Alerts" as email-notification infrastructure (email is explicitly out of scope; the spec's F3 is the in-app alerts panel with Resolve/Dismiss, labeled **(core)**) and scored it as the first full-feature cut; (b) it added out-of-scope ceremony — auth skeleton, staging deploys, SSL verification, waitlist signup capture, monitoring/backup/rollback drills, 1,000-sub load datasets, and invented dashboard views ("spend trend, category breakdown, top vendors") that exceed the spec's exact F4 definition. All removed. This v2 aligns 1:1 with `project-specs/trimstack-setup.md` and the 27-task list in `trimstack-tasklist.md`.
- **Pre-launch reality: zero users, zero waitlist.** Every Reach figure is a stated assumption, not a measurement.
- **Launch cohort assumption (⚠ unverified):** ~50 finance-team accounts as launch-quarter activation target. Not in the spec — flag remains open for client validation.
- **Effort unit:** person-weeks (pw) incl. tests. Spec scope ≈ 8–10 pw vs. ~10–12 pw core-team build capacity in weeks 1–2 → tight but feasible. Buffer comes from F6's week-3 slot, never from core features.
- **All F1–F5 are spec-labeled "(core)"** — none is a routine cut candidate. Cut lines below operate within-feature only, except one flagged client-sign-off path.

---

## 1. RICE Analysis (corrected)

**Formula:** Score = (Reach × Impact × Confidence) ÷ Effort. Impact scale: 0.25 / 0.5 / 1 / 1.5 / 2 / 3.

| # | Feature | Reach (accounts/qtr) | Impact | Confidence | Effort (pw) | **Score** | Rank |
|---|---------|---------------------:|-------:|-----------:|------------:|----------:|-----:|
| F1 | Subscription registry | 50 (100% of cohort) | 2.0 | 80% | 3.0 | **26.7** | 5 |
| F2 | Waste-detection engine | 45 (90%) | 3.0 | 80% | 4.0 | **27.0** | 4 |
| F3 | Optimization alerts (in-app panel + actions) | 45 (90%) | 1.5 | 80% | 0.75 | **72.0** | 1 |
| F4 | Dashboard | 50 (100%) | 2.0 | 60% | 2.0 | **30.0** | 2 |
| F5 | CSV export | 20 (40%) | 1.0 | 70% | 0.5 | **28.0** | 3 |
| F6 | Marketing landing page | 8 (~400 visitors × 2%) | 3.0 | 40% | 1.0 | **9.6** | 6 |

**Result: F3 (72.0) > F4 (30.0) > F5 (28.0) > F2 (27.0) > F1 (26.7) >>> F6 (9.6)**

### Score defenses

**F1 — Registry (26.7).** Mandatory entry point — no data, no product. Impact 2: replaces the chaos spreadsheet (visibility) but doesn't yet *find money*. Confidence at the 80% pre-launch ceiling: registry CRUD is a category-proven staple for finance tooling.

**F2 — Waste engine (27.0).** The itch reliever (severity 9) and the whitespace-8 differentiator. Impact 3, the maximum — quantified dollar waste is the product's reason to exist. Largest effort line (4 pw) is deliberate: rules, edge cases, and a full penny-exact unit suite, because correctness is the never-cut bar.

**F3 — Alerts panel + actions (72.0, corrected from 10.0).** v1 scored F3 as email infrastructure (1.5 pw, 50% confidence, reach haircut to 60%). The spec's actual F3 is two endpoints and a panel riding on F2's output: resolve/dismiss, action-taken record, and the **Recovered** metric — delivering value-moment element (c), "a prioritized list of specific actions to recover money." Reach 90% (bootstrap analysis populates it for every account), Impact 1.5 (the action loop that converts visibility into recovered dollars), Confidence 80% (standard endpoint+panel work, no new infra), Effort 0.75 pw. **RICE caveat:** F3 tops the table via low effort — RICE over-rewards quick wins (see F5's 28.0). Build order is still governed by dependencies: F1 → F2 → F3.

**F4 — Dashboard (30.0).** The post-login surface — every user, every session. Impact 2: renders what F1/F2 compute; the literal "spend visibility" promise. Confidence 60%: which exact arrangement resonates with this audience is unvalidated — mitigated by the spec fixing the content precisely (five metrics + alerts panel + table + renewals list; no invented views).

**F5 — CSV export (28.0).** Month-end reconciliation for Excel/Sheets-first finance teams. Impact 1: workflow fit, not differentiation. Confidence 70%. High score from tiny effort — a quick win, not strategic weight.

**F6 — Landing page (9.6).** ~400 cold visitors × 2% assumed activation — no owned audience exists. Impact 3 (the only conversion path), Confidence 40% (itch score validates the problem, not our distribution). Least evidenced ≠ unimportant: the page ships week 3 as spec'd, but its *custom polish* is the first thing on the chopping block.

**RICE limitations (unchanged):** over-rewards small effort (F5, and now F3's #1 rank) and broad-reach surfaces (F4 outscores its data suppliers F1/F2). Dependency order (F1 → F2 → F3/F4/F5) and differentiation (whitespace 8 lives in F2) modulate every sequencing decision below.

---

## 2. MoSCoW Classification (v1 = public launch, Sep 25)

| Feature | Class | Rationale |
|---------|-------|-----------|
| **F1** Registry | **MUST** | Dependency root; spec core. Without it F2/F3/F4/F5 have no data. |
| **F2** Waste engine | **MUST** | Spec core; the itch reliever + differentiator. Correctness never cut. |
| **F3** Alerts panel + actions | **MUST** | Spec core; value-moment element (c) + Recovered metric. Not a cut candidate. |
| **F4** Dashboard | **MUST** | Spec core; the "spend visibility" promise, every session. |
| **F5** CSV export | **MUST** | Spec core (quick win). Only core feature with a flagged slippage path — see §4. |
| **F6** Landing page | **SHOULD** | Launch narrative needs it, but scope is spec-capped to exactly: headline, problem stats, how-it-works (3 steps), CTA to app. |
| Within-feature polish (density niceties, empty-state illustration depth) | **COULD** | Scheduled only if capacity remains after all QA gates green. |
| SSO/login, vendor integrations, email sending, background schedulers/cron, multi-tenancy, payments, AI recommendations, mobile apps, i18n | **WON'T (v1)** | Verbatim spec out-of-scope list. Enforced. |

---

## 3. Three One-Week Sprint Plan (aligned to pipeline phases + 27 tasks)

**Capacity model:** builders = frontend dev + backend architect (full-time), DevOps (~50%), UX architect (~50% design). Orchestrator, PM, sprint prioritizer, evidence QA, reality checker are planning/QA overhead. Growth team (growth hacker, content creator, social strategist) joins Week 3.

### Sprint 1 — "Foundation: registry + engine correctness" (Week 1, Sep 7–11) — Tasks 1–9

**Scope:** monorepo scaffold (T1–3), DB schema + idempotent 24-sub seed (T4–5), Zod validation layer (T6), F1 CRUD endpoints (T7), F2 pure engine (T8) + **mandatory unit suite** (T9).
**Roles:** backend architect → T1–2, T4–13 track; frontend dev → T3, T14+ track; UX architect → DESIGN.md → component specs; DevOps → root scripts/CI skeleton; evidence QA → test-evidence certification per task; PM + prioritizer → mid-sprint checkpoint.

**Exit criteria (evidence-based):**
1. All four flag types unit-green with penny-exact savings math (T9 AC — spec Success Criterion #2).
2. CRUD route tests green: search/sort, 404/400 error envelopes, cascade delete (T7 AC).
3. Seed idempotency proven: exactly 24 rows; reboot does not duplicate; seed triggers all four flag types (T5 AC).
4. `npm run verify` green at root (typecheck → lint → unit → build).
5. Mid-sprint checkpoint: capacity vs. scope reviewed; **no core feature is pre-authorized for cut** — slippage absorbs from COULD items and week-3 F6 polish first.

### Sprint 2 — "Surface + hardening" (Week 2, Sep 14–18) — Tasks 10–25

**Scope:** feature APIs (analysis run + upserts, resolve/dismiss, dashboard summary, CSV export — T10–13), full frontend (API client, shell/theme, metrics, table, CRUD UI, alerts + actions, renewals, export, responsive/a11y pass — T14–23), QA tooling (Playwright capture script + E2E specs — T24), CI + Dockerfile + verify finalization (T25).
**Roles:** backend architect → T10–13; frontend dev → T14–23; DevOps → T24–25; UX architect → design QA on panel/table polish; evidence QA → per-task screenshot gates + full capture runs.

**Exit criteria (evidence-based):**
1. Fresh-install bootstrap test green: dashboard shows waste with zero user actions (T10 AC — spec Success Criterion #1).
2. Resolve → re-run analysis keeps alert resolved; Recovered metric stable (T10–11 AC).
3. CSV escaping tests green; sample export parses cleanly (T13 AC).
4. `qa-playwright-capture.sh` produces the full evidence set: desktop/tablet/mobile, dark mode, run-analysis + resolve before-afters, `test-results.json` (T24 AC).
5. Responsive (375/768/1280) + AA contrast + keyboard journey pass signed (T23 AC).
6. `npm run verify` green; CI workflow runs the four spec gates in order (T25 AC).

### Sprint 3 — "Landing + growth + certification" (Week 3, Sep 21–25) — Tasks 26–27 + Growth phase

**Scope:** F6 landing page (exact spec sections — T26), full-journey + performance E2E + evidence pack (T27), growth team activation (launch post, social sequences, distribution calendar), Reality Check certification.
**Roles:** frontend dev → T26–27; growth hacker → channels + metrics; content creator → launch copy; social strategist → sequences + schedule; core team → bugfix + evidence support; reality checker → certification.

**Exit criteria (evidence-based):**
1. Landing live with exactly the four spec sections + bidirectional nav, responsive and themed (T26 AC).
2. Full-journey E2E green: 60-second value moment, add → analyze → resolve → Recovered, dismiss, CSV download, theme persistence, landing → CTA → dashboard (T27 AC — Success Criteria #1, #4).
3. Performance spec green: dashboard interactive < 3s locally; sampled API calls < 200ms (T27 AC).
4. ≥3 growth assets shipped + distribution calendar documented (channel / date / owner).
5. Reality Check certification packet complete — every §5 row evidence-linked; go/no-go recorded (target: **Sep 25, 2026**).

---

## 4. Cut Lines (v2 — spec-compliant)

**Principle:** cut (a) polish before existence, (b) lowest confidence first, (c) never a spec-core feature without client sign-off.

| Order | What gets dropped | RICE | Saves | Why |
|------|-------------------|-----:|------:|-----|
| 1 | F6 landing polish beyond the four spec sections (custom illustration depth, motion flourishes) | 9.6 | ~0.5 pw | Lowest confidence (40%, cold traffic); the spec-capped page still converts. |
| 2 | Within-feature COULD items across F1/F4 (density niceties, extra empty-state polish) | — | ~0.5 pw | Polish; the spec-exact surfaces carry the story. |
| 3 | **F5 CSV export → fast-follow (client sign-off required)** | 28.0 | 0.5 pw | The only core feature whose absence doesn't break the launch narrative or the demo journey — but it IS spec-core and Success Criterion #3, so this is an explicit scope-change decision, not a routine cut. |

**NEVER cut (non-negotiable):**
- **F2 waste-engine correctness** — 100% unit green, zero known correctness bugs. A wrong dollar figure shown to a finance team is the one unrecoverable failure.
- **F1 core CRUD** — dependency root.
- **F3 action loop** — value-moment element (c); the Recovered payoff.
- **F4 exact spec surface** — five metrics + alerts panel + subscriptions table + renewals mini-list.
- **The demo journey** (land → see waste → resolve → recover → export) and the QA evidence gates.

**Collapse floor (requires client sign-off):** F1 + F2 + F3 + F4 metrics — still tells the complete itch story.

---

## 5. Launch Readiness Checklist (Reality Check certification — v2, spec-aligned)

Certification requires every row **true with linked evidence** — assertion without trace is a fail.

| # | Must be true | Evidence required |
|---|--------------|-------------------|
| 1 | Registry CRUD works | Route/E2E tests green; screenshot of add/edit/delete journey |
| 2 | Waste engine is correct | 100% unit tests green (penny-exact, all four flag types); zero known correctness bugs |
| 3 | Dashboard matches F4 exactly | Five metrics + alerts panel + subscriptions table + renewals mini-list rendered from seeded data; screenshot set |
| 4 | CSV opens clean in Excel/Numbers | Sample file + screenshot of opened file (Success Criterion #3) |
| 5 | Fresh-install 60-second value moment | Bootstrap-analysis E2E green; dashboard screenshot with zero user actions |
| 6 | Theme toggle persists across reload | E2E green |
| 7 | Responsive 375/768/1280 + dark mode | `qa-screenshots/` capture set from `qa-playwright-capture.sh` |
| 8 | Accessibility AA | Contrast spot-check values recorded; keyboard-journey E2E green |
| 9 | Full local gate green | `npm run verify` run log; CI workflow valid and ordered per spec |
| 10 | Landing page per F6 | Four spec sections, bidirectional nav, themed, responsive — screenshots |
| 11 | Certification | Reality checker signs each row with evidence links; go/no-go recorded with date (**target Sep 25, 2026**) |

---

*Sprint-plan source of truth for cut decisions: §4. Any mid-sprint scope change must cite a RICE score, a cut-line position, and — for any F1–F5 item — client sign-off, before PM approval.*
