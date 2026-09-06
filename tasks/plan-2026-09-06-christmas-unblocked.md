# Plan: the four items unblocked by the owner decisions of 6 September 2026

Source: `tasks/spec-2026-09-06-christmas-parties-traffic.md` section 12.
Branch: `fix/christmas-last-day-and-ssot-prosecco`.

## Wave 1: Christmas Day drinks hours

- [x] Add the Christmas Day fact to `docs/SSOT.md` section 7 and to `SSOT.json`: open for drinks 12pm to 3pm, no food.
- [x] Add a Christmas Day FAQ to `/christmas-parties`, since the offer window ends 20 December and the page is currently silent.
- [x] Extend `tests/ssot-drift-guard.test.ts` to pin the fact and ban a food claim on Christmas Day.

**Blocker found, cannot be fixed from this repository.** 25 December 2026 is a Friday. `GET /business/hours` returns exactly one special-hours record (Halloween) and nothing for 25 or 26 December, so the site currently resolves Christmas Day to regular Friday hours: **pub 12:00 to 22:00, kitchen 12:00 to 21:00**. The site is advertising a kitchen that will not be open. The fix is a `special_hours` row in the management app, which is production data in the other repository and needs explicit owner approval.

## Wave 2: minimum party size 4 on Tuesday to Thursday

- [x] `lib/christmas-season.ts`: replace the single `CHRISTMAS_MINIMUM_PARTY_SIZE` with a midweek value (4, Tuesday to Thursday) and a weekend value (6, Friday and Saturday), plus `getChristmasMinimumPartySize(isoDate)`.
- [x] Update `docs/SSOT.md` and `SSOT.json`.
- [x] `app/api/enquiry/christmas/route.ts:531-539`: server validation must use the minimum for the requested date, not a flat 6.
- [x] `app/christmas-parties/client-components.tsx`: the form's `min` and its error copy follow the selected date.
- [x] Fix every page that states a flat "6 guests or more": `/christmas-parties`, `app/page.tsx:287`, `app/corporate-events/page.tsx:245,514`, `app/food-menu/page.tsx:359`, `app/beer-garden/page.tsx:401`.
- [x] Tests for the boundary: 4 accepted on a Wednesday, rejected on a Saturday.

**Decision recorded:** Sunday keeps the 6-guest minimum. The owner approved "Tuesday to Thursday" only, and `docs/SSOT.md:288` defines weekday as Tuesday to Thursday and weekend as Friday to Saturday, leaving Sunday undefined. Sunday is left unchanged rather than assumed.

**Confirmed self-contained:** the Christmas path is an enquiry, not a table booking. The management app never had the Christmas booking type built, so the minimum is enforced only in this repository (`route.ts:538`). No paired change is needed.

## Wave 3: drinks-only and 21 to 29 guest wording

- [x] Drinks-only Christmas party: state that there is no minimum spend and that it is arranged as a private booking so the pub can confirm nothing else is needed.
- [x] 21 to 29 seated guests: explain that it is handled as a private booking because of the no-show exposure at that size, worded as a service rather than a refusal.

## Wave 4: the two noindexed blog posts

- [x] `content/blog/christmas-events/index.md`: rewrite to 2026 facts, remove `noindex`, add to `app/sitemap.ts`.
- [x] Verify live after deploy that it returns an indexable robots tag.

**Blocked, not started:** `content/blog/christmas-market/index.md`. `GET /api/events` returns no market for 2026. The three confirmed festive events are Tinsel and Trivia Quiz Night (2 December), Sleigh My Name Festive Music Bingo (11 December) and Christmas Jackpot Cash Bingo (16 December). Publishing a "come to our Christmas market" page for an event that is not in the system would be inventing an event, which the house rules forbid. It stays noindexed until the owner confirms a 2026 market.

## Gates

Each wave: `npx tsc --noEmit`, `npm test`, `npm run test:utc`, `npm run lint`, then commit.
Final: `npm run build`, and browser verification of `/christmas-parties`.

---

## Status, end of 6 September 2026

All four waves complete on branch `fix/christmas-last-day-and-ssot-prosecco`, five commits, **not pushed and not deployed**.

Gates on every wave: typecheck clean, 1,906 tests passing in both Europe/London and UTC, lint clean, production build clean, and the pages verified in a browser.

### Carried forward, needing the owner

1. **A `special_hours` row for 2026-12-25 in the management app.** 25 December is a Friday and there is no record, so the site resolves it to regular Friday hours with a kitchen open until 21:00. The website now says drinks only 12pm to 3pm, so the two sources currently disagree. This is production data in the other repository.
2. **`/blog/christmas-market` stays noindexed.** No 2026 market exists in the events data.
3. ~~`content/blog/christmas-events/hero.jpg`~~ **Deleted 6 September 2026 at the owner's instruction.** It was a Christmas 2023 schedule graphic advertising Christmas karaoke and a Christmas market, still serving HTTP 200 at its public URL. Nothing referenced it after the post was rewritten.
4. **Sunday's minimum party size** stays at 6, unchanged and unassumed.
5. **Boxing Day, Christmas Eve and New Year's Day** hours remain unconfirmed and are stated nowhere.
