# AI Search Optimisation Audit — The Anchor (the-anchor.pub)

**Date:** 20 March 2026
**Auditor:** AI Search Optimisation Specialist (AEO/GEO/LLMO)
**Scope:** Visibility in AI search engines (ChatGPT, Perplexity, Google AI Overviews, Claude) and readiness for generative engine optimisation (GEO).

---

## Executive Summary

The Anchor is in a **strong position** for AI search visibility relative to its competitive set. The site already appears prominently in web search results for core queries ("best pub near heathrow", "sunday lunch near heathrow", "plane spotting pub heathrow", "dog friendly pub near heathrow"), which means AI search engines that perform real-time web retrieval (Perplexity, ChatGPT with browsing, Google AI Overviews) are likely pulling The Anchor into their answers.

However, the site has meaningful gaps that limit how *confidently* and *completely* AI engines can cite it. The structured data foundation is solid but inconsistent across pages, the `llms.txt` file exists but needs expansion, there is no `llms-full.txt`, and several high-value content patterns for AI citation are missing.

**Overall AI-Readiness Score: 6.5/10**

| Area | Score | Notes |
|------|-------|-------|
| Structured Data (Schema.org) | 7/10 | Good global schema; inconsistent on inner pages |
| llms.txt | 5/10 | Exists but needs restructuring and a full version |
| Content Structure for LLM Extraction | 7/10 | Strong FAQ patterns; missing some definitive-answer content |
| Entity Clarity | 8/10 | Clear business identity, consistent NAP, good `@id` usage |
| Third-Party Citation Signals | 7/10 | Good TripAdvisor/Google presence; could expand |
| Crawlability for AI Bots | 8/10 | robots.txt allows all; no AI bot blocks detected |
| Competitive Position | 7/10 | Dominates niche queries; weaker on generic "pub near heathrow" |

---

## 1. AI Search Visibility Check

### Current Citation Status

| Query | The Anchor Cited? | Top Competitors Cited |
|-------|-------------------|----------------------|
| "best pub near heathrow airport" | **Yes** - appears as top recommendation in web search snippets; AI engines pulling from these results will cite it | Three Magpies, Queen's Arms (Heathrow T2), White Horse |
| "sunday lunch near heathrow" | **Yes** - appears with pricing (from £19.99) and booking details | Gordon Ramsay Plane Food, hotel restaurants |
| "plane spotting pub heathrow" | **Yes** - dominates this query with 3 of top 5 results | FlyerTalk forum posts, Airport Spotting guide |
| "dog friendly pub near heathrow" | **Yes** - dominates with blog + dedicated page + homepage | Three Magpies |
| "function room hire near heathrow" | **No** - absent from top results; dominated by hotels (Radisson, Hyatt, Thistle, DoubleTree) and venue aggregators (BigVenueBook, Tagvenue, Zipcube) | Hotel chains, venue platforms |
| "quiz night near heathrow" | Partial - dedicated page exists but not in top web results for this query | Local event aggregators |

### Key Finding — Function Room Gap

The Anchor is **invisible** for "function room hire near heathrow" despite having a dedicated page (`/function-room-hire`). Hotels and venue aggregators dominate this space. This represents a significant lost opportunity since the pub accommodates 10-200 guests with free parking — a strong differentiator against hotel venues charging for parking.

**Recommendation:** The function room page needs stronger structured data (MeetingRoom schema, Event venue schema), third-party listings on venue aggregators (BigVenueBook, Tagvenue, Zipcube), and content restructured around comparison with hotel alternatives (price, parking, flexibility).

### Plane Spotting — Unique Advantage

The Anchor effectively owns the "plane spotting pub heathrow" niche. This is a significant AI citation advantage because it is a **unique, definitive answer** — exactly the kind of content AI engines prefer to cite. The dedicated `/plane-spotting-heathrow` page with TouristAttraction schema is well-executed.

---

## 2. Content Structure for LLM Consumption

### Strengths

1. **FAQ Patterns:** The `FAQAccordionWithSchema` component is used extensively (86 pages) with proper `FAQPage` schema markup. This is the single most important content pattern for AI citation — AI engines love extracting Q&A pairs. The homepage has 10 well-crafted FAQs covering distance, parking, dog-friendliness, food, kitchen hours, plane spotting, family-friendliness, booking, special offers, and directions.

2. **Factual Density:** Pages contain specific, citable facts (7 minutes from T5, 20 free parking spaces, from £19.99, aircraft every 90 seconds). AI engines strongly prefer specific numbers over vague claims.

3. **Clear Entity Identity:** Consistent use of `BRAND.name` ("The Anchor"), `CONTACT` constants, and `HEATHROW_TIMES` ensures factual consistency across pages — critical because AI engines cross-reference claims across a site.

4. **Speakable Content:** The `SpeakableSchema` and `SpeakableContent` components mark up key content for voice search, which also benefits AI extraction.

### Weaknesses

1. **No "About" Page:** There is no dedicated `/about` page with the pub's history (est. 1751), team information, or detailed business description. AI engines heavily weight "About" content for entity understanding. The llms.txt mentions "since 1751" but this is not prominent on the site itself.

2. **Opening Hours Not in Static HTML:** Hours are fetched dynamically from the management API. While this ensures accuracy, it means AI crawlers that do not execute JavaScript may not see current hours. The `llms.txt` file has static hours, which helps, but there is a risk of drift between the static llms.txt and live API data.

3. **Menu Content in JSON/Dynamic Rendering:** The food menu is rendered dynamically via `FilteredMenuRenderer`. AI crawlers may not see individual menu items. The `llms.txt` links to `/food-menu` but does not list items. A static menu summary would improve AI extraction.

4. **Blog Content Missing:** The `content/blog/` directory contains only a template and README — no actual blog post markdown files were found (they may be sourced from MDX or another format, but the content density appears low). Blog articles with definitive, expert-style content are a primary driver of AI citations.

5. **No Comparison Content:** Pages like "Why choose The Anchor over airport restaurants" or "The Anchor vs hotel function rooms" would create the comparison patterns AI engines use when answering "best X near Y" queries.

---

## 3. llms.txt Assessment

### Current State

The file exists at `/public/llms.txt` (79 lines) and contains:

- Business name, location, contact details
- Opening hours and kitchen hours
- Feature list (food, parking, dog-friendly, WiFi, etc.)
- Regular events summary
- Private events/functions overview
- Heathrow proximity details
- Key page links
- Awards and recognition
- Brief "About Us" paragraph

### Issues

1. **Email mismatch:** The `llms.txt` lists `manager@the-anchor.pub` while the CLAUDE.md says the customer-facing email is `info@theanchorpub.co.uk`. This inconsistency could confuse AI engines.

2. **No llms-full.txt:** The specification recommends a companion `llms-full.txt` for detailed content. The site does not have one.

3. **Static hours risk:** The hours in `llms.txt` are hardcoded. If hours change (seasonal, special events), the file becomes inaccurate. AI engines that read this file will cite wrong hours.

4. **Missing menu summary:** No food or drinks items listed. This is a missed opportunity for AI engines answering "what food does The Anchor serve" queries.

5. **Missing event dates:** Events are described generically ("Monthly Quiz Night") without next dates. Adding next scheduled dates would help AI engines provide more actionable answers.

6. **No structured sections per the spec:** The llms.txt specification (llmstxt.org) recommends H1 for name, blockquote for summary, then H2 sections with file lists. The current file loosely follows this but does not include URL file lists.

### Recommended llms.txt Structure

```markdown
# The Anchor

> Traditional British pub in Stanwell Moor, Surrey — 7 minutes from Heathrow Terminal 5. Dog-friendly beer garden under the flight path, traditional Sunday roasts, stone-baked pizza, free parking. Rated 4.6/5 on Google.

## Key Facts
- **Address:** Horton Road, Stanwell Moor, Surrey TW19 6AQ
- **Phone:** 01753 682707
- **Email:** manager@the-anchor.pub
- **Website:** https://www.the-anchor.pub
- **Established:** 1751
- **Type:** Traditional British pub and restaurant
- **Price Range:** Mains £10-£24
- **Parking:** 20 free spaces, no time limit while dining
- **Capacity:** Up to 200 for private events
- **Rating:** 4.6/5 on Google (300+ reviews)
- **Food Hygiene:** 5-star rating

## Opening Hours
- Monday: CLOSED
- Tuesday-Thursday: 4pm-11pm
- Friday: 4pm-12am
- Saturday: 1pm-12am
- Sunday: 12pm-9pm

## Kitchen Hours
- Monday: CLOSED
- Tuesday-Friday: 6pm-9pm
- Saturday: 1pm-7pm
- Sunday: 1pm-6pm

## Distance from Heathrow
- Terminal 5: 7 minutes by car
- Terminals 2 & 3: 11 minutes by car
- Terminal 4: 12 minutes by car
- Bus: 441 & 442 from Heathrow Central Bus Station

## Food
- Traditional British pub classics (fish & chips, pies, burgers): £10-£17
- Stone-baked pizzas: from £11
- Sunday roast (chicken, lamb, pork belly, vegetarian): £19.99-£23.99
- Sunday lunch requires pre-order by Saturday 1pm, £10/person deposit
- ~~BOGOF pizza~~ (discontinued)
- ~~50% off fish & chips for over-65s on Fridays~~ (discontinued)

## Events
- Monthly Quiz Night: £3 entry, teams up to 6, cash prizes
- Monthly Cash Bingo: £10 per book, cash jackpot
- Music Bingo with Nikki Manfadge
- Karaoke nights
- Live music and themed events
- See https://www.the-anchor.pub/whats-on for dates

## Private Hire
- Function room for 10-200 guests
- Corporate events, Christmas parties, birthdays
- Wakes and celebrations of life
- Christenings, baby showers, weddings
- Custom catering, AV support, free parking
- Contact: manager@the-anchor.pub

## Unique Features
- Beer garden directly under Heathrow flight path (plane spotting)
- Aircraft overhead every 90 seconds during peak times
- Outside ULEZ zone (saves £12.50/day)
- Dog-friendly throughout (water bowls provided)
- Free WiFi, pool table, darts

## Pages
- [Home](https://www.the-anchor.pub/)
- [Food Menu](https://www.the-anchor.pub/food-menu)
- [Sunday Lunch](https://www.the-anchor.pub/sunday-lunch)
- [Drinks](https://www.the-anchor.pub/drinks)
- [Book a Table](https://www.the-anchor.pub/book-table)
- [What's On](https://www.the-anchor.pub/whats-on)
- [Beer Garden & Plane Spotting](https://www.the-anchor.pub/beer-garden)
- [Private Hire](https://www.the-anchor.pub/private-hire)
- [Function Room Hire](https://www.the-anchor.pub/function-room-hire)
- [Near Heathrow](https://www.the-anchor.pub/near-heathrow)
- [Dog Friendly](https://www.the-anchor.pub/dog-friendly-pub-heathrow)
- [Find Us](https://www.the-anchor.pub/find-us)
- [Quiz Night](https://www.the-anchor.pub/quiz-night)
- [Christmas Parties](https://www.the-anchor.pub/christmas-parties)
```

### llms-full.txt Recommendation

Create a `llms-full.txt` that includes everything above plus:
- Full food menu with prices and descriptions
- Full drinks list with prices
- Detailed event descriptions with upcoming dates
- Complete FAQ content from the homepage
- Detailed private hire packages and pricing
- Directions from each Heathrow terminal
- Nearby attractions and walking routes

---

## 4. Structured Data Assessment

### What Exists (Good)

| Schema Type | Location | Status |
|-------------|----------|--------|
| Organization | Global (layout.tsx via DynamicSchema) | Complete with @id, sameAs, logo |
| Restaurant + BarOrPub | Global (layout.tsx via DynamicSchema) | Comprehensive — aggregateRating, openingHours, amenities, ReserveAction |
| WebSite | Global (layout.tsx via DynamicSchema) | Basic but functional |
| FAQPage | 86+ pages via FAQAccordionWithSchema | Excellent coverage |
| TouristAttraction | /beer-garden, /plane-spotting-heathrow | Good for unique selling point |
| ParkingFacility | Homepage, /beer-garden | Detailed |
| EventSeries | Quiz Night, Bingo (in schema.ts) | Good recurring event markup |
| Event | Individual events via EventSchema component | Dynamic from API |
| BreadcrumbList | Many inner pages | Good but inconsistent |
| Service | /function-room-hire, enhanced-schemas.ts | Basic |
| Menu | Drinks menu in enhanced-schemas.ts | Partial |
| SpeakableSpecification | Homepage, food-menu, near-heathrow | Good for voice/AI |
| HowTo (Directions) | Available in enhanced-schemas.ts | Good |
| Offer (Special deals) | Over-65s fish & chips in enhanced-schemas.ts | Good |

### What Is Missing

| Schema Type | Where Needed | Priority | Impact |
|-------------|-------------|----------|--------|
| **Menu (Food)** with full MenuItems | /food-menu, /sunday-lunch, /pizza-menu, /burger-menu | HIGH | AI engines answering "what food does X serve" need machine-readable menu data |
| **AggregateRating on page-level schemas** | /sunday-lunch, /beer-garden, /private-hire | MEDIUM | Rating only on global LocalBusiness; page-specific services should inherit |
| **MeetingRoom** | /function-room-hire, /corporate-events | HIGH | Compete with hotel venues that have this schema |
| **FoodEstablishment** (additional type) | Global schema | LOW | Already using Restaurant + BarOrPub; adding FoodEstablishment could help |
| **Place** with containedInPlace | Global schema | MEDIUM | Link to Stanwell Moor, Surrey, Heathrow area for geographic entity clarity |
| **Review** markup | Homepage or /review-the-anchor | MEDIUM | Individual reviews in schema help AI engines cite specific praise |
| **Article/BlogPosting** | /blog/* pages | MEDIUM | Blog content needs proper Article schema for AI citation |
| **NutritionInformation** | Menu items | LOW | Currently stubbed out returning undefined; not critical |
| **PostalAddress with areaServed** expansion | Global | LOW | Already has GeoCircle; consider listing specific towns |

### Schema Quality Issues

1. **Duplicate schema definitions:** `localBusinessSchema` is defined in both `lib/schema.ts` and `lib/schema-with-reviews.ts`. The DynamicSchema component uses the reviews version (good), but the standalone version could cause confusion if imported elsewhere.

2. **Missing `@id` cross-references on inner pages:** The beer-garden TouristAttraction schema does not reference the main business `@id` (`https://www.the-anchor.pub/#business`). AI engines use `@id` to connect entities across pages.

3. **Event schema missing `startDate`:** The `quizNightEventSeries` and `bingoEventSeries` in `schema.ts` have generic dates. Individual upcoming events need specific `startDate` values for AI engines to answer "when is the next quiz night at The Anchor".

4. **`SpecialAnnouncement` for Monday closure:** Using `SpecialAnnouncement` schema for a permanent Monday closure is semantically incorrect. This schema type is intended for temporary announcements (COVID closures, etc.). The Monday closure is better represented within `OpeningHoursSpecification` (which it already is).

---

## 5. AI Citation Optimisation Recommendations

### Priority 1 — High Impact, Low Effort

#### A. Update llms.txt (1-2 hours)
Replace the current `llms.txt` with the restructured version above. Add menu prices, event dates, and correct the email address. Create `llms-full.txt` with expanded content.

#### B. Add Food Menu Schema (2-3 hours)
The food menu page needs `Menu` schema with `MenuSection` and `MenuItem` entries including prices. This is the single biggest structured data gap. AI engines answering "how much is fish and chips at The Anchor" need this data.

Implementation approach: Generate the schema server-side from the menu data that `FilteredMenuRenderer` already receives, and inject it as JSON-LD.

#### C. Ensure robots.txt does not block AI crawlers (15 minutes)
The current `robots.ts` allows all user agents (`userAgent: '*'`). Verify that no middleware or Cloudflare rules block `GPTBot`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`, or `Applebot-Extended`. These are the user agents for ChatGPT, Perplexity, Claude, Google AI Overviews, and Apple Intelligence respectively.

#### D. Add "definitive answer" content blocks (3-4 hours)
On key pages, add short paragraphs that directly answer common AI queries in a single, citable sentence. Examples:

- **Homepage:** "The Anchor is the closest traditional British pub to Heathrow Airport, located 7 minutes from Terminal 5 at Horton Road, Stanwell Moor, Surrey TW19 6AQ."
- **Sunday lunch:** "Sunday roast at The Anchor costs from £19.99 per person and must be pre-ordered by 1pm on Saturday, with a £10 per person deposit required."
- **Beer garden:** "The Anchor's beer garden sits directly under Heathrow's southern runway flight path, with aircraft passing overhead approximately every 90 seconds during peak hours."
- **Private hire:** "The Anchor offers function room hire for 10 to 200 guests near Heathrow Airport, with free parking for all attendees and custom catering packages."

These should be in the first paragraph of each page, within `<p>` tags that are easily extractable.

### Priority 2 — High Impact, Medium Effort

#### E. Create an "About The Anchor" page (2-3 hours)
A dedicated `/about` page with:
- History (established 1751)
- What makes The Anchor different from airport/hotel restaurants
- Team introduction
- Community involvement
- Awards and recognition (5-star hygiene, Google rating, TripAdvisor)

This gives AI engines a canonical source for entity information. Include `AboutPage` schema.

#### F. List on venue aggregator platforms (2-3 hours)
Register The Anchor on:
- **BigVenueBook** (56 venues near Heathrow listed; The Anchor is not one of them)
- **Tagvenue** (16 meeting rooms near Heathrow listed)
- **Zipcube** (30 function rooms near Heathrow listed)
- **Poptop** (party venues)
- **VenueScanner**

These platforms are already cited by AI engines for "function room hire near heathrow" queries. Being listed on them increases the probability of indirect AI citation.

#### G. Expand the blog with "definitive guide" content (4-6 hours per post)
Create blog posts designed to be the definitive answer to common AI queries:

1. **"Complete Guide to Eating Near Heathrow Airport (2026)"** — Compare airport restaurants, hotel restaurants, and The Anchor on price, quality, parking, and experience. Include a comparison table.
2. **"Best Plane Spotting Locations at Heathrow (2026)"** — Position The Anchor alongside Myrtle Avenue and the official viewing area. Include a map, best times, what aircraft to expect. This is content AI engines will cite as authoritative.
3. **"Dog-Friendly Pubs and Restaurants Near Heathrow"** — Include The Anchor and competitors. Being the author of a comprehensive guide increases authority.
4. **"Where to Host a Wake Near Heathrow"** — This is a query with high intent and low competition. The Anchor's private hire for wakes is a strong offering with little competing content.

#### H. Add `containedInPlace` to location schema (30 minutes)
Link The Anchor to its geographic hierarchy:

```json
"containedInPlace": {
  "@type": "AdministrativeArea",
  "name": "Stanwell Moor",
  "containedInPlace": {
    "@type": "AdministrativeArea",
    "name": "Surrey",
    "containedInPlace": {
      "@type": "Country",
      "name": "United Kingdom"
    }
  }
}
```

This helps AI engines understand geographic relationships.

### Priority 3 — Medium Impact, Higher Effort

#### I. Add individual Review schema markup (2-3 hours)
The `createReviewSchema` function exists in `lib/schema.ts` but is not used on any page. Select 5-10 genuine Google reviews and add them as Review schema on the homepage or a reviews page. AI engines cite specific customer quotes when answering "is The Anchor good" queries.

#### J. Create a dedicated "Heathrow Pub Comparison" page (3-4 hours)
A page at `/near-heathrow/comparison` or `/restaurants-near-heathrow/comparison` with a structured comparison table:

| Feature | The Anchor | Three Magpies | Queen's Arms (T2) | Airport Restaurants |
|---------|-----------|---------------|-------------------|-------------------|
| Distance from T5 | 7 mins | 15 mins | Inside T2 | Inside terminals |
| Parking | Free (20 spaces) | Limited | Airport charges | Airport charges |
| Price range | £10-£24 | £12-£22 | £8-£18 | £15-£30 |
| Dog friendly | Yes | Yes | No | No |
| Sunday roast | Yes (from £19.99) | Unknown | No | No |
| Beer garden | Yes (plane spotting) | Small | No | No |

Comparison tables are extremely citable by AI engines.

#### K. Implement `SameAs` expansion (1 hour)
The Organization schema has `sameAs` for Facebook and Instagram. Add:
- TripAdvisor listing URL
- Google Maps/Google Business Profile URL
- WhatPub listing
- CAMRA listing
- Pubs Galore listing
- Barrel & Stone listing

Each `sameAs` link strengthens entity recognition across AI knowledge graphs.

#### L. Create seasonal/timely content updates (ongoing)
AI engines strongly favour recently updated content (content updated within 30 days receives 3.2x more Perplexity citations). Create a cadence of monthly or quarterly content updates:
- Seasonal menu changes
- Upcoming event announcements
- Seasonal beer garden content (summer plane spotting guide)
- Holiday-specific pages (already doing this with Christmas, Valentine's, Mother's Day)

---

## 6. Competitor AI Visibility Analysis

### Direct Competitors

| Competitor | AI Visibility | Why They Get Cited |
|-----------|--------------|-------------------|
| **Three Magpies** (Greene King) | Medium | TripAdvisor reviews, chain brand recognition, "nearest pub to Heathrow" TripAdvisor thread |
| **Queen's Arms** (Fuller's, T2) | Medium | Inside the airport = automatic Heathrow.com listing; Fuller's brand |
| **Hotel restaurants** (Thistle, Hyatt, Radisson) | High for "dining near Heathrow" | Hotel booking platforms, venue aggregator listings, strong structured data from chain CMS |
| **Gordon Ramsay Plane Food** (T5) | High for "food at Heathrow" | Celebrity brand, multiple review platforms, gordonramsayrestaurants.com SEO |

### What Makes Competitors More Citable

1. **Venue aggregator presence:** Hotels dominate "function room" queries because they are listed on BigVenueBook, Tagvenue, Zipcube, and Regus. The Anchor is not on any of these platforms.

2. **Chain CMS structured data:** Greene King (Three Magpies), Fuller's (Queen's Arms), and hotel chains have enterprise-level schema markup deployed consistently across all properties. The Anchor's manual schema implementation is actually more comprehensive but less consistent.

3. **TripAdvisor ranking:** The Anchor is #22 of 95 restaurants in Staines on TripAdvisor. The Three Magpies benefits from being in the "nearest pub to Heathrow" discussion threads on TripAdvisor forums.

4. **Review volume:** AI engines weigh review volume and recency. The Anchor has 300+ Google reviews at 4.6 stars — strong, but encouraging more reviews (especially mentioning specific attributes like "plane spotting", "dog friendly", "near Heathrow") would improve AI citation signals.

### The Anchor's Competitive Advantages for AI

1. **Niche ownership:** "Plane spotting pub" is uniquely The Anchor's. No competitor can claim this.
2. **Dedicated content pages:** Having `/plane-spotting-heathrow`, `/dog-friendly-pub-heathrow`, `/near-heathrow/terminal-5` etc. creates page-level relevance that generic pub listings cannot match.
3. **Free parking USP:** In a market where parking costs £5-15/hour, free parking is a consistently citable differentiator.
4. **Comprehensive FAQ coverage:** 86 pages with FAQ schema is exceptional for a single-location business.

---

## 7. Technical Recommendations Summary

### Immediate (This Week)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Restructure `llms.txt` per recommended format above | `public/llms.txt` | 1 hour |
| 2 | Create `llms-full.txt` with expanded content | `public/llms-full.txt` | 2 hours |
| 3 | Verify AI crawler access (no Cloudflare blocks on GPTBot, PerplexityBot, ClaudeBot) | Cloudflare dashboard | 15 mins |
| 4 | Fix email inconsistency in llms.txt (use correct customer-facing email) | `public/llms.txt` | 5 mins |

### Short Term (Next 2 Weeks)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 5 | Add Menu schema with MenuItem entries to `/food-menu` | `app/food-menu/page.tsx` | 3 hours |
| 6 | Add "definitive answer" first paragraphs to key pages | Multiple page.tsx files | 3 hours |
| 7 | Add MeetingRoom/EventVenue schema to `/function-room-hire` | `app/function-room-hire/page.tsx` | 1 hour |
| 8 | Register on 3-5 venue aggregator platforms | External | 2 hours |
| 9 | Expand `sameAs` in Organization schema | `lib/schema.ts` | 30 mins |
| 10 | Remove SpecialAnnouncement for Monday closure (semantically incorrect) | `lib/schema.ts` | 15 mins |

### Medium Term (Next Month)

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 11 | Create `/about` page with history and entity information | New `app/about/page.tsx` | 3 hours |
| 12 | Write "Complete Guide to Eating Near Heathrow" blog post | New blog content | 4 hours |
| 13 | Write "Best Plane Spotting Locations at Heathrow" blog post | New blog content | 4 hours |
| 14 | Add Review schema with real customer reviews | Homepage or reviews page | 2 hours |
| 15 | Create Heathrow pub comparison table page | New page | 3 hours |
| 16 | Add `containedInPlace` geographic hierarchy to schema | `lib/schema-with-reviews.ts` | 30 mins |
| 17 | Ensure BreadcrumbList schema is on all pages (currently inconsistent) | Multiple page.tsx files | 2 hours |

### Ongoing

| # | Action | Frequency |
|---|--------|-----------|
| 18 | Update `llms.txt` when hours, menu, or events change | Monthly |
| 19 | Publish fresh blog content targeting AI-citable queries | Monthly |
| 20 | Monitor AI search citations (manually query ChatGPT/Perplexity for key terms) | Monthly |
| 21 | Encourage reviews mentioning specific attributes (plane spotting, dog friendly, parking) | Ongoing |
| 22 | Update event dates in schema and llms.txt | As events are scheduled |

---

## 8. Measurement Plan

### How to Track AI Search Visibility

1. **Monthly manual checks:** Query ChatGPT, Perplexity, and Google AI Overviews for the 6 key queries in Section 1. Record whether The Anchor is cited, and what information is presented.

2. **Server log analysis:** Monitor requests from `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Applebot-Extended`, and `Google-Extended` user agents. Track which pages they crawl and how frequently.

3. **Referral traffic:** In Google Analytics / GTM, track referrals from `chat.openai.com`, `perplexity.ai`, and other AI platforms. These will appear as organic or referral traffic.

4. **Google Search Console:** Monitor the "AI Overview" impression and click data when Google makes this available in GSC reports.

5. **Schema validation:** Periodically validate JSON-LD with Google's Rich Results Test and Schema.org Validator to catch errors.

---

## Appendix: Files Referenced in This Audit

| File | Purpose |
|------|---------|
| `/public/llms.txt` | Current llms.txt file |
| `/lib/schema.ts` | Core schema definitions (Organization, LocalBusiness, EventSeries, etc.) |
| `/lib/schema-with-reviews.ts` | Enhanced LocalBusiness schema with reviews and opening hours |
| `/lib/enhanced-schemas.ts` | FAQ, Breadcrumb, Drinks Menu, Place, Service, Speakable, HowTo schemas |
| `/lib/schema-helpers.ts` | Helper functions for Breadcrumb, FAQ, MenuItem, Event, Review, Service schemas |
| `/lib/schema-utils.ts` | Opening hours, kitchen hours, allergen, nutrition, aggregate rating utilities |
| `/lib/opening-hours-schema.ts` | OpeningHoursSpecification builder |
| `/components/seo/DynamicSchema.tsx` | Global schema injection in layout.tsx head |
| `/app/layout.tsx` | Root layout with global metadata and DynamicSchema |
| `/app/page.tsx` | Homepage with FAQs, features, trust signals |
| `/app/robots.ts` | Robots.txt configuration |
| `/app/sitemap.ts` | Dynamic XML sitemap generation |
| `/lib/constants.ts` | Business constants (contact, brand, parking, Heathrow times) |
