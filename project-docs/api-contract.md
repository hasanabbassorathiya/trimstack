# TrimStack API Contract & Backend Architecture

> **Status**: AUTHORITATIVE for backend Tasks 2, 4–13. If a task file and this document disagree on an endpoint shape, a field name, or a semantic, this document wins unless the PM says otherwise. Frontend Tasks 14–22 consume this contract via `web/src/api/types.ts` (mirrored deliberately).
> **Sources**: `project-specs/trimstack-setup.md` (spec), `project-tasks/trimstack-tasklist.md` (tasks + PM Clarifications 1–8, LOCKED).
> **Stack**: Node 26 · Express 5 · TypeScript strict · better-sqlite3 · Zod. No auth, no schedulers, no email — the spec's out-of-scope list is enforced here too.

---

## Table of Contents

1. [Endpoint Summary (OpenAPI-style)](#1-endpoint-summary)
2. [Conventions](#2-conventions)
3. [Data Model](#3-data-model)
4. [Waste-Engine Interface Contract](#4-waste-engine-interface-contract)
5. [Analysis Upsert Semantics (PM Clarification #6)](#5-analysis-upsert-semantics)
6. [Error Envelope & Validation Mapping](#6-error-envelope--validation-mapping)
7. [Endpoint Specifications](#7-endpoint-specifications)
8. [Repository Layer Pattern](#8-repository-layer-pattern)
9. [Security & Performance](#9-security--performance)
10. [Seeding Rules (Idempotency + Bootstrap)](#10-seeding-rules)
11. [Interpretation Log](#11-interpretation-log)

---

## 1. Endpoint Summary

12 endpoints. **Auth: none on every endpoint** (SSO/login is explicitly out of scope). All paths are prefixed `/api`. The Vite dev server (:5173) proxies `/api` → `http://localhost:3001`, so the web app always calls same-origin `/api/...`.

| # | Method | Path | Purpose | Auth | Consumer task(s) |
|---|--------|------|---------|------|------------------|
| 1 | GET | `/api/health` | Liveness probe | none | 2 |
| 2 | GET | `/api/subscriptions` | List all; search `q`; sort by cost/renewal | none | 7 (UI: 17) |
| 3 | POST | `/api/subscriptions` | Create subscription (201) | none | 7 (UI: 18) |
| 4 | GET | `/api/subscriptions/:id` | Get one or 404 | none | 7 (UI: 18) |
| 5 | PUT | `/api/subscriptions/:id` | Partial update (merge-then-validate) | none | 7 (UI: 18) |
| 6 | DELETE | `/api/subscriptions/:id` | Delete; cascades flags (204) | none | 7 (UI: 18) |
| 7 | POST | `/api/analysis/run` | Run waste engine on demand; upsert flags | none | 10 (UI: 19) |
| 8 | GET | `/api/alerts` | List flags joined with subscription; `status` param | none | 10 (UI: 19, 20) |
| 9 | POST | `/api/alerts/:id/resolve` | Resolve open alert with `actionTaken` | none | 11 (UI: 20) |
| 10 | POST | `/api/alerts/:id/dismiss` | Dismiss open alert | none | 11 (UI: 20) |
| 11 | GET | `/api/dashboard/summary` | F4 metrics + 60-day renewals | none | 12 (UI: 16, 21) |
| 12 | GET | `/api/export/alerts.csv` | CSV of open alerts (F5) | none | 13 (UI: 22) |

**No other endpoints exist in v1.** No pagination, no bulk endpoints, no flag CRUD, no stats endpoints — adding any of these is scope creep.

---

## 2. Conventions

| Topic | Rule |
|---|---|
| **JSON casing** | API request/response bodies use **camelCase** (`monthlyCost`, `seatsProvisioned`). Database columns use **snake_case** (`monthly_cost`, `seats_provisioned`). The repository layer is the only place that maps between them (see §3.4). |
| **Content type** | All JSON endpoints: `application/json; charset=utf-8`. CSV export: `text/csv; charset=utf-8` (§7.12). |
| **IDs** | Integers, `INTEGER PRIMARY KEY AUTOINCREMENT`, ≥ 1, assigned by SQLite. UUIDs are not used in v1. |
| **Dates (calendar)** | `renewalDate`: **ISO 8601 date-only string** `YYYY-MM-DD` (e.g. `2026-09-30`). Never a timestamp. |
| **Timestamps** | `createdAt`, `updatedAt`, `detectedAt`, `resolvedAt`: **ISO 8601 UTC timestamp strings** `YYYY-MM-DDTHH:MM:SS.SSSZ` (e.g. `2026-09-03T09:00:12.345Z`). Server-generated only. |
| **Currency** | All money values are **monthly-equivalent USD** (PM Clarification #1) as JSON numbers, computed/stored rounded to 2 decimal places. |
| **Rounding** | Canonical rule everywhere: `round2(x) = Math.round(x * 100) / 100`. Sums are rounded **once, after summing** (never re-round partials). |
| **Lists** | List endpoints return **bare JSON arrays** (`[]` when empty), not wrapped objects. |
| **Empty vs null** | Optional nullable fields serialize as `null`, never as `""` or `0`. The error envelope's `details` key is **omitted** when absent, never `null`. |
| **Ports / env** | API `http://localhost:3001` (`PORT`, default 3001) · web `http://localhost:5173` · DB default `server/data/trimstack.sqlite` (`DB_PATH` overridable) · `CORS_ORIGIN` default `http://localhost:5173`. These three env vars are the entire backend config surface (plus standard `NODE_ENV`). |
| **Example data** | All example bodies below use a coherent seed-style story ("today" = **2026-09-03**). Values are illustrative — Task 5's seed catalog is authoritative for actual seed data. |

---

## 3. Data Model

Two tables. No junction tables, no audit tables, no settings table.

### 3.1 DDL (applied idempotently on boot — `CREATE … IF NOT EXISTS`)

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL,
  vendor            TEXT    NOT NULL,
  category          TEXT    NOT NULL CHECK (category IN ('dev','design','marketing','sales',
                                        'productivity','security','analytics','hr','other')),
  monthly_cost      REAL    NOT NULL CHECK (monthly_cost > 0),
  billing_cycle     TEXT    NOT NULL CHECK (billing_cycle IN ('monthly','annual')),
  renewal_date      TEXT    NOT NULL,            -- ISO date 'YYYY-MM-DD'
  seats_provisioned INTEGER NOT NULL CHECK (seats_provisioned >= 0),
  seats_active      INTEGER NOT NULL CHECK (seats_active >= 0),
  owning_department TEXT    NOT NULL,
  status            TEXT    NOT NULL CHECK (status IN ('active','trial','cancelled')),
  notes             TEXT,                         -- nullable
  created_at        TEXT    NOT NULL,            -- ISO 8601 UTC timestamp
  updated_at        TEXT    NOT NULL,            -- ISO 8601 UTC timestamp
  CHECK (seats_active <= seats_provisioned)      -- DB-level mirror of the Zod cross-field rule
);

CREATE TABLE IF NOT EXISTS flags (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id           INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  flag_type                 TEXT    NOT NULL CHECK (flag_type IN ('inactive_seats','upcoming_renewal',
                                                  'trial_drift','duplicate_spend')),
  status                    TEXT    NOT NULL DEFAULT 'open'
                                      CHECK (status IN ('open','resolved','dismissed')),
  estimated_monthly_savings REAL,                 -- nullable: upcoming_renewal & trial_drift carry NULL (PM #2)
  recommendation            TEXT    NOT NULL,
  detected_at               TEXT    NOT NULL,     -- ISO 8601 UTC timestamp; refreshed on re-detection
  resolved_at               TEXT,                  -- nullable; set only by resolve
  action_taken              TEXT,                  -- nullable; set only by resolve
  UNIQUE (subscription_id, flag_type)              -- the upsert key (PM #6)
);

-- Indexes (all created with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_subscriptions_monthly_cost ON subscriptions(monthly_cost);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status       ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_flags_status               ON flags(status);
```

**Do NOT create a separate index on `flags(subscription_id)`.** The `UNIQUE (subscription_id, flag_type)` constraint already creates an implicit unique index whose leftmost prefix covers every lookup/cascade by `subscription_id`. A separate index would be pure duplication.

### 3.2 `subscriptions` — column reference (14 columns)

| Column | TS type (API) | SQLite type | Constraints | Notes |
|---|---|---|---|---|
| `id` | `number` | INTEGER | PK, autoincrement | |
| `name` | `string` | TEXT | NOT NULL | trimmed; non-empty post-trim |
| `vendor` | `string` | TEXT | NOT NULL | may be empty string (mirrors Task 6's "string" rule) |
| `category` | `Category` | TEXT | NOT NULL + CHECK enum | 9 values |
| `monthly_cost` | `number` | REAL | NOT NULL, `> 0` | monthly-equivalent USD (PM #1) |
| `billing_cycle` | `BillingCycle` | TEXT | NOT NULL + CHECK enum | renewal-UX metadata only (PM #1) |
| `renewal_date` | `string` | TEXT | NOT NULL | `'YYYY-MM-DD'` |
| `seats_provisioned` | `number` | INTEGER | NOT NULL, `>= 0` | |
| `seats_active` | `number` | INTEGER | NOT NULL, `>= 0`, `<= seats_provisioned` (CHECK) | last 30 days |
| `owning_department` | `string` | TEXT | NOT NULL | may be empty string |
| `status` | `SubscriptionStatus` | TEXT | NOT NULL + CHECK enum | active / trial / cancelled |
| `notes` | `string \| null` | TEXT | nullable | |
| `created_at` | `string` | TEXT | NOT NULL | ISO 8601 UTC |
| `updated_at` | `string` | TEXT | NOT NULL | ISO 8601 UTC; refreshed on every successful PUT |

### 3.3 `flags` — column reference (9 columns)

| Column | TS type (API) | SQLite type | Constraints | Notes |
|---|---|---|---|---|
| `id` | `number` | INTEGER | PK, autoincrement | alert identity for resolve/dismiss |
| `subscription_id` | `number` | INTEGER | NOT NULL, FK → subscriptions(id) **ON DELETE CASCADE** | |
| `flag_type` | `FlagType` | TEXT | NOT NULL + CHECK enum (4 values) | |
| `status` | `FlagStatus` | TEXT | NOT NULL, DEFAULT `'open'`, CHECK enum | open / resolved / dismissed |
| `estimated_monthly_savings` | `number \| null` | REAL | nullable | 2dp; NULL for renewal/trial flags (PM #2) |
| `recommendation` | `string` | TEXT | NOT NULL | one line, locked templates (§4.5) |
| `detected_at` | `string` | TEXT | NOT NULL | ISO 8601 UTC; "last detected" — refreshed on re-detection of open flags |
| `resolved_at` | `string \| null` | TEXT | nullable | set only by resolve; stays NULL for dismissed |
| `action_taken` | `string \| null` | TEXT | nullable | set only by resolve |

The DB-level `CHECK (seats_active <= seats_provisioned)` is deliberate defense-in-depth behind the Zod rule (§7): Zod is the gatekeeper; the CHECK guarantees no bad row can ever exist even via a future bug or manual SQLite edit.

### 3.4 Type mapping (the only snake_case ↔ camelCase translation point)

```ts
// server/src/db/types.ts — DB row shapes (snake_case is mapped here, once)
export interface Subscription {
  id: number;
  name: string;
  vendor: string;
  category: Category;
  monthlyCost: number;
  billingCycle: BillingCycle;
  renewalDate: string;          // 'YYYY-MM-DD'
  seatsProvisioned: number;
  seatsActive: number;
  owningDepartment: string;
  status: SubscriptionStatus;
  notes: string | null;
  createdAt: string;           // ISO 8601 UTC timestamp
  updatedAt: string;
}

export interface FlagRow {
  id: number;
  subscriptionId: number;
  flagType: FlagType;
  status: FlagStatus;
  estimatedMonthlySavings: number | null;
  recommendation: string;
  detectedAt: string;
  resolvedAt: string | null;
  actionTaken: string | null;
}

// server/src/engine/types.ts — engine-owned shared types
export type Category = 'dev' | 'design' | 'marketing' | 'sales' | 'productivity'
                     | 'security' | 'analytics' | 'hr' | 'other';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'trial' | 'cancelled';
export type FlagType = 'inactive_seats' | 'upcoming_renewal' | 'trial_drift' | 'duplicate_spend';
export type FlagStatus = 'open' | 'resolved' | 'dismissed';

/** Alert = FlagRow + joined subscription display fields (API-facing shape, §7.8). */
export interface Alert extends FlagRow {
  subscriptionName: string;
  subscriptionVendor: string;
}
```

better-sqlite3 returns `REAL` → JS `number`, `INTEGER` → `number`, `TEXT` → `string`, `NULL` → `null`; the mapping in the repository is purely key-renaming, no coercion.

### 3.5 Index rationale (query patterns → indexes)

| Query pattern | Index serving it | Why |
|---|---|---|
| `ORDER BY monthly_cost` (list, `sort=cost`) | `idx_subscriptions_monthly_cost` | B-tree gives ordered scan |
| `ORDER BY renewal_date` (list, `sort=renewal`; dashboard 60-day window) | `idx_subscriptions_renewal_date` | ordered scan + range predicate `renewal_date BETWEEN` |
| Dashboard spend filter `status IN ('active','trial')` | `idx_subscriptions_status` | low-cardinality but cheap; establishes the pattern for growth |
| Alerts by status; dashboard open/resolved sums | `idx_flags_status` | equality filter on `flags.status` |
| Upsert key `(subscription_id, flag_type)`; FK cascade | implicit UNIQUE index on `flags(subscription_id, flag_type)` | doubles as the FK access path — no extra index needed |
| Search `q` (`LIKE '%q%'` on name/vendor) | **none** | Leading-wildcard LIKE cannot use a B-tree index. With 24 rows this is irrelevant; document it so nobody "fixes" it with a wrong index later. |

With 24 rows these indexes are about locking in correct patterns for growth, not current performance — every query is already single-digit milliseconds.

### 3.6 Date storage decision — ISO 8601 strings

**Decision**: `renewal_date` is stored as TEXT `YYYY-MM-DD`; all timestamps as TEXT `YYYY-MM-DDTHH:MM:SS.SSSZ` (UTC).

**Rationale**:
1. SQLite has no native DATE type; the real choices are TEXT (ISO), Julian day, or Unix epoch numbers. ISO 8601 TEXT is **lexicographically ordered identically to chronological order** — so `ORDER BY renewal_date` works as a plain string sort, and range predicates (`renewal_date >= X AND renewal_date <= Y`) are correct string comparisons. Julian/epoch would force conversions on every read and break human-readability of the DB file.
2. **Date-only for `renewal_date`** avoids the classic off-by-one where `2026-09-30T00:00:00Z` shifts a day in a non-UTC timezone. A renewal happens on a calendar day; we store the calendar day, nothing more.
3. The engine parses `renewalDate + 'T00:00:00Z'` (UTC midnight) and compares against today normalized to UTC midnight — the difference is always an exact integer number of days (§4.4). No timezone library needed, deterministic tests.
4. Timestamps are always UTC with explicit `Z` — never local time, never epoch numbers — so they sort correctly and render identically everywhere.

---

## 4. Waste-Engine Interface Contract

This is the shared contract between Task 8 (engine), Task 9 (engine tests), Task 10 (API wiring), and Task 12 (metrics). The engine is a **pure, DB-free module**.

### 4.1 Function signature

```ts
// server/src/engine/wasteEngine.ts
export function analyzeSubscriptions(
  subscriptions: Subscription[],  // full row shape (db/types.ts); engine reads only the
                                   // detection fields: id, name, category, monthlyCost,
                                   // renewalDate, seatsProvisioned, seatsActive,
                                   // owningDepartment, status
  today?: Date,                    // injectable for deterministic tests; defaults to new Date()
): Flag[];
```

**Purity rules (Task 8 acceptance)**:
- Zero imports from `server/src/db/*` — no database, no repositories, no side effects.
- No `Date.now()` inside the function — the only clock is the `today` parameter.
- Same input + same `today` → identical output (byte-for-byte deterministic).
- `analyzeSubscriptions` never throws for well-formed `Subscription` objects (rows coming out of the DB are always valid — Zod on write, CHECK constraints beneath).

### 4.2 The `Flag` type (engine output)

```ts
// server/src/engine/types.ts
/** Pure detection result — no persistence fields. */
export interface Flag {
  subscriptionId: number;
  flagType: FlagType;
  estimatedMonthlySavings: number | null;  // 2dp; null for upcoming_renewal & trial_drift (PM #2)
  recommendation: string;                  // one line, locked templates (§4.5)
}
```

**Naming note (applies to all tasks)**: `Flag` = engine output (these 4 fields). `FlagRow` = the DB row. `Alert` = API-facing `FlagRow` + joined subscription name/vendor. Do not conflate them.

### 4.3 The four detectors — exact rules

All day-distance math uses §4.4. `round2` is §2's canonical rounding.

**D1 — `inactive_seats`** (PM #2 formula)
- **Eligible**: `status ∈ {active, trial}` (cancelled subs never flag — PM #5) **and** `seatsProvisioned > seatsActive` **and** `seatsProvisioned > 0`.
- **Savings**: `round2(monthlyCost × (seatsProvisioned − seatsActive) / seatsProvisioned)`
- **Recommendation**: `Downgrade {seatsProvisioned − seatsActive} unused seats in {name}`
- No flag when `seatsProvisioned === seatsActive` or `seatsActive > seatsProvisioned` (the latter is impossible via validation; engine stays defensive).
- Worked example (Task 9's fixture): 60 provisioned, 13 active, $230/mo → `230 × 47/60 = 180.1666…` → **$180.17**.

**D2 — `upcoming_renewal`** (PM #3: inclusive)
- **Eligible**: `status ∈ {active, trial}` **and** `0 ≤ daysUntil(renewalDate) ≤ 30` (both ends inclusive: exactly 30 days out and exactly 0 days out are flagged; **past-due (negative) is not flagged**; 31 days is not).
- **Savings**: `null` (not computable — PM #2).
- **Recommendation**: `{name} renews on {renewalDate} - review usage and terms before renewal`

**D3 — `trial_drift`** (PM #3: inclusive)
- **Eligible**: `status = 'trial'` **and** `0 ≤ daysUntil(renewalDate) ≤ 14` (both ends inclusive; exactly 14 flagged, 15 not; past-due not flagged).
- **Savings**: `null`.
- **Recommendation**: `{name} trial auto-converts on {renewalDate} - cancel before auto-conversion`
- Note: a trial with renewal ≤ 14 days out produces **trial_drift only**, not a second `upcoming_renewal` flag — the renewal-notice flag applies to non-trial subs (a trial sub's imminent renewal *is* the drift signal; one alert, one action). Active subs with renewal ≤ 30 days produce only `upcoming_renewal`.

**D4 — `duplicate_spend`** (PM #4)
- **Candidates**: `status = 'active'` only (trials and cancelled excluded).
- **Group** candidates by `category`. A group **qualifies** iff it contains **≥ 2 subscriptions** AND **≥ 2 distinct `owningDepartment` values** among them (empty-string departments count as a department value).
- Within each qualifying group, the **exempt** subscription is the single cheapest by `(monthlyCost asc, then name asc)` — the name tie-break is the locked determinism rule (PM #4).
- **Every other subscription in the qualifying group** is flagged — regardless of its own department.
- **Savings**: `round2(flagged subscription's own monthlyCost)` (the redundant tool is eliminated; the cheapest is retained — PM #2).
- **Recommendation**: `Cancel duplicate {category} tool {name} - keep {cheapestName} (cheapest)` where `{category}` is the raw enum value and `{cheapestName}` the exempt sub's name.
- Worked example: analytics cluster = Datadog $1150 (Engineering) + Mixpanel $99 (Marketing), both active → qualifies; Mixpanel is cheapest (exempt); Datadog flagged with savings **$1150.00** and recommendation `Cancel duplicate analytics tool Datadog - keep Mixpanel (cheapest)`.

### 4.4 Day-distance math (the only date arithmetic in the engine)

```ts
function daysUntil(renewalDate: string, today: Date): number {
  const todayUtcMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const renewalUtcMs = Date.parse(`${renewalDate}T00:00:00Z`);   // date-only → UTC midnight
  return (renewalUtcMs - todayUtcMs) / 86_400_000;               // exact integer days
}
```

Both operands are UTC midnights, so the result is always an exact integer (positive = future, 0 = today, negative = past-due). Normalizing `today` to its UTC calendar date makes the injected test clock's time-of-day irrelevant — `new Date('2026-09-03')` and `new Date('2026-09-03T14:22:00Z')` behave identically.

### 4.5 Recommendation templates (LOCKED — assert these exact strings in tests)

| FlagType | Template |
|---|---|
| `inactive_seats` | `Downgrade {unused} unused seats in {name}` |
| `upcoming_renewal` | `{name} renews on {renewalDate} - review usage and terms before renewal` |
| `trial_drift` | `{name} trial auto-converts on {renewalDate} - cancel before auto-conversion` |
| `duplicate_spend` | `Cancel duplicate {category} tool {name} - keep {cheapestName} (cheapest)` |

One line each, containing the subscription name and a concrete action (spec F3). Use plain ASCII hyphens (no em dashes) so the strings survive CSV/terminal contexts unchanged. The frontend renders these **verbatim**.

### 4.6 Engine output ordering (deterministic)

`Flag[]` is returned sorted by: `estimatedMonthlySavings` **DESC** with **nulls last**, then `name` ASC, then `flagType` in enum-declaration order (`inactive_seats`, `upcoming_renewal`, `trial_drift`, `duplicate_spend`). This matches the alerts-panel order so the API layer's sort (§7.8) and the engine agree; tests may assert either.

---

## 5. Analysis Upsert Semantics

PM Clarification #6, expanded into precise rules. `persistAnalysis` runs **inside a single better-sqlite3 transaction** (§8.4).

**Keying**: every flag is keyed on `(subscription_id, flag_type)` — enforced by the UNIQUE constraint. A subscription may hold up to 4 flag rows, one per type, and can legitimately hold several simultaneously (e.g. both `inactive_seats` and `duplicate_spend`).

```text
persistAnalysis(engineFlags: Flag[], now: string /* ISO UTC */): AnalysisRunSummary
  — runs inside ONE db.transaction —

  existing      := SELECT * FROM flags                       // all rows
  existingByKey := Map keyed (subscription_id, flag_type) → FlagRow
  detectedKeys  := Set of (f.subscriptionId, f.flagType) for all f in engineFlags

  FOR each f in engineFlags:
    row := existingByKey.get((f.subscriptionId, f.flagType))
    IF row is undefined:
      INSERT (id auto, f.subscriptionId, f.flagType,
              status='open', f.estimatedMonthlySavings, f.recommendation,
              detected_at=now, resolved_at=NULL, action_taken=NULL)
    ELSE IF row.status = 'open':
      UPDATE row SET estimated_monthly_savings = f.estimatedMonthlySavings,
                     recommendation            = f.recommendation,
                     detected_at              = now
              WHERE id = row.id
      -- refreshes the numbers; stays open
    ELSE:  -- row.status is 'resolved' or 'dismissed'
      NO-OP. Never reset resolved/dismissed status, never rewrite its savings,
      recommendation, or timestamps. This is what keeps the Recovered metric
      stable across re-runs (PM #6) — even if the same waste is re-detected.

  FOR each row in existing WHERE row.status = 'open'
       AND (row.subscription_id, row.flag_type) ∉ detectedKeys:
    DELETE FROM flags WHERE id = row.id
    -- problem no longer detected while still open → leave the open list.
    -- resolved/dismissed rows are NEVER deleted by analysis: resolved rows
    -- carry Recovered history; dismissed rows must not resurrect as "new"
    -- open flags on the next run.

  RETURN summary computed as a POST-RUN SNAPSHOT OF OPEN FLAGS:
    flagsByType   := { inactive_seats: n₁, upcoming_renewal: n₂,
                       trial_drift: n₃, duplicate_spend: n₄ }   // all 4 keys always
                                                                  // present, zeros included
    totalPotentialMonthlySavings := round2(Σ estimated_monthly_savings
                                            over OPEN flags)    // NULLs contribute 0
```

**Invariants** (assert these in Task 10's route tests):
- Running analysis twice in a row produces **zero duplicate rows** (UNIQUE key + the no-op branch).
- Resolve an alert → re-run analysis → the alert **stays resolved**; `recoveredTotal` is unchanged.
- Fix a problem (e.g. set `seatsActive = seatsProvisioned`) → re-run → the previously open flag is **deleted**, not just hidden.
- Immediately after a run on unchanged data: `totalPotentialMonthlySavings` (run summary) **equals** `wastedMonthly` (dashboard summary).
- Dismiss an alert → re-run while the waste still exists → the alert **stays dismissed** (it is re-detected but the no-op branch wins). It does not return to the open list in v1 — see Interpretation Log #3.

---

## 6. Error Envelope & Validation Mapping

### 6.1 Envelope shape (single, universal)

```json
{ "error": { "message": "string", "details": [ { "path": "string", "message": "string" } ] } }
```

- `message`: human-readable, safe for display; NEVER contains a stack trace, file path, SQL, or internal error text.
- `details`: array of `{ path, message }`; **present only on 400 validation failures**; omitted everywhere else (not `null`, not `[]`).
- Every non-2xx JSON response — validation, 404, 409, 413, 500, unknown route — uses this envelope. No exceptions, no alternate error shapes.

### 6.2 Zod → 400 mapping rules

- Zod `safeParse` failure → HTTP **400** with `message: "Validation failed"` and `details` built from the Zod issues:

```
details = issues.map(issue => ({
  path:    issue.path.length > 0 ? issue.path.join(".") : "(root)",
  message: issue.message,        // exact custom-message strings from §7.1/§7.9 schemas
}))
```

- `details` preserves Zod's issue order = schema field-declaration order (stable for tests).
- Cross-field violations are reported on `seatsActive` (path `seatsActive`) — define the seats rule with `superRefine`/`.refine` at object level, adding the issue with `path: ['seatsActive']`.
- Unknown request-body keys are **stripped silently** (Zod default `.strip()` behavior) — not a 400. Query params: unknown params are ignored.
- Body present but wrong shape (e.g. array where object expected, or `Content-Type: text/plain` so the body never parsed and `req.body` is `undefined`) → Zod fails → **400** "Validation failed".

### 6.3 Status-code semantics

| Status | Meaning | When |
|---|---|---|
| 400 | Validation failed / malformed input | Zod rejection, malformed `:id`, malformed JSON body |
| 404 | Not found | Well-formed id that matches no row; unknown route |
| 409 | Conflict — invalid state transition | resolve/dismiss on an alert whose status ≠ `open` |
| 413 | Payload too large | body > 100kb (`express.json` limit) |
| 500 | Internal error | anything unexpected; generic envelope, full details logged server-side only |

`404` vs `400` on `:id`: a **malformed** id (`/api/subscriptions/abc`, `/api/alerts/0`) → **400** with details `[{path:"id", message:"id must be a positive integer"}]`; a **well-formed but missing** id (`/api/subscriptions/9999`) → **404**.

### 6.4 Express 5 middleware & handler ordering (Task 2 — exact)

```ts
export function createApp(): Express {
  initDatabase();                                  // 0. schema + first-run seed + bootstrap (idempotent)
  const app = express();
  app.use(express.json({ limit: '100kb' }));       // 1. body parser (100kb ceiling → 413)
  app.use(cors({ origin: CORS_ORIGIN }));          // 2. CORS for the Vite origin (§9)
  app.use('/api/health',      healthRouter);       // 3. routes
  app.use('/api/subscriptions', subscriptionsRouter);
  app.use('/api/analysis',    analysisRouter);
  app.use('/api/alerts',      alertsRouter);
  app.use('/api/dashboard',  dashboardRouter);
  app.use('/api/export',      exportRouter);
  app.use(notFoundHandler);                        // 4. 404 catch-all — anything no route matched
  app.use(errorHandler);                           // 5. error handler — 4-arg, registered LAST, always
  return app;
}
```

Rules:
- `errorHandler` is the **only** 4-arg middleware and must be the final `app.use`. It receives everything thrown or `next(err)`-ed by routes, the validation middleware, and the body parser.
- Malformed JSON: `express.json` throws a `SyntaxError` (`type === 'entity.parse.failed'`) → errorHandler maps it to **400** `{ "error": { "message": "Malformed JSON body" } }` (no `details`).
- Body > 100kb: body-parser error with `status 413` / `type === 'entity.too.large'` → **413** `{ "error": { "message": "Payload too large" } }`.
- Zod validation failures surface as a custom `ApiError` (status 400 + mapped `details`) thrown by the `validate` middleware — never handled inline in routes; everything funnels to errorHandler.
- **500 fallback**: `{ "error": { "message": "Internal server error" } }`. The handler `console.error`s the full error **with stack** to the server console (that's the only place stacks exist — never in responses, never in `details`).
- better-sqlite3 is synchronous, so handlers are synchronous; if an async handler is ever introduced, Express 5 forwards its rejected promise to errorHandler automatically.
- Route handlers never construct error JSON themselves — one shape, one place.

### 6.5 Canonical error bodies (copy these into tests verbatim)

```json
// 400 — body/query validation
{ "error": { "message": "Validation failed",
             "details": [ { "path": "monthlyCost", "message": "monthlyCost must be a positive number" },
                          { "path": "seatsActive",  "message": "seatsActive must be less than or equal to seatsProvisioned" } ] } }

// 400 — malformed :id
{ "error": { "message": "Validation failed",
             "details": [ { "path": "id", "message": "id must be a positive integer" } ] } }

// 400 — malformed JSON body
{ "error": { "message": "Malformed JSON body" } }

// 404 — missing entity
{ "error": { "message": "Subscription 9999 not found" } }

// 404 — unknown route (catch-all)
{ "error": { "message": "Not found" } }

// 409 — invalid alert state transition
{ "error": { "message": "Alert 7 is not open (current status: resolved)" } }

// 413
{ "error": { "message": "Payload too large" } }

// 500
{ "error": { "message": "Internal server error" } }
```

---

## 7. Endpoint Specifications

Every response field set below matches the spec's F1–F5 fields exactly (plus server-managed `id`/timestamps and Task-mandated joins). **No invented fields.** All example bodies assume "today" = 2026-09-03 and share one coherent story: Figma has a resolved `inactive_seats` alert; Slack carries two open flags (`duplicate_spend` + `inactive_seats`) — which also demonstrates the multi-flag-per-subscription semantics.

### 7.1 Shared Zod schemas (Task 6 — `server/src/validation/schemas.ts`)

```ts
const ISO_DATE = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, M.renewalDate)
  .refine(isRealCalendarDate, M.renewalDate);   // rejects 2026-02-30, accepts 2028-02-29

export const subscriptionCreateSchema = z.object({
  name:              z.string().trim().min(1, M.name).max(120, M.nameMax),
  vendor:            z.string().trim().max(120),
  category:          z.enum(CATEGORIES),                    // 9 values (§3.4)
  monthlyCost:       z.number().finite().positive(M.monthlyCost),
  billingCycle:      z.enum(['monthly', 'annual']),
  renewalDate:       ISO_DATE,
  seatsProvisioned:  z.number().int(M.seatsProvisioned).min(0, M.seatsProvisioned),
  seatsActive:       z.number().int(M.seatsActive).min(0, M.seatsActive),
  owningDepartment:  z.string().trim().max(120),
  status:            z.enum(['active', 'trial', 'cancelled']),
  notes:             z.string().trim().max(2000).nullable().optional(),
}).superRefine((s, ctx) => {
  if (s.seatsActive > s.seatsProvisioned) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['seatsActive'], message: M.seatsCross });
  }
});

// Update: every field optional, identical per-field rules. Cross-field is checked here
// when both seats are present; the remaining partial cases are caught by re-running
// subscriptionCreateSchema over the merged row in the PUT handler (§7.6 step 5).
export const subscriptionUpdateSchema = subscriptionCreateSchema.partial();

export const resolveAlertSchema = z.object({
  actionTaken: z.string().trim().min(1, M.actionTaken).max(500, M.actionTakenMax),
});
```

**Locked validation messages** (use these exact strings as Zod custom messages — tests assert them):

| Rule | Message |
|---|---|
| name empty/non-string | `name must be a non-empty string` |
| name > 120 chars | `name must be at most 120 characters` |
| category not in enum | `category must be one of: dev, design, marketing, sales, productivity, security, analytics, hr, other` |
| monthlyCost ≤ 0 / non-finite / non-number | `monthlyCost must be a positive number` |
| billingCycle not in enum | `billingCycle must be one of: monthly, annual` |
| renewalDate bad format or not a real calendar date | `renewalDate must be a valid ISO date string (YYYY-MM-DD)` |
| seatsProvisioned non-int or < 0 | `seatsProvisioned must be an integer ≥ 0` |
| seatsActive non-int or < 0 | `seatsActive must be an integer ≥ 0` |
| seatsActive > seatsProvisioned (cross-field) | `seatsActive must be less than or equal to seatsProvisioned` |
| status not in enum | `status must be one of: active, trial, cancelled` |
| actionTaken empty/non-string | `actionTaken must be a non-empty string` |
| actionTaken > 500 chars | `actionTaken must be at most 500 characters` |
| `:id` malformed | `id must be a positive integer` |
| query `sort` invalid | `sort must be one of: cost, renewal` |
| query `order` invalid | `order must be one of: asc, desc` |
| query `status` (alerts) invalid | `status must be one of: open, resolved, dismissed, all` |

String normalization: inputs are `.trim()`-ed **before** validation and stored trimmed. `name` must be non-empty **after** trimming (whitespace-only is rejected). `vendor` / `owningDepartment` accept empty strings (they mirror Task 6's literal "string" rules — see Interpretation Log #1). `notes` accepts `string | null | omitted`; `null`/omitted → stored as `NULL`.

---

### 7.2 `GET /api/health` — Task 2

**Request**: none (no params, no body, nothing to validate).

**Response `200`**:
```json
{ "status": "ok" }
```
Exactly this body — no extra keys. (The health endpoint predates the DB module; it never touches the database.)

**Errors**: none defined beyond the universal 404 (unknown route) / 500. Always 200 when the process is up.

---

### 7.3 `GET /api/subscriptions` — list + search + sort — Task 7

**Query params** (validated with `listSubscriptionsQuerySchema`):

| Param | Type | Rule | Default |
|---|---|---|---|
| `q` | string | trimmed; case-insensitive substring match against `name` **OR** `vendor`; empty-after-trim → treated as absent (no filter) | absent |
| `sort` | enum | `cost` \| `renewal` | absent → natural order `id ASC` (seed order) |
| `order` | enum | `asc` \| `desc` | `desc`; **ignored when `sort` is absent** |

**SQL behavior** (see §8.3 for the prepared-statement matrix): `q` is matched with `lower(name) LIKE ? ESCAPE '\' OR lower(vendor) LIKE ? ESCAPE '\'` — the `%`, `_`, and `\` characters inside `q` are escaped before wrapping in `%…%` (so searching `100%` is literal). Case-insensitivity is ASCII (SQLite `lower()`); acceptable for v1. `sort=cost` → `ORDER BY monthly_cost {asc|desc}, id ASC`; `sort=renewal` → `ORDER BY renewal_date {asc|desc}, id ASC`. The `id ASC` tiebreak keeps order deterministic.

**Response `200`** — bare array of full subscription objects (14 fields, §3.4). Empty result → `[]`.

```json
[
  {
    "id": 1,
    "name": "Figma",
    "vendor": "Figma, Inc.",
    "category": "design",
    "monthlyCost": 230,
    "billingCycle": "annual",
    "renewalDate": "2026-09-30",
    "seatsProvisioned": 60,
    "seatsActive": 13,
    "owningDepartment": "Design",
    "status": "active",
    "notes": "Org-wide design tool",
    "createdAt": "2026-09-03T09:00:00.000Z",
    "updatedAt": "2026-09-03T09:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Slack",
    "vendor": "Slack Technologies",
    "category": "productivity",
    "monthlyCost": 460,
    "billingCycle": "annual",
    "renewalDate": "2026-12-01",
    "seatsProvisioned": 322,
    "seatsActive": 121,
    "owningDepartment": "Engineering",
    "status": "active",
    "notes": null,
    "createdAt": "2026-09-03T09:00:00.000Z",
    "updatedAt": "2026-09-03T09:00:00.000Z"
  },
  {
    "id": 3,
    "name": "Notion",
    "vendor": "Notion Labs",
    "category": "productivity",
    "monthlyCost": 180,
    "billingCycle": "monthly",
    "renewalDate": "2026-10-10",
    "seatsProvisioned": 120,
    "seatsActive": 120,
    "owningDepartment": "Operations",
    "status": "active",
    "notes": "Team wiki",
    "createdAt": "2026-09-03T09:00:00.000Z",
    "updatedAt": "2026-09-03T09:00:00.000Z"
  }
]
```

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | invalid `sort` or `order` value | `{ "error": { "message": "Validation failed", "details": [ { "path": "sort", "message": "sort must be one of: cost, renewal" } ] } }` |

---

### 7.4 `POST /api/subscriptions` — create — Task 7

**Request body**: `subscriptionCreateSchema` (§7.1) — all 11 F1 fields required except `notes`. Cross-field rule: `seatsActive ≤ seatsProvisioned`.

```json
{
  "name": "Linear",
  "vendor": "Linear",
  "category": "dev",
  "monthlyCost": 240,
  "billingCycle": "monthly",
  "renewalDate": "2026-10-15",
  "seatsProvisioned": 30,
  "seatsActive": 30,
  "owningDepartment": "Engineering",
  "status": "active",
  "notes": null
}
```

**Response `201`** — the created row; `Location: /api/subscriptions/25` header set.

```json
{
  "id": 25,
  "name": "Linear",
  "vendor": "Linear",
  "category": "dev",
  "monthlyCost": 240,
  "billingCycle": "monthly",
  "renewalDate": "2026-10-15",
  "seatsProvisioned": 30,
  "seatsActive": 30,
  "owningDepartment": "Engineering",
  "status": "active",
  "notes": null,
  "createdAt": "2026-09-03T10:12:44.512Z",
  "updatedAt": "2026-09-03T10:12:44.512Z"
}
```

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | any schema violation (multi-error shown; details ordered by field-declaration order) | `{ "error": { "message": "Validation failed", "details": [ { "path": "monthlyCost", "message": "monthlyCost must be a positive number" }, { "path": "seatsActive", "message": "seatsActive must be less than or equal to seatsProvisioned" } ] } }` |
| 400 | malformed JSON body | `{ "error": { "message": "Malformed JSON body" } }` |
| 413 | body > 100kb | `{ "error": { "message": "Payload too large" } }` |

---

### 7.5 `GET /api/subscriptions/:id` — Task 7

**Path param**: `id` — positive integer (`parseId` helper: malformed → 400 per §6.3).

**Response `200`**: the full subscription object (same 14-field shape as list rows) — e.g. the Figma row from §7.3.

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | `:id` not a positive integer (`/api/subscriptions/abc`) | `{ "error": { "message": "Validation failed", "details": [ { "path": "id", "message": "id must be a positive integer" } ] } }` |
| 404 | well-formed id, no row | `{ "error": { "message": "Subscription 9999 not found" } }` |

---

### 7.6 `PUT /api/subscriptions/:id` — partial update — Task 7

**Semantics — merge-then-validate** (this is what makes the Task 6 rule "update schemas make all fields optional but re-validate cross-field rules when present" work):

1. `parseId` → 400 if malformed.
2. Fetch current row → **404** if missing.
3. Parse body with `subscriptionUpdateSchema` (all fields optional, per-field rules) → 400.
4. Merge: `merged = { ...currentRow, ...patch }` (omitted keys keep current values).
5. Re-validate `merged` with `subscriptionCreateSchema` (full rules incl. seats cross-field on the **effective** values) → 400 if the merged row is invalid (e.g. patching only `seatsActive: 150` against a stored `seatsProvisioned: 120`).
6. Full-column UPDATE via one fixed prepared statement; `updated_at = now`. (No dynamic SET clauses, ever — §8.)

An empty body `{}` is a valid no-op: 200, row returned, `updatedAt` refreshed.

**Request body** (any subset of the 11 F1 fields):
```json
{ "seatsActive": 96, "notes": "Removed unused licenses" }
```

**Response `200`** — the updated row:
```json
{
  "id": 3,
  "name": "Notion",
  "vendor": "Notion Labs",
  "category": "productivity",
  "monthlyCost": 180,
  "billingCycle": "monthly",
  "renewalDate": "2026-10-10",
  "seatsProvisioned": 120,
  "seatsActive": 96,
  "owningDepartment": "Operations",
  "status": "active",
  "notes": "Removed unused licenses",
  "createdAt": "2026-09-03T09:00:00.000Z",
  "updatedAt": "2026-09-03T10:31:02.220Z"
}
```

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | malformed `:id`; invalid patch fields; merged row violates cross-field rule | same shapes as §7.4/§7.5 (path `seatsActive`, message `seatsActive must be less than or equal to seatsProvisioned`) |
| 404 | id not found | `{ "error": { "message": "Subscription 9999 not found" } }` |

---

### 7.7 `DELETE /api/subscriptions/:id` — Task 7

**Path param**: `id` — positive integer.

**Semantics**: deletes the subscription **and cascades** to its flag rows (FK `ON DELETE CASCADE`, §3). Consequence, intended: deleting a subscription also removes its resolved flags, so `recoveredTotal` decreases accordingly — deleting a registry entry deletes its history. No orphan flag rows can ever exist (test-verified per Task 7).

**Response `204`** — no body.

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | malformed `:id` | §7.5 shape |
| 404 | id not found | `{ "error": { "message": "Subscription 9999 not found" } }` |

---

### 7.8 `POST /api/analysis/run` — Task 10

On demand only — the frontend "Run analysis" button. **No scheduler, no cron, no background job** (spec + PM #7).

**Request**: no body, no params (nothing to validate; an empty or absent body is fine).

**Behavior**: load all subscriptions → `analyzeSubscriptions(rows, new Date())` → `persistAnalysis(engineFlags, now)` in one transaction (§5) → return the post-run snapshot summary.

**Response `200`** — `AnalysisRunSummary`:
```json
{
  "flagsByType": {
    "inactive_seats": 1,
    "upcoming_renewal": 1,
    "trial_drift": 1,
    "duplicate_spend": 2
  },
  "totalPotentialMonthlySavings": 1897.14
}
```

(Story check: open flags are Slack-inactive $287.14 + Slack-duplicate $460 + Datadog-duplicate $1150 + Figma-renewal `null` + Miro-trial `null` → 1897.14 total, 2 duplicates, 1 of each other type. The resolved Figma inactive-seats flag does **not** count — the snapshot is open-only.)

**Errors**: 500 only (unexpected); no 4xx paths exist for this endpoint.

---

### 7.9 `GET /api/alerts` — Task 10

**Query params** (`listAlertsQuerySchema`):

| Param | Type | Rule | Default |
|---|---|---|---|
| `status` | enum | `open` \| `resolved` \| `dismissed` \| `all` | `open` |

**Response `200`** — bare array of `Alert` objects: flags **joined with subscription name/vendor**, ordered by `estimated_monthly_savings` **DESC, nulls last** (SQLite sorts NULL as smallest, so plain `DESC` yields nulls-last naturally), tie-break `subscription name ASC`, then `flag_type ASC`. Deterministic.

```json
[
  {
    "id": 11,
    "subscriptionId": 4,
    "subscriptionName": "Datadog",
    "subscriptionVendor": "Datadog, Inc.",
    "flagType": "duplicate_spend",
    "status": "open",
    "estimatedMonthlySavings": 1150,
    "recommendation": "Cancel duplicate analytics tool Datadog - keep Mixpanel (cheapest)",
    "detectedAt": "2026-09-03T09:00:12.345Z",
    "resolvedAt": null,
    "actionTaken": null
  },
  {
    "id": 7,
    "subscriptionId": 2,
    "subscriptionName": "Slack",
    "subscriptionVendor": "Slack Technologies",
    "flagType": "duplicate_spend",
    "status": "open",
    "estimatedMonthlySavings": 460,
    "recommendation": "Cancel duplicate productivity tool Slack - keep Notion (cheapest)",
    "detectedAt": "2026-09-03T09:00:12.345Z",
    "resolvedAt": null,
    "actionTaken": null
  },
  {
    "id": 8,
    "subscriptionId": 2,
    "subscriptionName": "Slack",
    "subscriptionVendor": "Slack Technologies",
    "flagType": "inactive_seats",
    "status": "open",
    "estimatedMonthlySavings": 287.14,
    "recommendation": "Downgrade 201 unused seats in Slack",
    "detectedAt": "2026-09-03T09:00:12.345Z",
    "resolvedAt": null,
    "actionTaken": null
  },
  {
    "id": 12,
    "subscriptionId": 1,
    "subscriptionName": "Figma",
    "subscriptionVendor": "Figma, Inc.",
    "flagType": "upcoming_renewal",
    "status": "open",
    "estimatedMonthlySavings": null,
    "recommendation": "Figma renews on 2026-09-30 - review usage and terms before renewal",
    "detectedAt": "2026-09-03T09:00:12.345Z",
    "resolvedAt": null,
    "actionTaken": null
  },
  {
    "id": 9,
    "subscriptionId": 6,
    "subscriptionName": "Miro",
    "subscriptionVendor": "Miro HQ",
    "flagType": "trial_drift",
    "status": "open",
    "estimatedMonthlySavings": null,
    "recommendation": "Miro trial auto-converts on 2026-09-14 - cancel before auto-conversion",
    "detectedAt": "2026-09-03T09:00:12.345Z",
    "resolvedAt": null,
    "actionTaken": null
  }
]
```

(Note rows 1 & 2: one subscription — Slack — legitimately holds two different flags. The unique key is `(subscription_id, flag_type)`, not `subscription_id` alone.)

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | invalid `status` value | `{ "error": { "message": "Validation failed", "details": [ { "path": "status", "message": "status must be one of: open, resolved, dismissed, all" } ] } }` |

---

### 7.10 `POST /api/alerts/:id/resolve` — Task 11

**Path param**: `id` — positive integer. **Request body**: `resolveAlertSchema` — `{ "actionTaken": "…" }`, non-empty trimmed string ≤ 500 chars.

**Semantics** — single atomic statement, then classify:
```
UPDATE flags SET status='resolved', action_taken=?, resolved_at=?
WHERE id=? AND status='open'
```
- `changes === 1` → success.
- `changes === 0` → fetch the row by id: **no row** → 404; **row exists but status ≠ open** → 409.

**Response `200`** — the updated alert:
```json
{
  "id": 13,
  "subscriptionId": 1,
  "subscriptionName": "Figma",
  "subscriptionVendor": "Figma, Inc.",
  "flagType": "inactive_seats",
  "status": "resolved",
  "estimatedMonthlySavings": 180.17,
  "recommendation": "Downgrade 47 unused seats in Figma",
  "detectedAt": "2026-09-03T09:00:12.345Z",
  "resolvedAt": "2026-09-03T11:02:10.001Z",
  "actionTaken": "Downgraded to 13 seats (effective next cycle)"
}
```

Resolved savings feed the dashboard `recoveredTotal` (§7.12). Re-running analysis never resurrects this row as open (§5).

**Errors**:
| Status | Condition | Example body |
|---|---|---|
| 400 | malformed `:id`; `actionTaken` missing/empty/non-string/too long | §6.5 shapes, e.g. `{ "error": { "message": "Validation failed", "details": [ { "path": "actionTaken", "message": "actionTaken must be a non-empty string" } ] } }` |
| 404 | id matches no flag | `{ "error": { "message": "Alert 999 not found" } }` |
| 409 | flag exists but status ≠ `open` (already resolved or dismissed) | `{ "error": { "message": "Alert 7 is not open (current status: resolved)" } }` |

---

### 7.11 `POST /api/alerts/:id/dismiss` — Task 11

**Path param**: `id` — positive integer. **Request body**: none.

**Semantics** — single atomic statement:
```
UPDATE flags SET status='dismissed' WHERE id=? AND status='open'
```
Dismiss changes **only** `status`. `resolved_at` and `action_taken` stay NULL (they are resolve-specific), and dismissed alerts never contribute to `recoveredTotal`. Same `changes === 0` → 404/409 classification as resolve.

**Response `200`** — the updated alert (same shape as §7.10, with `"status": "dismissed"`, `"resolvedAt": null`, `"actionTaken": null`).

**Errors**: identical matrix to §7.10 (409 example: `{ "error": { "message": "Alert 7 is not open (current status: dismissed)" } }`).

---

### 7.12 `GET /api/dashboard/summary` — Task 12

**Request**: no params, no body.

**Implementation shape**: route loads all subscriptions + all flags (24-row dataset — trivial), then a **pure function** with its own unit tests:

```ts
// server/src/engine/metrics.ts
export function computeDashboardSummary(
  subscriptions: Subscription[],
  flags: FlagRow[],
  today?: Date,
): DashboardSummary
```

**Metric rules** (all locked; PM #8 for spend):
- `totalMonthlySpend` = `round2(Σ monthlyCost)` over `status ∈ {active, trial}` — cancelled = $0 (PM #8)
- `projectedAnnualSpend` = `round2(totalMonthlySpend × 12)` (PM #1)
- `wastedMonthly` = `round2(Σ estimatedMonthlySavings)` over **open** flags (NULLs contribute 0)
- `recoveredTotal` = `round2(Σ estimatedMonthlySavings)` over **resolved** flags
- `wastePercent` = `totalMonthlySpend > 0 ? round2(wastedMonthly / totalMonthlySpend × 100) : 0` — zero-spend never divides by zero
- `upcomingRenewals` = subscriptions with `status ∈ {active, trial}` and `0 ≤ daysUntil(renewalDate) ≤ 60` (inclusive; past-due excluded), mapped to `{ name, vendor, renewalDate, monthlyCost }` — **exactly these 4 fields** — sorted `renewalDate ASC`, tie-break `name ASC`

**Response `200`** — `DashboardSummary`:
```json
{
  "totalMonthlySpend": 14382.5,
  "projectedAnnualSpend": 172590,
  "wastedMonthly": 1897.14,
  "recoveredTotal": 180.17,
  "wastePercent": 13.19,
  "upcomingRenewals": [
    { "name": "Miro",   "vendor": "Miro HQ",           "renewalDate": "2026-09-14", "monthlyCost": 95 },
    { "name": "Figma",  "vendor": "Figma, Inc.",       "renewalDate": "2026-09-30", "monthlyCost": 230 },
    { "name": "Notion", "vendor": "Notion Labs",       "renewalDate": "2026-10-10", "monthlyCost": 180 }
  ]
}
```

(Story check: `wastedMonthly` = the §7.8 open-flag total; `recoveredTotal` = the §7.10 resolved Figma flag; Slack's 2026-12-01 renewal is 89 days out → excluded. `wastePercent` = 1897.14 / 14382.5 × 100 = 13.19. The frontend renders the percent at 1 decimal; the API supplies 2.)

**Errors**: 500 only; no 4xx paths.

---

### 7.13 `GET /api/export/alerts.csv` — Task 13

**Request**: no params, no body.

**Response `200`** — headers:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="trimstack-waste-report.csv"
```

**Body** (bytes, in order):
1. UTF-8 BOM (`\uFEFF`) first — so Excel/Numbers detect the encoding.
2. Header row, exactly: `subscription,flag type,monthly savings,recommendation,status`
3. One row per **open** alert (same set and order as `GET /api/alerts?status=open`).
4. CRLF (`\r\n`) line endings, including after the last row.

**Column rules**:

| CSV column | Source | Format |
|---|---|---|
| `subscription` | joined subscription **name** | verbatim string |
| `flag type` | `flagType` | **human label** via locked map: `inactive_seats`→`Inactive seats`, `upcoming_renewal`→`Upcoming renewal`, `trial_drift`→`Trial drift`, `duplicate_spend`→`Duplicate spend` |
| `monthly savings` | `estimatedMonthlySavings` | `toFixed(2)` (e.g. `1150.00`); **empty cell when null** |
| `recommendation` | `recommendation` | verbatim one-liner |
| `status` | flag `status` | always `open` (the export is open-alerts only; constant column required by spec) |

**RFC 4180 escaping** (pure serializer in `server/src/export/csv.ts`; lock these test vectors):
- Field containing `,` `"` CR or LF → wrap in double quotes; inner `"` doubled. Vectors: `a,b` → `"a,b"` · `say "hi"` → `"say ""hi"""` · `line1\nline2` → quoted with the newline inside · ordinary field → unquoted.
- Recommendation strings are engine-generated from the §4.5 templates (no commas/quotes by design), but the serializer must still escape defensively — the `subscription` column is user-editable data (e.g. a sub named `Acme, Inc.`).
- Escape and quote BEFORE joining with CRLF; never post-process the whole line.

**Example body** (matches the §7.9 open set; none of these recommendation strings contain `,` `"` CR or LF, so per the rules above they are emitted **unquoted** — a subscription named `Acme, Inc.` would force quotes on the `subscription` column):
```
subscription,flag type,monthly savings,recommendation,status
Datadog,Duplicate spend,1150.00,Cancel duplicate analytics tool Datadog - keep Mixpanel (cheapest),open
Slack,Duplicate spend,460.00,Cancel duplicate productivity tool Slack - keep Notion (cheapest),open
Slack,Inactive seats,287.14,Downgrade 201 unused seats in Slack,open
Figma,Upcoming renewal,,Figma renews on 2026-09-30 - review usage and terms before renewal,open
Miro,Trial drift,,Miro trial auto-converts on 2026-09-14 - cancel before auto-conversion,open
```

(Shown with LF for readability; on the wire every line ends CRLF, and the file starts with the BOM.)

**Edge case**: zero open alerts → **200** with header row only (BOM + header + trailing CRLF). Never 404, never empty body.

**Errors**: 500 only; no 4xx paths.

---

## 8. Repository Layer Pattern

### 8.1 Database module lifecycle (`server/src/db/database.ts`)

```ts
// Module import side effect: opens the connection ONCE per module instance.
const dbPath = process.env.DB_PATH ?? 'server/data/trimstack.sqlite';  // read at import time
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');   // readers never block the (single) writer
db.pragma('foreign_keys = ON');    // REQUIRED for ON DELETE CASCADE — better-sqlite3
                                   // defaults FK enforcement OFF; this pragma is per-connection

export function initDatabase(): void { /* idempotent, module-flag guarded:
  applySchema()  → all CREATE … IF NOT EXISTS (§3.1)
  seedIfEmpty()  → first-run guard + 24-row seed (§10)
  bootstrapIfSeededNow() → one inline analysis run right after a FIRST seed (PM #7)
*/ }
```

- `initDatabase()` is called by the app factory (Task 2's `createApp`) before routers mount — so supertest against a temp DB gets schema + seed + bootstrap automatically.
- Booting twice in a row is safe: all DDL is `IF NOT EXISTS`, the seed guard skips non-empty DBs, and bootstrap runs only when seeding actually happened this boot.
- `PRAGMA foreign_keys = ON` must run on every connection — tests opening temp DBs get it for free via the same module.

### 8.2 Statement discipline (grep-verifiable)

- **Every** query is a better-sqlite3 prepared statement with bound parameters. Zero template-literal SQL, zero string-concatenated SQL with user input, anywhere in `server/src/`. (CI/review greps for SQL near backticks.)
- **The only SQL text that varies at all** is the list-query matrix below, and it varies exclusively over **code-owned constants** — never over anything derived from user input. User-controlled values (q, ids, actionTaken, savings) are always bound parameters.

### 8.3 Prepared statements at module init

Repository modules call `.prepare()` at module scope, once per module instance (cheap; re-created naturally in tests via `vi.resetModules`):

**`subscriptionsRepository`**

| Statement | Fixed SQL (abbreviated) |
|---|---|
| `insertSubscription` | `INSERT INTO subscriptions (name, vendor, category, monthly_cost, billing_cycle, renewal_date, seats_provisioned, seats_active, owning_department, status, notes, created_at, updated_at) VALUES (?, …, ?)` |
| `getSubscriptionById` | `SELECT … WHERE id = ?` |
| `updateSubscriptionFull` | `UPDATE subscriptions SET name=?, vendor=?, category=?, monthly_cost=?, billing_cycle=?, renewal_date=?, seats_provisioned=?, seats_active=?, owning_department=?, status=?, notes=?, updated_at=? WHERE id=?` — one fixed full-column statement; PUT merges in JS first (§7.6) precisely so this never needs dynamic SET clauses |
| `deleteSubscriptionById` | `DELETE FROM subscriptions WHERE id = ?` (cascade handles flags) |
| `countSubscriptions` | `SELECT COUNT(*) AS n FROM subscriptions` (seed guard) |
| **list matrix** | 10 fixed statements covering the full cross-product `(hasQ × sort × order)` — see below |

**The list matrix** — `ORDER BY` cannot take bound parameters, so the finite combination space is pre-prepared at init, keyed `hasQ|sort|order`:

```
hasQ ∈ {false, true} × sort ∈ {none, cost, renewal} × order ∈ {asc, desc}
→ 2 × (1 + 2 + 2) = 10 statements   // sort=none ignores order
```

Example members (constants only — `monthly_cost`, `renewal_date`, `ASC/DESC` are literal text in code, never interpolated):

```sql
-- key "false|cost|desc"
SELECT … FROM subscriptions ORDER BY monthly_cost DESC, id ASC
-- key "true|renewal|asc"
SELECT … FROM subscriptions
WHERE (lower(name) LIKE ? ESCAPE '\' OR lower(vendor) LIKE ? ESCAPE '\')
ORDER BY renewal_date ASC, id ASC
```

The `q` value is escaped (`%`→`\%`, `_`→`\_`, `\`→`\\`) then wrapped `%…%` and **bound as a parameter twice** (once per LIKE).

**`flagsRepository`**

| Statement | Fixed SQL (abbreviated) |
|---|---|
| `listFlags` (×2: unfiltered + `WHERE status = ?`) | `SELECT f.*, s.name, s.vendor FROM flags f JOIN subscriptions s ON s.id = f.subscription_id [WHERE f.status = ?] ORDER BY f.estimated_monthly_savings DESC, s.name ASC, f.flag_type ASC` |
| `getFlagById` | `SELECT f.*, s.name, s.vendor FROM flags f JOIN subscriptions s … WHERE f.id = ?` |
| `insertFlag` | `INSERT INTO flags (subscription_id, flag_type, status, estimated_monthly_savings, recommendation, detected_at) VALUES (?, ?, 'open', ?, ?, ?)` |
| `refreshOpenFlag` | `UPDATE flags SET estimated_monthly_savings=?, recommendation=?, detected_at=? WHERE id=? AND status='open'` |
| `deleteFlagById` | `DELETE FROM flags WHERE id = ?` |
| `resolveFlag` | `UPDATE flags SET status='resolved', action_taken=?, resolved_at=? WHERE id=? AND status='open'` |
| `dismissFlag` | `UPDATE flags SET status='dismissed' WHERE id=? AND status='open'` |

`persistAnalysis` (§5) lives in `flagsRepository` and orchestrates `listFlags`/`insertFlag`/`refreshOpenFlag`/`deleteFlagById` inside one transaction.

### 8.4 Transaction rule

Wrap multi-statement writes in `db.transaction(() => { … })()`:
- **`persistAnalysis`** — the entire upsert pass (inserts + refreshes + deletes) is one transaction. Either the run fully lands or nothing changes; a half-applied analysis can never exist.
- **Seed insert pass** — all 24 rows in one transaction.
- Everything else (create, update, delete, resolve, dismiss) is a single atomic statement — no transaction needed.

### 8.5 Temp-DB test pattern (every DB-touching test)

The DB module opens the file **at import time**, so the golden rule is: **set `DB_PATH` before anything imports the db module, and reset modules between tests.**

```ts
// server/src/__tests__/helpers/testDb.ts
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function withTestDb(fn: (dbPath: string) => Promise<void> | void) {
  const dir = mkdtempSync(join(tmpdir(), 'trimstack-test-'));        // fresh dir per test
  process.env.DB_PATH = join(dir, 'test.sqlite');                    // 1. env FIRST
  vi.resetModules();                                                 // 2. drop cached db module
  const { initDatabase } = await import('../../db/database');       // 3. dynamic import
  initDatabase();                                                    // 4. schema + seed + bootstrap
  try { await fn(process.env.DB_PATH); }
  finally { rmSync(dir, { recursive: true, force: true }); }          // 5. always clean up
}
```

Rules:
- One temp file per test — tests never share state, never run against `server/data/trimstack.sqlite`, never depend on execution order.
- Route tests import the app factory via the same dynamic-import-after-env pattern (or the shared helper), so `createApp()` wires to the temp DB.
- Deleting the temp file + re-running = the "fresh install" journey tests (Task 27) rely on.

---

## 9. Security & Performance

**Security (spec NFRs, enforced)**

- **Zod on every endpoint that accepts any input** — body, query, or path param (§7.1 schemas, §6 mapping). `GET /api/health`, `POST /api/analysis/run`, `GET /api/dashboard/summary`, `GET /api/export/alerts.csv`, and `POST /api/alerts/:id/dismiss` accept no body/query (only `:id` where present, via `parseId`), so they have nothing to validate — that is the exhaustive exemption list.
- **Parameterized statements only** (§8.2) — including the ORDER BY problem, solved by the constant list matrix (§8.3), and LIKE metacharacter escaping for `q`.
- **Body size ceiling**: `express.json({ limit: '100kb' })` → 413 beyond it.
- **CORS**: `cors({ origin: CORS_ORIGIN })`, default `http://localhost:5173` (the only legitimate web origin in v1 — Vite proxies `/api` same-origin anyway, so CORS exists for direct-API tooling). No credentials, no wildcard origin.
- **No secrets**: the repo contains zero real secrets. `.env.example` documents `PORT`, `DB_PATH`, `CORS_ORIGIN` with placeholders only. No auth layer exists — deliberately, per the spec's out-of-scope list; the API must serve only the local single-user deployment story.
- **No stack leaks**: errors leave the process only as the sanitized envelope (§6.5); stacks exist solely in server console logs.
- Input hygiene bounds (max string lengths, body ceiling) are deliberately generous — they exist to make abuse boring, not to constrain real usage.

**Performance (spec: p95 < 200ms)**

- The dataset is 24 subscriptions and ≤ 96 flag rows — every endpoint is a prepared, indexed statement over a tiny local file; expect **single-digit milliseconds** end-to-end on a laptop. The 200ms budget is dominated by HTTP overhead; there is enormous headroom.
- **No cache layer, no pagination, no read replicas, no connection pool** (better-sqlite3 is synchronous, single-connection) — any of these would be scope creep and add failure modes for zero benefit at this scale. The documented growth path: pagination on the list endpoints and an in-process cache only after real datasets (10⁴+ rows) exist.
- WAL mode keeps any concurrent readers (e.g. a QA script peeking at the sqlite file) from blocking the API's writes.
- Perf assertions: Task 12's route test asserts a single summary call < 200ms; Task 27's performance spec samples list/summary/analysis/export. All should land well under 50ms locally.

---

## 10. Seeding Rules (Idempotency + Bootstrap)

Task 5 + PM Clarification #7. All rules are testable on a temp DB (§8.5).

1. **First-run guard**: `SELECT COUNT(*) FROM subscriptions` → `0` → seed; `> 0` → skip entirely. Never merges, never updates existing rows, never re-inserts. "Idempotent — never duplicates" (spec F1).
2. **Exactly 24 rows**, inserted in one transaction via the `insertSubscription` prepared statement. Recognizable vendors (Figma, GitHub, Slack, Notion, Zoom, Datadog, HubSpot, 1Password, …) spread across **all 9 categories** and **≥ 3 owning departments**, with **≥ 1 `trial`** and **≥ 1 `cancelled`** subscription.
3. **Waste coverage**: the catalog must trigger **at least one instance of each of the four flag types** when analysis runs — ≥ 1 subscription with `seats_provisioned > seats_active`, ≥ 1 renewal within 30 days, ≥ 1 trial renewing within 14 days, ≥ 1 duplicate-spend cluster (2+ active subs, same category, different departments) — plus a few clean subscriptions that produce no flags.
4. **Relative renewal dates**: the fixed 24-row catalog (Task 5's `seedData.ts`) stores **day offsets**, not absolute dates. At seed time: `renewalDate = today + offsetDays` formatted `'YYYY-MM-DD'` (UTC). The demo never goes stale — next month's fresh install still shows renewals 11 days out, trials 9 days from conversion, etc.
5. **Bootstrap analysis (PM #7)**: immediately after a **first** seed (i.e. only on the boot where rows were actually inserted), run `persistAnalysis(analyzeSubscriptions(rows), now)` **inline** — no scheduler, no cron, no background anything. This is what makes a brand-new install show waste on the dashboard with zero user actions (Success Criterion #1). On every subsequent boot the guard skips seeding, so no bootstrap happens; afterwards analysis runs only via the "Run analysis" button.
6. **Re-seed journey**: delete the DB file → boot → fresh DB → guard sees 0 rows → seeds 24 again (with freshly computed relative dates) → bootstrap runs. Second boot on the seeded DB → still exactly 24 rows, no bootstrap.
7. **Degenerate state**: a DB with subscriptions but zero flags (e.g. someone deleted flag rows) does **not** auto-bootstrap — the user presses "Run analysis". Bootstrap is first-seed-only by design.

---

## 11. Interpretation Log

Everything above follows the spec + task list + PM Clarifications 1–8 verbatim. These are the points where the sources were silent or ambiguous, and the resolution now locked in this contract. Challenge any of these via the PM — do not change them unilaterally in a task.

| # | Question | Resolution | Rationale / location |
|---|---|---|---|
| 1 | Are `vendor` / `owningDepartment` required non-empty? | **No** — they accept empty strings, mirroring Task 6's literal "string" rules; only `name` is non-empty (post-trim). All input strings are trimmed before validation/storage. | Task 6 defines schema rules; deviating would break Task 6's tests. §7.1 |
| 2 | What does the analysis run summary count — detected-this-run or open-after-run? | **Post-run snapshot of OPEN flags**: `flagsByType` counts open flags by type (all 4 keys present, zeros included); `totalPotentialMonthlySavings` = round2 sum over open flags. | Task 10 names the fields but not the basis; the open snapshot is what the UI refresh needs and it makes the invariant "summary total == dashboard wastedMonthly" hold. §5, §7.8 |
| 3 | If resolved/dismissed waste is re-detected later, does the alert reopen? | **No — never.** A `(subscription_id, flag_type)` that is resolved or dismissed stays that way forever (PM #6's "never resets" applied to its logical conclusion). Trade-off: Recovered-metric stability over re-alerting. A *fixed-then-returned* waste pattern needs a new subscription row to alert again. | PM #6 locked history stability; Task 10 says a re-run "never resets recovery history". §5 |
| 4 | Default `sort` when the param is absent? | Natural order: `ORDER BY id ASC` (seed/insertion order); `order` is ignored when `sort` is absent; `order` defaults to `desc` when `sort` is present. | Task 7 fixes only the order default; stable seed order is the predictable unsorted table view. §7.3 |
| 5 | Malformed `:id` (`/abc`) — 400 or 404? | **400** with a `details` entry (id must be a positive integer); well-formed-but-missing id → **404**. | Keeps "404 = entity not found" clean and gives the 400 path a real body for tests. §6.3 |
| 6 | `ORDER BY` can't be parameterized — how to stay grep-clean? | Pre-prepare the finite 10-statement list matrix at module init; SQL text varies only over code-owned constants. | Satisfies Task 4's "zero template-literal SQL" acceptance criterion without unsafe dynamic SQL. §8.3 |
| 7 | CSV "flag type" — raw enum or human label? | **Human label** (`Inactive seats`, `Upcoming renewal`, `Trial drift`, `Duplicate spend`); `status` column stays the lowercase enum (`open`, constant anyway); null savings → **empty cell**; savings always `toFixed(2)`. | Spec calls it a "finance-friendly" report; API JSON keeps raw enums everywhere. §7.13 |
| 8 | Do past-due renewal dates count as "upcoming"? | **No** — both the 30-day flag and the 60-day list require `0 ≤ daysUntil ≤ N` (inclusive). Past-due renewals produce neither. | Task 9 explicitly says the renewal flag is "not flagged for past-due" — extended the same convention to the dashboard list for consistency. §4.3, §7.12 |
| 9 | Does dismiss stamp `resolved_at` / `action_taken`? | **No** — dismiss changes only `status`. Both fields are resolve-specific and stay NULL. | Task 11: "Dismiss sets status without touching recovery totals"; semantically nothing was resolved. §7.11 |
| 10 | Does deleting a subscription reduce Recovered? | **Yes** — the FK cascade removes its resolved flags, so `recoveredTotal` drops. Deleting a registry entry deletes its history; this is intended and test-visible. | Alternative (orphan-safe flag preservation) contradicts Task 7's "no orphan rows" acceptance criterion. §7.7 |
| 11 | List responses wrapped or bare arrays? | **Bare arrays** (`[]` when empty) for subscriptions and alerts. | No wrapper keys are specified anywhere; inventing `{ items: [] }` would add fields the spec doesn't have. §2 |
| 12 | `wastePercent` precision at the API? | 2 decimal places (`round2`); the frontend renders 1 decimal (Task 16's formatting choice). | Penny/percent-exact hand-computation in Task 12's tests; formatting belongs to the UI. §7.12 |
| 13 | Trial sub with renewal ≤ 14 days — two flags (renewal + drift)? | One flag only: `trial_drift`. Conversely, active subs get only `upcoming_renewal`. | The two flags would say the same thing twice for one subscription-action; F3's panel is action-oriented. §4.3 D3 |
| 14 | Empty-string department in duplicate clustering? | Counts as a department value for the "different departments" test. | No special-casing anywhere; schema permits empty (see #1). §4.3 D4 |
| 15 | `notes` sent as `null` on create/update? | Valid — `null` or omitted → stored NULL, returned as `null`; `""` stored as `""`. | Keeps clearing notes possible via PUT without a sentinel string. §7.1 |
| 16 | PM #5 says cancelled subs are "status filterable" — is there a `status` param on `GET /api/subscriptions`? | **No** — Task 7 fixes the list params as exactly `q`/`sort`/`order`; adding a `status` filter would be API surface beyond the task list. Cancelled rows simply appear in the unfiltered list (that *is* "visible in the registry"); `q` matches them like any row. If the frontend ever wants a status filter (Task 17 doesn't spec one), it filters client-side over the 24-row dataset. | Task 7 + Technical Notes "API surface" enumerate the params exhaustively; scope discipline wins. §7.3 |
| 17 | Task 10's "closed/removed from the open list" for undetected open flags — new `closed` status, or delete? | **DELETE the row.** The `flags.status` enum is fixed at open/resolved/dismissed (Task 4 schema); inventing a 4th status would break the schema and the alerts `status` param. Deletion also matches Task 7's no-orphan-rows philosophy. Only resolved/dismissed rows are preserved (history). | Task 4 fixes the enum; Task 10's wording explicitly allows "removed". §5 |

---

*End of contract. Backend tasks 2, 4–13 implement against this document; if a shape above is missing something you need, raise it with the PM — do not invent fields, endpoints, or flags.*
