# Event Page SEO Optimisation — Design Spec

## Overview

Optimise the event template page on the-anchor.pub to consume the new keyword engine fields from the management tool API, fix 3 SEO bugs, add missing structured data, implement authority-preserving past event handling, add related events for internal linking, and improve Core Web Vitals.

## Goals

1. Consume all keyword engine fields (primary/secondary/local keywords, image alt text, cancellation policy, accessibility notes, social proof fields)
2. Fix 3 SEO bugs (hardcoded eventStatus, past event indexing, generic alt text)
3. Implement authority-preserving event lifecycle (active → recent → redirect/noindex)
4. Add missing structured data (breadcrumbs, venue amenities)
5. Add related events section for internal linking
6. Improve Core Web Vitals (lite YouTube embed, blur placeholders)
7. Handle cancelled event SEO correctly
8. Sync sitemap with event lifecycle

## Non-Goals

- Changes to the management tool (already done in the keyword engine project)
- Changes to the What's On listing page (already has good schema)
- Adding new API endpoints (existing API returns all needed fields)
- Event booking flow changes

---

## 1. Event Interface Updates

### File: `lib/api/events.ts`

Add these fields to the `Event` interface to match what the management tool API now returns:

```typescript
primary_keywords?: string[]
secondary_keywords?: string[]
local_seo_keywords?: string[]
image_alt_text?: string | null
cancellation_policy?: string | null
accessibility_notes?: string | null
previous_event_summary?: string | null
attendance_note?: string | null
```

No API client changes needed — `anchorAPI.getEvent()` already returns `*` from the API which includes these fields.

---

## 2. Bug Fixes

### Bug 1: eventStatus Hardcoded

**File:** `lib/structured-data/event-schema.ts`

**Current:** `eventStatus: 'https://schema.org/EventScheduled'` (hardcoded)

**Fix:** Map `event.event_status` (or normalised status) to Schema.org values:

| event_status | Schema.org |
|-------------|------------|
| `scheduled` | `https://schema.org/EventScheduled` |
| `cancelled` | `https://schema.org/EventCancelled` |
| `postponed` | `https://schema.org/EventPostponed` |
| `rescheduled` | `https://schema.org/EventRescheduled` |
| `sold_out` | `https://schema.org/EventScheduled` |
| (past event) | `https://schema.org/EventScheduled` |

Use the existing `normalizeEventStatus()` from `lib/event-lifecycle.ts` to get the status, then map.

**Also fix `offers.availability`** — currently derived only from `remainingAttendeeCapacity === 0`. Add status-based mapping:

| event_status | offers.availability |
|-------------|-------------------|
| `cancelled` | `https://schema.org/Discontinued` |
| `postponed` | `https://schema.org/PreOrder` |
| `sold_out` | `https://schema.org/SoldOut` |
| `scheduled` | Derive from capacity (existing logic) |
| `rescheduled` | Derive from capacity (existing logic) |

### Bug 2: Past Events Fully Indexed

**File:** `app/events/[id]/page.tsx` (in `generateMetadata`)

**Current:** All events are indexed regardless of date.

**Fix:** Implement a three-stage event lifecycle with authority preservation:

**Stage 1 — Active** (future date):
- Full indexing, all SEO signals active
- No changes needed

**Stage 2 — Recently past** (0-30 days after event date):
- Keep indexed — users search for reviews, photos
- Add banner: "This event has ended. See upcoming events →"
- `previous_event_summary` and `attendance_note` fields displayed as social proof
- Canonical stays on this page

**Stage 3 — Stale past** (30+ days after event date — configurable via `PAST_EVENT_REDIRECT_DAYS` constant, default 30):
- **Recurring events** (same category has a future event): `301 redirect` to the next upcoming instance of the same category. All earned authority flows to the fresh page. If no upcoming instance, redirect to the category's top-level page (see Category URL Mapping below).
- **One-off events** (no future event in same category): `noindex, follow`. Keep page live. Internal links to category page and What's On pass equity upward.
- **Events with no category:** Always `noindex, follow` — no redirect (can't determine a meaningful target).

**Cancelled events** (any age):
- Keep indexed for 7 days after cancellation (people search "is [event] cancelled")
- After 7 days: `noindex, follow`
- Don't redirect — the cancellation notice has SEO value
- Remove from sitemap after 7 days
- Set `offers.availability` to `https://schema.org/Discontinued`

**Category URL Mapping:** The site uses top-level category pages, NOT `/whats-on/[category]`:

| Category | URL |
|----------|-----|
| Quiz Night | `/quiz-night` |
| Cash Bingo | `/cash-bingo` |
| Music Bingo | `/music-bingo` |
| Karaoke | `/karaoke` |
| Live Music | `/live-music` |
| Open Mic | `/open-mic` |
| (fallback) | `/whats-on` |

A `getCategoryPageUrl(categorySlug: string): string` helper maps category slugs to their top-level routes, falling back to `/whats-on` for unknown categories.

**Implementation:** A helper function `getEventSeoStrategy(event, upcomingEvents)` returns `{ index: boolean, redirect?: string }`. The redirect lookup uses the existing `anchorAPI.getEvents({ category_id, from_date, limit: 1 })` to find the next event in the same category.

**Redirect safety:** The API client silently returns synthetic/fallback events when the real API is down. The redirect lookup **must** reject fallback data:
- Check if the returned event has a synthetic/fallback ID or marker
- If the API call fails or returns fallback data, skip the redirect entirely
- Fall back to rendering the current page with `noindex, follow`
- **Never issue a 301 based on fallback/synthetic data** — permanent redirects are cached by browsers and CDNs and are extremely hard to undo

**Authority preservation rationale:** Recurring events compound authority — every past quiz night redirects to the next one, stacking all backlinks onto the current page. One-off events pass equity to listing pages via `follow` directive. No authority is ever destroyed.

### Bug 3: Generic Image Alt Text

**Files:** `app/events/[id]/page.tsx` (mobile + desktop hero images)

**Current:** `alt={event.name}` (e.g. "Quiz Night")

**Fix:** Use the AI-generated `image_alt_text` with a descriptive fallback:

```typescript
const imageAlt = event.image_alt_text || `${event.name} - ${event.category?.name || 'Event'} at The Anchor, Stanwell Moor`
```

Apply to:
- Mobile hero image
- Desktop hero image
- Any gallery/video thumbnails

---

## 3. Keyword Field Consumption

### Metadata Keywords

**File:** `app/events/[id]/page.tsx` (in `generateMetadata`)

Add `keywords` to the Metadata return:

```typescript
keywords: [
  ...(event.primary_keywords || []),
  ...(event.secondary_keywords || []),
  ...(event.local_seo_keywords || [])
].join(', ') || undefined
```

### OG Title Enhancement

Ensure OG title uses `metaTitle` (which has keywords baked in by AI) rather than raw `event.name`:

```typescript
openGraph: {
  title: event.metaTitle || event.name,
  ...
}
```

### Schema.org Keywords

Already handled — the management tool populates the flat `keywords` field as the union of all three tiers, and `eventToSchema` already uses `event.keywords?.join(', ')`.

---

## 4. New Content Sections

### Social Proof Block

**Placement:** Above "About This Event" section. Only rendered when either field has content.

**Fields:** `previous_event_summary`, `attendance_note`

**Rendering:**
```
Last time: 12 teams battled it out with Team Brainwave taking the £50 prize.
Over 200 people attended last month.
```

Small text block with subtle styling — not a full card. Particularly valuable for Stage 2 lifecycle events.

### Cancellation Policy

**Placement:** Below the booking CTA, before the Location section. Rendered as a small info block, not a full H2 section.

**Rendering:**
```
ℹ Cancellation Policy
Tickets are non-refundable but may be transferred...
```

Only shown when `event.cancellation_policy` is non-empty. Also feeds Schema.org `refundPolicy` (already in management tool schema output).

### Accessibility Notes

**Placement:** Within or adjacent to the Location section. Rendered as an info block.

**Rendering:**
```
♿ Accessibility
Step-free access to the main bar area...
```

Only shown when `event.accessibility_notes` is non-empty. Also feeds Schema.org `accessibilityFeature` (already in management tool schema output).

---

## 5. Structured Data Additions

### Breadcrumb Enhancement

The existing `Breadcrumbs` component (rendered via `HeroWrapper`) already generates both visual breadcrumbs and `BreadcrumbList` JSON-LD. No new file needed. Just add the category level to the breadcrumb data passed to `HeroWrapper`:

**Current:**
```typescript
breadcrumbs={[
  { name: "What's On", href: '/whats-on' },
  { name: event.name }
]}
```

**Updated:**
```typescript
breadcrumbs={[
  { name: "What's On", href: '/whats-on' },
  ...(event.category ? [{ name: event.category.name, href: getCategoryPageUrl(event.category.slug) }] : []),
  { name: event.name }
]}
```

This adds a category breadcrumb (e.g. "Home > What's On > Quiz Night > Quiz Night 6 May") with a link to the actual category page (using the `getCategoryPageUrl` helper from the lifecycle section). Omitted when event has no category.

### Venue Schema Enhancement

**File:** `lib/structured-data/event-schema.ts`

Enrich the `location` Place object with venue constants:

```typescript
location: {
  '@type': 'Place',
  name: 'The Anchor',
  address: { ... },  // existing
  geo: { ... },      // existing
  telephone: '01753 682707',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Dog Friendly', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Car Park', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Garden', value: true }
  ],
  hasMap: 'https://maps.google.com/?q=The+Anchor+Stanwell+Moor'
}
```

These are venue constants — hardcoded is appropriate for a single-venue site. Reuse existing venue data from `lib/constants.ts` and `lib/schema-with-reviews.ts` where available to avoid duplication with the `/whats-on` page's `EventVenue` schema.

### eventStatus Fix

Already covered in Section 2, Bug 1.

---

## 6. Related Events (Internal Linking)

### New Component: `RelatedEvents`

**File:** `components/events/RelatedEvents.tsx`

Server component that renders up to 3 related upcoming event cards.

**Selection logic:**
1. Fetch upcoming events from the same category (exclude current event)
2. If fewer than 3 results, backfill with any upcoming events (exclude current event and already-selected)
3. Maximum 3 cards displayed

**Card content:**
- Event image (with proper alt text)
- Event name (linked)
- Date
- Category badge
- Price (free / £X)

**Section heading:** "More Events at The Anchor"

**No-category fallback:** When `event.category` is null, skip category-based filtering and fetch any upcoming events. Backfill logic handles this naturally.

**Additional contextual links:**
- "View all [category name] events →" link after the About section — links to `getCategoryPageUrl(event.category.slug)`. Omitted when no category.
- "See what's on this week →" link in the CTA section — always links to `/whats-on`

**Data source:** `anchorAPI.getEvents({ category_id, from_date: today, limit: 4 })` called server-side. Use the existing `getUpcomingEventsByCategory()` helper from `lib/api/events.ts`. Filter out the current event to get max 3. Follow the existing `UpcomingEvents` component pattern — wrap in its own server component with `try/catch` so API failures don't break the page.

### SEO Value

- Internal links spread authority between event pages
- Category-based linking creates topical clusters
- Each link is a crawl path for Google
- Reduces bounce rate

---

## 7. Performance & Cache

### YouTube Lite Embed

**Current:** Raw `<iframe>` for YouTube videos loads ~800KB of JS.

**Fix:** Create a `LiteYouTube` component that:
1. Renders a thumbnail image with a play button overlay
2. Only loads the YouTube iframe when the user clicks play
3. Zero external dependencies — custom implementation

**Safety requirements:**
- Parse URLs with `new URL()` — no substring matching
- Allowlist YouTube hostnames: `youtube.com`, `www.youtube.com`, `youtu.be`, `www.youtube-nocookie.com`
- Validate video ID is exactly 11 characters matching `/^[a-zA-Z0-9_-]{11}$/`
- Thumbnail URL: `https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg`
- Fall back to `hqdefault.jpg` if `maxresdefault.jpg` fails (not all videos have max resolution)
- Add `title` attribute to the iframe when loaded (accessibility)
- If URL doesn't pass validation, fall back to a plain link (not an iframe)

This significantly improves LCP and TTI on pages with promo videos.

### Cache Strategy

The existing API-level caching (`revalidate: 300` in the API client) is already appropriate and doesn't need changing. Route-level `revalidate` cannot be set dynamically per-event in Next.js, so the spec does not attempt it.

The event lifecycle strategy (301 redirects for stale recurring events, noindex for one-offs) handles stale content without needing route-level cache changes. The 300-second API revalidation ensures upcoming events show near-real-time capacity/availability data.

### Image Blur Placeholder

Add `placeholder="blur"` with a generated `blurDataURL` to the hero image. Use a tiny base64-encoded colour swatch derived from the event's category colour:

```typescript
const blurDataURL = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="${event.category?.color || '#1a1a2e'}" width="1" height="1"/></svg>`
)}`
```

This provides instant visual feedback while the real image loads, improving perceived LCP.

---

## 8. File Map

### Modified Files

| File | Changes |
|------|---------|
| `lib/api/events.ts` | Add 8 new fields to Event interface |
| `app/events/[id]/page.tsx` | Metadata keywords + robots, OG title, past event lifecycle, image alt, new content sections, breadcrumb category, related events, blur placeholder |
| `lib/structured-data/event-schema.ts` | Fix eventStatus mapping, offers.availability mapping, venue amenities, telephone, hasMap, accessibilityFeature, refundPolicy |
| `app/sitemap.ts` | Exclude stale past events (30+ days) and cancelled events (7+ days) |

### New Files

| File | Purpose |
|------|---------|
| `components/events/RelatedEvents.tsx` | Related events section (server component with try/catch) |
| `components/events/LiteYouTube.tsx` | Lightweight YouTube embed with URL validation (client component) |
| `lib/event-seo-strategy.ts` | Event lifecycle + redirect helper (getEventSeoStrategy, getCategoryPageUrl) |

---

## 9. Migration & Rollout

All changes are additive. No database changes. No API changes. No breaking changes.

1. Update Event interface (8 new fields)
2. Create event SEO strategy helper (lifecycle, category URL mapping, redirect safety)
3. Fix schema bugs (eventStatus mapping, offers.availability mapping)
4. Fix image alt text (use image_alt_text field)
5. Add event lifecycle to page (noindex for stale/cancelled, 301 redirects for recurring)
6. Add keyword consumption to metadata (keywords meta, OG title)
7. Add new content sections (social proof, cancellation policy, accessibility notes)
8. Enhance structured data (breadcrumb category, venue amenities)
9. Add related events component
10. Add LiteYouTube component
11. Update sitemap (exclude stale past and cancelled events)
12. Add image blur placeholders
13. Test with Google Rich Results Test and PageSpeed Insights
