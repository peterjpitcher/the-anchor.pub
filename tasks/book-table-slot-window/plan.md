# /book-table — Slot Window + Mobile + Timezone + API Handover — Implementation Plan

> **For agentic workers:** Implement this via the `/implement-plan` skill. The companion spec lives at [tasks/book-table-slot-window/spec.md](tasks/book-table-slot-window/spec.md) — read every section of the spec before touching code. Plan steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce step-2 visual overwhelm with a 7-slot window centred on the requested time and a "See more times" expander; while in the same file, fix three correctness bugs surfaced during spec review (London-timezone bugs, stale party-size closure, per-click idempotency-key) and apply wizard-wide mobile optimisations.

**Architecture:** All slot-window logic is presentation-layer; the API contract is unchanged. A new pure helper `lib/table-booking-slot-window.ts` decides the visible slice. A new tiny export `londonIsoDate()` from `lib/table-booking-service-windows.ts` centralises London date formatting. The wizard component absorbs the rest: state for window/expander/anchor, party-size threading, timezone-correct defaults and validation, mobile tap targets / keyboard hints / scroll-to-top / form semantics, and submit-intent idempotency-key reuse.

**Tech Stack:** Next.js 14 App Router · React · TypeScript (strict) · Tailwind 3.4 · Jest 29 + Testing Library + jsdom · `lucide-react` (already in deps) · `Intl.DateTimeFormat` for Europe/London formatting.

---

## File Map

| File | Responsibility | Change |
|---|---|---|
| `lib/table-booking-service-windows.ts` | Service-window helpers + London time math | Add `londonIsoDate(date?: Date)`; route `londonNowParts()` through it |
| `lib/table-booking-slot-window.ts` | Visible slot windowing | New file: `pickSlotWindow()` + `DEFAULT_SLOT_WINDOW_SIZE` |
| `components/features/TableBooking/ManagementTableBookingForm.tsx` | The wizard | Slot window state/render/expander, party-size threading, timezone fixes, mobile UI/aria/form semantics, idempotency fingerprinting |
| `tests/api/table-bookings-service-window.test.ts` | Service-window helper tests | Add `londonIsoDate` cases |
| `tests/unit/table-booking-slot-window.test.ts` | Slot-window helper tests | New file |
| `tests/unit/ManagementTableBookingForm.test.tsx` | Wizard component tests | Add slot-window, mobile, timezone, idempotency cases |

No backend or contract changes. `/api/table-bookings`, `/api/table-bookings/availability`, `/api/booking/agent`, and `lib/api/client.ts` are out of scope.

---

## Wave Structure

- **Wave 1 (parallel — separate files):** Tasks 1 and 2.
- **Wave 2 (sequential — same wizard file in different concerns):** Tasks 3 → 4 → 5 → 6.
- **Wave 3 (orchestrator):** Task 7 verification pipeline.

---

## Task 1 — `londonIsoDate` helper (Wave 1A)

**Files:**
- Modify: `lib/table-booking-service-windows.ts`
- Test: `tests/api/table-bookings-service-window.test.ts` (extend existing file)

- [ ] **Step 1.1: Add failing tests at the bottom of the test file**

```ts
import { londonIsoDate } from '@/lib/table-booking-service-windows'

describe('londonIsoDate', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the London date for a UTC instant in the previous calendar day', () => {
    // 2026-04-29 23:30 UTC is 2026-04-30 00:30 BST in London.
    expect(londonIsoDate(new Date('2026-04-29T23:30:00Z'))).toBe('2026-04-30')
  })

  it('returns the London date for a UTC instant in the next calendar day in winter', () => {
    // 2026-12-31 23:30 UTC is 2026-12-31 23:30 GMT (no shift).
    expect(londonIsoDate(new Date('2026-12-31T23:30:00Z'))).toBe('2026-12-31')
  })

  it('falls back to "now" when called with no argument', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'))
    expect(londonIsoDate()).toBe('2026-06-15')
  })
})

describe('londonNowParts uses londonIsoDate', () => {
  afterEach(() => jest.useRealTimers())

  it('returns the London ISO date for a UTC pre-midnight instant', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T23:30:00Z'))
    const result = londonNowParts()
    expect(result.isoDate).toBe('2026-04-30') // London BST
  })
})
```

- [ ] **Step 1.2: Run — confirm fail**

```bash
npx jest tests/api/table-bookings-service-window.test.ts
```

Expected: TS error (export missing).

- [ ] **Step 1.3: Implement**

In `lib/table-booking-service-windows.ts` add the export and route `londonNowParts()` through it:

```ts
export function londonIsoDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function londonNowParts(): { isoDate: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const now = new Date()
  const parts = formatter.formatToParts(now)
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const hours = Number.parseInt(map.hour || '0', 10)
  const minutes = Number.parseInt(map.minute || '0', 10)

  return {
    isoDate: londonIsoDate(now),
    minutes: hours * 60 + minutes
  }
}
```

The existing `londonNowParts()` already builds an `'en-CA'` date formatter; replace its date branch with the helper to remove duplication. Keep its `minutes` extraction intact.

- [ ] **Step 1.4: Run — confirm pass**

```bash
npx jest tests/api/table-bookings-service-window.test.ts
npx tsc --noEmit
```

- [ ] **Step 1.5: Commit**

```bash
git add lib/table-booking-service-windows.ts tests/api/table-bookings-service-window.test.ts
git commit -m "feat(service-windows): export londonIsoDate helper used for London date formatting"
```

---

## Task 2 — `pickSlotWindow` helper (Wave 1B)

**Files:**
- Create: `lib/table-booking-slot-window.ts`
- Test: `tests/unit/table-booking-slot-window.test.ts` (new)

- [ ] **Step 2.1: Add failing tests**

Create `tests/unit/table-booking-slot-window.test.ts` with the cases enumerated in spec §8.1:

```ts
import { pickSlotWindow, DEFAULT_SLOT_WINDOW_SIZE } from '@/lib/table-booking-slot-window'

function makeSlots(start: string, count: number) {
  const [h, m] = start.split(':').map((n) => Number.parseInt(n, 10))
  const startMin = h * 60 + m
  return Array.from({ length: count }, (_, i) => {
    const total = startMin + i * 30
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    return { time: `${hh}:${mm}`, available_capacity: 10 }
  })
}

describe('pickSlotWindow', () => {
  const day22 = makeSlots('12:00', 22) // 12:00..22:30

  it('centres on the anchor (19:00) and returns 7 slots 17:30..20:30', () => {
    const out = pickSlotWindow(day22, '19:00')
    expect(out).toHaveLength(7)
    expect(out[0].time).toBe('17:30')
    expect(out[6].time).toBe('20:30')
  })

  it('shifts the window earlier when the anchor is near close (22:00)', () => {
    const out = pickSlotWindow(day22, '22:00')
    expect(out[0].time).toBe('19:30')
    expect(out[6].time).toBe('22:30')
  })

  it('shifts the window later when the anchor is at open (12:00)', () => {
    const out = pickSlotWindow(day22, '12:00')
    expect(out[0].time).toBe('12:00')
    expect(out[6].time).toBe('15:00')
  })

  it('tie-breaks earlier at 19:15 (anchors 19:00 not 19:30)', () => {
    const out = pickSlotWindow(day22, '19:15')
    expect(out[0].time).toBe('17:30')
    expect(out[6].time).toBe('20:30')
  })

  it('uses the closer slot at 19:16 (anchors 19:30)', () => {
    const out = pickSlotWindow(day22, '19:16')
    expect(out[0].time).toBe('18:00')
    expect(out[6].time).toBe('21:00')
  })

  it('clamps to last 7 when anchor is past end (23:00)', () => {
    const out = pickSlotWindow(day22, '23:00')
    expect(out[0].time).toBe('19:30')
    expect(out[6].time).toBe('22:30')
  })

  it('returns all slots when array is shorter than size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 5), '13:00')).toHaveLength(5)
  })

  it('returns all 7 when array is exactly size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 7), '13:00')).toHaveLength(7)
  })

  it('returns 7 when array is one larger than size', () => {
    expect(pickSlotWindow(makeSlots('12:00', 8), '12:00')).toHaveLength(7)
  })

  it('returns empty for empty array', () => {
    expect(pickSlotWindow([], '12:00')).toEqual([])
  })

  it('returns first `size` slots when anchor is empty/invalid', () => {
    const out = pickSlotWindow(day22, '')
    expect(out).toHaveLength(7)
    expect(out[0].time).toBe('12:00')
  })

  it('respects custom size = 5', () => {
    const out = pickSlotWindow(day22, '19:00', 5)
    expect(out).toHaveLength(5)
    expect(out[0].time).toBe('18:00')
    expect(out[4].time).toBe('20:00')
  })

  it('returns [] for size = 0', () => {
    expect(pickSlotWindow(day22, '19:00', 0)).toEqual([])
  })

  it('preserves object identity', () => {
    const out = pickSlotWindow(day22, '19:00')
    expect(out[0]).toBe(day22[11]) // index 11 = 17:30
  })

  it('exports DEFAULT_SLOT_WINDOW_SIZE === 7', () => {
    expect(DEFAULT_SLOT_WINDOW_SIZE).toBe(7)
  })
})
```

- [ ] **Step 2.2: Run — confirm fail**

```bash
npx jest tests/unit/table-booking-slot-window.test.ts
```

Expected: TS error (file does not exist).

- [ ] **Step 2.3: Implement**

Create `lib/table-booking-slot-window.ts`:

```ts
import type { TableAvailabilitySlot } from '@/lib/api'
import { isValidTime, normalizeTime, toMinutes } from '@/lib/table-booking-service-windows'

export const DEFAULT_SLOT_WINDOW_SIZE = 7

export function pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(
  slots: T[],
  requestedTime: string,
  size: number = DEFAULT_SLOT_WINDOW_SIZE
): T[] {
  if (size <= 0) {
    return []
  }

  if (slots.length <= size) {
    return slots
  }

  const normalizedRequestedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedRequestedTime)) {
    return slots.slice(0, size)
  }

  const requestedMinutes = toMinutes(normalizedRequestedTime)
  let centerIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  slots.forEach((slot, index) => {
    const distance = Math.abs(toMinutes(slot.time) - requestedMinutes)
    if (distance < bestDistance) {
      bestDistance = distance
      centerIndex = index
    }
  })

  const half = Math.floor(size / 2)
  let start = centerIndex - half
  let end = start + size

  if (start < 0) {
    end += -start
    start = 0
  }

  if (end > slots.length) {
    start = Math.max(0, start - (end - slots.length))
    end = slots.length
  }

  return slots.slice(start, end)
}
```

- [ ] **Step 2.4: Run — confirm pass**

```bash
npx jest tests/unit/table-booking-slot-window.test.ts
npx tsc --noEmit
```

- [ ] **Step 2.5: Commit**

```bash
git add lib/table-booking-slot-window.ts tests/unit/table-booking-slot-window.test.ts
git commit -m "feat(book-table): add pickSlotWindow helper for step-2 visual filtering"
```

---

## Task 3 — Wizard: party-size threading + slot window (Wave 2C1)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Test: `tests/unit/ManagementTableBookingForm.test.tsx` (extend)

This task delivers spec §5 (window + expander + reset) and §6.2 (party-size threading). One commit, scoped.

- [ ] **Step 3.1: Add failing tests**

In `tests/unit/ManagementTableBookingForm.test.tsx`, add the helpers from spec §8.2 (`makeAvailabilitySlots`, `searchForTable`) and these test cases verbatim from spec §8.2 numbered list 1–9. Test 10 is a regression check — verify the existing `purpose`-derivation tests still pass after edits, no new test added.

```ts
function makeAvailabilitySlots(
  start: string,
  count: number,
  options: { kitchenClosesAt?: string; capacity?: number } = {}
) {
  const { kitchenClosesAt, capacity = 10 } = options
  const [h, m] = start.split(':').map((n) => Number.parseInt(n, 10))
  const startMin = h * 60 + m
  return Array.from({ length: count }, (_, i) => {
    const total = startMin + i * 30
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    const time = `${hh}:${mm}`
    const kitchen_open = kitchenClosesAt
      ? total < (Number.parseInt(kitchenClosesAt.split(':')[0], 10) * 60 +
                 Number.parseInt(kitchenClosesAt.split(':')[1], 10))
      : true
    return {
      time,
      available: true,
      available_capacity: capacity,
      kitchen_open
    }
  })
}

async function searchForTable(/* see spec §8.2 */) {
  // Fill Party Size, Date, Preferred Time if provided, then click Find a table.
  // Mock fetch for /api/table-bookings/availability to return the slots.
}
```

Add tests 1–9 from spec §8.2 (Default 7-slot render, Expander reveals all, Short lists, Selecting after expanding, Selecting an edge slot does not re-centre, Date change collapses, Party-size change collapses, Preferred Time change re-centres, Party-size no-blur).

- [ ] **Step 3.2: Run — confirm fail**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
```

Expected: failures for missing window behaviour + party-size URL.

- [ ] **Step 3.3: Apply edits in `ManagementTableBookingForm.tsx`**

Use `Edit` (not `Write`) — this is a 2000+ line file.

3.3a — **Imports.** Add:

```ts
import { pickSlotWindow } from '@/lib/table-booking-slot-window'
```

3.3b — **State (near `availability`/`selectedTime` block, ~L555 area).** Add:

```ts
const [showAllTimes, setShowAllTimes] = useState(false)
const [slotWindowAnchorTime, setSlotWindowAnchorTime] = useState(defaultRequestedTime)
```

3.3c — **`fetchAvailabilityForDate` signature.** Add `targetPartySize: number` parameter. Use `targetPartySize` in the URL builder instead of the closed-over `partySize`.

3.3d — **`loadNearestAlternatives` signature.** Add `targetPartySize: number` parameter. Use `targetPartySize` in `pickClosestSlot()` and in candidate filtering.

3.3e — **`runAvailabilitySearch` signature.** Add `targetPartySize: number` to the input object. Pass it through to `fetchAvailabilityForDate` and `loadNearestAlternatives`. On success:

```ts
setDate(input.targetDate)
setRequestedTime(input.targetTime)
setSlotWindowAnchorTime(input.targetTime)
setShowAllTimes(false)
setAvailability(availabilityData)
setSelectedTime(closestTime || '')
setSelectedSlotService(null)
setStep('choose')
```

3.3f — **`handleFindTable`.** Compute `clampedSize` once (existing logic). Call:

```ts
setPartySize(clampedSize)
setPartySizeDisplay(String(clampedSize))
setShowAllTimes(false)
runAvailabilitySearch({
  targetDate: date,
  targetTime: requestedTime,
  targetPartySize: clampedSize,
  source: '...',
  context: '...'
})
```

Do **not** rely on `partySize` state in the same function call.

3.3g — **`handleSlotSelect`.** Keep its current body (sets `selectedTime`, `requestedTime`, `selectedSlotService`). Do NOT touch `slotWindowAnchorTime` or `showAllTimes` here.

3.3h — **`handleDateChange`.** After the existing clears, add `setShowAllTimes(false)`. Do not set `slotWindowAnchorTime`.

3.3i — **Party Size `onChange` and `onBlur`.** After valid parse / clamp respectively, call:

```ts
setShowAllTimes(false)
setSelectedSlotService(null)
```

3.3j — **Preferred Time handler.** Replace the inline handler with:

```ts
function handleRequestedTimeChange(value: string) {
  markFunnelStart()
  setRequestedTime(value)
  setSlotWindowAnchorTime(value)
  setShowAllTimes(false)
  setSelectedSlotService(null)
}
```

Wire to the input.

3.3k — **`resetJourney`.** Add `setShowAllTimes(false)` and `setSlotWindowAnchorTime(defaultRequestedTime)`.

3.3l — **`visibleSlots` memo (after `availableSlots`).**

```ts
const visibleSlots = useMemo(
  () =>
    showAllTimes
      ? availableSlots
      : pickSlotWindow(availableSlots, slotWindowAnchorTime),
  [availableSlots, showAllTimes, slotWindowAnchorTime]
)
```

3.3m — **Slot grid render.** Change the grid `.map()` from `availableSlots` to `visibleSlots`. Keep the no-availability branch keyed on `availableSlots.length === 0`.

3.3n — **Expander button.** Below the grid, inside the `availableSlots.length > 0` branch, add the expander from spec §6.5 (full body with `lucide-react` `ChevronDown`).

```ts
import { ChevronDown } from 'lucide-react'
```

```tsx
{!showAllTimes && availableSlots.length > visibleSlots.length ? (
  <button
    type="button"
    onClick={() => setShowAllTimes(true)}
    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-anchor-gold/30 px-4 py-3 text-base font-medium text-anchor-gold-vivid transition-colors hover:border-anchor-gold hover:bg-anchor-gold/5 focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 sm:w-auto sm:px-6"
  >
    See more times
    <ChevronDown aria-hidden="true" className="h-4 w-4" />
  </button>
) : null}
```

- [ ] **Step 3.4: Run — confirm pass**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
npx tsc --noEmit
```

- [ ] **Step 3.5: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx \
        tests/unit/ManagementTableBookingForm.test.tsx
git commit -m "feat(book-table): step-2 slot window with expander and party-size threading fix"
```

---

## Task 4 — Wizard: London timezone fixes (Wave 2C2)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Test: `tests/unit/ManagementTableBookingForm.test.tsx`

Delivers spec §12.

- [ ] **Step 4.1: Add failing tests**

In `tests/unit/ManagementTableBookingForm.test.tsx`, add a new `describe` block:

```ts
describe('London timezone correctness', () => {
  beforeEach(() => {
    // 2026-04-29T23:30:00Z = 2026-04-30 00:30 BST in London
    jest.useFakeTimers().setSystemTime(new Date('2026-04-29T23:30:00Z'))
  })
  afterEach(() => jest.useRealTimers())

  it('date input min and default are London today (2026-04-30), not UTC (2026-04-29)', async () => {
    const { findByLabelText } = renderWizard()
    const dateInput = await findByLabelText(/date/i) as HTMLInputElement
    expect(dateInput.min).toBe('2026-04-30')
    expect(dateInput.value).toBe('2026-04-30')
  })

  it('Preferred Time default is computed from London now (00:30 + 60 → 01:30)', async () => {
    const { findByLabelText } = renderWizard()
    const timeInput = await findByLabelText(/preferred time/i) as HTMLInputElement
    expect(timeInput.value).toBe('01:30')
  })

  it('past-date validation uses London today: 2026-04-29 rejected, 2026-04-30 allowed', async () => {
    const fetchSpy = mockAvailabilityFetch()
    const { user, findByLabelText, findByRole, findByText } = renderWizard()
    const dateInput = await findByLabelText(/date/i) as HTMLInputElement
    await user.clear(dateInput)
    await user.type(dateInput, '2026-04-29')
    await user.click(await findByRole('button', { name: /find a table/i }))
    await findByText(/future date/i)
    expect(fetchSpy).not.toHaveBeenCalled()

    await user.clear(dateInput)
    await user.type(dateInput, '2026-04-30')
    await user.click(await findByRole('button', { name: /find a table/i }))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
  })

  it('submitted POST body date matches the London date input', async () => {
    const { submitSpy } = await runFullBookingFlow({ date: '2026-04-30', time: '19:00' })
    expect(submitSpy.mock.calls[0][1].body).toEqual(expect.stringContaining('"date":"2026-04-30"'))
  })
})
```

- [ ] **Step 4.2: Run — confirm fail**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London timezone"
```

- [ ] **Step 4.3: Apply edits**

4.3a — **Imports.**

```ts
import { londonIsoDate, londonNowParts, toTimeString } from '@/lib/table-booking-service-windows'
```

4.3b — **`getDefaultTimeValue()` (~L147).** Replace its body:

```ts
function getDefaultTimeValue(): string {
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  return toTimeString(next % 1440)
}
```

4.3c — **`toIsoDateInputValue()` (~L139).** If input is already `YYYY-MM-DD`, return it unchanged. Else parse `new Date(value)` and return `londonIsoDate(parsed)` (or `''` if `Number.isNaN(parsed.getTime())`). Remove `toISOString().slice(0,10)`.

4.3d — **`addDays()` (~L300).** Re-implement timezone-neutrally:

```ts
function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map((n) => Number.parseInt(n, 10))
  const utc = new Date(Date.UTC(y, m - 1, d + days))
  return londonIsoDate(utc)
}
```

(`londonIsoDate` formats a UTC anchor through London — for date-only arithmetic this is safe because BST/GMT shifts never cross noon.)

4.3e — **`today` (~L519).** Replace:

```ts
const today = useMemo(() => londonNowParts().isoDate, [])
```

4.3f — **Past-date validation.** Add a small helper near the top of the component file (or co-locate near other utilities):

```ts
function isPastLondonDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
}
```

In `handleFindTable()` (~L881–L890) and `handleDateChange()` (~L1001–L1009), replace any `new Date(date + 'T00:00:00') < new Date(...)` style check with `if (isPastLondonDate(value)) { ... }`. Preserve the existing user-facing error copy.

4.3g — **Now-ticker comment (~L470–L473).** Add a comment explaining the invariant:

```ts
// Re-render tick only. Booking date/time computations must use Europe/London
// helpers (londonIsoDate / londonNowParts), not the browser-local value below.
const [, setNow] = useState(() => new Date())
```

4.3h — **Verify no `toISOString` remains.** After edits:

```bash
grep -n "toISOString" components/features/TableBooking/ManagementTableBookingForm.tsx
```

Expected: no matches in date/time-derivation paths. If a `toISOString` remains in unrelated logging code, OK; document the surviving call in the commit message.

- [ ] **Step 4.4: Run — confirm pass**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
TZ=America/New_York npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London"
npx tsc --noEmit
```

- [ ] **Step 4.5: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx \
        tests/unit/ManagementTableBookingForm.test.tsx
git commit -m "fix(book-table): compute today, defaults, and past-date validation in Europe/London"
```

---

## Task 5 — Wizard: mobile optimisation (Wave 2C3)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Test: `tests/unit/ManagementTableBookingForm.test.tsx`

Delivers spec §11.

- [ ] **Step 5.1: Add failing tests**

```ts
describe('Mobile optimisation', () => {
  it('Party Size input has inputMode="numeric" and pattern="[0-9]*"', async () => {
    const { findByLabelText } = renderWizard()
    const input = await findByLabelText(/party size/i) as HTMLInputElement
    expect(input.inputMode).toBe('numeric')
    expect(input.pattern).toBe('[0-9]*')
  })

  it('Mobile Number has inputMode="tel" and autoComplete="tel"', async () => {
    const { findByLabelText } = renderWizardOnDetailsStep()
    const input = await findByLabelText(/mobile number/i) as HTMLInputElement
    expect(input.inputMode).toBe('tel')
    expect(input.autocomplete).toBe('tel')
  })

  it('Email has inputMode="email" and autoComplete="email"', async () => {
    /* similar */
  })

  it('First/Last Name carry given-name/family-name autoComplete', async () => {
    /* similar */
  })

  it('slot button has aria-label combining time and service caption', async () => {
    const { getByRole } = await openStep2WithSlots([
      { time: '19:00', kitchen_open: true, available: true, available_capacity: 4 },
      { time: '22:00', kitchen_open: false, available: true, available_capacity: 4 }
    ])
    expect(getByRole('button', { name: /7:00 PM, drinks and food/i })).toBeInTheDocument()
    expect(getByRole('button', { name: /10:00 PM, drinks only/i })).toBeInTheDocument()
  })

  it('slot button class includes min-h-14, alternative button class includes min-h-12, expander class includes py-3', async () => {
    /* class-presence check */
  })

  it('step transition triggers scrollIntoView with { block: "start" } (not on mount)', async () => {
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView')
    const { advanceToStepChoose } = await renderAndSearch()
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }))
    scrollSpy.mockRestore()
  })

  it('pressing Enter on Preferred Time submits the find-step form', async () => {
    const fetchSpy = mockAvailabilityFetch()
    const { user, findByLabelText } = renderWizard()
    const time = await findByLabelText(/preferred time/i)
    await user.type(time, '{Enter}')
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
  })

  it('booking-policy checkbox label is a 48 px tap target (class includes min-h-12)', async () => {
    /* class-presence check on the label wrapping the checkbox */
  })
})
```

- [ ] **Step 5.2: Run — confirm fail**

- [ ] **Step 5.3: Apply edits**

5.3a — **Add `wizardRef` + scroll effect.**

```ts
const wizardRef = useRef<HTMLDivElement>(null)
const wizardMountedRef = useRef(false)

useEffect(() => {
  if (!wizardMountedRef.current) {
    wizardMountedRef.current = true
    return
  }
  wizardRef.current?.scrollIntoView({ block: 'start' })
}, [step])
```

Attach `ref={wizardRef}` to the existing top-level wizard container `<div>`.

5.3b — **Inputs — pass-through HTML attributes.** The shared `<Input>` primitive spreads `InputHTMLAttributes` (verified). Apply per spec §11.2:

| Field | Add |
|---|---|
| Party Size (~L1545) | `inputMode="numeric"` `pattern="[0-9]*"` `size="lg"` |
| Mobile Number (~L1749) | `inputMode="tel"` `autoComplete="tel"` `size="lg"` |
| Email (~L1821) | `inputMode="email"` `autoComplete="email"` `size="lg"` |
| First Name (~L1804) | `autoComplete="given-name"` `size="lg"` |
| Last Name (~L1812) | `autoComplete="family-name"` `size="lg"` |
| Date (~L1571) | `size="lg"` only |
| Preferred Time (~L1581) | `size="lg"` only |

5.3c — **Slot button.** Add `min-h-14` to the button className. Add `aria-label`:

```tsx
aria-label={`${formatTimeForDisplay(slot.time)}, ${
  slot.kitchen_open === false ? 'drinks only' : 'drinks and food'
}`}
```

5.3d — **Alternative slot button (~L1688).** Update className to `px-3 py-3 text-base min-h-12 ...` (preserve existing border / hover classes).

5.3e — **All visible action `<Button>` elements.** Apply `size="lg"` for primary CTAs (`Find a table`, `Continue`, `Continue to review`, `Confirm booking`, `Confirm and pay deposit`, `Book another`, `Start a new booking`). For smaller secondary buttons (`Back`, `Use Different Number`, phone-lookup `Continue`, `Join waitlist by phone`), append `className="... min-h-12"` to the existing className.

5.3f — **Booking-policy checkbox label (~L2015).** Wrap or update the label to include `min-h-12 py-2` so the whole row is a comfortable tap target.

5.3g — **Step-1 form semantics.** Wrap the find-step fields and the `Find a table` button in `<form onSubmit={(e) => { e.preventDefault(); handleFindTable() }}>`. Change the `Find a table` `<Button>` to `type="submit"`. Other steps unchanged.

- [ ] **Step 5.4: Run — confirm pass**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
npx tsc --noEmit
```

- [ ] **Step 5.5: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx \
        tests/unit/ManagementTableBookingForm.test.tsx
git commit -m "feat(book-table): mobile optimisation across the wizard"
```

---

## Task 6 — Wizard: idempotency-key fingerprinting (Wave 2C4)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`
- Test: `tests/unit/ManagementTableBookingForm.test.tsx`

Delivers spec §13.2 / §13.3 / §2.7.

- [ ] **Step 6.1: Add failing tests** (spec §13.3 — four cases)

```ts
describe('Idempotency-key submit-intent fingerprinting', () => {
  it('reuses the same key on retry when payload is unchanged', async () => {
    const { submitSpy, retryConfirm } = await runFlowToConfirm()
    await retryConfirm() // simulate network failure + retry
    const key1 = submitSpy.mock.calls[0][1].headers['Idempotency-Key']
    const key2 = submitSpy.mock.calls[1][1].headers['Idempotency-Key']
    expect(key1).toBe(key2)
  })

  it('issues a new key after starting a new search', async () => {
    /* complete a Confirm, click "Book another", change date, search, fill, Confirm */
    /* assert new key */
  })

  it('reuses the key across Back-and-forward when details unchanged', async () => {
    /* enter review, Back to details, immediately Continue to review, Confirm */
    /* assert same key as first review entry */
  })

  it('issues a new key when notes change after backing out of review', async () => {
    /* enter review, Back to details, change notes, Continue to review, Confirm */
    /* assert new key */
  })
})
```

- [ ] **Step 6.2: Run — confirm fail**

- [ ] **Step 6.3: Apply edits**

6.3a — **Add the helper functions** alongside the existing `createClientIdempotencyKey`:

```ts
type SubmitIntentKey = {
  fingerprint: string
  key: string
}

function buildSubmitIntentFingerprint(input: {
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  date: string
  time: string
  partySize: number
  purpose: 'food' | 'drinks'
  notes?: string
}): string {
  return JSON.stringify({
    phone: input.phone.trim(),
    firstName: input.firstName?.trim() || '',
    lastName: input.lastName?.trim() || '',
    email: input.email?.trim() || '',
    date: input.date,
    time: input.time,
    partySize: input.partySize,
    purpose: input.purpose,
    notes: input.notes?.trim() || ''
  })
}
```

6.3b — **Add the ref + getter** inside the component body:

```ts
const submitIntentKeyRef = useRef<SubmitIntentKey | null>(null)

function getSubmitIntentIdempotencyKey(fingerprint: string): string {
  if (submitIntentKeyRef.current?.fingerprint === fingerprint) {
    return submitIntentKeyRef.current.key
  }
  const key = createClientIdempotencyKey('tbl_web')
  submitIntentKeyRef.current = { fingerprint, key }
  return key
}

function clearSubmitIntentIdempotencyKey() {
  submitIntentKeyRef.current = null
}
```

6.3c — **Update `handleConfirmBooking()` (~L1225).** Replace the inline `const idempotencyKey = createClientIdempotencyKey('tbl_web')` (L1249) with:

```ts
// Derive purpose first so the fingerprint reflects the actual submitted purpose.
const purpose = deriveSubmitPurpose()
if (!purpose) {
  setSubmitError('Please choose a time again before confirming.')
  return
}

const fingerprint = buildSubmitIntentFingerprint({
  phone: trimmedPhone,
  firstName,
  lastName,
  email,
  date,
  time: selectedTime,
  partySize,
  purpose,
  notes
})
const idempotencyKey = getSubmitIntentIdempotencyKey(fingerprint)
```

Then build the request body. Volatile fields (`_t`, `turnstile_token`, `website`) are added to the body **after** key selection — they are NOT in the fingerprint.

6.3d — **Reset paths.**

- In `handleFindTable()` (before kicking off the new search): `clearSubmitIntentIdempotencyKey()`.
- In `resetJourney()`: `clearSubmitIntentIdempotencyKey()`.

6.3e — **Verify the proxy already accepts the header.** Already confirmed (`app/api/table-bookings/route.ts` reads incoming `Idempotency-Key` per spec §13). No proxy change.

- [ ] **Step 6.4: Run — confirm pass**

```bash
npx jest tests/unit/ManagementTableBookingForm.test.tsx
npx tsc --noEmit
```

- [ ] **Step 6.5: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx \
        tests/unit/ManagementTableBookingForm.test.tsx
git commit -m "fix(book-table): reuse idempotency key per submit-intent fingerprint"
```

---

## Task 7 — Final verification pipeline (Wave 3 — orchestrator)

**Files:** none modified by default (fix-forward as needed).

- [ ] **Step 7.1: Lint**

```bash
npm run lint
```

Expected: zero new errors. Pre-existing 15 errors on unrelated routes are out of scope.

- [ ] **Step 7.2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 7.3: Targeted tests**

```bash
npm run test -- --runTestsByPath \
  tests/unit/table-booking-slot-window.test.ts \
  tests/unit/ManagementTableBookingForm.test.tsx
TZ=America/New_York npm run test -- --runTestsByPath \
  tests/unit/ManagementTableBookingForm.test.tsx -t "London"
```

- [ ] **Step 7.4: Full test run (regression check)**

```bash
npm test
```

Expected: 29 pre-existing failures unchanged; new tests pass; no PR-induced regressions.

- [ ] **Step 7.5: Production build**

```bash
npm run build
```

- [ ] **Step 7.6: Manual smoke (`npm run dev`)** — spec §9 scenarios:
  - 22-slot day, requested 19:00 → 7 slots visible, expander appears, expanding shows full list.
  - Late-night search (requested 22:00) → window shifts earlier.
  - Selecting an edge slot does not re-centre.
  - Date / party-size / preferred-time changes collapse and re-centre.
  - Mobile (Chrome devtools): tap targets ≥48 px; `inputMode` keypads correct on iOS simulator if available; step transitions scroll to top of the wizard.
  - Submit a booking; Confirm twice (force one network failure) → only one booking created (management-side dedupe via stable Idempotency-Key).

- [ ] **Step 7.7: Commit any cleanup from verification** (only if needed)

```bash
git add -A
git commit -m "chore(book-table): post-refactor cleanup"
```

---

## Spec ↔ Plan Coverage

| Spec section | Covered by task |
|---|---|
| §1.1 Timezone Policy (statement) | T4 (implementation), T7 (verification) |
| §2.1–§2.4 (slot-window correctness) | T3 |
| §2.5 (party-size closure) | T3 (Step 3.3c–3.3f) |
| §2.6 (London bugs) | T4 |
| §2.7 (idempotency per-click) | T6 |
| §2.8 (browser-local past-date validation) | T4 (Step 4.3f) |
| §5 (default window + expander + reset) | T3 |
| §6.1 `pickSlotWindow` helper | T2 |
| §6.2 party-size threading | T3 |
| §6.3–6.7 wizard integration | T3 |
| §11 Mobile Optimisation | T5 |
| §12.1 `londonIsoDate` helper | T1 |
| §12.2 today / defaults / addDays / toIsoDateInputValue | T4 |
| §12.3 past-date validation | T4 |
| §12.4 ticker comment | T4 |
| §12.6 timezone tests | T4 |
| §13.1 verified-correct contract | (no change — confirmed at PR review) |
| §13.2 idempotency fingerprint | T6 |
| §13.3 idempotency tests | T6 |
| §14 Acceptance Criteria | T7 verifies all |

---

## Out-of-repo / follow-ups (NOT in this plan)

- Sticky-bottom CTA on mobile.
- Country-code input for non-UK phone numbers.
- `dietary_requirements` / `allergies` form fields in the wizard (API accepts both).
- App-wide `<Input>` default size bump.

---

## Rollback

`git revert <merge-commit>`. No DB migration. No management-API contract change. No third-party integration change.
