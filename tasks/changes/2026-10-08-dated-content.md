# Dated content and things that change by themselves (P13), 8 October 2026

Branch `fix/dated-content-p13`. Website only. Source: the 7 October 2026 site review, package P13, with the checkers' corrections, owner decisions 18 and 19 and owner fact 40. The hero contrast findings AX-005 and AX-006 from package P18 are included because the frost has a 1 November date.

## What changed

- [x] **Halloween (DT-002, C1-017).** One clock read in `lib/seasonal/halloween.ts` now drives the title, description, both social cards, the hero, the body, the closing band and every question and answer. After 00:30 on 1 November the page says the party has been and gone, with no date, time, theme or food times. The "been and gone" line has its own block: it used to sit inside a component that renders nothing without details. The 7 October quiz is out of the answers. "Cheeky" is out of the copy.
- [x] **Christmas kitchen closure (DT-001, C1-004, C3-021).** New `lib/festive-kitchen-closure.ts` reads the two dates already in `SSOT.json` (last service 20 December, back 12 January) and builds the approved kitchen sentence from them.
  - `/new-years-eve` works its food lines out: the live hours row for 31 December first, then the SSOT closure, otherwise no food promise at all. "We usually serve food earlier in the evening" and "book your table if you're planning to dine" are gone.
  - The homepage has its own copy set from 21 December to 11 January, with no roast, lunch, menu chip or menu button.
  - `/sunday-roast`, the homepage roast card and the roast block on `/food-menu` carry the kitchen sentence from 30 days before the last service day until the kitchen is back.
  - Sibling answers on `/horton-pub`, `/sunbury-pub`, `/near-heathrow` and `/restaurants-near-heathrow`, and the header menu, say "on Sundays" in place of "every Sunday".
- [x] **Nations Championship (DT-003, decision 18).** From 30 November the route renders a year-neutral page in the style of the Six Nations one: no year, fixture, date or "book for this game" button. It closes on the same window as the header link and the strips.
- [x] **Corporate events (DT-004).** The Christmas window, the dated answer and the "See Christmas Booking Dates" button go once no Christmas date can still be booked (from 20 December).
- [x] **Hero text and festive frost (AX-005, AX-006, decision 19).** `lib/hero-scrim.ts` holds the dark wash at 0.82 or more under the whole text column, the level at which every text style in the hero reads at 4.5:1 over a pure white photo. The column is capped at 760px from 1024px up, so the photo still shows to its right. The frost is drawn under the wash on interior heroes. Sand badges in a hero get a solid fill, and the breadcrumb goes from 72% to 90%.
- [x] **Valentine's (C1-018, DT-007).** With nothing in the diary the page is a plain holding page and the header link stays off. The link shows only when a Valentine's event is listed.
- [x] **Mother's Day, Easter Sunday, Father's Day (DT-006, SM-008, C1-019, fact 40).** Dates are worked out in `lib/recurring-dates.ts` and move on the morning after. The Event structured data is removed from all three (and with it the Father's Day offer that had no price). Each page says the day's menu is confirmed nearer the time, and the "what is on the menu" answers say the same. SSOT section 10 records it.
- [x] **Christmas page (C1-023, C1-047).** "Food before it starts", and no promise of an evening sitting: sitting times follow the kitchen's hours on the day.
- [x] **Festive buffets (C1-049).** Left off the shared catering card on the nine year-round occasion pages, matched by name.
- [x] **Summer garden parties (C3-030).** Names the Indoor BBQ package from the catering list, with its minimum read live. The manned grill, outdoor bottle bar, part-garden hire and "BBQ Hire" are gone.
- [x] **Karaoke (C3-033).** Worded as occasional in the header, the homepage and the history page.
- [x] **Music bingo (DT-009).** The series end date rolls like the quiz and cash bingo ones.
- [x] **Footer year (DT-011).** Passed in from the layout as the London year; the footer no longer reads the clock.
- [x] **Live sport (DT-019).** The undated ScreeningEvent block is deleted.
- [x] **Christmas year labels (DT-014, part).** "Christmas 2026" on the page kicker, the booking badge and the cross-link is built from the window's year. The pop-up's two dates are now London instants.
- [x] **Comments (DT-018, part).** Three comments said pages are built once per deploy. They now say what happens: every page is rebuilt on a five-minute timer, when somebody visits.

## Things that now change by themselves

| When (London) | What |
|---|---|
| 1 November 2026, 00:30 | `/halloween` switches to "been and gone" |
| 20 November 2026 | The kitchen sentence appears beside the Sunday roast promises |
| 30 November 2026, 00:00 | `/live-sport/nations-championship` turns year-neutral |
| 20 December 2026, 00:00 | `/corporate-events` drops the Christmas window and button |
| 20 December 2026 | The Valentine's header link may show, only if an event is listed |
| 21 December 2026, 00:00 | Homepage switches to the festive break set; roast notices say "No roasts just now" |
| 1 January 2027, 00:00 | Music bingo series end date rolls to 31 December 2028; `/new-years-eve` stops quoting the 2026 closure and makes no food promise |
| 2 January 2027 | Homepage drops the Boxing Day and New Year's Day line |
| 12 January 2027, 00:00 | Homepage returns to January's set; roast notices go |
| 8 March 2027 | `/mothers-day` moves to 26 March 2028 |
| 29 March 2027 | `/easter-sunday` moves to 16 April 2028 |
| 21 June 2027 | `/fathers-day` moves to 18 June 2028 |

Every page is rebuilt at most five minutes after a visit (checked in the build's prerender manifest: 300 seconds on each of these routes), so a switch shows within five minutes of the first visit after it. The Nations and Valentine's pages are rendered on every request.

## Assumptions

1. The roast notice starts 30 days before the kitchen's last service day. Nothing on file sets that lead time.
2. After Halloween, and after the Christmas window on `/corporate-events`, the page promises nothing about next year beyond "once it is confirmed".
3. The festive break set keeps "Book a table" as the homepage's main button, because the bar is open and a table can still be booked for drinks.
4. The year-neutral Nations page says "We show Nations Championship games that are on BBC, ITV or Channel 4, during our usual opening hours", which restates SSOT section 10 using the channel names from section 16.
5. Festive buffets are recognised by a name that starts with "Festive", until the public config carries the management app's seasonal flag.
6. On the occasion pages, the menu line is the owner's fact 40 in customer words: "It may be our Sunday roast, or a set menu for the day."
7. The hero contrast fix is proved by arithmetic (worst case, a pure white photo), not by re-running the review's pixel measurement. It was looked at in a browser at 1280px and 375px.

## Not done here

- **DT-005, Manager's Special.** Handled on another branch, which retires the page and function (decision 32).
- **DT-020, nothing in the diary after 16 December.** Management app data.
- **DT-010, job adverts end 12 May 2027.** Waits for the date register proposed in DT-017.
- **DT-012, typed sitemap dates.** Not started.
- **DT-013, "2026" in guide titles and brochure labels.** Not started.
- **DT-014, the rest.** The SSOT block is still named `christmas_2026`, so a 2027 window needs a code change as well as the SSOT.
- **DT-018, the rest.** Letting production builds read the events feed, and a request to the date-sensitive pages just after midnight, are platform settings.
- **C1-052.** Superseded by DT-018: the pages already rebuild every five minutes, so adding a one-hour setting would do nothing.
- **Occasion pages' body copy.** `/mothers-day`, `/easter-sunday` and `/fathers-day` still describe the Sunday roast and its 1pm to 6pm service below the new menu line. That is a content pass.
- **Homepage hero.** Its frost still sits on top of its wash. Its text is centred, and the review did not list it.
- **C1-049, the proper fix.** Returning the seasonal flag in the public private-booking config is a management app change.

## Checks

- `npm run lint:next`: no warnings or errors.
- `npx tsc --noEmit`: clean.
- `npm test` (Europe/London): 289 suites, 4,820 tests passed, 1 skipped.
- `npm run test:utc`: 289 suites, 4,820 tests passed, 1 skipped.
- `npm run build`: passed.
- `npx jest tests/ssot-drift-guard.test.ts`: 87 passed.
