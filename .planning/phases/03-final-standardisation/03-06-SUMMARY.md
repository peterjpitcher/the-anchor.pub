---
phase: 03-final-standardisation
plan: "06"
subsystem: design-system
tags: [spacing-tokens, section-elements, event-pages, DS-04]
dependency_graph:
  requires: [03-03]
  provides: [DS-04-part3]
  affects: [app/live-sport, app/karaoke, app/quiz-night, app/whats-on, app/corporate-events, app/corporate-christmas-parties, app/summer-garden-parties]
tech_stack:
  added: []
  patterns: [section-spacing, section-spacing-sm, section-spacing-lg, section-spacing-tight]
key_files:
  created: []
  modified:
    - app/live-sport/page.tsx
    - app/live-sport/boxing/page.tsx
    - app/live-sport/f1/page.tsx
    - app/live-sport/six-nations/page.tsx
    - app/live-sport/world-cup/page.tsx
    - app/karaoke/page.tsx
    - app/quiz-night/page.tsx
    - app/whats-on/page.tsx
    - app/corporate-christmas-parties/page.tsx
    - app/corporate-events/page.tsx
    - app/summer-garden-parties/page.tsx
decisions:
  - "py-16 md:py-24 (corporate-events CTA) mapped to section-spacing-lg as the closest large-spacing token"
metrics:
  duration: ~5 minutes
  completed: "2026-05-14"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 11
---

# Phase 03 Plan 06: Event Pages Spacing Token Migration Summary

Replaced all inline py-* padding on section elements with design-system spacing tokens across 11 event and entertainment pages. Zero inline py-* remain on any section element in scope.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace inline py-* on section elements | 52524f6 | 11 event pages |

## What Was Done

### Replacements applied

| File | Old class | New token |
|------|-----------|-----------|
| app/live-sport/page.tsx | `py-6` | `section-spacing-tight` |
| app/live-sport/page.tsx | `py-8` | `section-spacing-sm` |
| app/live-sport/boxing/page.tsx | `py-8` | `section-spacing-sm` |
| app/live-sport/f1/page.tsx | `py-8` | `section-spacing-sm` |
| app/live-sport/six-nations/page.tsx | `py-12` | `section-spacing-lg` |
| app/live-sport/world-cup/page.tsx | `py-10` | `section-spacing` |
| app/karaoke/page.tsx | `py-6` | `section-spacing-tight` |
| app/quiz-night/page.tsx | `py-6` | `section-spacing-tight` |
| app/whats-on/page.tsx | `py-6` | `section-spacing-tight` |
| app/summer-garden-parties/page.tsx | `py-8` | `section-spacing-sm` |
| app/corporate-events/page.tsx | `py-8` | `section-spacing-sm` |
| app/corporate-events/page.tsx | `py-16 md:py-24` | `section-spacing-lg` |
| app/corporate-christmas-parties/page.tsx | `py-8` | `section-spacing-sm` |

## Verification

- `grep -rn "<section[^>]*\bpy-"` across all 11 files returns 0 matches
- `npm run build` exits 0

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 11 files confirmed modified
- Commit 52524f6 exists in git log
- Build passes with zero errors
