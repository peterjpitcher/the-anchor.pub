# Claude Hand-Off Brief: Sunday Walk-In Launch

**Generated:** 2026-04-28  
**Mode:** B  
**Overall risk:** High  
**Findings:** 0 crit, 22 high, 23 med, 2 low/info

## DO NOT REWRITE
- Migration A SQL (verified `'succeeded'` enum + multi-source paid criteria + future-only filter)
- Migration B verbatim v05 body + three minimal edits (p_deposit_waived preserved)
- LaunchAnnouncement component three-state + client interval re-check
- Centralised deposit module (`src/lib/table-bookings/deposit.ts`)
- Hostile payload proxy strip pattern in `app/api/table-bookings/route.ts`
- ManagementTableBookingForm 327-line dead-code sweep

## IMPLEMENTATION CHANGES REQUIRED — TRIAGE NEEDED

- [ ] **[HIGH] AB-001 (M-AB)** — FOH management overrides are documented and validated as deposit-exempt, but the actual server-side `requiresDeposit` ca
  - **Location:** `src/app/api/foh/bookings/route.ts:1056`
  - **Issue:** FOH management overrides are documented and validated as deposit-exempt, but the actual server-side `requiresDeposit` calculation no longer excludes `management_override`. A 10+ management override can therefore be treated as deposit-required after passing validation without a deposit method.
  - **Confirm/test:** Trace the `management_override=true`, `party_size=10`, no `sunday_deposit_method` path through the rest of this route or add a route test for it.

- [ ] **[HIGH] AB-002 (M-AB)** — Migration A converts below-10 future unpaid `sunday_lunch` pending-payment bookings to confirmed but leaves `payment_sta
  - **Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38`
  - **Issue:** Migration A converts below-10 future unpaid `sunday_lunch` pending-payment bookings to confirmed but leaves `payment_status` untouched. Rows can become `status='confirmed'` with `payment_status='pending'`, which preserves stale unpaid-deposit state after the migration says the deposit is no longer required.
  - **Confirm/test:** Run the migration against a fixture row with `booking_type='sunday_lunch'`, `status='pending_payment'`, `payment_status='pending'`, and `party_size=2`.

- [ ] **[HIGH] AB-003 (M-AB)** — The party-size threshold-crossing path assumes a fresh computed amount will be used later, but it does not persist that 
  - **Location:** `src/app/api/boh/table-bookings/[id]/party-size/route.ts:118`
  - **Issue:** The party-size threshold-crossing path assumes a fresh computed amount will be used later, but it does not persist that amount or clear stale payment order state when moving the booking to `pending_payment`. Because the canonical reader prefers stored `deposit_amount` for pending rows, a stale stored amount can be charged even though the SMS quoted…
  - **Confirm/test:** Test a confirmed booking with stale `deposit_amount=70`, increase party size from 9 to 10, then open the token payment preview and verify whether it charges £70 or £100.

- [ ] **[HIGH] AB-004 (M-AB)** — PayPal order reuse assumes an existing order ID still represents the current canonical deposit amount
  - **Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55`
  - **Issue:** PayPal order reuse assumes an existing order ID still represents the current canonical deposit amount. If party size or stored deposit state changes after order creation, the endpoint can return a stale PayPal order and capture the wrong amount.
  - **Confirm/test:** Search or test party-size/deposit changes after order creation and verify whether the old PayPal order is invalidated or amount-checked before reuse.

- [ ] **[HIGH] ARCH-001 (M-IA)** — Migration C wraps the legacy core booking function instead of replacing its deposit decision, then returns the legacy re
  - **Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51`
  - **Issue:** Migration C wraps the legacy core booking function instead of replacing its deposit decision, then returns the legacy result unchanged for parties below 10. If the legacy function still applies the old Sunday/7+ deposit side effects, `_core` flows will continue using the old rule despite the migration's contract.
  - **Confirm/test:** Inspect the body of `create_table_booking_v05_core_sunday_deposit_legacy` or run RPC tests for Sunday lunch with 2 covers and regular bookings with 7-9 covers.

- [ ] **[HIGH] ARCH-002 (M-IA)** — The PayPal create-order route returns an existing `paypal_deposit_order_id` before recalculating the canonical deposit a
  - **Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:60`
  - **Issue:** The PayPal create-order route returns an existing `paypal_deposit_order_id` before recalculating the canonical deposit amount. A booking whose party size or stored/locked deposit changed after order creation can reuse and capture a stale PayPal order, then lock the stale captured amount as authoritative.
  - **Confirm/test:** Check all party-size/deposit mutation paths for clearing or replacing `paypal_deposit_order_id`, or verify the PayPal order amount against canonical amount before reuse.

- [ ] **[HIGH] ARCH-003 (M-IA)** — Deposit locking is not transactionally owned by the payment-confirmation operation in the cash and Stripe paths
  - **Location:** `src/app/api/foh/bookings/route.ts:1242`
  - **Issue:** Deposit locking is not transactionally owned by the payment-confirmation operation in the cash and Stripe paths. A failed follow-up lock write leaves a completed/confirmed booking without `deposit_amount_locked`, undermining the canonical locked-amount invariant.
  - **Confirm/test:** Move the lock amount into the confirming RPC/update transaction, or add a database-level guard/test proving completed table deposits cannot remain unlocked.

- [ ] **[HIGH] WF-001 (M-WF)** — Failure sequence: a flow calls `create_table_booking_v05_core` for a 7-9 person regular booking or under-10 Sunday lunch
  - **Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51`
  - **Issue:** Failure sequence: a flow calls `create_table_booking_v05_core` for a 7-9 person regular booking or under-10 Sunday lunch; the wrapper delegates to the legacy function, then immediately returns the legacy result unchanged because the party is below 10. That preserves the old pending-payment workflow below the new threshold instead of undoing legacy …
  - **Confirm/test:** Run the migrated RPC for a regular party_size 8 and a Sunday lunch party_size 2 and verify whether either returns `pending_payment`.

- [ ] **[HIGH] WF-002 (M-WF)** — Failure sequence: a PayPal order is created for one deposit amount, then the party size or canonical deposit changes bef
  - **Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55`
  - **Issue:** Failure sequence: a PayPal order is created for one deposit amount, then the party size or canonical deposit changes before approval; a retry returns the stored PayPal order ID before recalculating or validating the amount. The customer can pay the stale order amount, and capture then locks the stale amount as authoritative.
  - **Confirm/test:** Create a PayPal order for a pending booking, change party size before payment, then call create-order again and inspect the PayPal order amount returned to the client.

- [ ] **[HIGH] WF-003 (M-WF)** — Failure sequence: Stripe checkout or cash confirmation succeeds, the booking is confirmed, then the follow-up `deposit_a
  - **Location:** `src/app/api/stripe/webhook/route.ts:492`
  - **Issue:** Failure sequence: Stripe checkout or cash confirmation succeeds, the booking is confirmed, then the follow-up `deposit_amount_locked` update fails; the code logs the error but lets the workflow complete. That leaves a paid booking without the immutable captured amount and gives webhook/cash flows no retry path for the failed secondary write.
  - **Confirm/test:** Force the lock update to fail after a successful Stripe/cash confirmation and check whether the booking remains confirmed with `deposit_amount_locked IS NULL`.

- [ ] **[HIGH] WF-004 (M-WF)** — Failure sequence: FOH creates a management override booking for 10+ guests; the client omits a deposit method because ma
  - **Location:** `src/app/api/foh/bookings/route.ts:1056`
  - **Issue:** Failure sequence: FOH creates a management override booking for 10+ guests; the client omits a deposit method because management mode bypasses deposit controls, and validation permits that, but the runtime deposit decision still ignores `management_override`. The result can be a pending-payment booking with no chosen cash/link path.
  - **Confirm/test:** Post a 10-person FOH booking with `management_override=true` and no `sunday_deposit_method`, then inspect the returned state and booking row payment status.

- [ ] **[HIGH] SEC-001 (M-SE)** — Migration C still calls the legacy core function before applying the new threshold, then returns its result unchanged fo
  - **Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:49`
  - **Issue:** Migration C still calls the legacy core function before applying the new threshold, then returns its result unchanged for parties below 10. Data-integrity scenario: _core flows can still create pending-payment deposits for Sunday or 7-9 cover bookings even though the new rule says no deposit is required.
  - **Confirm/test:** Inspect or replace create_table_booking_v05_core_sunday_deposit_legacy so below-10 bookings cannot leave the legacy function with payment holds, pending payments, or pending_payment status.

- [ ] **[HIGH] SEC-002 (M-SE)** — PayPal create-order reuses an existing paypal_deposit_order_id before recalculating or validating the current canonical 
  - **Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:56`
  - **Issue:** PayPal create-order reuses an existing paypal_deposit_order_id before recalculating or validating the current canonical deposit amount. Data-integrity scenario: after party size or deposit amount changes, a customer can pay an old lower-value PayPal order and the capture path will lock that lower amount as paid.
  - **Confirm/test:** Verify all amount-changing mutations invalidate existing PayPal orders, or fetch the PayPal order and compare amount/currency before reusing it.

- [ ] **[HIGH] SEC-003 (M-SE)** — Stripe table-deposit confirmation can complete while deposit_amount_locked is skipped or fails as a best-effort follow-u
  - **Location:** `src/app/api/stripe/webhook/route.ts:492`
  - **Issue:** Stripe table-deposit confirmation can complete while deposit_amount_locked is skipped or fails as a best-effort follow-up write. Data-integrity scenario: a paid booking remains confirmed without the immutable captured amount, so later canonical reads can recompute or use stale deposit_amount.
  - **Confirm/test:** Verify the RPC writes deposit_amount_locked transactionally, or make the Stripe confirmation path fail/reconcile before confirming when the lock cannot be written.

- [ ] **[HIGH] SEC-004 (M-SE)** — Migration A converts future below-threshold unpaid Sunday-lunch bookings to confirmed but does not clear payment_status,
  - **Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38`
  - **Issue:** Migration A converts future below-threshold unpaid Sunday-lunch bookings to confirmed but does not clear payment_status, PayPal order IDs, payment holds, or pending payment rows. Data-integrity scenario: a no-longer-required legacy payment artefact can remain payable or capturable after the booking has been converted to confirmed.
  - **Confirm/test:** Verify converted rows have payment_status, paypal_deposit_order_id, active payment_hold rows, and pending table_deposit payments cleared or made unreachable.

- [ ] **[HIGH] AB-001 (W-AB)** — The /sunday-lunch page still ships post-launch claims unconditionally before launch
  - **Location:** `app/sunday-lunch/page.tsx:26`
  - **Issue:** The /sunday-lunch page still ships post-launch claims unconditionally before launch. On 2026-04-28, metadata and FAQ copy say walk-ins/no pre-order are available even though the launch starts on 2026-05-17.
  - **Confirm/test:** Confirm the deploy date; if deploying before 2026-05-17, all visible /sunday-lunch post-launch claims need the same date-aware treatment.

- [ ] **[HIGH] AB-002 (W-AB)** — The customer-visible content sweep is incomplete: active blog pages still describe Sunday lunch as requiring pre-order, 
  - **Location:** `content/blog/60th-birthday-party-ideas-venues/index.md:40`
  - **Issue:** The customer-visible content sweep is incomplete: active blog pages still describe Sunday lunch as requiring pre-order, Saturday cutoff, or a Sunday-specific deposit. This directly contradicts the retired cutoff/preorder/deposit policy.

- [ ] **[HIGH] AB-003 (W-AB)** — The sanitizer is demonstrated for /api/table-bookings, but the pack still references a live /api/table-bookings/create r
  - **Location:** `tests/api/table-bookings.test.ts:7`
  - **Issue:** The sanitizer is demonstrated for /api/table-bookings, but the pack still references a live /api/table-bookings/create route and the shared API client retains retired sunday_lunch/menu-selection plumbing. A stale or hostile client could bypass the new strip/regularisation if that route does not independently sanitize.
  - **Confirm/test:** Review app/api/table-bookings/create/route.ts and grep public callers or traffic logs for use of /api/table-bookings/create.

- [ ] **[HIGH] ARCH-001 (W-IA)** — Customer-facing content still states Sunday lunch requires advance booking, a per-person deposit, and a Saturday 1pm pre
  - **Location:** `content/blog/60th-birthday-party-ideas-venues/index.md:42`
  - **Issue:** Customer-facing content still states Sunday lunch requires advance booking, a per-person deposit, and a Saturday 1pm pre-order cutoff. That leaves retired operational policy duplicated in content instead of following the documented copy source of truth.
  - **Confirm/test:** Search all changed content for retired terms like `pre-order`, `Saturday`, `cutoff`, and unconditional `deposit`, then reconcile every customer-visible claim to `docs/copy-assumptions.md`.

- [ ] **[HIGH] ARCH-002 (W-IA)** — The `/sunday-lunch` launch state is split between a date-aware component and static metadata/FAQ copy, so before 17 May 
  - **Location:** `app/sunday-lunch/page.tsx:25`
  - **Issue:** The `/sunday-lunch` launch state is split between a date-aware component and static metadata/FAQ copy, so before 17 May 2026 the page can say walk-ins are already live while another section says they start on 17 May. Time-dependent operational policy has unclear ownership across SEO metadata, page copy, and client state.
  - **Confirm/test:** Decide whether all `/sunday-lunch` public copy, including metadata, JSON-LD, and FAQ text, must share the same pre/post-launch state until 17 May 2026.

- [ ] **[HIGH] ARCH-005 (W-IA)** — Shared booking helpers and whole booking wizard modules were deleted, but the related-file hints show files outside the 
  - **Issue:** Shared booking helpers and whole booking wizard modules were deleted, but the related-file hints show files outside the inline pack still reference changed basenames. If any remaining route or component imports those deleted modules, the integration breaks at build time.
  - **Confirm/test:** Run or inspect an `rg 'booking-helpers|BookingWizard|/api/booking/submit|SundayLunchBooking'` result across the repo before merge.

- [ ] **[HIGH] WF-003 (W-WF)** — Failure sequence: an agent books a party of 10+, management returns a `pending_payment` state or payment URL, but this e
  - **Location:** `app/api/booking/agent/route.ts:134`
  - **Issue:** Failure sequence: an agent books a party of 10+, management returns a `pending_payment` state or payment URL, but this endpoint still returns `success: true` with booking-confirmed copy and no actionable payment URL branch. The customer can believe the booking is complete while the hold later expires unpaid.
  - **Confirm/test:** Add a route test where `createTableBooking` resolves `status: 'pending_payment'` with `next_step_url` or `fallback_payment_url` and assert the agent response exposes a payment-required workflow.

## OPTIONAL — MEDIUM (post-launch follow-up acceptable)
- [ ] AB-005 (M-AB): The legacy Sunday-lunch admin path is not actually preserved in the FOH UI because the checkbox is always disabled. The comment says staff can enable it via the
- [ ] AB-006 (M-AB): Public booking idempotency still includes fields that the route now ignores, so semantically identical requests can hash differently and bypass replay protectio
- [ ] AB-007 (M-AB): Not every successful deposit-confirmation surface guarantees `deposit_amount_locked` is written. Stripe logs and continues when the amount is invalid, and the F
- [ ] AB-008 (M-AB): Migration C says it affects event/table reservation flows through `_core`, but the patched function has no `p_deposit_waived` or venue-event exception input. Th
- [ ] ARCH-004 (M-IA): The backend still preserves a staff-explicit legacy Sunday-lunch path, but the FOH modal hard-disables the only visible `sunday_lunch` input. That creates a UI/
- [ ] ARCH-005 (M-IA): The Sunday business-hours change is intentionally parked in `scripts/one-off` rather than a migration, so fresh environments and `supabase db push` will not rep
- [ ] WF-005 (M-WF): Failure sequence: Migration A converts a future unpaid legacy Sunday-lunch booking below 10 from `pending_payment` to `confirmed`, but only updates the booking 
- [ ] WF-006 (M-WF): Failure sequence: staff need to back-fill a legacy Sunday-lunch/preorder booking, but the modal renders the legacy checkbox as always disabled. The workflow loo
- [ ] WF-007 (M-WF): Failure sequence: staff increase a booking from below-threshold to 10+; the route updates the booking to `pending_payment` before generating the guest token, th
- [ ] SEC-005 (M-SE): getCanonicalDeposit ignores deposit_waived when a stored deposit_amount exists in a payment-required state. Data-integrity scenario: a manager-waived unpaid boo
- [ ] SEC-006 (M-SE): Cash-deposit confirmation records the payment first, then writes deposit_amount_locked in a separate best-effort update. Data-integrity scenario: if the lock up
- [ ] SEC-007 (M-SE): Migration A can backfill deposit_amount_locked from non-positive payment or booking amounts because it only checks for NULL. Data-corruption scenario: a histori
- [ ] SEC-008 (M-SE): State-changing PayPal payment routes appear to require only the read:events API permission. Privilege scenario: an API key intended for read-only event access c
- [ ] AB-004 (W-AB): public/llms.txt contradicts the operational source of truth for opening and kitchen hours. Because this file is intended for LLM/AI retrieval, it can propagate 
- [ ] AB-005 (W-AB): Project guidance still states the old Sunday-lunch rule, contradicting the new docs and implementation. Future agents following repo instructions could reintrod
- [ ] AB-006 (W-AB): The per-page revalidate rollout appears incomplete for pages that now render LaunchAnnouncement. Client-side recompute mitigates interactive users, but stale se
- [ ] ARCH-003 (W-IA): The public AI-readable facts file carries independent opening and kitchen hours that disagree with the documented source of truth. This is a state-ownership pro
- [ ] ARCH-004 (W-IA): Project-specific conventions still declare the old Sunday lunch rule requiring advance booking and prepayment, while the new docs and code retire that model. Be
- [ ] ARCH-006 (W-IA): Retired Sunday pre-order behavior still appears in the shared `AnchorAPI` client while the public proxy strips those fields, leaving two booking contracts. If a
- [ ] WF-001 (W-WF): Failure sequence: a user has an old cached booking wizard or non-JS form open, completes the booking, and submits to `/api/booking/submit`; after this deletion 
- [ ] WF-002 (W-WF): Failure sequence: an AI agent posts a booking, the upstream create succeeds, the network drops before the response, and the agent retries; this handler appears 
- [ ] WF-004 (W-WF): Failure sequence: a customer researching Sunday lunch reads retained pre-order, Saturday-cutoff, or universal-deposit copy, assumes the new walk-in flow is unav
- [ ] WF-006 (W-WF): Failure sequence: an AI assistant consumes `llms.txt`, tells a customer Sunday opening is until 9pm or Saturday kitchen runs until 9pm, and the customer arrives

## ASSUMPTIONS TO RESOLVE BEFORE DEPLOY
- [ ] Stripe webhook `checkout.session.completed` smoke-tested against a real Stripe test event (currently mocked-only).
- [ ] Sunday `business_hours` UPDATE in `scripts/one-off/2026-04-28-sunday-hours-13-18.sql` reviewed against actual schema (column names + `day_of_week=0`).
- [ ] Management API live response includes `fallback_payment_url` on `pending_payment` state (field-name verified between repos).
- [ ] Task 5.6 DB integration tests skipped due to missing Supabase RPC test harness — acceptable launch risk?

## REPO CONVENTIONS TO PRESERVE
- Conventional Commits, one logical fix per commit.
- Migration discipline: never edit existing migration files; use `CREATE OR REPLACE FUNCTION`.
- No deletes without grep-verifying zero remaining imports.
- Website does not import from management; no DB-aware helpers on website side.
