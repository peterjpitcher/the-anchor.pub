# SEO Improvement Plan — The Anchor Pub
**Generated:** 2026-03-02
**Data source:** Google Search Console (3-month window: Dec 2025 – Feb 2026)

---

## Current State Snapshot

| Metric | Value | Benchmark | Gap |
|--------|-------|-----------|-----|
| Total clicks (3mo) | 1,470 | — | baseline |
| Total impressions (3mo) | 84,600 | — | baseline |
| Average CTR | **1.7%** | 3–8% for local | **Critical** |
| Average position | **17.6** | <10 for page 1 | **Critical** |
| Pages indexed | 315 | — | baseline |
| Pages NOT indexed | **471** | 0 | **Critical** |
| Core Web Vitals | 84 good / 0 poor | all good | ✅ OK |

**The core problem:** The site has excellent impression volume (84k+) but converts at only 1.7% CTR because average position is 17.6 — most pages live on page 2. The strategy is to (a) push pages from positions 8–20 onto page 1 and (b) dramatically improve CTR for pages already visible.

---

## Top Pages — Opportunity Analysis

| Page | Clicks | Impressions | CTR | Position | Priority |
|------|--------|-------------|-----|----------|----------|
| `/` (homepage) | 570 | 13,997 | 4.1% | 14.8 | 🔴 Critical |
| `/beer-garden` | 216 | 7,519 | 2.9% | 8.6 | 🔴 Critical |
| `/food-menu` | 57 | 5,797 | 1.0% | 10.2 | 🔴 Critical |
| `/near-heathrow` | 39 | 4,384 | 0.9% | 10.9 | 🔴 Critical |
| `/near-heathrow/terminal-5` | 31 | 3,266 | 0.9% | 21.6 | 🟠 High |
| `/blog/fish-chips-guide` | 42 | 2,851 | 1.5% | 7.9 | 🟠 High |
| `/near-heathrow/terminal-3` | 29 | 2,083 | 1.4% | 15.0 | 🟠 High |
| `/plane-spotting-heathrow` | 35 | 2,135 | 1.6% | 8.5 | 🟡 Medium |
| `/sunday-lunch` | 36 | 2,004 | 1.8% | 9.0 | 🟡 Medium |
| `/blog/best-sunday-roast-near-heathrow` | 43 | 974 | 4.4% | 7.3 | 🟡 Medium |

### Quick-win CTR potential
If we move these 4 pages from current CTR to just 4%:
- Homepage: +560 clicks/quarter
- Beer garden: +75 clicks/quarter
- Food menu: +174 clicks/quarter
- Near Heathrow: +132 clicks/quarter
- **Total uplift: ~941 extra clicks/quarter (+64%)**

---

## Top Queries — Opportunity Analysis

| Query | Clicks | Impressions | CTR | Position | Action |
|-------|--------|-------------|-----|----------|--------|
| "the anchor pub" | 14 | **1,176** | 1.2% | 7.8 | Push to pos 1–3 |
| "pubs near heathrow" | 5 | **258** | 1.9% | 11.0 | Push to pos 5–8 |
| "pubs near me" | 5 | **136** | 3.7% | 16.4 | Improve signals |
| "the anchor" | 28 | **450** | 6.2% | 13.8 | Brand push |
| "food menu heathrow" | — | high | low | 10–20 | Optimise page |
| "beer garden near heathrow" | — | high | low | 8–12 | Optimise page |

---

## Indexing Issues Breakdown

| Reason | Pages | Action |
|--------|-------|--------|
| Page with redirect | **226** | Remove from sitemap; fix internal links |
| Blocked by robots.txt | **99** | Audit — unblock any legitimate pages |
| Crawled - not indexed | **60** | Thin content audit; merge or improve |
| Not found (404) | **34** | Fix or 301-redirect to live pages |
| Alternative page (canonical) | **15** | Fix canonical tags |
| Redirect error | **7** | Fix self-redirect loops (tag pages) |
| Discovered - not indexed | **25** | Improve content quality |
| Excluded by noindex | **3** | Review — intentional? |
| **Total wasted crawl budget** | **471** | |

---

## Aggressive Action Plan

### TIER 1 — Immediate Impact (Week 1–2)

#### 1.1 Title & Meta Description Overhaul (CTR fix)
**Impact:** Estimated +40–60% CTR uplift on target pages
**Effort:** Medium

Current titles are generic. Rewrite with:
- Unique value propositions (free parking, dog-friendly, under the flight path)
- Local geo modifiers (Stanwell Moor, near Heathrow, Surrey)
- Action words (Visit, Book, Enjoy)
- Numbers where possible (20-space car park, 250-capacity)

**Pages to rewrite first:**

| Page | Current Title | New Direction |
|------|---------------|---------------|
| `/food-menu` | `Food Menu \| The Anchor...` | `Pub Food Menu Near Heathrow \| Burgers, Pizza & British Classics \| Free Parking` |
| `/near-heathrow` | `Near Heathrow \| The Anchor...` | `Pub Near Heathrow Airport \| 5 Mins from T2, T3, T4 & T5 \| Free Parking \| The Anchor` |
| `/beer-garden` | `Beer Garden \| The Anchor...` | `Dog-Friendly Beer Garden Near Heathrow \| 64 Seats Under the Flight Path \| The Anchor` |
| `/near-heathrow/terminal-5` | `Near Terminal 5 \| The Anchor...` | `Pub Near Heathrow Terminal 5 \| 5 Min Taxi \| Free Parking & Dog Friendly` |
| `/near-heathrow/terminal-3` | `Near Terminal 3 \| The Anchor...` | `Pub Near Heathrow Terminal 3 \| Layover Dining \| Free Parking \| The Anchor Stanwell Moor` |
| `/sunday-lunch` | `Sunday Lunch \| The Anchor...` | `Sunday Roast Near Heathrow \| Traditional British Lunch \| Book a Table \| The Anchor` |

**Meta descriptions must include:**
- Clear USP in first 100 characters
- Call to action ("Book a table", "Visit us", "Free parking available")
- Local signal ("5 mins from Heathrow", "Stanwell Moor, Surrey")

#### 1.2 Fix 226 "Page with Redirect" in Indexing
**Impact:** Recovers crawl budget; allows Google to focus on real pages
**Effort:** Medium

These are legacy URLs (Wix-era blog, `/post/*`, `/blog/page/*`, drinks paths) that are in GSC's awareness but return redirects. Actions:
- Audit the 226 URLs: export from GSC, identify patterns
- Remove ALL redirect-source URLs from `sitemap.ts`
- Remove any internal links pointing to redirect URLs
- Ensure redirect chains are max 1 hop (source → destination, not source → intermediate → destination)

#### 1.3 Fix 34 Not Found (404) Pages
**Impact:** Stops crawl budget waste; removes negative quality signals
**Effort:** Low

Known patterns (from `docs/gsc-page-indexing-audit.md`):
- `/blog/hashtags/*` — add wildcard catch-all redirect to `/blog`
- `/events/quiz-night`, `/events/bingo-night` etc — add 301 redirects in `additional-redirects.json`
- `/post/*` slugs that no longer have matching `/blog/*` — add to `blog-redirects.json`

#### 1.4 Fix 7 Redirect Errors (Self-redirect loops)
**Impact:** Fixes broken signals for tag pages
**Effort:** Low

Known pattern: `/blog/tag/premier-league` → `/blog/tag/sports` → (self-redirect on canonical tag hub). Fix: ensure tag hub pages do not canonicalise to themselves via redirect chains in `tag-redirects.json`.

---

### TIER 2 — Position Improvements (Week 2–4)

#### 2.1 Homepage Authority Push
**Target:** Position 14.8 → sub-5 for "pub near Stanwell Moor / Heathrow"
**Impressions:** 13,997 | CTR uplift from pos 5: ~8% = 1,120 clicks/quarter

The homepage is ranking at 14.8 on average. Root causes:
- Title doesn't lead with the primary geographic USP
- Content doesn't signal enough E-E-A-T (experience, expertise, authority, trust)
- Insufficient internal links pointing to homepage with rich anchor text
- Schema may not be fully surfacing in SERPs

Actions:
- Rewrite homepage `<h1>` to lead with geo: "The Anchor — Pub Near Heathrow Airport in Stanwell Moor, Surrey"
- Add a "Why Visit" summary section with explicit keyword mentions: free parking, dog-friendly, beer garden, traditional British food, near Heathrow T2 T3 T4 T5
- Add FAQ section on homepage answering: "Is there a pub near Heathrow?", "Where can I park near Heathrow?", "Is The Anchor dog-friendly?"
- Add FAQ JSON-LD schema to homepage
- Improve Review schema — ensure aggregate rating is prominent and uses actual review count

#### 2.2 `/food-menu` Page — Position + CTR Fix
**Target:** Position 10.2 → sub-5 | CTR 1% → 4%
**Impressions:** 5,797 | Potential uplift: +175 clicks/quarter

This page has the third-highest impression count but the worst CTR (1%). People are searching for food near Heathrow and seeing us at position 10 but not clicking.

Actions:
- Rewrite title (see 1.1 above)
- Add compelling meta description with USP + price signal: "From £8.99 burgers to handmade pizza. Traditional British pub food 5 mins from Heathrow. Free parking. Book online."
- Add `MenuItem` schema for key items (burger, pizza, Sunday roast)
- Add "Popular dishes" section with photos to improve dwell time
- Add FAQ: "Does The Anchor do food?", "What food is available near Heathrow?", "Do you do Sunday roast?"

#### 2.3 `/beer-garden` Page — Position Push
**Target:** Position 8.6 → sub-5 | CTR 2.9% → 5%
**Impressions:** 7,519 | Potential uplift: +150 clicks/quarter

Second-highest impression page. Already ranking reasonably but needs page-1 placement.

Actions:
- Rewrite title and meta to lead with "dog-friendly" and "under the flight path" (unique differentiators)
- Add explicit capacity information: "64 outdoor seats", "heated area available"
- Mention seasonal features: patio heaters, shade, summer BBQ
- Add rich image markup with descriptive alt text
- Consider adding a "Beer Garden FAQ" section
- Link to beer garden from homepage hero section (strengthen internal link equity)

#### 2.4 `/near-heathrow` Cluster — Position + CTR
**Target cluster pages:**
- `/near-heathrow` — pos 10.9, 4,384 imp → aim for pos 5
- `/near-heathrow/terminal-5` — pos 21.6, 3,266 imp → aim for pos 10
- `/near-heathrow/terminal-3` — pos 15.0, 2,083 imp → aim for pos 8

These pages have strong impressions but terrible CTR. Root cause: they likely appear for generic queries where the title doesn't give users a clear reason to click.

Actions:
- Update titles with taxi time + free parking (e.g., "Pub Near Heathrow Terminal 5 | 5 Min Taxi, Free Parking")
- Add structured taxi journey information to each terminal page
- Build inter-linking between terminal pages (T5 links to T3, T2, T4, etc.)
- Add LocalBusiness schema to each terminal sub-page
- Add "How to get here from Terminal X" section with step-by-step instructions
- Ensure each page has unique content (not near-duplicate)

---

### TIER 3 — Content Strategy (Month 2–3)

#### 3.1 Target "the anchor pub" — Push to Position 1
**Current:** Position 7.8 with 1,176 impressions → 14 clicks
**Potential at pos 1:** ~300 clicks/quarter (25% CTR)

This is a brand query where we should own position 1. The fact that we're at 7.8 suggests competitor pages or directory listings are outranking us for our own brand name.

Actions:
- Audit who ranks above us for "the anchor pub" — are directories (Yelp, Google Business, Tripadvisor) outranking?
- Ensure Google Business Profile is fully optimised (photos, posts, Q&A, recent reviews)
- Add homepage structured data: `sameAs` links to all directories
- Strengthen brand signals: ensure consistent NAP (Name, Address, Phone) across all directories

#### 3.2 Address 60 "Crawled — Not Indexed" Pages
**Impact:** Unlock potentially rankable pages
**Effort:** High

Google crawled these pages but decided they weren't worth indexing. Common causes:
- Thin content (< 300 words)
- Near-duplicate with another page
- Low E-E-A-T signals

Actions:
- Export the 60 URLs from GSC
- Categorise: location pages, blog posts, event pages, other
- For location pages: add min 400 words of unique local content per page
- For blog posts: merge thin posts into cornerstone articles; 301-redirect merged posts
- For event pages: ensure past events are either redirected or properly archived

#### 3.3 New Content — High-Value Keyword Gaps
Based on query data, these topics get impressions but we lack strong dedicated pages:

| Target Query | Impressions | Action |
|-------------|-------------|--------|
| "Sunday roast near Heathrow" | ~500+ | Strengthen `/sunday-lunch` + blog post |
| "dog friendly pub near Heathrow" | ~300+ | Dedicated `/dog-friendly` page or add to beer garden page |
| "where to eat near Heathrow before flight" | ~200+ | Blog post + `/heathrow-layover-dining` refresh |
| "quiz night near Heathrow" | ~150+ | `/whats-on/quiz-night` page + FAQ schema |
| "beer garden near Heathrow" | ~400+ | Strengthen `/beer-garden` with Heathrow proximity angle |
| "plane spotting pub" | ~200+ | Strengthen `/plane-spotting-heathrow` |

#### 3.4 Internal Linking Improvement
The site has 356 pages generating traffic but likely poor internal link equity distribution.

Actions:
- Audit top-10 pages — ensure each has 5+ internal links from relevant pages
- Add contextual links from high-authority pages (homepage, blog posts) to key money pages (`/food-menu`, `/book-table`, `/beer-garden`)
- Create a topic cluster structure:
  - Hub: `/near-heathrow` → Spokes: terminal pages, parking, layover dining
  - Hub: `/food-menu` → Spokes: pizza, burgers, sunday lunch, drinks
  - Hub: `/whats-on` → Spokes: quiz night, bingo, drag shows, karaoke

#### 3.5 Review Schema & Rich Snippets
The site already has schema but rich snippets may not be triggering.

Actions:
- Verify `AggregateRating` schema is being properly served (check GSC Search Appearance tab)
- Add `FAQ` schema to top 10 pages (GSC shows FAQ rich results improve CTR by 20–30%)
- Add `Event` schema for all upcoming events (quiz night, bingo, drag shows) — events appear in Google's event carousel
- Add `BreadcrumbList` schema to all deep pages
- Add `HowTo` schema to layover dining and plane-spotting pages

---

### TIER 4 — Technical Hygiene (Ongoing)

#### 4.1 Sitemap Audit
- Remove all redirect-source URLs from `sitemap.ts`
- Remove past events that have no search value
- Ensure all 315 indexed pages are in the sitemap
- Add any missing important pages

#### 4.2 robots.txt Review (99 pages blocked)
- Export the 99 blocked URLs from GSC
- Confirm all are intentionally blocked
- The following should be blocked: `/api/*`, `/_next/*`, debug routes
- The following should NOT be blocked: any content pages, service pages, blog posts

#### 4.3 Canonical Cleanup (15 pages)
- Identify the 15 "Alternative page with proper canonical tag" pages
- These are likely parameterised variants or staging URLs
- Ensure canonical on each points to the correct canonical URL

#### 4.4 Crawl Budget Optimisation
- 226 redirect pages waste ~40% of crawl budget on non-indexable content
- Fix redirects (Tier 1.2) frees crawl budget for the 471 non-indexed pages
- After fix, submit updated sitemap via GSC

---

## Implementation Priority Order

```
Week 1:
  [ ] 1.1 Rewrite titles & meta for top 10 pages (biggest CTR wins)
  [ ] 1.4 Fix 7 redirect errors (fast, low effort)
  [ ] 1.3 Fix 34 404 pages (add missing redirects)

Week 2:
  [ ] 1.2 Audit & clean 226 "page with redirect" from sitemap
  [ ] 2.1 Homepage content improvements (h1, FAQ section, schema)
  [ ] 2.2 /food-menu content + schema improvements

Week 3:
  [ ] 2.3 /beer-garden content & title improvements
  [ ] 2.4 /near-heathrow cluster — titles, content, inter-linking
  [ ] 4.2 Review robots.txt — unblock any legitimate pages

Week 4:
  [ ] 3.1 Google Business Profile audit
  [ ] 3.5 Add FAQ schema to top 10 pages
  [ ] 4.1 Sitemap audit & cleanup

Month 2:
  [ ] 3.2 Crawled-not-indexed audit — thin content fixes
  [ ] 3.3 New content for keyword gaps
  [ ] 3.4 Internal linking audit & improvements

Month 3:
  [ ] Full re-audit against baseline
  [ ] Validate improvements in GSC
  [ ] Identify next set of opportunity pages
```

---

## Success Metrics

Track monthly against 3-month baseline:

| Metric | Current | 3-month target | 6-month target |
|--------|---------|----------------|----------------|
| Total clicks | 1,470 | 2,500 (+70%) | 4,000 (+172%) |
| Average CTR | 1.7% | 3.0% | 4.5% |
| Average position | 17.6 | 12.0 | 8.0 |
| Pages indexed | 315 | 400 | 450+ |
| Pages not indexed | 471 | 300 | 150 |
| Homepage position | 14.8 | 8.0 | 5.0 |
| /food-menu position | 10.2 | 6.0 | 4.0 |
| /beer-garden position | 8.6 | 5.0 | 3.0 |
| /near-heathrow position | 10.9 | 7.0 | 5.0 |

---

## What Is NOT the Problem

- **Core Web Vitals** — 84 good URLs, 0 poor. Do not waste time here.
- **HTTPS / Security** — Clean.
- **Canonical URLs** — Correctly implemented (relative paths with metadataBase).
- **Schema breadth** — Already comprehensive. Needs expansion for FAQ/Event, not a rebuild.
- **Redirect infrastructure** — Config is correct. Problem is redirect URLs appearing in GSC crawl pool, not the redirects themselves.
