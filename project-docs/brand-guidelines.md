# TrimStack Brand Guidelines — Verbal Identity

Version 1.0 · 2026-09-03 · Brand Guardian
Single source of truth for all week-3 growth, content, social, and launch copy. Visual identity is governed by `DESIGN.md`; where the two meet, this document defines what TrimStack **says**, `DESIGN.md` defines how it **looks**. Conflicts resolve upward to these two documents only. No emojis, in this document or in any TrimStack copy.

---

## 1. Brand Core

**Positioning statement**
> For finance teams at 50–500 person companies, TrimStack is the spend-visibility workspace that itemizes every SaaS subscription, flags the waste in it — inactive seats, trial drift, duplicate tools, blind renewals — and keeps score of every dollar recovered, because SaaS stacks grew department by department and no one was auditing the whole thing.

**Brand personality** (derived from the product's math and the "financial cockpit with editorial calm" visual system)

1. **Precise.** From the computed figures and tabular numerals. In practice: state the number, not the adjective. Quote figures exactly as the product computed them.
2. **Calm.** From the quiet surfaces and restrained palette. In practice: no exclamation marks, no urgency theater, no scolding. Warnings read like footnotes, not sirens.
3. **Numerate.** From the metric strip: monthly spend, waste percentage, recovered total. In practice: think in arithmetic — totals, deltas, ratios. In any sentence, prefer a figure over an intensifier.
4. **Candid.** From "the interface must feel like it audits itself." In practice: potential savings and recovered dollars are never conflated. Demo data is labeled demo data. We don't publish numbers we didn't compute.

**Brand promise**
> You will always be able to see what you spend, what you waste, and what you got back.

Three beats — spend, waste, recovery — mirroring the dashboard's own metric strip. Every claim TrimStack makes must be an instance of this promise.

---

## 2. Messaging Pillars

Four pillars. Every piece of TrimStack copy supports at least one; launch content should touch all four.

**P1 — See the whole stack.**
Support copy: "Every subscription — vendor, monthly cost, seats, renewal date, owner, status — in one searchable, sortable registry."
Proof point: F1 subscription registry (full field set, sort by cost or renewal date, search by name/vendor).

**P2 — Waste has a pattern.**
Support copy: "Inactive seats, blind renewals, trial drift, duplicate tools. The engine checks all four patterns and prices each finding in monthly dollars."
Proof point: F2 waste-detection engine — four flag types, each carrying a computed potential monthly savings figure.

**P3 — Recovery is a loop.**
Support copy: "Alerts arrive ranked by dollar impact. Resolve one, record what you did, and the dashboard's Recovered total moves."
Proof point: F3 alert actions (Resolve records the action taken; Dismiss closes it) feeding the F4 Recovered metric.

**P4 — Audit-ready in one click.**
Support copy: "Every open flag exports to a finance-clean CSV: subscription, flag type, monthly savings, recommendation, status."
Proof point: F5 CSV export, built to open clean in Excel/Numbers.

---

## 3. Voice & Tone

TrimStack speaks like a good FP&A lead: precise, calm, numerate, never hype. Short declarative sentences. Verbs first, numbers second, adjectives almost never. The product's authority comes from arithmetic, so the copy never borrows authority from excitement.

**Banned words** (absolute, per `DESIGN.md`): Elevate, Seamless, Unleash, Next-Gen, Supercharge. Same family, also banned: "effortlessly", "game-changer", "revolutionize", "unlock", "10x", "magic", "best-in-class", "world-class". No exclamation marks in any TrimStack copy, anywhere.

**Do / Don't** (figures shown are format examples, not claims)

| Don't write | Do write |
|---|---|
| "Seamlessly manage all your SaaS" | "See every subscription in one list" |
| "Supercharge your savings" | "Flag the waste. Price it. Resolve it." |
| "Unleash powerful insights" | "Run analysis. Read the flags. Recover the dollars." |
| "Next-gen spend management platform" | "A spend registry with a waste engine." |
| "Elevate your finance operations" | "Cut the waste. Keep the stack." |
| "Never miss a renewal again!" | "Renewal flags appear when a renewal lands within 30 days." |
| "Effortlessly track everything" | "Enter the stack once. Run analysis whenever you want." |
| "A massive $4,200 in waste" | "$4,200 in waste" — numbers carry their own weight; never intensify a figure with an adjective |

**Tone by context**

- **Product UI:** Terse and verb-led. Buttons: "Run analysis", "Resolve", "Dismiss", "Export CSV". Empty states are quiet instructions, not apologies ("Run analysis to detect waste."). Errors state the problem and the next step, plainly.
- **Landing page:** Editorial calm at full length. One idea per section; sentences can breathe. Wit, where present, is dry ("Waste included.") — never cute, never clever-clever. The left-aligned headline owns the page; copy underneath supports, never competes.
- **Social:** The same voice at 280 characters. Numbers forward, one figure per post where possible. No engagement bait, no threadcliff ("you won't believe #5"), no hashtags-as-decoration. Screenshots of the app use the demo stack and say so.

---

## 4. Naming & Terminology

**The money narrative** — one dollar moves through three states, and the words never blur them:

- **Waste** — the monthly dollars attached to *open* flags. Always computed from registry data, never estimated, never asserted without the math behind it. "Wasted Monthly" is the hero metric and the product thesis.
- **Potential savings** — the per-flag figure while the flag is open. The word "potential" is mandatory until an alert is resolved. An open flag is never described as money saved.
- **Recovered** — the sum of savings on resolved alerts, shown in the dashboard's Recovered metric. The only figure we state as achieved; past tense is earned.

**Flag vs. alert** — the engine detects **flags** (the four types: Inactive seats, Upcoming renewal, Trial drift, Duplicate spend); the **Alerts panel** surfaces them as actionable rows. Alert actions are **Resolve** (records the action taken) and **Dismiss**. Never "delete", "fix", or "snooze" — those aren't features.

**Subscription registry** — the canonical noun; "the registry" for short. Never "inventory", "catalog", or "app library".

**Feature names as users see them** (canonical labels; the shipped UI and all copy use these): Subscriptions (table), Run analysis (button), Alerts (panel), Export CSV (button). Metric labels: **Monthly Spend, Projected Annual, Wasted Monthly, Recovered, Waste %**.

**Alert recommendation pattern** — verb + number + noun + tool, per the product's own format: "Downgrade 47 unused seats in Figma".

**Units and formats** — Monthly USD everywhere: "$1,240/mo" in tight UI contexts, "$1,240 per month" in prose. Annual figures are always labeled "projected". Percentages to one decimal ("9.4%"). Dates as plain calendar dates; renewal windows phrased "within 30 days" (renewals) and "within 14 days" (trial drift).

**What we never say:**
- "AI-powered", "smart recommendations" — there is no AI in v1.
- "Monitors automatically", "runs in the background", "alerts to your inbox" — analysis is on-demand; there is no scheduler and no email.
- "Integrates with your stack", "auto-discovers your tools" — no integrations in v1.
- "Spend management", "procurement", "FinOps platform" — wrong category. TrimStack is **spend visibility**: it shows and prices the waste; it does not approve purchases or enforce budgets.
- "Leak", "bleed", "burning cash" as synonyms for waste — prefer the literal word. At most one metaphor per landing page, and only in editorial prose, never in product UI.
- Roadmap promises ("integrations coming soon") — describe what exists, never what might.

---

## 5. Tagline Candidates

Ranked; #1 is primary and ships as the nav lockup and social bio.

1. **"Your stack, itemized."** — Finance-native verb: a stack itemized like a bill. States the registry thesis in three words, perfectly calm. Works at any size, from logo lockup to social bio.
2. **"SaaS spend, accounted for."** — Double meaning: booked on the ledger, and handled. Reads like a closed ledger line; slightly more abstract than #1.
3. **"Find the spend you forgot."** — Human and second-person; the best emotional hook of the set. Reserve for paid placement and social where #1 may read cold.
4. **"See it. Flag it. Recover it."** — The product loop as three verbs; strong in demo and walkthrough contexts. Risk: reads listy at small sizes.
5. **"Every dollar of SaaS, on the record."** — Ledger framing, longest of the set. Use as a supporting line on the landing page, not as a lockup.

---

## 6. Landing Page Copy Blocks

Spec'd surface: headline, problem framing, three steps, CTA. The growth team A/B tests within these options; nothing outside them without Brand Guardian review.

**Headline option A (visibility-led)**
> Know what your stack really costs.

Subhead: "TrimStack itemizes every subscription you pay for — vendor, monthly cost, seats, renewal dates, owners — then prices the waste in it: inactive seats, trial drift, duplicate tools, blind renewals. Each flag carries a dollar figure. Resolving them builds your recovered total."

**Headline option B (thesis-led)**
> Your stack, itemized. Waste included.

Subhead: "One registry for the whole SaaS stack. One engine that finds the dollars doing nothing. One number that proves you got them back."

**Problem framing** (honest and generic — no invented numbers; per spec, no fake averages or round-number claims)
> The stack grew one purchase at a time. Marketing bought a tool. So did engineering. A trial converted while nobody watched. Finance sees the invoices — never the seats, owners, or renewal dates behind them.

Bullets:
- Seats get provisioned, then forgotten.
- Trials convert on autopilot.
- Two teams buy the same tool.
- Renewal dates live in inboxes, not on a calendar anyone owns.

Rule: if a stat is ever added to this section, it carries a named public source in the same view. Until then, no stats.

**How it works — three steps** (step titles ship as written)

1. **Add your subscriptions.**
   Vendor, monthly cost, seats, renewal date, owner, status — the fields finance actually audits. A sample stack is included to start from.
2. **Run the analysis.**
   The engine checks four waste patterns — inactive seats, upcoming renewals, trial drift, duplicate spend — and prices each flag in monthly dollars.
3. **Resolve and recover.**
   Work the alerts by dollar impact. Resolving records the action and moves the Recovered total. Export the rest to CSV for the finance cycle.

**CTA button labels** (both route to the app)
- Primary: **"Run your first analysis"** — action-led; matches what actually happens on first open.
- Secondary: **"See the sample stack"** — sets the honest expectation of demo data.

---

## 7. Content Guardrails

**Claims we CAN make** (all grounded in shipped behavior):

- The four waste patterns exist and each flag carries a computed potential monthly savings figure (F2).
- Alerts are ranked by dollar impact, with Resolve and Dismiss actions, and resolved dollars appear in the Recovered metric (F3, F4).
- Every open flag exports to CSV — subscription, flag type, monthly savings, recommendation, status (F5).
- The registry holds vendor, cost, seats, renewal date, owner, and status; searchable, sortable (F1).
- Analysis runs on demand — "run it whenever you want" — and the registry is entered by hand. Both stated plainly, neither spun.
- All figures are deterministic: computed from fields you entered, with the math visible per flag.
- Screenshots of the sample stack (24 seeded subscriptions, recognizable vendor names) — always labeled as sample/demo data.

**Claims we CANNOT make:**

- Invented aggregates or industry averages ("companies waste 30% of SaaS spend") — no unnamed or missing sources, ever.
- Guaranteed, typical, or average recovery amounts ("recover $X guaranteed", "teams save 22%").
- Background monitoring, scheduled scans, email digests — none exist in v1.
- Auto-discovery or integration claims (SSO, Okta, Slack, invoice scraping) — out of scope.
- Anything "AI".
- Peer benchmarks ("you overspend versus similar companies") — no benchmark data in the product.
- Customer counts, logos, or testimonials that don't exist.
- Fake urgency: countdowns, "limited spots", expiring discounts.

**Honesty rules for social and content:**

- Every dollar figure in content comes from labeled demo data or is clearly a format example — never from imagination.
- A demo dashboard is never passed off as a customer's dashboard.
- When a limitation matters to the story, name it without promising futures: "you enter the stack; we don't read your invoices." No "yet", no roadmap hints.
- One figure per post; the figure does the work.

---

## 8. Visual-Brand Alignment Notes

How the verbal voice maps to the visual system — copy and color are one instrument.

- **Signal Emerald (CTAs, active states, Recovered metric)** — Emerald copy is action and outcome: imperative verbs, resolutions, recovered totals. Never pair emerald surfaces with warnings or enthusiasm; emerald is the color of money you acted on.
- **Waste Amber (waste figures, Wasted Monthly hero)** — Amber copy states the computed fact with the figure attached. No exclamation, no scolding, no adjectives. The number is the alarm — that's why the surrounding prose must be the quietest on the page.
- **Risk Amber (upcoming-renewal flags)** — Calendar-forward phrasing ("renews within 30 days"). Attention without panic; a renewal is a date, not a crisis.
- **Mono tabular numerals ("the numbers are loud")** — Every figure renders plainly, comma-formatted, monthly USD. The corollary rule from Section 3: never intensify a number. Loudness comes from typography, not from the words around it.
- **Hero asymmetry (Wasted Monthly at 2x weight)** — The loudest element on screen is a number, so its support line is a single quiet sentence. Structure of copy mirrors structure of layout.
- **Restraint (one accent, no gradients, no pure black)** — One claim per sentence. No stacked superlatives. Paragraphs as short as the palette is restrained.
- **Light/dark parity and accessibility** — Copy reads identically in both themes; no theme-dependent jokes. Flag types are always named in words, never by color alone — copy carries the label, always.
- **No emojis anywhere** — Already true in UI; equally true in social, content, and this document.

---

**Governance:** This document plus `DESIGN.md` are the only authorities on TrimStack's expression. Growth, content, and social work in week 3 cites a pillar (Section 2) and obeys Sections 3, 4, and 7. New claims or copy patterns require a Brand Guardian amendment to this file first.
