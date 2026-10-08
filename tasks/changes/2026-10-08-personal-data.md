# Customer personal data: the website's half (P06)

Date: 8 October 2026. Branch: `fix/personal-data-p06`. Website only.

Source: the site review of 7 October 2026, package P06 (website findings PY-002, PC-008, PC-014, PY-016, PY-017, PY-018, SM-015, with the checkers' corrections). Owner decision 13 (no shared store, so any limit is per server). The recorded defaults for PC-008 (references stop going to Google Analytics, a scrambled id is sent instead), PY-018 (the yes or no stays, without the reason code) and SM-015 (hidden from Google).

Builds on P03 and P04: nothing under `/api` is stored unless named, the personal routes already answer `private, no-store`, and `lib/report-failure.ts` already keeps guest details out of failure lines and alerts. None of that was changed here.

## What changed

### 1. A phone number is asked about in a POST body, not in the web address

`app/api/customers/lookup/route.ts` was a GET, so the mobile number a guest typed sat in the request address. Addresses are what hosting logs, proxy logs and browser history record.

- The route now takes a POST, with `{ phone, default_country_code }` in the body.
- A GET is still answered, for a page left open from before the change, but only ever with "could not check": the number in its address is not read, not looked up and not passed on. The forms already treat that answer as a new guest and ask for a name, so nobody is stopped from booking by the deploy.
- `components/features/TableBooking/ManagementTableBookingForm.tsx` and `components/PrivateBookingInquiryForm.tsx` send the POST.
- The answer loses its `meta` block. `meta.reason` told any caller whether the key was missing, whether they had been limited, or what the management app had answered. The reason is written to our own log instead, without the number.
- The body is checked before anything is sent on: the number must be 5 to 32 characters and the country code 1 to 4 digits.

The limit of six tries a minute per address is unchanged and is per server (decision 13).

### 2. A parking booking read back carries nothing about the person

The management app answers a parking booking read with the whole row. The name and email on it can be the ones already on file for the mobile number typed into the form, and the only key to the read is the booking id.

- `lib/api/parking.ts`: `ParkingBookingDetails` no longer has the four `customer_` fields. `toPublicParkingBooking()` copies an allow-list (id, reference, status, payment status, vehicle, times, amount, payment deadline, timestamps) and drops everything else, including anything the management app adds later.
- `lib/api/client.ts`: `getParkingBooking()` returns the cut booking, so no page or route is handed a name, a mobile or an email.
- `app/api/parking/bookings/[id]/route.ts`: makes the same cut a second time before answering.
- `app/parking/bookings/[id]/page.tsx`: the Name, Mobile and Email lines are gone and the block is headed "Payment". The page title is "Your parking booking", not the booking id: a title is sent with every analytics event and kept in browser history.
- `app/api/table-bookings/[reference]/route.ts` (unused, always answers 501): an email address is read from the header only, no longer from the query string.

### 3. No booking reference or booking id reaches Google Analytics

The rule at the top of `lib/gtm-events.ts` banned booking references, but six events carried a reference or a booking id and `purchase` used the reference as its transaction id.

- `lib/tracking/booking-identifiers.ts`, new. `analyticsSaleId()` turns a booking id or reference into a sale id (`sale_` and 16 hex characters), the same every time for the same booking, so each sale is still counted once. `stripBookingIdentifiers()` removes `booking_reference`, `booking_id`, `table_booking_id` and their camelCase forms, and makes `transaction_id` a sale id.
- `lib/gtm-events.ts`: `table_booking_funnel`, `table_booking_completed`, `sunday_roast_booking_completed`, `event_booking_funnel_step` and `event_booking_completed` no longer build those fields. The event `purchase` sends a sale id.
- `components/features/TableBooking/ManagementTableBookingForm.tsx`: both table `purchase` events send a sale id.
- `lib/tracking/dispatcher.ts` and `app/api/analytics/route.ts` both apply `stripBookingIdentifiers()` on the way out. A new event that forgets the rule, or a browser still on an older bundle, is corrected rather than sent.

What a sale id is: a one-way digest. It cannot be turned back into a reference and matches nothing in the booking system as it stands. It is not a secret from someone who holds the full list of references, who could work out which digest belongs to which.

### 4. A booking id in a page address is not sent with tracked events

`lib/tracking/url-context.ts` now runs every path through `recordablePath()` from `lib/web-vitals-record.ts`, the rule page speed records already follow. `/heathrow-parking/confirmation/<booking id>` is sent as `/heathrow-parking/confirmation/[id]`, in `page_path`, `page_location`, the referrer fields and the attribution paths. A path that is not a plain site path (one with an email address typed into it, say) is dropped: the field goes for one of our own paths, and only the site is kept for a full address. The same rule runs again in `/api/analytics`.

### 5. The World Cup sweepstake winners page is out of search

`app/live-sport/world-cup/sweepstake/page.tsx` is `noindex, follow` and stays out of `app/sitemap.ts`. It is still linked from the live sport pages.

## Already done on main, checked and left alone

- PY-016, names and number plates in parking error logs: fixed in P04. Both parking write routes report through `reportFailure()`, and `tests/api/parking-write-resilience.test.ts` asserts the name, mobile and plate are absent.
- PC-014, lookup and booking answers marked as storable: fixed in P03 and P04 (`lib/api-cache-policy.ts`, and each personal route sends `private, no-store` itself).

## Searched for the same pattern, nothing to fix

- Browser storage: every `localStorage` and `sessionStorage` use in `app`, `components`, `lib` and `hooks` holds a dismissed flag, a chosen room or a menu filter. None holds a name, number, email or reference.
- Query strings: no component or route builds an address containing a phone number, an email address or a name. The management API client's own queries carry dates, party sizes and event filters only.
- Logs: the 143 `console` and `logError` calls outside tests were searched for a name, number, email, plate, request body or form payload, and each match was read. None logs one. Two log a booking id or reference in clear on a failed read (`app/api/parking/bookings/[id]/route.ts`, `app/api/table-bookings/[reference]/route.ts`); neither route is used by the site.

## Not changed, and why

Needs the management app:

- PY-002, the cause. Putting the typed name on the booking, stopping an unverified form from changing a stored surname, and returning only reference, times, vehicle, amount and status to the website's key. The website now drops the personal fields, but they still leave the management app.
- PC-014 and PY-017, the second hop. The website's own call to the management lookup is still a GET with the number in the query string, because that is the only form it accepts.
- MG-013, MG-020, MG-021, MG-022, MG-023, PY-022, PY-024: all in the management app.

Needs the owner's yes (removes something, or changes what is sent to another system):

- Deleting the old parking status page and the unused read routes (PY-009). They are kept, cut down.
- The Meta conversion still uses the booking reference as its event id, in the browser and in the copy sent to the marketing system. That is how the two copies are matched. It is sent only with marketing consent.
- The winners' names are still on the sweepstake page.
- The job application analytics event sends two multiple-choice answers (experience and start date). Neither identifies anyone, so they were left.

Cannot be fixed in code here:

- Google's own page view is sent by the tag itself, not by our dispatcher, so it still carries the real address of the parking confirmation page, booking id included. Fixing it needs a rule in Google Tag Manager, or the confirmation page moved off an address that contains the id. P07 already stops the tag loading before Accept.

## Assumptions

- Nothing in Google Tag Manager or in a GA4 report reads `booking_reference` or `booking_id`. The container is not in this repository.
- Past purchases keep their old transaction ids in GA4. Only new ones are sale ids. A booking reported once under each form (possible only for a page left open across the deploy) would count twice.
- Nothing on the site needs the name, mobile or email from a parking booking read. The confirmation page uses none of them.
- A browser tab opened before the deploy asks the lookup with a GET. A returning guest in that tab is asked for their name as a new guest would be, until the page is reloaded.

## Tests

New: `tests/lib/tracking-booking-identifiers.test.ts`, `tests/unit/parking-booking-read-privacy.test.tsx`.

Extended: `tests/api/customers-lookup.test.ts` (POST, no `meta`, the limit, bad bodies, what a GET gets), `tests/unit/api-cache-policy.test.ts`, `tests/lib/tracking-url-context.test.ts`, `app/api/analytics/route.test.ts`, `tests/seo-indexing.test.ts`, `tests/unit/ManagementTableBookingForm.test.tsx` and `tests/unit/PrivateBookingInquiryForm.test.tsx` (the lookup address carries no number; `purchase` carries a sale id, never the reference).

No form was submitted and no booking, enquiry or payment route was called against the live system. Everything above is proved by the tests.
