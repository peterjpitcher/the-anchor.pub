# Web Developer Analysis

Date: 2026-07-10  
Scope: current local `/christmas-parties` implementation, its enquiry API, shared sticky/lightbox UI and SEO handoff

## Release verdict

The implementation is technically sound at framework level and the important conversion-path changes are in place. The route remains statically rendered, indexable and self-canonical. Party, lunch and dinner are distinct in the UI, email content and management notes. Display times are normalised to the management API's `HH:mm` contract. The global Christmas lightbox is suppressed on this route, the local lightbox is suppressed while the drawer is open, final phone/email controls use the promised channels, and both enquiry surfaces now show a visible success state.

The page is locally release-ready. The owner-approved schema replacement and testimonial removal are complete. GA4/GTM, consent and GSC work remains blocked by external access, so performance and conversion impact cannot yet be measured.

The duplicate selector was removed, selected states now use `aria-pressed`, runtime enum/range validation was added, and a mocked route suite proves management-first delivery with Graph email as fallback. UX also confirmed the mocked mobile success state is visible without sending a real request. The final lint, TypeScript, full test and production-build checks pass from the stable source.

## Verification reviewed

- `npm run lint`: passed with no warnings or errors.
- `npx tsc --noEmit`: passed after the final production build.
- Expanded targeted Christmas/schema/API/SSOT suites: 52 tests passed. The forced management-failure test logs its expected error before proving Graph fallback.
- Full Jest run: 100 suites passed, 937 tests passed and 1 skipped. Existing unrelated React `act(...)` warnings remain.
- Final production build: passed and emitted `/christmas-parties` as a static route at 16.4 kB page size and 181 kB first-load JS. These are build outputs, not CWV results.
- `tests/api/christmas-enquiry.test.ts` covers management success without duplicate Graph mail, Graph fallback, invalid service/format/range/date/time and legacy dinner compatibility. Live mailbox/management receipt remains unavailable.
- UX mocked the mobile success response without a real request and confirmed the success message was visible at the top of the open drawer; the final UX verdict is Pass.

## Codebase SEO Assessment

| Area | Assessment | Evidence / implementation note |
|---|---|---|
| Metadata | Good, page-local pattern | `app/christmas-parties/page.tsx` uses an absolute title, description, Open Graph, Twitter and a self-canonical URL. The new title is 51 characters and avoids the global suffix ambiguity. |
| Rendering | Good | Next.js 14 prerenders the route. The crawl found the H1, links, schema and body copy in the server response; the production build marks the route static. Important content is not dependent on a post-load API call. |
| Images | Good pattern, performance unverified | Page images use `next/image`, responsive `sizes` and meaningful alt text where appropriate. CrUX/PSI evidence is unavailable, so no performance pass is claimed. |
| Structured data | Accurate non-priced model | `lib/christmas-parties-schema.ts` emits WebPage and Service nodes linked to the shared business and website entities. It reads dates, capacity and offer wording from SSOT and contains no Event or hardcoded price fields. |
| Routing / indexation | Stable | No URL, canonical, redirect, robots or sitemap-membership change is proposed. The URL returns 200 and is included in `app/sitemap.ts`. |
| Sitemap freshness | Updated | `/christmas-parties` now uses the genuine 10 July 2026 page-update date. |
| Lead capture | Real backend, not a stub | The form POSTs to `/api/enquiry/christmas`; the route tries the management booking API first and uses Microsoft Graph email only as fallback. The response identifies `management` or `email_fallback`. |
| Analytics | Code-side parameters improved, delivery blocked | `form_journey`, `meal_service`, `party_format`, `party_size` and `form_source` are now emitted. The published GTM container has no proven GA4 mappings, and `form_start` currently means form display rather than first field interaction. |
| Seasonal maintenance | Manual | The metadata, form date range, page copy and navigation use 2026 values. A named 2027 rollover owner/date is still needed. |

## Conversion-path trace

```text
Hero / card / sticky CTA
  -> `christmas-open-form`
  -> page-owned StickyDrawer
  -> party OR meal (lunch / dinner)
  -> `/api/enquiry/christmas`
  -> management `/external/create-booking`
  -> draft private booking + management notification
  -> Microsoft Graph email only if management delivery fails
```

The management-first order prevents the duplicate manager email found during review. One operational point remains: an `email_fallback` response means the lead was sent but no management record was created. Log monitoring and reconciliation should make that visible to operations.

## Recommendation Feasibility

| Recommendation | Source agent | Fix type | Approval bucket | Feasibility | Effort (1-5) | Risk (1-5) | Dependencies |
|---|---|---|---|---|---:|---:|---|
| Short title/H1 and two immediate journeys | Strategy, Content, UX | One-off page fix | Pre-approved small fix | Easy, implemented | 1 | 1 | Final crawl |
| Party/meal plus lunch/dinner form and API mapping | Technical, Content, Analytics | Template/system fix | Pre-approved small fix | Moderate, implemented | 2 | 3 | Route tests and recipient QA |
| Machine-time normalisation and legacy mode compatibility | Technical | Template/system fix | Pre-approved small fix | Easy, implemented | 1 | 2 | Management API contract |
| Capacity, deposit, pre-order and live-pricing copy aligned to SSOT | Content, Editor | One-off page fix | Pre-approved small fix | Easy, implemented in prominent copy | 1 | 1 | Owner-supplied rule |
| Suppress competing overlays and adapt global sticky CTA | Technical, UX | Template/system fix | Pre-approved small fix | Easy, implemented | 1 | 2 | Cross-route regression check |
| Remove duplicate mode controls and add selected-state semantics | UX | One-off page fix | Pre-approved small fix | Easy, implemented | 1 | 1 | Keyboard/screen-reader check |
| Make success unmistakable with a dedicated focused state | UX | Template/system fix | Pre-approved small fix | Implemented and browser-verified | 2 | 2 | Mocked 200 browser test |
| Validate service, format, time/date and guest range server-side | Web developer review | Template/system fix | Pre-approved small fix | Easy, implemented | 1 | 2 | Backward-compatible enum list |
| Add route-level mocked tests and staging delivery matrix | Technical, Analytics, UX | Template/system fix | Pre-approved small fix | Route suite implemented; staging pending | 2 | 2 | Test credentials / mocked browser |
| Preserve the visitor's chosen journey when using the global sticky CTA | UX | Template/system fix | Pre-approved small fix | Easy, implemented | 1 | 2 | Shared sticky CTA/page event contract |
| Replace stale Event/offers schema | Technical, Editor | One-off page fix | High-risk approval received | Implemented and tested | 1 | 4 | Owner approval completed |
| Remove unverified testimonials unless source and permission records are supplied | Editor, UX | Content process fix | High-risk approval received | Implemented and tested | 1 | 3 | Owner approval completed |
| Reduce repeated sections and FAQs | Content, UX, Editor | Content process fix | High-risk approval required | Moderate | 3 | 4 | Content diff, GSC baseline, rollback copy |
| Publish GA4/GTM funnel mappings and consent controls | Analytics | Analytics/governance fix | Deferred or blocked | Moderate | 2 | 3 | GTM/GA4 access and privacy owner |
| Verify GSC property and import exact-page/query data | Analytics, Content | Analytics/governance fix | Deferred or blocked | Easy | 1 | 1 | GSC access |
| Obtain CWV evidence | Technical | Analytics/governance fix | Deferred or blocked | Easy | 1 | 1 | PSI/lab runner or field eligibility |
| Add 2027 rollover and post-season state | Technical, Content | Content process fix | Pre-approved small fix | Moderate | 2 | 2 | Named owner and dates |

## Implementation Plan

### Quick implementations (under 2 hours each)

None remain for the approved page scope.

### Medium implementations (2-8 hours each)

1. Run a controlled staging matrix to prove one management record/notification on success and one Graph email on fallback.
2. Configure and verify the GA4/GTM funnel after access is supplied.
3. After GSC data is available, prepare any approval-gated keep/merge/remove page diff.

### Large implementations (1-5 days)

None are required for this page. A cross-system confirmed-booking outcome with a non-PII enquiry identifier would be approximately one day across both repositories after the data contract is agreed.

### Major projects (1+ weeks)

None.

## Migration Risks

There is no URL, canonical, robots, redirect or indexation migration. The remaining risks are monitoring and operational:

- Schema replacement could alter enhancement reporting. Save the old block, validate rendered JSON-LD and monitor Search Console.
- Large copy pruning could remove valuable query coverage. Save a section-level rollback file and compare exact-page GSC queries when access exists.
- New enum validation could reject an unknown legacy caller. The implementation retains `dinner` and `buffet` compatibility and tests legacy dinner; add legacy buffet to the final matrix.
- Management-first fallback could still lose the management record during an outage. Preserve the verified email fallback and monitor `email_fallback` responses.

## Batching Recommendations

1. **Release hardening:** complete. Keep the final test/build evidence with the release.
2. **Christmas trust approval batch:** complete. The schema was replaced and the testimonials were removed.
3. **Measurement/admin batch:** GTM/GA4 event mappings, consent remediation, GSC access and the first post-release baseline.
4. **Cross-system operations:** notification/fallback policy and a later confirmed-booking outcome join.

## Resolved Approval Batch

- The long-running price-bearing Event was replaced with non-priced page and service markup.
- The three testimonials without traceable provenance were removed.
- Wider page pruning remains separate and deferred until GSC evidence exists.

## Pre-approved Small Fixes

- Keep the implemented selector semantics, runtime validation and route tests covered by regression checks.
- Preserve the implemented journey-aware global sticky CTA.
- Preserve the corrected phone/email contact paths and overlay suppression.
- Preserve the updated sitemap freshness and final validation evidence.

## Deferred or Blocked

- GA4/GTM mappings, key-event status and consent remediation: blocked on property/container access and privacy ownership.
- GSC page/query baseline: blocked on verified property access.
- CWV field evidence: unavailable; collect after release without claiming a pass or failure now.

```json
{"findings":[{"finding":"Email fallback protects the lead but can leave the management system without a booking record.","evidence":"app/api/enquiry/christmas/route.ts returns delivery email_fallback after a failed management request and successful Graph mail; tests/api/christmas-enquiry.test.ts verifies this branch.","source":"Current route and Jest inspection","dataStatus":"Known","severity":"Medium","confidence":"High","impactArea":"revenue","owner":"Technical","effort":"Small","dependencies":"Operational monitoring and reconciliation owner","fixType":"Analytics/governance fix","recommendedAction":"Alert on or report email_fallback responses and reconcile them into the management system.","validationStep":"Force a staging management 500, confirm one fallback email and confirm operations can identify and recover the missing record.","riskRollback":"Do not remove the fallback; disable only new alerting if it produces false positives."},{"finding":"Search and conversion measurement cannot yet validate the release.","evidence":"The published GTM container did not send the page custom funnel events to GA4 in the analytics specialist test; no GA4 property access, DebugView proof or exact-page GSC export exists in the workspace.","source":"Analytics specialist browser inspection and workspace evidence review","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"SEO","owner":"Analytics","effort":"Small","dependencies":"GTM, GA4, GSC and privacy-owner access","fixType":"Analytics/governance fix","recommendedAction":"Map form completion to GA4 generate_lead, map supporting events with consent controls, verify the canonical GSC property and capture a dated baseline.","validationStep":"Use Tag Assistant, network and GA4 DebugView for party, lunch and dinner, then reconcile a GSC exact-page/query export with the UI.","riskRollback":"Duplicate mappings can inflate leads; publish a versioned GTM container and revert it if any controlled action fires more than once."}]}
```
