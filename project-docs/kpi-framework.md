# TrimStack KPI Framework — v1 (Launch Measurement Authority)

Version 1.0 · 2026-09-03 · Analytics Reporter
Measurement authority for the 2026-09-25 launch and the 2026-09-21 → 2026-10-02 retro. Extends launch-plan.md §5 — targets unchanged; where mechanisms differ (CTA click-through), this file defines the honest measurement and the launch-plan target carries over. Obeys brand-guidelines.md §7 (claims) and §4 (terminology). Enforces the spec's out-of-scope list: no analytics stack, no telemetry, no email, no SSO. Every metric derives from exactly one of four sanctioned sources — Express stdout logs, SQLite tables (server/data/trimstack.sqlite), GitHub repo metrics, manual channel counters. No emojis, per brand.

## 1. KPI tree

Thesis: prove the pain, not the product. The north star is a manually coded human signal; server logs only support it. Logs count requests, never people.

```
NORTH STAR (weeks 1-2): Proof-of-pain conversations — ICP finance/ops, >=3 exchanges, pain named in their words
   |
   +-- S1 Reach (approx): distinct client keys seen in server logs          [stdout]
   +-- S2 Dashboard opens (CTA-fallback proxy): keys fetching summary       [stdout]
   +-- S3 Core-loop depth: analysis runs, non-team, 2xx                    [stdout]
   +-- S4 Recovery moments: resolve actions, non-team, 2xx                 [stdout + SQLite]
   +-- S5 Channel proof: >=1 documented motion run >=2x, non-zero results  [manual + stdout]
   |
OPERATIONAL BASE (a gate, not a growth story):
   +-- H1 API p95 < 200 ms daily (spec NFR)                                [stdout]
   +-- H2 Availability: 5xx rate ~0 + /api/health spot-checks              [stdout + manual]
   +-- H3 Product-surface health: CI green + weekly E2E evidence capture   [GitHub + test-results.json]
```

| # | KPI | Definition and formula | Source | Cadence | Target, 09-21 → 10-02 |
|---|---|---|---|---|---|
| N | Proof-of-pain conversations | Distinct ICP contacts with >=3 exchanges, pain confirmed in their own words, coded pain-confirmed in the conversation log | Manual coded log (DMs, comments) | Code daily; roll up weekly | >=20 |
| S1 | Reach (approximate) | Count of distinct 12-hex client keys (sha256 of ip+UA+UTC day; bots excluded) appearing on any request line that day | Express stdout | Daily | 250 base / 1,000 stretch |
| S2 | Dashboard opens | Distinct client keys with >=1 2xx GET `/api/dashboard/summary` line that day; opens/reach is the CTA-engagement ratio | Express stdout | Daily | >=25% of S1 (>=63 at base reach) |
| S3 | Analysis runs | Count of `"method":"POST","path":"/api/analysis/run","status":200` lines, minus recorded team keys | Express stdout | Daily | >=40 non-team |
| S4 | Resolve actions | Count of 2xx `POST /api/alerts/:id/resolve` lines, minus team keys; cross-check against `flags.resolved_at` in window | Express stdout + `flags` table | Daily | >=10 non-team |
| S5 | Channel proof | A documented channel motion run at least twice with non-zero attributed reach and >=1 coded conversation | Manual log + referrer counts | Weekly | >=1 channel |
| H1 | API p95 latency | 95th percentile of `durationMs` over all `/api/*` lines for the UTC day (sort ascending; value at index `int((n-1)*0.95)+1`) | Express stdout | Daily | <200 ms every day |
| H2 | Availability | `5xx lines / total lines` per day, plus a manual `GET /api/health` spot-check at scorecard fill time | Express stdout + manual | Daily | 5xx <1%; all spot-checks pass |
| H3 | Product-surface health | CI verify job green on main; weekly `qa-playwright-capture.sh` run all-green and archived (Section 6) | GitHub Actions + test-results.json | CI continuous; capture weekly | 100% green; 1 capture/week; capture on launch day before the first post |

Secondary logged counts (context, never targets): dismiss actions, subscription adds (201s), CSV exports, GitHub stars (target 30 per launch plan), channel-native counters (impressions, points, replies). Honest uptime note: with no external monitor in v1, availability is inferred (log presence + 5xx rate + spot-checks), not measured; an external pinger is v2 scope.

## 2. What is measurable in v1 vs not

| Measurable in v1 (source) | NOT measurable in v1 — and what it would take |
|---|---|
| Analysis-run requests, resolve/dismiss requests (Express stdout; resolve cross-check via `flags.resolved_at` in SQLite) | True unique visitors — NAT, VPNs, and crawlers make the client key approximate. v2: anonymous session cookie + events table (spec amendment; telemetry is banned in v1) |
| Subscription adds (stdout 201s; `subscriptions.created_at` in SQLite) | Sessions and person-level funnels — no identity, no cookie, no client events. v2: session ID persisted server-side |
| CSV export downloads (stdout) | CTA clicks — the click is a client-side view switch that generates zero server traffic. Gap noted below; v2: a single beacon route, or accept the opens proxy |
| Dashboard opens — proxy via `/api/dashboard/summary` calls (stdout) | Retention / return visits — client keys rotate daily by design (privacy; also makes cross-day tracking impossible). v2: persistent anonymous ID |
| Reach and channel mix — referrer on document lines (stdout) | Referrer-less attribution — direct visits, DMs, in-app browsers, and VPNs strip referrers. Never fully solvable; "unknown" stays unknown |
| Demo flag counts and recovered dollars (SQLite `flags`) — always labeled demo data | Visitor identity or ICP status — no auth, no profiles. v2: SSO (explicitly out of scope in v1) |
| Coded conversations (manual); channel-native counters; GitHub stars/forks/watchers, traffic views and clones | Time on page, scroll depth, bounce — no client telemetry. v2: client analytics (banned in v1) |

**Biggest instrumentation gap, flagged.** The landing CTA "Open the dashboard" is a client-side route/view switch: it produces no server request, so the launch-plan's "CTA click-through via route transitions" is not observable as clicks. Honest fallback, adopted here: count distinct client keys calling GET `/api/dashboard/summary` as "dashboard opens" and report the opens/reach ratio as CTA engagement — the >=25% launch target carries to that ratio. The 2026-09-21 pre-flight item "verify the landing CTA route is visible in access logs" is re-specified: verify that clicking the CTA fires a `GET /api/dashboard/summary` line in stdout — that is the observable event.

## 3. Log schema and parsing

Canonical line — one per request, written to stdout, **fixed field order** (load-bearing: `JSON.stringify` preserves insertion order, so every metric is a single fixed-string `grep -F`; no jq, no new dependencies):

```json
{"ts":"2026-09-25T14:22:01.123Z","level":"req","method":"POST","path":"/api/analysis/run","status":200,"durationMs":42,"referrer":"https://news.ycombinator.com/","client":"a1b2c3d4e5f6","bot":false}
```

Field rules: `ts` ISO 8601 UTC. `level:"req"` so greps can exclude error-handler `console.error` lines. `path` is `req.path` — query strings are dropped deliberately (route counts stay stable; typed search text never lands in logs). `client` = first 12 hex chars of `sha256(ip|user-agent|UTC-date)` — daily salt, no raw IP or UA stored, approximate identity only. `bot` = UA pattern test; bot lines are excluded from reach. Middleware draft (adopt **post-launch only**, never mid-sprint; `node:crypto` is stdlib, zero new deps):

```ts
// server/src/logging.ts — one line per request, stdout only, no new dependencies
import { createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function requestLog(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => console.log(JSON.stringify({
    ts: new Date().toISOString(), level: "req", method: req.method, path: req.path,
    status: res.statusCode, durationMs: Date.now() - start,
    referrer: req.headers.referer ?? null,
    client: createHash("sha256").update(`${req.ip}|${req.headers["user-agent"] ?? ""}|${new Date().toISOString().slice(0, 10)}`).digest("hex").slice(0, 12),
    bot: /bot|crawl|spider|headless|lighthouse/i.test(String(req.headers["user-agent"] ?? "")),
  })));
  next();
}
// app.ts: app.use(requestLog) ahead of routes
```

Capture stdout to a dated file and rotate by UTC day (docker: `docker logs --since 24h trimstack >> "logs/app-$(date -u +%F).log"` at the daily pull; bare node: `tee -a` the same path). Daily one-liners (`L="logs/app-$(date -u +%F).log"`):

```bash
grep -cF  '"method":"POST","path":"/api/analysis/run","status":200' "$L"              # analysis runs
grep -cE  '"method":"POST","path":"/api/alerts/[0-9]+/resolve","status":200' "$L"     # resolves
grep -cF  '"method":"GET","path":"/api/export/alerts.csv","status":200' "$L"          # CSV exports
grep -cF  '"method":"POST","path":"/api/subscriptions","status":201' "$L"             # subscription adds
grep -F '"path":"/api/dashboard/summary"' "$L" | grep -oE '"client":"[a-f0-9]{12}"' | sort -u | wc -l   # open keys
grep -F '"level":"req"' "$L" | grep -oE '"durationMs":[0-9]+' | cut -d: -f2 | sort -n \
  | awk '{a[NR]=$1} END{print a[int((NR-1)*0.95)+1]}'                                # API p95, ms
```

Daily scorecard script, draft artifact (commit when adopted; ~30 lines, grep/awk only):

```bash
#!/usr/bin/env bash
# scorecard-day.sh <log-file> — daily counts from one JSON-lines log day.
# Every number below is a REQUEST count or a client-KEY count — never a person.
# Team/internal activity is NOT auto-removed: review top_keys and subtract by hand.
set -euo pipefail
LOG="${1:?usage: scorecard-day.sh <server-log-file>}"
gc() { grep -c "$@" || true; }   # grep -c that tolerates zero matches (exit 1)
u()  { grep -oE '"client":"[a-f0-9]{12}"' | sort -u | wc -l | tr -d ' '; }

runs=$(      gc -F '"method":"POST","path":"/api/analysis/run","status":200' "$LOG")
resolves=$(  gc -E '"method":"POST","path":"/api/alerts/[0-9]+/resolve","status":200' "$LOG")
dismisses=$( gc -E '"method":"POST","path":"/api/alerts/[0-9]+/dismiss","status":200' "$LOG")
adds=$(      gc -F '"method":"POST","path":"/api/subscriptions","status":201' "$LOG")
exports=$(   gc -F '"method":"GET","path":"/api/export/alerts.csv","status":200' "$LOG")
opens=$(     grep -F '"path":"/api/dashboard/summary"' "$LOG" | grep -Fv '"bot":true' | u)
reach=$(     grep -F '"level":"req"' "$LOG" | grep -Fv '"bot":true' | u)
srv5xx=$(    gc -E '"status":5[0-9]{2}' "$LOG")
p95=$(grep -F '"level":"req"' "$LOG" | grep -oE '"durationMs":[0-9]+' | cut -d: -f2 \
      | sort -n | awk '{a[NR]=$1} END{print NR ? a[int((NR-1)*0.95)+1] : 0}')
echo "analysis_runs=$runs resolves=$resolves dismisses=$dismisses"
echo "subs_added=$adds csv_exports=$exports dashboard_open_keys=$opens reach_keys=$reach"
echo "api_p95_ms=$p95 server_5xx=$srv5xx"
echo "-- top client keys (subtract team/internal; watch for crawlers) --"
grep -oE '"client":"[a-f0-9]{12}"' "$LOG" | sort | uniq -c | sort -rn | head -5
```

**Overcounting caveat, stated once and always:** these are requests, not people. One curious visitor can fire dozens of requests; one office behind a NAT or VPN collapses to a single client key. Key dedup bounds overcounting but cannot remove it. Any retro post carrying these numbers must say so in the same paragraph (template in Section 7).

## 4. Dashboard-open proxy and channel-attribution methodology

**Dashboard open.** Definition: a client key with at least one 2xx `GET /api/dashboard/summary` line in the UTC day — the dashboard's headline data fetch, fired when the dashboard view mounts after the CTA switch. The click itself is invisible (Section 2 gap); this fetch is the honest observable. If the 09-21 pre-flight shows the dashboard mounts a different endpoint first, the canonical open-line is amended that day and only that day.

**Channel attribution — document lines only.** Referrers are read from document lines (path `/` or `/landing`, i.e., the landing/app HTML served through Express). API lines never carry an external referrer — XHR calls report the app's own origin — so they are not used for attribution. Host mapping:

| Referrer host (prefix match) | Channel |
|---|---|
| `news.ycombinator.com` | Hacker News |
| `reddit.com`, `old.reddit.com`, `np.reddit.com` | Reddit |
| `linkedin.com`, `lnkd.in` | LinkedIn |
| `indiehackers.com` | Indie Hackers |
| `github.com` | GitHub |
| `google.`, `bing.com`, `duckduckgo.com` | Search |
| `null` / absent / `-` | Direct or unknown (DMs, in-app browsers, VPNs) — never assigned to a channel |

Daily aggregation, then map hosts by the table above (a manual step, on purpose — honest eyeballing beats clever parsing):

```bash
grep -E '"path":"/(landing)?"' "$L" | grep -oE '"referrer":"https?://[^/"]+' \
  | sed 's#"referrer":"https\?://##' | sort | uniq -c | sort -rn
grep -Ec '"referrer":null' "$L"        # unknown share — report it, never guess it
```

Caveats, all mandatory in any published channel number: (a) the referrer appears only on a visitor's first document hit — later navigation reads as self-origin; (b) referrer-less traffic is a real, large bucket (direct, DMs, in-app browsers, VPNs) and stays "direct or unknown"; (c) requests overcount people — keys dedup, requests do not; (d) shared NAT/VPN offices collapse visitors into one key, undercounting; (e) crawler traffic is excluded via the `bot` flag; (f) topology dependency — if the static landing is served by a separate process rather than Express, document lines never reach stdout, reach re-bases to opened keys, and channel attribution falls back to channel-native counters. Resolve (f) explicitly at the 09-21 pre-flight; the launch plan already schedules the CTA-log verification that day.

## 5. Daily scorecard and weekly roll-up templates

Daily scorecard (GH fills at EOD UTC, ~5 minutes; file lives at `project-docs/scorecards/YYYY-MM-DD.md`):

| Field | Value |
|---|---|
| Date (UTC) | |
| Assets posted (channel + link) | |
| Reach keys (S1) | |
| Dashboard-open keys (S2) | |
| Analysis runs / resolves, non-team (S3 / S4) | |
| CSV exports / subscription adds | |
| Substantive comments and replies | |
| New coded conversations (cumulative toward 20) | |
| Leading indicators (launch-plan §2: research-thread replies, HN points at 6h, DM reply rate, LinkedIn clicks, IH views) | |
| Health: API p95 ms / 5xx count / `/api/health` spot-check | |
| Notes (team activity subtracted, referrer oddities, anomalies) | |

Weekly roll-up (internal at scorecard pulls; the 10-02 public version follows Section 7 rules):

| KPI | Target | Actual | Source | Unit / caveat |
|---|---|---|---|---|
| Proof-of-pain conversations | 20 | | Manual log | Coded conversations |
| Reach keys | 250 / 1,000 | | Express stdout | Client keys, approximate |
| Dashboard-open keys (opens/reach) | >=63 (>=25%) | | Express stdout | Proxy for CTA engagement |
| Analysis runs, non-team | 40 | | Express stdout | Requests |
| Resolve actions, non-team | 10 | | Express stdout + `flags` | Requests, cross-checked |
| Channel proven repeatable | 1 | | Manual + referrers | Documented motion |
| GitHub stars | 30 | | GitHub | Repo metric |
| API p95 days under 200 ms | 12 / 12 | | Express stdout | Spec NFR |
| CI green runs on main | 100% | | GitHub Actions | Gate status |
| E2E capture (date, result, SHA) | weekly, green | | test-results.json | Evidence branch |
| Claims-compliance incidents | 0 | | Pre-publish audit | Brand §7 |

## 6. E2E and CI evidence as the product-health KPI

Reading the capture: `test-results.json` (Playwright JSON reporter). A capture is green iff `grep -Ec '"status": ?"unexpected"' test-results.json` returns 0 and `"flaky"` is likewise 0. It is complete iff all four projects produced screenshots: `ls qa-screenshots | grep -oE '(desktop|tablet|mobile|dark)' | sort -u | wc -l` returns 4.

CI: `.github/workflows/ci.yml` runs the verify job — typecheck, lint, unit tests, build, each a separate attributable step — on every push to main. Product health is the green rate on main during the window. A red gate on main equals user-facing risk: the gates protect exactly what launch posts advertise, so no launch post goes out over a red main; fix same day.

Evidence branch convention: one long-lived branch named `evidence`, cut once from main, never merged back, never deleted. Weekly routine (and on launch day, before the first post): with the app running (orchestrator owns server lifecycle — `qa-playwright-capture.sh` never starts servers), run the capture, then:

```bash
git checkout evidence && git add -f qa-screenshots/ test-results.json \
  && git commit -m "evidence: YYYY-MM-DD capture — N specs, desktop/tablet/mobile/dark green" \
  && git push origin evidence && git tag evidence/YYYY-MM-DD
```

Force-add is required: `qa-screenshots/` is gitignored on main by design. The weekly scorecard cites the evidence commit SHA on the product-health line. Rationale, stated once: every launch claim is grounded in shipped behavior (brand §7), and the last green capture is the proof the shipped behavior still works — the capture is simultaneously the QA gate and the launch-day evidence that the demo loop runs.

## 7. Honest reporting rules

Every rule maps to brand-guidelines.md; the anchors are §7 (claims) unless noted.

| Rule | Brand anchor |
|---|---|
| 1. Every published metric states its source (one of the four), its UTC collection window, and its unit — requests, client keys, or manual count. | §7 "numbers we computed"; §3 precise |
| 2. Requests are never people. Publish "requests" or "client keys (approximate)". The words "users", "visitors" as persons, and "customers" are banned in metric statements. | §7 no customer counts that don't exist |
| 3. No extrapolation: no per-key multipliers, no estimated reach, no industry averages, no cross-source arithmetic that invents an aggregate. | §7 invented aggregates ban |
| 4. Any dollar figure from the seeded environment is labeled demo data; "potential savings" before resolve, "Recovered" after — terminology never blurs. | §7 demo honesty; §4 money narrative |
| 5. Team and E2E activity is subtracted or disclosed in scorecard notes — never silently counted toward targets. | §7 honesty rules |
| 6. Referrer-less traffic stays "direct or unknown" — a channel is never guessed. Limitations are named, not smoothed. | §7 "name the limitation" |
| 7. One figure per post; the figure does the work; no adjectives around numbers. | §3 voice; §8 restraint |

Retro phrasing template (required shape for any public number, e.g., the 10-02 retro):

> In the first two weeks the server logged N analysis-run requests and M resolve requests from K distinct client keys (hashed IP plus user agent, rotated daily). Client keys are approximate — one office can share a key, one person can send many requests. These are request counts, not people. We report them as evidence the demo loop was exercised, not as adoption.

Dashboard-opens phrasing: "the dashboard was opened from K distinct client keys (proxy: dashboard-summary API calls — the CTA itself is a client-side switch that leaves no server trace)."

---

Governance: this file and launch-plan.md §5 are the measurement authorities for the launch retro. Any new metric, source, or phrasing requires an amendment here first — mirroring the brand-doc governance rule. No emojis, in this document or any scorecard derived from it.
