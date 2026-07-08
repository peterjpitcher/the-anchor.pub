# SEO Strategy — The Anchor, Full Overhaul, 7 July 2026

Companion files: keyword-framework.md · opportunity-map.md · competitor-landscape.md · serp-snapshots.md. Evidence: `evidence/` crawl (240 pages, 0 fetch errors, 2026-07-07) + codebase @ main (19e88215) + WebSearch API captures (2026-07-07) + June 2026 run memory. **No GSC/GA4/CrUX/backlink data this run** — demand and ranking claims are dated-June or marked inferred.

## 1. Business context

Village pub in Stanwell Moor, 7 minutes from Heathrow T5. Success = table bookings (/book-table wizard), private-hire enquiries, event bookings, calls to 01753 682707 — not rankings. Owner priorities: 1) Sunday roast/food, 2) private hire, 3) events. Traffic reality (June GSC-backed diagnosis): Heathrow/plane-spotting demand dominates and converts — posture is **protect plane-spotting, grow commercial**. Hard constraints: SSOT-governed claims (no real ale, no Sky/TNT, no weddings, no breakfast/delivery; "The Anchor", never "The Anchor Pub"; all food/drink prices live-from-DB; Sunday roast is walk-in 1pm–6pm, no pre-order).

## 2. Current organic position (evidence-based, no rank claims)

The June 2026 overhaul (WP0–WP8, deployed 14 Jun) left the estate structurally healthy: 238/240 pages return 200, zero orphans, zero missing-alt images, tag pages correctly noindexed, redirects consolidated (audit-summary.md, internal-link-issues.md). In every commercial query checked on 2026-07-07, The Anchor pages appeared at or near the top of the (US-localised, non-Google) result lists, and AI-style answers already cite The Anchor by name for plane-spotting, wakes, pub-near-T5, function rooms and Sunday roast (serp-snapshots.md). June's GSC showed /near-heathrow at position 6.8 for "pub near heathrow airport" (dated evidence).

**The position statement: visibility is largely won; the run's problems are (a) the measurement layer is unverified, (b) what search and AI answers say about The Anchor is partly wrong, and (c) template-level waste and cannibalisation dilute what's already ranking.**

## 3. Where the site can realistically win

| Arena | Verdict | Why |
|---|---|---|
| Sunday roast near Heathrow/Staines | **Win now** — already surfacing; fix facts + consolidate | Walk-in/no-pre-order is a genuine differentiator nobody else claims; AI answers currently repeat the *retired* pre-order rule — correcting this directly protects priority-1 revenue |
| Private hire — occasions (wakes, christenings, retirements) | **Win now** — visible leader in wakes | Only directories and one chain compete; crematorium-proximity landmark pages are a moat; facts drifting (capacity/prices) |
| Christmas parties 10–60 guests | **Win this quarter** (Jul–Oct booking window) | Hotels own scale, not the small-office segment; free parking + outside-ULEZ is unclaimed by any competitor result |
| Pub near Heathrow / T5 | **Consolidate** | June pos 6.8 = striking distance; stale index titles to flush |
| Plane spotting | **Protect** | Content moat + AI citations already earned; feeds entity authority for everything else |
| "Restaurants near Heathrow" head term | **Don't chase head** | In-terminal/directory dominated, intent-split; own the modifier long-tail instead |
| Generic venue-hire / Heathrow-parking head terms | **Don't chase** | Directory/aggregator walls; convert existing traffic instead |
| Events (quiz/bingo/karaoke) | **Maintain only** | Local, social-driven demand; retention not acquisition |

## 4. What matters most — top three priorities

1. **Restore trust in measurement (Tier-1 prerequisites).** Verify/set GA4 Measurement Protocol env vars in Vercel; produce a GSC pull. Without these, no roadmap item can be proven to work. (Automatic Tier-1 per skill rules — both raised as Do-now backlog items.)
2. **Make every search-visible fact match the SSOT.** Stale/incorrect claims (pre-order roast, retired prices, minimum-spend wording, wrong distance, wrong capacity) are being repeated by AI answers on exactly the queries that drive the owner's three priorities. Sweep live pages, fix the wakes capacity phrasing and comparison blog, then force recrawl of 301'd/stale URLs.
3. **One systemic metadata fix + cannibalisation disposition.** Fix the doubled-brand/overlong title template (102 doubled, 211 >60 chars, 10 with banned "The Anchor Pub"); decide the /private-hire vs /function-room-hire vs /private-party-venue keeper once GSC data lands.

## 5. What success looks like (KPIs)

Baseline-first — numbers set after SEO-001/002 land (no invented targets):
- **K1** GA4 booking-funnel events verified firing end-to-end (booking complete, private-hire enquiry, call click) — binary, week 1.
- **K2** GSC pull established; striking-distance list regenerated — binary, week 1–2.
- **K3** AI/SERP fact-accuracy: re-run the six snapshot queries after fixes; zero retired-claim repetitions (pre-order/£14.99/£12pp/£38/min-spend/"5 minutes") — 6–8 weeks (recrawl lag).
- **K4** Clicks/impressions to /sunday-roast, /private-hire cluster, /christmas-parties (GSC, once available) trending up quarter-on-quarter; **guardrail:** plane-spotting cluster clicks do not decline.
- **K5** Bookings/enquiries attributed to organic in GA4 (post-K1) — the commercial success metric.

## 6. Review scope for the other agents

- **Technical SEO:** title template (`app/layout.tsx:66-67`); sitemap delta (189 vs June ~319 — reconcile 44 crawled-not-in-sitemap); schema required-fields on money pages + retired FAQ/HowTo pruning + 12k-block bloat; /leave-review 3-hop redirect (473 links); meta-description currency bug; verify 301'd URLs (/sunday-lunch) and queue recrawl list.
- **Content Strategy:** SSOT fact sweep (wakes "up to 50", comparison blog min-spend wording, any residual hardcoded prices — June flagged 2 files; distance claims); private-hire cannibalisation disposition; finish June open editorial (near-heathrow, restaurants-near-heathrow, private-hire body copy; 6 seasonal evergreens); Christmas-parties refresh for the Jul–Oct window.
- **Analytics:** GA4 env vars (Vercel) + key-event verification; GSC property access + pull; consent-mode v2 verification inside GTM (unverifiable from code); call-tracking reality check.
- **Authority:** directory profiles (Tagvenue/Hire Space/etc. — they occupy the SERPs; The Anchor's listings should be claimed/accurate); GBP optimisation + local-pack observation (open since June); verified sameAs set (June open item).
- **UX/CRO:** /book-table funnel (SALES_CLOSED path), /private-hire enquiry form, phone-CTA prominence on wakes (short-notice audience), /christmas-parties enquiry path.
- **Copywriting/Editorial:** all rewrites via `editorial-team` after `keyword-plan` validates new terms; SSOT is law; titles ≤60 chars under the fixed template.

## 7. Priority pages (for the page-level wave, ranked by commercial opportunity)

1. `/sunday-roast` — priority-1 revenue; fact-poisoned AI surface
2. `/private-hire` — priority-2 hub; broken meta description; cannibalisation keeper-candidate
3. `/book-table` — conversion neck for everything
4. `/christmas-parties` — in-window seasonal; stale price/distance claims
5. `/private-hire/wakes` — winning niche; capacity/price fact fixes
6. `/near-heathrow` — striking-distance consolidation (June pos 6.8, dated); stale index title
7. `/food-menu` — priority-1 support; "Dishes from 4." snippet bug
8. `/` (homepage) — entity/brand hub; Restaurant schema missing address; default title contains banned phrase
9. `/restaurants-near-heathrow` — modifier long-tail; June body-copy open item; "9 draught beers" claim check
10. `/function-room-hire` — banned-phrase title; cannibalisation disposition subject
11. `/corporate-events` — priority-2/3; hotel-differentiation angle
12. `/plane-spotting-heathrow` — protect + convert (with the two blog guides)
13. `/whats-on` — priority-3 events hub
14. `/beer-garden` — plane-spotting/summer/food connector; Restaurant schema gap
15. `/heathrow-parking` — direct revenue line; convert-don't-chase

## 8. Initial unified backlog

| ID | Category | Item | Why it matters | Impact | Effort | Tier | Dependencies | Decision |
|----|----------|------|----------------|--------|--------|------|--------------|----------|
| SEO-001 | Analytics | Verify/set `GA4_MEASUREMENT_ID`+`GA4_API_SECRET` in Vercel; prove booking/enquiry/call events land in GA4 | Conversion tracking silently no-ops if unset (`app/api/analytics/route.ts:112-113`); roadmap unmeasurable | High — success metric itself | Small | Immediate | Owner (Vercel access) | **Do now** |
| SEO-002 | Analytics | Confirm verified GSC property; wire `fetch-search-data.py` or manual export into run | No first-party demand/position data; blocks striking-distance, cannibalisation, R2 hotel disposition | High | Small | Immediate | Owner (GSC access) | **Do now** |
| SEO-003 | Technical | Fix title template: de-duplicate brand, ≤60 chars, remove "The Anchor Pub" (incl. root default, `app/layout.tsx:66`) | 102/237 doubled, 211/237 overlong, 10 banned-phrase titles; CTR waste on every impression | High | Medium | Immediate | Developer | **Do now** |
| SEO-004 | Content | SSOT fact sweep of search-visible claims: wakes capacity (`app/private-hire/wakes/page.tsx:357`), comparison-blog min-spend wording, residual hardcoded prices, "5 minutes" distance | AI answers repeat retired/banned claims on priority-1/2 queries | High | Medium | Immediate | Content + SSOT | **Do now** |
| SEO-005 | Technical | GSC recrawl queue: /sunday-lunch (301), /function-room-hire, /near-heathrow (stale index titles) after SEO-003/004 ship | Flushes stale snippets feeding wrong AI answers | High | Small | Immediate | SEO-002/003/004 | **Do now** |
| SEO-006 | Technical | Fix money-page meta descriptions: currency interpolation ("Dishes from 4.") on /food-menu + /book-table; rewrite broken /private-hire description | Broken snippets on conversion pages | Medium | Small | Immediate | Developer | **Do now** |
| SEO-007 | Technical | Point sitewide /leave-review links at final URL (kills 236×3-hop redirect rows) | Crawl-budget/UX hygiene; trivial fix | Low | Small | Short-term | Developer | **Do now** |
| SEO-008 | Technical | Schema: add required fields on money pages (Restaurant `address` on / and /beer-garden), prune 146 retired FAQ/HowTo blocks, audit 12k-block bloat | Rich-result eligibility + AI-answer hygiene | Medium | Medium | Short-term | Developer | Schedule |
| SEO-009 | Content | Private-hire cannibalisation disposition: /private-hire vs /function-room-hire vs /private-party-venue | Three pages, one intent; splits June-evidenced demand | Medium-High | Medium | Short-term | SEO-002 (data picks keeper) | Schedule |
| SEO-010 | Content | Christmas-parties refresh + internal-link push before the Jul–Oct booking window peaks | Seasonal priority-2/3 revenue; hotels own the segment above 60 guests, not below | Medium-High | Medium | Short-term | editorial-team, SSOT prices live | Schedule |
| SEO-011 | Content | Finish June open editorial: near-heathrow / restaurants-near-heathrow / private-hire body copy; 6 seasonal evergreens; "9 draught beers" check | Committed June work, half-landed | Medium | Large | Short-term | editorial-team | Schedule |
| SEO-012 | Content | keyword-plan validation round for new target terms (see keyword-framework.md queue) + owner autocomplete/PAA capture | No new content without validated demand (June lesson: KP under-reports hyperlocal — capture GSC too) | Medium | Small | Short-term | Owner-interactive | Schedule |
| SEO-013 | Technical | Sitemap delta reconciliation (189 sitemap vs 240 crawled vs ~319 June build) | Confirm no valuable pages fell out of the sitemap | Medium | Small | Short-term | Technical agent | Schedule |
| SEO-014 | Content | R2 thin hotel-page (/pub-near-*-heathrow) disposition | June open item; needs impressions data to decide keep/consolidate | Low-Medium | Medium | Medium-term | SEO-002 | Monitor |
| SEO-015 | Authority | GBP/local-pack observation + directory profile claims (Tagvenue, Hire Space, bigvenuebook…) + verified sameAs completion | Local pack unobservable this run; directories occupy the SERPs either way | Medium | Medium | Medium-term | Owner (GBP access) | Schedule |
| SEO-016 | Content | Plane-spotting guide freshness pass (dated update, runway/hours accuracy) + cross-sell CTA audit | Protect the moat that feeds entity authority + converting traffic | Medium | Small | Medium-term | Content | Schedule |

Rejected this cycle: chasing "restaurants near heathrow"/"venue hire" head terms (directory/authority walls); new page creation beyond validated terms (over-publication caused June's indexation decline); events-SEO investment beyond maintenance.

## 9. Operating cadence

Per `references/operating-model.md`: 2-week sprints. Sprint 1 = SEO-001–007 (measurement + fact accuracy + systemic fixes). Sprint 2 = SEO-008–013 (schema, cannibalisation, Christmas window, editorial restart) once GSC data lands. Monthly: re-run the six SERP snapshot queries (15 min) and check K3 fact-accuracy; quarterly: full GSC-driven striking-distance refresh. This document is living — revise tiers when SEO-002 produces real query data.

## 10. Strategy self-test

1. *Top three priorities?* Measurement restoration; search/AI fact accuracy; title template + private-hire consolidation. 2. *Pages that matter most?* §7 list — roast, private-hire cluster, book-table, Christmas. 3. *What blocks growth?* Unverified conversion tracking, no GSC feed, stale claims in the index. 4. *Ship first?* SEO-001/002 (same week) then SEO-003/004/005 as one release. 5. *Stop doing?* Head-term chasing, new thin pages, events-SEO beyond maintenance.

```json
{ "findings": [
  { "finding": "GA4 Measurement Protocol conversion forwarding unverified — env vars possibly unset in Vercel, silently no-ops", "evidence": "app/api/analytics/route.ts:112-113; evidence/tracking-evidence.md; open since June 2026", "source": "tracking-evidence.md (codebase grep) + June run memory", "dataStatus": "Known", "severity": "Critical", "confidence": "High", "impactArea": "conversion", "owner": "Analytics", "effort": "Small", "dependencies": "Owner Vercel access", "fixType": "Analytics/governance fix", "recommendedAction": "Set/verify GA4_MEASUREMENT_ID + GA4_API_SECRET in Vercel; fire test booking; confirm event in GA4 realtime", "validationStep": "GA4 shows server-side purchase/booking events with landing_path attribution", "riskRollback": "None — additive config" },
  { "finding": "No GSC data feed this run — first-party query/position data absent, blocking striking-distance, cannibalisation and R2 decisions", "evidence": "inputs/input-summary.md (data availability); June run had GSC-backed plans, workspace deleted", "source": "input-summary.md", "dataStatus": "Known", "severity": "Critical", "confidence": "High", "impactArea": "SEO", "owner": "Analytics", "effort": "Small", "dependencies": "Owner GSC access / service account", "fixType": "Analytics/governance fix", "recommendedAction": "Confirm verified GSC property; run fetch-search-data.py or manual export into run workspace", "validationStep": "search-queries.csv present; analyse-search-data.py produces striking-distance list", "riskRollback": "None" },
  { "finding": "AI answers and stale index copies repeat retired/banned claims on priority commercial queries (pre-order roast, £14.99–£15.99, £12pp buffet, £38 Christmas, minimum-spend wording, '5 minutes from T5', 'up to 50 guests')", "evidence": "discovery/strategy/serp-snapshots.md (WebSearch captures 2026-07-07); live copy at app/private-hire/wakes/page.tsx:357; stale 301'd /sunday-lunch title in results", "source": "WebSearch API capture + codebase grep + docs/SSOT.md §4/§11", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "AI visibility", "owner": "Content", "effort": "Medium", "dependencies": "SSOT, content team, then GSC recrawl", "fixType": "Content process fix", "recommendedAction": "SSOT fact-sweep of wakes page, function-room comparison blog, distance claims; request recrawl of /sunday-lunch, /function-room-hire, /near-heathrow", "validationStep": "Re-run the 6 snapshot queries after 6–8 weeks; zero retired-claim repetitions", "riskRollback": "Content edits reversible via git" },
  { "finding": "Root title template doubles the brand sitewide: 102/237 titles contain 'The Anchor' twice, 211/237 exceed 60 chars, 10 contain banned 'The Anchor Pub' including the root default", "evidence": "app/layout.tsx:66-67 ('%s | The Anchor Stanwell Moor'); evidence/page-metadata.csv counts (102 doubled / 211 >60 / 10 banned)", "source": "collect-site-evidence.py + codebase inspection", "dataStatus": "Known", "severity": "High", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Medium", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Fix template/page-title convention: brand once, ≤60 chars, strip 'The Anchor Pub'", "validationStep": "Re-crawl: doubled-brand count 0, >60-char count materially reduced", "riskRollback": "Revert template string; titles are low-risk to change" },
  { "finding": "Money-page meta descriptions defective: '/food-menu' and '/book-table' show 'Dishes/Food from 4.' (lost currency symbol in live-price interpolation); /private-hire description grammatically broken and truncated", "evidence": "evidence/page-metadata.csv rows for /food-menu, /book-table, /private-hire", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Small", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Fix currency formatting in metadata generation; rewrite /private-hire description", "validationStep": "Re-fetch pages; descriptions read correctly with £", "riskRollback": "None — metadata only" },
  { "finding": "Private-hire head intent split across three near-duplicate pages (/private-hire, /function-room-hire, /private-party-venue) — cannibalisation risk on June-evidenced demand", "evidence": "evidence/page-metadata.csv: H1s 'Function Room Hire Near Heathrow & Staines' vs 'Function Room Hire Near Heathrow'; June GSC 'pubs with private rooms in staines' 302 impr (dated)", "source": "collect-site-evidence.py + June keyword-plan memory", "dataStatus": "inferred", "severity": "Medium", "confidence": "Medium", "impactArea": "SEO", "owner": "Content", "effort": "Medium", "dependencies": "SEO-002 GSC data to pick keeper", "fixType": "One-off page fix", "recommendedAction": "Differentiate targeting or consolidate to /private-hire once query data confirms which page earns impressions", "validationStep": "GSC: one page accrues the cluster's impressions post-change", "riskRollback": "301s reversible; keep both live until data decides" },
  { "finding": "/leave-review linked ~473× sitewide through a 3-hop redirect chain", "evidence": "evidence/internal-link-issues.md; evidence/broken-internal-links.csv (236 rows redirect_chain_len=3)", "source": "collect-site-evidence.py", "dataStatus": "Known", "severity": "Low", "confidence": "High", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Update the shared footer/nav link to the final /leave-review URL", "validationStep": "Re-crawl: 0 redirecting /leave-review rows", "riskRollback": "None" },
  { "finding": "Schema estate part-broken and bloated: 430 blocks missing required fields (Restaurant missing address on homepage/beer-garden), 146 retired FAQ/HowTo blocks, 12,013 typed blocks on 236 pages", "evidence": "evidence/schema-validation-summary.md; evidence/schema-issues.csv (576 actionable rows)", "source": "offline schema validation (validate-schema)", "dataStatus": "Known", "severity": "Medium", "confidence": "High", "impactArea": "SEO", "owner": "Technical", "effort": "Medium", "dependencies": "Developer", "fixType": "Template/system fix", "recommendedAction": "Fix required fields on money pages first; prune retired rich-result types; audit block volume per page", "validationStep": "Re-run validator: 0 missing-required on priority pages", "riskRollback": "Schema edits reversible; validate before deploy" },
  { "finding": "Sitemap shrank to 189 URLs vs ~319 June build pages; 44 crawled pages not in sitemap", "evidence": "evidence/audit-summary.md (coverage diff); inputs/input-summary.md (June ~319)", "source": "collect-site-evidence.py + June memory", "dataStatus": "Known", "severity": "Medium", "confidence": "Medium", "impactArea": "crawl/indexing", "owner": "Technical", "effort": "Small", "dependencies": "Technical agent review", "fixType": "Template/system fix", "recommendedAction": "Reconcile the delta: confirm exclusions are all intentional (tags/noindex/consolidations), re-add any valuable stragglers", "validationStep": "Documented disposition per excluded URL class", "riskRollback": "None — sitemap additive" },
  { "finding": "Local pack composition unobservable this run (no compliant capture available in non-interactive session) — GBP/local-pack state unknown despite being key for private-hire and roast demand", "evidence": "discovery/strategy/serp-snapshots.md capture-method note", "source": "methodology limitation", "dataStatus": "unavailable", "severity": "Medium", "confidence": "Low", "impactArea": "local", "owner": "Authority", "effort": "Small", "dependencies": "Owner manual UK SERP check + GBP access", "fixType": "Analytics/governance fix", "recommendedAction": "Owner: eyeball local pack for 'pub near me'/'sunday roast staines'/'function room staines', record who appears; continue June GBP optimisation item", "validationStep": "Local-pack observation log added to run inputs", "riskRollback": "None" }
] }
```
