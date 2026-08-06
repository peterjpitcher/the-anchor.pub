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
 * A stale event redirects to its permanent category page, never to the next
 * dated event. Pointing July's music bingo at September's looks like case A
 * (a close replacement) but the destination moves every month: Google
 * consolidates signals onto September's URL, which next month points somewhere
 * else again. A permanent redirect whose target keeps changing never settles.
 * The category page is the stable equivalent, and is exactly the example the
 * URL lifecycle policy gives for case B ("retired event -> category page").
 *
 * @param event - The event to evaluate
 */
export function getEventSeoStrategy(
  event: Pick<Event, 'startDate' | 'event_status' | 'eventStatus' | 'category'>
): EventSeoStrategy {
  const status = normalizeEventStatus(event)
  const isPast = isEventInPast(event)

  // Cancelled events: index for 7 days, then noindex.
  // Note: cancelled events never redirect, the page renders with a cancelled banner.
  if (status === 'cancelled') {
    // We can't reliably know when it was cancelled from the event data,
    // so use the event date as proxy, noindex if event date was >7 days ago.
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

  // Stale past (30+ days): 301 to the permanent category page, or /whats-on
  // when the event has no category. Unconditional, so the destination is
  // deterministic and stable rather than depending on what happens to be
  // scheduled next.
  return {
    index: false,
    redirect: getCategoryPageUrl(event.category?.slug),
    showEndedBanner: true,
    stage: 'stale',
  }
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

