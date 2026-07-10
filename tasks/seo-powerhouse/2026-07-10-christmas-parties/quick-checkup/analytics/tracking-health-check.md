# GA4, GTM & Action-Tagging Health Check

Date: 2026-07-10  
Priority: Tier-1 immediate prerequisite  
Scope: `/christmas-parties`, its drawer/lightbox forms and `/api/enquiry/christmas`

## Health Check

| Area | Status | Evidence | Risk | Required fix | Acceptance criteria |
|---|---|---|---|---|---|
| GTM installation | pass | `app/layout.tsx` installs GTM and the live page loads `GTM-WWFQTQS` | None at install level | Document container owner and production publish process | Tag Assistant connects to the expected container on the page |
| GA4 installation | pass | Published GTM loads Google tag `G-2ZTRYGDRJW`; a live initial `page_view` was observed | Installed does not mean conversions work | Confirm this is the intended GA4 web stream | DebugView shows the tested browser and exact page path |
| Duplicate initial page view | pass | One initial `page_view` was observed in a fresh-load browser test | Client-side navigation remains untested | Test Next.js route navigation separately | Exactly one page view per initial load and one per route change |
| Universal Analytics legacy tag | pass | No `UA-` property was found in the live published container | Low | None | No UA-only tag appears in Tag Assistant |
| Google consent default | pass | `app/layout.tsx` sets analytics/ad/personalisation storage to denied before GTM; GA4 sent a denied-state ping | None for the Google-tag default | Add and verify `ad_user_data` and `ad_personalization` state if the owning policy requires them explicitly | Tag Assistant consent timeline shows the correct default before tags |
| Non-Google consent control | fail | Fresh browser loaded Clarity, LinkedIn and Meta before choice; collection requests and marketing cookies were observed | Visitors' banner choices are not respected by those tags | Add explicit consent requirements in GTM; review first-party attribution-cookie classification | Reject sets no marketing cookies and loads no marketing tags; analytics-only still blocks Meta/LinkedIn |
| Initial page view | pass | Browser network showed GA4 `en=page_view` for the exact page title/path | None for initial load | Keep current Google tag | One correct event in DebugView and network |
| SPA route page views | unverified | No client-side route test or GA4 property view was available | Route changes may be missing or duplicated | Test internal navigation into and away from the page | One page view per route change with correct path/title |
| Priority CTA events | partial | CTA handlers call `trackCtaClick`; a live event appeared in `dataLayer` but not in GA4 | Entry-source performance is invisible | Map `cta_click` to a GA4 event with `cta_id`, `cta_location`, `cta_destination` and `cta_mode` | One GA4 CTA event per click, never marked as the primary key event |
| Form start | partial | Prepared code records drawer/lightbox display as `form_start`; no GA4 mapping exists | An open can be mistaken for meaningful form interaction | Either rename it `form_open` or fire `form_start` once on first field interaction | One clearly defined event per form instance in dataLayer/network/DebugView |
| Form submit attempt | partial | Prepared main and lightbox code emit `form_submit` immediately before the request; no published GA4 mapping exists | Attempts remain invisible in GA4 until the container is updated | Map the prepared event with the final journey/service/format/party-size fields | One attempt event per request in dataLayer, network and DebugView; not a key event |
| Successful enquiry | fail | Code calls `trackFormComplete` after a 2xx response; no GTM mapping or GA4 proof exists | The page's primary commercial outcome is invisible | Map success to GA4 `generate_lead` and mark it as the primary key event | Exactly one `generate_lead` after 2xx; none on validation or API failure |
| Form error | partial | UI displays errors, but there is no dedicated non-PII Christmas form error event | Failure rate and causes cannot be monitored | Add `form_error` with safe `error_stage` and `error_code` only | One error event per failed attempt, with no message containing personal data |
| Party versus meal | partial | Prepared client code introduces `party|meal`; live page, hero, lightbox, API and analytics were not all aligned when checked | Leads can be assigned to the wrong offer | Use `form_journey=christmas_party|christmas_meal` everywhere | All test surfaces carry the same value end to end |
| Lunch versus dinner | partial | Prepared main form adds `meal_service`; the live form and seasonal lightbox do not prove it | Lunch demand remains unreportable | Require `meal_service=lunch|dinner` for meal leads and omit it for party leads | Lunch and dinner tests appear as distinct GA4 values with no `(not set)` |
| Party format | partial | Prepared main form collects a party format; live/published analytics do not | Party-package demand remains unclear | Send a stable slug value, not a display label | Shared, private, buffet and drinks tests each produce the expected value |
| Party size | partial | Prepared submit and completion events now send numeric `party_size`; the published site and GA4 receipt are unverified | Lead qualification remains unavailable until release and mapping | Keep the field on submit/success and map it as an event parameter | DebugView shows the same number as the request, without customer details |
| Seasonal lightbox | partial | Prepared code now matches the core main-form journey/service/format/party-size fields, but the release and GA4 mapping are unverified | Lightbox leads can still disappear from reporting | Publish and verify the same event contract as the main form | Test output matches the main-form event contract |
| Phone clicks | partial | `phone_call_click` and server-queued `call_click` exist; prepared code adds the missing `christmas_enquiry` funnel, but the live release and GTM mapping are unverified | Calls cannot be trusted in GA4 and could be duplicated if both paths are mapped | Publish the Christmas classification, choose one canonical client event and map it once | One phone event with the Christmas funnel, `contact_source` and journey; no duplicate server/client lead |
| Email clicks | partial | `email_click` exists in `dataLayer`; no GA4 mapping or receipt proof | Email intent is invisible | Map `email_click` with source and journey; do not send the address | One event per click, no email address in event parameters |
| Attribution | fail | Dispatcher attribution allow-list excludes form completion/generate-lead; no cross-system enquiry ID exists | Organic landing source cannot be reconciled to later booking | Attach safe landing/UTM fields to the canonical lead event and add a non-PII operational join key | Test UTM survives landing-to-lead and matches the operational record |
| GA4 key-event status | unverified | No property access | Leads may arrive but not be marked important | Mark only `generate_lead` as the primary key event; keep CTA/start/phone/email as diagnostic unless business rules say otherwise | GA4 Admin and DebugView show correct key-event state |
| Internal/test traffic | unverified | No GA4 property/config access | QA can inflate production figures | Label staging/test traffic and configure internal/developer filtering | Test events are identifiable or excluded from business reports |
| GSC property | fail | No GSC export or verified property evidence | Search roadmap is unmeasurable | Verify canonical-domain property and exact page/query export | Export reconciles with GSC UI for the same dates |
| AI-referral capture | unverified | No GA4 channel-group access | Identifiable AI traffic may fall into Referral/Direct | Confirm native AI Assistant channel or add maintained source segment above Referral | Known test/referral examples land in the intended segment; report as directional |

## Event Contract to Implement

### 1. Primary lead event

- **GA4 event:** `generate_lead`
- **Trigger:** `/api/enquiry/christmas` returns a successful 2xx response.
- **Affected surfaces:** main drawer and seasonal lightbox on `/christmas-parties`.
- **Parameters:**
  - `lead_source=christmas_parties_page`
  - `form_name`
  - `form_source`
  - `form_journey=christmas_party|christmas_meal`
  - `meal_service=lunch|dinner` for meal only
  - `party_format` for party only, using stable slugs
  - `party_size` as a number
  - `page_path`
  - `device_type`
  - safe landing/UTM fields where available
- **Key event:** Yes, this is the primary website lead.
- **Consent dependency:** Analytics consent.
- **Do not send:** name, email, phone, notes, dietary requirements, exact personal free text or email subject.
- **Acceptance:** one event after success; zero events on validation/API failure; no duplicate client/Measurement Protocol event.

### 2. Supporting funnel events

| Event | Trigger | Required parameters | Key event? |
|---|---|---|---|
| `cta_click` | Booking, phone or email CTA selected | CTA ID/location/destination plus journey | No |
| `form_start` | First interaction with the opened form, once | Form name/source/journey/service/format | No |
| `form_submit` | Valid form attempts the API request | Form name/source/journey/service/format/party size | No |
| `form_error` | Validation, network or API failure | Form name/source/journey and safe error stage/code | No |
| `phone_call_click` | A tracked `tel:` link is selected | Contact source and journey | No, use as micro-conversion |
| `email_click` | A tracked `mailto:` link is selected | Contact source and journey | No, use as micro-conversion |

`generate_lead` is Google's recommended event for a new lead from a form. Do not call it a booking. A confirmed booking is a later management-app outcome.

## GTM Implementation Ticket

**Problem:** Custom events are created by the site but the published GTM container has no GA4 event mappings.

**Implementation:**

1. Create Custom Event triggers for the six names above, scoped to `page_path=/christmas-parties` where needed.
2. Create GA4 Event tags that map the listed data-layer variables.
3. Map the successful custom completion signal to GA4 `generate_lead` once.
4. Register journey, meal service, party format, form source and CTA location as event-scoped custom dimensions if reporting needs them.
5. Mark only `generate_lead` as the primary key event.
6. Decide whether the client GTM route or `/api/analytics` Measurement Protocol route owns each event. Never enable both for the same event without a shared event ID and deduplication plan.

**Safe disable:** Pause the new event tags or revert the versioned GTM container. Do not remove the existing Google tag.

## Consent Implementation Ticket

**Problem:** Non-Google tags load and collect before a banner choice.

**Implementation:**

1. Classify Clarity under analytics consent and LinkedIn/Meta under marketing consent with the privacy owner.
2. Add Tag Manager consent requirements to each tag.
3. Prevent custom HTML Meta and LinkedIn tags from firing on `gtm.js` until marketing consent is granted.
4. Confirm revocation prevents future collection and removes known cookies where technically possible.
5. Review whether `anchor-booking-attribution` should be written before consent; record the approved classification.

Google notes that tags without built-in consent checks need explicit consent settings: [Tag Manager consent mode support](https://support.google.com/tagmanager/answer/10718549?hl=en-GB).

## Exact Post-Change QA Matrix

| Test | Steps | Expected dataLayer | Expected network/GA4 | Pass condition |
|---|---|---|---|---|
| Fresh visitor | Clear storage, open page, do not choose | Consent default only; no custom conversion | Google denied-state ping is allowed; no Meta/LinkedIn marketing load or cookies | Marketing tags and cookies absent |
| Reject all | Choose Reject | Consent update to denied | No marketing tags; no full analytics events | No marketing collection after reject |
| Analytics only | Grant analytics, deny marketing | Analytics consent update | GA4/approved analytics work; Meta/LinkedIn stay blocked | Correct separation |
| Accept all | Grant all categories | Consent update to granted | Approved tags load once | No duplicates |
| Party lead | Open party from hero, interact, select party format, submit against staging/mock success | One CTA, one start, one submit, one success | Exactly one `generate_lead` with party journey and no meal service | Values match request and recipient record |
| Christmas lunch lead | Open meal, select lunch, submit success | Same funnel with `meal_service=lunch` | One `generate_lead` | No party format; lunch time retained |
| Christmas dinner lead | Open meal, select dinner, submit success | Same funnel with `meal_service=dinner` | One `generate_lead` | No party format; dinner time retained |
| Seasonal lightbox | Repeat party/lunch/dinner paths or open the main form from the lightbox | Same contract as main form | Same contract as main form | No `(not set)` journey/service |
| Validation error | Leave required field blank | At most one safe `form_error`; no submit request | No `generate_lead` | Error is non-PII |
| API failure | Mock 500/timeout | One `form_submit`, one safe error, no success | No `generate_lead` | Retry does not duplicate start |
| Phone | Click each Christmas phone CTA without navigating in QA | One canonical phone event with source/journey | One GA4 phone event | No duplicated `call_click` equivalent |
| Email | Click each Christmas email CTA without navigating in QA | One email event with source/journey | One GA4 email event | No email address in event payload |
| UTM retention | Land with test UTMs, navigate/open/submit | Lead includes safe landing attribution where designed | GA4 acquisition remains the test campaign | Operational record and event can be reconciled |
| Key-event state | Watch GTM Preview and GA4 DebugView | N/A | `generate_lead` arrives and is marked key; supporting events are not primary | Property/config screenshots saved |

## Operational Outcome Tracking

The website can measure a lead, but the business goal is a booking. Add a non-PII enquiry identifier that can be present in the management app and a secure operational export. Report these stages separately:

1. `generate_lead`, website enquiry succeeded.
2. Qualified lead, venue confirms the request is viable.
3. Confirmed booking, deposit or booking status is accepted.
4. Booking value, from the management source of truth.

Do not send customer details to GA4. If an offline GA4 event is introduced later, use a documented deduplication and consent approach.

```json
{
  "findings": [
    {
      "finding": "The live GTM container is installed but emits no verified Christmas conversion events to GA4.",
      "evidence": "Consented browser test produced `cta_click` and `form_start` in `dataLayer`, but the GA4 network contained only `page_view`; published GTM rules contain no custom-event triggers.",
      "source": "Playwright browser, network and published GTM resource inspection",
      "dataStatus": "Known",
      "severity": "Critical",
      "confidence": "High",
      "impactArea": "conversion",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "GTM and GA4 access",
      "fixType": "Analytics/governance fix",
      "recommendedAction": "Publish GA4 mappings for CTA/start/submit/error/contact events and map one successful response to `generate_lead` as the primary key event.",
      "validationStep": "Use GTM Preview, browser network and GA4 DebugView to prove one correctly parameterised event per controlled action.",
      "riskRollback": "Duplicate mappings can inflate reports; revert the versioned GTM container if any event fires more than once."
    },
    {
      "finding": "The new party, lunch and dinner taxonomy is prepared in code but not yet verified end to end.",
      "evidence": "Prepared code aligns hero, main form, lightbox and API to party/meal plus meal service, party format, source and numeric party size; the live release and published analytics still use the prior setup.",
      "source": "Manual code and live-page inspection",
      "dataStatus": "Known",
      "severity": "High",
      "confidence": "High",
      "impactArea": "revenue",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "Developer and GTM access",
      "fixType": "Template/system fix",
      "recommendedAction": "Publish and verify `form_journey`, `meal_service`, `party_format`, `party_size` and `form_source` across every surface and system.",
      "validationStep": "Compare party, lunch and dinner values in dataLayer, request payload, email, management record and GA4 DebugView.",
      "riskRollback": "Enum drift can break recipient workflows; maintain a compatibility mapping and revert the release if downstream handling fails."
    },
    {
      "finding": "Form-start currently represents form display rather than confirmed field interaction.",
      "evidence": "Prepared code calls `trackFormStart` from the drawer open handler and when the lightbox is shown; it now emits a separate `form_submit` before each request.",
      "source": "Manual inspection of app/christmas-parties/client-components.tsx",
      "dataStatus": "Known",
      "severity": "Medium",
      "confidence": "High",
      "impactArea": "conversion",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "Developer",
      "fixType": "Template/system fix",
      "recommendedAction": "Either rename the display event to `form_open` or fire `form_start` once on first interaction; retain `form_submit` and reserve `generate_lead` for 2xx success.",
      "validationStep": "A single form session produces clearly separated open/start, submit and success stages; retries add submits without extra starts.",
      "riskRollback": "A state guard could suppress legitimate starts after a closed/reopened form; reset it per form instance and revert if starts disappear."
    },
    {
      "finding": "Non-Google tags collect before the visitor chooses a consent option.",
      "evidence": "Fresh browser requested Clarity, LinkedIn and Meta resources before banner interaction and held `_fbp`, `bcookie`, `li_gc` and `lidc` cookies.",
      "source": "Playwright browser network and cookie inspection",
      "dataStatus": "Known",
      "severity": "Critical",
      "confidence": "High",
      "impactArea": "UX",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "GTM workspace and privacy owner",
      "fixType": "Analytics/governance fix",
      "recommendedAction": "Add explicit analytics/marketing consent checks to non-Google tags and review the attribution cookie classification.",
      "validationStep": "Fresh, reject, analytics-only and accept-all tests show only approved tags and cookies for each state.",
      "riskRollback": "Incorrect rules may block approved analytics after consent; restore the prior GTM version if the acceptance matrix fails."
    },
    {
      "finding": "Saved landing and UTM attribution is not attached to the Christmas lead completion event.",
      "evidence": "`lib/tracking/dispatcher.ts` limits attribution enrichment to purchase, table booking completion and hosted event booking completion; Christmas `form_complete` is not included.",
      "source": "Manual code inspection",
      "dataStatus": "Known",
      "severity": "High",
      "confidence": "High",
      "impactArea": "SEO",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "Developer and analytics design choice",
      "fixType": "Template/system fix",
      "recommendedAction": "Attach safe attribution to the one canonical `generate_lead` event and choose either GTM client delivery or Measurement Protocol to avoid duplicates.",
      "validationStep": "A test UTM landing retains its source through a successful enquiry and can be reconciled without customer details in GA4.",
      "riskRollback": "High-cardinality parameters can clutter GA4; remove unnecessary registered dimensions while retaining standard acquisition attribution."
    },
    {
      "finding": "A form success cannot be interpreted as a confirmed booking.",
      "evidence": "The API can return success after email delivery while management-app forwarding failures are only logged; no booking ID/status is returned.",
      "source": "Manual inspection of app/api/enquiry/christmas/route.ts",
      "dataStatus": "Known",
      "severity": "High",
      "confidence": "High",
      "impactArea": "revenue",
      "owner": "Analytics",
      "effort": "Medium",
      "dependencies": "Management app and developer",
      "fixType": "Analytics/governance fix",
      "recommendedAction": "Count website success as `generate_lead` and add a separate operational join for qualified and confirmed booking outcomes.",
      "validationStep": "Match a controlled cohort from lead through email, management record and final booking status using a non-PII identifier.",
      "riskRollback": "If join quality is unreliable, stop the offline import and rebuild from the management source ledger."
    },
    {
      "finding": "The correct GSC property and GA4 key-event configuration cannot be verified.",
      "evidence": "No property access, exports, DebugView screenshots or Admin configuration evidence was supplied.",
      "source": "Workspace evidence review",
      "dataStatus": "unavailable",
      "severity": "High",
      "confidence": "High",
      "impactArea": "SEO",
      "owner": "Analytics",
      "effort": "Small",
      "dependencies": "GSC and GA4 access",
      "fixType": "Analytics/governance fix",
      "recommendedAction": "Verify the canonical-domain GSC property and intended GA4 stream, then save exact-page exports and key-event proof.",
      "validationStep": "Reconcile exports with the product UI for identical dates and save the dated test matrix.",
      "riskRollback": "Read-only verification has no site rollback; revoke access if the wrong account was connected."
    }
  ]
}
```
