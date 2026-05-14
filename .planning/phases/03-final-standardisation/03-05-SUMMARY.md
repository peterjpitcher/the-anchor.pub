---
phase: 03-final-standardisation
plan: 05
subsystem: design-system
tags: [spacing-tokens, section-elements, location-pages, DS-04]
dependency_graph:
  requires: [03-03]
  provides: [DS-04-part2]
  affects: [16 location and area pub pages]
tech_stack:
  added: []
  patterns: [section-spacing-tight, section-spacing-sm, section-spacing, section-spacing-lg CSS tokens]
key_files:
  created: []
  modified:
    - app/ashford-pub/page.tsx
    - app/bedfont-pub/page.tsx
    - app/colnbrook-pub/page.tsx
    - app/egham-pub/page.tsx
    - app/feltham-pub/page.tsx
    - app/horton-pub/page.tsx
    - app/longford-pub/page.tsx
    - app/m25-junction-14-pub/page.tsx
    - app/our-pub/page.tsx
    - app/staines-pub/page.tsx
    - app/stanwell-pub/page.tsx
    - app/sunbury-pub/page.tsx
    - app/windsor-pub/page.tsx
    - app/wraysbury-pub/page.tsx
    - app/pubs-in-stanwell/page.tsx
    - app/restaurants-near-heathrow/page.tsx
decisions:
  - py-16 md:py-24 in our-pub mapped to section-spacing-lg (large spacing rule)
  - py-6 HeroBadge strips mapped to section-spacing-tight (tight spacing rule)
metrics:
  duration: ~10m
  completed: 2026-05-14
  tasks_completed: 1
  tasks_total: 1
  files_modified: 16
---

# Phase 03 Plan 05: Location Pub Pages Spacing Token Migration Summary

One-liner: Replaced all inline `py-*` padding on `<section>` elements across 16 location/area pub pages with `section-spacing-*` design tokens.

## What Was Done

Migrated all hardcoded `py-*` Tailwind classes on `<section>` elements across 16 location pub pages to the spacing token system defined in `app/globals.css`. This is Part 2 of DS-04.

## Replacement Mapping Applied

| Original class | Token applied | Files affected |
|---|---|---|
| `py-6` | `section-spacing-tight` | ashford-pub, feltham-pub, staines-pub, stanwell-pub |
| `py-8` | `section-spacing-sm` | all 16 files (page title sections) |
| `py-16 md:py-24` | `section-spacing-lg` | our-pub (CTA gradient section) |

## Commits

- `5bd3f4d`: feat(03-05): replace inline py-* on section elements with spacing tokens across 16 location pub pages

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 16 files modified: confirmed via git diff (16 files changed, 21 insertions, 21 deletions)
- Commit 5bd3f4d exists: confirmed
- Zero remaining `<section[^>]*\bpy-` matches: confirmed (grep returned no output)
- Build compiled successfully: confirmed (`✓ Compiled successfully`)
