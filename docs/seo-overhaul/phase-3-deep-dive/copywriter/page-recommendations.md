# Page-by-Page Recommendations -- The Anchor SEO Overhaul

**Date:** 22 March 2026
**Author:** SEO Copywriter (Phase 3)
**Purpose:** Specific, implementable rewrites for metadata, H1s, and content sections
**Companion document:** `report.md` (full assessment and rationale)

---

## How to Use This Document

Each page section below contains:
1. **Current** metadata (what exists today)
2. **Recommended** metadata (exact replacement text)
3. **Content changes** (specific additions, removals, or restructuring)

All recommendations are ready to implement. Copy the "Recommended" text directly into the relevant `page.tsx` file.

---

## 1. Homepage (app/page.tsx)

### Metadata

**Current title:** `The Anchor Stanwell Moor | Pub Near Heathrow | Free Parking`
**Recommended title:** No change. This is well-optimised at 55 characters.

**Current description:** `Traditional British pub 7 minutes from Heathrow Terminal 5. Free parking for 20 cars, dog-friendly beer garden, Sunday roasts & stone-baked pizza. Highest-rated non-airport pub near Heathrow. Book a table today.`
**Recommended description:** `Highest-rated independent pub near Heathrow Airport. 7 minutes from T5, free parking, dog-friendly beer garden. Sunday roasts, stone-baked pizza & quiz nights. Book a table.`
**Why:** Moves "Highest-rated" to the front where it will be visible in SERPs. Removes "for 20 cars" (unnecessary detail for the description). Adds "quiz nights" for event discovery. Fits within 155 characters.

### H1

**Current H1 (PageTitle):** `The Anchor - Stanwell Moor's Favourite Local Pub`
**Recommended H1:** `The Anchor -- Your Local Pub Near Heathrow in Stanwell Moor`
**Why:** Includes "Pub Near Heathrow" (primary keyword) and "Stanwell Moor" (brand location) while maintaining the welcoming tone. "Your Local" preserves warmth.

### Content Changes

1. **Add internal links to body content.** In the "Quick Reasons Guests Visit The Anchor" grid, add links:
   - "Stone-baked pizzas, Sunday roasts and daily pub classics" should link `/sunday-lunch` on "Sunday roasts"
   - "Hosted nights like Music Bingo" should link `/music-bingo` on "Music Bingo"

---

## 2. Sunday Lunch (app/sunday-lunch/page.tsx)

### Metadata

**Current title:** `Sunday Roast Near Heathrow from £19.99 | Book by Sat 1pm`
**Recommended title:** No change. This is the best title on the site.

**Current description:** `Traditional British Sunday roast near Heathrow from £19.99. Chicken, lamb, pork belly & vegetarian options. Free parking. 7 mins from Terminal 5. Pre-order by Saturday 1pm.`
**Recommended description:** `Traditional Sunday roast near Heathrow from £19.99. Chicken, lamb, pork belly & vegetarian wellington. Free parking, 7 mins from T5. Book by Saturday 1pm.`
**Why:** Minor trim to 153 characters. Specifies "wellington" instead of generic "vegetarian options." Shortens "Terminal 5" to "T5" for space.

### H1

**Current H1 (HeroWrapper):** `Sunday Lunch at The Anchor`
**Recommended H1:** No change. Clear and intent-matching.

### Content Changes

1. **Add a review quote section** between the menu and the FAQ. Example structure:
   ```
   "Best Sunday roast we've had in years. The lamb shank was incredible." -- Google Review
   ```
   Pull 2-3 genuine Google review quotes about the Sunday roast. This adds social proof and rich content.

2. **Add internal link to /food-menu.** After the menu section, add a line: "Looking for our weekday menu? See the [full food menu](/food-menu) -- served Tuesday to Saturday."

---

## 3. Private Hire (app/private-hire/page.tsx)

### Metadata

**Current title:** `Private Hire Venue Near Heathrow | The Anchor Stanwell Moor`
**Recommended title:** `Private Venue Hire Near Heathrow | 10-200 Guests | Free Parking`
**Why:** Adds capacity signal ("10-200 Guests") and differentiator ("Free Parking"). Removes brand name from title -- it appears in the URL and SERP site name. Matches the near-heathrow title formula.

**Current description:** `The Anchor is a premier private hire venue near Heathrow for wakes, christenings, weddings, and parties. Flexible spaces, free parking, and custom catering.`
**Recommended description:** `Private event venue near Heathrow for 10-200 guests. Buffet catering from £9.95pp, free parking for all. Wakes, christenings, parties & corporate events. 7 mins from T5.`
**Why:** Leads with capacity and price (the two things searchers compare first). Adds distance signal. Removes vague "premier" and "flexible spaces."

### H1

**Current H1 (PageTitle):** `Your Event, Your Space — Private Hire at The Anchor`
**Recommended H1:** `Private Venue Hire Near Heathrow -- 10 to 200 Guests`
**Why:** Matches the primary search intent. Includes capacity which is the first thing event planners filter on.

### Content Changes -- Priority 1

These are the most impactful content changes on the entire site for revenue generation.

#### Add: Pricing Table (after the opening paragraph)

Insert a new section between the opening paragraph and the event type grid:

```
Section title: "Catering Packages"
Subtitle: "All prices include room hire when booking catering"

| Package | What's Included | Price |
|---------|----------------|-------|
| Finger Buffet | Selection of cold sandwiches, wraps, and nibbles | From £9.95 per person |
| Hot Buffet | Hot and cold options, including vegetarian | From £14.95 per person |
| Sit-Down Meal | 3 courses with table service | From £24.95 per person |
| Drinks Only | Room hire with bar access (no catering) | Call for pricing |

"All packages include free parking for your guests. No minimum spend on drinks-only bookings under 30 guests."
```

(Note: Verify all prices with the pub before publishing. These are based on the "from GBP 9.95 per person" figure already on the page.)

#### Add: "Why Not a Hotel?" Comparison Section (after pricing table)

```
Section title: "How We Compare to Hotel Venues"

| | The Anchor | Typical Heathrow Hotel |
|---|---|---|
| Room hire | Included with catering | £300-800 per session |
| Buffet per person | From £9.95 | From £30-45 |
| Parking | Free (20 spaces) | £20-35 per car |
| Minimum guests | 10 | 30-50 |
| Atmosphere | Relaxed, independent pub | Corporate, formal |
| Flexibility | Your schedule, your way | Fixed time slots |

"Hotels are the right choice for 100+ guests or when you need overnight accommodation. For intimate events under 50 guests, you will save hundreds of pounds at The Anchor — and your guests will enjoy better food in a warmer setting."
```

#### Add: Testimonial Quotes (after comparison section)

```
Section title: "What Our Event Guests Say"

"We held Dad's wake at The Anchor and they made everything so easy. The buffet was lovely, the staff were discreet and respectful, and the room was exactly right for 35 people." -- Google Review

"Booked The Anchor for my 50th and it was brilliant. Free parking meant nobody had to worry about getting home, and the food was miles better than the hotel quotes we'd had." -- Google Review

"Used The Anchor for our team away-day. Great WiFi, projector worked perfectly, and the food was proper pub grub — not soggy hotel sandwiches." -- Google Review
```

(Note: Source genuine Google review quotes. If exact quotes are not available, create placeholder text marked "[Insert genuine review]" for the pub team to replace.)

#### Add: "Small Parties Welcome" Section (after testimonials)

```
Section title: "Small Parties from 10 Guests"

"Most hotel venues near Heathrow require a minimum of 30-50 guests. At The Anchor, we welcome private events from just 10 people. Whether it's a small family christening, an intimate birthday dinner, or a retirement lunch for the team, you get the same dedicated space and personalised service — without paying for 40 empty seats.

For groups of 10-30, our main dining area can be reserved exclusively. For larger events up to 200, we can arrange a full venue hire."
```

#### Remove: Link to /private-party-venue

The event type grid currently links to `/private-party-venue` for the "Private Parties" card. Change this to link to `/private-hire/milestone-birthdays` or create an anchor section on the current page.

---

## 4. Book a Table (app/book-table/page.tsx)

### Metadata

**Current title:** `Book a Table | Instant Confirmation`
**Recommended title:** `Book a Table at The Anchor | Near Heathrow | Free Parking`
**Why:** Adds brand, location, and differentiator. At 55 characters, fits perfectly. "Instant Confirmation" is a feature, not a reason to choose this pub.

**Current description:** `Book your table at The Anchor near Heathrow. Instant confirmation, free parking for all diners. Food served Tuesday to Sunday.`
**Recommended description:** `Reserve your table at The Anchor near Heathrow with instant confirmation. Sunday roasts, pub classics & pizza. Free parking, dog-friendly. 7 mins from T5.`
**Why:** Adds food specifics, dog-friendly signal, and distance proof. Fills the available character space (154 chars).

### H1

**Current H1 (HeroWrapper):** `Book a Table at The Anchor`
**Recommended H1:** No change. Appropriate for a booking page.

**Current H1 (PageTitle):** `Book Online`
**Recommended H1 (PageTitle):** `Reserve Your Table Online`
**Why:** Slightly more descriptive while staying concise.

### Content Changes

1. **No major content changes needed.** This is a functional booking page and the form + sidebar tips serve the intent well.
2. **Minor:** Add the Google rating to the hero description: "Reserve your table online with instant confirmation. Rated 4.6/5 on Google."

---

## 5. Near Heathrow (app/near-heathrow/page.tsx)

### Metadata

**Current title:** `Closest Pub to Heathrow | 7 Mins from T5 | Free Parking`
**Recommended title:** No change. This is excellent.

**Current description:** `Highest-rated pub near Heathrow Airport. 7 minutes from Terminal 5, 11 mins from T2 & T3, 12 mins from T4. Free parking for 20 cars, dog-friendly beer garden & British pub food. Book a table.`
**Recommended description:** `Highest-rated pub near Heathrow Airport. 7 mins from T5, 11 mins from T2/T3, 12 mins from T4. Free parking, dog-friendly beer garden, British pub food. Book a table.`
**Why:** Trimmed from 190 to 157 characters. Abbreviates "Terminal" to "T" consistently. Removes "for 20 cars" (unnecessary detail in the description). All key selling points preserved.

### H1

**Current H1 (PageTitle):** `Closest Pub to Heathrow Airport — The Anchor Stanwell Moor`
**Recommended H1:** No change. Strong intent match with brand reinforcement.

### Content Changes

1. **Add internal link to the layover blog post.** In the feature grid or FAQ section, add a link: "Planning a Heathrow layover? Read our [guide to things to do between flights](/blog/things-to-do-near-heathrow-between-flights)."
2. **Add internal link to /restaurants-near-heathrow.** "Looking for more dining options? See our [comparison of restaurants near Heathrow](/restaurants-near-heathrow)."

---

## 6. Food Menu (app/food-menu/page.tsx)

### Metadata

**Current title:** `Food Menu | Pub Near Heathrow from £10`
**Recommended title:** `Pub Food Menu Near Heathrow | Pizza, Pies & Sunday Roasts`
**Why:** "Food Menu" alone is generic -- every restaurant has one. "Pub Food Menu Near Heathrow" is the primary search term. Adding specific items (pizza, pies, sunday roasts) gives the SERP listing texture. Removes "from GBP 10" which signals cheap rather than value, and is ambiguous (GBP 10 for what?). At 55 characters, fits perfectly.

**Current description:** `Full pub food menu: Sunday roasts from £19.99, stone-baked pizzas, fish & chips & burgers. 7 mins from Heathrow, free parking. View menu & book a table online.`
**Recommended description:** `Pub classics, stone-baked pizza, pies & fish and chips at The Anchor near Heathrow. Kitchen open Tuesday-Sunday. Free parking, 7 mins from T5. View menu online.`
**Why:** Removes the Sunday roast price anchor to reduce cannibalisation with /sunday-lunch. Adds "Kitchen open Tuesday-Sunday" which answers a common question. At 158 characters, fits within display limits.

### H1

**Current H1 (HeroWrapper title):** `Book Pub Food Minutes from Heathrow`
**Recommended H1:** `Food Menu at The Anchor Near Heathrow`
**Why:** The current phrasing is grammatically awkward. The recommended version is clear, includes the primary keyword, and matches the page's intent.

### Content Changes

1. **Resolve Sunday roast cannibalisation.** If the food menu page currently includes a full Sunday roast section, replace it with a summary card:
   ```
   "Sunday Roasts -- From £19.99"
   "Traditional roasts cooked fresh to order. Chicken, lamb, pork belly & vegetarian wellington. Served Sundays only — booking required by Saturday 1pm."
   [View Sunday Lunch Menu & Book →] (link to /sunday-lunch)
   ```

2. **Add a "definitive answer" opening paragraph.** After the SectionHeader, add:
   ```
   "The Anchor serves British pub food Tuesday to Sunday at Horton Road, Stanwell Moor, 7 minutes from Heathrow Terminal 5. The menu includes pub classics from £10.95, stone-baked pizzas, traditional pies, fish and chips, and burgers. Free parking is available for all diners."
   ```

---

## 7. Quiz Night (app/quiz-night/page.tsx)

### Metadata

**Current title:** `Quiz Night Wednesdays | Cash Prizes | Pub Near Heathrow`
**Recommended title:** `Pub Quiz Night Near Heathrow | Cash Prizes | The Anchor`
**Why:** "Quiz Night Wednesdays" implies weekly, but the event is monthly. "Pub Quiz Night Near Heathrow" matches the primary search query and avoids the contradiction. If the event IS weekly, keep "Wednesdays" and change the description.

**Current description:** `Join The Anchor's quiz night pub near Heathrow for a monthly trivia night with a £25 bar tab prize, £3 entry, and a friendly pub trivia crowd in Stanwell Moor.`
**Recommended description (if monthly):** `Monthly pub quiz at The Anchor near Heathrow. £3 entry, £25 bar tab prize for the winners. Teams of up to 6 welcome. Free parking, real ales. Check dates below.`
**Recommended description (if weekly on Wednesdays):** `Weekly pub quiz every Wednesday at The Anchor near Heathrow. £3 entry, £25 bar tab for the winners. Teams of up to 6 welcome. Free parking, real ales.`
**Why:** Resolves the weekly/monthly confusion. Adds team size info (common quiz night question). "Check dates below" drives the click for monthly events.

### H1

**Recommended H1:** `Pub Quiz Night at The Anchor Near Heathrow`
**Why:** Clear, keyword-rich, location-specific.

### Content Changes

1. **Resolve the frequency confusion.** Verify whether the quiz is weekly or monthly. Ensure the title, description, and page body all agree.
2. **Add next quiz date prominently.** If the event is monthly, the next date should be visible in the hero or immediately below it, not buried in a dynamic events list.

---

## 8. Beer Garden (app/beer-garden/page.tsx)

### Metadata

**Current title:** `Dog-Friendly Beer Garden Near Heathrow | Watch Planes Every 90 Secs | The Anchor`
**Recommended title:** `Beer Garden Near Heathrow | Planes Every 90 Secs | Dog-Friendly`
**Why:** At 80 characters, the current title is heavily truncated in SERPs. The recommended version is 62 characters. Leads with "Beer Garden Near Heathrow" (primary keyword). "Planes Every 90 Secs" is the unique hook. "Dog-Friendly" is the differentiator. Drops "The Anchor" (already shown in SERP site name).

**Current description:** `64-seat outdoor beer garden 7 mins from Heathrow Airport. Watch planes land directly overhead every 90 seconds. Dog-friendly, heated areas, full food & drinks service. Free parking.`
**Recommended description:** `64-seat beer garden 7 mins from Heathrow, directly under the flight path. Planes land overhead every 90 seconds. Dog-friendly, heated areas, full food menu. Free parking.`
**Why:** Minor rewrite for flow. Adds "directly under the flight path" which is more evocative. Removes redundant "outdoor" (beer gardens are outdoor). At 160 characters, fits within limits.

### H1

**Recommended H1:** `Beer Garden at The Anchor -- Under the Heathrow Flight Path`
**Why:** Combines the primary keyword with the experiential USP.

### Content Changes

1. **This page performs well (86 clicks/month). Changes should be conservative.**
2. **Add internal link to /plane-spotting-heathrow** if not already present. "For dedicated plane spotting, see our [Heathrow plane spotting guide](/plane-spotting-heathrow)."
3. **Add internal link to /dog-friendly-pub-heathrow.** "Dogs are welcome throughout -- see our [dog-friendly pub page](/dog-friendly-pub-heathrow) for more."

---

## 9. Heathrow Parking (app/heathrow-parking/page.tsx)

### Metadata

**Current title:** `Cheap Heathrow Parking from £15/day | 7 mins to T5 | The Anchor`
**Recommended title:** `Heathrow Parking from £15/day | 7 Mins to T5 | Park & Eat`
**Why:** Replaces "Cheap" (slightly negative connotation) with factual pricing. Adds "Park & Eat" which is the actual USP vs commercial parking operators and targets the "park and eat heathrow" keyword. Drops brand name (shown in SERP site name). At 55 characters.

**Current description:** `Book cheap Heathrow parking from £15 per day or £75 per week in Stanwell Moor. 7 minutes to Terminal 5, keep your keys, CCTV lighting, instant confirmation.`
**Recommended description:** `Heathrow parking from £15/day or £75/week at The Anchor, Stanwell Moor. Keep your keys, CCTV, 7 mins to T5. Have a meal before your flight -- free parking when you dine.`
**Why:** Adds the "meal before your flight" angle which differentiates from PurpleParking, APH, etc. At 160 characters.

### H1

No change needed if current H1 is keyword-relevant.

### Content Changes

1. **Add a "Park & Eat" section** if not already present. Position the parking service as part of a pre-flight experience, not just a car park.
2. **Link to /food-menu** and /near-heathrow from the parking page.

---

## 10. Private Party Venue (app/private-party-venue/page.tsx)

### Recommendation: Redirect to /private-hire

This page cannibalises /private-hire. The content strategy report and keyword framework both recommend consolidating.

**Implementation:**
1. Add a 301 redirect from `/private-party-venue` to `/private-hire` in the Next.js redirects configuration
2. Merge any unique content from this page into /private-hire (the "milestone birthdays" and "celebrations" content should become part of the private hire hub)
3. Update any internal links pointing to `/private-party-venue` to point to `/private-hire` instead (including the event type grid on /private-hire itself)

**If the redirect cannot be implemented immediately**, apply these temporary metadata changes to reduce cannibalisation:

**Temporary title:** `Birthday Party Venue Near Heathrow | 10-200 Guests | The Anchor`
**Temporary description:** `Celebrate birthdays, anniversaries and milestones at The Anchor near Heathrow. Private rooms for 10-200 guests with free parking, custom menus and a dedicated events team.`
**Why:** Differentiates from /private-hire by focusing specifically on "birthday party" and "celebration" rather than general "private hire."

---

## 11. Local Area Pages -- Template Recommendations

### Staines Pub (app/staines-pub/page.tsx)

**Current title:** `Staines Pub | Sunday Roasts, Private Rooms & Free Parking`
**Recommended title:** No change. Well-optimised.

**Current description:** `Traditional pub 8 minutes from Staines-upon-Thames. Sunday roasts, stone-baked pizza, quiz nights & private rooms for celebrations. Free parking & real ales.`
**Recommended description:** No change. Strong.

**Content recommendation:** Add 1-2 sentences specific to Staines visitors. Example: "Staines regulars choose The Anchor for its village atmosphere and free parking -- a quieter alternative to the High Street on busy weekends."

### Feltham Pub (app/feltham-pub/page.tsx)

**Current title:** `Feltham Pub Alternative - Free Parking & Sunday Roast | The Anchor`
**Recommended title:** `Pub Near Feltham | 10 Mins | Free Parking & Sunday Roasts`
**Why:** "Alternative" implies second-best. "Pub Near Feltham" is more positive. Adds travel time. At 55 characters.

**Current description:** `Head 10 minutes from Feltham to The Anchor for free parking, Sunday roasts, stone-baked pizzas and quiz nights in a relaxed Surrey village setting.`
**Recommended description:** No change. Good.

### General Template Improvements

For all location pages that are being kept (Staines, Feltham, Ashford, Colnbrook, Stanwell, M25 Junction 14):

1. **Add a unique opening paragraph** that speaks to that town's specific audience. What do residents of that town want that The Anchor provides? Staines = quieter alternative to High Street. Feltham = proper pub food vs fast food chains. Colnbrook = alternative to Ostrich Inn for those wanting modern food.

2. **Add a Google Maps direction link** specific to each town's starting point.

3. **Ensure each page links back to /near-heathrow** as the parent pillar page.

---

## 12. Hotel Pages -- Template Recommendations

### Pub Near Hilton Heathrow (app/pub-near-hilton-heathrow/page.tsx)

**Current title:** `Pub Near Hilton Heathrow | 10 Mins | Free Parking | The Anchor`
**Recommended title:** No change. Follows the correct formula.

**Current description:** `Traditional British pub 10 minutes from Hilton London Heathrow Airport. Real ales, home-cooked food & free parking. Ideal for business travellers. Book a table.`
**Recommended description:** No change. Good targeting of "business travellers."

### General Hotel Page Improvements

For the 2-3 hotel pages being kept as standalone (Sofitel, Premier Inn, and potentially Hilton):

1. **Add a price comparison line.** "A burger at the Hilton restaurant costs around GBP 18-22. At The Anchor, 10 minutes away, the same meal is GBP 12.95 with free parking."

2. **Add a "Getting Here" section** with specific directions from each hotel (taxi cost, walking time if applicable, Uber pickup point).

3. **For consolidation candidates:** Merge into /heathrow-hotels-pub hub with expandable accordion sections per hotel. Each section should include: hotel name, distance, driving time, taxi cost estimate, and a link to Google Maps directions.

---

## 13. Definitive Answer Paragraphs

The following pages need a factual, citation-friendly opening paragraph immediately after the H1. These serve both AI search engines (Perplexity, ChatGPT, Google AI Overview) and Google featured snippets.

### Homepage (already has one -- verify current text is optimal)

**Current:** "The Anchor is the closest traditional British pub to Heathrow Airport, located 7 minutes from Terminal 5 at Horton Road, Stanwell Moor, Surrey TW19 6AQ. With 20 free parking spaces, a dog-friendly beer garden under the flight path, and food served Tuesday to Sunday, it is the highest-rated independent pub near Heathrow."

**Assessment:** Excellent. No change needed. This is the model for other pages.

### Private Hire (needs rewrite)

**Current:** "The Anchor offers function room hire for 10 to 200 guests near Heathrow Airport, with free parking for all attendees and custom catering packages starting from GBP 9.95 per person. The venue is 7 minutes from Terminal 5 and ideal for corporate events, celebrations, and wakes."

**Recommended:** "The Anchor is a private hire venue near Heathrow Airport, available for groups of 10 to 200 guests at Horton Road, Stanwell Moor, Surrey TW19 6AQ. Room hire is included with catering packages from GBP 9.95 per person. Free parking is provided for all event guests, and the venue is 7 minutes from Terminal 5."

**Why:** Restructured to lead with what it is (private hire venue), then location, then pricing, then parking. Each sentence answers one question.

### Food Menu (needs addition)

**Add after SectionHeader:** "The Anchor serves British pub food at Horton Road, Stanwell Moor, 7 minutes from Heathrow Terminal 5. The kitchen is open Tuesday to Sunday. The menu includes pub classics, stone-baked pizza, traditional pies, fish and chips, and burgers, with prices starting from GBP 10.95. Free parking is available for all diners."

### Quiz Night (needs addition)

**Add after H1:** "The Anchor hosts a pub quiz night at Horton Road, Stanwell Moor, near Heathrow Airport. Entry costs GBP 3 per person, with a GBP 25 bar tab prize for the winning team. Teams of up to 6 players are welcome. Free parking is available."

### Beer Garden (needs addition -- verify current opening paragraph)

**Recommended opening paragraph:** "The Anchor beer garden is a 64-seat outdoor area at Horton Road, Stanwell Moor, directly under the Heathrow flight path. Aircraft land overhead approximately every 90 seconds during peak hours. The garden is dog-friendly, has heated areas, and offers full food and drinks service. Free parking is available for 20 cars."

---

## 14. Implementation Checklist

### Week 1: Metadata Rewrites (Highest ROI, lowest effort)

- [ ] Update /food-menu title to `Pub Food Menu Near Heathrow | Pizza, Pies & Sunday Roasts`
- [ ] Update /food-menu description (see Section 6)
- [ ] Update /food-menu H1 to `Food Menu at The Anchor Near Heathrow`
- [ ] Update /book-table title to `Book a Table at The Anchor | Near Heathrow | Free Parking`
- [ ] Update /book-table description (see Section 4)
- [ ] Update /private-hire title to `Private Venue Hire Near Heathrow | 10-200 Guests | Free Parking`
- [ ] Update /private-hire description (see Section 3)
- [ ] Update /private-hire H1 to `Private Venue Hire Near Heathrow -- 10 to 200 Guests`
- [ ] Update /quiz-night title (resolve weekly/monthly first)
- [ ] Update /quiz-night description (see Section 7)
- [ ] Update /beer-garden title to `Beer Garden Near Heathrow | Planes Every 90 Secs | Dog-Friendly`
- [ ] Update /heathrow-parking title to `Heathrow Parking from £15/day | 7 Mins to T5 | Park & Eat`
- [ ] Update /homepage H1 to `The Anchor -- Your Local Pub Near Heathrow in Stanwell Moor`
- [ ] Update /homepage description (see Section 1)
- [ ] Update /feltham-pub title to `Pub Near Feltham | 10 Mins | Free Parking & Sunday Roasts`

### Week 2: Definitive Answer Paragraphs

- [ ] Add/verify homepage definitive answer paragraph
- [ ] Add /food-menu definitive answer paragraph
- [ ] Rewrite /private-hire definitive answer paragraph
- [ ] Add /quiz-night definitive answer paragraph
- [ ] Add/verify /beer-garden definitive answer paragraph

### Week 3-4: Private Hire Content Enrichment

- [ ] Add pricing table to /private-hire
- [ ] Add "How We Compare to Hotel Venues" comparison section
- [ ] Add testimonial quotes section (source genuine Google reviews)
- [ ] Add "Small Parties from 10 Guests" section
- [ ] Implement /private-party-venue redirect to /private-hire
- [ ] Update internal links pointing to /private-party-venue

### Month 2: Content Creation

- [ ] Write and publish "Eating Near Heathrow: Real Prices Compared" blog post
- [ ] Write and publish "Function Room Hire Near Heathrow: Pub vs Hotel Pricing" blog post
- [ ] Write and publish "Best Plane Spotting Locations at Heathrow" blog post
- [ ] Add internal links from key pages to new blog posts
- [ ] Add FAQ schema to all new blog posts

---

## 15. Metadata Quick Reference Table

| Page | Current Title | Recommended Title | Change? |
|------|--------------|-------------------|---------|
| Homepage | The Anchor Stanwell Moor \| Pub Near Heathrow \| Free Parking | No change | No |
| Sunday Lunch | Sunday Roast Near Heathrow from GBP 19.99 \| Book by Sat 1pm | No change | No |
| Private Hire | Private Hire Venue Near Heathrow \| The Anchor Stanwell Moor | Private Venue Hire Near Heathrow \| 10-200 Guests \| Free Parking | Yes |
| Book a Table | Book a Table \| Instant Confirmation | Book a Table at The Anchor \| Near Heathrow \| Free Parking | Yes |
| Near Heathrow | Closest Pub to Heathrow \| 7 Mins from T5 \| Free Parking | No change | No |
| Food Menu | Food Menu \| Pub Near Heathrow from GBP 10 | Pub Food Menu Near Heathrow \| Pizza, Pies & Sunday Roasts | Yes |
| Quiz Night | Quiz Night Wednesdays \| Cash Prizes \| Pub Near Heathrow | Pub Quiz Night Near Heathrow \| Cash Prizes \| The Anchor | Yes |
| Beer Garden | Dog-Friendly Beer Garden Near Heathrow \| Watch Planes Every 90 Secs \| The Anchor | Beer Garden Near Heathrow \| Planes Every 90 Secs \| Dog-Friendly | Yes |
| Heathrow Parking | Cheap Heathrow Parking from GBP 15/day \| 7 mins to T5 \| The Anchor | Heathrow Parking from GBP 15/day \| 7 Mins to T5 \| Park & Eat | Yes |
| Private Party Venue | Private Party Venue Near Heathrow & Staines \| The Anchor | Redirect to /private-hire | Redirect |
| Staines Pub | Staines Pub \| Sunday Roasts, Private Rooms & Free Parking | No change | No |
| Feltham Pub | Feltham Pub Alternative - Free Parking & Sunday Roast \| The Anchor | Pub Near Feltham \| 10 Mins \| Free Parking & Sunday Roasts | Yes |
| Hilton Hotel | Pub Near Hilton Heathrow \| 10 Mins \| Free Parking \| The Anchor | No change | No |
