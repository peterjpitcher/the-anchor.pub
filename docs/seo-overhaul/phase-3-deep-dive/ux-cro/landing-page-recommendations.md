# Landing Page Recommendations -- The Anchor SEO Overhaul

**Date:** 22 March 2026
**Author:** UX/CRO Specialist (Phase 3)
**Purpose:** Actionable implementation specifications for every recommendation in the UX/CRO report
**Priority:** Each recommendation is ranked by estimated conversion impact and implementation effort

---

## Tier 1 -- High Impact, Low-Medium Effort

### R1: Condense Hero Trust Badges on Mobile

**Problem:** Every page shows 5 identical trust badges ("Free parking - 20 spaces", "7 min from Heathrow T5", "Dog & family friendly", "Super-fast fibre broadband", "Rated 4.6/5 on Google") in the hero `secondaryInfo` prop. On a 375px mobile screen, these consume ~100-120px of vertical space and push actionable content below the fold. The badges are identical on every page, creating visual fatigue for returning visitors.

**Impact:** Recovering 100-120px of above-fold real estate on mobile across 7+ landing pages. This moves the primary conversion element (booking form, menu, event card) approximately one scroll-height closer to the initial viewport.

**Implementation:**

1. Create a responsive badge display pattern:
   - Mobile (< 640px): Show only the 3 most relevant badges per page, chosen by page context
   - Tablet and desktop (>= 640px): Show all 5 badges (current behavior)

2. Page-specific badge selection for mobile:

| Page | Mobile badges (3 of 5) | Rationale |
|------|----------------------|-----------|
| Homepage | Free parking, 7 min from Heathrow, Rated 4.6/5 | Core discovery signals |
| Book a Table | Free parking, 7 min from Heathrow, Dog & family friendly | Practical booking decision factors |
| Sunday Lunch | Rated 4.6/5, Free parking, Dog & family friendly | Trust + practical for families |
| Private Hire | 10-200 guests, Free parking, 7 min from Heathrow | Capacity and logistics for event planners |
| Near Heathrow | 7 min from Heathrow, Free parking, Rated 4.6/5 | Distance proof for travellers |
| Quiz Night | Free parking, 7 min from Heathrow, Dog & family friendly | Practical attendance factors |
| Heathrow Parking | Free parking, 7 min from Heathrow, Rated 4.6/5 | Core parking decision factors |

3. Implementation approach:
   - Add a `mobileBadges` prop (or `maxMobileBadges={3}` with priority ordering) to the badge rendering in each page's `secondaryInfo`
   - Use `hidden sm:inline-flex` on lower-priority badges so they appear only on larger screens
   - Alternatively, refactor the duplicated badge JSX into a shared `<TrustBadges context="booking" />` component that handles per-page selection internally

**Files to modify:** Each page file's `secondaryInfo` JSX block. Consider extracting to a shared component in `components/layout/TrustBadges.tsx`.

**Effort:** 2-3 hours
**Expected impact:** 5-10% improvement in above-fold engagement on mobile across all landing pages

---

### R2: Add Pricing, Testimonials, and "Small Venue" Positioning to Private Hire

**Problem:** The /private-hire page has zero pricing visibility (only "from GBP 9.95pp" in body text), zero customer testimonials, and no positioning against hotel alternatives. This is the weakest revenue page relative to its commercial importance.

**Impact:** Private hire is the second-highest revenue stream. Adding pricing transparency, social proof, and competitive positioning directly addresses the three most common objections from event bookers: "How much will it cost?", "Is it any good?", and "Why not a hotel?"

**Implementation:**

1. **Add a pricing bands section** between the event type grid and the PrivateBookingSection:

```
Location: app/private-hire/page.tsx, after the closing </div> of the 6-card event grid (around line 228)

Content structure:
<section className="py-12 bg-anchor-bg border-b border-anchor-gold/15">
  <Container>
    <SectionHeader title="Pricing Guide" subtitle="Transparent pricing -- no hidden fees" />

    Pricing table with 4 rows:
    | Package | Includes | From (per person) |
    | Room only | Exclusive space, private bar access | GBP X (or "Call for quote") |
    | Finger buffet | Room + cold buffet selection | GBP 9.95 |
    | Hot buffet | Room + hot and cold options | GBP 14.95 |
    | Sit-down meal | 3 courses, table service | GBP 24.95 |

    Note: "All packages include free parking for all guests. Pricing varies by day, time, and guest count. Use our quote calculator below for an instant estimate."
  </Container>
</section>
```

2. **Add a testimonials section** after pricing:

```
Content structure:
<section className="py-12 bg-anchor-bg-raised border-b border-anchor-gold/15">
  <Container>
    <SectionHeader title="What Our Event Guests Say" />

    3-5 Google review quotes specifically about private events.
    Source these from the pub's Google Business Profile.
    Format: Quote text, reviewer first name, event type (e.g. "-- Sarah, 50th Birthday")

    Link to /reviews page for more.
  </Container>
</section>
```

3. **Add "Small Parties Welcome" positioning:**

```
Location: Within the existing definitive answer paragraph (line 87-89)

Change from:
"The Anchor offers function room hire for 10 to 200 guests..."

Change to:
"The Anchor offers function room hire for 10 to 200 guests near Heathrow Airport,
with free parking for all attendees and custom catering packages starting from
GBP 9.95 per person. Small gatherings of 10-30 guests are our specialty --
no minimum spend requirements and no need to fill a 200-seat hotel ballroom.
The venue is 7 minutes from Terminal 5 and ideal for corporate events,
celebrations, and wakes."
```

4. **Add "Why Not a Hotel?" comparison card:**

```
Location: After testimonials section, before PrivateBookingSection

Content structure:
Comparison table:
| Factor | The Anchor | Typical Heathrow Hotel |
| Minimum guests | 10 | 50-100 |
| Room hire | From GBP X | From GBP 500+ |
| Parking | Free (20 spaces) | GBP 20-40 per car |
| Catering per head | From GBP 9.95 | From GBP 35+ |
| Flexibility | Your music, your decor | Hotel restrictions |
| Distance from Heathrow | 7 mins | 0-15 mins |
```

**Files to modify:** `app/private-hire/page.tsx`
**Data dependency:** Pricing figures need verification with the business. Testimonials need sourcing from Google Reviews.

**Effort:** 4-6 hours
**Expected impact:** 20-40% improvement in enquiry conversion rate on existing /private-hire traffic; essential for supporting increased organic traffic from SEO improvements

---

### R3: Move Price Comparison Above Booking Wizard on Heathrow Parking

**Problem:** The price comparison table (Anchor vs Heathrow official parking) appears below the ParkingBookingWizard. Visitors must commit to interacting with the booking tool before seeing evidence that The Anchor is cheaper.

**Impact:** Establishing value before requesting commitment is a fundamental conversion principle. The comparison table is the strongest trust signal on the page.

**Implementation:**

In `app/heathrow-parking/page.tsx`, restructure the content flow:

Current order:
1. Hero
2. PageTitle
3. ParkingBookingWizard
4. Feature highlights
5. Terminal guides
6. **Price comparison table** (currently here)
7. Terminal landing pages
8. Reviews
9. FAQ

New order:
1. Hero
2. PageTitle
3. **Price comparison table** (move here)
4. ParkingBookingWizard
5. Feature highlights
6. Terminal guides
7. Terminal landing pages
8. Reviews
9. FAQ

Move the comparison table section (the `comparisonRows` rendering) to appear directly after the PageTitle/definitive answer section and before the ParkingBookingWizard.

Add a transition CTA between the comparison table and the wizard: "See the savings? Book your space now." with an anchor link to `#booking-wizard`.

**Files to modify:** `app/heathrow-parking/page.tsx`

**Effort:** 1 hour
**Expected impact:** 10-15% improvement in booking wizard engagement

---

### R4: Reorder Quiz Night Page Content

**Problem:** The quiz night page shows: rating strip -> PageTitle -> descriptive paragraph -> "Next quiz night" card. The most actionable information (when is the next quiz, can I book) is behind two informational sections.

**Impact:** Quiz night searchers have high intent -- they want to know the next date and book. Delaying this information increases bounce risk.

**Implementation:**

In `app/quiz-night/page.tsx`, restructure the section order after the hero:

Current order:
1. Google rating strip
2. PageTitle + descriptive paragraph
3. Next quiz night card
4. "Why we love it" features
5. Prizes
6. Upcoming dates
7. FAQ
8. CTA section
9. Map

New order:
1. Next quiz night card (move to first position -- this is what searchers want)
2. PageTitle + brief descriptive paragraph (shortened to 2 sentences)
3. Upcoming dates (if more than one)
4. Prizes
5. "Why we love it" features
6. FAQ
7. CTA section

Remove: Google rating strip (redundant with hero badges), Google Map embed (unnecessary weight, /find-us handles this).

**Files to modify:** `app/quiz-night/page.tsx`

**Effort:** 1-2 hours
**Expected impact:** 15-20% reduction in bounce rate for quiz night searchers

---

### R5: Replace FAB Icon and Resolve Z-Index Conflict

**Problem:** The FloatingActions button uses a "+" icon (SVG plus sign that rotates 45 degrees to become "x" on open). This communicates "add" or "create," not "contact" or "book." Additionally, the FAB (z-50) and FoodStickyCtaBar (z-60) both occupy the bottom-right area on food pages, creating visual overlap.

**Impact:** A clearly-labelled FAB increases utilization. Resolving the z-index conflict eliminates the confusing experience of two overlapping action elements.

**Implementation:**

1. **Change FAB icon and label:**

In `components/layout/FloatingActions.tsx`, replace the plus/cross SVG:

```
Current (line 136-146):
<svg> with plus-sign path

Replace with:
When closed: A phone handset icon or the text "Need Help?" in a pill shape
When open: An "X" close icon (not a rotated "+")
```

Option A (icon change): Replace the SVG with a phone icon from the project's Icon component, or use a chat-bubble SVG. Add `aria-label="Contact options"`.

Option B (text FAB): Change from a 56px circle to a pill-shaped button with text:
```
<button className="bg-anchor-gold ... rounded-full px-4 py-3 flex items-center gap-2">
  <PhoneIcon className="w-5 h-5" />
  <span className="text-sm font-semibold">Need Help?</span>
</button>
```

2. **Resolve z-index conflict with FoodStickyCtaBar:**

In `components/layout/FloatingActions.tsx`, add conditional rendering:
- If FoodStickyCtaBar is visible (food/drink pages on mobile), hide the FAB
- Implementation: Add a `data-sticky-cta-active` attribute to FoodStickyCtaBar, and observe it in FloatingActions via a MutationObserver or shared context

Alternative simpler approach: Move the FAB position from `bottom-6 right-6` to `bottom-6 right-6 md:bottom-6` and on mobile when sticky CTA is present, shift FAB up: `bottom-[calc(env(safe-area-inset-bottom)+8rem)]` or simply hide the FAB on pages that have FoodStickyCtaBar.

3. **Add analytics tracking:**

Track FAB open/close events:
```typescript
onClick={() => {
  const newState = !isOpen
  setIsOpen(newState)
  trackModalOpen/Close('floating_actions', newState ? 'open' : 'close')
}}
```

**Files to modify:** `components/layout/FloatingActions.tsx`

**Effort:** 2-3 hours
**Expected impact:** 10-20% increase in FAB utilization; elimination of visual confusion on food pages

---

## Tier 2 -- Medium Impact, Medium Effort

### R6: Add Conversion Waypoints to Homepage

**Problem:** After the hero CTAs, the homepage has 4-5 information sections (~8-10 mobile screen heights) before the next booking prompt. Visitors who scroll past the hero enter a content tunnel.

**Implementation:**

1. **Add a Sunday Lunch card** to the "What's Coming Up" section (after the event grid, around line 268-282):

```
<Link href="/sunday-lunch" className="block p-4 bg-anchor-green text-white rounded-lg text-center">
  <span className="block text-lg font-bold">Sunday Lunch</span>
  <span className="text-sm text-white/80">From GBP 19.99 · Book by Saturday 1pm</span>
</Link>
```

This adds Sunday Lunch alongside Quiz Night, Music Bingo, and Karaoke in the regular events grid.

2. **Add a mid-page "Book a Table" CTA** after the "Everything You Need to Know" section (after line 394):

```
<div className="bg-anchor-green py-8 text-center">
  <Container>
    <p className="text-white text-lg font-semibold mb-4">Ready to visit?</p>
    <BookTableButton source="homepage_mid_cta" variant="secondary" size="lg" />
  </Container>
</div>
```

3. **Make photo gallery images clickable:**
   - Sunday roast photo: Link to /sunday-lunch
   - Private hire photo: Link to /private-hire
   - Beer garden photo: Already links to /beer-garden (good)

**Files to modify:** `app/page.tsx`

**Effort:** 2-3 hours
**Expected impact:** 5-10% increase in /sunday-lunch and /book-table clicks from homepage

---

### R7: Disclose Deposit Requirements Earlier in Booking Flow

**Problem:** The GBP 10pp deposit for Sunday lunch and groups of 7+ is disclosed at Step 4 (Review). Users who reach this step and are surprised by the deposit requirement may abandon.

**Implementation:**

In `components/features/TableBooking/ManagementTableBookingForm.tsx`, add deposit disclosure at Step 1 ("Find table"):

1. When the user selects a Sunday date and "food" purpose, show an inline notice below the purpose selector:
```
<Alert variant="info">
  Sunday lunch bookings require a GBP 10 per person deposit,
  deducted from your final bill. This secures your pre-ordered roast.
</Alert>
```

2. When the user enters a party size of 7+, show:
```
<Alert variant="info">
  Groups of 7 or more require a GBP 10 per person deposit,
  deducted from your final bill.
</Alert>
```

The deposit should still be confirmed at Step 4, but early disclosure sets expectations and reduces Step 4 abandonment.

**Files to modify:** `components/features/TableBooking/ManagementTableBookingForm.tsx`

**Effort:** 1-2 hours
**Expected impact:** 5-10% reduction in Step 4 abandonment for deposit-qualifying bookings

---

### R8: Add Fallback Contact Form to Private Hire Calculator

**Problem:** The PrivateBookingCalculator depends on an API call to load space/catering configuration. If the API fails, the component shows an error message with no alternative way to enquire.

**Implementation:**

In `components/PrivateBookingCalculator.tsx`, modify the error state (currently around line 44: `setError('Failed to load pricing options')`):

```
if (error) {
  return (
    <div className="space-y-4">
      <Alert variant="warning">
        Our instant quote tool is temporarily unavailable.
        Please use the form below or call us on 01753 682707.
      </Alert>
      <StaticEnquiryForm />  {/* Simple name, email, phone, event type, guest count, message */}
    </div>
  )
}
```

Create a `StaticEnquiryForm` component that sends a basic enquiry via the existing management API's enquiry endpoint, or at minimum provides a mailto: link.

**Files to modify:** `components/PrivateBookingCalculator.tsx`, new `components/StaticEnquiryForm.tsx`

**Effort:** 3-4 hours
**Expected impact:** Prevents complete conversion loss during API downtime (estimated 1-2% of visits)

---

### R9: Reduce Quiz Night Hero CTAs from 5 to 2

**Problem:** The quiz night hero has 5 CTAs: "Book Your Quiz Table" (primary), "See upcoming quiz dates", "Pizza Menu", "Sunday Roast Info", "Call to reserve: 01753 682707". The Pizza Menu and Sunday Roast links are off-topic for quiz night intent.

**Implementation:**

In `app/quiz-night/page.tsx`, simplify the hero CTAs:

Keep:
- Primary: "Book Your Quiz Table" (or EventBookingButton for the next quiz if available)
- Secondary: "See upcoming quiz dates" (anchor link to #quiz-dates)

Remove from hero:
- "Pizza Menu" link -- move to body content ("Hungry? Order from our pizza menu before the quiz starts")
- "Sunday Roast Info" link -- irrelevant to quiz night intent
- "Call to reserve" phone button -- keep in body content and sidebar, but not hero

**Files to modify:** `app/quiz-night/page.tsx`, lines 299-348 (secondaryCta prop)

**Effort:** 30 minutes
**Expected impact:** Reduced decision paralysis; improved hero CTA click-through rate

---

### R10: Add WhatsApp CTA to Private Hire Page Body

**Problem:** WhatsApp is a natural channel for event enquiries (async, allows photo sharing, less formal than email) but the /private-hire page has no WhatsApp link in its body content. It only appears in the FloatingActions menu.

**Implementation:**

In `app/private-hire/page.tsx`, add a WhatsApp link alongside the phone CTA in the hero:

```
<Link href="https://wa.me/441753682707?text=Hi%20Anchor%20Team!%20I'd%20like%20to%20enquire%20about%20private%20hire.">
  <Button variant="outline" size="lg" className="w-full sm:w-auto">
    WhatsApp Us
  </Button>
</Link>
```

Also add WhatsApp as an option in the "Why Choose The Anchor?" section or near the enquiry form:
"Prefer to chat? Send us a WhatsApp message and we'll respond within 4 hours."

**Files to modify:** `app/private-hire/page.tsx`

**Effort:** 30 minutes
**Expected impact:** Opens an additional enquiry channel that may capture visitors who prefer messaging over phone calls

---

## Tier 3 -- Lower Impact, Variable Effort

### R11: Add Email Address to Page Body Content

**Problem:** manager@the-anchor.pub appears in the footer but rarely in page body content. Some visitors prefer email, particularly for private hire enquiries where they may need to attach documents.

**Implementation:** Add email link to:
- /private-hire: Near the PrivateBookingSection
- /book-table: In the "Prefer to talk?" sidebar card
- /quiz-night: In the FAQ about private quiz nights

Format: `<a href="mailto:manager@the-anchor.pub">manager@the-anchor.pub</a>`

**Effort:** 30 minutes
**Expected impact:** 1-2% additional enquiry capture

---

### R12: Clean Up Pre-Redirect Links

**Problem:** The homepage (line 583) links to /private-party-venue and the footer links to both /private-party-venue and /pubs-in-stanwell. These pages are earmarked for 301 redirects.

**Implementation:** Update links before implementing redirects:
- Homepage: Change `/private-party-venue` to `/private-hire` in the "Private Parties" card
- Footer: Change `/private-party-venue` to `/private-hire`, change `/pubs-in-stanwell` to `/stanwell-pub`, change `/pub-garden-heathrow` to `/beer-garden`

**Files to modify:** `app/page.tsx`, `components/layout/Footer.tsx`

**Effort:** 30 minutes
**Expected impact:** Eliminates redirect chains; marginal performance improvement

---

### R13: Fix Empty FeatureGrid Icons on Private Hire

**Problem:** The FeatureGrid on /private-hire uses empty strings for the `icon` prop (lines 244-277), rendering invisible icon placeholders.

**Implementation:** Either:
- Add appropriate emoji or SVG icons matching each feature (location, parking, accessibility, catering, bar, team)
- Or remove the icon prop entirely if the FeatureGrid component handles missing icons gracefully

**Files to modify:** `app/private-hire/page.tsx`

**Effort:** 15 minutes
**Expected impact:** Visual polish; minor trust improvement

---

### R14: Add Response Time Commitment to Enquiry Forms

**Problem:** When visitors submit a private hire enquiry or use the PrivateBookingCalculator to send a quote request, they receive no indication of when to expect a response.

**Implementation:** Add a line below the enquiry form submit button:
"We typically respond to enquiries within 4 hours during business hours."

Also add a confirmation message after submission:
"Thanks for your enquiry! We'll be in touch within 4 hours. If you need an immediate answer, call 01753 682707."

**Files to modify:** `components/PrivateBookingInquiryForm.tsx`, `components/PrivateBookingCalculator.tsx`

**Effort:** 30 minutes
**Expected impact:** Reduces post-submission anxiety; may reduce follow-up phone calls

---

### R15: Seasonal Content Awareness for Homepage and Near Heathrow

**Problem:** The /near-heathrow page "Plan your Heathrow stopover" section includes a "Christmas party packages" card (line 305-308) that is irrelevant outside Q4. The homepage similarly has a Christmas Parties event card.

**Implementation:** Make the resource card array season-aware:

```typescript
const seasonalCard = getSeasonalResourceCard()
// Returns Christmas card in Oct-Dec, Easter card in Mar-Apr,
// Summer garden card in Jun-Aug, etc.
// Falls back to a generic "Private Hire" card in off-season
```

Use the existing `getSeasonalHomepageImage()` pattern from `lib/seasonal-utils.ts` as a model for seasonal content selection.

**Files to modify:** `app/near-heathrow/page.tsx`, `app/page.tsx`

**Effort:** 2-3 hours
**Expected impact:** Improves content relevance for seasonal visitors; reduces cognitive dissonance (seeing Christmas content in March)

---

## Implementation Roadmap

### Week 1 (Quick Wins)

| # | Recommendation | Effort | Expected Impact |
|---|---------------|--------|-----------------|
| R5 | Replace FAB icon + resolve z-index | 2-3 hrs | High |
| R9 | Reduce quiz night hero CTAs | 30 min | Medium |
| R12 | Clean up pre-redirect links | 30 min | Low |
| R13 | Fix empty FeatureGrid icons | 15 min | Low |
| R14 | Add response time commitment | 30 min | Low |
| R11 | Add email to page body content | 30 min | Low |
| R10 | Add WhatsApp to private hire | 30 min | Medium |

**Week 1 total:** ~5-6 hours

### Week 2 (Content + Structure)

| # | Recommendation | Effort | Expected Impact |
|---|---------------|--------|-----------------|
| R1 | Condense hero trust badges on mobile | 2-3 hrs | Medium |
| R3 | Move parking comparison above wizard | 1 hr | Medium |
| R4 | Reorder quiz night page content | 1-2 hrs | Medium |
| R6 | Add homepage conversion waypoints | 2-3 hrs | Medium |
| R7 | Earlier deposit disclosure in booking | 1-2 hrs | Medium |

**Week 2 total:** ~8-12 hours

### Week 3 (Private Hire + Resilience)

| # | Recommendation | Effort | Expected Impact |
|---|---------------|--------|-----------------|
| R2 | Private hire pricing + testimonials + positioning | 4-6 hrs | High |
| R8 | Fallback contact form for calculator | 3-4 hrs | Low-Medium |
| R15 | Seasonal content awareness | 2-3 hrs | Low |

**Week 3 total:** ~10-13 hours

### Total estimated effort: 23-31 hours over 3 weeks
### Total projected conversion improvement: 15-25% across assessed pages

---

## Measurement Plan

### Metrics to Track

| Metric | Tool | Baseline | Target |
|--------|------|----------|--------|
| /book-table page visits from organic | GA4 | Current | +20% |
| Booking form completion rate | GTM events | Current | +15% |
| /private-hire enquiry submissions | GTM events | Current | +30% |
| /heathrow-parking booking wizard starts | GTM events | Current | +15% |
| FAB utilization rate | GTM events (new) | Unknown | Establish baseline |
| FoodStickyCtaBar click rate | GTM events (existing) | Current | +10% |
| Quiz night event booking rate | GTM events | Current | +20% |
| Mobile bounce rate on landing pages | GA4 | Current | -10% |
| Average scroll depth on landing pages | GA4 | Current | +15% |

### A/B Testing Candidates

The following recommendations are suitable for A/B testing before full rollout:
- R1 (trust badge condensation) -- test 3 vs 5 badges on homepage
- R3 (comparison table position) -- test above vs below wizard
- R5 (FAB redesign) -- test phone icon vs "Need Help?" text
- R7 (early deposit disclosure) -- test with/without early disclosure on Step 1

Use Vercel's edge middleware or a lightweight client-side A/B framework to split traffic.
