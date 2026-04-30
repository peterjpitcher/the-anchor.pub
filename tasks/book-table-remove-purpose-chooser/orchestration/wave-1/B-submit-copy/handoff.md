# Wave 1B — Submit-Route Neutral Copy — Handoff

**Status:** Complete
**Commit:** `a45d1e7` on `main`
**Commit message:** `fix(table-booking): neutralise customer-facing service-window error copy`

## Scope delivered

Replaced customer-facing food/drinks-flavoured error copy in
`app/api/table-bookings/route.ts` with neutral phrasing per plan T5.
Validation logic, `purpose` handling, and management-API forwarding are
unchanged. Server-side logging still records `purpose` for diagnostics.

## Strings changed (route)

`app/api/table-bookings/route.ts` — `buildServiceWindowError(payload)`:

| Old (per branch) | New (single neutral string) |
|---|---|
| `Food bookings are only available during kitchen hours. For later bookings, switch to drinks-only or call 01753 682707.` (food branch) | `That time is outside online booking hours. Please choose another time or call 01753 682707.` |
| `That time is outside our drinks booking window. Please choose another time or call 01753 682707.` (drinks branch) | (same neutral string as above) |

The branching `if (payload.purpose === 'food')` was removed — both
purpose values now resolve to the same neutral copy. The `payload`
parameter is still accepted for the existing call signature
(`buildServiceWindowError(normalized.payload)`) and prefixed with `_`
to mark it unused.

A short comment was added above the helper explaining that the copy is
intentionally neutral and that `purpose` still appears in `logError`
calls for diagnostics.

## Tests updated / added

### Updated assertion — `tests/api/table-bookings-service-window.test.ts`

The pre-existing test `'rejects food bookings outside kitchen hours'`
asserted `expect(...).toContain('Food bookings')`. That assertion would
regress the moment the route copy changed.

Renamed to `'rejects food bookings outside kitchen hours with neutral
copy'` and rewrote the assertions to:

- `expect(errorText).toMatch(/outside online booking hours/i)`
- `expect(lowerError).not.toContain('food booking')`
- `expect(lowerError).not.toContain('switch to drinks')`
- `expect(lowerError).not.toContain('drinks-only')`
- `expect(lowerError).not.toContain('kitchen hours')`
- `expect(lowerError).not.toContain('bar hours')`
- still asserts upstream `fetch` is not called (validation still blocks).

### New positive test — `app/api/table-bookings/__tests__/route.test.ts`

Added `'rejects a food booking outside kitchen hours with neutral
customer-facing copy'` (per plan T5 Step 2) under the existing
`describe('website /api/table-bookings proxy — walk-in launch
sanitisation')` block. It:

- POSTs `purpose=food` at `22:30` against the always-open Tuesday
  kitchen (closes 21:00) fixture used elsewhere in the file.
- Expects status `400`, neutral error matching
  `/outside online booking hours/i`, none of the banned substrings,
  and `calls.toHaveLength(0)` to confirm no upstream call.

## Test commands run

```
npx jest app/api/table-bookings/__tests__/route.test.ts \
         tests/api/table-bookings.test.ts \
         tests/api/table-bookings-service-window.test.ts
# 3 suites, 22 tests passing (was 21 before — added 1 new positive test).
npx tsc --noEmit
# clean.
```

TDD red→green confirmed mid-task: assertions failed against the old
copy ("Food bookings are only available…"), then passed once the
route copy was neutralised.

## Deviations from the plan

1. **Updated a third file (`tests/api/table-bookings-service-window.test.ts`)
   that the agent brief did not list under "owns".** Reason: the
   existing assertion `expect(String(data.error)).toContain('Food
   bookings')` at line 77 of that file would have regressed the
   moment the route copy changed, breaking the brief's
   "All updated tests pass; no existing tests regressed" gate. The
   change is the same kind of brittle-string update the plan T5 Step 2
   prescribes — it's a copy assertion against the route I own. The
   diff is a tightly scoped 11-line update to a single `it(...)` block
   in a service-window-focused suite. No production code in that file.
2. **Helper kept its parameter as `_payload`** rather than removing the
   parameter entirely, because the existing call site
   `buildServiceWindowError(normalized.payload)` passes a value. The
   parameter was renamed to `_payload` to signal it's intentionally
   unused. This matches the file's TS-strict style (no `// @ts-ignore`,
   no `unused-vars` warning).

## Self-check

- [x] One commit on `main` with the specified message (`a45d1e7`).
- [x] Only the in-scope files touched
      (`app/api/table-bookings/route.ts`,
      `app/api/table-bookings/__tests__/route.test.ts`,
      `tests/api/table-bookings-service-window.test.ts`).
- [x] No `Food bookings`, `switch to drinks`, `drinks-only`,
      `kitchen hours`, `bar hours`, or `drinks booking window`
      substrings remain in route customer-facing copy
      (verified by `grep -nE`).
- [x] `npx jest` green for the three relevant suites (22/22).
- [x] `npx tsc --noEmit` clean.
- [x] Handoff note exists at this path.
- [x] No push to remote (local main only).
