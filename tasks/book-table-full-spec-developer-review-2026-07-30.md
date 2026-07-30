# Developer review: Book a Table full implementation specification

Review date: 2026-07-30  
Source reviewed: `tasks/book-table-full-spec-2026-07-30.md`  
Codebases checked: `OJ-The-Anchor.pub` and `OJ-AnchorManagementTools`  
Review type: technical and delivery review only. The source specification was not changed.

## 1. Executive summary

The specification is **not ready for full implementation**.

It has a clear user goal and a useful release breakdown, but several core statements do not match the current code. The largest problems are:

1. The availability contract described in the specification is not the contract the applications currently use.
2. Availability can silently fall back to non-authoritative local calculations.
3. The proposed mixed food-and-drinks slot grid cannot be proven by the current AMS response.
4. The high-chair flow can silently reduce what the guest asked for.
5. The current phone “verification” exposes customer names and email addresses to anyone who knows a phone number.
6. The “one Confirm button” requirement conflicts with the existing create-then-pay PayPal flow.
7. Seasonal deposit work is split in a way that can enable money behaviour before the money release.
8. The Sunday lunch requirements contradict the current code, which has removed that public pre-order flow.
9. The proposed website flag is a build-time public environment variable, so turning it off is not instant.
10. The four-to-six-day estimate is not credible for the stated scope, testing, observation windows and two-codebase rollout.

Only isolated preparation work should start before the P0 findings are resolved. A2 staff display work and contract discovery can proceed. The main website flow, seasonal migration and payment changes should not start from this specification as written.

## 2. Rating method

- **P0:** blocks implementation or creates a serious booking, payment, privacy or rollout risk.
- **P1:** must be resolved before the affected feature is released.
- **P2:** should be resolved before general availability.
- **P3:** optional improvement.

Finding status:

- **Confirmed issue:** the specification conflicts with itself or with checked code.
- **Required gap:** the specification does not contain enough detail to implement or accept the feature safely.
- **Unconfirmed assumption:** the specification treats something as true without proof.
- **Optional improvement:** useful simplification or quality improvement, but not a release blocker by itself.

## 3. Code-backed facts used in this review

- AMS already accepts an optional last name in `src/app/api/table-bookings/route.ts`, and customer creation already stores an empty surname when none is provided in `src/lib/sms/customers.ts`.
- The website already omits a blank surname in `app/api/table-bookings/route.ts`.
- The public Sunday lunch pre-order path is explicitly retired in both applications.
- AMS `table_availability.slots` returns `state`, public reason, message and `high_chairs_remaining`. It does not return the combined `available`, `available_capacity` and `kitchen_open` shape described by A3.
- The website currently constructs a local slot list and overlays matching AMS results onto it.
- `getTableBookingLoadFailOpen` times out after 1.5 seconds and returns `null`; the availability route then uses local schedule calculations.
- The customer lookup API returns customer ID, first name, surname, full name, email and phone details after a phone-number-only lookup.
- The submit idempotency fingerprint and AMS request hash omit `requires_accessible_table`.
- The current form clamps the submitted high-chair request to the advisory number available at the selected slot.
- The current form has no implemented step deep link or saved journey state. It always starts at `find`.

## 4. Confirmed issues and required gaps

### F01. “Ready to build” is not true

- **Relevant section:** Header, §0, §10 and §12
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Delivery / governance
- **Description:** The header says all owner decisions are taken and the document is ready to build. Section 10 lists unresolved decisions, two of which block S3. Other required decisions are also missing from the specification.
- **Rationale:** A developer could reasonably begin payment or data-model work based on the header and discover later that the behaviour is not agreed.
- **Impact:** Rework, inconsistent implementation and unsafe assumptions about money.
- **Recommended action:** Change the status to “Ready for technical discovery; blocked for full build” until all P0 items and the S3 policy decisions are closed.
- **Suggested wording:** “Status: ready for contract discovery and non-payment preparation. The main flow, seasonal migration and payment release are blocked by the decisions and findings listed in the developer review.”
- **Open questions:** Who owns closing each decision, and what is the approval record?

### F02. Sunday lunch requirements contradict the current product

- **Relevant section:** Screen 2 item 4, §7, §8 item 2 and §11
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Functional / scope
- **Description:** The specification says Sunday lunch pre-order remains unchanged and must be regression-tested. Current code says the public Sunday lunch pre-order flow is retired and Sundays are regular food bookings.
- **Rationale:** Website `app/api/table-bookings/route.ts` strips `sunday_lunch` and `booking_type`. AMS `src/app/api/table-bookings/route.ts` marks `sunday_lunch` deprecated and does not persist public pre-orders.
- **Impact:** The developer cannot know whether to restore a removed feature or preserve the current product.
- **Recommended action:** Get an explicit owner decision. Either remove all Sunday pre-order requirements from this specification, or define restoring the feature as a separate, fully scoped workstream.
- **Open questions:** Is Sunday lunch pre-order meant to return? If yes, what menu, cutoff, payment and fulfilment rules apply?

### F03. The stated availability contract does not exist

- **Relevant section:** §2, W3 and A3
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Integration / API contract
- **Description:** A3 expects one per-slot shape containing `available`, `available_capacity`, `kitchen_open` and `high_chairs_remaining`. AMS currently returns two different slot collections:
  - `slots`, which contains kitchen pacing and high-chair data.
  - `table_availability.slots`, which contains authoritative table state and high-chair data.
  The website then builds a third combined shape.
- **Rationale:** `TableBookingLoadResponse` does not even type `table_availability`; the website reads it through `any`.
- **Impact:** Incorrect slot state, type holes, hard-to-test overlay rules and incompatible releases.
- **Recommended action:** Define one versioned response schema, including exact field names, types, null handling and semantics. Add shared fixtures and contract tests in both repositories before W3.
- **Open questions:** Should AMS return the final browser-ready slot shape, or should the website combine two explicitly typed AMS datasets?

### F04. Availability currently fails open

- **Relevant section:** Goal, W3, A3, §8 and §11
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Reliability / integration
- **Description:** The specification treats AMS as slot truth. In current code, an AMS load timeout returns `null`, after which the website serves locally calculated schedule slots. Those calculations do not know table assignments, private blocks, joins or communal event allocations.
- **Rationale:** This can recreate the exact false-availability defect that v06 was designed to remove.
- **Impact:** A guest may be shown and select a slot which AMS cannot book.
- **Recommended action:** Treat missing or timed-out authoritative availability as `unknown`, show a retry/call message and do not display locally guessed bookable slots. Remove the “fail open” path from the revenue flow.
- **Open questions:** What response-time budget should be used before showing `unknown`? Is a controlled retry allowed?

### F05. The mixed food-and-drinks grid is not authoritatively supported

- **Relevant section:** Screen 1 item 3, W3, W4 and A3
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Functional / API design
- **Description:** The target grid shows both “Drinks & food” and “Drinks only” times in one result. AMS availability is requested for one purpose at a time. A food request only computes kitchen service times; unmatched pub-only times can be left as local website slots.
- **Rationale:** Table order, duration and pacing differ between food and drinks. One purpose cannot prove availability for the other purpose.
- **Impact:** Drinks-only slots may be shown without authoritative table checks, or valid drinks slots may be hidden.
- **Recommended action:** Make the contract return authoritative food and drinks state for every displayed time, or make two bounded AMS calls and merge by a documented rule. Never treat an unmatched local slot as bookable.
- **Open questions:** When both purposes are available at the same time, which state and label win? Does selecting a “Drinks only” time automatically set the booking purpose?

### F06. A high-chair request can be silently reduced

- **Relevant section:** D3, D4, Screen 1 item 5 and W3
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Functional / safety / UX
- **Description:** The specification allows a guest asking for two chairs to choose a slot with one available. It does not require clear acceptance of the shortfall. Current form code also clamps the submitted request to the advisory remaining count, so an original request for two can become a request for one.
- **Rationale:** “1 high chair free” is information, not consent to book with fewer chairs. Availability can also change before create.
- **Impact:** The guest may arrive expecting two chairs while the booking only records one.
- **Recommended action:** Preserve both `high_chairs_requested` and `high_chairs_granted`. Require an explicit acknowledgement before confirmation when the shown number is lower. Re-check atomically at create and return a clear recoverable state if the grant is lower than the accepted amount.
- **Open questions:** Should a booking ever confirm with fewer chairs than explicitly accepted? If yes, what exact wording must the guest accept?

### F07. Outside seating and high chairs conflict

- **Relevant section:** D2-D4, Screen 1 item 4 and §8 item 4
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Functional
- **Description:** Screen 1 allows all four refinements together. The regression checklist says outside bookings have “no high-chair interaction”. Current AMS still reserves high chairs for outside bookings.
- **Rationale:** These are different rules and lead to different availability and confirmation results.
- **Impact:** Incorrect chair inventory or an impossible user selection.
- **Recommended action:** Decide one rule. Either support chairs outside and include them in availability/create, or disable and reset high chairs when Outside is selected with a clear message.
- **Open questions:** Can every outside table safely take a high chair?

### F08. The outside step-free guarantee is not enforced

- **Relevant section:** D5, Screen 1 item 4, §4.5 and §8 item 7
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Accessibility / allocation
- **Description:** The copy promises step-free access and standard-height seating. In AMS, the outside reservation branch does not allocate a physical table and does not apply `requires_accessible_table`.
- **Rationale:** Saying the garden is step free does not prove that a standard-height outside table is reserved.
- **Impact:** A false accessibility promise.
- **Recommended action:** Model and enforce accessible outside capacity, or disallow the combination until it can be guaranteed. Add a contract and allocation test for Outside + Step-free.
- **Open questions:** How many outside tables are standard height, step free and suitable for the requested party size?

### F09. A1 is already largely implemented

- **Relevant section:** D6, W2 and A1
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Scope / technical accuracy
- **Description:** AMS already treats `last_name` as optional. Customer creation already stores an empty surname when one is not supplied. The website proxy already omits blank surnames. The RPC receives a customer ID, not a surname.
- **Rationale:** A1 describes work that the checked code already does and says to pass empty/null to an RPC which has no surname parameter.
- **Impact:** Wasted work and misleading acceptance criteria.
- **Recommended action:** Replace A1 with a verification task. W2 should cover the form rule, known-customer behaviour, messages, exports, search and all staff/customer templates.
- **Suggested wording:** “Verify the existing optional-surname API and customer-storage path, then remove the website form requirement and test all display and notification surfaces.”
- **Open questions:** Which reports or integrations still assume a non-empty surname?

### F10. Phone lookup is not verification and exposes personal data

- **Relevant section:** D6 and Screen 2 item 1
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Security / privacy
- **Description:** The specification calls the existing mobile step “verification”. It is a phone-number-only lookup. The public website proxy can return full name, email, customer ID and phone data without an OTP.
- **Rationale:** Anyone who knows or guesses a phone number can learn whether the person is a customer and see their details. The in-memory per-instance rate limit is not a reliable distributed defence.
- **Impact:** Customer enumeration and personal-data disclosure.
- **Recommended action:** Stop returning identity data before possession is proved. Use an OTP or return only a non-identifying result. Use a shared rate limiter, abuse monitoring and generic responses.
- **Open questions:** Is OTP required for all guests or only recognised numbers? What is the permitted fallback if SMS is unavailable?

### F11. “One Confirm button” conflicts with PayPal

- **Relevant section:** Screen 2 items 4-5, W6 and S3
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Functional / payments
- **Description:** The current flow creates a pending booking first, then creates and displays a PayPal order, then captures it. That needs at least one additional PayPal interaction. It cannot remain unchanged while also having one final Confirm button.
- **Rationale:** “Confirm booking” is misleading if the result is only a temporary unpaid hold.
- **Impact:** Confused guests, abandoned pending bookings and incorrect analytics/notifications.
- **Recommended action:** Define the complete screen-2 state machine: details, create hold, payment setup, PayPal approval, capture, confirmed, failed, expired and resumed. Use honest button labels such as “Continue to payment” when payment is required.
- **Open questions:** Is the booking considered submitted before payment? Can a guest edit details after the hold is created?

### F12. S2 performs money work that S3 says is disabled

- **Relevant section:** S2, S3 and §9
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Delivery / payments
- **Description:** S2 says AMS computes and stores the period deposit. S3 is described as the money release behind its own flag.
- **Rationale:** Existing payment logic reads stored deposit and payment state. Writing deposit data in S2 can trigger or alter money behaviour before S3.
- **Impact:** Accidental charges, pending holds or incorrect staff/customer messages.
- **Recommended action:** Make S2 metadata-only, with no payment-state or deposit-amount effect, or move all deposit computation and storage into S3 behind one server-side flag.
- **Open questions:** What exact database values may S2 write while the money flag is off?

### F13. The seasonal model cannot reliably identify a Christmas period

- **Relevant section:** S1 migration sketch and S1 guard
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Data model
- **Description:** `booking_periods` has a display name but no stable period kind/code. The text says a “Christmas one” sets `booking_type = christmas`, but no field defines that.
- **Rationale:** Matching the word “Christmas” in a manager-editable name is unsafe.
- **Impact:** Wrong booking type, deposit rules and legacy behaviour.
- **Recommended action:** Add a stable `period_kind` or `code` with an allowed-value constraint. Keep the display name separate.
- **Open questions:** Can there be more than one period of the same kind in different years? Are custom period kinds allowed?

### F14. Seasonal bookings do not keep enough historical terms

- **Relevant section:** S1 and S2
- **Status:** Required gap
- **Priority:** P1
- **Type:** Data / audit / payments
- **Description:** The specification snapshots only the amount. Editing a period can change its name, question, basis, dates and policy while old bookings still point to the edited row.
- **Rationale:** Payment disputes and staff support need the terms accepted at booking time.
- **Impact:** Loss of audit history and unclear customer promises.
- **Recommended action:** Snapshot the period name/code, answer, basis, rate, computed amount, currency and policy version on the booking or an immutable booking-terms record.
- **Open questions:** Which terms must appear in confirmation messages, cancellation screens and reports?

### F15. Seasonal migration and backfill are incomplete

- **Relevant section:** S1 and §9 rollback
- **Status:** Required gap
- **Priority:** P1
- **Type:** Migration / deployment
- **Description:** There is no plan for existing `christmas` bookings, initial period records, the existing fixed Christmas window or direct staff/API callers. The foreign key also needs an index, deletion policy and a decision on orphan prevention.
- **Rationale:** Shipping the guard before initial data can block legitimate Christmas bookings.
- **Impact:** Production booking failures and incomplete historical data.
- **Recommended action:** Add a preflight, seed/backfill, validation query, compatibility period and roll-forward plan. Test the migration against a production-like snapshot.
- **Open questions:** Which existing bookings should receive a period ID? What initial 2026 periods must be seeded?

### F16. Seasonal admin security and validation are underspecified

- **Relevant section:** S1 admin UI and permissions
- **Status:** Required gap
- **Priority:** P1
- **Type:** Security / data
- **Description:** Function grants are mentioned, but table RLS, CRUD endpoints/server actions, CSRF protection, input validation and audit records are not. The sketch also lacks checks for positive party limits, `min <= max`, currency and updated-at maintenance.
- **Rationale:** These settings control public availability and money.
- **Impact:** Unauthorised changes, invalid configuration and weak incident traceability.
- **Recommended action:** Define the full permission boundary, RLS, server-side validation, audit payload, optimistic concurrency and change confirmation.
- **Open questions:** Who may create, edit, activate and deactivate periods? Is a second approval needed for deposit changes?

### F17. Client-controlled period data needs a trust boundary

- **Relevant section:** S2 create path
- **Status:** Required gap
- **Priority:** P0
- **Type:** Security / integration
- **Description:** `booking_period_id` comes from the browser. The specification says AMS validates the date, but does not state that AMS must ignore all client-supplied amount, basis, name and limits.
- **Rationale:** A guest can tamper with browser requests.
- **Impact:** Deposit bypass or incorrect booking classification.
- **Recommended action:** AMS must load the active period by ID and booking date inside the same transaction, compute all rules server-side and reject stale or inactive IDs.
- **Open questions:** What error code should a stale period selection return so the website can recover?

### F18. Idempotency does not cover all booking-changing fields

- **Relevant section:** W3 and S2
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Reliability / integration
- **Description:** Current client, website proxy and AMS request hashes omit `requires_accessible_table`. The proposed period ID and period answer are not added to the idempotency requirements.
- **Rationale:** A retry with changed accessibility or seasonal choices can conflict with or replay a different booking intent.
- **Impact:** Wrong table requirements, wrong deposit or confusing 409 errors.
- **Recommended action:** Define one canonical idempotency fingerprint including every meaningful booking field, especially accessibility, period ID, accepted shortfall, party size, purpose and deposit-relevant state. Test identical retries and changed-intent retries through both proxies.
- **Open questions:** Should notes and communication consent be part of booking identity or handled separately?

### F19. The website flag is not an instant rollback

- **Relevant section:** W3-W6 and §9
- **Status:** Confirmed issue
- **Priority:** P0
- **Type:** Delivery / operations
- **Description:** `NEXT_PUBLIC_BOOKING_OPTIONS_STEP1` is a public build-time environment variable. Changing it normally needs a new website build and deploy. The specification calls flag-off instant.
- **Rationale:** The stated rollback time is false.
- **Impact:** A booking defect can remain live during a rebuild.
- **Recommended action:** Use a runtime server-side flag or remote configuration with a safe cached default, or describe the real redeploy rollback time.
- **Open questions:** Which runtime flag service or existing settings path will be used?

### F20. One flag does not match the proposed release sequence

- **Relevant section:** W3-W6 and §9 ship order
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Delivery
- **Description:** W3 is enabled on a quiet weekday before W4-W6, but the same flag is meant to represent the final W3-W6 flow. The specification also says each PR is independently shippable and reversible.
- **Rationale:** A single flag cannot independently roll back four gradually changing behaviours.
- **Impact:** Large test matrix and unclear live state.
- **Recommended action:** Either ship W3-W6 as one tested package behind one flag, or use separate short-lived flags with a documented compatibility matrix.
- **Open questions:** Which intermediate states are approved for guests?

### F21. The analytics baseline is sequenced incorrectly

- **Relevant section:** W1, W3-W6 and §9
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Analytics / delivery
- **Description:** W1 says capture a baseline before W4-W6, but W3 already moves major controls and changes the booking flow. W3 therefore changes the baseline population.
- **Rationale:** Before-and-after results will mix two experiences.
- **Impact:** Unusable success measurements.
- **Recommended action:** Capture the complete baseline before W3, then use flag exposure to separate cohorts after release.
- **Open questions:** Can the current traffic volume support a meaningful two-week comparison?

### F22. Outcomes do not have decision thresholds

- **Relevant section:** §1, W1 and the “two clean weeks” rule
- **Status:** Required gap
- **Priority:** P1
- **Type:** Analytics / acceptance
- **Description:** The specification says metrics should rise or fall, but gives no exact event definitions, denominator, consent effect, target, guardrail or go/no-go threshold.
- **Rationale:** “Clean” and “improved” cannot be judged consistently.
- **Impact:** The old path may be removed without evidence.
- **Recommended action:** Define event schemas, exposure event, deduplication, funnel denominator, minimum sample, target change, payment-success guardrail and data-quality checks. Do not send names, phone numbers, notes or booking references to client analytics unless explicitly approved and protected.
- **Open questions:** Who signs off the analytics result and old-path removal?

### F23. Refinement behaviour is ambiguous and potentially expensive

- **Relevant section:** Screen 1 items 2 and 5, W3
- **Status:** Required gap
- **Priority:** P1
- **Type:** Performance / UX / integration
- **Description:** Search is said to be button-triggered and never automatic, but every refinement must re-filter real availability. The current API must be called again because the response only represents one option set.
- **Rationale:** Rapid taps can create parallel database work, stale responses and flickering selections.
- **Impact:** Slow booking flow and unnecessary load on AMS.
- **Recommended action:** State that initial search is button-triggered and later option changes use a cancelled, latest-request-wins refresh. Define loading, disabled, failure and stale-response behaviour. Add rate and latency budgets.
- **Open questions:** Should option changes wait for an Apply button instead?

### F24. Create-time slot loss has no complete recovery journey

- **Relevant section:** Goal, Screen 2 and §8
- **Status:** Required gap
- **Priority:** P0
- **Type:** Error handling / UX
- **Description:** Availability can change after a slot is selected. The specification does not say what happens when Confirm returns `no_table`, `slot_full`, `customer_conflict`, `in_past`, `cut_off`, `409`, `429` or `503`.
- **Rationale:** The goal says the guest is never stranded.
- **Impact:** Lost form data, duplicate attempts or a dead end at the highest-intent point.
- **Recommended action:** Define a response-to-UI matrix. Preserve details, refresh availability, explain the reason safely and return the guest to screen 1 with real alternatives.
- **Open questions:** Which blocked states should offer a phone call versus retry?

### F25. Seasonal “Yes/No” meaning is not operationally clear

- **Relevant section:** S2
- **Status:** Required gap
- **Priority:** P0
- **Type:** Product / functional
- **Description:** “No” is always allowed, including during a Christmas period. The specification does not define what service, menu or terms the guest receives after saying no.
- **Rationale:** A guest may say no to avoid a deposit while still expecting the seasonal meal.
- **Impact:** Payment avoidance, kitchen confusion and customer disputes.
- **Recommended action:** Define what Yes and No mean for each period kind, including menu, availability, price, deposit and staff display. If no regular service is available, No must not be offered.
- **Open questions:** During each named period, is the normal menu genuinely available at the same times?

### F26. Seasonal answer state and reset rules are missing

- **Relevant section:** Screen 1 item 7 and S2
- **Status:** Required gap
- **Priority:** P1
- **Type:** State management / UX
- **Description:** “Ask once, remember for the session” does not define storage or invalidation. A guest can change date, party size, period, purpose or use Back/refresh.
- **Rationale:** A stale Yes can attach the wrong period; a stale No can bypass a required question.
- **Impact:** Wrong deposit and confusing summaries.
- **Recommended action:** Keep the answer keyed to period ID and date. Reset it whenever either changes. Define refresh, new tab, back, expiry and resume behaviour.
- **Open questions:** Is browser-session persistence actually required, or is in-memory journey state enough?

### F27. Deep-link and resume compatibility is an unsupported assumption

- **Relevant section:** W5
- **Status:** Confirmed issue
- **Priority:** P2
- **Type:** Functional / scope
- **Description:** W5 says old deep links or resumes that land on `choose` should map to the merged step. The current form has no step deep link and always starts at `find`.
- **Rationale:** This adds implementation and testing work for a path that may not exist.
- **Impact:** Unnecessary complexity or incomplete compatibility.
- **Recommended action:** Remove this requirement unless a real saved URL or resume mechanism is identified. If one exists outside the checked component, name it and specify the mapping.
- **Open questions:** What exact URL or stored state can currently open `choose`?

### F28. Lunch and Evening grouping rules are missing

- **Relevant section:** D7, Screen 1 item 3 and W4
- **Status:** Required gap
- **Priority:** P2
- **Type:** Functional / UX
- **Description:** The boundary between Lunch and Evening is not defined. Overnight closing, split kitchen service, special hours and pub-only times are not covered.
- **Rationale:** Different developers can group the same slot differently.
- **Impact:** Inconsistent UI and brittle tests.
- **Recommended action:** Define the boundary from configured service windows, not a hard-coded clock. State how gaps, closed kitchen periods and after-midnight slots display.
- **Open questions:** Should a day ever have Breakfast, Afternoon or Late headings?

### F29. Date and party-size rules are not complete

- **Relevant section:** Screen 1, W4 and §10 question 3
- **Status:** Required gap
- **Priority:** P1
- **Type:** Validation / functional
- **Description:** The booking horizon is undecided. The specification also omits exact past-date, same-day lead time, maximum online party, seasonal min/max and invalid-query handling.
- **Rationale:** Browser attributes are not server controls.
- **Impact:** Website and AMS can accept different requests.
- **Recommended action:** Decide the horizon before W4 and define the same rules at browser, website proxy and AMS layers with consistent error codes.
- **Open questions:** Is the 12-month recommendation approved?

### F30. Event interaction rules are incomplete

- **Relevant section:** D9, Screen 1 item 6, W7 and §8 item 5
- **Status:** Required gap
- **Priority:** P2
- **Type:** Functional / UX
- **Description:** “No slots are free at all” is unclear when filters are active. Event booking interaction with seasonal periods, outside requests and drinks-only requests is not defined.
- **Rationale:** A filtered empty result is different from a fully booked venue.
- **Impact:** The wrong event panel may replace recoverable table options.
- **Recommended action:** Calculate the full event-panel condition from unfiltered base availability. Show filter-specific recovery first. Define whether event booking is a separate journey with separate seasonal/deposit rules.
- **Open questions:** Should the quiet event line link to event details when tables remain available?

### F31. Notification behaviour is not specified for payment states

- **Relevant section:** Screen 2 item 5, S3 and §8
- **Status:** Required gap
- **Priority:** P1
- **Type:** Integration / communications
- **Description:** The specification says SMS/email goes out “as today”. Current logic may use SMS, WhatsApp or email and treats pending payment differently from confirmed payment.
- **Rationale:** A pending hold must not look like a confirmed booking.
- **Impact:** Guests believe an unpaid or expired booking is secure.
- **Recommended action:** Define notifications for hold created, PayPal setup failure, payment success, payment failure, expiry, cancellation and refund. Include exact status wording and deduplication.
- **Open questions:** Which channel is authoritative if more than one is available?

### F32. Accessibility acceptance criteria are too narrow

- **Relevant section:** W3, W5, W8 and §11
- **Status:** Required gap
- **Priority:** P1
- **Type:** Accessibility / testing
- **Description:** The specification mentions 44px touch targets but not keyboard use, focus order, screen-reader labels, selected state, error announcement, loading announcement, reduced motion or focus return after invalidation.
- **Rationale:** The flow changes dynamic content and uses a segmented control.
- **Impact:** Keyboard and assistive-technology users may not be able to complete a booking.
- **Recommended action:** Require WCAG 2.2 AA acceptance for the whole journey. Add keyboard, VoiceOver/NVDA, zoom, contrast and live-region tests. Respect reduced motion for scroll-into-view.
- **Open questions:** Is the segmented control implemented as radios, buttons or a native select fallback?

### F33. Notes invite sensitive accessibility information

- **Relevant section:** Screen 2 and privacy assumptions behind `requires_accessible_table`
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Privacy / data
- **Description:** Current notes copy invites “accessibility needs”, while AMS comments correctly say not to record diagnoses or reasons. The specification does not address this conflict.
- **Rationale:** Free text can collect health information and other special-category data.
- **Impact:** Higher privacy and retention obligations.
- **Recommended action:** Change the placeholder to operational requests only, add staff guidance, define retention/access controls and avoid asking why step-free seating is needed.
- **Open questions:** What is the retention period for booking notes, and who can view/export them?

### F34. Staff identification and display journeys are incomplete

- **Relevant section:** D6 and A2
- **Status:** Required gap
- **Priority:** P1
- **Type:** Operations / functional
- **Description:** D6 says booking reference plus the last four mobile digits identifies the guest on the door. A2 only adds option badges. No FOH search or verification change is specified. A2 also says “same two facts” for BOH without naming all required fields and print outputs.
- **Rationale:** Staff need a usable path, not only a data statement.
- **Impact:** Slow check-in and missed seating requirements.
- **Recommended action:** Define the exact FOH/BOH/search/print surfaces, fields, badge labels, sorting and fallback for missing surname. Add last-four search only if it can be implemented without exposing unnecessary phone data.
- **Open questions:** Which staff screen is used at the door?

### F35. Monitoring and alerting are missing

- **Relevant section:** §1 and §9
- **Status:** Required gap
- **Priority:** P1
- **Type:** Observability / operations
- **Description:** There are no operational measures for availability `unknown`, local fallback use, shown-available/create-blocked mismatches, payment setup/capture failures, expired holds, webhook delays, seasonal validation failures or flag exposure.
- **Rationale:** These failures directly affect revenue and customers.
- **Impact:** Problems may be discovered through complaints instead of alerts.
- **Recommended action:** Add structured logs, counters, alert thresholds and a release dashboard. Include correlation IDs across website, AMS and PayPal without logging personal data.
- **Open questions:** Where are production logs and alerts currently owned?

### F36. The test plan misses high-risk cases

- **Relevant section:** §11
- **Status:** Required gap
- **Priority:** P1
- **Type:** Testing
- **Description:** Missing cases include:
  - Two guests racing for the last table or high chair.
  - An option/date change during an in-flight refresh.
  - Duplicate, late and out-of-order PayPal callbacks.
  - Payment after hold expiry.
  - Contract compatibility in both deployment orders.
  - Seasonal edit/deactivate while a guest is mid-flow.
  - Tampered period ID and amount.
  - OTP/lookup abuse and rate limits.
  - DST, overnight service and special hours.
  - Runtime flag rollback.
  - Accessibility and performance tests.
- **Rationale:** Unit tests alone cannot protect a two-service payment journey.
- **Impact:** Production-only failures.
- **Recommended action:** Add contract, integration, concurrency, migration, security, accessibility, load and end-to-end suites with explicit pass criteria.
- **Open questions:** Is there a stable staging environment with PayPal sandbox webhooks and production-like Supabase data?

### F37. Cross-repository compatibility is not planned

- **Relevant section:** §2, W2+A1, S2, S3 and §9
- **Status:** Required gap
- **Priority:** P1
- **Type:** Delivery / integration
- **Description:** Several releases require both applications, but there is no compatibility matrix or required deployment order.
- **Rationale:** The website and AMS are deployed separately. Either old side may run with the new side for a period.
- **Impact:** Broken booking requests during deployment or rollback.
- **Recommended action:** For every contract change, document old website/new AMS and new website/old AMS behaviour. Make AMS additive first, verify, then deploy the website. Keep contract-version tests until cleanup.
- **Open questions:** Can both deployments be coordinated atomically, or must compatibility always be maintained?

### F38. Rollback descriptions are not complete

- **Relevant section:** §9
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Delivery / migration
- **Description:** Deactivating periods is not a database rollback. Turning off S3 does not explain pending bookings or payments already created under the new rule. Flag-off may also require a redeploy.
- **Rationale:** Data and external payment effects are not undone by hiding the feature.
- **Impact:** Orphaned holds, inconsistent terms and unsafe incident response.
- **Recommended action:** Write separate rollback and roll-forward runbooks for website UI, AMS contract, schema, period data and payments. State how existing pending/paid bookings are handled.
- **Open questions:** Is destructive schema rollback forbidden, with roll-forward as the only supported strategy?

### F39. The estimate is not credible

- **Relevant section:** §12
- **Status:** Confirmed issue
- **Priority:** P1
- **Type:** Delivery / estimation
- **Description:** Four to six working days covers fourteen releases, two repositories, a migration, new admin UI, payment changes, analytics, accessibility, security fixes, testing and production observation. It excludes the stated two-week baseline and two-week dual-path windows from elapsed delivery.
- **Rationale:** The estimate is smaller than the coordination and verification work alone.
- **Impact:** Schedule pressure, reduced testing and missed dependencies.
- **Recommended action:** Re-estimate by phase after contract and product decisions. Include development, review, QA, migration rehearsal, deployments, monitoring and owner acceptance. Treat the elapsed plan as at least the observation windows plus build time.
- **Open questions:** How many developers and reviewers are available, and can work run in parallel?

### F40. The specification is not self-contained

- **Relevant section:** Sources, D12, W0, W5, W9 and §11
- **Status:** Required gap
- **Priority:** P2
- **Type:** Documentation / delivery
- **Description:** Required behaviour still points to two superseded long specifications, a prototype and unnamed workflow documents.
- **Rationale:** A superseding implementation specification should contain or directly link every required acceptance rule.
- **Impact:** Developers can implement stale or conflicting details.
- **Recommended action:** Add a short normative-reference appendix listing the exact still-active sections and prototype location. Copy only required acceptance criteria, not the whole old documents.
- **Open questions:** Where is the approved prototype stored and versioned?

### F41. Deposit lifecycle rules are broader than the two listed decisions

- **Relevant section:** S3, §7 and §10
- **Status:** Required gap
- **Priority:** P0
- **Type:** Payments / operations
- **Description:** Deduction and refund timing are not the only money decisions. The specification does not cover manager waiver precedence, party-size edits, partial refunds, PayPal fees, failed refunds, chargebacks, no-shows, cancellation channels, accounting records or locked amount changes.
- **Rationale:** Existing canonical deposit logic already has waiver and locked-amount rules.
- **Impact:** Financial inconsistency and manual support work.
- **Recommended action:** Create a payment-state and policy table before S3. Include every transition, actor, audit entry, customer message and reconciliation rule.
- **Open questions:** Who may waive or refund a seasonal deposit, and how is it reconciled against the final bill?

## 5. Optional improvements

### I01. Extract the booking form before adding more states

- **Relevant section:** §2 and §4
- **Status:** Optional improvement
- **Priority:** P3
- **Type:** Maintainability
- **Description:** The live form is about 2,800 lines and owns API calls, state, analytics, events, customer lookup, PayPal and all screens.
- **Rationale:** W3-W8 and S2 add more state and branching to the highest-risk component.
- **Impact:** Without extraction, reviews and regression testing will be slower.
- **Recommended action:** Extract pure availability mapping, booking state/reducer, screen components and payment state before or within the flagged branch. Avoid a broad visual rewrite.
- **Open questions:** Can extraction be covered by existing tests without delaying the critical contract fix?

### I02. Make AMS return one typed public availability model

- **Relevant section:** W3 and A3
- **Status:** Optional improvement
- **Priority:** P3
- **Type:** Simplification / integration
- **Description:** The current local-build-plus-overlay design has three slot shapes.
- **Rationale:** One authoritative model removes merging and fallback ambiguity.
- **Impact:** Less code, clearer tests and safer future changes.
- **Recommended action:** Prefer an AMS response which already contains purpose-specific state, kitchen state, capacity, reason and chair inventory for each displayed time.
- **Open questions:** Would this replace the legacy `slots` collection after a compatibility window?

### I03. Separate the flow simplification from seasonal payments

- **Relevant section:** Whole delivery plan
- **Status:** Optional improvement
- **Priority:** P3
- **Type:** Delivery simplification
- **Description:** The specification combines a booking-flow redesign, accessibility changes, analytics, seasonal configuration and a new payment rule.
- **Rationale:** These have different risks and acceptance owners.
- **Impact:** A combined plan is hard to estimate and roll back.
- **Recommended action:** Use three milestones: authoritative two-screen flow, seasonal metadata/configuration, then seasonal payments after policy approval.
- **Open questions:** Is there a business date that requires seasonal configuration before the flow work is complete?

### I04. Avoid volatile counts and table names in customer copy

- **Relevant section:** §4.5
- **Status:** Optional improvement
- **Priority:** P3
- **Type:** Content / accessibility
- **Description:** The copy names two tables and says “two of our ten tables”.
- **Rationale:** Physical layout and table flags can change without a website release.
- **Impact:** Copy can become false even when allocation remains correct.
- **Recommended action:** Use stable outcome-based wording, or render verified facts from managed configuration with an owner review date.
- **Open questions:** Does naming the exact tables materially help the guest?

### I05. Bundle tightly coupled UI changes

- **Relevant section:** W3-W8
- **Status:** Optional improvement
- **Priority:** P3
- **Type:** Delivery simplification
- **Description:** W3 moves the accessibility option, while W8 supplies the approved accessibility wording later. W4-W6 create several short-lived partial flow states.
- **Rationale:** Tightly coupled guest-facing behaviour is easier to test as one flagged package.
- **Impact:** Fewer temporary states and less repeated regression testing.
- **Recommended action:** Build W3-W6 and W8 together behind one runtime flag. W7 can remain independent.
- **Open questions:** Is there a reason to expose the moved option before its approved explanation is ready?

## 6. Overall readiness assessment

### Readiness

**Not ready for full build.**

The document is suitable as a product direction and workstream outline. It is not yet a safe implementation contract.

### Work that can proceed now

- Confirm the real availability contract and replace `any` with types.
- Fix the phone lookup privacy issue.
- Verify optional surname behaviour end to end.
- Map A2 staff display queries and screens.
- Define analytics events without releasing the new UI.
- Rehearse seasonal schema options in a non-production database.

### Work that should wait

- W3-W6 main flow changes.
- Any mixed food/drinks slot release.
- Seasonal production migration.
- S2 guest period selection.
- S3 money changes.

## 7. Key required changes

1. Replace the availability contract with one authoritative, versioned and typed contract.
2. Remove all fail-open bookable-slot behaviour.
3. Decide and specify partial high-chair acceptance.
4. Resolve Outside + high chairs and Outside + Step-free.
5. Stop exposing customer identity through phone-number-only lookup.
6. Define the real create/PayPal/payment state machine.
7. Separate seasonal metadata from money behaviour.
8. Add a stable seasonal period kind and immutable booking-term snapshots.
9. Add migration seed/backfill, compatibility and rollback plans.
10. Use a real runtime rollback flag or state the redeploy requirement.
11. Re-sequence the baseline before W3 and define measurable go/no-go thresholds.
12. Resolve the Sunday lunch contradiction.
13. Add idempotency fields for accessibility and seasonal choices.
14. Re-estimate the work after these decisions.

## 8. Unresolved decisions

Owner/product decisions:

1. Is Sunday lunch pre-order retired or being restored?
2. Can an outside booking include high chairs?
3. Can AMS guarantee standard-height outside seating?
4. Can a booking confirm with fewer high chairs than requested?
5. What does Seasonal “No” mean for each period?
6. Is the 12-month booking horizon approved?
7. Are seasonal deposits deducted from the bill or treated as a no-show fee?
8. What is the cancellation and refund policy?
9. Does Christmas require pre-ordering?
10. Which payment button wording and confirmation point are approved?

Technical decisions:

1. What is the final availability response schema?
2. How are food and drinks availability combined?
3. What runtime flag mechanism is used?
4. What OTP or privacy-preserving customer-recognition flow is used?
5. What seasonal fields are snapshotted on a booking?
6. What is the cross-repository deployment order?

## 9. Major risks

- False availability caused by local fallback or unmatched purpose slots.
- Accessibility promises which AMS cannot guarantee.
- Guest bookings recorded with fewer high chairs than expected.
- Personal-data disclosure through customer lookup.
- Payment states or charges enabled before the intended release.
- Production booking failures after an incomplete seasonal migration.
- Slow rollback because the website flag requires a redeploy.
- Inconclusive analytics caused by a contaminated baseline.
- Delivery pressure caused by an unrealistically short estimate.

## 10. Recommended next steps

1. Hold a short decision session for F02, F06-F08, F11-F13, F19, F25 and F41.
2. Write and test the final availability contract first.
3. Fix the phone lookup privacy issue before exposing the redesigned details screen.
4. Produce a revised implementation plan split into:
   - authoritative availability and two-screen flow;
   - seasonal configuration and metadata;
   - seasonal payments.
5. Add a deployment compatibility table and payment state diagram.
6. Re-estimate each phase and name its owner, reviewer, test environment and go/no-go check.
7. Update the source specification only through targeted wording changes after the decisions are approved.
