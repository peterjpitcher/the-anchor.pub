# SEO Action Plan — The Anchor (the-anchor.pub)

**Date:** 20 March 2026
**Status:** Traffic up 106% YoY (302 → 622 clicks/month), position improved 10+ places on mobile. CTR at 1.6% — significant room to grow.

**Business priorities:** 1) Food revenue 2) Private event bookings 3) Event bookings (Bingo, Quiz, etc.)

---

## Current Performance Snapshot

| Metric | Current (28 days) | YoY Change |
|--------|-------------------|------------|
| Total clicks | 622 | +106% |
| Total impressions | 39,040 | +26% |
| Mobile avg position | 13.07 | +10.78 positions |
| Desktop avg position | 22.35 | +21.02 positions |
| Overall CTR | 1.6% | +0.5pp |
| Indexed pages | ~195 | — |

**Top performing pages:** Homepage (214 clicks), Beer Garden (86), Plane Spotting (27), Parking Blog (21), Sunday Roast Blog (19), Food Menu (17)

**Biggest missed opportunities (high impressions, low CTR):**
- /near-heathrow: 1,762 imp, 0.7% CTR
- /food-menu: 1,642 imp, 1% CTR
- /live-sport: 986 imp, 1.1% CTR
- /sunday-lunch: 774 imp, 1.2% CTR (Priority 1!)
- /drinks: 551 imp, 0.2% CTR
- /quiz-night: 431 imp, 0.2% CTR (Priority 3!)

---

## Health Scores

| Area | Score | Key Finding |
|------|-------|-------------|
| Technical SEO | 7/10 | Solid foundations; title tags and schema gaps are main issues |
| On-Page SEO | 5.5/10 | Keyword-stuffed titles, thin private hire content, poor internal linking to revenue pages |
| Content & Local | 6/10 | 30+ doorway-risk location pages, 60+ dead-weight blog posts, no About Us page |
| AI Search Readiness | 6.5/10 | llms.txt exists (rare!), strong FAQ schema, but missing Menu schema and llms-full.txt |

---

## Prioritised Actions

### WAVE 1 — Quick Wins (Week 1-2) — Estimated +114 clicks/month

These are high-impact, low-effort changes that will improve CTR on pages that already have impressions.

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 1 | **Fix root layout default title** — change from keyword-stuffed 84-char title to `The Anchor \| Pub Near Heathrow \| Stanwell Moor` (49 chars) | Critical | 5 min | All |
| 2 | **Shorten title template suffix** — `%s \| The Anchor Stanwell Moor` (30 chars, gives pages 30+ more chars for keywords) | Critical | 5 min | All |
| 3 | **Fix expired schema date** on /sunday-lunch (`availabilityEnds: '2025-12-31'` → `'2026-12-31'`) | Critical | 5 min | P1 Food |
| 4 | **Rewrite title tags on 8 underperforming pages** — /quiz-night, /near-heathrow, /drinks, /live-sport, /corporate-events, /function-room-hire, /sunday-lunch, /restaurants-near-heathrow (see on-page audit for specific recommendations) | High | 2 hrs | All |
| 5 | **Fix email NAP inconsistency** — standardise on one email across all 44 files | High | 1 hr | All |
| 6 | **Add /sunday-lunch CTA card to homepage** — prominent link in hero or "What Makes Us Special" section | Critical | 30 min | P1 Food |
| 7 | **Add /drinks link to homepage** body content | High | 15 min | P1 Food |
| 8 | **Add persistent event page links to homepage** — cards/links to /quiz-night, /music-bingo, /karaoke | High | 30 min | P3 Events |
| 9 | **Add /restaurants-near-heathrow to "Visit Us" nav** group | Medium | 5 min | P1 Food |
| 10 | **Fix expired over65s offer schema** (`validThrough: '2025-12-31'` → update or remove) | Medium | 5 min | P1 Food |
| 11 | **Update llms.txt** — restructure per AI audit recommendations, fix email, add menu prices | High | 1 hr | All |

### WAVE 2 — Schema & Structured Data (Week 2-4) — Enables Rich Results

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 12 | **Add EventSeries schema** to /quiz-night, /music-bingo, /cash-bingo (defined in code but never imported!) | High | 1 hr | P3 Events |
| 13 | **Add Food Menu schema** with MenuItem entries and prices to /food-menu | High | 3 hrs | P1 Food |
| 14 | **Add BreadcrumbList schema site-wide** (utility exists, only used on drinks pages) | Medium | 2 hrs | All |
| 15 | **Add Article/BlogPosting schema** to blog posts | Medium | 2 hrs | All |
| 16 | **Add MeetingRoom/EventVenue schema** to /function-room-hire and /corporate-events | High | 1 hr | P2 Private Hire |
| 17 | **Create llms-full.txt** with full menu, event dates, FAQ content | Medium | 2 hrs | All |
| 18 | **Expand sameAs** in Organization schema (add TripAdvisor, Google Maps, WhatPub, CAMRA) | Low | 30 min | All |
| 19 | **Add containedInPlace** geographic hierarchy to LocalBusiness schema | Low | 30 min | All |
| 20 | **Validate all schema via Rich Results Test** — homepage, event page, drinks, food menu, blog post | High | 1 hr | All |

### WAVE 3 — Content & Internal Linking (Month 1-2) — Drives New Traffic

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 21 | **Create /about page** — pub history (est. 1751), team, awards, 5-star hygiene. Critical for E-E-A-T and AI citation. | High | 3 hrs | All |
| 22 | **Resolve food-menu ↔ sunday-lunch cannibalisation** — remove full Sunday Roast content section from /food-menu, replace with summary card linking to /sunday-lunch | High | 1 hr | P1 Food |
| 23 | **Enrich /private-hire hub** — add FAQ section, testimonials, pricing guidance, capacity table, real event photos | High | 3 hrs | P2 Private Hire |
| 24 | **Enrich /function-room-hire and /corporate-events** — room specs, capacity table, case studies, pricing bands | High | 3 hrs | P2 Private Hire |
| 25 | **Enrich /live-sport** — fixture schedule, photos of screens, "what we show" (terrestrial only) | Medium | 2 hrs | P3 Events |
| 26 | **Add cross-links** between /private-hire, /function-room-hire, and /corporate-events | Medium | 30 min | P2 Private Hire |
| 27 | **Add "definitive answer" first paragraphs** to key pages for AI citation (homepage, sunday-lunch, beer-garden, private-hire, food-menu) | Medium | 2 hrs | All |
| 28 | **Fix /private-hire image alt texts** — add "at The Anchor near Heathrow" to all six event-type card images | Medium | 30 min | P2 Private Hire |
| 29 | **Implement proper 404 page** — replace catch-all redirect to homepage with `notFound()` | Medium | 1 hr | All |
| 30 | **Create Offers & Deals hub page** — BOGOF pizza Tuesdays, Chip Shop Friday, over-65s discount | Medium | 2 hrs | P1 Food |

### WAVE 4 — Content Pruning & Consolidation (Month 2-3) — Reduces Crawl Budget Waste

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 31 | **Noindex 60-70 dead-weight blog posts** — seasonal, promotional, and cultural posts with zero impressions | High | 2 hrs | All |
| 32 | **Consolidate seasonal blog content** — merge 5 Christmas posts into one, same for Easter, Mother's Day | Medium | 3 hrs | All |
| 33 | **Consolidate location pages** — keep Staines, Feltham, Ashford, Colnbrook as standalone; merge 8+ others into "Areas We Serve" hub or noindex | High | 4 hrs | All |
| 34 | **Consolidate hotel pages** — merge 11 pages into /heathrow-hotels-pub hub with expandable sections; keep Sofitel, Premier Inn as standalone | High | 4 hrs | All |
| 35 | **Resolve URL overlaps** — /beer-garden vs /pub-garden-heathrow, /pubs-in-stanwell vs /stanwell-pub, /private-hire vs /private-party-venue | Medium | 2 hrs | All |
| 36 | **Verify /our-events redirects to /whats-on** (appears indexed but may not exist) | Medium | 15 min | All |

### WAVE 5 — New Content Creation (Month 2-4) — Captures New Search Traffic

Model all new content on the parking alternatives blog post pattern (6,080 impressions — the template that works: comparison tables, specific prices, transparent positioning).

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 37 | **"Complete Guide to Eating Near Heathrow Airport (2026)"** — compare airport, hotel, and pub options with price table | High | 4 hrs | P1 Food |
| 38 | **"Best Plane Spotting Locations at Heathrow (2026)"** — Anchor + Myrtle Ave + viewing area, with map and best times | High | 4 hrs | General traffic |
| 39 | **"Function Room Hire Near Heathrow: Pricing Comparison"** — compare Anchor vs hotel venues on price, parking, capacity | High | 4 hrs | P2 Private Hire |
| 40 | **"Dog-Friendly Walks Near Stanwell Moor: A Complete Guide"** — routes, distances, plus Anchor as base | Medium | 3 hrs | General traffic |
| 41 | **"Where to Host a Wake Near Heathrow"** — high intent, low competition | Medium | 3 hrs | P2 Private Hire |
| 42 | **"Heathrow Layover Guide: What To Do With 4-8 Hours"** — position Anchor as the obvious choice | Medium | 4 hrs | General traffic |
| 43 | **Create Reviews/Testimonials page** with embedded Google reviews and Review schema | Medium | 2 hrs | All |

### WAVE 6 — External Signals & Platform Presence (Month 2-4) — Builds Authority

| # | Action | Impact | Effort | Revenue Priority |
|---|--------|--------|--------|-----------------|
| 44 | **Register on venue aggregator platforms** — BigVenueBook, Tagvenue, Zipcube, Poptop, VenueScanner | High | 3 hrs | P2 Private Hire |
| 45 | **Build local citations** — submit to 20+ directories (Yell, TripAdvisor, Yelp UK, Apple Maps, DogFriendly.co.uk, WhatPub, etc.) | High | 4 hrs | All |
| 46 | **Audit/optimise Google Business Profile** — ensure categories are Pub + Restaurant + Event Venue; add GBP products for Sunday Roast, Function Room; pre-populate Q&A | High | 2 hrs | All |
| 47 | **Verify AI crawler access** — check Cloudflare isn't blocking GPTBot, PerplexityBot, ClaudeBot | Medium | 15 min | All |

### WAVE 7 — Technical Improvements (Ongoing)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 48 | Add HSTS header | Medium | 15 min |
| 49 | Defer GTM loading (requestIdleCallback or setTimeout) | Medium | 1 hr |
| 50 | Reduce robots.txt cache TTL from 1 year to 1 day | Low | 5 min |
| 51 | Use accurate lastModified dates in sitemap.ts | Low | 1 hr |
| 52 | Remove keywords meta tags (Google ignores them since 2009) | Low | 1 hr |
| 53 | Audit redirect chains across 550+ rules | Medium | 2 hrs |
| 54 | Re-enable removeConsole in production | Low | 5 min |

---

## Impact Forecast

### Conservative Estimates (Title + Meta + Internal Linking Only)

| Change | Extra Clicks/Month |
|--------|--------------------|
| Title tag rewrites on 8 underperforming pages | +114 |
| Homepage internal links to /sunday-lunch, /drinks, /quiz-night | +30 |
| Schema fixes (expired dates, EventSeries) enabling rich results | +50 |
| Blog pruning (crawl budget reallocation) | +20 |
| **Total Wave 1-4** | **+214 clicks/month** |

### Optimistic Estimates (All Waves Including New Content)

| Change | Extra Clicks/Month |
|--------|--------------------|
| Waves 1-4 (above) | +214 |
| New blog posts (5 comparison guides) | +200 |
| Venue aggregator listings driving private hire queries | +50 |
| Local citation building improving local pack visibility | +100 |
| AI search citations driving referral traffic | +30 |
| **Total All Waves** | **+594 clicks/month (~doubling current traffic)** |

---

## Key Metrics to Track

| Metric | Current | 3-Month Target | 6-Month Target |
|--------|---------|---------------|----------------|
| Organic clicks/month | ~207 | 350 | 500 |
| Overall CTR | 1.6% | 2.5% | 3.5% |
| Non-branded traffic share | ~15% | 25% | 35% |
| Indexed pages (target reduction) | 170+ | 120 | 100 |
| Blog posts with >10 clicks/month | 2 | 5 | 8 |
| /sunday-lunch CTR | 1.2% | 4% | 5% |
| /quiz-night CTR | 0.2% | 3% | 4% |
| Rich results impressions | 1,463 | 5,000 | 10,000 |

---

## Supporting Audit Reports

| Report | File |
|--------|------|
| Technical SEO | `docs/seo-audit/technical-seo-audit.md` |
| On-Page SEO | `docs/seo-audit/onpage-seo-audit.md` |
| Content & Local SEO | `docs/seo-audit/content-local-seo-audit.md` |
| AI Search Optimisation | `docs/seo-audit/ai-search-optimisation-audit.md` |
