# P6 — Restore What's On orphan-repair internal links

## Mission
The Phase 4.3 What's On rebuild dropped two internal-link sections that keep seasonal/recent-event
pages from becoming SEO orphans. Restored them, light-themed, so the `seo-indexing` guard
("wires the orphan repair link sets into crawlable hubs") passes again.

## What was restored
Two sections re-added to `app/whats-on/page.tsx`, placed after "The regulars" and before the
existing "Discover More" internal-links section / CtaBand:

1. **Seasonal occasions** — maps `seasonalOccasionLinks` (from `lib/internal-linking-data`) to a
   responsive grid (1 / sm:2 / lg:4) of `<Card hover accent>` wrapped in real `<Link href>`s.
   Restores inbound links to the previously orphaned seasonal pages: `/bank-holiday-weekends`,
   `/bonfire-night`, `/boxing-day`, `/easter`, `/fathers-day`, `/halloween`, `/new-years-eve`,
   `/st-patricks-day` (plus the rest of the set).
2. **Recent events** — `getRecentEvents(12)` fetched in the page `Promise.all`, rendered (only when
   non-empty) as a 1 / md:2 / lg:3 grid of `<Card hover accent>` `<Link href="/events/{slug|id}">`s,
   each showing `formatEventDate(startDate)`, `name`, and `brief/shortDescription/description`.
   Keeps recently finished event pages crawlable while Google recrawls.

## Data wiring reused (same as original `main:app/whats-on/page.tsx`)
- Import: `getRecentEvents, formatEventDate` from `@/lib/api` (re-exported from `lib/api/events.ts`).
- Import: `seasonalOccasionLinks` from `@/lib/internal-linking-data`.
- Fetch: added `getRecentEvents(12).catch(() => [] as Event[])` to the existing `Promise.all`.
- Card link fields: `event.slug || event.id`, `event.brief || event.shortDescription || event.description`.

## Light-theme adaptation
- Replaced legacy dark classes (`anchor-bg-card`, `anchor-gold/15`, `anchor-cream-text/70`,
  `SectionHeader`/`Section`) with Phase-0 tokens + DS components: `Card` (hover accent),
  `SectionHeading`, `Container`, `bg-canvas` / `bg-surface`, `text-ink-strong`, `text-ink-muted`,
  `py-section-y`, hover accent `group-hover:text-anchor-gold`.
- Note: original had a dead "Browse all" target; there is no `/events` archive route (only
  `/events/[id]`), so the recent-events CTA points to `/whats-on#upcoming-events`. Individual
  recent-event cards link to `/events/{slug}` which resolves via the `[id]` route.

## Scope
- Touched only `app/whats-on/page.tsx`. No new `_components` file needed. `docs/architecture/*` untouched.

## Verification (verbatim)

1. `npx jest tests/seo-indexing.test.ts 2>&1 | tail -6`
```
Test Suites: 1 passed, 1 total
Tests:       38 passed, 38 total
Snapshots:   0 total
Time:        0.367 s, estimated 1 s
Ran all test suites matching /tests\/seo-indexing.test.ts/i.
```

2. `npx tsc --noEmit` → clean (EXIT: 0).

3. `npm run lint` → passes:
```
✔ No ESLint warnings or errors
Hero audit passed for 123 page templates.
Menu page audit passed.
```

4. `grep -c "seasonalOccasionLinks\|getRecentEvents" app/whats-on/page.tsx` → `4` (both present, 2 each).
