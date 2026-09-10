# SPEC: consent-gated booking attribution

Status: approved by the owner on 10 September 2026 (independent review finding F01, answer "1 yes").
Must be live before the weekday food ads start delivering on Friday 11 September 2026.

## Problem

`components/tracking/AnalyticsProvider.tsx` calls `captureBookingAttributionFromLocation()` on every
page load. That writes a 90-day `anchor-booking-attribution` record (UTM fields, `fbclid`, `gclid`,
`short_code`, landing URL) to local storage and a cookie with no consent check, and reads it back on
later visits. Nothing removes it when a visitor rejects or withdraws marketing consent. The event
booking form also reads the ad tags and click IDs straight from the URL and sends them with the
booking whatever the visitor chose. Only the Meta browser IDs (`_fbp`, `_fbc`, user agent) waited
for consent.

Linking a booking to the ad click that brought it is advertising measurement, which needs consent
under PECR (ICO guidance on storage and access technologies). Aggregate short-link redirect counts
are server-side and need no device storage, so they are out of scope and unchanged.

## Change

1. `lib/booking-attribution.ts`
   - Without marketing consent: nothing is written to or read from local storage or the cookie, and
     `getBookingAttributionPayload()` returns `{}` (no ad tags, click IDs or landing URL).
   - While the visitor has not chosen, the landing page's tags wait in memory only (a module-level
     record, never written to the device), so a visitor who accepts later in the same visit, for
     example on the booking page after the campaign URL has gone, is still attributed.
   - New `syncBookingAttributionWithConsent()`: on consent granted it saves the waiting record
     (merged with any record from an earlier consented visit); on consent refused or withdrawn it
     deletes the stored record and discards the waiting one.
   - With consent, behaviour is unchanged (90-day record, first and latest touch, click IDs carried
     forward).
2. `components/tracking/AnalyticsProvider.tsx`: calls `syncBookingAttributionWithConsent()` on the
   existing `cookieConsentUpdate` event.
3. `components/features/EventBooking/ManagementEventBookingForm.tsx`: without marketing consent the
   booking carries only the page path, never ad tags, click IDs or the full URL.
4. `lib/cookies.ts`: `anchor-booking-attribution` joins the cookies removed on "Reject all".

## Effect on measurement

Bookings from visitors who decline marketing cookies no longer carry campaign tags (about half of
September's bookings so far). Tagged bookings become a floor; aggregate short-link clicks, booked
covers and the staff tally carry the rest. This is the price of doing it lawfully.

## Tests (TZ=Europe/London and TZ=UTC)

- Reject or no choice: no `anchor-booking-attribution` in local storage or cookies; booking payload
  has no attribution.
- Accept later in the same visit: the landing page's tags are saved and reach the booking.
- Returning visitor with consent: the stored record is used.
- Withdraw: the stored record is deleted and the payload is empty.
- Reject, then accept: the discarded tags do not come back.
- Event booking without consent: no UTM, click ID or full URL in the request.

## Rollback

Revert the PR. No data migration; records already on devices age out after 90 days.

## Paired repository

The management app and CheersAI receive fewer attribution fields for non-consenting bookers and
already handle bookings with none (organic traffic). No change needed there.
