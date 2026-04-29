# Sunday Walk-In Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace The Anchor's pre-order + £10 deposit Sunday-lunch system with a frictionless walk-in-friendly model on Sunday 17 May 2026, while honouring the single existing paid legacy booking and locking-in paid deposits forever.

**Architecture:** Two-repo coordinated change driven by a single source-of-truth spec at `docs/superpowers/specs/2026-04-28-sunday-walk-in-launch-and-wizard-overhaul-design.md` (revision 9). Management app (`OJ-AnchorManagementTools`) ships first: new `deposit_amount_locked` column with multi-source paid backfill, two `CREATE OR REPLACE FUNCTION` patches to `create_table_booking_v05` and `create_table_booking_v05_core` (10+ deposit threshold preserving `p_deposit_waived` semantics, no Saturday cutoff), centralised deposit helper, payment-capture surfaces lock the actually-captured amount, FOH UI relabels, business-hours data updates 12-5pm → 1-6pm. Website (`OJ-The-Anchor.pub`) ships ≥24h later: `ManagementTableBookingForm` (the live form) strips Sunday-specific UI, proxy drops inbound `sunday_lunch` and `booking_type`, AI agent stops auto-deriving Sunday lunch, content sweep across all Sunday-touching pages, `<LaunchAnnouncement>` component with two visible states (pre-launch / launch-day) hiding entirely after 18:00 BST 17 May. No DB enum changes. Defensive Migration A Step 1 conversion logic ships but has zero rows to operate on (verified D11). 1 active future legacy paid booking on 31 May 2026 honoured silently per owner decision.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind on both repos; Supabase (PostgreSQL + RLS + RPCs) on management; PayPal + Stripe + token magic-links on management; Jest on website; Vitest on management; Cloudflare Turnstile; Google Tag Manager.

**Spec reference:** `docs/superpowers/specs/2026-04-28-sunday-walk-in-launch-and-wizard-overhaul-design.md` (revision 9). Every task references the relevant spec section.

**Keyword plan reference:** delivered in conversation; folded into Task 12.1 for `/sunday-lunch` rewrite.

---

## How to use this plan

- **Repo prefixes:** `WEB:` = website repo, `MGMT:` = management app repo. Each task's "Files" line uses absolute paths.
- **Test commands:** management app uses Vitest (`pnpm test` or `npm test` runs `vitest run`); website uses Jest (`npm test`).
- **TDD steps:** for new logic, write test → run (fails) → implement → run (passes) → commit. For existing-file modifications, "Read current state → apply transformation → run tests → commit".
- **Commit conventions:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`). One logical change per commit.
- **No skipping pre-flight.** Tasks 0.1–0.4 unblock everything else; their outputs feed into Migrations A/B/C.

---

## Section 0 — Pre-flight (must complete before Task 1.1)

### Task 0.1: Verify `payments.status` paid-enum values (Spec D6)

**Files:**
- Read-only query against management Supabase

**Why:** Migration A's backfill SQL uses `p.status IN (<verified-paid-status-values>)` for the `payments` table. We need the actual enum/text values that mean "paid".

- [ ] **Step 1: Run discovery query in management Supabase SQL editor**

```sql
-- Inspect actual values in use for completed table_deposit payments.
SELECT DISTINCT status, COUNT(*) AS rows
FROM public.payments
WHERE charge_type = 'table_deposit'
GROUP BY status
ORDER BY rows DESC;
```

- [ ] **Step 2: Record the verified paid-status values**

Save the list (likely some subset of `'succeeded'`, `'completed'`, `'captured'`) as `PAID_STATUS_VALUES` in a planning notes file. The exact list goes into Migration A Step 2.

- [ ] **Step 3: Cross-check against the enum definition**

```sql
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = (
  SELECT udt_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'status'
));
```

If `payments.status` is text not enum, the query above returns empty — that's fine, use the actual values from Step 1.

### Task 0.2: Identify latest migration touching `create_table_booking_v05` and `create_table_booking_v05_core` (Spec D7)

**Files:** read management repo migrations directory

- [ ] **Step 1: List migrations that mention the function names**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
ls -1 supabase/migrations/*.sql | xargs grep -l "create_table_booking_v05\b\|create_table_booking_v05_core" | sort | tail -10
```

- [ ] **Step 2: Record the highest-numbered (latest) migration touching each function**

Migrations B and C must be timestamped AFTER both. Use a timestamp like `YYYYMMDDHHMMSS` immediately after the highest existing one (e.g. add 1 second).

### Task 0.3: Re-confirm D11 — zero unpaid pending future Sunday-lunch bookings

**Files:** read-only management Supabase query

- [ ] **Step 1: Re-run D11 query to confirm state on the day of migration**

```sql
SELECT
  COUNT(*) FILTER (WHERE booking_type = 'sunday_lunch' AND start_datetime >= NOW() AND status = 'pending_payment' AND COALESCE(payment_status::text, '') <> 'completed' AND paypal_deposit_capture_id IS NULL) AS future_unpaid_pending,
  COUNT(*) FILTER (WHERE booking_type = 'sunday_lunch' AND start_datetime >= NOW() AND (payment_status::text = 'completed' OR paypal_deposit_capture_id IS NOT NULL)) AS future_paid
FROM public.table_bookings;
```

- [ ] **Step 2: Confirm `future_unpaid_pending = 0` and `future_paid >= 1`**

If `future_unpaid_pending > 0` between spec lock and migration day, surface to Peter for review of OQ14a. Migration A Step 1 will silently convert these unless decision is revisited.

### Task 0.4: Verify git working trees are clean

- [ ] **Step 1: Confirm clean state in both repos**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && git status --short
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools && git status --short
```

Both should be clean (or only have explicitly intended in-progress work). Stash anything stray.

- [ ] **Step 2: Create feature branches**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools && git checkout -b feat/sunday-walk-in-launch
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub && git checkout -b feat/sunday-walk-in-launch
```

---

## Section 1 — Management app: DB foundation

### Task 1.1: Create the centralised deposit helper module (Spec §7.3, §8.3)

**Files:**
- Create: `MGMT: src/lib/table-bookings/deposit.ts`
- Create: `MGMT: tests/lib/table-bookings/deposit.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/table-bookings/deposit.test.ts
import { describe, it, expect } from 'vitest';
import {
  requiresDeposit,
  computeDepositAmount,
  getCanonicalDeposit,
} from '../../../src/lib/table-bookings/deposit';

describe('requiresDeposit', () => {
  it('returns false for parties under 10', () => {
    expect(requiresDeposit(1)).toBe(false);
    expect(requiresDeposit(9)).toBe(false);
  });

  it('returns true for parties of 10 or more', () => {
    expect(requiresDeposit(10)).toBe(true);
    expect(requiresDeposit(20)).toBe(true);
  });

  it('returns false when deposit is waived even for 10+', () => {
    expect(requiresDeposit(10, { depositWaived: true })).toBe(false);
    expect(requiresDeposit(50, { depositWaived: true })).toBe(false);
  });
});

describe('computeDepositAmount', () => {
  it('returns 0 below threshold', () => {
    expect(computeDepositAmount(9)).toBe(0);
  });

  it('returns party_size * 10 at and above threshold', () => {
    expect(computeDepositAmount(10)).toBe(100);
    expect(computeDepositAmount(15)).toBe(150);
  });
});

describe('getCanonicalDeposit', () => {
  const baseBooking = {
    party_size: 12,
    deposit_amount: 120,
    deposit_amount_locked: null,
    status: 'confirmed',
    payment_status: null,
    deposit_waived: false,
  };

  it('locked amount always wins, even if other fields disagree', () => {
    const b = { ...baseBooking, deposit_amount_locked: 100, deposit_amount: 999, party_size: 12 };
    expect(getCanonicalDeposit(b)).toBe(100);
  });

  it('uses stored deposit_amount when booking is in payment-required state', () => {
    const b = { ...baseBooking, deposit_amount_locked: null, deposit_amount: 80, status: 'pending_payment', payment_status: 'pending' };
    expect(getCanonicalDeposit(b)).toBe(80);
  });

  it('uses stored deposit_amount when payment is completed', () => {
    const b = { ...baseBooking, deposit_amount_locked: null, deposit_amount: 80, status: 'confirmed', payment_status: 'completed' };
    expect(getCanonicalDeposit(b)).toBe(80);
  });

  it('returns 0 for under-threshold confirmed bookings with no payment', () => {
    const b = { ...baseBooking, deposit_amount_locked: null, deposit_amount: null, status: 'confirmed', payment_status: null, party_size: 6 };
    expect(getCanonicalDeposit(b)).toBe(0);
  });

  it('computes fresh amount only when threshold met and no prior amount', () => {
    const b = { ...baseBooking, deposit_amount_locked: null, deposit_amount: null, status: 'confirmed', payment_status: null, party_size: 12 };
    expect(getCanonicalDeposit(b)).toBe(120);
  });

  it('respects deposit_waived flag and returns 0', () => {
    const b = { ...baseBooking, deposit_amount_locked: null, deposit_amount: null, status: 'confirmed', payment_status: null, party_size: 50, deposit_waived: true };
    expect(getCanonicalDeposit(b)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests — expect failure**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx vitest run tests/lib/table-bookings/deposit.test.ts
```

Expected: FAIL with "Cannot find module '../../../src/lib/table-bookings/deposit'".

- [ ] **Step 3: Implement the module**

```ts
// src/lib/table-bookings/deposit.ts

export const LARGE_GROUP_DEPOSIT_PER_PERSON_GBP = 10;
export const LARGE_GROUP_DEPOSIT_THRESHOLD = 10;

export type DepositOptions = {
  depositWaived?: boolean;
};

/**
 * Returns true when a deposit must be charged for a booking of the given party size.
 * Preserves the existing `p_deposit_waived` semantics — a waived booking never requires
 * a deposit regardless of party size.
 */
export function requiresDeposit(partySize: number, opts: DepositOptions = {}): boolean {
  if (opts.depositWaived === true) return false;
  return partySize >= LARGE_GROUP_DEPOSIT_THRESHOLD;
}

/**
 * Computes a fresh deposit amount from party size only. Returns 0 when no deposit is required.
 * Use this only when there is no prior amount (locked or stored) on the booking.
 */
export function computeDepositAmount(partySize: number, opts: DepositOptions = {}): number {
  if (!requiresDeposit(partySize, opts)) return 0;
  return partySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP;
}

/**
 * Booking shape for the canonical-deposit reader. Intentionally narrow — accepts any object
 * with the relevant fields so it works for partial selects.
 */
export type BookingForDeposit = {
  party_size: number;
  deposit_amount?: number | string | null;
  deposit_amount_locked?: number | string | null;
  status?: string | null;
  payment_status?: string | null;
  deposit_waived?: boolean | null;
};

const PAYMENT_REQUIRED_STATES = new Set(['pending_payment']);
const PAYMENT_REQUIRED_PAYMENT_STATUSES = new Set(['pending', 'completed']);

function toNumberOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Returns the canonical deposit amount for a booking. Read priority:
 *   1. deposit_amount_locked (always wins — paid bookings are immutable)
 *   2. stored deposit_amount when the booking is in a payment-required state
 *   3. fresh compute via requiresDeposit + party size, or 0 if not required
 */
export function getCanonicalDeposit(
  booking: BookingForDeposit,
  partySizeOverride?: number,
): number {
  const locked = toNumberOrNull(booking.deposit_amount_locked);
  if (locked !== null) return locked;

  const stored = toNumberOrNull(booking.deposit_amount);
  const status = booking.status ?? null;
  const paymentStatus = booking.payment_status ?? null;
  const inPaymentState =
    (status !== null && PAYMENT_REQUIRED_STATES.has(status)) ||
    (paymentStatus !== null && PAYMENT_REQUIRED_PAYMENT_STATUSES.has(paymentStatus));

  if (stored !== null && inPaymentState) return stored;

  const partySize = partySizeOverride ?? booking.party_size;
  return computeDepositAmount(partySize, { depositWaived: booking.deposit_waived === true });
}

/**
 * Convenience helper used by capture surfaces that need to write the lock.
 * Callers pass the actually-captured amount from the payment provider.
 */
export type LockDepositArgs = {
  bookingId: string;
  amount: number;
};
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/lib/table-bookings/deposit.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git add src/lib/table-bookings/deposit.ts tests/lib/table-bookings/deposit.test.ts
git commit -m "feat(deposits): add centralised deposit helper module

- requiresDeposit(partySize, {depositWaived}) — single source of truth for the 10+ threshold
- computeDepositAmount() — fresh-compute helper
- getCanonicalDeposit(booking, ?partySize) — state-aware reader (locked > stored > computed)

Spec §7.3, §8.3. Replaces the 7+ rule scattered across 8 call sites in subsequent tasks."
```

### Task 1.2: Migration A — `deposit_amount_locked` column + legacy unpaid conversion + paid-deposit backfill (Spec §7.4, §8.4 Migration A)

**Files:**
- Create: `MGMT: supabase/migrations/<timestamp_after_latest>_add_deposit_amount_locked.sql` (timestamp from Task 0.2)

- [ ] **Step 1: Compose the migration file**

**Verified D6 result (28 April 2026):** the only paid value in `payments.status` for `charge_type = 'table_deposit'` is `'succeeded'` (6 rows). `'completed'` and `'captured'` do not appear. Use `p.status = 'succeeded'` in the SQL below. `table_bookings.payment_status = 'completed'` is the cross-check on the bookings side and is unchanged.

```sql
-- supabase/migrations/<timestamp>_add_deposit_amount_locked.sql

-- ============================================================================
-- Migration A: deposit lock column + legacy unpaid pending conversion + paid backfill.
-- Spec ref: docs/superpowers/specs/2026-04-28-sunday-walk-in-launch-and-wizard-overhaul-design.md
--           §7.4 (lock-amount design), §8.4 Migration A (full SQL spec).
-- D6: paid-status enum values verified — replace placeholder below.
-- D8: Postgres-savvy review COMPLETE before running.
-- ============================================================================

-- Add the lock column. Additive, no defaults — existing rows are NULL.
ALTER TABLE public.table_bookings
  ADD COLUMN IF NOT EXISTS deposit_amount_locked numeric NULL;

COMMENT ON COLUMN public.table_bookings.deposit_amount_locked IS
  'Frozen deposit amount in GBP. Set by every successful payment-capture surface (PayPal capture-order, Stripe webhook, cash/manual deposit confirmation) and by paid-booking backfill. Once set, no recompute path may overwrite it.';

-- ============================================================================
-- STEP 1 — Convert legacy unpaid pending Sunday-lunch bookings to standard.
-- Per OQ14a (resolved): silent conversion. Defensive only — D11 confirms 0 rows.
-- Filter: future bookings only. Past abandoned rows must NOT be touched.
-- ============================================================================
UPDATE public.table_bookings tb
SET
  booking_type = 'regular',
  status = CASE WHEN tb.party_size >= 10 THEN tb.status ELSE 'confirmed' END,
  deposit_amount = CASE WHEN tb.party_size >= 10 THEN tb.deposit_amount ELSE NULL END
WHERE tb.booking_type = 'sunday_lunch'
  AND tb.status = 'pending_payment'
  AND tb.start_datetime >= NOW()
  AND COALESCE(tb.payment_status::text, '') <> 'completed'
  AND tb.paypal_deposit_capture_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.table_booking_id = tb.id
      AND p.charge_type = 'table_deposit'
      AND p.status = 'succeeded'
  );

-- ============================================================================
-- STEP 2 — Backfill deposit_amount_locked for paid bookings.
-- Criteria (any one is sufficient evidence of payment):
--   payment_status = 'completed'
--   OR paypal_deposit_capture_id IS NOT NULL
--   OR a payments row exists with charge_type='table_deposit' and a paid status
-- Lock value priority: payments.amount (most reliable), then table_bookings.deposit_amount.
-- ============================================================================
WITH paid_payments AS (
  SELECT DISTINCT ON (p.table_booking_id)
    p.table_booking_id,
    p.amount
  FROM public.payments p
  WHERE p.charge_type = 'table_deposit'
    AND p.status = 'succeeded'
  ORDER BY p.table_booking_id, p.created_at DESC
)
UPDATE public.table_bookings tb
SET deposit_amount_locked = COALESCE(
  (SELECT amount FROM paid_payments pp WHERE pp.table_booking_id = tb.id),
  tb.deposit_amount
)
WHERE tb.deposit_amount_locked IS NULL
  AND (
    tb.payment_status::text = 'completed'
    OR tb.paypal_deposit_capture_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM paid_payments pp WHERE pp.table_booking_id = tb.id)
  )
  AND COALESCE(
    (SELECT amount FROM paid_payments pp WHERE pp.table_booking_id = tb.id),
    tb.deposit_amount
  ) IS NOT NULL;

-- ============================================================================
-- STEP 3 — Verification report (zero rows on success). Run as a sanity check.
-- Any row returned indicates a paid booking that backfill couldn't lock — flag for staff review.
-- ============================================================================
-- This SELECT does not run as part of the migration; it's the script you run
-- post-migration to verify integrity. Copy into the SQL editor:
/*
SELECT tb.id, tb.booking_reference, tb.start_datetime, tb.party_size,
       tb.payment_status, tb.paypal_deposit_capture_id, tb.deposit_amount, tb.deposit_amount_locked
FROM public.table_bookings tb
WHERE tb.deposit_amount_locked IS NULL
  AND (
    tb.payment_status::text = 'completed'
    OR tb.paypal_deposit_capture_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.payments p
               WHERE p.table_booking_id = tb.id
                 AND p.charge_type = 'table_deposit'
                 AND p.status = 'succeeded')
  );
*/
```

- [ ] **Step 2: Postgres review checkpoint (D8)**

Get a Postgres-savvy reviewer to read the migration. Specifically scrutinise:
- The `DISTINCT ON` correlation with `ORDER BY` (must include the partitioning column first).
- The `NULL`-safe comparisons via `COALESCE(... ::text, '')`.
- That Step 1 only touches future rows (`start_datetime >= NOW()`).
- That Step 2's `COALESCE` won't lock a NULL value (the outer `IS NOT NULL` guard handles it).
- Idempotency — re-running the migration must not double-work or change locked amounts.

Resolve any review feedback before proceeding.

- [ ] **Step 3: Run against staging**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx supabase db push --dry-run
npx supabase db push
```

- [ ] **Step 4: Verify in staging**

Run the verification SELECT from Step 1. Expected: zero rows. Then run:

```sql
SELECT
  COUNT(*) FILTER (WHERE deposit_amount_locked IS NOT NULL) AS locked_rows,
  COUNT(*) FILTER (WHERE booking_type = 'sunday_lunch' AND status = 'pending_payment' AND start_datetime >= NOW()) AS unpaid_pending_sunday_lunch_remaining
FROM public.table_bookings;
```

Expected: `locked_rows >= 1` (the 31 May TB-8229A1B4 booking + any historical paid), `unpaid_pending_sunday_lunch_remaining = 0`.

- [ ] **Step 5: Commit migration file**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git add supabase/migrations/<timestamp>_add_deposit_amount_locked.sql
git commit -m "feat(db): add deposit_amount_locked + legacy unpaid conversion + paid backfill

Migration A from spec §8.4. Locks paid deposit amounts forever, converts
zero rows on day 1 (D11 verified), backfills the 31 May 2026 paid Sunday
lunch booking and any historical paid rows. D6 enum values applied;
D8 Postgres review complete."
```

### Task 1.3: Migration B — patch `create_table_booking_v05` RPC (Spec §7.10, §8.4 Migration B)

**Files:**
- Read: latest migration file from Task 0.2 (full body of `create_table_booking_v05`)
- Create: `MGMT: supabase/migrations/<timestamp_after_A>_patch_v05_threshold_and_cutoff.sql`

**CRITICAL:** Per spec §7.10, do NOT paste pseudocode. Read the current full RPC body, copy it verbatim, apply the minimal edits below.

- [ ] **Step 1: Locate and read the current `create_table_booking_v05` body**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
# Latest migration filename came from Task 0.2 — open it
$EDITOR supabase/migrations/<latest_v05_migration>.sql
```

Find the `CREATE OR REPLACE FUNCTION public.create_table_booking_v05(...)` body. Note its full parameter list (must include `p_sunday_lunch boolean` and `p_deposit_waived boolean DEFAULT false` or similar — confirm during read).

- [ ] **Step 2: Compose Migration B**

Start a new file. Paste the latest function body verbatim, then apply these three edits IN PLACE:

**Edit 1 — Skip `sunday_preorder_cutoff_at` calc when not legacy Sunday lunch.**
Find the block that assigns `v_sunday_preorder_cutoff_at` (around line 399-401 in the original). Wrap it:

```sql
-- BEFORE:
v_sunday_preorder_cutoff_at :=
  (((p_booking_date - INTERVAL '1 day')::date::text || ' 13:00')::timestamp AT TIME ZONE 'Europe/London');

-- AFTER:
IF p_sunday_lunch THEN
  v_sunday_preorder_cutoff_at :=
    (((p_booking_date - INTERVAL '1 day')::date::text || ' 13:00')::timestamp AT TIME ZONE 'Europe/London');
ELSE
  v_sunday_preorder_cutoff_at := NULL;
END IF;
```

**Edit 2 — Replace the pending_payment threshold (around line 380 in the original).** Currently `sunday_lunch OR party_size BETWEEN 7 AND 20`. Replace with `party_size >= 10 AND NOT COALESCE(p_deposit_waived, false)`:

```sql
-- BEFORE (illustrative — copy your file's actual condition):
IF p_sunday_lunch OR (p_party_size BETWEEN 7 AND 20) THEN
  v_status := 'pending_payment';
  ...
END IF;

-- AFTER:
IF p_party_size >= 10 AND NOT COALESCE(p_deposit_waived, false) THEN
  v_status := 'pending_payment';
  ...
END IF;
```

**Edit 3 — Leave the deposit AMOUNT calculation unchanged.** It's still `party_size * 10` (line 408-409). The amount is computed; whether it's required is governed by Edit 2.

Do NOT touch any other piece of logic — capacity, table assignment, hold expiry, audit logging, error returns, return shape.

- [ ] **Step 3: Wrap in `CREATE OR REPLACE FUNCTION`**

```sql
-- supabase/migrations/<timestamp>_patch_v05_threshold_and_cutoff.sql

CREATE OR REPLACE FUNCTION public.create_table_booking_v05(
  -- exact parameter list copied from latest existing migration
  -- DO NOT modify the signature
) RETURNS ... AS $$
DECLARE
  -- exact declarations copied verbatim
BEGIN
  -- exact body copied verbatim, with the three edits from Step 2 applied
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- [ ] **Step 4: Run against staging and verify**

```bash
npx supabase db push
```

Then run a smoke test:

```sql
-- Party of 9, food, any day → confirmed (no pending_payment).
SELECT * FROM public.create_table_booking_v05(
  -- exact param list with party_size := 9, p_sunday_lunch := false, p_deposit_waived := false, ...
);

-- Party of 10, food, any day → pending_payment with deposit_amount = 100.
-- Party of 10, food, p_deposit_waived := true → confirmed (waived).
-- Sunday booking on a Sunday with p_sunday_lunch := false → confirmed, no cutoff applied.
```

Compare against the current production behaviour (before applying) for the same inputs — only the threshold/cutoff behaviour should differ.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/<timestamp>_patch_v05_threshold_and_cutoff.sql
git commit -m "fix(rpc): patch create_table_booking_v05 — 10+ deposit threshold, no Sunday cutoff

CREATE OR REPLACE per spec §7.10 (full body copied from latest migration,
three minimal edits applied). pending_payment now triggers on
\"p_party_size >= 10 AND NOT p_deposit_waived\" — preserves waiver semantics.
sunday_preorder_cutoff_at no longer set for non-legacy bookings.
deposit_amount calc unchanged (party_size * 10).

Migration B from spec §8.4."
```

### Task 1.4: Migration C — patch `create_table_booking_v05_core` RPC (Spec §8.4 Migration C)

**Files:**
- Read: latest migration touching `_core` (Task 0.2 output)
- Create: `MGMT: supabase/migrations/<timestamp_after_B>_patch_v05_core_threshold.sql`

- [ ] **Step 1: Read the current `create_table_booking_v05_core` body**

Find the function (initially defined around line 63 of `20260509000013_fix_core_remove_card_capture_refs.sql`, possibly patched in later migrations).

- [ ] **Step 2: Apply the same threshold edit as Migration B**

In the body, find the 7+ rule (likely `party_size BETWEEN 7 AND 20` or `party_size >= 7`) and replace with `party_size >= 10 AND NOT COALESCE(p_deposit_waived, false)`. Preserve every other piece of logic.

- [ ] **Step 3: Wrap in CREATE OR REPLACE, push, smoke-test**

Same pattern as Task 1.3. Smoke test inputs that go through the event/table reservation flows.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/<timestamp>_patch_v05_core_threshold.sql
git commit -m "fix(rpc): patch create_table_booking_v05_core — 10+ deposit threshold

Same minimal-edit pattern as Migration B. Affects event/table reservation flows
that go through _core. Preserves p_deposit_waived semantics. Spec §8.4 Migration C."
```

---

## Section 2 — Management app: Code refactor

### Task 2.1: Update `src/app/api/table-bookings/route.ts` — drop sunday_lunch handling, add `fallback_payment_url` (Spec §6 Failed-PayPal recovery, §8.3)

**Files:**
- Modify: `MGMT: src/app/api/table-bookings/route.ts`

- [ ] **Step 1: Read the current file**

```bash
$EDITOR /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts
```

Identify:
- Around line 247: where `p_sunday_lunch: payload.sunday_lunch === true` is passed to RPC
- Around lines 307-326: where `sunday_preorder_items` are persisted conditionally on `payload.sunday_lunch === true`
- Around line 478: where the response payload computes `party_size * 10`
- Around line 536: where analytics computes `party_size * 10`

- [ ] **Step 2: Apply edits**

```ts
// Top of file — add import:
import { getCanonicalDeposit, requiresDeposit } from '@/lib/table-bookings/deposit';

// Around line 247 — change RPC call:
// BEFORE: p_sunday_lunch: payload.sunday_lunch === true,
// AFTER:  p_sunday_lunch: false, // legacy field; new public bookings never set this
```

For pre-order persistence (lines 307-326): the conditional `if (payload.sunday_lunch === true && payload.sunday_preorder_items?.length)` block. Wrap it in a comment explaining it now never fires for new public bookings, OR remove entirely (admin-only paths use a separate route — verify by grep `saveSundayPreorderByBookingId` callers).

```ts
// AFTER edit (preferred — full removal from public path):
// Pre-order persistence removed from the public POST. The legacy admin path
// in src/app/api/foh/bookings/route.ts retains saveSundayPreorderByBookingId
// for staff-explicit legacy Sunday-lunch creation.
```

For response payload (around line 478) and analytics (around line 536): replace `party_size * 10` with `getCanonicalDeposit(booking, party_size)`.

```ts
// BEFORE: deposit_amount: payload.party_size * 10,
// AFTER:  deposit_amount: getCanonicalDeposit(bookingResult, payload.party_size),
```

For the new `fallback_payment_url` field — when the inline PayPal setup helper returns failure, the response should include a `fallback_payment_url` pointing to the management's `/g/[token]/table-payment` page. Locate the response-construction block; add the field. The token-payment URL pattern is the existing one used for SMS deposit links. Reuse the same generation logic.

```ts
// In the response builder, when payment_required && PayPal setup failed:
return NextResponse.json({
  state: 'pending_payment',
  table_booking_id: bookingResult.id,
  booking_reference: bookingResult.booking_reference,
  // ... existing fields ...
  fallback_payment_url: tokenPaymentUrl, // NEW — generated via the existing token mechanism
});
```

- [ ] **Step 3: Run existing tests**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npx vitest run tests/api/booking-submit-deposit.test.ts
```

Some assertions will need updating (Task 5.1). For now, expect failures.

- [ ] **Step 4: Commit (tests intentionally failing, fixed in Task 5.1)**

```bash
git add src/app/api/table-bookings/route.ts
git commit -m "refactor(api): drop sunday_lunch handling, add fallback_payment_url, use canonical deposit

- POST /api/table-bookings no longer passes p_sunday_lunch=true (always false)
- sunday_preorder_items persistence removed from public path (admin-only via FOH route)
- Response and analytics use getCanonicalDeposit() instead of blind party_size * 10
- New fallback_payment_url field returned when inline PayPal setup fails

Spec §8.3. Existing tests will fail until Task 5.1."
```

### Task 2.2: Update `src/lib/table-bookings/bookings.ts` — three amount-recompute paths (Spec §3 step 9, §8.3)

**Files:**
- Modify: `MGMT: src/lib/table-bookings/bookings.ts`

- [ ] **Step 1: Read the file and locate three sites**

```bash
grep -n "party_size.*\\* 10\\|partySize \\* DEPOSIT_PER_PERSON\\|partySize \\* 10" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/lib/table-bookings/bookings.ts
```

Should return three lines (around 491, 708, 733 per spec §3 step 9). Confirm.

- [ ] **Step 2: Replace each with `getCanonicalDeposit`**

```ts
// Top of file — add import if missing:
import { getCanonicalDeposit, requiresDeposit, computeDepositAmount } from './deposit';

// Each of the three sites: replace blind compute with canonical reader.
// BEFORE: const depositAmount = booking.party_size * 10;
// AFTER:  const depositAmount = getCanonicalDeposit(booking, booking.party_size);

// For the generateDepositPaymentUrl function (line 708):
// Make sure it never overwrites a locked amount. Reading the canonical handles this — locked > stored > computed.
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run tests/lib/table-bookings/
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/table-bookings/bookings.ts
git commit -m "refactor(deposits): route bookings.ts amount paths through getCanonicalDeposit

Three sites (lines ~491, 708, 733). generateDepositPaymentUrl now respects
deposit_amount_locked. Spec §3 step 9, §8.3."
```

### Task 2.3: Update `src/app/api/foh/bookings/route.ts` — replace 7+ threshold (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/api/foh/bookings/route.ts`

- [ ] **Step 1: Locate the 7+ rule (around line 1052)**

```bash
grep -n "party_size >= 7\\|effectiveSundayLunch" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/foh/bookings/route.ts
```

- [ ] **Step 2: Replace with `requiresDeposit`**

```ts
// Top of file:
import { requiresDeposit, getCanonicalDeposit } from '@/lib/table-bookings/deposit';

// Around line 1052:
// BEFORE: const requiresDepositFlag = (effectiveSundayLunch || payload.party_size >= 7) && ...;
// AFTER:  const requiresDepositFlag = requiresDeposit(payload.party_size, { depositWaived: payload.deposit_waived === true });
//         // Note: effectiveSundayLunch retained ONLY where the FOH path explicitly creates legacy
//         // sunday_lunch bookings. The deposit decision uses the new generic threshold.
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/foh/bookings/route.ts
git commit -m "refactor(foh): replace 7+ deposit rule with requiresDeposit() helper

Spec §8.3. effectiveSundayLunch flag retained for legacy admin-creation paths only;
deposit-required decision now follows the generic 10+ rule with waiver support."
```

### Task 2.4: Update FOH hook `useFohCreateBooking.ts` (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts`

- [ ] **Step 1: Locate the threshold checks (around lines 230, 427)**

```bash
grep -n "party_size >= 7\\|sunday_lunch.*party_size" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/\(authenticated\)/table-bookings/foh/hooks/useFohCreateBooking.ts
```

- [ ] **Step 2: Replace both with `requiresDeposit`**

```ts
import { requiresDeposit } from '@/lib/table-bookings/deposit';

// Both sites:
// BEFORE: const needsDeposit = sunday_lunch || party_size >= 7;
// AFTER:  const needsDeposit = requiresDeposit(party_size, { depositWaived });
```

- [ ] **Step 3: Commit**

```bash
git add 'src/app/(authenticated)/table-bookings/foh/hooks/useFohCreateBooking.ts'
git commit -m "refactor(foh): hook uses requiresDeposit() instead of 7+ rule

Spec §8.3."
```

### Task 2.5: Update FOH modal `FohCreateBookingModal.tsx` (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx`

- [ ] **Step 1: Locate the Sunday-lunch checkbox (around line 397) and the "7+" copy (around line 647)**

```bash
grep -n 'sunday_lunch\\|7 or more\\|7\\+\\|bookings of 7' /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/\(authenticated\)/table-bookings/foh/components/FohCreateBookingModal.tsx
```

- [ ] **Step 2: Apply edits**

- Sunday lunch checkbox: relabel to "Legacy Sunday lunch (admin)"; default `disabled={true}`; add a small note "Legacy admin-only — new bookings should not use this." Keep the field functional for staff who need to create historical-format records.
- "Sunday lunch and bookings of 7+" copy at ~line 647: change to "Bookings of 10 or more".

```tsx
// Checkbox label:
<Checkbox
  label="Legacy Sunday lunch (admin)"
  helpText="Legacy admin-only — new public bookings never use this. Disabled by default."
  disabled={!showLegacyToggle}  // Add a hidden toggle accessible via keyboard for legacy creation if absolutely needed
  ...
/>

// Threshold copy:
// BEFORE: "Sunday lunch and bookings of 7+ require a £10 per person deposit."
// AFTER:  "Bookings of 10 or more require a £10 per person deposit."
```

- [ ] **Step 3: Commit**

```bash
git add 'src/app/(authenticated)/table-bookings/foh/components/FohCreateBookingModal.tsx'
git commit -m "refactor(foh): relabel Sunday-lunch checkbox as legacy admin-only, threshold copy 10+

Spec §8.3. Sunday-lunch creation path stays available for legacy data entry but is
visually demoted; threshold copy aligns with new rule."
```

### Task 2.6: Audit `FohTimeline.tsx` for Sunday-lunch surfaces (Spec §8.3)

**Files:**
- Read + possibly modify: `MGMT: src/app/(authenticated)/table-bookings/foh/components/FohTimeline.tsx`

- [ ] **Step 1: Search for Sunday-specific labels**

```bash
grep -n -i "sunday lunch\\|sunday roast\\|sunday_lunch" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/\(authenticated\)/table-bookings/foh/components/FohTimeline.tsx
```

- [ ] **Step 2: For any customer-impacting label, replace with generic copy**

E.g. "Sunday lunch covers" → "Food covers". Tags showing booking type can keep `booking_type === 'sunday_lunch'` legacy badge if helpful for staff visibility.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/(authenticated)/table-bookings/foh/components/FohTimeline.tsx' || true
git commit -m "refactor(foh): audit timeline for Sunday-specific labels (no/minor changes)" --allow-empty
```

### Task 2.7: Update party-size route — respect locked amount, drop 7+ (Spec §3 step 9, §8.3)

**Files:**
- Modify: `MGMT: src/app/api/boh/table-bookings/[id]/party-size/route.ts`

- [ ] **Step 1: Locate `DEPOSIT_THRESHOLD = 7` (line 104) + the SMS deposit-link path**

- [ ] **Step 2: Apply edits**

```ts
import { requiresDeposit, getCanonicalDeposit } from '@/lib/table-bookings/deposit';

// Replace the constant:
// BEFORE: const DEPOSIT_THRESHOLD = 7;
// AFTER:  // Threshold lives in the deposit helper now — use requiresDeposit().

// On party-size change:
const newRequiresDeposit = requiresDeposit(newPartySize, { depositWaived: booking.deposit_waived === true });
const canonicalAmount = getCanonicalDeposit(booking, newPartySize);
// If a locked amount exists, never recompute. SMS deposit-link uses canonicalAmount.
```

Crossing the threshold downward (e.g. 11 → 9): the locked amount stays. Staff handles refunds out of band if needed.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/api/boh/table-bookings/[id]/party-size/route.ts'
git commit -m "refactor(party-size): use canonical deposit on resize; SMS link reads canonical

Spec §8.3. Locked amounts preserved on party-size change; new threshold is 10+;
SMS deposit-link path no longer recomputes from party_size."
```

### Task 2.8: Update `sunday-preorder.ts` — gate persistence on legacy `booking_type` (Spec §8.3)

**Files:**
- Modify: `MGMT: src/lib/table-bookings/sunday-preorder.ts`

- [ ] **Step 1: Read the file**

```bash
$EDITOR /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/lib/table-bookings/sunday-preorder.ts
```

- [ ] **Step 2: Add a guard so `saveSundayPreorderByBookingId` is a no-op (with warning) when called for a non-`sunday_lunch` booking**

```ts
// Inside saveSundayPreorderByBookingId, after fetching the booking:
if (booking.booking_type !== 'sunday_lunch') {
  console.warn(`[sunday-preorder] Refusing to persist pre-order for non-legacy booking ${booking.id} (booking_type=${booking.booking_type}). New flow does not use pre-orders.`);
  return { saved: 0, skipped_non_legacy: true };
}
// ... existing persistence logic ...
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/table-bookings/sunday-preorder.ts
git commit -m "fix(preorder): refuse to persist pre-orders for non-legacy bookings

Spec §8.3. Defence-in-depth: saveSundayPreorderByBookingId now silently no-ops
(with warning log) when called for booking_type != 'sunday_lunch'. New public
flow never reaches this code path."
```

### Task 2.9: Audit `manage-booking.ts` for deposit-touching paths (Spec §3 step 9)

**Files:**
- Read + modify if needed: `MGMT: src/lib/table-bookings/manage-booking.ts`

- [ ] **Step 1: Search**

```bash
grep -n "deposit_amount\\|party_size.*\\*\\|partySize \\*" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/lib/table-bookings/manage-booking.ts
```

- [ ] **Step 2: For any blind-compute site, swap to `getCanonicalDeposit`**

If no sites found, commit empty.

- [ ] **Step 3: Commit**

```bash
git add src/lib/table-bookings/manage-booking.ts || true
git commit -m "refactor(manage-booking): audit deposit paths (no/minor changes)" --allow-empty
```

---

## Section 3 — Management app: Payment surfaces

### Task 3.1: Update PayPal create-order — read canonical, never overwrite locked (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts`

- [ ] **Step 1: Locate line 62 (recompute) + line 24 (select)**

- [ ] **Step 2: Apply edits**

```ts
import { getCanonicalDeposit } from '@/lib/table-bookings/deposit';

// Around line 24 — keep the select but ensure deposit_amount_locked is included:
.select('id, party_size, deposit_amount, deposit_amount_locked, payment_status, paypal_deposit_capture_id, status, deposit_waived, booking_type')

// Around line 62:
// BEFORE: const depositAmount = booking.party_size * 10;
// AFTER:  const depositAmount = getCanonicalDeposit(booking, booking.party_size);
//         if (depositAmount <= 0) {
//           return NextResponse.json({ error: 'No deposit required for this booking.' }, { status: 400 });
//         }

// Do NOT overwrite booking.deposit_amount from this route. Remove any
// `.update({ deposit_amount: ... })` call that was previously here.
```

- [ ] **Step 3: Commit**

```bash
git add 'src/app/api/external/table-bookings/[id]/paypal/create-order/route.ts'
git commit -m "fix(paypal): create-order reads canonical deposit; never overwrites locked

Spec §8.3. Stops blind party_size * 10 recompute. Reads getCanonicalDeposit()
which honours deposit_amount_locked. Removes the .update() that previously
overwrote stored deposit_amount."
```

### Task 3.2: Update PayPal capture-order — write `deposit_amount_locked` from PayPal API response (Spec §6, §7.4, §8.3)

**Files:**
- Modify: `MGMT: src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts`

- [ ] **Step 1: Read the file (around line 84 — UPDATE statement)**

- [ ] **Step 2: Extend the UPDATE to write `deposit_amount_locked` from the PayPal capture response**

Locate the call that captures the PayPal order (likely something like `capturePayPalPayment(orderId)` returning `{ amount, currency, captureId, ... }`). Extract the captured GBP amount.

```ts
const captureResult = await capturePayPalPayment(/* ... */);
const capturedGbpAmount = parseCapturedAmountGbp(captureResult); // helper — see fail-closed handling below

if (capturedGbpAmount === null) {
  // Fail closed — do NOT silently fall back to booking.deposit_amount.
  // Log, alert, and return an error so staff can investigate.
  console.error('[paypal-capture] Capture succeeded but no parseable GBP amount in response', { bookingId, captureResult });
  return NextResponse.json({
    error: 'Payment captured but amount could not be verified. Please contact support; do not retry.',
  }, { status: 502 });
}

await supabase
  .from('table_bookings')
  .update({
    payment_status: 'completed',
    paypal_deposit_capture_id: captureResult.captureId,
    deposit_amount_locked: capturedGbpAmount, // NEW — locks the actually-captured amount
    // existing fields retained
  })
  .eq('id', bookingId);
```

Implement `parseCapturedAmountGbp(captureResult)` to extract `purchase_units[0].payments.captures[0].amount.value` (PayPal's standard shape). Return `null` if missing/invalid; the caller fails closed.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/api/external/table-bookings/[id]/paypal/capture-order/route.ts'
git commit -m "feat(paypal): capture-order writes deposit_amount_locked from PayPal response

Spec §6, §7.4, §8.3. On successful capture, locks the actually-captured GBP amount
(authoritative). Fails closed if no parseable amount — does NOT fall back to
booking.deposit_amount which could have drifted."
```

### Task 3.3: Stripe webhook — write `deposit_amount_locked` on payment_intent.succeeded (Spec §6, §8.3)

**Files:**
- Modify: existing Stripe webhook handler in `MGMT:` (search for `stripe` webhook routes)

- [ ] **Step 1: Locate the webhook handler**

```bash
grep -rln "stripe.webhooks.constructEvent\\|payment_intent.succeeded\\|stripe.Stripe(" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/ | head
```

- [ ] **Step 2: On `payment_intent.succeeded` for a `table_deposit`, write `deposit_amount_locked = event.data.object.amount_received / 100`**

Stripe returns `amount_received` in pence. Divide by 100 for GBP.

```ts
case 'payment_intent.succeeded': {
  const intent = event.data.object;
  if (intent.metadata?.charge_type === 'table_deposit' && intent.metadata?.table_booking_id) {
    const lockedGbp = (intent.amount_received ?? 0) / 100;
    await supabase
      .from('table_bookings')
      .update({
        payment_status: 'completed',
        deposit_amount_locked: lockedGbp,
        // existing fields ...
      })
      .eq('id', intent.metadata.table_booking_id);
  }
  break;
}
```

If the webhook handler doesn't exist for table deposits, document this in a comment and skip — this is a Phase 2 follow-up if Stripe deposits aren't actually used today. Confirm by searching for any `charge_type='table_deposit'` write paths that originate from Stripe.

- [ ] **Step 3: Commit**

```bash
git add <stripe webhook file path>
git commit -m "feat(stripe): webhook locks deposit_amount on payment_intent.succeeded

Spec §6, §8.3. Reads authoritative amount_received from Stripe event."
```

### Task 3.4: Token-payment magic-link page — read canonical, write lock on success (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/g/[token]/table-payment/...` (locate)

- [ ] **Step 1: Locate the token-payment page**

```bash
ls /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/g/\[token\]/table-payment/ 2>/dev/null
```

- [ ] **Step 2: Ensure displayed amount uses `getCanonicalDeposit` and successful payment writes `deposit_amount_locked`**

Same pattern as PayPal capture: extract the actually-captured amount from the provider's success response, write to `deposit_amount_locked`. Fail closed if no parseable amount.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/g/[token]/table-payment/'
git commit -m "feat(token-payment): canonical amount on display, lock on success"
```

### Task 3.5: Cash / manual deposit confirmation — write lock (Spec §6, §8.3)

**Files:**
- Modify: cash/manual confirmation handler (locate via `grep -rln 'cash.*deposit\\|manual.*deposit'` in MGMT src)

- [ ] **Step 1: Locate the handler. If it doesn't exist as a separate route, find the BOH path that confirms a manual deposit**

- [ ] **Step 2: When staff confirm a deposit, set `deposit_amount_locked = <staff-entered confirmed amount>`**

- [ ] **Step 3: Commit**

```bash
git add <cash confirmation file>
git commit -m "feat(cash-deposit): manual confirmation writes deposit_amount_locked"
```

---

## Section 4 — Management app: Admin views + business hours

### Task 4.1: Admin booking list — verify legacy display still works (defensive only — D11 = 0 conversions)

**Files:**
- Read: `MGMT: src/app/(authenticated)/table-bookings/` directory

- [ ] **Step 1: Spot-check that `booking_type='sunday_lunch'` rows render with the existing pre-order tab**

Open a list view in dev. Confirm the 31 May 2026 booking (TB-8229A1B4) renders normally with its pre-order tab visible.

- [ ] **Step 2: No code change needed — confirm with empty commit**

```bash
git commit --allow-empty -m "chore(admin): verify legacy sunday_lunch list display (no changes needed)"
```

### Task 4.2: Update PreorderTab — preserve display for both FOH and public-API legacy bookings (Spec §8.3)

**Files:**
- Modify: `MGMT: src/app/(authenticated)/table-bookings/[id]/PreorderTab.tsx`

- [ ] **Step 1: Read the component**

- [ ] **Step 2: Confirm it reads from `table_booking_items` AND parses pre-orders out of `special_requirements` text for public-API legacy bookings**

For the 31 May 2026 booking, the `special_requirements` field reads `Sunday lunch pre-order: Guest 1: Roasted Chicken x1`. Make sure the tab shows this clearly.

- [ ] **Step 3: Commit**

```bash
git add 'src/app/(authenticated)/table-bookings/[id]/PreorderTab.tsx'
git commit -m "fix(preorder-tab): parse pre-orders from special_requirements for legacy public-API bookings"
```

### Task 4.3: Kitchen reports — relabel "Sunday lunch covers" → "Food covers" (Spec §8.3)

**Files:**
- Modify: kitchen-report components (locate via grep)

- [ ] **Step 1: Search**

```bash
grep -rln "Sunday lunch covers\\|sunday_lunch.*report\\|kitchen.*sunday" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/\(authenticated\)/
```

- [ ] **Step 2: Relabel customer-impacting strings**

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(kitchen-reports): relabel 'Sunday lunch covers' → 'Food covers'"
```

### Task 4.4: CHANGE Sunday business_hours from 12pm-5pm to 1pm-6pm (Spec §6, §8.3)

**Files:**
- Modify: `MGMT: src/services/business-hours.ts` (or the data source — possibly a settings table)

- [ ] **Step 1: Locate where Sunday hours are defined**

```bash
grep -rn "12:00.*17:00\\|noon.*5pm\\|sunday.*open.*12\\|sunday.*close.*17\\|kitchen.*sunday" /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/services/business-hours.ts /Users/peterpitcher/Cursor/OJ-AnchorManagementTools/src/app/api/business/hours/route.ts 2>/dev/null
```

If hours are stored in a DB settings table, run a SQL update instead. If hardcoded in `business-hours.ts`, edit the file.

- [ ] **Step 2: Apply the change — Sunday: opens 13:00, closes 18:00, kitchen 13:00-18:00, last_bookable_arrival 17:30**

```ts
// If hardcoded:
sunday: {
  opens: '13:00',
  closes: '18:00',
  kitchen: { opens: '13:00', closes: '18:00' },
  last_bookable_arrival: '17:30',
  // legacy 12:00 / 17:00 / 16:30 removed
}
```

If DB-backed:

```sql
UPDATE public.business_hours
SET opens_at = '13:00:00', closes_at = '18:00:00',
    kitchen_opens_at = '13:00:00', kitchen_closes_at = '18:00:00'
WHERE day_of_week = 0; -- Sunday
```

- [ ] **Step 3: Verify via the API**

```bash
# Hit the /api/business/hours endpoint (dev or staging)
curl -s "http://localhost:3000/api/business/hours" | jq '.regularHours.sunday'
```

Expected: opens 13:00, closes 18:00.

- [ ] **Step 4: Commit**

```bash
git add src/services/business-hours.ts || true
git commit -m "feat(hours): change Sunday service window 12-5pm → 1-6pm

Spec §6 (confirmed change), §8.3. Last bookable arrival 17:30; kitchen serves
until 18:00. Customer-visible hours change — content sweep on website handles
copy across all surfaces."
```

If DB-backed, capture the SQL in a tracked migration file or note in `D9` operational handover.

### Task 4.5: Verify `/api/business/hours` returns the new window in staging post-deploy

- [ ] **Step 1: Smoke test**

```bash
curl -s "$STAGING_URL/api/business/hours" | jq '.regularHours.sunday'
```

Expected: `opens: "13:00", closes: "18:00"`.

---

## Section 5 — Management app: Tests

### Task 5.1: Update `tests/api/booking-submit-deposit.test.ts` — replace 7+ thresholds with 10+

**Files:**
- Modify: `MGMT: tests/api/booking-submit-deposit.test.ts`

- [ ] **Step 1: Find every `party_size: 7` / `party_size: 8` / `party_size: 9` assertion expecting deposit**

- [ ] **Step 2: Update party-size boundaries: 9 → no deposit, 10 → deposit. Replace `sunday_lunch: true` fixtures with `purpose: 'food'`**

- [ ] **Step 3: Run; expect pass**

```bash
npx vitest run tests/api/booking-submit-deposit.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add tests/api/booking-submit-deposit.test.ts
git commit -m "test(deposits): update fixtures to 10+ threshold and purpose-based bookings"
```

### Task 5.2: Update `tests/lib/sundayPreorderMutationGuards.test.ts` — only legacy `sunday_lunch` triggers (Spec §8.11)

**Files:**
- Modify: `MGMT: tests/lib/sundayPreorderMutationGuards.test.ts`

- [ ] **Step 1: Add a test asserting non-legacy bookings are silently skipped**

- [ ] **Step 2: Run + commit**

```bash
git add tests/lib/sundayPreorderMutationGuards.test.ts
git commit -m "test(preorder): add coverage for non-legacy skip behaviour"
```

### Task 5.3: New PayPal create-order test — canonical-amount precedence

**Files:**
- Create: `MGMT: tests/api/paypalCreateOrderTableBooking.test.ts`

- [ ] **Step 1: Cases**

- locked amount wins regardless of party size
- stored amount wins when in pending_payment state
- fresh compute when no prior amount
- fail when no deposit required

- [ ] **Step 2: Run + commit**

```bash
git add tests/api/paypalCreateOrderTableBooking.test.ts
git commit -m "test(paypal-create): canonical-amount precedence and zero-deposit guard"
```

### Task 5.4: New PayPal capture-order regression test — selects `booking_type`, writes lock

**Files:**
- Create: `MGMT: tests/api/paypalCaptureOrderTableBooking.test.ts`

- [ ] **Step 1: Cases**

- Asserts the SELECT lists `booking_type` (not `sunday_lunch`)
- Asserts `deposit_amount_locked` is written to the captured amount on success
- Asserts fail-closed when amount is missing/unparseable from PayPal response

- [ ] **Step 2: Run + commit**

```bash
git add tests/api/paypalCaptureOrderTableBooking.test.ts
git commit -m "test(paypal-capture): regression on column selection + new lock-write behaviour"
```

### Task 5.5: New legacy payment link test — locked amount or fail cleanly (Spec §8.10)

**Files:**
- Create: `MGMT: tests/api/legacy-payment-link.test.ts`

- [ ] **Step 1: Cases**

- Existing token URL/SMS link for a paid booking charges the locked amount.
- Same link for a now-orphaned booking (e.g. legacy unpaid converted) returns a clear 410 / "expired" response.

- [ ] **Step 2: Run + commit**

```bash
git add tests/api/legacy-payment-link.test.ts
git commit -m "test(legacy-link): locked-amount charge or clear staff-recovery fail"
```

### Task 5.6: New DB integration tests — RPC threshold + backfill correctness (Spec §8.11)

**Files:**
- Create: `MGMT: tests/db/v05-rpc-threshold.test.ts`
- Create: `MGMT: tests/db/v05-core-rpc-threshold.test.ts`
- Create: `MGMT: tests/db/legacy-deposit-lock.test.ts`

- [ ] **Step 1: Cases per file**

- `v05-rpc-threshold`: party 9 → confirmed; party 10 → pending_payment; party 10 + waived → confirmed; Sunday + non-legacy → no cutoff.
- `v05-core-rpc-threshold`: same but invoked via the core path.
- `legacy-deposit-lock`: backfill matches the expected three sources (payment_status, paypal_capture_id, payments.amount); party-size edit doesn't overwrite locked.

- [ ] **Step 2: Run + commit each**

```bash
git add tests/db/
git commit -m "test(db): RPC threshold (v05 + core) and legacy deposit lock"
```

---

## Section 6 — Management app: Deploy

### Task 6.1: Run all tests + lint + typecheck + build

- [ ] **Step 1**

```bash
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
npm run lint && npx tsc --noEmit && npm test && npm run build
```

All must pass with zero warnings.

### Task 6.2: Push migrations to staging and smoke test

- [ ] **Step 1**

```bash
npx supabase db push --linked
```

- [ ] **Step 2: Run the verification queries from Task 1.2 Step 4 against staging**

### Task 6.3: Deploy management code to staging

- [ ] **Step 1: Trigger staging deploy via Vercel (or whatever the management app uses)**

- [ ] **Step 2: Smoke test from §8.9 of the spec**

- Sunday food party 9 booking → no deposit
- Sunday food party 10 booking → deposit; PayPal flow completes; `deposit_amount_locked = £100`
- Edit a legacy `sunday_lunch` booking party size → locked amount preserved

### Task 6.4: Push migrations + code to production

- [ ] **Step 1**

```bash
# DB migration
npx supabase db push --linked --db-url "$PROD_DB_URL"

# Then deploy code via Vercel promote / production push
```

- [ ] **Step 2: Run the Migration A Step 3 verification SELECT against prod — expect zero rows**

- [ ] **Step 3: Spot-check the 31 May 2026 booking in admin: `deposit_amount_locked = 10.00` and pre-order tab visible**

### Task 6.5: Confirm production smoke tests pass before website deploys

Per spec §8.9: management app must be ≥24h ahead of website.

```bash
# Tag the management deploy
cd /Users/peterpitcher/Cursor/OJ-AnchorManagementTools
git tag mgmt-sunday-walk-in-launch
git push origin mgmt-sunday-walk-in-launch
```

---

## Section 7 — Website: Constants and helpers

### Task 7.1: Update `lib/constants.ts` — rename, new helpers, copy, banner constants (Spec §8.1)

**Files:**
- Modify: `WEB: lib/constants.ts`

- [ ] **Step 1: Read the file**

- [ ] **Step 2: Apply edits**

```ts
// Rename:
// BEFORE: export const SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP = 10;
// AFTER:  export const LARGE_GROUP_DEPOSIT_PER_PERSON_GBP = 10;
//         export const LARGE_GROUP_DEPOSIT_THRESHOLD = 10;

// Replace getSundayLunchDepositAmount with computeLargeGroupDepositAmount:
export function requiresDeposit(partySize: number): boolean {
  return partySize >= LARGE_GROUP_DEPOSIT_THRESHOLD;
}

export function computeLargeGroupDepositAmount(partySize: number): number {
  return requiresDeposit(partySize) ? partySize * LARGE_GROUP_DEPOSIT_PER_PERSON_GBP : 0;
}

// DO NOT add getCanonicalDeposit here — that helper lives only in the management app.

// Replace SUNDAY_LUNCH_DEPOSIT_POLICY_COPY:
export const LARGE_GROUP_DEPOSIT_POLICY_COPY =
  "Groups of 10 or more: we'll take a £10 per person deposit, fully deducted from your bill on the day.";

// Remove SUNDAY_ROAST copy constants that mention pre-order / 1pm Saturday entirely.

// Add launch banner constants:
export const WALK_IN_LAUNCH_STARTS_AT_MS = new Date('2026-05-17T00:00:00+01:00').getTime();
export const WALK_IN_LAUNCH_BANNER_ENDS_AT_MS = new Date('2026-05-17T18:00:00+01:00').getTime();
```

- [ ] **Step 3: Search for and update every importer of the renamed exports**

```bash
grep -rln "SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP\\|getSundayLunchDepositAmount\\|SUNDAY_LUNCH_DEPOSIT_POLICY_COPY\\|SUNDAY_ROAST" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx'
```

Update each importer to the new name.

- [ ] **Step 4: Type-check**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/constants.ts <other importers>
git commit -m "refactor(constants): rename Sunday deposit constants → generic large-group, add walk-in launch constants

- LARGE_GROUP_DEPOSIT_PER_PERSON_GBP / LARGE_GROUP_DEPOSIT_THRESHOLD
- requiresDeposit() / computeLargeGroupDepositAmount() helpers
- LARGE_GROUP_DEPOSIT_POLICY_COPY warm copy
- WALK_IN_LAUNCH_STARTS_AT_MS / WALK_IN_LAUNCH_BANNER_ENDS_AT_MS

Spec §7.6, §8.1. Website does NOT get getCanonicalDeposit (no DB access)."
```

---

## Section 8 — Website: LaunchAnnouncement component

### Task 8.1: Create `components/announcements/LaunchAnnouncement.tsx` (Spec §7.6, §8.5)

**Files:**
- Create: `WEB: components/announcements/LaunchAnnouncement.tsx`
- Create: `WEB: components/announcements/__tests__/LaunchAnnouncement.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// components/announcements/__tests__/LaunchAnnouncement.test.tsx
import { render, screen, act } from '@testing-library/react';
import { LaunchAnnouncement } from '../LaunchAnnouncement';

const MAY_16_BST = new Date('2026-05-16T23:30:00+01:00').getTime();
const MAY_17_AT_NOON_BST = new Date('2026-05-17T12:00:00+01:00').getTime();
const MAY_17_AT_19_BST = new Date('2026-05-17T19:00:00+01:00').getTime();

describe('LaunchAnnouncement', () => {
  let originalNow: () => number;
  beforeEach(() => {
    originalNow = Date.now;
  });
  afterEach(() => {
    Date.now = originalNow;
    jest.useRealTimers();
  });

  it('renders pre-launch copy before May 17 BST', () => {
    Date.now = () => MAY_16_BST;
    render(<LaunchAnnouncement variant="banner" />);
    expect(screen.getByText(/Sunday lunch walk-ins start 17 May 2026/i)).toBeInTheDocument();
  });

  it('renders launch-day copy between 17 May 00:00 and 18:00 BST', () => {
    Date.now = () => MAY_17_AT_NOON_BST;
    render(<LaunchAnnouncement variant="hero" />);
    expect(screen.getByText(/Walk-ins welcome today from 1pm/i)).toBeInTheDocument();
  });

  it('renders nothing after 17 May 18:00 BST', () => {
    Date.now = () => MAY_17_AT_19_BST;
    const { container } = render(<LaunchAnnouncement variant="slim" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('client child re-checks expiry on interval and switches', () => {
    jest.useFakeTimers();
    Date.now = () => MAY_16_BST;
    render(<LaunchAnnouncement variant="banner" />);
    expect(screen.getByText(/walk-ins start 17 May/i)).toBeInTheDocument();

    Date.now = () => MAY_17_AT_NOON_BST;
    act(() => { jest.advanceTimersByTime(60_000); });
    expect(screen.getByText(/today from 1pm/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect fail**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npx jest components/announcements/__tests__/LaunchAnnouncement.test.tsx
```

- [ ] **Step 3: Implement the component**

```tsx
// components/announcements/LaunchAnnouncement.tsx
import { LaunchAnnouncementClient } from './LaunchAnnouncementClient';
import { WALK_IN_LAUNCH_STARTS_AT_MS, WALK_IN_LAUNCH_BANNER_ENDS_AT_MS } from '@/lib/constants';

export type LaunchAnnouncementVariant = 'hero' | 'banner' | 'slim';

export interface LaunchAnnouncementProps {
  variant: LaunchAnnouncementVariant;
}

const PRE_LAUNCH_COPY = 'Sunday lunch walk-ins start 17 May 2026, 1pm-6pm. Until then, our kitchen is open on Sundays with our weekday menu.';
const LAUNCH_DAY_COPY = 'Walk-ins welcome today from 1pm — turn up between 1pm-6pm or book ahead';

function pickCopy(now: number): string | null {
  if (now >= WALK_IN_LAUNCH_BANNER_ENDS_AT_MS) return null;
  if (now < WALK_IN_LAUNCH_STARTS_AT_MS) return PRE_LAUNCH_COPY;
  return LAUNCH_DAY_COPY;
}

const VARIANT_CLASSES: Record<LaunchAnnouncementVariant, string> = {
  hero: 'mt-4 rounded-lg bg-anchor-gold/15 px-6 py-3 text-base font-semibold text-anchor-gold-vivid',
  banner: 'rounded-md bg-anchor-gold/10 px-4 py-2 text-sm text-anchor-cream-text',
  slim: 'border-t border-anchor-gold/20 px-3 py-1.5 text-xs text-anchor-cream-text/80',
};

export function LaunchAnnouncement({ variant }: LaunchAnnouncementProps) {
  const initialCopy = pickCopy(Date.now());
  return (
    <LaunchAnnouncementClient
      variant={variant}
      initialCopy={initialCopy}
      className={VARIANT_CLASSES[variant]}
      preLaunchCopy={PRE_LAUNCH_COPY}
      launchDayCopy={LAUNCH_DAY_COPY}
      startsAtMs={WALK_IN_LAUNCH_STARTS_AT_MS}
      endsAtMs={WALK_IN_LAUNCH_BANNER_ENDS_AT_MS}
    />
  );
}
```

```tsx
// components/announcements/LaunchAnnouncementClient.tsx
'use client';
import { useEffect, useState } from 'react';
import type { LaunchAnnouncementVariant } from './LaunchAnnouncement';

interface LaunchAnnouncementClientProps {
  variant: LaunchAnnouncementVariant;
  initialCopy: string | null;
  className: string;
  preLaunchCopy: string;
  launchDayCopy: string;
  startsAtMs: number;
  endsAtMs: number;
}

export function LaunchAnnouncementClient({
  initialCopy,
  className,
  preLaunchCopy,
  launchDayCopy,
  startsAtMs,
  endsAtMs,
}: LaunchAnnouncementClientProps) {
  const [copy, setCopy] = useState<string | null>(initialCopy);

  useEffect(() => {
    function recompute() {
      const now = Date.now();
      if (now >= endsAtMs) return setCopy(null);
      if (now < startsAtMs) return setCopy(preLaunchCopy);
      return setCopy(launchDayCopy);
    }
    recompute();
    const id = setInterval(recompute, 60_000);
    return () => clearInterval(id);
  }, [startsAtMs, endsAtMs, preLaunchCopy, launchDayCopy]);

  if (!copy) return null;
  return <div role="status" aria-live="polite" className={className}>{copy}</div>;
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx jest components/announcements/__tests__/LaunchAnnouncement.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add components/announcements/
git commit -m "feat(launch): add LaunchAnnouncement component with cache-aware date variants

Server renders pre-launch / launch-day copy or hides post-18:00 BST 17 May.
Client child re-checks every 60s for cached pages. Spec §7.6, §8.5."
```

---

## Section 9 — Website: Booking flow refactor (the live path)

### Task 9.1: Update `ManagementTableBookingForm.tsx` — strip Sunday/cutoff/Mother's Day, add PayPal-failure recovery (Spec §8.1)

**Files:**
- Modify: `WEB: components/features/TableBooking/ManagementTableBookingForm.tsx`

This is the largest single change. The file is ~2700 lines. Apply edits one section at a time, committing after each focused change so the diff is reviewable.

- [ ] **Step 1: Remove imports of stripped helpers (line 11-13)**

```tsx
// REMOVE these imports:
import { isMothersDayEvent, MOTHERS_DAY_DEFAULT_TIME, MOTHERS_DAY_SERVICE_DATE } from '@/lib/mothers-day-booking';
import { SUNDAY_LUNCH_DEPOSIT_PER_PERSON_GBP, getSundayLunchDepositAmount } from '@/lib/constants';
import { getSundayLunchCutoffDate, hasSundayLunchCutoffPassed } from '@/lib/sunday-lunch-cutoff';

// ADD:
import { LARGE_GROUP_DEPOSIT_PER_PERSON_GBP, computeLargeGroupDepositAmount, requiresDeposit, LARGE_GROUP_DEPOSIT_POLICY_COPY } from '@/lib/constants';
```

Commit:

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx
git commit -m "refactor(form): drop Sunday/cutoff/Mother's Day imports, add generic deposit imports"
```

- [ ] **Step 2: Remove `sundayLunch` and `mothersDay` from prefill interface (lines 102-109)**

```tsx
// BEFORE:
interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
    purpose?: BookingPurpose
    sundayLunch?: boolean
    mothersDay?: boolean
  }
}

// AFTER:
interface ManagementTableBookingFormProps {
  prefill?: {
    date?: string
    time?: string
    partySize?: number
    purpose?: BookingPurpose
  }
}
```

Search for every `prefill.sundayLunch` and `prefill.mothersDay` reference in the component and remove the dependent code branches.

Commit:

```bash
git commit -am "refactor(form): drop sundayLunch and mothersDay prefill plumbing"
```

- [ ] **Step 3: Remove `sundayLunchCutoffPassed` computation (around line 603)**

Locate the `sundayLunchCutoffPassed` const and every conditional branch that uses it (the Sunday plans selector visibility, the cutoff messaging, etc.). Remove all of them.

Commit:

```bash
git commit -am "refactor(form): remove sundayLunchCutoffPassed and its conditional branches"
```

- [ ] **Step 4: Replace `partySize >= 7` deposit gate with `requiresDeposit(partySize)` (around line 608)**

```tsx
// BEFORE:
const showDeposit = bookingType === 'sunday_lunch' || partySize >= 7;

// AFTER:
const showDeposit = requiresDeposit(partySize);
```

Commit:

```bash
git commit -am "fix(form): deposit gating uses requiresDeposit() — 10+ rule"
```

- [ ] **Step 5: Remove the Sunday plans selector UI (around line 2042)**

Locate the JSX block that renders the "Choose Sunday lunch" toggle/picker. Delete the block. Verify the rest of the form layout is unaffected.

Commit:

```bash
git commit -am "refactor(form): remove Sunday plans selector UI"
```

- [ ] **Step 6: Remove cutoff messaging (lines 1646, 2094, 2069)**

Strings to remove:
- "Mother's Day Sunday lunch pre-orders closed"
- "Sunday lunch pre-orders close at 1pm on {date}"
- "pre-order now"

Commit:

```bash
git commit -am "refactor(form): remove pre-order cutoff messaging strings"
```

- [ ] **Step 7: Replace "groups of 7 or more" copy (around line 2264)**

```tsx
// BEFORE: "groups of 7 or more"
// AFTER:  "groups of 10 or more"
```

Commit:

```bash
git commit -am "refactor(form): copy 'groups of 7 or more' → 'groups of 10 or more'"
```

- [ ] **Step 8: Replace deposit-explanation copy with `LARGE_GROUP_DEPOSIT_POLICY_COPY`**

Locate any "A £10 per person deposit is required..." text. Replace with the warm copy from constants.

Commit:

```bash
git commit -am "refactor(form): warm deposit copy via LARGE_GROUP_DEPOSIT_POLICY_COPY"
```

- [ ] **Step 9: Add courteous no-show messaging on the review/confirm step**

```tsx
// In the review step JSX, add below the booking summary:
<p className="mt-3 text-sm text-anchor-cream-text/70">
  Plans changed? A quick call to <a href="tel:01753682707">01753 682707</a> lets us
  offer your table to someone else. Thanks for letting us know.
</p>
```

Commit:

```bash
git commit -am "feat(form): courteous no-show messaging on review step"
```

- [ ] **Step 10: Add PayPal-failure recovery state**

When the booking response contains `payment_required: true` AND the inline PayPal flow fails (e.g. SDK fails to load, order setup returns error), render a recovery state showing both "call us" and the `fallback_payment_url` from the response.

```tsx
// Where the form handles inline-PayPal failure:
const fallbackUrl = bookingResult.fallback_payment_url ?? null;
return (
  <Alert variant="warning">
    <p>We couldn't open the PayPal payment automatically. Two ways to finish your booking:</p>
    <ul className="mt-2 list-disc pl-6">
      <li>Call us on <a href="tel:01753682707">01753 682707</a> — we'll take payment over the phone.</li>
      {fallbackUrl && (
        <li>
          Or open the secure payment link we've sent to your phone, or click here:{' '}
          <a href={fallbackUrl} className="font-semibold underline">Complete your deposit</a>.
        </li>
      )}
    </ul>
    <p className="mt-2 text-xs">Your table is held while you complete payment.</p>
  </Alert>
);
```

Commit:

```bash
git commit -am "feat(form): PayPal-failure recovery — call-us + fallback_payment_url fallback"
```

- [ ] **Step 11: Run tests**

```bash
npm test -- components/features/TableBooking/
```

Update tests as needed (Task 14.1+).

### Task 9.2: Update `app/api/table-bookings/route.ts` — drop cutoff, drop Sunday-lunch derivation, strip booking_type (Spec §8.1)

**Files:**
- Modify: `WEB: app/api/table-bookings/route.ts`

- [ ] **Step 1: Remove imports**

```ts
// REMOVE:
import { getSundayLunchCutoffDate, hasSundayLunchCutoffPassed, isSundayIsoDate } from '@/lib/sunday-lunch-cutoff';
```

- [ ] **Step 2: Update `normaliseIncomingPayload` — stop deriving `sundayLunch`, drop `sunday_lunch` and `booking_type` from output**

```ts
// Locate (lines 205-206):
// BEFORE:
const sundayLunch = body.sunday_lunch === true || body.booking_type === 'sunday_lunch';

// AFTER:
// Public payloads never carry booking_type or sunday_lunch — both are stripped
// regardless of inbound value. Defence in depth against hostile/stale clients.
const sundayLunch = false;
```

In the output payload builder, do NOT include `sunday_lunch`, `sunday_preorder_items`, or any `booking_type` field. Always emit `booking_type: 'regular'` to the management API.

- [ ] **Step 3: Remove the entire "Enforce Sunday lunch pre-order cutoff" block (lines 326-340)**

- [ ] **Step 4: Replace `bookingType` derivation (line 343)**

```ts
// BEFORE:
const bookingType = normalized.payload.sunday_lunch === true ? 'sunday_lunch' : 'regular';
const bookingPurpose = normalized.payload.sunday_lunch === true ? 'food' : normalized.payload.purpose;

// AFTER:
const bookingType: BookingType = 'regular';
const bookingPurpose = normalized.payload.purpose;
```

- [ ] **Step 5: Remove `buildSundayPreorderItems` and `buildMenuSelectionFallbackNote` helpers and any callers**

- [ ] **Step 6: Run lint + typecheck + commit**

```bash
npm run lint && npx tsc --noEmit
git add app/api/table-bookings/route.ts
git commit -m "refactor(proxy): drop Sunday cutoff, strip sunday_lunch + booking_type from inbound payloads

Defence in depth — hostile/stale clients sending booking_type='sunday_lunch' or
sunday_lunch=true are silently neutralised. Always forwards booking_type='regular'.
Spec §8.1."
```

### Task 9.3: Update `app/api/booking/agent/route.ts` — drop Sunday defaulting (Spec §8.1)

**Files:**
- Modify: `WEB: app/api/booking/agent/route.ts`

- [ ] **Step 1: POST handler edits**

```ts
// Around line 72:
// BEFORE: const bookingType: BookingType = requestedType || (isSunday ? 'sunday_lunch' : 'regular');
// AFTER:  const bookingType: BookingType = 'regular';

// Around line 74:
// BEFORE: const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose;
// AFTER:  const purpose: BookingPurpose = requestedPurpose;
```

- [ ] **Step 2: GET handler edits (around lines 215-217)**

Same pattern: drop the Sunday-defaulting.

- [ ] **Step 3: Replace special-instructions block (around lines 156-161)**

```ts
// BEFORE:
specialInstructions: isSunday && bookingType === 'sunday_lunch'
  ? (body.partySize >= 7
      ? 'Sunday lunch roasts must be pre-ordered by 1pm Saturday. Bookings of 7+ require a £10 per person deposit...'
      : 'Sunday lunch roasts must be pre-ordered by 1pm Saturday. A £10 per person deposit is required...'
    )
  : null

// AFTER:
specialInstructions: body.partySize >= 10
  ? 'Bookings of 10 or more require a £10 per person deposit, fully deducted from your bill on the day.'
  : null
```

- [ ] **Step 4: Commit**

```bash
git add app/api/booking/agent/route.ts
git commit -m "refactor(agent): drop Sunday-lunch defaulting; deposit messaging only at 10+

Spec §8.1. AI agent endpoint now treats every day equally; no \"1pm Saturday\"
or \"7+\" copy in special instructions."
```

### Task 9.4: Update `app/api/table-bookings/availability/route.ts` (Spec §8.1)

**Files:**
- Modify: `WEB: app/api/table-bookings/availability/route.ts`

- [ ] **Step 1: Edits**

```ts
// Around line 80:
// BEFORE: const bookingType: BookingType =
//           searchParams.get('booking_type') === 'sunday_lunch' ? 'sunday_lunch' : 'regular';
// AFTER:  const bookingType: BookingType = 'regular'; // accept the param but always treat as regular

// Around line 84:
// BEFORE: const purpose: BookingPurpose = bookingType === 'sunday_lunch' ? 'food' : requestedPurpose;
// AFTER:  const purpose: BookingPurpose = requestedPurpose;

// Lines 118-125 — REMOVE the entire "also resolve sunday_lunch ranges" block.
// Drop sunday_lunch_available from the response.
```

- [ ] **Step 2: Commit**

```bash
git add app/api/table-bookings/availability/route.ts
git commit -m "refactor(availability): drop sunday_lunch param branch and sunday_lunch_available flag

Spec §8.1."
```

### Task 9.5: `app/api/booking/submit/route.ts` — refactor or DELETE (Spec OQ2)

**Files:**
- Possibly delete: `WEB: app/api/booking/submit/route.ts`

- [ ] **Step 1: Confirm reachability**

```bash
grep -rln "/api/booking/submit\\|api/booking/submit" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx'
```

- [ ] **Step 2: If only the dead BookingWizard imports it: delete after confirming production logs show zero traffic in the last 30 days**

- [ ] **Step 3: If still reachable: refactor (mirror the Task 9.2 changes for this route's payload shape)**

- [ ] **Step 4: Commit**

```bash
# Delete branch:
git rm app/api/booking/submit/route.ts
git commit -m "chore: remove dead /api/booking/submit route (only Wizard caller; Wizard is being deleted)"

# OR refactor branch:
git add app/api/booking/submit/route.ts
git commit -m "refactor(submit): drop Sunday derivation, replace 7+ with requiresDeposit"
```

---

## Section 10 — Website: Cleanup deletes

### Task 10.1: Delete `lib/sunday-lunch-cutoff.ts` (Spec §8.1)

- [ ] **Step 1: Confirm zero remaining imports**

```bash
grep -rln "sunday-lunch-cutoff\\|hasSundayLunchCutoffPassed\\|getSundayLunchCutoffDate\\|isSundayIsoDate" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx'
```

Expected: zero results after Tasks 9.2-9.5.

- [ ] **Step 2: Delete + commit**

```bash
git rm lib/sunday-lunch-cutoff.ts
git commit -m "chore: delete lib/sunday-lunch-cutoff.ts — no remaining imports"
```

### Task 10.2: Delete dead BookingWizard files (Spec §8.8)

- [ ] **Step 1: Confirm zero imports of any Wizard component**

```bash
grep -rln "BookingWizard\\|WizardStep" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx' | grep -v 'components/features/BookingWizard'
```

Expected: zero results outside the directory.

- [ ] **Step 2: Delete the directory**

```bash
git rm -r components/features/BookingWizard/
git commit -m "chore: delete dead BookingWizard implementation (zero imports)

The live customer booking form is ManagementTableBookingForm. This deletes the
parallel near-dead Wizard implementation including 14 component files and types."
```

### Task 10.3: Delete `lib/mothers-day-booking.ts` (Spec §7.8, OQ10)

- [ ] **Step 1: Confirm isolation**

```bash
grep -rln "mothers-day-booking\\|isMothersDayEvent\\|MOTHERS_DAY_DEFAULT_TIME\\|MOTHERS_DAY_SERVICE_DATE" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx'
```

Expected: zero results after Task 9.1.

- [ ] **Step 2: Delete**

```bash
git rm lib/mothers-day-booking.ts
git commit -m "chore: delete lib/mothers-day-booking.ts — Mother's Day 2026 is past, plumbing isolated"
```

### Task 10.4: Delete legacy SundayLunchBooking* components (Spec §13.2)

- [ ] **Step 1: Confirm zero imports**

```bash
grep -rln "SundayLunchBooking" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.ts' --include='*.tsx'
```

- [ ] **Step 2: Delete**

```bash
git rm components/features/TableBooking/SundayLunchBookingForm.tsx
git rm components/features/TableBooking/SundayLunchBookingSection.tsx
git rm components/features/TableBooking/SundayLunchBooking.tsx
git commit -m "chore: delete legacy SundayLunchBooking components"
```

### Task 10.5: Delete legacy backup files

```bash
git rm app/book-table/page-old.tsx app/sunday-lunch/page.tsx.backup app/staines-pub/page.tsx.backup 2>/dev/null
git commit -m "chore: delete legacy *.backup and page-old.tsx files" --allow-empty
```

### Task 10.6: Delete or audit `app/api/table-bookings/menu/sunday-lunch/route.ts`

- [ ] **Step 1: Check if the management app still relies on this for legacy data**

If unused, delete. If used, leave with a comment.

```bash
git rm app/api/table-bookings/menu/sunday-lunch/route.ts || true
git commit -m "chore: delete /api/table-bookings/menu/sunday-lunch route (legacy menu endpoint, no live caller)" --allow-empty
```

---

## Section 11 — Website: Content sweep (page by page)

For every page below, the workflow is the same:
1. Read the file
2. Apply the listed line-by-line changes
3. Run grep to confirm no Sunday-pre-order/cutoff/7+ strings remain (Sunday context only — allowlist Christmas/private)
4. Commit

### Task 11.1: `app/book-table/page.tsx` (Spec §8.2)

**Lines 230, 308, 362, 417, 421** — replace per spec. Notable replacements:
- Line 230: "groups of 7 or more" → "groups of 10 or more"
- Line 231 — replace `{SUNDAY_LUNCH_DEPOSIT_POLICY_COPY}` import + usage with `{LARGE_GROUP_DEPOSIT_POLICY_COPY}`
- Line 308: "must be pre-ordered when booking" → "served from 1pm Sundays — book ahead or walk in"
- Line 362: "Pre-order by Saturday 1pm" → remove the line; replace with "Served from 1pm Sundays"
- Line 417: "larger groups (7+)" → "larger groups (10+)"
- Line 421: full FAQ rewrite — "A £10 per person deposit is required for groups of 10 or more. This is fully deductible from your final bill. No deposit required for smaller groups." Drop the "Sunday roast bookings also require a pre-payment" sentence entirely.

Add the `<LaunchAnnouncement variant="banner" />` above the form (inside the existing `Section` wrapping the form, or in a new banner row). Also remove the `mothersDay` prefill plumbing in the page component (lines 39-40, 70-71).

```bash
git add app/book-table/page.tsx
git commit -m "refactor(book-table): update FAQ + tips + dish copy + JSON-LD + LaunchAnnouncement

Spec §8.1, §8.2. Removes mothers_day prefill plumbing."
```

### Task 11.2: `app/easter/page.tsx` (Spec §8.2, §8.6)

Apply the date-aware-copy convention from §8.6. Replace every reference to "Saturday 1pm", "£10 per person deposit", "pre-order required" (lines 34, 39, 46, 65, 96, 166, 208, 341) with future-tense pre-launch / present-tense post-launch copy.

Use the `<LaunchAnnouncement>` for the date-aware logic. For static copy, decide if the page can ship the post-launch wording (since Easter 2026 is past, the page persists for 2027 — so copy can describe the *future* model unconditionally).

```bash
git add app/easter/page.tsx
git commit -m "refactor(easter): rewrite to new walk-in model, remove pre-order/Saturday-cutoff/£10pp deposit copy

Spec §8.6 (seasonal-page template). Easter 2026 is past — copy describes the
post-launch model since the page persists for 2027."
```

### Task 11.3: `app/fathers-day/page.tsx` (Spec §8.6 — Father's Day 2026 is the next live event)

Same pattern as Task 11.2. Father's Day 2026 (21 June) is post-launch — page must ship in present-tense post-launch state. Update lines 60, 161, 188, 329.

Layer Father's Day-specific keyword cluster (per keyword plan: `fathers day pub lunch`, `fathers day sunday roast`, `fathers day pub near me`, `where to take dad for sunday lunch`) on top of the standard Sunday model. CTAs to `/book-table`.

```bash
git add app/fathers-day/page.tsx
git commit -m "refactor(fathers-day): new walk-in model, no pre-order/£10pp/Saturday-cutoff copy

Spec §8.6. Father's Day 2026 = 21 June, post-launch — present tense."
```

### Task 11.4: `app/mothers-day/page.tsx` (Spec §8.6)

Same pattern. Mother's Day 2026 is past; page persists for 2027. Layer keyword cluster: `mothers day lunch near me`, `mothers day sunday lunch near me`, `mothers day sunday lunch`, `mothers day pub lunch`, `mothers day sunday roast`.

```bash
git add app/mothers-day/page.tsx
git commit -m "refactor(mothers-day): new walk-in model template, layer keyword cluster"
```

### Task 11.5: `app/feltham-pub/page.tsx`

Lines 171, 294 — replace "pre-order by 1pm Saturday" + "£10 per person deposit" with the new walk-in messaging.

```bash
git commit -am "refactor(feltham-pub): drop Sunday cutoff/£10pp copy"
```

### Task 11.6: `app/stanwell-pub/page.tsx`

Line 263 — replace "must be ordered by 1pm Saturday".

```bash
git commit -am "refactor(stanwell-pub): drop Saturday cutoff copy"
```

### Task 11.7: `app/staines-pub/page.tsx`

Search for any Sunday-pre-order/cutoff/7+ strings.

```bash
grep -n -E "1pm Saturday|Saturday 1pm|pre-order|groups of 7|7 or more|12pm to 5pm|noon to 5" app/staines-pub/page.tsx
```

Apply edits, commit.

### Task 11.8: `app/music-bingo/page.tsx`

Same grep pattern. Apply edits if hits found.

### Task 11.9: `app/page.tsx` (homepage walk-in messaging)

- Add `<LaunchAnnouncement variant="hero" />` to the homepage hero section
- Drop `revalidate` from `60 * 60 * 24` to `60 * 60` for the launch fortnight (covered in Task 13.1 — leave the change here too if convenient)

```bash
git commit -am "feat(homepage): LaunchAnnouncement hero variant"
```

### Task 11.10: `app/layout.tsx` (footer slim + promo CTA entry)

Add a footer-slim `<LaunchAnnouncement variant="slim" />` near the existing footer markup. If the existing date-aware promo CTA array (line 108-126) is the right integration point for an entry that links somewhere, add a "Walk-in Sundays" entry there with `startsOn`/`endsOn` aligned to the launch window.

```bash
git commit -am "feat(layout): footer slim LaunchAnnouncement"
```

### Task 11.11: `public/llms.txt`

Replace line 41 ("Sunday lunch requires pre-order by 1pm Saturday, £10/person deposit") with: "Sunday roast served walk-in friendly 1pm-6pm. Booking recommended but not required. £10 per person deposit only for groups of 10 or more."

```bash
git commit -am "docs(llms.txt): update Sunday roast facts to new walk-in model"
```

### Task 11.12: `docs/copy-assumptions.md`

Update the Sunday/pre-order/deposit operational claims section. Replace the old facts with the new ones (1pm-6pm, walk-ins welcome, deposit only for 10+, no Saturday cutoff).

```bash
git commit -am "docs(copy-assumptions): update Sunday operational claims"
```

### Task 11.13: Schema.org JSON-LD audit

Find every JSON-LD block on affected pages (FAQ entries, descriptions, hours, offers).

```bash
grep -rln 'application/ld+json' /Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app --include='*.tsx'
```

For each: scrub Sunday-roast-specific deposit / pre-order claims; update opening hours from 12-5 to 1-6.

```bash
git commit -am "fix(jsonld): scrub Sunday pre-order/deposit; hours 12-5 → 1-6"
```

### Task 11.14: `app/sitemap.ts` verification

- [ ] **Step 1: Confirm `/sunday-lunch`, `/easter`, `/fathers-day`, `/mothers-day` are listed**

- [ ] **Step 2: Confirm no entries pointing to deleted routes (`/api/booking/submit` if removed)**

```bash
grep -E "submit|sunday-lunch|easter|fathers-day|mothers-day|sunday lunch" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap.ts
```

```bash
git commit -am "chore(sitemap): verify entries — no orphans, all seasonal pages present" --allow-empty
```

### Task 11.15: Sweep blog posts under `content/blog/`

```bash
grep -rln -E "1pm Saturday|Saturday 1pm|pre-order by Saturday|groups of 7|7 or more|12pm to 5pm|noon to 5pm|last orders 4:30" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub/content/blog/
```

For each blog post that has Sunday-pre-order context: update copy. Allowlist Christmas / private-event posts.

```bash
git add content/blog/
git commit -m "refactor(blog): update Sunday roast posts to new walk-in model"
```

---

## Section 12 — Website: `/sunday-lunch` rewrite

### Task 12.1: Rewrite `app/sunday-lunch/page.tsx` per keyword plan + date-aware convention (Spec §8.6)

**Files:**
- Modify: `WEB: app/sunday-lunch/page.tsx`

This is a substantial rewrite folding in the keyword plan (already delivered).

- [ ] **Step 1: Compose new metadata**

```tsx
export const metadata: Metadata = {
  title: 'Sunday Roast Near Heathrow | The Anchor, Stanwell Moor',
  description: 'Walk-in friendly Sunday roast served 1pm-6pm at The Anchor, Stanwell Moor. From £19. 7 minutes from Heathrow Terminal 5. Free parking, dog-friendly. Booking recommended.',
  alternates: { canonical: '/sunday-lunch' }, // absolute path per spec §7.7
  openGraph: { /* update with new copy */ },
};
```

- [ ] **Step 2: Hero — 5★ review quote + walk-in messaging + CTA**

```tsx
<HeroWrapper
  title="Sunday Roast at The Anchor"
  description="Made from scratch. Walk in 1pm-6pm or book ahead. 7 minutes from Heathrow T5."
  primaryCta={<Link href="/book-table"><Button variant="primary">Book a Table</Button></Link>}
  secondaryCta={<PhoneButton phone="01753 682707" />}
/>

<LaunchAnnouncement variant="banner" />

<Section>
  <blockquote>
    "It was hands down the best meal we had in England... cosy atmosphere, hospitality from our team, and the food itself."
    <cite>— IJ, Google review</cite>
  </blockquote>
</Section>
```

- [ ] **Step 3: "What's on the plate" — menu section on this page**

Per owner decision (OQ9): the menu lives on `/sunday-lunch`. List the Sunday roast menu (beef, pork belly, chicken, lamb shank, vegetarian wellington — based on existing copy and reviews). All booking CTAs go to `/book-table`. No on-page form.

- [ ] **Step 4: "How Sundays work" — date-aware body copy (Spec §8.6)**

Use a small `'use client'` component (or extend `LaunchAnnouncementClient` pattern) that swaps copy:
- Pre-launch: "From 17 May 2026, walk-ins are welcome on Sundays 1pm-6pm — no pre-order needed. Until then, our kitchen is open on Sundays with our weekday menu."
- Post-launch: "Walk-ins welcome on Sundays 1pm-6pm. Booking still recommended for groups."

- [ ] **Step 5: "From the kitchen" + curated review testimonials per spec §15**

Pull 3-5 quotes from the appendix (without relative dates):
- Sara Bowden, T, IJ, Iona Turner, Andrea Pisani, Penny Johnson, Michael Frewin

- [ ] **Step 6: FAQ — new content**

Refresh FAQ entries:
- "Do I need to book?" — "Walk-ins welcome 1pm-6pm. Booking recommended, especially for groups."
- "Is there a deposit?" — "Only for groups of 10 or more — £10 per person, fully deducted from your bill."
- "What time is Sunday roast served?" — "1pm-6pm every Sunday."
- "Can I bring my dog?" — "Yes, dogs are welcome inside and in the beer garden."
- "How far from Heathrow?" — "7 minutes from Terminal 5."

- [ ] **Step 7: Single CTA at end of page → `/book-table`**

- [ ] **Step 8: SEO keyword targeting (per keyword plan)**

H1: "Sunday Roast Near Heathrow"
Body integrates: "Sunday roast", "Sunday lunch", "Sunday dinner", "near me", "best Sunday roast", "pub Sunday roast", "Stanwell Moor", "Surrey", "Heathrow", "carvery" (in a "Better than a carvery" subsection).

- [ ] **Step 9: Run lint, typecheck, build**

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npm run lint && npx tsc --noEmit && npm run build
```

- [ ] **Step 10: Commit**

```bash
git add app/sunday-lunch/page.tsx
git commit -m "feat(sunday-lunch): rewrite as content/SEO hub with walk-in model

- Date-aware body copy (pre/post 17 May)
- 5★ review testimonials (no relative dates)
- Sunday roast menu on-page; CTAs go to /book-table
- 'Better than a carvery' angle (50K monthly searches)
- FAQ refreshed: no pre-order, no Saturday cutoff, 10+ deposit only
- Canonical: /sunday-lunch (absolute)

Spec §8.6, keyword plan delivered in conversation."
```

---

## Section 13 — Website: Caching strategy

### Task 13.1: Drop revalidate to 3600 for launch fortnight on `/`, `/book-table`, `/sunday-lunch` (Spec §8.5)

**Files:**
- Modify: `WEB: app/page.tsx`, `WEB: app/book-table/page.tsx`, `WEB: app/sunday-lunch/page.tsx`

- [ ] **Step 1: Edit each file**

```tsx
// BEFORE: export const revalidate = 60 * 60 * 24; // 24 hours
// AFTER:  export const revalidate = 60 * 60;      // 1 hour during launch fortnight
//         // TODO(post-launch): revert to 24h after 22 May 2026
```

- [ ] **Step 2: Calendar a follow-up to revert**

Add `D9-followup`: revert revalidate to 24h after 22 May 2026. Track in Peter's TODO.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/book-table/page.tsx app/sunday-lunch/page.tsx
git commit -m "perf(cache): revalidate=3600 for launch fortnight (homepage + book-table + sunday-lunch)

Ensures the LaunchAnnouncement banner flips at the cutover even on cached pages.
Revert to 24h after 22 May 2026 — see Peter's follow-up."
```

---

## Section 14 — Website: Tests

### Task 14.1: Update `components/features/TableBooking/__tests__/PayPalDepositSection.test.tsx`

Replace any deposit-copy assertions with the new warm `LARGE_GROUP_DEPOSIT_POLICY_COPY` text. Replace 7+ thresholds with 10+.

```bash
git commit -am "test(deposit-section): align with 10+ rule and warm copy"
```

### Task 14.2: New `lib/__tests__/large-group-deposit.test.ts`

Cover `requiresDeposit(partySize)` and `computeLargeGroupDepositAmount(partySize)` across boundaries 1, 9, 10, 11, 50.

```bash
git add lib/__tests__/large-group-deposit.test.ts
git commit -m "test: large-group deposit boundaries"
```

### Task 14.3: New `app/api/table-bookings/__tests__/route.test.ts`

Cases:
- Hostile payload `{ purpose: 'food', sunday_lunch: true, booking_type: 'sunday_lunch', sunday_preorder_items: [...] }` → forwarded payload contains neither `sunday_lunch` nor `sunday_preorder_items`, and `booking_type='regular'`.
- Cutoff is no longer enforced (request for a Sunday after Saturday 13:00 succeeds).
- Service-window resolution still rejects out-of-hours.

```bash
git add app/api/table-bookings/__tests__/
git commit -m "test(proxy): hostile payload sanitisation + no cutoff enforcement"
```

### Task 14.4: New `app/api/booking/agent/__tests__/route.test.ts`

Cases:
- Sunday input → `bookingType='regular'` in returned shape.
- Special instructions empty for party 9; show 10+ deposit messaging for party 10.
- No "1pm Saturday" / "7+" strings anywhere in response.

```bash
git add app/api/booking/agent/__tests__/
git commit -m "test(agent): no Sunday-lunch defaulting; 10+ messaging only"
```

### Task 14.5: Existing LaunchAnnouncement test from Task 8.1 already covers boundaries

Run all tests:

```bash
npm test
```

Expected: pass.

### Task 14.6: ManagementTableBookingForm test for PayPal-failure recovery state

```tsx
// In an existing or new test file:
it('renders call-us state and fallback_payment_url when inline PayPal fails', async () => {
  // Mock the booking-create response with `payment_required: true` and a `fallback_payment_url`.
  // Mock the PayPal SDK initialisation to fail.
  // Render the form, submit it.
  // Expect to see:
  //   - "01753 682707" tel: link
  //   - The fallback URL link
});
```

```bash
git commit -am "test(form): PayPal-failure recovery state with fallback_payment_url"
```

---

## Section 15 — Website: Deploy

### Task 15.1: Full pre-deploy verification

```bash
cd /Users/peterpitcher/Cursor/OJ-The-Anchor.pub
npm run lint && npx tsc --noEmit && npm test && npm run build
```

All must pass with zero warnings.

### Task 15.2: Final content sweep grep (zero hits expected)

```bash
grep -rEln "1pm Saturday|Saturday 1pm|Saturday 13:00|groups of 7|7 or more|partySize >= 7|party_size >= 7|must be pre-ordered|pre-payment to confirm|must pre-order|12pm to 5pm|12 noon|noon to 5pm|last orders 4:30" /Users/peterpitcher/Cursor/OJ-The-Anchor.pub --include='*.tsx' --include='*.ts' --include='*.md' --include='*.txt'
```

Allowlist: any results in Christmas / private-event context. Otherwise expected: zero hits.

### Task 15.3: Push to staging (Vercel preview)

```bash
vercel deploy
```

### Task 15.4: Smoke-test staging end-to-end (Spec §8.10)

Run every "End-to-end customer journey" acceptance criterion from §8.10 against the preview URL. Document results.

### Task 15.5: Promote to production

Per spec §8.9: only after management app has been in prod ≥24h with smoke tests passing.

```bash
vercel promote
```

---

## Section 16 — Post-deploy verification

### Task 16.1: Re-run end-to-end scenarios in production

- Sunday food party 9 → no deposit
- Sunday food party 10 → deposit + PayPal completes + `deposit_amount_locked = £100` set in DB
- Weekday food party 10 → deposit
- Drinks party 10 → deposit
- Drinks party 8 → no deposit
- `/book-table?sunday_lunch=true` → silently ignored
- `/book-table?purpose=sunday_lunch` → rejected at parse time
- `/book-table?mothers_day=true` → silently ignored
- Hostile payload via direct POST: `booking_type='regular'`, no preorder persisted

### Task 16.2: Verify legacy 31 May 2026 booking is intact

```sql
SELECT id, booking_reference, party_size, start_datetime, status,
       payment_status, deposit_amount, deposit_amount_locked, special_requirements
FROM public.table_bookings
WHERE id = '4adbb010-173e-4f61-8df5-c6c863f8629b';
```

Expected: `deposit_amount_locked = 10.00`, `special_requirements` contains "Sunday lunch pre-order: Guest 1: Roasted Chicken x1", `status = 'confirmed'`.

### Task 16.3: Banner-timing verification

- Pre-launch: visit homepage / book-table / sunday-lunch / footer — pre-launch copy shows.
- At 17 May 00:00 BST: copy should flip to "today from 1pm". Use a clock-forward test in dev or wait until launch day.
- At 17 May 18:00 BST: banner hides on every surface.

### Task 16.4: Analytics smoke (Spec D10)

Verify the surviving event contract from D10 fires correctly through the new flow. Document any regressions.

### Task 16.5: Monitor for 48 hours

- Booking submission error rate
- PayPal capture success rate
- DB query: any `deposit_amount_locked IS NULL` for new paid bookings (should be zero)
- GSC: monitor for crawl errors / index drops on affected pages

---

## Phase 2 placeholder

Phase 2 (wizard replacement — `ManagementTableBookingForm` replaced with a fresh 2-step wizard) is out of scope for this plan. After post-launch stabilisation, run a discovery walkthrough on the live form and create a separate Phase 2 plan in `docs/superpowers/plans/`. Spec §9 sketches the goals and acceptance criteria.

---

## Self-review (run before handoff)

**Spec coverage:** every §8 section of the spec (Phase 1 deliverables) maps to at least one task above.
- §8.1 website code refactor → Section 9 + 7
- §8.2 content sweep → Section 11
- §8.3 management code refactor → Section 2 + 3 + 4
- §8.4 DB migrations → Section 1 (Tasks 1.2, 1.3, 1.4)
- §8.5 LaunchAnnouncement → Section 8
- §8.6 sunday-lunch + seasonal pages → Section 12 + Tasks 11.2-11.4
- §8.7 walk-in messaging placement → Section 11 (homepage + layout + book-table + sunday-lunch)
- §8.8 wizard cleanup → Section 10
- §8.9 deploy plan → Sections 6 + 15
- §8.10 acceptance criteria → Section 16
- §8.11 tests → Sections 5 + 14

**Placeholder scan:**
- D6 paid-status enum values placeholder remains in Migration A SQL — intentional, resolved at execution time via Task 0.1.
- Some "(locate via grep)" steps for FOH/Stripe paths — intentional, the implementer has the live codebase to locate exact files.
- No "TBD" or "fill in details" entries.

**Type consistency:**
- `requiresDeposit(partySize, opts?)` consistent across both repos.
- `getCanonicalDeposit(booking, partySize?)` only in management app.
- `computeLargeGroupDepositAmount(partySize)` only on website.
- `WALK_IN_LAUNCH_STARTS_AT_MS` / `WALK_IN_LAUNCH_BANNER_ENDS_AT_MS` consistent throughout.
- `fallback_payment_url` field name consistent in spec §6 + Tasks 2.1 + 9.1.

**Frequent commits:** every task ends with a commit. Total: ~70 commits across both repos.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-28-sunday-walk-in-launch.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Good for this plan's scope (~70 tasks across two repos).

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Tighter feedback loop but higher context cost given the plan size.

**Which approach?**
