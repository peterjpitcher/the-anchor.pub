# Category URL Leakage Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent events from linking to category pages (`/quiz-night`, `/cash-bingo`, etc.) instead of event detail pages (`/events/[slug]`), across all URL generation and Schema.org structured data.

**Architecture:** Two-file fix. (1) Add an allowlist guard to `getEventWebsitePath()` in `lib/event-url.ts` — the resolved `event.url` fallback must start with `/events/` or it's rejected. This protects all 10+ consumers. (2) Sanitise `bookingUrl`, `offers.url`, `potentialAction`, and `mainEntityOfPage` in `lib/structured-data/event-schema.ts` against category page paths using a module-level `CATEGORY_PAGE_PATHS` set.

**Tech Stack:** TypeScript, Jest, Next.js 14 App Router

**Spec:** `docs/superpowers/specs/2026-04-12-category-url-leakage-fix-design.md`

---

### Task 1: Write failing tests for `getEventWebsitePath()` allowlist guard

**Files:**
- Create: `tests/unit/event-url.test.ts`

- [ ] **Step 1: Create the test file with all edge cases**

```typescript
import { getEventWebsitePath, getEventWebsiteUrl } from '@/lib/event-url'

type EventUrlSource = { slug?: string; id?: string; url?: string }

function makeSource(overrides: Partial<EventUrlSource> = {}): EventUrlSource {
  return { slug: '', id: '', url: undefined, ...overrides }
}

describe('getEventWebsitePath', () => {
  // Existing behaviour — regression checks
  it('returns /events/{slug} when slug is present', () => {
    const result = getEventWebsitePath(makeSource({ slug: 'quiz-night-april-2026' }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  it('returns /events/{id} when slug is empty but id is present', () => {
    const result = getEventWebsitePath(makeSource({ id: 'abc123' }))
    expect(result).toBe('/events/abc123')
  })

  it('returns /events/{slug} when slug is present even if url points to category page', () => {
    const result = getEventWebsitePath(makeSource({
      slug: 'quiz-night-april-2026',
      url: 'https://www.the-anchor.pub/quiz-night'
    }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  // event.url fallback — valid event paths accepted
  it('accepts event.url pointing to an event detail page', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/events/quiz-night-april-2026'
    }))
    expect(result).toBe('/events/quiz-night-april-2026')
  })

  // event.url fallback — non-event paths rejected
  it('rejects event.url pointing to a category page', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/quiz-night'
    }))
    expect(result).toBe('/events')
  })

  it('rejects event.url pointing to /whats-on', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/whats-on'
    }))
    expect(result).toBe('/events')
  })

  it('rejects event.url from an external origin', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://tickets.example.com/event/123'
    }))
    expect(result).toBe('/events')
  })

  it('rejects bare string event.url resolved to root-level path', () => {
    const result = getEventWebsitePath(makeSource({ url: 'summer-quiz' }))
    expect(result).toBe('/events')
  })

  it('rejects category page URL with trailing slash', () => {
    const result = getEventWebsitePath(makeSource({
      url: 'https://www.the-anchor.pub/quiz-night/'
    }))
    expect(result).toBe('/events')
  })

  it('falls through to /events when slug, id, and url are all empty', () => {
    const result = getEventWebsitePath(makeSource())
    expect(result).toBe('/events')
  })

  it('treats whitespace-only slug and id as empty', () => {
    const result = getEventWebsitePath(makeSource({
      slug: '   ',
      id: '   ',
      url: 'https://www.the-anchor.pub/events/fallback-event'
    }))
    expect(result).toBe('/events/fallback-event')
  })
})

describe('getEventWebsiteUrl', () => {
  it('returns absolute URL when absolute option is true', () => {
    const result = getEventWebsiteUrl(
      makeSource({ slug: 'test-event' }),
      { absolute: true }
    )
    expect(result).toBe('https://www.the-anchor.pub/events/test-event')
  })

  it('returns relative path by default', () => {
    const result = getEventWebsiteUrl(makeSource({ slug: 'test-event' }))
    expect(result).toBe('/events/test-event')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/unit/event-url.test.ts --no-coverage`

Expected: Tests 5-9 FAIL (category page, /whats-on, external URL, bare string, trailing slash all incorrectly pass through instead of returning `/events`).

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/unit/event-url.test.ts
git commit -m "test: add failing tests for getEventWebsitePath allowlist guard"
```

---

### Task 2: Implement allowlist guard in `getEventWebsitePath()`

**Files:**
- Modify: `lib/event-url.ts:42-44`

- [ ] **Step 1: Add the allowlist guard**

Replace lines 42-44 in `lib/event-url.ts`:

```typescript
// Before:
  if (event.url) {
    return resolvePathFromUrl(event.url)
  }

// After:
  if (event.url) {
    const resolved = resolvePathFromUrl(event.url)
    // Only accept paths that resolve to an event detail page.
    // Rejects category pages (/quiz-night), listing pages (/whats-on),
    // external URLs turned into internal paths, and bare strings.
    if (resolved.startsWith('/events/') && resolved.length > '/events/'.length) {
      return resolved
    }
    // Fall through to default /events listing page
  }
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx jest tests/unit/event-url.test.ts --no-coverage`

Expected: All tests PASS.

- [ ] **Step 3: Run full test suite to check for regressions**

Run: `npm test -- --no-coverage`

Expected: All existing tests PASS. No regressions.

- [ ] **Step 4: Commit**

```bash
git add lib/event-url.ts
git commit -m "fix: guard getEventWebsitePath against non-event URL paths

Only accept event.url fallback values that resolve to /events/* paths.
Rejects category pages, listing pages, external URLs, and bare strings.
Protects all consumers: category pages, RelatedEvents, EventSecondaryActions,
sitemap, structured data, and calendar exports."
```

---

### Task 3: Write failing tests for Schema.org sanitisation

**Files:**
- Modify: `tests/unit/event-schema.test.ts`

- [ ] **Step 1: Add tests for bookingUrl, offers.url, potentialAction, and mainEntityOfPage sanitisation**

Append to `tests/unit/event-schema.test.ts`:

```typescript
import { CATEGORY_ROUTES } from '@/lib/event-seo-strategy'

const categoryPageUrl = `https://www.the-anchor.pub${Object.values(CATEGORY_ROUTES)[0]}`

describe('buildEventSchema — booking URL sanitisation', () => {
  it('uses bookingUrl when it is a valid external URL', () => {
    const event = {
      ...minimalEvent,
      bookingUrl: 'https://designmynight.com/book/123'
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://designmynight.com/book/123')
  })

  it('rejects bookingUrl pointing to a category page and falls back to eventUrl', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      bookingUrl: categoryPageUrl
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).not.toContain(Object.values(CATEGORY_ROUTES)[0])
    expect(schema.offers.url).toContain('/events/')
  })

  it('falls back to offers.url when bookingUrl is null', () => {
    const event = {
      ...minimalEvent,
      bookingUrl: null,
      offers: {
        ...minimalEvent.offers,
        url: 'https://designmynight.com/offers/456'
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://designmynight.com/offers/456')
  })

  it('rejects offers.url pointing to a category page', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      bookingUrl: null,
      offers: {
        ...minimalEvent.offers,
        url: categoryPageUrl
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toContain('/events/')
  })

  it('falls back to eventUrl when both bookingUrl and offers.url are absent', () => {
    const event = {
      ...minimalEvent,
      slug: 'my-event',
      bookingUrl: null,
      offers: { ...minimalEvent.offers, url: undefined }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.offers.url).toBe('https://www.the-anchor.pub/events/my-event')
  })
})

describe('buildEventSchema — potentialAction sanitisation', () => {
  it('rejects potentialAction with category page urlTemplate', () => {
    const event = {
      ...minimalEvent,
      potentialAction: {
        '@type': 'ReserveAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: categoryPageUrl,
          inLanguage: 'en-GB'
        },
        result: { '@type': 'Reservation' as const, name: 'Booking' }
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.potentialAction.target.urlTemplate).not.toContain(
      Object.values(CATEGORY_ROUTES)[0]
    )
  })

  it('preserves potentialAction with valid external URL', () => {
    const event = {
      ...minimalEvent,
      potentialAction: {
        '@type': 'ReserveAction' as const,
        target: {
          '@type': 'EntryPoint' as const,
          urlTemplate: 'https://booking.example.com/reserve',
          inLanguage: 'en-GB'
        },
        result: { '@type': 'Reservation' as const, name: 'Booking' }
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.potentialAction.target.urlTemplate).toBe(
      'https://booking.example.com/reserve'
    )
  })
})

describe('buildEventSchema — mainEntityOfPage sanitisation', () => {
  it('overrides mainEntityOfPage @id when it points to a category page', () => {
    const event = {
      ...minimalEvent,
      slug: 'test-quiz',
      mainEntityOfPage: {
        '@type': 'WebPage' as const,
        '@id': categoryPageUrl
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.mainEntityOfPage['@id']).toContain('/events/')
    expect(schema.mainEntityOfPage['@id']).not.toContain(
      Object.values(CATEGORY_ROUTES)[0]
    )
  })

  it('preserves mainEntityOfPage with valid event URL', () => {
    const event = {
      ...minimalEvent,
      mainEntityOfPage: {
        '@type': 'WebPage' as const,
        '@id': 'https://www.the-anchor.pub/events/test-event'
      }
    }
    const schema = buildEventSchema(event) as any
    expect(schema.mainEntityOfPage['@id']).toBe(
      'https://www.the-anchor.pub/events/test-event'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx jest tests/unit/event-schema.test.ts --no-coverage`

Expected: New tests for category page rejection FAIL. Existing tests still PASS.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/unit/event-schema.test.ts
git commit -m "test: add failing tests for Schema.org URL sanitisation

Cover bookingUrl, offers.url, potentialAction, and mainEntityOfPage
category page filtering in buildEventSchema."
```

---

### Task 4: Implement Schema.org sanitisation helpers

**Files:**
- Modify: `lib/structured-data/event-schema.ts`

- [ ] **Step 1: Add imports and module-level constant**

At the top of `lib/structured-data/event-schema.ts`, add the `CATEGORY_ROUTES` import and constant. The existing imports are:

```typescript
import { Event } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { getEventWebsiteUrl } from '@/lib/event-url'
import { getSchemaEventStatus, getSchemaOfferAvailability } from '@/lib/event-seo-strategy'
import { CONTACT } from '@/lib/constants'
```

Change the `event-seo-strategy` import to also include `CATEGORY_ROUTES`:

```typescript
import { getSchemaEventStatus, getSchemaOfferAvailability, CATEGORY_ROUTES } from '@/lib/event-seo-strategy'
```

Add after the imports:

```typescript
const SITE_ORIGIN = 'https://www.the-anchor.pub'
const CATEGORY_PAGE_PATHS = new Set(Object.values(CATEGORY_ROUTES))
```

- [ ] **Step 2: Add the three sanitisation helpers before `buildEventSchema`**

Insert before the `export function buildEventSchema` line:

```typescript
function isSameOriginCategoryPath(url: URL): boolean {
  if (url.origin !== SITE_ORIGIN) return false
  const normalisedPath = url.pathname.replace(/\/+$/, '')
  return CATEGORY_PAGE_PATHS.has(normalisedPath)
}

function sanitiseSchemaUrl(
  rawUrl: string | null | undefined,
  fallbackUrl: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallbackUrl
  const trimmed = rawUrl.trim()
  if (!trimmed) return fallbackUrl

  try {
    const parsed = new URL(trimmed, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) return fallbackUrl
    return trimmed
  } catch {
    return fallbackUrl
  }
}

function sanitisePotentialAction(
  action: Event['potentialAction'] | undefined
): Event['potentialAction'] | null {
  if (!action?.target?.urlTemplate) return action ?? null

  try {
    const parsed = new URL(action.target.urlTemplate, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) return null
    return action
  } catch {
    return action
  }
}

function sanitiseMainEntityOfPage(
  mainEntity: Event['mainEntityOfPage'] | undefined,
  eventUrl: string
): Event['mainEntityOfPage'] | undefined {
  if (!mainEntity) return undefined
  const id = mainEntity['@id']
  if (!id) return mainEntity

  try {
    const parsed = new URL(id, SITE_ORIGIN)
    if (isSameOriginCategoryPath(parsed)) {
      return { '@type': 'WebPage', '@id': eventUrl }
    }
    return mainEntity
  } catch {
    return mainEntity
  }
}
```

- [ ] **Step 3: Update `buildEventSchema` to use the helpers**

In the `buildEventSchema` function body, make three changes:

**Change A** — Replace the booking URL line (currently line 11):

```typescript
// Before:
const bookingUrl = event.bookingUrl || eventUrl

// After:
const bookingUrl =
  sanitiseSchemaUrl(event.bookingUrl, '') ||
  sanitiseSchemaUrl(event.offers?.url, '') ||
  eventUrl
```

**Change B** — Replace the `mainEntityOfPage` passthrough (currently line 122):

```typescript
// Before:
    ...(event.mainEntityOfPage && { mainEntityOfPage: event.mainEntityOfPage }),

// After:
    ...(event.mainEntityOfPage && { mainEntityOfPage: sanitiseMainEntityOfPage(event.mainEntityOfPage, eventUrl) }),
```

**Change C** — Replace the `potentialAction` passthrough (currently line 123):

```typescript
// Before:
    potentialAction: event.potentialAction ?? {

// After:
    potentialAction: sanitisePotentialAction(event.potentialAction) ?? {
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/unit/event-schema.test.ts --no-coverage`

Expected: All tests PASS (both existing and new).

- [ ] **Step 5: Run full test suite**

Run: `npm test -- --no-coverage`

Expected: All tests PASS. No regressions.

- [ ] **Step 6: Commit**

```bash
git add lib/structured-data/event-schema.ts
git commit -m "fix: sanitise category page URLs in Schema.org structured data

Filter bookingUrl, offers.url, potentialAction urlTemplate, and
mainEntityOfPage @id against known category page paths. Falls back
to computed event URL when a category path is detected.

Also resolves offers.url as a booking URL source, matching the
EventBookingButton resolution chain."
```

---

### Task 5: Run verification pipeline and manual checks

**Files:** None (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`

Expected: Zero errors, zero warnings.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: Clean compilation, no errors.

- [ ] **Step 3: Full test suite**

Run: `npm test`

Expected: All tests pass.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: Successful production build with no errors.

- [ ] **Step 5: Manual verification (dev server)**

Run: `npm run dev`

Check these:
1. Visit `/quiz-night` — event name links should go to `/events/[slug]`, not `/quiz-night`
2. Visit any event detail page — view page source, search for `application/ld+json`. Verify:
   - `offers.url` does not contain `/quiz-night`, `/cash-bingo`, etc.
   - `potentialAction.target.urlTemplate` does not contain category paths
   - `mainEntityOfPage.@id` does not contain category paths
3. Visit `/sitemap.xml` — no event URLs should be category page paths

- [ ] **Step 6: Commit any lint/type fixes if needed, then tag complete**

If all checks pass, no additional commit needed. If lint or type fixes were required, commit them:

```bash
git add -A
git commit -m "chore: fix lint/type issues from category URL leakage fix"
```
