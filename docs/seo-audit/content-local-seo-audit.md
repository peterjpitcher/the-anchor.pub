# Content & Local SEO Audit: The Anchor (the-anchor.pub)

**Date:** 20 March 2026
**Auditor:** Content & Local SEO Specialist
**Domain:** https://www.the-anchor.pub
**Business:** The Anchor, Horton Road, Stanwell Moor, Surrey TW19 6AQ

---

## Executive Summary

The Anchor's website is technically ambitious and well-structured, with strong schema markup, proper canonical URLs, and a solid internal linking strategy. However, the site suffers from three core problems that are limiting organic growth:

1. **Location page proliferation without differentiation** -- 30+ location/hotel-proximity pages follow a near-identical template, risking Google's doorway page policy and diluting crawl budget.
2. **Blog content sprawl** -- 100+ blog posts, many thin, seasonal, or outdated, with minimal traffic. The top-performing post (parking alternatives, 6,080 impressions) demonstrates the model that works, but most posts do not follow it.
3. **NAP inconsistency** -- the site uses two different email addresses (`manager@the-anchor.pub` in code, `info@theanchorpub.co.uk` in CLAUDE.md/external references), which can confuse citation consistency.

**Overall CTR of 1.6% is below the 3-5% benchmark for local businesses**, driven largely by title tags that are too long or not compelling enough at impression volume.

The positive trajectory (622 clicks vs 302 YoY) shows the foundation is working. The recommendations below focus on consolidation, content depth, and conversion optimisation.

---

## 1. Local SEO Assessment

### 1.1 NAP Consistency

**Name:** Generally consistent as "The Anchor" across the site. The `BRAND.name` constant enforces this. No instances of "The Anchor Pub" found in customer-facing copy (good adherence to brand guidelines).

**Address:** Consistent across all pages reviewed:
- Horton Road, Stanwell Moor, Surrey, TW19 6AQ, GB
- Coordinates: 51.462509, -0.502067
- All sourced from `lib/constants.ts`, ensuring consistency.

**Phone:** Consistent -- `01753 682707` / `+441753682707` used throughout.

**Email -- ISSUE FOUND:**
- `lib/constants.ts` declares `manager@the-anchor.pub`
- CLAUDE.md and some external references use `info@theanchorpub.co.uk`
- Both appear across blog posts, pages, and the footer
- **Impact:** Citation inconsistency can confuse Google's entity reconciliation

**Recommendation:** Standardise on one email address across all digital properties. If `manager@the-anchor.pub` is the operational address, update all references including GBP listing, social profiles, and directory citations.

### 1.2 Schema Markup (Structured Data)

**Strength: Excellent implementation.** This is one of the strongest aspects of the site.

- **Global schema** via `DynamicSchema` component in layout: Organisation, LocalBusiness (Restaurant + BarOrPub), WebSite
- **LocalBusiness schema** includes: address, geo coordinates, aggregateRating (dynamic from reviews), openingHoursSpecification (dynamic from API), amenityFeature, servesCuisine, priceRange, hasMenu, acceptsReservations
- **Per-page schema** on location pages: BarOrPub with areaServed, aggregateRating
- **FAQ schema** on most content pages via `FAQAccordionWithSchema`
- **Breadcrumb schema** via `BreadcrumbJsonLd` and `generateBreadcrumbSchema`
- **Event schema** on event pages (Music Bingo, Quiz Night)
- **ParkingFacility schema** on parking-related pages
- **TouristAttraction schema** on beer garden page
- **HowTo schema** for driving directions
- **Speakable schema** on key pages for voice search
- **Menu schema** with MenuSection on food pages

**Issues:**
- Each location page creates its own `BarOrPub` schema with a unique `@id` (e.g., `#business`). Having 30+ separate LocalBusiness entities for the same physical location could confuse Google. Consolidate to reference the primary `@id` from the global schema.
- The Feltham page schema names the business "The Anchor - Feltham's Local Pub" while the Ashford page uses "The Anchor - Near Ashford". These name variations may create entity confusion. Keep schema `name` as "The Anchor" consistently and use `areaServed` for location targeting.
- `nearbyAttractions` on the Sofitel page is not a valid schema.org property for Restaurant/BarOrPub.

### 1.3 Google Business Profile

The site references a 4.6/5 Google rating multiple times, with dynamic `aggregateRating` in schema pulled from review stats. This suggests an active GBP listing.

**Recommendations:**
- Ensure GBP primary category is "Pub" with secondary categories: "Restaurant", "Event Venue", "Function Room"
- GBP description should lead with food offerings (Priority 1) and mention Sunday lunch, private hire
- Add GBP products for: Sunday Roast, Function Room Hire, Heathrow Parking
- Post weekly GBP updates tied to events calendar (the management app data could automate this)
- Ensure GBP Q&A section is pre-populated with common questions (kitchen hours, dog policy, parking)

### 1.4 Local Citation Opportunities

**Priority citations to audit/create:**
- Yell.com
- Thomson Local
- Yelp UK
- TripAdvisor (critical for pub/restaurant)
- Foursquare/Swarm
- Apple Maps
- Bing Places
- Facebook business page (with correct NAP)
- Instagram business profile
- Surrey local directories (VisitSurrey, SurreyLife)
- Heathrow-specific directories (airport guides, hotel concierge lists)
- CAMRA Good Beer Guide
- Pub listing sites: whatpub.com, pubguide.co.uk

**High-value niche citations:**
- WeddingVenues.com / Hitched.co.uk (for private hire/weddings)
- FuneralGuide.co.uk (for wake venue)
- DogFriendly.co.uk / DoggiePubs.com (for dog-friendly positioning)
- ParkingNearAirports.co.uk (for parking service)

---

## 2. Content Quality -- E-E-A-T Assessment

### 2.1 Expertise & Experience Signals

**Strengths:**
- Sunday lunch page pulls live menu data from the management API, showing real prices, real dishes, and real cutoff times. This demonstrates operational authenticity.
- The parking alternatives blog post (top performer) contains a genuine price comparison table with specific figures, updated date, and transparent disclosure that The Anchor is one of the options. This is textbook helpful content.
- Business hours are pulled dynamically from the management system, showing real-time accuracy.
- Event pages pull live upcoming dates from the events API.
- Beer garden page has specific details (64 seats, planes every 90 seconds) that demonstrate first-hand knowledge.

**Weaknesses:**
- Author attribution is inconsistent. Some posts credit "Billy", others "The Anchor Team". Neither has an author page or bio establishing credentials.
- No staff photos, team page, or "about us" narrative. For E-E-A-T, Google wants to see real people behind the business.
- No customer testimonials or review excerpts embedded in page content (the schema has aggregateRating, but the content itself rarely quotes specific reviews).
- Blog images are often stock or placeholder (`hero.jpg`, `hero.png`). Posts like the dog-friendly pub and fish & chips guide would benefit enormously from actual photos of dogs at the pub, actual fish & chips plates served at The Anchor, etc.

### 2.2 Content Depth Assessment

| Page | Word Count (est.) | Depth | Verdict |
|------|------------------|-------|---------|
| Homepage | 800+ | Good | Strong hero, clear USPs, dynamic events. Could use more narrative/story. |
| Sunday Lunch | 600+ | Good | Live menu data, booking flow, prices. Excellent conversion page. |
| Food Menu | 500+ | Good | Dynamic menu from API with schema markup. |
| Near Heathrow | 700+ | Good | Terminal distances, food CTAs, FAQ. Strong hub page. |
| Beer Garden | 600+ | Good | Specific details (64 seats, 90-second intervals), unique angle. |
| Private Hire | 500+ | Adequate | Good overview with event type cards. Needs testimonials. |
| Wakes | 400+ | Adequate | Respectful tone, practical info. Could add "what to expect" guide. |
| Parking blog | 1500+ | Excellent | Comparison table, specific prices, genuinely helpful. Top performer for a reason. |
| Fish & chips blog | 800+ | Adequate | Mix of general knowledge and Anchor-specific. Slightly generic in middle sections. |
| Dog-friendly blog | 600+ | Thin risk | Generic "why dogs are great" padding. Needs real dog visitor stories, photos, specific walk routes with distances. |
| Sunday roast blog | 700+ | Good | Practical, menu-focused, Heathrow traveller tips. |

### 2.3 Content Authenticity Issues

- The dog-friendly blog mentions "Special doggy Sunday dinners available (ask staff)" and "Secure fencing" -- these are specific enough claims that they must be verified against actual operations. If false, this damages E-E-A-T.
- Several pages reference "Sunday roasts - beef, pork, chicken, or vegetarian" but the actual menu (from the API) lists chicken, lamb shank, pork belly, and butternut squash wellington. **Inconsistent menu references across pages reduce trust.**
- The `/docs/copy-assumptions.md` is referenced as the source of truth for operational claims, which is good practice. Ensure all pages are audited against it.

---

## 3. Location Page Strategy Assessment

### 3.1 Town Pages (feltham-pub, staines-pub, etc.)

**Count:** 13 town/area pages (ashford, bedfont, colnbrook, egham, feltham, horton, longford, staines, stanwell, sunbury, windsor, wraysbury, pubs-in-stanwell)

**Template pattern observed across all pages reviewed:**
1. Hero with "Your Local Pub Near [Town]" + identical badge strip (Free parking, 7 min from T5, Dog & family friendly, Super-fast fibre broadband, Rated 4.6/5)
2. "Why [Town] Residents Choose The Anchor" section
3. Driving directions from the town
4. "Perfect for [Town] Groups" section (work gatherings / weekend escapes)
5. Private events pitch
6. FAQ accordion
7. CTA section

**Verdict: HIGH RISK of doorway page classification.**

These pages share 70-80% identical content with only the town name swapped. Google's doorway pages policy specifically targets "multiple domain names or pages targeted at specific regions or cities that funnel users to one page." While each page does include unique driving directions (a differentiator), the core value proposition, feature lists, FAQs, and CTAs are substantially the same.

**Evidence of template repetition:**
- The `secondaryInfo` badge strip is character-for-character identical across feltham-pub, staines-pub, sofitel, and all other pages reviewed
- "Why [Town] Residents Choose The Anchor" bullet points are nearly identical across pages
- The same "Hosted nights like Music Bingo with Nikki Manfadge" text appears verbatim across multiple location pages
- FAQ questions follow the same pattern with only distance/town name swapped

**The Staines page is the strongest** because it uses constants from `lib/constants.ts`, has an `InternalLinkingSection`, and includes `getBusinessStats()` for dynamic review data. But even it follows the template closely.

**Recommendations:**
1. **Consolidate** the weakest-performing town pages into a single "Areas We Serve" hub page with a tab/accordion for each town (driving directions, distance, landmarks)
2. **Keep as standalone pages** only the 3-4 towns that have genuine search volume: Staines, Feltham, Ashford, and possibly Colnbrook (Poyle Industrial Estate worker audience)
3. For retained pages, add **genuinely unique content**: local landmarks near the route, "what [town] locals say about us" (real reviews mentioning the town), photos of regulars from that area (with permission), specific offers for that community
4. Add `noindex` or consolidate Windsor, Wraysbury, Sunbury, Egham, Longford, and Horton pages -- these towns are far enough away that the "pub near X" value proposition is weak

### 3.2 Hotel Proximity Pages (pub-near-sofitel-heathrow, etc.)

**Count:** 11 hotel pages (Sofitel, Premier Inn, Hilton, Marriott, Crowne Plaza, Novotel, Holiday Inn, Ibis, Radisson Blu, Travelodge, Renaissance)

**Verdict: MODERATE RISK but higher value than town pages.**

These pages serve a clearer user intent ("I'm staying at [hotel], where can I get a real pub meal?") and include:
- Specific taxi fare estimates
- Directions from each hotel
- Price comparison angle (pub vs hotel restaurant)
- Hotel-specific FAQs

The Sofitel page is the strongest example -- it has specific taxi fares (GBP 12-15), a "What Sofitel Guests Order" section, and business traveller considerations (VAT receipts).

**However**, the same template repetition problem applies. The hero badges, secondary info strip, and core value proposition are identical.

**Recommendations:**
1. Consolidate the 11 hotel pages into a **single hub page** at `/heathrow-hotels-pub` (which already exists but currently duplicates the same pattern)
2. The hub page should have an expandable section for each hotel with: specific directions, taxi fare, walking feasibility, and a custom map
3. Keep 2-3 standalone hotel pages for the highest-volume hotels (Sofitel T5, Premier Inn, Holiday Inn) if GSC data shows significant impressions
4. Add **hotel concierge card** content: "Show this to your concierge" with address, phone, and taxi instructions -- this is genuinely useful content that differentiates from competitors

### 3.3 Terminal Pages

**Count:** 5 (near-heathrow hub + terminal 2/3/4/5)

**Verdict: KEEP.** These serve clear, distinct user intent. Each terminal has genuinely different driving directions and journey times. The hub page at `/near-heathrow` is strong.

---

## 4. Content Gap Analysis

### 4.1 Missing Content -- Priority 1 (Food Revenue)

| Topic | Search Volume Signal | Why It Matters |
|-------|---------------------|----------------|
| **"Pub food near me" / "pub food near heathrow"** | High | No dedicated page targeting this exact query. The food-menu page targets menu-browsing intent, not discovery intent. |
| **"Where to eat near Heathrow Terminal [X]"** | High | The `/restaurants-near-heathrow` page exists but doesn't have terminal-specific sub-pages like the pub pages do. |
| **"Pizza near Heathrow" / "pizza delivery staines"** | Medium | The pizza-menu page exists but is menu-focused, not discovery-focused. A blog post about BOGOF Tuesday pizza could rank. |
| **"Pub lunch near me"** | High | No page specifically targets the lunchtime dining occasion. |
| **Weekly specials / deals page** | Medium | No central page for offers (BOGOF pizza Tuesdays, Chip Shop Fridays, etc.). This would attract price-sensitive local searchers. |
| **Dietary-specific pages** | Medium | No content targeting "vegetarian pub food near Heathrow", "gluten free pub near me", "vegan options near Heathrow". The menu has these options but no dedicated landing content. |
| **"Afternoon tea near Heathrow"** | Medium | If the pub could offer a simple afternoon tea package, this is a high-intent query with relatively low competition locally. |

### 4.2 Missing Content -- Priority 2 (Private Events)

| Topic | Why It Matters |
|-------|----------------|
| **"Affordable wedding venue Surrey"** | The weddings page exists but doesn't target price-conscious searchers. A "budget wedding reception near Heathrow" angle is underserved. |
| **"Office Christmas party venue near Heathrow"** | Corporate Christmas page exists but could be expanded with capacity details, package pricing, and photos from past events. |
| **Photo gallery of past events** | Critical E-E-A-T gap. No visual proof of successful events. A gallery page with real event photos (with permission) would massively boost private hire conversions. |
| **Testimonials page** | No dedicated testimonials/reviews page embedding Google reviews. This is a missed conversion asset. |
| **"Venue hire with parking near Heathrow"** | Parking is a massive USP for events. No page specifically targets this angle. |

### 4.3 Missing Content -- Priority 3 (Events)

| Topic | Why It Matters |
|-------|----------------|
| **"Things to do near Heathrow tonight"** | A blog post exists but could be a standalone page that dynamically pulls tonight's events from the management API. |
| **"Live music near Heathrow this weekend"** | The live-music page exists but is generic. Dynamic content showing upcoming dates would help. |
| **"Bingo near me" / "cash bingo near Heathrow"** | Cash bingo and music bingo pages exist. Ensure these rank for "near me" variants. |

### 4.4 Missing Structural Content

| Item | Impact |
|------|--------|
| **About Us / Our Story page** | Major E-E-A-T gap. No page tells the pub's history, introduces the team, or establishes why visitors should trust this business. |
| **Team/Staff page** | Builds trust. "Meet Billy" or "Meet our team" humanises the brand. |
| **Reviews/Testimonials page** | Conversion page that also builds E-E-A-T. Embed Google reviews with schema. |
| **Photo gallery** | Both for the pub generally and for events specifically. Real photos are the strongest E-E-A-T signal for a hospitality business. |
| **Offers & Deals hub** | Central page listing all current offers (BOGOF pizza, Chip Shop Friday, etc.) with dates. |

---

## 5. Competitor Landscape

### 5.1 Key Search Queries and Likely Competitors

For **"pubs near heathrow"**:
- The Three Magpies (Bath Road, Hayes) -- directly on airport perimeter
- The Pheasant (Stanwell) -- nearest village pub competitor
- Bedfont Lakes pubs -- serving similar catchment
- Various airport hotel bars (Sofitel, Hilton, etc.)

For **"sunday lunch staines"**:
- The Swan, Staines
- The Bells, Staines
- The George, Staines
- Various Staines High Street restaurants

For **"function room hire heathrow"**:
- Heathrow airport hotels (Sofitel, Hilton, Marriott) -- large event spaces
- De Vere Venues (Beaumont Estate)
- Runnymede on Thames Hotel
- Local community halls

### 5.2 Competitor Advantages

Based on common competitor patterns for local pubs:

| Competitor Pattern | The Anchor Status |
|-------------------|-------------------|
| TripAdvisor presence with 100+ reviews | Unknown -- should verify and actively manage |
| Photo-rich Google Business Profile | Unknown -- verify photo count vs competitors |
| Instagram with weekly food photos | Unknown -- not referenced on site |
| "Book now" on Google Maps | Likely yes (the booking flow exists) |
| Detailed menus on Google | Partially (schema has menu link) |
| Google Posts weekly | Unknown -- should implement |
| User-generated content (tagged photos) | No evidence of UGC strategy |

### 5.3 What Competitors Do That The Anchor Does Not

1. **Real event photography** -- most successful pub venues show photo galleries of actual events hosted. The Anchor's private hire pages use stock/placeholder images.
2. **Video content** -- short video tours of the venue, the beer garden with planes overhead, Sunday lunch preparation. This is a huge missed opportunity given the plane-spotting USP.
3. **Social proof embedding** -- competitors embed Instagram feeds, TripAdvisor widgets, or Google review carousels directly on pages.
4. **Menu PDFs alongside web menus** -- some searchers specifically want downloadable menus.
5. **Price transparency** -- the Sunday lunch page shows prices, but private hire pages have no indicative pricing. "Buffet from GBP 12pp" appears in the Feltham page but not on the main private hire page.

---

## 6. Blog Strategy Assessment

### 6.1 Performance Overview

**Total blog posts:** ~103
**Posts with meaningful traffic (estimated):**
- cheap-heathrow-parking-alternatives: 6,080 impressions (STAR PERFORMER)
- fish-chips-guide: 801 impressions
- best-sunday-roast-near-heathrow: 426 impressions
- dog-friendly-pub: 156 impressions, 0 clicks

**Estimated 95%+ of blog posts generate negligible organic traffic.**

### 6.2 Post Categories and Quality Assessment

| Category | Count (est.) | Quality | Recommendation |
|----------|-------------|---------|----------------|
| Evergreen guides (parking, fish & chips, sunday roast, dog-friendly) | 5-8 | Good to Excellent | **KEEP & IMPROVE.** These drive real traffic. |
| Seasonal/event posts (Christmas 2021, Easter weekend, St Patrick's 2023) | 30+ | Thin/Dated | **ARCHIVE or CONSOLIDATE.** Old dated posts with no search volume. |
| Drinks promotions (Kraken rum, Pravha beer, gin special) | 10+ | Thin | **ARCHIVE.** Time-limited offers with no evergreen value. |
| Community/fluff (Kindness Day, World Photography Day, Peace Day) | 10+ | Very thin | **ARCHIVE.** No search intent, no pub-specific value. |
| Sport updates (Euro 2024, Six Nations 2023, Premier League) | 5-8 | Dated | **ARCHIVE.** Already excluded from sitemap in some cases. |
| Informational/cultural (April Fools history, tequila & tradition, Day of Dead) | 5-8 | Thin | **ARCHIVE.** Generic content with no E-E-A-T signal. |
| Business-relevant guides (where to eat, British pub guide, hotel dining comparison) | 5-8 | Moderate | **IMPROVE.** These have potential but need depth and freshness. |

### 6.3 What Makes the Parking Post Succeed

The parking alternatives post (6,080 impressions) succeeds because:
1. It targets a **genuine informational query** with high volume ("cheap heathrow parking")
2. It provides a **comparison table** with real prices
3. It is **updated with a date** (February 2026)
4. It **transparently positions The Anchor** as one option among several
5. It has a **clear structure** (options 1-4 with pros/cons)
6. It links to the **conversion page** (booking wizard)

**This is the model every blog post should follow.**

### 6.4 Internal Linking from Blog to Conversion Pages

**Mixed.** The parking post links to `/heathrow-parking` (good). The Sunday roast post links to `/sunday-lunch` and `/book-table` (good). The fish & chips post links to `/food-menu` (good).

However, many older posts have **no internal links to conversion pages**. The community/cultural posts especially are dead-end content that neither ranks nor converts.

### 6.5 Blog Recommendations

1. **Prune aggressively.** Archive 60-70 posts that have zero impressions, zero clicks, and no evergreen value. Either `noindex` them or redirect to relevant parent pages.
2. **Consolidate seasonal content.** Instead of "Christmas 2021" + "Christmas 2022" + "Christmas events" + "Christmas market" + "Christmas venue" (5 posts!), create ONE authoritative "Christmas at The Anchor" page that is updated annually.
3. **Double down on what works.** Create more comparison/guide content in the mould of the parking post:
   - "Best Pubs Near Heathrow: A Local's Honest Guide" (mention competitors, position The Anchor authentically)
   - "Heathrow Layover Guide: What To Do With 4-8 Hours"
   - "Function Room Hire Near Heathrow: Pricing Comparison"
   - "Dog-Friendly Walks Near Stanwell Moor: A Complete Guide"
4. **Add publication dates and author bios.** Every post should show when it was written, when it was last updated, and who wrote it.
5. **Add real photos.** Replace stock images with actual photos from the pub.

---

## 7. Title Tag & Meta Description Audit

### 7.1 Title Tag Issues

| Page | Current Title | Issue |
|------|--------------|-------|
| Homepage | "The Anchor \| Pub Near Heathrow Airport \| Free Parking & Dog Friendly \| Stanwell Moor" | 82 characters -- truncated in SERPs. Too many pipes. |
| Layout default | "Traditional Bar Near Me \| The Anchor - Heathrow Pub & Dining \| Surrey Bar Near Heathrow" | 88 characters. "Bar" is inconsistent with brand (it's a pub). "Near Me" in title is pointless. |
| Near Heathrow | "Closest Pub to Heathrow Airport \| 7 Mins from Terminal 5 \| Free Parking \| The Anchor" | 85 characters -- truncated. |
| Sunday Lunch | "Sunday Roast Near Heathrow \| From GBP 19.99 \| Book by Saturday 1pm \| The Anchor" | 78 characters -- borderline. Price and urgency are strong. |

**Pattern:** Titles are consistently too long, trying to stuff multiple keywords. Google will truncate after ~55-60 characters.

**Recommendations:**
- Homepage: "The Anchor | Pub Near Heathrow Airport | Free Parking" (52 chars)
- Layout default: "The Anchor | Traditional Pub Near Heathrow" (42 chars)
- Use the description meta tag for secondary keywords instead of cramming them into titles

### 7.2 Meta Description Issues

Descriptions are generally well-written with clear value propositions and calls to action. The Sunday lunch description is particularly strong with price, booking deadline, and location. No major issues here beyond length management.

---

## 8. Technical SEO Notes (Content-Adjacent)

### 8.1 Crawl Budget Concerns

The site has **170+ indexable URLs** (79 app routes + 103 blog posts + dynamic event pages + tag pages). For a single-location pub, this is extremely large. Google may not crawl all pages efficiently.

**Recommendations:**
- Reduce indexable page count by 40-50% through blog pruning and location page consolidation
- Ensure `/robots.ts` excludes test/debug pages (test-gtm, test-hours, test-tracking, test-simple, test-reviews, test-navigation-tracking, debug-hours, demo-header, components)
- Review whether all 103 blog posts need to be in the sitemap

### 8.2 Canonical URL Implementation

Well-implemented. Each page sets its own `canonical` via `alternates.canonical`. The root layout correctly uses only `metadataBase` without a root canonical (avoiding the past bug documented in CLAUDE.md).

### 8.3 Content Duplication Risks

- The `/beer-garden` and `/pub-garden-heathrow` pages likely overlap significantly
- The `/dog-friendly-pub-heathrow` page and the `/blog/dog-friendly-pub` blog post compete for the same queries
- The `/heathrow-hotels-pub` hub page and the 11 individual hotel pages create self-competition
- The `/restaurants-near-heathrow` page and the `/food-menu` page may cannibalise for "food near heathrow" queries

---

## 9. Prioritised Action Plan

### Immediate (Week 1-2)

1. **Fix email NAP inconsistency.** Standardise on one email across all pages and citations.
2. **Audit and prune test/debug pages.** Ensure robots.txt or noindex prevents indexing of test-*, debug-*, demo-* routes.
3. **Shorten title tags** on the top 10 pages by traffic to under 60 characters.
4. **Add noindex to 60+ thin/dated blog posts** that have zero impressions.

### Short-term (Month 1-2)

5. **Create an About Us / Our Story page** with team photos, pub history, and community involvement.
6. **Create a Reviews/Testimonials page** embedding real Google reviews.
7. **Create an Offers & Deals hub page** listing all current promotions.
8. **Consolidate hotel pages** into the existing `/heathrow-hotels-pub` hub with expandable hotel-specific sections.
9. **Add real photography** to the top 5 traffic pages (homepage, near-heathrow, sunday-lunch, food-menu, beer-garden).

### Medium-term (Month 2-4)

10. **Consolidate location pages.** Keep Staines, Feltham, Ashford, Colnbrook as standalone. Merge the rest into an "Areas We Serve" page.
11. **Consolidate seasonal blog content.** One Christmas page, one Easter page, one Mother's Day page -- updated annually.
12. **Write 3-4 new evergreen blog posts** following the parking-post model:
    - "Dog Walks Near Stanwell Moor: A Complete Guide"
    - "Function Room Hire Near Heathrow: What to Expect and How Much It Costs"
    - "Best Pubs Near Heathrow: An Honest Local Guide"
    - "Heathrow Layover Guide: How to Spend 4-8 Hours Near the Airport"
13. **Build local citations.** Submit to the 20+ directories listed in section 1.4.

### Long-term (Month 4-6)

14. **Video content strategy.** Film a 60-second beer garden/plane spotting video, a Sunday lunch preparation video, and a private hire venue tour. Embed on relevant pages and upload to YouTube with local SEO metadata.
15. **UGC strategy.** Create a branded hashtag, encourage tagged photos, and embed a social feed on the site.
16. **GBP automation.** Use the management app's event data to auto-post weekly Google Business Profile updates.
17. **Competitor citation audit.** Check which directories competitors appear in and fill gaps.

---

## 10. Key Metrics to Track

| Metric | Current | 3-Month Target | 6-Month Target |
|--------|---------|---------------|----------------|
| Organic clicks/month | ~207 (622/3 months) | 350 | 500 |
| Overall CTR | 1.6% | 2.5% | 3.5% |
| Non-branded impressions | ~15% of total | 25% | 35% |
| Indexed pages (target reduction) | 170+ | 120 | 100 |
| Blog posts driving >10 clicks/month | ~2 | 5 | 8 |
| GBP actions/month | Unknown | Baseline +20% | Baseline +40% |

---

## Appendix A: Pages Reviewed

- `/app/page.tsx` (homepage)
- `/app/layout.tsx` (root layout with global schema)
- `/app/feltham-pub/page.tsx`
- `/app/staines-pub/page.tsx`
- `/app/ashford-pub/page.tsx`
- `/app/colnbrook-pub/page.tsx`
- `/app/pub-near-sofitel-heathrow/page.tsx`
- `/app/near-heathrow/page.tsx`
- `/app/sunday-lunch/page.tsx`
- `/app/food-menu/page.tsx`
- `/app/private-hire/page.tsx`
- `/app/private-hire/wakes/page.tsx`
- `/app/private-hire/near/[slug]/page.tsx`
- `/app/music-bingo/page.tsx`
- `/app/quiz-night/page.tsx`
- `/app/corporate-events/page.tsx`
- `/app/function-room-hire/page.tsx`
- `/app/beer-garden/page.tsx`
- `/app/restaurants-near-heathrow/page.tsx`
- `/app/heathrow-hotels-pub/page.tsx`
- `/app/find-us/page.tsx`
- `/app/sitemap.ts`
- `/components/seo/DynamicSchema.tsx`
- `/components/layout/Footer.tsx`
- `/lib/constants.ts`
- `/lib/schema-with-reviews.ts`
- `/content/blog/cheap-heathrow-parking-alternatives/index.md`
- `/content/blog/best-sunday-roast-near-heathrow/index.md`
- `/content/blog/dog-friendly-pub/index.md`
- `/content/blog/fish-chips-guide/index.md`

## Appendix B: Email Inconsistency -- Files Affected

44 files reference either `manager@the-anchor.pub` or `info@theanchorpub.co.uk`. Key files:
- `lib/constants.ts` -- uses `manager@the-anchor.pub`
- `CLAUDE.md` -- references `info@theanchorpub.co.uk`
- Multiple blog posts, page components, and the footer reference one or both
