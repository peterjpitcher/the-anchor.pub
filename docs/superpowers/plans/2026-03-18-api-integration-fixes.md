# API Integration Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical API integration bugs between the website and management app, then improve the API layer structure.

**Architecture:** All fixes are contained within OJ-The-Anchor.pub. No changes to the management app. Phase 1 fixes live bugs; Phase 2 improves long-term maintainability.

**Tech Stack:** Next.js 14 App Router, TypeScript, Jest (test runner), React

**Spec:** `docs/superpowers/specs/2026-03-18-api-integration-review-design.md`

---

## Phase 1 — Critical Fixes

---

### Task 1: Fix `kitchen: null` bypass in `resolveServiceRanges` (C5 — live bug)

**Context:** When a special hours record has `kitchen: null` (the deliberate closure signal), the current `kitchenClosed` check does not treat it as closed. If the special day also has a `schedule_config` with a `sunday_lunch` entry, that entry is returned as available — bypassing the closure entirely.

**Files:**
- Modify: `lib/table-booking-service-windows.ts` (lines 240–243)
- Modify: `tests/api/table-bookings-service-window.test.ts` (add new describe block)

- [ ] **Step 1: Write failing tests for the `kitchen: null` bypass**

Open `tests/api/table-bookings-service-window.test.ts`. Find the **outer** `describe('Table Bookings API - Service Window Enforcement', ...)` block. Add the following `describe` block **inside** that outer `describe` — `createTableBooking` is only in scope there (it is imported/required inside the outer describe's setup):

```typescript
describe('Sunday lunch - kitchen: null special hours', () => {
  const SUNDAY_WITH_NULL_KITCHEN = {
    regularHours: {
      sunday: {
        opens: '12:00',
        closes: '23:00',
        is_closed: false,
        kitchen: { opens: '12:00', closes: '21:00' }
      }
    },
    specialHours: [
      {
        date: '2026-03-22',
        is_closed: false,
        is_kitchen_closed: false,
        kitchen: null,         // deliberate closure signal
        schedule_config: [
          // schedule_config has sunday_lunch — this is the bypass scenario
          { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
        ]
      }
    ]
  } as any

  // Note: do NOT call jest.resetModules() here — the outer beforeEach handles module setup.
  // Only override the mock return value for these tests.
  beforeEach(() => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_WITH_NULL_KITCHEN)
  })

  it('rejects sunday lunch booking when special day has kitchen: null (even with schedule_config)', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        sunday_lunch: true    // use the boolean field, not booking_type string
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toMatch(/sunday lunch|unavailable|kitchen/i)
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('rejects sunday lunch when special day has is_kitchen_closed: true', async () => {
    const hoursWithFlag = {
      ...SUNDAY_WITH_NULL_KITCHEN,
      specialHours: [
        {
          ...SUNDAY_WITH_NULL_KITCHEN.specialHours[0],
          kitchen: null,
          is_kitchen_closed: true
        }
      ]
    }
    mockGetBusinessHours.mockResolvedValue(hoursWithFlag)

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        sunday_lunch: true    // use the boolean field, not booking_type string
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('still allows sunday lunch when special day has kitchen open (not null)', async () => {
    const hoursWithOpenKitchen = {
      ...SUNDAY_WITH_NULL_KITCHEN,
      specialHours: [
        {
          ...SUNDAY_WITH_NULL_KITCHEN.specialHours[0],
          kitchen: { opens: '12:00', closes: '16:00' },
          schedule_config: [
            { booking_type: 'sunday_lunch', starts_at: '12:00', ends_at: '16:00', capacity: 30 }
          ]
        }
      ]
    }
    mockGetBusinessHours.mockResolvedValue(hoursWithOpenKitchen)
    // Use new Response(...) pattern consistent with the rest of this test file
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'REF123' } }),
        { status: 201 }
      )
    )

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '13:00',
        party_size: 2,
        purpose: 'food',
        sunday_lunch: true    // use the boolean field, not booking_type string
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    // Should reach the management API (not blocked at validation)
    expect((global.fetch as jest.Mock)).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/api/table-bookings-service-window.test.ts --no-coverage 2>&1 | tail -20
```

Expected: the two new rejection tests FAIL (booking is not rejected when it should be).

- [ ] **Step 3: Fix `resolveServiceRanges` — two changes required**

This fix requires **two separate changes** to `lib/table-booking-service-windows.ts`. Both are required — the first alone is insufficient because the `schedule_config` early-return path never reaches `kitchenClosed`.

**Change 1 — add `kitchen: null` to the `kitchenClosed` check (lines 240–243):**

```typescript
// BEFORE
const kitchenClosed =
  specialDay?.is_kitchen_closed === true ||
  regularDay?.is_kitchen_closed === true ||
  kitchenData?.is_closed === true
```

```typescript
// AFTER
const kitchenClosed =
  specialDay?.is_kitchen_closed === true ||
  regularDay?.is_kitchen_closed === true ||
  kitchenData?.is_closed === true ||
  (specialDay !== undefined && kitchenData === null) // kitchen: null on a special day = deliberate closure
```

**Change 2 — guard the `schedule_config` early-return with `if (!kitchenClosed)` (lines 255–259):**

Without this guard, when a special day has `schedule_config` with a `sunday_lunch` entry, the function returns those ranges at line 258 before it ever evaluates `kitchenClosed`. This is the bypass that caused the March 2026 live bug.

```typescript
// BEFORE
if (options.bookingType === 'sunday_lunch') {
  const sundayLunchRanges = toServiceRanges(byBookingType('sunday_lunch'))
  if (sundayLunchRanges.length > 0) {
    return { ranges: sundayLunchRanges, closed: false }
  }
  // ...
}
```

```typescript
// AFTER
if (options.bookingType === 'sunday_lunch') {
  if (!kitchenClosed) {  // ← guard: never return schedule_config ranges when kitchen is closed
    const sundayLunchRanges = toServiceRanges(byBookingType('sunday_lunch'))
    if (sundayLunchRanges.length > 0) {
      return { ranges: sundayLunchRanges, closed: false }
    }
  }
  // ... rest of sunday_lunch branch (hasKitchenWindow fallback, then empty)
}
```

After applying both changes, the full `sunday_lunch` block should read:

```typescript
if (options.bookingType === 'sunday_lunch') {
  if (!kitchenClosed) {
    const sundayLunchRanges = toServiceRanges(byBookingType('sunday_lunch'))
    if (sundayLunchRanges.length > 0) {
      return { ranges: sundayLunchRanges, closed: false }
    }

    if (hasKitchenWindow && kitchenOpens && kitchenCloses) {
      return {
        ranges: [{ startsAt: kitchenOpens, endsAt: kitchenCloses, capacity: 50 }],
        closed: false
      }
    }
  }

  return {
    ranges: [],
    closed: false,
    message: 'Sunday lunch is unavailable for that date. Please choose another date or call us.'
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/api/table-bookings-service-window.test.ts --no-coverage 2>&1 | tail -20
```

Expected: all tests pass, including the three new ones.

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npm test -- --no-coverage 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/table-booking-service-windows.ts tests/api/table-bookings-service-window.test.ts
git commit -m "fix: treat kitchen: null on special day as kitchen closed in resolveServiceRanges

Prevents Sunday lunch slots being offered on dates where the management
app has set kitchen: null (deliberate closure signal). Previously a
schedule_config entry could bypass the closure check."
```

---

### Task 2: Fix `currentStatus.services` type mismatch (C2 — type correction)

**Context:** The `currentStatus.services` type in `lib/api.ts` (lines 541–554) has a phantom `bookings` field that doesn't exist on the API, and is missing the real `sundayLunch` field. This is a type-only fix — no runtime changes.

**Files:**
- Modify: `lib/api.ts` (lines 541–554)

- [ ] **Step 1: Update the type**

In `lib/api.ts`, find and replace the `currentStatus.services` block (lines 541–554):

```typescript
// BEFORE
services?: {
  venue: {
    open: boolean
    closesIn: string | null
  }
  kitchen: {
    open: boolean
    closesIn: string | null
  }
  bookings: {
    accepting: boolean
    availableSlots: string[]
  }
}
```

Replace with:

```typescript
// AFTER
services?: {
  venue: {
    open: boolean
    closesIn: string | null
  }
  kitchen: {
    open: boolean
    closesIn: string | null
  }
  sundayLunch?: {
    enabled: boolean
    startsAt: string | null
    endsAt: string | null
    capacity: number | null
    message: string | null
  }
}
```

- [ ] **Step 2: Check for TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | head -40
```

If any errors reference `.services.bookings` — those are callers consuming the phantom field. Fix each one by removing the reference (the field does not exist on the API).

- [ ] **Step 3: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts
git commit -m "fix: correct currentStatus.services type to match management API response

Removes phantom bookings field; adds sundayLunch field that the API
actually returns. Type-only change — no runtime behaviour affected."
```

---

### Task 3: Fix `BookingDatePicker` stale hours on date change (C6-b)

**Context:** `BookingDatePicker` fetches business hours once on mount and holds them in `useState`. If a kitchen closure is set in the management app after the page loads, the component won't see it until a hard refresh. The fix is to add `selectedDate` as a dependency of the hours-fetch `useEffect`, so hours re-fetch each time the user picks a different date.

Note: `getBusinessHours()` calls `anchorAPI.getBusinessHours()` with `next: { revalidate: 0 }`, and the management API's `/business/hours` endpoint is public — so client-side re-fetching per date is safe and does not require the API key.

**Files:**
- Modify: `components/features/TableBooking/BookingDatePicker.tsx`

- [ ] **Step 1: Update the hours-fetch `useEffect` dependency array**

In `BookingDatePicker.tsx`, find the hours-fetch `useEffect` (currently has `[]` as the dependency array):

```typescript
// BEFORE
useEffect(() => {
  async function fetchHours() {
    try {
      const hours = await getBusinessHours()
      setBusinessHours(hours)
    } catch (err) {
      console.error('Failed to fetch business hours:', err)
      setError('Unable to load opening hours')
    } finally {
      setLoadingHours(false)
    }
  }
  fetchHours()
}, [])  // ← empty array: only runs on mount
```

Replace with:

```typescript
// AFTER
useEffect(() => {
  if (!selectedDate) return  // no date chosen yet — no need to fetch
  setLoadingHours(true)
  async function fetchHours() {
    try {
      const hours = await getBusinessHours()
      setBusinessHours(hours)
    } catch (err) {
      console.error('Failed to fetch business hours:', err)
      setError('Unable to load opening hours')
    } finally {
      setLoadingHours(false)
    }
  }
  fetchHours()
}, [selectedDate])  // ← re-fetch whenever date changes
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

Expected: all tests pass. If `BookingDatePicker` tests fail because they mock the hours fetch, update them to trigger a `selectedDate` state change before asserting on hours-dependent UI.

- [ ] **Step 4: Commit**

```bash
git add components/features/TableBooking/BookingDatePicker.tsx
git commit -m "fix: re-fetch business hours on date change in BookingDatePicker

Ensures per-date kitchen closures set in the management app are always
reflected without requiring a page refresh. Hours fetch now runs
whenever selectedDate changes, not only on initial mount."
```

---

### Task 4: Fix party size validation mismatch (C1)

**Context:** The proxy route validates `party_size` as 1–50 but the management API only accepts 1–20. Bookings with party sizes 21–50 fail silently at the management API with a raw 400.

**Files:**
- Modify: `app/api/table-bookings/route.ts` (line 269)
- Modify: `tests/api/table-bookings.test.ts` (update/add party size tests)

- [ ] **Step 1: Write a failing test**

In `tests/api/table-bookings.test.ts`, find or add a test for oversized parties:

```typescript
it('rejects party size above 20 with a clear error message', async () => {
  const request = {
    json: async () => ({
      phone: '07700900000',
      date: '2026-03-22',
      time: '19:00',
      party_size: 21,
      purpose: 'food'
    }),
    headers: new Headers()
  } as any

  const response = await createTableBooking(request)

  expect(response.status).toBe(400)
  const data = await response.json()
  expect(String(data.error)).toMatch(/party size|between 1 and 20/i)
  // Must not reach the management API
  expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest tests/api/table-bookings.test.ts --no-coverage -t "rejects party size above 20" 2>&1 | tail -15
```

Expected: FAIL (party size 21 currently passes validation and reaches the management API).

- [ ] **Step 3: Fix the validation in the route**

In `app/api/table-bookings/route.ts`, find line 269:

```typescript
// BEFORE
if (payload.party_size < 1 || payload.party_size > 50) {
  return 'Party size must be between 1 and 50'
}
```

Replace with:

```typescript
// AFTER
if (payload.party_size < 1 || payload.party_size > 20) {
  return 'Party size must be between 1 and 20'
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/api/table-bookings.test.ts --no-coverage 2>&1 | tail -15
```

Expected: all tests pass including the new one.

- [ ] **Step 5: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/api/table-bookings/route.ts tests/api/table-bookings.test.ts
git commit -m "fix: align party size validation to management API limit of 1-20

Previously allowed 1-50, causing silent 400 errors from the management
API for parties of 21-50. Now returns a clear error message before
the request is forwarded."
```

---

### Task 5: Reduce schema-with-reviews.ts cache window (C6-a)

**Context:** `lib/schema-with-reviews.ts` uses `unstable_cache` with `revalidate: 3600` (1 hour) for Schema.org markup that includes business hours data. Low risk (not in the booking flow), but a 1-hour stale window means SEO-facing hours can lag. Reduce to 5 minutes.

**Files:**
- Modify: `lib/schema-with-reviews.ts` (two `revalidate` values)

- [ ] **Step 1: Update both revalidation windows**

In `lib/schema-with-reviews.ts`, find both occurrences of `{ revalidate: 3600 }` and change to `{ revalidate: 300 }`:

```typescript
// BEFORE (appears twice)
{ revalidate: 3600 }

// AFTER (both occurrences)
{ revalidate: 300 }
```

- [ ] **Step 2: Type-check and build**

```bash
npx tsc --noEmit 2>&1 | head -10
npm run build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/schema-with-reviews.ts
git commit -m "fix: reduce business hours cache window from 1h to 5m in schema-with-reviews

Schema.org markup that includes opening hours was stale for up to 1
hour. 5 minutes balances CDN efficiency with hours accuracy."
```

---

## Phase 2 — Improvements

---

### Task 6: Split `lib/api.ts` into domain modules (I1)

**Context:** `lib/api.ts` is 2,858 lines covering events, menus, table bookings, parking, and business hours in one file. Split into focused domain modules. Re-export everything from `lib/api/index.ts` so no call sites break.

**Files:**
- Create: `lib/api/hours.ts`
- Create: `lib/api/events.ts`
- Create: `lib/api/menu.ts`
- Create: `lib/api/bookings.ts`
- Create: `lib/api/parking.ts`
- Create: `lib/api/index.ts`
- Delete: `lib/api.ts` (after all exports confirmed in index.ts)

- [ ] **Step 1: Create `lib/api/hours.ts`**

Move the `getBusinessHours()` export and related hours types from `lib/api.ts` into `lib/api/hours.ts`. Keep the `AnchorAPI.getBusinessHours()` method call — the class itself stays in a shared base or a separate `lib/api/client.ts`.

The simplest split: create thin module files that re-export from the class, and move standalone helper functions. The `AnchorAPI` class and singleton (`anchorAPI`) can live in `lib/api/client.ts`.

- [ ] **Step 2: Create `lib/api/index.ts` with re-exports**

```typescript
// lib/api/index.ts
export * from './client'     // anchorAPI singleton, AnchorAPI class
export * from './hours'      // getBusinessHours, BusinessHours type
export * from './events'     // getUpcomingEvents, Event type, etc.
export * from './menu'       // getMenu, MenuResponse type, etc.
export * from './bookings'   // bookTable, TableBookingRequest, etc.
export * from './parking'    // getParkingAvailability, etc.
```

- [ ] **Step 3: Verify no import paths break**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Fix any import errors. All existing `import { X } from '@/lib/api'` imports should continue to work via the index re-exports.

- [ ] **Step 4: Run full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add lib/api/ lib/api.ts
git commit -m "refactor: split lib/api.ts into domain modules

Splits 2858-line file into hours, events, menu, bookings, and parking
modules. All existing imports via @/lib/api continue to work through
lib/api/index.ts re-exports."
```

---

### Task 7: Extract shared TypeScript contract (I2)

**Context:** Both apps define their own interfaces for the same management API response shapes, causing drift (C2 was a direct consequence). Create `types/management-api.ts` as the single source of truth for all management API shapes in this repo.

**Files:**
- Create: `types/management-api.ts`
- Modify: `lib/api/hours.ts` (reference new types)
- Modify: `lib/api/events.ts` (reference new types)
- Modify: `lib/api/bookings.ts` (reference new types)

- [ ] **Step 1: Create `types/management-api.ts`**

Extract all interfaces that mirror management API response shapes from `lib/api.ts` into this file. Annotate each with a comment indicating which management API endpoint it comes from:

```typescript
// types/management-api.ts
// Single source of truth for management API (management.orangejelly.co.uk) response shapes.
// Update this file whenever the management API contract changes.

/** GET /business/hours */
export interface BusinessHours { ... }

/** POST /table-bookings response */
export interface TableBookingResponse { ... }

/** GET /events item */
export interface Event { ... }

// ... etc
```

- [ ] **Step 2: Update domain modules to import from `types/management-api.ts`**

Replace inline type definitions in `lib/api/hours.ts`, `lib/api/events.ts`, `lib/api/bookings.ts` with imports from `@/types/management-api`.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 4: Run tests and build**

```bash
npm test -- --no-coverage 2>&1 | tail -20
npm run build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add types/management-api.ts lib/api/
git commit -m "refactor: extract types/management-api.ts as single contract for API shapes

Centralises all management API response type definitions. Future API
changes require updating one file instead of scattered inline types."
```

---

### Task 8: Display `hold_expires_at` countdown in payment step (M2)

**Context:** When a table booking returns `state: 'pending_payment'`, the management API includes `hold_expires_at` (ISO 8601 timestamp). The website doesn't show this to customers, so they don't know their slot will lapse.

`hold_expires_at` is already typed in `ManagementTableBookingForm.tsx` (line 50) and used to compute `holdExpiry` (line 581). The value is derived but check whether it's rendered in the UI.

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Modify: `components/features/TableBooking/PayPalDepositSection.tsx` (if countdown lives there)

- [ ] **Step 1: Check current rendering of `holdExpiry`**

Read lines 575–610 of `ManagementTableBookingForm.tsx` to see how `holdExpiry` is currently used in the JSX. Determine whether it is rendered or silently computed.

- [ ] **Step 2: Add countdown display to the payment step**

In the pending payment UI, add a visible message such as:

```tsx
{holdExpiry && (
  <p className="text-sm text-amber-600 font-medium mt-2">
    ⏱ Your table is held until {holdExpiry}. Complete payment to confirm your booking.
  </p>
)}
```

Place this immediately above or below the PayPal button, within the `pending_payment` state branch.

- [ ] **Step 3: Run tests**

```bash
npm test -- --no-coverage 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx components/features/TableBooking/PayPalDepositSection.tsx
git commit -m "feat: display hold expiry countdown in pending payment step

Customers can now see how long their table is held while they complete
payment, reducing abandoned bookings from slot expiry."
```

---

### Task 9: Remove hardcoded POLICY_VIOLATION redirect (M3)

**Context:** When `POST /api/event-bookings` returns `409 Conflict` with a `POLICY_VIOLATION` code, the website builds a Mothers Day booking URL and redirects there. This redirect will fire for any future policy violation on any event, sending customers to the wrong place.

**Files:**
- Modify: `app/api/event-bookings/route.ts`
- Modify: `components/features/EventBooking/ManagementEventBookingForm.tsx`
- Modify: `tests/api/event-bookings-policy-fallback.test.ts`

- [ ] **Step 1: Read the existing test to understand expected behaviour**

```bash
cat tests/api/event-bookings-policy-fallback.test.ts
```

Note what the tests currently assert about the 409 response.

- [ ] **Step 2: Update the route to return the policy violation message instead of a redirect URL**

In `app/api/event-bookings/route.ts`, find the `POLICY_VIOLATION` handling (around line 159–168). Instead of building a `buildMothersDayBookingUrl` redirect:

```typescript
// BEFORE (approximate)
const policyViolation = upstream.status === 409 && hasPolicyViolation(parsed)
const redirectUrl = policyViolation
  ? buildMothersDayBookingUrl({ partySize: normalized.payload.seats })
  : null

// AFTER
// Surface the message from the API response body to the client
if (upstream.status === 409 && hasPolicyViolation(parsed)) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'POLICY_VIOLATION',
        message: parsed?.message || 'This booking cannot be completed. Please contact us for assistance.'
      }
    },
    { status: 409 }
  )
}
```

- [ ] **Step 3: Update the form component to display the error inline**

In `ManagementEventBookingForm.tsx`, find the `POLICY_VIOLATION` handling (around line 226–233). Remove the redirect and replace with inline error state:

```typescript
// BEFORE (approximate)
if (response.status === 409 && hasPolicyViolation(body)) {
  router.push(buildMothersDayBookingUrl(...))
  return
}

// AFTER
if (response.status === 409) {
  setError(body?.error?.message || 'This booking cannot be completed. Please contact us.')
  return
}
```

- [ ] **Step 4: Update the test file**

Update `tests/api/event-bookings-policy-fallback.test.ts` to assert the new 409 + error message behaviour instead of the redirect URL.

- [ ] **Step 5: Run tests**

```bash
npx jest tests/api/event-bookings-policy-fallback.test.ts --no-coverage 2>&1 | tail -20
npm test -- --no-coverage 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add app/api/event-bookings/route.ts components/features/EventBooking/ManagementEventBookingForm.tsx tests/api/event-bookings-policy-fallback.test.ts
git commit -m "fix: replace hardcoded POLICY_VIOLATION redirect with inline error message

Previously any policy violation on any event would redirect to a
hardcoded Mothers Day URL. Now surfaces the API's error message inline,
which works correctly for any event and any future policy violation."
```

---

### Task 10: Document M1 availability endpoint decision

**Context:** The website computes availability locally. The management API has its own `GET /table-bookings/availability` endpoint that the website never calls. This duplication is a risk. A decision must be recorded.

**Files:**
- Modify: `docs/api-integration.md` (or create it if it doesn't exist)

- [ ] **Step 1: Record the decision**

Add a section to `docs/api-integration.md`:

```markdown
## Availability Computation — Decision Record

**Date:** 2026-03-18
**Decision:** Accept local computation as the canonical approach (divergence risk accepted).

**Rationale:** The website's local `resolveServiceRanges()` computation is well-tested
and gives the website control over slot presentation. Migrating to the management API's
`/table-bookings/availability` endpoint would require matching the API's slot format and
handling network failures gracefully, adding complexity for limited benefit.

**Risk:** If the management API's availability logic changes (e.g. new capacity rules),
the website will not reflect those changes automatically. Any such changes must be
coordinated with a matching update to `lib/table-booking-service-windows.ts`.

**Owner:** Review this decision if availability divergence is reported.
```

- [ ] **Step 2: Commit**

```bash
git add docs/api-integration.md
git commit -m "docs: record availability endpoint decision (local vs management API)"
```

---

## Verification

After all tasks are complete:

- [ ] Run the full test suite: `npm test 2>&1 | tail -30`
- [ ] Run a production build: `npm run build 2>&1 | tail -20`
- [ ] Run type checking: `npx tsc --noEmit`
- [ ] Manually verify: set `is_kitchen_closed: true` for next Sunday in the management app and confirm no Sunday lunch slots appear on the booking wizard
- [ ] Manually verify: attempt a party of 21 on the booking form and confirm a clear error message before the request is sent
