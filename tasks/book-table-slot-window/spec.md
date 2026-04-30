# Spec - Step-2 Slot Window

**Status:** Repo-reviewed and revised  
**Owner:** Peter  
**Last updated:** 2026-04-30  
**Builds on:** purpose-chooser removal and commit `5516b15`

---

## 1. Goal

Reduce visual overwhelm on `/book-table` step 2 by showing a small default set of nearby times, while keeping the full day one tap away.

The booking API contract does not change. `/api/table-bookings/availability` must continue returning the complete combined food/drinks availability response with `kitchen_open` stamped per slot. This task changes only the public booking wizard's presentation and a small stale-state bug in the same availability-search path.

Default customer behavior:

1. Customer enters party size, date, and preferred time.
2. Step 2 shows at most 7 available slot buttons centred on the searched preferred time.
3. If more than 7 available slots exist, a `See more times` control reveals the complete available slot list.
4. Slot captions stay exactly as they are today: `Drinks & food` or `Drinks only`.
5. Submit-time `purpose` derivation stays exactly as it is today.

## 1.1 Timezone Policy

The pub is in Stanwell Moor and operates exclusively on **Europe/London** time. Every date and time the wizard surfaces, computes, validates, or sends to the management API is naive Europe/London — never UTC, never browser-local. This applies even when the customer's device clock is on another timezone (e.g. a Heathrow traveller on US Eastern time).

Specifically:

- The `<input type="date">` `min` constraint must be **today in Europe/London**, not `new Date().toISOString().slice(0, 10)` (which produces a UTC date and can be a day off near midnight BST).
- The default Preferred Time must be **now (rounded to the next bookable :30) in Europe/London**, not the browser's local clock.
- The "now ticker" used to force periodic re-rendering must not feed browser-local dates into booking logic; any consumer that derives a date or time from it must format in Europe/London.
- The payload sent to `/api/table-bookings` (and from there to the management API) carries `date: 'YYYY-MM-DD'` and `time: 'HH:mm'` interpreted as Europe/London — confirmed by the management API contract (see §13).
- No `Z`, no offset, no `toISOString()` ever appears in a path that produces a date-input value or a payload date/time.

**Canonical helper.** `lib/table-booking-service-windows.ts:londonNowParts()` already returns `{ isoDate, minutes }` in Europe/London. Reuse it. Do not reinvent the timezone math inline.

---

## 2. Critical Review Findings

These are the problems found in the original draft or in adjacent code while reviewing the implementation path. The implementation must account for all of them.

1. **The draft would make the grid jump after selecting a slot.**  
   `handleSlotSelect()` currently calls both `setSelectedTime(slot.time)` and `setRequestedTime(slot.time)`. If `visibleSlots` is derived directly from `requestedTime`, clicking a non-centre slot will re-centre the 7-slot window and move the grid under the customer's pointer. Use a separate immutable `slotWindowAnchorTime` captured at search time.

2. **Do not reset expansion with a broad `useEffect([requestedTime])`.**  
   Because slot selection currently mutates `requestedTime`, a generic effect would collapse the expanded grid when the customer selects a time. Reset expansion only from explicit search-input changes and new-search/reset handlers.

3. **The draft's disabled-slot language is wrong for the current code.**  
   `availableSlots` currently filters `availability.time_slots` through `isSlotAvailable(slot, partySize)`. Unavailable or party-too-large slots are not rendered as disabled buttons in `ManagementTableBookingForm.tsx`. This task must preserve that behavior. The slot window operates on `availableSlots`, not on raw `availability.time_slots`.

4. **The draft contradicted itself on `19:15`.**  
   It said `19:15 -> 19:30`, while also saying ties prefer the earlier slot. The implementation must use deterministic earlier-slot tie breaking, matching the existing `pickClosestSlot()` reduce behavior. Therefore `19:15` between `19:00` and `19:30` anchors on `19:00`; `19:16` anchors on `19:30`.

5. **Current code has a stale party-size closure bug.**  
   `handleFindTable()` clamps `partySizeDisplay` into `clampedSize`, calls `setPartySize(clampedSize)`, then immediately calls `runAvailabilitySearch()`. Because React state updates are async, `fetchAvailabilityForDate()`, `pickClosestSlot()`, and nearest-alternative filtering can still use the previous `partySize`. Fix this in the same task by passing `targetPartySize` explicitly through the availability-search functions.

6. **The London default date/time bugs MUST be fixed in this task.**  
   `today` uses `new Date().toISOString().slice(0, 10)` (L519) which produces a **UTC** date — wrong for a UK pub at 23:30 BST or for a customer outside Europe/London. `getDefaultTimeValue()` (L147–148) uses the browser's local clock, not London. Two more `toISOString().slice(0, 10)` calls at L144 and L304 have the same UTC bug. The user has expanded scope (see §1.1 Timezone Policy) — these fixes ship in this PR. Implementation guidance is in §12.

7. **Idempotency-key generation is per-click, not per-submit-intent.**  
   `handleConfirmBooking()` calls `createClientIdempotencyKey('tbl_web')` at L1249 — inside the handler. Each click of "Confirm booking" generates a fresh key. If a Confirm submission times out and the customer clicks again, a new key is sent and the management API's idempotency dedupe will not recognise the retry as the same intent — risk of duplicate bookings under degraded networks. Fix this with a stable submit-intent fingerprint: reuse the key only while the actual booking payload is unchanged, and generate a new key if the customer changes the selected slot or booking details before confirming again. See §13.

8. **Past-date validation is still browser-local.**  
   `handleFindTable()` (L883-L886) and `handleDateChange()` (L1002-L1005) compare `new Date(date + 'T00:00:00')` against the customer's browser-local midnight. That can reject or allow the wrong date for travellers outside the UK. Replace both checks with a Europe/London date-string comparison against `londonNowParts().isoDate`; do not parse date-only strings with `new Date(...)` for booking validation.

---

## 3. Current Repo Facts

- `/book-table` renders `ManagementTableBookingForm` from `components/features/TableBooking/ManagementTableBookingForm.tsx`.
- Step 2 currently renders `availableSlots`, where:
  ```ts
  const availableSlots = useMemo(
    () =>
      (availability?.time_slots || []).filter((slot) => isSlotAvailable(slot, partySize)),
    [availability?.time_slots, partySize]
  )
  ```
- `availability.time_slots` is the raw API response. It may contain unavailable slots, but those are not shown by this component today.
- `handleSlotSelect(slot)` captures `selectedSlotService` and derives submit `purpose` later from `slot.kitchen_open`.
- `runAvailabilitySearch()` currently:
  - fetches availability,
  - finds the closest available slot,
  - sets `date`, `requestedTime`, `availability`, `selectedTime`, and `step: 'choose'`.
- `fetchAvailabilityForDate()` and `loadNearestAlternatives()` currently close over component `partySize`.
- `tests/unit/ManagementTableBookingForm.test.tsx` exists and already covers purpose-removal behavior.
- `lib/table-booking-service-windows.ts` already exports `toMinutes()`.
- `lib/table-booking-service-windows.ts` already exports `londonNowParts()` and `toTimeString()`.
- `TableAvailabilitySlot` is exported from `@/lib/api`.

---

## 4. Scope

### In Scope

- `components/features/TableBooking/ManagementTableBookingForm.tsx`
  - local state for expanded/collapsed slot list,
  - separate slot-window anchor time,
  - visible-slot derivation,
  - expander UI,
  - explicit party-size threading through availability search,
  - **Europe/London correctness for `today`, `defaultRequestedTime`, past-date validation, and the "now ticker"** (see §1.1 and §12),
  - **submit-intent idempotency-key reuse across Confirm retries** (see §2.7 and §13),
  - **mobile optimisation across every step** (see §11).
- New helper `lib/table-booking-slot-window.ts`.
- `lib/table-booking-service-windows.ts` for the exported London date helper required by §12 (`londonIsoDate(date?: Date): string`). Do not change service-window range behavior in this task.
- New helper tests in `tests/unit/table-booking-slot-window.test.ts`.
- Component test additions in `tests/unit/ManagementTableBookingForm.test.tsx`.

### Out of Scope

- Backend availability contract or route behavior.
- `app/api/table-bookings/availability/route.ts`.
- `app/api/table-bookings/route.ts`. (No payload, header, or response-handling changes are needed — see §13 confirming the proxy already matches the management contract.)
- `lib/api/client.ts` fallback behavior.
- `lib/table-booking-service-windows.ts` service-window range logic, except the date-format helper allowed above.
- Booking-agent behavior.
- Submit-time `purpose` derivation rules.
- Changing whether unavailable slots are shown as disabled buttons.
- Analytics on expander taps.
- Persisting expanded state across page reloads or completed journeys.
- Wording experiments beyond the fixed `See more times` label.
- Adding `dietary_requirements` and `allergies` form fields to the wizard. The management API accepts both as optional arrays (§13). Adding form inputs is a UX product decision not required by the contract; flag for a follow-up if desired.
- International phone-number entry — the existing UK-only `default_country_code: '44'` assumption stands.

---

## 5. Customer-Facing Behavior

### 5.1 Default Window

When the customer reaches step 2 after a successful availability search:

- The grid shows at most 7 slot buttons.
- The 7-slot window is centred on the preferred time used for that search.
- If fewer than 7 available slots exist, show all available slots.
- If exactly 7 available slots exist, show all 7 and do not render the expander.
- If more than 7 available slots exist, render the expander below the grid.

Important wording:

- In this spec, "slot" means a slot in `availableSlots`, not raw `availability.time_slots`.
- The implementation must not expose unavailable raw slots as disabled buttons.

### 5.2 Window Anchor

Use a dedicated `slotWindowAnchorTime` state value.

- Set it to `input.targetTime` when a new availability search succeeds.
- Use it for `pickSlotWindow(availableSlots, slotWindowAnchorTime)`.
- Do not update it in `handleSlotSelect()`.
- Do not derive it from `selectedTime`.

This preserves the current behavior where selecting a slot may update `requestedTime` for the form, without letting that selected time move the step-2 grid.

### 5.3 Window Algorithm

For a sorted slot array and requested/anchor time:

1. If `size <= 0`, return `[]`.
2. If `slots.length <= size`, return `slots` unchanged.
3. If `requestedTime` is empty or invalid, return `slots.slice(0, size)`.
4. Convert `requestedTime` to minutes.
5. Find the index whose slot time has the smallest absolute minute distance.
6. If two slots are equally close, choose the earlier slot. Because slots are chronological, this means keeping the first equal-distance candidate.
7. For the default `size = 7`, take `[centre - 3, centre + 3]`.
8. If that would run before the start, shift the window right.
9. If that would run past the end, shift the window left.
10. Return `slots.slice(start, end)`.

Examples using 30-minute slots from `12:00` through `22:30`:

| Anchor | Expected visible window |
|---|---|
| `19:00` | `17:30` through `20:30` |
| `22:00` | `19:30` through `22:30` |
| `12:00` | `12:00` through `15:00` |
| `19:15` | tie between `19:00` and `19:30`; choose `19:00`, so `17:30` through `20:30` |
| `19:16` | closer to `19:30`, so `18:00` through `21:00` |
| `23:00` | nearest is `22:30`, so `19:30` through `22:30` |

### 5.4 Expander

Render a single subordinate button below the grid when:

```ts
!showAllTimes && availableSlots.length > visibleSlots.length
```

Button behavior:

- Text must be exactly `See more times`.
- `type="button"`.
- On click, call `setShowAllTimes(true)`.
- Once expanded, render every slot in `availableSlots` in the existing order.
- Hide the expander after it has been clicked.
- Do not add a collapse control.
- Do not fire new analytics events in this task.

### 5.5 Reset Behavior

Collapsed/expanded state resets to collapsed when a new customer search context is created.

Call `setShowAllTimes(false)` in these places:

- `handleFindTable()` before starting a new search.
- `runAvailabilitySearch()` when applying a new availability result.
- `handleDateChange()`.
- Party-size input `onChange` when the raw value parses to a number.
- Party-size input `onBlur` after clamping.
- Preferred Time input `onChange`.
- `resetJourney()`.

Do not reset `showAllTimes` in `handleSlotSelect()`.

Do not add:

```ts
useEffect(() => setShowAllTimes(false), [requestedTime])
```

That broad effect is incorrect because slot selection currently changes `requestedTime`.

---

## 6. Implementation Instructions

### 6.1 Add `lib/table-booking-slot-window.ts`

Create a pure helper. No React, no fetch, no component state.

```ts
import type { TableAvailabilitySlot } from '@/lib/api'
import { isValidTime, normalizeTime, toMinutes } from '@/lib/table-booking-service-windows'

export const DEFAULT_SLOT_WINDOW_SIZE = 7

export function pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(
  slots: T[],
  requestedTime: string,
  size: number = DEFAULT_SLOT_WINDOW_SIZE
): T[] {
  // Implementation here.
}
```

Required helper rules:

- Treat `size <= 0` as "no visible slots" and return `[]`.
- If `slots.length <= size`, return `slots` unchanged.
- Normalize `requestedTime` with `normalizeTime()`.
- If the normalized requested time is invalid, return `slots.slice(0, size)`.
- Use `toMinutes()` from `lib/table-booking-service-windows.ts`; do not duplicate a new parser.
- Preserve the original slot objects and order.
- Do not sort in the helper. The availability route already returns chronological slots, and the component must keep original positions after expansion.
- Use strict `<` when comparing candidate distance so ties keep the earlier candidate.

Reference implementation shape:

```ts
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
```

### 6.2 Fix Party-Size Threading

Before adding windowing, remove the stale party-size closure in the availability path.

Change signatures to pass the intended party size explicitly:

```ts
async function fetchAvailabilityForDate(
  targetDate: string,
  targetTime: string,
  targetPartySize: number,
  signal?: AbortSignal
): Promise<AvailabilityData>
```

```ts
async function loadNearestAlternatives(
  targetDate: string,
  targetTime: string,
  targetPartySize: number
)
```

```ts
async function runAvailabilitySearch(input: {
  targetDate: string
  targetTime: string
  targetPartySize: number
  source: string
  context: string
  signal?: AbortSignal
})
```

Then:

- Use `targetPartySize` in the availability query param.
- Use `targetPartySize` when filtering alternative slots.
- Use `targetPartySize` in `pickClosestSlot(...)`.
- In `handleFindTable()`, compute `clampedSize` once and pass it as `targetPartySize`.
- Keep `setPartySize(clampedSize)` and `setPartySizeDisplay(String(clampedSize))` so rendered state matches the request.

This is a required fix because the slot window is centred after the same search. Do not leave the search using stale state.

### 6.3 Add Component State

In `ManagementTableBookingForm.tsx`, near the existing availability/selection state:

```ts
const [showAllTimes, setShowAllTimes] = useState(false)
const [slotWindowAnchorTime, setSlotWindowAnchorTime] = useState(defaultRequestedTime)
```

When a search succeeds in `runAvailabilitySearch()`:

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

Keep `handleSlotSelect(slot)` focused on the selected slot and submit metadata:

```ts
function handleSlotSelect(slot: AvailabilitySlot) {
  setSelectedTime(slot.time)
  setRequestedTime(slot.time)
  setSelectedSlotService({
    date,
    time: slot.time,
    kitchen_open: slot.kitchen_open
  })
  // Do not set slotWindowAnchorTime here.
  // Do not setShowAllTimes(false) here.
}
```

### 6.4 Derive Visible Slots

Import the helper:

```ts
import { pickSlotWindow } from '@/lib/table-booking-slot-window'
```

Add this after `availableSlots`:

```ts
const visibleSlots = useMemo(
  () =>
    showAllTimes
      ? availableSlots
      : pickSlotWindow(availableSlots, slotWindowAnchorTime),
  [availableSlots, showAllTimes, slotWindowAnchorTime]
)
```

Use `visibleSlots` only for the slot-grid `.map()`.

Keep these conditions based on `availableSlots`:

- whether the grid exists,
- whether to show no-availability UI,
- event suggestion copy that distinguishes "no availability",
- nearest alternatives.

In other words:

```tsx
{availableSlots.length > 0 ? (
  <>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {visibleSlots.map((slot) => {
        // existing slot button
      })}
    </div>

    {!showAllTimes && availableSlots.length > visibleSlots.length ? (
      <button type="button" onClick={() => setShowAllTimes(true)}>
        See more times
      </button>
    ) : null}
  </>
) : (
  // existing no-availability alert
)}
```

### 6.5 Expander Styling

The expander must be a real tap target on mobile, not a thin underlined link. Use a full-width ghost button on small screens that narrows on `sm` and up. Include a downward chevron icon to make the affordance unambiguous.

Use the existing icon dependency rather than hand-written SVG:

```ts
import { ChevronDown } from 'lucide-react'
```

```tsx
<button
  type="button"
  onClick={() => setShowAllTimes(true)}
  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-anchor-gold/30 px-4 py-3 text-base font-medium text-anchor-gold-vivid transition-colors hover:border-anchor-gold hover:bg-anchor-gold/5 focus:outline-none focus:ring-2 focus:ring-anchor-gold focus:ring-offset-2 sm:w-auto sm:px-6"
>
  See more times
  <ChevronDown aria-hidden="true" className="h-4 w-4" />
</button>
```

Required properties:

- `type="button"` (must not submit any wrapping form).
- `min-h-12` effective via `py-3 text-base` (~48px).
- Full width on mobile, auto width on `sm` and up.
- Downward `ChevronDown` icon from `lucide-react` (`aria-hidden="true"` — the visible label "See more times" already conveys meaning).

Do not introduce a new shared component for this.

### 6.6 Input Reset Details

Date:

- `handleDateChange(value)` already clears availability, alternatives, `selectedTime`, and `selectedSlotService`.
- Add `setShowAllTimes(false)`.
- Replace the current past-date check with `isPastLondonDate(value)` from §12.3. Do not use `new Date(value + 'T00:00:00')` or browser-local midnight.
- Do not set `slotWindowAnchorTime` from the date value. The next successful search sets the definitive anchor from `input.targetTime`.

Party size:

- In party-size `onChange`, after a valid parsed value, call:
  ```ts
  setShowAllTimes(false)
  setSelectedSlotService(null)
  ```
- In party-size `onBlur`, after clamping, call:
  ```ts
  setShowAllTimes(false)
  setSelectedSlotService(null)
  ```
- Do not clear `partySizeDisplay` when raw input is empty; preserve the existing mobile input fix.
- These handlers do not need to clear `selectedTime` immediately because step 1 hides the old slot; the next successful search replaces `selectedTime`. They must clear `selectedSlotService` so stale `kitchen_open` metadata cannot survive to submit.

Preferred time:

- Replace the inline handler with a small helper if that makes the reset explicit:
  ```ts
  function handleRequestedTimeChange(value: string) {
    markFunnelStart()
    setRequestedTime(value)
    setSlotWindowAnchorTime(value)
    setShowAllTimes(false)
    setSelectedSlotService(null)
  }
  ```
- Do not clear `selectedTime` from `handleSlotSelect()`.

Reset journey:

- Add `setShowAllTimes(false)`.
- Add `setSlotWindowAnchorTime(defaultRequestedTime)`.
- Clear the submit-intent idempotency key from §13.2.

### 6.7 Preserve Existing Behavior

Do not change:

- `normalizeAvailabilityResponse()`.
- `isSlotAvailable()`.
- `pickClosestSlot()` except for passing `targetPartySize` from `runAvailabilitySearch()`.
- slot service captions.
- `deriveSubmitPurpose()`.
- nearest-alternative submit metadata.
- group deposit logic.
- `/api/table-bookings` payload shape.

---

## 7. Edge Cases

| Case | Required behavior |
|---|---|
| `availableSlots.length === 0` | Existing no-availability UI and nearest alternatives render. Helper is not relevant. Expander hidden. |
| `availableSlots.length < 7` | Show all available slots. Expander hidden. |
| `availableSlots.length === 7` | Show all 7. Expander hidden. |
| `availableSlots.length === 8` | Show 7 centred on anchor. Expander visible. |
| Anchor is before first slot | Show first 7 available slots. |
| Anchor is after last slot or equal to venue close | Show last 7 available slots. |
| Anchor is inside a non-bookable gap | Centre on the nearest available slot by minute distance. |
| Anchor is exactly between two available slots | Prefer the earlier slot. |
| Customer selects a visible non-centre slot | Selected styling updates, but the visible window does not re-centre or collapse. |
| Customer expands then selects a slot | Full list remains expanded. |
| Customer expands then goes Back, edits date/party size/preferred time, and searches again | New step-2 render is collapsed to the 7-slot window. |
| Kitchen is closed for some slots | Captions still come from `slot.kitchen_open`; windowing must not alter them. |
| Raw API response contains unavailable slots | Preserve current component behavior: unavailable slots are filtered out before windowing. |

---

## 8. Tests

### 8.1 New Unit Tests - `tests/unit/table-booking-slot-window.test.ts`

Create a helper in the test file:

```ts
function makeSlots(start: string, count: number) {
  // Build sorted objects like { time: '12:00', available_capacity: 10 }.
}
```

Required test cases:

- 22-slot day from `12:00` to `22:30`, anchor `19:00` returns 7 slots, first `17:30`, last `20:30`.
- Same day, anchor `22:00` returns first `19:30`, last `22:30`.
- Same day, anchor `12:00` returns first `12:00`, last `15:00`.
- Same day, anchor `19:15` tie-breaks earlier and returns first `17:30`, last `20:30`.
- Same day, anchor `19:16` returns first `18:00`, last `21:00`.
- Same day, anchor `23:00` returns first `19:30`, last `22:30`.
- 5-slot array returns all 5.
- 7-slot array returns all 7.
- 8-slot array returns 7.
- Empty array returns empty.
- Invalid or empty anchor returns the first `size` slots.
- `size = 5` returns 5 slots centred on the anchor.
- `size = 0` returns `[]`.
- Object identity is preserved. Example: `expect(result[0]).toBe(slots[expectedIndex])`.

### 8.2 Component Tests - `tests/unit/ManagementTableBookingForm.test.tsx`

Add small helpers to keep tests readable:

```ts
function makeAvailabilitySlots(start: string, count: number, options?: {
  kitchenClosesAt?: string
  capacity?: number
}): TimeSlot[]
```

```ts
async function searchForTable(overrides?: {
  partySize?: string
  date?: string
  requestedTime?: string
}) {
  // Fill Party Size, Date, Preferred Time if provided, then click Find a table.
}
```

Required tests:

1. **Default 7-slot render**
   - Mock 22 slots from `12:00` to `22:30`.
   - Search with preferred time `19:00`.
   - Assert `5:30pm` through `8:30pm` are visible.
   - Assert `12pm` and `10:30pm` are not visible.
   - Assert exactly 7 slot buttons are rendered. Prefer counting buttons whose accessible name contains `Drinks`, so Back/Continue are not counted.
   - Assert `See more times` is visible.

2. **Expander reveals all available slots**
   - Continue from a 22-slot search.
   - Click `See more times`.
   - Assert `12pm` and `10:30pm` are now visible.
   - Assert `See more times` is gone.

3. **Short lists do not render expander**
   - 5 slots: all are visible; `See more times` absent.
   - 7 slots: all are visible; `See more times` absent.

4. **Expanded grid does not collapse or re-centre when selecting a slot**
   - Search 22 slots at `19:00`.
   - Click `See more times`.
   - Select `10:30pm`.
   - Assert `12pm` is still visible.
   - Assert `See more times` remains absent.
   - Assert `10:30pm` has selected styling or Continue is visible.

5. **Collapsed grid does not re-centre when selecting an edge slot**
   - Search 22 slots at `19:00`.
   - Select visible edge slot `8:30pm`.
   - Assert the original lower edge `5:30pm` is still visible.
   - Assert a later slot that would appear after re-centering, such as `9pm`, is not visible.

6. **Changing date collapses the expanded state**
   - Search and expand.
   - Click Back.
   - Change Date.
   - Search again.
   - Assert only 7 slot buttons are visible and `See more times` is visible.

7. **Changing party size collapses the expanded state**
   - Same flow as date, but change Party Size.

8. **Changing preferred time collapses and re-centres**
   - Search `19:00`, expand, Back.
   - Change Preferred Time to `22:00`, search again.
   - Assert visible window is `7:30pm` through `10:30pm`.

9. **Party-size no-blur bug is fixed**
   - Do not blur the Party Size input.
   - Change Party Size from `2` to `10`.
   - Click `Find a table`.
   - Capture the availability URL and assert it contains `party_size=10`.
   - Use mixed capacities if useful to prove the closest-slot/alternative logic also used 10, not stale 2.

10. **Purpose derivation regression stays green**
    - Existing tests for kitchen-open slot => `purpose: 'food'`.
    - Existing tests for kitchen-closed slot => `purpose: 'drinks'`.
    - Existing nearest-alternative `kitchen_open` preservation test.

### 8.3 Targeted Commands

Run these while implementing:

```bash
npm run test -- --runTestsByPath tests/unit/table-booking-slot-window.test.ts tests/unit/ManagementTableBookingForm.test.tsx
TZ=America/New_York npm run test -- --runTestsByPath tests/unit/ManagementTableBookingForm.test.tsx -t "London"
npx tsc --noEmit
npm run lint
```

Before marking the task done, also run:

```bash
npm run build
```

If the full component test file is slow, use `-t` during development, but the full commands above must pass before completion.

---

## 9. Manual QA

Run `npm run dev` and test `/book-table` manually.

Scenarios:

- Normal 22-slot day, preferred time around `19:00`: only nearby slots shown, `See more times` appears.
- Click `See more times`: full day appears, captions are still correct.
- Select a late slot after expanding: grid remains expanded, Continue appears.
- Search around closing time: window clamps to the final slots.
- Back from step 2, change preferred time, search again: window is collapsed and re-centred.
- Back from step 2, change party size without blurring, search again: network request uses the new party size.
- Submit one `Drinks & food` slot and one `Drinks only` slot in test/stub mode if available; payload purpose must remain correct.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Grid jumps when customer selects a slot | Use `slotWindowAnchorTime`; never use mutable `requestedTime` directly as the visible-window anchor after search. |
| Expanded grid collapses on slot selection | Reset expansion only in explicit input/search/reset handlers; no broad `useEffect([requestedTime])`. |
| Junior developer windows raw `time_slots` and accidentally exposes unavailable slots | Spec requires windowing `availableSlots` only and preserving current unavailable-slot filtering. |
| Party size in request is stale if input is not blurred | Pass `targetPartySize` explicitly through `handleFindTable` -> `runAvailabilitySearch` -> `fetchAvailabilityForDate` and alternatives. |
| Tie behavior differs between helper and current closest-slot selection | Helper uses earlier-slot tie breaking to match current `pickClosestSlot()` behavior. |
| Slot captions or submit purpose regress | Keep existing `selectedSlotService` and `deriveSubmitPurpose()` logic; add regression tests. |

Rollback is a normal code revert. No database, API contract, or management-app change is involved.

---

## 11. Mobile Optimisation (Wizard-Wide)

The user explicitly extended scope: optimise the entire booking wizard for mobile, "without exception". The slot-window changes are not enough on their own. This section lists every mobile-specific edit the implementation must apply across `components/features/TableBooking/ManagementTableBookingForm.tsx`. They land in the same task and the same PR.

### 11.1 Tap targets — minimum 48px effective height

Apple HIG / Material both recommend at least 44–48 px for any touch target. Audit all interactive elements:

- **Slot buttons** at L1628 (`grid-cols-2 ... sm:grid-cols-3`): currently `px-3 py-3`. Add `min-h-14` (56 px) to comfortably fit the time and the `Drinks & food` / `Drinks only` caption with breathing room.
- **Alternative slot buttons** at L1688 (currently `px-3 py-2 text-sm`): bump to `px-3 py-3 text-base min-h-12`.
- **Expander button** (See §6.5): full-width on mobile (`w-full sm:w-auto sm:px-6`), `py-3`, downward chevron icon. ≥48 px tall.
- **All booking-wizard `<Input>` fields**: pass `size="lg"` to the shared `<Input>` primitive. The default `md` variant resolves to `px-4 py-2 text-base` (~40 px), which is below the minimum. `lg` resolves to `px-5 py-3 text-lg` (~52 px).
- **All booking-wizard `<Button>` actions**: the shared `<Button>` primitive's default `md` size is `min-h-[44px]`, which is below this task's 48 px target. In `ManagementTableBookingForm.tsx`, make every visible booking-wizard action button at least `min-h-12` on mobile. Use `size="lg"` for the main step CTAs where it fits (`Find a table`, `Continue`, `Continue to review`, `Confirm booking`, `Confirm and pay deposit`, `Book another table`, `Start a new booking`). For smaller secondary buttons that should keep their current visual weight (`Back`, `Use Different Number`, phone-lookup `Continue`, `Join waitlist by phone`), add `className="... min-h-12"` or another explicit 48 px minimum.
- **Policy checkbox row** at L2015: make the whole label a comfortable tap target with at least `min-h-12` and vertical padding. Do not only enlarge the checkbox input.

The shared `<Input>` primitive's `InputProps` extends `Omit<InputHTMLAttributes, 'className' | 'size'>` (verified at `components/ui/primitives/Input.tsx:30-33`), so all native attributes pass through.

### 11.2 Input keyboard hints

Add the following HTML attributes to make mobile keyboards / autofill behave correctly:

| Field | Line | Add |
|---|---|---|
| Party Size | L1545 | `inputMode="numeric"` `pattern="[0-9]*"` |
| Mobile Number | L1749 | `inputMode="tel"` `autoComplete="tel"` |
| Email | L1821 | `inputMode="email"` `autoComplete="email"` |
| First Name | L1804 | `autoComplete="given-name"` |
| Last Name | L1812 | `autoComplete="family-name"` |
| Date | L1571 | leave native — `type="date"` is already mobile-optimised |
| Preferred Time | L1581 | leave native — `type="time"` is already mobile-optimised |

Do not change `type` attributes; these are additive.

### 11.3 Step transitions — scroll to top of wizard on step change

Audit found 11 `setStep(...)` calls (L867, 966, 971, 976, 1165, 1200, 1241, 1323, plus three more) and zero `scrollIntoView` calls. On mobile, advancing to step 2 / details / review without a scroll-to-top makes it look like nothing happened.

Implementation:

1. Add a `useRef<HTMLDivElement>(null)` to the wizard's root container element.
2. Add a `useEffect(() => { ... }, [step])` that calls `wizardRef.current?.scrollIntoView({ block: 'start' })` whenever `step` changes — **except on the initial mount** (use a `mountedRef` guard).
3. Use the default scroll behaviour, **not `behavior: 'smooth'`** — multi-step forms feel sluggish with smooth scrolling.

```ts
const wizardRef = useRef<HTMLDivElement>(null)
const mountedRef = useRef(false)

useEffect(() => {
  if (!mountedRef.current) {
    mountedRef.current = true
    return
  }
  wizardRef.current?.scrollIntoView({ block: 'start' })
}, [step])
```

Attach `ref={wizardRef}` to the existing top-level wizard container `<div>`.

### 11.4 Slot button accessibility — combined `aria-label`

The slot button currently shows time + caption visually but has no `aria-label`. Screen readers and iOS Voice Control read the time and the caption as separate elements, which is awkward.

Add to the slot button:

```tsx
aria-label={`${formatTimeForDisplay(slot.time)}, ${
  slot.kitchen_open === false ? 'drinks only' : 'drinks and food'
}`}
```

When `slot.kitchen_open === undefined` (the legacy path), default to `'drinks and food'` to match the existing visual default.

### 11.5 Step-1 form semantics

Currently the find-step fields render outside any `<form>` element, with the "Find a table" button as `type="button"` calling `handleFindTable` directly. This breaks the keyboard "Go" / "Done" key on mobile.

Implementation:

1. Wrap the find-step fields and the "Find a table" button in `<form onSubmit={(e) => { e.preventDefault(); handleFindTable() }}>`.
2. Change the "Find a table" `<Button>` to `type="submit"`.
3. Other steps continue to use `type="button"` for their primary actions (no change there).

### 11.6 Tests

Add to `tests/unit/ManagementTableBookingForm.test.tsx`:

- **Inputs have correct mobile keyboard hints.** Render the wizard. Assert the Party Size input has `inputMode="numeric"` and `pattern="[0-9]*"`. Assert the Mobile Number input has `inputMode="tel"` and `autoComplete="tel"`. Etc.
- **Slot button has combined `aria-label`.** Mock a slot list, assert that a kitchen-open slot's `aria-label` contains both time and "drinks and food"; a kitchen-closed slot's contains "drinks only".
- **Primary mobile actions are at least 48 px.** Assert the slot button includes `min-h-14`; assert the expander and nearest-alternative buttons include `min-h-12`; assert the policy checkbox label includes a 48 px tap-target class. This is a class-level regression test, not a jsdom layout measurement.
- **Step transition triggers scrollIntoView.** Mock `Element.prototype.scrollIntoView`. Search → assert it was called once with `{ block: 'start' }` after entering step 2. Advance to details → asserted again.
- **Pressing Enter on Preferred Time submits the find-step form.** Fill all required fields, focus the time input, fire `keyDown` Enter. Assert `handleFindTable` (or its observable side effect — the availability fetch) ran.

### 11.7 Out of scope (deferred)

- **Sticky-bottom CTA** on mobile. Keeps the primary action visible above the keyboard. Adds z-index complexity vs Turnstile and PayPal — defer to a follow-up PR if launch metrics show scroll friction.
- **International phone format input.** Current UK-only assumption (`default_country_code: '44'`) stands. Heathrow non-UK numbers would benefit from a country-code field; flag for follow-up.
- **Default `<Input>` size for the entire app.** Bumping the wizard to `size="lg"` is local to this component; do not change the default in `components/ui/primitives/Input.tsx` — that would ripple beyond the wizard.

---

## 12. London Timezone Fixes

The wizard must compute every customer-visible date and time in Europe/London. The implementation must remove every UTC- or browser-local fallback identified in §2.6 and §2.8.

### 12.1 Add / reuse London date helpers

`lib/table-booking-service-windows.ts` already exports `londonNowParts()`. Extend that same module with one small helper so date-only conversion has a single implementation:

```ts
export function londonIsoDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}
```

Then update `londonNowParts()` to call `londonIsoDate()` for its `isoDate` instead of duplicating the date-formatting logic. Keep `londonNowParts().minutes` as the canonical London "now in minutes after midnight" helper.

Do not introduce Luxon for this small fix. The repo already uses `Intl.DateTimeFormat` for London formatting in this component, and the existing service-window helper is the right shared location.

### 12.2 Replace `today`, `defaultDate`, `defaultRequestedTime`

**Today (used as `<input type="date" min={today}>` at L1572 and as the date default at L520):**

Replace:

```ts
const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
```

with:

```ts
import { londonIsoDate, londonNowParts, toTimeString } from '@/lib/table-booking-service-windows'

const today = useMemo(() => londonNowParts().isoDate, [])
```

`londonNowParts()` is already exported and returns `{ isoDate, minutes }` in Europe/London. Memo on mount is fine because the wizard is short-lived; if the user opens it across midnight London, the page reload on submit/back will refresh it.

**Default Preferred Time (`getDefaultTimeValue()` at L147–148):**

Replace the browser-local-clock implementation with one that uses `londonNowParts().minutes` rounded up to the next 30-minute slot:

```ts
function getDefaultTimeValue(): string {
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  return toTimeString(next % 1440)
}
```

`toTimeString()` is already exported from `lib/table-booking-service-windows.ts`. Adding 60 keeps the existing "+1 hour, rounded up to :30" behaviour but anchored on London time. Wraparound past midnight is handled by `% 1440`.

**The two other `toISOString().slice(0, 10)` calls (L144 and L304):**

Replace both so `ManagementTableBookingForm.tsx` no longer calls `toISOString()` at all.

- `toIsoDateInputValue(value)` at L139-L145:
  - If `value` is already `YYYY-MM-DD`, return it unchanged.
  - Otherwise parse `new Date(value)` only for full date-time strings and return `londonIsoDate(parsed)`.
  - If parsing fails, return `''`.
- `addDays(isoDate, days)` at L300-L305:
  - This helper operates on an existing date-only string. Keep it timezone-neutral by doing calendar arithmetic and formatting with `londonIsoDate()` from a UTC anchor, or implement it manually from `Date.UTC`.
  - The required output for `addDays('2026-04-30', 1)` is exactly `'2026-05-01'` in every browser timezone.
  - Do not leave `date.toISOString().slice(0, 10)` in this component.

### 12.3 Past-date validation

Replace both browser-local past-date checks with a string comparison against London today:

```ts
function isPastLondonDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
}
```

Use it in:

- `handleFindTable()` around L881-L890.
- `handleDateChange()` around L1001-L1009.

Required behavior:

- If the selected date is before `londonNowParts().isoDate`, show the existing `Please select a future date` error and do not hit availability.
- If the selected date equals `londonNowParts().isoDate`, allow the search; today's "now + 60 minutes" cutoff remains the availability route's responsibility.
- Do not compare `Date` objects for date-only booking validation.

### 12.4 Now-ticker

The 30-second ticker at L470-L473 currently stores `new Date()` only to force periodic re-rendering. It does not expose the value as `now`. It can stay as `new Date()` provided no booking date/time computation consumes it. Add a short comment at the ticker explaining this invariant:

```ts
// This Date is only a re-render tick. Booking date/time calculations must use
// Europe/London helpers such as londonNowParts(), not the browser-local Date.
```

If the implementation later reads the tick value for a date or time decision, that derived value must go through `londonIsoDate()` / `londonNowParts()` first.

### 12.5 No payload timezone fields

The booking payload sent to `/api/table-bookings` carries `date: 'YYYY-MM-DD'` and `time: 'HH:mm'` only. No offset, no `Z`, no ISO datetime. This already matches the management API's expectations (see §13). The fixes above only correct the values; the payload shape is unchanged.

### 12.6 Tests

Add to `tests/unit/ManagementTableBookingForm.test.tsx`:

- **Today is computed in London time.** Use `jest.useFakeTimers().setSystemTime(new Date('2026-04-29T23:30:00Z'))`, which is **2026-04-30 00:30 BST in London**. Assert the date input's `min` attribute and default value are `"2026-04-30"`. The old UTC implementation would return `"2026-04-29"`.
- **Default Preferred Time is computed in London time.** With the same fake time (`2026-04-29T23:30:00Z`), assert the Preferred Time default is `"01:30"` (00:30 London + 60 minutes, rounded to the next 30). This catches browser-local clocks outside Europe/London only when the test is run under a non-UK timezone, so the verification command includes `TZ=America/New_York ... -t "London"`.
- **Past-date validation uses London today.** With the same fake time, enter Date `"2026-04-29"` and click `Find a table`; assert the future-date error appears and no availability request fires. Enter `"2026-04-30"` and assert the availability request is allowed.
- **`toIsoDateInputValue()` respects London for full date-time prefill values.** Render with a prefill date equivalent to `2026-04-29T23:30:00Z`; assert the Date input is `"2026-04-30"`.
- **Submitted payload date matches the London date input.** Mock a midnight-UTC boundary, submit a booking, and assert the POST body uses the Date input's `YYYY-MM-DD` exactly. Do not assert against `new Date(...).toISOString()`.

---

## 13. API Handover Contract

This PR makes no changes to the website's outgoing payload to `/api/table-bookings` or the proxy's forwarding to the management API. The audit below confirms what we send today is correct, and identifies one improvement (idempotency-key reuse) that ships with this task.

### 13.1 Verified correct (do not change)

The website proxy at `app/api/table-bookings/route.ts` forwards a payload that matches the management API's Zod schema at `OJ-AnchorManagementTools/src/app/api/table-bookings/route.ts`:

| Field | Required by API | Source in wizard | Status |
|---|---|---|---|
| `phone` | yes | step 3 phone input | ✓ |
| `date` | yes | step 1 date input (after §12 fix) | ✓ |
| `time` | yes | step 2 selected slot | ✓ |
| `party_size` | yes | step 1 party-size input | ✓ |
| `purpose` | yes | derived from `selectedSlotService.kitchen_open` (existing strict rule) | ✓ |
| `first_name` / `last_name` | optional | step 3 inputs | ✓ |
| `email` | optional | step 3 input | ✓ |
| `notes` | optional | step 3 textarea | ✓ |
| `default_country_code` | optional | proxy forwards `'44'` | ✓ |
| `skip_customer_sms` | optional | proxy hardcodes `true` (PayPal shown inline) | ✓ |
| `dietary_requirements` | optional | NOT captured by wizard (out of scope — see §4) | — |
| `allergies` | optional | NOT captured by wizard (out of scope — see §4) | — |
| `sunday_lunch` / `sunday_preorder_items` | optional (legacy) | proxy strips intentionally | ✓ |
| `booking_type` | NOT in API schema | proxy still forwards `'regular'` as defence-in-depth (silently dropped by Zod) | ✓ harmless |

Headers:

| Header | Required by API | Source | Status |
|---|---|---|---|
| `X-API-Key` | yes | proxy injects `ANCHOR_API_KEY` | ✓ |
| `Idempotency-Key` | yes | wizard generates + sends; proxy passes through (or fabricates if missing) | ✓ |
| `x-turnstile-token` | direct browser only | wizard passes Turnstile token in body; proxy promotes to header | ✓ |

Response handling at `ManagementTableBookingForm.tsx:1313–1343`:

| Response state | Handled by wizard | Status |
|---|---|---|
| `confirmed` | shows confirmation screen with `booking_reference` | ✓ |
| `pending_payment` | renders inline PayPal via `PayPalDepositSection` with `deposit_amount`, exposes `fallback_payment_url` | ✓ |
| `blocked` | maps `blocked_reason` (`outside_hours`, `cut_off`, `no_table`, `private_booking_blocked`, `too_large_party`, `customer_conflict`, `in_past`, `blocked`) to copy via `BLOCKED_REASON_COPY` and surfaces as inline error | ✓ all 8 values mapped |

**Verdict:** the contract is correctly implemented. No payload, header, or response-handler change is needed in this PR.

### 13.2 Idempotency-key reuse — fix in this PR

`handleConfirmBooking()` at L1249 generates a fresh idempotency key on **every Confirm click**:

```ts
const idempotencyKey = createClientIdempotencyKey('tbl_web')
```

If a Confirm submission times out and the customer clicks again, the second attempt sends a new key, defeating the management API's idempotency dedupe. Customers can end up with two bookings.

Required behaviour:

1. A retry of the **same submit payload** must reuse the same `Idempotency-Key`.
2. A materially different submit payload must get a new `Idempotency-Key`. This includes changing `date`, `selectedTime`, `partySize`, derived `purpose`, phone, first name, last name, email, or notes after backing out of review.
3. Do not include volatile anti-bot / telemetry fields in the fingerprint. Exclude `_t`, `turnstile_token`, and `website`; these can change between retries without changing the booking intent.
4. Reset the cached key on `resetJourney()` and before a new availability search starts in `handleFindTable()`.

Implement this with a ref, not React state. The key is not rendered, and a ref avoids async state timing issues in submit handlers:

```ts
type SubmitIntentKey = {
  fingerprint: string
  key: string
}

const submitIntentKeyRef = useRef<SubmitIntentKey | null>(null)

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

In `handleConfirmBooking()`:

1. Derive `purpose` first.
2. Build the non-volatile payload fields.
3. Build the fingerprint from those fields.
4. Get the idempotency key from `getSubmitIntentIdempotencyKey(fingerprint)`.
5. Add `_t`, `turnstile_token`, and `website` to the actual request body after the key has been selected.

This guarantees: retries of the same booking intent dedupe; a changed slot or changed guest details cannot accidentally reuse an old key.

### 13.3 Idempotency tests

Add to `tests/unit/ManagementTableBookingForm.test.tsx`:

- **Idempotency-key is stable across Confirm retries.** Search, choose slot, fill details, enter review, click Confirm. Capture the POST headers. Force a network failure on the first Confirm, click Confirm again with the same visible booking details. Assert both POSTs sent the same `Idempotency-Key` header value even though `_t` changed and Turnstile may have reset.
- **Idempotency-key changes on new search.** Complete a Confirm. Click "Book another", change date, search, fill details, Confirm. Assert the new POST has a different `Idempotency-Key`.
- **Idempotency-key persists across Back-and-forward when details are unchanged.** Enter review, Back to details, immediately Continue to review, Confirm. Assert the key is unchanged.
- **Idempotency-key changes if the payload changes after backing out.** Enter review, Back to details, change `notes` or go Back to choose and select a different time, Continue to review, Confirm. Assert the new POST has a different key.

### 13.4 Out-of-repo (informational)

The management API enforces a server-side IP rate limit (`tableBookingIpLimiter`) and a 1–20 party-size validator. The website's UI rejects party-size 0 and >20 client-side, so the API cap is a defence-in-depth layer. No client-side change required.

The management API supports two API-key headers (`X-API-Key` and `Authorization: Bearer`). The proxy uses `X-API-Key`; both are valid. No change.

---

## 14. Acceptance Criteria

### 14.1 Slot window

- [ ] `lib/table-booking-slot-window.ts` exists with `pickSlotWindow()` and `DEFAULT_SLOT_WINDOW_SIZE`.
- [ ] Helper tests cover centre, boundaries, short arrays, invalid anchor, custom size, and tie behavior.
- [ ] Step 2 uses `visibleSlots` for rendering but still uses `availableSlots.length` for no-availability branching.
- [ ] The default step-2 grid shows at most 7 available slots.
- [ ] `See more times` appears only when more available slots exist than are visible.
- [ ] Clicking `See more times` reveals all available slots and hides the expander.
- [ ] Selecting a slot does not re-centre or collapse the grid.
- [ ] Date, party-size, preferred-time, new-search, and journey-reset paths collapse expanded state.
- [ ] Party-size searches use the newly typed/clamped value even when the input was not blurred.
- [ ] `Drinks & food` / `Drinks only` captions render exactly as before for visible slots.
- [ ] Submit-time `purpose` derivation is unchanged and existing purpose tests pass.
- [ ] No backend availability, submit-route, API-client fallback, or booking-agent code is changed for this task.

### 14.2 Mobile optimisation

- [ ] Slot buttons have `min-h-14`; alternative slot buttons have `min-h-12 py-3 text-base`; expander has `min-h-12` with chevron.
- [ ] All booking-wizard `<Input>` fields use `size="lg"`.
- [ ] All visible booking-wizard action buttons are at least 48 px tall on mobile (`size="lg"` or explicit `min-h-12`).
- [ ] The booking-policy checkbox label is a 48 px tap target, not only a tiny checkbox.
- [ ] Party Size, Mobile Number, Email inputs carry the keyboard `inputMode` and `autoComplete` hints listed in §11.2.
- [ ] First Name and Last Name inputs carry `autoComplete="given-name"` / `"family-name"`.
- [ ] Wizard root has a ref; step changes trigger `scrollIntoView({ block: 'start' })` (not on initial mount).
- [ ] Every slot button has an `aria-label` combining time and service caption.
- [ ] Step 1 fields are wrapped in a `<form onSubmit>`; the "Find a table" button is `type="submit"`.
- [ ] Component tests for all of the above pass.

### 14.3 London timezone

- [ ] `lib/table-booking-service-windows.ts` exports `londonIsoDate(date?: Date): string`; `londonNowParts()` continues to return London `{ isoDate, minutes }`.
- [ ] `today` (the date input `min`) is computed via `londonNowParts().isoDate`.
- [ ] `getDefaultTimeValue()` uses `londonNowParts().minutes` rounded to the next 30-minute slot.
- [ ] `handleFindTable()` and `handleDateChange()` validate past dates by comparing the selected `YYYY-MM-DD` string to `londonNowParts().isoDate`; they do not parse date-only strings with `new Date(...)`.
- [ ] No `toISOString().slice(0, 10)` calls remain in `components/features/TableBooking/ManagementTableBookingForm.tsx` (search with `rg -n "toISOString" components/features/TableBooking/ManagementTableBookingForm.tsx` — expected: no matches).
- [ ] Component tests using `jest.useFakeTimers().setSystemTime(...)` confirm the date input min, Date default, Preferred Time default, and past-date validation match Europe/London at midnight-boundary moments such as `2026-04-29T23:30:00Z` (London `2026-04-30 00:30 BST`).
- [ ] Submitted POST body's `date` and `time` match Europe/London local values regardless of the simulated browser timezone.

### 14.4 API handover

- [ ] No code change in `app/api/table-bookings/route.ts` (verified at PR review — the proxy already matches the management API contract per §13).
- [ ] Wizard reuses one `Idempotency-Key` for retries of the same submit-intent fingerprint.
- [ ] Wizard generates a new `Idempotency-Key` when `date`, selected time, party size, derived purpose, phone, first name, last name, email, or notes changes before a later Confirm.
- [ ] Submit-intent fingerprint excludes `_t`, `turnstile_token`, and `website`.
- [ ] Submit-intent key cache clears on new availability search and `resetJourney()`.
- [ ] Idempotency tests in §13.3 pass.

### 14.5 Pipeline

- [ ] `npm run test -- --runTestsByPath tests/unit/table-booking-slot-window.test.ts tests/unit/ManagementTableBookingForm.test.tsx`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- [ ] `TZ=America/New_York npm run test -- --runTestsByPath tests/unit/ManagementTableBookingForm.test.tsx -t "London"` passes so browser-local date/time regressions are caught outside the repo author's UK timezone.
