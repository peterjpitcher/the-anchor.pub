# Wave R — Repair: Codex Blocking Fixes — Handoff

**Branch:** `main`
**Commit SHA:** `716fcf2`
**Files changed:** 2 (`components/features/TableBooking/ManagementTableBookingForm.tsx`, `tests/unit/ManagementTableBookingForm.test.tsx`)

## Mission

Fix five blocking codex-qa-review findings against the slot-window PR. All five
were scoped to `ManagementTableBookingForm.tsx` and its test file, landed as a
single atomic commit per the brief.

## Fixes Applied

### Fix 1 — AB-001 — addDays UTC arithmetic, no London-format roundtrip
- **Where:** `components/features/TableBooking/ManagementTableBookingForm.tsx` (`addDays()` ~L308)
- **What:** Replaced `londonIsoDate(...)` formatting roundtrip with direct
  `getUTCFullYear / getUTCMonth / getUTCDate` extraction. Pure UTC arithmetic;
  no timezone formatter involvement.
- **Test added:** `addDays advances 2027-03-28 (next BST transition) to 2027-03-29
  in alternative search URLs (AB-001)` — searches a date with no slots, verifies
  the alternative-search URL set contains `2027-03-29`, `2027-03-30`, `2027-03-31`.

### Fix 2 — AB-002 / WF-003 — clamp default Preferred Time on midnight wrap
- **Where:** `getDefaultTimeValue()` ~L154
- **What:** When `(minutes + 60)` rounded up to a 30-min boundary `>= 1440`,
  return `'23:30'` instead of wrapping with `% 1440` to `'00:00'`. Comment
  explains why we don't auto-advance the date.
- **Test added:** `default Preferred Time clamps to 23:30 when London now+1h
  crosses midnight (AB-002 / WF-003)` — sets system clock to `2026-04-30T22:00:00Z`
  (= London 23:00 BST), asserts the Preferred Time input default is `23:30`.

### Fix 3 — AB-003 — clear submit-intent key on confirmed booking
- **Where:** `handleConfirmBooking()` `state === 'confirmed'` branch
- **What:** Call `clearSubmitIntentIdempotencyKey()` immediately after
  `setResult(bookingResult)` runs and we enter the confirmed branch. Skipped
  for `pending_payment` (in flight) and `blocked` (could retry).
- **Test added:** `clears the cached submit-intent key on confirmed booking so
  a re-attempt with the same payload mints a fresh key (AB-003)` — confirms
  one booking, clicks "Book another", re-enters identical inputs, confirms
  again, and asserts the second `Idempotency-Key` differs from the first.
  Note: `resetJourney` also clears the key, so this test passes whether the
  defensive clear fires or not — but it documents the post-confirmed end state.

### Fix 4 — ARCH-002 — remove setSlotWindowAnchorTime from preferred-time handler
- **Where:** `handleRequestedTimeChange()` ~L1073
- **What:** Removed the line `setSlotWindowAnchorTime(value)` from the input
  change handler. Anchor is now set only in `runAvailabilitySearch` (after a
  successful availability response) and `resetJourney` (back to defaults).
- **Test coverage:** Existing `changing preferred time collapses and re-centres
  the window` test (Step 2 slot window + party-size threading) already proves
  the desired behaviour: re-centring on the new preferred time only happens
  after the next search, not on the keystroke. Verified the test still passes.

### Fix 5 — WF-004 — disable review-step Back during submission
- **Where:** review-step Back button ~L2220
- **What:** Added `disabled={loading}` to the outline Back button on the review
  step (alongside the Confirm button which already had `loading={loading}`).
  Preserved existing `min-h-12` className.
- **Test added:** `disables the review-step Back button while Confirm is in
  flight (WF-004)` — uses a deferred booking POST promise, asserts Back is
  enabled before Confirm and disabled while the request is pending. Releases
  the promise at the end so the test settles cleanly.

## Test Counts

- **Prior:** 38 tests passing.
- **New:** 4 tests in a new `Codex review fixes` describe block.
- **Total:** 42 tests, all passing.

## Verification Run

```
$ npx jest tests/unit/ManagementTableBookingForm.test.tsx
Tests:       42 passed, 42 total
Time:        1.688 s

$ TZ=America/New_York npx jest tests/unit/ManagementTableBookingForm.test.tsx -t "London"
Tests:       36 skipped, 6 passed, 42 total
(includes the new 23:30 midnight-wrap test, which has "London" in the title)

$ npx tsc --noEmit
(clean)
```

## Self-Check

- [x] `git log --oneline -3` shows commit `716fcf2` at HEAD.
- [x] `git diff HEAD~1 HEAD --name-only` shows exactly the two intended files.
- [x] All 42 wizard tests pass.
- [x] London-titled tests still pass under `TZ=America/New_York` (6/6).
- [x] `addDays('2026-03-29', 1) === '2026-03-30'` — observable via the BST-day
      alternative-URL test (using 2027-03-28 since 2026-03-29 is in the past
      relative to today, 2026-04-30; the rewritten arithmetic is identical
      across both years).
- [x] `getDefaultTimeValue()` returns `'23:30'` at London 23:00.
- [x] Back button on review step has `disabled={loading}`.
- [x] `setSlotWindowAnchorTime` is set ONLY in `runAvailabilitySearch` and
      `resetJourney` — verified by `grep -n "setSlotWindowAnchorTime("`:
      L935 (in runAvailabilitySearch), L1535 (in resetJourney), L556 (useState
      initialiser). No other call sites.
- [x] Handoff note exists (this file).

## Advisory Findings — Deliberately NOT Fixed

These codex findings were marked advisory (non-blocking) in the brief and are
explicitly out of scope for this Wave R commit. Listing them here so the
parent orchestrator can triage them separately.

- **AB-006** (`lib/table-booking-slot-window.ts:27`, "Plausible but unverified",
  Medium): `pickSlotWindow()` assumes `availableSlots` are already sorted by
  time. Reasoning: the management API's contract is documented as ascending
  time order, and `normalizeAvailabilityResponse()` preserves that order
  faithfully. Adding a defensive sort would not change behaviour for any
  observed input. If we want to harden, this is a small follow-up.
- **ARCH-004** (`lib/table-booking-slot-window.ts:31`, "Plausible but unverified",
  Medium): same root cause as AB-006 — implicit sorted-input contract on
  `pickSlotWindow`. Same disposition.
- **WF-002** (`ManagementTableBookingForm.tsx:941`, "Confirmed defect", Medium,
  non-blocking): nearest-alternative loading has no abort-signal threading or
  stale-search guard, so a slow response from a previous search can populate
  alternatives after a newer search has started. Reasoning: the brief flags
  this as advisory (non-blocking) because the visible impact requires two
  rapid back-to-back no-slot searches with adverse network timing. Worth
  fixing, but better as a follow-up that audits the full async-cancellation
  story in this component (we already cancel the primary availability fetch
  via `availabilityControllerRef`).
- **SEC-001** (not enumerated in detail above): per the brief, advisory only —
  no specific blocking action; flag for follow-up review.

## Out-of-Scope Codex Findings (NOT THIS PR)

The following findings were raised by codex against commits OUTSIDE the
slot-window PR (events redirect / SEO / GSC remediation work). They are
explicitly NOT this agent's responsibility per the brief and have been left
untouched:

- **AB-004**, **AB-005**, **AB-007** — events redirect / robots / static-asset
  header verification.
- **ARCH-001**, **ARCH-003** — events redirect lifecycle and ordering.
- **WF-001** — falsy-event redirect ordering in `app/events/[id]/page.tsx`.

Routing those to the right owner is the orchestrator's call.
