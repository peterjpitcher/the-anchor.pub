# Wave 1A — Types & Service-Window Helpers — Handoff

**Status:** Complete
**Branch:** `main`
**Date:** 2026-04-29

---

## Commits

| # | SHA | Title |
|---|-----|-------|
| 1 | `d11c091` | `feat(table-booking): add optional kitchen_open to TableAvailabilitySlot` |
| 2 | `9d0392d` | `feat(service-windows): add combined drinks+food range helper with kitchen overlay` |

Verify with:

```bash
git log --oneline -3
```

Expected first two lines:

```
9d0392d feat(service-windows): add combined drinks+food range helper with kitchen overlay
d11c091 feat(table-booking): add optional kitchen_open to TableAvailabilitySlot
```

---

## New / Changed Exports

### `lib/api/bookings.ts`

Added optional field to `TableAvailabilitySlot`:

```ts
export interface TableAvailabilitySlot {
  time: string
  available?: boolean
  available_capacity: number
  reason?: string
  requires_prepayment?: boolean
  kitchen_open?: boolean   // ← added
}
```

### `lib/table-booking-service-windows.ts`

Three new exports added at the bottom of the file (existing exports untouched):

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
): CombinedServiceRangeResolution

export function buildSlotsWithKitchenState(
  ranges: ServiceRange[],
  kitchenRanges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes?: number,    // defaults to 30
  minMinutesForToday?: number
): Array<{
  time: string
  available: boolean
  available_capacity: number
  reason?: string
  kitchen_open: boolean
}>
```

`BookingPurpose` is still exported (untouched) — downstream callers continue to import it.

---

## Implementation Notes

- `resolveCombinedServiceRanges` calls `resolveServiceRanges(..., { purpose: 'drinks' })` first; if that returns `closed: true`, the combined helper short-circuits to a fully closed result. Otherwise it calls the helper again with `purpose: 'food'` and uses those ranges as the kitchen overlay.
- If the food resolution returns `closed: true` (e.g. food unavailable but bar open), the helper returns master drinks ranges with `kitchenRanges: []`. Downstream slot stamping then marks every slot `kitchen_open: false`.
- `buildSlotsWithKitchenState` is a thin wrapper around the existing `buildSlotsFromRanges` — it simply maps each base slot through `isTimeWithinRanges(slot.time, kitchenRanges)` to add the `kitchen_open` flag. End times are exclusive, matching existing helper behaviour.

---

## Deviations From Plan

### `ServiceRange` uses string time literals, not minute integers

The plan's pseudocode in Task 2 Step 1 includes `expect(result.kitchenRanges[0]).toMatchObject({ startsAt: 17 * 60, endsAt: 20 * 60 })` and `[{ startsAt: 12 * 60, endsAt: 23 * 60, capacity: 50 }]`. The actual `ServiceRange` type (defined at the top of `lib/table-booking-service-windows.ts:13–17`) uses `string` for `startsAt`/`endsAt` (e.g. `'12:00'`, `'17:00'`). I adapted all test fixtures and the matcher to use string time literals.

### `makeBusinessHours` helper added inline to the test file

The existing test file does not export a `makeBusinessHours` helper; the only fixture is the inline `SUNDAY_HOURS` const. I added a local `makeBusinessHours(regularDays, specialDays?)` factory just above the new `describe` blocks. It returns an `as any` shape that matches the `BusinessHours` interface in `lib/api/hours.ts` and supports the special-hours fields used by the regression tests (`kitchen: null`, `is_kitchen_closed`, `kitchen: { opens, closes }`).

### `expect(...endsAt).toBeLessThanOrEqual(...endsAt)` rewritten

The plan's pseudocode for the first combined-helper test compares `result.kitchenRanges[0].endsAt` directly to `result.ranges[0].endsAt` with `toBeLessThanOrEqual`. Because both are time strings, that would do a string comparison — fragile if the format ever changes. I rewrote the assertion to compare the `Math.max(...)` of each set after running them through the existing `toMinutes()` helper. Same intent, deterministic.

---

## Wave 2 Notes

- Wave 2 Agent C (`app/api/table-bookings/availability/route.ts`) can import `resolveCombinedServiceRanges` and `buildSlotsWithKitchenState` directly from `@/lib/table-booking-service-windows`. Both are exported.
- `BookingPurpose` remains exported. Downstream code that still needs it (e.g. existing service-window validation in `app/api/table-bookings/route.ts`) is unaffected.
- The new helpers do **not** mutate `BusinessHours` — they call the existing `resolveServiceRanges` twice with different purposes. No caching layer was added.

---

## Test & Typecheck Confirmation

```bash
npx jest tests/api/table-bookings-service-window.test.ts
```

Result: **10 passed, 0 failed** — 2 pre-existing tests + 8 new tests (6 for `resolveCombinedServiceRanges`, 2 for `buildSlotsWithKitchenState`).

```bash
npx tsc --noEmit
```

Result: **clean** (exit 0, no output).

---

## Scope Verification

```bash
git diff main~2 main --name-only
```

Output:

```
lib/api/bookings.ts
lib/table-booking-service-windows.ts
tests/api/table-bookings-service-window.test.ts
```

No files outside the ownership scope were modified. The `docs/architecture/*.md` files that were uncommitted at the start of the session are still in the working tree as untracked/unstaged changes — they were left alone per the brief.
