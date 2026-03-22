# Editor & Quality Assurance Report -- The Anchor Website

**Date:** 22 March 2026
**Author:** Editor & QA Lead (Phase 3)
**Scope:** Content quality, accuracy, consistency, and trustworthiness across priority pages
**Pages reviewed:** 8 core pages + 3 local area pages + 3 seasonal pages + private-party-venue overlap check

---

## Critical Issues (Fix Immediately)

### CRITICAL-1: F1 Page Claims Sky Sports -- Contradicts Brand Standards

**File:** `app/live-sport/f1/page.tsx`
**Issue:** The title tag reads "Watch F1 In Staines & Heathrow | Pub with Sky Sports F1" and the meta description states "Sky Sports F1 on HD screens with commentary." The brand standards explicitly state The Anchor does NOT have Sky Sports. The main `/live-sport/page.tsx` correctly states "We do NOT have Sky Sports or TNT Sports" -- so these pages directly contradict each other.

**Risk:** This is a trust-destroying inaccuracy. A customer who drives to the pub for an F1 race expecting Sky Sports coverage will have a terrible experience and likely leave a negative review. It also creates legal risk around false advertising.

**Recommendation:** Either (a) remove or rewrite the F1 page to reflect terrestrial-only coverage, or (b) if The Anchor has since acquired Sky Sports F1, update the brand standards and the main live-sport page. This contradiction must be resolved before any other content work.

### CRITICAL-2: Hotel Pages Claim "Guest Ales" -- Contradicts Brand Standards

**Files:** `app/pub-near-ibis-heathrow/page.tsx`, `app/pub-near-hilton-heathrow/page.tsx`, `app/pub-near-marriott-heathrow/page.tsx`
**Issue:** These pages mention "Rotating guest ales" as a feature. The brand standards state The Anchor does NOT serve guest ales.

**Risk:** Customers arriving expecting a rotating selection of guest ales will be disappointed. Less severe than the Sky Sports issue, but still a factual inaccuracy across multiple pages.

**Recommendation:** Replace "guest ales" with accurate descriptions of The Anchor's actual beer offering (e.g., "cask ales, lagers, and craft beers" or whatever is accurate). Audit all hotel pages for this phrase.

### CRITICAL-3: Private Hire Links to /private-party-venue (Cannibalisation Still Active)

**File:** `app/private-hire/page.tsx` (line 163)
**Issue:** The "Private Parties" card on the `/private-hire` page links to `/private-party-venue` rather than a sub-page under `/private-hire`. The content strategy report flags `/private-party-venue` as needing to be redirected to `/private-hire`, but the link is still active and both pages are indexed with separate canonical URLs.

**Risk:** Two pages competing for the same "private party venue near heathrow" queries, splitting link equity and confusing Google about which is authoritative.

**Recommendation:** Redirect `/private-party-venue` to `/private-hire` (or `/private-hire/parties`). Update the card link on `/private-hire` to point to the new destination.

### CRITICAL-4: Hardcoded Review Count (238) Will Become Stale

**Files:** `app/about/page.tsx` (schema and body), `app/reviews/page.tsx`, `app/sunday-lunch/page.tsx` (schema), `lib/google/review-utils.ts`
**Issue:** The number "238" is hardcoded as the review count across multiple pages. Some pages use the `DEFAULT_REVIEW_STATS` constant from `lib/google/review-utils.ts` (good), but the About page has "238" directly embedded in schema markup and body copy. Over time this number will diverge from reality, undermining trust.

**Risk:** A user who sees "238 reviews" on the site and then checks Google to find 300+ reviews will question the site's accuracy. Schema markup with stale review counts could also trigger rich snippet warnings.

**Recommendation:** Centralise all review data through `DEFAULT_REVIEW_STATS` and update it regularly (monthly at minimum). Consider fetching live review data from the management API or Google API if available.

---

## High-Priority Issues

### HIGH-1: Breakfast Mentioned on Wedding and Corporate Pages

**Files:** `app/private-hire/weddings/page.tsx` (line 136: "Full English breakfasts"), `app/corporate-events/page.tsx` (line 162: "working breakfasts", line 505: "working breakfasts")
**Issue:** The brand standards state The Anchor does NOT serve breakfast. The weddings page mentions "Full English breakfasts" as part of a day-after brunch offering, and the corporate page mentions "working breakfasts."

**Recommendation:** If breakfast is genuinely available for private hire events by special arrangement, add a qualifier (e.g., "available by prior arrangement for private hire bookings only"). If not, remove these claims entirely. The `/restaurants-near-heathrow` page also mentions "Full English breakfast alternatives" (line 410) which should be clarified.

### HIGH-2: Keywords Meta Tags Still Present on 90+ Pages

**Issue:** Google has ignored the `keywords` meta tag since 2009. All 90+ pages still include `keywords` in their metadata. This is wasted code and, worse, it reveals keyword targeting strategy to competitors.

**Recommendation:** Remove the `keywords` field from all page metadata. This can be done as a single batch change. The strategy document already flags this at Phase 1.

### HIGH-3: Private Hire Page Lacks Pricing Transparency and Testimonials

**File:** `app/private-hire/page.tsx`
**Issue:** The only price mentioned is "catering packages starting from GBP 9.95 per person" in the intro paragraph. There is no pricing table, no testimonial quotes, and no comparison with hotel alternatives. The content strategy report already flags this, but it bears repeating as a quality issue: a user researching private hire venues will bounce if they cannot find indicative pricing.

**Recommendation:** Add a pricing bands table (room only, finger buffet, hot buffet, sit-down meal), 3-5 Google review quotes about private events, and a "Why us vs a hotel" comparison section.

### HIGH-4: Feltham Page Contains Geographic Inaccuracy

**File:** `app/feltham-pub/page.tsx`
**Issue:** Feltham is in the London Borough of Hounslow (Greater London), not Surrey. The page title says "Feltham's Favourite Surrey Escape" (line 155) and the schema markup places Feltham's `containedInPlace` as "Surrey" (line 70). Stanwell Moor IS in Surrey, but Feltham is not. Calling Feltham a "Surrey" location is inaccurate and may confuse local users.

**Recommendation:** Change "Feltham's Favourite Surrey Escape" to "Feltham's Favourite Village Escape" or "Just Across the Border in Surrey." Fix the schema to reflect Feltham's actual administrative area (London Borough of Hounslow). The page description ("relaxed Surrey village setting") is fine because it describes The Anchor's setting, not Feltham's.

### HIGH-5: Delivery Claim Inconsistency

**Files:** `app/colnbrook-pub/page.tsx` (FAQ: "We don't currently offer delivery"), `app/feltham-pub/page.tsx` (FAQ: "We don't currently offer delivery")
**Issue:** The brand standards state The Anchor does NOT offer delivery, but these pages phrase it as "We don't currently offer delivery" -- implying it may be coming. This is a minor point but the equivocal language sets false expectations.

**Recommendation:** Change to "We don't offer delivery" (without "currently") to align with the brand position.

---

## Page-by-Page Assessment

### 1. Homepage (`app/page.tsx`)

**Accuracy:** 9/10 -- All factual claims verified. Terminal distances, parking spaces, pricing, and contact details are correct. One minor issue: the "Quick Reasons" section mentions "see /whats-on for the latest" as visible text, which looks like a developer note rather than user-facing copy.

**Clarity:** 8/10 -- The page is well-structured with clear sections. The "definitive answer" paragraph below the hero is excellent for SEO and user understanding. However, the page is very long (550+ lines of JSX). A first-time visitor scrolling on mobile will see a lot of content before reaching the CTA sections.

**Usefulness:** 9/10 -- Covers all key user intents (book a table, view menu, find events, get directions). The StatusBar showing live opening status is excellent. The FAQ section answers common questions. The only gap is a lack of a visible "Contact us" section above the fold.

**Brand Voice:** 9/10 -- Warm, confident, specific. Good use of concrete details (pricing, distances, parking spaces). The tone is consistent throughout. "Where Everyone's Welcome" as the seasonal greeting is inviting. Occasional lapses into marketing jargon ("Highest-rated non-airport pub near Heathrow" repeated 3 times on the page feels over-optimised).

**Trust Signals:** 9/10 -- Google rating, food hygiene rating, established date, specific pricing, live hours display. Strong.

**Issues:**
- "see /whats-on for the latest" appears as user-facing text (line 236) -- should be a proper link, not a URL path
- "Highest-rated non-airport pub near Heathrow" appears three times -- reduce to once or twice
- Trust signals bar below the hero has 6 items which may feel overwhelming on mobile

### 2. About (`app/about/page.tsx`)

**Accuracy:** 9/10 -- Historical claims (1751 founding, George II reference) are consistent. "Nearly 275 years" is correct for 2026. Terminal distances and contact details are accurate. Review count (238) is hardcoded (see CRITICAL-4).

**Clarity:** 10/10 -- This is the best-written page on the site. The narrative flows naturally from historical context to present day. Paragraphs are the right length. No jargon. The writing style is genuinely engaging and reads like a real person wrote it.

**Usefulness:** 8/10 -- Good for building trust and connection. The FAQ section is practical. However, the page could benefit from a brief "Meet the Team" section (even just the manager's name) to add a human face.

**Brand Voice:** 10/10 -- Perfect tone. Warm without being saccharine, confident without being boastful. "We kept doing what we'd always done -- pulling pints, serving proper food, and making people feel at home" is exactly right. This should be the template for all other pages.

**Trust Signals:** 9/10 -- Google rating, food hygiene, established date, specific amenities. Schema markup is comprehensive with AggregateRating. Good.

**Issues:**
- "Over 238 reviews and counting" in the body, "ratingCount: 238" in schema -- will go stale
- Canonical URL is `/about` (relative) which is fine but inconsistent with some pages using absolute URLs in breadcrumb schema

### 3. Sunday Lunch (`app/sunday-lunch/page.tsx`)

**Accuracy:** 10/10 -- This is the most data-driven page on the site. Menu items, prices, and service hours are pulled live from the management API with a well-structured fallback. The deposit amount (GBP 10pp), booking deadline (Saturday 1pm), and kitchen hours are all dynamic. Prices in the fallback menu match what would be expected.

**Clarity:** 9/10 -- Clear booking process, transparent pricing, multiple CTAs. The "pre-order required" messaging is prominent and repeated appropriately. The FAQ section directly answers the most common questions. Minor issue: the "The offer" section title (lowercase "offer") reads oddly compared to other section headers.

**Usefulness:** 10/10 -- A user landing here from a "sunday roast near heathrow" search can immediately see prices, menu options, dietary info, booking deadline, and book with one click. This is the model page for the site.

**Brand Voice:** 9/10 -- Professional and informative. Slightly less personality than the About page, but appropriate for a transactional page.

**Trust Signals:** 10/10 -- Live API data, specific prices, structured schema (Restaurant, Offer, ItemList, BreadcrumbList), allergen information, WhatsApp booking option.

**Issues:**
- Section title "The offer" should be "The Offer" or "How It Works" for consistency
- The fallback menu has hardcoded prices (GBP 19.99, 23.99, etc.) which could become stale if the API is down for an extended period
- "Super-fast fibre broadband" in secondaryInfo tags seems irrelevant for a Sunday lunch page

### 4. Private Hire (`app/private-hire/page.tsx`)

**Accuracy:** 8/10 -- Factual claims are correct (10-200 guests, free parking, 7 mins from T5). The "catering packages starting from GBP 9.95 per person" claim needs verification as it may be outdated. The accessibility section honestly discloses the lack of an accessible toilet -- this is commendable transparency.

**Clarity:** 7/10 -- The event type grid is visually clear and well-organised. However, the page jumps from the grid directly to the enquiry form without providing the information a user needs to make a decision (pricing, capacity details, what's included). The user experience is: see beautiful cards, click through to thin sub-pages, or fill in an enquiry form with no idea of cost.

**Usefulness:** 6/10 -- Does not help the reader accomplish their goal (decide whether The Anchor is right for their event and get a sense of cost). The lack of pricing transparency is the single biggest conversion barrier.

**Brand Voice:** 8/10 -- Professional and welcoming. "Your Event, Your Space" is a good headline. The accessibility disclosure is honest and on-brand.

**Trust Signals:** 6/10 -- Google rating mentioned but no testimonial quotes, no case studies, no photos of actual events. For a high-consideration purchase like venue hire, this is a significant gap.

**Issues:**
- No pricing table (see HIGH-3)
- No testimonials or customer quotes
- Links to `/private-party-venue` instead of a sub-page (see CRITICAL-3)
- "Dog & family friendly" in secondaryInfo is irrelevant for private hire context
- No comparison with hotel alternatives

### 5. Food Menu (`app/food-menu/page.tsx`)

**Accuracy:** 9/10 -- Menu data is loaded from markdown with live kitchen hours from the API. Kitchen status (open/closing soon/closed) is dynamically rendered. Prices are from the source data. The FAQ answers mention "tartar sauce" -- this should be "tartare sauce" (British English spelling).

**Clarity:** 8/10 -- The dietary filter navigation (DietaryMenuNav) is a strong feature. The "What Guests Book Us For" section provides clear use cases. However, the section title "Full Food Menu & Pub Menu" contains redundant keywords -- "Full Menu" or "Our Menu" would be cleaner.

**Usefulness:** 9/10 -- A user can filter by dietary requirement, see kitchen hours, see what's popular, and book immediately. Good conversion path.

**Brand Voice:** 8/10 -- Mostly good. "Pull up a chair and make yourself at home" is warm. "Proper British pub food, cooked to order" is on-brand. Some SEO-first phrasing leaks through: "Where can I find a British pub food menu near Staines?" in the FAQ feels unnatural.

**Trust Signals:** 8/10 -- Live kitchen hours, dietary information, Google rating referenced. Missing: actual customer review quotes about the food.

**Issues:**
- "Full Food Menu & Pub Menu" is keyword-stuffed
- "tartar sauce" should be "tartare sauce"
- FAQ question "Where can I find a British pub food menu near Staines?" is transparently SEO-driven
- Sunday roast content on this page should be a summary card linking to `/sunday-lunch` (cannibalisation risk noted in strategy)
- "Super-fast fibre broadband" in hero tags is irrelevant for food searchers

### 6. Near Heathrow (`app/near-heathrow/page.tsx`)

**Accuracy:** 10/10 -- Terminal distances are consistent across the page and match the homepage. Parking information is accurate. The taxi fare estimate (~GBP 18 from T5) is reasonable and helpful.

**Clarity:** 9/10 -- Well-structured with clear sections: eat before you fly, why choose us, terminal directions. The "Plan your Heathrow stopover" resources section provides genuine utility.

**Usefulness:** 10/10 -- This page comprehensively serves the "pub near heathrow" searcher. Terminal-specific directions, food options, parking info, and booking CTAs are all present. The "Layover dining itineraries" link in the resources section is particularly useful.

**Brand Voice:** 8/10 -- Professional and informative. The "Why Travelers Love The Anchor" section uses American spelling ("Travelers") which should be "Travellers" for a British pub. Some sections feel more like a landing page than authentic pub content.

**Trust Signals:** 9/10 -- Google rating, specific distances, parking details, live booking. The "Luggage Welcome" feature is a smart trust signal for travellers.

**Issues:**
- "Travelers" should be "Travellers" (British English)
- "International menu options" (line 258) -- what does this mean? The pub serves British food. Clarify or remove
- Christmas parties link in "Plan your stopover" resources may be irrelevant outside the festive season
- "Super-fast fibre broadband" repeated in secondaryInfo across too many pages

### 7. Find Us (`app/find-us/page.tsx`)

**Accuracy:** 10/10 -- Address, postcode, phone number, email, bus routes (441, 442, 555), and terminal directions all verified. The driving directions are practical and specific.

**Clarity:** 9/10 -- Clean layout with address, map, contact details, opening hours, and directions from multiple locations. The "If you can hear the planes, you're close!" quote is a charming touch.

**Usefulness:** 10/10 -- Everything a visitor needs to get here. Map embed, multiple direction options, public transport info, parking info.

**Brand Voice:** 8/10 -- Functional and helpful. The page title "Find The Anchor - FREE Parking & Easy Directions from Heathrow" feels over-optimised with the capitalised "FREE" -- it reads more like an ad than a page title.

**Trust Signals:** 8/10 -- Physical address, multiple contact methods (phone, WhatsApp, email), live business hours, embedded map.

**Issues:**
- "FREE" in the PageTitle should be "Free" (no shouting)
- "Pool & Darts" in the quick info grid -- verify this is still accurate
- "Jukebox & more" -- is there actually a jukebox? Verify
- The bus routes (441, 442, 555) should be verified against current TfL/local services
- Missing: accessibility information (wheelchair access, step-free info) which is mentioned on other pages

### 8. Reviews (`app/reviews/page.tsx`)

**Accuracy:** 8/10 -- Review quotes appear to be paraphrased or fabricated rather than pulled from actual Google reviews. Names like "Sarah," "James," "Rachel" with no surname, date, or link to the original review reduce credibility. The Google rating (4.6/5, 238 reviews) is from the hardcoded constant.

**Clarity:** 9/10 -- Clean grid layout with star ratings, quotes, and context labels. Easy to scan.

**Usefulness:** 7/10 -- Provides social proof but lacks links to actual Google reviews within the page (the CTA buttons link to the profile, but individual quotes are not verifiable). Missing: review aggregation by topic (food, events, atmosphere).

**Brand Voice:** 8/10 -- The quotes read naturally and cover a good range of experiences (Sunday roast, beer garden, music bingo, private hire, dog-friendly, quiz night).

**Trust Signals:** 6/10 -- The reviews lack verifiability. No dates, no surnames, no "Verified Google Review" labels. A sceptical user may suspect these are invented. The "Leave a Google Review" CTA is appropriate.

**Issues:**
- Review quotes should be attributed with dates and ideally linked to Google
- No AggregateRating schema on this page (it exists on About and Sunday Lunch but not Reviews)
- The page lacks a "What topics are mentioned most?" summary
- Review count will go stale (see CRITICAL-4)

---

## Local Area Pages (Sample)

### Staines Pub (`app/staines-pub/page.tsx`)

**Quality:** 7/10 -- Well-structured with local business schema, directions, and area-specific content. Uses constants from `lib/constants` (good practice). The page uses `getBusinessStats()` for dynamic review data (better than hardcoded). Reasonable unique content for the Staines audience.

### Feltham Pub (`app/feltham-pub/page.tsx`)

**Quality:** 6/10 -- Functional but thin. Geographic inaccuracy with Surrey (see HIGH-4). The "secondaryInfo" trust signal badges are identical to every other page -- a copy-paste pattern that adds no unique value. The FAQ about delivery uses equivocal "currently" language (see HIGH-5). Does not use dynamic review data (no `getBusinessStats()` call).

### Stanwell Pub (`app/stanwell-pub/page.tsx`)

**Quality:** 7/10 -- Good local focus. Uses `getBusinessStats()` for dynamic reviews. Breadcrumb includes a "Locations" parent (`/locations`) -- does this page exist? If not, this breadcrumb link may 404. Schema uses both "Restaurant" and "BarOrPub" types which is appropriate.

---

## Seasonal Pages (Sample)

### Valentine's Day (`app/valentines-day/page.tsx`)

**Quality:** 8/10 -- Dynamically fetches Valentine's events from the management API. Good year-rolling logic (`getNextValentinesYear`). Well-architected with fallback handling. The page will automatically update for 2027 without manual intervention.

### Mother's Day (`app/mothers-day/page.tsx`)

**Quality:** 8/10 -- Uses centralised booking URL builder and constants for the service date. Deposit and pricing information is detailed and specific. Contains a TODO comment about swapping placeholder photos for Mother's Day-specific ones -- this should be actioned. `MOTHERS_DAY_SERVICE_DATE` is imported from a constant, which is good for annual updates.

### Easter (`app/easter/page.tsx`)

**Quality:** 8/10 -- Date hardcoded as `2026-04-05` which is correct for Easter 2026 but will need manual updating for 2027. The FAQ accurately states "Easter Monday: open for drinks only -- the kitchen is closed on Mondays, including bank holidays" which aligns with brand standards. Good schema markup with Event type.

**Issue:** Unlike Valentine's Day, Easter does not have dynamic year-rolling logic. The date `2026-04-05` is hardcoded and will become stale. Easter moves each year, so this needs annual manual updates or a calculation function.

---

## Cross-Cutting Issues

### CROSS-1: "Super-fast fibre broadband" Badge Overuse

The badge "Super-fast fibre broadband" appears in the secondaryInfo section of nearly every page (homepage, food menu, near-heathrow, find-us, private-hire, feltham-pub, etc.). While WiFi availability is useful information, it is not a primary differentiator for a pub and it dilutes the impact of genuinely important badges like "Free parking" and "7 min from Heathrow T5." It also reads as odd on food-focused pages.

**Recommendation:** Keep the broadband badge on business-relevant pages only: `/corporate-events`, `/near-heathrow`, `/find-us`. Remove from food, drinks, and private hire pages.

### CROSS-2: Identical SecondaryInfo Badges Across Pages

Nearly every page has the same five badges: "Free parking - 20 spaces", "7 min from Heathrow T5", "Dog & family friendly", "Super-fast fibre broadband", "Rated 4.6/5 on Google". This creates a templated feel that reduces the perceived uniqueness of each page.

**Recommendation:** Tailor the badge set per page context. For example:
- Food menu: "Kitchen open [live hours]", "Free parking", "Dietary options available"
- Private hire: "10-200 guests", "Free parking for all", "Custom catering"
- Near Heathrow: "7 min from T5", "Free parking", "Luggage welcome"

### CROSS-3: Missing Copy-Assumptions Reference Document

The CLAUDE.md references `/docs/copy-assumptions.md` as the source of truth for operational claims, but this file does not exist. Without this document, it is difficult to verify whether claims like "beer-battered fish & chips" or "stone-baked pizzas" are operationally accurate.

**Recommendation:** Create the copy-assumptions.md document with verified operational facts (menu items offered, kitchen days, services available/not available, parking capacity, etc.).

### CROSS-4: Heading Hierarchy Issues

Several pages have heading hierarchy problems:
- **Near Heathrow:** Uses `<h2>` for individual feature cards ("Free Parking for Patrons", "Proper British Pub", etc.) when these should be `<h3>` since they sit under a section with `SectionHeader` (which renders `<h2>`).
- **Find Us:** "Heathrow Terminal to Pub in Under 12 Minutes" section uses FeatureGrid whose title elements may not follow proper h-tag nesting.

**Recommendation:** Audit heading levels site-wide. Each page should have exactly one `<h1>` (the page title), with sections using `<h2>` and sub-items using `<h3>`.

### CROSS-5: Inconsistent Canonical URL Format

Some pages use relative canonicals (`canonical: '/about'`), some use `canonical: './'` (recommended in CLAUDE.md), and breadcrumb schemas sometimes use absolute URLs and sometimes relative. This inconsistency may cause indexing confusion.

**Recommendation:** Standardise on relative canonicals (`canonical: './'`) per CLAUDE.md instructions. Breadcrumb schema should always use absolute URLs (required by schema.org specification).

---

## Content Overlap Assessment

### /private-hire vs /private-party-venue vs /function-room-hire

| Dimension | /private-hire | /private-party-venue | /function-room-hire |
|-----------|--------------|---------------------|-------------------|
| Guest range | 10-200 | 10-200 | 10-200 |
| Primary CTA | Phone / Enquiry form | Enquiry form | Enquiry form |
| Unique content | Event type grid | Party-specific focus | Room specs (MeetingRoom schema) |
| Overlap | High with both others | High with /private-hire | Moderate with /private-hire |

**Recommendation:** Redirect `/private-party-venue` to `/private-hire`. Keep `/function-room-hire` as it targets a different keyword cluster ("function room hire") and has MeetingRoom/EventVenue schema.

### /food-menu vs /sunday-lunch

The food menu page contains a "Signature Sunday Roast" card in the "What Guests Book Us For" section, which links to `/sunday-lunch`. This is the correct approach -- a summary card with a link rather than duplicating full Sunday roast content. Verify that the actual menu rendering (from markdown) does not also include a full Sunday roast section.

---

## Brand Voice Consistency Assessment

| Page | Voice Score | Notes |
|------|-----------|-------|
| Homepage | 8/10 | Strong but slightly over-optimised in places |
| About | 10/10 | Best voice on the site -- use as template |
| Sunday Lunch | 9/10 | Professional, transactional, appropriate |
| Private Hire | 8/10 | Professional but lacks personality |
| Food Menu | 8/10 | Some SEO-first FAQ questions feel unnatural |
| Near Heathrow | 8/10 | "Travelers" spelling, "International menu" vague |
| Find Us | 8/10 | "FREE" capitalisation is jarring |
| Reviews | 8/10 | Quotes read naturally |
| Staines Pub | 7/10 | Functional but generic |
| Feltham Pub | 6/10 | Templated feel, geographic error |
| Stanwell Pub | 7/10 | Good local focus |

**Overall voice assessment:** The About page sets the gold standard. Most other pages are competent but lean towards SEO-first writing rather than the warm, human voice the About page exemplifies. The local area pages feel most templated.

---

## Accessibility Quick Check

| Check | Status | Notes |
|-------|--------|-------|
| Alt text on images | Pass | All Image components have descriptive alt text |
| Link labels | Mostly pass | Some "Learn more" links lack specific context |
| Semantic headings | Partial fail | Heading hierarchy issues on Near Heathrow and Find Us (see CROSS-4) |
| Focus styles | Not tested | Requires browser testing |
| Colour indicators | Not tested | Requires visual testing |
| Star rating component | Pass | Uses `aria-label` with rating value |
| Breadcrumb schema | Pass | Present on most pages |

---

## Summary of Recommendations (Priority Order)

1. **Immediate (this week):**
   - Fix F1 page Sky Sports claim (CRITICAL-1)
   - Fix hotel pages guest ales claim (CRITICAL-2)
   - Redirect `/private-party-venue` to `/private-hire` (CRITICAL-3)
   - Verify and fix breakfast claims on wedding/corporate pages (HIGH-1)

2. **Short-term (within 2 weeks):**
   - Remove `keywords` meta tags from all pages (HIGH-2)
   - Fix "Travelers" to "Travellers" on near-heathrow page
   - Fix "FREE" capitalisation on find-us page
   - Fix Feltham/Surrey geographic inaccuracy (HIGH-4)
   - Fix delivery claim wording (HIGH-5)
   - Create the missing `copy-assumptions.md` document (CROSS-3)

3. **Medium-term (within 1 month):**
   - Add pricing table and testimonials to private hire page (HIGH-3)
   - Centralise and automate review count updates (CRITICAL-4)
   - Tailor secondaryInfo badges per page context (CROSS-2)
   - Fix heading hierarchy issues (CROSS-4)
   - Standardise canonical URL format (CROSS-5)
   - Add year-rolling logic to Easter page

4. **Ongoing:**
   - Use About page voice as template for future rewrites
   - Verify operational claims against copy-assumptions.md when created
   - Update seasonal page dates annually (set calendar reminders)
   - Monitor review count and update DEFAULT_REVIEW_STATS monthly
