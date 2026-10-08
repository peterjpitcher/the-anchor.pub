# Event pages and event records (P14), 8 October 2026

Branch `fix/event-pages-p14`. Website only. Source: the 7 October 2026 site review, package P14, with the checkers' corrections and owner facts 26 and 33. Nothing in the management app was changed: the record corrections were handed to the owner as one list for approval.

## What changed

- [x] **A cancelled night is never said to have taken place (C2-008).** `lib/event-copy.ts` asks whether the night ran before it asks whether the date has passed. A cancelled night, past or still to come, reads "<name> was cancelled. It was due on <date>." in the page description, the share card, the hero and the structured data. A postponed night whose listed date has gone is treated the same way. The facts strip has a third set of labels for these nights ("Was due on", "Entry", "Planned start"), and the closing band says "This night was cancelled."
- [x] **Finished nights no longer invite anyone (C2-023).** Five places:
  - The check for sales copy reads both kinds of apostrophe, treats any exclamation mark as sales copy and knows "get your tickets" and "join". A finished night whose stored summary is an invitation leads with "<name> took place at The Anchor on <date>."
  - A long summary is cut at a whole word.
  - The share card of a finished or cancelled night uses the same dated title as the page, not the record's sales title, and the same past-tense description.
  - A finished night that never took bookings says "This event has already taken place", not "just turn up". "Past" is now answered before "no booking needed" and "sold out".
  - The cancellation policy block and the "Arrive from" badge show only while the night is still to come.
- [x] **Recent nights (C2-007).** The "recent nights" strip on What's On and the full archive ask only for nights that ran, and drop a cancelled or postponed night even if the management API sends one. The strip's cards no longer print a finished night's sales line.
- [x] **Places, not seats (C2-024).** A general-admission night counts "places": "140 places available", "Only 4 places left". Seated and communal nights still count seats.
- [x] **Template wording (C2-040).** A plural category ("Parties", "Celebrations", "Tasting Nights") is no longer dropped into a sentence built for "Quiz Night". The next date is named by its event ("Next up: <event>, <date>"; "The next one is <event> on <date>"). With no next date the page says to see what's on and no longer points "below". Cards under an event show "£3", as the page's own facts do. The address block prints "The Anchor". The details row is "Host".
- [x] **Formatting marks (C2-041).** Event copy has bold marks, link addresses and a pasted "Long description:" label taken out before it is shown, in the description, the highlights and the questions and answers.
- [x] **Old event addresses (FD-003).** Nine old addresses redirect to the page the night lives on now, in `config/redirects/additional-redirects.json`, with an end to end test in `tests/seo-indexing.test.ts`. Two from the same log are left as "not found" because nothing says where they went: `/events/tasting-night-2026-12-11` and `/events/cash-bingo-2026-10-21`.
- [x] **Cash bingo page (C2-002, C2-026, fact 33).** The badge reads "Cash jackpot on the last game". The four lines that sent readers to "the event listing below" for the Snowball figure now say it is on that night's own page. The page states the Snowball rule and never the amount, which changes at every cash bingo night.
- [x] **Themed quiz page (C2-022).** The description names no night. "How that night went" is "See that night's page". "A few times a year" is "now and then"; the "most of our themes" sentence is cut; the seasonal quizzes are described without their names.
- [x] **What's On headings (C2-039, part).** "Dates to plan ahead for" and "More to do at The Anchor".
- [x] **Tasting night (C2-015, fact 26).** New `lib/event-age-rule.ts`. Every night in the tasting category shows "Over 18s only" as a hero badge while it can be booked and as an "Age" row in the details, and its structured data carries the age range. The rule is the format's, from SSOT section 10, so it does not depend on each record.
- [x] **Capacity on finished nights (C2-050, website part).** The structured data of a finished or cancelled night no longer carries a capacity or the record's short sales line. Upcoming nights are unchanged.

## Already done before this change

- C2-039, the search-cluster cards: they print a description written for readers, not the internal targeting note (shipped with the blog template work).
- C2-047, website part: the "Football on big screens" blog post is retired and redirects.
- C2-050, SSOT part: section 10 and `SSOT.json` mirror the quiz at 49 seats and cash bingo at 60, pulled 7 October 2026.
- Fact 26 and fact 33 in the SSOT.
- Refund bands beside ticket buttons (decision 3): shipped in PR #213 through `EVENT_TICKET_REFUND_WORDING`. Checked, not duplicated.

## Left for other packages

- `lib/business-hours-fallback.ts` still says hours are "loading from the management system" (C2-039). It is hours code, so it belongs to P20.
- Four location pages introduce their link cards with "searches before you visit" or "before you book": `/feltham-pub`, `/staines-pub`, `/windsor-pub`, `/wraysbury-pub`. Same fault as the What's On heading, outside the event pages.
- The cash bingo page still carries the three lines P11 owns (spot prizes, two planned pauses, tied games split evenly) and the private fundraiser answer.

## Assumptions

- A redirect is added only where one current event is plainly the same night under a new address. Three of the nine moved by a day or two (karaoke 19 to 18 September, music bingo 11 to 13 November and 9 to 11 December); each is the only night of its kind that month.
- An exclamation mark in a stored summary marks it as sales copy. A neutral summary without one is still kept on a finished page.
- "Host" suits every record today: the owner on quiz, cash bingo and tasting nights, Nikki Manfadge on music bingo, DJ Jermaine on the party.
- A category name ending in "s" is read as plural.

## Files

`app/cash-bingo/page.tsx`, `app/events/[id]/page.tsx`, `app/quiz-night/themed/page.tsx`, `app/whats-on/page.tsx`, `components/events/EventBookingFactsStrip.tsx`, `components/events/RelatedEvents.tsx`, `config/redirects/additional-redirects.json`, `lib/api/events.ts`, `lib/event-age-rule.ts` (new), `lib/event-booking-experience.ts`, `lib/event-copy.ts`, `lib/event-lifecycle.ts`, `lib/event-presentation.ts`, `lib/game-nights/cash-bingo.ts`, `lib/structured-data/event-schema.ts`, `lib/text/normalise-api-prose.ts`, `tests/seo-indexing.test.ts`, `tests/unit/event-pages-site-review.test.tsx` (new).
