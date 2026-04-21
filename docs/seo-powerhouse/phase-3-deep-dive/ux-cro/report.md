# UX & Conversion Analysis
_The Anchor pub website — assessed 21 April 2026_

---

## Summary

The site has strong bones: phone numbers are prominent, booking forms exist, and most pages have at least one CTA. However several high-traffic pages have conversion leaks that are costing real bookings. The single biggest issue is the blog traffic engine (~430 clicks/month from plane spotting content) that dumps users into a dead-end with no food or booking path. Secondary issues are: /food-menu's footer CTA missing a "Book a Table" button, /whats-on offering no per-event booking, and /book-table burying the form below the hero with a confused CTA hierarchy (phone is primary in the hero but the form is the actual conversion goal).

---

## Landing Page Assessments

| Page | Intent Match | Above-the-Fold CTA | Mobile UX | Trust Signals | Conversion Path | Score |
|------|-------------|--------------------|-----------|--------------|-----------------| ------|
| /book-table | Strong | Phone button is primary hero CTA — form is below fold | Form present; mobile help card visible | 1 Google review below form; ValueProofStrip present | Direct — 1 click | 7/10 |
| /sunday-lunch | Strong | FoodStickyCtaBar floats on mobile; "Book Sunday Lunch" button mid-page | Price in meta (£19) but not dominant in hero | None visible on page | Direct via BookTableButton; phone backup | 7/10 |
| /food-menu | Medium — browsing intent, not booking intent | FoodStickyCtaBar exists | Sticky bar is good | None visible | Footer CTA missing "Book a Table" — only phone + drinks menu | 5/10 |
| /private-hire/wakes | Strong | "Call to Discuss Arrangements" primary; "Enquire Online" secondary | Phone prominent on mobile | None (planned per existing audit) | Enquiry links to /private-hire#enquiry — navigates away from wakes page | 7/10 |
| /whats-on | Medium | No CTA above fold | No per-event booking | None | No per-event booking path; FAQ says "booking not required" | 4/10 |
| /quiz-night | Good | "Book Your Team Table" at bottom; upcoming dates mid-page | Responsive CTAs | None | BookTableButton present but does NOT pre-fill a specific quiz date | 6/10 |
| /blog/[slug] (plane spotting) | Low — informational | "Visit The Anchor Today" at very end; CTAs are "Get Directions" and "More Stories" | Generic template | None | No food/booking link anywhere in blog template | 2/10 |

---

## Conversion Flow Issues

### 1. /book-table — Wrong primary CTA in the hero
**Issue:** The hero's `primaryCta` is a `PhoneButton` ("Prefer to call? 01753 682707"). The `ManagementTableBookingForm` is the actual conversion goal and sits below the fold after the hero and a RegretReduction component.

**Impact:** On mobile (77% of traffic), users land on /book-table and see a hero with a phone button — they do not immediately see the booking form.

**Fix:** Swap hero primary/secondary CTAs. Primary = "Book Online Now" (anchor to `#booking-form`); secondary = phone. Or move a compact form above the hero fold.

---

### 2. /food-menu — Footer CTA missing "Book a Table"
**Issue:** The `CTASection` at the bottom of /food-menu has only two buttons: "Call: 01753 682707" and "View Drinks Menu". There is no "Book a Table" button. The `FoodStickyCtaBar` with `label="Book a Table"` exists but relies on the user having scrolled the entire page.

**Impact:** The highest-traffic food page (41 clicks/28d) ends with a CTA that sends users to drinks, not bookings.

**Fix:** Add a `BookTableButton` as a third button in the `CTASection`. The note in the existing GSC plan (item 4.4) references the /food-menu/gluten-free variant — the same fix is needed on the main /food-menu page.

---

### 3. /blog — Zero conversion path for ~430 clicks/month
**Issue:** The blog template's CTA section has only "Get Directions" and "More Stories". There is no link to /food-menu, /book-table, or any commercial content. The plane spotting posts are the site's largest traffic driver but convert nothing.

**Impact:** ~430 monthly visitors leave with no commercial touchpoint.

**Fix:** Add a contextual mid-content CTA block ("Hungry after plane spotting? The Anchor is 5 minutes away — food from £8.95") with `BookTableButton` and `/food-menu` link. Replace the template footer CTAs with "View Food Menu / Book a Table / Get Directions".

---

### 4. /private-hire/wakes — Enquiry form is on a different page
**Issue:** "Enquire Online" links to `/private-hire#enquiry` — a different page. A bereaved family clicks it and is navigated away from the wakes page to the generic private hire page, then must scroll to find the form.

**Impact:** Friction at the worst possible moment for an emotionally sensitive audience.

**Fix:** Either embed a lightweight enquiry form directly on /private-hire/wakes, or at minimum change the anchor to `/private-hire/wakes#enquiry` with a matching section on the page.

---

### 5. /quiz-night — Booking does not pre-fill a specific date
**Issue:** `BookTableButton` on /quiz-night sends users to the generic booking form without date pre-fill. The `QuizNightEvents` component renders upcoming dates but they are not passed to the booking URL.

**Impact:** Users who want to "reserve for next quiz" land on a blank form with no date context.

**Fix:** Read the next event date from the `events` array and pass as `/book-table?date=YYYY-MM-DD&purpose=quiz_night`. The `ManagementTableBookingForm` already accepts a `date` prefill param.

---

### 6. /whats-on — No per-event booking path
**Issue:** The FAQ explicitly says "booking isn't required" for most events. Event cards have no individual reservation CTA. Users interested in a specific event have no way to commit.

**Fix:** Add "Reserve a Table for This Night" on individual event cards linking to `/book-table?date=YYYY-MM-DD`. At minimum add a sticky "Coming to Quiz Night? Book Your Table" banner when a quiz is in the upcoming list.

---

### 7. /sunday-lunch — Price not in the hero
**Issue:** "From £19" is in the metadata and menu section but not visible in the hero. Users who clicked from Google (where they saw £19 in the snippet) do not see immediate price confirmation.

**Fix:** Add "From £19pp" as a hero badge.

---

## User Journey Gaps

| Gap | Pages Affected | Impact |
|-----|---------------|--------|
| Blog traffic engine has no commercial exit | /blog/[slug] all posts | HIGH — ~430 clicks/month dead-end |
| /food-menu bottom CTA directs to drinks, not booking | /food-menu | HIGH — highest-traffic food page |
| Quiz night booking does not select the event date | /quiz-night | MEDIUM |
| Wakes enquiry navigates away from wakes page | /private-hire/wakes | MEDIUM — emotionally sensitive |
| /whats-on: no path from event listing to booking that event | /whats-on | MEDIUM |
| /book-table hero promotes phone over the form | /book-table | LOW-MEDIUM |

---

## Quick UX Wins

Ordered by impact vs. effort:

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Add "Book a Table" BookTableButton to /food-menu footer CTASection | XS | HIGH |
| 2 | Add food/booking CTAs to blog post template (all posts) | S | HIGH |
| 3 | Swap /book-table hero primary CTA from phone to form anchor | XS | MEDIUM |
| 4 | Embed enquiry form directly on /private-hire/wakes | S | MEDIUM |
| 5 | Pre-fill next quiz date in BookTableButton on /quiz-night | S | MEDIUM |
| 6 | Add "From £19pp" badge to /sunday-lunch hero | XS | LOW-MEDIUM |
| 7 | Add per-event "Reserve a Table" links on /whats-on event cards | S | MEDIUM |

---

_Report generated: 21 April 2026_
