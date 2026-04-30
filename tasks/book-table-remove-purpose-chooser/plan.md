# /book-table — Remove Purpose Chooser — Implementation Plan

> **For agentic workers:** Implement this via the `/implement-plan` skill. Steps use checkbox (`- [ ]`) syntax for tracking. The companion spec lives at [tasks/book-table-remove-purpose-chooser/spec.md](tasks/book-table-remove-purpose-chooser/spec.md) — read it first.

**Goal:** Remove the customer-facing "Booking for" chooser from `/book-table`, replace per-slot UX with a kitchen-open/closed caption, and silently derive the submit-time `purpose` from the chosen slot.

**Architecture:** The website's `lib/table-booking-service-windows.ts` already produces purpose-filtered slot ranges. We add a new helper that returns the **drinks-window master ranges + kitchen-open overlay ranges**, then stamp each slot with `kitchen_open: boolean`. The availability route returns the combined response. The wizard renders one grid with captions and derives `purpose: 'food' | 'drinks'` at submit time. Direct API submissions still validate `purpose` against service windows; we simply update the customer-facing copy. Management API contract is unchanged.

**Tech Stack:** Next.js 14 App Router · React · TypeScript (strict) · Tailwind 3.4 · Jest 29 + Testing Library + jsdom · Luxon (Europe/London) · Zod.

---

## File Map

| File | Responsibility | Change |
|---|---|---|
| `lib/api/bookings.ts` | Type contracts | Add `kitchen_open?: boolean` to `TableAvailabilitySlot` |
| `lib/table-booking-service-windows.ts` | Service-window resolution | Add `resolveCombinedServiceRanges` + `buildSlotsWithKitchenState` |
| `app/api/table-bookings/availability/route.ts` | Public availability proxy | Use combined helpers; ignore `purpose`; neutral copy |
| `lib/api/client.ts` | Server fallback availability builder | Align with combined contract; preserve `kitchen_open` |
| `app/api/table-bookings/route.ts` | Public submit proxy | Neutral error copy (validation logic stays) |
| `app/api/booking/agent/route.ts` | Booking agent endpoint | GET stops claiming purpose-filtered availability |
| `app/book-table/page.tsx` | Wizard page entry | Remove `parsePurpose` and `prefill.purpose` |
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | The wizard | Remove chooser + dining footer; render captions; derive submit `purpose`; update review/confirmation/analytics |
| `tests/api/table-bookings-service-window.test.ts` | Helper tests | Add combined-helper cases incl. special-hours regressions |
| `tests/api/table-bookings-availability-purpose.test.ts` → `…-combined.test.ts` | Route tests | Rename + rewrite for combined contract |
| `tests/api/table-bookings.test.ts` and/or `app/api/table-bookings/__tests__/route.test.ts` | Submit-route tests | Update error-copy assertions |
| `tests/api/booking-agent-service-window.test.ts` and `app/api/booking/agent/__tests__/route.test.ts` | Agent tests | Drop "purpose forwarded" assertion |
| `tests/unit/ManagementTableBookingForm.test.tsx` | Wizard component tests | Remove chooser asserts; add caption + purpose-derivation cases |

---

## Task 1 — Add `kitchen_open` to availability types

**Files:**
- Modify: `lib/api/bookings.ts:3-9`

- [ ] **Step 1: Add the optional field**

Edit `lib/api/bookings.ts`:

```ts
export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
  kitchen_open?: boolean
}
```

The field is optional so older response paths (and the management API direct response, when used) continue to type-check.

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: clean (no new errors).

- [ ] **Step 3: Commit**

```bash
git add lib/api/bookings.ts
git commit -m "feat(table-booking): add optional kitchen_open to TableAvailabilitySlot"
```

---

## Task 2 — Combined service-range helpers (TDD)

**Files:**
- Test: `tests/api/table-bookings-service-window.test.ts` (extend)
- Modify: `lib/table-booking-service-windows.ts`

- [ ] **Step 1: Add failing tests for `resolveCombinedServiceRanges` + `buildSlotsWithKitchenState`**

Append a new `describe` block at the bottom of `tests/api/table-bookings-service-window.test.ts`. The exact import statements and `BusinessHours` fixture patterns mirror existing tests in the file — read the top of the file before adapting. Add these cases:

```ts
import {
  resolveCombinedServiceRanges,
  buildSlotsWithKitchenState
} from '@/lib/table-booking-service-windows'

describe('resolveCombinedServiceRanges', () => {
  it('returns drinks-window ranges as master and food-window ranges as kitchen overlay on a normal day', () => {
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00', closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' }
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.closed).toBe(false)
    expect(result.ranges).not.toHaveLength(0)
    expect(result.kitchenRanges).not.toHaveLength(0)
    expect(result.kitchenRanges[0].endsAt).toBeLessThanOrEqual(result.ranges[0].endsAt)
  })

  it('returns empty kitchen ranges when the regular kitchen is closed (Monday)', () => {
    const businessHours = makeBusinessHours({
      monday: {
        opens: '16:00:00', closes: '23:00:00',
        kitchen: { is_closed: true }
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-04')
    expect(result.closed).toBe(false)
    expect(result.ranges).not.toHaveLength(0)
    expect(result.kitchenRanges).toHaveLength(0)
  })

  it('treats special-hours kitchen: null as a deliberate kitchen closure', () => {
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00', closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' }
      }
    }, [{
      date: '2026-05-05',
      opens: '12:00:00', closes: '23:00:00',
      kitchen: null
    }])
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.kitchenRanges).toHaveLength(0)
    expect(result.ranges).not.toHaveLength(0)
  })

  it('treats special-hours is_kitchen_closed: true as a kitchen closure', () => {
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00', closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' }
      }
    }, [{
      date: '2026-05-05',
      opens: '12:00:00', closes: '23:00:00',
      kitchen: { opens: '12:00:00', closes: '21:00:00' },
      is_kitchen_closed: true
    }])
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.kitchenRanges).toHaveLength(0)
  })

  it('honours special-hours kitchen-open data on an otherwise kitchen-closed regular day', () => {
    const businessHours = makeBusinessHours({
      monday: {
        opens: '16:00:00', closes: '23:00:00',
        kitchen: { is_closed: true }
      }
    }, [{
      date: '2026-05-04',
      opens: '12:00:00', closes: '23:00:00',
      kitchen: { opens: '17:00:00', closes: '20:00:00' }
    }])
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-04')
    expect(result.kitchenRanges).not.toHaveLength(0)
    expect(result.kitchenRanges[0]).toMatchObject({
      startsAt: 17 * 60,
      endsAt: 20 * 60
    })
  })

  it('returns closed=true when the venue is closed all day', () => {
    const businessHours = makeBusinessHours({
      tuesday: {
        opens: '12:00:00', closes: '23:00:00',
        kitchen: { opens: '12:00:00', closes: '21:00:00' },
        is_closed: true
      }
    })
    const result = resolveCombinedServiceRanges(businessHours, '2026-05-05')
    expect(result.closed).toBe(true)
    expect(result.ranges).toHaveLength(0)
    expect(result.kitchenRanges).toHaveLength(0)
    expect(result.message).toBeTruthy()
  })
})

describe('buildSlotsWithKitchenState', () => {
  it('stamps kitchen_open: true on slots inside a kitchen range and false outside', () => {
    const slots = buildSlotsWithKitchenState(
      [{ startsAt: 12 * 60, endsAt: 23 * 60, capacity: 50 }],
      [{ startsAt: 12 * 60, endsAt: 21 * 60, capacity: 50 }],
      2,
      30
    )
    const noon = slots.find((s) => s.time === '12:00')!
    const lateEvening = slots.find((s) => s.time === '22:00')!
    expect(noon.kitchen_open).toBe(true)
    expect(lateEvening.kitchen_open).toBe(false)
  })

  it('marks every slot kitchen_open: false when kitchen ranges are empty', () => {
    const slots = buildSlotsWithKitchenState(
      [{ startsAt: 16 * 60, endsAt: 23 * 60, capacity: 50 }],
      [],
      2,
      30
    )
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.every((s) => s.kitchen_open === false)).toBe(true)
  })
})
```

> If the existing test file does not export a `makeBusinessHours` helper, port the pattern used in the surrounding tests. Do not add a real-network call.

- [ ] **Step 2: Run the new tests — confirm they FAIL**

```bash
npx jest tests/api/table-bookings-service-window.test.ts
```

Expected: TypeScript fails because `resolveCombinedServiceRanges` and `buildSlotsWithKitchenState` are not exported yet.

- [ ] **Step 3: Implement the helpers**

In `lib/table-booking-service-windows.ts`, append:

```ts
export type CombinedServiceRangeResolution = {
  ranges: ServiceRange[]
  kitchenRanges: ServiceRange[]
  closed: boolean
  message?: string
}

export function resolveCombinedServiceRanges(
  businessHours: BusinessHours,
  isoDate: string,
  options?: { bookingType?: BookingType }
): CombinedServiceRangeResolution {
  const bookingType: BookingType = options?.bookingType ?? 'regular'

  const drinks = resolveServiceRanges(businessHours, isoDate, {
    bookingType,
    purpose: 'drinks'
  })

  if (drinks.closed) {
    return {
      ranges: [],
      kitchenRanges: [],
      closed: true,
      message: drinks.message
    }
  }

  const food = resolveServiceRanges(businessHours, isoDate, {
    bookingType,
    purpose: 'food'
  })

  return {
    ranges: drinks.ranges,
    kitchenRanges: food.closed ? [] : food.ranges,
    closed: false,
    message: drinks.message
  }
}

export function buildSlotsWithKitchenState(
  ranges: ServiceRange[],
  kitchenRanges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes = 30,
  minMinutesForToday?: number
): Array<{
  time: string
  available: boolean
  available_capacity: number
  reason?: string
  kitchen_open: boolean
}> {
  const baseSlots = buildSlotsFromRanges(ranges, partySize, slotIntervalMinutes, minMinutesForToday)
  return baseSlots.map((slot) => ({
    time: slot.time,
    available: slot.available ?? false,
    available_capacity: slot.available_capacity,
    reason: slot.reason,
    kitchen_open: isTimeWithinRanges(slot.time, kitchenRanges)
  }))
}
```

- [ ] **Step 4: Run the tests again — confirm they PASS**

```bash
npx jest tests/api/table-bookings-service-window.test.ts
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add lib/table-booking-service-windows.ts tests/api/table-bookings-service-window.test.ts
git commit -m "feat(service-windows): add combined drinks+food range helper with kitchen overlay"
```

---

## Task 3 — Refactor availability route + rename tests

**Files:**
- Rename: `tests/api/table-bookings-availability-purpose.test.ts` → `tests/api/table-bookings-availability-combined.test.ts`
- Rewrite: the same file's contents
- Modify: `app/api/table-bookings/availability/route.ts`

- [ ] **Step 1: Rename the test file**

```bash
git mv tests/api/table-bookings-availability-purpose.test.ts tests/api/table-bookings-availability-combined.test.ts
```

- [ ] **Step 2: Rewrite the test file with the combined contract**

Replace the contents of `tests/api/table-bookings-availability-combined.test.ts`. Use the existing file's mocking style (the previous version mocks `anchorAPI.getBusinessHours`); preserve that pattern. Required cases:

```ts
import { GET } from '@/app/api/table-bookings/availability/route'
import { anchorAPI } from '@/lib/api'

// Reuse the existing businessHours fixture style from the file you just renamed.
// `makeBusinessHours` (or whatever the file used) should still be in scope.

describe('GET /api/table-bookings/availability — combined contract', () => {
  beforeEach(() => {
    jest.spyOn(anchorAPI, 'getBusinessHours').mockResolvedValue(
      makeBusinessHours({
        tuesday: {
          opens: '12:00:00', closes: '23:00:00',
          kitchen: { opens: '12:00:00', closes: '21:00:00' }
        }
      })
    )
  })

  afterEach(() => jest.restoreAllMocks())

  async function fetchSlots(query: string) {
    const url = `https://www.the-anchor.pub/api/table-bookings/availability?${query}`
    const response = await GET(new Request(url))
    expect(response.status).toBe(200)
    const body = await response.json()
    return body
  }

  it('returns combined slots whether or not purpose is supplied', async () => {
    const omitted = await fetchSlots('date=2026-05-05&party_size=2')
    const food = await fetchSlots('date=2026-05-05&party_size=2&purpose=food')
    const drinks = await fetchSlots('date=2026-05-05&party_size=2&purpose=drinks')

    expect(omitted.data.time_slots).toEqual(food.data.time_slots)
    expect(omitted.data.time_slots).toEqual(drinks.data.time_slots)
  })

  it('stamps kitchen_open: true on slots before kitchen close and false after', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const slots = body.data.time_slots as Array<{ time: string; kitchen_open?: boolean }>
    const earlyEvening = slots.find((s) => s.time === '20:00')
    const lateEvening = slots.find((s) => s.time === '22:00')
    expect(earlyEvening?.kitchen_open).toBe(true)
    expect(lateEvening?.kitchen_open).toBe(false)
  })

  it('does not include meta.purpose in the response', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    expect(body.meta?.purpose).toBeUndefined()
  })

  it('uses neutral copy for messages and special_notes', async () => {
    const body = await fetchSlots('date=2026-05-05&party_size=2')
    const message: string = body.data.message ?? ''
    const notes: string = body.data.special_notes ?? ''
    expect(message.toLowerCase()).not.toContain('food')
    expect(message.toLowerCase()).not.toContain('drinks-only')
    expect(notes.toLowerCase()).not.toContain('food bookings')
    expect(notes.toLowerCase()).not.toContain('switch to drinks')
  })
})
```

- [ ] **Step 3: Run tests — confirm they FAIL**

```bash
npx jest tests/api/table-bookings-availability-combined.test.ts
```

Expected: failures because the route still branches on purpose and emits the old copy.

- [ ] **Step 4: Replace the route handler**

Rewrite `app/api/table-bookings/availability/route.ts`. The full new contents:

```ts
import { anchorAPI, type BusinessHours, type TableAvailabilityResponse } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'
import {
  buildSlotsWithKitchenState,
  isValidIsoDate,
  isValidTime,
  londonNowParts,
  normalizeTime,
  resolveCombinedServiceRanges,
  type BookingType
} from '@/lib/table-booking-service-windows'

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function buildCombinedAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
  }
): TableAvailabilityResponse {
  const { ranges, kitchenRanges, message } = resolveCombinedServiceRanges(
    businessHours,
    options.date,
    { bookingType: options.bookingType }
  )

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const timeSlots = buildSlotsWithKitchenState(
    ranges,
    kitchenRanges,
    options.partySize,
    30,
    minMinutesForToday
  )

  const available = timeSlots.some(
    (slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize
  )

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : 'No online times are currently available for this request. Please choose another date or call 01753 682707.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes: 'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'

  // booking_type and purpose query params are accepted for backwards compatibility
  // with stale links/clients but are intentionally ignored: the public availability
  // contract is now a single combined slot list with per-slot kitchen_open.
  void searchParams.get('booking_type')
  void searchParams.get('purpose')
  const bookingType: BookingType = 'regular'

  if (!date || !partySizeRaw) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('Date must use YYYY-MM-DD format', 400)
  }

  const normalizedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedTime)) {
    return createApiErrorResponse('Time must use HH:mm or HH:mm:ss format', 400)
  }

  const partySize = parsePositiveInt(partySizeRaw, 2)

  try {
    const businessHours = await anchorAPI.getBusinessHours()
    const fallback = buildCombinedAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: fallback,
        meta: {
          source: 'schedule_fallback',
          service_model: 'combined_food_drinks'
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (fallbackError: any) {
    logError('api/table-bookings/availability-fallback', fallbackError, {
      date,
      time: normalizedTime,
      partySize,
      bookingType
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
```

- [ ] **Step 5: Run tests — confirm PASS**

```bash
npx jest tests/api/table-bookings-availability-combined.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add tests/api/table-bookings-availability-combined.test.ts \
        tests/api/table-bookings-availability-purpose.test.ts \
        app/api/table-bookings/availability/route.ts
git commit -m "feat(table-booking): combined availability response with kitchen_open per slot"
```

---

## Task 4 — Align `lib/api/client.ts` fallback

**Files:**
- Modify: `lib/api/client.ts` (around `buildTableAvailabilityFromBusinessHours` ~line 419 and the merging logic ~line 579)

- [ ] **Step 1: Read the current fallback implementation**

```bash
sed -n '380,470p' lib/api/client.ts
```

Identify two things:
1. `buildTableAvailabilityFromBusinessHours()` — confirm whether it currently calls `resolveServiceRanges` directly or duplicates logic.
2. The merge map starting around line 579 — confirm how it copies fields from `TableAvailabilitySlot`.

- [ ] **Step 2: Refactor the fallback to use combined helpers**

Replace the body of `buildTableAvailabilityFromBusinessHours` so it calls `resolveCombinedServiceRanges` + `buildSlotsWithKitchenState` (mirror the pattern from `app/api/table-bookings/availability/route.ts`). Drop any branching on `purpose` inside this function.

In the merge logic (~line 579), update slot copying to preserve `kitchen_open`:

```ts
const merged: TableAvailabilitySlot = {
  time: slot.time,
  available: slot.available,
  available_capacity: slot.available_capacity,
  reason: slot.reason,
  requires_prepayment: slot.requires_prepayment,
  kitchen_open: slot.kitchen_open
}
```

(Adjust to the file's existing object construction style — only add the `kitchen_open` field; do not regress other fields.)

- [ ] **Step 3: Add a smoke test for the fallback**

Add to `tests/api/table-bookings-service-window.test.ts` (or create `tests/api/table-bookings-client-fallback.test.ts` if there is no natural home):

```ts
describe('anchorAPI fallback availability', () => {
  it('preserves kitchen_open through internal fallback', async () => {
    // Mock fetchInternalTableAvailability to return null so the synthesized
    // fallback runs, then assert the produced slots carry kitchen_open.
    // Use the existing test patterns in the file to wire this.
  })
})
```

If a clean test point doesn't exist without significant refactor, document the gap in the PR description and rely on the `availability/route.ts` tests instead. Do **not** introduce mocking infrastructure for its own sake.

- [ ] **Step 4: Run tests + typecheck**

```bash
npx jest tests/api/table-bookings-service-window.test.ts
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/api/client.ts tests/api/
git commit -m "refactor(api-client): align table-availability fallback with combined contract"
```

---

## Task 5 — Submit-route copy update (TDD)

**Files:**
- Modify: `app/api/table-bookings/route.ts`
- Test: `app/api/table-bookings/__tests__/route.test.ts` (and/or `tests/api/table-bookings.test.ts` — pick whichever currently asserts error copy)

- [ ] **Step 1: Inspect existing tests**

```bash
grep -n "Food bookings\|drinks-only\|switch to drinks" app/api/table-bookings/__tests__/route.test.ts tests/api/table-bookings.test.ts 2>/dev/null
```

Note every assertion that reads chooser/purpose-flavoured copy.

- [ ] **Step 2: Update the failing copy assertions**

For each match, change the expected string to the neutral version below or remove the brittle string assertion in favour of a status-code + structural assertion. Add at least one new positive test:

```ts
it('rejects a food booking outside kitchen hours with neutral copy', async () => {
  const response = await POST(buildBookingRequest({
    date: '2026-05-05',
    time: '22:30',
    purpose: 'food'
  }))
  expect(response.status).toBe(400)
  const body = await response.json()
  expect(body.error).toMatch(/outside online booking hours/i)
  expect(body.error.toLowerCase()).not.toContain('food booking')
  expect(body.error.toLowerCase()).not.toContain('switch to drinks')
})
```

- [ ] **Step 3: Run tests — confirm they FAIL**

```bash
npx jest app/api/table-bookings/__tests__/route.test.ts tests/api/table-bookings.test.ts
```

- [ ] **Step 4: Update the route copy**

In `app/api/table-bookings/route.ts`, replace any customer-facing strings of the form *"Food bookings…"*, *"Switch to drinks…"*, *"Drinks-only times…"* with neutral phrasing such as:

- `"That time is outside online booking hours. Please choose another time or call 01753 682707."`
- `"That time is fully booked. Please choose another time or call 01753 682707."`

**Do not** remove the validation logic itself — direct API submissions must still be blocked when `purpose: 'food'` is sent for a non-kitchen slot. Server-side `console`/log copy may still mention `purpose` for diagnostics.

- [ ] **Step 5: Run tests — confirm PASS**

```bash
npx jest app/api/table-bookings/__tests__/route.test.ts tests/api/table-bookings.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add app/api/table-bookings/route.ts app/api/table-bookings/__tests__/route.test.ts tests/api/table-bookings.test.ts
git commit -m "fix(table-booking): neutralise customer-facing service-window error copy"
```

---

## Task 6 — Agent route GET update (TDD)

**Files:**
- Modify: `app/api/booking/agent/route.ts`
- Test: `app/api/booking/agent/__tests__/route.test.ts` and `tests/api/booking-agent-service-window.test.ts`

- [ ] **Step 1: Find existing assertions about purpose forwarding**

```bash
grep -n "purpose" app/api/booking/agent/route.ts \
        app/api/booking/agent/__tests__/route.test.ts \
        tests/api/booking-agent-service-window.test.ts
```

- [ ] **Step 2: Update failing tests**

For tests that assert *"agent GET forwards `purpose` to `/api/table-bookings/availability`"*, replace with assertions on the combined contract:

```ts
it('returns combined slots without filtering by purpose for agent GET', async () => {
  const response = await GET(new Request(
    'https://www.the-anchor.pub/api/booking/agent?date=2026-05-05&party_size=2'
  ))
  expect(response.status).toBe(200)
  const body = await response.json()
  const slots: Array<{ kitchen_open?: boolean }> = body.data?.time_slots ?? body.time_slots
  expect(slots.length).toBeGreaterThan(0)
  expect(slots.every((s) => typeof s.kitchen_open === 'boolean')).toBe(true)
})
```

For the agent **POST** path, leave existing `purpose` behaviour untouched — agents can still send `purpose: 'drinks'` for a late slot.

- [ ] **Step 3: Update the agent GET implementation**

In `app/api/booking/agent/route.ts` GET handler, stop forwarding `purpose` to the upstream availability endpoint (or accept and ignore it). Ensure `kitchen_open` from the upstream response is preserved through any reshaping the agent does.

- [ ] **Step 4: Run tests**

```bash
npx jest app/api/booking/agent/__tests__/route.test.ts tests/api/booking-agent-service-window.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add app/api/booking/agent/ tests/api/booking-agent-service-window.test.ts
git commit -m "feat(booking-agent): GET availability now returns combined slots with kitchen_open"
```

---

## Task 7 — Remove `parsePurpose` from book-table page

**Files:**
- Modify: `app/book-table/page.tsx`

- [ ] **Step 1: Delete `parsePurpose` and the `purpose` prefill plumbing**

Remove these from `app/book-table/page.tsx`:

```ts
function parsePurpose(value?: string): 'food' | 'drinks' | undefined { ... }
```

In the `BookTablePageProps` `searchParams` type and the `prefill` object passed to `<ManagementTableBookingForm />`, drop the `purpose` field. Keep `date`, `time`, `party_size` exactly as-is.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

This should fail because the form's `prefill` prop still expects `purpose?`. We'll fix that in Task 8 — note the failure and proceed.

- [ ] **Step 3: Commit (with intentional staging only)**

```bash
git add app/book-table/page.tsx
git commit -m "refactor(book-table): drop ?purpose= prefill — handled per-slot now"
```

(The intermediate typecheck failure is closed in Task 8 within minutes; no other consumer reads `prefill.purpose` so the build should still succeed at deploy time only after Task 8 lands. If you prefer to keep main green between commits, defer this commit and squash it into Task 8.)

---

## Task 8 — Wizard form refactor (atomic)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Test: `tests/unit/ManagementTableBookingForm.test.tsx`

This task touches a single large file in many places. Treat it as one atomic unit — the file would not compile or behave correctly mid-edit. Order your edits to land in one commit.

### Step 1: Update component tests (TDD)

- [ ] **Step 1.1: Identify and remove obsolete assertions**

Search and remove or update:

```bash
grep -n "Booking for\|purpose=\|drinks-only\|switch to drinks\|Food (kitchen hours)\|Drinks (bar hours)" tests/unit/ManagementTableBookingForm.test.tsx
```

Each match is either an obsolete "chooser visible" assertion or a "review row mentions purpose" assertion. Remove or rewrite.

- [ ] **Step 1.2: Add new assertions**

Add these (use existing test setup helpers — the file already mocks `fetch` for the availability endpoint):

```ts
it('does not render the "Booking for" chooser', async () => {
  renderForm()
  await waitForFindStepReady()
  expect(screen.queryByLabelText(/booking for/i)).not.toBeInTheDocument()
})

it('does not render the dining disclaimer footer', async () => {
  renderForm()
  await waitForFindStepReady()
  expect(screen.queryByText(/any time during bar hours/i)).not.toBeInTheDocument()
})

it('does not include purpose in the availability fetch URL', async () => {
  const fetchMock = mockAvailabilityFetch()
  renderForm()
  await pickPartySizeAndDate({ partySize: 2, date: '2026-05-05' })
  const calledUrl = fetchMock.mock.calls.at(-1)?.[0] as string
  expect(calledUrl).not.toMatch(/purpose=/)
})

it('renders "Drinks & food" caption on kitchen-open slots and "Drinks only" on others', async () => {
  mockAvailabilityFetch({
    time_slots: [
      { time: '19:00', available: true, available_capacity: 4, kitchen_open: true },
      { time: '22:00', available: true, available_capacity: 4, kitchen_open: false }
    ]
  })
  renderForm()
  await pickPartySizeAndDate({ partySize: 2, date: '2026-05-05' })
  const earlyButton = screen.getByRole('button', { name: /19:00/ })
  const lateButton = screen.getByRole('button', { name: /22:00/ })
  expect(within(earlyButton).getByText(/drinks & food/i)).toBeInTheDocument()
  expect(within(lateButton).getByText(/drinks only/i)).toBeInTheDocument()
})

it('submits purpose: food when a kitchen-open slot is chosen', async () => {
  // Wire mocks so submit hits the proxy with a captured payload.
  const submitSpy = mockSubmitBooking()
  await runWizardThrough({
    slots: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
    pick: '19:00'
  })
  expect(submitSpy.mock.calls[0][0]).toMatchObject({ purpose: 'food' })
})

it('submits purpose: drinks when a kitchen-closed slot is chosen', async () => {
  const submitSpy = mockSubmitBooking()
  await runWizardThrough({
    slots: [{ time: '22:00', available: true, available_capacity: 4, kitchen_open: false }],
    pick: '22:00'
  })
  expect(submitSpy.mock.calls[0][0]).toMatchObject({ purpose: 'drinks' })
})

it('preserves kitchen_open through nearest-alternative selection', async () => {
  // Two-step: requested time empty -> nearest alternative offered with kitchen_open: false.
  const submitSpy = mockSubmitBooking()
  await runWizardThroughAlternative({
    primarySlots: [],
    alternative: { date: '2026-05-05', time: '22:30', kitchen_open: false }
  })
  expect(submitSpy.mock.calls[0][0]).toMatchObject({ purpose: 'drinks' })
})

it('does not show booking-purpose wording on review or confirmation', async () => {
  await runWizardThrough({
    slots: [{ time: '19:00', available: true, available_capacity: 4, kitchen_open: true }],
    pick: '19:00'
  })
  expect(screen.queryByText(/booking for/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/food booking/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/drinks booking/i)).not.toBeInTheDocument()
})
```

> Use the existing test file's helpers (`renderForm`, `pickPartySizeAndDate`, `mockAvailabilityFetch`, etc.). If a helper doesn't exist, add it locally — do not change the production code's seams just for tests.

- [ ] **Step 1.3: Run tests — confirm they FAIL**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
```

### Step 2: Apply the refactor

- [ ] **Step 2.1: State + types (top of file)**

In `components/features/TableBooking/ManagementTableBookingForm.tsx`:

- Delete `type BookingPurpose = 'food' | 'drinks'` (~line 32) and any standalone `BookingPurpose` import sites in the file.
- In the local `AvailabilitySlot` shape (~line 84) add `kitchen_open?: boolean`.
- In the prefill type (~line 110), remove `purpose?: BookingPurpose`.
- Add new state below `selectedTime`:

  ```ts
  type SelectedSlotService = {
    date: string
    time: string
    kitchen_open?: boolean
  }
  const [selectedSlotService, setSelectedSlotService] =
    useState<SelectedSlotService | null>(null)
  ```

- Delete `const [purpose, setPurpose] = useState<BookingPurpose>(...)` (~line 555).
- Delete `const [drinksAlternative, setDrinksAlternative] = useState(...)` (search the file for `drinksAlternative`).

- [ ] **Step 2.2: Handlers**

- Delete `handlePurposeSelection` (~line 1017).
- Update `fetchAvailabilityForDate` (~line 766), `loadNearestAlternatives` (~line 794), `runAvailabilitySearch` (~line 834): remove the `targetPurpose` parameter and any `purpose:` field passed to the fetch.
- Update analytics: any `context: \`availability_first_${purpose}\`` becomes `context: 'availability_first'`. Search for `availability_first_` and `_purpose` in the file.
- Update `handleSlotSelect` to capture the slot:

  ```ts
  function handleSlotSelect(slot: AvailabilitySlot) {
    setSelectedTime(slot.time)
    setRequestedTime(slot.time)
    setSelectedSlotService({
      date,
      time: slot.time,
      kitchen_open: slot.kitchen_open
    })
  }
  ```

- Update `handleChooseAlternative` so it sets `selectedSlotService` from the alternative before transitioning to details. Alternatives must carry `kitchen_open`:

  ```ts
  type AlternativeSlot = SelectedSlotService
  // ...inside loadNearestAlternatives, when building the alternative:
  .map((slot) => ({
    date: response.date || targetDate,
    time: slot.time,
    kitchen_open: slot.kitchen_open
  }))
  ```

- Add invalidation: clear `selectedSlotService` whenever `date`, `partySize`, `requestedTime`, or `availability` changes such that the previous selection no longer fits. Existing reset paths (`resetForm`, the `useEffect` that drops `selectedTime`) are good places.

- [ ] **Step 2.3: Submit purpose derivation**

Replace the existing `purpose,` field in the submit payload (~line 1270) with a derived value:

```ts
function deriveSubmitPurpose(): 'food' | 'drinks' | null {
  const matchService =
    selectedSlotService &&
    selectedSlotService.date === date &&
    selectedSlotService.time === selectedTime
      ? selectedSlotService
      : null
  if (matchService) {
    return matchService.kitchen_open === false ? 'drinks' : 'food'
  }
  const slot = availability?.time_slots.find((s) => s.time === selectedTime)
  if (!slot) return null
  return slot.kitchen_open === false ? 'drinks' : 'food'
}

const purpose = deriveSubmitPurpose()
if (!purpose) {
  setSubmitError('Please choose a time again before confirming.')
  return
}

const payload = {
  ...,
  purpose,
  ...
}
```

- [ ] **Step 2.4: UI removal and additions**

- **Step intro** (~line 1513): change `'Start with party size, date, booking type, and time. We'll ask for contact details after you pick a slot.'` → `'Start with party size, date, and time. We'll ask for contact details after you pick a slot.'`
- **Hours-note footer** (~line 615–630): remove the `footer:` line containing `'Tables booked here are for dining — you're welcome to come in any time during bar hours…'`. Update the surrounding object/return so the footer key is gone (or returns undefined) — match the existing render pattern that displays the footer.
- **Chooser** (~line 1575–1596): delete the `<label htmlFor="table-booking-purpose-find">` + `<select id="table-booking-purpose-find">` + the helper text block.
- **Slot grid heading** (~line 1626): replace `Showing {purpose === 'drinks' ? 'drinks-only' : 'food'} slots.` with the static neutral copy `Pick a time` — or remove the line if a heading already covers step 2.
- **Slot button caption** (~line 1635–1655): inside each slot button, after the time, render:

  ```tsx
  <span className="block text-base font-semibold">
    {formatTimeForDisplay(slot.time)}
  </span>
  {typeof slot.kitchen_open === 'boolean' ? (
    <span className="mt-1 block text-xs font-normal text-anchor-cream-text/60">
      {slot.kitchen_open ? 'Drinks & food' : 'Drinks only'}
    </span>
  ) : null}
  ```

  Preserve the existing selected/disabled class logic.
- **Switch-to-drinks prompt** (~line 1664–1690): delete the entire conditional block.
- **Review summary** (~line 1857): remove the `Booking for: …` line.
- **Confirmation detail** (~line 1910–1911): remove the `<dt>Booking for</dt><dd>…</dd>` pair.

- [ ] **Step 2.5: Re-run typecheck and tests**

```bash
npx tsc --noEmit
npx jest tests/unit/ManagementTableBookingForm.test.tsx
```

Expected: clean typecheck (closes the gap left by Task 7) and all wizard tests passing.

- [ ] **Step 2.6: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx \
        tests/unit/ManagementTableBookingForm.test.tsx
git commit -m "feat(book-table): remove purpose chooser; derive purpose from slot kitchen state"
```

---

## Task 9 — Final verification pipeline

**Files:** none modified by default (fix-forward as needed).

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Expected: zero errors, zero warnings. Fix any warnings introduced by the refactor — most likely unused imports of `BookingPurpose`.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Full test run**

```bash
npm test
```

Expected: all green. Pay particular attention to:
- `tests/api/table-bookings-service-window.test.ts`
- `tests/api/table-bookings-availability-combined.test.ts`
- `tests/api/table-bookings.test.ts`
- `tests/api/booking-agent-service-window.test.ts`
- `tests/unit/ManagementTableBookingForm.test.tsx`
- `app/api/table-bookings/__tests__/route.test.ts`
- `app/api/booking/agent/__tests__/route.test.ts`

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 5: Manual smoke test (local dev)**

```bash
npm run dev
```

Then in the browser, walk through `/book-table` for at least:
- A weekday with food in kitchen hours and drinks late — confirm captions render correctly.
- A Monday — confirm every slot says *"Drinks only"*.
- An all-day-closed special date (if available) — confirm closed-day message.
- One submission of a kitchen-open slot — confirm the booking lands and no purpose wording appears anywhere customer-facing.

- [ ] **Step 6: Commit any cleanup from verification**

If any small fixes were needed during steps 1–5, commit them with a descriptive message. Otherwise skip.

```bash
git add -A
git commit -m "chore(book-table): post-refactor cleanup"
```

---

## Spec ↔ Plan Coverage

| Spec section | Covered by task |
|---|---|
| §6 Availability contract — `kitchen_open` on slot | T1 (type) + T2 (helpers) + T3 (route) + T4 (client fallback) |
| §7 Backend — `resolveCombinedServiceRanges` + `buildSlotsWithKitchenState` | T2 |
| §7 Backend — availability route refactor + neutral copy | T3 |
| §7 Backend — `lib/api/client.ts` fallback alignment | T4 |
| §7 Backend — `app/api/table-bookings/route.ts` neutral error copy | T5 |
| §8 Frontend — state, types, slot capture | T8 (Step 2.1, 2.2) |
| §8 Frontend — submit purpose derivation with neutral block | T8 (Step 2.3) |
| §8 Frontend — UI copy table | T8 (Step 2.4) |
| §8 Frontend — `app/book-table/page.tsx` | T7 |
| §9 API agent impact | T6 |
| §10 Edge cases | T2 + T8 (covered by tests) |
| §11 Tests — unit helper | T2 |
| §11 Tests — availability route | T3 |
| §11 Tests — submit route | T5 |
| §11 Tests — form | T8 (Step 1) |
| §11 Tests — agent | T6 |
| §11 Commands | T9 |
| §12 Backwards compatibility | T3 (route silently ignores), T7 (page silently ignores) |
| §13 Risks — late drinks-only alt submits as food | T8 (Step 2.3 — block on missing match) |
| §13 Risks — kitchen flag on special-hours days | T2 (regression tests) |
| §13 Risks — purpose language in errors | T5 |
| §14 Acceptance criteria | T9 verifies all |

---

## Out-of-repo follow-ups (NOT in this plan)

- Management-app SMS/email templates that currently say "food booking" / "drinks booking" — separate change in `OJ-AnchorManagementTools`.
- Legacy unused components (`TableBookingForm`, `BookingDatePicker`, `AvailabilityChecker`) — flagged in spec §13 risk row; address only if reused.

---

## Rollback

`git revert <merge-commit>`. No DB migration. No management-API contract change. No external integration change.
