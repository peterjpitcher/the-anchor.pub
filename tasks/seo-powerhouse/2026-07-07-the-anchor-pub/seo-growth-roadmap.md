# The Anchor — SEO Growth Roadmap

**Full Overhaul · 7 July 2026 · Stanwell Moor, near Heathrow**
Prepared by the SEO Powerhouse (9 specialist agents, 240-page crawl, codebase + live-site evidence).
Workspace: `tasks/seo-powerhouse/2026-07-07-the-anchor-pub/`

---

## 1. Data Access & Limitations (read first)

This audit ran on the **without-data track**. What that means for confidence:

| Source | Status this run |
|---|---|
| Full-site crawl (240 URLs) | ✅ Complete — 0 fetch errors, all 189 sitemap URLs + 51 discovered pages |
| Codebase (Next.js 14) | ✅ Full access |
| Live-site fetches | ✅ Used throughout |
| Google Search Console (Performance + Page-Indexing) | ❌ Not provided — **the single biggest gap** |
| GA4 export | ❌ Not provided |
| Core Web Vitals (CrUX/PSI) | ❌ No API keys — recorded `unavailable`, never invented |
| Backlink tool (Ahrefs/Semrush) | ❌ None — authority is directional only |
| June-2026 baseline (`.seo-workspace/`) | ❌ Deleted — no Stage-9 delta vs June possible |

**Consequence:** technical, on-page, schema, tracking and conversion-path findings are **high-confidence** (crawl + code prove them). Demand, ranking-position and cannibalisation-*merge* verdicts are **inferred** and marked lower confidence — no keyword volumes or positions are invented. The top recommendation, SEO-002, is precisely *"get GSC flowing"* so the next audit isn't blind.

Crawl caveat: raw-fetch mode (Playwright absent). The site is server-rendered Next.js, so raw HTML is representative; render-diff found 0 JS-dependent pages.

---

## 2. Executive Summary

**The Anchor has largely won visibility — the money now is in conversion integrity and template hygiene, not new rankings.** The site already surfaces at/near the top for its commercial clusters and is the AI-cited entity for plane-spotting, wakes, pub-near-Terminal-5 and Sunday roast. Across 240 pages and 8 specialist reviews, almost nothing points to "we can't rank." Instead, ranked traffic keeps hitting **broken prices, wrong facts, a mis-routed CTA, and conversion tracking that probably hasn't recorded a booking since June.**

The three things that matter most:

1. **Measurement is broken or unprovable (Tier-1 prerequisite).** The server-side GA4 Measurement Protocol likely no-ops (Vercel env vars unconfirmed since June), the Meta Pixel is **proven dead in production**, and with no GSC feed there is no demand data at all. Every ROI claim and the entire next audit depend on fixing this first.
2. **Money pages leak conversions.** Live menu prices render with **no £ symbol** ("Roasted Turkey16") on the #1 pages; the `/corporate-events` hero CTA drops enquirers into the 20-cover restaurant table wizard; enquiry CTAs point at possibly-dead `info@`/`events@` mailboxes; the private-hire enquiry form is buried behind a cost-estimator that can dead-end.
3. **Content accuracy has drifted against the SSOT.** June's price-scrub left literal "live price" placeholders showing to customers on `/christmas-parties`; the wakes page (a winning niche, grief audience) contradicts itself on capacity and crematorium distance; hardcoded prices persist on more pages than June recorded.

This cycle is **fix-and-protect, not build.** No new pages recommended. 46 scored items; **18 "Do now"**. Four safe fixes are already implemented and verified on a branch.

**One myth corrected:** three agents flagged "The Anchor Pub" in page titles as a *banned* claim. It isn't — SSOT line 20 explicitly permits it in titles/alt/schema-name. The real title defect is length and doubled brand, not the phrase.

---

## 3. Strategic Direction

> **Governing question: where can this site realistically win — commercially?**

| Arena | Verdict | Why |
|---|---|---|
| Sunday roast / food | **Win now** | Already visible + AI-cited; fix £-prices and accuracy to convert the traffic |
| Private-hire occasions (wakes, christenings, etc.) | **Win now** | Low-competition, high-intent; fix facts + surface the enquiry form |
| Small-office Christmas | **Win now (seasonal — Jul–Oct window open)** | `/christmas-parties` earns in this window; strip price/min-spend violations urgently |
| Pub-near-Terminal-5 | **Consolidate** | Was ~position 6.8 in June; nudge to page 1 |
| Plane-spotting / Heathrow-traveller | **Protect** | Converts and drives authority — don't cannibalise it; claim its citations |
| Restaurants / generic venue-hire / parking head terms | **Don't chase** | Low commercial fit vs effort |

---

## 4. Current Performance Baseline

No GSC/GA4 this run, so the baseline is **structural** (crawl evidence), frozen for Stage-9 drift comparison:

- 240 crawled pages · 189 in sitemap · 44 crawled-but-not-in-sitemap · 0 orphans · 0 fetch errors.
- 27 noindex pages (all deliberate) · 13 canonical-points-elsewhere · 21 sitemap/internal URLs behind redirects · 543 broken/redirecting internal-link rows.
- Schema: 12,013 JSON-LD blocks across 236 pages (~51/page) · 430 missing required fields · 146 retired-rich-result blocks.
- Titles: 211/240 over 60 chars (median 81) · 102 double-branded.
- Images: 163 pages with >200KB images (root cause: og:image source files, not next/image).
- Tracking: GTM `GTM-WWFQTQS` loads sitewide; ~40 client events wired; Meta Pixel dead in prod; GA4 MP likely no-op.

Frozen fingerprint: `measurement/run-fingerprint.json`.

---

## 5. Key Findings by Discipline

- **Strategy:** visibility largely won; blockers are measurement, stale/banned claims on priority queries, and systemic template waste. Fix-and-protect cycle; no new pages.
- **Technical:** foundation solid, all June fixes holding. Headline defects: legacy blog 301s dead-ending at a noindexed page; 576 schema issues collapsing to ~5 template causes; Cloudflare email obfuscation creating 244 /cdn-cgi 404s + hiding the email from AI crawlers; robots protecting the wrong path.
- **Content:** June editorial largely landed; open/regressed items are hardcoded prices (now more than June), 11 near-duplicate hotel pages, and self-competition (private-hire vs function-room-hire; two family-dining pages; three function-room-cost blogs).
- **Copywriter:** body copy broadly good (`/sunday-roast` exemplary). Worst defects on the P2 money pages — wakes fact drift and `/christmas-parties` hardcoded prices + banned min-spend line.
- **Editor/QA:** priority pages largely SSOT-clean, but price-scrub placeholders render as literal text; non-SSOT enquiry emails; room-hire fee stated three ways; verbatim banned claims in blogs. Adjudicated: "The Anchor Pub" in zero body copy (title use is SSOT-permitted).
- **Analytics:** tracking *code* excellent; operational layer broken/unprovable — Meta Pixel dead, GA4 MP likely no-op, consent hard-gate drops events, no GSC. Automatic Tier-1.
- **Authority:** `sameAs` June item closed (all 6 real). Plane-spotting citation layer (SpottersWiki, FlyerTalk, layover guides) entirely unclaimed despite the site owning that content; inapub listing repeats a banned "Sky TV" claim.
- **UX/CRO:** all four conversion paths traced. Table booking + event booking **verified wired**; private-hire enquiry wired **but buried/fragile**; corporate CTA mis-routed; Christmas enquiry delivery depends on unconfirmed MS Graph env; £-less prices sitewide.

---

## 6. Priority Mapping

Full scored backlog: `priority-mapping/scored-backlog.csv` (46 items, `priority = bv·so·gap·conf / (effort+risk)`).

**Top 12 by score:**

| Rank | ID | Item | Score | Band |
|---|---|---|---|---|
| 1 | SEO-002 | Get GSC/GA4 data flowing | 250 | Do now |
| 2 | SEO-007 | Restore £ on menu prices | 125 | Do now |
| 3 | SEO-001 | GA4 Measurement Protocol env vars | 100 | Do now |
| 4 | SEO-021 | "5 min from all terminals" → 7-12 min ✅done | 60 | Do now |
| 5 | SEO-003 | Mark 5 events as GA4 key events | 53 | Do now |
| 6 | SEO-008 | Corporate CTA → enquiry not table wizard | 50 | Do now |
| 7 | SEO-010 | Banned enquiry emails → manager@ | 50 | Do now |
| 8 | SEO-017 | Christmas-parties price/min-spend strip | 50 | Do now (seasonal) |
| 9 | SEO-013 | /restaurants-near-heathrow above-fold CTA | 48 | Do now |
| 10 | SEO-023 | Title-system de-double + ≤60 chars | 45 | Do now |
| 11 | SEO-025 | Repoint legacy blog 301s | 45 | Do now |
| 12 | SEO-015 | De-placeholder christmas/engagement copy | 42 | Do now |

Two cheap conversion-integrity items — **SEO-009** (verify Christmas enquiry delivery) and **SEO-012** (dead SALES_CLOSED panel) — score lower only because the model's `(effort+risk)` floor under-weights cheap safety fixes; they are pulled into Tier-1 on judgement.

---

## 7. Keyword Planning Inputs

`priority-mapping/keyword-plan-requests.md` — only the 4 opportunities that need validated demand to make a **retarget/merge** decision (private-hire cluster, hotel pages, family-dining, Christmas-cost blogs). Interactive `keyword-plan` runs are **queued for the owner** (needs Google Keyword Planner data). June's validated plans for roast/near-Heathrow/restaurants/private-hire still hold. Note: Keyword Planner massively under-reports the hyperlocal Heathrow/Staines terms this business wins on — **trust GSC over KP** (another reason SEO-002 leads).

---

## 8. Editorial Production Handoff

`content-production/editorial-team-briefs.md` — EB-1…EB-9, all routed to the `editorial-team` skill per house rule (no copy written inline). **EB-1 (Christmas) and EB-2 (wakes) first.** Every brief names its SSOT constraint and a cannibalisation verdict of **expand existing, no new pages**.

---

## 9. The Roadmap (four tiers)

### Tier 1 — Immediate Fixes (days)
*Actively harming performance now.*
- **SEO-001 · SEO-002 · SEO-003 · SEO-004** — measurement: Vercel env vars, GSC/GA4 linking, key events, Meta Pixel *(owner)*.
- **SEO-007** — £ symbol on menu prices *(dev, T-SEO-007)*.
- **SEO-008** — corporate CTA → enquiry *(dev)*.
- **SEO-010** — banned enquiry emails → `manager@` *(owner confirms mailboxes, then dev)*.
- **SEO-012** — real contact affordance on the SALES_CLOSED panel *(dev)*.
- **SEO-013** — above-fold CTA on `/restaurants-near-heathrow` *(dev)*.
- **SEO-015 · SEO-017** — de-placeholder + strip Christmas price/min-spend violations *(dev + EB-1)* — seasonal urgency.
- **SEO-018** — wakes fact drift *(EB-2)*.
- **SEO-026 · SEO-031 · SEO-021 · SEO-044** — ✅ **done & verified** on branch.
- **SEO-029** — Cloudflare email-obfuscation off *(owner)*.
- **SEO-038** — inapub "Sky TV" banned-claim fix *(owner)*.

### Tier 2 — Short-Term Wins (4–8 weeks)
- **SEO-023** — title-system fix *(dev + editorial, T-SEO-023)*.
- **SEO-024** — money-page meta rewrites *(EB-6)*.
- **SEO-025** — repoint legacy blog 301s + tag-alias at render *(dev, T-SEO-025)*.
- **SEO-016 · SEO-019 · SEO-020 · SEO-022** — price de-hardcode sweep + drift-guard, room-hire wording, blog banned-claim purge *(EB-3/4/5)*.
- **SEO-006** — tracked contact-link components *(dev)*.
- **SEO-011** — surface private-hire enquiry form + estimator fallback *(dev)*.
- **SEO-027** — /drinks schema + de-hardcode *(dev + schema-markup)*.
- **SEO-040 · SEO-041** — roast/near-Heathrow directories + review-velocity routine *(owner)*.

### Tier 3 — Medium-Term Growth (1–3 months)
- **SEO-028 · SEO-032** — schema-estate repair + sitemap reconciliation *(dev + schema-markup)*.
- **SEO-030** — right-size og:images *(dev)*.
- **SEO-037** — FAQ/answer blocks + FAQPage on /private-hire, /whats-on *(editorial + ai-seo + schema-markup)* — AEO.
- **SEO-039** — claim the plane-spotting citation layer *(owner)*.
- **SEO-034** — private-hire de-cannibalisation (interim retarget now; **merge blocked on SEO-002**).
- **SEO-005** — Consent Mode v2 + stop hard-gating events *(dev)*.

### Tier 4 — Long-Term Strategic Bets (3–6 months)
- **SEO-035 · SEO-036** — hotel-page and family-dining disposition *(data-led, after SEO-002)*.
- **SEO-042** — GBP optimisation + community/local-press authority *(owner)*.
- Category ownership: pub-near-Terminal-5 + Sunday-roast-near-Heathrow, once measurement proves what converts.

---

## 10. Implementation Tickets

Dev tickets with acceptance criteria: `implementation-planning/web-developer/web-developer-report.md` (T-SEO-007, 008, 015, 023, 025, 027, 028, 030, 032, 033, 006, 005, 045).
Editorial tickets: `content-production/editorial-team-briefs.md` (EB-1…EB-9).
Owner actions + high-risk sign-off: `implementation/approval-request.md`.

---

## 11. Implementation Status

- **Done & verified (branch `chore/seo-powerhouse-safe-fixes-2026-07-07`, uncommitted):** SEO-021, SEO-026, SEO-031, SEO-044 — tsc 0, eslint 0.
- **Ticketed for dev:** SEO-007, 008, 015, 023, 025, 027, 028, 030, 032, 006, 005, 045, 011, 012, 013.
- **Routed to editorial-team:** EB-1…EB-9 (SEO-015/016/017/018/019/020/022/024/034/037/046).
- **Owner / high-risk (batched approval):** SEO-001/002/003/004/010/029/038/039/040/041/042.
- **Blocked on GSC:** SEO-034/035/036 merges.

---

## 12. Risk Register

| ID | Change | Risk | Mitigation / Rollback |
|---|---|---|---|
| R1 | SEO-007 £-symbol | Leak £ into JSON-LD `Offer.price` → invalid schema | Fix display formatter only; keep `normalizeMenuPrice` bare; Rich Results Test before merge; git revert |
| R2 | SEO-023 title system | Sitewide title change; could truncate/confuse if mis-scoped | Spot-fetch 15 priority pages; ≤60 chars + one brand mention; staged |
| R3 | SEO-025 301 repoint | Redirect/indexation change | Reversible redirect map; monitor GSC coverage post-change |
| R4 | SEO-027/028 schema repair | Sitewide JSON-LD template change | `schema-markup` owns design; validate before/after; reversible |
| R5 | SEO-034/035/036 consolidation | Merging could drop a URL that quietly earns | **BLOCKED on SEO-002 (GSC)**; interim retarget only; never merge without query data |
| R6 | SEO-010 email change | Changing a *working* mailbox breaks a live route | Owner confirms live mailboxes first; reconcile SSOT before edit |
| R7 | SEO-032 sitemap regen | Accidentally add noindex/thin pages | Diff sitemap; assert no noindex URLs included |
| R8 | Branch left uncommitted | Work lost if branch abandoned | Documented in implemented-small-fixes.md; `git diff` recoverable |

---

## 13. Measurement Framework

**KPIs (activate once SEO-002 lands):**
- Organic conversions (table bookings, private-hire enquiries, event bookings, phone clicks) as GA4 **key events** — the headline metric.
- Money-page organic clicks + position (GSC): /sunday-roast, /private-hire, /christmas-parties, /near-heathrow, /restaurants-near-heathrow, pub-near-T5.
- Indexation health (Page-Indexing report): commercial pages indexed; not-indexed reasons trending down.
- Schema validity: 430 missing-required → target 0; `Offer.price` valid.
- Guardrail: no drop in plane-spotting/Heathrow-traveller organic traffic (protect it).

**Re-measurement:** 6–8 weeks after changes ship. Freeze `pre-change` baseline now (`snapshot-baseline.py` needs a search-data feed — deferred until GSC exists); `measure-delta.py` + `build-baseline.py --previous` for drift. Never read a raw delta as causal — respect the control adjustment and small-sample flags.

**Expected clicks/value forecast:** not produced — requires GSC impressions (no demand source this run). No invented figures.

---

## 14. Content Briefs for Priority Pages

Per-page briefs live in `content-production/editorial-team-briefs.md` and `discovery/copywriter/page-recommendations.md` (replacement titles/metas for all 15 priority pages). Briefs targeting *new* terms are marked **"blocked on keyword plan"** until the owner runs `keyword-plan`; no demand figures invented.

---

## 15. Technical Implementation Notes

- Prefer **template/component/schema-builder** fixes over per-page edits — 576 schema issues = ~5 template causes; 163 oversized images = a handful of source assets; 211 long titles = one template.
- Verify every change: `tsc --noEmit` → `eslint` → `npm run build` → re-fetch affected pages → Rich Results Test for schema → re-crawl for internal-link/redirect deltas.
- Keep prices live-from-DB; extend the drift-guard test to catch hardcoded £-strings and placeholder tokens.

---

## 16. Operating Model (make this a system, not a report)

- **Sprint cycle:** 2-week SEO sprints. Sprint 1 = Tier-1 measurement (owner) + the £/CTA/email/Christmas fixes (dev/editorial).
- **Cadence:** owner does Group A this week (unblocks everything); dev takes T-SEO-007/008 next; editorial batch EB-1/EB-2 in parallel.
- **Content flow:** SEO brief → `keyword-plan` (if new terms) → `editorial-team` (write/publish) → verify rendered + schema.
- **Technical flow:** ticket → branch → tsc/lint/build → live re-fetch + Rich Results → merge → post-launch monitor.
- **Handoffs:** structured data → `schema-markup`; AEO → `ai-seo`; copy → `editorial-team`; keywords → `keyword-plan`; conversion rework → `page-cro`/`form-cro`.
- **Re-audit trigger:** once GSC has 6–8 weeks of data, resume this workspace for the with-data Stage-9 delta.

---

## 17. Out of Scope
- No new pages this cycle (fix-and-protect verdict).
- No SERP scraping (hard rule) — local-pack composition unobserved.
- No CWV verdicts (no CrUX/PSI keys) — `unavailable`, not invented.
- No copy written inline — all via `editorial-team`.
- No production deploy — safe fixes left on a branch for owner review.

---

### The one thing to do first
**Set the GA4 env vars and link Search Console (SEO-001 + SEO-002).** Until then, every other win is invisible — you can't prove a single booking came from search, and the highest-value structural decisions (which private-hire/hotel pages to merge) stay blocked. It costs an afternoon and unblocks the entire roadmap.
