# TrimStack Launch Plan — v1 (draft; nothing shipped)

- Owner: Growth Hacker (GH). Producers: Content Creator (CC), Social Strategist (SS).
- Launch date: Friday 2026-09-25 (locked by sprint plan). Planning window: 2026-09-21 to 2026-10-02.
- Status: every asset below is drafted, brand-checked, and only then posted on its calendar date. As of this file, nothing has been posted, scheduled, or created on any external service.
- Constraints honored: no ad budget; no analytics, email, or SSO dependencies; 3-person team; the landing page CTA "Open the dashboard" is the only conversion surface.

## 1. Launch strategy

Thesis: prove the pain, not the product.

TrimStack launches cold: zero users, zero waitlist, no owned audience, no ad budget, and a funnel that ends at the demo dashboard — no signup, no email capture, no SSO. There is nothing to convert except attention into engagement with the core loop (open dashboard, run analysis, see waste flags, resolve, watch the Recovered metric move). So this launch optimizes for proof-of-pain engagement, not signups: put the seeded demo story in front of finance and ops people at 50–500 person companies and measure whether they recognize the pain in their own words.

Second axis: this is a content-led launch. The itch-score research — rating SaaS-tool pain before building anything — gives us something to say that is not "we built a tool." The research is the hook, the demo story is the proof, and "Open the dashboard" is the only ask. The build-in-public angle (research, then a 3-week sprint, then a working, E2E-verified demo) is a real, checkable story and doubles as our credibility layer in builder communities.

Success at launch, first 2 weeks (2026-09-21 to 2026-10-02), measured only with what v1 actually has (server logs, channel-native counters, GitHub, manual logs):

- 20+ proof-of-pain conversations with ICP finance/ops people (>=3 exchanges each, manually coded) — the North Star proxy.
- 250 unique landing visitors (base target) / 1,000 (stretch), from server access logs.
- >=25% of landing visitors click "Open the dashboard" (route transitions in access logs).
- 40+ analysis runs and 10+ resolve actions by non-team visitors (POST counts in app logs).
- At least 1 channel proven repeatable (documented motion, run at least twice with non-zero results).
- 0 claims-compliance incidents (every asset passes the pre-publish brand check, Section 7).

Anti-goals, stated honestly: we do not count signups, MRR, waitlist, or follower growth — those surfaces do not exist in v1 and proxies for them are vanity metrics. We never extrapolate demo figures into market claims.

## 2. Channel plan (ranked; zero budget)

Pre-flight rule for every community: read the rules and mod-mail the moderators before any post. Reddit blocks automated verification, so subreddit activity and rules are confirmed manually on 2026-09-21; a subreddit that fails pre-flight is replaced from the backup watchlist (r/finance, r/sysadmin) or dropped, never forced.

1. Reddit — r/FPandA (primary), r/Accounting and r/smallbusiness (secondary), r/SaaS (builder echo).
   - Why: densest free concentration of the ICP; FP&A analysts and controllers openly discuss seat audits and renewal sprawl.
   - Motion: GH posts research-first threads (itch-score findings, charts, methodology, full demo-data disclosure) from one named team account; 10 value-first comments per week with zero product mentions; no product-first posts.
   - First-week effort: ~6h. Leading indicator: >=10 substantive comment replies on the research thread; reddit.com referrer visits in access logs.
2. LinkedIn organic — founder personal profile (primary), company page (echo).
   - Why: the ICP is here in a professional context; #FPandA, #FinOps, and #SaaSManagement audiences are active; personal profiles out-distribute company pages.
   - Motion: SS runs Sequences A and B (Section 3) from the founder profile; 5 value comments per day on finance-ops creators' posts; CC supplies the demo-story document carousel.
   - Effort: ~8h. Leading indicator: impressions-to-profile-click ratio per post; comments from ICP job titles.
3. Hacker News — Show HN (one shot, launch day).
   - Why: technical and mid-market operator overlap; durable backlink; the build-in-public framing (public repo, E2E-verified demo, honest dataset disclosure) matches HN norms.
   - Motion: GH posts Show HN between 08:00 and 10:00 ET on Fri 2026-09-25; two title variants drafted, team picks one on Wed; 4-hour reply window with 30-minute SLA.
   - Effort: ~4h. Leading indicator: points and replies in the first 6 hours; news.ycombinator.com referrer spike in access logs.
4. Founder-network feedback DMs (LinkedIn plus warm email intros).
   - Why: the only warm asset a cold start has; feedback-ask framing turns the network into pain-validation interviews without pitching.
   - Motion: GH sends 50 personalized DMs in 3 waves (15/15/20) to finance-ops contacts in the founders' networks; message one asks for feedback on the demo story and links only if asked.
   - Effort: ~5h. Leading indicator: reply rate (target >=30%) and pain-validated conversations (target >=8).
5. Indie Hackers — build-in-public series.
   - Why: real founder community; secondary persona (founders and ops leads at 50–500 person companies run their own tool audits); compounds into sprint-4 distribution.
   - Motion: SS and GH publish two long-forms — the itch-score method (launch week) and "research to 3-week MVP to first numbers" (2026-09-29).
   - Effort: ~4h. Leading indicator: views/replies; indiehackers.com referrer visits in logs.
6. Newsletter and benchmark pitches.
   - Why: free mentions; our itch-score dataset is pitchable research, not an ad. Targets verified active before pitching: CFO Dive (Industry Dive) and comparable finance / SaaS-spend newsletters — confirm each outlet currently publishes before the pitch.
   - Motion: GH sends 5 pitches in week 2, offering figures and methodology; no product-first framing.
   - Effort: ~3h. Leading indicator: replies and citations (any).

Killed channels, one line each:

- Paid search: no ad budget in v1.
- Product Hunt: maker audience, not finance ICP; the locked Friday launch date is the worst PH slot.
- Cold email blasts: no consented list; spam risk violates brand honesty rules.
- SaaStr community: SaaS-builder audience, wrong ICP for v1; revisit at a funding announcement.
- FinOps Foundation community (verified real, 120k+ members, Linux Foundation): focused on cloud and AI token costs, not SaaS seat sprawl; join listen-only, no promotion.
- Twitter/X: no presence or audience and the ICP conversation happens on LinkedIn; revisit later.

## 3. Launch assets calendar (2026-09-21 to 2026-10-02)

Pre-flight (week of 2026-09-14, before this calendar starts): CC and SS are briefed on this file; CC drafts walkthrough v0 from Section 4; SS drafts all sequence copy; a dev confirms the landing CTA route is visible in access logs. Everything below is drafted and brand-checked before its slot; nothing is posted ahead of its date.

| Date | Owner | Channel | Asset / motion | Dependency |
|---|---|---|---|---|
| Mon 09-21 | GH | Reddit | Channel pre-flight: rules re-check, mod-mail r/FPandA and r/Accounting; verify CTA route logging | Mod replies; dev log confirmation |
| Mon 09-21 | CC | Internal | Demo-story walkthrough v1, long-form draft | Fresh E2E capture run of the seeded demo (screenshots, GIF frames) |
| Mon 09-21 | SS | Internal | Launch-day post matrix drafts: Show HN titles, LinkedIn launch post, Reddit research post | Brand voice pass on drafts |
| Tue 09-22 | SS | LinkedIn | Sequence B post 1: the itch-score method (build in public) | Itch-score research doc; repo visibility decision |
| Tue 09-22 | GH | GitHub | Repo-public readiness: README, demo-data disclosure section | Team go/no-go on repo visibility |
| Wed 09-23 | CC | Internal | Walkthrough final: long-form, 5-slide LinkedIn carousel, GIF storyboard | GH brand check; figures re-pulled from seeded demo |
| Wed 09-23 | GH | LinkedIn | DM list build (50 finance-ops contacts); lock subreddit set | Tue mod replies |
| Wed 09-23 | SS | LinkedIn | Sequence B post 2: research to 3-week sprint build story | Walkthrough v1 visuals |
| Thu 09-24 | GH | LinkedIn | DM wave 1: 15 personalized feedback-asks | DM list from 09-23 |
| Thu 09-24 | CC | GitHub | Demo-data transparency note published to repo; linked from all launch copy | GH claims check |
| Thu 09-24 | SS | Reddit + LinkedIn | Launch-eve engagement: value comments only, zero product mentions | Accounts in good standing |
| Fri 09-25 | GH | Hacker News | LAUNCH POST: Show HN 08:00–10:00 ET; 4-hour reply window | Repo public; walkthrough live; title locked Wed |
| Fri 09-25 | GH | Reddit | LAUNCH POST: r/FPandA research-first post with full demo-data disclosure | Mod approval from 09-21 |
| Fri 09-25 | SS | LinkedIn | LAUNCH POST: founder profile plus company-page echo, walkthrough carousel | Walkthrough final; transparency note |
| Mon 09-28 | SS | LinkedIn | Sequence A day 1: open the dashboard — the Monday-morning scene | Walkthrough final |
| Mon 09-28 | GH | Internal | Scorecard pull 1: access logs plus channel counts | Log access |
| Mon 09-28 | GH | LinkedIn | DM wave 2 (15) | Wave 1 learnings |
| Tue 09-29 | SS | LinkedIn | Sequence A day 2: run analysis — waste flags with dollar figures | Carousel assets |
| Tue 09-29 | GH | Indie Hackers | Long-form: itch-score to 3-week MVP to first numbers | Repo public; scorecard pull 1 |
| Tue 09-29 | GH | Reddit | Pain-language question thread in r/Accounting (value-first, no product) | Mod approval |
| Wed 09-30 | SS | LinkedIn | Sequence A day 3: the 47-unused-seats flag story | Exact figures re-pulled from seeded demo |
| Wed 09-30 | GH | Email | DM wave 3 (20) plus 5 newsletter pitches | Verified-active outlet list |
| Thu 10-01 | SS | LinkedIn | Sequence A day 4: resolve — the Recovered metric moment | None |
| Thu 10-01 | GH | Internal | Scorecard pull 2; experiment ICE re-rank; channel kill/keep calls | Scorecard pull 1 |
| Fri 10-02 | SS | LinkedIn | Sequence A day 5: honest close — demo-data disclosure plus CTA | Transparency note |
| Fri 10-02 | GH | GitHub | Launch retro and 2-week scorecard v1 published to repo docs (build-in-public artifact) | All channel counts logged |

Required-asset coverage (sprint-3 exit criteria): launch posts on three channels (09-25), Sequence A (LinkedIn demo story, 5 parts, SS), Sequence B (build-in-public, SS and GH), demo-story walkthrough in 3 formats (CC), demo-data transparency note (CC), and the public retro (GH) — six shipped assets, exceeding the 3-asset minimum; CC and SS produce all listed content, GH does placement, checks, and scorecards.

## 4. Demo-story narrative (core asset outline)

Terminology locks applied to every beat: "potential savings" until a flag is resolved; "Recovered" appears only after a resolve action; no invented aggregates; every figure is pulled fresh from the seeded demo environment before each publish, never typed from memory; the demo dataset is disclosed in every asset that shows a figure; CTA text is locked to "Open the dashboard."

1. The scene. A finance lead at a roughly 200-person company, renewal season approaching, and the CFO asks the question with no clean answer: "what are we actually using?" Open with disclosure: what follows is TrimStack's seeded demo environment, not a customer.
2. Open the dashboard. A seeded stack shaped like a real 200-person company's tool estate; tool and seat counts pulled from the seeded demo, not invented. Nothing is resolved yet, nothing is claimed yet.
3. Run the analysis. Waste flags appear, each with a per-flag dollar figure. Every number at this point is potential savings — the product has flagged, not fixed.
4. One flag in focus. 47 unused Figma seats, $180/mo potential savings (PM-anchored figures; CC re-confirms both against the seeded environment during the 09-23 brand check before any external use).
5. Resolve. The finance lead resolves the flag; status changes and the seat decision is recorded.
6. The turn. The Recovered metric moves — $180/mo now recovered. The single payoff beat, and the only moment the word "recovered" is earned.
7. Honest close. Your numbers will differ — this is the demo dataset; the method is the product. CTA: "Open the dashboard."

Formats: long-form text (repo and Indie Hackers), 5-slide LinkedIn document carousel (SS assembles from CC copy), a 60-second GIF storyboard cut from the existing E2E capture run, and a no-image text version for Hacker News with figures inline.

## 5. Metrics and instrumentation reality check

What v1 actually has — no analytics stack, no email, no SSO — and what each source can honestly tell us:

- Server access logs (landing plus app): unique visitors (IP/UA de-duplicated), per-route hits, referrer field for channel attribution (news.ycombinator.com, linkedin.com, reddit.com, direct), and CTA click-through as landing-to-dashboard route transitions.
- App logs: analysis-run and resolve-action POST counts for demo engagement depth. Caveat: demo environment, no user identity — we count events, never people-as-users.
- Channel-native counters: LinkedIn impressions, reactions, comments, profile clicks; Reddit upvotes and comments; HN points and comments; Indie Hackers views and replies; DM reply counts.
- GitHub repo metrics (if public): stars, forks, watchers, traffic views and clones.
- E2E evidence: the pre-launch capture run doubles as launch-day proof that the demo loop works (and is the QA gate before any post).
- API p95 latencies from existing telemetry: a launch-spike quality check, not a growth metric.
- Manual logs: conversation log coded pain-confirmed / pain-denied / not-ICP; pitch tracker.

Launch scorecard (window 2026-09-21 to 2026-10-02):

| Metric | Target | Source |
|---|---|---|
| Proof-of-pain conversations (ICP, >=3 exchanges) | 20 | Coded DM and comment log |
| Unique landing visitors | 250 base / 1,000 stretch | Access logs |
| CTA click-through rate | >=25% of visitors | Route transitions in logs |
| Analysis runs (non-team) | 40 | App logs |
| Resolve actions (non-team) | 10 | App logs |
| Substantive channel comments | 35 | Manual count |
| GitHub stars (if public) | 30 | GitHub |
| Claims-compliance incidents | 0 | Pre-publish audit |

Explicitly excluded as vanity: raw impressions, follower counts, aggregate "dollars saved" totals presented as marketing claims, and any signup or waitlist proxy — none of these surfaces exist or matter in v1.

Decision rules for the 10-01 retro: conversations on target but visitors under 100 means targeting is right and reach is small — double down on the top 1–2 channels in sprint 4. Visitors over 500 but conversations under 10 means reach is fine and the story is wrong — rebuild the demo story around the flag topic with the most comments. Resolve actions near zero means the friction point is the analysis run — fix walkthrough beat 3 before spending more distribution.

## 6. First-2-weeks experiment backlog (ICE = mean of Impact / Confidence / Ease, each 1–10)

E1. Feedback-DM framing (ICE 8.3 = I9 / C8 / E8).
- Hypothesis: feedback-ask DMs to 50 finance-ops contacts produce a >=30% reply rate and >=8 pain-validation conversations in 10 days.
- Motion: 3 waves (15/15/20 on 09-24, 09-28, 09-30), personalized, no pitch in message one; log and code every reply.
- Kill: under 15% reply after 2 waves — stop and rewrite the ask around renewal season; under 8 conversations by 10-01 — demote DMs to maintenance mode.

E2. LinkedIn demo-story format: document post vs text post (ICE 7.7 = I7 / C7 / E9).
- Hypothesis: the document-carousel version of the walkthrough drives >=2x the landing click-through of the best text-only post.
- Motion: post the carousel and one text post from the founder profile in the same week; compare access-log referrer spikes and LinkedIn click counts.
- Kill: carousel below the text post — standardize on text plus a single figure and stop producing carousels.

E3. Community pain-language threads (ICE 7.3 = I6 / C8 / E9).
- Hypothesis: unprompted question threads ("how do you audit seats before renewals?") in r/Accounting and r/FPandA collect >=5 unprompted seat-waste stories in 2 weeks, validating launch language.
- Motion: 2 question posts with no product mention; reply to every on-topic comment; log verbatim phrases.
- Kill: fewer than 3 stories — the itch-score language may overstate the felt pain; pause broad outreach and mine E1 conversations for real phrasing.

E4. Reddit research-first vs product-first framing (ICE 7.0 = I8 / C6 / E7).
- Hypothesis: an itch-score findings thread in r/FPandA earns >=10 substantive comments and >=50 log-attributable visits where a product-first post would be ignored or removed.
- Motion: one research post with charts, methodology, and demo-data disclosure; repo link; 30-minute reply SLA for 4 hours.
- Kill: fewer than 5 substantive comments or mod removal within 48h — r/FPandA becomes comment-engagement only; move the research post to r/smallbusiness.

E5. Show HN one-shot (ICE 6.7 = I7 / C5 / E9).
- Hypothesis: a build-in-public Show HN (itch-score to 3-week MVP to E2E-verified demo) reaches >=10 points and >=100 log-attributable visits in 24 hours.
- Motion: two title variants by 09-23, team vote 09-24, post 08:00–10:00 ET on 09-25, 4-hour reply window.
- Kill: fewer than 5 points in 6 hours — no resubmission ever (spam guardrail); instead leave one disclosed comment on the most relevant adjacent thread that week.

## 7. Risk and ethics guardrails

- No astroturfing: one named account per team member; no second accounts, upvote rings, fake users, or fake reviews; if a community member asks, we say we built it.
- No fake urgency: no countdown timers, no "limited spots", no manufactured scarcity; the launch date is a fact, not a threat.
- Demo-data honesty: the transparency note is live before the first launch post; every asset showing a figure discloses the seeded dataset; the demo story is never framed as a customer outcome.
- Terminology discipline: "potential savings" before resolve, "Recovered" only after resolve, no invented aggregates, CTA text locked.
- No spam cadences: at most 1 product-adjacent post per subreddit per launch window; at most 1 post per day per LinkedIn profile; DMs are personalized one-to-ones with immediate opt-out respect; no bulk sends, no scraped or purchased lists.
- Community respect: mod-mail before posting wherever rules require it; if a mod says no, we do not post; value-first comments carry zero product mentions.
- Claims audit: every asset passes the pre-publish checklist against brand-guidelines.md sections 3, 4, and 7 (voice, terminology, claims) before its calendar slot; failures are fixed, not waived.
- Escalation: any brand-compliance question the team cannot resolve goes to the product owner before publish — a delayed post beats a retraction.