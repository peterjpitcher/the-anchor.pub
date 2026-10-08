# SSOT corrections and the owner's facts, 8 October 2026

Branch `docs/ssot-corrections-and-facts`. `docs/SSOT.md`, `SSOT.json`, one guard test, one type and small wording changes on pages. Source: the 7 October 2026 site review (package P23) and the owner's decisions and facts of 7 October 2026.

## Corrections to the SSOT itself (P23)

- [x] **C1-008, finishing times.** "Christmas parties finish by midnight" (owner-confirmed 15 August 2026) is now in section 7 and section 11. The checker's ruling was followed: the Christmas answer on the page stays as it is.
- [x] **C4-055, four points where the SSOT was out of date.**
  - Walk times: `SSOT.json` now gives Staines Moor and the King George VI Reservoir as about 30 minutes, one way, as the Markdown does.
  - Areas note: `SSOT.json` no longer says the area pages are out of the sitemap. They are in it.
  - Horton, Wraysbury and Longford: noted in section 13 as pages that go further than the list, left as they are, for the 10 December review.
  - Airport parking: section 8 has an entry for the paid product, and the three typed prices are out of `SSOT.json`.
  - Bus line: section 2 and `SSOT.json` now name only the 442, from Terminal 5. Section 17 has it on the claims register.
- [x] **C2-034, pool and darts.** The May 2026 facts are back in section 8, marked "as at May 2026", to be re-confirmed at the 10 December review. The darts upgrade is recorded as not to be promised.
- [ ] **HT-020, the "Owner-confirmed" stamp in three special-hours notes.** Not done here: the notes are records in the management app and there is no code to change.
- [x] **HT-021, unconfirmed facts in the hours feed, the website half.** `lib/api/hours.ts` no longer declares the happy hour, the private hire block, the busy-times block or "booking required", so no page can read them. The management half (removing them from the feed) is not done here.
- [x] **Quiz and bingo capacity** (C2-050, named in the P23 summary). Section 10 and `SSOT.json` mirror the quiz at 49 seats and cash bingo at 60 (49 seated plus 11 standing), pulled 7 October 2026.

## Owner facts recorded

| Fact | Where | Notes |
|---|---|---|
| 23 Allergens come from the management app | Sections 5 and 15 | |
| 24 No nut-free, dairy-free or halal promise for a private booking | Sections 11, 14 and 16; `SSOT.json` | The section 16 block is the sentence already in `lib/approved-wording.ts` |
| 25 No marked disabled parking bay | Sections 8 and 14; `SSOT.json` | |
| 26 Tasting night is over 18s only | Section 10; `SSOT.json` | |
| 27 Celebration cake needs the outside-food waiver | Sections 11 and 16; `SSOT.json` | |
| 28 Orange Jelly Limited is responsible for customers' personal data | Section 1 | |
| 29 Vegan Wellington is on the 1 course Christmas menu, with a price | Section 7 | No price recorded: it is live |
| 30 Kids mac and cheese dropped | Already there | Recorded on 7 October |
| 31 and 32 Manager's Special retired | Sections 6 and 14; `SSOT.json` | The page and code come out on the branch `fix/retire-managers-special-and-near-pages` |
| 33 Snowball stands at £180 as of 30 September 2026 | Section 10 | Dated, not mirrored into `SSOT.json`, which holds no jackpot amounts |
| 34 Decorating rules | Sections 11, 14 and 16; `SSOT.json` | |
| 35 Both jobs open at £12.71 an hour, for now | Section 2 | The careers pages already say £12.71 |
| 36 Enquiry numbers | Not recorded | It is a trading observation, not a fact a page can state, and this repository is public |
| 37 Parking cars can be collected at any hour | Section 8; `SSOT.json` | |
| 38 and 39 Private bookings before 12pm and after 10pm, by arrangement | Sections 11, 14 and 16; `SSOT.json` | |
| 40 Mother's Day, Easter Sunday and Father's Day are special days | Section 4; `SSOT.json` | |
| 41 At least one of the four TVs is in the dining room | Section 8; `SSOT.json` | |
| 42 Coaches | Sections 8 and 16; `SSOT.json` | |
| 43 Taxis | Sections 2, 14 and 16; `SSOT.json` | |

## Pages brought into line

Small wording changes only.

- **Taxis (fact 43).** `/egham-pub`, `/heathrow-hotels-pub`, `/heathrow-layover-dining` (four lines), `/near-heathrow/terminal-2`, `-3`, `-4` and `-5`, `/pre-flight-meal`, and the posts `things-to-do-near-heathrow-between-flights` and `where-to-eat-near-heathrow-business-travellers`. None now says we book, call or arrange a taxi.
- **Decorating (fact 34).** `/private-hire/gender-reveal` (twelve lines: no confetti cannons or confetti balloons, smoke cannons outside only and away from buildings and fencing, no pins or tape for a backdrop) and three lines in the post `gender-reveal-party-ideas-venues`.
- **Celebration cake (fact 27).** The cake answer on `/private-hire/anniversary-parties`, `/engagement-parties`, `/baby-showers` and `/christenings` now says the waiver comes with it.
- **Private hire times (facts 38 and 39, C1-008).** `/private-hire/anniversary-parties`, `/engagement-parties`, `/milestone-birthdays` (two lines), `/private-hire/wakes` (two lines) and `/corporate-events`. "No ticking clock", "until late(ish)", the licence sentence, "early starts and late finishes available" and "no strict time limit" are gone; each says by arrangement.
- **Coaches (fact 42).** `/coach-parking-heathrow`, three lines.
- **The TV in the dining room (fact 41).** The private hire landmark pages said "TVs" in the dining room, four times. They now say "a TV".

All five posts touched or checked answer 200 on the live site (a GET with redirects off), so the edits are served.

## Left for a later batch, on purpose

- **The bus routes on pages.** Sixteen places still name the 441 or 555, or give a boarding point, frequency or journey time. That is package P10, and it is more than a wording change.
- **`/easter-sunday` and the other special Sunday pages.** They state the regular roast, walk-ins and the usual hours as fact for a day that fact 40 says is confirmed nearer the time. That is a page rework, not a wording change.
- **`/pool-darts-pub`.** The three "upgrade in 2026" lines and the claims that were never on record (cues, free darts, the queue) are package P11.
- **The gender reveal post's idea list** still describes confetti cannons as a general idea. Its three lines about The Anchor are fixed; the rest belongs with the blog batch (P15).
- **`/coach-parking-heathrow`** keeps its title "Pub With Coach Parking Near Heathrow". The body now says which coach fits.
- **River Colne, Staines Reservoir and Lammas walk times in `SSOT.json`** have no owner confirmation and were left alone.

## Management app, nothing changed there

- HT-020: three special-hours notes carry "Owner-confirmed" stamps that customers will see from late November.
- HT-021: the hours feed still sends a Friday happy hour, a private hire block and Christmas Day as a regular closure.
- Fact 30: the kids mac and cheese record.

## Assumptions

1. Fact 28 sits in section 1, with the business facts, and fact 35 in a new "Jobs" entry in section 2. Neither had a section that owned it.
2. The section 16 blocks for taxis, coaches, private hire times, decorating and cakes are built only from the owner's words in the facts. The dietary block is the sentence already live on the site.
3. The quiz and cash bingo capacities are the figures the site review read from the live pages on 7 October. Music bingo and karaoke were not pulled again and still read 60 with their September date.
4. The Snowball figure is recorded with its date and a warning that it is not current.
5. Fact 36 was left out, for the reason in the table.
6. The SSOT side of the Manager's Special retirement lives on this branch so that two branches do not edit the same lines.

## Checks

Run on 8 October 2026 under Node 20, on this branch.

- `npm run lint:next`: no warnings or errors.
- `npx tsc --noEmit`: clean.
- `npm test` (London): 281 suites passed, 4699 tests passed, 1 skipped.
- `npm run test:utc`: 281 suites passed, 4699 tests passed, 1 skipped.
- `npm run build`: completed.
- `npx jest tests/ssot-drift-guard.test.ts`: part of both runs above, passing with seven new tests.
