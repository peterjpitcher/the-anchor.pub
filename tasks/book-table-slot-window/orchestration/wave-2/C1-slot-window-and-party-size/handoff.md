# Wave 2C1 — Slot Window + Party-Size Threading — Handoff

## Commit

`f542807` — `feat(book-table): step-2 slot window with expander and party-size threading fix`

`git diff HEAD~1 HEAD --name-only` → exactly two files:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

## What landed

### Imports
- Added `ChevronDown` from `lucide-react`.
- Added `pickSlotWindow` from `@/lib/table-booking-slot-window`.

### State (component scope)
Added next to `selectedTime`:
- `showAllTimes: boolean` — toggles the expander.
- `slotWindowAnchorTime: string` — pinned at search time so the visible window does not move when the customer selects a slot.

### Function signatures (now thread `targetPartySize` explicitly)
- `fetchAvailabilityForDate(targetDate, targetTime, targetPartySize, signal?)`
- `loadNearestAlternatives(targetDate, targetTime, targetPartySize)`
- `runAvailabilitySearch({ targetDate, targetTime, targetPartySize, source, context, signal? })`

`handleFindTable` computes `clampedSize` once and passes it as `targetPartySize`. Callers within the component were updated; no other call-sites exist.

### Handlers
- `handleSlotSelect` is unchanged — does not touch `slotWindowAnchorTime` or `showAllTimes`.
- `handleDateChange` adds `setShowAllTimes(false)`.
- Party Size `onChange` and `onBlur` add `setShowAllTimes(false)` (and `onBlur` now also clears `selectedSlotService` for parity).
- Preferred Time `onChange` is now routed through a new `handleRequestedTimeChange` helper that sets the new anchor and collapses the expander.
- `resetJourney` adds `setShowAllTimes(false)` and `setSlotWindowAnchorTime(defaultRequestedTime)`.

### Render
- Added `visibleSlots` memo: `showAllTimes ? availableSlots : pickSlotWindow(availableSlots, slotWindowAnchorTime)`.
- The slot grid `.map()` switched to `visibleSlots`.
- "No availability" branching still keys on `availableSlots.length === 0`.
- Expander button rendered immediately after the grid using the exact spec §6.5 markup (full-width on mobile, ChevronDown icon, anchor-gold focus ring).

## Tests

Added 9 tests under a new `describe("Step 2 slot window + party-size threading")` block, including the `makeAvailabilitySlots` and `searchForTable` helpers from spec §8.2. All 9 spec cases pass:

1. Default 7-slot render centred on 19:00 (5:30pm–8:30pm visible, 12pm/10:30pm not).
2. Expander reveals all 22 slots and disappears.
3. Short lists (5 / 7 slots) hide the expander.
4. Expanded grid stays expanded when a late slot is selected (12pm still visible).
5. Selecting an edge slot (8:30pm) does not re-centre (5:30pm still visible, 9pm absent).
6. Date change collapses the expander.
7. Party-size change collapses the expander.
8. Preferred Time change collapses + re-centres (window 7:30pm–10:30pm at 22:00).
9. Party-size no-blur bug — `party_size=10` reaches the URL without `onBlur`.

Existing 12 tests continue to pass.

## Verification

- `npx jest tests/unit/ManagementTableBookingForm.test.tsx` → 21 passed (12 existing + 9 new).
- `npx tsc --noEmit` → clean.

## Judgment calls

- **`Preferred Time` handler** extracted to a named `handleRequestedTimeChange` helper at the top of the component body so the reset side effects are explicit. Spec §6.6 lists this as the recommended shape.
- **Party-size `onBlur`** now also clears `selectedSlotService`, matching `onChange`. The spec called this out as required to prevent stale `kitchen_open` metadata from surviving to submit.
- The slot-grid render is wrapped in a fragment so the grid + expander can share the `availableSlots.length > 0` branch. No stray wrapper div was introduced.
- No analytics events were fired on expander tap (spec §5.4 says "Do not fire new analytics events in this task").

## Notes for downstream waves

- **Wave 2C2 (timezone)**: free to refactor `today`, `defaultRequestedTime`, `handleFindTable`/`handleDateChange` past-date checks, and `addDays`. None of those were touched here. The new `handleRequestedTimeChange` helper does not depend on the browser-local clock.
- **Wave 2C3 (mobile)**: the slot button, expander, alternative-slot button, and policy checkbox are all unchanged from a class/`aria-label`/tap-target perspective. The grid render is now wrapped in a fragment but still a child of the `availableSlots.length > 0` branch — adding `min-h-14` / `aria-label` only needs to touch the existing button JSX.
- **Wave 2C4 (idempotency)**: `handleConfirmBooking` and `createClientIdempotencyKey` are unchanged. The new function signatures (`targetPartySize`, etc.) do not touch the submit flow.

No exported helpers were renamed; no public types were changed.
