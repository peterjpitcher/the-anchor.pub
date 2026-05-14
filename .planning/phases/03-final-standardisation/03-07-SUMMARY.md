---
phase: 03-final-standardisation
plan: 07
subsystem: frontend/styling
tags: [spacing-tokens, design-system, private-hire, DS-04]
dependency_graph:
  requires: [03-03]
  provides: [DS-04-partial]
  affects: [app/private-hire/, app/private-party-venue/, app/function-room-hire/]
tech_stack:
  added: []
  patterns: [section-spacing-lg, section-spacing-sm, section-spacing-tight]
key_files:
  created: []
  modified:
    - app/private-hire/page.tsx
    - app/private-hire/baby-showers/page.tsx
    - app/private-hire/christenings/page.tsx
    - app/private-hire/engagement-parties/page.tsx
    - app/private-hire/gender-reveal/page.tsx
    - app/private-hire/milestone-birthdays/page.tsx
    - app/private-hire/near/[slug]/page.tsx
    - app/private-hire/retirement-parties/page.tsx
    - app/private-hire/wakes/page.tsx
    - app/private-party-venue/page.tsx
    - app/function-room-hire/page.tsx
decisions:
  - "py-12 alone maps to section-spacing-lg (not section-spacing) per plan mapping: 'py-12 alone' listed under large spacing group"
  - "py-16 md:py-24 maps to section-spacing-lg (largest responsive variant)"
  - "py-6 maps to section-spacing-tight"
metrics:
  duration: 8m
  completed: "2026-05-14T14:09:42Z"
  tasks_completed: 1
  files_modified: 11
---

# Phase 03 Plan 07: Private-Hire and Venue Pages Spacing Token Migration Summary

One-liner: Replaced all inline `py-*` on `<section>` elements with design-system spacing tokens across 11 private-hire and venue pages (part 4 of DS-04).

## What Was Done

Migrated 11 pages from hardcoded `py-N` Tailwind classes on `<section>` elements to the spacing token system established in plan 03-03.

### Files Changed

| File | Old class(es) | New token |
|---|---|---|
| `app/private-hire/page.tsx` | `py-12` | `section-spacing-lg` |
| `app/private-hire/baby-showers/page.tsx` | `py-12` | `section-spacing-lg` |
| `app/private-hire/christenings/page.tsx` | `py-12` | `section-spacing-lg` |
| `app/private-hire/engagement-parties/page.tsx` | `py-8` (x2) | `section-spacing-sm` (x2) |
| `app/private-hire/gender-reveal/page.tsx` | `py-8` | `section-spacing-sm` |
| `app/private-hire/milestone-birthdays/page.tsx` | `py-8` (x2) | `section-spacing-sm` (x2) |
| `app/private-hire/near/[slug]/page.tsx` | `py-12`, `py-16` | `section-spacing-lg` (x2) |
| `app/private-hire/retirement-parties/page.tsx` | `py-8` (x2) | `section-spacing-sm` (x2) |
| `app/private-hire/wakes/page.tsx` | `py-12` (x2) | `section-spacing-lg` (x2) |
| `app/private-party-venue/page.tsx` | `py-8`, `py-16 md:py-24` | `section-spacing-sm`, `section-spacing-lg` |
| `app/function-room-hire/page.tsx` | `py-6`, `py-16 md:py-24` | `section-spacing-tight`, `section-spacing-lg` |

## Verification

- `grep "<section[^>]*\bpy-"` across all 11 files returns 0 matches
- `npm run build` exits 0

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 11 files modified with correct spacing tokens
- Commit `2e60e3e` exists
- Build passed (zero errors)
