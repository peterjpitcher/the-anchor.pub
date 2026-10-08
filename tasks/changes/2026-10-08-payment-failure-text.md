# A text to the pub when a payment fails

Date: 8 October 2026. Branch: `feat/payment-failure-text`. Website half of a two repository change.

Builds on P04 (`2026-10-07-failures-are-told-and-reported.md`), which left `sendPaymentFailureText()` as a hook that did nothing because the website cannot send a text. The owner approved building the text.

Counterpart: the management app, branch `feat/ops-alert-text`, adds `POST /api/website/payment-failure-alert`. The website change is harmless without it (the request gets a 404, a line is logged, the email still goes) but does nothing useful until the management app is deployed and set up.

## What changed

`lib/report-failure.ts`: `sendPaymentFailureText()` is now one server side POST to the management app, with the website's `ANCHOR_API_KEY` as a bearer key.

- Only for a failed payment. The six payment routes are the only ones mapped to an area, so nothing else can ask for a text. A payment the booking system refused on purpose (a 409, an expired hold) is not a failure and sends nothing.
- Only from the live site (`VERCEL_ENV=production`). Local development talks to the live management app, so a laptop or a preview must not be able to text the pub.
- Only when the email alert is due. It shares the email's limit: one per route every ten minutes from each server.
- What is sent is `{ "area": "...", "reason": "..." }` and nothing else. `area` is one of `table_deposit_start`, `table_deposit_capture`, `event_ticket_start`, `event_ticket_capture`, `parking_start`, `parking_capture`. `reason` is one of `no_answer`, `server_error`, `refused`, `unexpected_error`, worked out from the upstream status. No reason text, booking reference, page or guest detail leaves the website.
- A 3 second timeout. It never throws: every way it can fail comes back as a short reason.
- The email is sent first and does not depend on the text. The text is still asked for when the email fails.
- The outcome is written as a second log line, prefixed `[write-failure-alert]`: `{"route": "...", "texted": true}` or `{"texted": false, "reason": "..."}`. The reason is the management app's code where it gave one (`ALERT_WINDOW_LIMIT`, `ALERT_DAILY_CAP`, `ALERT_NOT_CONFIGURED`, `SMS_SEND_FAILED`, `FORBIDDEN`, `UNAUTHORIZED`), otherwise `http_<status>`, `timed_out`, `request_failed`, `api_key_missing`, or `unexpected_answer` for a 200 that does not say a text was sent (a gateway page, for example).
- The `text: 'no_sender'` field has gone from the main `[write-failure]` line, because it is no longer true.

The existing `anchorAPI` client was not used. Its `request()` retries, falls back to stored answers and is built for reads; the payment routes already call the management app with a plain `fetch` and `getManagementApiBaseUrl()`, and this does the same.

## What the management app decides

The wording, the number it goes to and the limits all live in the management app, so the website cannot change them:

- Wording: `Anchor website alert: a payment failed while <step>. <what happened>. See the alert email for details.`
- Destination: the management app's `OPS_ALERT_SMS_NUMBER` setting.
- Limits: one text per area every ten minutes and six in any 24 hours, whatever the website sends.

## Limits of this alert

- When the management app itself is down, payments fail and the text cannot be sent either, because the same app sends it. The email still goes: it uses Microsoft Graph, not the management app.
- A failed payment response can take up to 3 seconds longer when the management app does not answer the text request. Only the first failure per route in ten minutes pays this.
- The site runs on several servers, each with its own ten minute memory. The management app's limit is what stops several servers sending several texts.

## Tests

`tests/lib/report-failure.test.ts`, with `fetch` and the email sender replaced by stand-ins. Nothing reaches the network.

- The request: URL, method, bearer key, and a body of exactly two codes, for every payment route and every status.
- No guest detail in the request, with a name, phone, email, number plate, reference and booking id fed in.
- Not sent: away from production, for a route that is not a payment, for a refusal, inside the ten minute window, with no API key.
- A failing dependency: `fetch` rejects, throws a non-error, never answers (timeout), or the management app answers 401, 403, 429, 502 or 503, or a 200 that is not its own answer. In every case `reportFailure` resolves, the email is sent, the failure is logged, and neither the key nor a guest detail is in the log.
- The text is still asked for when the email fails.

`tests/api/write-routes-told-and-reported.test.ts`: on each table and event payment route, a failed payment makes exactly one text request with two codes and no guest details, and a failing text request leaves the guest's answer and the email unchanged.

## Before it works

All in the management app, none of it done by this change:

1. Deploy the management app branch `feat/ops-alert-text`.
2. Set `OPS_ALERT_SMS_NUMBER` in the management app's Vercel project to the mobile that should get the text, in international format, then redeploy. Until then the endpoint answers `ALERT_NOT_CONFIGURED`.
3. Apply the management app migration `20261008120000_ops_alerts_api_scope.sql`, which gives the website's API key the `write:ops_alerts` permission. Until then the endpoint answers `FORBIDDEN`.

The website needs no new environment variable.

## Assumptions

- A payment the booking system refused on purpose should not text the pub. This is the existing rule for the email.
- 3 seconds is short enough for a guest who is already looking at an error.
- The text should follow the email's ten minute limit on the website as well as the management app's own.
