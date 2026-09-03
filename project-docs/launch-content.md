# TrimStack Launch Content — Growth Team Source of Truth

Status: DRAFTED for the launch calendar (Mon Sep 21 – Fri Oct 2, 2026). Not yet scheduled or posted.
Governed by: `project-docs/brand-guidelines.md` (voice, terminology, CAN/CANNOT claims) and `project-docs/launch-plan.md` (calendar, research-first positioning).

Pre-flight reconciled 2026-09-03: repo URL = https://github.com/hasanabbassorathiya/trimstack — **made PUBLIC 2026-09-03** (user-approved) to host the GitHub Pages demo at https://hasanabbassorathiya.github.io/trimstack/. All `[repo URL]` placeholders resolve to that URL; demo links resolve to the Pages URL. Launch date 2026-09-25 per sprint plan. TAM 90 is the itch-score market-size dimension (0-100 scale; severity/whitespace/frequency are 0-10) — confirm phrasing with PM before quoting externally.

## House rules (apply to every asset below)

- Banned words and same-family variants: Elevate, Seamless, Unleash, Next-Gen, Supercharge, and hype of the same family (revolutionary, effortless, unlock, game-changing). Plain verbs only: see, flag, resolve, export.
- Unresolved alert amounts are always "potential savings." Only user-resolved alerts count toward the "Recovered" metric.
- Terminology locks: "Resolve" and "Dismiss" (capitalized alert actions), "subscription registry."
- Feature claims limited to the five shipped capabilities: subscription registry dashboard, Run analysis (four flag types), Resolve/Dismiss, Recovered metric, CSV export.
- All figures come from the seeded demo company (24 subscriptions) and are labeled as demo data in every asset. No invented, extrapolated, or annualized stats. No customer-savings or ROI claims. No emojis.

---

## 1. Launch Day Post — Show HN and Reddit r/FPandA

### 1a. Show HN (build-in-public framing)

**Title:** Show HN: TrimStack – SaaS spend visibility for finance teams

**Body (~150 words):**

We built TrimStack in public over three weeks: research, spec, a 27-task pipeline, and a live product. The repository is public: [repo URL].

TrimStack keeps a subscription registry for finance teams at 50–500 person companies. Run analysis flags four kinds of waste: inactive seats, trial drift, upcoming renewals, and duplicate spend. Resolve an alert and the amount moves from potential savings to the Recovered metric. A CSV export hands the resolved list to finance.

The demo behind the link is a seeded company with 24 subscriptions — not customer data; we have no customers yet. Figures are illustrative (for example, Slack: 460 provisioned seats, 201 active, $287.14/mo in potential savings).

Feedback we want: (1) would your finance team keep a subscription registry current, (2) which of the four flags matters most at your company, (3) what is missing before you would pay for this?

### 1b. Reddit r/FPandA — research post (research-first, not a product pitch)

**Title:** We score candidate problems on an "itch score" before building anything — asking FP&A to sanity-check the method (and the problem it picked)

**Body:**

Context: small team, three-week build cycle, research before code. Before writing any spec, we score candidate problems on an itch score with four dimensions: severity (how much it hurts), TAM (how widespread the problem is), whitespace (how much room the existing tools leave), and frequency (how often the pain recurs).

The problem that scored highest for us: SaaS spend waste — companies paying for seats and tools nobody uses. Our scoring: severity 9, TAM 90, whitespace 8, frequency 9.

From there the path was deliberate: a written spec, a 27-task pipeline where no task closed without an evidence gate, then the live product — all documented publicly.

Honest disclosure, because it matters: the product exists as a working MVP, and the demo on the site is a seeded demo company with 24 subscriptions. Every figure is illustrative; there are no customers yet. One example from the demo registry: a chat tool at 460 provisioned seats, 201 active — $287.14/mo in potential savings.

What I want from this community is a research critique, not signups:

1. Does the four-flag taxonomy match what you see — inactive seats, trial drift, upcoming renewals, duplicate spend? What is missing?
2. Who owns seat hygiene at your company — IT, procurement, or FP&A?
3. How does your subscription list stay current today, and would that survive contact with your org?

Happy to walk through the scoring rubric and the spec in the comments.

---

## 2. LinkedIn Sequence A — Demo Story (Post-Launch Week: Mon Sep 28 – Fri Oct 2)

### A1. Mon Sep 28 — The problem: unused seats

**Hook:** 460 Slack seats provisioned. 201 in use.

**Body:**
In our seeded demo company, one subscription line reads: 460 provisioned seats, 201 active. Fewer than half in use — $287.14/mo in potential savings on that one line, in a registry of 24 subscriptions.

An invoice can't show this. The invoice says 460 seats, and it is correct. The gap between provisioned and active is where the money sits — as potential savings, until someone resolves it.

That gap is why we built TrimStack: a subscription registry that runs the usage math for finance teams at 50–500 person companies. (All figures here are from the seeded demo company — illustrative, not customer data.)

**CTA:** Open the dashboard: [link]

### A2. Tue Sep 29 — The waste patterns

**Hook:** SaaS waste is not one problem. In our demo registry, it shows up as four.

**Body:**
Run the analysis and the alerts panel comes back with four flag types:

1. Inactive seats — provisioned, not used.
2. Trial drift — a trial that became a paid line without a decision.
3. Upcoming renewals — renewal dates arriving before anyone re-checks the math.
4. Duplicate spend — two teams paying for the same tool.

In the seeded demo company, one run of the analysis surfaces all four. That is the point of the registry: the patterns repeat, and they hide in plain sight across a 24-subscription list. (Demo data, illustrative.)

**CTA:** Open the dashboard and run the analysis: [link]

### A3. Wed Sep 30 — The recovery loop

**Hook:** "Potential savings" is a maybe. "Recovered" is a result.

**Body:**
A flag is the start of a loop, not the end of one. Open the alert. Check the math. Then decide: Resolve, or Dismiss.

Take the seats example from the seeded demo company: 460 provisioned, 201 active, $287.14/mo in potential savings. The math checks out, so — Resolve — and the Recovered metric moves. If a flag is wrong, Dismiss it. A registry that can say "no" is what keeps the Recovered number believable.

Decisions stay with a person. The registry keeps the record. Potential becomes Recovered only when someone acts.

**CTA:** Open the dashboard: [link]

### A4. Thu Oct 1 — The CSV and the finance workflow

**Hook:** Finance work ends in a spreadsheet. We built for that.

**Body:**
Visibility that dies inside a dashboard helps nobody at month-end. So the last step of the loop is an export: the resolved list as CSV — subscription, issue, monthly amount — ready for the close checklist, audit prep, or the renewal calendar.

TrimStack stays the subscription registry. Your spreadsheet stays the system of action. The export is the handoff between them.

(In the seeded demo company, export the demo list and check the format before trusting a single cell of it.)

**CTA:** Open the dashboard, then export the list: [link]

### A5. Fri Oct 2 — Launch recap + the honesty note

**Hook:** One week live. The honest recap.

**Body:**
Monday: 460 provisioned seats, 201 active.
Tuesday: four waste patterns — inactive seats, trial drift, upcoming renewals, duplicate spend.
Wednesday: Resolve moves potential savings to Recovered; Dismiss keeps it honest.
Thursday: CSV export into the close process.

Every figure this week came from the seeded demo company — 24 subscriptions of illustrative data. Not customer results. We have no customers yet, and a labeled demo is worth more than an invented testimonial.

Next week: how this got built — the research method, the spec, and what we cut.

**CTA:** Open the dashboard: [link]

---

## 3. LinkedIn Sequence B — Build in Public (B1 Tue Sep 22, B2 Wed Sep 23 pre-launch; B3–B5 post-launch pool — Sep 24 is engagement-only, Oct 2 belongs to A5 + retro)

### B1. Tue Sep 22 — The itch-score method

**Hook:** We didn't start with an idea. We started with an itch score.

**Body:**
Before any spec, we score candidate problems on four dimensions: severity (how much it hurts), TAM (how widespread it is), whitespace (how much room existing tools leave), and frequency (how often it recurs).

The winner: SaaS spend waste. Severity 9, TAM 90, whitespace 8, frequency 9.

The method exists to kill ideas early and cheaply. A problem that scores low on severity or frequency isn't worth three weeks of build, no matter how interesting the product would be. This one scored high enough to bet on — and the scoring process is documented publicly.

**CTA:** The method doc is in the public repo: [repo URL]

### B2. Wed Sep 23 — From spec to pipeline

**Hook:** The spec became 27 tasks. None of them closed without evidence.

**Body:**
A spec is a wish list until it becomes tasks. Ours became 27, run as a pipeline where "done" had a definition: a task closed only when there was evidence — a working screen, a passing check, a number that matches what the product actually does.

No evidence, no close. That rule is the difference between a three-week MVP and a three-week pile of half-features. It is also why the launch claims can be plain: when we say the demo flags inactive seats, trial drift, upcoming renewals, and duplicate spend, that claim has been checked.

**CTA:** The pipeline and the evidence gates are public: [repo URL]

### B3. Post-launch pool (from Oct 6) — The QA discipline

**Hook:** The least glamorous part of the build: making sure the demo tells the truth.

**Body:**
When a whole launch rests on one demo story, a wrong demo is a wrong launch. So the seeded demo company gets checked like a product feature: automated end-to-end checks run against it, so the numbers we publish match the numbers on screen.

460 provisioned, 201 active, $287.14/mo — that has to be what the dashboard actually says, or the story we tell in public is fiction. Research, spec, pipeline, and QA are one process. The QA part is why the other three can be trusted.

**CTA:** The test setup is public: [repo URL]

### B4. Post-launch pool (from Oct 6) — What we cut

**Hook:** The most useful page in our spec was the out-of-scope list.

**Body:**
What the MVP does not do, on purpose: it does not cancel subscriptions for you. It does not forecast spend. It does not sell benchmark data. It does not connect to your bank. It does not promise savings numbers of its own.

Every cut bought focus for the loop that works: registry, analysis, resolve, export. That is a lesson worth keeping: scope is a decision you make on purpose, and the out-of-scope list is where you make it. What we cut is documented next to what we shipped.

(Scheduler note: verify the cut-list wording against the spec's out-of-scope section before posting.)

**CTA:** The spec, including the cuts, is public: [repo URL]

### B5. Post-launch pool (from Oct 6) — The process, end to end

**Hook:** Two weeks ago, this was four numbers on a page.

**Body:**
Severity 9, TAM 90, whitespace 8, frequency 9. That is where TrimStack started — an itch score, not an idea. Then: a written spec, 27 pipeline tasks with evidence gates, automated checks on the demo, and a launch built on a seeded demo company with honestly labeled numbers.

What shipped: the subscription registry, the four-flag analysis, Resolve and Dismiss, the Recovered metric, CSV export. What we heard from finance teams during launch: [one sentence, filled from launch-week feedback before posting]. What is next: [one sentence, filled before posting].

**CTA:** Open the dashboard: [link]

---

## 4. Demo-Story Walkthrough (three formats)

### 4a. Narrative (~200 words)

Monday morning. A finance lead opens the dashboard. The metric strip across the top shows the subscription registry — 24 subscriptions — and what the month looks like so far. She clicks Run analysis.

The alerts panel fills in. A chat tool with 460 provisioned seats and 201 active — $287.14/mo in potential savings. A trial that drifted into a paid plan without a decision. A renewal arriving next week. A tool two teams are paying for.

Nothing is auto-decided. She opens the first alert, checks the seat math, and clicks Resolve. The Recovered metric moves. The trial-drift alert gets a look, then Dismiss — the team uses it. Flagging it was the system doing its job; the final word stays with a person.

One by one: resolve the real waste, dismiss the rest, and every decision stays in the registry. When she is done, she exports the resolved list as CSV and drops it into the renewal calendar. The Recovered total is what she takes to the budget review.

(All figures are from the seeded demo company — 24 subscriptions of illustrative data, not customer results.)

### 4b. Carousel / slide outline (6 slides, text only)

- **Slide 1 (hook):** 460 seats. 201 active. / The SaaS waste an invoice can't show you. (Demo data.)
- **Slide 2:** The subscription registry. / One list of everything the company pays for. In the demo company: 24 subscriptions.
- **Slide 3:** Run analysis. / One click. Four kinds of waste come back.
- **Slide 4:** The four flags. / Inactive seats (460 provisioned, 201 active — $287.14/mo in potential savings). Trial drift. Upcoming renewals. Duplicate spend.
- **Slide 5:** Resolve or Dismiss. / Potential savings becomes Recovered when someone resolves. Dismiss keeps the numbers honest.
- **Slide 6:** Export the CSV. / The resolved list goes to the close checklist. / CTA: Open the dashboard. (Seeded demo data, labeled as such.)

### 4c. 60-second screen-recorded video script

**Scene 1 (0:00–0:06) — Dashboard; metric strip visible.**
VO: "This is TrimStack. On screen: a seeded demo company with 24 subscriptions."

**Scene 2 (0:06–0:12) — Cursor moves to Run analysis; click.**
VO: "One click runs the analysis across the whole registry."

**Scene 3 (0:12–0:30) — Alerts panel; move across the four flag types.**
VO: "Four kinds of flags come back. Inactive seats: this chat tool is at 460 provisioned, 201 active — $287.14 a month in potential savings. Trial drift: a trial that became a paid plan. Upcoming renewals. And duplicate spend: two teams, same tool."

**Scene 4 (0:30–0:44) — Open the seats alert; resolve dialog; click Resolve; Recovered metric updates.**
VO: "The math checks out, so: Resolve. The Recovered metric moves — potential savings only counts once someone acts on it. And if a flag is wrong, you Dismiss it. The registry stays honest."

**Scene 5 (0:44–0:54) — Export: CSV download of the resolved list.**
VO: "Then export the resolved list as CSV — subscription, issue, monthly amount — straight into the close process."

**Scene 6 (0:54–0:60) — End card: "Open the dashboard."**
VO: "Every number here is seeded demo data, labeled as such. Open the dashboard and run the analysis yourself."

---

## 5. Demo-Data Transparency Note (reusable)

TrimStack's launch demos use a seeded demo company: 24 subscriptions of illustrative data, visible on the dashboard at launch. It is not customer data — TrimStack has no customers yet, and we do not present synthetic numbers as real results. Figures such as 460 provisioned seats against 201 active ($287.14/mo in potential savings) show what the analysis flags look like, not what any company saved. Where the UI says "potential savings," the amount is unresolved; the Recovered metric counts only alerts a user has resolved in the demo.

One-line form for captions and footers: "Figures shown are seeded demo data (24-subscription demo company), not customer results."

---

## 6. Asset-to-Calendar Map (Sep 21 – Oct 2, 2026)

| # | Asset | Date | Channel | Owner | Notes |
|---|-------|------|---------|-------|-------|
| 1 | Show HN post (1a) | Fri Sep 25 | Hacker News — Show HN | [per launch plan] | Morning post; plan to answer comments for two hours |
| 2 | r/FPandA research post (1b) | Fri Sep 25 | Reddit — r/FPandA | [per launch plan] | Research framing; method first, product second; stagger vs Show HN |
| 3 | A1 — unused seats | Mon Sep 28 | LinkedIn | [per launch plan] | Attach 60-sec video (4c) if edited in time |
| 4 | A2 — four waste patterns | Tue Sep 29 | LinkedIn | [per launch plan] | Optional companion: carousel (4b) |
| 5 | A3 — recovery loop | Wed Sep 30 | LinkedIn | [per launch plan] | |
| 6 | A4 — CSV workflow | Thu Oct 1 | LinkedIn | [per launch plan] | Link narrative (4a) in first comment |
| 7 | A5 — recap + honesty note | Fri Oct 2 | LinkedIn | [per launch plan] | Includes transparency note (5) |
| 8 | B1 — itch-score method | Tue Sep 22 | LinkedIn | [per launch plan] | |
| 9 | B2 — spec to pipeline | Wed Sep 23 | LinkedIn | [per launch plan] | |
| 10 | B3 — QA discipline | Post-launch pool (Oct 6+) | LinkedIn | [reconciled: launch plan slots only B1+B2 pre-launch; Sep 24 is engagement-only] |
| 11 | B4 — what was cut | Post-launch pool (Oct 6+) | LinkedIn | [reconciled] | Verify cut list vs project-specs first |
| 12 | B5 — process recap | Post-launch pool (Oct 6+) | LinkedIn | [reconciled] | Fill both bracketed slots from launch-week feedback |
| 13 | Demo-story narrative (4a) | Fri Sep 25 (launch day) | Landing page — demo-story section | [per launch plan] | Evergreen; also a comment-link asset |
| 14 | Carousel outline (4b) | Fri Sep 25 (launch-day carousel) | LinkedIn carousel | [per launch plan] | Text-only outline; needs design pass |
| 15 | 60-sec video script (4c) | Fri Sep 25 | Launch-day video / embed | [per launch plan] | Screen-record against the seeded demo |
| 16 | Transparency note (5) | Fri Sep 25 onward | All channels — footer / pinned comment | [per launch plan] | Reuse verbatim |

## Pre-flight checklist (growth team, before scheduling)

- [ ] Insert the public repo URL everywhere "[repo URL]" appears (1a, B1, B2, B3, B4).
- [ ] Fill owner names and posting times from launch-plan.md (owner column above is a placeholder).
- [ ] Verify the B4 cut list against the spec's out-of-scope section; adjust wording if it differs.
- [ ] Verify the CSV column wording in A4 and video Scene 5 ("subscription, issue, monthly amount") against the actual export.
- [ ] Confirm the itch-score TAM scale explanation with the PM (TAM 90 next to 0–10 dimensions).
- [ ] Fill the two bracketed slots in B5 before Oct 2.
- [ ] Re-verify every figure against the live seeded demo before each post: 24 subscriptions, 460, 201, $287.14.
- [ ] Check r/FPandA self-promotion rules before posting 1b.
