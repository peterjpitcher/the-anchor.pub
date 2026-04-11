# Event Page SEO Optimisation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimise the brand site event template page to consume keyword engine fields, fix SEO bugs, add authority-preserving lifecycle, internal linking, and Core Web Vitals improvements.

**Architecture:** Update the Event interface to include new API fields, then fix schema/metadata bugs, add a lifecycle strategy helper for past event handling, enhance the page with new content sections and related events, and improve performance with lite YouTube embeds and blur placeholders. All changes are in the brand site codebase (`OJ-The-Anchor.pub`), consuming data already provided by the management tool API.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next/image, Schema.org JSON-LD

**Spec:** `docs/superpowers/specs/2026-04-11-event-page-seo-optimisation-design.md`

**Working directory:** `/Users/peterpitcher/Cursor/OJ-The-Anchor.pub`

---

## File Map

### Modified Files

| File | Responsibility |
|------|---------------|
| `lib/api/events.ts` | Add 8 new fields to Event interface |
| `lib/structured-data/event-schema.ts` | Fix eventStatus mapping, offers.availability, venue amenities, accessibilityFeature, refundPolicy |
| `lib/event-lifecycle.ts` | Add getSchemaEventStatus helper |
| `app/events/[id]/page.tsx` | Metadata (keywords, robots, OG title), image alt, breadcrumb category, new content sections, lifecycle handling, blur placeholder, RelatedEvents integration, LiteYouTube integration |
| `app/sitemap.ts` | Exclude stale past and cancelled events |

### New Files

| File | Responsibility |
|------|---------------|
| `lib/event-seo-strategy.ts` | Event lifecycle helper (getEventSeoStrategy, getCategoryPageUrl, PAST_EVENT_REDIRECT_DAYS) |
| `components/events/RelatedEvents.tsx` | Related events section (server component with try/catch) |
| `components/events/LiteYouTube.tsx` | Lightweight YouTube embed with URL validation (client component) |

---

## Task 1: Event Interface Updates

**Files:**
- Modify: `lib/api/events.ts:6-150`

- [ ] **Step 1: Add new fields to Event interface**

In `lib/api/events.ts`, add these fields to the `Event` interface (after the existing `metaDescription` field, around line 94):

```typescript
// SEO Keyword Engine fields
primary_keywords?: string[]
secondary_keywords?: string[]
local_seo_keywords?: string[]
image_alt_text?: string | null
cancellation_policy?: string | null
accessibility_notes?: string | null
previous_event_summary?: string | null
attendance_note?: string | null
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds — these are optional fields, nothing references them yet.

- [ ] **Step 3: Commit**

```bash
git add lib/api/events.ts
git commit -m "feat: add SEO keyword engine fields to Event interface"
```

---

## Task 2: Event SEO Strategy Helper

**Files:**
- Create: `lib/event-seo-strategy.ts`

- [ ] **Step 1: Create the lifecycle and category URL helper**

Create `lib/event-seo-strategy.ts`:

```typescript
import type { Event } from '@/lib/api/events'
import { normalizeEventStatus, isEventInPast } from '@/lib/event-lifecycle'

export const PAST_EVENT_REDIRECT_DAYS = 30
export const CANCELLED_INDEX_DAYS = 7

/**
 * Map category slugs to their actual top-level page routes.
 * The site uses top-level category pages, NOT /whats-on/[category].
 */
const CATEGORY_ROUTES: Record<string, string> = {
  'quiz-night': '/quiz-night',
  'cash-bingo': '/cash-bingo',
  'music-bingo': '/music-bingo',
  'karaoke': '/karaoke',
  'live-music': '/live-music',
  'open-mic': '/open-mic',
}

export function getCategoryPageUrl(categorySlug: string | undefined | null): string {
  if (!categorySlug) return '/whats-on'
  return CATEGORY_ROUTES[categorySlug] || '/whats-on'
}

export interface EventSeoStrategy {
  /** Whether the page should be indexed by search engines */
  index: boolean
  /** If set, 301 redirect to this URL instead of rendering the page */
  redirect?: string
  /** Whether to show the "event ended" banner */
  showEndedBanner: boolean
  /** Stage: active, recent, stale */
  stage: 'active' | 'recent' | 'stale'
}

/**
 * Determine the SEO strategy for an event page based on its lifecycle stage.
 *
 * @param event - The event to evaluate
 * @param nextEventInCategory - The next upcoming event in the same category (if any).
 *   Must NOT be synthetic/fallback data. Pass null if lookup failed or returned fallback.
 */
export function getEventSeoStrategy(
  event: Pick<Event, 'startDate' | 'event_status' | 'eventStatus' | 'category'>,
  nextEventInCategory: Pick<Event, 'slug' | 'id'> | null
): EventSeoStrategy {
  const status = normalizeEventStatus(event)
  const isPast = isEventInPast(event)

  // Cancelled events: index for 7 days, then noindex
  if (status === 'cancelled') {
    // We can't reliably know when it was cancelled from the event data,
    // so use the event date as proxy — noindex if event date was 7+ days ago
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    return {
      index: daysSinceEvent < CANCELLED_INDEX_DAYS,
      showEndedBanner: true,
      stage: 'stale',
    }
  }

  // Active events (future, not cancelled)
  if (!isPast) {
    return { index: true, showEndedBanner: false, stage: 'active' }
  }

  // Recently past (0-30 days)
  const eventDate = Date.parse(event.startDate)
  const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)

  if (daysSinceEvent < PAST_EVENT_REDIRECT_DAYS) {
    return { index: true, showEndedBanner: true, stage: 'recent' }
  }

  // Stale past (30+ days) — redirect if we have a next event, noindex otherwise
  if (nextEventInCategory) {
    const segment = nextEventInCategory.slug || nextEventInCategory.id
    return {
      index: false,
      redirect: `/events/${segment}`,
      showEndedBanner: true,
      stage: 'stale',
    }
  }

  // Stale past, no next event — redirect to category page or whats-on
  if (event.category?.slug) {
    return {
      index: false,
      redirect: getCategoryPageUrl(event.category.slug),
      showEndedBanner: true,
      stage: 'stale',
    }
  }

  // Stale past, no category — noindex, keep page
  return { index: false, showEndedBanner: true, stage: 'stale' }
}

/**
 * Map event status to Schema.org eventStatus URL.
 */
export function getSchemaEventStatus(
  event: Pick<Event, 'event_status' | 'eventStatus'>
): string {
  const status = normalizeEventStatus(event)
  switch (status) {
    case 'cancelled': return 'https://schema.org/EventCancelled'
    case 'postponed': return 'https://schema.org/EventPostponed'
    case 'rescheduled': return 'https://schema.org/EventRescheduled'
    default: return 'https://schema.org/EventScheduled'
  }
}

/**
 * Map event status to Schema.org offers availability URL.
 * Falls back to capacity-based logic for scheduled/rescheduled events.
 */
export function getSchemaOfferAvailability(
  event: Pick<Event, 'event_status' | 'eventStatus' | 'remainingAttendeeCapacity'>
): string {
  const status = normalizeEventStatus(event)
  switch (status) {
    case 'cancelled': return 'https://schema.org/Discontinued'
    case 'postponed': return 'https://schema.org/PreOrder'
    case 'sold_out': return 'https://schema.org/SoldOut'
    default:
      return event.remainingAttendeeCapacity === 0
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock'
  }
}

/**
 * Check if an event appears to be synthetic/fallback data from the API client.
 * Returns true if the event should NOT be trusted for redirect decisions.
 */
export function isFallbackEvent(event: Pick<Event, 'id' | 'name'>): boolean {
  // The API client generates fallback events with specific markers
  return !event.id || event.id === 'fallback' || event.name === 'Upcoming Event'
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/event-seo-strategy.ts
git commit -m "feat: add event SEO strategy helper — lifecycle, category URLs, schema status mapping"
```

---

## Task 3: Fix Event Schema — eventStatus + offers.availability + venue

**Files:**
- Modify: `lib/structured-data/event-schema.ts:6-146`

- [ ] **Step 1: Add imports**

At the top of `lib/structured-data/event-schema.ts`, add:

```typescript
import { getSchemaEventStatus, getSchemaOfferAvailability } from '@/lib/event-seo-strategy'
import { VENUE_PHONE } from '@/lib/constants'
```

Check if `VENUE_PHONE` is exported from constants — if not, use the literal `'01753 682707'`.

- [ ] **Step 2: Fix hardcoded eventStatus**

At line 67, replace:

```typescript
eventStatus: 'https://schema.org/EventScheduled',
```

with:

```typescript
eventStatus: getSchemaEventStatus(event),
```

- [ ] **Step 3: Fix offers.availability**

At lines 31-33, replace the availability logic:

```typescript
availability:
  event.remainingAttendeeCapacity === 0
    ? 'https://schema.org/SoldOut'
    : 'https://schema.org/InStock'
```

with:

```typescript
availability: getSchemaOfferAvailability(event)
```

- [ ] **Step 4: Add venue amenities, telephone, hasMap**

In the `location` object (around line 69-85), add after the existing `geo` property:

```typescript
telephone: '01753 682707',
amenityFeature: [
  { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
  { '@type': 'LocationFeatureSpecification', name: 'Dog Friendly', value: true },
  { '@type': 'LocationFeatureSpecification', name: 'Family Friendly', value: true },
  { '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true },
  { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
  { '@type': 'LocationFeatureSpecification', name: 'Beer Garden', value: true },
],
hasMap: 'https://maps.google.com/?q=The+Anchor+Stanwell+Moor+TW19+6AQ',
```

- [ ] **Step 5: Add accessibilityFeature and refundPolicy**

After the existing schema properties (before the return), add:

```typescript
if (event.accessibility_notes) {
  schema.accessibilityFeature = [event.accessibility_notes]
}

if (event.cancellation_policy) {
  schema.refundPolicy = event.cancellation_policy
}
```

And add `accessibilityFeature?: string[]` and `refundPolicy?: string` to the schema type/interface if one exists.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add lib/structured-data/event-schema.ts
git commit -m "fix: dynamic eventStatus and offers.availability in schema, add venue amenities"
```

---

## Task 4: LiteYouTube Component

**Files:**
- Create: `components/events/LiteYouTube.tsx`

- [ ] **Step 1: Create the component**

Create `components/events/LiteYouTube.tsx`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/

interface LiteYouTubeProps {
  url: string
  title?: string
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return VIDEO_ID_REGEX.test(id) ? id : null
    }

    // youtube.com/watch?v=VIDEO_ID
    const vParam = parsed.searchParams.get('v')
    if (vParam && VIDEO_ID_REGEX.test(vParam)) return vParam

    // youtube.com/embed/VIDEO_ID
    const embedMatch = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]

    return null
  } catch {
    return null
  }
}

export default function LiteYouTube({ url, title = 'Video' }: LiteYouTubeProps) {
  const [activated, setActivated] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const videoId = extractVideoId(url)

  const handleActivate = useCallback(() => {
    setActivated(true)
  }, [])

  // If we can't parse the URL safely, render a plain link
  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        Watch video
      </a>
    )
  }

  const thumbnailUrl = thumbnailError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  if (activated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleActivate}
      className="absolute inset-0 w-full h-full group cursor-pointer bg-black"
      aria-label={`Play ${title}`}
    >
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 640px"
        onError={() => setThumbnailError(true)}
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/events/LiteYouTube.tsx
git commit -m "feat: add LiteYouTube component with URL validation and thumbnail fallback"
```

---

## Task 5: RelatedEvents Component

**Files:**
- Create: `components/events/RelatedEvents.tsx`

- [ ] **Step 1: Create the component**

Create `components/events/RelatedEvents.tsx`:

```typescript
import Link from 'next/link'
import Image from 'next/image'
import type { Event } from '@/lib/api/events'
import { getUpcomingEventsByCategory } from '@/lib/api/events'
import { formatEventDate, formatEventTime } from '@/lib/api/events'
import { getEventWebsitePath } from '@/lib/event-url'
import { anchorAPI } from '@/lib/api/client'

interface RelatedEventsProps {
  currentEventId: string
  categoryId?: string | null
  categorySlug?: string | null
}

export default async function RelatedEvents({ currentEventId, categoryId, categorySlug }: RelatedEventsProps) {
  try {
    let events: Event[] = []

    // Fetch from same category first
    if (categoryId) {
      events = await getUpcomingEventsByCategory(categoryId, 4)
    }

    // Filter out the current event
    events = events.filter(e => e.id !== currentEventId)

    // Backfill if fewer than 3
    if (events.length < 3) {
      const allEvents = await anchorAPI.getUpcomingEvents(6)
      const backfill = allEvents
        .filter(e => e.id !== currentEventId && !events.some(existing => existing.id === e.id))
        .slice(0, 3 - events.length)
      events = [...events, ...backfill]
    }

    // Take max 3
    events = events.slice(0, 3)

    if (events.length === 0) return null

    return (
      <section className="py-12 border-t border-border/50">
        <h2 className="text-2xl font-bold mb-6">More Events at The Anchor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <Link
              key={event.id}
              href={getEventWebsitePath(event)}
              className="group block rounded-xl overflow-hidden border border-border/50 hover:border-border transition-colors"
            >
              {(event.heroImageUrl || event.image?.[0]) && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={event.heroImageUrl || event.image![0]}
                    alt={event.image_alt_text || `${event.name} at The Anchor`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {event.category && (
                    <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-black/60 text-white">
                      {event.category.name}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                  {event.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatEventDate(event.startDate)}
                  {event.startDate && ` at ${formatEventTime(event.startDate)}`}
                </p>
                <p className="text-sm font-medium mt-1">
                  {event.is_free || event.offers?.price === '0' ? 'Free' : event.offers?.price ? `£${event.offers.price}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  } catch {
    // Silently fail — don't break the main event page
    return null
  }
}
```

Note: Check if `formatEventDate`, `formatEventTime`, `getEventWebsitePath`, and `anchorAPI.getUpcomingEvents` exist with those exact names. Read the actual imports used in existing event components (like `UpcomingEvents.tsx`) and match them. Adjust import paths and function names as needed.

- [ ] **Step 2: Commit**

```bash
git add components/events/RelatedEvents.tsx
git commit -m "feat: add RelatedEvents server component with category-based linking"
```

---

## Task 6: Update Event Page — Metadata, Alt Text, Breadcrumbs

**Files:**
- Modify: `app/events/[id]/page.tsx:155-199` (generateMetadata)
- Modify: `app/events/[id]/page.tsx:344-347` (breadcrumbs)
- Modify: `app/events/[id]/page.tsx:369-423` (images)

- [ ] **Step 1: Add imports at top of page**

```typescript
import { getEventSeoStrategy, getCategoryPageUrl, isFallbackEvent } from '@/lib/event-seo-strategy'
import { getUpcomingEventsByCategory } from '@/lib/api/events'
import RelatedEvents from '@/components/events/RelatedEvents'
import LiteYouTube from '@/components/events/LiteYouTube'
```

- [ ] **Step 2: Update generateMetadata — add keywords, robots, OG title**

In `generateMetadata` (line 166), add `keywords` and `robots` to the returned metadata:

```typescript
keywords: [
  ...(event.primary_keywords || []),
  ...(event.secondary_keywords || []),
  ...(event.local_seo_keywords || [])
].join(', ') || undefined,
```

For the `robots` directive, check if the event is past/cancelled:

```typescript
// After fetching the event, determine SEO strategy
const isPast = isEventInPast(event)
const status = normalizeEventStatus(event)
const shouldNoindex = (isPast && /* stale check */ true) || (status === 'cancelled')

// Add to metadata return:
...(shouldNoindex ? { robots: { index: false, follow: true } } : {}),
```

Note: The full lifecycle check requires fetching the next event in category — this is expensive in generateMetadata. For the metadata robots directive, use a simpler check: noindex if event date is 30+ days past OR cancelled 7+ days. The full redirect logic happens in the page component.

Update OG title to use metaTitle:

```typescript
openGraph: {
  title: event.metaTitle || event.name,  // was just event.name
  ...
}
```

- [ ] **Step 3: Fix image alt text**

Create an imageAlt variable near the top of the page component:

```typescript
const imageAlt = event.image_alt_text || `${event.name} - ${event.category?.name || 'Event'} at The Anchor, Stanwell Moor`
```

Replace `alt={event.name}` on both the mobile hero image (line 373) and desktop hero image (line 417) with `alt={imageAlt}`.

- [ ] **Step 4: Add category to breadcrumbs**

Replace the breadcrumb data (lines 344-347):

```typescript
breadcrumbs={[
  { name: "What's On", href: '/whats-on' },
  ...(event.category ? [{ name: event.category.name, href: getCategoryPageUrl(event.category.slug) }] : []),
  { name: event.name }
]}
```

- [ ] **Step 5: Add blur placeholder to hero images**

Add a blurDataURL variable:

```typescript
const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="${event.category?.color || '#1a1a2e'}" width="1" height="1"/></svg>`
).toString('base64')}`
```

Add `placeholder="blur"` and `blurDataURL={blurDataURL}` to both hero Image components.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add app/events/\[id\]/page.tsx
git commit -m "feat: add keywords meta, OG title, image alt text, category breadcrumbs, blur placeholder"
```

---

## Task 7: Update Event Page — Lifecycle Handling

**Files:**
- Modify: `app/events/[id]/page.tsx:201-220`

- [ ] **Step 1: Add lifecycle redirect logic**

After the existing redirect/404 logic (around line 218), add the lifecycle strategy check:

```typescript
// Event lifecycle SEO strategy
const isPast = isEventInPast(event)
if (isPast || normalizeEventStatus(event) === 'cancelled') {
  let nextEvent = null
  if (event.category?.id) {
    try {
      const upcoming = await getUpcomingEventsByCategory(event.category.id, 1)
      const validUpcoming = upcoming.filter(e => !isFallbackEvent(e) && e.id !== id)
      nextEvent = validUpcoming[0] || null
    } catch {
      nextEvent = null // API failure — don't redirect
    }
  }

  const seoStrategy = getEventSeoStrategy(event, nextEvent)

  if (seoStrategy.redirect) {
    permanentRedirect(seoStrategy.redirect)
  }
}
```

Note: `permanentRedirect` is already imported and used in the existing code for slug canonicalisation.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/events/\[id\]/page.tsx
git commit -m "feat: add event lifecycle redirect for stale past events with authority preservation"
```

---

## Task 8: Update Event Page — New Content Sections

**Files:**
- Modify: `app/events/[id]/page.tsx`

- [ ] **Step 1: Add social proof block**

Above the "About This Event" section (before line 547), add:

```tsx
{/* Social Proof */}
{(event.previous_event_summary || event.attendance_note) && (
  <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/50">
    {event.previous_event_summary && (
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Last time:</span> {event.previous_event_summary}
      </p>
    )}
    {event.attendance_note && (
      <p className="text-sm text-muted-foreground mt-1">
        {event.attendance_note}
      </p>
    )}
  </div>
)}
```

- [ ] **Step 2: Add cancellation policy**

Below the booking CTA area (before the Location section, around line 560), add:

```tsx
{/* Cancellation Policy */}
{event.cancellation_policy && (
  <div className="mt-4 p-3 rounded-md bg-muted/20 border border-border/30">
    <p className="text-xs font-medium text-muted-foreground mb-1">Cancellation Policy</p>
    <p className="text-sm text-muted-foreground">{event.cancellation_policy}</p>
  </div>
)}
```

- [ ] **Step 3: Add accessibility notes**

Within or after the Location section (around line 580), add:

```tsx
{/* Accessibility */}
{event.accessibility_notes && (
  <div className="mt-4 p-3 rounded-md bg-muted/20 border border-border/30">
    <p className="text-xs font-medium text-muted-foreground mb-1">Accessibility</p>
    <p className="text-sm text-muted-foreground">{event.accessibility_notes}</p>
  </div>
)}
```

- [ ] **Step 4: Replace YouTube iframes with LiteYouTube**

In the videos section (lines 618-642), replace the YouTube iframe rendering:

```tsx
{videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
  <LiteYouTube url={videoUrl} title={`${event.name} - Video ${index + 1}`} />
) : (
  <video src={videoUrl} controls className="absolute inset-0 w-full h-full" />
)}
```

- [ ] **Step 5: Add RelatedEvents before final CTA**

Before the final CTA section (around line 648), add:

```tsx
{/* Related Events */}
<RelatedEvents
  currentEventId={event.id}
  categoryId={event.category?.id}
  categorySlug={event.category?.slug}
/>
```

- [ ] **Step 6: Add category link after About section**

After the "About This Event" section, add a contextual link:

```tsx
{event.category && (
  <Link
    href={getCategoryPageUrl(event.category.slug)}
    className="inline-flex items-center text-sm text-primary hover:underline mt-4"
  >
    View all {event.category.name} events &rarr;
  </Link>
)}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/events/\[id\]/page.tsx
git commit -m "feat: add social proof, cancellation policy, accessibility, LiteYouTube, related events, category links"
```

---

## Task 9: Update Sitemap

**Files:**
- Modify: `app/sitemap.ts:233-248`

- [ ] **Step 1: Add date-based filtering to sitemap**

Import the constants:

```typescript
import { PAST_EVENT_REDIRECT_DAYS, CANCELLED_INDEX_DAYS } from '@/lib/event-seo-strategy'
```

In the event sitemap mapping (around line 233), add filtering to exclude stale events:

```typescript
const eventSitemap = sitemapEvents
  .filter((event) => event.category?.id !== 'fallback' && event.id !== 'the-anchor-showcase')
  .filter((event) => {
    const eventDate = Date.parse(event.startDate)
    const daysSince = (nowMs - eventDate) / (1000 * 60 * 60 * 24)

    // Exclude stale past events (30+ days old)
    if (daysSince > PAST_EVENT_REDIRECT_DAYS) return false

    // Exclude cancelled events older than 7 days
    const status = event.event_status || event.eventStatus || ''
    const isCancelled = status.toLowerCase().includes('cancelled')
    if (isCancelled && daysSince > CANCELLED_INDEX_DAYS) return false

    return true
  })
  .map((event) => ({
    // ... existing mapping unchanged
  }))
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: exclude stale past and cancelled events from sitemap"
```

---

## Task 10: Full Verification

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: Zero errors.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: Clean compilation.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Successful production build.

- [ ] **Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Navigate to an active upcoming event page
3. Verify: keywords in page source metadata, category breadcrumb, descriptive alt text
4. Verify: social proof block appears if data present
5. Verify: cancellation policy and accessibility sections appear if data present
6. Verify: YouTube videos show thumbnail with play button (not iframe)
7. Verify: Related events section shows 3 cards
8. Verify: Category link appears after About section
9. Verify: Schema.org JSON-LD has correct eventStatus (not hardcoded)
10. Check a past event (if available): verify "event ended" banner and noindex in source
11. Verify: SEO Health indicator on management tool shows improved score

- [ ] **Step 5: Test with Google Rich Results Test**

Run the event page URL through https://search.google.com/test/rich-results to verify structured data is valid.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during verification"
```
