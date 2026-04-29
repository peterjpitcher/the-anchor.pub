# Monthly Highlights — Link to Event Detail Pages

**Date:** 2026-04-12
**Status:** Revised (post adversarial review)
**Related:** Category URL leakage fix (same session)
**Adversarial review:** `tasks/codex-qa-review/2026-04-12-monthly-highlights-adversarial-review.md`

## Problem

On `/whats-on`, the "Monthly Highlights" section (lines 337-389 of `app/whats-on/page.tsx`) has three prominent event cards that link directly to category pages (`/music-bingo`, `/quiz-night`, `/cash-bingo`). These are the first clickable event content users encounter — the actual event listing with correct `/events/*` links is further down the page and only renders when scrolled into view (lazy-rendered via `useInView`).

Users click a Monthly Highlights card expecting to book a specific event but land on a category listing page instead.

## Root Cause

The Monthly Highlights cards are hardcoded `<Link>` elements pointing to static category page routes:

| Line | Current href | Card title |
|------|-------------|------------|
| 344 | `/music-bingo` | Music Bingo with Nikki Manfadge |
| 359 | `/quiz-night` | Quiz Night - Just £3 Entry! |
| 374 | `/cash-bingo` | Cash Prize Bingo |

## Design

### Approach: Reuse already-fetched events data (Option B)

The adversarial review identified that Option A (3 new `getUpcomingEventsByCategory()` calls) has critical problems:
- Category IDs are dynamic UUIDs from the management API, not slugs — hardcoded IDs would match nothing
- Adds 4 unnecessary API calls when the data is already being fetched
- Requires duplicating the `getCategoryIdByLabel` helper (already copy-pasted in 5 files)

**Option B resolves all three issues:** `FilteredUpcomingEvents` already fetches `getUpcomingEvents(24)` which returns all upcoming events across all categories. Each event has a `category` field with `slug`. We lift this fetch into the page component, filter by category slug for the highlights, and pass the events down.

### Change 1: Lift events fetch into page component

**File:** `app/whats-on/page.tsx`

Move the `getUpcomingEvents(24)` call from `FilteredUpcomingEvents` into the `WhatsOnPage` server component. Add it to the existing `Promise.all`:

```typescript
const [openingHoursSpecification, { rating, reviewCount }, upcomingEvents] = await Promise.all([
  getOpeningHoursSpecification(),
  getBusinessStats(),
  getUpcomingEvents(24),
])
```

Add a helper to find the next event by category slug:

```typescript
function findNextEventByCategory(
  events: Event[],
  categorySlug: string
): Event | undefined {
  return events.find(e => e.category?.slug === categorySlug)
}
```

Resolve the three highlight links:

```typescript
const nextMusicBingo = findNextEventByCategory(upcomingEvents, 'music-bingo')
const nextQuizNight = findNextEventByCategory(upcomingEvents, 'quiz-night')
const nextCashBingo = findNextEventByCategory(upcomingEvents, 'cash-bingo')
```

Note: events from `getUpcomingEvents(24)` are already sorted chronologically (filtered by `startMs > nowMs` in `lib/api/events.ts:565`), so `.find()` returns the nearest upcoming event.

**Gotcha — category slug matching:** The `event.category?.slug` values come from the management API. They may not exactly match the website's route slugs. For example, the quiz night category page uses label `{ slug: 'quiz-night-stanwell-moor' }` for API matching. But `event.category.slug` on the event object itself may differ. The implementation should check a few live API responses and potentially match on multiple fields (`category.slug` or `category.name`). A `findNextEventByCategory` that checks both slug and a name keyword is safer:

```typescript
function findNextEventByCategory(
  events: Event[],
  slugMatch: string,
  nameMatch?: string
): Event | undefined {
  return events.find(e => {
    const slug = e.category?.slug?.toLowerCase() ?? ''
    const name = e.category?.name?.toLowerCase() ?? ''
    return slug.includes(slugMatch) || (nameMatch && name.includes(nameMatch))
  })
}

const nextMusicBingo = findNextEventByCategory(upcomingEvents, 'music-bingo', 'music bingo')
const nextQuizNight = findNextEventByCategory(upcomingEvents, 'quiz', 'quiz')
const nextCashBingo = findNextEventByCategory(upcomingEvents, 'bingo', 'bingo night')
```

This is more tolerant of slug variations while still being specific enough to avoid false matches.

### Change 2: Update Monthly Highlights links

**File:** `app/whats-on/page.tsx` (lines 344, 359, 374)

Replace hardcoded category page hrefs with dynamic event detail hrefs, falling back to category page:

```typescript
// Line 344 — Music Bingo card
<Link href={nextMusicBingo ? `/events/${nextMusicBingo.slug || nextMusicBingo.id}` : '/music-bingo'} className="group">

// Line 359 — Quiz Night card
<Link href={nextQuizNight ? `/events/${nextQuizNight.slug || nextQuizNight.id}` : '/quiz-night'} className="group">

// Line 374 — Cash Bingo card
<Link href={nextCashBingo ? `/events/${nextCashBingo.slug || nextCashBingo.id}` : '/cash-bingo'} className="group">
```

### Change 3: Pass events to FilteredUpcomingEvents

**File:** `app/whats-on/page.tsx` and `components/FilteredUpcomingEvents.tsx`

Since the page now fetches events, pass them to `FilteredUpcomingEvents` as a prop to avoid a duplicate fetch:

```typescript
// page.tsx — pass events as prop
<FilteredUpcomingEvents events={upcomingEvents} />
```

Update `FilteredUpcomingEvents` to accept optional pre-fetched events:

```typescript
// FilteredUpcomingEvents.tsx
interface FilteredUpcomingEventsProps {
  events?: Event[]
}

export async function FilteredUpcomingEvents({ events: prefetchedEvents }: FilteredUpcomingEventsProps = {}) {
  try {
    const [events, businessHours] = await Promise.all([
      prefetchedEvents ? Promise.resolve(prefetchedEvents) : getUpcomingEvents(24),
      getBusinessHours()
    ])
    // ... rest unchanged
```

This preserves backward compatibility — if `FilteredUpcomingEvents` is used elsewhere without the prop, it still fetches its own data.

### No changes needed elsewhere

- **Cross-promo links on category pages** — 6 editorial links in "More Things to Do" sections. Intentional navigation, not event booking CTAs.
- **Navigation/footer** — category page links are correct for site-wide nav.
- **Event listing (`FilteredUpcomingEventsClient`)** — works correctly, all event links go to `/events/*`.

## Error Handling

Graceful degradation cascade (no additional error handling needed):
1. If `getUpcomingEvents(24)` fails → caught by existing try/catch at line 60, `upcomingEvents` falls back to `[]`
2. `findNextEventByCategory` returns `undefined` for empty array
3. Monthly Highlights links fall back to category pages (today's behaviour)
4. `FilteredUpcomingEvents` receives empty array, shows error state (existing behaviour)

No regression from today's behaviour in any failure scenario.

## Files Modified

| File | Change | Risk |
|------|--------|------|
| `app/whats-on/page.tsx` | Lift events fetch, add category filter helper, update 3 Link hrefs, pass events prop | Low — falls back to category page if no event found |
| `components/FilteredUpcomingEvents.tsx` | Accept optional `events` prop to avoid duplicate fetch | Low — backward compatible, existing behaviour preserved |

## Out of Scope

- Extracting `getCategoryIdByLabel` to shared utility (not needed with this approach)
- Restructuring page layout (event listing position)
- Adding "Book Now" buttons to Monthly Highlights cards
- Management API data cleanup

## Testing

### Manual verification
1. Visit `/whats-on` — Monthly Highlights cards should link to `/events/*` pages
2. Click each card — should land on event detail page with booking options
3. If no upcoming event exists for a category, card should fall back to category page
4. Scroll to Upcoming Events section — should still render correctly with event cards
5. View source — Monthly Highlights links should be server-rendered (no JS dependency)

### Edge cases
- Category with no upcoming events → card falls back to category page link
- API failure → all cards fall back to category page links (same as today)
- Category slug mismatch → verify `findNextEventByCategory` matches correctly against live data

## Complexity

**Score: 2 (S)** — 2 files modified, focused changes, reuses existing data and patterns.
