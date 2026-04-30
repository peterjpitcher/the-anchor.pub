# Wave 2C2 — London Timezone Fixes — Handoff

## Commit

`ad334db` — `fix(book-table): compute today, defaults, and past-date validation in Europe/London`

`git diff HEAD~1 HEAD --name-only` → exactly two files:
- `components/features/TableBooking/ManagementTableBookingForm.tsx`
- `tests/unit/ManagementTableBookingForm.test.tsx`

## What landed

### Imports
Added a single grouped import next to the existing `pickSlotWindow` import:
```ts
import {
  londonIsoDate,
  londonNowParts,
  toTimeString,
} from '@/lib/table-booking-service-windows'
```

### Final implementations

**`getDefaultTimeValue()`** — rounds London-now + 60 minutes up to the next 30-minute slot, with `% 1440` wraparound past midnight:
```ts
function getDefaultTimeValue(): string {
  // Compute "now + 1 hour, rounded up to the next 30-minute slot" in
  // Europe/London. The previous implementation used the browser-local clock,
  // which is wrong for any visitor whose device is not on UK time.
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  return toTimeString(next % 1440)
}
```

**`toIsoDateInputValue()`** — short-circuits already-`YYYY-MM-DD` strings, otherwise parses and formats via `londonIsoDate()`:
```ts
function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return londonIsoDate(date)
}
```

**`addDays()`** — UTC-anchored arithmetic + London formatting; deterministic across browser timezones:
```ts
function addDays(isoDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  // UTC arithmetic from a date-only anchor + format through London. BST/GMT
  // shifts never cross noon, so this produces the correct calendar date in
  // every browser timezone.
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return londonIsoDate(date)
}
```
Confirmed: `addDays('2026-04-30', 1) === '2026-05-01'` regardless of process `TZ`.

**`isPastLondonDate()`** — pure string comparison against London today, no `Date` parsing of date-only inputs:
```ts
function isPastLondonDate(value: string): boolean {
  // Compare YYYY-MM-DD strings against London today. We deliberately do NOT
  // parse `value` with `new Date(...)` — that would re-introduce browser-local
  // timezone drift on the customer's device.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
}
```

### Other surgical edits

- `today` constant inside the component → `useMemo(() => londonNowParts().isoDate, [])` (replacing the prior `new Date().toISOString().slice(0, 10)`).
- `handleFindTable()` past-date branch → single `if (isPastLondonDate(date))` guard with the unchanged `'Please select a future date'` user-facing copy. The prior `new Date()` / `setHours(0,0,0,0)` block is gone.
- `handleDateChange()` past-date branch → `setDateError(isPastLondonDate(value) ? 'Please select a future date' : null)`. Same prior block removed; the validation only runs when `value` matches `YYYY-MM-DD`, preserving existing behaviour for partial input.
- Now-ticker (`const [, setNow] = useState(() => new Date())`) is unchanged in behaviour but now carries the explanatory comment from spec §12.4: booking date/time computations must use the London helpers, not the tick value.

### `toISOString` audit

```
$ grep -n "toISOString" components/features/TableBooking/ManagementTableBookingForm.tsx
(no matches)
```
Zero matches — the file no longer calls `toISOString()` anywhere.

## Tests

Added a new `describe('London timezone correctness', ...)` block with 5 tests, each guarded by `jest.useFakeTimers().setSystemTime(new Date('2026-04-29T23:30:00Z'))` (= `2026-04-30 00:30 BST`) and reset with `afterEach(() => jest.useRealTimers())`:

1. **Date input min and default are London today (2026-04-30), not UTC (2026-04-29).**
2. **Preferred Time default is computed from London now (00:30 + 60 → 01:30).**
3. **Past-date validation uses London today: 2026-04-29 rejected, 2026-04-30 allowed** — captures the availability URL via `captureUrl` and asserts no fetch fires for the rejected date and at least one fetch fires for the accepted date.
4. **`toIsoDateInputValue()` respects London for full date-time prefill values** — `prefill={{ date: '2026-04-29T23:30:00Z' }}` produces a Date input value of `2026-04-30`.
5. **Submitted POST body date matches the London date input** — full happy-path flow from default state through Confirm; asserts the captured `/api/table-bookings` payload contains `{ date: '2026-04-30' }`.

Test pre-flight (TDD): the 5 tests were added first; 3 of them failed against pre-fix code (date input min/default, prefill, submitted payload). The Preferred Time and past-date rejection cases coincidentally passed under the default `TZ` because the runner's local clock was already aligned with the simulated `2026-04-29T23:30:00Z`. Both still pass after the fix and — crucially — only the new implementation passes the date-input/min, prefill, and submitted-payload assertions, plus all 5 pass under `TZ=America/New_York`.

## Verification

```
$ npx jest tests/unit/ManagementTableBookingForm.test.tsx
  Tests:       26 passed, 26 total
  (12 existing + 9 from Wave 2C1 + 5 new London timezone tests)

$ TZ=America/New_York npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London"
  Tests:       21 skipped, 5 passed, 26 total

$ npx tsc --noEmit
  (clean — no output)

$ grep -n "toISOString" components/features/TableBooking/ManagementTableBookingForm.tsx
  (no matches)
```

## Judgment calls

- **`isPastLondonDate` placement.** Co-located near the other module-level date helpers (`addDays`, `getLondonIsoDate`) at the top of the file rather than inside the component body. Keeps the helper testable in isolation and matches the pattern used by every neighbouring date utility.
- **Now-ticker comment placement.** Appended a paragraph to the existing comment block above the `setNow` line, rather than introducing a fresh adjacent comment. Both blocks now read together as one explanation of the tick's purpose and its London-only invariant.
- **Submitted-payload test depth.** The plan referenced a `runFullBookingFlow` helper that does not exist in this test file. I inlined the full Find → Choose → Details → Review → Confirm flow using the established `setupFetchMock({ capturePayload })` pattern from neighbouring tests (`submits purpose: food when ...`). That keeps the new test self-contained and consistent with the rest of the file.
- **`handleFindTable` past-date branch.** The earlier code wrapped the validation in `if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {...}`. `isPastLondonDate(value)` already encodes that regex check, so the guard collapses to a single `if (isPastLondonDate(date))` line. The `setPartySize` / `setPartySizeDisplay` calls earlier in the handler still run in every code path, matching existing behaviour.

## Notes for downstream waves

- **Wave 2C3 (mobile)**: this commit changed only date/time-derivation paths. None of the slot-button JSX, `<Input>`/`<Button>` size props, `inputMode`/`autoComplete` attributes, the policy checkbox, or the `<form>` wrapping have been touched. Mobile work is free to proceed against the existing markup.
- **Wave 2C4 (idempotency)**: `handleConfirmBooking()` is unchanged. `createClientIdempotencyKey('tbl_web')` still runs per-click. The new `isPastLondonDate` and `londonNowParts` imports do not touch the submit path.
- No exported helpers were renamed; no new public types or component props were introduced.
