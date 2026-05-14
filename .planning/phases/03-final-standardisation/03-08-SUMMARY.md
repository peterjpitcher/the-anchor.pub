---
phase: 03-final-standardisation
plan: 08
subsystem: frontend/spacing
tags: [design-tokens, spacing, section-spacing, DS-04]
dependency_graph:
  requires: [03-03]
  provides: [DS-04-complete]
  affects: [app/page.tsx, app/about/page.tsx, app/accessibility/page.tsx, app/beer-garden/page.tsx, app/coach-parking-heathrow/page.tsx, app/dog-friendly-pub-heathrow/page.tsx, app/family-friendly-pub-heathrow/page.tsx, app/fish-and-chips-heathrow/page.tsx, app/heathrow-family-dining/page.tsx, app/luggage-storage-heathrow/page.tsx, app/pizza-menu/page.tsx, app/pool-darts-pub/page.tsx, app/pre-flight-meal/page.tsx, app/pub-garden-heathrow/page.tsx, app/safety-and-respect/page.tsx, app/sunday-lunch/page.tsx, app/sustainability/page.tsx]
tech_stack:
  added: []
  patterns: [section-spacing-sm, section-spacing-lg, section-spacing-tight]
key_files:
  created: []
  modified:
    - app/page.tsx
    - app/about/page.tsx
    - app/accessibility/page.tsx
    - app/beer-garden/page.tsx
    - app/coach-parking-heathrow/page.tsx
    - app/dog-friendly-pub-heathrow/page.tsx
    - app/family-friendly-pub-heathrow/page.tsx
    - app/fish-and-chips-heathrow/page.tsx
    - app/heathrow-family-dining/page.tsx
    - app/luggage-storage-heathrow/page.tsx
    - app/pizza-menu/page.tsx
    - app/pool-darts-pub/page.tsx
    - app/pre-flight-meal/page.tsx
    - app/pub-garden-heathrow/page.tsx
    - app/safety-and-respect/page.tsx
    - app/sunday-lunch/page.tsx
    - app/sustainability/page.tsx
decisions:
  - "Replaced py-16 md:py-24 with section-spacing-lg (matches py-12 md:py-14 lg:py-16 token — closest large variant)"
  - "Replaced py-12 standalone with section-spacing-lg (next tier up as py-12 is the start of large spacing)"
  - "Replaced py-8 with section-spacing-sm, py-6 with section-spacing-tight"
metrics:
  duration: 15m
  completed: 2026-05-14
  tasks_completed: 2
  files_modified: 17
---

# Phase 03 Plan 08: Core Pages + Site-Wide DS-04 Verification Summary

**One-liner:** Replaced 27 inline py-* classes on section elements across 17 core pages with spacing tokens, completing DS-04 site-wide.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace inline py-* on section elements (17 files) | 21c64b5 | 17 pages |
| 2 | Site-wide DS-04 verification sweep | 3ccf8ea | (verification only) |

## What Was Done

**Task 1** processed 27 instances of inline py-* classes across 17 files:

| Replacement pattern | Token used | Files |
|--------------------|-----------|-------|
| `py-16 md:py-24` | `section-spacing-lg` | about, accessibility, beer-garden, safety-and-respect, sustainability |
| `py-12` (6 times) | `section-spacing-lg` | sunday-lunch (5 sections), pizza-menu |
| `py-8` | `section-spacing-sm` | page (homepage), coach-parking, dog-friendly, family-friendly, fish-and-chips, heathrow-family-dining, luggage-storage, pool-darts, pub-garden, pre-flight |
| `py-6` | `section-spacing-tight` | beer-garden (2 sections), dog-friendly |

**Task 2** ran the full site-wide verification:
- `grep "<section[^>]*\bpy-{8,10,12,16,20,24,32}\b" app/**/*.tsx` returned 0 matches
- `npm run build` compiled successfully (exit 0)
- `npm run lint` returned "No ESLint warnings or errors" (exit 0)

## Verification Results

- Site-wide grep for inline py-* on section elements: **0 matches**
- Build status: **passed**
- Lint status: **passed (0 errors, 0 warnings)**

## Decisions Made

- `py-16 md:py-24` mapped to `section-spacing-lg` — the token's `py-12 md:py-14 lg:py-16` is the closest large responsive tier
- `py-12` standalone mapped to `section-spacing-lg` — py-12 is the entry point for large spacing in the token system
- Pre-existing `_document PageNotFoundError` in build output is a worktree artifact, not caused by these changes

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 17 modified files confirmed edited
- Commit 21c64b5 exists: `git log --oneline | grep 21c64b5` confirms
- Commit 3ccf8ea exists: `git log --oneline | grep 3ccf8ea` confirms
- Site-wide grep returns 0 matches
- Build and lint both pass
