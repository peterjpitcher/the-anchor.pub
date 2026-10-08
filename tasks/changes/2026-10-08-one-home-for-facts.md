# One home for each fact, 8 October 2026

Branch `fix/one-home-for-facts-p10`. Website only. Source: work package P10 of the 7 October 2026 site review (35 findings), the owner's decisions of 7 October 2026 and the recorded defaults.

The same few facts were typed into page after page, and had drifted: terminal drive times that disagreed on ten pages, three buses named where one stops, "parties of 250" on a page whose limit is 150, a parking count of 30 in the structured data, children "until 8pm", dogs "in the bar and garden", and left against right in hand-typed directions. Each fact now has one home, every page reads it from there, and a test fails when a page types it again.

## 1. The home

Nothing new was invented: the three files that already held facts were extended.

| Fact | Home | Checked against |
|---|---|---|
| Minutes by car to each terminal, the 7 to 12 range, the two distances | `lib/constants.ts` (`HEATHROW_TIMES`, `HEATHROW_DISTANCES`, `HEATHROW_TIMES_WORDING`) | SSOT section 2, `SSOT.json` |
| M25 Junction 14 (2 minutes), Staines (8 minutes) | `lib/constants.ts` (`DRIVE_TIMES`) | SSOT section 2 |
| The bus: the 442 only, from Terminal 5 | `lib/constants.ts` (`BUS`, `BUS_WORDING`) | SSOT sections 2, 14 and 17 |
| Parking count, price band, address and map position for structured data | `lib/constants.ts` (`PARKING`, `PRICE_RANGE`, `POSTAL_ADDRESS_SCHEMA`, `GEO_COORDINATES_SCHEMA`) | SSOT sections 2 and 8 |
| Drive times to the three wake venues | `lib/constants.ts` (`WAKE_VENUE_DRIVE_MINUTES`) | SSOT section 11 |
| Parking, coach, taxi, dogs, families, sport, Six Nations and commentary sentences; "We're outside the ULEZ zone."; "Children are welcome at all hours." | `lib/approved-wording.ts` | SSOT section 16, word for word |
| Room capacities and the private hire range | `lib/private-hire-capacity.ts` (already there) | `SSOT.json` venue.capacity |
| Largest party that can book online (20) | `lib/booking-config.ts` (already there) | `SSOT.json` |

The home holds only what the SSOT holds. There is no figure for Windsor, Ashford, Feltham, Egham, Sunbury, Horton, Wraysbury, Colnbrook, Longford or Stanwell, no walk time from a hotel or a village, and no distance for Terminals 2 and 4. Pages now say "a short drive" and give no number (recorded default for C4-002 and C4-046).

## 2. The guard

`tests/one-home-for-facts-guard.test.ts`, with its patterns in `tests/helpers/one-home-for-facts-rules.js`.

- [x] The home matches `SSOT.json` and SSOT section 16.
- [x] No page, component or lib file types: a journey time or a distance; the bus route, a bus that does not stop here, a bus fare or frequency, or the bus at Terminals 2, 3 and 4; the parking count, "around 20", "large", "ample", "guaranteed", "always available", "designated driver", an overnight stay or an airport pick-up; anything after "outside the ULEZ zone" about a charge or a saving; a limit on where or when dogs are welcome, or a welcome without "on a lead"; a curfew for children; a room capacity; a latitude or a price band; turn-by-turn directions; "groups of 8, call us"; kitchen days on the area and terminal pages; and seven statements about the local area that the SSOT does not hold.
- [x] A landmark page states a drive time only for the three wake venues and for Heathrow.
- [x] `/llms.txt`, which cannot import a constant, gives the same figures as the home.
- [x] The guard reads whole directories. A pathspec such as `app/**/*.tsx` needs a second slash, so it skips `app/page.tsx` and every top-level file in `lib/` and `components/`. The older wording guards use that pathspec and so do not read those files: not changed here (tooling is package P21).

## 3. What changed on the pages

- [x] **Terminal times (C4-001, C3-017, C1-041).** Every terminal figure is read from the home. Wrong figures went with it: "15 mins by car" on the Terminal 2 and 3 pages (11), "10 mins" on Terminal 4 (12), "Allow 15 mins" and "2.8 miles" on Terminal 5 (7 and 3.8), "4.5 miles" on Terminal 3 (5.3), "5 Minutes from Terminal 5" on `/pre-flight-meal`, "10 minutes" and "12 minutes" for Terminals 2 and 3 on `/heathrow-parking`. "7 minutes from Heathrow" and "from the terminals" now name Terminal 5.
- [x] **The M25, Staines and the villages (C4-002).** 2 and 8 minutes everywhere, from the home. Every figure for another town, a station, a hospital, a hotel or a business park is gone.
- [x] **The bus (C4-003, C4-004).** The one sentence, "The 442 bus stops on Horton Road by the pub and runs from Heathrow Terminal 5.", wherever the bus is mentioned. The 441, 555 and 117 are named nowhere. The bus sections and bus questions are off the Terminal 2, 3 and 4 pages. No fare, frequency, journey time or last bus anywhere.
- [x] **Directions (C4-045, C4-052).** Every hand-typed route and every "how to get here" structured data block is removed, on every page that had one. Each keeps the postcode and one Get directions link built from the coordinates. The helper that produced the structured data is deleted. The name "The Anchor - Heathrow Pub & Dining" is gone from every page.
- [x] **Walks (C4-046).** Nothing tells a hotel guest or a villager they can walk to us. The one walk on record stays: Staines Moor and the King George VI Reservoir, about 30 minutes each, one way.
- [x] **Parking (C4-015, C1-015, C3-015).** The approved sentence, or "20 free spaces" read from the home. "Around 20", "large", "ample", "guaranteed", "always available", the designated driver lines, overnight parking and the airport pick-up lines are gone. The parking structured data said 30 spaces and compared itself with airport parking: it now gives the home's count and the approved sentence. "Free Customer Parking" in the menu and "Free Parking" on the sitemap page lead to `/find-us#parking`, not the paid airport parking page. The party page no longer tells guests to pre-book airport parking (C1-014).
- [x] **ULEZ (C1-013, C3-016, C4-042).** "We're outside the ULEZ zone." and nothing after it. The congestion charge question is deleted.
- [x] **Dogs (C4-035, C3-034, C1-021).** The approved sentence on every page that welcomed dogs in other words, including the New Year's Eve page, which limited them to the early evening.
- [x] **Families (C2-001, C1-012, C4-036, C3-041).** The live sport page says children are welcome at all hours. Every page that lists baby or child facilities carries the approved sentence, which says there is no baby changing. The Safety and Respect page says cash bingo is 18 and over to play.
- [x] **Capacities (C1-011, C1-028, C4-033).** Read from `lib/private-hire-capacity.ts`. "A private dining room for 10 to 150 guests" is corrected: the dining room is 26 seated or 50 standing, and 150 is across the pub. "Parties of 250" is gone. The venue structured data said 250: it now gives the SSOT's 300.
- [x] **Groups (C1-016).** "Groups of more than 20, give us a call", with the 20 read from the booking config.
- [x] **Structured data (SM-004).** Pages spread one address and one map position from the home. The unused block with coordinates a mile away is deleted.
- [x] **Kitchen (C4-029, C2-006).** Typed kitchen days are off the area and terminal pages. Six lines that promised food without saying the kitchen may be shut now say kitchen times vary by date.
- [x] **Drinks (C4-040).** `/our-pub` no longer counts the gins, whiskeys and draught lines or lists brands: it points to the drinks menu. "German beers are popular with Lufthansa passengers" is deleted.
- [x] **The area (C4-043).** Horton Country Park, the Stanwell Moor nature reserve, the village green, "just off the A308", "just past Ashford Hospital", "right on our doorstep" and the church as a landmark are gone.
- [x] **Sport pages.** The Six Nations, World Cup and Nations Championship pages each kept their own copy of six approved sentences. They import them now.

## 4. Findings

| Finding | Result |
|---|---|
| C2-001, C4-003, C1-011, C1-012, C1-013, C1-014, C1-015, C1-016, C1-021, C1-041, C2-006, C3-015, C3-016, C3-017, C3-034, C3-041, C4-001, C4-002, C4-004, C4-015, C4-029, C4-033, C4-035, C4-036, C4-040, C4-042, C4-043, C4-045, C4-046, C4-052, SM-004 | Done |
| B1-003 | Already done: the three posts carry the SSOT figures (checked 8 October 2026; all three are served) |
| C1-028 | Done as far as one home in the repository. Reading capacities live from the management app is not done: see below |
| C1-020 | Not done: see below |
| C2-020 | Needs the management app: the five past quiz records are data there |

**C1-028.** Every capacity on the site now comes from `lib/private-hire-capacity.ts`, and the guard holds that file to `SSOT.json`. The finding's full fix is to read them from the management app's catering data with this file as the fallback. That is a page by page change to how the private hire pages load, and it was left out so that this branch only moves facts.

**C1-020.** The Easter page still types the bank holiday weekend's opening. The checker ruled that the block stays and should be drawn from the live hours for the four dates, with a neutral fallback. The hours code is being changed in package P20, so it is left for after that lands.

**C3-041.** The "zero tolerance" wording on the Safety and Respect page is left as it is (recorded default).

**C4-052.** Page titles such as "Pubs in Windsor" are left alone (owner ruling of 10 September 2026).

## 5. Left alone, on purpose

- `content/blog`: not in this package, apart from the three posts in B1-003, which needed no change.
- `content/copy-decks`: working drafts, not pages.
- The flight boxes on the terminal pages: another package is removing them.
- `/free-parking` still redirects to `/heathrow-parking`. The finding named the two links, not the redirect.
- Event capacities in structured data (`lib/static-events.ts` and others): an event's capacity is the management app's, and belongs to the events package.

## Assumptions

1. Where a page gave a figure the SSOT does not hold, the figure was removed, not replaced.
2. `/find-us` loses its typed routes like every other page. The routes disagreed with each other and none could be checked, and the Get directions link gives a live route.
3. On the Terminal 2, 3 and 4 pages the bus is removed, because the SSOT says only that the 442 runs from Terminal 5.
4. The venue's `maximumAttendeeCapacity` follows `SSOT.json` venue.capacity.maximum (300).
5. A two-word badge such as "Dogs welcome" is not a sentence and stays.

## Checks

Run on 8 October 2026 under Node 20, on this branch.

- `npm run lint:next`: no warnings or errors.
- `npx tsc --noEmit`: clean.
- `npm test` (London): 309 suites passed, 5261 tests passed, 1 skipped.
- `npm run test:utc`: 309 suites passed, 5261 tests passed, 1 skipped.
- `npm run build`: completed.
- The production build was started locally and 35 pages were loaded once each with a plain request. All answered 200. None printed "undefined", an unfilled placeholder, the 441 or the 555, or the old pub name. The home page, `/find-us`, two terminal pages, an area page, four landmark pages, the anniversary page, `/live-sport`, `/our-pub` and a blog tag page were read for the sentence each should now carry, and each carried it.

`tests/unit/owner-answers-8-october.test.ts` had one case that allowed only a hotel to go without a drive time. Most landmarks now have none, so the case checks instead that no such page prints a blank or "undefined".
