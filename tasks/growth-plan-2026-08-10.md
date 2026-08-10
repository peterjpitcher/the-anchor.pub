# Search Growth Plan, 10 August 2026

Goal: restart impression growth and convert it into bookings. Built from 16-month and 28-day GSC exports, 3-month page-level GSC exports, GBP performance (Mar to Aug 2026) and GA4 (last 90 days), all reviewed 10 Aug 2026.

## 1. Where we are

**Trend.** Impressions per day: May 2,386 → Jun 2,642 → Jul 3,462 → Aug (to the 8th) 3,477. Strong growth March to July, flat since mid-July. Clicks grew from 950/mo (Mar) to 3,079/mo (Jul); CTR improved 2.12% → 2.87%.

**Concentration.** The plane-spotting cluster (blog post + page) is ~27% of impressions and ~45% of clicks. Roughly 100k of 910k 16-month impressions are US-based (non-bookers). The site's traffic engine is Heathrow informational content, not booking-intent content.

**Christmas (the big miss).** Last 28 days: 70 Christmas queries, 6,167 impressions, 0 clicks. Page-level (3 months): /christmas-parties earned 8,648 impressions, 3 clicks, average position 26.9. Within that:
- "christmas party in staines" pos 5.4, "christmas party pub staines" pos 5.4, "venues for xmas parties in staines" pos 6.0, all 0 clicks despite page 1
- Heathrow cluster ("christmas party in heathrow" 658i pos 15.2, "christmas booking in heathrow" 537i pos 17.7, "work xmas party in heathrow airport" 290i pos 18.2, "buffet food ideas christmas in heathrow" 1,458i pos 17.6) all page 2
- Distant-location queries (Harrow, Fitzrovia, Surrey-wide) pos 40+, not winnable, ignore

**Parking.** /heathrow-parking/terminal-5: 7,238 impressions, 0 clicks, positions 30 to 50 on head terms ("heathrow parking terminal 5" etc.). Those SERPs are owned by Heathrow official and aggregators; not winnable head-on. The blog angle (cheap-heathrow-parking-alternatives) sits pos 16 to 21, which is winnable.

**GBP (Mar to Aug).** 52,330 profile views; 31,952 searches (top terms: "restaurants" 18k, "pubs" 3.3k, brand ~2.4k); 3,295 direction requests; 197 calls; 1,430 website clicks; only 19 GBP bookings and 254 menu views (Google is prompting "Add menu"). The local pack is a second search surface roughly as big as the website's local queries, and it converts to directions/calls rather than online bookings.

**GA4 (last 90 days, consented users only).** 2,932 sessions vs ~8k organic GSC clicks in the period, so GA4 sees roughly a third of real traffic (consent losses). Funnel: 236 users clicked book-a-table → 154 started → 80 completed (87 table_booking_completed events). Also: event_booking_completed 10, sunday_roast_booking_completed 3, call_click 42, private_hire_enquiry_submitted 1.

**Measurement defect.** All 76 key events attribute to landing page "(not set)" (1,241 active users with no landing page). Booking completions are almost certainly being sent server-side (the GTM server / CAPI path added in July, and/or the tap-to-confirm SMS flow) without client_id/session context. Until fixed, we cannot see which pages produce bookings.

## 2. Diagnosis

1. The plateau is a coverage problem, not a penalty or technical failure. The Heathrow informational cluster has matured and nothing new is catching the next demand wave. Christmas demand started surging in July while the page sits on page 2, earning impressions and zero clicks.
2. Traffic mix is skewed to non-booking intent. Half the clicks come from spotters and layover passengers. The pages that would book tables (food, roast, Christmas, private hire, events) are under-ranked and under-linked.
3. We are flying blind on which pages create bookings until the GA4 attribution defect is fixed.

## 3. Targets (September to December)

| Metric | Now | End Oct | End Dec |
|---|---|---|---|
| Impressions/day | ~3,450 | 5,000 | 6,000 |
| Clicks/month | ~3,100 | 4,500 | 5,500 |
| Christmas cluster clicks/month | 0 | 250+ | peak season capture |
| Bookings attributable to landing page | 0% | 95%+ | 95%+ |

## 4. Workstreams

### W1. Measurement first (week of 11 Aug)
1. Fire table_booking_completed (and event/sunday-roast/private-hire completions) client-side on the site's confirmation step with page_location, keeping the server-side event deduplicated (shared event_id) or demoted to backup. Investigate the July GTM server / CAPI path and the tap-to-confirm flow to find where attribution is lost.
2. Add GA4 booking-value context (booking type, party size) as event params.
3. GBP: attach the food menu natively (Google is prompting; 254 menu views is weak), confirm the booking link points at /book-table with UTM, confirm menu link.
Owner actions: none in code beyond this repo except if the completion event originates in the management app; then a matching change lands there.

### W2. Christmas sprint (weeks of 11 and 18 Aug, ahead of the September surge)
1. On-page overhaul of /christmas-parties: title and meta targeting "Christmas party venue near Heathrow / Staines"; H1/H2s matched to the query set (work Christmas party, Christmas buffet, Christmas party night); FAQ section answering the exact page-2 queries; booking CTA above the fold; Event/FAQPage schema where truthful.
2. Internal links to /christmas-parties from the top-traffic pages (homepage, /whats-on, /private-hire, food-menu, the things-to-do and where-to-eat blog posts) with descriptive anchors.
3. Supporting cluster, bulk-produced now (owner approved bulk): 4 to 6 pieces via editorial-team, e.g. work Christmas party ideas near Heathrow; small office Christmas party venues Staines; Christmas buffet menu guide (refresh existing christmas-party-food-ideas post and re-date); Christmas party checklist for office managers; festive menu explainer. Every piece links to /christmas-parties.
4. Measure weekly: positions for the 10 highest-impression Christmas queries; goal page 1 by mid-September.

### W3. CTR harvest on existing rankings (weeks of 18 and 25 Aug)
Rewrite titles/metas where impressions are high and CTR is poor at winnable positions:
- "the anchor pub" pos 7 to 8.5, CTR under 1% (16mo: 7,094i). Brand SERP confusion with other Anchor pubs; sharpen homepage/org branding ("The Anchor, Stanwell Moor")
- /restaurants-near-heathrow pos 8 to 12, CTR ~1.1 to 1.9%
- "pubs near heathrow airport" pos 17 (1,798i 16mo), needs content consolidation toward one target page
- "heathrow academy viewing stand" pos 8.4 (771i/3mo): add a dedicated section to the plane-spotting post
- "is heathrow worth it for short international layovers" pos 9.2 (721i/3mo): add an answer block to the layover guide
- /whats-on pos 4.6 and /find-us pos 4.5 with sub-1% CTR: title rewrites
- Vegetarian: "vegetarian pub food" 1,190i/3mo pos 22; strengthen the existing vegetarian post and internal links

### W4. Booking-path CRO on the traffic engines (weeks of 25 Aug and 1 Sep)
The spotting, layover and things-to-do pages carry ~half the clicks but no booking path. Add contextual sections and CTAs ("park up, eat after your spotting session", food menu, beer garden, book a table) plus internal links to money pages. Track with the fixed attribution from W1.

### W5. Content engine (September onwards, 2 pieces/week via editorial-team)
Priority order mirrors revenue priorities (day-to-day bookings, Christmas, private hire, hosted events, parking):
1. Local dining intent: Sunday roast near Heathrow / Staines / Surrey (best-sunday-roast-surrey already pos 20, promote), fish and chips, dog-friendly pub (988i/3mo at pos 33), pubs with beer gardens near Heathrow (1,240i/28d combined, pos 26 to 30)
2. Hosted events: evergreen hub pages for quiz night, music bingo and cash bingo near Staines/Heathrow with schema; event detail pages currently get 0 to 8 seconds engagement and no search cover
3. Private hire: the wakes page pulled 1,321i/28d; extend the celebration cluster and link every post to the enquiry CTA
4. Christmas top-ups as positions improve
5. Parking pivot (background, low priority per owner): reposition to "park at a local pub near Heathrow" niche; keep the alternatives blog fresh; stop investing in T5 head terms

### W6. Local surface routine (ongoing)
Weekly GBP posts (events, Sunday roast, Christmas from September), photo uploads, review replies. GBP already shows 18k "restaurants" searches; the profile is the biggest local converter (directions + calls).

## 5. What we will deliberately not do
- Chase "heathrow parking terminal 5" head terms (pos 42, unwinnable)
- Chase distant Christmas queries (Harrow, Fitzrovia, central London)
- Monetise the US plane-spotting audience
- Build content for drinks-brand queries (carling, chambord, coors logo etc.); they inflate impressions with zero value
- Recreate /easter or seasonal pages for events we do not run

## 6. Weekly scorecard (check every Monday)
1. GSC impressions/day and clicks/day (7-day average)
2. Positions for top 10 Christmas queries
3. table_booking_completed by landing page (post-W1 fix)
4. New content indexed and ranking (GSC page filter per new piece)
5. GBP: calls, directions, website clicks

## Decisions recorded
- Revenue priority (owner, 10 Aug): day-to-day table bookings, Christmas parties, private hire, hosted events attendance, parking last
- Parking: grow but not a priority (owner, 10 Aug)
- Content cadence: 2/week steady, bulk sprint approved for Christmas (owner, 10 Aug)
