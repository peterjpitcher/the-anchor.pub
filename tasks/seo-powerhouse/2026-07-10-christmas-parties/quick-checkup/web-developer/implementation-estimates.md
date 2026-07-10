# Christmas Parties Implementation Estimates

Date: 2026-07-10  
Assumption: a developer familiar with this Next.js codebase; estimates exclude waiting for owner decisions or external access.

## Scored implementation backlog

| ID | Recommendation | Current state | Approval bucket | Fix type | Estimate | Effort (1-5) | Risk (1-5) | Main failure mode |
|---|---|---|---|---|---|---:|---:|---|
| DEV-01 | Metadata, H1 and two-route hero | Implemented | Pre-approved small fix | One-off page fix | 30 min final crawl | 1 | 1 | Snippet wording changes |
| DEV-02 | Party/meal, lunch/dinner and party-format form model | Implemented | Pre-approved small fix | Template/system fix | 1 hour remaining QA | 2 | 3 | Downstream enum mismatch |
| DEV-03 | 24-hour time normalisation and legacy mapping | Implemented | Pre-approved small fix | Template/system fix | 30 min final QA | 1 | 2 | Wrong or missing start time |
| DEV-04 | Remove duplicate selector and add selected-state semantics | Implemented | Pre-approved small fix | One-off page fix | 30 min final QA | 1 | 1 | Mode switch becomes less visible |
| DEV-05 | Dedicated visible/focused success state | Implemented and mocked-browser verified | Pre-approved small fix | Template/system fix | Complete | 1 | 2 | User misses confirmation or resubmits |
| DEV-06 | Runtime API validation | Implemented | Pre-approved small fix | Template/system fix | 30 min final QA | 1 | 2 | Over-strict validation rejects a valid caller |
| DEV-07 | Route and component integration tests | API suite and mocked mobile success implemented | Pre-approved small fix | Template/system fix | Complete; live receipt unavailable | 1 | 2 | Browser success/error state differs from route result |
| DEV-08 | Single-notification and fallback policy | Implemented, staging/monitoring pending | Pre-approved small fix | Template/system fix | 1-2 hours staging/ops work | 2 | 3 | Missing management record during fallback |
| DEV-09 | Replace price-bearing Event schema | Implemented and tested | High-risk approval received | One-off page fix | Complete | 1 | 4 | Loss of valid enhancement or entity detail |
| DEV-10 | Testimonial provenance or removal | Removed and tested | High-risk approval received | Content process fix | Complete | 1 | 3 | Reduced social proof |
| DEV-11 | Unsupported-claim cleanup | Implemented and editor-verified | Pre-approved small fix | Content process fix | Complete | 1 | 2 | Lost useful detail |
| DEV-12 | Page and FAQ reduction | Pending | High-risk approval required | Content process fix | 4-8 hours plus monitoring | 3 | 4 | Search/query coverage loss |
| DEV-13 | GA4/GTM funnel and key-event mapping | Blocked | Deferred or blocked | Analytics/governance fix | 2-4 hours after access | 2 | 3 | Missing or duplicated leads |
| DEV-14 | Non-Google consent controls | Blocked | Deferred or blocked | Analytics/governance fix | 2-4 hours after access | 2 | 4 | Privacy breach or over-blocked measurement |
| DEV-15 | GSC property/export baseline | Blocked | Deferred or blocked | Analytics/governance fix | 30-60 min after access | 1 | 1 | Wrong property/date range |
| DEV-16 | Sitemap last-modified update | Implemented | Pre-approved small fix | One-off page fix | Complete | 1 | 1 | Incorrect freshness signal |
| DEV-17 | 2027 rollover and post-season state | Pending | Pre-approved small fix | Content process fix | 2-4 hours | 2 | 2 | Stale 2026 promotion/schema |
| DEV-18 | CWV evidence collection | Blocked / monitor | Deferred or blocked | Analytics/governance fix | 30-90 min | 1 | 1 | Treating unavailable data as a pass |
| DEV-19 | Preserve journey in global sticky CTA | Implemented | Pre-approved small fix | Template/system fix | Complete | 1 | 2 | First visit loses a clear default |

## Ticket-ready notes

### DEV-04: Simplify and expose the journey choice

- **Files:** `app/christmas-parties/client-components.tsx`.
- **Implemented approach:** the outer duplicate drawer selector was removed. The retained party/meal and lunch/dinner buttons use `aria-pressed` in the main form and lightbox.
- **Acceptance:** one party/meal selector; selected value is announced; meal retains pre-order/deposit and lunch/dinner choices; party retains party format.
- **Validation:** keyboard and accessibility snapshot at 320 x 568, 390 x 844, 768 and 1440.
- **Rollback:** move the retained selector higher if discoverability drops; do not restore duplicate controls.

### DEV-05: Make success unmistakable

- **Files:** `app/christmas-parties/client-components.tsx`.
- **Implemented approach:** after a 2xx response, the main form is replaced with a compact `Alert` confirmation and the lightbox retains a brief success state. The UX specialist's mocked 390 x 844 check confirmed the drawer stayed open with the confirmation visible near the top and no real request was sent.
- **Acceptance:** a mocked party, lunch and dinner success is visible in the current viewport; focus/announcement occurs once; controls cannot submit twice.
- **Validation:** intercept `/api/enquiry/christmas` with 200 in Playwright. Do not send a real lead.
- **Rollback:** retain the existing alert and form if focus movement causes a regression.

### DEV-06: Validate the public API contract

- **Files:** `app/api/enquiry/christmas/route.ts`.
- **Implemented approach:** after legacy normalisation, the route requires `party|meal`, restricts meal service and party format, checks party-size ranges, checks the 2026 seasonal date range and rejects invalid supplied times. Management notes are capped. Source and other string lengths could be tightened later as general API hardening.
- **Acceptance:** invalid enums/ranges return 400; valid party/lunch/dinner and legacy dinner/buffet requests retain expected labels; `Flexible` remains allowed only for the short lightbox policy.
- **Validation:** Jest route tests with mocked fetch and environment values.
- **Rollback:** preserve the existing legacy mapping and loosen only a proven incompatible constraint.

### DEV-07: Add behavioural conversion tests

- **Files:** `tests/api/christmas-enquiry.test.ts`, Christmas unit tests and mocked Playwright checks.
- **Implemented cases:** management success with no duplicate Graph email, Graph fallback, invalid meal service/party format/capacity/date/time and legacy dinner. Add explicit party, dinner, legacy buffet and mocked client success/error coverage to the final matrix.
- **Acceptance:** request, email body, management body and client confirmation agree on journey/service/source; no real network call occurs.
- **Validation:** targeted Jest run plus Playwright mocked-success/error matrix.
- **Rollback:** tests only; no production rollback.

### DEV-08: Verify the operational notification path

- **Files/systems:** website Christmas route and `OJ-AnchorManagementTools` external booking route/manager notification.
- **Implemented approach:** management creates the record and owns the normal manager notification. Website Graph email runs only when management delivery fails. The route returns `delivery=management|email_fallback`.
- **Acceptance:** management success produces one record/notification; forced failure produces one Graph fallback; operations can identify and reconcile fallback-only leads.
- **Risk:** email fallback preserves the lead but leaves no management record. Monitor and reconcile `email_fallback` rather than removing it.

### DEV-19: Preserve sticky-CTA journey intent

- **Files:** `components/layout/StickyCtas.tsx` and the Christmas open-form event handler.
- **Approach:** allow the page to reopen its current context instead of always dispatching `mode: party`; retain party only as the first-visit default.
- **Acceptance:** after choosing meal, closing and reopening from the sticky CTA, meal remains selected; party also remains selected; a first visit still has a clear default.
- **Status:** implemented with regression coverage.
- **Risk/rollback:** session-persisted state can become stale across visits, so keep it page/session-local and restore the current default only if state handling regresses.

### DEV-09: Replace the stale Event schema

- **Files:** `app/christmas-parties/page.tsx`; optionally a shared schema helper if the chosen model repeats.
- **Implemented approach:** the long-running Event and priced offers were replaced with a non-priced WebPage and Service graph sourced from SSOT, while retaining global venue and breadcrumb schema.
- **Approval group:** `Christmas trust and simplification`, approved and complete.
- **Acceptance:** no hidden hardcoded food price, unsupported date/package or 10-150 Christmas capacity; every schema claim is current and visible; offline validator passes retained required fields.
- **Risk/rollback:** material rich-result change, risk 4. Save and restore the previous object only if a verified regression is attributable to the change.

### DEV-10: Testimonial evidence

- **Implemented approach:** removed the three quotes and the unused testimonial component import after explicit owner approval.
- **Acceptance:** no unverified quote, author or testimonial component remains on the page.
- **Risk/rollback:** restore only testimonials with an approved source and permission record.

### DEV-12: Evidence-led page reduction

- **Files:** `app/christmas-parties/client-components.tsx`, the dated rollback document and approved SSOT/source sheet.
- **Approach:** use GSC evidence before preparing any wider keep/merge/remove diff. Unsupported menu and operating claims have already been removed or qualified and pass editor QA.
- **Approval group:** `Christmas trust and simplification`.
- **Acceptance:** every retained commercial claim has a dated source; no unverified quote remains; removed copy is saved; no URL/canonical/indexation change occurs.
- **Risk/rollback:** risk 3-4 due revenue and query coverage. Restore only the affected saved block if validated performance falls.

## Exact GA4 / GTM implementation ticket

### Event contract

| dataLayer event / trigger | GA4 event | Trigger condition | Required parameters | Primary key event? |
|---|---|---|---|---|
| `cta_click` | `cta_click` | One click on a Christmas entry CTA | `cta_id`, `cta_location`, `cta_destination`, `cta_mode` | No |
| recommended `form_open` or current `form_start` | `form_open` or corrected `form_start` | Drawer/lightbox opens; if using `form_start`, fire only on first field interaction | `form_name`, `form_source`, `form_journey`, `meal_service` when relevant | No |
| `form_submit` | `form_submit` | Immediately before one API request | `form_name`, `form_source`, `form_journey`, `meal_service`, `party_format`, `party_size` | No |
| `form_complete` | `generate_lead` | Only after a successful 2xx enquiry response | `form_name`, `form_source`, `form_journey`, `meal_service`, `party_format`, `party_size`, `currency` only if a real value exists | **Yes** |
| `phone_call_click` | `phone_call_click` | Click on a `tel:` action | `contact_source`, `form_journey` where known | No |
| `email_click` | `email_click` | Click on a `mailto:` action | `contact_source`, `form_journey` where known | No |
| recommended `form_error` | `form_error` | Client validation, network or non-2xx error | `form_name`, `form_source`, `form_journey`, safe `error_type` | No |

Do not send name, email, phone, notes or other personal data to GA4.

### Affected components

- `app/christmas-parties/christmas-hero-ctas.tsx`
- `app/christmas-parties/client-components.tsx`
- `components/layout/StickyCtas.tsx`
- `lib/gtm-events.ts`
- published GTM container `GTM-WWFQTQS`
- GA4 web stream using `G-2ZTRYGDRJW`, subject to property-owner verification

### Consent dependency

- GA4 and approved analytics events require the intended analytics consent state.
- Clarity requires the privacy owner's analytics classification.
- Meta and LinkedIn must require marketing/ad consent and must not load or set marketing cookies before the choice.
- Publish through a versioned GTM workspace so the previous version can be restored.

### Validation matrix and pass criteria

Use GTM Preview, browser network and GA4 DebugView for:

1. fresh visitor, reject, analytics-only and accept-all consent;
2. party success;
3. lunch success;
4. dinner success;
5. validation error;
6. mocked API 500/timeout;
7. phone and email actions;
8. test-UTM landing and completion.

Pass means exactly one event per controlled action, exactly one `generate_lead` only after 2xx, no `generate_lead` on errors, correct journey/service/source values, no PII and no Meta/LinkedIn collection before marketing consent. Revert the GTM version if duplicates or consent leakage appear.

## GSC and monitoring ticket

- Verify the canonical-domain property for `https://www.the-anchor.pub`.
- Export exact-page and query clicks, impressions, CTR and average position for `/christmas-parties` and the two related Christmas URLs over one named date range.
- Reconcile the export totals with the UI.
- Save the first trustworthy post-tracking 28-day baseline; do not compare broken pre-fix conversion instrumentation as like-for-like.
- Monitor indexation/schema immediately, then query coverage and qualified lead mix over 1-2 and 4-8 weeks.

## Final release gate

Before deployment:

- [x] One party/meal selector with selected-state semantics.
- [x] API enum/range validation and mocked route tests.
- [x] Mocked-success confirmation visible on short mobile; desktop/source behaviour also passed UX review.
- [x] Management-first delivery with Graph fallback and no duplicate success email is implemented and unit-tested.
- [x] Clean lint, TypeScript, 99-suite/930-test full run and production build from the final source.
- [ ] User decision on the `Christmas trust and simplification` approval batch.
- [x] Tracking/GSC gaps are labelled unavailable because access is still missing.

```json
{"findings":[{"finding":"The core page and enquiry implementation passes final local engineering and mocked UX validation.","evidence":"Final source passed lint, sequential TypeScript, 99 Jest suites with 930 passing tests and production build; UX reports a visible mocked mobile success state with no real request; tests/api/christmas-enquiry.test.ts verifies management-first and fallback behaviour.","source":"Local validation, Jest, Next build and UX specialist browser check","dataStatus":"Known","severity":"Low","confidence":"High","impactArea":"conversion","owner":"Technical","effort":"Small","dependencies":"Live delivery credentials for production receipt only","fixType":"Template/system fix","recommendedAction":"Keep the validation evidence with the release and monitor email_fallback outcomes after deploy.","validationStep":"After deploy, run one authorised controlled lead and reconcile the response, notification and management record.","riskRollback":"Revert the Christmas form/API release if authorised live delivery disagrees with the tested contract."},{"finding":"Schema, testimonial and pruning changes fit one approval batch even though their implementation effort differs.","evidence":"DEV-09 is a one-to-two-hour page-local schema change with risk 4; DEV-10 is a small provenance/removal decision with risk 3; DEV-11 and DEV-12 affect a commercial page and carry risk 4 without GSC baseline.","source":"Code feasibility review and editor/content/UX specialist reports","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"SEO","owner":"Editorial","effort":"Medium","dependencies":"Owner approval, approved sources and rollback copy","fixType":"Content process fix","recommendedAction":"Submit one Christmas trust and simplification approval request rather than separate pauses for each block.","validationStep":"Record the decision, implement the approved scope, re-crawl copy/schema and preserve a dated rollback document.","riskRollback":"Restore only the verified affected block if enhancement, query coverage or qualified enquiries decline."},{"finding":"GA4/GTM and GSC work is technically straightforward but blocked by external access and consent ownership.","evidence":"The code emits the needed journey/service/source parameters, but analytics-report.md found no custom-event delivery in the published GTM container and no GA4/GSC property evidence exists in the workspace.","source":"Analytics specialist report and code inspection","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"SEO","owner":"Analytics","effort":"Small","dependencies":"GTM, GA4, GSC and privacy-owner access","fixType":"Analytics/governance fix","recommendedAction":"Implement the exact event/consent ticket after access, then capture the first trustworthy post-release baseline.","validationStep":"Pass the consent and journey matrix in GTM Preview, network and GA4 DebugView, and reconcile a GSC export with the UI.","riskRollback":"Use versioned GTM publication and revert if events duplicate or tags ignore consent."}]}
```
