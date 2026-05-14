---
phase: 01-tracking-herobadge
plan: 02
subsystem: ui
tags: [gtm, phone-tracking, hero-badge, ssot, component-migration]

requires:
  - phase: 01-tracking-herobadge plan 01
    provides: PhoneLink with showIcon prop, PhoneButton, HeroBadge on Badge primitive, PHONE_NUMBER constant
provides:
  - Zero raw tel: href links remaining in the codebase
  - Every clickable phone number fires GTM phone_call_click event
  - All inline hero badge markup replaced with HeroBadge component
  - SSOT.json is the single source of rating/review data across all pages
affects: [phase-02, phase-03, any future page additions]

tech-stack:
  added: []
  patterns:
    - "PhoneLink for inline tracked phone links (showIcon=false for mid-sentence)"
    - "PhoneButton for CTA-style tracked phone buttons"
    - "HeroBadge for consistent trust badge display"
    - "CONTACT constant for all phone number references"

key-files:
  created: []
  modified:
    - app/page.tsx
    - app/drinks/page.tsx
    - app/book-table/page.tsx
    - app/heathrow-parking/page.tsx
    - app/private-hire/page.tsx
    - app/function-room-hire/page.tsx
    - app/beer-garden/page.tsx
    - lib/error-handling.ts
    - lib/promos/privateHire2026.ts

key-decisions:
  - "PhoneLink showIcon=false for mid-sentence phone links to avoid breaking text flow"
  - "PhoneButton for all Button-wrapped tel: links to maintain CTA styling"
  - "Source names follow page_location convention for GTM attribution"

patterns-established:
  - "Phone link source naming: page-name_location (e.g. drinks_cta, heathrow-parking_terms)"
  - "HeroBadge replaces all inline rating markup site-wide"
  - "CONTACT.phoneHref for non-component tel: href strings in lib files"

requirements-completed: [TRACK-01, COMP-01]

duration: 13min
completed: 2026-05-14
---

# Phase 1 Plan 02: Site-wide PhoneLink/PhoneButton and HeroBadge Migration Summary

**27 raw tel: links replaced with tracked PhoneLink/PhoneButton, 21 pages migrated to HeroBadge component sourcing ratings from SSOT.json**

## Performance

- **Duration:** 13 min
- **Started:** 2026-05-14T11:39:31Z
- **Completed:** 2026-05-14T11:52:31Z
- **Tasks:** 2
- **Files modified:** 39

## Accomplishments
- Every clickable phone number on the site now fires a GTM phone_call_click event with page-specific source attribution
- All inline hero badge markup (hardcoded "Rated 4.6/5 on Google") replaced with HeroBadge component pulling from SSOT.json
- Phone numbers centralised via CONTACT constant -- no hardcoded phone strings remain in page or lib files

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate all raw tel: links to PhoneLink/PhoneButton** - `258c4f2` (feat)
2. **Task 2: Replace inline hero badge markup with HeroBadge component** - `26ae9a2` (feat)

## Files Created/Modified

### Task 1 (27 files)
- `app/drinks/page.tsx` - PhoneButton CTA
- `app/corporate-events/page.tsx` - PhoneButton CTA
- `app/heathrow-parking/page.tsx` - PhoneButton CTA + 2x PhoneLink in terms
- `app/about/page.tsx` - PhoneButton CTA
- `app/function-room-hire/page.tsx` - PhoneButton CTA
- `app/private-hire/page.tsx` - PhoneLink inline
- `app/private-hire/wakes/page.tsx` - 2x PhoneLink inline
- `app/food-menu/page.tsx` - 2x PhoneLink inline (kitchen notice)
- `app/book-table/page.tsx` - PhoneLink inline
- `app/beer-garden/page.tsx` - PhoneLink inline + PhoneButton CTA
- `app/our-pub/page.tsx` - PhoneButton CTA
- `app/karaoke/page.tsx` - PhoneButton fallback
- `app/quiz-night/page.tsx` - PhoneButton fallback
- `app/music-bingo/page.tsx` - PhoneButton fallback
- `app/cash-bingo/page.tsx` - PhoneButton fallback
- `app/live-music/page.tsx` - PhoneButton fallback
- `app/safety-and-respect/page.tsx` - PhoneButton CTA
- `app/accessibility/page.tsx` - PhoneLink inline + PhoneButton CTA
- `app/heathrow-parking/[terminal]/page.tsx` - PhoneButton CTA
- `app/heathrow-parking/confirmation/[bookingId]/page.tsx` - PhoneLink inline
- `app/parking/bookings/[id]/page.tsx` - PhoneLink inline
- `app/near-heathrow/page.tsx` - PhoneLink inline
- `app/private-party-venue/page.tsx` - PhoneButton CTA
- `app/christmas-parties/christmas-hero-ctas.tsx` - CONTACT.phoneHref
- `app/christmas-parties/client-components.tsx` - CONTACT.phoneHref
- `lib/error-handling.ts` - CONTACT.phoneHref
- `lib/promos/privateHire2026.ts` - CONTACT.phoneHref

### Task 2 (21 files)
- `app/page.tsx` - HeroBadge
- `app/drinks/page.tsx` - HeroBadge
- `app/feltham-pub/page.tsx` - HeroBadge
- `app/private-hire/page.tsx` - HeroBadge (+ fixed duplicate CONTACT import)
- `app/function-room-hire/page.tsx` - HeroBadge
- `app/karaoke/page.tsx` - HeroBadge
- `app/stanwell-pub/page.tsx` - HeroBadge
- `app/whats-on/page.tsx` - HeroBadge
- `app/food-menu/page.tsx` - HeroBadge
- `app/book-table/page.tsx` - HeroBadge
- `app/beer-garden/page.tsx` - HeroBadge
- `app/heathrow-parking/page.tsx` - HeroBadge
- `app/live-sport/page.tsx` - HeroBadge
- `app/ashford-pub/page.tsx` - HeroBadge
- `app/staines-pub/page.tsx` - HeroBadge
- `app/events/[id]/page.tsx` - HeroBadge
- `app/near-heathrow/page.tsx` - HeroBadge
- `app/near-heathrow/terminal-2/page.tsx` - HeroBadge
- `app/near-heathrow/terminal-3/page.tsx` - HeroBadge
- `app/near-heathrow/terminal-4/page.tsx` - HeroBadge
- `app/near-heathrow/terminal-5/page.tsx` - HeroBadge

## Decisions Made
- PhoneLink used with `showIcon={false}` for mid-sentence phone links to avoid icon breaking text flow
- PhoneButton used for all Button-wrapped tel: links to maintain existing CTA styling
- Source names follow `page-name_location` convention for clear GTM attribution

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Additional pages with raw tel: links**
- **Found during:** Task 1 (site-wide grep)
- **Issue:** Plan listed ~32 page files but `near-heathrow/page.tsx` and `private-party-venue/page.tsx` also had raw tel: links
- **Fix:** Included both pages in the migration
- **Files modified:** `app/near-heathrow/page.tsx`, `app/private-party-venue/page.tsx`
- **Committed in:** 258c4f2

**2. [Rule 2 - Missing Critical] Additional pages with inline badge markup**
- **Found during:** Task 2 (site-wide grep)
- **Issue:** Plan listed 11 pages but 9 additional pages had inline badge markup (live-sport, ashford-pub, staines-pub, events/[id], near-heathrow, near-heathrow/terminal-2 through terminal-5)
- **Fix:** Included all 9 extra pages in the HeroBadge migration
- **Files modified:** 9 additional page files
- **Committed in:** 26ae9a2

**3. [Rule 1 - Bug] Duplicate CONTACT import in private-hire/page.tsx**
- **Found during:** Task 2 (build failure)
- **Issue:** Adding `import { CONTACT } from '@/lib/constants'` created a duplicate since line 20 already imported `{ CONTACT, BRAND }`
- **Fix:** Removed the duplicate import
- **Files modified:** `app/private-hire/page.tsx`
- **Committed in:** 26ae9a2

---

**Total deviations:** 3 auto-fixed (2 missing critical, 1 bug)
**Impact on plan:** All auto-fixes necessary for completeness. The plan's file list was incomplete; the grep-based sweep caught all remaining instances. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## Known Stubs
None - all components are fully wired to real data sources.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 (tracking + HeroBadge) is complete
- All phone links tracked, all badges standardised
- Ready for Phase 2 (testimonial standardisation)
- No blockers

---
*Phase: 01-tracking-herobadge*
*Completed: 2026-05-14*
