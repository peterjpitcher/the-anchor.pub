# Keyword Optimisation Review — The Anchor Website
**Date:** 7 April 2026
**Reviewer:** Claude (keyword-optimisation skill)
**Baseline:** Previous keyword work completed 5 April 2026 (commits `4bf2949`, `7269565`, `16b44ec`)
**Data sources:** Live SERP validation (7 April), GSC audit (4 April), Google Keyword Planner (6 rounds, 240+ keywords)

---

## Phase 0: Technical Gate — PASSED (A+)

No technical blockers. Full details in `docs/seo-audit-2026-04-04.md`. Key strengths:
- 3,389 properly configured 301 redirects
- Dynamic sitemap with 1-hour revalidation
- Comprehensive structured data (10+ schema types)
- Canonical URL enforcement via middleware
- HSTS, security headers, image optimisation all excellent

---

## Phase 1: Site Audit Summary

**128 pages catalogued** across 12 categories. All pages previously assigned keyword targets or documented exclusion reasons.

### Page Tiering

| Tier | Count | Definition | Keyword status |
|------|-------|-----------|---------------|
| **1 — Core money pages** | ~25 | Revenue-driving pages (menus, booking, private hire, near-heathrow) | All metadata optimised |
| **2 — Strategic informational** | ~35 | Authority builders (events, location pages, beer garden, plane spotting) | All metadata optimised |
| **3 — Support pages** | ~20 | Trust pages (about, reviews, hotel proximity, seasonal) | Most optimised or "no change needed" |
| **4 — Low-value utility** | ~48 | System pages (policy, booking confirmations, debug, dynamic routes) | Excluded by design |

### Traffic Snapshot (from 4 April GSC audit)

| Metric | Value | Trend |
|--------|-------|-------|
| Total clicks (11 days) | 487 | +98% vs prior period |
| Total impressions | 16,692 | +16% |
| Average CTR | 2.92% | +70% |
| Average position | 11.7 | +3.4 improvement |

**Key finding:** Traffic growth is driven almost entirely by plane spotting content (4 of top 7 pages). Revenue pages (food, private hire, events) remain underperforming despite good metadata optimisation.

---

## Phase 2: Current Keyword Inventory

### Tier 1 — Core Money Pages

| Page | Primary Keyword | Vol/mo | Signal Strength | Intent | SERP Position (est.) |
|------|----------------|--------|----------------|--------|---------------------|
| `/near-heathrow` | pubs near heathrow airport | 500 | Strong (title + H1 + body) | Navigational | Top 10 — dominates with 6/10 results for "pub free parking heathrow" |
| `/food-menu` | where to eat near heathrow airport | 50 | Strong | Commercial | Top 5 (position 5.2) — competes with OpenTable, TripAdvisor |
| `/sunday-lunch` | sunday roast near heathrow | ~0 local | Strong | Transactional | Top 10 (position 8.7) — TripAdvisor, OpenTable, Heathrow Express above |
| `/beer-garden` | beer garden near heathrow | ~0 local | Strong | Navigational | Top 3 — dominates niche completely (positions 1-3) |
| `/heathrow-parking` | cheap heathrow parking | 5,000 | Strong | Transactional | Visible but buried by APH, PurplePark, etc. |
| `/private-hire` | function room hire near me | 5,000 local | Strong | Transactional | Position 14.1 — BigVenueBook, SquareMeal above |
| `/book-table` | book pub table near heathrow | ~0 | Weak (title only) | Transactional | Position 10.8, 0 clicks |
| `/plane-spotting-heathrow` | plane spotting heathrow | 5,000 | Strong | Informational | Top 3 — site's strongest performer |

### Tier 2 — Strategic Informational

| Page | Primary Keyword | Vol/mo | Signal Strength | Intent | SERP Position (est.) |
|------|----------------|--------|----------------|--------|---------------------|
| `/quiz-night` | pub quiz near me | 5,000 local | Strong | Transactional | Top 3 for "quiz night heathrow staines" |
| `/live-sport` | live sport pub near me | 500 local | Moderate | Informational | Position 11.3 — **NOTE: no longer shows Sky Sports** |
| `/live-music` | live music pub near me | 5,000 local | Strong | Informational | Competes with London Stone, Last Hop in Staines |
| `/dog-friendly-pub-heathrow` | dog friendly pub near me | 50,000 local | Strong | Navigational | Top 3 — dominates for "dog friendly pub heathrow" |
| `/whats-on` | pub events near me | 500 local | Strong | Informational | Position 3.4 but only 0.5% CTR |
| `/staines-pub` | pubs in staines | 5,000 | Strong | Navigational | Position 8.8 |
| `/pool-darts-pub` | pool table pub near me | 50,000 local | Strong | Navigational | Recently optimised |
| `/karaoke` | karaoke pub near me | 500 local | Strong | Transactional | Position 9.0 |

### Tier 2 — Private Hire Sub-Pages

| Page | Primary Keyword | Vol/mo | Signal Strength | Intent | SERP Position (est.) |
|------|----------------|--------|----------------|--------|---------------------|
| `/private-hire/wakes` | wake venue heathrow | 0 | Moderate (H1 fixed) | Transactional | Position 21.8 — **NOT appearing in "wake venue surrey" SERPs** |
| `/private-hire/weddings` | wedding venue near heathrow | 50 | Moderate | Transactional | Position 10.3 |
| `/private-hire/milestone-birthdays` | milestone birthday venue | 0 | Moderate | Transactional | Position 7.9 — **NOT appearing for "birthday party venue staines"** |
| `/private-hire/christenings` | christening venue near heathrow | 0 | Moderate | Transactional | Position 21.4 |
| `/private-hire/gender-reveal` | gender reveal venue | 50 | Moderate | Transactional | Position 7.2 |
| `/private-hire/engagement-parties` | engagement party venue | 500 | Moderate | Transactional | Position 37.5 |
| `/private-hire/retirement-parties` | retirement party venue | 50 | Moderate | Transactional | Position 19.3 |
| `/private-hire/baby-showers` | baby shower venue near heathrow | 0 | Moderate | Transactional | No data |

### Cannibalisation Check

Previously identified and resolved:
- `/restaurants-near-heathrow` vs `/food-menu` → differentiated (traveller angle)
- `/function-room-hire` vs `/private-hire` → differentiated (room specs angle)
- `/private-party-venue` vs `/private-hire` → differentiated (parties angle)
- `/pubs-in-stanwell` vs `/stanwell-pub` → differentiated (Stanwell Moor village angle)
- `/pub-garden-heathrow` → 301 redirected to `/beer-garden`

**New cannibalisation risk detected:**
- `/blog/best-sunday-roast-near-heathrow` vs `/sunday-lunch` — both target "sunday roast heathrow" queries. Blog post (position 7.1, 5 clicks) is outperforming the landing page (position 8.7, 3 clicks). The blog should funnel to the landing page, not compete with it.
- `/blog/fish-chips-guide` vs `/fish-and-chips-heathrow` — blog (position 6.4, 7 clicks) outperforms landing page (position 4.7, 0 clicks). Landing page has better position but gets no clicks (only 19 impressions vs 415 for blog).

### Keyword Export for Google Keyword Planner

Here are the keywords to validate — split into current targets and new opportunities:

**Current targets needing volume refresh:**
```
sunday roast near heathrow, pub food near heathrow, restaurants near heathrow airport, wake venue near heathrow, christening venue surrey, birthday party venue staines, celebration of life venue heathrow, pre flight meal heathrow, things to do near heathrow airport, where to eat before flying heathrow, pub lunch near heathrow, best pub food surrey, live music staines, football pub heathrow, function room hire staines, private room pub heathrow, party venue staines upon thames, engagement party venue surrey, baby shower venue staines, retirement party pub heathrow
```

**New opportunity keywords:**
```
celebration of life venue surrey, celebration of life pub, things to do near heathrow while waiting, things to do on heathrow layover, heathrow layover ideas, best restaurants near heathrow outside airport, eat outside heathrow airport, pub with parking near heathrow, free parking pub heathrow, beer garden plane spotting, watch planes land heathrow pub, pub quiz staines upon thames, bingo night staines, open mic night staines, karaoke staines upon thames, birthday party pub surrey, 30th birthday venue heathrow, 40th birthday venue surrey, 50th birthday party venue near heathrow, christening party pub surrey, gender reveal party pub, wake reception pub surrey, funeral tea venue heathrow, gastropub near heathrow, best sunday roast surrey, sunday carvery near heathrow, dog friendly beer garden surrey, family pub near heathrow airport, kids menu pub heathrow, gluten free restaurant heathrow, vegan pub food surrey, pizza near heathrow airport, burger restaurant near heathrow, fish and chips near heathrow airport, coach party pub heathrow, group dining heathrow, large group restaurant near heathrow
```

---

## Phase 3: Keyword Opportunity Research

### SERP-Validated New Opportunities

Every keyword below has been searched and validated against what currently ranks.

#### Opportunity 1: "celebration of life venue" cluster
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| celebration of life venue surrey | `/private-hire/wakes` | Transactional | Top results: ChooseYourEvent, Kingswood Golf Club, Gorse Hill. No pub in top 10. Synonym for "wake venue" but attracts different audience (secular, modern). |
| celebration of life pub | `/private-hire/wakes` | Transactional | Virtually uncontested. Adding "celebration of life" language to the wakes page would capture this intent. |

**Rationale:** The wakes page currently ranks position 21.8 and doesn't appear for "celebration of life" queries at all. "Celebration of life" is increasingly used instead of "wake" — especially by younger demographics. Adding this language is a low-effort, high-impact content change.

#### Opportunity 2: "things to do near heathrow" cluster
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| things to do near heathrow airport | `/blog` (new post) | Informational | Top results: Stasher, AirportExecutive, SleepingInAirports — all travel blogs. Listicle format dominates. |
| things to do on heathrow layover | `/blog/heathrow-layover-guide` (existing) | Informational | Existing blog post ranks position 8.6 with 17 clicks. Could be expanded. |
| heathrow layover ideas | `/blog/heathrow-layover-guide` | Informational | Same page — add "layover ideas" to title/H1. |

**Rationale:** The Anchor already has a strong layover guide blog post. The broader "things to do near heathrow" query (high volume) isn't being targeted. A new listicle blog post ("12 Things to Do Near Heathrow Airport") with The Anchor featured prominently could capture this traffic.

#### Opportunity 3: "birthday party venue" location cluster
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| birthday party venue staines | `/private-hire/milestone-birthdays` | Transactional | Top results: SquareMeal, BigVenueBook, ChooseYourVenue aggregators. The Anchor does NOT appear. |
| 30th birthday venue heathrow | `/blog` (existing post) | Informational | Existing blog post "30th Birthday Party Ideas" targeting 5K/mo keyword. Check if it links to /milestone-birthdays. |
| 50th birthday venue heathrow | `/blog` (existing post) | Informational | Existing blog post "50th Birthday Party Ideas" targeting 5K/mo keyword. Same check. |
| birthday party pub surrey | `/private-hire/milestone-birthdays` | Transactional | Aggregators dominate. Pub-specific angle could rank on page 1. |

**Rationale:** The birthday blog posts were created for high-volume keywords (5K/mo each) but the landing page `/private-hire/milestone-birthdays` isn't appearing in location-specific SERPs. The page needs location keywords woven into body copy ("birthday party venue in Staines", "near Heathrow").

#### Opportunity 4: "gastropub near heathrow" / "best pub food surrey"
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| gastropub near heathrow | `/food-menu` | Commercial | OpenTable lists "33 Best Gastro Pubs In Heathrow" — aggregator dominates. The Anchor doesn't appear. |
| best pub food surrey | `/blog` (new post) | Informational | Muddy Stilettos, SurreyLive, Essential Surrey dominate. The Anchor isn't mentioned in any "best of" lists. |

**Rationale:** This is more of a PR/outreach opportunity than an on-page SEO fix. However, a blog post positioning The Anchor in the "best pub food near Heathrow" conversation could earn links and referral traffic. OpenTable listing optimisation would also help.

#### Opportunity 5: "pre-flight meal" / "eat before flying"
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| pre flight meal near heathrow | `/pre-flight-meal` | Transactional | Top results: Gordon Ramsay Plane Food, RailAir, terminal restaurant guides. ALL results are in-terminal dining. The Anchor's page doesn't appear at all. |
| eat outside heathrow airport | `/restaurants-near-heathrow` or `/near-heathrow` | Commercial | Same terminal-dominated results. Opportunity for a "why eat outside the airport" angle. |

**Rationale:** The `/pre-flight-meal` page exists but is invisible. The SERP is dominated by in-terminal dining guides. To compete, the page needs to explicitly position against terminal dining (price comparison, quality difference, "save £20 on your pre-flight meal" angle).

#### Opportunity 6: "watch football near heathrow" / live sport reality check
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| where to watch football near heathrow | `/live-sport` | Informational | London's Pride (T2), Queen's Arms (T2), Holiday Inn Sports Bar all compete. The Anchor's blog post about dropping Sky Sports appears in results. |
| sports bar near heathrow | `/live-sport` | Navigational | Same competitors. Holiday Inn Sports Bar is a strong competitor. |

**CRITICAL FINDING:** The Anchor's blog post revealing it no longer shows Sky Sports/TNT Sports appears in SERPs for "watch football near heathrow". This is a brand risk — people searching for football pubs will see the Anchor mentioned alongside the fact it dropped sports subscriptions. The `/live-sport` page needs to be honest about what IS shown (major tournaments on terrestrial TV) and de-emphasise weekly match queries it can't serve.

#### Opportunity 7: "funeral tea venue" / wake synonym cluster
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| funeral tea venue heathrow | `/private-hire/wakes` | Transactional | No results specifically for this. "Funeral tea" is a common UK term for post-funeral refreshments. Zero competition for this exact phrase. |
| wake reception pub surrey | `/private-hire/wakes` | Transactional | ChooseYourVenue dominates. The Anchor not appearing. |
| funeral reception near heathrow | `/private-hire/wakes` | Transactional | Same aggregator-dominated SERPs. |

**Rationale:** The wakes page should include "funeral tea", "funeral reception", and "celebration of life" as synonyms. These terms capture different demographics searching for the same service.

#### Opportunity 8: "group dining" / "large group restaurant"
| Keyword | Recommended page | Intent | SERP insight |
|---------|-----------------|--------|-------------|
| group dining heathrow | `/private-hire` or `/function-room-hire` | Transactional | Not currently targeted. Hotels dominate (Sheraton, Hilton). |
| large group restaurant near heathrow | `/function-room-hire` | Transactional | OpenTable, BigVenueBook aggregators. Group dining is a gap between the food menu and private hire pages. |

**Rationale:** There's no page targeting groups of 10-30 who want to dine together without full private hire. This is a common use case (family reunions, pre-flight group meals, sports team dinners). Could be addressed with a section on `/function-room-hire` or `/food-menu`.

---

## Cannibalisation Summary

| Keyword | Page A | Page B | Status | Recommended action |
|---------|--------|--------|--------|-------------------|
| restaurants near heathrow | `/food-menu` | `/restaurants-near-heathrow` | Differentiated (Apr 5) | Monitor — ensure differentiation holds |
| function room hire | `/private-hire` | `/function-room-hire` | Differentiated (Apr 5) | Monitor |
| party venue | `/private-hire` | `/private-party-venue` | Differentiated (Apr 5) | Monitor |
| pubs in stanwell | `/stanwell-pub` | `/pubs-in-stanwell` | Differentiated (Apr 5) | Monitor |
| sunday roast heathrow | `/sunday-lunch` | `/blog/best-sunday-roast-near-heathrow` | **Active conflict** | Blog should prominently link to /sunday-lunch with "Book your Sunday roast" CTA. Consider adding `canonical` pointing blog → landing page if conflict worsens. |
| fish and chips heathrow | `/fish-and-chips-heathrow` | `/blog/fish-chips-guide` | **Active conflict** | Blog outperforms landing page. Add strong CTA in blog linking to landing page. |

---

## Summary: What's New Since 5 April

### Already well-executed:
- All 128 pages have keyword assignments
- H1 tags fixed across all private hire sub-pages
- Metadata optimised on all pages
- 4 cannibalisation issues differentiated
- Plane spotting + beer garden + dog-friendly niches dominated

### Gaps discovered in this review:

1. **"Celebration of life" language missing** from wakes page — captures a growing, uncontested search term
2. **"Things to do near heathrow"** — high-volume informational query not targeted by any page
3. **Birthday party venue + location terms** — landing page invisible despite existing blog posts
4. **Pre-flight meal page invisible** — SERP dominated by terminal dining; needs repositioning against terminal prices
5. **Live sport page honesty gap** — dropped Sky Sports but page still targets "watch football" queries
6. **"Funeral tea" and "funeral reception"** synonyms missing from wakes page
7. **Group dining gap** — no content for groups of 10-30 (between individual dining and full private hire)
8. **Blog-to-landing-page cannibalisation** — two active conflicts (sunday roast, fish & chips)
9. **Private hire sub-pages still thin** — content expansion not yet executed (1,200-1,600 words vs 2,000+ benchmark)
10. **Missing from "best of" lists** — gastropub/surrey pub food listicles don't mention The Anchor (PR opportunity)

---

## Phase 4: Data Exchange Required

To refine these opportunities into a final plan, I need:

### From Google Keyword Planner:
Paste both keyword lists above into Keyword Planner and return:
- Monthly search volume
- Competition level (Low/Medium/High)
- Top of page bid (proxy for commercial intent)

### From Google Search Console (if available):
Export Performance report (Search Results) for the last 30 days. Include: queries, clicks, impressions, CTR, average position. This will show whether the 5 April metadata changes are already moving the needle.

### If neither is available:
We can proceed with SERP-estimated volumes from the existing keyword reference doc and web search signals. The plan will be slightly less precise but still actionable.

---

*This document was generated as part of the keyword-optimisation skill workflow. Next steps depend on data exchange (Phase 4) before the final keyword plan (Phase 5) and content execution (Phase 6).*
