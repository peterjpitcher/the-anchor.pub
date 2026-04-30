# Wave 1A — `londonIsoDate` Helper — Handoff

## Commit
- **SHA:** `1785d64`
- **Subject:** `feat(service-windows): export londonIsoDate helper used for London date formatting`
- **Files staged (only these two):**
  - `lib/table-booking-service-windows.ts`
  - `tests/api/table-bookings-service-window.test.ts`

## Confirmations
- `londonNowParts()` public signature unchanged — still `(): { isoDate: string; minutes: number }`. Internally it now calls `londonIsoDate(now)` for the date branch and keeps the existing `formatToParts`-based minute extraction.
- `londonIsoDate(date?: Date): string` exported with explicit return type and a default of `new Date()`.
- `npx jest tests/api/table-bookings-service-window.test.ts` → **19 passed / 0 failed** (16 pre-existing + 3 new for `londonIsoDate` + 1 new for `londonNowParts uses londonIsoDate`).
- `npx tsc --noEmit` → **exit 0**, clean.
- Committed via TDD: failing tests first (3 `TypeError: londonIsoDate is not a function`), then implementation, then green.

## Self-check results
- `git log --oneline -3` shows `1785d64` at HEAD (parent: Wave 1B `0fc4a1a`).
- `git diff HEAD~1 HEAD --name-only` shows only the two expected files.
- `npx jest tests/api/table-bookings-service-window.test.ts` passes.
- `npx tsc --noEmit` clean.
- `londonNowParts()` export signature unchanged.
- Handoff note exists at this path.

## Deviations from the plan
None of substance. One minor procedural note:

- The brief said HEAD was `5516b15`. By the time work started, two commits had landed on `main` (`d56cfaf` SEO Sunday-lunch fix, `c28d298` SEO @id fix), and during this wave's work Wave 1B (`pickSlotWindow`) also landed (`0fc4a1a`). My commit was made on top of `0fc4a1a`, on `main`, with no rebase or merge needed — the two waves touch disjoint files and were independent per the plan.
- Test imports for the new `describe` blocks use the same `await import('@/lib/table-booking-service-windows')` style already used in this test file, rather than the top-of-file static import shown in the plan snippet. This keeps the file's module-mock semantics consistent and avoids importing `londonNowParts` twice. Behaviour identical.

## Working-tree note
The repo had unrelated `M` and `??` entries (docs/architecture, codex-qa-review JSON, two task directories) before I started. Per the brief, those were left untouched and were not staged.
