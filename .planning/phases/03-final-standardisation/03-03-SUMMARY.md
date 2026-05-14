---
phase: 03-final-standardisation
plan: 03
subsystem: ui
tags: [business-hours, design-tokens, dynamic-content, spacing]

requires:
  - phase: 01-tracking-herobadge
    provides: BusinessHours component already exists and is deployed on some pages
provides:
  - Spacing tokens DS-01/02/03 verified as existing with correct values
  - All hardcoded kitchen hours removed from 6 target pages
  - BusinessHours component deployed on stanwell-pub and six-nations pages
  - Generic dynamic-safe phrasing on about, m25-junction-14-pub, homepage, book-table
affects: []

tech-stack:
  added: []
  patterns:
    - "BusinessHours component for standalone hours display blocks"
    - "Generic phrasing for mid-sentence prose and FAQ schema answer fields"

key-files:
  created: []
  modified:
    - app/stanwell-pub/page.tsx
    - app/live-sport/six-nations/page.tsx
    - app/about/page.tsx
    - app/m25-junction-14-pub/page.tsx
    - app/page.tsx
    - app/book-table/page.tsx

key-decisions:
  - "BusinessHours used for standalone hours blocks; generic phrasing for mid-sentence and FAQ schema text"
  - "book-table FAQ already updated by parallel agent (03-01), no duplicate change needed"

patterns-established:
  - "Standalone hours display: use BusinessHours component"
  - "Mid-sentence hours references: use generic phrasing like 'served daily (check our opening hours for times)'"
  - "FAQ schema answer fields: use generic phrasing since React components cannot render in JSON-LD strings"

requirements-completed: [DS-01, DS-02, DS-03, DATA-01]

duration: 4min
completed: 2026-05-14
---

# Phase 3 Plan 3: Spacing Tokens and BusinessHours Deployment Summary

**Verified spacing design tokens DS-01/02/03 in globals.css and replaced all hardcoded kitchen hours with BusinessHours component or dynamic-safe phrasing across 6 pages**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-14T14:00:51Z
- **Completed:** 2026-05-14T14:04:41Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Verified section-spacing, section-spacing-sm, and section-spacing-lg tokens exist in globals.css with values matching REQUIREMENTS.md
- Replaced hardcoded kitchen schedule strings on stanwell-pub and six-nations pages with live BusinessHours component
- Replaced static day references on about, m25-junction-14-pub, homepage, and book-table with generic dynamic-safe phrasing

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify spacing tokens** - No commit (verification only, no file changes needed)
2. **Task 2: Replace hardcoded hours** - `aff4e17` (feat)

## Files Created/Modified
- `app/stanwell-pub/page.tsx` - Replaced "Kitchen: Tue-Fri 6-9pm, Sat 1-7pm, Sun 1-6pm" with BusinessHours component
- `app/live-sport/six-nations/page.tsx` - Added BusinessHours import, replaced hardcoded hours with component
- `app/about/page.tsx` - Changed "served Tuesday to Sunday" to "with food served daily (check our opening hours for times)"
- `app/m25-junction-14-pub/page.tsx` - Changed "served Tuesday to Sunday" to "served daily (check our opening hours for times)"
- `app/page.tsx` - Changed "food served Tuesday to Sunday" to "freshly prepared pub food"
- `app/book-table/page.tsx` - Kitchen hours FAQ already updated by parallel agent (03-01)

## Decisions Made
- BusinessHours component used for standalone hours display blocks (stanwell-pub, six-nations) where it renders as a self-contained widget
- Generic phrasing used for mid-sentence prose (about, m25-junction-14-pub, homepage) and FAQ schema text (book-table) where a React component cannot be rendered
- book-table FAQ was already updated by parallel agent 03-01 in commit 05abe57; no duplicate change needed

## Deviations from Plan

None - plan executed exactly as written. The book-table FAQ update was already completed by a parallel agent, which is expected in parallel execution.

## Issues Encountered
- Build cache corruption in worktree required clearing .next directory (pre-existing infrastructure issue, not caused by changes)
- Linter auto-reverted some changes mid-execution, requiring re-application and immediate commit

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all changes are complete with live data sources wired.

## Next Phase Readiness
- DS-01/02/03 spacing tokens confirmed, ready for any future spacing standardisation work
- DATA-01 complete: hours now update automatically when changed in the management app

---
*Phase: 03-final-standardisation*
*Completed: 2026-05-14*
