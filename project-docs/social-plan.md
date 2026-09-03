# TrimStack — Social Plan (Launch Weeks 1–2)

Owner: Social Media Strategist (S) · Posting voice: Founder (F) · Monitoring/logging: Growth Hacker (G)
Status: drafts only. Nothing in this file is scheduled or posted.

## 0. Assumptions and pre-publish verification

- Calendar anchored to Mon Sep 21 – Fri Oct 2, 2026 (reconciled 2026-09-03 against launch-plan.md: launch day is Fri Sep 25, 08:00–10:00 ET Show HN window; Sequence A runs Sep 21–25, Sequence B Sep 28–Oct 2). The original draft assumed Sep 7–8; all rows below use the reconciled dates.
- Show HN: **Fri Sep 25, 08:00–10:00 ET** (per launch plan — one shot, no resubmission ever).
- All time slots and cadence windows are assumptions to test, not facts. Founder timezone assumed US Eastern — confirm; shift all slots if different.
- Reconciled 2026-09-03: repo URL is https://github.com/hasanabbassorathiya/trimstack (private; make public on launch day if build-in-public framing requires). Demo link = the deployed dashboard URL. Voice rules verified against brand-guidelines.md house rules (calm, numerate, no urgency theater, no emojis, no pitch in comments). Run final copy through the banned-words list before publishing.
- `{{placeholder}}` = insert the real number or fact before publishing. Never publish a placeholder, an estimate, or a rounded guess.
- Assets A1–A5 (demo story) and B1–B5 (build-in-public) are drafted in launch-content.md. Pull final copy from there; this plan references them by ID only.

## 1. Channel operating plan (LinkedIn primary)

### 1.1 Posting cadence — assumptions to test

| Slot | Hypothesis | Adjustment rule |
|---|---|---|
| Weekday 7:30–9:00 AM ET | Finance-ops audience reads LinkedIn before the workday; Tue–Thu strongest, Mon close behind | If Tue–Thu median impressions beat Mon/Fri by 2x+ in week 1, move week-2 Mon/Fri micro posts to Tue–Thu midday |
| 12:30 PM ET (second post) | Lunch window can carry one short post without cannibalizing the AM post | If week-1 median 12:30 impressions fall under 30% of the 7:45 median, halve the micro-sequence to alternate days in week 2 |
| Fri PM / weekends | Weak for primary posts; engagement only | — |
| HN | Tue–Thu 7:30–9:30 AM ET gives the longest daylight window on the front page | §5.4 kill-switch overrides everything |

### 1.2 Engagement routine (daily)

- 8:30–9:00 AM ET: 3 value comments on target creators' fresh posts. 12:45–1:00 PM: 2 more. Weekends: 2–3 total, unscheduled.
- Comment within ~2 hours of the target post going up (early comments get seen — assumption). Max one comment per creator per week.
- Every comment uses a §2 template as a starting frame, adjusted to the specific post. Never paste verbatim. Reply to everyone who replies.
- Five creator archetypes to find via LinkedIn search (find real people; these are search patterns, not names):
  1. Controllers / VPs of Finance at 100–500 person companies who post about close, controls, audit.
  2. FP&A leads who post benchmarks, planning cycles, model teardowns.
  3. Procurement / vendor-management analysts covering SaaS renewals and negotiations.
  4. Fractional CFOs advising SMBs — they see tool sprawl across many clients at once.
  5. Finance-ops writers who document their finance stacks (newsletters, teardown posts).

### 1.3 Founder profile optimization checklist

1. Headline (recommended): **Building TrimStack — SaaS spend visibility for finance teams at 50–500 person companies.** Alternate: Founder at TrimStack | SaaS spend visibility for finance teams (50–500 person companies). Rule: what it does and who it is for; no adjectives doing the work.
2. About (draft): "I build TrimStack, a spend-visibility tool for finance teams at 50–500 person companies. The problem it addresses is simple: SaaS subscriptions spread across departments, cards, and contracts until no one can list them. TrimStack puts the vendor list, renewal dates, and per-seat costs in one place. It is an MVP — CSV import, no integrations yet, and a demo running clearly labeled synthetic data. {{Demo link}}. Before TrimStack I {{real background — insert}}. Here I write about SaaS spend patterns and what we learn building the product. If you own a vendor list or a renewal calendar, I would like to hear how yours works. {{email}}"
3. Featured: one card only — demo link, caption "Interactive demo. No signup. Synthetic data, labeled."
4. Plain headshot, real background. Banner: product one-liner + demo URL, nothing else.
5. Experience: TrimStack entry, one-line description + demo link.
6. Custom URL: linkedin.com/in/{{founder-name}}.
7. Creator mode ON (assumption to test — follow-by-default; revisit after week 2).
8. Open-to-follow enabled; connection settings open to finance-ops roles.
9. Remove off-voice leftovers in old headlines or About text (hype phrases, urgency language).
10. Items 1–9 pass the brand-guidelines voice check before going live.

## 2. Comment engagement playbook

Rules for every comment: 2–3 sentences, demonstrate method expertise, add one thing the post did not contain, never pitch. No exclamation marks, no emojis.

**When to mention TrimStack: never in first-touch comments.** Mention only if (a) someone directly asks what you use or build, or (b) the thread is on the founder's own post. When mentioning, disclose plainly: "I'm building TrimStack, so weight this accordingly." Never drop links in comments on other people's posts.

Templates (adjust to the specific post; never paste verbatim twice in one day):

1. Benchmark questions ("What's your SaaS spend as % of revenue?"): "Two numbers worth separating: SaaS as % of opex and SaaS dollars per employee. The per-employee figure catches seat drift much earlier. If you're benchmarking, that's the more comparable number across company sizes."
2. Tool-stack discussions: "The question I'd add to any stack review: who owns the vendor list for each of these? The answer usually changes tool by tool, which is how the renewal calendar ends up in one person's head. One row per subscription with an owner field prevents that."
3. Month-end-close threads: "The subscription part that drifts is accrual — annual contracts paid in one month, used across twelve. A monthly amortization schedule per annual prepayment turns the accrual into a lookup instead of an estimate. If close includes a 'true up SaaS' step, that schedule is where the variance usually lives."
4. SaaS-renewal complaints: "Worth checking the notice-period clause — many of these auto-renew with 60- or 90-day notice required, so the refund window closed before the charge landed. For the ones you keep, a calendar keyed to notice dates, not charge dates, prevents the next round."
5. Seat / license audit posts: "Reorgs and renames are the usual cause — seats outlive the teams that ordered them. Fastest check: export licenses per tool, join against current headcount by department, look at the worst ratios. It's an afternoon, and the findings hold up in the next negotiation."
6. Expense-policy discussions: "The line that matters most: what happens when a card charge renews with no active owner. Most policies cover approval for the first purchase and are silent on the renewal, so renewal becomes the default. One sentence fixes it, even if the sentence is 'renewals require re-approval.'"
7. Spreadsheet renewal calendars: "This works until the third or fourth person edits it. Two fields make it durable: owner per subscription and notice period per contract — those are what get lost when the file moves. A locked template with a change log beats freeform tabs."
8. Procurement / AP process questions: "The leak is the middle zone — purchases below the approval threshold that recur. One fix: treat the renewal as a new purchase, same path, same threshold. It moves the question to the right time: 'do we still need this' instead of 'why did we pay this.'"
9. CFO first-90-days posts: "The week-one question that pays off: which subscriptions renewed in the last six months without a decision being made. Pull it from AP data — it's a short list, and it shows exactly where the process has gaps. Cheapest diagnostic available in the first 90 days."
10. Spend-tool skepticism ("does anyone use these?"): "Fair question — shelfware is a real pattern here, usually because the tool needed a data feed nobody maintained. The test before adopting any of them: does someone own the vendor list as a named responsibility? If no, fix that first. A tool does not invent an owner."

## 3. Supporting micro-sequence (10 standalone posts)

Not part of the A/B sequences. Odd = problem-observation, even = build-log. Each ≤60 words, one idea, hook first. POST-LAUNCH POOL (reconciled 2026-09-03): the one-post-per-day rule keeps these out of launch weeks — they run sprint 4 onward, Tue/Thu 7:45 AM slots, starting Tue Oct 6. Content corrected to shipped product facts only (F1 registry, F2 flags incl. upcoming-renewal, F3 resolve/dismiss, F5 CSV export). No roadmap promises.

- **M1 (Tue Oct 6, problem).** Nobody in the company knows the full SaaS vendor list. Finance knows the big contracts. IT knows the tools it provisioned. Each department knows its own. The complete list exists nowhere. That is an inventory problem before it is a tooling problem — and it surfaces at renewal time. #FPandA #SaaSManagement
- **M2 (Thu Oct 8, build).** Build log: the demo dataset took longer than the dashboard. It had to look like a real company — 24 subscriptions, two analytics tools bought by different departments, Slack seats nobody logs into. Designing the mess taught us more about the workflow than the UI did. Synthetic data, clearly labeled. #BuildInPublic
- **M3 (Tue Oct 13, problem).** A renewal gotcha worth an hour: notice-period clauses. Many contracts auto-renew unless you notify 60 or 90 days ahead — miss the window and a negotiation becomes a payment. Pull the next two quarters of renewals and check each notice period. That hour is the cheapest audit in finance. #MonthEnd
- **M4 (Thu Oct 15, build).** Build log: what we cut from the MVP, on purpose. No logins, no integrations, no email digests, no background monitoring. A registry you fill by hand, a waste analysis you run on demand, and a CSV you take to your renewal review. Small surface, honest scope. #BuildInPublic
- **M5 (Tue Oct 20, problem).** A quiet SaaS waste pattern: the tool a department bought, the department then reorganized, and nobody turned the tool off. The subscription outlives the team. If you have reorganized in the past two years, there is likely at least one of these in your stack. Not expensive — just permanent. #SaaSManagement
- **M6 (Thu Oct 22, build).** Build log: the waste analysis runs on demand, not in the background. One button, four checks — inactive seats, renewals inside 30 days, trials about to convert, duplicate tools across departments. It costs nothing to run twice, and nothing silently changes while you are mid-review. #BuildInPublic
- **M7 (Tue Oct 27, problem).** Seat math worth doing quarterly: licenses held versus people in the role. Per-seat pricing drifts when teams change — you pay for the headcount you had, not the headcount you have. Licenses per tool joined against an HR export is one spreadsheet of work, and the gap is the cheapest savings in the stack. #FPandA
- **M8 (Thu Oct 29, build).** Build log: we shipped CSV export, not import. Finance teams live in spreadsheets — the renewal review happens in a sheet, not a browser. One click takes the open flags, their dollar figures, and the recommended action into Excel. The tool finds the waste; the spreadsheet closes it. #BuildInPublic
- **M9 (Tue Nov 3, problem).** A quiet pattern in SaaS spend: the discount that ends. Year one is negotiated hard. Year two renews at list because nobody reopened the conversation — the vendor counts on renewal being easier than renegotiation. Renewal dates in one visible place change which of the two happens. #SaaSManagement
- **M10 (Thu Nov 5, build).** Two weeks of build-log notes, condensed: the vendor inventory is the product. Alerts, seat math, waste percentages are all views of that inventory. Boring conclusion, useful one. If you own a vendor list, I would like to hear how yours works. Demo link in the comments. #BuildInPublic

## 4. Sub-Reddit engagement protocol (r/FPandA, r/Accounting)

### 4.1 Mod etiquette (from launch plan — binding)

- Mod-mail each sub's moderators first, with the exact research-post text attached. Post only after approval. No exceptions, either sub.
- Research-first framing: the post asks questions (what does your renewal calendar look like, what breaks first as vendor count grows), it does not announce. The product appears only as context, with the demo link only if mods permit.
- One research post per sub, ever. If removed, mod-mail to ask why — do not repost.
- Roughly 10:1 helpful-to-mention ratio: project mentioned in at most one comment per sub per week outside the research post.
- Founder's Reddit account needs 2+ weeks of ordinary participation history before the research post. If the account is new, the research post slips to week 2 — that is a blocker, not a reason for a fresh account.
- Read each sub's rules page before the first comment. If a sub bans tool mentions entirely, the answer is zero mentions — never stealth mentions.
- Never DM anyone about the product. If asked in DMs: answer the question, disclose, stop.

### 4.2 Drafted replies (adjust to thread specifics; no product mention)

1. Tool sprawl ("we have too many tools, how do you track them"): "Start from AP and card statements, not department surveys — surveys capture what people remember, statements capture what you actually paid. Pull 12 months of charges, group by vendor, then have each department confirm ownership of what you found. The list from payments is always longer than the list from memory, and the gap is usually the finding."
2. Renewal audit ("CFO wants a list of renewals for the next 12 months"): "Check contracts for notice-period clauses first — auto-renewals with 60/90-day notice close the negotiation window before the charge date. Build the calendar keyed to notice dates, not renewal dates. One pass through the top 10 by spend usually finds at least one already inside its notice window."
3. Seat reconciliation ("we think we're over-licensed"): "Export current license counts per per-seat tool, join to HR's active headcount, look at the largest gaps. Reorgs are the biggest cause — seats survive teams. Quarterly cadence is enough; monthly becomes noise. The negotiation value comes from knowing usage before renewal, not just license counts."
4. Month-end accrual for subscriptions: "Annual prepayments are the usual variance source — paid in one month, used across twelve. A simple amortization schedule per annual contract (amount / term, monthly) makes the accrual a lookup instead of an estimate. Keep usage-based tools on a separate schedule; those need the estimate treatment."
5. "Does anyone use a SaaS spend tool / are they worth it?": "Depends on whether someone owns the vendor list as a job. If nobody owns it, the tool becomes shelfware because there is no one to feed it or act on it. If there is an owner, the choice is a spreadsheet vs a process vs a tool — at low vendor counts a well-structured sheet is honest competition; the tool question gets interesting when renewals outpace the sheet."

### 4.3 Disclosure rules

- Mention the project only when (a) directly asked what you use/build, or (b) in the approved research post.
- When mentioning, disclose in the same comment, before the mention: "I'm building a spend-visibility tool, so take this with that bias."
- Link to the demo only when a commenter asks — reply with link + disclosure in one comment.

## 5. Show HN launch-day protocol

### 5.1 Prep checklist (complete by Fri Sep 18)

- [ ] Title: `Show HN: TrimStack – SaaS spend visibility for finance teams` (confirm naming against launch plan)
- [ ] Tagline (≤80 chars): "One place for the vendor list, renewal dates, and seat counts."
- [ ] Link goes directly to the interactive demo — no landing page, no signup wall
- [ ] Demo data labeled in-product
- [ ] Founder's existing HN account (history required; never a fresh account for launch); access tested the day before
- [ ] Founder blocked 8:00 AM–12:00 PM ET; G on standby for monitoring
- [ ] Pre-drafted answers loaded (§5.3); pricing line confirmed with launch plan — do not improvise pricing on the thread
- [ ] Kill-switch criteria (§5.4) printed next to the founder
- [ ] No upvote requests to anyone — friends, investors, advisors included. Hard rule.

### 5.2 First-hour comment cadence — SLA

**Every substantive comment (question, objection, bug report) gets a reply within 20 minutes, for the first 2 hours.** Refresh the thread every 10 minutes in hour 1, every 15 minutes through hour 8. One-liner comments: acknowledge, no reply needed. Bug reports: acknowledge within 20 minutes even if the fix takes longer. Tone rules: concede valid criticisms plainly ("that's fair — it's an MVP"), no arguments, no marketing language in replies, factual corrections to the submission text via an "Edit:" note.

### 5.3 Pre-drafted answers to the 8 most likely objections

1. **No auth?** "Correct — the MVP demo is intentionally frictionless: no signup, no data entry, labeled synthetic data. Auth and SSO are on the roadmap; for pilot teams we do more. For a first look, zero friction."
2. **No integrations?** "Not in v1. Import is CSV — vendor, cost, owner, renewal date. Integrations (card feeds, IdP for seat counts) are the top roadmap item; we shipped the workflow first."
3. **Why not a spreadsheet?** "A spreadsheet is a reasonable answer and for many teams the right one. The failure mode we target is the multi-owner case — renewals outpacing manual updates, seat drift, notice periods. If a sheet works for you, keep it."
4. **What's the data source?** "The demo runs synthetic data, labeled as such in-product. For real use: CSV import from whatever exists — AP exports, the vendor sheet, card statements. No scraping, no card-data ingestion in this version."
5. **Pricing?** "{{Pricing statement — insert current truth from launch plan before launch}}. Stated plainly rather than guessed."
6. **Who is it for?** "Finance teams at roughly 50–500 person companies — specifically whoever owns the vendor list and renewals. Below that, a sheet is fine. Above that, enterprise tools exist."
7. **Demo data?** "Yes — synthetic, labeled. No signup or real data required for a first look. CSV import is there for real vendor lists."
8. **What's next?** "In order: imports that need no cleaning first, renewal notice-date alerts, seat reconciliation against headcount. Roadmap order follows pilot feedback, which is part of why we're here."

### 5.4 Kill-switch criteria (confirm exact wording against launch plan)

- Demo breaks: remove the demo link from every external channel immediately (LinkedIn comment links, Reddit), pause promotion, fix, and post the fix as a comment. Never delete the HN submission.
- Founder unavailable for more than 30 minutes inside the first 2 hours: G monitors and flags; replies wait for the founder. No one ghost-writes replies in the founder's voice.
- Hostile authenticity challenge (accused of marketing/astroturf): answer once, factually, then stop replying to that sub-thread.
- Post off the new page with under 5 points and under 5 comments after 3 hours: return to normal monitoring cadence. No resubmission for 30 days — reposting a Show HN is not permitted.

## 6. Two-week content calendar (concrete)

Standing daily items, both weeks — no table rows: LinkedIn engagement per §1.2 (F); Reddit value comments 2–3/day across both subs per §4 (F); scorecard logging per §7.2 (G, 8:50 PM ET).

| Date | Channel | Asset | Time (ET) | Owner | Leading indicator to record |
|---|---|---|---|---|---|
| Mon Sep 21 | Reddit | Channel pre-flight: rules re-check, mod-mail r/FPandA + r/Accounting; verify CTA route logging | all day | F sends, S drafts | mod replies received |
| Mon Sep 21 | LinkedIn | Founder profile optimization complete (§1.3) | — | F | checklist complete |
| Mon Sep 21 | All | Scorecard created (§7); finalize launch-week copy, HN answers, transparency note | — | S/F, G | drafts ready, scorecard exists |
| Tue Sep 22 | LinkedIn | B1 (itch-score method — build in public) | 7:45 AM | F (S drafts) | impressions, replies, profile views, demo visits |
| Wed Sep 23 | LinkedIn | B2 (research-to-sprint build story) | 7:45 AM | F | impressions, replies, profile views, demo visits |
| Thu Sep 24 | LinkedIn/Reddit | Launch-eve engagement ONLY — value comments, zero posts (launch plan 09-24 row) | AM | F | comments made |
| Fri Sep 25 | HN + Reddit + LinkedIn | **LAUNCH DAY: Show HN 08:00–10:00 ET + r/FPandA research post (mod-approved) + founder launch post + company-page echo w/ walkthrough carousel** | 7:45 AM start, 4h reply window | F (G monitors) | points, comments, demo visits |
| Sat–Sun Sep 26–27 | LinkedIn/Reddit | Engagement only, 2–3 comments/day | AM | F | comments made |
| Mon Sep 28 | LinkedIn | A1 (demo story pt 1: open the dashboard) | 7:45 AM | F | impressions, replies, profile views, demo visits; scorecard pull 1 (G) |
| Tue Sep 29 | LinkedIn | A2 (run analysis — waste flags with dollar figures) | 7:45 AM | F | impressions, replies, profile views, demo visits |
| Wed Sep 30 | LinkedIn | A3 (the 47-unused-seats flag story) | 7:45 AM | F | impressions, replies, profile views, demo visits |
| Thu Oct 1 | LinkedIn | A4 (resolve — the Recovered metric moment) | 7:45 AM | F | impressions, replies, profile views, demo visits; scorecard pull 2 (G) |
| Fri Oct 2 | LinkedIn | A5 (honest close — demo-data disclosure + CTA) | 7:45 AM | F | impressions, replies, profile views, demo visits; weekly rollup + decisions |
| Fri Oct 2 | GitHub | Launch retro + 2-week scorecard v1 published to repo (build-in-public artifact) | PM | G | retro published |

One-post-per-day rule (launch plan §7 guardrail): sequence posts own every weekday slot — the M1–M10 micro-sequence does NOT run during launch weeks. It moves to the post-launch pool (sprint 4): 2–3 posts/week on Tue/Thu, problem/build alternating, starting Tue Oct 6. Do not double-post to dodge this.

## 7. Measurement

### 7.1 Scorecard (manual, countable only)

One row per asset per day. Countable numbers only — no sentiment scores, no "awareness," no estimated reach. Any number not in this sheet is never quoted internally or externally.

`Date | Channel | Asset | Impressions | Replies/Comments | Profile views | Followers | Demo visits | Notes`

- LinkedIn: impressions (post analytics), replies (count), profile views, follower count, demo visits (UTM link if the demo supports it; otherwise daily total, logged unattributed — honest about it).
- HN (Sep 25): points, comment count, demo visits.
- Reddit: comment karma, research-thread replies.
- Ratios (replies/impressions, visits/impressions) computed weekly only — no daily ratio-chasing.

### 7.2 Daily logging routine — 15 minutes, 8:50 PM ET, owner G (fallback F)

1. (5 min) LinkedIn: today's posts → impressions, replies; profile views; follower count.
2. (3 min) Demo visits: real count from the KPI framework's dashboard-opens proxy (distinct client keys calling /api/dashboard/summary — see kpi-framework.md); log. No estimates.
3. (3 min) HN day: points, comments. Reddit daily: karma, research-thread replies.
4. (2 min) Notes: one line on anything off-pattern (e.g., "M3 replies doubled — notice-period hook").
5. (2 min) Flag for tomorrow: any thread with an unanswered reply older than 24 hours gets closed out first.

### 7.3 Friday rollup — 30 minutes, G

Weekly ratios and week-over-week deltas, plus two standing decisions: (a) 12:30 slot keep/kill per §1.1 rule; (b) which comment templates drew replies — carry those forward, retire the silent ones. Attributed demo visits per channel reported as ranges only where UTM is absent.

## 8. Engagement integrity (binding)

- One voice: all posts and comments come from the founder's real accounts. Others draft; only the account owner posts. No ghost-posting, no commenting on the founder's behalf.
- No sockpuppet accounts, no engagement pods, no vote or upvote solicitation of any kind, on any platform.
- No fabricated testimonials, quotes, or metrics. Placeholders stay unpublished until replaced with real numbers.
- Product mentions only per §2 (LinkedIn), §4.3 (Reddit); on HN, only in direct answers to direct questions.
