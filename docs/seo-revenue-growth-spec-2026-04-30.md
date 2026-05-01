# SEO and Revenue Growth Spec

Date: 2026-04-30

Site: https://www.the-anchor.pub/

Primary business priorities:

1. Drive food bookings, especially Sunday lunch.
2. Drive private hire bookings.
3. Drive bookings for hosted events such as quiz night, cash bingo and music bingo.

This spec combines the supplied conversion report with repo and live-site discovery. It is intentionally aggressive: the goal is not just to patch isolated copy issues, but to make the site easier to crawl, easier to trust, easier to book, and easier to measure.

## Discovery Summary

Reviewed local code in:

- `app/`
- `components/`
- `lib/`
- `content/`
- `docs/`

Reviewed live pages:

- `/`
- `/book-table`
- `/sunday-lunch`
- `/private-hire`
- `/whats-on`
- `/events/pub-quiz-night-2026-05-06`
- `/events/music-bingo-2026-05-08`
- `/events/cash-bingo-2026-05-20`
- `/robots.txt`
- `/sitemap.xml`

Important repo context:

- Next.js app router project.
- Existing SEO docs are present under `docs/`, including `docs/seo-blueprint-audit.md`, `docs/seo-audit/`, `docs/seo-overhaul/` and `docs/seo-powerhouse/`.
- Some older SEO findings are now stale locally. For example, the local sitemap now includes previously missing pages and root business schema no longer includes unsupported aggregate review markup. Do not blindly implement old audit tasks without re-checking current code.

## Keyword Data Findings

Data source:

- `Keyword Stats 2026-04-30 at 22_34_26.csv`
- `Keyword Forecasts 2026-04-30 at 22_34_21.csv`
- `Keyword Stats 2026-04-30 at 22_38_12.csv`
- `Keyword Forecasts 2026-04-30 at 22_38_06.csv`
- `Keyword Stats 2026-04-30 at 22_40_53.csv`
- `Keyword Forecasts 2026-04-30 at 22_40_47.csv`
- `Keyword Stats 2026-04-30 at 22_43_12.csv`
- `Keyword Forecasts 2026-04-30 at 22_43_07.csv`

Stats date range:

- 2025-04-01 to 2026-03-31.

Important interpretation:

- Blank Google Keyword Planner volume does not mean zero demand. It usually means low, sparse or unreported volume. For local business SEO, these terms can still convert well because the intent is specific.
- The data supports a two-layer SEO approach:
  - High-volume Heathrow food/pub pages for discovery.
  - Lower-volume Sunday, private hire and hosted-event pages for high-intent conversion and internal link depth.

### Reported Keyword Volumes

Highest-volume terms from both exports:

| Keyword | Avg monthly searches | Competition | Notes |
|---|---:|---|---|
| bingo near me | 50000 | Low | Massive localised event intent. The pub cannot rank nationally, but local pack/local organic visibility for nearby users is valuable. |
| karaoke near me | 50000 | Low | Justifies an evergreen karaoke/event hub if karaoke is genuinely recurring. |
| live music near me | 50000 | Low | Only target if live music is a real recurring offer; otherwise avoid overpromising. |
| roast dinner near me | 50000 | Low | Strong reason to make Sunday roast/local SEO excellent, especially GBP and mobile. |
| sunday lunch near me | 50000 | Low | Strong localised Sunday discovery demand. |
| sunday roast near me | 50000 | Low | Strong localised Sunday discovery demand; export shows +900% three-month change. |
| pub quiz near me | 5000 | Low | Stronger than local-modified quiz terms; optimise the quiz hub for localised "near me" search. |
| quiz night near me | 5000 | Low | Strong event discovery term. |
| restaurant near heathrow | 5000 | Low | Largest discovery term. Homepage and restaurants/near-Heathrow pages should support this, but positioning must still say pub, not generic restaurant only. |
| restaurants near heathrow airport | 5000 | Low | Confirms broad restaurant-airport intent is a major discovery opportunity. |
| bingo night near me | 500 | Low | Supports bingo hub and current cash bingo pages. |
| carvery ashford | 500 | Low | Relevant competitor/search language for Sunday roast; use carefully if The Anchor is not a carvery. |
| food near heathrow | 500 | Low | Strong homepage and food-menu support term. |
| places to eat near heathrow airport | 500 | Low | Strong airport-dining support term for the restaurants/near-Heathrow page. |
| pub near heathrow | 500 | Low | Best homepage primary SEO target. |
| pubs near heathrow airport | 500 | Low | Confirms homepage/pub-near-Heathrow opportunity. |
| restaurants near heathrow terminal 4 | 500 | Low | Terminal-specific airport restaurant demand exists beyond Terminal 5. |
| restaurants near heathrow terminal 5 | 500 | Low | Strong T5/location intent, but export shows -90% three-month and YoY change, so validate in Search Console before overbuilding. |
| roast dinner ashford | 500 | Low | Adds another Ashford Sunday/roast support term. |
| roast dinner windsor | 500 | Medium | Windsor is a real Sunday roast catchment, but only use if service-area positioning is honest. |
| sunday lunch windsor | 500 | Medium | Windsor Sunday demand is meaningful. Treat as support or future page validation, not an immediate doorway page. |
| sunday roast ashford | 500 | Low | Clear Sunday roast opportunity, likely Ashford-local rather than Heathrow-only. |
| sunday roast windsor | 500 | Medium | Windsor Sunday demand is meaningful. Treat as support or future page validation, not an immediate doorway page. |
| music bingo near me | 500 | Low | Strong hosted-event discovery opportunity, should support evergreen music bingo hub. |
| things to do in staines | 500 | High | Upper-funnel local events content; competition is high, so route into events/food rather than a generic thin page. |
| things to do near heathrow | 500 | Low | Useful upper-funnel events/travel page, but not as close to bookings as food/private hire. |
| cash bingo near me | 50 | Medium | Lower volume but high event intent; CPC range is high, suggesting commercial value. |
| best pub near heathrow | 50 | Low | Useful homepage/GBP reputation support term. |
| bingo ashford | 50 | Low | Bingo hub can include Ashford catchment naturally if accurate. |
| events near ashford | 50 | Unreported | Upper-funnel event support term. |
| function room hire staines | 50 | Low | Confirms private hire has local demand outside Heathrow exact-match phrasing. |
| function room hire slough | 50 | Low | Useful support term if service area copy can be honest. |
| function room hire windsor | 50 | Low | Useful support term if service area copy can be honest. |
| hall hire staines | 50 | Low | Use as comparison language, not necessarily as primary positioning. |
| karaoke staines | 50 | Low | Karaoke hub can include Staines support if recurring. |
| live music staines | 50 | Low | Live music hub can include Staines support if recurring. |
| party venue staines | 50 | Medium | Private hire conversion term. |
| places to eat near heathrow terminal 2 | 50 | Low | Terminal-specific dining support term. |
| places to eat near heathrow terminal 3 | 50 | Low | Terminal-specific dining support term. |
| places to eat near heathrow terminal 4 | 50 | Low | Terminal-specific dining support term. |
| places to eat near heathrow terminal 5 | 50 | Low | T5 dining support term. |
| places to eat near terminal 5 | 50 | Medium | Useful T5 dining support term. |
| private hire ashford | 50 | Low | Private hire local modifier opportunity. |
| private hire staines | 50 | Unreported | Private hire local modifier opportunity. |
| pub food near heathrow | 50 | Low | Food-menu support term. |
| pubs near heathrow terminal 2 | 50 | Low | Terminal-specific pub support term. |
| pubs near heathrow terminal 3 | 50 | Low | Terminal-specific pub support term. |
| pubs near heathrow terminal 4 | 50 | Low | Terminal-specific pub support term. |
| pubs near heathrow terminal 5 | 50 | Low | Terminal-specific pub support term. |
| pub quiz ashford | 50 | Low | Quiz hub can include Ashford catchment naturally if accurate. |
| pub quiz staines | 50 | Low | Quiz hub should include Staines naturally. |
| restaurants near heathrow terminal 2 | 50 | Low | Terminal-specific restaurant support term. |
| restaurants near heathrow terminal 3 | 50 | Low | Terminal-specific restaurant support term. |
| roast dinner slough | 50 | Low | Sunday roast page can support Slough catchment if honest. |
| roast dinner staines | 50 | Low | Sunday roast page should support Staines roast dinner intent. |
| sunday roast near heathrow airport | 50 | Low | Exact airport-modified Sunday roast term. |
| sunday roast slough | 50 | Medium | Sunday roast page can support Slough catchment if honest. |
| venue hire ashford | 50 | Low | Private hire support term. |
| venue hire hounslow | 50 | Medium | Private hire support term if service area copy is honest. |
| venue hire slough | 50 | Medium | Private hire support term if service area copy is honest. |
| venue hire staines | 50 | Low | Private hire support term. |
| sunday roast staines | 50 | Medium | Sunday page or Staines support content should cover this. |

Keyword groups by known reported volume:

- Food/Heathrow discovery: about 13750 reported average monthly searches after the fourth pass.
- Hosted events/things-to-do discovery: about 162350 reported average monthly searches, driven mostly by localised "near me" event terms.
- Sunday roast/lunch: about 153350 reported average monthly searches, driven mostly by localised "near me" Sunday terms.
- Private hire: about 600 reported average monthly searches across local Staines/Ashford/Slough/Hounslow/Windsor function-room, hall, venue and private-hire terms. The value per lead makes this worth strong page investment even though each exact term is small.

Forecast files:

- May 2026 forecast total: 755.69 impressions, 23.96 clicks, GBP24.05 cost, 3.2% CTR, GBP1.00 average CPC, 1 forecast conversion, GBP40 CPA.
- Mobile dominates the forecast: 16.75 of 23.96 clicks, so mobile booking UX and tap targets matter.
- Second-pass May 2026 forecast total: 54253.76 impressions, 1701.49 clicks, GBP620.00 cost, 3.1% CTR, GBP0.36 average CPC, 100 forecast conversions, GBP6.18 CPA.
- Second-pass mobile forecast dominates: 1429.83 of 1701.49 clicks. This reinforces mobile-first booking, click-to-call, directions and event reservation UX.
- Third-pass May 2026 forecast is much smaller because it targeted very specific page variants: 48.01 impressions, 2.54 clicks, GBP2.94 cost, 5.3% CTR, GBP1.16 average CPC. This is useful for page-level nuance, not volume planning.
- Fourth-pass May 2026 forecast is also small because it targets specific terminal/catchment variants: 27.19 impressions, 1.69 clicks, GBP2.72 cost, 6.2% CTR, GBP1.61 average CPC. Use this for page copy nuance, not top-level prioritisation.

### Keyword Strategy Implications

1. Homepage should primarily target "pub near Heathrow" while supporting "food near Heathrow" and "restaurant near Heathrow".
2. `/restaurants-near-heathrow` should be treated as the main broad restaurant/places-to-eat airport-intent page, not the homepage. It should cover Heathrow airport plus Terminals 2, 3, 4 and 5 in one useful page rather than creating thin terminal pages.
3. `/food-menu` should target "food near Heathrow" and "pub food near Heathrow".
4. `/sunday-lunch` deserves more emphasis than the first pass suggested. "Sunday roast near me", "Sunday lunch near me" and "roast dinner near me" are huge localised searches, so the page needs excellent local SEO, mobile UX, photos, GBP alignment and booking flow.
5. Staines, Ashford, Slough and Windsor Sunday terms have enough signal to include honest service-area copy and internal links. Ashford and Windsor are stronger than Staines/Slough in the data for roast/carvery/roast-dinner terms. Do not create thin doorway pages unless there is unique local content.
6. Do not create thin exact-match private hire pages just because the business wants those enquiries. Use strong event-type/local pages with proof, packages, photos, capacity and FAQs.
7. Private hire should use Staines/Ashford/Slough/Hounslow/Windsor language more deliberately. Exact "near Heathrow" private-hire terms are sparse, but function-room and venue-hire variants have reported demand.
8. Hosted-event hubs are strongly justified. "Bingo near me", "karaoke near me", "live music near me", "pub quiz near me" and "quiz night near me" all show much larger demand than exact Heathrow variants. Ashford/Staines modifiers should be supporting copy, not separate thin pages at launch.
9. "Things to do near Heathrow" and "things to do in Staines" are upper-funnel opportunities. Use them to feed event bookings and food bookings, not as generic blog dead-ends.

### Keyword-To-Page Map

| Priority | Primary page | Primary keyword intent | Supporting terms | Page role |
|---|---|---|---|---|
| P1 | `/` | pub near heathrow | pubs near Heathrow airport, best pub near Heathrow, pubs near Heathrow Terminal 2/3/4/5, food near Heathrow, pub with parking near Heathrow | Commercial homepage and local trust hub. |
| P1 | `/restaurants-near-heathrow` | restaurant near heathrow | restaurants near Heathrow airport, restaurants near Heathrow Terminal 2/3/4/5, places to eat near Heathrow airport, places to eat near Terminal 2/3/4/5 | Broad discovery page for non-pub searchers. |
| P1 | `/food-menu` | food near heathrow | pub food near heathrow, places to eat near Terminal 5 | Menu and table-booking support. |
| P1 | `/sunday-lunch` | sunday roast near me | sunday lunch near me, roast dinner near me, sunday roast near Heathrow airport, sunday roast Staines/Ashford/Slough/Windsor, roast dinner Ashford/Staines/Slough/Windsor | Sunday roast conversion page and localised near-me target. |
| P1 | `/music-bingo` | music bingo near me | music bingo near Heathrow, pub events near Heathrow | Hosted-event evergreen hub. |
| P1 | `/cash-bingo` | bingo near me | cash bingo near me, bingo night near me, bingo night Staines | Hosted-event evergreen hub. |
| P1 | `/quiz-night` | pub quiz near me | quiz night near me, pub quiz Staines, pub quiz Ashford, pub quiz near Heathrow | Hosted-event evergreen hub. |
| P1 | `/private-hire` | private hire staines | private hire Ashford, function room hire Staines/Slough/Windsor, venue hire Staines/Ashford/Slough/Hounslow, party venue Staines, private hire near Heathrow | Commercial lead-gen hub. |
| P2 | `/karaoke` | karaoke near me | karaoke near Heathrow, pub events near Heathrow | Evergreen hub only if karaoke is active/recurring. |
| P2 | `/live-music` or existing equivalent | live music near me | live music near Heathrow, events near Heathrow | Evergreen hub only if live music is active/recurring. |
| P2 | `/things-to-do-near-heathrow` or existing equivalent | things to do near heathrow | events near Heathrow, pub events near Heathrow | Upper-funnel route into food and events. |
| P2 | `/things-to-do-in-staines` or existing equivalent | things to do in staines | pub events Staines, quiz night Staines, bingo night Staines | Upper-funnel route into events and food. |
| P2 | private hire subtype pages | wake/christening/birthday/corporate venue near Heathrow | event-type local variants | High-value long-tail lead capture. |

### Follow-Up Keyword Data Needed

The fourth export gives enough data to proceed with implementation. Another pass is optional and should only be used for competitor/comparison validation, not to decide the core site architecture.

No further keyword pass is needed before implementation. If a fifth pass is still desired, use it for competitor/comparison and "with parking" validation:

best restaurants near heathrow, best restaurants near heathrow terminal 5, best pubs near heathrow terminal 5, pub near heathrow with parking, restaurant near heathrow with parking, sunday roast near heathrow with parking, sunday lunch with parking near me, function room hire near heathrow with parking, cheap function room hire staines, pub function room hire staines, private dining room staines, pub venue hire staines, party room hire staines, wake venue with parking staines, christening venue with parking staines, event venue near heathrow with parking, hotel venue alternative heathrow, pub near sofitel terminal 5, pub near premier inn heathrow terminal 5, pub near heathrow hotels, restaurant near heathrow hotels, places to eat near heathrow hotels

## Executive Summary

The site already has a large SEO footprint and a strong local proposition: pub near Heathrow, free parking, Sunday food, private hire, events and community nights. The traffic opportunity is not just "add more pages." The bigger opportunity is to make the highest-value pages more consistent, more crawlable, more commercially focused and better connected.

The biggest current blockers are:

- Sunday roast messaging conflicts with itself before launch.
- Event times are displayed one hour late in parts of the booking journey during BST.
- Event pages mix table booking, ticket, cash-on-arrival and non-refundable policy language.
- `/whats-on` does not expose real event cards in initial visible HTML because client-side in-view logic renders skeletons first.
- Private hire capacity is inconsistent across pages and schema.
- Private hire quote and enquiry paths appear too late and ask for phone before enough booking context.
- Analytics names exist but are inconsistent with the commercial funnel and do not cover all starts/completions.
- Several dynamic components render weak "Loading..." or skeleton fallbacks instead of useful server-rendered content.

## Priority Model

Use this priority scale:

- P0: Revenue or trust blocker. Fix before further traffic expansion.
- P1: High-impact conversion and SEO improvement.
- P2: Growth, scale, measurement and technical hygiene.
- P3: Ongoing SEO compounding and governance.

## P0: Commercial Trust Blockers

### P0.1 Fix Event Time Handling Everywhere

Problem:

The management API appears to return event timestamps such as `2026-05-06T19:00+00:00` where the numeric clock time is intended to be UK local wall time. Some components correctly strip the timezone and display the local clock time. Other components parse with `new Date(...)` and then format in `Europe/London`, adding one hour during BST.

Confirmed local risk areas:

- `components/features/TableBooking/BookTableUpcomingEventsPanel.tsx`
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Any component that formats event dates directly with `new Date(event.startDate)` instead of the shared event helpers.

Required outcome:

All event widgets, event detail pages, booking forms, confirmation messaging and schema show one consistent UK local event time.

Implementation requirements:

- Create or standardise one event-time helper for management API event strings.
- Treat management event date strings as venue-local wall time unless the API contract is changed.
- Format display times explicitly for `Europe/London`.
- Use the same helper in:
  - Home event cards.
  - `/whats-on`.
  - Event detail pages.
  - `/book-table` upcoming events panel.
  - Table booking suggestions.
  - Event booking modules.
  - Confirmation emails/SMS, if controlled in this repo.
  - Event JSON-LD.
- Add a lintable convention or code comment near the helper: do not call `new Date(event.startDate)` directly for display.

Acceptance criteria:

- Quiz Night on 2026-05-06 displays 7:00 pm everywhere.
- Music Bingo on 2026-05-08 displays 8:00 pm everywhere.
- Cash Bingo on 2026-05-20 displays 7:00 pm everywhere.
- Tests cover dates in GMT and BST.
- Tests cover a management API timestamp that includes `+00:00` but should display as UK local wall time.

Suggested tests:

- Unit tests for the shared event date helper.
- Component test for `BookTableUpcomingEventsPanel`.
- Component or integration test for table booking event suggestions.

### P0.2 Fix Sunday Roast Availability Source Of Truth

Problem:

As of 2026-04-30, the site says both that Sunday roast is served every week and that Sunday lunch walk-ins start on 2026-05-17. This conflict appears across the Sunday page, homepage, booking context and launch announcement copy.

Confirmed local risk areas:

- `app/sunday-lunch/page.tsx`
- `app/page.tsx`
- `app/book-table/page.tsx`
- `components/announcements/LaunchAnnouncement.tsx`
- `components/psychology/RegretReduction.tsx`
- `lib/constants.ts`
- `lib/table-booking-service-windows.ts`
- `SSOT.json`
- Food menu and FAQ content.

Required outcome:

One date-aware Sunday roast truth across the site.

Pre-launch copy, valid until 2026-05-17:

> Sunday roast starts Sunday 17 May 2026. Until then, our normal Sunday menu is available.

Post-launch copy, valid from 2026-05-17:

> Sunday roast served Sundays, 1pm to 6pm. Walk in or book ahead. Groups of 10 or more need a GBP10 per person deposit, deducted from the bill.

Implementation requirements:

- Create a typed Sunday roast availability object in a shared content/config module.
- Include:
  - `launchDate`
  - `serviceDay`
  - `serviceStart`
  - `serviceEnd`
  - `smallPartyDepositRequired`
  - `largePartyDepositThreshold`
  - `largePartyDepositAmount`
  - `preLaunchMessage`
  - `postLaunchMessage`
- Consume this source in all Sunday-related UI, metadata, FAQs and schema.
- Remove hard-coded conflicting Sunday roast copy.
- Remove "Card only required for Sunday lunch" unless that is literally true for all Sunday lunch bookings.

Acceptance criteria:

- On 2026-04-30, no public page implies Sunday roast walk-ins are already live.
- On and after 2026-05-17, no public page says Sunday roast is still upcoming.
- `/sunday-lunch`, `/book-table`, homepage Sunday promos, food menu, FAQs and schema use consistent availability and deposit language.
- Jest tests cover pre-launch and post-launch rendering.

### P0.3 Clarify Event Booking Type And Payment Rules

Problem:

Event pages currently mix table booking, ticket, cash entry, pay-on-arrival and non-refundable policy language. This creates trust friction and can produce misleading structured data.

Examples:

- Quiz Night is presented as table booking and GBP3 cash entry, but policy language references non-refundable tickets.
- Cash Bingo says users buy a GBP10 bingo book on arrival, but also uses ticket cancellation language.

Required outcome:

Each event has exactly one booking model and one matching payment/cancellation policy.

Supported event booking models:

- `reserve_table_pay_entry_on_arrival`
- `reserve_table_pay_book_on_arrival`
- `buy_ticket_online`
- `free_entry_reserve_table`

Required fields per event:

- Event name.
- Event start and end time.
- Booking model.
- Entry price label.
- Payment timing.
- Payment method.
- Age restriction, if applicable.
- Cancellation policy.
- Food availability prompt.
- CTA label.

Copy patterns:

- Quiz Night: "Reserve your table online. Pay GBP3 cash entry per person on the night."
- Cash Bingo: "Reserve your table online. Buy your GBP10 bingo book on arrival. Players must be 18+."
- Music Bingo: "Reserve your table online. Pay any entry charge on arrival."

Implementation requirements:

- Store booking model metadata with the event, not as page-specific prose.
- Use booking model metadata in:
  - Event detail page copy.
  - Event CTA labels.
  - Event JSON-LD `offers`.
  - Booking flow labels.
  - Confirmation copy.
- Remove "tickets are non-refundable" unless the event actually sells online tickets.

Acceptance criteria:

- A visitor can answer in 10 seconds: what is the event, what does it cost and how do I book?
- Event schema offer URLs point to public booking/event pages, not management application URLs.
- No event with pay-on-arrival table reservation uses online ticket refund policy wording.

### P0.4 Server-Render Upcoming Events On `/whats-on`

Problem:

`/whats-on` fetches upcoming events server-side, but the visible event list is controlled by a client component that initially renders skeletons because `useInView` has not fired. The initial HTML contains schema and skeleton cards, but not useful visible event cards.

Confirmed local risk areas:

- `app/whats-on/page.tsx`
- `components/FilteredUpcomingEvents.tsx`
- `components/FilteredUpcomingEventsClient.tsx`
- `components/UpcomingEvents.tsx`

Required outcome:

The next 3 to 6 event cards are present as meaningful HTML before JavaScript runs.

Implementation requirements:

- Render a server component event list for the first page of events.
- Enhance with client-side filters and calendar controls after hydration.
- Do not hide the entire useful event list behind intersection observer state.
- Keep event schema in sync with visible event cards.

Acceptance criteria:

- `curl https://www.the-anchor.pub/whats-on` returns event card text including event name, date, time, price and CTA.
- With JavaScript disabled, users can click through to event detail pages.
- Skeletons may remain for enhanced UI, but not as the primary initial event content.

## Priority 1: Food And Sunday Lunch SEO

### P1.1 Completely Optimise The Homepage

Problem:

The homepage is doing too many jobs without a clear hierarchy. The current hero uses a seasonal greeting as the visible H1, with the stronger "pub near Heathrow" positioning pushed below the hero. Sunday roast, private hire and hosted events are present, but they compete with general Heathrow/traveller content, gallery content, broad feature blocks and a large footer-style link structure. This weakens both conversion focus and topical clarity.

Required outcome:

The homepage should become the strongest commercial doorway on the site: a fast, crawlable, locally relevant page that immediately routes visitors into food bookings, Sunday roast, private hire and hosted events while reinforcing the pub's defensible local proposition.

Primary homepage search intent:

- Pub near Heathrow.
- Pub near Heathrow Terminal 5.
- Pub with free parking near Heathrow.
- Food near Heathrow.
- Restaurant near Heathrow, as a supporting phrase only. The dedicated restaurant page should carry the broader restaurant comparison intent.
- Sunday roast near Heathrow.
- Pub events near Heathrow.
- Private hire venue near Heathrow.

Commercial goal:

- Make "Book a Table" the default action.
- Make "Book Sunday Roast" impossible to miss.
- Make "Private Hire" and "What's On" obvious secondary journeys.
- Keep Heathrow/free parking/traditional pub proof visible as reasons to choose The Anchor.

#### Current Homepage Issues To Address

- Hero H1 is seasonal and emotional, not search or conversion-led.
- Hero CTAs currently prioritise "Book a Table" and "View Menu"; Sunday roast, events and private hire are not visible enough in the first decision set.
- The clearer SEO title block appears below the hero instead of leading the page.
- Sunday roast copy currently conflicts with launch timing.
- The event module can show skeleton fallback instead of useful event content.
- Private hire appears late on the page.
- The Heathrow traveller section is useful but too dominant relative to the three stated business priorities.
- Some card structures are decorative and repeated, making the page longer without always increasing booking intent.
- Current private hire copy says "10-200 guests", which must align with the standard capacity model.
- Analytics should distinguish homepage pathways instead of treating all booking clicks as generic.

#### Recommended Homepage Order

1. Hero.
2. Priority path selector.
3. Sunday roast feature.
4. Today's food and table booking section.
5. Next hosted events.
6. Private hire enquiry strip.
7. Social proof and trust signals.
8. Heathrow/free parking/location proof.
9. Gallery with commercial captions.
10. FAQs.
11. Visit/contact section.
12. SEO internal links.

This order keeps the most profitable user journeys above the supporting travel content while preserving Heathrow relevance.

#### Hero Specification

Recommended H1:

> Proper pub food, Sunday roasts and events near Heathrow

Alternative H1 if brand-first testing is preferred:

> The Anchor Stanwell Moor - pub food, Sunday roasts and events near Heathrow

Supporting copy:

> Seven minutes from Heathrow Terminal 5 with free parking, traditional pub food, hosted nights and private hire for gatherings from small groups to full-venue events.

Pre-launch Sunday line, valid until 2026-05-17:

> Sunday roast starts Sunday 17 May 2026.

Post-launch Sunday line, valid from 2026-05-17:

> Sunday roast served Sundays, 1pm to 6pm.

Hero CTAs:

- Primary: "Book a Table" -> `/book-table?source=homepage_hero&bookingType=food`
- Secondary: "Book Sunday Roast" -> `/book-table?source=homepage_hero_sunday&bookingType=sunday_roast`
- Secondary: "See What's On" -> `/whats-on?source=homepage_hero`
- Tertiary text link: "Private Hire" -> `/private-hire?source=homepage_hero`

Hero proof points:

- 7 minutes from Heathrow Terminal 5.
- 20 free parking spaces.
- Food Tuesday to Sunday.
- Dog-friendly areas, if policy remains accurate.
- Rated 4.6/5 on Google, only if the rating is still current and compliant to display.

Technical requirements:

- Use a real venue/food image that reinforces the first action. Seasonal imagery can rotate, but the page must still look like a pub/food/events page in the first viewport.
- Keep image dimensions stable to protect LCP.
- Keep `StatusBar` useful but do not let a loading/opening-hours widget dominate the hero.
- Avoid hiding all commercial copy behind client-only components.

#### Priority Path Selector

Add immediately below the hero.

Heading:

> What are you here for?

Cards:

- "Food today"
  - Copy: "Pub classics, pizza and drinks minutes from Heathrow."
  - CTA: "Book a Table"
  - Link: `/book-table?source=homepage_path_food&bookingType=food`
- "Sunday roast"
  - Pre-launch copy: "Starts Sunday 17 May 2026."
  - Post-launch copy: "Served Sundays, 1pm to 6pm."
  - CTA: "Book Sunday Roast"
  - Link: `/book-table?source=homepage_path_sunday&bookingType=sunday_roast`
- "What's On"
  - Copy: "Quiz nights, music bingo, cash bingo and more."
  - CTA: "Reserve Event Table"
  - Link: `/whats-on?source=homepage_path_events`
- "Private hire"
  - Copy: "Parties, wakes, christenings and work events near Heathrow."
  - CTA: "Get Event Quote"
  - Link: `/private-hire?source=homepage_path_private_hire`

Requirements:

- Each card must have a descriptive heading and server-rendered link.
- Cards should not be nested inside another card container.
- On mobile, the first two cards must appear quickly after the hero.
- Card copy must use the shared Sunday and capacity source of truth.

#### Sunday Roast Homepage Feature

Purpose:

Make Sunday roast the most visible food upsell on the homepage.

Recommended content:

- Heading: "Sunday Roast Near Heathrow"
- Pre-launch body: "Sunday roast starts Sunday 17 May 2026. Book ahead for launch Sundays or join us for the normal Sunday menu until then."
- Post-launch body: "Proper roast dinners from GBP19, served Sundays from 1pm to 6pm. Walk in or book ahead."
- Proof points:
  - Free parking.
  - Vegan option.
  - Kids roast.
  - Seven minutes from Terminal 5.
  - Groups of 10+ deposit rule.
- CTAs:
  - "Book Sunday Roast"
  - "See Roast Menu"

Requirements:

- Use a real Sunday roast image near the top, not only in the later gallery.
- Do not duplicate the entire Sunday page. Use concise copy and link to `/sunday-lunch`.
- Use the shared Sunday source of truth for launch timing, service hours and deposit rules.

#### Food Today Section

Purpose:

Convert general pub/restaurant searches into table bookings while keeping Sunday roast distinct.

Recommended content:

- Heading: "Food and drinks minutes from Heathrow"
- Copy: "Stone-baked pizzas, pub classics, burgers, fish and chips and drinks with free parking."
- Include today's kitchen hours using a useful server-rendered fallback.
- CTAs:
  - "Book a Table"
  - "View Food Menu"
  - "Call 01753 682707"

SEO requirements:

- Link to `/food-menu`, `/pizza-menu`, `/burger-menu`, `/fish-and-chips-heathrow` only where useful.
- Keep "food near Heathrow" support copy natural and concise.

#### Hosted Events Homepage Section

Purpose:

Turn event discovery into bookings and improve internal link equity for event hubs.

Required content:

- Server-render the next 3 hosted events.
- Show event name, local date, local time, price/payment model and CTA.
- Add evergreen event hub links:
  - Quiz Night.
  - Music Bingo.
  - Cash Bingo.
  - Karaoke, if active.
- Use specific CTAs:
  - "Book quiz table."
  - "Book music bingo."
  - "Reserve bingo table."

Requirements:

- No skeleton-only event module in initial HTML.
- Use the shared event-time helper.
- Add a food-before-event prompt link where relevant.
- Track event clicks with event name, date and source `homepage_events`.

#### Private Hire Homepage Section

Purpose:

Private hire is a top-three business priority and should not be treated as a late-page extra.

Recommended content:

- Heading: "Private hire near Heathrow"
- Copy: "Function rooms, buffets and full-venue options for wakes, birthdays, christenings, corporate events and celebrations."
- Capacity line from shared model:
  - "Room bookings for 10 to 50 guests; larger events and full-venue hire by enquiry."
- Quick selector:
  - Birthday.
  - Wake.
  - Christening.
  - Corporate.
  - Other.
- CTAs:
  - "Get Event Quote"
  - "Check Date"
  - "Call 01753 682707"

Requirements:

- Place this before the long Heathrow traveller section.
- Do not use outdated "10-200 guests" copy.
- Link to `/private-hire` and key event-type pages.
- Track event type clicks from homepage.

#### Social Proof And Trust Section

Purpose:

Support booking decisions without overwhelming the page.

Recommended content:

- 3 to 5 short review snippets, grouped by priority:
  - Food/Sunday roast.
  - Private hire.
  - Events/community.
- Display source labels accurately.
- Avoid unsupported aggregate rating schema.

Requirements:

- Use real review snippets already present in the site's content/review system.
- Keep quotes short.
- Link to a review/contact section only if helpful.

#### Heathrow And Location Proof Section

Purpose:

Keep the strongest local SEO differentiator without letting travel content bury the business priorities.

Recommended content:

- "Seven minutes from Heathrow Terminal 5."
- "20 free parking spaces."
- Address.
- Travel times to terminals.
- Directions CTA.
- Mention plane-spotting/beer garden as supporting interest.

Requirements:

- Move this below the priority conversion sections.
- Keep internal links to Heathrow pages, but avoid turning the homepage into a long doorway page.
- Track directions clicks.

#### Gallery Requirements

The gallery should sell the three priorities:

- Sunday roast / food.
- Private hire room or event setup.
- Hosted event atmosphere.
- Beer garden/exterior/free parking only after the commercial images.

Requirements:

- Captions must reflect current availability and capacity source of truth.
- Images need descriptive alt text and stable dimensions.
- Avoid using the gallery as the only place Sunday roast is visually prominent.

#### Homepage FAQ Requirements

Refresh FAQs to match the three priorities:

- How do I book a table?
- When is Sunday roast served?
- Do I need to book Sunday roast?
- Is there free parking?
- How far is The Anchor from Heathrow Terminal 5?
- What events are on?
- Can I reserve a table for quiz or bingo?
- Do you offer private hire?
- How many guests can private hire accommodate?
- Can I call or WhatsApp to book?

Requirements:

- FAQ answers must use shared Sunday and capacity sources.
- Visible FAQ content must match FAQ schema exactly.
- Remove stale statements such as "Walk-ins are welcome for Sunday roast" before launch.

#### Homepage Metadata

Recommended title options:

- "Pub Near Heathrow T5 | Food, Sunday Roast & Events"
- "The Anchor Stanwell Moor | Pub Near Heathrow With Parking"

Recommended meta description:

> Traditional pub 7 minutes from Heathrow Terminal 5 with free parking, pub food, Sunday roast, hosted events and private hire. Book a table at The Anchor.

Requirements:

- Avoid double-branding from the sitewide title template.
- Open Graph image should be venue/food-led, not generic.
- Twitter metadata should match the refreshed priority proposition.

#### Homepage Schema

Required schema:

- `WebPage` for the homepage.
- Venue `LocalBusiness`/`Restaurant` reference.
- `WebSite`.
- `FAQPage`, only if visible FAQs are present.
- `ItemList` for priority journeys, if helpful.
- `Event` snippets only if visible next events are server-rendered and schema stays in sync.

Rules:

- Do not add aggregate rating markup unless compliant.
- Do not put stale Sunday availability in schema.
- Do not point action URLs to internal management URLs.

#### Homepage Analytics

Required events:

- Hero:
  - `book_table_click`
  - `sunday_roast_book_click`
  - `event_book_click`
  - `private_hire_enquiry_started`
- Priority path selector:
  - same event names with `source_page=homepage` and `cta_area=priority_path`
- Food section:
  - `book_table_click`
  - `menu_view`
  - `call_click`
- Events section:
  - `event_book_click` with event name/date.
- Private hire section:
  - `private_hire_enquiry_started`
  - `quote_tool_started`
- Location section:
  - `directions_click`
  - `call_click`
  - `whatsapp_click`

Required parameters:

- `page_path`
- `source_page`
- `cta_area`
- `cta_label`
- `booking_type`
- `event_name`
- `event_date`
- `event_type`
- `device_type`

#### Homepage Performance And UX Requirements

- Preserve or improve LCP after hero image changes.
- Keep CLS low with fixed image dimensions and stable CTA/card sizes.
- Make all priority CTAs visible and tappable on mobile.
- Do not use decorative cards inside cards.
- Do not allow loading widgets to shift layout.
- Keep copy short enough for mobile cards.
- Ensure colour contrast passes for CTA and overlay text.
- Verify desktop and mobile screenshots.

#### Homepage Acceptance Criteria

- One clear H1 reflects pub/food/events near Heathrow intent.
- First viewport includes food booking and at least one direct Sunday/events/private-hire path.
- Sunday copy is correct for the current date.
- Next event content appears in initial HTML.
- Private hire appears before the long Heathrow traveller section.
- All homepage CTAs have source parameters and analytics.
- Homepage links to `/book-table`, `/sunday-lunch`, `/whats-on`, `/private-hire`, `/food-menu` and key event hubs with descriptive anchor text.
- FAQ/schema/copy are consistent.
- Lighthouse or equivalent checks show no regression in LCP/CLS/accessibility.

### P1.2 Make `/sunday-lunch` The Canonical Sunday Roast Landing Page

Primary target intent:

- Sunday roast near Heathrow.
- Sunday lunch near Heathrow.
- Sunday roast Stanwell Moor.
- Pub Sunday lunch near Heathrow Terminal 5.

Required page changes:

- Resolve availability conflict using shared Sunday roast source of truth.
- Move one strong food image closer to the top.
- Add a compact booking panel near the top:
  - Date.
  - Time.
  - Party size.
  - Dietary notes link or field.
  - "Book Sunday Roast" CTA.
- Add a sticky mobile CTA:
  - "Book Sunday Roast"
  - "Call 01753 682707"
- Make group deposit rules clear:
  - No deposit for small tables, if true.
  - Groups of 10 or more pay GBP10pp, deducted from the bill.
- Add "Add to your roast" upsell content:
  - Cauliflower cheese.
  - Extra Yorkshire pudding.
  - Pigs in blankets.
  - Dessert.
  - Kids roast.
  - Drinks package for groups.

SEO content requirements:

- Keep Heathrow proximity as support, not the only message.
- Add concise sections for:
  - Families.
  - Dogs, if allowed in relevant areas.
  - Vegan option.
  - Kids roast.
  - Free parking.
  - Terminal 5/later flight use case.
- Add FAQ entries that answer real queries:
  - Do I need to book Sunday roast?
  - What time is Sunday roast served?
  - Do you take walk-ins?
  - Is there a vegan Sunday roast?
  - Is there a kids Sunday roast?
  - Is there parking?
  - How far are you from Heathrow Terminal 5?

Structured data requirements:

- Use `Restaurant`/`FoodEstablishment` page schema.
- Use date-aware Sunday opening/serving information.
- Do not use stale offer availability.
- Include menu URL and reservation URL.

Acceptance criteria:

- Page title and H1 clearly target Sunday roast near Heathrow.
- Booking CTA includes source context so the booking flow knows the user came for Sunday roast.
- Copy is internally consistent before and after launch.

### P1.3 Add Sunday Context To The Booking Flow

Problem:

Sunday roast users are sent into a generic table booking journey.

Required outcome:

Users who enter from `/sunday-lunch` should see Sunday-specific context and the pub should receive Sunday-specific booking intent.

Implementation requirements:

- Add source query support, for example `/book-table?source=sunday_lunch&bookingType=sunday_roast`.
- Preselect or label booking type as Sunday roast.
- Show Sunday serving hours and deposit rules.
- Add a note to booking submission:
  - "Customer entered from Sunday roast page."
- Let the user add dietary notes before final submission.

Out of current scope:

- Do not collect dish pre-orders in the public booking flow.
- Do not ask users to preselect roast choices or extras until the kitchen explicitly wants that workflow.

Acceptance criteria:

- Sunday users do not have to infer that the generic booking form is for roast.
- Booking analytics can distinguish Sunday roast bookings from normal table bookings.

### P1.4 Build A Sunday Lunch Internal Link Cluster

Problem:

The site has many food and Heathrow pages, but Sunday roast should receive more deliberate internal links.

Required internal links:

- Homepage to `/sunday-lunch`.
- `/food-menu` to `/sunday-lunch`.
- `/restaurants-near-heathrow` to `/sunday-lunch`.
- `/heathrow-family-dining` to `/sunday-lunch`.
- `/dog-friendly-pub-heathrow` to `/sunday-lunch`, if dog policy supports it.
- Event pages to `/sunday-lunch` where relevant.
- Footer priority links to `/sunday-lunch`.

Anchor text examples:

- "Sunday roast near Heathrow"
- "Sunday lunch at The Anchor"
- "Book Sunday roast"

Avoid:

- Generic "click here."
- Dozens of repeated exact-match anchors in the same page.

### P1.5 Food Menu And Search Intent Cleanup

Problem:

The site has several food pages. These can help traffic, but they can also cannibalise if every page targets the same generic restaurant intent.

Required outcome:

Each food page should own a clear search intent.

Recommended mapping:

- `/food-menu`: broad food menu and dining at The Anchor.
- `/sunday-lunch`: Sunday roast and Sunday lunch near Heathrow.
- `/pizza-menu`: pizza and event-night food.
- `/burger-menu`: burgers near Heathrow / pub burgers.
- `/fish-and-chips-heathrow`: fish and chips near Heathrow.
- `/restaurants-near-heathrow`: broader discovery page for people searching restaurants near Heathrow, with The Anchor as the answer.
- `/heathrow-layover-dining`: travel-use-case page for layovers.

Acceptance criteria:

- No two food pages have near-identical title tags or H1s.
- Each page links to the more specific page when users need Sunday roast, pizza, burgers or fish and chips.
- Menu item copy is not duplicated in full across every page.

## Priority 2: Private Hire SEO And Conversion

### P1.6 Standardise Private Hire Capacity Everywhere

Problem:

The private hire page says 10-50 guests. Venue space data supports much larger capacities. `/whats-on` references 10-200 guests. Schema currently caps private hire at 50 in places.

Required outcome:

Use one capacity model site-wide.

Recommended model:

- Dining room: up to 26 seated, 50 standing.
- Main area: up to 29 seated, 150 standing.
- Garden/terrace: up to 64 seated, 250 standing.
- Entire pub: up to 119 seated, 300 standing.
- Recommended standard private hire range: 10 to 50 for normal room bookings.
- Larger events: available by special enquiry.

Implementation requirements:

- Create shared private hire capacity config.
- Use it in:
  - `/private-hire`.
  - `/function-room-hire`.
  - private hire subtype pages.
  - `/whats-on` private events section.
  - quote calculator.
  - venue spaces table.
  - schema.
  - FAQs.

Acceptance criteria:

- No page says only 10-50 if larger spaces are intentionally sold.
- No page says 10-200 if 300 standing buyout is a valid offer.
- Schema reflects the relevant page: room pages can have room-specific capacities; whole-venue pages can show the full capacity.

### P1.7 Move Private Hire Quote And Enquiry Higher

Problem:

The instant quote and availability section appears too far down the private hire page. High-intent users should not have to pass package detail, comparison content, room photos and testimonials first.

Required page order:

1. Hero.
2. Quick enquiry form or event-type selector.
3. Short "from" pricing and capacity cards.
4. Instant quote/check availability.
5. Package cards.
6. Photos.
7. Venue comparison.
8. Testimonials.
9. FAQ.
10. Final CTA.

Required mobile sticky CTA:

- "Check date"
- "Get quote"
- "Call"

Acceptance criteria:

- Quote/enquiry path is visible within the first two mobile scrolls.
- Users can start with event type before entering phone number.
- Quote tool start and completion are tracked.

### P1.8 Improve Private Hire Form Intent Capture

Problem:

The private hire form asks for mobile lookup before enough event context. This is operationally useful, but it creates front-end friction and weakens intent capture.

Required flow:

1. Event type.
2. Date or rough month.
3. Guest count.
4. Space preference or "not sure."
5. Package interest.
6. Name, email, phone.
7. Notes.
8. Submit.

Event type options:

- Birthday.
- Wake.
- Christening.
- Corporate.
- Baby shower.
- Retirement.
- Christmas party.
- Other.

Operational output:

- Email subject format: `Private hire enquiry: Wake, 35 guests, 12 June`.
- CRM or booking payload includes event type, guest count, preferred date and package interest.

Acceptance criteria:

- Visitor can express the event before providing contact details.
- The pub receives enough information to respond without unnecessary back-and-forth.

### P1.9 Make Private Hire Packages Easier To Compare

Problem:

Package content is valuable but dense. It needs to work as both conversion content and SEO content.

Required layout:

- Use responsive cards or a clean comparison table.
- Each package includes:
  - Name.
  - Price.
  - Best for.
  - What's included.
  - Minimum numbers, if relevant.
  - CTA: "Add to quote."

Required package schema/content:

- Use `Offer` or service-like schema where appropriate.
- Keep prices machine-readable if stable.
- Link each package to quote calculator state if technically practical.

Acceptance criteria:

- On mobile, users can compare package name, price and best-for without reading long paragraphs.
- "Add to quote" changes quote tool state or scrolls to the quote tool with context.

### P1.10 Strengthen Private Hire SEO Pages

Current opportunity:

The site already has many private hire pages. These should be treated as a structured cluster, not isolated landing pages.

Recommended core pages:

- `/private-hire`: main private hire near Heathrow page.
- `/function-room-hire`: function room hire near Heathrow.
- `/private-hire/wake-venue-near-heathrow`: wakes.
- `/private-hire/birthday-party-venue-near-heathrow`: birthdays.
- `/private-hire/christening-venue-near-heathrow`: christenings.
- `/private-hire/corporate-events-near-heathrow`: corporate events.
- `/christmas-parties`, if seasonal and maintained.

For each page:

- Make the target event type explicit in title, H1 and opening copy.
- Include relevant packages and room recommendations.
- Include testimonials for that event type where possible.
- Include FAQs specific to the event type.
- Include a short "Why The Anchor instead of a hotel?" comparison.
- Include internal links back to `/private-hire` and sideways to related event types.

Local SEO modifiers to use naturally:

- Heathrow.
- Heathrow Terminal 5.
- Stanwell Moor.
- Stanwell.
- Staines.
- Ashford.
- Wraysbury.
- Colnbrook.
- Slough, only where relevant.

Avoid:

- Doorway-style pages that differ only by place name.
- Thin pages with generic private hire copy.

## Priority 3: Hosted Events SEO And Conversion

### P1.11 Build Evergreen Hosted Event Hubs

Problem:

Individual event instance pages can rank temporarily, but evergreen pages can capture recurring local searches.

Required evergreen pages:

- `/quiz-night`
- `/music-bingo`
- `/cash-bingo`
- `/karaoke`
- `/live-music`, if live music is a regular offer

Each evergreen page should include:

- What the night is.
- Usual day/time.
- Cost/payment method.
- Whether it is table booking, ticketed or pay-on-arrival.
- Food availability.
- Next event card.
- CTA to reserve.
- FAQs.
- Internal links to current event instances.

Primary search intents:

- Pub quiz near Heathrow.
- Quiz night near Staines.
- Music bingo near Heathrow.
- Cash bingo near me.
- Bingo night near Staines.
- Karaoke near Heathrow.

Acceptance criteria:

- Evergreen hubs rank for recurring searches even when a dated event page expires.
- Event instance pages link back to their evergreen hub.
- Evergreen hub links to the next available event detail page.

### P1.12 Improve Event Detail Pages

Every event detail page must answer three questions immediately:

1. What is it?
2. What does it cost?
3. How do I book?

Required above-fold content:

- Event name.
- Date.
- Start time and recommended arrival time.
- Price.
- Payment method.
- Booking model label.
- CTA.

Required CTA labels:

- Quiz: "Book quiz table."
- Music bingo: "Book music bingo."
- Cash bingo: "Reserve bingo table."
- Generic hosted event: "Reserve event table."

Required booking flow:

1. Select event.
2. Select party size.
3. See price and rules.
4. Choose table/time, if needed.
5. Enter name, mobile and email.
6. Confirm.

Remove:

- Duplicate booking modules on the same page unless one is purely a sticky summary.
- Mobile-number-first booking as the first visible step.
- Ticket/refund policy wording on non-ticket events.

Acceptance criteria:

- Event pages do not ask for mobile before the user understands what they are booking.
- Event page schema matches event page copy.
- Event CTAs are tracked with event name and date.

### P1.13 Add Food Upsells To Hosted Events

Problem:

Event pages mention food, but the booking path does not actively sell pre-event food.

Required prompt:

> Want to eat before the event?

Options:

- Planning to eat before the event.
- Event or drinks only.

Do not collect food pre-orders, pizza notes, or group food-order details in the event booking flow at this stage. Food should be promoted as an arrive-early/on-the-night order, not as a kitchen pre-order commitment.

Suggested event-specific copy:

- Quiz and cash bingo: "Arrive from 6pm for food. Event starts at 7pm."
- Music Bingo: "Arrive from 6:30pm for food. Music Bingo starts at 8pm."

Acceptance criteria:

- Event bookings can capture lightweight dining intent without collecting pre-orders.
- Event confirmation mentions food timing.
- Analytics can segment event bookings with and without food intent.

### P1.14 Event Schema Cleanup

Problem:

Live event JSON-LD includes useful event schema, but offer and action URLs can point to management URLs or generic booking targets. Policy copy can also conflict with actual payment model.

Required schema rules:

- `Event.startDate` and `Event.endDate` should reflect the true UK-local event time with a valid timezone offset.
- `Event.location` should reference the venue entity.
- `Event.organizer` should be The Anchor, not the management application.
- `offers.url` should be a public canonical event URL or public booking anchor.
- `offers.availability` should match actual availability, if known.
- `offers.price` should match the actual payment model:
  - GBP3 entry on arrival can be represented clearly, but do not imply online sale if not sold online.
  - For bingo book purchase on arrival, make payment timing clear in visible copy and avoid misleading online ticket markup.
- Remove refund policy fields when there is no online ticket sale.

Acceptance criteria:

- Rich Results Test validates Event schema.
- Event schema and visible page copy do not contradict each other.

## Technical SEO Platform Work

### P2.1 Replace Weak Dynamic Fallbacks

Problem:

Multiple dynamic modules render "Loading..." or skeleton placeholders in server output. This is bad for no-JS users, accessibility and crawler confidence.

Audit these modules:

- Opening hours/status.
- Event cards.
- Booking widgets.
- Hero badges.
- Maps.
- Availability tools.
- Quote calculators.

Replacement patterns:

- Opening hours: server-render today's known hours or a useful contact fallback.
- Events: server-render next events.
- Quote calculator: server-render package "from" pricing and basic enquiry CTA.
- Maps: include address, directions link and parking text before JS map enhancement.

Acceptance criteria:

- No priority page has "Loading..." near the top of initial HTML unless paired with useful fallback content.
- Core commercial content exists without JavaScript.

### P2.2 Title, H1 And Metadata Cleanup

Problem:

The site has many pages and prior docs suggest a large number of title tags may be too long or duplicated. The root layout also appends brand text, while some page titles already include the brand.

Required outcome:

Each priority page should have a concise, unique title and H1.

Rules:

- Title length target: roughly 45 to 65 characters where possible.
- Put the main query first.
- Avoid double-branding such as "The Anchor ... | The Anchor Stanwell Moor" unless intentional.
- Use one visible H1 per page.
- Match H1 to page intent, not generic brand copy.

Priority pages to audit first:

- `/`
- `/sunday-lunch`
- `/food-menu`
- `/book-table`
- `/private-hire`
- `/function-room-hire`
- `/whats-on`
- `/quiz-night`
- `/music-bingo`
- `/cash-bingo`
- top private hire subtype pages
- top Heathrow/location pages

Acceptance criteria:

- Export a title/H1 inventory.
- Fix duplicated, overlong or cannibalising titles.
- Keep the sitewide title template from causing duplicate brand suffixes.

### P2.3 Sitemap And Lastmod Accuracy

Current status:

Local sitemap generation appears better than older docs suggest. Static pages and many dynamic pages are included. However, many `lastmod` values appear static or content-derived in ways that may not reflect real content changes.

Required work:

- Keep `/sitemap.xml` generated from real route inventory.
- Use accurate `lastModified` values where available:
  - content file update date.
  - event updated date.
  - package/offer update date.
  - fallback deploy date only when necessary.
- Include active event pages.
- Decide what happens to expired event pages:
  - keep if they have useful recurring content and noindex/archive them when stale, or
  - redirect to evergreen hub after a defined period.

Acceptance criteria:

- All indexable commercial pages are present in sitemap.
- Non-indexable API/admin/internal routes are absent.
- Expired events follow a documented canonical/noindex/redirect policy.

### P2.4 Robots And AI Crawler Policy

Current live observation:

`/robots.txt` includes Cloudflare Managed content that blocks several AI crawlers while allowing normal search crawlers. This may be intentional. It should be a business decision, not an accidental default.

Required decision:

- If the site wants visibility in AI answer engines, review whether blocking AI crawlers conflicts with that goal.
- If the site wants strict content control, keep the blocks but document the tradeoff.
- Preserve normal search engine crawl access.

Acceptance criteria:

- Robots policy is documented.
- Search-critical assets remain crawlable.
- Any AI crawler allow/block decision is intentional.

### P2.5 Redirect And Canonical Hygiene

Current live observation:

The apex HTTP path redirects through more than one hop before reaching `https://www.the-anchor.pub/`.

Required work:

- Prefer one-hop canonical redirects where hosting allows.
- Ensure all public pages self-canonical to the preferred `www` HTTPS URL.
- Ensure alternate URL variants do not index separately:
  - http.
  - apex.
  - trailing slash variants.
  - query-only booking state URLs.

Acceptance criteria:

- Main domain variants resolve to canonical URL with minimal hops.
- Canonicals are present on priority pages.
- Booking query parameters do not create indexable duplicates.

### P2.6 Image SEO And Performance

Required work:

- Prioritise real food, room and event images over generic atmospheric imagery.
- Add descriptive filenames for new assets.
- Add alt text that describes the image and supports page intent naturally.
- Ensure above-fold images have stable dimensions.
- Use modern responsive image settings.
- Keep large animated assets out of priority landing pages unless they materially help conversion.

Priority images:

- Sunday roast hero/near-top image.
- Private hire room photos.
- Event night photos.
- Food/package images.
- Exterior/free parking image for Heathrow intent.

Acceptance criteria:

- Priority pages pass basic image dimension and LCP checks.
- Image alt text is useful but not keyword-stuffed.

### P2.7 Structured Data Governance

Required schema inventory:

- `LocalBusiness` / `Restaurant` for the venue.
- `WebSite`.
- `WebPage`.
- `Menu` / menu URLs where appropriate.
- `Event` for hosted events.
- `FAQPage` only when visible FAQs are present.
- `Offer` for packages/prices where stable.
- `Place`/`EventVenue` style markup where valid for private hire pages.

Rules:

- Schema must match visible content.
- Do not add review aggregate ratings unless compliant with Google policy and backed by eligible first-party review display.
- Do not point public schema actions to internal management URLs.
- Use stable `@id` references for the business and venue.

Acceptance criteria:

- Rich Results Test passes for Sunday lunch, private hire and event pages.
- Schema does not contradict booking/payment copy.

## Analytics And Measurement

### P1.15 Standardise Commercial Event Tracking

Problem:

Tracking exists but naming is inconsistent and does not fully cover starts/completions across the priority journeys.

Required event names:

- `book_table_click`
- `sunday_roast_book_click`
- `sunday_roast_booking_started`
- `sunday_roast_booking_completed`
- `event_book_click`
- `event_booking_started`
- `event_booking_completed`
- `private_hire_enquiry_started`
- `private_hire_enquiry_submitted`
- `quote_tool_started`
- `quote_tool_completed`
- `call_click`
- `whatsapp_click`
- `email_click`
- `menu_view`
- `directions_click`

Required parameters:

- `page_path`
- `source_page`
- `cta_label`
- `booking_type`
- `event_name`
- `event_date`
- `party_size`
- `device_type`
- `destination_url`
- `form_step`
- `value`, where meaningful.
- `currency`, where meaningful.

Implementation requirements:

- Keep backward-compatible aliases for existing event names where dashboards already depend on them.
- Track clicks and successful submissions separately.
- Track starts when a user first engages with a form or quote tool, not only on submit.
- Wrap raw phone, email, WhatsApp and directions links with tracking components.
- Add source parameters to internal booking CTAs.

Acceptance criteria:

- GA4 DebugView shows every priority action.
- Bookings can be segmented by food, Sunday roast, hosted event and private hire.
- Event booking completion can be attributed to event name and date.
- Private hire enquiries can be attributed to event type and guest count.

### P2.8 Search Console And GBP Measurement

Required setup:

- Create GSC query/page reports for:
  - Sunday roast.
  - Private hire/function room.
  - Pub quiz/music bingo/cash bingo.
  - Pub near Heathrow/free parking.
  - Restaurants near Heathrow.
- Add UTM parameters to Google Business Profile links:
  - website.
  - booking.
  - menu.
  - directions, if supported.
- Track GBP calls separately where possible.

Acceptance criteria:

- Monthly SEO report shows impressions, clicks, CTR and average position by business priority.
- GBP interactions are separated from organic website sessions where possible.

## Content Growth Opportunities

### P2.9 Sunday Roast Content Expansion

High-value content opportunities:

- Sunday roast near me / Sunday lunch near me, captured through local SEO, GBP alignment and location proof rather than awkward exact-match copy.
- Roast dinner near me, captured through Sunday roast copy and menu schema.
- Sunday roast near Heathrow Terminal 5.
- Family Sunday lunch near Heathrow.
- Dog-friendly Sunday lunch near Heathrow, if policy supports it.
- Vegan Sunday roast near Heathrow.
- Sunday lunch with free parking near Heathrow.
- Sunday roast near Staines / Ashford / Slough / Windsor / Stanwell, only if pages are genuinely useful and locally differentiated.
- Roast dinner Ashford / Windsor / Staines / Slough as support language on the Sunday page and local FAQs.
- Carvery Ashford / carvery Staines as competitor-language support only. Do not call The Anchor a carvery unless the service model is actually carvery-style.

Recommended approach:

- Strengthen `/sunday-lunch` first.
- Add supporting FAQ/content blocks to existing relevant pages.
- Only create new location pages if there is enough unique local value to avoid doorway-page risk.

### P2.10 Private Hire Content Expansion

High-value content opportunities:

- Function room hire near Heathrow with prices.
- Function room hire Staines / Slough / Windsor.
- Venue hire Staines / Ashford / Slough / Hounslow.
- Hall hire Staines / Ashford, used as comparison language if The Anchor is not literally a hall.
- Private hire Staines / Ashford.
- Wake venue near Heathrow with parking.
- Birthday party venue near Heathrow.
- Christening venue near Heathrow.
- Baby shower venue near Heathrow.
- Corporate event venue near Heathrow Terminal 5.
- Small party venue near Staines.
- Pub garden hire near Heathrow, if the garden/terrace is a major offer.

Required content features:

- Capacity.
- Pricing.
- Packages.
- Parking.
- Photos.
- Event-specific FAQs.
- Enquiry CTA.
- Testimonials relevant to the event type.

### P2.11 Hosted Event Content Expansion

High-value content opportunities:

- Pub quiz near me.
- Quiz night near me.
- Pub quiz near Heathrow.
- Quiz night near Staines.
- Pub quiz Ashford / quiz night Ashford, if the venue can honestly serve that catchment.
- Bingo near me.
- Bingo night near me.
- Bingo Ashford, if the venue can honestly serve that catchment.
- Music bingo near Heathrow.
- Cash bingo near Heathrow.
- Bingo night near Staines.
- Karaoke near me, only if karaoke remains recurring.
- Karaoke Staines, only if karaoke remains recurring.
- Live music near me, only if live music is genuinely recurring.
- Live music Staines, only if live music is genuinely recurring.
- Things to do in Staines.
- Events near Ashford.
- Things to do near Heathrow in the evening.
- Food before quiz night near Heathrow.
- Pub events near Heathrow with free parking.

Recommended approach:

- Use evergreen hubs for recurring events.
- Use event detail pages for specific dates.
- Link date pages back to evergreen hubs.
- Add post-event photos or recap content only when it helps future bookings.

### P2.12 Travel And Local Intent Content

The Anchor has a defensible Heathrow proposition. Build content around useful visitor situations, not just keywords.

Opportunities:

- Where to eat near Heathrow Terminal 5 with free parking.
- Restaurants and pubs near Heathrow Terminals 2, 3, 4 and 5, handled as sections on a single useful Heathrow dining page.
- Pub near Heathrow for layovers.
- Family meal near Heathrow before a flight.
- Place to eat near Heathrow after hotel check-in.
- Dog-friendly pub near Heathrow.
- Pub with parking near Heathrow.

Rules:

- Each page must have a distinct user situation.
- Link to the appropriate conversion path: food booking, Sunday roast, private hire or events.
- Avoid repeating the same generic pub description across pages.

## Navigation And Internal Linking

### P2.13 Simplify Conversion Navigation

Problem:

The site has a large navigation/footer structure. This helps discovery, but the commercial paths should be more prominent.

Recommended desktop header:

- Food & Drink.
- Sunday Roast.
- What's On.
- Private Hire.
- Visit Us.
- Primary button: Book a Table.

Recommended sticky mobile nav:

- Book Table.
- Sunday Roast.
- Events.
- Private Hire.
- Call.

CTA label standards:

- Food: "Book a Table"
- Sunday roast: "Book Sunday Roast"
- Hosted events: "Reserve Event Table"
- Private hire: "Get Event Quote"
- Phone: "Call 01753 682707"
- WhatsApp: "WhatsApp Us"

Acceptance criteria:

- Users can reach each business-priority path from every page.
- Footer can keep broader SEO links, but header/mobile navigation remains focused.

## Recommended Implementation Tickets

### Ticket 1: Event Time Normalisation

Priority: P0

Files likely touched:

- `lib/time-london.ts`
- `lib/event-calendar.ts`
- `lib/api/events.ts`
- `components/features/TableBooking/BookTableUpcomingEventsPanel.tsx`
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- event display components and tests.

Acceptance criteria:

- All event surfaces show the same UK local time.
- BST and GMT tests pass.

### Ticket 2: Sunday Roast Source Of Truth

Priority: P0

Files likely touched:

- shared content/config module.
- `app/sunday-lunch/page.tsx`
- `app/page.tsx`
- `app/book-table/page.tsx`
- `components/announcements/LaunchAnnouncement.tsx`
- `components/psychology/RegretReduction.tsx`
- food menu and FAQ components.

Acceptance criteria:

- No conflicting pre-launch/post-launch copy.
- Deposit language is consistent.

### Ticket 3: Event Booking Model Cleanup

Priority: P0

Files likely touched:

- event API mapping.
- event detail page.
- event booking form.
- event schema generation.

Acceptance criteria:

- Each event has one booking model and matching payment/policy copy.

### Ticket 4: Server-Rendered What's On Event Cards

Priority: P0

Files likely touched:

- `app/whats-on/page.tsx`
- `components/FilteredUpcomingEvents.tsx`
- `components/FilteredUpcomingEventsClient.tsx`
- `components/UpcomingEvents.tsx`

Acceptance criteria:

- Initial HTML includes visible event cards.
- Client filtering enhances without replacing baseline content.

### Ticket 5: Complete Homepage Optimisation

Priority: P1

Files likely touched:

- `app/page.tsx`
- homepage section components, if split out.
- CTA/link components.
- analytics helpers.
- schema helpers.
- shared Sunday roast and private hire config.

Acceptance criteria:

- Homepage has one search-led H1 and a commercial first viewport.
- Above-fold homepage links to food, Sunday roast, events and private hire.
- Priority path selector appears immediately after the hero.
- Sunday roast, next events and private hire all appear before the long Heathrow traveller section.
- Next event cards are server-rendered.
- All homepage copy uses shared Sunday availability and private hire capacity sources.
- Homepage metadata, schema, FAQs, internal links and analytics match the refreshed structure.
- Mobile and desktop screenshots show no overlapping text, layout shift or hidden priority CTA.

### Ticket 6: Sunday Booking Context And Upsells

Priority: P1

Files likely touched:

- Sunday page.
- table booking flow.
- booking payload helpers.
- analytics helpers.

Acceptance criteria:

- Sunday bookings are identifiable and can capture food/dietary intent.

### Ticket 7: Private Hire Capacity And Schema Model

Priority: P1

Files likely touched:

- shared private hire capacity config.
- `app/private-hire/page.tsx`
- private hire subtype pages.
- `components/features/VenueSpacesTable.tsx`
- `components/PrivateBookingCalculator.tsx`
- schema modules.

Acceptance criteria:

- Capacity is consistent across public copy, quote tool and schema.

### Ticket 8: Private Hire Quote Above The Fold

Priority: P1

Files likely touched:

- `app/private-hire/page.tsx`
- `components/PrivateBookingSection.tsx`
- `components/PrivateBookingInquiryForm.tsx`
- `components/PrivateBookingCalculator.tsx`

Acceptance criteria:

- Users can start with event type, date and guest count before phone lookup.
- Quote/enquiry appears near top.

### Ticket 9: Analytics Taxonomy

Priority: P1

Files likely touched:

- `lib/gtm-events.ts`
- booking buttons and forms.
- phone/email/WhatsApp/directions/menu link components.

Acceptance criteria:

- All required commercial events fire with required parameters.

### Ticket 10: Metadata And Page Intent Audit

Priority: P2

Files likely touched:

- `app/**/page.tsx`
- metadata helpers.
- sitemap generation if needed.

Acceptance criteria:

- Priority pages have unique, concise titles and H1s.
- Cannibalising pages are merged, retargeted or internally linked.

### Ticket 11: Loading Fallback Audit

Priority: P2

Files likely touched:

- dynamic status components.
- events components.
- booking widgets.
- quote tools.
- maps components.

Acceptance criteria:

- Priority pages have useful server-rendered fallback content.

### Ticket 12: Content Cluster Refresh

Priority: P2

Files likely touched:

- `content/`
- page routes for Sunday, private hire, events and Heathrow intent.

Acceptance criteria:

- Each priority cluster has a clear hub, supporting pages and internal links.

## Validation Checklist

Before release:

- Run `npm run lint`.
- Run `npm run test`.
- Run targeted event time tests for BST and GMT.
- Run `npm run build`.
- Inspect no-JS or curl output for:
  - `/`
  - `/sunday-lunch`
  - `/private-hire`
  - `/whats-on`
  - one quiz event page.
  - one cash bingo event page.
- Validate structured data for:
  - homepage.
  - Sunday lunch.
  - private hire.
  - quiz event.
  - cash bingo event.
- Check GA4 DebugView for all commercial events.
- Check live redirects and canonicals.
- Submit updated sitemap in Google Search Console if major URL/indexing changes ship.

## Definition Of Done

This work is done when:

- Sunday roast messaging is consistent and date-aware.
- Event times are correct everywhere during BST and GMT.
- Event pages use clear booking/payment models.
- `/whats-on` exposes real event content without JavaScript.
- Private hire capacity is consistent and quote/enquiry routes appear near the top.
- Hosted event bookings actively offer food.
- Analytics covers every booking, enquiry, call, WhatsApp, email, directions and menu action.
- Priority SEO pages have unique intent, clean metadata, strong internal links and valid schema.
- Search Console/GA4 reporting can show whether the three business priorities are growing.
