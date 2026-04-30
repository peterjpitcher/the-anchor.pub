# Wave 2C — Availability Route + Combined Test — Handoff

## Commit

- SHA: `e3ab9de`
- Message: `feat(table-booking): combined availability response with kitchen_open per slot`
- Branch: `main`
- Files (3):
  - `app/api/table-bookings/availability/route.ts` (modified)
  - `tests/api/table-bookings-availability-combined.test.ts` (added)
  - `tests/api/table-bookings-availability-purpose.test.ts` (deleted)

## Renamed Test File

- New path: `tests/api/table-bookings-availability-combined.test.ts`
- Replaces: `tests/api/table-bookings-availability-purpose.test.ts`

> Note on rename mechanics: the test was first moved with `git mv`, then its
> contents were rewritten substantially. Git's similarity detector re-classified
> the change as A+D (rather than R), but the diff still represents a single
> rename-with-rewrite. Three explicit paths were staged via `git add`.

## New Response Shape

`GET /api/table-bookings/availability?date=YYYY-MM-DD&party_size=N[&time=HH:mm]`

Optional legacy params accepted and silently ignored:
- `purpose` (any value)
- `booking_type` (any value)

Response body:

```json
{
  "success": true,
  "data": {
    "date": "2026-05-05",
    "time": "19:00",
    "party_size": 2,
    "available": true,
    "time_slots": [
      {
        "time": "20:00",
        "available": true,
        "available_capacity": 50,
        "kitchen_open": true
      },
      {
        "time": "22:00",
        "available": true,
        "available_capacity": 50,
        "kitchen_open": false
      }
    ],
    "message": "These times are based on current service windows and will be confirmed instantly when you continue.",
    "special_notes": "If your preferred time is unavailable, choose a nearby slot or call 01753 682707."
  },
  "meta": {
    "source": "schedule_fallback",
    "service_model": "combined_food_drinks"
  }
}
```

Key shape changes vs. previous contract:
- `time_slots[].kitchen_open` is now stamped on every slot.
- `meta.purpose` is gone. `meta.service_model = 'combined_food_drinks'` added.
- `message` and `special_notes` are neutral — no "food", no "drinks-only", no
  "switch to drinks" wording.
- Unavailable message: `"No online times are currently available for this request. Please choose another date or call 01753 682707."`

This is the contract D (lib/api/client.ts fallback) and E (agent route) must
match.

## Test Confirmation

```bash
npx jest tests/api/table-bookings-availability-combined.test.ts
# PASS — 5 / 5
```

```bash
npx tsc --noEmit
# clean
```

The five passing test cases:
1. Combined slots returned regardless of `purpose` value (omitted, food, drinks).
2. Legacy `booking_type=sunday_lunch` is ignored — same slots as baseline.
3. `kitchen_open` is `true` at 20:00 and `false` at 22:00 for a 12:00–23:00 day
   with kitchen 12:00–21:00.
4. `meta.purpose` absent; `meta.service_model = 'combined_food_drinks'`.
5. Neutral copy in `message` / `special_notes` — no "food", "drinks-only",
   "food bookings", or "switch to drinks".

## Deviations From Plan

1. **`makeBusinessHours` ported inline.** The plan said the helper "should still
   be in scope". The renamed test file never had it — only an inline
   `SUNDAY_HOURS` literal. Per the brief and Wave 1A handoff, I ported the
   `makeBusinessHours(regularDays, specialDays?)` factory inline (alongside the
   `RegularDayInput` / `SpecialDayInput` types) directly from
   `tests/api/table-bookings-service-window.test.ts`. The test file is now
   self-contained with no cross-file fixture dependency.
2. **Module-mock instead of `jest.spyOn`.** The plan's pseudocode used
   `jest.spyOn(anchorAPI, 'getBusinessHours')`. The brief overrides this:
   "follow the patterns the file already uses". The renamed file uses
   `jest.mock('@/lib/api', () => ({ anchorAPI: { getBusinessHours: ... } }))`
   plus `jest.resetModules()` + dynamic `await import` of the route. I kept
   that pattern unchanged. Functionally equivalent for our assertions; avoids
   the spy/module-mock interaction footgun.
3. **Extra test case: legacy `booking_type` ignored.** The plan listed four
   cases; I added a fifth (`booking_type=sunday_lunch` returns the same slots
   as the baseline) to lock in the §12 backwards-compatibility commitment. Low
   cost, high signal — flags any future regression where `booking_type`
   accidentally regains influence on slot generation.
4. **Date used in tests is `2026-05-05` (a Tuesday).** Matches the plan's
   pseudocode and the Tuesday business-hours fixture.

## Notes For Downstream Agents

- **Agent D (`lib/api/client.ts` fallback).** When you refactor
  `buildTableAvailabilityFromBusinessHours`, mirror this route's call pattern:
  `resolveCombinedServiceRanges(...)` → `buildSlotsWithKitchenState(...)`.
  Do not re-introduce a `purpose` branch. Preserve `kitchen_open` through any
  merge map.
- **Agent E (`app/api/booking/agent/route.ts`).** The GET handler must accept
  this combined shape. `time_slots[].kitchen_open` must survive any reshaping
  the agent does. Stop forwarding `purpose` to this upstream endpoint (or
  forward it but expect identical results — see test case 1).

## Post-Task

Per the PostToolUse hook on the route edit, run `/session-setup partial`
before the next session to refresh the changes manifest.
