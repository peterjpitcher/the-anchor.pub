---
phase: 03-final-standardisation
plan: 04
subsystem: frontend/spacing
tags: [design-tokens, section-spacing, hotel-pages, heathrow-pages]
dependency_graph:
  requires: [03-03]
  provides: [DS-04-part1]
  affects: [app/pub-near-*/page.tsx, app/heathrow-hotels-pub/page.tsx, app/near-heathrow/]
tech_stack:
  added: []
  patterns: [section-spacing-sm, section-spacing-tight tokens on section elements]
key_files:
  created: []
  modified:
    - app/pub-near-crowne-plaza-heathrow/page.tsx
    - app/pub-near-hilton-heathrow/page.tsx
    - app/pub-near-holiday-inn-heathrow/page.tsx
    - app/pub-near-ibis-heathrow/page.tsx
    - app/pub-near-marriott-heathrow/page.tsx
    - app/pub-near-novotel-heathrow/page.tsx
    - app/pub-near-premier-inn-heathrow/page.tsx
    - app/pub-near-radisson-blu-heathrow/page.tsx
    - app/pub-near-renaissance-heathrow/page.tsx
    - app/pub-near-sofitel-heathrow/page.tsx
    - app/pub-near-travelodge-heathrow/page.tsx
    - app/heathrow-hotels-pub/page.tsx
    - app/near-heathrow/page.tsx
    - app/near-heathrow/terminal-2/page.tsx
    - app/near-heathrow/terminal-3/page.tsx
    - app/near-heathrow/terminal-4/page.tsx
    - app/near-heathrow/terminal-5/page.tsx
decisions:
  - "py-8 alone maps to section-spacing-sm (py-8 md:py-10)"
  - "py-6 alone maps to section-spacing-tight (py-6 md:py-8)"
metrics:
  duration_seconds: 168
  completed: 2026-05-14
  tasks_completed: 2
  files_modified: 17
---

# Phase 03 Plan 04: Hotel and Near-Heathrow Spacing Token Migration Summary

Replace inline py-* on section elements with spacing design tokens across 17 hotel and near-heathrow pages.

## What Was Done

Migrated all inline `py-*` classes on `<section>` elements to the established spacing token system across two groups of pages:

**Task 1 — Hotel pages (12 files):** All 11 `pub-near-*` pages and `heathrow-hotels-pub` had a single `py-8 bg-anchor-bg` intro section. Replaced with `section-spacing-sm bg-anchor-bg`.

**Task 2 — Near-heathrow pages (5 files):**
- `near-heathrow/page.tsx`: 3 sections — `py-6` x1 and `py-8` x2
- `terminal-2/page.tsx`: 2 sections — `py-6` and `py-8`
- `terminal-3/page.tsx`: 2 sections — `py-8` and `py-6`
- `terminal-4/page.tsx`: 2 sections — `py-8` and `py-6`
- `terminal-5/page.tsx`: 3 sections — `py-8`, `py-6` x2

## Replacement Mapping Used

| Original class | Token applied |
|---|---|
| `py-8` alone | `section-spacing-sm` |
| `py-6` alone | `section-spacing-tight` |

## Verification

- `grep "<section[^>]*\bpy-"` across all 17 files: **0 matches**
- `grep "section-spacing"` across all 17 files: **129 matches**
- Build pre-existing failure in `/private-hire` (unrelated MODULE_NOT_FOUND error, confirmed pre-existing by stash test)

## Deviations from Plan

None — plan executed exactly as written. The build failure in `/private-hire` is a pre-existing issue unrelated to this plan's changes, confirmed by testing with changes stashed.

## Known Stubs

None.

## Commits

- `f635c6f`: feat(03-04): replace inline py-* with spacing tokens on hotel section elements (12 files)
- `e96f7ba`: feat(03-04): replace inline py-* with spacing tokens on near-heathrow section elements (5 files)

## Self-Check: PASSED

- All 17 files modified
- Both commits exist in git log
- Zero remaining inline py-* on section elements
- 129 spacing token usages confirmed
