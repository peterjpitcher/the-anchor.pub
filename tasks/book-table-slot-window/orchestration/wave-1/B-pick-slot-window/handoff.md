# Wave 1B Handoff — `pickSlotWindow` helper

## Status
Complete.

## Commit
`0fc4a1a` feat(book-table): add pickSlotWindow helper for step-2 visual filtering

Files in commit:
- `lib/table-booking-slot-window.ts` (new)
- `tests/unit/table-booking-slot-window.test.ts` (new)

## Verification
- `npx jest tests/unit/table-booking-slot-window.test.ts` — **15/15 pass**
  - centres on the anchor (19:00) and returns 7 slots 17:30..20:30
  - shifts the window earlier when the anchor is near close (22:00)
  - shifts the window later when the anchor is at open (12:00)
  - tie-breaks earlier at 19:15 (anchors 19:00 not 19:30)
  - uses the closer slot at 19:16 (anchors 19:30)
  - clamps to last 7 when anchor is past end (23:00)
  - returns all slots when array is shorter than size
  - returns all 7 when array is exactly size
  - returns 7 when array is one larger than size
  - returns empty for empty array
  - returns first `size` slots when anchor is empty/invalid
  - respects custom size = 5
  - returns [] for size = 0
  - preserves object identity
  - exports `DEFAULT_SLOT_WINDOW_SIZE === 7`
- `npx tsc --noEmit` — **clean, no errors**.
- TDD path observed: tests written and confirmed failing (module not found) before implementation; tests confirmed passing after implementation.

## Exports
- `pickSlotWindow<T extends Pick<TableAvailabilitySlot, 'time'>>(slots, requestedTime, size?)` — pure helper.
- `DEFAULT_SLOT_WINDOW_SIZE = 7`.

## Deviations from plan
None. Implementation and tests match Task 2 in `tasks/book-table-slot-window/plan.md` verbatim.

## Notes for downstream tasks
- Helper imports `isValidTime`, `normalizeTime`, `toMinutes` from `@/lib/table-booking-service-windows` — unaffected by Wave 1A which only adds `londonIsoDate`.
- `TableAvailabilitySlot` is consumed via `@/lib/api` (re-exported from `lib/api/index.ts` → `./bookings`).
- An unrelated commit (`c28d298` SEO schema fix) landed between session start (`5516b15`) and this commit; `git diff HEAD~1 HEAD --name-only` still shows only the two expected files.
