# SEO Growth Roadmap -- The Anchor

**Date:** 22 March 2026
**Version:** 1.0 (Consolidated from 9 specialist agents across 4 phases)
**Valid for:** March 2026 -- September 2026 (6-month horizon)
**Owner:** Pub Manager / Orange Jelly Digital Team

---

## Executive Summary

The Anchor website generates 622 organic clicks/month with a 1.6% CTR from 39,040 impressions -- roughly half the traffic its current visibility should deliver. The site ranks well for niche queries (plane spotting, quiz night, pub near Heathrow) but is actively undermined by three systemic problems: (1) title tags and meta descriptions that describe features instead of selling benefits, suppressing CTR on pages with thousands of impressions; (2) four pairs of cannibalising pages that split link equity and confuse Google; and (3) Cloudflare blocking all AI crawlers, rendering the site's llms.txt and AI search investments worthless.

The biggest commercial opportunities are: enriching the private hire page cluster (currently invisible against hotel competitors), publishing 3-5 comparison-format blog posts in a proven high-traffic template, and registering on venue aggregator platforms where The Anchor has zero presence. Combined with CTR fixes and content pruning, these actions should deliver 1,000+ organic clicks/month within 3 months and 1,500+ within 6 months -- a 141% increase.

The total code work is estimated at 38-53 hours across 14 PRs over 4-6 weeks, with an additional 14-20 hours of non-code tasks (Cloudflare settings, directory registrations, content writing) over 2-3 months.

---

## Strategic Direction

### Business Goals and SEO Alignment

| Business Priority | SEO Lever | Primary Pages |
|---|---|---|
| 1. Food revenue | CTR improvement on /food-menu and /sunday-lunch; resolve cannibalisation | /sunday-lunch, /food-menu, /restaurants-near-heathrow |
| 2. Private hire bookings | Content enrichment (pricing, testimonials); venue aggregator listings | /private-hire, /function-room-hire, /corporate-events |
| 3. Event bookings | Schema deployment; title/meta rewrites | /quiz-night, /music-bingo, /cash-bingo, /whats-on |
| 4. Heathrow parking | "Park and eat" niche positioning; blog content | /heathrow-parking, blog posts |
| 5. Drinks-led footfall | Defend experiential USP pages | /beer-garden, /plane-spotting-heathrow, /dog-friendly-pub-heathrow |

### Where This Site Can Win

**Own outright (position 1-3, defend):** plane spotting heathrow (1,600 vol), quiz night near heathrow (90 vol), beer garden near heathrow (210 vol), dog friendly pub near heathrow (170 vol), pub in stanwell moor (90 vol).

**Win with effort (position 3-10, capture):** pub near heathrow (1,300 vol), best sunday roast staines (210 vol), function room hire staines (170 vol), christmas party venue heathrow (390 vol), music bingo near me (260 vol), food near heathrow outside airport (90 vol).

**Build authority (new content needed):** things to do near heathrow (480 vol), heathrow plane spotting locations (320 vol), heathrow layover what to do (170 vol), small party venue near heathrow (50 vol).

**Do NOT chase:** restaurants near heathrow (2,400 vol -- TripAdvisor/OpenTable unbeatable), cheap heathrow parking (6,600 vol -- commercial operators dominate), wedding venue surrey (hotels with 200+ capacity own this), live music staines (The London Stone dominates).

### Priority Framework

Every recommendation in this roadmap is scored on:
- **Commercial impact:** Does it drive bookings, enquiries, or footfall?
- **Confidence:** How many agents flagged it? (2+ agents = high confidence)
- **Effort:** Web Developer feasibility estimates from Phase 4
- **Dependencies:** What must be done first?

Items are assigned a decision: **DO NOW**, **SCHEDULE**, **MONITOR**, or **REJECT**.

### Competitive Position

| Arena | Position | Key Competitor | Strategy |
|---|---|---|---|
| "Pub near Heathrow" | Strong (pos 3-5) | Three Magpies (Greene King) | Defend with CTR improvement and rich results |
| "Sunday roast local" | Strong locally, weak regionally | The Bells (Staines) | Enrich page content, reviews, photos |
| "Plane spotting" | Dominant (pos 1-3) | No real competitor | Defend and expand with guide content |
| "Quiz/entertainment" | Dominant (pos 1-2) | London Stone (different niche) | Defend, EventSeries schema deployed |
| "Private hire/venue" | Weak (pos 15-25) | Hotels + aggregators | Target small/intimate niche, get listed on aggregators |
| "Heathrow parking" | Marginal | Commercial operators | Niche "park and eat" angle only |
| "Dog-friendly pub" | Strong (pos 1-3) | No local competitor | Defend, add blog content |

**Key competitive insight:** The Anchor's permanent structural advantage is that Greene King's Three Magpies cannot create unique landing pages, blog content, or community content from a subdirectory on a corporate domain. The Ostrich Inn's heritage advantage (900 years of history) cannot be matched -- compete on experience, entertainment, and convenience instead.

---

## Current Performance Baseline

### Organic Visibility

| Metric | Baseline (March 2026) | 3-Month Target | 6-Month Target |
|---|---|---|---|
| Monthly organic clicks | 622 | 1,000 (+61%) | 1,500 (+141%) |
| Monthly impressions | 39,040 | 50,000 (+28%) | 65,000 (+66%) |
| Overall CTR | 1.6% | 3.0% | 4.0% |
| Mobile avg position | 13.07 | 10.0 | 8.0 |
| Desktop avg position | 22.35 | 16.0 | 12.0 |
| Indexed page count | ~195 | 130 | 110 |
| Rich result impressions | 1,463 | 5,000 | 10,000 |
| Non-branded traffic share | ~15% | 30% | 40% |
| Referring domains | 15-20 | 30-35 | 40-50 |
| Venue aggregator listings | 0 | 3-4 | 6 |

### Top Performing Content

| Page | Clicks/Month | Impressions | CTR | Revenue Link |
|---|---|---|---|---|
| / (homepage) | 214 | ~5,000 | 4.3% | Brand entry point |
| /beer-garden | 86 | ~2,500 | 3.4% | Footfall (experiential USP) |
| /plane-spotting-heathrow | 27 | ~1,200 | 2.3% | Footfall |
| /heathrow-parking (blog) | 21 | 6,080 | 0.35% | Parking revenue |
| /sunday-lunch (blog) | 19 | ~900 | 2.1% | PRIMARY food revenue |

### Underperforming Areas

| Page | Impressions | CTR | Problem | Flagged By |
|---|---|---|---|---|
| /near-heathrow | 1,762 | 0.7% | Title too long, no value proposition | Strategy, Copywriter, Analytics |
| /food-menu | 1,642 | 1.0% | Generic title, awkward H1 | Strategy, Copywriter, Editor |
| /live-sport | 986 | 1.1% | F1 page claims Sky Sports (false) | Editor (CRITICAL) |
| /sunday-lunch | 774 | 1.2% | Cannibalised by /food-menu | Strategy, Content, Copywriter |
| /drinks | 551 | 0.2% | Generic title | Strategy, Copywriter |
| /quiz-night | 431 | 0.2% | Weekly/monthly contradiction in metadata | Copywriter, UX/CRO |
| /private-hire cluster | ~1,500 | 0.3% | No pricing, no testimonials, invisible vs hotels | All 9 agents |

---

## Key Findings by Discipline

### Technical SEO

**Top findings (7 agents cross-referenced):**

1. **Cloudflare blocks ALL AI crawlers** (CRIT-1). GPTBot, ClaudeBot, Google-Extended all receive `Disallow: /`. The llms.txt file, SpeakableSpecification schemas, and definitive-answer paragraphs are all wasted until this is fixed. **5-minute Cloudflare dashboard change.** Flagged by: Technical SEO, Strategy.

2. **Four cannibalisation pairs still active** with self-canonicals and sitemap entries: /pub-garden-heathrow vs /beer-garden, /private-party-venue vs /private-hire, /pubs-in-stanwell vs /stanwell-pub, /food-menu vs /sunday-lunch (content overlap). **30 minutes to add redirects.** Flagged by: Technical SEO, Content Strategy, Copywriter, Editor, UX/CRO.

3. **BreadcrumbList schema deployed on only 28 of 100+ pages.** The component exists but is not imported on 75+ pages. An auto-breadcrumb component could solve this systemically. Flagged by: Technical SEO, Content Strategy.

4. **Duplicate viewport meta tag on every page.** One-line fix in root layout. Flagged by: Technical SEO.

5. **560+ redirect rules with no chain audit.** Potential for A->B->C chains wasting crawl budget. Flagged by: Technical SEO, Web Developer.

6. **`keywords` meta tag on 88 files.** Google has ignored this since 2009. Wasted bytes and reveals strategy to competitors. Flagged by: Technical SEO, Editor, Web Developer.

### Content & Keywords

**Top findings:**

1. **Private hire is the biggest content gap.** No pricing table, no testimonials, no hotel comparison, no "small party" positioning. Every agent flagged this. The Anchor is invisible in venue searches where hotels dominate. Getting listed on 5 venue aggregator platforms would transform private hire discovery overnight.

2. **Comparison/guide blog posts are the proven format.** The parking alternatives post (6,080 impressions) proves that price comparison content works. Three new posts targeting food near heathrow, function room pricing, and plane spotting locations are projected to add 160-280 clicks/month.

3. **60-70 deadweight blog posts dilute crawl budget.** Past seasonal promos, cultural posts with no pub connection, and expired offers have zero impressions and should be noindexed (not deleted -- reversible).

4. **Hotel and location doorway pages need consolidation.** 8 hotel pages into /heathrow-hotels-pub hub (keep Sofitel and Premier Inn standalone). 5-7 low-value location pages noindexed.

5. **Food menu / sunday lunch cannibalisation.** The /food-menu page contains sunday roast content that competes with the dedicated /sunday-lunch page. Replace with a summary card linking to /sunday-lunch.

### Authority & Backlinks

**Top findings:**

1. **Zero venue aggregator listings.** Every Heathrow hotel is on 5+ platforms; The Anchor is on zero. BigVenueBook, Tagvenue, ChooseYourVenue, VenueScanner, Poptop, Hire Space -- all free listings that generate high-authority backlinks and direct private hire discovery traffic.

2. **Zero event platform listings.** The London Stone gets links from Lemonrock, Ents24, Songkick. The Anchor's quiz, bingo, and drag shows should be on Eventbrite (DA 90+), DesignMyNight, Skiddle.

3. **Unlinked mentions on aviation sites.** AirportSpotting.com, SpottersWiki, and Pinkfroot mention Stanwell Moor's plane spotting area without linking to The Anchor. Email outreach with genuine value could convert these to editorial links.

4. **TripAdvisor review deficit: 29 vs competitors' 300-1,960.** Review velocity programme (QR codes, post-visit prompts) needed. Target 60 TripAdvisor reviews in 6 months.

5. **Estimated DA 10-15** (typical for independent pubs). The Anchor compensates with content depth (195 pages) and topical authority. Cannot close the structural gap with the Ostrich Inn (accommodation platform links) but can build authority in aviation, entertainment, and travel content channels.

### UX & Conversion

**Top findings:**

1. **Hero sections push conversion points below fold on mobile.** Five identical trust badges consume 100-120px on every page. Reducing to 3 context-specific badges recovers above-fold real estate.

2. **Floating action button uses ambiguous "+" icon.** Does not communicate booking/contact purpose. Conflicts with FoodStickyCtaBar on food pages (z-index overlap).

3. **Quiz night page has wrong information hierarchy.** "Next quiz" card is behind rating strips and descriptive paragraphs. Five hero CTAs including off-topic "Pizza Menu" and "Sunday Roast Info" create decision paralysis.

4. **Private hire page has zero conversion support.** No pricing table, no testimonials, no comparison, no "small party welcome" messaging. Estimated conversion rate <10%. The PrivateBookingCalculator is a strong tool but buried below 6 event cards.

5. **Sunday lunch page is the conversion model.** Price anchoring in title, booking deadline urgency, API-driven menu, sticky CTA bar on mobile, WhatsApp option, FAQ with schema. Other pages should replicate this pattern.

### Content Quality

**Top findings (Editor/QA):**

1. **F1 page claims Sky Sports -- The Anchor does NOT have Sky Sports.** Trust-destroying inaccuracy. Must be fixed immediately.

2. **Hotel pages claim "guest ales" -- The Anchor does NOT serve guest ales.** Three confirmed pages with this false claim.

3. **Hardcoded review count (238) will become stale.** Used across About page, Reviews page, Sunday Lunch schema, and DEFAULT_REVIEW_STATS constant. Needs centralised updating.

4. **Breakfast claimed on wedding and corporate pages -- The Anchor does NOT serve breakfast.** Needs qualification or removal.

5. **Feltham page geographic inaccuracy.** Feltham is in London Borough of Hounslow, not Surrey. Schema and body copy incorrectly place it in Surrey.

6. **"Travelers" (American spelling) on near-heathrow page.** Should be "Travellers" for a British pub.

---

## The Roadmap

### Tier 1: Immediate Fixes (This Week)

These items are actively harming performance right now. Each has been flagged by 2+ agents with high confidence.

| ID | Category | What | Why It Matters | Impact | Effort | Owner | Dependencies | Decision | Source Agents |
|---|---|---|---|---|---|---|---|---|---|
| T1-01 | Technical | Unblock AI crawlers in Cloudflare dashboard | Entire AI search strategy is blocked. llms.txt, SpeakableSpecification, definitive-answer paragraphs all wasted. | High | 5 min | Manager (Cloudflare access) | None | **DO NOW** | Technical SEO, Strategy |
| T1-02 | Technical | Remove duplicate viewport meta tag (layout.tsx line 186) | Validation error on every page; signals technical sloppiness | Low-Med | 1 min | Developer | None | **DO NOW** | Technical SEO |
| T1-03 | Technical | Add 3 cannibalisation 301 redirects (/pub-garden-heathrow, /pubs-in-stanwell, /private-party-venue) | Four page pairs splitting authority; est. +30 clicks/month from consolidation | Medium | 15 min | Developer | None | **DO NOW** | Technical SEO, Content, Copywriter, Editor, UX/CRO |
| T1-04 | Technical | Remove cannibalisation targets from sitemap.ts | Google still sees split signals via sitemap | Medium | 5 min | Developer | T1-03 | **DO NOW** | Technical SEO |
| T1-05 | Technical | Update Footer links to match redirects (3 links) | Prevents redirect chains for crawlers and users | Low | 10 min | Developer | T1-03 | **DO NOW** | UX/CRO, Technical SEO |
| T1-06 | Technical | Update homepage /private-party-venue link to /private-hire | Redirect chain from highest-traffic page | Low | 5 min | Developer | T1-03 | **DO NOW** | UX/CRO |
| T1-07 | Content | Fix F1 page Sky Sports claim | Trust-destroying false advertising. Customer expecting Sky Sports will leave negative review | Critical | 20 min | Developer | Business verification | **DO NOW** | Editor (CRITICAL-1) |
| T1-08 | Content | Fix hotel pages "guest ales" claim (3+ pages) | False claims undermine trust on arrival | High | 30 min | Developer | None | **DO NOW** | Editor (CRITICAL-2) |
| T1-09 | Content | Fix/qualify breakfast claims on wedding + corporate pages | Brand standards violation | Medium | 20 min | Developer | Business verification | **DO NOW** | Editor (HIGH-1) |
| T1-10 | Technical | Update/remove EventSeries endDate "2026-12-31" | Will expire at year-end; schema warnings | Low | 5 min | Developer | None | **DO NOW** | Technical SEO |
| T1-11 | Technical | Expand sameAs in Organization schema (add TripAdvisor, Google Maps, CAMRA, Yelp) | Better entity recognition | Low | 10 min | Developer | None | **DO NOW** | Technical SEO |
| T1-12 | Technical | Add Spelthorne to containedInPlace hierarchy | Local entity association | Low | 5 min | Developer | None | **DO NOW** | Technical SEO |
| T1-13 | Technical | Update hardcoded review count in DEFAULT_REVIEW_STATS | Stale data undermines trust, schema warnings | Medium | 5 min | Developer | Current review count from Google | **DO NOW** | Editor (CRITICAL-4) |
| T1-14 | Technical | Reduce homepage revalidation from 24h to 4h | Menu/hours changes invisible for up to a day | Low | 1 min | Developer | None | **DO NOW** | Technical SEO |

**Tier 1 total effort: ~2-3 hours (code) + 5 minutes (Cloudflare)**

---

### Tier 2: Short-Term Wins (Next 4-8 Weeks)

Measurable gains within 2 months. These items drive the bulk of the projected +484-526 clicks/month.

| ID | Category | What | Why It Matters | Impact | Effort | Owner | Dependencies | Decision | Source Agents |
|---|---|---|---|---|---|---|---|---|---|
| T2-01 | Metadata | Rewrite title tags and meta descriptions on 8 priority pages | +114-156 clicks/month from existing impressions. Highest ROI per hour of effort | Very High | 3-4 hrs | Developer | None (batch 3-4 pages/week) | **DO NOW** | Copywriter, Strategy, Analytics |
| T2-02 | Content | Rewrite /private-hire with pricing table, testimonials, hotel comparison, "small party" positioning | Private hire is 2nd revenue stream but page has zero conversion support. Est. +20-40 clicks/month + improved conversion | Very High | 4-6 hrs | Developer + Manager (pricing, reviews) | Business-verified pricing | **DO NOW** | Copywriter, UX/CRO, Content Strategy, Editor |
| T2-03 | Technical | Deploy BreadcrumbList schema site-wide (~75 pages) | Breadcrumb rich results in SERPs, improved navigation signals | Medium | 4-6 hrs | Developer | None | **SCHEDULE (Week 2-3)** | Technical SEO, Content Strategy |
| T2-04 | Technical | Remove keywords meta tag from all 88 files | Cleanup, reduce HTML size, stop revealing strategy to competitors | Low | 1-2 hrs | Developer | None | **SCHEDULE (Week 2)** | Technical SEO, Editor |
| T2-05 | Content | Noindex 60-70 deadweight blog posts | Concentrate crawl budget on 115 high-value pages; est. +20 clicks/month from improved efficiency | Medium | 2-3 hrs | Developer | Finalised slug list vs GSC data | **SCHEDULE (Week 2-3)** | Content Strategy, Strategy |
| T2-06 | Content | Resolve /food-menu vs /sunday-lunch cannibalisation (summary card) | Food menu's sunday roast section competes with dedicated sunday-lunch page | Medium | 1 hr | Developer | None | **DO NOW** | Strategy, Content, Copywriter |
| T2-07 | Technical | Add Menu+MenuItem schema to /pizza-menu, /burger-menu, /drinks | Menu rich results; AI assistant answers about pricing | Medium | 3 hrs | Developer | None | **SCHEDULE (Week 3)** | Technical SEO, Opportunity Map |
| T2-08 | Technical | Add MeetingRoom/EventVenue schema to /function-room-hire, /corporate-events | Venue rich results for Google venue searches | Medium | 1 hr | Developer | None | **SCHEDULE (Week 3)** | Technical SEO |
| T2-09 | Technical | Add canonical tags to /private-hire/near/[slug] pages | ~20 landmark pages without canonicals | Low | 15 min | Developer | None | **SCHEDULE (Week 2)** | Technical SEO |
| T2-10 | Analytics | Create /api/web-vitals route (stub) | Web-vitals.tsx sending to 404 in production | Low | 15 min | Developer | None | **SCHEDULE (Week 2)** | Analytics |
| T2-11 | Analytics | Add ScrollDepthTracker to revenue pages | Cannot tell if users read /sunday-lunch, /private-hire content | Medium | 1 hr | Developer | None | **SCHEDULE (Week 2)** | Analytics |
| T2-12 | UX | Replace FAB "+" icon with phone icon; resolve z-index conflict with FoodStickyCtaBar | Ambiguous icon + visual overlap on food pages | Medium | 2-3 hrs | Developer | None | **SCHEDULE (Week 2)** | UX/CRO |
| T2-13 | UX | Reduce quiz night hero CTAs from 5 to 2; reorder page (next event first) | 0.2% CTR. Wrong information hierarchy, off-topic CTAs | Medium | 1.5 hrs | Developer | None | **SCHEDULE (Week 2)** | UX/CRO |
| T2-14 | UX | Add Sunday Lunch card + mid-page "Book a Table" CTA to homepage | Homepage's highest-revenue food product has no body content CTA | Medium | 2-3 hrs | Developer | None | **SCHEDULE (Week 3)** | UX/CRO, Opportunity Map |
| T2-15 | UX | Move price comparison above booking wizard on /heathrow-parking | Establish value before requesting commitment | Medium | 1 hr | Developer | None | **SCHEDULE (Week 3)** | UX/CRO |
| T2-16 | Content | Add definitive answer paragraphs to 5 key pages | AI search citation improvement; featured snippet eligibility | Medium | 2 hrs | Developer | None | **SCHEDULE (Week 2)** | Copywriter, Strategy |
| T2-17 | Content | Fix Feltham "Surrey" geographic inaccuracy | Inaccurate claim; confuses local users | Low | 15 min | Developer | None | **SCHEDULE (Week 2)** | Editor (HIGH-4) |
| T2-18 | Content | Fix minor copy issues: "Travelers"->"Travellers", "FREE"->"Free", delivery FAQ wording | British English consistency; brand polish | Low | 15 min | Developer | None | **SCHEDULE (Week 2)** | Editor |
| T2-19 | UX | Add WhatsApp CTA to private hire page body | Natural channel for event enquiries; currently only in FAB menu | Low | 30 min | Developer | None | **SCHEDULE (Week 3)** | UX/CRO |
| T2-20 | UX | Add response time commitment to enquiry forms | Reduces post-submission anxiety | Low | 30 min | Developer | None | **SCHEDULE (Week 3)** | UX/CRO |
| T2-21 | Technical | Verify EventSeries on /music-bingo | Schema exists in code -- verify it renders | Low | 15 min | Developer | None | **SCHEDULE (Week 2)** | Technical SEO |

**Tier 2 total effort: ~35-50 hours across 4-6 weeks**
**Tier 2 total projected impact: +350-500 clicks/month**

---

### Tier 3: Medium-Term Growth (1-3 Months)

Bigger structural work that compounds over time.

| ID | Category | What | Why It Matters | Impact | Effort | Owner | Dependencies | Decision | Source Agents |
|---|---|---|---|---|---|---|---|---|---|
| T3-01 | Content | Publish blog: "Eating Near Heathrow: Airport vs Pub Prices Compared" | Proven comparison format; est. 50-80 clicks/month | High | 4-6 hrs (writing) + 1 hr (tech) | Content + Developer | Price research | **SCHEDULE (Month 2)** | Content Strategy, Copywriter |
| T3-02 | Content | Publish blog: "Function Room Hire Near Heathrow: Pub vs Hotel Pricing" | Supports private hire cluster; est. 30-50 clicks/month | High | 4-6 hrs + 1 hr | Content + Developer | Hotel price research | **SCHEDULE (Month 2)** | Content Strategy, Copywriter |
| T3-03 | Content | Publish blog: "Best Plane Spotting Locations at Heathrow" (2,500 words) | Natural link magnet for aviation community; est. 80-150 clicks/month | High | 5-6 hrs + 1 hr | Content + Developer | Location photos | **SCHEDULE (Month 2)** | Content Strategy, Copywriter, Authority |
| T3-04 | Authority | Register on BigVenueBook, Tagvenue, ChooseYourVenue, VenueScanner, Poptop, Hire Space | Closes biggest authority gap; 5-6 high-authority backlinks + direct private hire discovery | Very High | 4-6 hrs | Marketing | Photos, capacity info, pricing | **SCHEDULE (Month 2)** | Authority, Strategy |
| T3-05 | Authority | Create Eventbrite events for quiz, bingo, drag shows | DA 90+ backlink + event discovery traffic | High | 2 hrs | Marketing | Event details | **SCHEDULE (Month 2)** | Authority |
| T3-06 | Authority | Register on DesignMyNight, Skiddle, Ents24, Lemonrock | Entertainment discovery; matches London Stone's link profile | Medium | 2 hrs | Marketing | Event details | **SCHEDULE (Month 2)** | Authority |
| T3-07 | Authority | Build 15+ local directory citations (Yell, Bing Places, Apple Maps, DogFriendly.co.uk, FreeIndex, etc.) | Strengthens local SEO signals for all queries | Medium | 4-6 hrs | Marketing | Consistent NAP data | **SCHEDULE (Month 2-3)** | Authority |
| T3-08 | Authority | Audit and optimise Google Business Profile (3+ categories, products, Q&A, photos) | Local pack visibility; review encouragement foundation | High | 2 hrs | Manager | Google Business access | **SCHEDULE (Month 2)** | Authority, Strategy |
| T3-09 | Content | Consolidate 8 hotel pages into /heathrow-hotels-pub hub (keep Sofitel + Premier Inn) | Reduces doorway-page risk; concentrates authority | Medium | 4-6 hrs | Developer | None | **SCHEDULE (Month 3)** | Content Strategy |
| T3-10 | Content | Noindex 5-7 low-value location pages (horton, longford, bedfont, sunbury, windsor, egham, wraysbury) | Reduces doorway-page risk; crawl budget concentration | Medium | 1-2 hrs | Developer | 30-day monitor after noindex | **SCHEDULE (Month 3)** | Content Strategy |
| T3-11 | Content | Consolidate 5+ Christmas blog posts into 1 evergreen post | Stop splitting seasonal authority across 5 thin posts | Low | 2-3 hrs | Developer | None | **SCHEDULE (Month 3)** | Content Strategy |
| T3-12 | UX | Create shared TrustBadges component; reduce mobile hero badges from 5 to 3 per context | Recovers 100-120px above-fold on mobile across 7+ pages | Medium | 3-4 hrs | Developer | None | **SCHEDULE (Month 2)** | UX/CRO |
| T3-13 | Content | Enrich /restaurants-near-heathrow with price comparison content | Captures food-seeking travellers; est. +15-25 clicks/month | Medium | 3-4 hrs | Content + Developer | Price data | **SCHEDULE (Month 2)** | Content Strategy, Copywriter |
| T3-14 | Technical | Create llms-full.txt with full menu, event dates, FAQ content, pricing | Comprehensive AI search resource; extends llms.txt advantage | Medium | 2 hrs | Developer | None | **SCHEDULE (Month 2)** | Strategy |
| T3-15 | UX | Disclose deposit requirements earlier in booking flow (Step 1 not Step 4) | Reduces Step 4 abandonment for sunday lunch and 7+ guests | Medium | 1-2 hrs | Developer | None | **SCHEDULE (Month 2)** | UX/CRO |
| T3-16 | UX | Add fallback contact form to PrivateBookingCalculator | API failure = complete conversion loss (no fallback currently) | Low-Med | 3-4 hrs | Developer | None | **SCHEDULE (Month 2)** | UX/CRO |
| T3-17 | Authority | Implement review encouragement programme (QR codes, post-visit prompts) | 29 TripAdvisor reviews vs competitors' 300-1,960. Target 60 in 6 months | High (long-term) | 1 hr setup + ongoing | Manager | Table tent design, QR codes | **SCHEDULE (Month 2)** | Authority |
| T3-18 | Navigation | Add /beer-garden and /dog-friendly-pub-heathrow to "Visit Us" nav dropdown | Top-5 performing page has no navigation entry | Low | 30 min | Developer | None | **SCHEDULE (Month 2)** | Content Strategy |

**Tier 3 total effort: ~50-70 hours (code + content + marketing) over months 2-3**

---

### Tier 4: Long-Term Strategic Bets (3-6 Months)

Plays that compound over time. Lower urgency but high strategic value.

| ID | Category | What | Why It Matters | Impact | Effort | Owner | Dependencies | Decision | Source Agents |
|---|---|---|---|---|---|---|---|---|---|
| T4-01 | Content | Publish blogs: "Heathrow Layover Guide", "Dog Walks Near Stanwell Moor", "Things to Do Near Heathrow at Night" | Builds topical authority; captures long-tail traveller queries | Medium | 12-18 hrs (writing) | Content | Research, photos | **SCHEDULE (Month 3-4)** | Content Strategy |
| T4-02 | Authority | Outreach to aviation sites (AirportSpotting.com, SpottersWiki, Pinkfroot) for inclusion | Convert unlinked mentions to editorial links | Medium | 1-2 hrs | Marketing | T3-03 (plane spotting blog published first) | **SCHEDULE (Month 3)** | Authority |
| T4-03 | Authority | Pitch Surrey Live: "Best plane spotting spots in Surrey" | DA 70+ editorial link; regional visibility | High if accepted | 1 hr | Marketing | T3-03 published | **SCHEDULE (Month 3-4)** | Authority |
| T4-04 | Authority | Outreach to 5 Heathrow layover bloggers (Sleeping in Airports, Stasher, etc.) | Travel blog editorial links | High if accepted | 3 hrs | Marketing | T4-01 (layover guide published) | **SCHEDULE (Month 4-5)** | Authority |
| T4-05 | Content | Create /offers hub page aggregating current deals with Offer schema | Est. 15-25 clicks/month; high conversion | Low-Med | 3-4 hrs | Developer | Current offers from business | **SCHEDULE (Month 3)** | Content Strategy |
| T4-06 | Authority | Register with Spelthorne Borough Council, Visit Surrey, Colne Valley Park | High-DA local/government links | Medium | 3 hrs | Marketing | None | **SCHEDULE (Month 4)** | Authority |
| T4-07 | Content | Add testimonial quotes to /function-room-hire, /sunday-lunch, sub-pages | Social proof at conversion points | Medium | 2-3 hrs | Developer | Google review sourcing | **SCHEDULE (Month 3)** | Content Strategy, Copywriter |
| T4-08 | Technical | Audit 560+ redirect rules for chains (A->B->C) | Wasted crawl budget on chained redirects | Low | 2 hrs | Developer | None | **SCHEDULE (Month 3)** | Technical SEO |
| T4-09 | Technical | Move GTM to next/script with afterInteractive strategy | Improve First Contentful Paint | Low | 30 min + testing | Developer | Consent mode testing | **SCHEDULE (Month 3)** | Technical SEO |
| T4-10 | Technical | Implement dynamic lastModified dates in sitemap.ts | Meaningful freshness signals to Google | Low | 2 hrs | Developer | None | **SCHEDULE (Month 3)** | Technical SEO |
| T4-11 | Content | Establish seasonal content update calendar (update pages 6 weeks before each event) | Prevents stale seasonal content; builds authority annually | Medium (ongoing) | 1 hr setup | Manager | None | **SCHEDULE (Month 3)** | Content Strategy, Analytics |
| T4-12 | Authority | Pitch Time Out / Evening Standard / MyLondon for round-up inclusion | DA 90+ editorial links; major visibility | Very High if accepted | 2 hrs per pitch | Marketing | Strong content portfolio established | **SCHEDULE (Month 5-6)** | Authority |
| T4-13 | Analytics | Build Looker Studio dashboard (GSC + GA4) | Automated reporting replaces manual checks | Medium | 4-6 hrs | Developer/Analytics | GA4 conversions configured | **SCHEDULE (Month 3)** | Analytics |
| T4-14 | Analytics | Set up automated rank tracking for P1 keywords | Detect drops before they become problems | Medium | 2 hrs setup | Analytics | Tool subscription (Ahrefs/Semrush) | **SCHEDULE (Month 3)** | Analytics |
| T4-15 | Content | Add year-rolling logic to Easter page (currently hardcoded 2026-04-05) | Will become stale annually without manual update | Low | 1 hr | Developer | None | **SCHEDULE (Month 4)** | Editor |

---

## Content Briefs for Priority Pages

### Brief 1: "Eating Near Heathrow Airport: Real Prices Compared (2026)"

- **Target:** /blog/eating-near-heathrow-prices-compared
- **Keywords:** food near heathrow outside airport (90 vol), cheap eats near heathrow (30 vol), heathrow airport food prices (70 vol)
- **Format:** 1,800-2,200 words with price comparison table as centrepiece
- **Hook:** "A burger inside Heathrow T5 costs GBP 16-22. Seven minutes away, get one for GBP 12.95 with a pint and free parking."
- **Core asset:** Price comparison table: Heathrow T5 vs Hotel Restaurant vs The Anchor across 5-6 common meals
- **Sections:** Price table, "Is it worth leaving the terminal?" decision framework by layover length, transport info from each terminal, other off-airport options (Ostrich Inn, Three Magpies -- for honesty), The Anchor recommendation, FAQ with schema
- **Internal links:** /food-menu, /near-heathrow, /book-table, /heathrow-layover-dining, /free-parking
- **Expected impact:** 50-80 clicks/month within 3 months
- **Effort:** 4-6 hours research and writing + 1 hour technical setup

### Brief 2: Private Hire Hub Rewrite (/private-hire)

- **Target:** Existing page enrichment
- **Keywords:** private hire venue heathrow (110 vol), small party venue near heathrow (50 vol), function room hire staines (170 vol)
- **Additions:**
  1. Pricing bands table (finger buffet from GBP 9.95, hot buffet from GBP 14.95, sit-down from GBP 24.95)
  2. "How We Compare to Hotel Venues" table (Anchor vs Radisson vs Hilton on price, parking, min guests, flexibility)
  3. 3-5 genuine Google review quotes about private events
  4. "Small Parties from 10 Guests" section explicitly positioning against hotel 50-guest minimums
  5. Rewritten definitive answer paragraph
- **Dependencies:** Verified pricing from the business; genuine review quotes sourced from Google
- **Expected impact:** +20-40 clicks/month; 20-40% improvement in enquiry conversion rate
- **Effort:** 4-6 hours code + content sourcing time

### Brief 3: "Function Room Hire Near Heathrow: Pub vs Hotel Pricing (2026)"

- **Target:** /blog/function-room-hire-heathrow-pricing
- **Keywords:** function room hire near heathrow price (40 vol), cheap function room hire staines (20 vol)
- **Format:** 1,500-2,000 words with pricing comparison table
- **Core asset:** Table comparing The Anchor vs Radisson Blu vs Hilton vs Sofitel on room hire cost, catering per-head, parking fees, minimum spend, capacity
- **Sections:** Pricing comparison, "When a hotel makes sense" (honest), "When a pub makes sense," The Anchor offering, how to book, FAQ
- **Internal links:** /function-room-hire, /private-hire, /corporate-events
- **Expected impact:** 30-50 clicks/month within 3 months
- **Effort:** 4-6 hours + 1 hour technical

### Brief 4: "7 Best Plane Spotting Locations at Heathrow (2026 Guide)"

- **Target:** /blog/heathrow-plane-spotting-locations
- **Keywords:** heathrow plane spotting locations (320 vol), best plane spotting spots heathrow (50 vol)
- **Format:** 2,000-2,500 words comprehensive guide
- **Unique angle:** Only pub that can write this from a "base camp" perspective. Aviation blogs focus on photography angles; this guide focuses on the complete experience
- **Sections:** 7 locations (The Anchor primary, Myrtle Avenue, Hatton Cross, Terminal viewing areas, Southern Perimeter Road, Cranford, King George VI Reservoir), photography tips, comparison table of all locations, FAQ
- **Natural link magnet:** Aviation forums, AvGeek social media, travel bloggers
- **Internal links:** /beer-garden, /plane-spotting-heathrow, /near-heathrow, /free-parking
- **Expected impact:** 80-150 clicks/month within 3 months
- **Effort:** 5-6 hours + 1 hour technical

### Brief 5: Enrich /restaurants-near-heathrow

- **Target:** Existing page enrichment
- **Keywords:** eat near heathrow (210 vol), food near heathrow outside airport (90 vol)
- **Additions:** Price comparison table (airport restaurants vs The Anchor vs Toby Carvery vs Three Magpies), "Outside vs Inside" section, transport info from each terminal
- **Expected impact:** +15-25 clicks/month
- **Effort:** 3-4 hours

---

## Measurement Framework

### Primary KPIs

| KPI | Baseline | 3-Month Target | 6-Month Target | Source | Action If Off-Track |
|---|---|---|---|---|---|
| Monthly organic clicks | 622 | 1,000 | 1,500 | GSC | Audit underperforming pages, accelerate CTR fixes |
| Organic CTR | 1.6% | 3.0% | 4.0% | GSC | Review title tags of highest-impression pages |
| /sunday-lunch clicks/month | ~10 | 50 | 80 | GSC | Verify cannibalisation resolved, add internal links |
| /private-hire cluster clicks/month | ~5 | 30 | 60 | GSC | Enrich content, increase aggregator listings |
| Blog posts with >10 clicks/month | 2 | 8 | 12 | GSC | Audit content quality, review keyword targeting |
| Rich result impressions | 1,463 | 5,000 | 10,000 | GSC | Check schema deployment, validate with Rich Results Test |
| Indexed page count | ~195 | 130 | 110 | GSC | Verify noindex propagation, continue consolidation |
| Table booking starts from organic | Unknown | 50/month | 100/month | GTM events | Improve /book-table internal linking |
| Private hire enquiries from organic | Unknown | 10/month | 20/month | GTM events | Enrich content, add pricing transparency |
| Referring domains | 15-20 | 30-35 | 40-50 | Ahrefs/Moz free | Accelerate directory and aggregator registrations |
| TripAdvisor reviews | 29 | 40 | 60 | TripAdvisor | QR codes, post-visit prompts |

### Tracking Cadence

| Report | Frequency | Contents |
|---|---|---|
| SEO Pulse Check | Weekly | P1 keyword positions, new crawl errors, indexed page count, rich result impressions |
| Organic Performance Report | Monthly | Clicks/impressions by page cluster, CTR trends, booking/enquiry conversions from organic |
| Content ROI Report | Monthly | New content rankings, blog post performance, content gap progress |
| Quarterly Business Review | Quarterly | Revenue page performance, competitive position, strategy adjustments |

### Critical Tracking Gaps to Fix

1. **No organic vs direct traffic segmentation in GTM events.** Cannot attribute bookings to SEO. Add `traffic_source` parameter to conversion events. (Priority: P1)
2. **`/api/web-vitals` route does not exist.** Web-vitals.tsx hitting 404 in production. Create stub route. (Priority: P1)
3. **No conversion value tracking in GA4.** Cannot calculate organic traffic revenue. Assign monetary values to key conversions. (Priority: P2)

---

## Technical Implementation Notes

### Quick Implementations (< 2 hours each)

| Group | PR Title | Effort | Items |
|---|---|---|---|
| Group 1 | `fix: remove duplicate viewport, update schema dates, expand sameAs` | 30 min | T1-02, T1-10, T1-11, T1-12, T1-13, T1-14 |
| Group 2 | `fix: add 301 redirects for cannibalising pages, update internal links` | 45 min | T1-03, T1-04, T1-05, T1-06 |
| Group 5 | `fix: correct factual inaccuracies across hotel, sport, and event pages` | 2 hrs | T1-07, T1-08, T1-09, T2-17, T2-18 |

### Medium Implementations (2-8 hours)

| Group | PR Title | Effort | Items |
|---|---|---|---|
| Group 3 | `feat: rewrite title tags and meta descriptions for 8 priority pages` | 3-4 hrs | T2-01 |
| Group 4 | `chore: remove keywords meta tag from all pages` | 1-2 hrs | T2-04 |
| Group 7 | `chore: noindex 60-70 deadweight blog posts` | 2-3 hrs | T2-05 |
| Group 8 | `fix: create web-vitals route, add scroll tracking to revenue pages` | 2-3 hrs | T2-10, T2-11 |
| Group 9 | `feat: improve FAB, reduce quiz CTAs, add homepage conversion waypoints` | 6-8 hrs | T2-12, T2-13, T2-14, T2-15, T2-19, T2-20 |

### Large Implementations (1-5 days)

| Group | PR Title | Effort | Items |
|---|---|---|---|
| Group 6 | `feat: deploy BreadcrumbList site-wide, add Menu and EventVenue schemas` | 8-10 hrs | T2-03, T2-07, T2-08, T2-09, T2-21 |
| Group 10 | `feat: add pricing table, testimonials, and comparison to private hire` | 4-6 hrs | T2-02 |
| Group 11 | `feat: context-aware trust badges, reduce mobile hero height` | 3-4 hrs | T3-12 |
| Group 12 | New blog posts (1-2 hrs tech setup per post) | 3-5 per post total | T3-01, T3-02, T3-03 |

### Batching Recommendations

**Week 1 (8-10 hours):** Groups 1, 2, 5 (critical fixes) + Group 3 first 4 pages (metadata) + Cloudflare AI crawler unblock.

**Week 2 (10-12 hours):** Group 3 remaining pages + Group 4 (keywords removal) + Group 7 (blog noindex) + Group 8 (analytics).

**Week 3 (10-14 hours):** Group 6 (schema enhancements) + Group 9 first items (UX quick wins).

**Week 4 (8-12 hours):** Group 9 remaining + Group 10 (private hire enrichment, pending business input).

**Month 2 (8-12 hours code + marketing time):** Group 11 (trust badges) + Group 12 first 2-3 blog posts + llms-full.txt + venue aggregator registrations.

**Month 3 (6-10 hours code + marketing time):** Remaining blog posts + hotel page consolidation + location page noindex + external citation building.

---

## Ongoing Operating Model

### Sprint Cycle

| Cadence | Activity |
|---|---|
| Weekly (1 hour) | SEO pulse check: GSC positions, crawl errors, indexed pages, rich results. Address any drops immediately. |
| Fortnightly (30 min) | CTR review: check highest-impression pages for CTR regression. Title tag fixes if needed. |
| Monthly (2 hours) | Full traffic report, revenue page performance, blog post ROI assessment. Update review counts in schema. |
| Quarterly (half-day) | Competitor re-assessment, strategy adjustment, new keyword opportunities. Review and update seasonal pages. |

### Content Flow Standards

- **New blog posts:** Use comparison/guide format with real prices and specific details. Include FAQ section with schema, internal links to revenue pages, 1,500-2,500 words.
- **Seasonal pages:** Update 6 weeks before each event with current year pricing, menu, and booking details. Never noindex seasonal pages -- they build authority over multiple years.
- **Review updates:** Update DEFAULT_REVIEW_STATS monthly. Source new testimonial quotes quarterly.
- **Operational claims:** Verify against brand standards before publishing. No Sky Sports, no guest ales, no breakfast, no delivery.

### Technical Flow Standards

- **Title tag changes:** Batch 3-4 pages per week, monitor CTR for 2 weeks.
- **Redirects:** Always add to `config/redirects/additional-redirects.json`. Remove redirected pages from sitemap.ts. Update all internal links before or alongside redirect deployment.
- **Schema additions:** Validate with Google Rich Results Test before deploying. Monitor GSC rich results report for errors.
- **Blog noindex:** Apply noindex first, monitor for 30 days, only delete after confirming zero traffic impact.
- **Content pruning:** Noindex before deletion. 301 redirect consolidated pages to their hub. Never 404 a page with >10 impressions/month without a redirect.

---

## Full Unified Backlog

Every item with a decision. Sorted by tier, then by commercial impact within each tier.

| ID | Tier | Category | Description | Impact | Effort | Owner | Dependencies | Decision | Source Agent(s) |
|---|---|---|---|---|---|---|---|---|---|
| T1-01 | 1 | Technical | Unblock AI crawlers in Cloudflare | High | 5 min | Manager | None | DO NOW | Tech SEO, Strategy |
| T1-07 | 1 | Content | Fix F1 page Sky Sports claim | Critical | 20 min | Developer | Verify with business | DO NOW | Editor |
| T1-08 | 1 | Content | Fix hotel pages "guest ales" claim | High | 30 min | Developer | None | DO NOW | Editor |
| T1-03 | 1 | Technical | Add 3 cannibalisation 301 redirects | Medium | 15 min | Developer | None | DO NOW | Tech SEO, Content, Copywriter, Editor, UX |
| T1-04 | 1 | Technical | Remove cannibalisation targets from sitemap | Medium | 5 min | Developer | T1-03 | DO NOW | Tech SEO |
| T1-05 | 1 | Technical | Update Footer links for redirects | Low | 10 min | Developer | T1-03 | DO NOW | UX, Tech SEO |
| T1-06 | 1 | Technical | Update homepage /private-party-venue link | Low | 5 min | Developer | T1-03 | DO NOW | UX |
| T1-09 | 1 | Content | Fix breakfast claims on wedding/corporate pages | Medium | 20 min | Developer | Verify | DO NOW | Editor |
| T1-02 | 1 | Technical | Remove duplicate viewport meta tag | Low-Med | 1 min | Developer | None | DO NOW | Tech SEO |
| T1-10 | 1 | Technical | Fix EventSeries endDate | Low | 5 min | Developer | None | DO NOW | Tech SEO |
| T1-11 | 1 | Technical | Expand sameAs in Organization schema | Low | 10 min | Developer | None | DO NOW | Tech SEO |
| T1-12 | 1 | Technical | Add Spelthorne to containedInPlace | Low | 5 min | Developer | None | DO NOW | Tech SEO |
| T1-13 | 1 | Technical | Update hardcoded review count | Medium | 5 min | Developer | Current count | DO NOW | Editor |
| T1-14 | 1 | Technical | Reduce homepage revalidation to 4h | Low | 1 min | Developer | None | DO NOW | Tech SEO |
| T2-01 | 2 | Metadata | Rewrite title/meta on 8 priority pages | Very High | 3-4 hrs | Developer | None | DO NOW | Copywriter, Strategy, Analytics |
| T2-02 | 2 | Content | Rewrite /private-hire with pricing + testimonials | Very High | 4-6 hrs | Developer + Manager | Business pricing | DO NOW | Copywriter, UX, Content, Editor |
| T2-06 | 2 | Content | Resolve /food-menu vs /sunday-lunch cannibalisation | Medium | 1 hr | Developer | None | DO NOW | Strategy, Content, Copywriter |
| T2-03 | 2 | Technical | Deploy BreadcrumbList schema site-wide | Medium | 4-6 hrs | Developer | None | SCHEDULE Wk 2-3 | Tech SEO, Content |
| T2-05 | 2 | Content | Noindex 60-70 deadweight blog posts | Medium | 2-3 hrs | Developer | Slug list | SCHEDULE Wk 2-3 | Content Strategy |
| T2-04 | 2 | Technical | Remove keywords meta from 88 files | Low | 1-2 hrs | Developer | None | SCHEDULE Wk 2 | Tech SEO, Editor |
| T2-07 | 2 | Technical | Add Menu+MenuItem schema to 3 pages | Medium | 3 hrs | Developer | None | SCHEDULE Wk 3 | Tech SEO |
| T2-08 | 2 | Technical | Add MeetingRoom/EventVenue schema | Medium | 1 hr | Developer | None | SCHEDULE Wk 3 | Tech SEO |
| T2-12 | 2 | UX | Replace FAB icon + resolve z-index | Medium | 2-3 hrs | Developer | None | SCHEDULE Wk 2 | UX/CRO |
| T2-13 | 2 | UX | Fix quiz night page (CTAs + order) | Medium | 1.5 hrs | Developer | None | SCHEDULE Wk 2 | UX/CRO |
| T2-14 | 2 | UX | Homepage conversion waypoints | Medium | 2-3 hrs | Developer | None | SCHEDULE Wk 3 | UX/CRO |
| T2-15 | 2 | UX | Move parking comparison above wizard | Medium | 1 hr | Developer | None | SCHEDULE Wk 3 | UX/CRO |
| T2-16 | 2 | Content | Add definitive answer paragraphs (5 pages) | Medium | 2 hrs | Developer | None | SCHEDULE Wk 2 | Copywriter |
| T2-09 | 2 | Technical | Add canonicals to landmark pages | Low | 15 min | Developer | None | SCHEDULE Wk 2 | Tech SEO |
| T2-10 | 2 | Analytics | Create /api/web-vitals stub route | Low | 15 min | Developer | None | SCHEDULE Wk 2 | Analytics |
| T2-11 | 2 | Analytics | Add scroll tracking to revenue pages | Medium | 1 hr | Developer | None | SCHEDULE Wk 2 | Analytics |
| T2-17 | 2 | Content | Fix Feltham geographic inaccuracy | Low | 15 min | Developer | None | SCHEDULE Wk 2 | Editor |
| T2-18 | 2 | Content | Fix Travelers/FREE/delivery copy issues | Low | 15 min | Developer | None | SCHEDULE Wk 2 | Editor |
| T2-19 | 2 | UX | Add WhatsApp CTA to private hire body | Low | 30 min | Developer | None | SCHEDULE Wk 3 | UX/CRO |
| T2-20 | 2 | UX | Add response time commitment to forms | Low | 30 min | Developer | None | SCHEDULE Wk 3 | UX/CRO |
| T2-21 | 2 | Technical | Verify EventSeries on /music-bingo | Low | 15 min | Developer | None | SCHEDULE Wk 2 | Tech SEO |
| T3-03 | 3 | Content | Publish plane spotting locations blog | High | 6-7 hrs | Content + Dev | Photos | SCHEDULE Month 2 | Content, Copywriter, Authority |
| T3-04 | 3 | Authority | Register on 6 venue aggregator platforms | Very High | 4-6 hrs | Marketing | Photos, pricing | SCHEDULE Month 2 | Authority, Strategy |
| T3-01 | 3 | Content | Publish eating near Heathrow blog | High | 5-7 hrs | Content + Dev | Price research | SCHEDULE Month 2 | Content, Copywriter |
| T3-02 | 3 | Content | Publish function room pricing blog | High | 5-7 hrs | Content + Dev | Hotel prices | SCHEDULE Month 2 | Content, Copywriter |
| T3-05 | 3 | Authority | Create Eventbrite events | High | 2 hrs | Marketing | Event details | SCHEDULE Month 2 | Authority |
| T3-08 | 3 | Authority | Optimise Google Business Profile | High | 2 hrs | Manager | GBP access | SCHEDULE Month 2 | Authority |
| T3-17 | 3 | Authority | Review encouragement programme | High (long-term) | 1 hr + ongoing | Manager | QR codes | SCHEDULE Month 2 | Authority |
| T3-06 | 3 | Authority | Register on event platforms (4) | Medium | 2 hrs | Marketing | Event details | SCHEDULE Month 2 | Authority |
| T3-07 | 3 | Authority | Build 15+ directory citations | Medium | 4-6 hrs | Marketing | NAP data | SCHEDULE Month 2-3 | Authority |
| T3-09 | 3 | Content | Consolidate hotel pages into hub | Medium | 4-6 hrs | Developer | None | SCHEDULE Month 3 | Content Strategy |
| T3-10 | 3 | Content | Noindex low-value location pages | Medium | 1-2 hrs | Developer | 30-day monitor | SCHEDULE Month 3 | Content Strategy |
| T3-12 | 3 | UX | Context-aware trust badges component | Medium | 3-4 hrs | Developer | None | SCHEDULE Month 2 | UX/CRO |
| T3-13 | 3 | Content | Enrich /restaurants-near-heathrow | Medium | 3-4 hrs | Content + Dev | Price data | SCHEDULE Month 2 | Content Strategy |
| T3-14 | 3 | Technical | Create llms-full.txt | Medium | 2 hrs | Developer | None | SCHEDULE Month 2 | Strategy |
| T3-15 | 3 | UX | Earlier deposit disclosure in booking | Medium | 1-2 hrs | Developer | None | SCHEDULE Month 2 | UX/CRO |
| T3-16 | 3 | UX | Fallback form for private hire calculator | Low-Med | 3-4 hrs | Developer | None | SCHEDULE Month 2 | UX/CRO |
| T3-11 | 3 | Content | Consolidate Christmas blog posts | Low | 2-3 hrs | Developer | None | SCHEDULE Month 3 | Content Strategy |
| T3-18 | 3 | Navigation | Add beer-garden + dog-friendly to nav | Low | 30 min | Developer | None | SCHEDULE Month 2 | Content Strategy |
| T4-01 | 4 | Content | Publish 3 additional blog posts | Medium | 12-18 hrs | Content | Research | SCHEDULE Month 3-4 | Content Strategy |
| T4-03 | 4 | Authority | Pitch Surrey Live with plane spotting angle | High if accepted | 1 hr | Marketing | T3-03 | SCHEDULE Month 3-4 | Authority |
| T4-04 | 4 | Authority | Outreach to 5 layover bloggers | High if accepted | 3 hrs | Marketing | T4-01 | SCHEDULE Month 4-5 | Authority |
| T4-02 | 4 | Authority | Outreach to aviation sites | Medium | 1-2 hrs | Marketing | T3-03 | SCHEDULE Month 3 | Authority |
| T4-06 | 4 | Authority | Council/tourism body registrations | Medium | 3 hrs | Marketing | None | SCHEDULE Month 4 | Authority |
| T4-12 | 4 | Authority | Pitch Time Out / Evening Standard | Very High if accepted | 2 hrs | Marketing | Portfolio built | SCHEDULE Month 5-6 | Authority |
| T4-05 | 4 | Content | Create /offers hub page | Low-Med | 3-4 hrs | Developer | Offers data | SCHEDULE Month 3 | Content Strategy |
| T4-07 | 4 | Content | Add testimonials to sub-pages | Medium | 2-3 hrs | Developer | Reviews | SCHEDULE Month 3 | Content, Copywriter |
| T4-08 | 4 | Technical | Audit redirect chains | Low | 2 hrs | Developer | None | SCHEDULE Month 3 | Tech SEO |
| T4-09 | 4 | Technical | Move GTM to afterInteractive | Low | 30 min + test | Developer | None | SCHEDULE Month 3 | Tech SEO |
| T4-10 | 4 | Technical | Dynamic lastModified in sitemap | Low | 2 hrs | Developer | None | SCHEDULE Month 3 | Tech SEO |
| T4-11 | 4 | Content | Seasonal content calendar | Medium (ongoing) | 1 hr | Manager | None | SCHEDULE Month 3 | Content, Analytics |
| T4-13 | 4 | Analytics | Looker Studio dashboard | Medium | 4-6 hrs | Developer | GA4 config | SCHEDULE Month 3 | Analytics |
| T4-14 | 4 | Analytics | Automated rank tracking | Medium | 2 hrs | Analytics | Tool subscription | SCHEDULE Month 3 | Analytics |
| T4-15 | 4 | Technical | Easter page year-rolling logic | Low | 1 hr | Developer | None | SCHEDULE Month 4 | Editor |

### Rejected Items

| Idea | Reason | Source |
|---|---|---|
| Chase "restaurants near heathrow" head term (2,400 vol) | TripAdvisor + OpenTable permanently dominate position 1-3. ROI of effort is near zero. | Strategy |
| Chase "cheap heathrow parking" head term (6,600 vol) | Commercial parking operators with multi-million pound ad spend. Cannot compete. | Strategy |
| Chase "wedding venue surrey" head term | Hotels with 200+ capacity and professional photography. The Anchor maxes at 200 standing. | Strategy |
| Compete with The London Stone on "live music staines" | They own this niche with dedicated music venue profile and platform listings. Target "live music near heathrow" instead. | Strategy, Competitor |
| Chase "best pub london" | Geographic mismatch (Surrey, not London), massive competition. | Strategy |
| Build PBN / buy links | Google penalties far outweigh short-term gain. | Authority |
| Mass directory submission services | Low-quality directories harm more than help. | Authority |
| Remove seasonal pages | They build authority over multiple years. Noindex would destroy accumulated signals. | Content Strategy |

---

## Out of Scope / Future Considerations

1. **Full redesign or CMS migration.** The Next.js App Router codebase is modern, fast, and well-structured. No architectural change needed.

2. **Paid search (Google Ads).** This roadmap is organic-only. Paid search for "function room hire near heathrow" and "christmas party venue heathrow" could complement organic while rankings build, but is a separate workstream.

3. **Social media strategy.** Instagram and Facebook are active but not assessed. Social signals indirectly support SEO via brand searches and engagement, but managing social is outside this roadmap's scope.

4. **Google Places API integration for live review data.** Replacing hardcoded review counts with live API data would prevent staleness but requires API key management and rate limit handling. Deferred as a technical improvement task.

5. **OpenTable integration.** The Ostrich Inn benefits from OpenTable listings. If The Anchor were to join OpenTable, it would appear in aggregator restaurant searches. Business decision, not an SEO task.

6. **Accommodation.** The Ostrich Inn's authority advantage comes from hotel booking platforms (Booking.com, Expedia). Adding rooms is a business transformation, not an SEO fix.

7. **Video content and virtual tours.** Hotels compete on virtual tours and event photography. Low priority vs written content, but worth revisiting in 6 months for private hire sub-pages.

8. **International language pages.** Heathrow serves international travellers. Content in key languages (Mandarin, Hindi, Arabic) could capture a niche, but the audience size and conversion rate do not justify the effort for a village pub.

---

## Answers to the Six Key Questions

**1. What are the top three SEO priorities right now?**
(a) Fix the six title tags/meta descriptions on pages with 6,000+ combined impressions but <1% CTR -- projected +114-156 clicks/month for 3-4 hours of work. (b) Enrich /private-hire with pricing, testimonials, and "small party" positioning -- the biggest revenue gap. (c) Unblock AI crawlers in Cloudflare -- 5-minute setting change that unlocks the entire AI search strategy.

**2. Which pages matter most commercially?**
/sunday-lunch (primary food revenue, requires booking + deposit), /private-hire (second revenue stream, currently invisible), /book-table (conversion endpoint), /food-menu (food discovery entry point), /christmas-parties (seasonal revenue spike). These five pages should receive disproportionate attention.

**3. What is blocking organic growth?**
(a) Poor title tags suppressing CTR on visible pages. (b) Four cannibalisation pairs splitting authority. (c) 60-70 deadweight blog posts diluting crawl budget. (d) Zero venue aggregator presence making private hire invisible. (e) Cloudflare blocking AI crawlers.

**4. What should be shipped first?**
Group 1 (one-line fixes: viewport, schema dates, sameAs, review count, revalidation) and Group 2 (three cannibalisation redirects + link cleanup). Combined effort: 75 minutes. These are the highest ROI-per-minute changes available.

**5. What has improved in the next 30 days?**
After 30 days of execution: title tags rewritten on 8 pages (+114-156 clicks/month projected), cannibalisation resolved (3 redirects, +30 clicks/month), 60-70 blog posts noindexed (crawl budget concentrated), AI crawlers unblocked (AI citations begin), schemas deployed site-wide (rich results expanding), private hire page enriched (enquiry conversion improving). Measured via GSC clicks, impressions, CTR, and indexed page count.

**6. What should be stopped because it is not worth it?**
(a) Maintaining 60-70 zero-impression blog posts -- noindex them. (b) Chasing "restaurants near heathrow" head term -- TripAdvisor owns it permanently. (c) Chasing "cheap heathrow parking" head term -- commercial operators dominate. (d) Maintaining 8 low-value individual hotel pages -- consolidate into a hub. (e) Including `keywords` meta tags on every page -- Google has ignored these for 17 years.
