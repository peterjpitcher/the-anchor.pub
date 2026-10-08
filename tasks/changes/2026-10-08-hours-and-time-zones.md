# Opening hours and time zones, 8 October 2026

Branch `fix/hours-and-time-zones-p20`. Website only. Source: work package P20 of the 7 October 2026 site review (findings DT-008, DT-016, HT-001, HT-004, HT-006, HT-007, HT-009, HT-010, HT-011, HT-012, HT-014, HT-015, HT-017, HT-018, HT-019, HT-022 and PY-010), with the checker's correction for HT-007 and the recorded defaults for HT-004 and HT-014.

The pub is seven minutes from Heathrow, so a visitor's phone is often not on UK time. Every fix below makes a time, a day or a date read from the pub's clock in London, not from the device or the server. Each has a test with the clock pinned, on 25 October 2026 and 28 March 2027 where the fault is about dates.

## 1. The header's "Bar: Opens at" line (HT-001)

- [x] `components/layout/StatusBar.tsx` compares London minutes with London minutes, the rule the kitchen line in the same file already followed. It used to build the opening time with `Date.setHours`, which reads the device's clock: a phone on Sydney or Los Angeles time was told "Opens tomorrow at 12pm" at 6am on a Monday, when the bar opens at 4pm that day.
- [x] Test: `tests/unit/StatusBar.opens-line-london.test.tsx`, 11 cases, including both 1:30am readings on 25 October 2026 and either side of the change on 28 March 2027.

## 2. The "Next Event" card (HT-007, DT-016)

- [x] "Today", "tonight" or "tomorrow" is chosen on the London calendar. It was chosen from the hours left, so a 7pm event read "Happening tomorrow" from midnight until 7am on the day itself. An event starting at or after 5pm is "tonight"; an earlier one is "today".
- [x] The weekday, the date and the start time on the card come from the event date helpers in `lib/event-calendar.ts`, so they are London's. They were formatted with no time zone, which in a browser is the visitor's own: a 7pm quiz showed as 14:00 on a phone on New York time. This covers `getWeekday` as well, as the checker asked.
- [x] The time now reads "7pm", the form used on the event pages, where it read "19:00".
- [x] Test: `components/__tests__/event-countdown-wording.test.ts`, 13 cases.

## 3. The parking form (HT-009, PY-010)

- [x] The arrival and departure boxes are UK time. They are filled, read, sent and printed back through new London helpers in `lib/time-london.ts` (`londonWallClockToInstant`, `toLondonDateTimeLocal`, `formatLondonDateTime`). A phone on New York time used to send a typed 10:00 as 15:00 in London, show 10:00 in the summary, and the guest found out on the confirmation page after paying.
- [x] Both boxes are labelled "UK time".
- [x] The same instants go to the availability check, the payment order and the on-page estimate, so the estimate is worked out on the hours the booking system will price.
- [x] The hour that happens twice on 25 October is read as its first pass. The hour that does not exist on 28 March is read as the same time an hour later, as a phone's clock shows it.
- [x] Tests: `tests/unit/time-london-wall-clock.test.ts` (36 cases) and `tests/unit/parking-wizard-uk-time.test.tsx` (8 cases, including a stay across each clock change).

## 4. Event pages said "This event has ended" from the minute it started (DT-008)

- [x] New `isEventOver()` in `lib/event-calendar.ts`, keyed to the finish: the record's end date, or its start plus its duration. A record with neither is treated as running for three hours, the rule the fixture lists already use.
- [x] The "ended" notice, "It took place on ...", the past form of the title, the share image's "Event ended" line and the "recent or archived" stage all wait for the finish. They follow from `getEventPresentation`, so the page, the title and the structured data cannot disagree.
- [x] Booking still closes at the start, exactly as before: the form, the policy card, the booking FAQs, the "Ready to book" band, add-to-calendar, the places-left badge and the offer in the structured data all stop at the start time.
- [x] Between the start and the finish the booking panel says "This event has started, so online booking has closed." It used to say "This event has already taken place."
- [x] A night that never took bookings keeps "No booking is needed for this event, just turn up!" while it is on. That is still true, and the event pages change merged today (PR #227) would otherwise have swapped it for the "taken place" line from the start time.
- [x] Test: `tests/unit/event-over-not-merely-started.test.ts`, 17 cases, including a party that runs through the repeated hour on 25 October 2026.

## 5. Booking form wording (HT-014, HT-015)

- [x] Dates in the booking summary and confirmation read "Sunday 25 October 2026". They read "Sunday, October 25, 2026". Recorded default: British order (SSOT section 1).
- [x] The hours line says "Kitchen closed on this date". It said "Kitchen closed today" whatever date was chosen.
- [x] Test: `tests/unit/booking-date-and-hours-note.test.ts`, 16 cases. It also pins that a special day with `kitchen: null` reads as closed, with or without the `is_kitchen_closed` flag.

## 6. Smaller date calls (HT-018)

- [x] `/api/events` defaults `from_date` to London's date. It was the UTC date, which is yesterday in London between midnight and 1am in summer.
- [x] `lib/api/client.ts`: the "recent events" look-back and the client's own date helper use London's date. The helper's fallback to the UTC date is gone.
- [x] The private hire estimator's earliest date is tomorrow in London.
- [x] `lib/menu-page-data.ts` takes the year from London.
- [x] `lib/time-london.ts`: `londonRangeToInstants`, `isLondonDateInRange` and `getLondonTimeString` are deleted. Nothing called them, and the first was documented as London midnight but returned UTC midnight. `parseLondonDate` keeps its behaviour (21 callers use it as a calendar-date anchor) and its comment now says what it returns.
- Already done on main before this branch: the Halloween end time and the Christmas pop-up dates carry explicit offsets, the footer year is fixed, and `lib/managers-special-utils.ts` went with the Manager's Special page.

## 7. Unused hours code removed (part of HT-011)

- [x] Deleted: `lib/hero-context.ts` (it still read the flattened kitchen span), `lib/status-bar-utils.ts`, `hooks/useBusinessStatus.ts`, `hooks/useKitchenStatus.ts`, and the eight unused functions in `lib/time-utils.ts`, one of which said "in UK timezone" and read the device clock. `lib/christmas-season.ts` now formats its two times with the one remaining formatter.
- [x] Four StatusBar tests no longer mock the deleted hook. `tests/unit/hero-context.test.ts` went with its module.

## 8. Tests on the clock-change dates and on a visitor's device (HT-019)

- [x] `tests/unit/WeekHours.clock-change.test.tsx`: the week table names the right "today" at 13 instants across both weekends, and shows each weekday once (15 cases).
- [x] New script `npm run test:zones`. It runs the hours, header, event card, event page, parking and date suites as a phone in Sydney and as a phone in Los Angeles. `npm test` (London) and `npm run test:utc` (UTC) only cover the business and the server; a device-clock fault needs a third zone to show.

## Gates

On the final tree, rebased on `main` at `51eecd14` (PR #227, event pages), Node 20.19.5:

| Gate | Result |
|---|---|
| `npm run lint:next` | No warnings or errors |
| `npx tsc --noEmit` | Clean |
| `npm test` (London) | 315 suites, 5,348 passed, 1 skipped |
| `npm run test:utc` | 315 suites, 5,348 passed, 1 skipped |
| `npm run test:zones` (Sydney, then Los Angeles) | 17 suites, 226 passed, in each |
| `npm run build` | Passed, 242 pages |

## Not done here, and why

- **HT-011, the rest.** `WeekHours`, `BusinessHours`, `StatusBar` and `lib/status-boundary-calculator.ts` still each resolve "special day or regular day" themselves, and there are still two copies of the dated-schedule logic for structured data. No wrong hours are on screen. Moving them onto `getEffectiveDayHours` changes how a special day with no times of its own is read in the header, so it is its own change with the existing suites as the safety net, as the finding says.
- **HT-012, page refresh times.** Not changed. Pages rebuild about every five minutes, set by the five-minute cache in the root layout; the one-hour and 24-hour values written in four page files do not apply. Removing them changes nothing a visitor sees, and those page files are open on other branches today.
- **HT-022.** Already done: the old parking status page was deleted on 8 October (`2026-10-08-owner-answers.md`).
- **Blog dates (part of HT-018).** `app/blog/page.tsx` and `app/blog/tag/[tag]/page.tsx` format a post's date with no time zone. They run on the server and are right in London and in UTC. Left for the blog package, which has those files open.
- **The week's parking price across the clock change (HT-008, PY-011).** Package P08. This branch sends the true instants, so a week that spans 25 October is still 169 hours to the booking system.

## Needs the management app

Checked against its `main` at `c764cd8e` (8 October 2026). All four still stand.

- **HT-004.** A special day saved with blank kitchen times borrows the normal day's kitchen hours for bookings (`src/services/business-hours.ts`, `getKitchenWindowForDate`, and the `COALESCE(sh.kitchen_opens, bh.kitchen_opens)` in `check_table_availability_v06` and `create_table_booking_core_v06`), while the hours feed sends `kitchen: null`. Recorded default: blank means closed. Needs the admin form to refuse blank kitchen times unless "kitchen closed" is ticked, a migration for the two functions, and a list of existing special days it would change. The website already reads `kitchen: null` as closed everywhere, with `??`, and section 5 pins it.
- **HT-006.** `GET /business/hours` sends special hours for the next 90 days only (`getLocalIsoDateDaysAhead(90)`), and the window does not move when `?date=` is sent. Tables can be booked 12 months ahead. Needs the special-hours row for the requested date returned as well. No website change once it arrives. Times are never over-offered meanwhile, because slots come from the management app.
- **HT-010.** The feed's `timestamp` is London wall time labelled UTC (`nowInLondon.toISOString()`), and two filters use the UTC date for "today" (`format(now, 'yyyy-MM-dd')`). Nothing on the website reads `timestamp` any more: its two readers were deleted in section 7.
- **HT-017.** `event-guest-engagement` builds its run key from the London wall clock, so the four runs in the repeated hour on 25 October 2026 are skipped. Needs the key built from UTC, as `parking-notifications` does. It falls inside the 9pm to 9am no-text window.

The same defect, looked for in the management app for each website fix:

| Website fix | Management app |
|---|---|
| Header opens line on the device clock | Not present: its status is worked out on the server with London helpers. |
| Event card day word and times | No equivalent surface. |
| Parking times read on the device clock | Its staff parking form already converts as London time (`src/lib/dateUtils.ts`). Its guest parking page was not opened. |
| "Ended" from the start time | Not checked: its event screens are staff-only and outside the export's reviewed set. |
| American date order | Already British since 27 September 2026 (`src/lib/dateUtils.ts`). |

## Assumptions

1. An event at or after 5pm is "tonight"; before that it is "today".
2. An event record with no end and no duration runs for three hours. The same figure is used by the fixture lists.
3. "This event has started, so online booking has closed." states only what the page already enforces. It makes no promise about turning up.
4. The repeated hour on 25 October is read as its first pass, and the missing hour on 28 March as an hour later.
5. The management app column in the table above rests on the review's reading of its export, apart from the four findings re-checked on its `main` today.

## Proof the tests catch the fault

The header and parking tests (19 cases) were run against the old `StatusBar.tsx` and the old parking form: 1 failed in London, 7 in UTC, 13 as a phone in Sydney and 14 as a phone in Los Angeles. On this branch all 19 pass in all four.
