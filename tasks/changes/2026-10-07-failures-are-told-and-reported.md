# When something fails, the guest is told and so are we (P04)

Date: 7 October 2026. Branch: `fix/failures-are-told-and-reported`. Website only.

Source: the site review of 7 October 2026, package P04 (findings PL-003, PL-004, PL-005, PY-004, PY-006, PY-007, PY-019, WP-002, WP-003, WP-004, WP-005, WP-009, MG-002, MG-003, MG-004, MG-005, FD-001, WP-007, with the checkers' corrections). Owner decisions 10 (email the manager for every failure, and a text as well for payment failures) and 13 (no shared store, so any limit is per server).

Builds on P03 (`2026-10-07-booking-says-yes-means-yes.md`): the quick booking sheet still reads the state of the booking and still adds its own phone link, and nothing under `/api` is stored.

## What changed

### 1. One reporter for every public write route

`lib/report-failure.ts`, new. `reportFailure()` is called by table bookings, both table deposit routes, event bookings and both of its payment routes, the waitlist, the private hire enquiry route (which also serves `/api/private-booking-enquiry`), the Christmas enquiry, the job application, the careers form, and the three parking routes. It does three things, in this order:

1. Writes one line with `console.error`, prefixed `[write-failure]`, as JSON: the route, `failed` or `refused`, the upstream status (or `null` when there was no answer), a short reason code, and where they exist the upstream code, the booking state, the event id and the page path.
2. For a `failed` outcome on the live site, emails manager@the-anchor.pub through the Microsoft Graph sender the careers form already uses. At most one email per route every ten minutes.
3. For a failed payment, calls the text hook as well.

It never throws and never changes the guest's answer. If the email cannot be sent, the log line is already written, a second line prefixed `[write-failure-alert]` says so, and the next attempt is after one minute.

`refused` means a deliberate no the guest can act on: a full night, a blocked slot, a 400 or 422, a 409. It is logged and nobody is emailed. `failed` is everything else.

No personal data. Callers cannot pass free text. Every field is checked against a strict shape (a code is one token with no spaces; an event id must be a UUID) or dropped. A booking id is logged only as a 12 character hash, so two lines about the same booking can be matched without naming it. A page path loses its query string and any segment that is an id, a long run of digits, or shaped like a reference or a number plate. The text of a thrown error is scrubbed of email addresses, ids, plates and digit runs and cut to 120 characters, and for errors thrown by the API client only the code is kept, because that message is the booking system's own text.

Two lines that used to carry personal data no longer do: the parking booking route logged the guest's name and number plate, and the parking payment route logged the plate.

### 2. The text for payment failures is a hook, not a text

The website cannot send a text. It has no SMS provider, no credentials and no sender: every text the pub sends goes out from the management app. `sendPaymentFailureText()` in `lib/report-failure.ts` is the named hook. It does nothing and returns `no_sms_sender_on_website`, and the log line of a failed payment carries `"text":"no_sender"`. The email is sent either way.

### 3. Routes that passed the answer on and wrote nothing

- `app/api/table-bookings/route.ts`: a refusal or failure of the booking write, the replay path and a missing key are now reported. A 200 that cannot be read, says `success: false` or carries no state is answered 502, not passed on under a 2xx. A `blocked` answer under a 200 still goes back as it is, because the form has wording for each reason; it is logged as a refusal.
- `app/api/event-waitlist/route.ts`: the same, including the missing key.
- `app/api/table-bookings/paypal/create-order/route.ts` and `capture-order/route.ts`: had no log call and sent `Bearer undefined` without the key. They now check the key, report every failure, treat an incomplete 200 as a failure, and answer with `error` as one plain sentence. A failed capture says to ring before paying again.
- `app/api/public/private-booking/route.ts`: a missing key answered 503 before anything else ran, with no log, no number and no fallback email, so the enquiry was gone. It now takes the same path as any outage and the enquiry is emailed to the manager.
- `app/api/enquiry/christmas/route.ts`: the catch handed the thrown message to the guest, and those messages carry Microsoft's raw answer. The guest now gets a fixed sentence. The fallback email has its own catch, reported as `ENQUIRY_LOST_FALLBACK_EMAIL_FAILED`.
- `lib/turnstile.ts`: a missing secret still refuses every form (failing closed is right), but it is now reported and the message carries the number. Nothing else about the bot check changed.

### 4. One mapper from upstream answers to guest sentences

`lib/guest-error-messages.ts`, new, with no server-only imports so the routes and the forms share it.

- An upstream sentence is shown only when it is plainly written for a guest: it carries 01753 682707 itself (the per-phone limit, the Christmas rule messages), or it is on a short list (`Please enter a valid phone number`, three table deposit answers). Anything else is replaced with our own wording.
- Codes have sentences: every blocked reason the event booking functions can answer with, the waitlist reasons, the event payment reasons, and the codes the management app's API layer answers on any route (`UNAUTHORIZED`, `RATE_LIMIT_EXCEEDED` and so on).
- Table booking reasons use the wording already in `lib/table-booking/submission.ts`, unchanged.
- Every sentence carries the number. A form that prints its own "Call 01753 682707" line passes `phone: false` and shows that line only when the sentence does not already carry it, so the guest sees the number once.
- On a payment capture the answer is always "call before paying again", whatever the code.

Used by the routes (`mapUpstreamFailure`) and by the forms (`toGuestMessage`, `guestMessageForBlockedReason`): the full table form, the quick sheet, the event form, both PayPal sections, both private hire forms, the Christmas forms and the job form.

`app/api/customers/lookup/route.ts`: an invalid phone number returned the upstream's whole JSON answer as a string. It now returns `Please enter a valid phone number. Call 01753 682707 if you need help.`

### 5. The estimator's enquiry form

`lib/api/private-bookings.ts`, `components/PrivateBookingInquiryForm.tsx`. The route answers some failures with `error` as an object. The helper copied it into `message`, the form rendered it, React threw and the page fell to the error boundary with everything typed lost. `message` is now always one sentence, and a reply that is not JSON is a failed enquiry, not a throw. The same fault in the table deposit step (`ManagementTableBookingForm.tsx`, `PayPalDepositSection.tsx`) is fixed the same way, and `PayPalDepositSection` now shows the phone number when the PayPal client id is missing, where it used to show nothing.

### 6. Job applications

`app/api/enquiry/recruitment/route.ts`. Only 400 and 422 are the applicant's to correct. Every other unexpected status (401, 403, 404, 405, 413 and the rest) is reported, goes to the email fallback with the CV, and the applicant gets the standard answer. A missing sender no longer says "contact the site administrator".

### 7. `/api/health`

`lib/health-check.ts`, `app/api/health/route.ts`. It was a file written at build time. It now runs on request: are the required settings present, and can the site reach the booking system's hours endpoint with its key. 200 when both hold, 503 with a short reason when not. No address, no key and no setting names in the answer; the names go to the log. The answer is remembered for 15 seconds per server, because the check spends one call from the hourly allowance on the shared key and the address is public.

### 8. Settings checked at build time

`lib/required-env.js`, loaded by `next.config.js`.

- `VERCEL_ENV=production`: a missing setting stops the build and names it.
- `VERCEL_ENV=preview`: a warning in the build log, and the build carries on.
- Anything else (CI, a laptop): nothing.

Eight are required: `ANCHOR_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_USER_EMAIL`. All eight were present in Production and in Preview on 7 October 2026 (`vercel env ls`, names only; no value was read).

## Assumptions

- Vercel exposes `VERCEL_ENV` to the build. It does by default ("Automatically expose System Environment Variables"). If that is ever switched off the check does nothing, which is the safe direction.
- Alerts go out from the live site only (`VERCEL_ENV=production`). A preview or a laptop that cannot reach the booking system must not email the pub. The log line is written everywhere and says `"alert":"not_production"`.
- The limit of one email per route every ten minutes is per server. Vercel runs several copies of each function, so one outage can send a few emails. This follows owner decision 13.
- A 409 from the booking system is a deliberate no (a clash, a duplicate, a full night), so it is logged and not alerted. A 429 is ours unless the sentence that comes with it was written for the guest.
- On a capture route every answer that is not a success is reported as a failure, whatever the status, because the guest had already approved the payment.
- A preview build is warned and never failed, even though all eight settings are present there today.
- The event id in a log line must be a UUID, which is what the management app issues.

## Deliberately left

- The parking wizard still hands a create-order error to PayPal's own error screen and still has one "try again" state for a failed capture (PY-005). The routes behind it now report and answer in sentences.
- `lib/api/client.ts` `createTableBooking` (the older path) still falls back to `result.reason`. Nothing on the site calls it.
- `getSafeUpstreamErrorMessage` in `lib/upstream-json.ts` is no longer used by any route. It is left in place.
- The notes box on the estimator form has no `maxLength`. The server limit is on the notes plus the estimator items, so no single number matches it.
- `RecruitmentApplicationForm` is still not rendered in any test. Its error path now goes through the mapper, which is tested.
- A client-side error reporter and `app/global-error.tsx` (PL-003). Out of this change.
- An uptime monitor pointed at `/api/health`. The route is ready for one; setting it up is an account job.
- The management app, the bot check itself, rate limiting, and copy outside error messages.

## Tests

- `tests/lib/report-failure.test.ts`: the log line, scrubbing, the ten minute limit, the alert email rendered with fixture data (snapshot), a failed or hanging email, the text hook.
- `tests/lib/guest-error-messages.test.tsx`: every mapped code rendered as a sentence with the number; technical text never shown; the route mapper.
- `tests/lib/required-env.test.ts`: production stops and names each setting; preview warns; CI is left alone.
- `tests/api/health.test.ts`: 200, each 503 reason, no secrets in the answer.
- `tests/api/write-routes-told-and-reported.test.ts`: for every route, a happy path and a failing dependency, with the real reporter. Asserts the guest's answer, one alert email, and no personal data in the log or the email.
- `tests/unit/PrivateBookingInquiryForm.failure.test.tsx`: the real helper with object-shaped errors. Fails on the old code with "Objects are not valid as a React child".
- Updated: the event booking route suite (now reads the real log line), both event payment suites, both table deposit suites, the waitlist outage suite, the parking suite, the careers suite, the private hire and recruitment suites, `PayPalDepositSection`, the table form, the event form and the quick sheet.

## Counterpart: OJ-AnchorManagementTools

Not changed here. See the hand-over note in chat for the full list. In short:

- An authenticated endpoint that sends an alert text to the owner, so `sendPaymentFailureText()` has something to call.
- The logger drops everything below error level in production. Raise the warnings that mean a guest-facing failure, after stripping contact fields: 28 call sites would otherwise start logging phone numbers and email addresses.
- The bot check passes everyone when its secret is missing. It should fail closed in production.
- A stable code on every error from the public routes, and sentences rather than bare reason codes from the event payment routes.
