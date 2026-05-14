---
phase: 03-final-standardisation
plan: 02
subsystem: ui
tags: [react, server-component, google-maps, cva, reusable-component]

requires:
  - phase: 01-tracking-herobadge
    provides: PhoneLink component for tracked phone links
provides:
  - FindUsSection component with full/compact variants
  - Reusable location display with map, address, phone, parking, directions
affects: [find-us, any-page-needing-location-display]

tech-stack:
  added: []
  patterns: [variant-driven-server-component, constant-sourced-data]

key-files:
  created:
    - components/FindUsSection.tsx
    - tests/FindUsSection.test.tsx
  modified:
    - app/find-us/page.tsx

key-decisions:
  - "FindUsSection is a Server Component — no interactivity needed for static location display"
  - "showMap defaults to variant-based logic (full=true, compact=false) with explicit override"

patterns-established:
  - "FindUsSection variant pattern: full (with map) vs compact (no map) via showMap prop"
  - "Location data sourced from CONTACT/PARKING constants for single-source-of-truth"

requirements-completed: [COMP-05]

duration: 5min
completed: 2026-05-14
---

# Phase 3 Plan 2: FindUsSection Component Summary

**Reusable FindUsSection Server Component with full/compact variants rendering Google Maps embed, address, phone, parking info, and directions link — deployed on find-us page replacing ad-hoc markup**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-14T14:00:47Z
- **Completed:** 2026-05-14T14:05:20Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Built FindUsSection as a Server Component with full/compact variants
- 8 unit tests covering both variants, props, and all rendered elements
- Deployed on find-us page replacing ad-hoc GoogleMapEmbed + address markup

## Task Commits

Each task was committed atomically:

1. **Task 1: Build FindUsSection component (TDD)** - `167a08a` (test: RED phase) + `afeb018` (feat: GREEN phase)
2. **Task 2: Deploy FindUsSection on find-us page** - `ea7bf9e` (feat)

## Files Created/Modified
- `components/FindUsSection.tsx` - Reusable location component with full/compact variants, GoogleMapEmbed, address, phone, parking, directions
- `tests/FindUsSection.test.tsx` - 8 test cases covering both variants and prop passthrough
- `app/find-us/page.tsx` - Replaced ad-hoc GoogleMapEmbed + address block with FindUsSection; removed unused GoogleMapEmbed import

## Decisions Made
- FindUsSection is a Server Component (no 'use client') since location display is purely static
- showMap prop defaults based on variant (full=true, compact=false) but can be overridden explicitly
- Directions URL uses CONTACT.coordinates for precise lat/lng targeting

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all data is sourced from CONTACT and PARKING constants.

## Issues Encountered
- Test for "Stanwell Moor" text failed initially due to multiple elements matching (map mock + address both contain the text) -- fixed by using getAllByText assertion instead of getByText

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FindUsSection ready for deployment on other pages that need location display (compact variant)
- Component API is stable with full/compact variants

---
*Phase: 03-final-standardisation*
*Completed: 2026-05-14*
