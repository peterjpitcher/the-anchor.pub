---
phase: 03-final-standardisation
plan: 01
subsystem: ui
tags: [cta, conversion, smart-ctas, hero-wrapper, reviews]

# Dependency graph
requires:
  - phase: 01-tracking-herobadge
    provides: HeroBadge component and PhoneLink for tracked phone links
provides:
  - CTASection on reviews page for booking conversion
  - enableSmartCtas on food-menu, sunday-lunch, book-table HeroWrappers
  - Verified CTASection coverage on all terminal subpages (CONV-01)
  - Verified consistent white variant pairing in all CTASection button arrays (CONV-03)
  - Verified enableSmartCtas on all location/hotel pages (CONV-04)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CTASection green variant with booking + phone button pair for conversion pages"
    - "enableSmartCtas={true} on service-page HeroWrappers for contextual CTA display"

key-files:
  created: []
  modified:
    - app/reviews/page.tsx
    - app/food-menu/page.tsx
    - app/sunday-lunch/page.tsx
    - app/book-table/page.tsx

key-decisions:
  - "CTASection on reviews uses green variant with Book a Table + Call Us pairing"
  - "All CTASection button arrays use variant white for secondary buttons (not secondary)"

patterns-established:
  - "CTASection secondary buttons always use variant: white (renders as secondary on coloured backgrounds)"
  - "Service pages enable SmartCTAs via enableSmartCtas={true} on HeroWrapper"

requirements-completed: [CONV-01, CONV-02, CONV-03, CONV-04, CONV-05]

# Metrics
duration: 2min
completed: 2026-05-14
---

# Phase 3 Plan 1: CTA Standardisation Summary

**CTASection added to reviews page with booking CTA, SmartCTAs enabled on 3 service pages, and CONV-01/03/04 verified across all terminal and location pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-14T14:01:09Z
- **Completed:** 2026-05-14T14:03:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added CTASection with green variant booking + phone CTA to reviews page (CONV-02)
- Enabled enableSmartCtas={true} on food-menu, sunday-lunch, book-table HeroWrappers (CONV-05)
- Verified all 4 terminal subpages have CTASection (CONV-01: T2=4, T3=4, T4=4, T5=4 references each)
- Verified zero CTASection button arrays use variant "secondary" -- all use "white" (CONV-03)
- Verified 13 location/hotel pages have enableSmartCtas (CONV-04)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CTASection to reviews page and enable SmartCTAs on service pages** - `05abe57` (feat)
2. **Task 2: Verify CONV-01 and audit CONV-03 button variant consistency** - verification only, no code changes needed

## Files Created/Modified
- `app/reviews/page.tsx` - Added CTASection import and green variant CTA with booking + phone buttons
- `app/food-menu/page.tsx` - Added enableSmartCtas={true} to HeroWrapper
- `app/sunday-lunch/page.tsx` - Added enableSmartCtas={true} to HeroWrapper
- `app/book-table/page.tsx` - Added enableSmartCtas={true} to HeroWrapper

## Decisions Made
- Used green variant CTASection on reviews page (consistent with all other booking CTAs site-wide)
- Reviews CTA uses direct booking URL (ordertab.menu) as first button rather than /book-table path, matching BookTableButton's default behaviour
- All CTASection secondary buttons confirmed to use variant: "white" -- no fixes needed for CONV-03

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all changes are fully wired with no placeholder content.

## Issues Encountered

- Build initially failed due to .next directory conflict in worktree (parallel agent race condition). Resolved by clearing .next cache and rebuilding.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All CONV requirements (CONV-01 through CONV-05) are now satisfied
- CTA coverage complete across reviews, terminal, service, and location pages
- Ready for remaining Phase 3 plans (tokens, BusinessHours, FindUsSection)

---
*Phase: 03-final-standardisation*
*Completed: 2026-05-14*
