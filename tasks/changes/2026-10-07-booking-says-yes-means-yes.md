# A booking that says yes must mean yes (P03)

Date: 7 October 2026. Branch: `fix/booking-says-yes-means-yes`. Website only.

Source: the site review of 7 October 2026, package P03 (findings WP-001, WP-010, WP-011, PY-001, PY-003, PY-020, MG-001, MG-010, HT-003, HT-016, with the checkers' corrections for PY-003 and HT-003).

## What changed

### 1. Quick booking sheet reads the state of the booking

`components/features/TableBooking/QuickBookSheet.tsx`

The management app answers a refused booking with HTTP 200, `success: true` and `data.state: 'blocked'`. The sheet read only the status and the success flag, so a refusal reached the "You're booked in." screen.

- `confirmed`: the done screen, and the two completion events. Nothing else reaches either.
- `blocked`: the copy for `blocked_reason` from `lib/table-booking/submission.ts`, with the phone number as a link, shown above the time grid. The grid reloads, because the times the guest chose from are now known to be stale. The idempotency key is dropped, since nothing was created.
- `pending_payment`: a "Deposit needed" screen that says the table is held and not booked, with the reference, a link to the payment page the management app returned, and the phone number. The key is kept, as the full form keeps it.
- No state, or a state the code does not know: "Booking response was incomplete. Please try again.", the same line the full form uses, with the phone number.
- A failed, empty or non-JSON reply, or a request that never arrives: an error with the phone number. The browser's own "Failed to fetch" is no longer shown.
- "That time has just gone" now sits above the grid. It used to replace the grid it was asking the guest to pick from.

### 2. Confirmation wording follows what was sent

`lib/table-booking/submission.ts`: with no reported channel the line is now "Your table is booked. Keep your reference safe." It names a message only when the management app names the channel. This helper is shared, so the full form's confirmed card changes with it. The sheet's phone hint no longer promises a text.

### 3. Nothing under /api is stored unless it is named

`middleware.ts`, `lib/api-cache-policy.ts`

The default for a GET under `/api` was `public, s-maxage=60, stale-while-revalidate=300`. It is now `no-store, max-age=0`. Three routes opt in to the old rule, matched exactly: `/api/events`, `/api/event-categories`, `/api/parking/rates`. There is no `/api/menus` route, so nothing to opt in there. `/api/reviews` and the calendar files set their own header and are not listed.

The personal and availability routes also send `Cache-Control: private, no-store` themselves: table availability, parking availability, a parking booking, a table booking by reference, the PayPal return and the phone lookup. `createApiErrorResponse` sends it on every error. The three opted-in routes send `no-store` on their own failure answers, because middleware cannot see how a route went.

`/api/business/hours` is unchanged.

The middleware sets only `Cache-Control` on an ordinary read, never `CDN-Cache-Control`. That header outranks `Cache-Control` at the edge, and a route that sets its own public header would be left carrying it.

### 4. The site's own calls to the management app

`lib/api/client.ts`: a parking booking and parking availability are read fresh every time, and no write carries a lifetime. The default for other reads is unchanged at five minutes.

### 5. Parking confirmation page

`app/heathrow-parking/confirmation/[bookingId]/page.tsx`: "Parking confirmed" and "Amount paid" only when the status is `confirmed` or `completed` and the payment status is `paid`. Every other case, including a reference that does not exist and a lookup that fails, gets one plain message with the phone number and no tick. The page title no longer says "Confirmed".

### 6. Hours resolver

`lib/table-booking-service-windows.ts`: whether the kitchen is closed now comes from `lib/hours-utils.ts`, where the special-hours record replaces the regular day. The flag is read before the service entries. Eight dates (22, 23, 24, 29, 30 and 31 December 2026, 2 and 5 January 2027) no longer return food times. A Monday opened by a special record still resolves, with or without service entries.

### 7. Unused fallback removed

`lib/api/client.ts`: `buildTableAvailabilityFromBusinessHours` and the tail of `checkTableAvailability` that called it are gone. Nothing in the app called either. `checkTableAvailability` now throws when the availability route gives no answer, where it used to build times from opening hours.

## Assumptions

- A route's own `Cache-Control` replaces the middleware's on Vercel. The live site shows this today: `/api/booking/agent` answers `no-store` and `/api/calendar/upcoming` answers `public, max-age=300` although the middleware sets the public rule on both. Under `next start` both headers are sent as two lines.
- The events list carries seat counts. It stays on the cached list because the booking form re-reads one event through `/api/events/[id]`, which is now `no-store`, and the seat check at booking time is a POST.
- A parking booking is paid when the management app reports `status` confirmed or completed and `payment_status` paid. The management app sets both together when a payment is captured.
- A payment link is followed only if it is an `https` address.

## Deliberately left

- `components/features/TableBooking/BookingConfirmedCard.tsx` still shows "Provided shortly" when there is no reference.
- `paymentLinkReminderCopy` with no channel still says a payment link was sent.
- "Confirmation text sent to your mobile" on the paid parking page. The booking read does not say whether a text went.
- `app/parking/bookings/[id]/page.tsx` still prints "Payment captured successfully" from the address.
- The typed default times (`12:00`, `22:00`) in the drinks branch of `resolveServiceRanges`. They are on a live path.
- `lib/hero-context.ts` `isSundayLunchAvailableNow`, which is unused.
- The management app, the "are you still coming?" link, logging and alerting, and the bot check.

## Tests

- `tests/unit/QuickBookSheet.booking-state.test.tsx`: the real sheet with a mocked POST.
- `tests/unit/api-cache-policy.test.ts`: the middleware header for each path, and the routes' own headers.
- `tests/api/client-no-kept-copies.test.ts`: fetch options for parking reads and writes.
- `tests/unit/parking-confirmation-page.test.tsx`: paid, unpaid, unknown and failed.
- `tests/api/kitchen-closed-special-hours.test.ts`: the eight dates, a specially opened Monday, and the pre-send check in the booking route.
- `tests/api/table-bookings-availability-combined.test.ts`: every availability answer carries `private, no-store`.
- `tests/unit/booking-channel-copy.test.ts`: the neutral line.

## Counterpart: OJ-AnchorManagementTools

Not changed here. The management app's confirmation and "still coming" pages are the other half of P03, and the booking answer needs a field that says whether a message actually went.
