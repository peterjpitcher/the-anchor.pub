# Category URL Leakage Fix — Design Spec

**Date:** 2026-04-12
**Status:** Revised (post adversarial review)
**Depends on:** 78572c1 (booking button fix, already shipped)
**Adversarial review:** `tasks/codex-qa-review/2026-04-12-category-url-leakage-adversarial-review.md`

## Problem

After the booking button fix (78572c1), events can still link to category pages (`/quiz-night`, `/cash-bingo`, etc.) instead of event detail pages (`/events/[slug]`) through multiple remaining code paths. The booking button is fixed, but the centralised URL generator and structured data are not.

Additionally, `resolvePathFromUrl()` has a broader bug: it strips the origin from ANY URL, turning external URLs (e.g. `https://tickets.example.com/event/123`) into bogus internal paths (`/event/123`). The fix must address this class of problem, not just the category page subset.

## Root Causes

### RC1: `getEventWebsitePath()` falls through to `event.url` without validation

**File:** `lib/event-url.ts:31-47`

The function has a 3-step priority chain: slug -> id -> event.url. If the management API returns an event with empty-string slug AND id (`slug: '', id: ''`), and `event.url` is set to any non-event URL, `resolvePathFromUrl()` extracts the pathname and returns it as the event path.

Note: `Event.slug` and `Event.id` are typed as required `string` in the TypeScript interface (`lib/api/events.ts:7-8`). The realistic failure mode is empty strings (`''`), not `null`/`undefined`. The existing code handles this correctly — `event.slug?.trim()` returns `''` which is falsy, falling through to the next check.

**Affected consumers (all automatically protected once `getEventWebsitePath` is fixed):**
- Category pages: `quiz-night/page.tsx:198`, `cash-bingo/page.tsx:181`, `live-music/page.tsx:195`, `music-bingo/page.tsx:199`, `open-mic/page.tsx:130`, `karaoke/page.tsx:177` — event name links
- `components/events/RelatedEvents.tsx:54` — entire card wraps a Link
- `components/events/EventSecondaryActions.tsx:21` — share URL
- `app/sitemap.ts:253` — sitemap URLs
- `lib/structured-data/event-schema.ts:9` — Schema.org `url` and `@id`
- `lib/event-calendar.ts:143, :160, :198` — Google Calendar links, ICS `URL:` fields, and "More info" descriptions

### RC2: Schema.org structured data uses raw `event.bookingUrl` without filtering

**File:** `lib/structured-data/event-schema.ts:11`

```typescript
const bookingUrl = event.bookingUrl || eventUrl
```

If the management API sets `bookingUrl` to a category page URL, it goes directly into Schema.org `offers.url`. Google uses this to power "Book" action links in search results. The EventBookingButton was fixed to reject these, but the structured data was not.

Additionally, `event.offers?.url` is ignored entirely by the schema builder, even though `EventBookingButton` checks it as a fallback. This creates an inconsistency: the booking button may resolve to a legitimate external booking URL from `offers.url`, while Schema.org shows the event page URL instead.

### RC3: Schema.org passes through `event.potentialAction` and `event.mainEntityOfPage` without validation

**File:** `lib/structured-data/event-schema.ts:122-123`

Both `event.mainEntityOfPage` (line 122) and `event.potentialAction` (line 123) pass straight into JSON-LD unfiltered. If the management API sets `potentialAction.target.urlTemplate` or `mainEntityOfPage['@id']` to category page URLs, they appear in structured data.

### RC4: `resolvePathFromUrl()` strips origin from any URL without validation

**File:** `lib/event-url.ts:13-29`

`resolvePathFromUrl()` uses `new URL(urlValue, WEBSITE_ORIGIN)` which succeeds for any string. It returns `.pathname` regardless of origin. Examples of bad outputs:
- `https://tickets.example.com/event/123` → `/event/123` (external URL becomes bogus internal path)
- `https://www.the-anchor.pub/quiz-night` → `/quiz-night` (category page)
- `https://www.the-anchor.pub/whats-on` → `/whats-on` (listing page, not in CATEGORY_ROUTES)
- `summer-quiz` (bare string) → `/summer-quiz` (treated as root-level path via URL base resolution)

A blocklist of category pages would only catch 6 of these. An allowlist (require `/events/` prefix) catches all of them.

### RC5: Inconsistent URL generation across components

Some components use the centralised `getEventWebsitePath()` (vulnerable), while others use the hardcoded template `` `/events/${event.slug || event.id}` `` (always correct). The same event can link differently depending on where it appears on the site.

## Design

### Principle: fix at the source with an allowlist, not a blocklist

The adversarial review identified that a blocklist approach (rejecting known category paths) is fundamentally insufficient. `resolvePathFromUrl()` can produce bogus paths from external URLs, `/whats-on`, bare strings, and future category pages not yet in `CATEGORY_ROUTES`.

Instead, we use a **positive allowlist**: the resolved path must start with `/events/` and contain a segment after the prefix. Any other path is rejected. This:
- Catches all category pages (current and future)
- Catches external URLs turned into internal paths
- Catches `/whats-on` and other non-event pages
- Catches bare strings resolved to root-level paths
- Requires zero imports from domain modules — keeps `event-url.ts` as a pure utility
- Eliminates the CATEGORY_ROUTES sync maintenance burden

### Change 1: Guard `getEventWebsitePath()` with an allowlist

**File:** `lib/event-url.ts`

Replace the `event.url` fallback block:

```typescript
// Before:
if (event.url) {
  return resolvePathFromUrl(event.url)
}

// After:
if (event.url) {
  const resolved = resolvePathFromUrl(event.url)
  // Only accept paths that point to an event detail page.
  // Rejects category pages (/quiz-night), listing pages (/whats-on),
  // external URLs turned into internal paths (/book/test), and bare strings.
  if (resolved.startsWith('/events/') && resolved.length > '/events/'.length) {
    return resolved
  }
  // Fall through to default /events listing page
}
```

**Why this is safe:**
- Only affects the third-priority fallback (slug and id take precedence)
- Uses a positive check (must be an event detail path) rather than a negative check (must not be a category page)
- No new imports required — `event-url.ts` stays a pure utility module
- Falls through to `/events` default, which is the events listing page (acceptable generic fallback)

**No dependency direction inversion:** Unlike the original blocklist approach, this does not require importing `CATEGORY_ROUTES` from `event-seo-strategy.ts`, avoiding the coupling concern raised in the architecture review.

### Change 2: Filter booking URLs in Schema.org structured data

**File:** `lib/structured-data/event-schema.ts`

Add a module-level constant and helper:

```typescript
import { CATEGORY_ROUTES } from '@/lib/event-seo-strategy'

const SITE_ORIGIN = 'https://www.the-anchor.pub'
const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))

function sanitiseSchemaUrl(
  rawUrl: string | null | undefined,
  fallbackUrl: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl

  const trimmed = rawUrl.trim()
  if (!trimmed) return fallbackUrl

  try {
    const parsed = new URL(trimmed, SITE_ORIGIN)
    const normalisedPath = parsed.pathname.replace(/\/+$/, '')

    // Reject same-origin category page URLs
    if (parsed.origin === SITE_ORIGIN && CATEGORY_PAGE_PATHS.has(normalisedPath)) {
      return fallbackUrl
    }

    return trimmed
  } catch {
    return fallbackUrl
  }
}
```

Replace the booking URL resolution to match `EventBookingButton` behaviour (check both `bookingUrl` and `offers.url`):

```typescript
// Before (line 11):
const bookingUrl = event.bookingUrl || eventUrl

// After:
const bookingUrl =
  sanitiseSchemaUrl(event.bookingUrl, null) ??
  sanitiseSchemaUrl(event.offers?.url, null) ??
  eventUrl
```

Note: `sanitiseSchemaUrl` returns `string`, but when used in the chain above, the `null` fallback parameter means "if invalid, try the next source". Adjust overload or use a separate helper that returns `string | null` for the chaining case.

### Change 3: Validate `potentialAction` and `mainEntityOfPage` in Schema.org structured data

**File:** `lib/structured-data/event-schema.ts`

**potentialAction** — validate `urlTemplate`:

```typescript
function sanitisePotentialAction(
  action: Event['potentialAction'] | undefined
): Event['potentialAction'] | null {
  if (!action?.target?.urlTemplate) return action ?? null

  try {
    const parsed = new URL(action.target.urlTemplate, SITE_ORIGIN)
    const normalisedPath = parsed.pathname.replace(/\/+$/, '')

    if (parsed.origin === SITE_ORIGIN && CATEGORY_PAGE_PATHS.has(normalisedPath)) {
      return null // Fall through to default action
    }

    return action
  } catch {
    return action
  }
}
```

**mainEntityOfPage** — validate `@id`:

```typescript
function sanitiseMainEntityOfPage(
  mainEntity: Event['mainEntityOfPage'] | undefined,
  eventUrl: string
): Record<string, string> | undefined {
  if (!mainEntity) return undefined

  const id = mainEntity['@id']
  if (!id) return mainEntity

  try {
    const parsed = new URL(id, SITE_ORIGIN)
    const normalisedPath = parsed.pathname.replace(/\/+$/, '')

    if (parsed.origin === SITE_ORIGIN && CATEGORY_PAGE_PATHS.has(normalisedPath)) {
      return { '@type': 'WebPage', '@id': eventUrl }
    }

    return mainEntity
  } catch {
    return mainEntity
  }
}
```

Apply both at their passthrough points:

```typescript
// Line 122, replace:
...(event.mainEntityOfPage && { mainEntityOfPage: event.mainEntityOfPage }),

// With:
...(event.mainEntityOfPage && { mainEntityOfPage: sanitiseMainEntityOfPage(event.mainEntityOfPage, eventUrl) }),

// Line 123, replace:
potentialAction: event.potentialAction ?? { ... default ... }

// With:
potentialAction: sanitisePotentialAction(event.potentialAction) ?? { ... default ... }
```

### Change 4 (follow-up): Standardise event URL generation

**Not in primary scope** — document as follow-up.

Several components use the template string `` `/events/${event.slug || event.id}` `` instead of `getEventWebsitePath()`. These happen to be safe because they never touch `event.url`, but the inconsistency is a maintenance risk. A follow-up could standardise all event URL generation to use `getEventWebsitePath()` now that it's properly guarded.

**Files using hardcoded template (no change needed now, but noting for reference):**
- `components/FilteredUpcomingEventsClient.tsx` (lines 222, 247, 314, 339, 446)
- `components/UpcomingEvents.tsx` (lines 42, 45, 81, 134)
- `components/NextEventServer.tsx` (lines 210, 258, 276)
- `components/EventsToday.tsx` (line 15)
- `components/features/BookingWizard/WizardStepPlanVisit.tsx` (line 358)
- `components/features/BookingWizard/WizardStep1Date.tsx` (line 298)
- `app/events/[id]/page.tsx` (line 162)
- `app/valentines-day/page.tsx` (lines 202, 455)

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `lib/event-url.ts` | Allowlist guard on `event.url` fallback in `getEventWebsitePath()` | Low — only affects third-priority fallback; no new imports |
| `lib/structured-data/event-schema.ts` | Sanitise bookingUrl, offers.url, potentialAction, mainEntityOfPage | Low — falls back to correct eventUrl |

## Files NOT Modified (automatically protected by Change 1)

- `components/EventBookingButton.tsx` — already fixed in 78572c1
- Category page files (6 pages) — use `getEventWebsiteUrl()` which calls guarded `getEventWebsitePath()`
- `components/events/RelatedEvents.tsx` — uses `getEventWebsitePath()`
- `components/events/EventSecondaryActions.tsx` — uses `getEventWebsiteUrl()`
- `lib/event-calendar.ts` (lines 143, 160, 198) — uses `getEventWebsiteUrl()`
- `app/sitemap.ts` — uses `getEventWebsitePath()`

## Out of Scope

- Management API data cleanup (separate repo, `OJ-AnchorManagementTools`)
- Standardising all components to use `getEventWebsitePath()` (follow-up, Change 4)
- Changes to category page layouts or content
- Changes to the event detail page routing
- Deduplicating category filtering between `EventBookingButton.tsx` and `event-schema.ts` (follow-up — the booking button's filter serves a different purpose: it determines where the CTA links, while the schema filter sanitises structured data)

## Known Inconsistency (documented, not fixed)

`EventBookingButton` already has its own local category-filtering logic (`CATEGORY_PAGE_PATHS` at line 15). After this fix, category filtering exists in two places: `event-url.ts` (allowlist for path generation) and `EventBookingButton.tsx` (blocklist for booking URL validation). These serve different purposes and operate on different inputs, so deduplication is deferred.

## Testing

### Unit tests for `getEventWebsitePath()`
1. Event with slug `'quiz-night-april-2026'` returns `/events/quiz-night-april-2026`
2. Event with `slug: ''`, `id: 'abc123'` returns `/events/abc123`
3. Event with `slug: '', id: ''`, `url: 'https://www.the-anchor.pub/events/quiz-night-april-2026'` returns `/events/quiz-night-april-2026`
4. **Event with `slug: '', id: ''`, `url: 'https://www.the-anchor.pub/quiz-night'` returns `/events`** (category page rejected)
5. **Event with `slug: '', id: ''`, `url: 'https://www.the-anchor.pub/whats-on'` returns `/events`** (/whats-on is not an event path)
6. **Event with `slug: '', id: ''`, `url: 'https://tickets.example.com/event/123'` returns `/events`** (external URL rejected)
7. **Event with `slug: '', id: ''`, `url: 'summer-quiz'` returns `/events`** (bare string resolved to `/summer-quiz`, rejected)
8. **Event with `slug: '', id: ''`, `url: 'https://www.the-anchor.pub/quiz-night/'` returns `/events`** (trailing slash normalised, rejected)
9. Event with slug `'quiz-night'` AND category-page `url` returns `/events/quiz-night` (slug takes priority)
10. Event with `slug: '  ', id: '  '` (whitespace-only) falls through to `event.url` check

### Unit tests for `sanitiseSchemaUrl()`
1. Valid external booking URL `'https://designmynight.com/book/123'` passes through
2. Category page URL `'https://www.the-anchor.pub/quiz-night'` returns fallback
3. `null`/`undefined`/empty `bookingUrl` returns fallback
4. Same-origin non-category URL `'https://www.the-anchor.pub/book-table'` passes through

### Unit tests for `sanitisePotentialAction()`
1. Action with valid external URL passes through
2. Action with category page URL returns `null`
3. `undefined` action returns `null`
4. Action with no `urlTemplate` passes through unchanged

### Unit tests for `sanitiseMainEntityOfPage()`
1. Entity with valid event URL passes through
2. Entity with category page `@id` returns overridden entity with `eventUrl`
3. `undefined` entity returns `undefined`

### Manual verification
- Visit `/quiz-night` page — event cards should link to `/events/[slug]`, not `/quiz-night`
- View page source on an event detail page — Schema.org JSON-LD should not contain category paths in `offers.url`, `potentialAction`, or `mainEntityOfPage`
- Check sitemap.xml — no category page paths in event URLs
- Add event to Google Calendar from event page — calendar link should point to `/events/[slug]`

## Complexity

**Score: 3 (M)** — 2 files modified, focused logic changes, but zero existing test coverage for either function requires scaffolding new test files and fixtures from scratch.
