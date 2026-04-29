# Adversarial Review: Sunday Walk-In Launch

**Date:** 2026-04-28  
**Mode:** B (Code Review)  
**Scope:** 68 commits across `OJ-AnchorManagementTools` (25) and `OJ-The-Anchor.pub` (43) on `feat/sunday-walk-in-launch`  
**Reviewers:** 7 specialists (4 mgmt + 3 web)

**Findings:** 47 — 0 critical, 22 high, 23 medium, 2 low/info

## Executive Summary
No CRITICAL findings. **22 HIGH** findings represent real defects worth fixing — most cluster around the management app's deposit-decision plumbing (FOH management-override path, `_core` waiver gap, deposit recompute on edit). Several touch unfinished hostile-payload coverage on the website. The launch can proceed if HIGH findings are triaged: a subset are genuine defects requiring fixes, others are false positives where Codex misread the code.

## What Appears Solid
- Migration A backfill SQL with verified `'succeeded'` enum + multi-source paid criteria + `start_datetime >= NOW()` future-only filter for Step 1 conversion.
- Migration B verbatim-copy of v05 body with three minimal edits; `p_deposit_waived` semantics preserved.
- LaunchAnnouncement component three-state design + client `setInterval(60_000)` re-check for cached pages.
- Hostile payload defence-in-depth: proxy strips both `sunday_lunch` and `booking_type` from inbound public payloads.
- ManagementTableBookingForm dead-code sweep: 327-line reduction.
- 100% management test pass (2212/2212); Sunday-launch website suites pass.

## High-Priority Findings

### [HIGH] AB-001 — FOH management overrides are documented and validated as deposit-exempt, but the actual server-side `requiresDeposit` ca
**Source:** Mgmt — Assumption Breaker  
**Location:** `src/app/api/foh/bookings/route.ts:1056`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** FOH management overrides are documented and validated as deposit-exempt, but the actual server-side `requiresDeposit` calculation no longer excludes `management_override`. A 10+ management override can therefore be treated as deposit-required after passing validation without a deposit method.

**Evidence:** The schema refinement exempts `management_override` from requiring `sunday_deposit_method` at `src/app/api/foh/bookings/route.ts:89`, but the later `requiresDeposit` expression at `src/app/api/foh/bookings/route.ts:1056` only checks party size, waiver, and venue event.

**Why it might be wrong:** A later RPC call not shown in the excerpt could separately force the booking confirmed for management overrides.

**What would confirm:** Trace the `management_override=true`, `party_size=10`, no `sunday_deposit_method` path through the rest of this route or add a route test for it.

**Action type:** Implementation change


### [HIGH] AB-002 — Migration A converts below-10 future unpaid `sunday_lunch` pending-payment bookings to confirmed but leaves `payment_sta
**Source:** Mgmt — Assumption Breaker  
**Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Migration A converts below-10 future unpaid `sunday_lunch` pending-payment bookings to confirmed but leaves `payment_status` untouched. Rows can become `status='confirmed'` with `payment_status='pending'`, which preserves stale unpaid-deposit state after the migration says the deposit is no longer required.

**Evidence:** The UPDATE sets `booking_type`, `status`, and `deposit_amount` at `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38`, but there is no `payment_status = NULL` or equivalent clear for the below-threshold confirmed branch.

**Why it might be wrong:** The migration comment says D11 found zero matching future unpaid rows in production, so the bad branch may be a no-op in the target database.

**What would confirm:** Run the migration against a fixture row with `booking_type='sunday_lunch'`, `status='pending_payment'`, `payment_status='pending'`, and `party_size=2`.

**Action type:** Implementation change


### [HIGH] AB-003 — The party-size threshold-crossing path assumes a fresh computed amount will be used later, but it does not persist that 
**Source:** Mgmt — Assumption Breaker  
**Location:** `src/app/api/boh/table-bookings/[id]/party-size/route.ts:118`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** The party-size threshold-crossing path assumes a fresh computed amount will be used later, but it does not persist that amount or clear stale payment order state when moving the booking to `pending_payment`. Because the canonical reader prefers stored `deposit_amount` for pending rows, a stale stored amount can be charged even though the SMS quoted the newly computed amount.

**Evidence:** The route computes `depositAmount` before changing status at `src/app/api/boh/table-bookings/[id]/party-size/route.ts:118`, then updates only `status` and `payment_status` at `src/app/api/boh/table-bookings/[id]/party-size/route.ts:138`; `getCanonicalDeposit` later uses stored `deposit_amount` in payment-required states at `src/lib/table-bookings/deposit.ts:72`.

**Why it might be wrong:** If all bookings that cross from below threshold always have `deposit_amount` and `paypal_deposit_order_id` null, the stale-state path will not occur.

**What would confirm:** Test a confirmed booking with stale `deposit_amount=70`, increase party size from 9 to 10, then open the token payment preview and verify whether it charges £70 or £100.

**Action type:** Implementation change


### [HIGH] AB-004 — PayPal order reuse assumes an existing order ID still represents the current canonical deposit amount
**Source:** Mgmt — Assumption Breaker  
**Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** PayPal order reuse assumes an existing order ID still represents the current canonical deposit amount. If party size or stored deposit state changes after order creation, the endpoint can return a stale PayPal order and capture the wrong amount.

**Evidence:** The create-order route returns `booking.paypal_deposit_order_id` before calculating `depositAmount` at `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55`, and the token page similarly reuses CREATED/APPROVED orders without comparing amount at `src/app/g/[token]/table-payment/page.tsx:154`.

**Why it might be wrong:** Another path outside the pack may clear `paypal_deposit_order_id` whenever the canonical deposit changes.

**What would confirm:** Search or test party-size/deposit changes after order creation and verify whether the old PayPal order is invalidated or amount-checked before reuse.

**Action type:** Implementation change


### [HIGH] ARCH-001 — Migration C wraps the legacy core booking function instead of replacing its deposit decision, then returns the legacy re
**Source:** Mgmt — Integration & Architecture  
**Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51`  
**Type:** Strongly suspected defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Migration C wraps the legacy core booking function instead of replacing its deposit decision, then returns the legacy result unchanged for parties below 10. If the legacy function still applies the old Sunday/7+ deposit side effects, `_core` flows will continue using the old rule despite the migration's contract.

**Evidence:** `create_table_booking_v05_core` delegates to `create_table_booking_v05_core_sunday_deposit_legacy` at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51` and returns `v_result` unchanged below 10 at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:65`.

**Why it might be wrong:** This would be harmless only if the delegated legacy function had already been changed to stop creating pending-payment deposits for Sunday lunch or 7-9 covers.

**What would confirm:** Inspect the body of `create_table_booking_v05_core_sunday_deposit_legacy` or run RPC tests for Sunday lunch with 2 covers and regular bookings with 7-9 covers.

**Action type:** Implementation change


### [HIGH] ARCH-002 — The PayPal create-order route returns an existing `paypal_deposit_order_id` before recalculating the canonical deposit a
**Source:** Mgmt — Integration & Architecture  
**Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:60`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The PayPal create-order route returns an existing `paypal_deposit_order_id` before recalculating the canonical deposit amount. A booking whose party size or stored/locked deposit changed after order creation can reuse and capture a stale PayPal order, then lock the stale captured amount as authoritative.

**Evidence:** The route exits on `booking.paypal_deposit_order_id` at `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:60`, before `getCanonicalDeposit` is called at `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:67`.

**Why it might be wrong:** If PayPal order IDs are always cleared whenever deposit inputs change, this path may not become stale, but that invalidation is not shown in the pack.

**What would confirm:** Check all party-size/deposit mutation paths for clearing or replacing `paypal_deposit_order_id`, or verify the PayPal order amount against canonical amount before reuse.

**Action type:** Implementation change


### [HIGH] ARCH-003 — Deposit locking is not transactionally owned by the payment-confirmation operation in the cash and Stripe paths
**Source:** Mgmt — Integration & Architecture  
**Location:** `src/app/api/foh/bookings/route.ts:1242`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Deposit locking is not transactionally owned by the payment-confirmation operation in the cash and Stripe paths. A failed follow-up lock write leaves a completed/confirmed booking without `deposit_amount_locked`, undermining the canonical locked-amount invariant.

**Evidence:** The cash path logs `cashLockError` without blocking after the RPC confirms payment at `src/app/api/foh/bookings/route.ts:1242`, and the Stripe webhook separately writes or skips the lock after the completion RPC at `src/app/api/stripe/webhook/route.ts:492`.

**Why it might be wrong:** Manual reconciliation or a later audit could repair these rows, but the code itself allows the inconsistent state to be committed.

**What would confirm:** Move the lock amount into the confirming RPC/update transaction, or add a database-level guard/test proving completed table deposits cannot remain unlocked.

**Action type:** Implementation change


### [HIGH] WF-001 — Failure sequence: a flow calls `create_table_booking_v05_core` for a 7-9 person regular booking or under-10 Sunday lunch
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Failure sequence: a flow calls `create_table_booking_v05_core` for a 7-9 person regular booking or under-10 Sunday lunch; the wrapper delegates to the legacy function, then immediately returns the legacy result unchanged because the party is below 10. That preserves the old pending-payment workflow below the new threshold instead of undoing legacy deposit side effects.

**Evidence:** The migration calls `create_table_booking_v05_core_sunday_deposit_legacy` at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:51` and returns `v_result` unchanged for parties below 10 at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:64`.

**Why it might be wrong:** This would be harmless only if the delegated legacy helper had already been patched to stop creating old Sunday/7+ deposit states, but the migration names and comments describe it as the legacy deposit implementation.

**What would confirm:** Run the migrated RPC for a regular party_size 8 and a Sunday lunch party_size 2 and verify whether either returns `pending_payment`.

**Action type:** Implementation change


### [HIGH] WF-002 — Failure sequence: a PayPal order is created for one deposit amount, then the party size or canonical deposit changes bef
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Failure sequence: a PayPal order is created for one deposit amount, then the party size or canonical deposit changes before approval; a retry returns the stored PayPal order ID before recalculating or validating the amount. The customer can pay the stale order amount, and capture then locks the stale amount as authoritative.

**Evidence:** The create-order route returns `booking.paypal_deposit_order_id` at `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:55` before the canonical deposit is calculated at `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:62`.

**Why it might be wrong:** If PayPal request IDs always force a same-amount order and party size cannot change while an order exists, impact would be reduced, but the pack shows party-size mutation and order reuse paths.

**What would confirm:** Create a PayPal order for a pending booking, change party size before payment, then call create-order again and inspect the PayPal order amount returned to the client.

**Action type:** Implementation change


### [HIGH] WF-003 — Failure sequence: Stripe checkout or cash confirmation succeeds, the booking is confirmed, then the follow-up `deposit_a
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `src/app/api/stripe/webhook/route.ts:492`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Failure sequence: Stripe checkout or cash confirmation succeeds, the booking is confirmed, then the follow-up `deposit_amount_locked` update fails; the code logs the error but lets the workflow complete. That leaves a paid booking without the immutable captured amount and gives webhook/cash flows no retry path for the failed secondary write.

**Evidence:** Stripe logs `lockError` without returning or throwing in `src/app/api/stripe/webhook/route.ts:492`, and the cash path explicitly says lock failure does not block in `src/app/api/foh/bookings/route.ts:1242`.

**Why it might be wrong:** The RPCs might already lock the amount internally, but the cash-path comment states the RPC does not touch `deposit_amount_locked`.

**What would confirm:** Force the lock update to fail after a successful Stripe/cash confirmation and check whether the booking remains confirmed with `deposit_amount_locked IS NULL`.

**Action type:** Implementation change


### [HIGH] WF-004 — Failure sequence: FOH creates a management override booking for 10+ guests; the client omits a deposit method because ma
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `src/app/api/foh/bookings/route.ts:1056`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Failure sequence: FOH creates a management override booking for 10+ guests; the client omits a deposit method because management mode bypasses deposit controls, and validation permits that, but the runtime deposit decision still ignores `management_override`. The result can be a pending-payment booking with no chosen cash/link path.

**Evidence:** The hook sends `sunday_deposit_method` only when `!isManagement` in `src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts:459`, while the server runtime `requiresDeposit` expression at `src/app/api/foh/bookings/route.ts:1056` checks waiver/event state but not `management_override`.

**Why it might be wrong:** A later RPC call not shown in the pack may translate `management_override` into `p_deposit_waived=true`.

**What would confirm:** Post a 10-person FOH booking with `management_override=true` and no `sunday_deposit_method`, then inspect the returned state and booking row payment status.

**Action type:** Implementation change


### [HIGH] SEC-001 — Migration C still calls the legacy core function before applying the new threshold, then returns its result unchanged fo
**Source:** Mgmt — Security & Data Risk  
**Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:49`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Migration C still calls the legacy core function before applying the new threshold, then returns its result unchanged for parties below 10. Data-integrity scenario: _core flows can still create pending-payment deposits for Sunday or 7-9 cover bookings even though the new rule says no deposit is required.

**Evidence:** The function delegates to create_table_booking_v05_core_sunday_deposit_legacy, then returns v_result unchanged when p_party_size is below 10 in supabase/migrations/20260509000016_patch_v05_core_threshold.sql:49.

**Why it might be wrong:** The legacy helper might have been renamed but internally patched elsewhere, though the migration comment identifies it as the legacy Sunday/7+ implementation.

**What would confirm:** Inspect or replace create_table_booking_v05_core_sunday_deposit_legacy so below-10 bookings cannot leave the legacy function with payment holds, pending payments, or pending_payment status.

**Action type:** Implementation change


### [HIGH] SEC-002 — PayPal create-order reuses an existing paypal_deposit_order_id before recalculating or validating the current canonical 
**Source:** Mgmt — Security & Data Risk  
**Location:** `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:56`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** PayPal create-order reuses an existing paypal_deposit_order_id before recalculating or validating the current canonical deposit amount. Data-integrity scenario: after party size or deposit amount changes, a customer can pay an old lower-value PayPal order and the capture path will lock that lower amount as paid.

**Evidence:** The idempotent branch returns the stored orderId before getCanonicalDeposit runs in src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:56.

**Why it might be wrong:** If every party-size or deposit mutation reliably clears paypal_deposit_order_id, this would be mitigated, but that invariant is not shown in the pack.

**What would confirm:** Verify all amount-changing mutations invalidate existing PayPal orders, or fetch the PayPal order and compare amount/currency before reusing it.

**Action type:** Implementation change


### [HIGH] SEC-003 — Stripe table-deposit confirmation can complete while deposit_amount_locked is skipped or fails as a best-effort follow-u
**Source:** Mgmt — Security & Data Risk  
**Location:** `src/app/api/stripe/webhook/route.ts:492`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Stripe table-deposit confirmation can complete while deposit_amount_locked is skipped or fails as a best-effort follow-up write. Data-integrity scenario: a paid booking remains confirmed without the immutable captured amount, so later canonical reads can recompute or use stale deposit_amount.

**Evidence:** After the table-deposit RPC returns confirmed, the code logs missing/invalid amount_total or lock update errors but continues webhook processing in src/app/api/stripe/webhook/route.ts:492.

**Why it might be wrong:** The RPC may independently persist an immutable captured amount, but the pack only shows deposit_amount_locked being written after the RPC.

**What would confirm:** Verify the RPC writes deposit_amount_locked transactionally, or make the Stripe confirmation path fail/reconcile before confirming when the lock cannot be written.

**Action type:** Implementation change


### [HIGH] SEC-004 — Migration A converts future below-threshold unpaid Sunday-lunch bookings to confirmed but does not clear payment_status,
**Source:** Mgmt — Security & Data Risk  
**Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Migration A converts future below-threshold unpaid Sunday-lunch bookings to confirmed but does not clear payment_status, PayPal order IDs, payment holds, or pending payment rows. Data-integrity scenario: a no-longer-required legacy payment artefact can remain payable or capturable after the booking has been converted to confirmed.

**Evidence:** The Step 1 UPDATE only sets booking_type, status, and deposit_amount in supabase/migrations/20260509000014_add_deposit_amount_locked.sql:38.

**Why it might be wrong:** Some cleanup may be handled by triggers or later migrations not included in the pack.

**What would confirm:** Verify converted rows have payment_status, paypal_deposit_order_id, active payment_hold rows, and pending table_deposit payments cleared or made unreachable.

**Action type:** Implementation change


### [HIGH] AB-001 — The /sunday-lunch page still ships post-launch claims unconditionally before launch
**Source:** Web — Assumption Breaker  
**Location:** `app/sunday-lunch/page.tsx:26`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The /sunday-lunch page still ships post-launch claims unconditionally before launch. On 2026-04-28, metadata and FAQ copy say walk-ins/no pre-order are available even though the launch starts on 2026-05-17.

**Evidence:** app/sunday-lunch/page.tsx:26 says 'Walk-in friendly Sunday roast served 1pm-6pm', and the FAQ later says walk-ins are welcome with no pre-order while only SundayLunchHowItWorks is date-aware.

**Why it might be wrong:** If this branch will not be published until after 2026-05-17, the pre-launch falsehood disappears.

**What would confirm:** Confirm the deploy date; if deploying before 2026-05-17, all visible /sunday-lunch post-launch claims need the same date-aware treatment.

**Action type:** Implementation change


### [HIGH] AB-002 — The customer-visible content sweep is incomplete: active blog pages still describe Sunday lunch as requiring pre-order, 
**Source:** Web — Assumption Breaker  
**Location:** `content/blog/60th-birthday-party-ideas-venues/index.md:40`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The customer-visible content sweep is incomplete: active blog pages still describe Sunday lunch as requiring pre-order, Saturday cutoff, or a Sunday-specific deposit. This directly contradicts the retired cutoff/preorder/deposit policy.

**Evidence:** content/blog/60th-birthday-party-ideas-venues/index.md:40 says Sunday lunch requires advance booking, £10 per person deposit, and Saturday 1pm pre-order; similar stale claims appear in family-friendly-sunday-lunch-heathrow, vegetarian-pub-food-near-heathrow, and best-sunday-roast-surrey.

**Why it might be wrong:** Some posts could be intentionally archival, but these pages contain current booking CTAs and operational guidance.

**Action type:** Implementation change


### [HIGH] AB-003 — The sanitizer is demonstrated for /api/table-bookings, but the pack still references a live /api/table-bookings/create r
**Source:** Web — Assumption Breaker  
**Location:** `tests/api/table-bookings.test.ts:7`  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** The sanitizer is demonstrated for /api/table-bookings, but the pack still references a live /api/table-bookings/create route and the shared API client retains retired sunday_lunch/menu-selection plumbing. A stale or hostile client could bypass the new strip/regularisation if that route does not independently sanitize.

**Evidence:** tests/api/table-bookings.test.ts:7 imports POST from app/api/table-bookings/create/route, while lib/api/client.ts:44 still defines sunday_lunch?: boolean and includes Sunday pre-order summary helpers.

**Why it might be wrong:** The hidden create route may already force regular bookings or be unreachable from production UI.

**What would confirm:** Review app/api/table-bookings/create/route.ts and grep public callers or traffic logs for use of /api/table-bookings/create.

**Action type:** Follow-up review


### [HIGH] ARCH-001 — Customer-facing content still states Sunday lunch requires advance booking, a per-person deposit, and a Saturday 1pm pre
**Source:** Web — Integration & Architecture  
**Location:** `content/blog/60th-birthday-party-ideas-venues/index.md:42`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Customer-facing content still states Sunday lunch requires advance booking, a per-person deposit, and a Saturday 1pm pre-order cutoff. That leaves retired operational policy duplicated in content instead of following the documented copy source of truth.

**Evidence:** `docs/copy-assumptions.md:28` and `docs/copy-assumptions.md:35` set no pre-order/cutoff and a 10+ deposit threshold, while `content/blog/60th-birthday-party-ideas-venues/index.md:42` says advance booking, deposit, and Saturday 1pm cutoff are required.

**Why it might be wrong:** If this article is intentionally archival, it still needs explicit archival framing because the front matter presents it as current 2026 guidance.

**What would confirm:** Search all changed content for retired terms like `pre-order`, `Saturday`, `cutoff`, and unconditional `deposit`, then reconcile every customer-visible claim to `docs/copy-assumptions.md`.

**Action type:** Implementation change


### [HIGH] ARCH-002 — The `/sunday-lunch` launch state is split between a date-aware component and static metadata/FAQ copy, so before 17 May 
**Source:** Web — Integration & Architecture  
**Location:** `app/sunday-lunch/page.tsx:25`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The `/sunday-lunch` launch state is split between a date-aware component and static metadata/FAQ copy, so before 17 May 2026 the page can say walk-ins are already live while another section says they start on 17 May. Time-dependent operational policy has unclear ownership across SEO metadata, page copy, and client state.

**Evidence:** `app/sunday-lunch/page.tsx:25` describes the page as `Walk-in friendly` unconditionally, while `components/sunday-lunch/SundayLunchHowItWorks.tsx:6` keeps explicit pre-launch copy until `WALK_IN_LAUNCH_STARTS_AT_MS`.

**Why it might be wrong:** The spec might intentionally allow post-launch SEO metadata before the launch date, but that exception is not stated in the pack.

**What would confirm:** Decide whether all `/sunday-lunch` public copy, including metadata, JSON-LD, and FAQ text, must share the same pre/post-launch state until 17 May 2026.

**Action type:** Implementation change


### [HIGH] ARCH-005 — Shared booking helpers and whole booking wizard modules were deleted, but the related-file hints show files outside the 
**Source:** Web — Integration & Architecture  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Shared booking helpers and whole booking wizard modules were deleted, but the related-file hints show files outside the inline pack still reference changed basenames. If any remaining route or component imports those deleted modules, the integration breaks at build time.

**Evidence:** The pack lists `lib/booking-helpers.ts`, `components/features/BookingWizard/*`, and `app/api/booking/submit/route.ts` as deleted, and Related Files includes `app/api/bookings/initiate/route.ts` outside the inline contents.

**Why it might be wrong:** The related hint may refer to another changed basename or a comment rather than an import, and all real consumers may already be removed.

**What would confirm:** Run or inspect an `rg 'booking-helpers|BookingWizard|/api/booking/submit|SundayLunchBooking'` result across the repo before merge.

**Action type:** Follow-up review


### [HIGH] WF-003 — Failure sequence: an agent books a party of 10+, management returns a `pending_payment` state or payment URL, but this e
**Source:** Web — Workflow & Failure-Path  
**Location:** `app/api/booking/agent/route.ts:134`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Failure sequence: an agent books a party of 10+, management returns a `pending_payment` state or payment URL, but this endpoint still returns `success: true` with booking-confirmed copy and no actionable payment URL branch. The customer can believe the booking is complete while the hold later expires unpaid.

**Evidence:** After `createTableBooking`, the response always builds `success: true` and `message: Booking confirmed...`; the only large-group branch is the text `specialInstructions` copy at `app/api/booking/agent/route.ts:149`.

**Why it might be wrong:** The management API may send an SMS or out-of-band payment link for AI-agent bookings, but that contract is not shown in the pack.

**What would confirm:** Add a route test where `createTableBooking` resolves `status: 'pending_payment'` with `next_step_url` or `fallback_payment_url` and assert the agent response exposes a payment-required workflow.

**Action type:** Implementation change


## Medium-Priority Findings

### [MEDIUM] AB-005 — The legacy Sunday-lunch admin path is not actually preserved in the FOH UI because the checkbox is always disabled
**Source:** Mgmt — Assumption Breaker  
**Location:** `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The legacy Sunday-lunch admin path is not actually preserved in the FOH UI because the checkbox is always disabled. The comment says staff can enable it via the input, but the rendered input cannot be toggled at all.

**Evidence:** `disabled` is hard-coded on the Sunday lunch checkbox at `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`, replacing the previous Sunday-date conditional enablement.

**Why it might be wrong:** There may be another admin-only UI outside the pack for legacy Sunday-lunch backfill.

**What would confirm:** Open the FOH create booking modal on a Sunday and verify whether any staff role can create `sunday_lunch=true` from the UI.

**Action type:** Implementation change


### [MEDIUM] AB-006 — Public booking idempotency still includes fields that the route now ignores, so semantically identical requests can hash
**Source:** Mgmt — Assumption Breaker  
**Location:** `src/app/api/table-bookings/route.ts:185`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** False  

**Issue:** Public booking idempotency still includes fields that the route now ignores, so semantically identical requests can hash differently and bypass replay protection. This can create duplicate bookings when a client retries with or without legacy `sunday_lunch` or preorder fields.

**Evidence:** The request hash includes `sunday_lunch` and `sunday_preorder_items` at `src/app/api/table-bookings/route.ts:185`, while the RPC call forces `p_sunday_lunch: false` at `src/app/api/table-bookings/route.ts:248` and public preorder persistence is removed at `src/app/api/table-bookings/route.ts:303`.

**Why it might be wrong:** If the website never sends those legacy fields anymore, the duplicate-risk input variation may not occur in production.

**What would confirm:** Send two otherwise identical POSTs with the same idempotency key but different ignored legacy fields and check whether the route replays or treats them as a hash mismatch.

**Action type:** Implementation change


### [MEDIUM] AB-007 — Not every successful deposit-confirmation surface guarantees `deposit_amount_locked` is written
**Source:** Mgmt — Assumption Breaker  
**Type:** Confirmed defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Not every successful deposit-confirmation surface guarantees `deposit_amount_locked` is written. Stripe logs and continues when the amount is invalid, and the FOH cash path confirms the booking even if the follow-up lock update fails.

**Evidence:** The Stripe webhook logs `missing/invalid amount_total` and skips the lock write at `src/app/api/stripe/webhook/route.ts:516`, while the cash path explicitly logs `cashLockError` but does not block after `src/app/api/foh/bookings/route.ts:1242`.

**Why it might be wrong:** Stripe table-deposit sessions may always include a valid positive amount, and cash lock failures may be operationally rare.

**What would confirm:** Add tests that force Stripe `amount_total=null` and cash lock update failure, then assert whether the booking can end confirmed without `deposit_amount_locked`.

**Action type:** Implementation change


### [MEDIUM] AB-008 — Migration C says it affects event/table reservation flows through `_core`, but the patched function has no `p_deposit_wa
**Source:** Mgmt — Assumption Breaker  
**Location:** `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:25`  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Migration C says it affects event/table reservation flows through `_core`, but the patched function has no `p_deposit_waived` or venue-event exception input. That may contradict the repo rule that venue-hosted events are exceptions to deposit rules for 10+ parties.

**Evidence:** `create_table_booking_v05_core` accepts only customer/date/time/party/purpose/notes/sunday/source at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:25` and applies the 10+ deposit branch at `supabase/migrations/20260509000016_patch_v05_core_threshold.sql:61`.

**Why it might be wrong:** The call sites for `_core` may never be used for venue-event or waived-deposit bookings.

**What would confirm:** Identify all callers of `create_table_booking_v05_core` and verify whether any carry management overrides, venue-event flags, or deposit waivers that are lost at this boundary.

**Action type:** Follow-up review


### [MEDIUM] ARCH-004 — The backend still preserves a staff-explicit legacy Sunday-lunch path, but the FOH modal hard-disables the only visible 
**Source:** Mgmt — Integration & Architecture  
**Location:** `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`  
**Type:** Strongly suspected defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** The backend still preserves a staff-explicit legacy Sunday-lunch path, but the FOH modal hard-disables the only visible `sunday_lunch` input. That creates a UI/API contract mismatch and appears to break the stated legacy admin backfill workflow.

**Evidence:** The checkbox is rendered with `disabled` at `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`, while FOH creation still retains `effectiveSundayLunch`/legacy persistence behavior in `src/app/api/foh/bookings/route.ts:1049`.

**Why it might be wrong:** There may be another legacy-admin entry surface outside the pack, or the intended decision may be to retire UI-based legacy creation entirely.

**What would confirm:** Confirm whether staff must be able to create/backfill legacy `booking_type='sunday_lunch'` bookings through FOH after this change.

**Action type:** Human decision


### [MEDIUM] ARCH-005 — The Sunday business-hours change is intentionally parked in `scripts/one-off` rather than a migration, so fresh environm
**Source:** Mgmt — Integration & Architecture  
**Location:** `scripts/one-off/2026-04-28-sunday-hours-13-18.sql:11`  
**Type:** Needs human decision  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** The Sunday business-hours change is intentionally parked in `scripts/one-off` rather than a migration, so fresh environments and `supabase db push` will not reproduce the launched service window. This creates deployment drift unless the rollout explicitly accepts manual post-deploy state.

**Evidence:** The script says the update is local-only and should later be captured inside a tracked migration at `scripts/one-off/2026-04-28-sunday-hours-13-18.sql:11`, but the changed migrations do not include the business-hours update.

**Why it might be wrong:** The staged rollout may intentionally require a manual production toggle before a later migration records the steady state.

**What would confirm:** Owner sign-off that the one-off script is the deployment source of truth for this wave, or a tracked migration containing the final Sunday hours update.

**Action type:** Human decision


### [MEDIUM] WF-005 — Failure sequence: Migration A converts a future unpaid legacy Sunday-lunch booking below 10 from `pending_payment` to `c
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:39`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Failure sequence: Migration A converts a future unpaid legacy Sunday-lunch booking below 10 from `pending_payment` to `confirmed`, but only updates the booking row fields shown. Existing `payment_status`, pending payment rows, active payment holds, or guest payment tokens can remain and keep staff or guest workflows treating the booking as awaiting deposit.

**Evidence:** The conversion update only sets `booking_type`, `status`, and `deposit_amount` in `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:39`, with no visible cleanup of payment status, holds, payments, or guest tokens.

**Why it might be wrong:** The comment says current production has zero future unpaid pending Sunday-lunch rows, and triggers outside the pack could clean linked rows.

**What would confirm:** Run the migration against a fixture future unpaid Sunday-lunch pending booking and query `payment_status`, `booking_holds`, `payments`, and guest payment tokens afterward.

**Action type:** Implementation change


### [MEDIUM] WF-006 — Failure sequence: staff need to back-fill a legacy Sunday-lunch/preorder booking, but the modal renders the legacy check
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Failure sequence: staff need to back-fill a legacy Sunday-lunch/preorder booking, but the modal renders the legacy checkbox as always disabled. The workflow looks present in the UI but cannot set `sunday_lunch=true`, so legacy preorder capture paths are unreachable from this modal.

**Evidence:** The Sunday-lunch checkbox is hard-coded `disabled` at `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:415`, while submit payloads only include preorder mode/items when `createForm.sunday_lunch` is true in `src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts:461`.

**Why it might be wrong:** There may be another admin-only legacy backfill surface outside the pack.

**What would confirm:** Ask whether any other shipped UI can create a legacy `booking_type='sunday_lunch'` booking with preorder data after this change.

**Action type:** Human decision


### [MEDIUM] WF-007 — Failure sequence: staff increase a booking from below-threshold to 10+; the route updates the booking to `pending_paymen
**Source:** Mgmt — Workflow & Failure-Path  
**Location:** `src/app/api/boh/table-bookings/[id]/party-size/route.ts:121`  
**Type:** Plausible but unverified  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Failure sequence: staff increase a booking from below-threshold to 10+; the route updates the booking to `pending_payment` before generating the guest token, then token creation fails. The catch only logs, so the booking can be left pending without a customer payment URL or SMS unless the response tail surfaces remediation.

**Evidence:** The party-size route updates status/payment_status before token creation at `src/app/api/boh/table-bookings/[id]/party-size/route.ts:121`, and token generation failure is caught and logged at `src/app/api/boh/table-bookings/[id]/party-size/route.ts:135`.

**Why it might be wrong:** The truncated tail of the file may return a clear `deposit_url:null` or staff-facing failure that makes the partial state recoverable.

**What would confirm:** Inspect the route response after the truncated section or simulate `createGuestToken` failure and verify what staff see and whether a payment link can be regenerated.

**Action type:** Implementation change


### [MEDIUM] SEC-005 — getCanonicalDeposit ignores deposit_waived when a stored deposit_amount exists in a payment-required state
**Source:** Mgmt — Security & Data Risk  
**Location:** `src/lib/table-bookings/deposit.ts:79`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** getCanonicalDeposit ignores deposit_waived when a stored deposit_amount exists in a payment-required state. Data-integrity scenario: a manager-waived unpaid booking with a stale stored deposit can still be charged via PayPal/create-payment flows.

**Evidence:** The helper returns stored deposit_amount before applying deposit_waived to the fresh compute path in src/lib/table-bookings/deposit.ts:79.

**Why it might be wrong:** The application may always clear deposit_amount and payment status when a waiver is applied, but that invariant is not shown in the pack.

**What would confirm:** Check waiver mutation paths, or change precedence to locked > waiver > stored > computed for unpaid bookings.

**Action type:** Implementation change


### [MEDIUM] SEC-006 — Cash-deposit confirmation records the payment first, then writes deposit_amount_locked in a separate best-effort update
**Source:** Mgmt — Security & Data Risk  
**Location:** `src/app/api/foh/bookings/route.ts:1242`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** False  

**Issue:** Cash-deposit confirmation records the payment first, then writes deposit_amount_locked in a separate best-effort update. Data-integrity scenario: if the lock update fails, the booking is already confirmed as cash-paid but future canonical reads can drift from the amount actually taken.

**Evidence:** cashLockError is logged but does not fail or reconcile the already-confirmed cash deposit in src/app/api/foh/bookings/route.ts:1242.

**Why it might be wrong:** The record_table_cash_deposit_v05 RPC may be patched elsewhere to write the lock itself, but the local comment says it does not.

**What would confirm:** Move the lock write into record_table_cash_deposit_v05 or verify the RPC now updates deposit_amount_locked transactionally.

**Action type:** Implementation change


### [MEDIUM] SEC-007 — Migration A can backfill deposit_amount_locked from non-positive payment or booking amounts because it only checks for N
**Source:** Mgmt — Security & Data Risk  
**Location:** `supabase/migrations/20260509000014_add_deposit_amount_locked.sql:73`  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Migration A can backfill deposit_amount_locked from non-positive payment or booking amounts because it only checks for NULL. Data-corruption scenario: a historical zero or negative table_deposit amount becomes the immutable canonical amount for a paid booking.

**Evidence:** The paid backfill uses COALESCE(payments.amount, tb.deposit_amount) and guards only with IS NOT NULL in supabase/migrations/20260509000014_add_deposit_amount_locked.sql:73.

**Why it might be wrong:** Database constraints may already prevent non-positive amounts, but those constraints are not included in the pack.

**What would confirm:** Verify positive-amount constraints on payments.amount and table_bookings.deposit_amount, or add amount > 0 filters to the backfill and verification query.

**Action type:** Implementation change


### [MEDIUM] SEC-008 — State-changing PayPal payment routes appear to require only the read:events API permission
**Source:** Mgmt — Security & Data Risk  
**Location:** `src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts:233`  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** State-changing PayPal payment routes appear to require only the read:events API permission. Privilege scenario: an API key intended for read-only event access could create or capture table-booking deposits if withApiAuth treats read:events literally.

**Evidence:** The capture-order route passes ['read:events'] to withApiAuth in src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts:233, and create-order uses the same permission in src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:142.

**Why it might be wrong:** The project may use read:events as a broad website integration scope rather than a read-only permission, but that convention is not established in the pack.

**What would confirm:** Check API key permission semantics and require a payment/table-booking write scope for these mutation endpoints if available.

**Action type:** Implementation change


### [MEDIUM] AB-004 — public/llms.txt contradicts the operational source of truth for opening and kitchen hours
**Source:** Web — Assumption Breaker  
**Location:** `public/llms.txt:23`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** False  

**Issue:** public/llms.txt contradicts the operational source of truth for opening and kitchen hours. Because this file is intended for LLM/AI retrieval, it can propagate wrong hours even after the launch copy is corrected elsewhere.

**Evidence:** public/llms.txt:23 says Sunday opening is 12pm-9pm and public/llms.txt:28 says Saturday kitchen is 12pm-9pm, while docs/copy-assumptions.md:22-23 says Saturday kitchen 1pm-7pm and Sunday 1pm-6pm.

**Why it might be wrong:** If llms.txt intentionally targets a different future hours schedule, docs/copy-assumptions.md should be updated first.

**Action type:** Implementation change


### [MEDIUM] AB-005 — Project guidance still states the old Sunday-lunch rule, contradicting the new docs and implementation
**Source:** Web — Assumption Breaker  
**Location:** `CLAUDE.md:68`  
**Type:** Repo-convention conflict  
**Confidence:** High  
**Blocking:** False  

**Issue:** Project guidance still states the old Sunday-lunch rule, contradicting the new docs and implementation. Future agents following repo instructions could reintroduce advance-booking/prepayment assumptions.

**Evidence:** CLAUDE.md:68 says Sunday lunch requires advance booking and prepayment, while docs/copy-assumptions.md:28-34 says no pre-order and no Sunday-specific deposit after the walk-in launch.

**Why it might be wrong:** The CLAUDE.md excerpt may be static reviewer context rather than a file updated in this branch.

**What would confirm:** Decide whether project CLAUDE.md must be revised or whether docs/copy-assumptions.md explicitly supersedes that critical-business-rule line.

**Action type:** Spec revision


### [MEDIUM] AB-006 — The per-page revalidate rollout appears incomplete for pages that now render LaunchAnnouncement
**Source:** Web — Assumption Breaker  
**Location:** `app/easter/page.tsx:6`  
**Type:** Needs verification  
**Confidence:** Low  
**Blocking:** False  

**Issue:** The per-page revalidate rollout appears incomplete for pages that now render LaunchAnnouncement. Client-side recompute mitigates interactive users, but stale server HTML can persist for crawlers, no-JS clients, or pre-hydration views if those routes keep longer ISR defaults.

**Evidence:** app/easter/page.tsx:6, app/fathers-day/page.tsx:6, and app/mothers-day/page.tsx:7 import LaunchAnnouncement, while their visible page snippets do not show the revalidate=3600 export used in app/page.tsx:44 and app/sunday-lunch/page.tsx:21.

**Why it might be wrong:** A hidden lower export in the truncated files or a route-segment config could set revalidate outside the visible snippet.

**What would confirm:** Check the full files or Next build route manifest for revalidate settings on every page that renders LaunchAnnouncement.

**Action type:** Follow-up review


### [MEDIUM] ARCH-003 — The public AI-readable facts file carries independent opening and kitchen hours that disagree with the documented source
**Source:** Web — Integration & Architecture  
**Location:** `public/llms.txt:19`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** False  

**Issue:** The public AI-readable facts file carries independent opening and kitchen hours that disagree with the documented source of truth. This is a state-ownership problem because AI/search surfaces can serve different operational data than the website and booking windows.

**Evidence:** `public/llms.txt:19`-`public/llms.txt:30` says Sunday open 12pm-9pm and Saturday kitchen 12pm-9pm, while `docs/copy-assumptions.md:18`-`docs/copy-assumptions.md:19` says Saturday kitchen 1pm-7pm and Sunday/kitchen 1pm-6pm.

**Why it might be wrong:** If `llms.txt` intentionally reflects a separate live-hours source, the source-of-truth document needs to name that exception.

**What would confirm:** Check the live management hours or decide that `llms.txt` must be generated from the same operational source as booking/copy claims.

**Action type:** Implementation change


### [MEDIUM] ARCH-004 — Project-specific conventions still declare the old Sunday lunch rule requiring advance booking and prepayment, while the
**Source:** Web — Integration & Architecture  
**Location:** `CLAUDE.md:56`  
**Type:** Repo-convention conflict  
**Confidence:** High  
**Blocking:** False  

**Issue:** Project-specific conventions still declare the old Sunday lunch rule requiring advance booking and prepayment, while the new docs and code retire that model. Because project-level conventions outrank general workspace guidance, future work can reintroduce the removed booking flow.

**Evidence:** Project Conventions `CLAUDE.md:56` says Sunday lunch requires advance booking and prepayment, while `docs/copy-assumptions.md:28` and `docs/copy-assumptions.md:31` say no pre-order and no Sunday-specific deposit.

**Why it might be wrong:** The convention excerpt may be outside this branch's intended edit scope, but it is included as governing repo context in the pack.

**What would confirm:** Update the project convention or add a clear post-launch override that matches `docs/copy-assumptions.md`.

**Action type:** Spec revision


### [MEDIUM] ARCH-006 — Retired Sunday pre-order behavior still appears in the shared `AnchorAPI` client while the public proxy strips those fie
**Source:** Web — Integration & Architecture  
**Location:** `lib/api/client.ts:44`  
**Type:** Plausible but unverified  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Retired Sunday pre-order behavior still appears in the shared `AnchorAPI` client while the public proxy strips those fields, leaving two booking contracts. If any caller bypasses `/api/table-bookings` and uses `anchorAPI.createTableBooking`, stale `sunday_lunch` or menu-selection behavior may still reach the management API.

**Evidence:** `lib/api/client.ts:44` still includes `sunday_lunch` on the management booking payload and `lib/api/client.ts:129` still builds `Sunday lunch pre-order` notes, while `app/api/table-bookings/route.ts:103` says those fields are stripped on the public proxy.

**Why it might be wrong:** Those helpers may be intentionally retained for non-public management compatibility and may no longer be reachable from website callers.

**What would confirm:** Inspect all `anchorAPI.createTableBooking` callers and the rest of `lib/api/client.ts` to verify no website path can still send Sunday-lunch/menu-selection payloads.

**Action type:** Follow-up review


### [MEDIUM] WF-001 — Failure sequence: a user has an old cached booking wizard or non-JS form open, completes the booking, and submits to `/a
**Source:** Web — Workflow & Failure-Path  
**Location:** `app/api/booking/submit/route.ts:1`  
**Type:** Strongly suspected defect  
**Confidence:** Medium  
**Blocking:** True  

**Issue:** Failure sequence: a user has an old cached booking wizard or non-JS form open, completes the booking, and submits to `/api/booking/submit`; after this deletion the route 404s instead of translating the request into the new `/api/table-bookings` path. The booking fails after the user has entered all details, with no compatibility shim or recovery route in the pack.

**Evidence:** `app/api/booking/submit/route.ts` is deleted; the removed handler previously accepted JSON and form submissions, ran validation/service-window checks, and called `anchorAPI.createTableBooking`.

**Why it might be wrong:** If no deployed or external clients can still post to this endpoint, the current UI may be unaffected.

**What would confirm:** Check deployed access logs and built client bundles for `/api/booking/submit`, or add a temporary shim and verify stale payloads are accepted.

**Action type:** Implementation change


### [MEDIUM] WF-002 — Failure sequence: an AI agent posts a booking, the upstream create succeeds, the network drops before the response, and 
**Source:** Web — Workflow & Failure-Path  
**Location:** `app/api/booking/agent/route.ts:131`  
**Type:** Needs verification  
**Confidence:** Medium  
**Blocking:** False  

**Issue:** Failure sequence: an AI agent posts a booking, the upstream create succeeds, the network drops before the response, and the agent retries; this handler appears to call booking creation again without a stable idempotency key. That can create duplicate table bookings or holds for the same customer and slot.

**Evidence:** The agent POST handler calls `anchorAPI.createTableBooking(bookingRequest)` with no idempotency argument or request-header idempotency handling visible in the pack.

**Why it might be wrong:** `anchorAPI.createTableBooking` might generate and persist a stable idempotency key internally, but its method body is not included in the visible pack excerpt.

**What would confirm:** Test two identical agent POST retries and verify the management API receives the same `Idempotency-Key` or returns one booking.

**Action type:** Follow-up review


### [MEDIUM] WF-004 — Failure sequence: a customer researching Sunday lunch reads retained pre-order, Saturday-cutoff, or universal-deposit co
**Source:** Web — Workflow & Failure-Path  
**Location:** `content/blog/best-sunday-roast-surrey/index.md:31`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** True  

**Issue:** Failure sequence: a customer researching Sunday lunch reads retained pre-order, Saturday-cutoff, or universal-deposit copy, assumes the new walk-in flow is unavailable or that a small party must pay, and abandons or calls unnecessarily. This conflicts with the launch workflow that removed Sunday pre-orders/cutoffs and moved deposits to groups of 10+ only.

**Evidence:** `content/blog/best-sunday-roast-surrey/index.md:31` still lists The Anchor booking as `Yes (by Sat 1pm)`, and `content/blog/60th-birthday-party-ideas-venues/index.md:43` says Sunday lunch requires advance booking, a per-person deposit, and a Saturday 1pm deadline.

**Why it might be wrong:** Some affected pages may be archive content, but they are still public customer-visible surfaces in the changed pack.

**Action type:** Implementation change


### [MEDIUM] WF-006 — Failure sequence: an AI assistant consumes `llms.txt`, tells a customer Sunday opening is until 9pm or Saturday kitchen 
**Source:** Web — Workflow & Failure-Path  
**Location:** `public/llms.txt:24`  
**Type:** Confirmed defect  
**Confidence:** High  
**Blocking:** False  

**Issue:** Failure sequence: an AI assistant consumes `llms.txt`, tells a customer Sunday opening is until 9pm or Saturday kitchen runs until 9pm, and the customer arrives outside the actual published service window. This creates a stale-data failure path for AI-mediated visits even though the human-facing copy-assumptions source says Sunday is 1pm-6pm and Saturday kitchen is 1pm-7pm.

**Evidence:** `public/llms.txt:24` says `Sunday: 12pm-9pm`, and `public/llms.txt:29` says `Saturday: 12pm-9pm` for kitchen hours, conflicting with `docs/copy-assumptions.md:18` and `docs/copy-assumptions.md:19`.

**Why it might be wrong:** If `llms.txt` intentionally uses a different operational source than `docs/copy-assumptions.md`, the source of truth needs to be clarified.

**Action type:** Implementation change


## Minor Observations
- [LOW] AB-009 (M-AB): The Sunday service-window comments disagree on the last bookable arrival. The one-off launch script says slot logic enfo
- [LOW] WF-005 (W-WF): Failure sequence: `/sunday-lunch` is cached before 17 May with pre-launch HTML, then a user opens it after cutover; the 

## Recommended Fix Order
1. Triage HIGH findings — separate genuine defects from false positives.
2. Fix genuine defects with targeted commits + tests.
3. Triage MEDIUM as post-launch follow-up patch.
4. Re-run targeted reviewers on the fixed files only (pack with tighter scope).