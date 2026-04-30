# Wave 2D — `lib/api/client.ts` Fallback Alignment — Handoff

**Status:** Complete
**Branch:** `main`
**Date:** 2026-04-29

---

## Commit

- SHA: `aa4d033`
- Message: `refactor(api-client): align table-availability fallback with combined contract`
- Files (1):
  - `lib/api/client.ts` (modified)

---

## What Changed In `buildTableAvailabilityFromBusinessHours`

The private fallback method previously duplicated a substantial chunk of
service-window resolution inline (~200 lines): it parsed the day key, walked
`regularHours` / `specialHours`, parsed `schedule_config`, filtered by
`booking_type`, hand-rolled a `Map<string, TableAvailabilitySlot>` slot merge
across multiple ranges, and stamped fallback ranges using kitchen/venue
opens/closes. Critically, it branched on `params.booking_type` ('regular' vs
'sunday_lunch') to filter the schedule and emit purpose-flavoured messages.

It now mirrors `app/api/table-bookings/availability/route.ts`:

```ts
const bookingType: BookingType = 'regular'
const normalizedTime = normalizeTime(params.time)

const { ranges, kitchenRanges, closed, message } = resolveCombinedServiceRanges(
  businessHours,
  params.date,
  { bookingType }
)

if (closed) {
  return {
    date: params.date,
    time: normalizedTime,
    party_size: params.party_size,
    available: false,
    time_slots: [],
    message: message || 'We are closed on that date. Please choose another day.'
  }
}

const londonNow = londonNowParts()
const minMinutesForToday =
  londonNow.isoDate === params.date
    ? Math.ceil((londonNow.minutes + 60) / 30) * 30
    : undefined

const timeSlots = buildSlotsWithKitchenState(
  ranges,
  kitchenRanges,
  params.party_size,
  30,
  minMinutesForToday
)

const available = timeSlots.some(
  (slot) => slot.available === true || (slot.available_capacity || 0) >= params.party_size
)

return {
  date: params.date,
  time: normalizedTime,
  party_size: params.party_size,
  available,
  time_slots: timeSlots,
  message: message || (available
    ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
    : 'No online times are currently available for this request. Please choose another date or call 01753 682707.'),
  special_notes:
    'If your preferred time is unavailable, choose a nearby slot or call 01753 682707.'
}
```

Net effect:

- **No purpose branching.** The fallback always asks for the combined drinks +
  kitchen-overlay set and stamps `kitchen_open` per slot. The
  `params.booking_type` argument is accepted for backward compatibility but
  intentionally ignored — same posture as the route handler.
- **`kitchen_open` is now present on every fallback slot.** Previously absent.
- **Neutral copy.** No more "Sunday lunch is unavailable…", no waitlist
  language. Messages mirror the route's exactly so callers can't distinguish
  fallback vs. route output by message text.
- **Single source of truth.** All schedule-config parsing, special-hours
  precedence, kitchen overlay logic, and slot merging now lives in one place
  (`lib/table-booking-service-windows.ts`). The fallback is a thin caller.

---

## What Changed In Slot Merging

The plan flagged a separate merge map "around line 579" that needed
`kitchen_open` preserved. Inspection showed that map (`new Map<string,
TableAvailabilitySlot>()`) lived **inside** `buildTableAvailabilityFromBusinessHours`,
not in a separate function — so removing the inline body removed the map. The
new helper `buildSlotsWithKitchenState` already merges across multiple ranges
(via the existing `buildSlotsFromRanges` it wraps) and stamps `kitchen_open`,
so no separate merge-logic update was needed.

`fetchInternalTableAvailability` was also reviewed (~line 633): it returns the
parsed JSON shape directly without reconstructing slot objects, so
`kitchen_open` already flows through unchanged from the upstream route. No
edit required there.

---

## Smoke Test Decision

**Decision:** No new smoke test added.

**Reasoning:** `buildTableAvailabilityFromBusinessHours` is a private method on
`AnchorAPI`. Exercising it through the public `checkTableAvailability` API
requires either:
1. Stubbing `fetchInternalTableAvailability` to return `null` (so the
   fallback path runs) plus mocking `getBusinessHours` — neither has an
   existing test seam in `tests/api/`, and adding one would mean introducing
   class-method mocking infrastructure for one test.
2. Refactoring the private method to public/exported — a code change purely
   for testability with no other callers.

The plan explicitly authorises skipping ("If a clean test point doesn't exist
without significant refactor, document the gap … Do not introduce mocking
infrastructure for its own sake.") The fallback is now a thin wrapper around
two helpers that have direct, exhaustive coverage in
`tests/api/table-bookings-service-window.test.ts` (10 cases including
kitchen-closed days, special-hours `kitchen: null` / `is_kitchen_closed`,
explicit-special-kitchen-open overrides, venue-closed days, and per-slot
`kitchen_open` stamping). The route-handler tests
(`tests/api/table-bookings-availability-combined.test.ts`, 5 cases) exercise
the same composition pattern end-to-end.

---

## Deviations From Plan

1. **Removed unused import.** Removing the inline slot-merge map left
   `TableAvailabilitySlot` unimported. Cleaned up the `import type` line on
   line 19 to drop it. No other code in the file uses the type directly.
2. **Plan's "merge logic at ~line 579" was inside the same function.** The
   plan implied this might be a separate merge site. It was the inline
   `Map<string, TableAvailabilitySlot>()` block within
   `buildTableAvailabilityFromBusinessHours`. Removing that function's body
   removed the map entirely; nothing else in the file constructs slot
   objects. No separate merge-update commit was needed.

---

## Verification

```bash
npx tsc --noEmit
```

Result: **clean** (exit 0, no output).

```bash
npx jest tests/api/
```

Result: 4/5 suites pass (23/25 tests). The 1 failing suite
(`tests/api/event-bookings-policy-fallback.test.ts`, 2 failing tests) is
pre-existing on `main` before this change — verified via
`git stash && npx jest <that file>` showing the same failures without my edit
in the tree. Unrelated to table-booking client fallback.

```bash
npx jest app/api/table-bookings/__tests__/route.test.ts \
         app/api/booking/agent/__tests__/route.test.ts
```

Result: **2/2 suites pass, 11/11 tests pass.**

```bash
git diff HEAD~1 HEAD --name-only
```

Expected output:

```
lib/api/client.ts
```

---

## Notes For Downstream Agents

- **Agent E (`app/api/booking/agent/route.ts`).** When the agent route GET
  proxies to `/api/table-bookings/availability`, the response shape it
  receives now uses combined slots with `kitchen_open` per slot — same shape
  whether served by the route handler or by the website-side fallback inside
  `anchorAPI.checkTableAvailability`. Stop forwarding `purpose` to the
  upstream. Preserve `kitchen_open` through any reshaping.
- **Agent F (form / page).** `anchorAPI.checkTableAvailability(params)` no
  longer differentiates by `booking_type`. If the wizard calls it (currently
  it goes through the proxy), expect a single combined slot list with
  `kitchen_open` per slot regardless of any `booking_type` argument. The
  argument is preserved on the type signature for backward compatibility but
  is ignored at runtime.
