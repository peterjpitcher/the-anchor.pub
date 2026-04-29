# Monthly Highlights Repo Reality Mapper Report

Spec reviewed: [docs/superpowers/specs/2026-04-12-monthly-highlights-event-links.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-monthly-highlights-event-links.md:1)

Files inspected:
- [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:1)
- [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:202)
- [components/FilteredUpcomingEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/FilteredUpcomingEvents.tsx:1)
- [components/FilteredUpcomingEventsClient.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/FilteredUpcomingEventsClient.tsx:1)
- [lib/api/client.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/client.ts:848)
- Supporting category pages: [app/music-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/music-bingo/page.tsx:61), [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:62), [app/cash-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/cash-bingo/page.tsx:62), [app/open-mic/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/page.tsx:60), [app/live-music/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/live-music/page.tsx:57), [app/karaoke/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/karaoke/page.tsx:60), [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:14)

Live API verification note:
- On 2026-04-12 I probed `https://management.orangejelly.co.uk/api/event-categories` and `https://management.orangejelly.co.uk/api/events` from this workspace. Both returned `401 Invalid or missing API key`. This repo does not have `ANCHOR_API_KEY` configured locally, so live management IDs are not directly verifiable here.

## 1. Actual category IDs used by the management API

- The repo treats management category IDs as opaque values returned by `getEventCategories()`, then passed unchanged into `getUpcomingEventsByCategory()` and onward as `category_id` to `AnchorAPI.getEvents()`; there is no local slug-to-ID translation layer in [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:575) or [lib/api/client.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/client.ts:849).
- The only hardcoded category IDs in repo code are the fallback placeholders in [FALLBACK_EVENT_CATEGORIES](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:202): `drag-shows`, `quiz-nights`, and `live-music`.
- No production code calls `getUpcomingEventsByCategory()` with string literals like `'music-bingo'`, `'quiz-nights'`, or `'cash-bingo'`. Existing call sites either:
- resolve a real `category.id` from `getEventCategories()` first, as in [app/music-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/music-bingo/page.tsx:80), [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:81), [app/cash-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/cash-bingo/page.tsx:81), [app/open-mic/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/page.tsx:71), [app/live-music/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/live-music/page.tsx:90), and [app/karaoke/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/karaoke/page.tsx:89)
- or reuse an existing `event.category.id`, as in [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:25).
- Repo-reality answer: the only codified IDs are the three fallback placeholders above. The actual live IDs for Music Bingo, Quiz Night, Cash Bingo, Karaoke, and Open Mic are not hardcoded anywhere in this repo.

## 2. Verify the spec's proposed IDs

- `'music-bingo'`: appears as a route slug / lookup slug in [app/music-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/music-bingo/page.tsx:61), but not as a proven management `id`.
- `'quiz-nights'`: appears only in [FALLBACK_EVENT_CATEGORIES](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:217). The actual quiz page does not assume that ID; it matches by `name: 'Pub Quiz Night'` or `slug: 'quiz-night-stanwell-moor'` first in [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:62).
- `'cash-bingo'`: I found no code evidence that this is a management `id`. The cash bingo page looks for `name: 'Bingo Night'` or `slug: 'bingo-night'` in [app/cash-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/cash-bingo/page.tsx:62).
- The fallback category set itself is not a safe source for these three Monthly Highlights IDs: it has no Music Bingo category, no Cash Bingo category, and its quiz fallback does not match the live page's expected quiz name/slug pair.
- Practical implication: the spec's proposed `getUpcomingEventsByCategory('music-bingo', 1)`, `getUpcomingEventsByCategory('quiz-nights', 1)`, and `getUpcomingEventsByCategory('cash-bingo', 1)` calls are unverified against the real API. Because [AnchorAPI.getEvents()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/client.ts:849) forwards `category_id` verbatim, wrong literals would not be corrected locally.

## 3. How `getUpcomingEventsByCategory` behaves when no events exist

- If `categoryId` is falsy, it returns `[]` immediately in [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:580).
- If the API returns an empty `events` array, it returns `[]` after filtering in [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:606).
- If the API returns only past events, the post-filter step also yields `[]` in [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:610).
- If the API throws for any reason, it logs and returns `[]` in [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:614).
- There is no special "no events for this category" sentinel and no fallback event/category-page logic in this helper. Empty, bad ID, auth failure, and upstream errors all collapse to `[]`.

## 4. What `app/whats-on/page.tsx` currently imports and how it is structured

- The page imports `Link`, `Metadata`, `Suspense`, UI building blocks, `FilteredUpcomingEvents`, several SEO/tracking components, `getBusinessHours`, and `getBusinessStats` in [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:1).
- It does not currently import `getEventCategories` or `getUpcomingEventsByCategory`.
- Component order in the page is:
- `BreadcrumbJsonLd`, `SpeakableSchema`, `ScrollDepthTracker`, JSON-LD `<script>`, `HeroWrapper`, `TrustBar`, rating strip, Heathrow positioning section, `PageTitle`, local-nights section, `Upcoming Events`, `Monthly Highlights`, then the later informational sections starting at [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:65).
- The `Upcoming Events` section renders first and wraps `<FilteredUpcomingEvents />` in `<Suspense>` at [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:310).
- The actual fetch path for that section is server-side: [components/FilteredUpcomingEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/FilteredUpcomingEvents.tsx:8) calls `getUpcomingEvents(24)` and `getBusinessHours()` in parallel, merges in special-hours pseudo-events, emits `EventSchema`, and passes the merged list into the client component.
- The lazy / scroll-sensitive behavior lives in [components/FilteredUpcomingEventsClient.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/FilteredUpcomingEventsClient.tsx:151), where `useInView` controls when individual cards and load-more UI render. The data fetch itself has already happened before that.
- The `Monthly Highlights` cards are the three hardcoded category links at [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:343).
- Adversarial note: the spec describes the event listing as being "below" Monthly Highlights, but the real JSX order is the reverse. The listing is before Monthly Highlights in code.

## 5. Is there caching on `/whats-on`?

- There is no page-level `export const revalidate`, `dynamic`, or page-local `fetch(..., { next: { revalidate } })` in [app/whats-on/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/whats-on/page.tsx:1).
- There is still fetch-level caching beneath the page:
- `AnchorAPI.request()` defaults server-side fetches to `next: { revalidate: 300 }` when no override is supplied in [lib/api/client.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/client.ts:708).
- `FilteredUpcomingEvents` calls `getUpcomingEvents(24)` in [components/FilteredUpcomingEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/FilteredUpcomingEvents.tsx:11), so that event fetch inherits the default 300-second revalidation.
- `getBusinessHours()` explicitly disables caching with `next: { revalidate: 0 }` in [lib/api/client.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/client.ts:1099).
- `getBusinessStats()` is cached with `unstable_cache(..., { revalidate: 300 })` in [lib/schema-with-reviews.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/schema-with-reviews.ts:8).
- Repo-reality answer: no page-level cache export, but yes, mixed fetch-level caching exists.

## 6. Existing patterns for similar category lookups

- Best single-category pattern:
- [app/music-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/music-bingo/page.tsx:69), [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:70), [app/cash-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/cash-bingo/page.tsx:70), and [app/open-mic/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/page.tsx:60) all do: `getEventCategories()` -> match by `name` or `slug` -> use returned `.id` with `getUpcomingEventsByCategory(...)`.
- Best multi-category pattern:
- [app/live-music/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/live-music/page.tsx:90) and [app/karaoke/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/karaoke/page.tsx:89) resolve multiple category IDs first, then `Promise.all(...)` the category fetches and dedupe results.
- Existing direct-ID pattern:
- [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:25) already uses a known `categoryId` directly when it is passed in from an event object.

## Bottom Line

- The spec's direct string-literal category IDs are not grounded in current repo usage.
- The real pattern in this codebase is: resolve category IDs from `getEventCategories()` first, then call `getUpcomingEventsByCategory(resolvedId, ...)`.
- If Monthly Highlights is changed to deep-link to next event pages, the repo-safe implementation pattern is the category-page lookup flow, not hardcoded `category_id` strings.
