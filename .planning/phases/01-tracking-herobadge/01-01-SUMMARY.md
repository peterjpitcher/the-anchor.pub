---
phase: 01-tracking-herobadge
plan: 01
subsystem: ui
tags: [cva, badge, svg-icon, ssot, gtm-tracking, phone-link]

requires: []
provides:
  - PHONE_NUMBER constant in lib/constants.ts
  - PhoneLink with visible SVG phone icon (showIcon default true)
  - HeroBadge trust-badge component wrapping Badge primitive with SSOT.json data
  - ItemBadge backward-compatible item-badge component
  - HeroItem wrapper component for menu item badges
affects: [01-tracking-herobadge plan 02, component-standardisation]

tech-stack:
  added: []
  patterns:
    - Badge primitive wrapping via CVA for all badge UI
    - SSOT.json build-time import for dynamic content

key-files:
  created: []
  modified:
    - lib/constants.ts
    - components/PhoneLink.tsx
    - components/HeroBadge.tsx
    - components/ManagersSpecial.tsx
    - components/MenuRenderer.tsx

key-decisions:
  - "Added ItemBadge export to preserve old HeroBadge item-badge API for ManagersSpecial and MenuRenderer consumers"
  - "HeroBadge is now a Server Component (no use client) since trust badges have no interactivity"

patterns-established:
  - "Badge primitive wrapping: all badge-style UI should use Badge from components/ui/primitives/Badge.tsx"
  - "SSOT.json import: build-time data sourcing for ratings, review counts, and other SSOT-managed values"

requirements-completed: [TRACK-02, COMP-01]

duration: 3min
completed: 2026-05-14
---

# Phase 1 Plan 1: PhoneLink Icon Fix and HeroBadge Rebuild Summary

**PhoneLink renders visible SVG phone icon by default; HeroBadge rebuilt on Badge primitive with SSOT.json-sourced Google rating/review data**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-14T11:33:08Z
- **Completed:** 2026-05-14T11:36:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- PhoneLink now renders a real inline SVG phone icon when showIcon is true (was rendering empty string)
- PHONE_NUMBER convenience constant added to lib/constants.ts
- HeroBadge rebuilt as a trust-badge component wrapping the Badge primitive, pulling rating (4.6) and review count (238) from SSOT.json at build time

## Task Commits

Each task was committed atomically:

1. **Task 1: Add PHONE_NUMBER constant and fix PhoneLink icon** - `f06bb7f` (feat)
2. **Task 2: Rebuild HeroBadge on Badge primitive with SSOT.json data** - `719f7bb` (feat)

## Files Created/Modified
- `lib/constants.ts` - Added PHONE_NUMBER convenience alias
- `components/PhoneLink.tsx` - Replaced empty string icon with inline SVG phone icon
- `components/HeroBadge.tsx` - Rebuilt: HeroBadge (trust badges), ItemBadge (item badges), HeroItem (wrapper)
- `components/ManagersSpecial.tsx` - Updated import from HeroBadge to ItemBadge
- `components/MenuRenderer.tsx` - Updated import from HeroBadge to ItemBadge

## Decisions Made
- Added `ItemBadge` export to preserve the old `HeroBadge(text, variant, position)` API. ManagersSpecial and MenuRenderer use this API directly (not through HeroItem), so the build would break without it.
- HeroBadge is now a Server Component since trust badges have no interactivity or client-side state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added ItemBadge export and migrated consumers**
- **Found during:** Task 2 (HeroBadge rebuild)
- **Issue:** ManagersSpecial.tsx and MenuRenderer.tsx import HeroBadge directly with the old text/variant/position API. Replacing HeroBadge with a trust-badge component would break these consumers at build time.
- **Fix:** Added ItemBadge component preserving the old HeroBadge API but routing through the Badge primitive. Updated both consumers to import ItemBadge instead of HeroBadge.
- **Files modified:** components/HeroBadge.tsx, components/ManagersSpecial.tsx, components/MenuRenderer.tsx
- **Verification:** npm run build completes without errors
- **Committed in:** 719f7bb (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for build correctness. No scope creep -- the same Badge primitive wrapping pattern was applied to the legacy API.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all components render real data from SSOT.json and display real SVG icons.

## Next Phase Readiness
- PhoneLink and HeroBadge are ready for site-wide deployment in Plan 02
- ItemBadge provides backward compatibility so existing menu pages continue working
- Build passes cleanly with zero errors

---
## Self-Check: PASSED

All 5 files verified on disk. Both commits (f06bb7f, 719f7bb) verified in git log. Build passes cleanly.

---
*Phase: 01-tracking-herobadge*
*Completed: 2026-05-14*
