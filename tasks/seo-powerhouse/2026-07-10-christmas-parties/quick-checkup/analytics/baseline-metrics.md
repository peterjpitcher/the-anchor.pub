# Christmas Parties Measurement Baseline

Date established: 2026-07-10  
Page: `https://www.the-anchor.pub/christmas-parties`

## Baseline Status

This is a technical measurement baseline, not a traffic or conversion baseline. GSC and GA4 property data were unavailable, and the published GTM container did not send the page's custom funnel events to GA4 during live testing.

## Search and Traffic Metrics

| Metric | Current baseline | Source | Data status |
|---|---:|---|---|
| Organic clicks | Unavailable | GSC export not supplied | unavailable |
| Organic impressions | Unavailable | GSC export not supplied | unavailable |
| Organic CTR | Unavailable | GSC export not supplied | unavailable |
| Average position | Unavailable | GSC export not supplied | unavailable |
| Organic sessions | Unavailable | GA4 export/property not supplied | unavailable |
| Engaged organic sessions | Unavailable | GA4 export/property not supplied | unavailable |
| Organic enquiry rate | Unavailable | GA4 conversion delivery not verified | unavailable |
| Confirmed bookings from organic | Unavailable | No management-app outcome join | unavailable |
| Booking value from organic | Unavailable | No management-app outcome join | unavailable |

There is no normalised `search-queries.csv`, so striking-distance, CTR-gap, cannibalisation, decay and site-specific CTR-curve outputs were not generated.

## Technical Tracking Baseline

| Check | Baseline result | Evidence quality |
|---|---|---|
| Live status | Page returned 200 in collected crawl | Known |
| GTM container | `GTM-WWFQTQS` loaded on the live page | Known |
| GA4 Google tag | `G-2ZTRYGDRJW` loaded from the published GTM container | Known |
| Initial GA4 page view | One `page_view` network request observed on a fresh load | Known |
| Duplicate initial page view | Not observed in the single fresh-load test | Known for that test only |
| Custom CTA event creation | `cta_click` appeared in `dataLayer` after consent and hero CTA click | Known |
| Custom form-start creation | `form_start` appeared in `dataLayer` after the same click | Known |
| Custom CTA/form delivery to GA4 | Not observed; only `page_view` reached GA4 | Known for the test |
| Published GTM custom-event rules | None found in the public container resource | Known |
| Successful form completion event | Code creates `form_complete`; real GA4 receipt and key-event status are unverified | unverified |
| Phone event | Code creates `phone_call_click` plus server-queued `call_click`; GA4 receipt is unverified | partial |
| Email event | Code creates `email_click`; GA4 receipt is unverified | partial |
| Search conversion attribution | `form_complete` is not in the dispatcher's attribution-event allow-list | Known |

## Consent Baseline

Fresh-browser state before any banner choice:

- Google consent defaults were denied and GA4 sent a denied-state page-view ping.
- Clarity, LinkedIn and Meta scripts loaded.
- Clarity and LinkedIn collection requests occurred.
- `_fbp`, `bcookie`, `li_gc` and `lidc` cookies were present.

After accepting all cookies:

- `cookie_consent_update`, `cta_click` and `form_start` appeared in `dataLayer`.
- No matching custom GA4 request was observed in the test window.

## Conversion Definition Baseline

| Stage | Current meaning | Can it be trusted? |
|---|---|---|
| CTA click | User selected an entry CTA | DataLayer only; not as a GA4 metric yet |
| Form start | Prepared code records a drawer/lightbox open as `form_start` and now emits a separate `form_submit` | No, the start name does not prove field interaction and neither event has published GA4 delivery |
| Form complete | API returned success after email delivery | No, GA4 delivery is missing and it does not mean a confirmed booking |
| Confirmed booking | Management app accepted and later confirmed the booking | Not measured by this page |

The release baseline must therefore use `generate_lead` for a successful website enquiry and a separate offline booked outcome for revenue reporting.

## Release-QA Baseline to Establish

After implementation, record one controlled test for each row:

| Journey | Service/format | Required analytics values | Required operational proof |
|---|---|---|---|
| Party | Shared night | `form_journey=christmas_party`, `party_format=shared_christmas_party_night` | Email and management record use the same journey |
| Party | Private space | `form_journey=christmas_party`, `party_format=private_space` | Email and management record use the same journey |
| Party | Buffet | `form_journey=christmas_party`, `party_format=festive_buffet` | Buffet minimum and party size are retained |
| Meal | Lunch | `form_journey=christmas_meal`, `meal_service=lunch` | Lunch time and pre-order status are retained |
| Meal | Dinner | `form_journey=christmas_meal`, `meal_service=dinner` | Dinner time and pre-order status are retained |

Pass criteria for every row: one CTA event, one form start, one submit attempt, one `generate_lead` only after a successful API response, no personal data in analytics, and an exact match between journey/service in browser, request, email and management app.

## First Reporting Baseline to Capture

Once tracking and access are verified, save a dated 28-day baseline with:

- GSC exact-page query clicks, impressions, CTR and position.
- GA4 organic landing sessions, form starts and `generate_lead` events.
- Enquiry completion rate by journey, service, source and device.
- Management-app qualified and confirmed booking counts by journey.
- Confirmed booking value where the business approves that field.

Do not compare pre-fix and post-fix lead counts as though they use the same instrumentation. Annotate the tracking launch in the change log and treat the first complete post-launch period as the comparable baseline.

```json
{"findings":[{"finding":"No trustworthy search, traffic or conversion baseline exists for the Christmas page.","evidence":"No GSC or GA4 export exists in the workspace; custom conversion delivery was not observed in a live browser test.","source":"Workspace evidence review and Playwright browser inspection","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"SEO","owner":"Analytics","effort":"Small","dependencies":"GA4, GTM and GSC access","fixType":"Analytics/governance fix","recommendedAction":"Verify properties, repair conversion delivery and capture a dated exact-page baseline before evaluating the optimisation.","validationStep":"Save reconciled GSC and GA4 exports for the same named reporting period and match test leads to operational records.","riskRollback":"Read-only exports need no rollback; exclude any period collected under broken instrumentation from trend comparisons."},{"finding":"The live page creates custom funnel events in `dataLayer` but the published GTM container does not send them to GA4.","evidence":"After consent and a hero CTA click, `cta_click` and `form_start` were present in `dataLayer`, while browser network showed only the GA4 `page_view`; public container rules contained no custom event triggers.","source":"Playwright browser network/dataLayer test and published GTM resource inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"conversion","owner":"Analytics","effort":"Small","dependencies":"GTM and GA4 access","fixType":"Analytics/governance fix","recommendedAction":"Publish GA4 event mappings for the funnel and use `generate_lead` as the successful enquiry event.","validationStep":"Confirm exactly one mapped event in network, GTM Preview and GA4 DebugView for every controlled test action.","riskRollback":"Version and revert the GTM publish if duplicate or malformed events appear."},{"finding":"The current form completion is a lead signal, not a confirmed booking metric.","evidence":"The API can return success after sending email even when management-app forwarding logs an error; no booking identifier or confirmed status is returned.","source":"Manual inspection of app/api/enquiry/christmas/route.ts","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"revenue","owner":"Analytics","effort":"Medium","dependencies":"Management app and developer","fixType":"Analytics/governance fix","recommendedAction":"Separate website `generate_lead` from a later qualified or confirmed booking outcome joined by a non-PII identifier.","validationStep":"Reconcile a controlled set across GA4 lead, enquiry email, management record and final booking status.","riskRollback":"Disable offline imports if join quality is poor and rebuild from the management source ledger."}]}
```
