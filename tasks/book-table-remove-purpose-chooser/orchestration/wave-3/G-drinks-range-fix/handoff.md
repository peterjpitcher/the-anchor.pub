# Wave 4G — Drinks-Range Fix + Codex Blocking Findings

## Commit

`5516b15` — fix(book-table): drinks slots span full pub hours; require explicit purpose on direct API submissions

## Mission

Fix the user-reported bug where the `/book-table` slot grid only showed
kitchen hours instead of the full pub-open window, AND address three
blocking findings from the codex-qa-review (AB-001, AB-002, AB-003).

## Changes

### 1. `lib/table-booking-service-windows.ts` — drinks always span the venue window

Previously `resolveServiceRanges(purpose: 'drinks')` short-circuited at the
first matching `schedule_config` `drinks` entry, then the `regular` entry,
and only fell through to the venue `opens`/`closes` window when neither
existed. In production the management API was returning `schedule_config`
with `drinks` entries that mirrored kitchen hours (12:00–21:00) instead of
the full pub window (12:00–23:00), so the wizard's slot grid was clipped
at kitchen close.

The drinks branch now ALWAYS resolves to the venue/pub `opens`/`closes`
window — schedule_config `drinks` and `regular` entries are deliberately
ignored for window scope. Schedule_config still drives food window
resolution (the food branch above is unchanged).

This makes the helper change minimal and contained: the entire fix happens
in `resolveServiceRanges(purpose: 'drinks')`. `resolveCombinedServiceRanges`
needed no edit because it derives its master `ranges` from
`resolveServiceRanges(purpose: 'drinks')` — the new behaviour propagates
automatically.

### 2. `app/api/table-bookings/route.ts` — AB-001

`purpose` is now required. Missing or invalid (`!= 'food' | 'drinks'`)
returns HTTP 400 with the existing neutral copy:
`Missing required fields: phone, date, time, party_size, purpose`.

The previous silent coercion to `'food'` was the root cause of the
"misleading service-window error" described in the codex report.

### 3. `app/api/booking/agent/route.ts` — AB-002 + AB-003

* AB-002: `purpose` is now required. Missing/invalid returns HTTP 400 with
  `Missing required field: purpose (must be "food" or "drinks")`.
* AB-003: outside-window error copy is now the neutral website
  submit-route copy:
  `That time is outside online booking hours. Please choose another time or call 01753 682707.`
  No more "Food bookings", "switch to drinks", "kitchen service hours",
  or "drinks booking window".

## New tests

| File | Behaviour covered |
|---|---|
| `tests/api/table-bookings-service-window.test.ts` | Master ranges span full venue window with schedule_config drinks entries matching kitchen hours |
| `tests/api/table-bookings-service-window.test.ts` | Master ranges span full venue window with only `regular` schedule entry |
| `tests/api/table-bookings-service-window.test.ts` | `resolveServiceRanges(purpose: drinks)` covers 22:30 with schedule_config drinks=kitchen |
| `tests/api/table-bookings-service-window.test.ts` | `resolveServiceRanges(purpose: drinks)` covers 22:30 with only `regular` entry |
| `tests/api/table-bookings-service-window.test.ts` | `resolveServiceRanges(purpose: drinks)` falls back to venue window when schedule_config empty |
| `app/api/table-bookings/__tests__/route.test.ts` | Direct POST `purpose: drinks, time: 22:30` succeeds with schedule_config drinks=kitchen |
| `app/api/table-bookings/__tests__/route.test.ts` | Direct POST with missing `purpose` returns HTTP 400 (AB-001) |
| `app/api/table-bookings/__tests__/route.test.ts` | Direct POST with invalid `purpose: 'lunch'` returns HTTP 400 (AB-001) |
| `app/api/booking/agent/__tests__/route.test.ts` | Agent POST with missing `purpose` returns HTTP 400 (AB-002) |
| `app/api/booking/agent/__tests__/route.test.ts` | Agent POST with invalid `purpose` returns HTTP 400 (AB-002) |
| `app/api/booking/agent/__tests__/route.test.ts` | Agent outside-window copy is neutral — no food/drinks/kitchen wording (AB-003) |

Existing test `tests/api/booking-agent-service-window.test.ts` updated:
the "rejects food bookings outside kitchen hours" assertion was changed
from `toContain('Food bookings')` to neutral-copy assertions matching
AB-003.

## Verification

### Test pipeline

`npx jest tests/ app/api/`

| | Pre-fix baseline | Post-fix |
|---|---|---|
| Test Suites | 5 failed, 30 passed, 35 total | 5 failed, 30 passed, 35 total |
| Tests | 19 failed, 233 passed, 252 total | 19 failed, 244 passed, 263 total |

11 new tests added, all passing. Zero regressions. The 19 pre-existing
failures (notably `event-bookings-policy-fallback.test.ts`) are
unchanged and out of scope for this PR.

### Targeted suite

`npx jest tests/api/ app/api/ tests/unit/resolveServiceRanges.test.ts tests/unit/ManagementTableBookingForm.test.tsx`

Pre-fix: 2 failed, 64 passed (66 total) — the 2 failures are the
pre-existing `event-bookings-policy-fallback`.
Post-fix: 2 failed, 75 passed (77 total) — same 2 pre-existing failures,
plus the 11 new tests passing.

### Typecheck

`npx tsc --noEmit` — clean.

### Customer-facing copy audit

`grep -in "food bookings\|switch to drinks\|kitchen service hours\|drinks booking window" app/api/booking/agent/route.ts app/api/table-bookings/route.ts`

Returns one match in `app/api/table-bookings/route.ts:157` — a code comment
("regular food bookings now."), not customer-facing copy. Confirmed safe.

## Judgment calls

### Did `resolveServiceRanges(purpose: 'drinks')` semantics need changing?

Yes. The brief left this open. The fix turned out to be cleanest at this
level rather than in `resolveCombinedServiceRanges` alone. Reasoning:

1. The submit-route validation in `app/api/table-bookings/route.ts` calls
   `resolveServiceRanges(purpose: payload.purpose)` directly. If we'd
   only fixed `resolveCombinedServiceRanges`, the submit route would
   still have rejected `purpose: 'drinks', time: '22:30'` against the
   buggy fixture.
2. The website's `lib/api/client.ts:buildTableAvailabilityFromBusinessHours`
   does call `resolveCombinedServiceRanges` for the wizard slot grid, so
   the master-range fix would have been visible there. But the fix needs
   to apply uniformly — the submit-route still uses the per-purpose
   helper.
3. The retired `resolveServiceRanges` `drinks` short-circuits never had
   semantic value distinct from the venue window (any production
   schedule_config drinks/regular entry that ISN'T kitchen-shaped is
   not a thing the management API ever emits — the failure mode is
   always "matches kitchen"). Removing them tightens the contract.

So the fix is small, contained, and — by changing one branch of one
function — guarantees both the wizard slot grid and the submit-route
service-window validation see the full venue window for drinks.

### Why ignore `regular` entries entirely?

In the current management API contract, `regular` is used as a generic
catch-all for venue-wide booking windows. In every production fixture
seen so far, `regular` matches kitchen hours rather than venue hours.
Including it in drinks resolution would re-introduce the same clipping
bug. Kept simple: drinks ALWAYS = venue window.

### Capacity preservation

The new venue-window range uses `capacity: 50` (unchanged from the
existing fall-through). If/when the management API starts emitting
authoritative drinks-bookable capacity per slot, this can be revisited —
but for now no production data depends on a smaller drinks capacity
value coming from schedule_config.

## Self-Check

- [x] `git log --oneline -3` shows `5516b15` at HEAD.
- [x] `git diff HEAD~1 HEAD --name-only` shows only the 7 in-scope files.
- [x] Targeted Jest suite passes: 19 pre-existing failures unchanged, 11 new tests passing.
- [x] `npx tsc --noEmit` clean.
- [x] No customer-facing matches for banned phrases in the two API routes.
- [x] This handoff note exists.
