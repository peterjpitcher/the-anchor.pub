# Page CRO Implementation Design
**Date:** 2026-03-05
**Status:** Approved
**Approach:** Tier-based by traffic impact, shared components built as needed

---

## Context

GSC data (3-month period): 1,470 clicks, 84,600 impressions, 1.7% CTR, avg position 17.6.

Conversion goals:
- Dining pages: Book a table (BookTableButton)
- Private hire / events: Phone call or enquiry (PhoneButton)

Data files used: `temp/Pages.csv`, `temp/Queries.csv`

---

## Architecture

Changes are targeted edits to existing pages and components. No new pages. One new shared component (`SocialProofStrip`). Each page gets its own focused implementation task.

The existing component library (BookTableButton, CTASection, HeroWrapper, FAQAccordionWithSchema, PhoneButton, FoodStickyCtaBar) is sound. We are changing how components are used, not replacing them.

---

## Shared Component: SocialProofStrip

A compact horizontal bar showing Google star rating + review count. Displayed above or near the first CTA on high-traffic pages.

Used on: Homepage, Beer Garden, Near Heathrow, Food Menu.

Build once as a reusable component. Keep it simple — no new data fetching dependency. Source the rating from the existing reviews infrastructure the site already uses.

---

## Tier 1 — Top Traffic Pages

### 1. Homepage (`/`) — 198 clicks

**Issues:**
- Hero headline is a seasonal greeting (e.g. "Spring at The Anchor") — a cold visitor cannot understand what this place is within 5 seconds
- "Where Everyone's Welcome" tagline has no specific benefit
- No Google star rating visible above the fold
- "What Makes Us Special" feature cards use company-centric language ("Community Hub", "Honest Food") instead of visitor-benefit language
- No mid-page CTA after the features section — long gap before next conversion point
- Bottom CTA heading "Come Visit Us!" is passive

**Changes:**
1. Add static value prop sub-headline in hero: "The closest traditional British pub to Heathrow — 7 mins from T5, free parking, proper food"
2. Add SocialProofStrip into the hero, below the status bar
3. Rewrite the 3 feature card titles/descriptions to lead with visitor outcomes: "Save on airport prices", "Eat before your flight", "Bring your dog"
4. Add BookTableButton CTA immediately after the "What Makes Us Special" section
5. Rewrite bottom CTA heading: "Ready for a proper pub near Heathrow?"

---

### 2. Beer Garden (`/beer-garden`) — 76 clicks

**Issues:**
- Hero has 1 primary + 3 secondary CTAs: "Plane Spotting Guide", "View Drinks Menu", and "Get Directions" all compete with "Book a Table"
- "Get Directions" is low-intent and does not belong in the hero
- No price signals anywhere on the page
- "Smoking Area" listed as a feature alongside "Dog Friendly" and "Family Friendly" — bad optics for families

**Changes:**
1. Remove "Get Directions" from hero secondary CTAs — keep only "Plane Spotting Guide" and "View Drinks Menu"
2. Add price anchor to hero tags or description: "from £10 a main"
3. Add SocialProofStrip above the food cards section
4. Remove "Smoking Area" from the FeatureGrid (move mention to accessibility/facilities prose section if needed)

---

### 3. Near Heathrow (`/near-heathrow`) — 23 clicks, 2,082 impressions

**Issues:**
- Hero primary CTA reads "Book a Table: 01753 682707" but uses BookTableButton — mixes booking and phone intent, confusing
- Hero secondary CTA "Get Directions" scrolls to #terminals — low conversion intent for a cold visitor
- Bottom CTASection only has Phone + Directions buttons — no Book Table CTA at the bottom of the page
- No reviews/social proof section anywhere on this page
- Long page (840 lines) with no sticky CTA bar

**Changes:**
1. Fix hero primary CTA: clean BookTableButton label ("Book a Table") with a separate PhoneButton ("Call Us") as second secondary CTA
2. Rename hero secondary CTA: "View Terminal Directions" (keeps scroll-to-#terminals behaviour, reframes intent)
3. Add GoogleReviews or ReviewSection after the "Why Travelers Love The Anchor" section
4. Add BookTableButton to the bottom CTASection alongside the existing phone/directions buttons
5. Add FoodStickyCtaBar (already used on food-menu and sunday-lunch) to this page

---

### 4. Food Menu (`/food-menu`) — 21 clicks, 1,688 impressions

**Issues:**
- Already has FoodStickyCtaBar and MenuAnchorNav (good)
- Hero CTA and price signalling to be confirmed on full read
- "Near Heathrow" as a menu anchor nav item may distract from booking goal

**Changes:**
1. Confirm hero has BookTableButton as primary CTA — add if missing
2. Add price anchor in hero description: "from £10 — no airport prices here"
3. Evaluate the "Near Heathrow" anchor nav item — remove or rename if it distracts from conversion

---

### 5. Sunday Lunch (`/sunday-lunch`) — 15 clicks, 919 impressions

**Issues:**
- Price signal in title (£19.99) and FoodStickyCtaBar already present (good)
- "Book by Saturday 1pm" urgency needs to be visible in hero without scrolling
- Deposit framed as a warning rather than a trust/commitment signal

**Changes:**
1. Ensure "Book by Saturday 1pm" urgency is visible in the hero without scrolling
2. Reframe the deposit: "£10 deposit per person — secures your table" (positive framing, not just a warning)
3. Confirm a bottom-of-page CTA exists with the booking link

---

## Tier 2 — High-Intent Conversion Pages

### 6. Private Hire hub (`/private-hire`)

**Issues:**
- Primary CTA "Enquire Now" is a plain Button inside a Link — not tracked
- PageTitle "Hosting Life's Important Moments" is vague, no concrete differentiators
- No social proof (testimonials, review score) anywhere on the page
- Hero description is generic

**Changes:**
1. Rewrite hero description: "Private rooms for 10-200 guests · Free parking · Buffet packages · 7 mins from Heathrow"
2. Replace plain Button primary CTA with a tracked component (use PhoneButton pattern or wrap with GTM data attributes)
3. Add one short testimonial or social proof signal near the event-type grid
4. Rewrite PageTitle: "Your Event, Your Space — Private Hire at The Anchor"

---

### 7. Wakes (`/private-hire/wakes`) — 7 clicks, 458 impressions

**Issues:**
- Primary CTA "Check Availability" uses BookTableButton — the table booking flow is designed for dining, not funeral receptions. Wrong tool for an emotionally sensitive occasion.
- Secondary is PhoneButton which is appropriate, but it should be primary here

**Changes:**
1. Replace BookTableButton primary CTA with PhoneButton as primary: "Call Us to Discuss Arrangements"
2. Add a soft secondary CTA: email link or enquiry form anchor if one exists on the page
3. Confirm the bottom of the page has a phone CTA, not a booking button

---

### 8. Pizza Tuesday (`/pizza-tuesday`) — 0 clicks, 545 impressions

**Issues:**
- 0 clicks from 545 impressions (position 13.65 — page 2, so CTR is partly positional)
- Uses DEFAULT_PAGE_HEADER_IMAGE (generic) — no pizza-specific imagery
- "Do I need a voucher?" is a friction signal buried in FAQ — should be resolved above the fold
- On-page conversion path needs confirming

**Changes:**
1. Add "No voucher needed — just book a table and mention Pizza Tuesday" line in hero description or immediately below hero
2. Confirm BookTableButton is present as primary CTA in hero
3. Add urgency signal: "Every Tuesday" with next occurrence date if possible (static text acceptable)
4. Replace DEFAULT_PAGE_HEADER_IMAGE with a pizza-specific image if one exists in `/public/images/food/`

---

### 9. Function Room Hire (`/function-room-hire`) — 3 clicks, 325 impressions

**Note:** Page not read in detail. Confirm before implementing.

**Provisional changes:**
1. Ensure enquiry/phone CTA is primary (not booking form)
2. Add capacity and pricing signals above the fold
3. Add social proof near the enquiry CTA

---

## Tier 3 — Location and Event Pages

Pages: `/near-heathrow/terminal-2` through `/terminal-5`, location pages (`/stanwell-pub`, `/ashford-pub`, etc.), event pages (`/quiz-night`, `/whats-on`, `/live-sport`, `/karaoke`).

**Standard CRO checklist applied uniformly:**
- [ ] Primary CTA in hero: BookTableButton for dining/location pages, PhoneButton for event/private pages
- [ ] SocialProofStrip above or near the first CTA
- [ ] Mid-page CTA at a natural stopping point
- [ ] Bottom CTA with both Book Table + Phone (not just directions)

Terminal pages (`/near-heathrow/terminal-2` etc.) share a template — changes will be applied uniformly across all four.

---

## Decision Log

**Decision:** Use FoodStickyCtaBar on Near Heathrow page
**Reason:** Already built and proven on food-menu and sunday-lunch. Near Heathrow is a long page where the hero CTA scrolls out of view quickly.
**Alternatives:** Build a separate sticky bar; add floating CTA button
**Consequences:** Slight scope reuse; may need to rename component if it becomes non-food-specific

**Decision:** Replace BookTableButton with PhoneButton as primary CTA on Wakes page
**Reason:** The table booking flow (designed for dining) creates friction and tonal mismatch for funeral reception enquiries.
**Alternatives:** Keep BookTableButton but change label; add a separate enquiry form
**Consequences:** May reduce trackable digital conversions in favour of phone calls — acceptable for this occasion type

**Decision:** Build SocialProofStrip as a shared component rather than inline per page
**Reason:** Used on 4+ pages with identical data requirements.
**Alternatives:** Inline on each page
**Consequences:** Small upfront build; avoids duplication across pages

---

## Test Ideas (Post-Implementation)

- Homepage: A/B test seasonal greeting hero headline vs. static value prop headline
- Beer Garden: Test "Book a Table" vs. "Reserve Your Spot" CTA copy
- Near Heathrow: Test SocialProofStrip placement (hero vs. after first section)
- Sunday Lunch: Test deposit framing ("secures your table" vs. "holds your booking")
