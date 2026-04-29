# Sunday Walk-In Launch & Booking Flow Migration — Design Spec

| Field | Value |
|---|---|
| **Spec date** | 2026-04-28 (revision 9) |
| **Launch date** | 2026-05-17 (Sunday) |
| **Author** | Peter Pitcher (with Claude) |
| **Phases** | 2 (single coordinated plan) |
| **Repos affected** | `OJ-The-Anchor.pub` (website), `OJ-AnchorManagementTools` (management app) |

---

## 0. Reading order

This spec leads with **§3 Live customer booking path TODAY** and **§4 Live customer booking path AFTER LAUNCH**. Anyone implementing this work must read those sections first and treat them as the compass throughout the build. The Booking Wizard (`components/features/BookingWizard/*`) is **not** the live customer-facing form on `/book-table`; it is a parallel, deprecated implementation. Don't get confused.

---

## 1. Goal

By **17 May 2026**, replace The Anchor's Sunday-lunch-specific pre-order + deposit system with a frictionless walk-in-and-book model.

- Sundays become regular `food` bookings — no menu pre-selection, no Sunday-specific deposit, no Saturday cutoff
- Walk-ins welcomed and visibly promoted across the site between 1pm-6pm Sundays
- Booking still recommended for capacity planning but no longer required
- A generic "groups of 10+" deposit rule replaces the Sunday-specific deposit and the existing 7+ rule
- Existing pre-launch bookings honoured exactly — paid deposits frozen via a new `deposit_amount_locked` column written at every payment-capture surface
- After launch (target end May / June): replace `ManagementTableBookingForm` with a redesigned 2-step wizard

## 2. Context

The Anchor consistently earns 5★ reviews for Sunday roasts, but the friction of £10/person deposits + Saturday 13:00 pre-order cutoffs caps weekly volume. Removing both, and reopening Sundays to walk-ins, is expected to grow Sunday cover counts and let the kitchen earn drop-in diners. The change crosses two applications: this customer-facing website and the management application at `management.orangejelly.co.uk`.

## 3. Live customer booking path TODAY (verified)

```
1. /book-table page
   └─ app/book-table/page.tsx
      • imports ManagementTableBookingForm (line 5)
      • renders ManagementTableBookingForm with prefill (line 195)
      • prefill includes sunday_lunch and mothers_day query params (lines 39-40, 70-71)
      • static FAQ + tips copy says "groups of 7 or more" (lines 230, 421)
      • static dish copy says Sunday roast "must be pre-ordered when booking" (line 308)
      • static dish copy says "Pre-order by Saturday 1pm" (line 362)

2. ManagementTableBookingForm (THE LIVE FORM)
   └─ components/features/TableBooking/ManagementTableBookingForm.tsx
      • imports SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP, getSundayLunchDepositAmount (line 12)
      • imports getSundayLunchCutoffDate, hasSundayLunchCutoffPassed (line 13)
      • imports Mother's Day prefill helpers (line 11)
      • computes sundayLunchCutoffPassed (line ~603), mandates Sunday-lunch deposit (~607)
      • applies "partySize >= 7" deposit threshold (line ~608)
      • renders Sunday plans selector (~2042), Sunday-cutoff messaging (1646, 2094)
      • static copy "groups of 7 or more" (~2264)

3. POST goes to ONE of two website routes
   ├─ POST /api/table-bookings  ← THE LIVE PROXY
   │  └─ app/api/table-bookings/route.ts
   │     • imports getSundayLunchCutoffDate, hasSundayLunchCutoffPassed (line 6)
   │     • normaliser derives sunday_lunch from sunday_lunch flag OR booking_type=='sunday_lunch' (lines 205-206)
   │     • enforces "Sunday lunch only on Sundays" (line 322)
   │     • enforces Saturday 13:00 cutoff (lines 326-340)
   │     • derives bookingType='sunday_lunch' (line 343)
   │
   └─ POST /api/booking/submit  (legacy wizard route — possibly dead path)
      └─ app/api/booking/submit/route.ts
         • derives sunday_lunch from menuSelections (lines 100-103)
         • applies "partySize >= 7" deposit threshold (line 191)

4. Service-window resolution
   └─ lib/table-booking-service-windows.ts
      • exports BookingPurpose = 'food' | 'drinks' (line 3)
      • exports BookingType = 'regular' | 'sunday_lunch' (line 4)
      • resolveServiceRanges branches on bookingType==='sunday_lunch' (256-270)

5. Availability
   └─ app/api/table-bookings/availability/route.ts
      • accepts booking_type='sunday_lunch' query param (line 80)
      • when food on Sunday, also resolves sunday_lunch ranges (118-125)
      • returns sunday_lunch_available flag

6. Forwarded to management
   └─ POST https://management.orangejelly.co.uk/api/table-bookings
      └─ src/app/api/table-bookings/route.ts (in OJ-AnchorManagementTools)
         • Zod accepts sunday_lunch boolean (~66)
         • passes p_sunday_lunch to RPC (~247)
         • response payload computes party_size * 10 (~478)
         • analytics computes party_size * 10 (~536)
         • persists sunday_preorder_items only when sunday_lunch===true (~307-326)

7. RPC create_table_booking_v05
   └─ supabase/migrations/20260509000005_create_table_booking_v05_deposit_waived.sql
      • parameter is p_sunday_lunch boolean (NOT p_booking_type)
      • parameter is p_deposit_waived boolean — current rule allows waiving deposits in specific situations
      • lines 176-180: kitchen-hours validation
      • line ~380: sets pending_payment for sunday_lunch OR party_size BETWEEN 7 AND 20
      • lines 399-401: computes sunday_preorder_cutoff_at = Saturday 13:00 Europe/London
      • lines 408-409: computes deposit_amount = party_size * 10 (always)
      • subsequent migrations (8 through 20260509000013) patch v05 via CREATE OR REPLACE FUNCTION

8. RPC create_table_booking_v05_core (event/table reservation flows)
   └─ supabase/migrations/20260509000013_fix_core_remove_card_capture_refs.sql
      • line ~63: 7+ runtime deposit rule

9. Deposit-required + amount recomputation surfaces
   • src/lib/table-bookings/bookings.ts:491, 708 (generateDepositPaymentUrl), 733
   • src/app/api/foh/bookings/route.ts:~1052
   • src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts:~230, ~427
   • src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx:~397, ~647
   • src/app/api/boh/table-bookings/[id]/party-size/route.ts:104
   • src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts:62
   • Stripe checkout / token-payment flows
   • Customer/staff SMS deposit-link paths

10. PayPal capture surfaces (where successful payment is recorded)
    • src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts:84 — updates table_bookings.payment_status, paypal_deposit_capture_id (does NOT necessarily write a payments row)
    • Stripe webhooks / checkout completion (separate surface)
    • Cash/manual deposit confirmation (admin path)

11. AI agent endpoint
    └─ app/api/booking/agent/route.ts
       • defaults Sundays to bookingType='sunday_lunch' (line 72)
       • returns "Pre-order by 1pm Saturday" + "7+ require deposit" copy (lines 156-161)

12. Other payment-touching surfaces
    • Management /g/[token]/table-payment magic-link page
    • Stripe checkout / token flows (admin/SMS-link paths)
```

The take-away: **the customer-facing booking surface is `ManagementTableBookingForm` calling `/api/table-bookings` calling the management API.**

## 4. Live customer booking path AFTER LAUNCH (target)

```
1. /book-table page
   • prefill no longer accepts sunday_lunch or mothers_day
   • static copy: "groups of 10 or more"; "served from 1pm Sundays — book ahead or walk in"

2. ManagementTableBookingForm
   • no Sunday plans selector, pre-order UI, or Sunday-specific cutoff messaging
   • deposit panel renders ONLY when partySize >= 10
   • copy: "We'll take a £10 per person deposit for groups of 10+ — fully deducted from your bill on the day"
   • PayPal failure surfaces a clear recovery state (call-us + management-API fallback link, see §6 / §8.9)

3. POST /api/table-bookings (proxy)
   • drops inbound sunday_lunch flag; ALSO drops/ignores inbound booking_type='sunday_lunch' (defence in depth — hostile or stale clients shouldn't bypass UI cleanup)
   • does not enforce Saturday cutoff
   • passes booking_type='regular' for everyone (no enum changes)
   • payload no longer carries sunday_preorder_items / menu_selections

4. resolveServiceRanges
   • bookingType==='sunday_lunch' branch becomes dead code from website's perspective
   • food bookings on Sundays resolve via kitchen window / schedule_config like any other day

5. Availability
   • no longer special-cases sunday_lunch; sunday_lunch_available flag retired

6. Management API
   • Accepts purpose='food' | 'drinks'; booking_type stays 'regular' for new public bookings
   • Tolerates legacy sunday_lunch=true but ignores it for new bookings
   • Applies new "party_size ≥ 10 AND NOT deposit_waived" rule via centralised helper
   • Does not set sunday_preorder_cutoff_at for non-legacy bookings
   • Response payload + analytics use canonical deposit amount (not blind party_size * 10)

7. RPC create_table_booking_v05 (patched via CREATE OR REPLACE)
   • Skips computing sunday_preorder_cutoff_at when p_sunday_lunch is false
   • pending_payment decision: party_size >= 10 AND NOT p_deposit_waived (preserves existing waiver semantics)
   • All other behaviour preserved — capacity, table assignment, hold expiry, audit logging

8. RPC create_table_booking_v05_core
   • Same threshold change with the same waiver preservation

9. Deposit recomputation — centralised + state-aware
   • Single helper getCanonicalDeposit(booking, partySize) (management app only) — see §7.3 for state-aware rule
   • requiresDeposit(partySize) and computeLargeGroupDepositAmount(partySize) on both sides for thresholds and display estimates
   • Website does NOT have getCanonicalDeposit — it has no DB access; it trusts the management API's response

10. PayPal & other capture surfaces
    • create-order reads canonical amount; never overwrites locked amount
    • capture-order WRITES deposit_amount_locked when capture succeeds (locks the actually captured amount)
    • Stripe webhook completion / cash-deposit confirmation similarly write deposit_amount_locked

11. AI agent endpoint
    • bookingType='regular' for any day; no Sunday-specific copy; deposit messaging gated on partySize >= 10

12. Other payment surfaces
    • Token-payment / Stripe / SMS deposit-link paths read canonical amount via the helper
    • Existing legacy payment links continue to charge the locked amount, OR fail with a clear staff-recovery path (see §8.10)
```

## 5. Scope

### 5.1 In scope
- Migrate the live customer booking path off Sunday-lunch-specific logic (form, proxy, agent, availability, possibly-dead submit)
- Replace the 7+ deposit rule with a generic 10+ rule across both repos and **both RPCs** (`create_table_booking_v05` and `create_table_booking_v05_core`), preserving existing `p_deposit_waived` semantics
- Remove the Saturday 13:00 cutoff from all customer-facing paths
- Extend advance booking limit to 6 months (verify and update across all layers)
- Honour existing pre-launch bookings exactly — preserve **paid** deposit amounts via `deposit_amount_locked`, written at every payment-capture surface
- Site-wide auto-expiring launch announcements with cache-aware behaviour and pre/launch-day/post copy variants
- Walk-in messaging on homepage hero, `/sunday-lunch`, `/book-table`, footer
- Sunday lunch landing page rewrite as content/SEO hub (no on-page booking form)
- Curated 5★ review testimonials on Sunday content (without relative dates)
- Coordinated changes in the management application (DB migrations + code + FOH UI + both RPCs)
- Comprehensive sweep for Sunday/pre-order/Saturday-cutoff/7+-deposit references on customer-visible surfaces, with an explicit allowlist for legitimate non-Sunday pre-order language (Christmas, private events)
- Courteous "please call if plans change" no-show messaging
- Centralise deposit-required decision and canonical-amount lookup
- Update analytics events that depend on Sunday-lunch / 7+ semantics; document the surviving event contract
- Failed-PayPal recovery: show clear call-us state AND surface management-API fallback payment link
- Phase 2: replace `ManagementTableBookingForm` with a simpler 2-step wizard

### 5.2 Out of scope
- Payment provider migration
- Modify/cancel UX rebuild (Phase 2 candidate)
- Confirmation email template (Phase 2)
- Refund automation
- Post-visit review nudges (Phase 2 candidate)
- Marketing campaigns beyond on-site banners
- Increasing wizard's party-size cap (Phase 2 candidate)
- Walk-in capacity subtraction from `/availability` (separate management-app feature)

## 6. Confirmed business rules

| Rule | Value |
|---|---|
| Sunday booking shape | Identical to a weekday food booking. No menu pre-selection. |
| Deposit threshold | Groups of **10 or more**, any day, any booking purpose (food or drinks), **and not deposit-waived** (preserves existing `p_deposit_waived` semantics) |
| Deposit amount | £10 per person |
| Deposit method | PayPal inline for website; Stripe + token-payment magic links remain available for staff-side flows |
| Refund rules | Unchanged from current policy |
| Sunday service window | **1pm–6pm** — confirmed change from current 12pm–5pm. Last bookable arrival slot **17:30**. Kitchen serves until 18:00. The hours change is real (not just a wording change) — `business_hours` data, schema.org structured data, and every customer-visible hours mention must be updated as part of the launch. |
| Capacity model | Time-slot model retained; walk-ins compete operationally; `/availability` does not currently subtract walk-ins (§11 OQ7) |
| Saturday 13:00 cutoff | **Removed** from all customer-facing paths |
| Advance booking limit | 6 months (verified across every layer) |
| No-show messaging | Courteous "please call if plans change so we can offer your table" |
| **Cutover semantics** | **Deploy as soon as content + booking-flow implementation is ready** to maximise SEO indexing time before 17 May. Verified state of legacy `sunday_lunch` bookings (28 April 2026 DB query, see D11): **41 historical (past dates, untouched), 2 future** — of which 1 is a cancelled-and-never-paid record (Migration A ignores it) and **1 is an active confirmed booking with paid deposit on Sunday 31 May 2026 at 1pm BST** (party 1, Roasted Chicken pre-order, £10 deposit captured). That 1 active booking is honoured exactly as paid: kitchen serves the pre-ordered chicken roast on 31 May; Migration A Step 2 locks `deposit_amount_locked = £10`. **Zero pre-launch Sunday legacy bookings (3 May, 10 May)** — kitchen has nothing legacy to fulfil before launch. Migration A Step 1's conversion logic is a no-op on day 1 but ships defensively. The pre-launch `<LaunchAnnouncement>` banner messaging stands. |
| Pre-launch Sunday menu (3 May, 10 May) | Kitchen serves the weekday food menu for new (post-deploy) Sunday bookings on 3 May and 10 May 2026. Legacy pre-orders for those Sundays are honoured separately on the Sunday roast menu. From 17 May 2026, all Sunday food bookings get the Sunday roast menu walk-in style. |
| Customer comms for converted legacy bookings | **Silent conversion** — no email/SMS. Pre-launch banner messaging carries the public-facing explanation. |
| Locked deposits | New `deposit_amount_locked: numeric NULL` column. Set by every payment-capture surface (PayPal capture-order, Stripe webhook, cash/manual deposit confirmation). Backfilled for existing paid bookings using a multi-source criterion (see §7.4). |
| Failed-PayPal recovery | If inline PayPal setup fails after a `pending_payment` booking is created, the website surfaces a clear "call us on 01753 682707" state AND the management API returns a fallback payment link in a **new explicit response field `fallback_payment_url`** (token-based, customer completes asynchronously via the management's `/g/[token]/table-payment` page). The new field is NOT overloaded onto `next_step_url`, which retains its happy-path semantics. `skip_customer_sms` is set to `false` for the failed-PayPal case so the customer also receives an SMS link. |
| Public-payload sanitisation | The website proxy strips both `sunday_lunch` and `booking_type` from inbound payloads before forwarding — defence in depth against hostile/stale clients |

## 7. Key design decisions

### 7.1 `booking_type` strategy: keep `'regular'` for all new public bookings; do NOT add enum values
Public payload uses `purpose: 'food' | 'drinks'`. Internal/DB `booking_type` stays `'regular' | 'sunday_lunch'`. The website stops emitting `sunday_lunch=true` and stops forwarding any inbound `booking_type` (including hostile/stale `'sunday_lunch'`). New bookings always have `booking_type='regular'`. Legacy `'sunday_lunch'` rows continue to render in admin views.

### 7.2 Wizard is not on the launch path
Phase 1 deletes the dead Wizard files as low-risk cleanup. Phase 2 replaces `ManagementTableBookingForm` with a fresh wizard.

### 7.3 Deposit-required + canonical amount: state-aware, centralised in management app only

**Website helpers** (no DB access):
- `requiresDeposit(partySize): boolean` → `partySize >= 10`
- `computeLargeGroupDepositAmount(partySize): number` → `requiresDeposit(partySize) ? partySize * 10 : 0`
Used for UI gating and pre-booking display estimates only. Once the management API returns a `deposit_amount`, the website displays that.

**Management app helpers** (full state):
```typescript
function requiresDeposit(partySize: number, opts?: { depositWaived?: boolean }): boolean {
  return partySize >= 10 && !opts?.depositWaived;
}

function getCanonicalDeposit(booking: BookingRow, partySize?: number): number {
  // 1. Locked amount always wins (paid or otherwise frozen)
  if (booking.deposit_amount_locked != null) return booking.deposit_amount_locked;

  // 2. Booking already in a payment-required state — trust the stored amount
  if (booking.status === 'pending_payment'
      || booking.payment_status === 'pending'
      || booking.payment_status === 'completed') {
    if (booking.deposit_amount != null) return booking.deposit_amount;
  }

  // 3. Booking is being newly evaluated — only compute if a deposit is genuinely required
  const ps = partySize ?? booking.party_size;
  if (requiresDeposit(ps, { depositWaived: booking.deposit_waived === true })) {
    return ps * 10;
  }

  // 4. Otherwise: zero (booking does not require deposit)
  return 0;
}
```

This is the single source of truth in the management app. Every recompute surface (FOH, hooks, party-size route, two `bookings.ts` paths, generateDepositPaymentUrl, PayPal create-order, response payload, analytics, token-payment, Stripe paths, SMS deposit-link) routes through it.

### 7.4 Locked deposit AMOUNT — written at capture, backfilled with broad criteria

`deposit_amount_locked: numeric NULL` on `table_bookings`.

**Write paths (Phase 1 must implement):**
1. **PayPal capture-order** (`src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts`) — on successful capture, set `deposit_amount_locked = <captured amount in GBP>` in the `UPDATE table_bookings` statement around line 84
2. **Stripe webhook / checkout completion** — on successful payment event, set `deposit_amount_locked` likewise
3. **Cash / manual deposit confirmation** (admin path) — staff confirming a manual deposit captures the amount and locks it
4. Any other surface that records "deposit was paid" must lock the amount

**Backfill (one-time, in the migration)** — must catch ALL current paid bookings, not only those with `payments` rows. Backfill criteria (any one is sufficient evidence of a real deposit):
- `table_bookings.payment_status = 'completed'`, OR
- `table_bookings.paypal_deposit_capture_id IS NOT NULL`, OR
- A `payments` row exists for the booking with `charge_type='table_deposit'` and `status` in the verified set of "paid" enum values (planning must confirm the exact values — the codebase mixes `'succeeded'`, `'completed'`, `'captured'`)

For each matched booking, lock the best available amount in this order:
1. `payments.amount` from the most recent paid `table_deposit` payment
2. `table_bookings.deposit_amount`
3. (Skip — leave NULL — if neither is available; flag for staff review)

Unpaid pending bookings are not locked. **What happens to those is OQ14a**, not silently assumed safe.

**Read priority** (in `getCanonicalDeposit`): `deposit_amount_locked` → state-checked `deposit_amount` → recompute only when `requiresDeposit` AND no prior amount.

### 7.5 Sunday lunch URL: keep and rewrite
`/sunday-lunch` retains SEO equity. Rewrite as content/SEO hub. **No booking form on the page.** Single primary CTA → `/book-table`. Content depends on `/keyword-plan` output (D1).

### 7.6 LaunchAnnouncement: cache-aware, two visible states, hidden after launch end
**Two date moments matter:**
- `WALK_IN_LAUNCH_STARTS_AT_MS = new Date('2026-05-17T00:00:00+01:00').getTime()` — start of 17 May BST
- `WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = new Date('2026-05-17T18:00:00+01:00').getTime()` — **18:00 BST on 17 May** (banner removes itself when the walk-in service window ends; matches the actual end of Sunday service, not the last-bookable-slot 17:30. Replacement content designed collaboratively after.)

**Two visible states**, then hidden:
- **Pre-launch** (`now < STARTS_AT_MS`) → "Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu."
- **Launch day** (`STARTS_AT_MS <= now < BANNER_ENDS_AT_MS`) → "Walk-ins welcome **today from 1pm** — turn up between 1pm-6pm or book ahead"
- **After launch** (`now >= BANNER_ENDS_AT_MS`) → **hidden entirely**. Page reverts to its non-banner state until a replacement is designed.

**Cache safety:**
- Server-side conditional renders the right variant at build/revalidate time
- Small `'use client'` child re-checks state on mount and on `setInterval(60_000)` so cached pages flip without a hard reload
- For pages with `revalidate = 24h` (homepage, etc.): drop revalidate to 3600 for the launch fortnight (10–22 May 2026); revert after

### 7.7 `/sunday-lunch` canonical
Use absolute path `canonical: '/sunday-lunch'`.

### 7.8 `mothers_day` plumbing removal
Mother's Day 2026 (15 March 2026) is past. Phase 1 removes the entire `mothers_day` query-param plumbing and the force-Sunday-lunch coupling in `ManagementTableBookingForm`. `lib/mothers-day-booking.ts` deleted if isolated.

### 7.9 AI agent endpoint
Refactored, not deleted. Deletion only after logs prove zero use.

### 7.10 Migration discipline
The management app uses additive migrations with `CREATE OR REPLACE FUNCTION`. **Do not edit existing migration files.**

**Migration ordering — critical:** the new RPC patches MUST be timestamped after the latest existing migration that touches the function being patched. Planning must check `supabase/migrations/` for the latest patch to `create_table_booking_v05` and `create_table_booking_v05_core`, and timestamp the new migrations after those. A clean DB rebuild applies migrations in timestamp order; an out-of-order new migration could be silently overwritten by an earlier one rebuilt later.

**Do not paste pseudocode.** §8.4 below shows the *intent* of the RPC patches. Implementation must:
1. Read the current full body of the function from the latest migration that defined it (whichever `CREATE OR REPLACE FUNCTION` is most recent in the migrations directory)
2. Copy that body verbatim
3. Apply the minimal threshold/cutoff edits described in §8.4
4. Preserve every other piece of logic — `p_deposit_waived`, capacity checks, table assignment, hold expiry, audit logging, error returns
5. Re-test against the full function spec, not against the pseudocode in this spec

### 7.11 Rollback expectations
Migrations are additive (column + RPC patches via `CREATE OR REPLACE`). Reversible by further `CREATE OR REPLACE` calls back to prior bodies plus `ALTER TABLE ... DROP COLUMN` if needed. Code rollbacks are independent.

### 7.12 Honest walk-in capacity language
`/availability` does not currently subtract walk-ins. Customer-facing copy is honest about this. Solving it is a management-app feature out of Phase 1 scope.

## 8. Phase 1 — Launch readiness (deploy 11–15 May 2026)

### 8.1 Website code refactors — live booking path

**`components/features/TableBooking/ManagementTableBookingForm.tsx`:**
- Remove imports of `getSundayLunchCutoffDate`, `hasSundayLunchCutoffPassed`, `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP`, `getSundayLunchDepositAmount`, Mother's Day helpers
- Remove `sundayLunch` and `mothersDay` from the `prefill` interface
- Remove `sundayLunchCutoffPassed` computation
- Remove "Sunday lunch deposit mandatory" branch
- Replace `partySize >= 7` deposit gate with `requiresDeposit(partySize)`
- Remove the Sunday plans selector UI; remove Mother's Day pre-orders messaging; remove "Sunday lunch pre-orders close" message; remove "pre-order now" CTA
- Replace "groups of 7 or more" copy with "groups of 10 or more"
- Replace deposit explanation copy with the warm, generic version
- Add courteous no-show messaging on the review/confirm step
- **PayPal failure recovery (per §6 / OQ14):** when the inline PayPal initialisation fails for a 10+ booking, surface a clear "call us on 01753 682707, or check your messages — we've sent you a payment link" state. The booking remains in `pending_payment` and the management API delivers an SMS deposit link via the fallback path (see §8.3 — `skip_customer_sms` set to `false` for failed-inline-PayPal cases)

**`app/api/table-bookings/route.ts` (proxy):**
- Remove imports of `getSundayLunchCutoffDate`, `hasSundayLunchCutoffPassed`, `isSundayIsoDate`
- In `normaliseIncomingPayload`: stop deriving `sundayLunch`; explicitly drop `sunday_lunch` from the output payload
- **Defence-in-depth: also drop/ignore inbound `booking_type` from public payloads.** Always set `booking_type='regular'` on the forwarded request — never trust a public client to assert booking type.
- Remove the entire "Enforce Sunday lunch pre-order cutoff" block
- Always pass `bookingType: 'regular'` to `resolveServiceRanges`
- Use payload `purpose` directly (no Sunday-lunch override)
- Strip `sunday_preorder_items` and `menu_selections` from any forwarded payload
- Remove `buildSundayPreorderItems` and `buildMenuSelectionFallbackNote` helpers

**`app/api/booking/submit/route.ts`:**
- Confirm reachability during planning (§11 OQ2). If reachable: refactor (remove Sunday derivation, replace `partySize >= 7` with `requiresDeposit`). If unreachable: delete.

**`app/api/booking/agent/route.ts`:**
- Replace `bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular')` with `bookingType: BookingType = 'regular'`
- Remove `purpose` Sunday-lunch override
- Remove special-instructions block referencing "1pm Saturday" / "7+"; replace with deposit messaging only when `partySize >= 10`
- Same on the GET handler

**`app/api/table-bookings/availability/route.ts`:**
- Accept `booking_type='sunday_lunch'` for backwards compatibility but treat as `'regular'`
- Remove `purpose` Sunday-lunch override
- Remove the "also resolve sunday_lunch ranges" block; drop `sunday_lunch_available` from response

**`lib/table-booking-service-windows.ts`:**
- Type definitions retained for legacy compatibility
- Sunday-lunch branch in `resolveServiceRanges` becomes unreachable from website code; left in place

**`lib/sunday-lunch-cutoff.ts`:** delete after all imports removed

**`lib/constants.ts` — website-side helpers only:**
- Rename `SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP` → `LARGE_GROUP_DEPOSIT_PER_PERSON_GBP` (still 10)
- Replace `getSundayLunchDepositAmount(partySize)` with `computeLargeGroupDepositAmount(partySize)` returning `partySize >= 10 ? partySize * 10 : 0`
- Add `requiresDeposit(partySize): boolean`
- **Do NOT add a website-side `getCanonicalDeposit` helper.** The website has no DB; it trusts the management API's response after booking creation. The full state-aware helper lives only in the management app (§7.3).
- Replace `SUNDAY_LUNCH_DEPOSIT_POLICY_COPY` with `LARGE_GROUP_DEPOSIT_POLICY_COPY`
- Remove `SUNDAY_ROAST` copy constants that mention "pre-order" or "1pm Saturday"
- Add `WALK_IN_LAUNCH_STARTS_AT_MS` and `WALK_IN_LAUNCH_DAY_ENDS_AT_MS`

**`lib/mothers-day-booking.ts`:** delete if isolated (per OQ10)

### 8.2 Website content sweep

Known files (must touch):

| File | Lines | Issue |
|---|---|---|
| `app/book-table/page.tsx` | 230, 308, 362, 417, 421 | "groups of 7+", "must be pre-ordered", "Pre-order by Saturday 1pm", "pre-payment to confirm" |
| `app/easter/page.tsx` | 34, 39, 46, 65, 96, 166, 208, 341 | various "Saturday 1pm", "£10 per person", "pre-order" |
| `app/feltham-pub/page.tsx` | 171, 294 | "pre-order by 1pm Saturday" + "£10 per person" |
| `app/stanwell-pub/page.tsx` | 263 | "must be ordered by 1pm Saturday" |
| `app/sunday-lunch/page.tsx` | 21, 24, 29, 289, 293, 319, 387, 395, 400, 457, 600, 725 | 12 occurrences — major rewrite per §8.6 |
| `app/fathers-day/page.tsx` | 60, 161, 188, 329 | "Saturday 1pm" + "£10 per person" |
| `public/llms.txt` | 41 | "pre-order by 1pm Saturday, £10/person" |

**Planning-time grep across both repos** (with Sunday-context patterns; allowlist Christmas/private events):
- Sunday-pre-order/deposit/cutoff patterns: `1pm Saturday`, `Saturday 1pm`, `Saturday 13:00`, `groups of 7`, `7 or more`, `partySize >= 7`, `party_size >= 7`, `Sunday lunch deposit`, `must be pre-ordered`, `pre-payment to confirm`, `must pre-order`, `pre-order by` (filtered for Sunday context)
- Sunday-hours patterns (since hours are changing 12pm-5pm → 1pm-6pm): `12pm to 5pm`, `12pm-5pm`, `12 noon`, `noon to 5`, `noon to 5pm`, `last orders 4:30`, `until 5pm Sunday`, `Sunday 12-5`, `Sunday until 5`, `Sunday from 12`, `12:00 - 17:00`, `12:00 to 17:00` (filtered for Sunday context)
- Pages to enumerate during planning: `app/staines-pub/page.tsx`, `app/music-bingo/page.tsx`, hotel/pub/location pages, blog posts under `content/blog/`
- Schema.org JSON-LD blocks across affected pages
- Internal docs: `docs/copy-assumptions.md`, architecture docs, SSOT docs, analytics docs — update or mark historical

**Allowlist (legitimate non-Sunday "pre-order" usage — do not edit):** Christmas pre-order pages, private events / private hire pre-order language, any non-Sunday-roast / non-Saturday-cutoff context.

**Acceptance criterion (narrowed):** No customer-visible copy combines (Sunday OR Sunday-lunch OR Sunday-roast) with (pre-order OR Saturday cutoff OR "groups of 7" / "7 or more" / "deposit required for ... Sunday").

### 8.3 Management app code refactors

**Centralised deposit module** — `src/lib/table-bookings/deposit.ts`:
- `requiresDeposit(partySize, { depositWaived? }): boolean` — `partySize >= 10 && !depositWaived`
- `computeDepositAmount(partySize): number` — `partySize >= 10 ? partySize * 10 : 0`
- `getCanonicalDeposit(booking, partySize?): number` — state-aware per §7.3
- `lockDepositAmount(bookingId, amount, txn): Promise<void>` — utility that writes `deposit_amount_locked`; used by capture/webhook/manual-confirmation paths

Every caller below routes through this module.

**`src/app/api/table-bookings/route.ts`:**
- Stop passing `p_sunday_lunch=true` for new public bookings (line ~247) — pass `false` always for `purpose='food'|'drinks'`
- Remove conditional persistence of `sunday_preorder_items` based on `payload.sunday_lunch === true` (lines ~307-326)
- **Replace blind `party_size * 10` recompute in response payload (line ~478)** with `getCanonicalDeposit(booking, party_size)`
- **Replace blind recompute in analytics block (line ~536)** likewise
- Apply `requiresDeposit` for the deposit-required decision

**`src/lib/table-bookings/bookings.ts`:**
- Lines ~491, 708, ~733 — all use `getCanonicalDeposit`

**`src/app/api/foh/bookings/route.ts`:**
- Replace `effectiveSundayLunch || party_size >= 7` (~1052) with `requiresDeposit(party_size, { depositWaived })`

**`src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts`:**
- Replace `sunday_lunch || party_size >= 7` checks (~230, ~427) with `requiresDeposit`

**`src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx`:**
- Keep Sunday-lunch checkbox at ~397 for legacy admin creation; relabel "Legacy Sunday lunch (admin)" and disable by default
- Replace "Sunday lunch and bookings of 7+" copy at ~647 with "Bookings of 10 or more"

**`src/app/(authenticated)/table-bookings/foh/components/FohTimeline.tsx`:**
- Audit Sunday-lunch labels; relabel customer-impacting surfaces to "Food bookings"

**`src/app/api/boh/table-bookings/[id]/party-size/route.ts`:**
- Replace `DEPOSIT_THRESHOLD = 7` (line 104) with `requiresDeposit`
- When recomputing deposit on party-size change: read `getCanonicalDeposit` first; never overwrite a locked amount
- The customer SMS deposit-link path uses canonical amount

**`src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts`:**
- Stop blindly recomputing `depositAmount = booking.party_size * 10` (line 62)
- Use `getCanonicalDeposit(booking, party_size)`
- Do not overwrite `deposit_amount` on the booking from this route

**`src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts` — NOT VERIFY-ONLY:**
- Already correctly selects `booking_type` (not `sunday_lunch`); confirm
- **CHANGE: on successful capture, the route MUST update `deposit_amount_locked` with the amount actually captured by PayPal.** Today the route updates `payment_status`, `paypal_deposit_capture_id`, etc. (around line 84) — extend the `UPDATE table_bookings` to also set `deposit_amount_locked` to the **captured amount from the PayPal capture API response** (authoritative — what actually left the customer's account). **Do NOT use the booking row's existing `deposit_amount` as the source** — it could have drifted from the actual charge.
- **Missing-amount fallback rule:** if `capturePayPalPayment()` returns successfully but the response does NOT include a captured amount (malformed response, partial success, library bug), the route MUST **fail closed**: do not update `payment_status`; log a high-severity error with the booking ID and the raw PayPal response; alert via the existing error monitoring; return a 502 to the caller so the customer sees an explicit "we couldn't confirm your payment, please call us" state. Do NOT silently fall back to `booking.deposit_amount` — that's how stale amounts get locked.
- The same fail-closed rule applies to Stripe webhook completion (use the Stripe event's captured amount; if missing, fail closed and alert) and cash/manual deposit confirmation (use the staff-entered confirmed amount; staff cannot save without entering it).
- This is what makes "honour existing paid bookings" actually work for new payments captured during/after the migration.
- **Update existing PayPal capture tests** (the management repo already has coverage at `tests/api/` — check before adding new files; extend the existing tests with assertions that `booking_type` is selected and `deposit_amount_locked` is written, plus a fail-closed test for missing-amount responses). Only add a new test file if no existing coverage is found.

**Stripe webhook / checkout completion paths:**
- On successful payment events, write `deposit_amount_locked` via the same `lockDepositAmount` utility

**Cash / manual deposit confirmation (admin path):**
- When staff confirm a manual deposit, write `deposit_amount_locked`

**Token-payment magic-link page** (`src/app/g/[token]/table-payment/...`):
- Read canonical amount via helper
- On successful payment, write `deposit_amount_locked`

**Admin views:**
- `PreorderTab.tsx` — preserve display for legacy bookings (parse from `special_requirements` for public-API legacy bookings)
- List views — add "Legacy Sunday Lunch" badge for `booking_type='sunday_lunch'`
- Kitchen-report components — relabel "Sunday lunch covers" → "Food covers"

**Service window:**
- `src/services/business-hours.ts` — **CHANGE Sunday hours from 12pm-5pm to 1pm-6pm**. This is a **data operation** as well as a code update:
  - Update the Sunday row in the `business_hours` table: set `kitchen_opens = '13:00'` and `kitchen_closes = '18:00'`
  - Update any `schedule_config` entries for Sunday: `starts_at = '13:00'`, `ends_at = '18:00'`, `booking_type = 'food'`, capacity per current setting
  - If the management app has an admin UI for business hours, update via that UI (audit-logged) rather than a raw SQL UPDATE
  - **Post-deploy verification query:** `SELECT day_of_week, kitchen_opens, kitchen_closes, schedule_config FROM business_hours WHERE day_of_week = 'Sunday'` — must return `13:00 / 18:00` and a Sunday `schedule_config` entry with the new times. Acceptance criterion includes this verification.
  - Last bookable arrival is 17:30 (slot logic, separate from kitchen close)
- `src/app/api/business/hours/route.ts` — verify

### 8.4 Management app database migrations

Three migrations, in order. Use `CREATE OR REPLACE FUNCTION` for RPC patches. **Timestamp each new migration after the latest existing migration that touches the function being patched** (per §7.10).

**Migration A — add deposit lock column + paid-booking backfill + legacy unpaid-pending conversion:**

```sql
-- supabase/migrations/<timestamp_after_latest>_add_deposit_amount_locked.sql

ALTER TABLE public.table_bookings
  ADD COLUMN IF NOT EXISTS deposit_amount_locked numeric NULL;

-- STEP 1 (legacy unpaid pending conversion, per OQ14a resolution):
-- For legacy sunday_lunch bookings that have not captured a payment AND whose
-- service date is in the future, convert them to regular bookings under the new
-- rules. Pre-order data on the row is preserved (in table_booking_items /
-- special_requirements) but is no longer kitchen-enforced.
--
-- IMPORTANT — only touch FUTURE bookings. Historical abandoned/past pending_payment
-- rows must not be rewritten (would pollute reporting and historical state).
--
-- IMPORTANT — staff review list MUST be generated and signed off before this UPDATE
-- runs (see "Pre-conversion review" below).
--
-- Below 10: drop pending_payment status (becomes confirmed); deposit no longer required.
-- 10+: keep pending_payment (deposit still required under new rules); deposit_amount stays.

UPDATE public.table_bookings tb
SET
  booking_type = 'regular',
  status = CASE WHEN tb.party_size >= 10 THEN tb.status ELSE 'confirmed' END,
  deposit_amount = CASE WHEN tb.party_size >= 10 THEN tb.deposit_amount ELSE NULL END
WHERE tb.booking_type = 'sunday_lunch'
  AND tb.status = 'pending_payment'
  AND tb.start_datetime >= NOW()  -- ONLY future-dated bookings
  AND NOT EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.table_booking_id = tb.id
      AND p.charge_type = 'table_deposit'
      AND p.status IN (<verified-paid-status-values>)
  )
  AND tb.paypal_deposit_capture_id IS NULL
  AND COALESCE(tb.payment_status::text, '') <> 'completed';  -- NULL-safe

-- Pre-conversion review (run BEFORE Step 1 in a transaction-aborted dry run, OR
-- run as a SELECT before the UPDATE statement above. Output is a staff review list
-- that the owner must sign off before the UPDATE runs):
--
-- SELECT id, booking_reference, customer_id, party_size, start_datetime,
--        deposit_amount, payment_status, paypal_deposit_capture_id, special_requirements
-- FROM public.table_bookings tb
-- WHERE tb.booking_type = 'sunday_lunch'
--   AND tb.status = 'pending_payment'
--   AND tb.start_datetime >= NOW()
--   AND NOT EXISTS (
--     SELECT 1 FROM public.payments p
--     WHERE p.table_booking_id = tb.id
--       AND p.charge_type = 'table_deposit'
--       AND p.status IN (<verified-paid-status-values>)
--   )
--   AND tb.paypal_deposit_capture_id IS NULL
--   AND COALESCE(tb.payment_status::text, '') <> 'completed'
-- ORDER BY tb.start_datetime;
--
-- Reviewer signs off the list (high-value or surprising-looking bookings flagged for
-- a phone call before conversion). Then the UPDATE runs.

-- STEP 2 (deposit_amount_locked backfill for paid bookings):

-- Backfill paid bookings with the most reliable amount available.
-- Criteria — "this booking has actually been paid for":
--   table_bookings.payment_status = 'completed' OR
--   table_bookings.paypal_deposit_capture_id IS NOT NULL OR
--   a payments row exists with charge_type='table_deposit' and a paid status
--   (planning must verify the exact paid-status enum values — codebase mixes
--    'succeeded', 'completed', 'captured'; use the verified values here).
--
-- Lock value priority:
--   1. payments.amount from the most recent paid table_deposit payment
--   2. table_bookings.deposit_amount
--   3. NULL (skip — flag for staff review; rare)

WITH paid_payments AS (
  SELECT DISTINCT ON (p.table_booking_id)
    p.table_booking_id,
    p.amount
  FROM public.payments p
  WHERE p.charge_type = 'table_deposit'
    AND p.status IN (<verified-paid-status-values>)  -- planning to fill
  ORDER BY p.table_booking_id, p.created_at DESC
)
UPDATE public.table_bookings tb
SET deposit_amount_locked = COALESCE(
  (SELECT amount FROM paid_payments pp WHERE pp.table_booking_id = tb.id),
  tb.deposit_amount
)
WHERE tb.deposit_amount_locked IS NULL
  AND (
    COALESCE(tb.payment_status::text, '') = 'completed'
    OR tb.paypal_deposit_capture_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM paid_payments pp WHERE pp.table_booking_id = tb.id)
  )
  AND COALESCE(
    (SELECT amount FROM paid_payments pp WHERE pp.table_booking_id = tb.id),
    tb.deposit_amount
  ) IS NOT NULL;

-- STEP 3 (post-migration verification report):
-- Any booking with paid evidence but deposit_amount_locked still NULL — should be zero.
-- If non-zero, manual review and resolution required BEFORE launch banner activates.
-- Acceptance criterion (§8.10): zero rows here, OR a written sign-off from the owner
-- explicitly listing the rows and the reason they remain unlocked.

SELECT id, booking_reference, party_size, start_datetime, payment_status,
       paypal_deposit_capture_id, deposit_amount, deposit_amount_locked
FROM public.table_bookings tb
WHERE tb.deposit_amount_locked IS NULL
  AND (
    COALESCE(tb.payment_status::text, '') = 'completed'
    OR tb.paypal_deposit_capture_id IS NOT NULL
    OR EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.table_booking_id = tb.id
        AND p.charge_type = 'table_deposit'
        AND p.status IN (<verified-paid-status-values>)
    )
  );
```

**Migration B — patch `create_table_booking_v05`:**

> ⚠️ **Implementation warning:** the snippet below is illustrative only. **Do not paste it.** Read the current full body of `create_table_booking_v05` from the latest migration that defined it (the most recent `CREATE OR REPLACE FUNCTION` in `supabase/migrations/`). Copy that full body verbatim. Apply only these minimal edits, preserving every other piece of logic (capacity, waiver, table assignment, hold expiry, audit logging, error returns):

```text
1. Skip sunday_preorder_cutoff_at calculation when p_sunday_lunch is false:
     IF p_sunday_lunch THEN
       v_sunday_preorder_cutoff_at := <existing Saturday-13:00 calc>;
     ELSE
       v_sunday_preorder_cutoff_at := NULL;
     END IF;

2. Replace the pending_payment / deposit-required decision (currently around line 380:
   "sunday_lunch OR party_size BETWEEN 7 AND 20") with:

     IF p_party_size >= 10 AND NOT COALESCE(p_deposit_waived, false) THEN
       <existing pending_payment branch>
     ELSE
       <existing confirmed branch>
     END IF;

   This preserves the existing p_deposit_waived semantics. Do NOT collapse the rule
   to a bare "p_party_size >= 10".

3. The deposit_amount calculation (party_size * 10, lines 408-409) is unchanged.
   That's a value computation; whether it's actually charged is governed by step 2.
```

**Migration C — patch `create_table_booking_v05_core`:**

Same pattern as Migration B. The current 7+ rule lives at line ~63 of `20260509000013_fix_core_remove_card_capture_refs.sql`. Replace with `party_size >= 10 AND NOT COALESCE(p_deposit_waived, false)`. Same warning: read the current full body and apply minimal edits. Preserve every other piece of logic.

**No enum changes.** `table_booking_type` stays `'regular' | 'sunday_lunch'`.

### 8.5 LaunchAnnouncement component

`components/announcements/LaunchAnnouncement.tsx` — server component shell that renders ONE of two copy variants based on `Date.now()` vs `WALK_IN_LAUNCH_STARTS_AT_MS` and `WALK_IN_LAUNCH_BANNER_ENDS_AT_MS`, OR renders nothing once `Date.now() >= WALK_IN_LAUNCH_BANNER_ENDS_AT_MS`. Includes a `'use client'` child that re-checks state on mount and on `setInterval(60_000)` so cached pages flip / hide without a hard reload. Variants: `hero`, `banner`, `slim`.

Per-page caching: drop revalidate to 3600 for the period from deploy through 18 May 2026 on `app/page.tsx`, `app/book-table/page.tsx`, `app/sunday-lunch/page.tsx`. Revert after launch as a follow-up commit.

### 8.6 Sunday lunch landing page rewrite (and seasonal-page template)

Page stays at `/sunday-lunch`. Content folds in `/keyword-plan` output (D1).

Structure: hero (5★ review quote + walk-in messaging + CTA to `/book-table`); "What's on the plate" (menu section, since the user wants the menu on this page); "How Sundays work" (date-aware copy — see below); "From the kitchen"; curated review testimonials per §15 (without relative dates); refreshed FAQ; single CTA → `/book-table`. Canonical: `/sunday-lunch`. JSON-LD refreshed.

**Date-aware body copy convention** (applies to every Sunday-touching page, not just `/sunday-lunch`):
- **Pre-launch** (`now < WALK_IN_LAUNCH_STARTS_AT_MS`): future tense — *"From 17 May 2026, walk-ins are welcome on Sundays 1pm-6pm — no pre-order needed. Until then, our kitchen is open on Sundays with our weekday menu."*
- **Post-launch** (`now >= WALK_IN_LAUNCH_STARTS_AT_MS`): present tense — *"Walk-ins welcome on Sundays 1pm-6pm. Booking still recommended for groups."*

The page swaps automatically on 17 May based on `Date.now()`; same caching strategy as `<LaunchAnnouncement>` (server conditional + client re-check + revalidate=3600 during the launch fortnight).

**Seasonal pages — same template, same convention:**
- `/easter` — rewrite using the new model (Easter 2026 is past; the page persists for 2027 and rolling SEO)
- `/mothers-day` — rewrite using the new model (Mother's Day 2026 is past; same persistence rationale)
- `/fathers-day` — rewrite using the new model. Father's Day 2026 (Sunday 21 June) is the **next live seasonal event** and must reflect the new walk-in model fully by deploy.

Each seasonal page layers its event-specific keyword cluster (per the keyword plan) on top of the standard Sunday-walk-in template. CTAs always go to `/book-table`. No on-page booking forms. No pre-order requirement copy.

### 8.7 Walk-in messaging placement

| Location | Pre-launch (deploy → 17 May 00:00 BST) | Launch day (17 May 00:00 → 17 May 18:00 BST) | After 18:00 BST on 17 May |
|---|---|---|---|
| Homepage hero | "Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu." | "Walk-ins welcome **today from 1pm** — turn up between 1pm-6pm or book ahead" | **Hidden entirely** — hero reverts to current state until replacement is designed |
| `/book-table` banner | "Sunday lunch walk-ins start 17 May, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu." | "Walk-ins welcome **today from 1pm**, 1pm-6pm" | **Hidden** |
| `/sunday-lunch` prominent | "Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu." | "Walk-ins welcome **today from 1pm**, 1pm-6pm" | **Hidden** |
| Footer slim | (omit pre-launch) | "Walk-ins welcome today from 1pm" | **Hidden** |

All variants delivered by `<LaunchAnnouncement>` based on date constants. After 17:30 BST on 17 May 2026, the component renders nothing on every surface.

**Honest copy on capacity:** booking page note says "Walk-ins are welcome on Sundays 1-6pm. We can't always reflect already-seated walk-ins in our online availability — if a slot looks busy, give us a ring on 01753 682707 and we'll find a way."

### 8.8 Wizard cleanup (non-critical track — deletes only)

Delete after verifying zero imports:
- `lib/sunday-lunch-cutoff.ts`
- All `components/features/BookingWizard/*` files
- `components/features/TableBooking/SundayLunchBookingForm.tsx`
- `components/features/TableBooking/SundayLunchBookingSection.tsx` (or replace with content section if used)
- `components/features/TableBooking/SundayLunchBooking.tsx` (verify unused)
- `app/book-table/page-old.tsx`
- `app/sunday-lunch/page.tsx.backup`
- `app/api/booking/submit/route.ts` (only after confirming unreachable per OQ2)
- `app/api/table-bookings/menu/sunday-lunch/route.ts` (assess)

`/api/booking/agent` is **not** deleted — refactored per §8.1.

### 8.9 Coordinated deploy plan

**Order:**

1. **Management app — DB migrations** (zero-downtime; additive only): Migrations A/B/C from §8.4
2. **Management app — code deploy:** centralised deposit module; capture-order writes `deposit_amount_locked`; Stripe / cash-confirmation paths likewise; updated FOH UI; tolerates legacy and new payloads
3. **Verify in management staging + smoke test in prod:** legacy paid bookings render with locked amounts; party-size edits don't overwrite locks; new bookings via management UI work; new threshold takes effect in RPC-driven flows
4. **Website code deploy:** stops sending `sunday_lunch=true`; strips inbound `booking_type`; removes Saturday cutoff; ships `<LaunchAnnouncement>`; site-wide copy sweep
5. **End-to-end verify in prod:**
   - Sunday food party 9 → no deposit
   - Sunday food party 10 → deposit; PayPal flow completes; `deposit_amount` AND `deposit_amount_locked` set to £100
   - Weekday food party 10 → deposit
   - Drinks party 10 → deposit
   - Edit a legacy `sunday_lunch` booking's party size → locked amount preserved
   - PayPal inline failure → customer sees call-us state; SMS link delivered; resume via token-payment page
   - Existing legacy SMS payment link / token URL → either charges locked legacy amount or fails with clear staff-recovery state (per §8.10)
   - AI agent endpoint returns no Sunday-specific copy
   - Token-payment / Stripe / SMS deposit-link paths charge canonical amount
6. **Launch banner:** auto-controlled by date constants

**Coordination window:**
- Management app ships ≥ 24h before website (≥ 48h ideal)
- Deploy as soon as implementation is ready — no artificial 11-15 May gate
- Pre-launch banner explains the 3 May / 10 May Sunday menu transition publicly
- Kitchen briefed (operational, off-spec) to serve weekday menu on 3/10 May for new post-deploy bookings while honouring legacy pre-orders
- Quiet-period deploy preferred

**Rollback:** independent code rollbacks. DB migrations additive (column + RPC patches) — reversible by further `CREATE OR REPLACE` calls and `DROP COLUMN`.

### 8.10 Phase 1 acceptance criteria

#### Code & data
- [ ] All existing tests pass; new tests added per §8.11
- [ ] No `sunday_lunch` references on the live customer path (form, proxy, agent, availability, submit). Legacy admin/management retains references; documented in test allowlist.
- [ ] No customer-visible copy combines (Sunday OR Sunday-lunch OR Sunday-roast) with (pre-order OR Saturday cutoff OR "groups of 7" / "7 or more" / "deposit required for ... Sunday"). Christmas / private-event allowlisted.
- [ ] `app/book-table/page.tsx` FAQ deposit threshold reads "10 or more"
- [ ] All deposit-recomputation paths use `getCanonicalDeposit(booking, partySize)` from the centralised helper
- [ ] PayPal capture-order, Stripe webhook completion, cash/manual deposit confirmation each WRITE `deposit_amount_locked` on success
- [ ] RPCs `create_table_booking_v05` AND `create_table_booking_v05_core` use `party_size >= 10 AND NOT p_deposit_waived` for the `pending_payment` decision; every other piece of RPC logic preserved (verified by reading the new function bodies, not just the threshold)
- [ ] New migrations are timestamped after the latest existing migration that touches the function being patched
- [ ] `deposit_amount_locked` is set on backfill for every booking with `payment_status='completed'`, `paypal_deposit_capture_id IS NOT NULL`, or a paid `payments` row; party-size edits never overwrite a locked amount
- [ ] No `mothers_day` query-param plumbing remains; force-Sunday-lunch coupling removed
- [ ] Public proxy strips inbound `booking_type` AND `sunday_lunch` from website payloads; always forwards `booking_type='regular'`
- [ ] Sunday `business_hours` row in management DB has `kitchen_opens='13:00'` and `kitchen_closes='18:00'`; `schedule_config` for Sunday updated to `starts_at='13:00'` / `ends_at='18:00'`; `/business/hours` API returns new window for Sundays — verified by post-deploy query
- [ ] Migration A pre-conversion review list signed off by Peter before STEP 1 UPDATE runs
- [ ] Migration A post-migration verification (STEP 3 query) returns zero rows OR Peter has signed off written explanations for any remaining rows
- [ ] No customer-visible "12pm-5pm" / "12 noon" / "noon to 5" / "until 5pm" / "last orders 4:30" Sunday-roast hours remain anywhere on the site
- [ ] Date-aware body copy on `/sunday-lunch`, `/easter`, `/mothers-day`, `/fathers-day` flips from future-tense to present-tense at `WALK_IN_LAUNCH_STARTS_AT_MS`

#### End-to-end customer journeys
- [ ] **Sunday food, party 9:** booking succeeds via `/book-table`. No Sunday plans selector. No pre-order step. No deposit. Booking row has `booking_type='regular'`.
- [ ] **Sunday food, party 10:** booking succeeds. Deposit panel renders. PayPal flow completes. Stored `deposit_amount` = £100; `deposit_amount_locked` = £100.
- [ ] **Weekday food, party 10:** booking succeeds with deposit.
- [ ] **Drinks, party 10:** booking succeeds with deposit.
- [ ] **Drinks, party 8:** no deposit.
- [ ] **`/book-table?sunday_lunch=true`:** silently ignored.
- [ ] **`/book-table?purpose=sunday_lunch`:** rejected at parse time.
- [ ] **`/book-table?mothers_day=true`:** ignored.
- [ ] **Hostile payload:** `POST /api/table-bookings` body `{ purpose: 'food', sunday_lunch: true, booking_type: 'sunday_lunch', sunday_preorder_items: [...] }` creates a normal `food` booking with `booking_type='regular'`, no pre-order persisted, no deposit unless party >= 10.
- [ ] **PayPal inline failure:** customer sees recovery state, receives SMS deposit link, can complete payment via token-payment page.

#### Management & legacy
- [ ] Public `POST /api/table-bookings` ignores `sunday_lunch=true` and `booking_type='sunday_lunch'` from website payloads
- [ ] FOH staff can still create a legacy Sunday-lunch booking via the admin modal if explicitly enabled (legacy badge visible)
- [ ] Legacy `sunday_lunch` bookings display in admin views; pre-order tab still works
- [ ] Legacy bookings being edited preserve their `deposit_amount_locked`
- [ ] **Legacy SMS / token payment links work:** for an existing legacy booking with an outstanding pending payment URL/SMS link issued before deploy, opening the link after deploy either (a) charges the legacy locked amount and completes the booking, or (b) fails with a clear "this link has expired — call us on 01753 682707" state. Random bookings should not silently re-price.

#### Caching / banners
- [ ] `<LaunchAnnouncement>` shows pre-launch copy on 16 May 23:59:59 BST; switches to launch-day "today from 1pm" copy at 17 May 00:00:00 BST; **hides entirely from 17 May 18:00:00 BST onwards** (matches end of walk-in service window). Verified across `/`, `/book-table`, `/sunday-lunch`, footer.
- [ ] Pages with `revalidate = 24h` correctly flip the banner copy at the cutover (verified by either short-revalidate window or client-side flip)

#### Walk-in / availability
- [ ] Sunday `/availability` returns slots between 1pm and the agreed last-bookable arrival time (per OQ13)
- [ ] Customer-facing copy is honest about online availability not subtracting already-seated walk-ins

#### SEO
- [ ] `/sunday-lunch` canonical = `/sunday-lunch` (absolute path)
- [ ] Sitemap and JSON-LD reviewed for stale Sunday-lunch claims
- [ ] No 404s introduced from deleted paths

#### Analytics
- [ ] Pre-deploy: documented surviving-event contract per OQ15 (which events continue, which renamed, which removed)
- [ ] Post-deploy: surviving events fire correctly through new flow

#### Success measurement
- Sunday booking count vs. baseline tracked separately by the owner. Not in this spec's acceptance criteria — operational concern handled outside the implementation deliverables.

#### Accessibility
- [ ] Lighthouse mobile score for `/book-table` ≥ today's baseline
- [ ] Manual smoke test on iPhone Safari, Pixel Chrome, desktop Chrome, desktop Safari

### 8.11 Phase 1 tests

#### Website (Jest)
- New: `lib/__tests__/large-group-deposit.test.ts` — `requiresDeposit`, `computeLargeGroupDepositAmount` across boundaries
- New: `app/api/table-bookings/__tests__/route.test.ts` — cutoff removed; hostile `sunday_lunch=true` and `booking_type='sunday_lunch'` payloads silently dropped; `booking_type='regular'` always forwarded
- New: `app/api/booking/agent/__tests__/route.test.ts` — `bookingType='regular'` for Sunday inputs; no Sunday-specific copy
- New: `components/announcements/__tests__/LaunchAnnouncement.test.tsx` — three copy variants at boundaries `STARTS_AT_MS` and `DAY_ENDS_AT_MS`
- Update: `components/features/TableBooking/__tests__/PayPalDepositSection.test.tsx` for generic deposit copy
- New: ManagementTableBookingForm test for PayPal-failure recovery state

#### Management app (Jest/Vitest)
- New: `tests/lib/table-bookings/deposit.test.ts` — `requiresDeposit`, `getCanonicalDeposit` with locked-amount precedence, payment-state precedence, and `p_deposit_waived` interplay
- New: `tests/api/paypalCreateOrderTableBooking.test.ts` — canonical-amount precedence; never overwrites locked
- New: `tests/api/paypalCaptureOrderTableBooking.test.ts` — selects `booking_type` (not `sunday_lunch`); WRITES `deposit_amount_locked` on success
- New: Stripe webhook test — writes `deposit_amount_locked` on completion
- New: Cash/manual deposit confirmation test — writes `deposit_amount_locked`
- New: `tests/db/legacy-deposit-lock.test.ts` (integration) — backfill correctness across all three criteria; party-size edit doesn't overwrite locked
- New: `tests/db/v05-rpc-threshold.test.ts` — pending_payment only at party_size >= 10 AND NOT p_deposit_waived; waiver continues to work
- New: `tests/db/v05-core-rpc-threshold.test.ts` — same for `_core`
- New: `tests/api/legacy-payment-link.test.ts` — existing token URL / SMS link charges locked legacy amount or fails cleanly
- Update: `tests/api/booking-submit-deposit.test.ts` — replace 7+ thresholds with 10+
- Update: `tests/lib/sundayPreorderMutationGuards.test.ts` — only legacy `booking_type='sunday_lunch'` triggers
- Update: `tests/lib/events/sundayLunchOnlyPolicy.test.ts` — only legacy

## 9. Phase 2 — Wizard replacement (target: late May / June)

### 9.1 Goals
- 2 visible steps (Reserve → Confirm & Pay)
- Mobile-first
- Conversion focused
- Confirmation email template
- Modify/cancel link from email

### 9.2 Discovery
Run a fresh discovery on `ManagementTableBookingForm.tsx` end-to-end on mobile + desktop; document UX issues, validation gaps, accessibility, conversion friction.

### 9.3 Phase 2 acceptance criteria
- [ ] `ManagementTableBookingForm.tsx` deleted; `/book-table` renders the new wizard
- [ ] Step count reduced from 4 to 2
- [ ] Time-to-book on mobile reduced from baseline measured in Phase 1 launch window (per OQ15)
- [ ] Confirmation email delivered for every successful booking
- [ ] Mobile usability tests pass on 320px-wide viewport

## 10. Risks

| ID | Risk | Mitigation |
|---|---|---|
| R1 | Management app deploy timing | Deploy management app first; tolerate legacy and new payloads |
| R2 | Legacy booking edit silently re-charges customer | `deposit_amount_locked` written at every capture path AND backfilled with broad criteria; every recompute reads via `getCanonicalDeposit` |
| R3 | Sunday landing page copy depends on `/keyword-plan` output | Spec captures structural changes; copy folded in after `/keyword-plan` runs |
| R4 | SEO regression from copy churn | Redirect/canonical/sitemap audit pre-launch; monitor GSC for four weeks post-17 May |
| R5 | Walk-in vs booking capacity — `/availability` does not subtract walk-ins | Customer copy honest; staff manage manually; flagged as management-app follow-on |
| R6 | Banner caching — pages with 24h revalidate may show stale copy | Drop revalidate to 3600 for launch fortnight; client-side flip; manual verification at cutovers |
| R7 | Hardcoded "Sunday lunch" / "1pm Saturday" / "7+" copy missed | Comprehensive grep with Sunday-context patterns; allowlist for Christmas/private events; manual review; sign-off grep |
| R8 | Mother's Day plumbing leaves a hidden lever | §7.8 removes entire `mothers_day` plumbing |
| R9 | AI agent endpoint spreads stale rules | §8.1 explicit refactor; no speculative deletion |
| R10 | Pending-payment hold expiry behaviour misalignment | OQ11 — confirm during planning |
| R11 | PayPal order setup failure leaves customer stranded | §6 + §8.1 + §8.9: clear call-us state AND management API SMS fallback link AND `skip_customer_sms=false` for failed cases |
| R12 | Token-payment / Stripe / SMS-deposit-link paths charge stale amounts | §8.3 routes every amount-touching surface through `getCanonicalDeposit` |
| R13 | RPC patches missing `_core` variant | §8.4 patches BOTH `v05` and `v05_core` |
| R14 | RPC patch references wrong parameter name | §7.10 + §8.4 explicitly use `p_sunday_lunch` |
| R15 | Analytics dashboards/funnels break after rename of `sunday_lunch_*` events | OQ15 — pre-deploy contract |
| R16 | Backfill misses paid bookings that don't have a `payments` row | §7.4 + §8.4 Migration A: criteria includes `payment_status='completed'` and `paypal_deposit_capture_id IS NOT NULL`, not just `payments` rows |
| R17 | New migration timestamped before an existing migration that touches the same function — overwritten on rebuild | §7.10 + §8.4 require timestamp after the latest existing patch |
| R18 | RPC patch regresses unrelated logic (capacity, waivers, table assignment) by being copy-pasted from spec pseudocode | §7.10 + §8.4 explicit "do not paste" warning; require reading the current full body and applying minimal edits |
| R19 | Capture-order doesn't write `deposit_amount_locked` — new captures don't get locked, only old bookings via backfill | §8.3 makes capture-order a real write path, not "verify only" |
| R20 | Legacy unpaid pending bookings (Sunday-lunch type, no payment yet) become orphaned at deploy | Resolved in §11 OQ14a as a confirmed business decision before implementation |
| R21 | Public payload spoofing — hostile/stale clients send `booking_type='sunday_lunch'` to bypass UI cleanup | §8.1 strips inbound `booking_type` at the proxy |
| R22 | Review quotes age badly with relative dates ("a week ago", "4 months ago") in public copy | §15 records names + content only; dates pulled live from Google or stored as absolute when used in copy |
| R23 | Launch-day copy ("Walk-ins now welcome") at 00:00 misleads — service starts at 1pm | §7.6 + §8.7: launch-day variant says "welcome **today from 1pm**" |

## 11. Open questions

| ID | Question | Resolution path |
|---|---|---|
| OQ1 | Final API contract for `POST /api/table-bookings` | Document in implementation plan after management-app review |
| OQ2 | Is `app/api/booking/submit/route.ts` reachable from anywhere outside the dead Booking Wizard? | Grep + production-traffic check during planning |
| OQ3 | Is `app/api/booking/agent/route.ts` actually used by an AI agent today? | Refactor either way per §7.9 |
| ~~OQ4~~ | **Resolved.** Banner removes itself at **18:00 BST on 17 May 2026** (`WALK_IN_LAUNCH_BANNER_ENDS_AT_MS`) — matches the end of the walk-in service window. Replacement content designed collaboratively post-launch. | — |
| ~~OQ5~~ | **Resolved.** Banner addition (not full hero swap); reverts to original hero at 18:00 BST on 17 May 2026. | — |
| OQ6 | Confirm advance booking limit constants in every layer | Audit during planning; align on 6 months |
| OQ7 | Does `/availability` need to subtract walk-ins? | Out of scope for Phase 1 |
| OQ8 | Walk-in `source` value | Confirmed `'walk-in'`; document in plan |
| ~~OQ9~~ | **Resolved.** `/sunday-lunch` keeps the menu as an on-page section. All booking CTAs from `/sunday-lunch` go to `/book-table`. No separate menu page. | — |
| OQ10 | `mothers_day` plumbing — confirm `lib/mothers-day-booking.ts` has no live caller | Grep during planning; delete if isolated |
| OQ11 | Pending-payment hold timeout — what does the customer see? | Document during planning; align UI countdown with `hold_expires_at` |
| OQ12 | `/availability` walk-in subtraction in Phase 2+? | Phase 2+ candidate |
| ~~OQ13~~ | **Resolved: 17:30 BST.** Service runs to 18:00. Last bookable arrival is 17:30. Acceptance criteria + `/availability` UI updated. | — |
| **OQ14** | **PayPal inline-failure recovery — RESOLVED.** | Resolved in §6 / §8.1 / §8.9: clear call-us state, `skip_customer_sms=false` for failed cases, management API returns SMS fallback token-payment link. No longer open. |
| ~~OQ14a~~ | **Resolved: convert to standard bookings, silent.** Legacy `sunday_lunch` rows with `status='pending_payment'` and no captured payment are converted in the migration (Migration A, Step 1): `booking_type='regular'`; party<10 → `status='confirmed'` and `deposit_amount=NULL`; party≥10 keep `pending_payment` (deposit still required under new rules). No customer email/SMS — pre-launch banner carries the public message. Pre-order data on the row is preserved but no longer kitchen-enforced. | — |
| ~~OQ15~~ | **Resolved into D10.** Analytics event mapping is now a hard dependency that must complete before deploy (not a loose follow-up). See §12 D10. | — |

## 12. Dependencies

| ID | Dependency | Owner | Resolved by |
|---|---|---|---|
| D1 | `/keyword-plan` skill output for `/sunday-lunch` rewrite | Peter | Before Phase 1 implementation begins |
| D2 | Management app DB migrations + code deploy per §8.3-§8.4 | Management app team | Ships ≥ 24h before website production deploy |
| D3 | SSOT.json deposit threshold (already 10+) — verify only | Peter | Verify only |
| D4 | Deploy as soon as implementation is ready (no artificial 11-15 May gate; pre-launch banner explains the transition for 3/10 May) | Peter + management team | Schedule confirmed during planning |
| D5 | OQ14a (legacy unpaid pending bookings policy) — answered | Peter | Before implementation begins |
| D6 | Backfill paid-status enum values verified against `payments.status` enum | Management app team | Before Migration A is written |
| D7 | Latest migration timestamp touching `create_table_booking_v05` and `_core` identified | Management app team | Before Migration B/C are timestamped |
| D8 | Postgres-savvy review of Migration A SQL (legacy unpaid pending conversion + paid-deposit lock backfill) before any execution against staging or prod | Peter + management app team | Before Migration A runs |
| D9 | Sunday business-hours change (12pm-5pm → 1pm-6pm) coordinated with kitchen staff briefing | Peter | Before launch — operational only, not in code scope |
| D10 | Analytics event-mapping audit completed: pre/post Phase 1 event contract documented (which events survive, which renamed, which removed). Specifically covers `sunday_lunch_form_*`, `booking_wizard_*`, deposit-flow events, PayPal-flow events. **Hard dependency — must complete before deploy.** Can run in parallel with implementation kickoff. | Peter | Before website production deploy |
| ~~D11~~ | **Resolved 28 April 2026.** DB query returned: 41 historical, 2 future (1 cancelled-never-paid, 1 active confirmed paid). Active row: `TB-8229A1B4`, Sunday 31 May 2026 1pm BST, party 1, Roasted Chicken pre-order, £10 paid deposit. Honoured silently per owner decision (see §6 cutover row). Migration A Step 2 will lock its amount; Step 1 has no rows to convert. Kitchen brief should mention this single customer's pre-order. | — |

## 13. File inventory — website (`OJ-The-Anchor.pub`)

### 13.1 Code — refactor (live booking path)
- `components/features/TableBooking/ManagementTableBookingForm.tsx` — strip Sunday/cutoff/Mother's Day; deposit gated on `requiresDeposit`; warm copy; courteous no-show messaging; PayPal failure recovery state
- `app/api/table-bookings/route.ts` — drop cutoff; drop Sunday derivation; drop `sunday_preorder_items`; **strip inbound `booking_type` always** (defence in depth)
- `app/api/table-bookings/availability/route.ts` — drop `sunday_lunch` param branch
- `app/api/booking/agent/route.ts` — drop Sunday defaulting; drop "7+" / "1pm Saturday" copy
- `app/api/booking/submit/route.ts` — refactor or DELETE (per OQ2)
- `lib/table-booking-service-windows.ts` — leave types; mark Sunday branch legacy-only
- `lib/constants.ts` — rename deposit constants; add `requiresDeposit` and `computeLargeGroupDepositAmount` (NO `getCanonicalDeposit` — that helper is management-only); new copy constants; `WALK_IN_LAUNCH_*` constants
- `lib/mothers-day-booking.ts` — DELETE if unused

### 13.2 Code — DELETE (verify zero imports first)
- `lib/sunday-lunch-cutoff.ts`
- All `components/features/BookingWizard/*` files
- `components/features/TableBooking/SundayLunchBookingForm.tsx`
- `components/features/TableBooking/SundayLunchBookingSection.tsx` (or replace with content section)
- `components/features/TableBooking/SundayLunchBooking.tsx` (verify unused)
- `app/book-table/page-old.tsx`
- `app/sunday-lunch/page.tsx.backup`
- `app/api/table-bookings/menu/sunday-lunch/route.ts` (assess)

### 13.3 Code — NEW
- `components/announcements/LaunchAnnouncement.tsx`

### 13.4 Content — refactor (per §8.2 + planning grep)
- `app/book-table/page.tsx` — FAQ + tips + dish copy + JSON-LD
- `app/sunday-lunch/page.tsx` — major rewrite per §8.6
- `app/easter/page.tsx`
- `app/feltham-pub/page.tsx`
- `app/stanwell-pub/page.tsx`
- `app/staines-pub/page.tsx`
- `app/music-bingo/page.tsx`
- `app/fathers-day/page.tsx`
- Hotel/pub/location pages — enumerated during planning
- `app/page.tsx` — homepage walk-in messaging
- `app/layout.tsx` — footer slim line + promo CTA entry for walk-ins
- `public/llms.txt`
- Blog posts under `content/blog/` (Sunday-context — enumerated during planning)
- Schema.org JSON-LD blocks
- Internal docs (`docs/copy-assumptions.md`, architecture docs, SSOT docs, analytics docs) — update or mark historical

### 13.5 Tests — see §8.11

### 13.6 Build / config
- `.gitignore` — confirm `.DS_Store` covered

## 14. File inventory — management app (`OJ-AnchorManagementTools`)

### 14.1 Migrations — NEW (timestamped after the latest existing migration touching the relevant function — see §7.10)
- `supabase/migrations/<timestamp>_add_deposit_amount_locked.sql` — column + multi-source backfill (§8.4 Migration A)
- `supabase/migrations/<timestamp>_patch_v05_threshold_and_cutoff.sql` — `CREATE OR REPLACE FUNCTION create_table_booking_v05` with minimal edits to a copy of the current full body (§8.4 Migration B)
- `supabase/migrations/<timestamp>_patch_v05_core_threshold.sql` — `CREATE OR REPLACE FUNCTION create_table_booking_v05_core` with the same minimal-edit pattern (§8.4 Migration C)

### 14.2 Code — refactor
- `src/app/api/table-bookings/route.ts` — drop `p_sunday_lunch=true` for non-legacy; drop `sunday_preorder_items` persistence; canonical amount in response (~478) and analytics (~536)
- `src/lib/table-bookings/bookings.ts` — lines ~491, 708, 733 use `getCanonicalDeposit`
- `src/app/api/foh/bookings/route.ts` — replace 7+ threshold with `requiresDeposit`
- `src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts` — same
- `src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx` — relabel + threshold
- `src/app/(authenticated)/table-bookings/foh/components/FohTimeline.tsx` — relabel
- `src/app/api/boh/table-bookings/[id]/party-size/route.ts` — replace `DEPOSIT_THRESHOLD = 7` (line 104); respect locked; SMS deposit-link uses canonical
- `src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts` — read canonical; never overwrite locked
- `src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts` — **WRITE `deposit_amount_locked` on successful capture** (around line 84); add regression test
- Stripe webhook / checkout completion — write `deposit_amount_locked`
- Cash/manual deposit confirmation — write `deposit_amount_locked`
- `src/app/g/[token]/table-payment/...` — read canonical; write `deposit_amount_locked` on success
- `src/lib/table-bookings/sunday-preorder.ts` — only invoked for legacy `booking_type='sunday_lunch'` paths
- `src/lib/table-bookings/manage-booking.ts` — audit deposit-touching paths
- `src/services/business-hours.ts` — verify Sunday hours surface 1pm-6pm; confirm OQ13
- `src/app/api/business/hours/route.ts` — verify
- `src/app/(authenticated)/table-bookings/[id]/PreorderTab.tsx` — preserve display for legacy bookings
- `src/app/(authenticated)/table-bookings/<list views>` — add legacy badge
- Kitchen-report components — relabel
- `src/types/database.generated.ts` — regenerate after migration

### 14.3 Code — NEW
- `src/lib/table-bookings/deposit.ts` — `requiresDeposit`, `computeDepositAmount`, `getCanonicalDeposit`, `lockDepositAmount` (state-aware per §7.3)

### 14.4 Tests — see §8.11

## 15. Appendix — review quotes for curation

The following 5★ reviews are candidates for curation on `/sunday-lunch` and (excerpts) on the homepage. Recorded as reviewer name + content only — implementation should pull current absolute dates from Google when displaying, never use relative ages ("a week ago") in public copy. Excluded explicitly: James Spratt and "R" (lamb-shank confusion).

- **Sara Bowden** — "Had a lovely Sunday roast here. Very friendly place and great food."
- **T** — "Came in this past Sunday for the Sunday roast before our flight home. Had the lamb shank and my partner had the pork belly. Absolutely delicious plates! Very hospitable owners and staff. Clean pub, and poured a nice Guinness."
- **IJ** — "It was hands down the best meal we had in England... cosy atmosphere, hospitality from our team, and the food itself."
- **Jasmine Claypool** — "Such a great surprise!... Several choices... don't let that deter you." (Visiting from Canada.)
- **Andrea Pisani** — "Lovely Sunday roast and you can also park the car if you need to go to Heathrow airport."
- **Iona Turner** — "Incredible roast dinner!... Friendly and helpful staff too. Great stop before heading to Heathrow!"
- **Nancy Turner** — "We had a roast dinner before our flight at Heathrow and it was delicious!! Staff very friendly too! Will visit again."
- **Vanessa Rodgers** — "It's hard to find a place for a good Sunday roast! Glad we found this little gem!"
- **Penny Johnson** — "Sunday roasts are great... fantastic! Really good size, delicious gravy and plenty of veg. The belly pork was awesome!"
- **Lucy Mason** — "Sunday roast chicken were huge and delicious, recommend apple crumble with ice cream for dessert."
- **Michael Frewin** — "The Sunday roasts are to die for. Great atmosphere all round. A must to visit."
- **Christian Weinert** — "Delicious Sunday roast!" (with photo)
- **Ann W** — Veggie diner: "treated really well... meals which were huge and piping hot."

---

**End of spec.**
