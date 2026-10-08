# The website uses what the management app now tells it

Date: 8 October 2026. Branch: `fix/use-management-answers`. Website only.

The management app shipped three changes on 8 October 2026 (its PRs #197, #198 and #199, on its main at `364f1684`). Each one was something the website had asked for. This change makes the website use them.

Builds on `2026-10-07-failures-are-told-and-reported.md` (the mapper and the reporter), `2026-10-07-booking-says-yes-means-yes.md` (the quick booking sheet reads the state of the booking) and `2026-10-08-personal-data.md` (the lookup became a POST on the website's own side).

## What changed

### 1. The customer lookup asks by POST on both hops

`app/api/customers/lookup/route.ts`. The website's own lookup was already a POST. Its onward call to the management app was still a GET with the mobile number in the query string, because that was the only form the management app took. It now takes a POST body, so the onward call sends `{ phone, default_country_code }` in the body and the number is in no web address at all.

Nothing else about the route moved. Every failure still answers "could not check" (`known: false, lookup_degraded: true`), which the forms treat as a new guest, so a failed lookup costs a convenience and never a booking. That covers a management app that cannot be reached, a 401, 403, 404, 405, 429 or any 5xx, and a 200 that is not JSON.

### 2. "We've sent you a message" only when one went

The management app's table booking and event booking answers now carry `notification_sent`. `notification_channel` says how the message went: on a table booking it is null when nothing went; on an event booking it is `email`, `sms` or null.

`lib/confirmation-notice.ts`, new, is the one place that reads them. A message was sent only when `notification_sent` is exactly `true`. Everything else is not sent: `false`, a missing field, `null`, the string `"true"`, and a channel that arrives without the flag.

- `lib/table-booking/submission.ts`: `confirmationDeliveryCopy`, `paymentLinkDestination` and `paymentLinkReminderCopy` take the answer, not the channel. The last two return null when nothing is known to have gone.
- `BookingConfirmedCard.tsx` (the full table form) and `QuickBookSheet.tsx`: sent says "We've sent confirmation details by email." (or SMS, or WhatsApp, or with no channel named when none was). Not sent says "Your table is booked. If you'd like it confirmed by a person, call 01753 682707." In the sheet the number is a link.
- `ManagementTableBookingForm.tsx`, the screen shown when PayPal will not open: it used to say "open the secure payment link we've sent you" whatever had happened. It now mentions a sent link only when one went. Otherwise it offers the phone and, where the answer carries one, the payment link itself. With neither a sent message nor a link, the heading reads "To finish your booking:" over the one way left.
- `ManagementEventBookingForm.tsx`: the confirmed screen made no statement either way. It now adds one line under "Your seats are confirmed for ...": the sent sentence, or "If you'd like it confirmed by a person, call 01753 682707."
- An event paid for on the site: the answer that said a message went described the held booking (the payment link), and the payment answer does not say whether a confirmation went. So the flag is cleared when the booking turns confirmed, and the paid screen gives the number and claims nothing.

The sentence used on all three screens is one constant, `CONFIRMED_BY_A_PERSON_WORDING` in `lib/guest-error-messages.ts`. It is not in `lib/approved-wording.ts`: that file is pasted from SSOT section 16 and its guard tests fail on anything that is not there.

Checked and left alone, because they claim no message: the parking confirmation page (`app/heathrow-parking/confirmation/[bookingId]/page.tsx`), `app/booking-confirmation`, the "Deposit paid, booking confirmed!" screen, the event "on hold" screen, and the private hire, Christmas and job forms. The management app's parking answers carry no `notification_sent`.

### 3. The code is read before the status and the sentence

The management app now sends a stable `code` beside its sentence on the enquiry route, the create-booking route, both table deposit routes and both event payment routes (which also send `message`), and its limiter answers `RATE_LIMIT_EXCEEDED`.

`lib/guest-error-messages.ts`:

- `kindForUpstreamCode()`, new. A code we know says whether the answer is a refusal (a deliberate no the guest can act on) or a failure (ours, which is reported). Until now only the HTTP status decided, and it got some wrong. An expired event payment hold arrives as a 410; that read as an outage, so a guest who had run out of time was told "we could not start your payment" and the pub was emailed and texted. It is now a refusal with its own sentence, logged, and nobody is alerted.
- A code with its own sentence is answered with our sentence ahead of the management app's. Two codes are too general for that and still let a sentence written for the guest through first: `VALIDATION_ERROR` (the Christmas booking rules arrive under it) and `RATE_LIMIT_EXCEEDED`.
- `RATE_LIMIT_EXCEEDED` is one code for two different limits: the one on a single phone number, which is the guest's to wait out, and the allowance on our shared key, which is ours. The code cannot tell them apart, so the sentence still does: with a sentence carrying 01753 682707 it is a refusal and the sentence is kept; without one it is a failure and the guest gets "Our booking system is very busy just now."
- New sentences for the table deposit codes: already paid, not needed, no longer open for payment, out of time, not waiting for a deposit. The codes where money may have moved (`CAPTURE_FAILED`, `CAPTURED_AMOUNT_UNVERIFIED`, `CAPTURED_AMOUNT_MISMATCH`, `CAPTURED_BOOKING_UPDATE_FAILED`, `PAYPAL_ORDER_LOOKUP_FAILED`, `AMOUNT_MISMATCH`, `ORDER_MISMATCH`) all say to ring before paying again. The management app's own wording for some of these says "please try again" or "contact support"; the guest never sees it.
- `ENDPOINT_RETIRED`, `CONFIGURATION_MISSING`, `CONFIGURATION_INVALID` and `BOOKING_NOT_FOUND` join the codes that get the general line for the form the guest is on.
- An answer with no code, or with a code that is not listed, is judged by its status exactly as before. The three table deposit sentences on the allow-list stay, for the same reason.

`app/api/public/private-booking/route.ts` (which also serves `/api/private-booking-enquiry`): "this submission is already there" and "the guest can correct this" were both read from the status. With a known code, the code decides. A 400 that is about our request and not the guest's details (`IDEMPOTENCY_KEY_REQUIRED`) used to be handed back to the guest as "check your details"; it is now treated as our fault, so the enquiry is emailed to the manager and reported. With no known code the status decides, as before.

`app/api/enquiry/christmas/route.ts`: a 409 from create-booking was always retried. `IDEMPOTENCY_KEY_IN_PROGRESS` still is (our own earlier attempt holds the claim, and waiting resolves it). `IDEMPOTENCY_KEY_CONFLICT` is not, because waiting cannot change it; the enquiry goes straight to the email fallback. The code is also written to the failure log. Only a short single token is ever taken from the answer, so no sentence can reach the log.

A code is never shown to a guest. It travels in the `code` field of our own routes' answers, which the forms branch on, and the only thing printed is `error`.

Not changed, because they already read the code or have nothing new to read: the table booking route, the event booking route (it already matched `BOOKINGS_DISABLED`, `SALES_CLOSED` and `POLICY_VIOLATION` by code), the waitlist, the four payment routes (they call the mapper, so they pick this up with no edit), the job application route (the management app's change did not cover it) and the parking routes.

## Assumptions

- The management app's POST lookup is live. If an older build answers 405, the lookup degrades and the booking carries on.
- A channel without `notification_sent` is an answer from before the field existed, and reads as not sent.
- `IDEMPOTENCY_KEY_CONFLICT` on the enquiry route is still "already there", as a bare 409 was: the key is made from the submission, so the same key can only mean the same enquiry.
- A deposit or event booking the management app cannot find (`BOOKING_NOT_FOUND`, `booking_not_found`) stays judged by its status. Naming it a failure would email the pub each time somebody opened a stale link.
- Forms were not changed to read `code` themselves. They talk only to our own routes, whose `error` is already the mapped sentence.

## Deliberately left

- "Receive confirmation by SMS and email" in the steps on `app/heathrow-parking/page.tsx`. It is page copy, outside this change, and the management app's parking answers do not say whether a message went.
- Wording that asks for a detail before a booking is made ("For your confirmation text.", "so we can send your confirmation") and the waitlist line that says we'll text if places open up. These say what a detail is for, not that a message has gone.
- `lib/api/client.ts` `createTableBooking`, the older path nothing calls. It does not pass `notification_sent` through.
- The read routes (`/business/hours`, `/events`) still tell a rate limit by its 429.

## Tests

- `tests/api/customers-lookup.test.ts`: the onward call is a POST with the number in the body and nothing in the address; every way it can fail answers "could not check"; no log line carries the number.
- `tests/unit/booking-channel-copy.test.ts`: every answer that is not `notification_sent: true` (nine shapes) reads as not sent, on the confirmation line and on the payment link lines.
- `tests/unit/confirmation-notice-screens.test.tsx`, new: the event confirmation and the table confirmation card rendered against each of those answers; an event paid on the site does not inherit "sent".
- `tests/unit/QuickBookSheet.booking-state.test.tsx`: the same on the quick sheet, and a second booking in one sheet does not inherit the first one's "sent".
- `tests/unit/ManagementTableBookingForm.test.tsx`: the PayPal recovery screen mentions no sent link when the answer does not say one went.
- `tests/lib/guest-error-messages.test.tsx`: each new code as a sentence with the number; code before status; an unknown code changes nothing; the two rate limits.
- `tests/api/write-routes-told-and-reported.test.ts`: on the deposit and event payment routes, a coded refusal is told in our words, logged as a refusal and alerts nobody, and a coded failure is reported; on the enquiry route, the fault-not-detail 400 is emailed and reported, and is told to the guest when the email fails too; on the Christmas route, a conflict is not retried, still reaches a person, and is told to the guest when the fallback email fails.
