# Voice Standard Copy Rollout, Spec

## Summary

The voice standard now asks copy to make people feel invited rather than merely informed, with a register dial that keeps operational copy calm, and this spec recommends **167 changes** across 12 page families to bring the site into line. The work is mostly small: about 60% of the changes are single-string edits, and 22 of them sit in shared components and libraries where one edit reaches many pages at once. The single most important insight is that the audit found accuracy failures hiding inside the tone problems: `/pubs-in-stanwell` dates the pub to 1995 in eight places, four pages tell people they must book a Sunday roast when walk-ins are the policy, the boxing page sells Sky and TNT pay-per-view we do not carry, and eleven menu or drink prices are hardcoded against the live-price rule. An independent fact-checker rejected 82 of the auditors' proposed rewrites, most for inventing facts (a lawn, an open fire, covered seating, a newsletter, a seating guarantee) or for hardcoding a distance across pages with different distances, and those rejections are all recorded below so nobody re-proposes them. Fixing the accuracy items should come before any tone work, because several of them would otherwise be re-published in fresher, more confident wording.

## Fix these first, they are not tone problems

Seven accuracy defects surfaced during the voice audit. They are listed here together because they are worth fixing whatever happens to the tone work, and because rewriting the surrounding copy first would only republish them in more confident wording. Ordered by seriousness.

**A1. "Allergens listed: None listed" renders when the API returns no allergen data.** Four files: [app/food-menu/_components/FoodMenuSection.tsx:213](app/food-menu/_components/FoodMenuSection.tsx:213), [app/food-menu/_components/DietaryItemList.tsx:47](app/food-menu/_components/DietaryItemList.tsx:47), [app/food-menu/_components/SundayRoastFeature.tsx:74](app/food-menu/_components/SundayRoastFeature.tsx:74), [app/fish-and-chips-heathrow/page.tsx:169](app/fish-and-chips-heathrow/page.tsx:169). Absent data is not the same as no allergens, but a customer reads "None listed" as "this dish is safe". This is a safety issue rather than a copy issue and it needs an owner decision on the fallback wording, so it is not specced here. Suggested direction: show the existing "speak to staff" line instead of a list when the data is empty.

**A2. The boxing page sells pay-per-view we do not carry.** [app/live-sport/boxing/page.tsx:61](app/live-sport/boxing/page.tsx:61) and lines 67 to 68 promise "We pay the Box Office fees so you don't have to" and "Watch the big Pay-Per-View fights here on the big screen." The Anchor has been terrestrial only (BBC, ITV, Channel 4) since January 2025, and the site's own live sport hub says so on the same domain. Needs an owner decision: rewrite around terrestrial coverage, or retire the page.

**A3. `/pubs-in-stanwell` dates the pub to 1995 in six visible places.** [app/pubs-in-stanwell/page.tsx](app/pubs-in-stanwell/page.tsx) lines 19, 24, 40, 88, 127 and 359. The SSOT says 1751. Two of these are the meta description and the JSON-LD schema, so the wrong founding date is being fed to Google as structured data. If 1995 marks the current ownership chapter, say that explicitly rather than letting it stand as the founding date.

**A4. Four pages tell people they must book a Sunday roast.** [app/sunbury-pub/page.tsx:132](app/sunbury-pub/page.tsx:132) says "booking essential!" and line 233 recommends "booking by Wednesday/Thursday"; [app/horton-pub/page.tsx:250](app/horton-pub/page.tsx:250) and [app/egham-pub/page.tsx:270](app/egham-pub/page.tsx:270) push the same way. Since the 17 May 2026 walk-in launch there is no pre-order and no cutoff. This copy is actively turning away walk-in trade. Full rewrite at 3B.4.

**A5. Eleven menu and drink prices are hardcoded.** Including [app/our-pub/page.tsx:423](app/our-pub/page.tsx:423) "Pints start from £4.95" and [app/beer-garden/page.tsx:117](app/beer-garden/page.tsx:117) "food from £10". Prices must come live from the management DB. These will drift silently.

**A6. The December homepage band hardcodes opening hours.** [lib/monthly-copy.ts:208](lib/monthly-copy.ts:208). Detail and fix at 2.2a.

**A7. The drinks page overstates proximity and makes two unsubstantiated claims.** [app/drinks/page.tsx:284](app/drinks/page.tsx:284) claims "Just 5 Minutes from Heathrow" when the SSOT range is 7 to 12 minutes (7 to Terminal 5). Lines 318 and 324 claim "Premier Drinks Destination" and "Stanwell Moor's largest beer garden", both of which SSOT section 14 bans without substantiation. Line 298 also claims "open late", which is not in the SSOT.

## Scope and exclusions

**This document changes nothing.** It is a specification only. No page, component or lib file has been edited.

These stay in the calm register and are **excluded from the rollout entirely**. Do not add energy to them in this pass or any later one.

| Area | Why excluded |
|---|---|
| `app/privacy-policy/page.tsx` sections 1 to 12 | Legal text. ICO wording beats personality. |
| `app/quiz-night-competition-terms/page.tsx` competition details, winner selection, promoter block, injected `fullTermsHtml` | Competition terms, and noindexed. |
| `app/safety-and-respect/page.tsx` "Our standards", "If something doesn't feel right", harassment FAQ | A guest reading this may be in distress. The flat certainty is the point. |
| `app/join-our-team/_components/RecruitmentApplicationForm.tsx` lines 79 to 105 | Validation and error strings. "Please enter your email address." should stay boring. |
| `components/features/TableBooking/ManagementTableBookingForm.tsx` and `BookingConfirmedCard` | The whole booking step flow: field labels, helper text, hours notes, deposit and high-chair copy. Already plainly written. |
| `components/features/ParkingBookingWizard` lines 671 to 709, plus the noscript fallback | Payment, capture failure, PayPal error and owner's-risk strings. |
| `app/leave-review/page.tsx` | A redirect stub. `redirect()` throws before the JSX renders, so no human ever sees the text. Spend nothing here. |
| `app/book-table/page.tsx` sidebar, accessibility section, all eight booking FAQs | Operational. Reads correctly as calm and accurate. |
| `app/accessibility/page.tsx` body | Honest and calm throughout. Only three precision slips are flagged. |
| `app/beer-garden/page.tsx` schedule and caveat panel, plane-spotting FAQ hedging, accessibility note | The hedging is operational accuracy. Aircraft are overhead roughly half the year. |
| `app/find-us/page.tsx` turn-by-turn directions and seven-day hours block | Operational. |
| `app/sustainability/page.tsx` "What we're not claiming" | Honesty section. Leave it. |
| `app/heathrow-parking/confirmation/[bookingId]/page.tsx` | Confirmation copy. |
| `lib/event-booking-copy.ts`, `lib/event-presentation.ts`, booking statements, `lib/constants.ts` deposit copy | Correctly written in the calm operational register. |
| `components/AmenityStrip` | A factual utility strip. Energy would be wrong. |
| All allergen and NGCI copy, food hygiene wording | Safety copy. The one exception is a reviewed addressee change at 1.11 below, which preserves scope exactly. |
| Sunday roast deposit and last-seating lines, What's On CtaBand deposit copy | Operational facts that must survive verbatim. |

Two files named in the audit carry no live copy and need no work: `components/features/VenueSpacesTable.tsx` and `components/features/CateringPackagesTable.tsx` are not imported anywhere.

## How to read this spec

Every entry gives the file path and line, the element, the current copy in quotes, the problem in one line, and the replacement. **P1** means do it first: accuracy failures, banned claims, and the highest-cascade strings. **P2** is standard voice work. **P3** is polish that can ride along with anything else in the same file. Effort is **XS** (one string), **S** (a few strings in one file), or **M** (a multi-string or multi-file pass). Where the fact-checker amended an auditor's suggestion, the amended version is what appears here and is marked *(amended)*; the original and the reason it was rejected are in the Rejected recommendations section. One global rule applies to every entry: never write "cooked to order" or "cooked fresh to order" for the roast. The joints are roasted in advance and carved to order. Standardise on **"carved fresh"** or **"plated fresh to order"**.

## Phase 1, highest cascade (do first)

Twenty-two changes in shared components and libraries. Ordered by pages reached, descending. These give the best return per edit on the whole site.

### 1.1 `components/layout/Footer.tsx` line 39 (P1, XS)
**Reaches every page on the site.** Footer default business description.
- Now: "A village pub in Stanwell Moor since 1751. Proper pub food, a beer garden under the Heathrow flight path and free customer parking, 7 minutes from Heathrow Terminal 5."
- Problem: The highest-cascade paragraph on the site is a facts list with no feeling and no pride in it.
- Change to: "We have been the village pub in Stanwell Moor since 1751, long before Heathrow existed. Proper pub food, a beer garden right under the flight path, and free parking for our guests, 7 minutes from Terminal 5."

### 1.2 `components/features/christmas/ChristmasLightbox.tsx` lines 207 to 226 (P1, S) *(amended)*
**Site-wide interstitial in season.** Heading, body and primary CTA.
- Now: heading "Ask for Current Christmas Pricing", CTA "View Festive Packages".
- Problem: The one Christmas surface the rebuild missed. It opens by asking the reader to do admin, and its CTA contradicts the page it links to, which sells spaces shaped around your group "rather than a package you pick off a list".
- Change to: Heading "A village pub Christmas, your table and your evening". Body: "Each guest picks 1, 2 or 3 courses for themselves, for groups of {CHRISTMAS_MINIMUM_PARTY_SIZE} or more. A deposit secures your booking and comes off your final bill." CTA: "See the Christmas menu".
- Note: the group minimum must stay in the body and must come from the constant, never a literal.

### 1.3 `lib/event-copy.ts` line 146 (P1, XS)
**Reaches every event page with no stored description, and their Event JSON-LD.**
- Now: "Join us for ${event.name} at The Anchor in Stanwell Moor. Experience great food, drinks and entertainment in a welcoming atmosphere."
- Problem: Stacks two banned filler patterns ("great food", "welcoming atmosphere") in the most-reused event string on the site.
- Change to: "Join us for ${event.name} at The Anchor, our village pub in Stanwell Moor. Free parking, seven minutes from Heathrow Terminal 5, and everyone is welcome."

### 1.4 `components/PrivateBookingSection.tsx` line 20 (P1, XS) *(amended)*
**Reaches roughly 26 pages:** 9 private-hire pages plus all 17 landmark pages. Only `/private-hire` and `/corporate-events` override it.
- Now: "Instant Quote & Check Availability"
- Problem: Enterprise software language, and it over-claims: the calculator makes no network calls and never checks availability.
- Change to: "Tell us your date and see what it would cost"

### 1.5 `components/PrivateBookingSection.tsx` line 47 (P1, S)
**Same 26 pages.** Supporting paragraph above the estimator.
- Now: "Use our cost estimator to build a bespoke quote for your event. Choose your space, guest count, catering, and extras to see a live price breakdown."
- Problem: "cost estimator", "bespoke quote" and "live price breakdown" are vendor language that could belong to any booking SaaS, and nothing reassures the reader that they are not committing to anything.
- Change to: "Choose your space, your guest count and what you would like to eat, and watch the price update as you go. It is an estimate, not a booking, so have a play."

### 1.6 `components/PrivateBookingSection.tsx` line 54 (P1, XS) *(amended)*
**Same 26 pages.** Estimator button label.
- Now: "Open Cost Estimator"
- Problem: Names the tool rather than the outcome. The original suggestion, "See your price", promised a firm quote the tool does not give.
- Change to: "See your estimate"

### 1.7 `app/private-hire/near/[slug]/page.tsx` line 785 (P1, XS)
**Reaches all 17 landmark pages.** Shared "why us" heading.
- Now: "Why Choose The Anchor?"
- Problem: The most generic heading available, sitting above genuinely specific per-landmark copy.
- Change to: "A proper village pub, {landmark.distance} from {landmark.name}". For crematorium and memorial variants use "A quiet village pub, {landmark.distance} from {landmark.name}", matching the template's own tone at line 173.

### 1.8 `app/private-hire/near/[slug]/page.tsx` line 878 (P2, XS) *(amended)*
**All 17 landmark pages.** Shared closing CTA band.
- Now: "Secure the date for your gathering near ${landmark.name}"
- Problem: Transactional, and genuinely cold on the crematorium variants where the same string serves families arranging a wake.
- Change to: "Tell us your date and your numbers, and we will have your area ready before you arrive." If the heading can vary by landmark type, use "Come and talk to us" on the wake and memorial pages. Use "area", not "room": smaller groups get a reserved area.

### 1.9 `components/features/HotelProximityPage.tsx` line 83 (P1, XS)
**Reaches all 11 `pub-near-*-heathrow` pages.** Hero lead.
- Now: "A proper British pub a few minutes away, with free parking, a dog-friendly beer garden and home-cooked food"
- Problem: A flat inventory that buries the cluster's strongest hook, the beer garden under the flight path, in the middle of a list.
- Change to: "Planes overhead, a pint in the beer garden and free parking, just a few minutes from your hotel. Home-cooked food, and dogs are always welcome."

### 1.10 `components/features/HotelProximityPage.tsx` line 328 (P2, XS)
**Same 11 pages.** Closing CTA band.
- Now: "Home-cooked food, a dog-friendly beer garden and free parking. Book a table or just walk in."
- Problem: A second flat feature list, so all 11 pages open and close on the same inventory.
- Change to: "Free parking, dogs welcome, and planes coming in low over the garden. Book a table, or just walk in and see."

### 1.11 `components/features/AllergenFilterBar.tsx` line 206 (P3, XS) *(amended)*
**Reaches every menu surface.** Allergen disclaimer in the filter panel.
- Now: "All dishes are prepared in a kitchen where allergens are present. Please speak to staff about your dietary requirements."
- Problem: Voice only. "staff" and "dietary requirements" are institutional where every other menu surface says "our bar team". The scope of the warning must not shrink.
- Change to: "All dishes are prepared in a kitchen where allergens are present. Please tell our bar team about any allergies or dietary requirements before you order."
- Note: "or dietary requirements" is not optional. Dropping it silently excludes coeliac, NGCI and non-allergy dietary needs.

### 1.12 `components/TestimonialSection.tsx` line 72 (P2, XS)
**Reaches 6 pages.** Review attribution separator.
- Now: `{review.source && <> &mdash; {review.source}</>}`
- Problem: Renders an em dash in customer-facing copy, against the punctuation rule. The pull-quote variant at line 111 of the same component already uses a comma.
- Change to: `{review.source && <>, {review.source}</>}`

### 1.13 `lib/local-seo-data.ts` line 147 (P1, XS)
Renders on `/private-hire/near/heathrow-airport` and in the landmark grids on `/private-hire`, `/private-hire/wakes`, `/christenings`, `/baby-showers` and `/sitemap-page`.
- Now: "The Anchor is 7 minutes from Heathrow Terminal 5, ideal for airport staff events, farewell dinners, and gatherings for those travelling or arriving at Heathrow."
- Problem: Third person about ourselves, and it states the most distinctive thing about the pub with none of the feeling.
- Change to: "We are 7 minutes from Terminal 5, with the planes going right over the beer garden. Ideal for airport team nights, farewell dinners, and anyone gathering before or after a flight."

### 1.14 `lib/local-seo-data.ts` line 63 (P2, XS)
Renders on `/private-hire/near/st-johns-church-egham` and the church grid on `/private-hire/christenings`.
- Now: "A short drive from Egham, offering a relaxed and welcoming atmosphere for church events and family celebrations."
- Problem: "welcoming atmosphere" is banned filler, there is no "we" anywhere, and no concrete reason to choose us.
- Change to: "A short drive from Egham, with free parking for every guest. We are well set up for christening lunches, anniversaries and family gatherings after a service."

### 1.15 `lib/local-seo-data.ts` line 109 (P2, XS) *(amended)*
Renders on `/private-hire/near/stockley-park` and the business-park grid on `/private-hire`.
- Now: "Accessible via the M25 and local roads, we provide a great off-site location for Stockley Park businesses."
- Problem: "a great off-site location" is filler doing a concrete detail's job, and it wastes the 12-minute distance already stored in the record.
- Change to: "Twelve minutes from Stockley Park via the M25 and local roads. A proper pub lunch away from the desk, with free parking for the whole team."

### 1.16 `lib/tag-seo-content.ts` line 21 (P2, S)
`generateFallbackSEOContent` meta description template. Dormant today, but fires automatically the moment anyone adds a new tag to a blog post.
- Now: "Your local pub with great food, drinks & atmosphere - we're 7 minutes from Heathrow Airport."
- Problem: Banned "great atmosphere" filler, and the matching `introContent` on line 23 adds "a warm welcome and great atmosphere" plus "cornerstone of the local community".
- Change to: "Everything we have written about ${name.toLowerCase()} at The Anchor, the village pub in Stanwell Moor. Free parking, and 7 minutes from Heathrow Terminal 5."

### 1.17 `lib/tag-seo-content.ts` line 327 (P2, M)
`/blog/tag/news`, the largest tag at 76 posts. Intro paragraph.
- Now: "The Anchor is always evolving to serve our community better. Our news section keeps you updated on menu changes and new dishes, upcoming events and entertainment, pub improvements and renovations,"
- Problem: Corporate report voice, third person about ourselves, and it could belong to any pub chain.
- Change to: "This is where we put everything worth telling you about: new dishes, what is coming up, changes to the pub, and the community bits we are proud of. If it happens at The Anchor, it lands here first."

### 1.18 `lib/tag-seo-content.ts` line 328 (P2, XS) *(amended)*
`/blog/tag/news` highlighted card.
- Now: "Bookmark this page and check back regularly for the latest news from The Anchor. Better yet, sign up for our newsletter to get updates delivered straight to your inbox."
- Problem: Instructs rather than invites, and it points at a newsletter signup that does not exist anywhere in the codebase.
- Change to: "Pop back whenever you like, we update this as things happen. Or follow us on socials and it will find you instead."
- Note: only restore the newsletter line if a working signup is actually built.

### 1.19 `lib/tag-seo-content.ts` line 93 (P2, XS)
`/blog/tag/community`, 59 posts. Highlighted card.
- Now: "Experience the warmth of a genuine village pub where everybody knows your name."
- Problem: Brochure register plus a borrowed sitcom cliche, so the belonging promise is asserted rather than felt.
- Change to: "Been here forty years or forty minutes, it makes no difference to us. Pull up a stool and we will learn your name soon enough. Where everyone's welcome, and we mean it."

### 1.20 `lib/tag-seo-content.ts` line 180 (P2, XS)
`/blog/tag/sports` meta description.
- Now: "Multiple screens, great atmosphere for BBC, ITV, Channel 4 & Channel 5 fixtures near Heathrow."
- Problem: Banned "great atmosphere" filler in a live search snippet, spending its characters on a channel list rather than the fixtures people search for.
- Change to: "Terrestrial sport at The Anchor, Stanwell Moor. World Cup, Euros and Six Nations on BBC, ITV, Channel 4 and Channel 5, with free parking near Heathrow."

### 1.21 `lib/tag-seo-content.ts` line 646 (P2, S) *(amended)*
`/blog/tag/seasonal`, 22 posts. Intro paragraph.
- Now: "Our commitment to seasonality means The Anchor constantly evolves throughout the year. Spring brings fresh, light dishes and garden reopening. Summer sees BBQs and long evenings in the beer garden."
- Problem: Opens with a mission-statement abstraction, and the same string uses the US spelling "cozy fires". There is no fire, fireplace or log burner anywhere in the SSOT, so the fire claim must go rather than be corrected.
- Change to: "We love how the year turns here. Light dishes and the garden waking up in spring, long summer evenings out the back under the flight path, and hearty comfort food when autumn and winter bite."

### 1.22 Americanisms sweep, 7 files, 26 instances (P1, S)
`app/heathrow-family-dining/page.tsx`, `app/near-heathrow/terminal-2` to `terminal-5`, `app/heathrow-hotels-pub/page.tsx`, `app/heathrow-layover-dining/page.tsx`.
- Now: "travelers" and "traveling" at family-dining 89 and 165; terminal-2 53, 311, 415, 441, 487; terminal-3 54, 279, 342, 458, 565, 589; terminal-4 53, 278, 459, 567; terminal-5 54, 473, 509, 545, 554; heathrow-hotels-pub 593, 594, 605; heathrow-layover-dining 138. Plus "cozy" at terminal-2 412.
- Problem: British English is the standard.
- Change to: "travellers", "travelling", "cosy".
- Note: run this as a reviewed replace, not a blind `sed`. Several instances sit inside JSON-LD strings and FAQ answers where a careless match breaks quoting. Separately, `app/private-hire/retirement-parties/page.tsx` line 108 has "Organizers" and `app/karaoke/page.tsx` line 316 has "specialized"; both are handled in their own entries below.

## Phase 2, core pages

Forty changes on the pages that carry the most traffic and the most feeling. One warning that applies to this whole phase: several audit suggestions quoted a single sentence but replaced facts from the sentences following it. Read the full surrounding paragraph before applying anything here, or you will ship a visible stutter.

### Homepage

**2.1 `lib/monthly-copy.ts` line 154 (P1, XS)** Hero lead, August. This is the evergreen baseline set, it renders today, and it is the fallback for any invalid month, so it carries double cascade.
- Now: "A proper village pub in Stanwell Moor, 7 minutes from Heathrow Terminal 5. Pub classics, stone-baked pizzas, a beer garden under the flight path and free customer parking."
- Problem: Four facts in a row with no reason to care, and it misses 1751 entirely, the biggest pride lever we own.
- Change to: "We have stood in Stanwell Moor since 1751, long before Heathrow existed, and we still love it here. Pub classics, stone-baked pizzas and a beer garden under the flight path, 7 minutes from Terminal 5 with free parking."
- Note: because 1751 now lands in the rotating lead, leave the hero review row in `app/_components/HomeHero.tsx` line 151 alone. Both would state the same fact twice on one screen.

**2.2 `lib/monthly-copy.ts` line 57 (P2, XS)** `READY_TO_VISIT` closing CTA band, shared by April, June, August and September.
- Now: "Walk-ins are always welcome, but booking guarantees your spot."
- Problem: The final conversion moment reads like a booking engine, and the same sentence also appears verbatim in the homepage FAQ, so it lands twice on one page.
- Change to: Title "We would love to see you". Copy: "Walk in whenever you like. Book if you would rather know the table is already yours."

#### Homepage monthly copy, the remaining ten months

A dedicated audit of all twelve monthly sets in `lib/monthly-copy.ts` found the file mechanically spotless: zero em dashes, zero banned filler, zero stacked exclamation marks, no invented claims, and every Christmas figure correctly interpolated from `lib/christmas-season.ts` rather than typed. May, June and July already meet the new standard and need nothing.

The gap is register, not compliance. Only 6 of roughly 72 copy fields use "we" or "our", and not one `script` line does. The copy observes the season in the third person instead of inviting the reader in. Fixing four or five lines fixes the feel of the whole year.

**2.2a `lib/monthly-copy.ts` line 208 (P1, XS)** December closing band. **Accuracy defect, not tone.**
- Now: "The doors stay open right through to New Year."
- Problem: A hardcoded opening-hours claim covering eleven days including Christmas Day. SSOT section 3 is explicit that hours only ever come from the API and that special-hours overrides always win. This is the only prose on the homepage asserting opening hours. Separately, the December `bandTitle` on line 207 is word for word identical to the `script` on line 201, so the same sentence renders twice on one page.
- Change to: Title "See the year out with us". Copy: "We would love to see you in before New Year, so come and raise one with us."
- Note: retains "New Year", which the test at line 123 asserts. If the owner confirms the pub genuinely opens every day to 31 December, the original line may stay, but it must be a confirmed fact rather than an assumption.

**2.2b `lib/monthly-copy.ts` line 190 (P1, XS)** November hero lead. The highest-energy slot in the year.
- Now: "Festive service runs ${christmasWindow}. Christmas bookings take groups from ${minParty} guests up, in a proper village pub 7 minutes from Heathrow Terminal 5."
- Problem: Opens with an operating window and a minimum party size. A policy notice in the slot that should sell Christmas hardest.
- Change to: "We love Christmas here and we can't wait to do yours properly. Festive service runs ${christmasWindow}, for groups from ${minParty} guests up, in a village pub 7 minutes from Heathrow Terminal 5."
- Note: both interpolations must survive. The test at line 82 asserts the lead contains the live window label.

**2.2c `lib/monthly-copy.ts` line 176 (P2, XS)** October script line.
- Now: "Pull the evenings in"
- Problem: Not idiomatic. Nights draw in, you do not pull evenings in.
- Change to: "Dark outside, warm in here"

**2.2d `lib/monthly-copy.ts` line 183 (P2, XS)** October closing band.
- Now: "Festive bookings are open for groups from ${minParty} guests up. Get your date in early."
- Problem: Purely transactional, and the instruction carries no warmth.
- Change to: "We love this time of year. Festive bookings are open for groups from ${minParty} guests up, so tell us your date and we will look after the rest."
- Note: must keep the word "festive", which the test at line 105 asserts.

**2.2e `lib/monthly-copy.ts` line 99 (P2, XS)** March script line.
- Now: "Lighter evenings ahead"
- Problem: A weather forecast, not an invitation. Fails the chain-website test outright.
- Change to: "The first pint outside"
- Note: stays distinct from the April, May, June and July scripts, which the test at line 44 requires.

**2.2f `lib/monthly-copy.ts` line 83 (P3, XS)** January band title.
- Now: "Beat the January quiet"
- Problem: Invites people by telling them the pub is empty. Cheeky at our own expense is permitted, so this is a judgement call, but it is an unforced negative on the highest-traffic page. The existing `bandCopy` on line 84 is already good and needs nothing.
- Change to: "January needs a long lunch"

**2.2g `lib/monthly-copy.ts` line 95 (P2, XS)** February band copy. **Verify before changing.**
- Now: "Sundays fill up quickly in February. Tell us when and we will hold a table."
- Problem: A demand claim with no SSOT backing. Not on any banned list and quite possibly true, but principle 6 says excitement never invents facts.
- Change to: keep as written if the owner confirms it is true, because the urgency is doing real conversion work. Only soften if it cannot be confirmed.

**Implementation traps for this file.** The test at line 61 bans the regex `/pre.?order|cut.?off/i` across all twelve sets, so a rewrite cannot say "no pre-order needed" even though it is true and on brand. Use "walk in whenever suits you" instead. The twelve `script` values must stay distinct (line 44) and every `badges` array must stay exactly four items (line 38). All CTA labels and badge arrays are deliberately excluded: `primaryCta` is "Book a table" in eleven of twelve months and button clarity beats button personality. December's `primaryCta` must never become festive-specific, because festive service ends on the 20th while the decorated window runs to the 31st.

**2.3 `app/page.tsx` line 91 (P1, S)** `PATH_CARDS`, Sunday roast card.
- Now: "Roasts served every Sunday, 1pm to 6pm. Walk in or book ahead."
- Problem: The standard's own "flat" example, almost word for word, describing the best thing on the menu in the dullest terms. All four cards share the pattern (lines 84, 91, 98, 105); fix the set together.
- Change to: "The best thing we do. Carved fresh from 1pm to 6pm, walk in whenever suits."

**2.4 `app/page.tsx` line 125 (P2, XS)** *(amended)* "What makes us special" card, "Everyone is welcome".
- Now: "A dog-friendly beer garden under the flight path, a children's menu and a relaxed local welcome for the whole family."
- Problem: The card carrying the belonging promise delivers a feature list, and "a relaxed local welcome" is the vague work the standard warns against.
- Change to: "First time in a pub or in every week since 1751, you get the same welcome. Dogs are welcome throughout, there is a children's menu, and the beer garden sits right under the flight path."
- Note: "welcome throughout" is deliberate. Dogs are welcome in the whole venue, not fenced into the garden.

**2.5 `app/page.tsx` line 261 (P2, XS)** *(amended)* "Coming up at The Anchor" section lead.
- Now: "Live from our events calendar, here is what is next at the pub."
- Problem: Describes the CMS rather than the pub.
- Change to: "Here is what is next at the pub."
- Note: deliberately plain. The warmer "the ones we are most excited about" construction belongs to `/whats-on` (entry 2.10) and must not be duplicated here.

### Sunday roast

**2.6 `app/sunday-roast/page.tsx` line 153 (P1, XS)** *(amended)* `InteriorHero` lead.
- Now: "A proper Sunday roast 7 minutes from Heathrow Terminal 5. Walk in any time from 1pm to 6pm. No booking, no pre-order, just sit down and order at the table."
- Problem: Opens with distance and opening times rather than why Sunday here is worth turning up for.
- Change to: "Sunday is the day we look forward to all week. Roasts carved fresh from 1pm to 6pm, 7 minutes from Heathrow Terminal 5. No booking, no pre-order, just walk in and order at the table."
- Note: this is the only page allowed the "look forward to" construction. Do not repeat it on the homepage.

**2.7 `app/sunday-roast/page.tsx` line 474 (P2, S)** *(amended)* "Fresh Roasts, Made to Order" closing body.
- Now: "We plate Sunday roasts fresh to order, with walk-ins welcome and no pre-order needed. Come and see why guests keep talking about our roasts."
- Problem: Closes on vague proof ("guests keep talking about our roasts") with nothing concrete behind it.
- Change to: "Every roast is carved fresh to your plate, with triple-cooked roast potatoes, seasonal veg and our own gravy. Walk in any time from 1pm, no booking and no pre-order needed."
- Note: the walk-in and no-pre-order facts must survive. The walk-in model replaced pre-order and prepayment in May 2026 and returning guests still carry the old expectation. Say "our own gravy", not "signature gravy": the signature gravy contains meat stock and would misdescribe the vegan Wellington.

**2.8 `app/sunday-roast/page.tsx` line 494 (P2, XS)** *(amended)* Closing `CtaBand`.
- Now: "Sunday service runs 1pm to 6pm. 7 minutes from Heathrow Terminal 5."
- Problem: The last thing a reader sees on our highest-intent page is a timetable.
- Change to: Title "Come and spend your Sunday with us". Copy: "Roasts from 1pm to 6pm, last table 5:30pm. Walk in whenever suits, 7 minutes from Heathrow Terminal 5."
- Note: the times, the 5:30pm last seating and the walk-in permission must survive any further edit to this band.

### What's On

**2.9 `app/whats-on/page.tsx` line 189 (P1, XS)** `InteriorHero` lead.
- Now: "Quiz nights, Music Bingo and cash bingo in Stanwell Moor, seven minutes from Heathrow Terminal 5 with free parking. Pick a night, check the date and reserve your table."
- Problem: Lists the nights then issues a three-step instruction that duplicates the buttons underneath it.
- Change to: "Our favourite nights of the month, and yes, the quiz gets competitive. Quiz nights, Music Bingo and cash bingo in Stanwell Moor, seven minutes from Heathrow Terminal 5 with free parking."

**2.10 `app/whats-on/page.tsx` line 223 (P2, XS)** "Next up" section lead.
- Now: "Choose a hosted night below, check the date, price and seats, then reserve through the event's own booking form."
- Problem: A four-step interface instruction sitting directly under a line that says "Don't miss it".
- Change to: "These are the ones we are most excited about. Pick your night, then reserve your seats on the event's own page."

**2.11 `app/whats-on/page.tsx` line 275 (P1, XS)** "Seasonal occasions" section heading.
- Now: "Plan ahead for the dates people search for"
- Problem: SEO reasoning leaked into customer copy: it tells the reader we built the section for rankings, not for them.
- Change to: "Plan ahead for the big dates"

**2.12 `app/whats-on/page.tsx` lines 81 and 83 (P2, XS)** *(amended)* "The regulars" card, Quiz Night. **This is a factual fix, not just tone.**
- Now: line 81 "Test your knowledge with cash prizes for the winning team." and line 83 `tag: 'Cash prizes'`.
- Problem: The quiz prize is not cash. It is a £25 bar tab, stated four times on `app/quiz-night/page.tsx` and in the SSOT. The card contradicts all of them today.
- Change to: line 81 "It gets competitive. Bring a team of up to six, argue about the answers, and play for the £25 bar tab." Line 83 tag: "£25 bar tab".
- Note: £25 is a fixed non-food prize, which the pricing policy explicitly permits stating.

### Book a table

**2.13 `app/book-table/page.tsx` line 296 (P2, XS)** *(amended)* "What to Expect When You Dine With Us" subtitle.
- Now: "Good food, a warm welcome, and no fuss."
- Problem: Three generic phrases from the banned-filler family, naming nothing. This sits in the marketing band, not the operational band, so the calm register does not excuse it.
- Change to: "Pub classics, stone-baked pizzas and roasts carved fresh, with free parking right outside."

**2.14 `app/book-table/page.tsx` line 181 (P3, S)** *(amended)* Intro under the H1.
- Now: "Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week."
- Problem: "Loved by locals" is unearned generic praise.
- Change to: "Pick your date, time and party size to reserve your table."
- Note: drop the social-proof sentence rather than restating it, and keep the verb "reserve". The form does not hold a table; the management system confirms it, and 10+ needs a deposit first. Everything below this line is operational and stays untouched.

### Identity and story pages

**2.15 `app/beer-garden/page.tsx` line 117 (P1, XS)** *(amended)* Hero lead.
- Now: "Plan a plane spotting visit with a pint, food from £10, dogs welcome"
- Problem: Instructs rather than invites, and it hardcodes a food price against the live-price rule.
- Change to: "Pint in hand, planes overhead, dogs very welcome. The best plane spotting seat near Heathrow, seven minutes from Terminal 5."

**2.16 `app/beer-garden/page.tsx` line 126 (P1, S)** *(amended)* Opening paragraph, the featured-snippet answer.
- Now: "The Anchor&apos;s beer garden in Stanwell Moor sits under Heathrow&apos;s expected 27R arrivals path, offering a unique plane spotting base with your pint."
- Problem: Corporate register on the page that should carry the most simple joy on the site.
- Change to: "The Anchor's beer garden in Stanwell Moor sits under Heathrow's expected 27R arrivals path, so you can settle in with a pint and watch them come in overhead. There's nowhere else quite like it. Dogs welcome, free parking, 64 seats."
- Note: the block is explicitly built for featured snippets, so it must keep opening entity-first and must keep "in Stanwell Moor" and the word "expected".

**2.17 `app/beer-garden/page.tsx` line 220 (P2, S)** "Why Aviation Enthusiasts Love Us" card title and bullet labels.
- Now: "Refreshments: Full bar service delivered to your table" (plus "Perfect Position", "Low & Loud", "Photo Friendly").
- Problem: Brochure headings, and "Refreshments" is a word no pub would say out loud.
- Change to: Retitle the card "Why the plane spotters keep coming back". Labels: "Right underneath: we sit under Heathrow's expected 27R approach path" / "Low and loud: when 27R is operating, aircraft pass at roughly 500 to 800 feet" / "Bring the camera: nothing blocking the view" / "Drinks brought out: full bar service to your table in the garden" / "Free WiFi: fast guest WiFi throughout the pub".

**2.18 `app/beer-garden/page.tsx` line 277 (P2, S)** *(amended)* "Our Unique Beer Garden" feature card 1.
- Now: `{ title: 'Spacious Seating', description: 'Multiple tables with umbrellas for sunny days' }`
- Problem: Generic where the page already states 64 seats twice.
- Change to: `{ title: 'Room to Spread Out', description: '64 seats, with umbrellas for the sunny days and heated areas when it turns' }`
- Note: no lawn, no grass, no covered seating. The SSOT records heated areas only.

**2.19 `app/about/page.tsx` line 93 (P1, XS)** Hero lead.
- Now: "A village pub since 1751"
- Problem: States a date on the page that exists to say who we are, without making anyone feel invited.
- Change to: "A village pub since 1751, where everyone's welcome."

**2.20 `app/about/page.tsx` line 330 (P2, XS)** *(amended)* "What We Do" drinks card.
- Now: "Draught lagers, bottled ales, wines, spirits, and cocktails. Something for every taste, served with a smile."
- Problem: A banned filler variant plus a phrase that could belong to any chain.
- Change to: "Draught lagers, bottled ales, wines, spirits and cocktails. Tell us what you fancy and we'll sort you out."
- Note: "we'll sort you out", not "we'll pour it". Spirits and cocktails are not poured and stock is not guaranteed.

**2.21 `app/about/page.tsx` line 435 (P3, XS)** Hiring callout.
- Now: "Interested in joining our team? We are looking for experienced bar staff and kitchen team members."
- Problem: Reads like a job board notice on a page otherwise about belonging.
- Change to: "Fancy working behind our bar or in our kitchen? We're looking for experienced bar and kitchen team members, and we'd love to hear from you."

**2.22 `app/history/page.tsx` line 109 (P2, XS)** Hero lead.
- Now: "A village pub in Stanwell Moor since at least 1751"
- Problem: States the date without the pride that is the whole point of this page.
- Change to: "Pouring pints in Stanwell Moor since at least 1751, long before Heathrow existed."

**2.23 `app/history/page.tsx` line 143 (P2, S)** Intro paragraph, opening sentences.
- Now: "The Anchor is more than a pub near Heathrow. It is one of Stanwell Moor&apos;s oldest landmarks"
- Problem: Opens in encyclopaedia register when the steer is proud, not academic.
- Change to: "We're proud of this place. The Anchor is one of Stanwell Moor's oldest landmarks, a village local whose roots reach back through centuries of rural life, family stories, wartime loss and community gatherings."
- Note: leave the Cooper and Vanguard section, Lal's Prayer and the bus stop line completely alone. They are the best writing on the site.

**2.24 `app/our-pub/page.tsx` lines 162 and 423 (P1, S)** Hardcoded pint price, twice.
- Now: line 162 "Inch&apos;s, with pints starting from &pound;4.95." and line 423 (FAQ) "Pints start from £4.95."
- Problem: Breaks the live-price rule in two places at once, so it can drift out of date twice.
- Change to: line 162 "Inch's cider. Current pint prices are on our drinks menu." Line 423: end the answer at "...Aspall cider and Inch's cider."
- Note: line 423 feeds FAQ schema via `FAQAccordionWithSchema`, so edit it in the FAQ array. The pointer to the drinks menu is safe: that page renders live prices from the management DB.

**2.25 `app/find-us/page.tsx` line 361 (P1, M)** *(amended)* Parking section heading and panel.
- Now: "FREE Parking for Patrons - 20 Spaces Available!"
- Problem: Five exclamation marks and two all-caps shouts in one operational section, hyping copy where accuracy should win. "Patrons" also appears at lines 429 and 482 and in the parking FAQ.
- Change to: Heading "Free Parking for Guests, 20 Spaces". Lead: "Park with us while you're here. No meters, no apps, no charges." Panel: "Free parking is a rare thing this close to Heathrow. Park up, walk in, and stay as long as you're visiting." Keep the three columns as "Always free", "No time limit while you're visiting" and "20 spaces, well lit with CCTV". Replace "patrons" with "guests" throughout.
- Note: keep "for Guests" in the heading. Without it, on a page that markets to Heathrow drop-off traffic, this reads as free unlimited public airport parking. Use the `PARKING.capacity` constant, not a literal 20.

**2.26 `app/find-us/page.tsx` line 399 (P2, XS)** "Found us? Book your visit" sub-heading.
- Now: "Reserve your table now and enjoy The Anchor experience"
- Problem: "The Anchor experience" is corporate hospitality language that could belong to any chain.
- Change to: "Reserve a table and we'll have a seat waiting for you."

**2.27 `app/reviews/page.tsx` line 173 (P2, XS)** Rating summary card body.
- Now: "Read the latest live reviews on Google."
- Problem: The card heading a page about what people think of us shows no feeling about it.
- Change to: "We're chuffed with what people write about us. Read the latest live reviews on Google."
- Note: keep the live-review approach. Do not hardcode a rating.

**2.28 `app/sustainability/page.tsx` line 230 (P3, XS)** *(amended)* "What you'll notice as a guest" card 2.
- Now: "We think about more than just today. The choices we make now are about building something that lasts."
- Problem: Abstract corporate sustainability language, when we own the most concrete long-term proof point in the business.
- Change to: "There's been a pub on this spot since 1751. We'd like there still to be one long after we've gone, so we make the choices that get it there."
- Note: "a pub on this spot", not "this pub has stood here". Our own history page says the current building is believed to be mid-Victorian.

### Regular event pages

**2.29 `app/live-sport/boxing/page.tsx` lines 39, 61 and 68 (P1, M)** *(amended)* **Banned claim. Owner decision attached, see question 1.**
- Now: line 68 "We pay the Box Office fees so you don't have to. Watch the big Pay-Per-View fights here on the big screen." Line 61 "No need to pay the PPV fee yourself." Line 39 "Anthony Joshua. Tyson Fury. Usyk. When the heavyweights collide, we're the place to be."
- Problem: UK boxing Box Office runs through Sky Sports Box Office and TNT Sports Box Office. We have been terrestrial-only since January 2025, and our own hub page says so at line 143.
- Change to: Card title "Fights on free-to-air". Body: "We show the fights that land on BBC, ITV and Channel 4, on the big screens with the sound right up. Anything exclusive to Sky or TNT we cannot show, so give us a ring before you set off and we will tell you straight." Rewrite line 61 and the hero lead at line 39 to match.
- Note: **leave the entry-fee and ticketing FAQ at line 100 exactly as it is.** It makes no PPV claim and is accurate operational copy.

**2.30 `app/live-sport/page.tsx` line 103 (P1, XS)** `InteriorHero` lead.
- Now: "Terrestrial Channels Only (BBC/ITV/Channel 4). Multiple Screens. Great Food. The best atmosphere outside the stadium."
- Problem: Leads with a restriction, then reaches for banned filler twice and an unverifiable superlative.
- Change to: "Big match, sound right up, and a room full of people shouting at the same screen. We show what lands on BBC, ITV and Channel 4 (no Sky, no TNT), with free parking seven minutes from Terminal 5."

**2.31 `app/live-sport/page.tsx` lines 108, 150 and 151 (P1, S)** "Great Atmosphere" appears three times on one page.
- Now: line 151 "Enjoy a cold pint and great food in a proper pub atmosphere. No booking required, just turn up and enjoy." Line 150 card title "Great Atmosphere". Line 108 H2.
- Problem: The literal banned phrase, used three times on a single page.
- Change to: Card title "Everyone's welcome". Body: "Pull up a chair, get a pint in and shout at the screen with the rest of us. No booking needed for most games, so you can just walk in." H2 at line 108: "Live Sport Pub Near Heathrow: Big Screens, Sound On".
- Note: the audit claimed this H2 carries speakable structured data. It does not. The banned-filler point stands on its own.

**2.32 `app/live-sport/six-nations/page.tsx` line 112 (P2, S)** Intro paragraph.
- Now: "We're just 7 minutes from Heathrow Terminal 5 and miles away from the generic sports bar vibe."
- Problem: The joke points at other venues, which the standard rules out, and the next sentence falls back on "a proper pub atmosphere".
- Change to: "Seven minutes from Terminal 5, in a village pub that has stood here since 1751. Sound on, four screens, kitchen open, and every tackle watched by a room that genuinely cares who wins."
- Note: this carries forward the "kitchen open for all fixtures" claim that the page makes at lines 24, 103, 134, 183 and 232. See conflict 5 before shipping.

**2.33 `app/quiz-night/page.tsx` line 232 (P2, XS)** *(amended)* `InteriorHero` lead.
- Now: "Monthly pub quiz near Heathrow and Staines. Trivia rounds, seasonal themes, £25 bar tab for the winners and a proper pub quiz atmosphere."
- Problem: Facts first, feeling never, landing on generic "atmosphere".
- Change to: "Once a month we hand out the answer sheets and let the whole room argue over four rounds of general knowledge, film clues and riddles. Teams of up to six, £3 a player, £25 bar tab for the winners."
- Note: no nineties or decade round exists. The page's own rounds are legends, cult film clues, riddles and general trivia, plus picture and music rounds.

**2.34 `app/music-bingo/page.tsx` lines 198 and 333 (P2, S)** Format contradiction. **Accuracy fix, needs the answer to conflict 9.**
- Now: line 333 "<li><strong>Five rounds</strong> - quick-fire clips, theme rounds, and bonus singalong moments.</li>" against line 120 (FAQ) "We play two games".
- Problem: The page contradicts itself on a fact a customer reads top to bottom, and line 198 repeats the five-rounds claim.
- Change to: confirm the true format with the management listing and make all three places agree. If it stays unconfirmed, drop the count: "<li><strong>The games</strong> - quick-fire clips, theme rounds, and bonus singalong moments.</li>" and change line 198 to "Song snippets, singalong prompts and shout-outs all night. Grab your card, spot the track, and celebrate every line win."

**2.35 `app/music-bingo/page.tsx` line 585 (P2, XS)** Wrong schema published.
- Now: `<JsonLd data={bingoEventSeries} />` plus the import on line 38.
- Problem: The Music Bingo page publishes the Cash Bingo series to search engines ("Monthly bingo night, £10 per book, cash only"), a different night at a different price. The page already declares its own correct series inline at line 228.
- Change to: delete line 585 and the import on line 38.
- Note: verified safe. `bingoEventSeries` is still emitted by `app/cash-bingo/page.tsx` line 489 and `app/whats-on/page.tsx` line 135.

**2.36 `app/cash-bingo/page.tsx` line 201 (P1, XS)** `InteriorHero` lead.
- Now: "Play bingo for cash and classic bingo games near Heathrow with £10 bingo tickets and books, bingo calls and numbers, a snowball bonus and jackpot bingo prizes."
- Problem: The word "bingo" five times in one sentence with no feeling anywhere. Written for a crawler, not for someone deciding how to spend Thursday night.
- Change to: "Ten games, eyes down at 7pm, and a snowball that gets fatter every month nobody wins it. Bring cash, bring a lucky dauber, bring the whole table."

**2.37 `app/cash-bingo/page.tsx` line 210 (P1, S)** *(amended)* Intro paragraph under the H1.
- Now: "Searching for cash bingo games near Heathrow? If you're after things to do near Heathrow, our bingo nights are a local favourite. Every few weeks we turn The Anchor into a buzzing bingo hall"
- Problem: Opens with a search query, repeats "near Heathrow" twice in two sentences, then stacks "bingo hall and bingo room with bingo games for money".
- Change to: "This is our favourite kind of noise. Ten games, a room full of locals, cabin crew and Stanwell Moor neighbours, and someone shouting bingo before you have marked half your card. Cash bingo near Heathrow, in a proper village pub. {heroDescription}"
- Note: **keep the `{heroDescription}` interpolation.** It carries the live door time, start time and the booking phone number. Dropping it deletes all three from the page.

**2.38 `app/karaoke/page.tsx` line 194 (P1, XS)** *(amended)* `heroDescription` fallback, shown when no karaoke date is listed.
- Now: "Sing your heart out at The Anchor. Thousands of songs, cold drinks, and a great atmosphere. Free entry!"
- Problem: Contains the banned phrase verbatim, in the state that runs most of the time because karaoke is occasional. An energetic present-tense invitation here implies karaoke is on when nothing is scheduled.
- Change to: "No karaoke date in the diary just yet. Thousands of tracks, free entry, and we will post the next one here and on Facebook as soon as it is booked."

**2.39 `app/karaoke/page.tsx` line 316 (P2, XS)** *(amended)* "Group Bookings" card.
- Now: "Planning a birthday or office party? Reserve a specialized area for your team."
- Problem: US spelling, and corporate-venue language on a page about singing badly with your mates.
- Change to: "Birthday, or a work night out? Book a table for your group and tell us the numbers, and we will seat you together where we can. Groups of 10 or more pay a £10 per person deposit, which comes off your bill."
- Note: "where we can", not a flat guarantee. The card links straight to `BookTableButton`, so a guest could hold us to it.

**2.40 `app/karaoke/page.tsx` line 119 (P2, XS)** *(amended)* "Liquid Courage" card.
- Now: "Need a confidence boost? Our bar is fully stocked with craft beers, cocktails, and shots to help you hit those high notes."
- Problem: "craft beers" is a drinks-inventory claim with nothing behind it. The SSOT says the full inventory must come from the live POS or API.
- Change to: Card title "Dutch courage". Body: "Nervous? You are in good company. Get a drink in, pick something you can actually reach the notes on, and the room will do the rest."

## Phase 3, page families

Ninety changes, grouped by family. Each family opens with the shared boilerplate problem so it is fixed once rather than argued about page by page.

### 3A. Food and drink menus, 13 changes

**The family problem:** two files are close to the standard already (`app/food-menu/page.tsx` and `app/drinks/managers-special/page.tsx`) and two are not. `app/drinks/page.tsx` carries a layer of older brochure copy including two claims the SSOT does not support, and `app/pizza-menu/page.tsx` describes its own CMS to the customer, so nothing on it could make anyone want a pizza. A cross-file tic runs through both: internal vocabulary ("live menu", "live menu data", "the menu page owns") leaking into customer copy. Fix that as one set, listed at 3A.3.

**3A.1 `app/pizza-menu/page.tsx` line 129 (P1, XS)** Hero lead.
- Now: "Current pizza dishes, descriptions and prices from the latest kitchen menu."
- Problem: Leads with facts about the data feed and names nothing concrete, so the highest-attention line on the page is inert.
- Change to: "Stone-baked pizzas, out of our kitchen in Stanwell Moor. Seven minutes from Terminal 5, with free parking right outside."

**3A.2 `app/pizza-menu/page.tsx` line 138 (P1, XS)** *(amended)* Section heading lead, "Pizza Near Heathrow".
- Now: "If a pizza name, description or price changes, this page follows that update."
- Problem: Describes the content management system instead of the pizza.
- Change to: "Hand-stretched, stone-baked, and made to order in our kitchen."
- Note: not "what our kitchen is baking today". This is a static string on a page served every day, and the Monday kitchen is always closed.

**3A.3 `app/pizza-menu/page.tsx` line 156, plus siblings (P2, S)** *(amended)* Internal menu vocabulary, fix as a set.
- Now: line 156 "Vegan-option dishes are labelled from the menu data and should be requested at the bar." Same tic at pizza-menu lines 45, 168 and 206, and food-menu lines 216 and 246.
- Problem: Internal system vocabulary shown to customers.
- Change to: line 156 "Pizzas with a vegan option are marked on the menu below. Just ask at the bar when you order." Rewrite the sibling lines to drop "live menu data", "from the current food menu" and "the live menu" without changing any meaning.
- Note: **exclude pizza-menu line 155 (the allergen line) from this batch.** Allergen wording is governed separately and must not ride along in a voice sweep. Do not write "can be made vegan": that asserts the kitchen will modify a dish on request, which is a different promise.

**3A.4 `app/drinks/page.tsx` line 284 (P1, XS)** Section heading, "Your Local After Landing". **Accuracy fix, highest-value change in this family.**
- Now: "Your Local After Landing - Just 5 Minutes from Heathrow"
- Problem: Five minutes contradicts the SSOT (7 to Terminal 5, 7 to 12 to any terminal), so the energy is coming from an inflated fact.
- Change to: "Your local after landing, seven minutes from Terminal 5"
- Note: this drops "Heathrow" from an H2. See conflict 14 before shipping.

**3A.5 `app/drinks/page.tsx` line 318 (P1, XS)** Section heading, "Why The Anchor for Drinks".
- Now: "Stanwell Moor's Premier Drinks Destination"
- Problem: A corporate superlative, and the SSOT bans "best" or "premier" claims without substantiation, so this is a factual risk as well as a voice one.
- Change to: "A proper pub bar, seven minutes from Terminal 5"

**3A.6 `app/drinks/page.tsx` line 324 (P2, XS)** *(amended)* "The Beer Garden Experience" card.
- Now: "Stanwell Moor's largest beer garden. Watch planes overhead while enjoying perfectly poured pints in the sunshine. Covered sections mean the garden's open in most weather."
- Problem: Opens on an unsubstantiated superlative instead of the one genuinely distinctive fact we own.
- Change to: "Our beer garden sits right under the flight path, so you get planes thundering over while your pint stays where it is. Heated areas keep it going when the weather turns."
- Note: "heated", not "covered". The SSOT records heated areas only. See conflict 10.

**3A.7 `app/drinks/page.tsx` line 432 (P2, XS)** *(amended)* FAQ 1, what beers are on tap. Replace the final sentence only.
- Now: "Our draught selection offers something for every taste, from crisp lagers to rich stouts."
- Problem: Banned filler, adding nothing after the specific list that precedes it.
- Change to: "Taps change from time to time, so ask the bar team what is on today."
- Note: do not restate the brand list. The SSOT says the full drinks inventory must come from POS or API before publishing, and two beers on that page have already been discontinued once.

**3A.8 `app/drinks/page.tsx` line 440 (P2, XS)** *(amended)* FAQ 3. Replace the final sentence only.
- Now: "We're much better value than airport bars and have a proper pub atmosphere with our beer garden."
- Problem: An unsubstantiated comparative claim pointed at other venues, plus the generic word "atmosphere".
- Change to: "Free parking outside, and a beer garden right under the flight path."
- Note: the first sentence of this answer says "just 7 minutes from Heathrow", which is loose against the SSOT range. Tighten it on the same pass.

**3A.9 `app/drinks/page.tsx` lines 325, 330 and 340 (P2, S)** *(amended)* Exclamation marks, four stacked in one section.
- Now: marks on lines 325, 330, 335 and 340, against the rule of at most one per section.
- Problem: Punctuation rule breach.
- Change to: keep the mark on line 325 only: "Dog-friendly outdoor areas, bring your four-legged friends!" Remove the marks from lines 330 and 340 and change nothing else in those two lines.
- Note: **leave line 335 alone.** "Ask about our locals' card for exclusive offers!" refers to a scheme that appears nowhere in the SSOT. It needs its own decision, not a silent reword. See conflict 4.

**3A.10 `app/drinks/page.tsx` line 339 (P2, XS)** "Quality & Choice" card.
- Now: "From draught beers to handcrafted cocktails, we take drinks seriously. Expert bar staff, proper glassware, and drinks served exactly how they should be. No shortcuts."
- Problem: Pure chain-website copy. Any pub could claim it.
- Change to: "Cold taps, a full cocktail menu and proper glassware. If you are not sure what to order, tell the bar team what you normally drink and they will pour you something you will like."
- Note: this is the only place the "tell the bar team what you normally drink" line should appear. Do not repeat it in the FAQs.

**3A.11 `app/drinks/page.tsx` line 444 (P2, XS)** FAQ 4, non-alcoholic options.
- Now: "Absolutely! We offer a full range of soft drinks, mocktails, premium coffee, tea, and non-alcoholic beers. We ensure everyone can enjoy their visit regardless of whether they're drinking alcohol."
- Problem: The second sentence is a policy statement about guests rather than an invitation to one, on the exact question where belonging matters most.
- Change to: "Yes. Soft drinks, mocktails, non-alcoholic beers, coffee and tea are all behind the bar, so there is always something good to order whether you are drinking or not."

**3A.12 `app/food-menu/page.tsx` line 346 (P2, XS)** *(amended)* Related links intro.
- Now: "The menu page owns live dishes and prices. Use these related pages for restaurant comparisons and Heathrow timing."
- Problem: Describes our internal page architecture to the reader.
- Change to: "This page has our current dishes and prices. These ones cover eating out near Heathrow and planning around a flight."
- Note: "current", not "today's". The page is served on Mondays when the kitchen is closed.

**3A.13 `app/drinks/managers-special/page.tsx` line 50 (P3, XS)** Fallback education copy.
- Now: "We picked ${spirit.name} because it gives guests a clear way into ${spirit.category.toLowerCase()} without needing to know the back bar inside out."
- Problem: Refers to guests in the third person instead of speaking to the reader.
- Change to: "We picked ${spirit.name} because it is an easy way into ${spirit.category.toLowerCase()}, even if you have never ordered one before."

### 3B. Local area pages, 14 changes

**The family problem:** this is the weakest family on the site and two of its problems are accuracy, not tone. `/pubs-in-stanwell` dates the pub to 1995 in eight places, and four pages tell people they must book a Sunday roast when walk-ins are the policy. Fix both before any voice work. On voice, three patterns repeat: positioning by attacking the nearest town, a mail-merge subtitle running on five pages, and interchangeable CTA titles on four more. Every page already contains genuinely good local prose (the Ashford Hospital late shift, the Wraysbury Dive Centre, the Horton walk over the M25 bridge). The fix is mostly to promote that voice upward into the headings, not to write new copy.

**3B.1 `app/pubs-in-stanwell/page.tsx` line 88 and 7 more (P1, M)** **1995 is wrong. The pub was founded in 1751.**
- Now: "The heart of Stanwell Moor village, traditional British pub since 1995", repeated at lines 19, 24, 40, 88, 119, 127, 323 and 359, including "nearly 30 years" and "nearly three decades".
- Problem: A straight factual error, published in the metadata, the OG and Twitter cards, the JSON-LD, the hero, the body and an FAQ.
- Change to: hero lead "The heart of Stanwell Moor village, pouring pints on Horton Road since 1751." Replace every other 1995, "nearly 30 years" and "nearly three decades" with 1751, and note in the body that we were here long before Heathrow was.
- Note: 1995 may be accurate for the current ownership chapter. If it is retained anywhere, the distinction must be made explicit.

**3B.2 `app/m25-junction-14-pub/page.tsx` and `app/egham-pub/page.tsx` (P1, M)** Hardcoded prices in seven places.
- Now: "Chicken Goujon Wrap with Chips - 9.99" and siblings at M25 lines 214, 305 to 309, 317 and 318, plus Egham line 307 "the stone-baked pizzas from £12".
- Problem: Menu prices must come live from the management DB.
- Change to: strip every number and let the dish names work: "Chicken Goujon Wrap with Chips", "Beef Burger", "Fish and Chips", "Jumbo Sausage and Chips", "Beef and Ale Pie", followed by "Today's prices are on the food menu." Egham: "the stone-baked pizzas are a genuine draw".

**3B.3 `app/horton-pub/page.tsx` line 134 and `app/colnbrook-pub/page.tsx` line 200 (P1, XS)** **Banned claim: real ale.**
- Now: Horton "Properly kept ales and a great wine selection". Colnbrook "the closest proper pub with a full kitchen and real ales on tap".
- Problem: Real-ale and handpull positioning. We serve bottled ales only.
- Change to: Horton card "Cold draught lagers, bottled ales and a wine list worth lingering over." Colnbrook: change "a full kitchen and real ales on tap" to "a full kitchen and a proper bar".
- Note: retitle the Horton card from "Draught Beers" to "Beers & Wine", or the new copy mismatches its own heading.

**3B.4 Sunday roast booking claims, 4 pages (P1, S)** *(amended)* **Contradicts the walk-in policy.**
- Now: `app/sunbury-pub/page.tsx` line 132 "booking essential!", line 233 "booking by Wednesday/Thursday"; `app/horton-pub/page.tsx` line 250 "Booking is highly recommended"; `app/egham-pub/page.tsx` line 270 "book early".
- Problem: Four pages tell people they must book, when roasts are walk-in from 1pm to 6pm with no pre-order.
- Change to: Sunbury card "Generous portions of meat and fresh veg, served 1pm to 6pm. Walk in whenever suits you." FAQ answers (keep calm and plain): "You do not need to book. We serve roasts every Sunday from 1pm to 6pm and walk-ins are welcome, with no pre-order. Booking is still worth it for peak times or a larger group, and groups over 20 should give us a ring." Egham list item: "Sunday Roast, walk in 1pm to 6pm".
- Note: not "No booking needed" as a flat statement. Booking is strongly recommended for groups and peak slots, and groups over 20 must phone.

**3B.5 `app/pubs-in-stanwell/page.tsx` line 263 (P1, M)** Competitor comparison card.
- Now: "Town center location, paid parking", one of three named competitors (The George, The Bells, "Airport Pubs") each with a knock underneath, lines 255 to 274. "center" is also US spelling.
- Problem: Snide rather than cheeky, and the most screenshot-able copy on the site.
- Change to: delete the competitor column entirely and rename the card "What You Get Here": "20 free spaces right outside the door. A beer garden under the flight path. A kitchen that cooks to order. And a village where people know your name." Keep the left-hand Anchor Advantages column as it is.

**3B.6 `app/staines-pub/page.tsx` line 437 (P1, S)** Local-knowledge paragraph 1.
- Now: "the high street has no shortage, The Swan, The Bells, the Wetherspoons on the corner, but anyone who has tried to get a table on a Friday night knows the drill. Packed bars, queues at the door"
- Problem: Names three Staines pubs and calls them packed and queue-ridden.
- Change to: "Staines has no shortage of good pubs, and on a Friday night they are rightly full. We are the quieter option eight minutes up the A30: a proper village pub with a spacious beer garden, room to hear yourself talk, and free parking right outside the door."
- Note: paragraph 2 (line 444) says "ten to twelve minutes" and line 455 says regulars "stopped bothering with the High Street altogether". Fix both in the same pass or the page contradicts itself two paragraphs apart.

**3B.7 Banned filler, 3 pages (P1, S)** `app/colnbrook-pub/page.tsx` line 115, `app/bedfont-pub/page.tsx` lines 123 and 290, `app/pubs-in-stanwell/page.tsx` line 139.
- Now: "quality food and a great atmosphere guaranteed" (Colnbrook), "Best Kept Secret" (Bedfont 123), "hidden gems" (Bedfont 290), "something for everyone" (pubs-in-stanwell 139).
- Problem: All four are on the banned list.
- Change to: Colnbrook "Finish your shift and relax. Five minutes down Horton Road, with a full kitchen, free parking for the whole team, and a bar that is genuinely glad to see you." Bedfont 123 "The Anchor, Bedfont's Nearest Village Local". Bedfont 290 "Bedfont Lakes Country Park is a favourite round here". pubs-in-stanwell 139 "from our Sunday roasts to our stone-baked pizzas".

**3B.8 Mail-merge subtitle, 5 pages (P1, S)** Ashford 131, Bedfont 112, Egham 109, Feltham 132, Windsor 135.
- Now: "Your local traditional pub just 10 minutes from Ashford with free parking", identical on five pages with only the town and number swapped.
- Problem: Interchangeable copy that could belong to any chain.
- Change to: Ashford "Ten minutes from Ashford, and once you are over the dual carriageway it is fields, a church, and free parking right outside." Bedfont "Five minutes from Bedfont Green, dogs welcome throughout, and the car park is always free." Feltham "Ten minutes down Bedfont Lane, with a beer garden under the flight path at the other end."
- Note: **Egham line 109 and Windsor line 135 still need their own lines.** Only three of the five were supplied. Do not reuse one of the three.

**3B.9 `app/ashford-pub/page.tsx` lines 149, 182 and 218 (P2, S)** *(amended)* Defining ourselves against Ashford's pubs, three times.
- Now: "Traditional atmosphere Ashford chain pubs can't match", "Better value than Ashford pubs" (182), "entertainment Ashford pubs can't offer!" (218).
- Problem: Jokes pointed at other venues.
- Change to: Card "Real Pub Feel: A village pub with a beer garden, fields at the end of the road, and regulars who will say hello." Line 182 "Village pub prices, proper portions". Line 218 "Watch the planes come over the garden. We never get bored of it either."
- Note: no "St Mary's Church next door". Our own pages place that church in neighbouring Stanwell village, not adjacent to us.

**3B.10 `app/windsor-pub/page.tsx` line 147 and `app/ashford-pub/page.tsx` line 143 (P2, S)** Near-identical welcome paragraphs.
- Now: "The Anchor offers authentic British hospitality without the tourist prices. Enjoy traditional pub atmosphere, fantastic food, and a warm welcome in our historic Stanwell Moor location."
- Problem: Two pages share the same paragraph shape and closing clause word for word, both opening on a generic hospitality claim.
- Change to: Windsor "Fifteen minutes from the castle and a world away from the crowds. Free parking right outside, planes coming into Heathrow over the beer garden, and a welcome that treats you like a local rather than a visitor." Ashford "Ten minutes from Ashford, and worth every one of them. A village pub standing here since 1751, with fields, a church and free parking outside the door."

**3B.11 `app/staines-pub/page.tsx` line 106 (P2, XS)** Hero lead.
- Now: "Traditional British pub serving the Staines community with great food, entertainment, and a warm welcome"
- Problem: The highest-traffic page in this family opens with three abstract nouns and never uses the belonging promise.
- Change to: "Eight minutes from Staines High Street, free parking right outside, and everyone welcome the moment you walk in."

**3B.12 `app/stanwell-pub/page.tsx` line 121 (P2, XS)** Hero lead.
- Now: "The heart of the Stanwell community since generations"
- Problem: Not grammatical English, and vague where the page itself cites 1751 at line 440.
- Change to: "Standing on Horton Road since 1751, and still where Stanwell comes together."

**3B.13 `app/m25-junction-14-pub/page.tsx` lines 172, 178 and 208 (P2, S)** *(amended)* "The Smart Alternative to Service Stations".
- Now: "Why settle for overpriced motorway services when a proper British pub is just 5 minutes from Junction 14? Fresh food, fair prices, and a chance to stretch your legs in our beer garden." Plus a "Half Price" card (178) and "Service stations: 15+ for a basic sandwich meal" (208).
- Problem: Leads with an attack, and asserts comparative prices that are not in the SSOT.
- Change to: "Two minutes off Junction 14 and you are in a village pub instead of a queue. Food cooked to order, 20 free spaces, and a beer garden to stretch your legs in before you rejoin the motorway." Replace the "Half Price" card with "Room to Breathe: beer garden under the flight path", and cut the invented service-station price from line 208.
- Note: two minutes, not five. The SSOT says 2 minutes from Junction 14 and the SSOT wins. See conflict 3. Use the `PARKING.capacity` constant, not a literal 20.

**3B.14 Closing CTA titles, 4 pages (P2, S)** *(amended)* Feltham 449, Sunbury 240, Wraysbury 269, pubs-in-stanwell 391.
- Now: "Experience the Difference", "Experience The Anchor", "Worth the 5 Minute Drive", "Visit Your Local Pub Today".
- Problem: The final ask on four pages is interchangeable corporate copy.
- Change to: Feltham "Ten Minutes and You're Here" with copy "Free parking outside, planes overhead in the garden, and a proper welcome when you walk in." Sunbury "Worth the Drive Up the A308". Wraysbury "Five Minutes Over the M25 Bridge". pubs-in-stanwell "Your Village Local Since 1751".
- Note: not "a table waiting". That promises availability directly above a booking button.

### 3C. Heathrow and hotel pages, 12 changes

**The family problem:** this cluster owns the best emotional hook on the site, planes coming in low over the beer garden, and almost never uses it. `/near-heathrow` and `/restaurants-near-heathrow` are the model: concrete, warm, on-voice. Everything else falls into three patterns: feature-list heroes and CTAs, positioning built on knocking the hotels and the airport, and factual drift dressed up as energy. Two shared strings in `HotelProximityPage.tsx` are already handled in Phase 1 and reach all 11 hotel pages.

**3C.1 Four terminal hero leads (P1, S)** *(amended)* `terminal-5` line 54, `terminal-2` line 53, `terminal-3` line 54, `terminal-4` line 53.
- Now: "Perfect for British Airways travelers • Free parking • Traditional British pub"
- Problem: Three bullet fragments plus a US spelling, on four of the family's highest-traffic pages.
- Change to: **one string per page, each keeping its own real drive time and airline.** T5: "Seven minutes from Terminal 5, and a world away from it. Free parking, home-cooked food, and planes coming in low over the beer garden." T2: "Eleven minutes from Terminal 2, and a world away from it. Free parking, home-cooked food, and planes coming in low over the beer garden." T3: same with eleven minutes. T4: same with twelve minutes.
- Note: **do not roll one string across all four.** T2 and T3 are 11 minutes, T4 is 12. A single "seven minutes" string would publish a false distance on three pages.

**3C.2 "Traditional ales", 5 places (P1, S)** *(amended)* **Banned claim.** `terminal-5` lines 477, 547 and 625, `terminal-2` line 591, `terminal-3` line 574, `terminal-4` line 576.
- Now: "Traditional ales & home-cooked food"
- Problem: Reads as real-ale positioning. Bottled ales only, no handpulls, no guest ales.
- Change to: "A proper pub bar and home-cooked food".
- Note: do not name live bar stock as a replacement. The SSOT requires the drinks inventory to come from POS or API before publishing. Lines 547 and 625 are prose paraphrases, not the same phrase, so they need their own rewrites rather than a find-and-replace.

**3C.3 `app/near-heathrow/terminal-5/page.tsx` line 493 (P1, XS)** *(amended)* Hilton T5 benefit list item.
- Now: "Bottled draught beers alongside ciders and ciders"
- Problem: Broken copy. "ciders" repeats and "bottled draught" contradicts itself.
- Change to: "A proper pub bar, with bottled ales alongside the draught". Safer still, drop the drinks line and use a fact we own outright: "Free parking, seven minutes away".

**3C.4 `app/near-heathrow/terminal-5/page.tsx` lines 465 and 625 (P1, XS)** *(amended)* Sofitel benefit item and FAQ.
- Now: "Half the price of hotel dining", repeated as "pay half what you'd spend at your hotel".
- Problem: An unverifiable price claim that also scores a point off the hotel, and menu prices come live from the DB so no ratio should ever be asserted.
- Change to: "Proper pub prices". Replace the FAQ phrasing too, without restating any saving.
- Note: not "live on our menu". That pushes an internal CMS concept into customer copy.

**3C.5 `app/heathrow-family-dining/page.tsx` line 133 (P1, XS)** **Implied facility we do not have.**
- Now: a "Changing Facilities" item reading "Please ask staff for assistance."
- Problem: The heading implies baby changing exists. We have none, and this page's own schema at line 63 correctly sets it to false, so the visible copy contradicts the markup.
- Change to: remove the "Changing Facilities" item and state it plainly: "No baby changing facilities, so it is worth planning around that before you visit."
- Note: keep it flat and factual when implemented. No apology, no upsell.

**3C.6 `app/heathrow-layover-dining/page.tsx` lines 52, 135 and 269 (P1, S)** *(amended)* **Invented parking terms. Needs conflict 2 answered first.**
- Now: "Layover guests receive three hours free parking. Register your number plate at the bar on arrival..." plus a CTA at 269 promising to "reserve parking".
- Problem: A three-hour cap and a plate-registration step that exist nowhere in the SSOT, which says parking is free with no time limit while you are with us. The coach page explicitly says we cannot reserve spaces.
- Change to: "Parking is free for guests while you are eating and drinking with us, with no fees and no time limit. If you want to leave the car while you fly, that is a separate service you can book on our Heathrow parking page." Apply the same at line 135. Delete the "reserve parking" promise at line 269.
- Note: do not write "nothing to register" either. That swaps one unverified claim for its opposite.

**3C.7 `app/heathrow-hotels-pub/page.tsx` line 117 (P1, M)** *(amended)* Hero H1 and lead.
- Now: H1 "Escape Heathrow Hotel Prices", with the grievance repeating at lines 237, 269 and 281.
- Problem: The page's entire hook is a swipe at the hotels whose guests it is courting, and it never says why we are worth the trip on our own terms.
- Change to: H1 "A Proper Village Pub, Minutes From Your Hotel". Lead: "Free parking, home-cooked food and a beer garden under the flight path, 7 to 12 minutes from most Heathrow hotels."
- Note: "7 to 12 minutes from most", not "seven to twelve from every". The page's own table lists a hotel at 15 minutes. Changing this H1 is also an SEO decision, see conflict 15.

**3C.8 `app/plane-spotting-heathrow/page.tsx` line 109 (P1, XS)** *(amended)* Intro paragraph. **Internal jargon in live copy.**
- Now: "The Anchor is the commercial landing page for visiting our beer garden."
- Problem: "Commercial landing page" means nothing to a visitor and reads like a note we left ourselves, on the one page where the planes hook should do all the work.
- Change to: "Want somewhere to watch from with a proper table, food during kitchen hours and somewhere warm to duck inside? That is us. If you want to compare every spotting location around the airport, our guide has the lot."
- Note: no canopy, roof or covered seating. None exists in the SSOT.

**3C.9 `app/pre-flight-meal/page.tsx` lines 42 and 98, and `app/luggage-storage-heathrow/page.tsx` line 166 (P1, XS)** Distance understated.
- Now: "Authentic British food. Draught Beer. 5 Minutes from Terminal 5."
- Problem: Contradicts the seven minutes used everywhere else, so excitement has quietly shaved a fact. Three fragments, no reason to come.
- Change to: "Cooked to order and eaten at a table, seven minutes from Terminal 5. Start the holiday before you reach the gate." Correct the figure at line 98 and on the luggage page too.

**3C.10 `app/heathrow-family-dining/page.tsx` line 105 (P2, XS)** "Large Beer Garden" card. **Safety copy.**
- Now: "A safe, enclosed grassy area where kids can play freely while you watch from your table."
- Problem: The page's own FAQ at line 149 says the garden adjoins a car park and asks parents to supervise, so "play freely" overstates what we can promise and contradicts us three sections later.
- Change to: "An enclosed grassy area with room to run about. It adjoins the car park, so we do ask you to keep an eye on the little ones."

**3C.11 `app/heathrow-parking/page.tsx` lines 346 and 406 (P2, S)** *(amended)* Section lead.
- Now: "If you are searching for parking Heathrow airport, Heathrow airport car parking, or parking near Heathrow, The Anchor keeps you close to Terminals 2, 3, 4 and 5 without the on-airport queues."
- Problem: Keyword strings read back to the customer as if they were sentences. Line 346 does the same with three bold search phrases.
- Change to: "Park with us in Stanwell Moor and you stay close to every terminal: around seven minutes from Terminal 5 and up to twelve from Terminals 2, 3 and 4, with none of the on-airport queues."
- Note: "up to twelve", not "under twelve". Terminal 4 is 12 minutes. Parking copy stays calm: the fix here is plain English, not energy.

**3C.12 `app/near-heathrow/terminal-2/page.tsx` line 311 and line 424, `app/near-heathrow/terminal-5/page.tsx` lines 449, 545 and 601 (P3, S)** Third-party prices and an understated heritage figure.
- Now: "Save £12.50 daily!" (the ULEZ charge), two comparisons of a car park or bus fare to "what a pint costs at The Anchor", and "over 250 years".
- Problem: The ULEZ figure is a third-party price that will drift, the pint comparisons imply a menu price we should never assert, and 1751 gives us 275 years, which is prouder and more concrete.
- Change to: drop the ULEZ amount and say we are outside ULEZ. Remove both pint comparisons. Replace "over 250 years" with "275 years" or "since 1751".

### 3D. Amenity and feature pages, 14 changes

**The family problem:** `app/dog-friendly-pub-heathrow/page.tsx` is the closest to the standard already and `app/accessibility/page.tsx` is genuinely good, so both are left almost untouched. Three areas need work: `app/fish-and-chips-heathrow/page.tsx` reads like a database status message, `app/pool-darts-pub/page.tsx` points its cheek at other pubs twice, and `app/pub-garden-heathrow/page.tsx` never once mentions the flight path, the single most distinctive thing we own. Two entries here are accuracy rather than tone, and both sit in calm-register copy. `app/free-parking/page.tsx` is a bare redirect with no copy and `app/parking` holds only a booking page, so neither needs work.

**3D.1 `app/pool-darts-pub/page.tsx` lines 138 to 141 (P1, S)** **Hardcoded opening hours.**
- Now: "Tuesday – Thursday: 4pm – 11pm" and three sibling list items.
- Problem: The SSOT is explicit that hours must always come from the API and never be hardcoded. These will silently drift, and the "Sunday: 1pm – 6pm" line looks like the roast service window rather than the bar's hours.
- Change to: replace the hardcoded list with the live business-hours data. If a static line is needed alongside it: "Pool and darts are available any time we are open."
- Note: do not add "Check today's hours before you set off". The hero lead at line 42 already says it.

**3D.2 `app/fish-and-chips-heathrow/page.tsx` line 136 (P1, S)** *(amended)* Section heading lead.
- Now: "Current dish names, descriptions and prices are shown here when available online."
- Problem: System-speak about a data feed, not copy about food.
- Change to: "Fish and chips done properly, with a cold pint alongside. Everything below comes straight from our kitchen menu."
- Note: do not write "what our kitchen is serving today". This section renders unconditionally, including Mondays when the kitchen is closed and whenever the menu API is down. Lines 128 (a hero fallback for `signatureFish?.description`) and 147 have the same flatness but are different string types and each needs its own replacement, not this one. The word "live" is dropped from the approved wording for consistency with 3A.3.

**3D.3 `app/pool-darts-pub/page.tsx` line 54 (P1, S)** Opening body paragraph.
- Now: "Some pubs stick a wobbly table in a dark corner and call it a games area. Not here."
- Problem: The joke points at other venues, and it opens the page's main body on a sneer.
- Change to: "We take our pub games seriously. The Anchor has a quality pool table kept level and re-covered regularly, a dartboard with a proper throw area, and enough space to actually play without elbowing the person behind you."

**3D.4 `app/pool-darts-pub/page.tsx` line 91 (P2, XS)** Darts card body.
- Now: "A dartboard with a proper throw area, not a battered board crammed behind a fruit machine."
- Problem: A second dig at other venues, and self-defeating: we have a fruit machine, so the joke lands on us by accident.
- Change to: "A dartboard with a proper throw area, with room to stand back and take your time."

**3D.5 `app/pub-garden-heathrow/page.tsx` line 42 (P1, XS)** Hero lead.
- Now: "When the sun is shining, there's no better place. Cold drinks, fresh air, and real grass between your toes."
- Problem: Nothing here is specific to us, and the page never mentions the flight path anywhere.
- Change to: "Cold drinks, real grass underfoot, and planes thundering low overhead on their way into Heathrow. Seven minutes from Terminal 5, and there is nowhere else quite like it."

**3D.6 `app/pub-garden-heathrow/page.tsx` lines 20, 26 and 41 (P2, S)** Unverifiable superlative, three places.
- Now: hero title "The Best Garden Around", plus "The best garden in Stanwell Moor." in the OG and Twitter descriptions.
- Problem: Quietly ranks us against neighbouring venues, and it is generic where a concrete fact is available.
- Change to: hero title "Planes Overhead, Pint In Hand". Social description: "Real grass, 64 seats, and Heathrow's landing planes right above you. Our beer garden in Stanwell Moor."

**3D.7 `app/pub-garden-heathrow/page.tsx` line 52 (P2, S)** "Al Fresco Living" section lead.
- Now: "We're lucky to have one of the largest pub gardens in the area."
- Problem: A comparative claim not in the SSOT and not evidenceable, where a hard number is more persuasive anyway.
- Change to: "Our garden seats 64, with room for plenty more standing. Far enough from the main road to be peaceful, but close enough to the bar for a quick refill."

**3D.8 `app/family-friendly-pub-heathrow/page.tsx` line 80 (P2, XS)** "Baby Facilities" card. **Honesty fix.**
- Now: heading "Baby Facilities" with bullets for bottle warming, buggy space and breastfeeding.
- Problem: All three bullets are true, but the card says nothing about baby changing, which we do not have. A parent scanning this heading will assume it exists.
- Change to: keep the heading and the three bullets, and add a fourth in the same plain wording: "No baby changing facilities".
- Note: the accessibility page states its own gaps plainly. This should match that standard.

**3D.9 `app/family-friendly-pub-heathrow/page.tsx` line 40 (P2, XS)** *(amended)* Hero lead.
- Now: "Good food that kids actually eat. Relaxed atmosphere for parents. The perfect family pit stop."
- Problem: "Relaxed atmosphere" is banned-filler adjacent, and "pit stop" frames a family visit as something to get through rather than somewhere they belong.
- Change to: "Fish fingers, mini roasts on Sundays, and high chairs for the smallest guests. Children are welcome here at any hour, buggies and all."
- Note: no claim about noise tolerance. "Nobody minding when it gets loud" commits us to a policy nobody has signed off.

**3D.10 `app/family-friendly-pub-heathrow/page.tsx` line 50 (P2, S)** Section lead.
- Now: "We know eating out with kids can sometimes be stressful. At The Anchor, we aim to make it easy. We have plenty of space, staff who are great with little ones, and a menu that keeps everyone happy."
- Problem: "We aim to make it easy" is hedged and low on conviction, and "a menu that keeps everyone happy" is a hair from the banned phrase.
- Change to: "Eating out with children should be the easy bit. We have high chairs, space for buggies, a kids menu with sausage and mash and fish fingers, and staff who are genuinely pleased to see little ones."
- Note: this hardcodes two kids-menu dishes. Both come from the page's own FAQ, so nothing is invented, but see conflict 13.

**3D.11 `app/accessibility/page.tsx` line 177 (P2, XS)** *(amended)* CTA band.
- Now: "We're 7 minutes from Heathrow with free parking, step-free access to most areas and a warm welcome waiting for you."
- Problem: "Step-free access to most areas" is vaguer than the precise information the rest of the page gives, and on an accessibility page vagueness is the failure mode.
- Change to: "We're 7 minutes from Heathrow with free parking. The bar and dining area are step-free, and a ramp is available on request for the steps to the garden."
- Note: **"on request" is not optional.** Implying a permanently installed ramp is worse than the copy it replaces.

**3D.12 `app/accessibility/page.tsx` line 157 (P2, XS)** FAQ, accessible toilet. Phone format only.
- Now: "...please give us a call on +44 1753 682707 and we'll do our best to help."
- Problem: The only place on the site that renders the number this way. Everywhere else uses 01753 682707.
- Change to: "...please give us a call on 01753 682707 and we'll do our best to help."
- Note: this line is hardcoded where the rest of the page uses the `PhoneLink` component and `CONTACT.phone`. Route it through the constant, or the same drift risk stays.

**3D.13 `app/accessibility/page.tsx` line 153 (P3, XS)** *(amended)* FAQ, is the beer garden step-free.
- Now: "There are steps from the bar to the beer garden, but a ramp is available on request. It's a great spot for watching aircraft overhead with a drink or a meal."
- Problem: Someone asking whether they can physically get into the garden is asking a practical question, and the answer switches into a sales line.
- Change to: "There are steps from the bar to the beer garden, but a ramp is available on request."
- Note: do not add "Please ask at the bar". That is an invented instruction and it contradicts the page's own routing, which sends people to call ahead.

**3D.14 `app/dog-friendly-pub-heathrow/page.tsx` lines 117 and 118 (P2, XS)** Closing CTA.
- Now: title "Bring The Whole Family", copy "Dogs included."
- Problem: The closing CTA on the dog page makes dogs an afterthought, and gives no reason to act, throwing away two concrete details the page has already earned.
- Change to: Title "Two Legs Or Four". Copy: "Book a table and bring the dog. Water bowls and biscuits are waiting."

### 3E. Seasonal and occasion pages, 13 changes

**The family problem:** one systemic failure runs through this family. Seven places define The Anchor by running down someone else: "Forget the overpriced city centre bars", "Unlike packed city bars", "Better than the hotel bar", "Don't settle for the hotel bar", "not a chain restaurant, not a hotel buffet", "not a chain or a hotel buffet", "not a stuffy romantic restaurant". Fixing the entries below plus the Halloween clause at page.tsx lines 99 to 100 ("the kind of cheeky, lively evening you get at a real village pub rather than a stiff club night") clears the whole pattern. Father's Day and Easter Sunday are otherwise close to the standard, Christmas is freshly rebuilt and accurate, and `/summer-garden-parties` is the oldest-feeling page in the set. The Christmas lightbox is in Phase 1. **Three date errors in this family are flagged in conflict 12 and should be fixed before any copy work.**

**3E.1 `app/summer-garden-parties/page.tsx` line 110 (P1, XS)** "Perfect for..." card 4. **Banned claim risk.**
- Now: "Receptions"
- Problem: Sitting between Christenings and Birthdays, a bare "Receptions" reads as wedding receptions, which is banned outright. It is also a bare noun with no invitation in it.
- Change to: "Any excuse, really"

**3E.2 `app/new-years-eve/page.tsx` lines 104 to 106 (P1, S)** *(amended)* Body section 1. Replace both sentences, not just the first.
- Now: "Forget the overpriced city centre bars and the nightmare of getting home afterwards." followed by a sentence already listing the DJ, the countdown and the 1am close.
- Problem: The opening line of the page's main section is a swipe at other venues.
- Change to: "New Year's Eve is our favourite night of the year to be a village pub. A DJ keeping things going, a midnight countdown we do together, and late opening until 1am. You can actually get served at the bar and settle in with people who want to be there."
- Note: replacing only the first sentence would state the DJ, countdown and 1am twice in one paragraph. This is the only page in the family allowed "our favourite night of the year".

**3E.3 `app/new-years-eve/page.tsx` lines 305 to 313 (P1, S)** *(amended)* "Near Heathrow" section heading and first paragraph.
- Now: heading "Better than the hotel bar", with "Don't settle for the hotel bar." at line 308.
- Problem: A whole section heading defines us by being better than a neighbouring business, and the paragraph repeats the knock.
- Change to: Heading "Staying at a Heathrow hotel?" Replace the full first paragraph with: "We are just {HEATHROW_TIMES.terminal5} minutes from Terminal 5, an easy taxi ride for a proper New Year's Eve. Airport hotel guests come over every year, and we love having them." Then delete the now-duplicated first sentence of paragraph 2.
- Note: keep the `{HEATHROW_TIMES.terminal5}` constant. Never replace it with a literal.

**3E.4 `app/new-years-eve/page.tsx` line 160 (P1, XS)** "Actually get a drink" card.
- Now: "Unlike packed city bars, you can actually get to our bar. Draught lagers, bottled beers, wines, spirits and cocktails, all without the 20-minute queue."
- Problem: Sells an absence elsewhere instead of the drink in front of you. The card heading already carries the point.
- Change to: "Getting a drink here is easy. Draught lagers, bottled beers, wines, spirits and cocktails, and no twenty-minute queue to get one."

**3E.5 `app/fathers-day/page.tsx` line 237 (P1, XS)** Section opening sentence.
- Now: "The short answer: a proper Father&apos;s Day pub near me, not a chain restaurant, not a hotel buffet."
- Problem: A raw keyword dropped into human copy where it does not parse, then a knock at chains and hotel buffets.
- Change to: "The short answer: a proper village pub. The Anchor in Stanwell Moor is 7 minutes from Heathrow Terminal 5, with 20 free parking spaces, a dog-friendly beer garden, and a plane every 90 seconds that gives Dad a perfectly valid reason to sit outside as long as he likes."
- Note: leave the plane joke that follows exactly as it is. It is excellent.

**3E.6 `app/easter-sunday/page.tsx` line 254 (P2, XS)** Section opening sentence.
- Now: "The Anchor is a proper village pub, not a chain or a hotel buffet."
- Problem: The same construction as Father's Day, so the family reads like it only has one argument.
- Change to: "The Anchor is a proper village pub, standing in Stanwell Moor since 1751. We are rooted in this community, about {HEATHROW_TIMES.terminal5} minutes from Heathrow Terminal 5, with free parking right outside. That makes Easter Sunday easy: turn up, settle in, and let us do the work."
- Note: preserve the existing `{HEATHROW_TIMES.terminal5}` constant.

**3E.7 `app/summer-garden-parties/page.tsx` line 39 (P2, XS)** *(amended)* Hero lead.
- Now: "Exclusive areas, BBQ packages, and festival vibes."
- Problem: Three abstract nouns and no feeling. "Festival vibes" is exactly the generic filler the standard bans.
- Change to: "Long tables in the sun, a BBQ laid on for your group, and planes coming in low over the garden. Our garden is where summer happens here."
- Note: "a BBQ laid on for your group", not "the grill going". The page's own FAQ says a private BBQ buffet needs a minimum of 20 guests and is a booked package, so the hero must not promise it unconditionally.

**3E.8 `app/summer-garden-parties/page.tsx` line 46 (P2, XS)** *(amended)* Section H1.
- Now: "The Best Beer Garden Around"
- Problem: An unverifiable superlative that quietly ranks us above unnamed neighbours.
- Change to: "Our Beer Garden on a Good Day"
- Note: keep "Beer Garden" in the heading. It is the page's primary entity term and appears nowhere else in this position.

**3E.9 `app/mothers-day/page.tsx` lines 130 to 136 and 250 (P2, S)** *(amended)* Hero description and its duplicated suffix.
- Now: `heroLeadText` "Current Sunday roast menu • Walk in or book ahead", appended to a `heroDescription` that already ends "Walk in or book ahead. No set sittings."
- Problem: The hero says "Walk in or book ahead" twice in one paragraph, and nothing in it says why Mother's Day here is any good, on the page with the highest one-day demand in the family.
- Change to: delete `heroLeadText` and its use at line 250. Rewrite `heroDescription` as: "Nobody in your house is cooking today, and that is rather the point. A cooked-from-scratch Sunday roast at The Anchor in Stanwell Moor (TW19), near Staines-upon-Thames and Heathrow Terminal 5. Serving ${MOTHERS_DAY_SERVICE_WINDOW_LABEL} (last table ${MOTHERS_DAY_LAST_BOOKING_LABEL}). Walk in or book ahead, no set sittings."
- Note: **keep both template literals and keep the last-table time.** Someone arriving at 5:45 because the hero implied 6pm is a real failure on the busiest lunch of the year.

**3E.10 `app/christmas-parties/page.tsx` line 350 (P2, XS)** *(amended)* Hero lead, in-season branch.
- Now: "A proper village pub Christmas rather than a hotel function room. Eight minutes from Staines, seven from Heathrow Terminal 5, with around 20 free parking spaces."
- Problem: The rebuilt page is accurate and well judged, but its first line still defines Christmas here by what it is not.
- Change to: "A village pub Christmas, in a pub that has stood here since 1751. Your own table, your own evening. Eight minutes from Staines, seven from Heathrow Terminal 5, with around 20 free parking spaces."
- Note: "has stood here since 1751", not "has been doing them since 1751". We cannot claim 275 unbroken years of Christmas trading. Keep the length: the buttons must stay above the fold on a phone.

**3E.11 `app/valentines-day/page.tsx` line 359 (P2, XS)** *(amended)* Section paragraph 1, closing clause.
- Now: "not a stuffy romantic restaurant."
- Problem: The paragraph lands on a dig at restaurants instead of on us.
- Change to: "Couples, friends and small groups all welcome. This is a good food, proper drinks kind of night, and nobody here is checking who you came with."
- Note: do not reuse "there is no couples-only rule". It already appears verbatim in two FAQ answers on the same page.

**3E.12 `app/valentines-day/page.tsx` line 469 (P2, XS)** *(amended)* No-event fallback card heading. This is the default state most of the year.
- Now: "We're updating our Valentine's and Galentine's listings."
- Problem: Reads as a system status message rather than an invitation, at the exact moment someone has arrived wanting to plan something.
- Change to: "This year's Valentine's and Galentine's details are still to come."
- Note: heading only. Leave the sub-paragraph beneath it untouched; it already carries the invitation and the booking route.

**3E.13 `app/halloween/page.tsx` line 86 (P2, XS)** *(amended)* Hero lead. Replace the whole lead, not the first sentence.
- Now: "Fancy dress, music, drinks and a proper local Halloween night." followed by copy already naming the annual theme, the earlier food and the free parking.
- Problem: Opens a high-energy occasion page with a list of nouns and no feeling.
- Change to: "Halloween is one of the nights we look forward to most. Our annual fancy-dress disco at The Anchor in Stanwell Moor has a different theme every year, with food earlier in the evening, a full bar and free parking. Check this year's details, book a table or walk in."
- Note: "one of the nights we look forward to most", not "one of our favourite nights". New Year's Eve owns "favourite" in this family.

### 3F. Private hire and corporate, 12 changes

**The family problem:** `app/corporate-events/page.tsx` is the most corporate page on the site and carries most of the debt. Its section headings are interchangeable B2B labels, its closing CTA is a bullet-separated slogan, and several FAQ answers make soft unverifiable claims. It is also the biggest opportunity, because the page already has the right idea in its body copy (the village-pub-versus-hotel-ballroom contrast) and never lets it into the headings. `app/private-hire/page.tsx` is structurally good and mostly warm. The two shared landmark strings are in Phase 1. `app/private-hire/wakes/page.tsx` is warm, calm and respectful throughout and nothing on it needs changing.

**3F.1 `app/corporate-events/page.tsx` line 567 (P1, XS)** Closing CTA band.
- Now: "Professional venue • Strategic location • No hidden fees"
- Problem: A bullet-separated corporate slogan with no "we" and nothing a chain venue could not say, in the last thing a reader sees.
- Change to: "A proper village pub around 7 minutes from Terminal 5, 20 free spaces outside the door, and a quote with nothing hidden in it."

**3F.2 `app/corporate-events/page.tsx` line 112 (P1, S)** *(amended)* "Why choose us" heading and lead.
- Now: heading "Why Leading Companies Choose The Anchor", lead "The smart choice for business events near Heathrow".
- Problem: "Leading companies" is unverifiable flattery and both lines are generic B2B filler.
- Change to: Heading "A work do in a proper pub". Lead: "Around 7 minutes from Terminal 5, free parking outside the door, and your own table or your own room rather than a shared function room."
- Note: "table or room". The page's own FAQ says "your team gets its own table or its own room", so a flat promise of a room is not deliverable for smaller bookings.

**3F.3 `app/private-hire/page.tsx` line 258 (P1, XS)** *(amended)* Hero lead.
- Now: "Private hire for 10+ to 150 guests in Stanwell Moor, near Staines and Heathrow. Free parking, custom catering, and a team that plans it with you."
- Problem: The top of the highest-traffic page in this family opens on a specification list rather than on why hiring this place is good.
- Change to: "Celebrate in a village pub that has stood here since 1751. Private hire for 10+ to 150 guests in Stanwell Moor, near Staines and Heathrow, with free parking, custom catering, and a team that plans it with you."
- Note: not "have the run of a village pub". That implies exclusive use of the whole venue, which is by enquiry only.

**3F.4 `app/private-hire/engagement-parties/page.tsx` lines 16, 50 and 75 (P1, XS)** *(amended)* **Internal jargon served to customers and to search engines.**
- Now: "buffets priced from the live approved source, prosecco packages, free parking, and space for up to 50 guests"
- Problem: "priced from the live approved source" is a note to ourselves, not a sentence for a newly engaged couple. It starts lower case, its capacity contradicts the 10+ to 150 stated further down the page, and the same phrase sits in the meta description (16) and the JSON-LD (50).
- Change to: "Prosecco packages, a buffet to suit your crowd, free parking outside the door, and room for 10+ to 150 guests seven minutes from Terminal 5." Apply the same fix at lines 16 and 50.
- Note: "prosecco packages", not "prosecco on arrival". The same page prices it as a chargeable pre-order.

**3F.5 `app/private-hire/milestone-birthdays/page.tsx` line 97 (P1, XS)** *(amended)* Intro paragraph. **Hardcoded price.**
- Now: "The Anchor is a birthday party pub in Stanwell Moor with birthday party room hire for 10+ to 150 guests, buffets from &pound;9.95pp, and free parking."
- Problem: A buffet price baked into the page instead of coming live from the DB, so it can drift and contradict the live catering card lower down the same page.
- Change to: "The Anchor is a birthday party pub in Stanwell Moor with room hire for 10+ to 150 guests, buffet packages, and free parking outside the door."
- Note: not "buffet packages at live prices". That leaks the same internal vocabulary this spec removes elsewhere, and the paragraph already says "Pricing discussed on enquiry".

**3F.6 `app/corporate-events/page.tsx` line 363 (P2, XS)** *(amended)* Facilities section heading and lead.
- Now: heading "Professional Facilities", lead "Everything you need for productive business events".
- Problem: "Productive business events" names nothing, sitting above a section that does list specific kit.
- Change to: Heading "What you get". Lead: "TVs, a sound system, free WiFi and power points, plus French doors onto the beer garden when the sun is out."
- Note: not "What is in the room". The section covers venue-wide facilities. Keep the heading plain: this section also carries the page's only accessibility disclosure at line 380.

**3F.7 `app/corporate-events/page.tsx` line 119 (P2, XS)** *(amended)* "Flexible Pricing" card.
- Now: "Competitive venue hire rates tailored to your needs"
- Problem: Two pieces of banned-style filler in one seven-word line, near the top of the page.
- Change to: "Tell us your date and your numbers and we will quote for the room and the catering, with nothing hidden in it."
- Note: not "one clear quote covering the room and the catering". That contradicts the commercial model stated elsewhere (room hire fee, then you pay for what you order on top).

**3F.8 `app/corporate-events/page.tsx` line 547 (P2, S)** *(amended)* FAQ, international business guests. Replace the whole answer.
- Now: "Absolutely. Our proximity to Heathrow means we regularly host international teams. We understand the needs of global businesses and can accommodate different time zones, dietary requirements, and cultural preferences."
- Problem: Corporate boilerplate claiming more than we can evidence, where the concrete answer is already true and stronger.
- Change to: "Yes, we host international teams often. We are around 7 minutes from Terminal 5, so people flying in can come straight to us, and we will work around early starts or late finishes and any dietary requirements you tell us about."

**3F.9 `app/corporate-events/page.tsx` line 594 (P2, XS)** Closing line beneath the CTA buttons.
- Now: "We know business moves fast."
- Problem: A stock business cliche as the last sentence on the page, where a plain warm instruction would do more work.
- Change to: "Give us the date and the headcount. Call, WhatsApp or email and our events coordinator will come back to you with a quote."

**3F.10 `app/private-hire/page.tsx` line 433 (P2, XS)** *(amended)* Section lead above the landmark grid.
- Now: "Find the most relevant private-hire page for your ceremony, workplace, sports club or family gathering."
- Problem: "The most relevant private-hire page" is site-architecture language, not something a friend would say.
- Change to: "Find us from a church, a crematorium, a hospital, a workplace or a club, and see how close we are."
- Note: keep it plain and cover the full set. The grid's first group heading is "Wakes and memorial receptions", so a breezy lead is wrong here.

**3F.11 `app/private-hire/retirement-parties/page.tsx` line 108 (P2, XS)** Section heading. **US spelling.**
- Now: "Stress-Free Planning for Organizers"
- Problem: Breaks the British English rule, and reads like an admin task list rather than a send-off for someone finishing a working life.
- Change to: "Easy to plan, easy to enjoy"

**3F.12 `app/private-hire/gender-reveal/page.tsx` line 77 (P2, XS)** Hero lead.
- Now: "The perfect setting to share your exciting news"
- Problem: "The perfect setting" is exactly the generic phrasing the standard bans, on a page whose body copy is full of concrete, joyful detail that never reaches the top.
- Change to: "Pink or blue smoke over the beer garden, everyone you love watching, and the photos to prove it."

### 3G. Operational pages, the agreed exceptions, 12 changes

**The family problem:** almost nothing. The exclusion list at the top of this spec covers the bulk of these pages and it is long on purpose. Only three genuine exceptions are worth warming, in this order: the 404 page (highest cascade, it catches every broken link and currently sounds like a default framework template), the recruitment page (a job page is a pitch, and this one is all facts and no invitation), and a handful of page-furniture strings where a plainer line is also a clearer line. Everything else on these pages stays exactly as it is.

**3G.1 `app/not-found.tsx` line 12 (P1, XS)** 404 H1.
- Now: "Page Not Found"
- Problem: Default framework wording that could belong to any website in the world.
- Change to: "This page has wandered off"

**3G.2 `app/not-found.tsx` line 14 (P1, XS)** 404 body copy.
- Now: "Sorry, the page you are looking for does not exist or has been moved."
- Problem: Flat and impersonal, with no "we" anywhere and nothing that makes a lost visitor want to stay.
- Change to: "Sorry, that page does not exist or has moved. The pub itself has not gone anywhere, it is still in Stanwell Moor, so pick one of these and we will get you back on track."

**3G.3 `app/not-found.tsx` line 21 (P3, XS)** 404 primary button.
- Now: "Go Home"
- Problem: A generic system label, and the only cheeky moment available on this page.
- Change to: "Back to the pub"

**3G.4 `app/join-our-team/page.tsx` line 155 (P1, S)** Hero lead.
- Now: "We are looking for experienced bar and kitchen team members who want regular part-time shifts, a well-run rota, free parking, and a friendly village pub environment."
- Problem: Leads with a list of facts, and "a friendly village pub environment" is the generic filler the standard bans. Nothing says why anyone would want to work here specifically.
- Change to: "We are a small team in a village pub that has stood here since 1751, and we would love to hear from experienced bar and kitchen people. Regular part-time shifts, a well-run rota, and free parking right outside."

**3G.5 `app/join-our-team/page.tsx` line 196 (P2, XS)** Intro paragraph 2.
- Now: "At The Anchor, our aim is simple: deliver brilliant basics every day, then go the extra mile to give guests a warm, memorable experience that makes them want to come back."
- Problem: "Go the extra mile" and "warm, memorable experience" are corporate stock phrases.
- Change to: "Our aim is simple. Get the basics right every single day, then add the small things that make people want to come back next week."

**3G.6 `app/join-our-team/page.tsx` line 226 (P2, S)** *(amended)* "Why work at The Anchor?" opening paragraph.
- Now: "The Anchor is a village pub near Heathrow Terminal 5 with regular local customers, food service, events, private bookings and a growing reputation."
- Problem: A list of nouns where the heading promises a reason, naming nothing a candidate could picture.
- Change to: "We are a village pub in Stanwell Moor, seven minutes from Heathrow Terminal 5, with planes going over the beer garden and regular local customers who keep coming back. There is food service, events, private bookings and a growing reputation to look after."
- Note: no customer-tenure claim. "Regulars who have been coming here for years" is not supported anywhere.

**3G.7 `app/join-our-team/recruitmentContent.ts` line 65 (P3, S)** *(amended)* Bar Staff role card.
- Now: "Part-time bar work in a friendly, owner-managed village pub near Heathrow."
- Problem: Reads like a job-board listing, with "friendly" doing all the work and nothing concrete.
- Change to: "Part-time bar work in an owner-managed village pub that has stood here since 1751, seven minutes from Heathrow Terminal 5."
- Note: **keep "Part-time".** Hours are a material term on a card that renders standalone. **Leave the Kitchen Team card at line 73 exactly as it is:** it already names four concrete things. Also note `mainRoleCards` is only the fallback, returned when there are zero live postings, so this edit may not change what most visitors see.

**3G.8 `app/safety-and-respect/page.tsx` line 103 (P3, XS)** *(amended)* "Our events" paragraph, closing sentence. **This is the only line on this page that may be touched.**
- Now: "The atmosphere is warm, the crowd is mixed, and nobody takes themselves too seriously."
- Problem: "The atmosphere is warm" is banned filler. This is the one sentence on the page that is event copy rather than safety copy.
- Change to: "You will find quiz teams of two next to tables of ten, the crowd is mixed, and nobody takes themselves too seriously."
- Note: concrete **and** welcoming. Do not swap the welcome signal for a competitive one: this page's job is reassuring someone deciding whether they will be comfortable walking in. The standards and reporting sections around it stay untouched.

**3G.9 `app/sitemap-page/page.tsx` line 271 (P3, XS)** *(amended)* Contact card heading.
- Now: "Can't Find What You're Looking For?"
- Problem: Title Case shouting of a stock phrase from the same family as the banned "look no further".
- Change to: "Still can't find it?"
- Note: heading only. The paragraph beneath already says "Give us a call and we'll be happy to help", so adding a second CTA would repeat it.

**3G.10 `app/privacy-policy/page.tsx` line 39 (P3, XS)** Hero lead. **The only line on this page that may be touched.**
- Now: "Your privacy matters to us"
- Problem: Corporate boilerplate that tells the reader nothing.
- Change to: "What we collect, why we collect it, and how to ask us to delete it"
- Note: deliberately calm and factual, because everything below it is legal copy that must not be warmed up. The page does keep this promise: section 8 lists the right to erasure and section 11 gives contact details.

**3G.11 `app/quiz-night-competition-terms/page.tsx` line 75 (P3, XS)** Hero lead. **The only line on this page that may be touched.**
- Now: "Read the competition details and full terms before entering through the designated WhatsApp group."
- Problem: "Designated" is bureaucratic jargon on a page a quiz guest is reading on their phone.
- Change to: "The competition details and full terms. Please have a read before you enter through the WhatsApp group."
- Note: the register stays calm. The fix is plainer English, not more energy. No specificity is lost: the page carries an "Entry channel" fact row at line 62 that names the channel.

**3G.12 `components/features/ParkingBookingWizard/index.tsx` line 330 (P2, XS)** *(amended)* Availability success message.
- Now: "Great news! We have at least ${minRemaining === Infinity ? '1' : minRemaining} space(s) free for that window."
- Problem: "space(s)" is unresolved machine output in a flow where the guest is about to pay.
- Change to: "That window works. We have at least {n} spaces free."
- Note: **keep "at least".** It is load-bearing: when the reduce never narrows, the code prints a literal 1, and without the hedge the sentence asserts an exact count we do not know. Resolve the plural in code so one space reads "1 space", and handle the Infinity branch separately, for example "That window works, we have spaces free."

## Phase 4, metadata sweep

Fifteen changes to titles, meta descriptions and social cards. Good news first: nobody has used an em dash anywhere in metadata, and the character discipline is genuinely good. The dominant failure is one pattern repeated roughly 90 times across 118 files: a comma-separated feature list with no feeling in front of it. Four systemic issues sit underneath it, and the entries below fix all four: the sitewide defaults are the flattest strings on the site, two shared builders push one sentence onto roughly 20 pages, a cluster of descriptions sells by knocking hotels and airport food, and a cluster carries unverifiable superlatives.

`app/beer-garden/page.tsx` is the benchmark to copy: "Planes 500 to 800 feet overhead" is concrete, specific, and could not belong to any other pub. `app/corporate-events/page.tsx` and `app/sunday-roast/page.tsx` are close behind and need nothing. The calm-tier operational metadata is correct as written and is excluded: book-table, privacy-policy, accessibility, safety-and-respect, quiz-night-competition-terms, and the parking confirmation page.

**4.1 `app/layout.tsx` line 83 (P1, XS)** **Owner sign-off needed, see conflict 6.** Root default meta description, cascading to every page without its own.
- Now: "The Anchor, Stanwell Moor. Traditional pub around 7 mins from Heathrow T5, traffic dependent. Sunday roasts, quiz nights, listed karaoke nights, beer garden & free parking."
- Problem: Opens with a hedge that reads like a disclaimer, and at 170 characters it truncates in search before the free parking lands.
- Change to: "A proper village pub in Stanwell Moor since 1751, 7 mins from Heathrow T5. Sunday roasts, quiz nights, a beer garden under the flight path and free parking."
- Note: dropping "listed karaoke nights" is correct, karaoke is not a regular feature. Dropping "traffic dependent" needs a yes: it was added in an owner-committed batch, not by an agent.

**4.2 `lib/twitter-metadata.ts` line 56 and `app/layout.tsx` line 111 (P1, S)** Default Twitter description, duplicated.
- Now: "Traditional pub with modern entertainment. Quiz nights, hosted events, great food & more."
- Problem: Could belong to any pub chain. "great food & more" is filler and "modern entertainment" names nothing.
- Change to: "A village pub in Stanwell Moor since 1751, seven minutes from Heathrow T5. Quiz nights, Sunday roasts and a beer garden under the flight path."

**4.3 `app/layout.tsx` line 94 and `app/pubs-in-stanwell/page.tsx` line 16 (P1, XS)** **Retired offer still being advertised, see conflict 7.** Root OpenGraph description.
- Now: "Traditional British venue near Heathrow with hosted events, live entertainment & great food. Dog-friendly beer garden."
- Problem: "Live entertainment" sits against the live-music retirement, which says not to list, promote, schedule or link to live music, bands, acoustic sets, tribute acts or solo performers. The same phrase appears on the pubs-in-stanwell page.
- Change to: replace "live entertainment" with "quiz nights and hosted events" on both, or confirm the phrase is meant to cover quizzes and bingo only.

**4.4 `app/page.tsx` lines 49 and 56 (P1, XS)** Homepage meta and OpenGraph descriptions.
- Now: "The Anchor, Horton Road, Stanwell Moor TW19 6AQ. Pub food, Sunday roast, beer garden and free parking, 7 mins from Heathrow T5. Book a table."
- Problem: The homepage sits in the high-energy tier but opens with a postal address then lists features.
- Change to: "A proper village pub since 1751, 7 mins from Heathrow T5. Sunday roasts, a beer garden under the flight path and free parking. Everyone's welcome."

**4.5 `components/features/HotelProximityPage.tsx` line 365 (P1, XS)** **Reaches all 11 hotel pages.** Shared description.
- Now: "Traditional British pub a few minutes from ${name}. Home-cooked food, Sunday roast, dog-friendly beer garden and free parking, around 7 minutes from Heathrow Terminal 5."
- Problem: One generic feature list repeated across the cluster, and at 168 characters before the hotel name is substituted, every one of the 11 truncates in search.
- Change to: "A proper village pub since 1751, a few minutes from ${name}. Home-cooked food, a dog-friendly beer garden under the flight path and free parking."

**4.6 Four terminal page meta descriptions (P1, S)** *(amended)* `terminal-5` line 23 and the equivalent on terminals 2, 3 and 4.
- Now: "Pub near Heathrow Terminal 5, 7 minutes by taxi or car. British pub food, free customer parking, dog-friendly beer garden and table booking."
- Problem: Four high-traffic pages share one template, nothing is named or felt, and "table booking" reads like a system label.
- Change to: **one per page, each with its own verified figure.** T5: "Just 7 minutes from Terminal 5. Home-cooked pub food, free parking, and a dog-friendly beer garden with the planes coming in right overhead." T2: "Eleven minutes from Terminal 2. Home-cooked pub food, Sunday roasts, free parking and a dog-friendly beer garden under the flight path." T3: "Eleven minutes from Terminal 3. Sunday roasts, stone-baked pizza, free parking and a dog-friendly beer garden under the flight path." T4: "Twelve minutes from Terminal 4. Home-cooked pub food, Sunday roasts, free parking and a dog-friendly beer garden under the flight path."
- Note: **the single most dangerous item in this spec if applied carelessly.** It looks like a one-line fix and would publish "7 minutes from Terminal 5" onto three pages that are 11, 11 and 12 minutes from a different terminal.

**4.7 `app/pubs-in-stanwell/page.tsx` line 19 (P1, S)** OpenGraph and Twitter descriptions. Part of the 1751 sweep at 3B.1.
- Now: "Stanwell Moor's village pub since 1995. Beer garden, free parking, great food and live entertainment."
- Problem: A factual error against the 1751 founding date, plus "great food" filler and the retired "live entertainment".
- Change to: "The village pub at the heart of Stanwell Moor since 1751. Beer garden, free parking and a proper welcome in TW19."

**4.8 Four "escape somewhere else" descriptions (P1, S)** *(amended)* `heathrow-hotels-pub` line 24, `longford-pub` line 21, `pre-flight-meal` line 17, `wraysbury-pub` line 23.
- Now: "Escape expensive hotel restaurants!", "Escape the hotel prices!", "Avoid the airline food!", "Looking for a change from the local?"
- Problem: The joke points at other venues, not at ourselves.
- Change to: **one per page, each with its own audience and distance.** heathrow-hotels-pub: "A proper British pub minutes from the Heathrow hotels. Free parking, home-cooked food and a beer garden right under the flight path." longford: "A proper British pub a short walk or taxi from Longford. Free parking, home-cooked food and a beer garden under the flight path." pre-flight-meal: "A proper meal before you fly, seven minutes from Terminal 5. Home-cooked pub food, free parking and a beer garden under the flight path." wraysbury: "Five minutes from Wraysbury. Home-cooked food, free parking and a beer garden right under the Heathrow flight path."
- Note: the body copy repeats the same move at heathrow-hotels-pub lines 117, 137, 148, 264 and 614, and longford lines 93 and 250. A metadata-only fix leaves the pattern live. The hotels page H1 is handled at 3C.7.

**4.9 `app/whats-on/page.tsx` line 27 (P1, XS)** Meta description.
- Now: "Quiz nights, music bingo and cash bingo at The Anchor, Stanwell Moor. Quiz £3, free parking, 7 mins from Heathrow T5. See the dates."
- Problem: Event pages sit in the high-energy tier but this reads as a directory listing.
- Change to: "Quiz nights, music bingo and cash bingo, and we love every one of them. £3 quiz entry, free parking, 7 mins from Heathrow T5. See the dates."
- Note: confirm the £3 applies to the quiz specifically before republishing it, see conflict 8.

**4.10 `app/pub-garden-heathrow/page.tsx` line 20 and `app/sunbury-pub/page.tsx` lines 19 and 22 (P2, S)** *(amended)* Unverifiable superlatives.
- Now: "Sun, cider, and space to relax. The best garden in Stanwell Moor." and "Worth the short drive from Sunbury for the best Sunday Roast in the area. Free parking and great value." Plus "Exceptional Sunday roasts" at sunbury line 19.
- Problem: Excitement carried by an unsupported superlative rather than a concrete detail.
- Change to: pub-garden "Sun, cider, and space to stretch out. Our beer garden sits right under the Heathrow flight path, seven minutes from Terminal 5." Sunbury "Worth the short drive from Sunbury for a proper Sunday roast, served 1pm to 6pm. Free parking and a dog-friendly beer garden." Fix "Exceptional Sunday roasts" at line 19 in the same pass.
- Note: two separate rewrites. Do not put garden copy on the Sunbury area page, it removes the local hook entirely.

**4.11 `app/private-hire/near/[slug]/page.tsx` lines 661 and 666 (P2, XS)** *(amended)* Shared OpenGraph and Twitter descriptions for every landmark page.
- Now: "A welcoming venue for ${descriptor}, just ${landmark.distance} from ${landmark.name}. Free parking and flexible private spaces."
- Problem: "A welcoming venue" and "flexible private spaces" are chain-website register, and one string covers the whole cluster.
- Change to: "Private space for ${descriptor}, just ${landmark.distance} from ${landmark.name}. Free parking, and the room set up the way you need it."
- Note: **no enthusiasm verb in this shared string.** For type `crematorium` the descriptor is "wakes, funeral receptions and memorials", so "We love hosting ${descriptor}" would publish "We love hosting wakes, funeral receptions and memorials" across the whole cluster. If warmth is wanted, gate it per landmark type in `getMetaForType`.

**4.12 `app/ashford-pub/page.tsx` line 20 and `app/bedfont-pub/page.tsx` (P2, M)** *(amended)* Area page meta descriptions.
- Now: "${BRAND.name} - traditional British pub 10 mins from Ashford. Free parking, Sunday roasts, quiz nights & family-friendly. Easy A30 access."
- Problem: The same formula on both pages, giving no local reason to come.
- Change to: Ashford "Ten minutes from Ashford and worth the drive. Sunday roasts, quiz nights, free parking and a beer garden under the Heathrow flight path." Write Bedfont its own line from a fact already on that page.
- Note: **scope this to Ashford and Bedfont only.** `staines-pub` and `feltham-pub` build their descriptions from a dynamic `${sundayPhrase}` computed at request time, so a static replacement would hardcode Sunday wording that is currently derived from live state. `horton-pub`, `colnbrook-pub`, `staines-pub` and `feltham-pub` already carry genuinely distinct copy and do not fit the formula critique.

**4.13 `app/about/page.tsx` line 24 (P2, XS)** Meta description.
- Now: "The Anchor in Stanwell Moor has been a village pub since 1751. 5-star food hygiene. Meet the team behind Heathrow’s favourite local pub."
- Problem: "Heathrow's favourite local pub" is an unsupported superlative, and 1751 is stated flatly then dropped for a hygiene rating.
- Change to: "We have been the village pub in Stanwell Moor since 1751, standing here long before Heathrow. Meet the team, and the pub, behind the welcome."

**4.14 `app/live-sport/boxing/page.tsx` lines 15, 18 and 24 (P2, XS)** Meta, OpenGraph and Twitter descriptions. **Tied to conflict 1.**
- Now: "Watch the biggest boxing matches live at ${BRAND.name}. Anthony Joshua, Tyson Fury, and title fights on big screens. Great atmosphere near Heathrow." Lines 18 and 24 repeat "big atmosphere".
- Problem: Banned filler, and it names heavyweight bouts that sit behind the Box Office pay-per-view we cannot carry.
- Change to: "Fight nights at The Anchor in Stanwell Moor. Big screens, sound up, free parking, seven minutes from Heathrow Terminal 5. Terrestrial channels only, so no Sky and no TNT." Fix "big atmosphere" on lines 18 and 24 in the same pass.
- Note: the explicit terrestrial-only clause is what makes this version safe. Do not ship a tidier version without it, or the page simply launders the banned claim into fresher wording. If the owner decides to retire the page (question 1), this edit is moot.

**4.15 `app/blog/page.tsx` line 25 (P3, XS)** Blog index meta description.
- Now: "Read The Anchor blog for Heathrow Terminal 5 travel tips, pub events, food and drink guides, and community stories from Stanwell Moor and Staines."
- Problem: A table of contents in sentence form, spending its opening words on an instruction instead of a reason.
- Change to: "Heathrow travel tips, pub events, and stories from a village pub that has stood here since 1751. Written by us, in Stanwell Moor."

## Rejected recommendations

An independent fact-checker read every proposed rewrite against the source files and the SSOT, and rejected **82**. They are all listed here so nobody re-proposes them. Where a rejection came with an amended version, that version is the one used in the phases above and the entry says where to find it. Where it says "dropped", the recommendation is not in this spec at all.

The four most common failure modes, worth knowing before writing any further copy: **inventing a facility** (a lawn, an open fire, covered seating, a canopy, a newsletter), **hardcoding one distance across pages with different distances**, **quoting one sentence but replacing facts from the next one**, and **swapping a live constant for a literal**.

### Homepage and core conversion

- **`app/_components/HomeHero.tsx` line 151, review row.** Self-collision: it puts "here since 1751, long before Heathrow" forty lines below the same fact in the rotating hero lead. **Dropped.** Change the lead only (2.1); the review row rotates for nobody and reads better with a distinct job.
- **`app/sunday-roast/page.tsx` line 474, closing body ("Every plate is cooked to order").** Overstates the kitchen process: joints are roasted in advance and carved to order. *Amended at 2.7.*
- **`app/sunday-roast/page.tsx` line 474, "not held under a lamp".** A dig at how other venues operate. Jokes point at ourselves, the weather or the planes. *Removed in 2.7.*
- **`app/sunday-roast/page.tsx` line 474, deleting the walk-in and no-pre-order facts.** The audit called the repetition waste. It is deliberate: the walk-in model replaced pre-order and prepayment in May 2026 and returning guests still carry the old expectation. *Facts retained in 2.7.*
- **`app/page.tsx` lines 91 and 261 plus `app/sunday-roast/page.tsx` line 153.** Three "look forward to" constructions on two linked pages, the exact duplication the audit flagged elsewhere. *Amended at 2.3, 2.5 and 2.6: the construction survives once, on the roast hero.*
- **`app/whats-on/page.tsx` line 223 versus `app/page.tsx` line 261.** Near-identical "most excited about" leads on two linked pages. *Resolved at 2.5.*
- **`app/page.tsx` line 125, "Dogs welcome in the beer garden" and "Never set foot in a pub before? Come along anyway".** The first is an accuracy regression: dogs are welcome throughout the venue, so this reads as a restriction. The second literalises the inclusion principle into printed copy and risks reading as patronising. *Amended at 2.4.*
- **`app/book-table/page.tsx` line 296, "roasts cooked to order".** Same kitchen-process overstatement. *Amended at 2.13.*

### Food and drink menus

- **`app/drinks/page.tsx` line 432, restating the seven-brand draught list.** The SSOT says the drinks inventory must come from POS or API before publishing, and two beers on that page have already been discontinued once. The rewrite also repeated brands already named in the sentence before. *Amended at 3A.7.*
- **`app/drinks/page.tsx` line 440, restating the distance and beer range.** Same quote-scope defect: both facts are already in the first sentence of that answer. The stated reason was also wrong: a value comparison is not a joke, the real problem is that it is an unsubstantiated comparative. *Amended at 3A.8.*
- **`components/features/AllergenFilterBar.tsx` line 206, narrowing "dietary requirements" to "any allergies".** This is the site's allergen safety line on every menu surface. Coeliac, NGCI and non-allergy dietary needs would be quietly dropped from the invitation. *Amended at 1.11.*
- **`app/pizza-menu/page.tsx` line 156, "can be made vegan".** Asserts the kitchen will modify a dish on request, which is a different promise and is not in the SSOT. *Amended at 3A.3.*
- **`app/pizza-menu/page.tsx` line 155 swept into the same batch.** Allergen wording must not ride along in a voice tidy-up with no reviewed replacement. *Excluded from 3A.3.*
- **`app/pizza-menu/page.tsx` line 138, "what our kitchen is baking today".** False on Mondays, and it mispoints: the content below that heading is the dietary notes block, not the menu. *Amended at 3A.2.*
- **`app/drinks/page.tsx` line 324, "Covered sections".** The SSOT lists heated areas, not covered ones. Covered and heated are different physical claims. *Amended at 3A.6.*
- **`app/drinks/page.tsx` line 335, rewording the locals' card note.** A locals' card appears nowhere in the SSOT. An open licence to reword risks an unverified loyalty scheme being restated or expanded. *Excluded from 3A.9, see conflict 4.*
- **`app/food-menu/page.tsx` line 346, "today's dishes".** Reads as an availability claim on a page served on Mondays when the kitchen is closed. *Amended at 3A.12.*

### Identity and story pages

- **`app/beer-garden/page.tsx` line 277, "open lawn".** No lawn, grass or open ground exists anywhere in the file or the SSOT. *Amended at 2.18.*
- **`app/beer-garden/page.tsx` line 126, opening on "There's nowhere else quite like it".** The block is explicitly built for featured snippets and must open entity-first. The rewrite also dropped "in Stanwell Moor", removing the location entity from the one paragraph built to be extracted. *Amended at 2.16.*
- **`app/beer-garden/page.tsx` line 117, the standard's own worked example verbatim.** Two rewrites nine lines apart would put "Pint in hand, planes roaring over the garden" and "There's nowhere else quite like it" adjacent on one page, which reads as formula. It also dropped "plane spotting", the term the page is built on. *Amended at 2.15.*
- **`app/find-us/page.tsx` line 361, heading "Free Parking, 20 Spaces, No Time Limit".** Strips the customer-only qualifier while promoting "No Time Limit" into the heading, on a page that markets to Heathrow drop-off traffic. *Amended at 2.25.*
- **`app/sustainability/page.tsx` line 230, "This pub has stood here since 1751".** Asserts the building dates to 1751. Our own history page says the current structure is believed to be mid-Victorian, built on the site of an earlier inn. *Amended at 2.28.*
- **`app/about/page.tsx` line 330, "Tell us what you fancy and we'll pour it".** An unqualified availability promise on a card listing spirits and cocktails, which are not poured and not guaranteed to be stocked. *Amended at 2.20.*

### Regular event pages

- **`app/karaoke/page.tsx` line 194, an energetic present-tense invitation.** This string only fires when no karaoke date exists, and karaoke must only be promoted when an event record lists it. It also duplicated two phrases already in the same paragraph. *Amended at 2.38.*
- **`app/karaoke/page.tsx` line 119, "The bar is two steps from the mic".** A venue-layout claim with nothing behind it, and its closing line duplicated the karaoke fallback word for word. *Amended at 2.40.*
- **`app/cash-bingo/page.tsx` line 210, dropping `{heroDescription}`.** Would silently delete the live door time, start time and booking phone number from the page. *Amended at 2.37.*
- **`app/karaoke/page.tsx` line 316, "we will make sure you are all sat together".** An unbacked seating guarantee on a card that links straight to the booking button, and it omitted the 10+ deposit. *Amended at 2.39.*
- **`app/quiz-night/page.tsx` line 232, "argue about the nineties".** Implies a decade round. The page's actual rounds are legends, cult film clues, riddles and general trivia. "£25 bar tab for whoever gets it right" was also loose: it goes to the winning team. *Amended at 2.33.*
- **`app/live-sport/page.tsx` line 151, the speakable-schema rationale.** Fabricated supporting evidence: line 107 sets `structured: true` with no speakable flag. The banned-filler point stands on its own. *Copy kept at 2.31, reason corrected.*
- **`app/live-sport/boxing/page.tsx`, sweeping the entry-fee FAQ into the rewrite.** Line 100 makes no PPV, Sky or TNT claim and is accurate operational copy. The hero lead at line 39 needs the correction instead. *Amended at 2.29.*

### Seasonal and occasion pages

- **`app/christmas-parties/page.tsx` line 350, "a pub that has been doing them since 1751".** Asserts 275 years of unbroken Christmas trading. *Amended at 3E.10.*
- **`app/new-years-eve/page.tsx` line 104, replacing only the first sentence.** The next sentence already names the DJ, the countdown and the 1am close, so applying it verbatim states all three twice. *Amended at 3E.2.*
- **`app/new-years-eve/page.tsx` line 104, "our favourite night of the year" colliding with Halloween.** Two pages in one family claiming the superlative. *Resolved at 3E.2 and 3E.13.*
- **`app/new-years-eve/page.tsx` line 305, heading duplicating the paragraph's own opener**, restating paragraph 2 verbatim, and replacing the `{HEATHROW_TIMES.terminal5}` constant with a literal. *Amended at 3E.3.*
- **`components/features/christmas/ChristmasLightbox.tsx`, dropping the group minimum.** Everywhere else the site states "each guest picks 1, 2 or 3 courses" it states the minimum party size in the same breath. On a site-wide interstitial, omitting it invites a table of four to think they can book it. *Amended at 1.2.*
- **`app/mothers-day/page.tsx` line 135, dropping the last-table time and two constants.** Last seating is the most consequential fact on the busiest lunch of the year. *Amended at 3E.9.*
- **`app/halloween/page.tsx` line 86, replacing only the opening sentence.** The rest of the lead already carries the theme, the earlier food and the free parking. *Amended at 3E.13.*
- **`app/summer-garden-parties/page.tsx` line 39, "the grill going".** Reads as a BBQ simply running when you turn up. The page's own FAQ says a private BBQ buffet needs 20 guests minimum and is a booked package. It also dropped "exclusive areas", a real commercial differentiator. *Amended at 3E.7.*
- **`app/summer-garden-parties/page.tsx` line 46, "Our Garden on a Good Day".** Strips "beer garden", the page's primary entity term, out of its main visible heading. *Amended at 3E.8.*
- **`app/valentines-day/page.tsx` line 469, "for two or for the whole group".** The sub-paragraph two lines below already ends with that phrase word for word. *Amended at 3E.12.*
- **`app/valentines-day/page.tsx` line 359, "there is no couples-only rule".** Already appears verbatim in two FAQ answers on the same page. *Amended at 3E.11.*

### Private hire and corporate

- **`app/corporate-events/page.tsx` line 112, "your own room" and "shared ballroom".** The page's own FAQ says "its own table or its own room", so a flat room promise is not deliverable for smaller bookings, and "ballroom" mischaracterises the competitor category. *Amended at 3F.2.*
- **`app/private-hire/page.tsx` line 258, "Have the run of a village pub".** Implies exclusive use of the whole venue, which is available by enquiry only, on a page that sells from 10 guests upward. It also dropped "Stanwell Moor" and "custom catering". *Amended at 3F.3.*
- **`app/private-hire/engagement-parties/page.tsx` line 75, "Prosecco on arrival".** Reads as an included welcome drink; the same page prices it as a chargeable pre-order. The fix also needed extending to lines 16 and 50. *Amended at 3F.4.*
- **`app/private-hire/milestone-birthdays/page.tsx` line 97, "buffet packages at live prices".** Leaks the same internal jargon this spec removes elsewhere, one sentence from "Pricing discussed on enquiry". *Amended at 3F.5.*
- **`app/corporate-events/page.tsx` line 119, "one clear quote covering the room and the catering".** Contradicts the commercial model stated elsewhere: a room hire fee, then you pay for what you order on top. *Amended at 3F.7.*
- **`app/corporate-events/page.tsx` line 547, replacing only the second sentence.** Would yield "Absolutely... Yes. We are around 7 minutes from Terminal 5", repeating the proximity point twice. *Amended at 3F.8: replace the whole answer.*
- **`app/corporate-events/page.tsx` line 363, heading "What is in the room".** Misdescribes a section covering venue-wide facilities, including the page's only accessibility disclosure. *Amended at 3F.6.*
- **`app/private-hire/near/[slug]/page.tsx` line 878, "we will have the room ready".** Over-promises on a template shared by every landmark page; smaller groups get a reserved area, and the template's own wake copy says "private area". *Amended at 1.8.*

### Local area pages

- **`app/m25-junction-14-pub/page.tsx` line 172, "Five minutes off Junction 14".** The SSOT says 2 minutes from Junction 14, and the SSOT wins over page copy. Baking the wrong number into approved copy would enshrine the error. *Amended at 3B.13, see conflict 3.*
- **`app/ashford-pub/page.tsx` line 149, "St Mary's Church next door".** Not in the SSOT, and the site contradicts itself: two other pages place that church in neighbouring Stanwell village, not adjacent to us in Stanwell Moor. *Amended at 3B.9.*
- **`app/feltham-pub/page.tsx` line 449, "and a table waiting".** Promises availability directly above a Book a Table button, when booking is strongly recommended for groups and peak slots. *Amended at 3B.14.*

### Heathrow and hotel pages

- **Four terminal hero leads sharing one "Seven minutes from Terminal 5" string.** Terminals 2 and 3 are 11 minutes and Terminal 4 is 12. It would also delete each page's airline hook, the only thing differentiating them. *Amended at 3C.1: one string per page.*
- **"Draught lagers and beers, plus wines and spirits" as a replacement for "traditional ales".** Names live bar stock, which the SSOT requires be pulled from POS or API before publishing. Two of the three cited repeats are prose paraphrases needing separate rewrites, not a find-and-replace. *Amended at 3C.2.*
- **`app/near-heathrow/terminal-5/page.tsx` line 493, naming draught lagers, beers, ciders, wines and spirits.** Same stock-naming problem, and it moves cider to draught when the SSOT records bottled ciders. *Amended at 3C.3.*
- **`app/heathrow-layover-dining/page.tsx` line 52, "nothing to register".** Swaps one unverified claim for its opposite. The paid parking product runs on the same 20-space car park and does capture registrations, so a plate check is plausible. "Ask us about" also misdescribes a product booked online. *Amended at 3C.6, see conflict 2.*
- **`app/heathrow-hotels-pub/page.tsx` line 117, "seven to twelve minutes from every Heathrow hotel".** The page's own distance table lists a hotel at 15 minutes. *Amended at 3C.7.*
- **`app/plane-spotting-heathrow/page.tsx` line 109, "a roof if the rain comes".** No canopy, marquee, gazebo or covered area appears anywhere in the SSOT. "Hot food" also needed the kitchen-hours caveat. *Amended at 3C.8.*
- **`app/heathrow-parking/page.tsx` line 406, "under twelve minutes" to Terminals 2, 3 and 4.** Terminal 4 is 12 minutes on our own page. *Amended at 3C.11.*
- **`app/near-heathrow/terminal-5/page.tsx` line 465, "Pub prices, live on our menu".** Pushes an internal CMS concept into customer copy, and still frames us against the hotel by implication. *Amended at 3C.4.*

### Amenity and feature pages

- **`app/fish-and-chips-heathrow/page.tsx` line 136, "what our kitchen is serving today".** The section renders unconditionally, including Mondays when the kitchen is closed and whenever the menu API is down. The batch instruction also named three lines but supplied one replacement for three different string types. *Amended at 3D.2.*
- **`app/accessibility/page.tsx` line 177, dropping "on request" and adding "down to".** Implies a permanently installed ramp. A wheelchair user could plan a visit on that promise and arrive to find the ramp needs fetching. *Amended at 3D.11.*
- **`app/accessibility/page.tsx` line 153, "Please ask at the bar".** An invented operational instruction that contradicts the page's own routing, which sends people to call ahead precisely so they do not have to sort it out on arrival. *Amended at 3D.13.*
- **`app/family-friendly-pub-heathrow/page.tsx` line 40, "nobody minding when it gets loud".** A claim about atmosphere and staff tolerance presented as fact, committing the pub to a noise policy nobody has signed off. *Amended at 3D.9.*

### Shared components and lib

- **`lib/tag-seo-content.ts` line 646, "cosy fires when winter bites".** There is no fire, fireplace or log burner anywhere in the SSOT. The audit only flagged the US spelling, which would have shipped the fire claim as corrected, approved copy. *Amended at 1.21.*
- **`lib/tag-seo-content.ts` line 328, "join our newsletter".** There is no newsletter signup anywhere in the codebase. *Amended at 1.18.*
- **`components/PrivateBookingSection.tsx` line 20, "Check your date".** The calculator makes zero network calls and never looks up availability. *Amended at 1.4.*
- **`components/PrivateBookingSection.tsx` line 54, "See your price".** Reads as a quote we will honour, on a tool whose own output is labelled "Estimated Event Total", and it contradicts the paragraph directly above it. *Amended at 1.6.*
- **`lib/local-seo-data.ts` line 109, "straight down the M25".** Contradicts the record it replaces, which says "via the M25 and local roads". Stockley Park to Stanwell Moor is not a single motorway run. *Amended at 1.15.*

### Titles and meta descriptions

- **Four terminal meta descriptions sharing one string.** Same false-distance problem as the hero leads: it would publish "7 minutes from Terminal 5" onto pages that are 11, 11 and 12 minutes from other terminals. *Amended at 4.6.*
- **`app/private-hire/near/[slug]/page.tsx` line 661, "We love hosting ${descriptor}".** For crematorium landmarks the descriptor is "wakes, funeral receptions and memorials", so this would publish enthusiasm about bereavement across the whole cluster. *Amended at 4.11.*
- **`app/live-sport/boxing/page.tsx` line 15, "Fight nights on the big screens".** Restates the same broadcast promise the finding itself flags as doubtful, laundering a banned claim into fresher wording. *Amended at 4.14, which carries the explicit terrestrial-only clause.*
- **`app/sunbury-pub/page.tsx` line 22, receiving beer-garden copy.** One rewrite was offered for two files; dropping garden copy onto a Sunbury area page removes the local hook. It also left "Exceptional Sunday roasts" at line 19 unflagged. *Amended at 4.10.*
- **Four "escape somewhere else" descriptions sharing one hotel-cluster string.** The four pages address different audiences and distances, so three would carry the wrong location promise. *Amended at 4.8.*
- **Six area page meta descriptions treated as one formula.** Only Ashford and Bedfont fit. `staines-pub` and `feltham-pub` build their descriptions from a dynamic `${sundayPhrase}` computed at request time, so a static replacement would hardcode wording currently derived from live state. The "nine area pages" claim was also unsupported. *Amended at 4.12.*
- **`app/layout.tsx` line 83, dropping "traffic dependent" silently.** Git blame traces the phrase to an owner-committed batch, not agent filler. The change is defensible but needs a yes. *Kept at 4.1, marked owner sign-off, see conflict 6.*
- **`app/layout.tsx` line 94 folded in as a duplicate of the Twitter default.** It is not a duplicate, and it carries "live entertainment", which sits against the live-music retirement. That is a higher-priority problem than the chain-register one and should not be buried. *Split out at 4.3.*

### Operational pages

- **`components/features/ParkingBookingWizard/index.tsx` line 330, dropping "at least".** The code prints a literal 1 when the reduce never narrows, so without the hedge the sentence asserts an exact count to a guest about to pay. The suggestion also had an engineering instruction baked into the customer-facing string. *Amended at 3G.12.*
- **`app/book-table/page.tsx` line 181, "we will hold a table for you".** A commitment the form does not make: the management system confirms bookings, and 10+ needs a deposit first. The replacement social-proof line also swapped vague praise for a frequency claim in neither the SSOT nor the source. *Amended at 2.14.*
- **`app/join-our-team/page.tsx` line 226, "regulars who have been coming here for years".** Asserts customer tenure. The source says only "regular local customers". *Amended at 3G.6.*
- **`app/join-our-team/recruitmentContent.ts` line 73, the Kitchen Team card.** Claimed to have the same problem as the Bar Staff card. It does not: it already names four concrete things and contains none of the "friendly" filler. Rewriting it would make it worse. The Bar Staff rewrite also dropped "Part-time", a material term of employment. *Kitchen card excluded, Bar Staff amended at 3G.7.*
- **`app/sitemap-page/page.tsx` line 271, "Give us a ring."** The paragraph directly beneath already reads "Give us a call and we'll be happy to help", so the two CTAs would sit back to back. *Amended at 3G.9.*

## Register corrections

Seven places where the audit applied energy to copy that must stay calm. The register dial puts opening hours, booking flow, deposits, allergen and safety information, and anything operational or legal in the calm and clear tier, where accuracy beats excitement always.

1. **`app/book-table/page.tsx`, the whole file.** It was placed in a high-energy family. It is not one. Only the marketing band above the form may be touched (2.13 and 2.14). The deposit rules, the accessibility notice, the quick tips and all eight booking FAQs stay exactly as they are.
2. **`components/features/AllergenFilterBar.tsx` line 206.** Warmth was applied to a safety line and shrank its coverage. On allergen copy the rule is meaning first: change the addressee wording if you like, never the scope.
3. **`app/sunday-roast/page.tsx` line 474.** The audit treated the walk-in and no-pre-order facts as decorative repetition to be cleared out of an emotional peak slot. Where operational accuracy and emotional energy compete for the same slot, accuracy wins. Add energy around the fact, not in place of it.
4. **`components/PrivateBookingSection.tsx`, all three strings.** Private-hire pricing is quote and booking territory and belongs nearer the calm end of the dial than its family tier suggests. The estimate framing must survive in the heading and the button, not only in the body copy. Do not add further energy to this cluster.
5. **`components/features/christmas/ChristmasLightbox.tsx`.** Half marketing, half operational. Warmth goes in the heading only. The deposit sentence and the group minimum stay plain and whole.
6. **`app/private-hire/near/[slug]/page.tsx` lines 661, 666, 785 and 878.** No shared string spanning wakes, christenings and corporate away-days should carry an enthusiasm verb at all. Bereavement copy is reassuring and practical, never enthusiastic.
7. **`app/mothers-day/page.tsx`, `app/find-us/page.tsx` parking, `app/heathrow-layover-dining/page.tsx` parking, `app/heathrow-family-dining/page.tsx` facilities, `app/accessibility/page.tsx`, `app/safety-and-respect/page.tsx`.** In every case: energise the first sentence if you like, then leave the window, the last seating, the constants, the limitation and the invitation untouched and complete. In the calm tier an unknown is resolved with the owner or omitted, never smoothed over with a friendly-sounding guess.

## Effort summary

| Phase | Changes | Rough effort | Notes |
|---|---|---|---|
| Phase 1, highest cascade | 22 | Half a day | Mostly XS single strings, but each reaches 6 to 118 pages |
| Phase 2, core pages | 40 | One and a half days | Includes the boxing banned-claim fix and the quiz prize error |
| Phase 3, page families | 90 | Three to four days | Two multi-file sweeps (1995 to 1751, hardcoded prices) carry most of the time |
| Phase 4, metadata sweep | 15 | Half a day | Four entries need per-page strings, not find-and-replace |
| **Total** | **167** | **Roughly one working week** | Plus a verification pass |

By priority: 62 P1, 82 P2, 23 P3. By effort: roughly 100 XS, 45 S, 22 M.

Three accuracy items should be done first regardless of phase, because they are wrong on the live site today: the 1995 dates on `/pubs-in-stanwell` (3B.1), the "cash prizes" quiz claim on `/whats-on` (2.12), and the Box Office pay-per-view promise on `/live-sport/boxing` (2.29 and 4.14).

## Unresolved conflicts, and the default this spec assumes

The owner decisions attached to this spec were handed back in chat, not recorded here. This section exists only so an implementer knows which entries are gated and what the spec assumes if no other instruction arrives. Every one of these is a conflict between two sources, stated as fact.

1. **Boxing broadcast rights.** `app/live-sport/boxing/page.tsx` sells Box Office pay-per-view at lines 39, 61 and 68 and in its metadata. We have been terrestrial-only since January 2025. Default assumed: rewrite around terrestrial coverage per 2.29 and 4.14, rather than retire the page.
2. **Free guest parking terms.** The layover page states a three-hour cap and number-plate registration. The SSOT states no fees and no time limit while visiting. Default assumed: the SSOT is right, the cap goes, and the copy stays silent on registration.
3. **M25 Junction 14 distance.** The SSOT says 2 minutes. Several pages say 5. Default assumed: 2 minutes, and the pages are corrected.
4. **Locals' card.** Advertised at `app/drinks/page.tsx` line 335, absent from the SSOT. Default assumed: leave the line untouched until its status is confirmed.
5. **Six Nations kitchen hours.** `app/live-sport/six-nations/page.tsx` promises the kitchen stays open for all fixtures, even outside normal hours, in five places. That sits against Monday closure and API-driven hours. Default assumed: 3C copy carries the claim forward unchanged, pending confirmation.
6. **"Traffic dependent" in the sitewide default meta description.** Added in an owner-committed batch, not agent filler. Default assumed: 4.1 is held until signed off.
7. **"Live entertainment" in the root OpenGraph description and on `/pubs-in-stanwell`.** Live music is retired everywhere else. Default assumed: replace with "quiz nights and hosted events" per 4.3.
8. **£3 quiz entry.** About to appear in a sitewide-visible description at 4.9. Default assumed: the figure is correct and the entry ships as written.
9. **Music Bingo format.** The page says five rounds in two places and two games in another. Default assumed: drop the count per 2.34 until the management listing confirms it.
10. **Covered versus heated beer garden seating.** The drinks page says covered, the SSOT says heated. Default assumed: heated, per 3A.6.
11. **"Open late" at `app/drinks/page.tsx` line 298.** Not in the SSOT and not addressed by any entry in this spec.
12. **Three seasonal date errors, live now.** Easter Sunday 2027 is hardcoded as 4 April in `app/easter-sunday/page.tsx` lines 26 and 27 and published in that page's Event JSON-LD; the date is 28 March 2027. `app/fathers-day/page.tsx` lines 23 and 24 are still pinned to 21 June 2026, which has passed, and its Event schema advertises it. `app/mothers-day/page.tsx` line 37 has a stale comment saying 14 March 2027 while the constant on line 42 correctly says 7 March. Default assumed: all three are fixed before any copy work starts.
13. **Two kids-menu dishes named in page copy at 3D.10.** Both come from the page's own FAQ, so nothing is invented, but site policy is live menu data.
14. **The drinks H2 fix at 3A.4 drops "Heathrow" from a heading.** Default assumed: accept the trade, because the five-minute claim in it is wrong.
15. **The `/heathrow-hotels-pub` H1 change at 3C.7 is an SEO decision as well as a tone one.** That page currently ranks on a price-escape hook. Default assumed: make the change and monitor.
16. **Private hire capacity contradicts itself.** Retirement parties says up to 100 for a buffet and about 50 seated, engagement parties says up to 100, the headline fact is 10+ to 150. No entry in this spec resolves it.
17. **Three code cleanups sit outside the copy work.** `lib/static-events.ts` is unused and carries stale facts, including a "25 bar voucher" where the live quiz page says a £25 bar tab. `lib/careers.ts` has a corrupted meta description reading "Pay from the live approved source.71/hr" on both roles, though it is not customer-facing: the live job pages read `app/join-our-team/recruitmentContent.ts`. `components/features/FoodMenuSection.tsx` line 213 renders "Allergens listed: None listed" when the API returns no allergen data, which reads as a no-allergens claim. The third is the only one with a safety dimension.
18. **59 of the 72 blog tag entries in `lib/tag-seo-content.ts` are dormant.** Several carry banned filler ("something for everyone" in family-friendly and family-dining, "great food, drinks, and atmosphere" in wednesday) and US spellings ("cozy" nine times, "Savor", "travelers", "minimize", "center stage"). They go live the moment anyone tags a post with one of those slugs. Best handled as one cleanup pass on the file rather than 59 separate entries.

## Two more implementation notes

- **`app/drinks/page.tsx` line 53 hardcodes its own copy of the menu-unavailable message** instead of using `getMenuUnavailableMessage`, so any future edit to that string has to be made twice.
- **Use the constants, never literals.** `PARKING.capacity` for 20 spaces, `HEATHROW_TIMES.terminal5` for the drive time, `CONTACT.phone` for the number, `CHRISTMAS_MINIMUM_PARTY_SIZE` for the group minimum, and `MOTHERS_DAY_SERVICE_WINDOW_LABEL` and `MOTHERS_DAY_LAST_BOOKING_LABEL` on the Mother's Day hero. Several rejected suggestions failed precisely by swapping a live constant for a hardcoded string, which is how these values drift out of sync in the first place.
