## Inspection Inventory

- Spec reviewed: [docs/superpowers/specs/2026-04-12-category-url-leakage-fix-design.md](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/docs/superpowers/specs/2026-04-12-category-url-leakage-fix-design.md:1)
- Requested files inspected:
  - [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:1)
  - [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:1)
  - [lib/event-seo-strategy.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-seo-strategy.ts:1)
  - [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:1)
  - [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:1)
  - [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:190)
  - [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:1)
- Supporting files inspected to verify consumers, imports, and tests:
  - [components/events/EventSecondaryActions.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/EventSecondaryActions.tsx:1)
  - [app/sitemap.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap.ts:236)
  - [lib/event-calendar.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:141)
  - [lib/api/index.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/index.ts:1)
  - [lib/event-lifecycle.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-lifecycle.ts:1)
  - [tests/unit/EventBookingButton.test.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/tests/unit/EventBookingButton.test.tsx:1)
  - [tests/unit/event-schema.test.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/tests/unit/event-schema.test.ts:1)

## File-Level Observations

- [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:13) has exactly the fallback chain the spec describes: `slug` -> trimmed `id` -> `event.url` -> `'/events'`. `resolvePathFromUrl()` returns `parsed.pathname` for any `http(s)` URL and does not validate origin, route family, or category pages before returning it.
- [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:15) uses `new URL(urlValue, WEBSITE_ORIGIN)`, so many strings that are not absolute URLs still parse successfully. That means a bare value like `'summer-quiz'` is interpreted as `https://www.the-anchor.pub/summer-quiz`, not `'/events/summer-quiz'`.
- [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:9) builds `eventUrl` from `getEventWebsiteUrl(event, { absolute: true })`, then uses that for both top-level `@id` and `url`.
- [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:11) sets `bookingUrl = event.bookingUrl || eventUrl`. It does not sanitize `event.bookingUrl`, does not consult `event.offers?.url`, and passes the value straight to `offers.url`.
- [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:122) passes through `event.mainEntityOfPage` raw, and [line 123](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:123) passes through `event.potentialAction` raw when present.
- [lib/event-seo-strategy.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-seo-strategy.ts:11) already holds the authoritative six-entry `CATEGORY_ROUTES` map used by the booking button. `event-url.ts` does not currently depend on it.
- [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:15) computes `CATEGORY_PAGE_PATHS` from `CATEGORY_ROUTES` and has local filtering logic that rejects same-origin category pages as booking destinations.
- [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:100) resolves booking destinations in this order: sanitized `event.bookingUrl` -> sanitized `event.offers?.url` -> internal `/events/{slug||id}`.
- [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:54) wraps each card in `<Link href={getEventWebsitePath(event)} />`, so it consumes the vulnerable helper directly.
- [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:198) computes `eventUrl = getEventWebsiteUrl(event)` and uses it for the event-name `<Link>` on the category page.
- [lib/api/events.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:6) defines `id` and `slug` as required `string` fields, while `bookingUrl`, `booking_url`, `url`, `mainEntityOfPage`, and `potentialAction` are optional. In typed code, the problematic state is more likely empty strings or whitespace than true `undefined` values for `id` and `slug`.

## Existing Category Filtering Pattern (from EventBookingButton)

- [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:36) already contains a concrete normalization pattern the rest of the stack does not share.
- It trims the candidate URL, parses it against the current origin, and rejects non-`http(s)` protocols.
- It computes the canonical event page with [getEventWebsiteUrl()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:49) and rejects booking URLs that resolve to that same event page.
- It rejects same-origin URLs whose normalized pathname is in `CATEGORY_PAGE_PATHS` at [lines 55-60](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:55).
- It also compares against raw `event.url` at [lines 62-86](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:62) and rejects booking URLs that are effectively just the API event URL again.
- Only after those checks does it allow the explicit URL through. If both `bookingUrl` and `offers?.url` are rejected or absent, it falls back to `buildInternalEventBookingUrl()` at [lines 94-98](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:94).
- This pattern is local to the booking CTA. Neither [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:1) nor [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:1) reuse it today.

## Data Flow: event.url -> getEventWebsitePath -> consumers

- Source field: [Event.url](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:87) is declared on the shared `Event` interface as the event page URL field coming from API data.
- Resolver entrypoint: [getEventWebsitePath()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:31) checks `slug`, then `id`, then falls through to [resolvePathFromUrl(event.url)](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:42).
- Wrapper: [getEventWebsiteUrl()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:49) is just `getEventWebsitePath()` plus optional origin prefixing.
- Direct `getEventWebsitePath()` consumers found in code:
  - [components/events/RelatedEvents.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/RelatedEvents.tsx:54)
  - [app/sitemap.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/sitemap.ts:253)
- Indirect consumers through `getEventWebsiteUrl()` found in code:
  - Category pages: [app/quiz-night/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/quiz-night/page.tsx:198), [app/cash-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/cash-bingo/page.tsx:181), [app/live-music/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/live-music/page.tsx:195), [app/music-bingo/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/music-bingo/page.tsx:199), [app/open-mic/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/open-mic/page.tsx:130), [app/karaoke/page.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/app/karaoke/page.tsx:177)
  - Share actions: [components/events/EventSecondaryActions.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/events/EventSecondaryActions.tsx:21)
  - Structured data: [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:9)
  - Calendar exports: [lib/event-calendar.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:143), [line 160](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:160), [line 198](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:198)
  - Booking button comparison logic only: [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:49)
- Practical consequence: if `slug` and `id` are blank and `event.url` is a category path, the leak reaches event-name links, related-event cards, share URLs, sitemap URLs, JSON-LD `url` and `@id`, and the “More info” URL embedded in Google Calendar and ICS exports.

## Import/Dependency Risks (circular imports?)

- Current graph is acyclic from the inspected files:
  - [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:1) only has a type import from the `@/lib/api` barrel.
  - [lib/structured-data/event-schema.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:1) imports `Event`, `getEventWebsiteUrl`, and schema/status helpers.
  - [lib/event-seo-strategy.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-seo-strategy.ts:1) imports only `Event` types and [lib/event-lifecycle.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-lifecycle.ts:1).
  - [components/EventBookingButton.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:5) already depends on both `event-url` and `event-seo-strategy`.
- I found no existing import from `event-seo-strategy.ts` back into `event-url.ts`, and no inspected file imports `event-schema.ts` back into either helper.
- If the spec adds `event-url.ts -> CATEGORY_ROUTES` from `event-seo-strategy.ts`, that still looks acyclic today.
- The real risk is layering, not an immediate circular import. `event-url.ts` is currently a low-level URL helper; importing `CATEGORY_ROUTES` will make it depend on a higher-level SEO module. If that is acceptable, it should still work. If the team wants a cleaner boundary, move `CATEGORY_ROUTES` into a smaller shared module and let both helpers import from there.
- Secondary hygiene risk: [lib/event-url.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:1) type-imports `Event` from the `@/lib/api` barrel rather than `@/lib/api/events`. That is harmless at runtime today because it is type-only, but narrowing it would reduce future coupling if the file gains more runtime imports.

## Test Coverage for these files

- [tests/unit/EventBookingButton.test.tsx](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/tests/unit/EventBookingButton.test.tsx:36) covers:
  - explicit external `bookingUrl`
  - `offers.url` fallback
  - internal `/events/{slug}` fallback
  - rejection of booking URLs that equal the event page
  - Mother’s Day override behavior
- It does not cover same-origin category page URLs, raw `event.url` category URLs, blank `slug` and `id`, or the interaction between category filtering and `getEventWebsiteUrl()`.
- [tests/unit/event-schema.test.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/tests/unit/event-schema.test.ts:11) only covers:
  - default `ReserveAction`
  - passthrough of a provided `potentialAction`
- It does not cover `eventUrl`, `bookingUrl`, `mainEntityOfPage`, category-path sanitization, malformed URLs, or fallback behavior.
- `rg` searches found no direct tests for `getEventWebsitePath`, `getEventWebsiteUrl`, `resolvePathFromUrl`, `CATEGORY_ROUTES`, `RelatedEvents`, the `quiz-night` page links, or `app/sitemap.ts` event URL mapping.
- I also found no direct tests for [lib/event-calendar.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:141), even though it inherits `getEventWebsiteUrl()` behavior.

## Gotchas the spec may have missed

- The bug surface is wider than category pages. By code inspection, [resolvePathFromUrl()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:13) will also turn an external absolute URL like `https://tickets.example.com/book/test` into internal path `'/book/test'` because it keeps only `parsed.pathname`. The proposed category-path guard does not address that broader origin problem.
- Bare relative `event.url` strings are also risky. Because `new URL(urlValue, WEBSITE_ORIGIN)` succeeds for plain strings, a value like `'summer-quiz'` resolves to `'/summer-quiz'`, not `'/events/summer-quiz'`. The fallback string-handling branch at [lines 25-28](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-url.ts:25) is effectively bypassed for many malformed-but-parseable inputs.
- The spec’s affected-consumer list misses calendar outputs. [lib/event-calendar.ts](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/event-calendar.ts:141) uses `getEventWebsiteUrl()` for Google Calendar links, ICS `URL:` fields, and “More info” descriptions, so bad `event.url` data propagates there too.
- The typed model does not really represent “missing slug/id” as written in the spec. [Event](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/api/events.ts:6) requires both fields, so fixes and tests should cover empty strings and whitespace, not only `null` or `undefined`.
- Structured-data booking behavior is already inconsistent with the booking button. [EventBookingButton](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/components/EventBookingButton.tsx:110) honors `event.offers?.url`, but [buildEventSchema()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:11) ignores it completely. Even after sanitizing `event.bookingUrl`, schema and UI can still disagree on the booking destination.
- [buildEventSchema()](/Users/peterpitcher/Cursor/OJ-The-Anchor.pub/lib/structured-data/event-schema.ts:122) forwards `mainEntityOfPage` unchanged. If upstream data can contain wrong or category URLs there, the top-level `url` and `@id` may be fixed while `mainEntityOfPage` remains inconsistent.
