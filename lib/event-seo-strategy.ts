import type { Event } from '@/lib/api/events'
import { normalizeEventStatus, isEventInPast } from '@/lib/event-lifecycle'

export const PAST_EVENT_REDIRECT_DAYS = 30
export const CANCELLED_INDEX_DAYS = 7

/**
 * Map category slugs to their actual top-level page routes.
 * The site uses top-level category pages, NOT /whats-on/[category].
 */
export const CATEGORY_ROUTES: Record<string, string> = {
  'quiz-night': '/quiz-night',
  'cash-bingo': '/cash-bingo',
  'music-bingo': '/music-bingo',
  'karaoke': '/karaoke',
  'live-music': '/live-music',
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

  // Cancelled events: index for 7 days, then noindex.
  // Note: cancelled events never redirect — the page renders with a cancelled banner.
  if (status === 'cancelled') {
    // We can't reliably know when it was cancelled from the event data,
    // so use the event date as proxy — noindex if event date was >7 days ago.
    // Threshold uses `>` to align with generateMetadata() and app/sitemap.ts.
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    return {
      index: daysSinceEvent <= CANCELLED_INDEX_DAYS,
      showEndedBanner: true,
      stage: 'stale',
    }
  }

  // Active events (future, not cancelled)
  if (!isPast) {
    return { index: true, showEndedBanner: false, stage: 'active' }
  }

  // Recently past (0-30 days). Threshold uses `<=` to align with
  // generateMetadata() and app/sitemap.ts which both use `>`.
  const eventDate = Date.parse(event.startDate)
  const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)

  if (daysSinceEvent <= PAST_EVENT_REDIRECT_DAYS) {
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

  // Stale past, no next event — noindex but keep the page visible so users
  // who arrive from event listings can still see event details and book future events.
  // Category pages (/quiz-night, /music-bingo etc.) are standalone SEO assets and
  // should not receive redirects from individual event pages.
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
