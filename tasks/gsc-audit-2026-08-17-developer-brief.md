# Developer brief: Google Search Console fixes

## What we need from you

Please independently review the proposed fixes below. Confirm the best implementation, flag risks, and give a rough effort estimate. No implementation is requested yet.

## Context

Google Search Console reports 695 URLs as not indexed. A live check found no site-wide indexing problem:

- All 226 sitemap URLs return a direct 200 response.
- All 40 sitemap URLs still shown as excluded are indexable and self-canonical.
- All 275 redirects reach a final 200 page.
- Most other records are old assets, tracking URLs, deliberate exclusions, or stale Google data.

## Changes needing review

### 1. Sitemap event dates

`app/sitemap.ts`, around line 315, uses the event start date as a fallback `lastModified` value.

Proposed fix: use only a genuine content update timestamp such as `_meta.lastUpdated`. Omit `lastModified` when there is no trustworthy update date.

Please confirm whether `_meta.lastUpdated` is reliable for every event source and whether any other fallback is appropriate.

### 2. Fish and parking schema

- `app/fish-and-chips-heathrow/page.tsx`, around lines 67–113: remove the `Product` schema and keep the existing `Menu` and `MenuItem` schema.
- `app/heathrow-parking/page.tsx`, around lines 224–242: replace `Product` with `Service`, retaining the offer and `ParkingFacility` data.

Please confirm these schema changes are correct and will not affect other page behaviour.

### 3. Event schema lifecycle

- `app/live-sport/world-cup/page.tsx`, around lines 83–126: the finished event still advertises an `InStock` offer. Proposed fix: remove the offer or the complete `Event` schema after the event ends.
- `app/easter-sunday/page.tsx`: only add price, currency, and `validFrom` when there is a real fixed offer. Otherwise remove the offer block.
- `app/mothers-day/page.tsx`: apply the same rule. Do not invent a zero price or performer.

Please advise whether this should become a reusable date-based schema lifecycle helper for all events.

### 4. Mother's Day title

The live title ends with `| The Anchor | The Anchor`.

Proposed fix: remove the brand suffix from the page-level title because the root metadata template already adds it.

## Important constraints

- Do not redirect meaningless 404 URLs to the home page.
- Do not remove intentional `noindex` or robots rules for archives and utility routes.
- Do not add fake schema prices, performers, reviews, or ratings.
- Search Console is delayed. A historical error does not prove the current page is broken.

## Questions to answer

1. Do you agree with each proposed fix?
2. What code changes would you make differently?
3. Are there shared helpers or tests that should be added?
4. What regressions or data edge cases should we watch for?
5. What is the rough effort and safest deployment order?

## Full evidence

- Main report: `tasks/gsc-audit-2026-08-17.md`
- All 695 URLs and live results: `tasks/gsc-audit-2026-08-17-all-urls.md`

This audit work only added report files. It did not change production code. Other unrelated worktree changes may be present.
