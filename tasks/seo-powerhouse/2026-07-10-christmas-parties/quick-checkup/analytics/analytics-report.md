# Analytics & Performance Report

Date: 2026-07-10  
Scope: `/christmas-parties` and `/api/enquiry/christmas`

## Decision Summary

The measurement setup is not yet trustworthy enough to judge whether the page generates party or Christmas meal bookings. GTM and a GA4 Google tag are installed, but the published GTM container has no explicit mappings for the page's custom CTA, form, phone or email events. A live consented browser test produced `cta_click` and `form_start` in `dataLayer`, while the GA4 network sent only `page_view`.

This is a Tier-1 immediate prerequisite. Publish and verify conversion event mappings before using GA4 to judge the optimisation. GSC access is also unavailable, so no search baseline, CTR-gap analysis, striking-distance analysis or ranking trend can be trusted yet.

The code being prepared for this page adds the right commercial split, `party` versus `meal`, and `lunch` versus `dinner`. Those fields must be carried through every form surface and into the GA4 success event before release.

## Performance Baseline

| Measure | Baseline | Data status | Decision |
|---|---:|---|---|
| Organic clicks, impressions, CTR and average position | Unavailable | No GSC export or verified property access | Do not claim search uplift; obtain the exact URL/query export first |
| Organic sessions and engaged sessions | Unavailable | No GA4 property access or export | Do not claim traffic or engagement improvement |
| Christmas enquiry completions | Unavailable | Custom completion event is not mapped in the published GTM container | Fix and verify tracking before launch |
| Qualified party enquiries | Unavailable | Live form only distinguishes dinner/buffet; prepared code is not deployed or fully verified | Require `form_journey=christmas_party` |
| Qualified Christmas lunch enquiries | Unavailable | Live form has no lunch service | Require `form_journey=christmas_meal` and `meal_service=lunch` |
| Qualified Christmas dinner enquiries | Unavailable | Live form uses dinner as a mode, not a meal service | Require `form_journey=christmas_meal` and `meal_service=dinner` |
| Confirmed bookings and booking value | Unavailable | The page records an enquiry success, not a confirmed booking outcome | Reconcile enquiries with management-app booking status |

No `search-queries.csv` exists, so the opportunity miner and site-specific CTR curve could not be run. This is a missing-data result, not a zero-opportunity result.

## Quick Win Opportunities

| Opportunity | Current evidence | Potential | Action required | Expected impact |
|---|---|---|---|---|
| Send the successful enquiry to GA4 | `form_complete` is pushed to `dataLayer`, but the live GTM resource contains only initialisation rules | High | Map a successful API response to GA4 `generate_lead`; mark that event as the one primary key event | Makes the page's main commercial action measurable |
| Segment the two booking journeys | Prepared code introduces party/meal and lunch/dinner fields | High | Send `form_journey`, `meal_service`, `party_format`, `party_size` and `form_source` on every form event | Shows which offer and entry point produce qualified enquiries |
| Define form-open and form-start semantics | Prepared code now emits a dedicated `form_submit`, but `form_start` still means the drawer/lightbox was shown | Medium | Either call the display event `form_open` or move `form_start` to first interaction; map submit and use `generate_lead` only after success | Produces a usable open-to-start-to-completion funnel |
| Restore consent control for non-Google tags | Fresh-browser test loaded Clarity, LinkedIn and Meta before a choice and set marketing cookies | Critical | Require the relevant consent state in GTM before those tags load | Respects the banner choice and removes a material privacy risk |
| Establish search performance access | No GSC data is present | High | Verify the canonical-domain GSC property and import URL/query data | Enables search opportunity, CTR and post-launch analysis |

## Declining Performance Alerts

No decline can be identified because no current-period and comparison-period GSC or GA4 dataset was supplied. Manual SERP checks are not a performance trend source.

## Segmented Performance

### By Page Type

Unavailable. The crawl confirms this is an indexable commercial landing page, but traffic and conversion data by page type are not available.

### By Topic Area

Unavailable. The measurement design should report this page as a Christmas commercial topic and split results into `christmas_party` and `christmas_meal`.

### By Device and Geography

Unavailable from GA4. Keep `device_type` on events and report local demand only from real GSC/GA4 geography data after access is restored.

## Measurement Framework

### Primary KPIs

1. Qualified organic Christmas enquiries, split by `christmas_party` and `christmas_meal`.
2. Successful enquiry rate from form start, split by lunch, dinner and party format.
3. Organic clicks, impressions and CTR for the exact page and its party-versus-meal query clusters.
4. Confirmed booking rate from enquiry, split by journey.
5. Confirmed booking value from organic enquiries, once the management app can return or export it.

Do not set a numeric uplift target until the first trustworthy baseline period exists. For release QA, the target is exact rather than statistical: every successful test enquiry must contain the right journey, service, source and party-size values once, with no personal data in analytics.

### Leading Indicators

- GSC impressions and clicks for party and festive meal clusters.
- CTA-to-form-start rate by `form_source`.
- Form-start-to-`generate_lead` rate by journey and device.
- API error rate and completion failures.
- Manual AI citation checks and identifiable AI-referral sessions, labelled directional because attribution is incomplete.

### Reporting Cadence

- Weekly during the booking season: enquiries by journey/service/source, failures and management-app reconciliation.
- Monthly: GSC page/query clicks, impressions, CTR and position; GA4 organic lead rate; confirmed booking rate.
- After the season: booking value and lead quality by journey, then set the next season's baseline.

## GA4 / GTM / Tagging Health

| Area | Status | Evidence | Risk | Required fix |
|---|---|---|---|---|
| GTM and GA4 installation | pass | Live page loads `GTM-WWFQTQS`; the published container loads Google tag `G-2ZTRYGDRJW` | Installation alone can look healthy while leads remain invisible | Keep one Google tag and document the owning property/container |
| Initial page view | pass | Fresh-browser network test observed one GA4 `page_view` request | Client-side route changes remain unverified | Test navigation into and away from the page in Tag Assistant |
| Custom conversion delivery | fail | After consent, `cta_click` and `form_start` appeared in `dataLayer`; only `page_view` was sent to GA4 | The main commercial funnel is invisible | Add GTM GA4 event mappings and verify in DebugView |
| Party/meal and lunch/dinner dimensions | partial | Prepared page code introduces the fields, but live code and all form surfaces are not verified | Leads may still be misclassified | Carry the fields through hero, drawer, lightbox, API and analytics |
| Consent defaults | partial | Google consent defaults are denied before GTM and the Google tag sends a denied-state ping | This does not control every third-party tag | Keep Google Consent Mode and add consent checks to non-Google tags |
| Non-Google tag consent | fail | Fresh-browser test loaded Clarity, LinkedIn and Meta before a banner choice; `_fbp`, `bcookie`, `li_gc` and `lidc` were set | Privacy choices are not respected | Block each tag until the correct analytics or marketing consent is granted |
| Attribution | fail | The dispatcher adds saved attribution only to purchase and hosted booking completion events, not Christmas form completion | Organic landing source cannot be joined reliably to the lead | Attach attribution to the canonical lead event or rely on a single verified GA4 client event path |
| Confirmed booking outcome | fail | The API returns success after email delivery even if management-app forwarding fails | An enquiry can be counted as a booking when it is only a lead | Track `generate_lead` at form success and reconcile a later booked outcome separately |
| GSC property | fail | No GSC page/query or indexing export exists | Search outcomes cannot be measured | Verify the canonical-domain property and export the exact page/query data |

Google's documentation states that non-Google tags without built-in consent checks need explicit Tag Manager consent controls: [About consent mode](https://support.google.com/tagmanager/answer/10000067?hl=en). GA4 recommends `generate_lead` for an initial lead generated through a form: [Recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events).

## Post-Launch Validation Plan

| Shipped change | 0-48h checks | 1-2 week checks | 4-8 week checks | Baseline to compare |
|---|---|---|---|---|
| Party versus meal form split | Test party, lunch and dinner in desktop/mobile; confirm payload and recipient labels | Review failed requests and malformed journey values | Compare lead mix and completion rate by journey | No trustworthy pre-change split; release QA becomes baseline |
| GA4 lead event | Confirm exactly one `generate_lead` request and DebugView event per successful test | Reconcile GA4 leads with received enquiry emails | Compare organic leads and completion rate | Current custom lead delivery: not observed |
| Consent remediation | Test fresh, reject, analytics-only and accept-all states; inspect scripts, cookies and network | Check consent diagnostics and tag exceptions | Review consent-rate and data-quality effects | Current fresh state loads non-Google tags before choice |
| SEO/content changes | Confirm rendered title, canonical, schema and event parameters | Check GSC indexing/errors and early query coverage | Compare exact-page clicks, impressions, CTR, position and organic leads | Current crawl fingerprint plus first verified GSC/GA4 export |

## Data Gaps

- GA4 property and GTM workspace access, including DebugView and key-event configuration.
- GSC canonical-domain property access and URL/query export.
- A confirmed-booking outcome from the management app, joined by a non-PII enquiry identifier.
- Internal/test traffic controls and a documented staging test method.
- AI Assistant channel status or a maintained AI-referral segment.

```json
{"findings":[{"finding":"The published GTM container does not map the Christmas page's custom CTA or form events to GA4, so the primary enquiry funnel is not measurable.","evidence":"Live browser test on 2026-07-10: after analytics consent, `cta_click` and `form_start` appeared in `dataLayer`, while GA4 network requests contained only `page_view`; the public GTM resource for GTM-WWFQTQS has no custom-event trigger rules.","source":"Playwright browser network and dataLayer inspection plus published GTM container inspection","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"conversion","owner":"Analytics","effort":"Small","dependencies":"GTM and GA4 property access","fixType":"Analytics/governance fix","recommendedAction":"Map successful Christmas form completion to GA4 `generate_lead`, map supporting funnel events, and mark only `generate_lead` as the primary key event.","validationStep":"Complete a mocked or staging party, lunch and dinner enquiry and confirm exactly one `generate_lead` in browser network, GTM Preview and GA4 DebugView for each success.","riskRollback":"A duplicate client and server mapping could double-count leads; publish through a versioned GTM workspace and revert the tag version if duplicates appear."},{"finding":"GA4 and GSC property access is unavailable, so neither conversion nor search performance has a trustworthy baseline.","evidence":"No GA4 export, DebugView record, GSC export or `search-queries.csv` exists in the audit workspace.","source":"SEO Powerhouse workspace evidence review","dataStatus":"unavailable","severity":"High","confidence":"High","impactArea":"SEO","owner":"Analytics","effort":"Small","dependencies":"GA4, GTM and GSC access","fixType":"Analytics/governance fix","recommendedAction":"Verify the correct GA4 web stream, GTM container and canonical-domain GSC property; export exact-page and query data before judging uplift.","validationStep":"Reconcile GA4 DebugView/Realtime with test actions and reconcile a GSC URL/query export with the same UI date range.","riskRollback":"Read-only access and export work has no site rollback; remove access if it was granted to the wrong account."},{"finding":"Party versus meal and lunch versus dinner must be carried through every form surface and the canonical success event.","evidence":"The live page uses dinner/buffet; prepared client code introduces `party|meal` and `lunch|dinner`, but hero, seasonal lightbox, API handling and published analytics were not all verified at audit time.","source":"Manual code inspection and live page inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"revenue","owner":"Analytics","effort":"Small","dependencies":"Developer and GTM access","fixType":"Template/system fix","recommendedAction":"Use `form_journey`, `meal_service`, `party_format`, `party_size` and `form_source` consistently in hero, drawer, lightbox, API, email and GA4 events.","validationStep":"Run a party, lunch and dinner test matrix and compare dataLayer, request payload, email, management record and GA4 parameters.","riskRollback":"Changing enum values can break downstream consumers; keep a documented compatibility mapping and revert the form/API release if recipient handling fails."},{"finding":"Non-Google analytics and marketing tags load before the visitor makes a consent choice.","evidence":"A fresh browser with no consent cookie requested Clarity, LinkedIn and Meta scripts; Clarity and LinkedIn collection requests occurred and `_fbp`, `bcookie`, `li_gc` and `lidc` cookies were present before interaction.","source":"Playwright browser network and cookie inspection on the live page","dataStatus":"Known","severity":"Critical","confidence":"High","impactArea":"UX","owner":"Analytics","effort":"Small","dependencies":"GTM workspace and privacy owner","fixType":"Analytics/governance fix","recommendedAction":"Add explicit analytics/marketing consent requirements to non-Google tags and review the first-party attribution cookie classification.","validationStep":"In a fresh browser, reject and analytics-only scenarios must not load marketing tags or set marketing cookies; accept-all must enable them once.","riskRollback":"Over-blocking can reduce legitimate measurement; use a versioned GTM release and restore the previous container version if approved tags stop after consent."},{"finding":"A successful form response represents an enquiry email, not a confirmed booking outcome.","evidence":"`app/api/enquiry/christmas/route.ts` sends email first, logs but does not fail when management-app forwarding fails, and returns `{success:true}` without a booking identifier.","source":"Manual code inspection","dataStatus":"Known","severity":"High","confidence":"High","impactArea":"revenue","owner":"Analytics","effort":"Medium","dependencies":"Management app and developer","fixType":"Analytics/governance fix","recommendedAction":"Measure form success as `generate_lead`, then reconcile a later qualified/booked status and booking value using a non-PII enquiry identifier.","validationStep":"For a dated test set, match website lead count to received email, management record and final booking status without using customer details in GA4.","riskRollback":"Offline updates can duplicate leads if identifiers are unstable; disable the import and rebuild from the source ledger if reconciliation fails."}]}
```
