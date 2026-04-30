# Wave 2E — Agent Route GET Update — Handoff

## Commit

- SHA: `5978376`
- Message: `feat(booking-agent): GET availability now returns combined slots with kitchen_open`
- Branch: `main`
- Files (2):
  - `app/api/booking/agent/route.ts` (modified — GET handler only)
  - `tests/api/booking-agent-service-window.test.ts` (modified — GET assertion rewrite)

## GET Handler Changes (`app/api/booking/agent/route.ts`)

1. **Stopped forwarding `purpose=` to the upstream availability route.** The
   `URLSearchParams` for the upstream `GET /api/table-bookings/availability`
   call now contains only `date`, `time`, and `party_size`. Both `booking_type`
   and `purpose` were removed from the upstream URL because the upstream route
   silently ignores them (Wave 2C contract).
2. **Removed input parsing of `purposeParam`.** The legacy `?purpose=` query
   param is still read off the URL and discarded via `void searchParams.get(...)`,
   so existing agent integrations that include it continue to load with no
   error. Same treatment as the legacy `?type=` param.
3. **Removed `purpose` from the response payload.** The agent GET response no
   longer includes a top-level `purpose` field, since it would be misleading
   under the combined contract.
4. **Surfaced `kitchen_open` per slot.** Each entry in the response `times`
   array now carries `kitchen_open: boolean` when present on the upstream
   slot. The reshape preserves the original `time` and `available` fields and
   is implemented with a typed local `UpstreamSlot` (no `any`), so a slot with
   `kitchen_open === false` is faithfully forwarded rather than dropped.
5. **POST handler untouched.** `purpose: 'food' | 'drinks'` is still parsed
   from the POST body, validated against `resolveServiceRanges`, and forwarded
   to `anchorAPI.createTableBooking`. Existing food-vs-drinks rejection copy
   on POST is unchanged (POST stays out of scope per spec §9 / brief).
6. Removed an unused-after-the-edit local `purpose` variable from GET while
   keeping the `BookingPurpose` type import (still used by POST at line 68).

## Test Assertion Updates (`tests/api/booking-agent-service-window.test.ts`)

Single GET test was rewritten. POST tests in this file and every test in
`app/api/booking/agent/__tests__/route.test.ts` are untouched.

Rewrote `it('passes purpose through when checking availability', ...)` →
`it('returns combined slots without filtering by purpose for agent GET', ...)`.

| Old assertion (removed) | New assertion |
|---|---|
| `expect(calledUrl).toContain('purpose=drinks')` | `expect(calledUrl).not.toContain('purpose=')` |
| `expect(payload.purpose).toBe('drinks')` | `expect(payload).not.toHaveProperty('purpose')` |
| `expect(payload.times).toEqual([{ time: '21:30', available: true }])` | Two-slot fixture; assert each entry has `kitchen_open` boolean and matches `{ time, available, kitchen_open }` |

Mock upstream payload was extended to include `kitchen_open: true` (20:00) and
`kitchen_open: false` (21:30) so the reshape can be verified in both states.

## Test Confirmation

```
$ npx jest app/api/booking/agent/__tests__/route.test.ts tests/api/booking-agent-service-window.test.ts
PASS tests/api/booking-agent-service-window.test.ts
PASS app/api/booking/agent/__tests__/route.test.ts
Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
```

```
$ npx tsc --noEmit
# clean (no output)
```

TDD trace: rewrote the GET assertion first, ran the suite, confirmed the new
assertion failed (purpose=drinks still in calledUrl), then edited the GET
handler, then re-ran and saw 7/7 pass.

Note (out of scope): `tests/api/event-bookings-policy-fallback.test.ts`
already had 2 failing tests on `main` before this work — the brief flagged
this and it is unchanged.

## Self-Check

- [x] `git log --oneline -3` shows `5978376` at HEAD.
- [x] `git diff HEAD~1 HEAD --name-only` lists exactly the two in-scope files.
- [x] Targeted Jest run is green (7/7).
- [x] `npx tsc --noEmit` is clean.
- [x] This handoff note exists.

## Deviations From Plan

None. The plan's pseudocode for the rewritten test referenced
`body.data?.time_slots ?? body.time_slots`, but the actual agent GET reshapes
upstream data into a top-level `times` array (it always has done). The
rewritten test asserts against `payload.times[]` to match the route's real
output shape, which is what the plan intended (combined slots + per-slot
service flag) — just using the existing field name instead of `time_slots`.

## Notes For Downstream Agents

- `app/book-table/page.tsx` (Task 7) and `ManagementTableBookingForm`
  (Task 8) consumers don't depend on agent GET. No coupling to flag.
- The agent GET output now has `kitchen_open` available per time entry, so
  any future tool/agent that wants service-state context can read it without
  a second roundtrip.

## Post-Task

Per the PostToolUse hook on the route edit, run `/session-setup partial`
before the next session to refresh the changes manifest.
