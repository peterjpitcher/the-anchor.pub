# Adversarial Review: Monthly Highlights Event Links

**Date:** 2026-04-12
**Mode:** Spec Compliance (Mode C)
**Engines:** Claude (2 agents) + Codex (pending)
**Scope:** `app/whats-on/page.tsx` — Monthly Highlights section
**Spec:** `docs/superpowers/specs/2026-04-12-monthly-highlights-event-links.md`

## Executive Summary

The spec correctly identifies the problem (hardcoded category page links) and the right file to change. However, the proposed implementation (Option A: 3 new category-specific API calls) has a **critical defect** (wrong category IDs) and a **better alternative exists** (Option B: filter already-fetched events). Both reviewers independently converged on this conclusion.

## What Appears Solid

- Problem identification — accurate, verified against live site
- Root cause — correct (3 hardcoded Links at lines 344, 359, 374)
- Line numbers — all verified correct
- Fallback-to-category-page strategy — graceful degradation, acceptable
- "Files NOT Modified" list — correct
- Cross-promo links assessment — correct (editorial, no changes needed)

## Critical Risks

### RISK-001: Category IDs are wrong (CRITICAL)

**Flagged by:** Both reviewers (AB-001, GAP-1)

The spec proposes `getUpcomingEventsByCategory('music-bingo', 1)` etc. The actual API category IDs are dynamic UUIDs, not slugs. Every category page in the codebase uses a two-step pattern:
1. `getEventCategories()` → fetch live category list
2. `getCategoryIdByLabel(categories, { name, slug })` → fuzzy-match to get real ID

The spec's hardcoded IDs would match nothing, returning empty arrays and falling back to category page links on every page load — identical to today's broken behaviour.

### RISK-002: Option A adds 4 unnecessary API calls (HIGH)

**Flagged by:** AB-002, AB-005

The page already fetches `getUpcomingEvents(24)` in `FilteredUpcomingEvents`, returning all upcoming events across all categories. Each event has a `category` field with `id`, `name`, and `slug`. Filtering this existing data by category gives the next event per category with zero additional API calls.

## Recommended Approach: Switch to Option B

Option B resolves RISK-001, RISK-002, and AB-003 simultaneously:
- Lift `getUpcomingEvents(24)` from `FilteredUpcomingEvents` to the page component
- Filter by `event.category?.slug` to find the next event per category
- Pass the events array down to `FilteredUpcomingEventsClient` as before
- No new API calls, no category ID resolution, no `getCategoryIdByLabel` duplication

## Unproven Assumptions

| Assumption | What would confirm it |
|---|---|
| Every event in the API response has a populated `category` field | Check a live API response |
| Category slugs match: `music-bingo`, `quiz-night`, `bingo-night` | Check live `getEventCategories()` response |
