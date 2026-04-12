# Event Booking URL Fix — Design Spec

**Date:** 2026-04-12
**Problem:** Clicking "Book Now" on quiz night events (and potentially other category events) sends users to SEO category pages (`/quiz-night`) instead of event detail pages (`/events/[slug]`). The event name in listing cards isn't clickable either, removing another path to the detail page.

**Root cause:** The management API sets `bookingUrl` or `offers.url` to category page URLs. `normalizeBookingUrl()` accepts these because it only filters self-referential URLs (matching the event's own `/events/[slug]` path), not category pages.

## Changes

### 1. Export `CATEGORY_ROUTES` from `lib/event-seo-strategy.ts`
- Change `const CATEGORY_ROUTES` to `export const CATEGORY_ROUTES`
- No logic changes, just visibility

### 2. Reject category page URLs in `normalizeBookingUrl` (`components/EventBookingButton.tsx`)
- After URL parsing, check if the resolved path (on same origin) matches any value in `CATEGORY_ROUTES`
- If it matches, return `null` (invalid), falling through to the default `/events/[slug]`
- External URLs and other same-site paths (e.g. `/book-table`, `/private-hire`) are unaffected

### 3. Make event name clickable in listing cards (`components/FilteredUpcomingEventsClient.tsx`)
- Wrap the `<h3>` event name in the green header with `<Link href={/events/${event.slug || event.id}}>`
- Apply to both mobile and desktop card layouts
- Style: inherit existing text colour, add hover state consistent with the image link

### 4. No changes needed to category pages
- The `normalizeBookingUrl` fix applies globally — all category pages using `EventBookingButton` benefit automatically
- `/quiz-night`, `/cash-bingo`, `/karaoke`, `/live-music`, `/music-bingo`, `/open-mic` are all covered

## Out of scope
- Management API data cleanup (separate repo)
- Changes to the category page layouts or content
- Changes to the event detail page
