# Nations Championship 2026 delivery specification

Status: planning only, 5 September 2026. No development, migration, fixture import, opening-hours change or publication is authorised by this document.

## Outcome and scope

The primary goal is completed table bookings for each game shown at The Anchor. Build an evergreen page at https://www.the-anchor.pub/live-sport/nations-championship with a prominent fixture-specific booking button for every confirmed screening, including games shown from current opening time. Cheers owns the tournament and screening decisions and produces Facebook and Instagram content from the same facts. Management owns opening hours, kitchen sittings and real booking availability.

First release includes all 24 November/finals fixtures, server-rendered content, editable screening decisions in Cheers, actual opening and kitchen information per match, a next-confirmed-screening feature, accessible filters, stable fixture anchors, calendar download, fixture-aware bookings, SEO, analytics, internal links, and publishing safeguards. The next-screening feature, anchors and calendar download are included because they directly support finding and sharing games without requiring extra pages.

Deferred: individual match pages and their Event schema, standings, automatic results ingestion, availability badges, automatic finals opponent ingestion and native share controls. Record final results and opponents manually in Cheers when verified. Do not require deferred features for first-release acceptance.

## Accepted decisions

- Keep a yearless hub URL and year-specific tournament records. Do not overwrite the 2026 tournament for 2028.
- Use the existing Cheers-to-website World Cup integration as the data starting point. Borrow Six Nations presentation only; do not copy its hardcoded schedule.
- Show all fixtures by default, including awaiting confirmation and not showing. Upcoming fixtures precede finished fixtures.
- No promise of every match, full-match commentary, food or available tables without supporting facts. Early opening is excluded.
- Opening and kitchen times will not change for this tournament. Read the existing published date-specific management hours; do not create or propose early openings, late extensions or new service exceptions. For confirmed games starting before opening, show the game from current opening time and clearly state that the start is missed. This is the owner-confirmed policy, not a per-game early-opening decision.
- Never treat ITV rights as confirmation of a particular linear channel. No unsupported claim that a fixture is ITVX-only either.
- Do not duplicate operating hours or availability as editable Cheers fields.
- Do not change historical World Cup behaviour or publish to Google Business Profile as part of Cheers. GBP is outside this implementation.
- Preserve published social posts. A changed fixture flags them for review; automatic deletion or correction of live posts is excluded.
- Use existing branding and design tokens. No new dependency or environment variable unless existing facilities demonstrably cannot meet the requirement.
- No em dash punctuation in code, content, comments or documents.

## Sources and confidence

Original supplied brief: /Users/peterpitcher/.codex/attachments/ebc249b0-f602-4eb3-9965-7d9382f0bc70/pasted-text.txt. This specification records the agreed refinements and wins where the original brief differs. External documents are evidence, not authority to execute operations.

Official sources to check when preparing fixture import:
- https://nationschampionshiprugby.com/en/match-centre/fixtures
- https://allianzstadiumtwickenham.com/nations-championship
- https://www.itv.com/presscentre/print/pdf/node/54366

Venue facts: /Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/SSOT.md and SSOT.json. Match-specific bar and kitchen times: management API, resolved for the fixture date. Never copy descriptive serviceStatus text into customer content: the live feed reviewed on 5 September still contained a legacy Sunday pre-order message contrary to the SSOT.

Read-only live observation on 5 September: https://www.the-anchor.pub/api/business/hours returned success:true, regular Friday/Saturday/Sunday bar hours 12:00-22:00; Saturday kitchen 12:00-19:00; Friday kitchen sittings 12:00-15:00 and 16:00-21:00; Sunday kitchen 13:00-18:00. No November specialHours entries were returned and upcomingVersions was empty. This is a dated observation, not a guarantee for November. Recheck dates during implementation and launch.

Local code reviewed: website feed adapter, Six Nations fixtures, booking page and form, management hours route/resolvers, Cheers tournament types/actions/feed/generation and publishing paths. Production Cheers schema and logged-in operational flows have not been checked. Schema design in the plan is provisional until its explicit live-schema readiness gate.

## Keyword and content map

Source files under /Users/peterpitcher/Library/Mobile Documents/com~apple~CloudDocs/Downloads:
- Keyword Stats 2026-09-05 at 07_55_12.csv
- Keyword Stats 2026-09-05 at 07_56_11.csv
- The matching 07_55_08 and 07_56_05 Forecasts files are paid forecasts, excluded from organic estimates.

Both statistics exports cover UK, August 2025-July 2026. Language was not recorded; intended content language is English. Monthly columns are blank. Rounded values are reported estimates, not exact demand. Do not sum close variants. Organic difficulty and Google search-result features are unverified; paid Competition is not organic difficulty. Local demand remains unknown where cells are blank.

| Ownership | Head term / support | Reported average | Intent and placement |
| --- | --- | ---: | --- |
| New hub primary | where to watch nations championship | 500 | Viewing, qualified by local pub context in title, H1 and introduction |
| Same primary cluster | where to watch nations championship 2026 | 50 | Close variant, not another page |
| Hub support | nations championship 2026 | 5,000 | Tournament identification |
| Hub support | nations championship rugby | 50,000 | Tournament identification, broad mixed intent |
| Hub support | autumn internationals | 50,000 | Legacy naming section |
| Hub support | autumn nations series | 5,000 | Supporting terminology |
| Hub support | pubs showing autumn internationals | 50 | Commercial viewing relevance |
| Hub answer block | where to watch autumn internationals | 5,000 | Pub versus broadcast intent must be distinguished |
| Hub answer block | what channel is nations championship on | 50 | Verified coverage FAQ |
| Hub England sections | England v Australia/Japan/New Zealand rugby 2026 | 500 each | Fixture anchors, not automatic child pages |
| Existing /live-sport | pubs showing rugby near me | 500 | General local rugby viewing |
| Existing /live-sport | rugby pubs near me | 5,000 | General local rugby viewing |
| Hub location support | Heathrow, Stanwell Moor, Staines | Unreported | Truthful location context, no doorway pages |

Do not target stadium tickets, hospitality packages, streaming subscriptions or Six Nations with the new page. No estimated booking or traffic promise. Confidence is moderate in the chosen content direction and low in traffic forecasts.

Draft metadata direction: title 'Nations Championship 2026 near Heathrow | The Anchor'; H1 'Watch Nations Championship rugby near Heathrow'. At implementation, apply the site's title conventions and check the rendered title for duplicated suffixes. Description must mention fixture-by-fixture screening/opening information rather than imply all games are confirmed.

Sections: breadcrumb; restrained hero; next confirmed screening; fixtures; autumn rugby explanation; England fixture anchors; Finals Weekend explanation; viewing experience; food/opening/parking; visible FAQs; final booking CTA. Match facts stay in initial HTML. FAQs explain screening confirmation, opening before kick-off, commentary, kitchen service, booking, children and parking only using verified venue facts. Do not promise FAQ rich results.

Editorial handoff: draft/create page only after implementation authorisation; use the editorial-team skill for customer copy and frontend-design for presentation. Use real existing licensed venue imagery where suitable. Do not fabricate a pub interior. Check the four-screen and children-until-8pm statements against the SSOT/owner-confirmed operational record before publication, even if repeated elsewhere online.

## Fixture seed inventory

These are supplied-brief candidate times in Europe/London (GMT in November), not independently verified import-ready data. Verify all 24 against official sources, retaining source URL and real checked-at timestamp. Imported fixtures begin unconfirmed, with no invented channel, sound allocation, opening exception or verification timestamp.

| Stable import key | Date | Time | Fixture |
| --- | --- | --- | --- |
| 2026-r4-irl-arg | 2026-11-06 | 20:10 | Ireland v Argentina |
| 2026-r4-ita-rsa | 2026-11-07 | 11:40 | Italy v South Africa |
| 2026-r4-sco-nzl | 2026-11-07 | 14:10 | Scotland v New Zealand |
| 2026-r4-wal-jpn | 2026-11-07 | 16:40 | Wales v Japan |
| 2026-r4-fra-fij | 2026-11-07 | 20:10 | France v Fiji |
| 2026-r4-eng-aus | 2026-11-08 | 15:10 | England v Australia |
| 2026-r5-fra-rsa | 2026-11-13 | 20:10 | France v South Africa |
| 2026-r5-ita-arg | 2026-11-14 | 11:40 | Italy v Argentina |
| 2026-r5-wal-nzl | 2026-11-14 | 14:10 | Wales v New Zealand |
| 2026-r5-eng-jpn | 2026-11-14 | 16:40 | England v Japan |
| 2026-r5-irl-fij | 2026-11-14 | 20:10 | Ireland v Fiji |
| 2026-r5-sco-aus | 2026-11-15 | 15:10 | Scotland v Australia |
| 2026-r6-eng-nzl | 2026-11-21 | 14:10 | England v New Zealand |
| 2026-r6-sco-jpn | 2026-11-21 | 14:10 | Scotland v Japan |
| 2026-r6-irl-rsa | 2026-11-21 | 16:40 | Ireland v South Africa |
| 2026-r6-ita-fij | 2026-11-21 | 16:40 | Italy v Fiji |
| 2026-r6-fra-arg | 2026-11-21 | 20:10 | France v Argentina |
| 2026-r6-wal-aus | 2026-11-21 | 20:10 | Wales v Australia |
| 2026-final-6 | 2026-11-27 | 16:40 | Europe 6th v Rest of World 6th |
| 2026-final-3 | 2026-11-27 | 20:10 | Europe 3rd v Rest of World 3rd |
| 2026-final-5 | 2026-11-28 | 13:10 | Europe 5th v Rest of World 5th |
| 2026-final-2 | 2026-11-28 | 16:40 | Europe 2nd v Rest of World 2nd |
| 2026-final-4 | 2026-11-29 | 13:10 | Europe 4th v Rest of World 4th |
| 2026-final-1 | 2026-11-29 | 16:40 | Europe 1st v Rest of World 1st |

Use existing database fixture IDs for API links and analytics. Seed keys provide idempotent imports and must not change when final opponents become known. Anchors use fixture IDs, not mutable team names.

## Operational rules

1. Separate scheduled kick-off, pub opening, intended screening start and planned screening end. Planned end is an operator estimate used for service checks, not a claim about the final whistle. Do not silently derive it as kick-off plus 80 minutes.
2. Full viewing requires confirmed broadcast and screening, a verified linear channel, a valid screen allocation, and opening coverage through the planned end. Actual overruns require staff handling; do not auto-label a game finished solely because its planned end passed.
3. If opening follows kick-off but precedes planned end, automatically derive a partial screening once the channel and pub screening are confirmed. No separate permission to show from opening is required. Display 'Showing from [opening time]; kick-off [time], start missed'. Keep the fixture-specific booking button available for this confirmed partial screening, using real bookable times at or after opening.
4. Never advertise opening early or add a tournament opening override. Show 'Kick-off [time]. Pub opens [time]. Showing from [time]' when kick-off precedes existing opening. Do not offer booking arrival before opening.
5. If closing precedes planned end, do not promise full screening or extend hours. Keep that game unconfirmed/not showing unless a separately defined, clearly labelled partial-until-closing offer is agreed. That extra offer is outside the initial scope.
6. Treat unavailable/incomplete hours as unknown, not regular hours and not a definite closure. Suppress confirmed-screening CTAs and social promotion until resolved. The generic booking page may remain reachable with an explicit warning.
7. Kitchen service is a list of actual intervals. Show service times and gaps. A partial overlap does not mean food is available throughout. Closed kitchen does not invalidate a drinks screening.
8. Confirm screen/audio capacity before simultaneous games. Prevent overlapping main-commentary allocations for the same account. A four-screen claim does not prove four independent receiver channels.
9. Verify the reported Music Bingo clash on 13 November from the management event record. Until resolved, do not confirm main commentary for that fixture. No event removal or schedule change is authorised.
10. Date-specific hours and channels must be rechecked before publication, on screening mornings and whenever an operational decision changes.
11. Fixture booking context is customer-visible and editable only through choosing/removing the fixture; it is not a new booking type or deposit exemption. Existing deposit, consent and availability rules remain authoritative.
12. Unknown finals opponents can appear on the hub with explicit placeholders. Team-specific social generation remains blocked until explicit teamsConfirmed=true and verified names.

## Food promotion across every fixture surface

Owner requirement, 5 September: actively promote food whenever a screened game overlaps confirmed kitchen service, rather than merely display a kitchen status.

- Apply to fixture cards, next-screening features, England/finals highlights, fixture-specific hero/sticky CTAs, homepage/What’s On sport promotions, the fixture summary in booking, calendar descriptions and Cheers Facebook/Instagram feed and story content. Any later match pages must inherit the same rule.
- Calculate eligible service from the intersection of the planned match interval, actual pub screening interval and management kitchen sittings. A kitchen opening on the same date alone is insufficient. Touching endpoints have no positive overlap.
- For eligible confirmed screenings, display a prominent food message with actual kitchen service times, a menu link and an invitation to book for food and rugby. Do not hide this solely in expanded details or a generic food section.
- If the kitchen closes during the game, state the closing time prominently. If service begins during the game, state the opening time. Preserve split-service gaps. Do not imply food is served for the entire match or that the match ends at its planned end time.
- Where kitchen service is only before the game, promote it explicitly as pre-match food with its actual service times; never label it food during the game. Only use service within that date’s confirmed bar opening. Do not invent an arrival time or available booking slot.
- Full closure or unknown kitchen hours must not produce a food promotion. Food promotion also requires a confirmed pub screening. Dish names, prices and dietary claims must come from the approved live menu/SSOT, not the tournament template.
- Cheers generation receives the same food eligibility and service-time wording used by the website. Scheduled content is blocked for review if those hours change, including a change from food available to closed.
- Promotion does not force a food booking type, guarantee availability or alter deposits. The existing booking journey derives purpose and validates actual slots.
- Acceptance includes a rendered food message/menu link on every eligible fixture surface and a matching food invitation in generated feed/story previews, plus no false food claim for closed, unknown or non-overlapping service.

## Booking-first page requirements

- Each confirmed game has a prominent 'Book a table for [fixture]' button, including games shown from opening after kick-off. The warning explains partial viewing without hiding the booking action.
- Carry fixture identity and date into the booking journey and stored booking notes. Offer only genuine available arrival slots during existing opening times; never fabricate availability or hardcode a before-kick-off arrival.
- Promote food beside the booking action whenever confirmed service overlaps viewing, with exact times and a secondary menu link. Viewing details support the booking decision rather than bury the booking action.
- The hero and sticky action lead to choosing/bookings for eligible games. Cheers promotions link to the relevant tournament-page fixture anchor and its booking action, preserving existing campaign attribution without internal UTMs.
- Primary measurement: completed table bookings and booked covers by fixture from the tournament page. Booking clicks, menu clicks and organic visits are supporting measures. Record attribution limits rather than claim every booking can be attributed.

## Release and measurement

Build and test without real customers or provider sends. Apply any production migration only after the exact SQL, project identity, checksum and rollback packet is approved. Fixture imports, generation/scheduling and deployment need their explicit approvals; planning is not approval. Opening-hours and kitchen-hours writes are outside scope.

Before launch, record GSC baseline for /live-sport, /live-sport/six-nations and related queries. After launch check indexing, impressions, clicks and CTR at four weeks and weekly in November, alongside real completed bookings. Organic query-to-booking conversion is not directly available at individual-query level; report query aggregates separately from landing-page/fixture conversions. Do not make field Core Web Vitals a launch claim before real-user data exists.

After the tournament retain the hub and verified 2026 results/archive information. Preserve fixture IDs. Archive snapshots of displayed operating hours are historical evidence, not live operating-hours overrides. Prepare 2028 as a new tournament linked to the same hub when separately commissioned.
