# Book a Table: everything still outstanding

Date: 2026-08-03
Status of the wider project: the two-screen booking flow, the 12-month cap, the outside-reservation fix and the seasonal/Christmas backend are all SHIPPED and live. This document covers only what remains.

Live commits: AMS `eb39664e`, website `3a9ad48d`. Migrations applied through `20260803000200`.

---

## The one that matters: Christmas cannot be booked online

**Verified 2026-08-03:** the website contains no reference to `booking_period`, `bookingPeriod` or the `/periods` endpoint anywhere in `app/`, `components/` or `lib/`. The entire seasonal feature is backend-only.

What that means in practice:
- A guest on the website is never asked "is this a Christmas dinner booking?"
- They cannot see or choose from a Christmas pre-order menu.
- They are never quoted or charged the Christmas deposit.
- Staff can take a Christmas booking through the FOH `christmas` purpose; the public cannot.

Adding your dates and menu in Settings will make the period active and correct, but **no guest will encounter it** until W1 below is built. This is the difference between the feature being configured and the feature earning money.

---

## W1. Guest-facing seasonal flow (website). Effort: L. Blocks all online Christmas revenue.

### What exists to build against
- AMS endpoint: `GET /api/table-bookings/periods?date=YYYY-MM-DD[&party_size=N]`, auth `withApiAuth(..., ['read:table_bookings'])`, the same API-key check `/api/table-bookings/load` uses.
- Response: `{ date, period, deposit }`. `period` is `null` when nothing is live, and an inactive period is indistinguishable from none. `period` carries `bookable`, `not_bookable_reason`, `not_bookable_message`, `menu`. `deposit` carries `collect` plus `if_accepted`, `if_accepted_rejection` and `if_declined`, because the guest has not answered yet.
- Both create RPCs already accept `p_booking_period_id` and `p_booking_period_answer`, defaulted, and price server-side. The website create proxy must forward the answer and **must never send a figure**.

### Build
1. **Ask the question.** When the chosen date returns a live period, render its `guest_question` above the slot grid on screen 1, as a yes/no choice. "No" must always be available: a guest saying no gets the normal menu at normal terms (owner decision). Keep the answer keyed to period id AND date, and reset it whenever either changes.
2. **Honour `bookable: false`.** Show `not_bookable_message` plainly and do not offer the period. The common case is a period that requires a pre-order and has no menu items yet, which is exactly the state Christmas is in until the menu is added.
3. **Pre-order.** When `requires_preorder` and the guest answers yes, collect a menu choice per guest before confirmation. Reuse the retired Sunday-lunch pre-order shape rather than inventing one; it was deliberately kept for this.
4. **Deposit and terms.** Show the amount from `deposit.if_accepted` and the refund wording verbatim from the endpoint, before Confirm. Never recompute the figure client-side. Respect `deposit.collect`: when false, no deposit is quoted or taken.
5. **Create.** Pass `booking_period_id` and `booking_period_answer`. The response's `deposit_amount` is authoritative; display that, never a locally computed figure. (This exact defect was found and fixed on the AMS side: the route charged £30 and told the guest £0.)

### Acceptance
- A guest booking 12 December with Christmas active and a menu present is asked the question, chooses dishes, is quoted £10 per head, and the confirmation figure equals the charged figure.
- The same guest answering "no" is charged nothing extra and sees the normal flow.
- With the deposit kill switch off, no deposit is quoted or taken, and the group rule still applies to parties of 10 or more.
- With Christmas inactive (today's state) the website behaves exactly as it does now.

---

## W2. FOH staff screen for non-Christmas periods. Effort: M.

Staff can currently only create a seasonal booking via the `christmas` purpose. The FOH API accepts `booking_period_id` and `booking_period_answer`, but no FOH screen sends them, so **Mother's Day, Easter and Father's Day are unusable by staff** even once configured.

Build the same question into the FOH create-booking modal, driven by the period returned for the chosen date. Christmas continues to work through its existing purpose; do not break that path.

---

## W3. Decide what an amendment does to a seasonal deposit. Effort: S once decided. Owner decision required.

Today, changing the party size on a booking that carries a `booking_period_id` **refuses and warns** rather than re-pricing. Money already taken stays taken and staff correct it by hand.

That was deliberate: when the groups-of-10 rule beat the seasonal one, the booking's snapshot records the *group* basis and rate, so the period's rate is not there to re-apply, and reading it back off `booking_periods` would price the guest against terms a manager may have edited since.

**Owner decision:** should shrinking a party refund the difference automatically, or stay a manual correction? Recommendation: **keep it manual for the first season**. Automatic refunds on amendment is a money path with no operational history behind it, and the warning makes the over-collection visible rather than silent.

---

## W4. Delete the old four-step booking path. Effort: M. Do this only once the new flow is proven.

The old path still ships behind the `booking_options_step1` flag, which is currently on. That was the agreed safe order: prove the new flow, then remove the old.

The redesign left a precise removal list:
- In the form: the `twoScreenFlow` prop and all 19 branches on it, the `step === 'choose'` and `step === 'review'` blocks, the `!twoScreenFlow` find and details blocks, `handleContinueToReview`, `handleBackToFind`, `requestedTime`, `showAllTimes`, `slotWindowAnchorTime`, `visibleSlots`, `hideHighChairPicker`, and the `slotsStep` / `reportSlotDropped` forks.
- In `journey.ts`: `STEP_ORDER`, `STEP_LABELS`, the `'choose'` and `'review'` members, and rename `TWO_SCREEN_*` to plain names.
- `BookingProgressBar`'s `stepKeys` / `stepLabels` defaults.
- `lib/table-booking-slot-window.ts` and its test become dead.
- `app/book-table/page.tsx` loses the flag read.
- `hideWhenNoHighChairFree` on the judge context becomes a constant.
- `coversHighChairRequest` on `SlotVerdict` (`lib/table-booking/selection.ts:61`) has no production consumer at all today. Delete it in the same pass.

**The real work is `tests/unit/ManagementTableBookingForm.test.tsx`.** It cannot simply be deleted: its idempotency-key, London-timezone, busyness, funnel-sequence, stale-alternatives, food-check-notice, purpose-derivation and phone-privacy tests all still describe live behaviour and need two-screen equivalents first.

**Do not start this until the flag has been on through at least one full weekend**, including a Saturday lunch and a Sunday, because the rollback disappears with it.

---

## W5. Two pre-existing defects, confirmed real, deliberately not fixed. Effort: S each.

Both were proved by running code during the redesign review, both are **pre-existing on `origin/main`** and were not caused by this project. They were left alone because widening scope at a release gate is what caused two earlier rounds of regressions.

1. **A date change never supersedes an in-flight availability request.** `handleDateChange` does not abort or outdate a search already running, so a slow answer for the old date can land after the guest has moved on.
2. **"No online times available" appears for a date whose times are listed directly below it**, reachable by choosing a nearest alternative and then pressing Back.

Neither breaks a booking; both look wrong.

---

## W6. Retire the dead `kitchen_open` field. Effort: S.

`kitchen_open` still travels to the browser and now decides nothing: `bookable_purpose` replaced it. It is marked informational only in both the shared type (`lib/api/bookings.ts:11`) and the form.

A dead field that once decided what got booked is exactly the thing someone re-trusts in a year. It is produced by the shared local slot builder and emitted by `lib/api/client.ts`, so removing it touches more than the form. Fold it into W4.

---

## W7. Analytics thresholds and monitoring. Effort: M. Never built.

The funnel events exist and fire (`booking_step_viewed`, `option_toggled`, `slot_flag_shown`, `slot_invalidated`, `booking_error_shown`), and carry no personal data. What was never defined:

- **Go/no-go thresholds.** The original review's F22 asked for event schemas, an exposure event, deduplication, funnel denominator, minimum sample, target change and a payment-success guardrail. None exist, so "the new flow is better" cannot currently be judged, only felt.
- **Operational alerting.** F35: nothing watches availability coming back `unknown`, shown-available versus create-blocked mismatches, payment setup or capture failures, expired holds, webhook delays, or seasonal validation failures. Today these surface as customer complaints.

The seasonal deposit path makes the second one materially more valuable, because a silent payment failure is now a real possibility.

---

## W8. Test-suite hygiene. Effort: S.

1. **Nine tests only pass on UK time.** `npm test` fails on any machine not set to Europe/London; `TZ=Europe/London npm test` is green (584 files, 4,274 tests). They are leave and invoice tests unrelated to booking. Either fix the tests or pin the timezone in the Vitest config. Pinning is the safer one-line answer.
2. **One `describe.skip` block** in `tests/unit/ManagementTableBookingForm.test.tsx`, pre-existing, skipped for a jsdom async-ordering reason that still holds. Revisit when W4 rewrites that file.
3. **`tests/fixtures/table-availability-contract.json` must stay byte-identical across both repos.** Nothing enforces that automatically. A CI check comparing hashes is worth adding if the two ever build together.

---

## Suggested order

1. **W1** immediately. Christmas earns nothing until it exists, and it is the only item with a real deadline. Working backwards from a menu published in October, this wants to be built and tested in September at the latest.
2. **W2** alongside W1, since both are the same question rendered in two places.
3. **W3** decide now, build with W1.
4. **W7** before W4, so the old path is removed on evidence rather than on a feeling.
5. **W4 and W6** together, after a full weekend on the new flow.
6. **W5 and W8** whenever convenient.

---

## What needs no work

For the avoidance of doubt, these are done, live and verified against production:

- The two-screen booking flow, driven end to end in a real browser.
- The 12-month booking cap, enforced server-side in both proxies, boundary verified.
- Availability answering correctly on a kitchen-closed Monday (12 drinks-only slots).
- The outside-reservation fix, so a garden walk-in actually holds a table.
- The seasonal backend: data model, deposit resolution, refund arithmetic, manager settings screen, kill switch, and the Christmas period seeded inactive at £10 per head for 10 Nov to 20 Dec 2026.
- All of the Phase 1 defect fixes, including the customer-data exposure and the four truncated idempotency keys.
