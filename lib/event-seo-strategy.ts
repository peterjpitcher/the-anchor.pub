import type { Event } from '@/lib/api/events'
import { normalizeEventStatus, isEventInPast } from '@/lib/event-lifecycle'

/**
 * How long a past event counts as "recent" for presentation purposes: the
 * /whats-on recent archive, and the wording on the event page itself.
 *
 * This is NOT an indexability threshold. Past events stay indexed indefinitely.
 * It was previously named PAST_EVENT_REDIRECT_DAYS, when crossing it retired
 * the page.
 *
 * Single source of truth: lib/api/events.ts imports this rather than declaring
 * its own 30, so the listing window and the page wording cannot drift apart.
 */
export const RECENT_EVENT_WINDOW_DAYS = 30
export const CANCELLED_INDEX_DAYS = 7

/**
 * Formats the SSOT says are discontinued and must not be promoted.
 *
 * Keeping past events indexed is good for formats that still run: each night
 * adds to what the site can rank for. It is not good for a format that has
 * stopped, because the page can start ranking and bring people in for
 * something they cannot come to.
 *
 * docs/SSOT.md §"Nikki's Games Night": "Do not promote Nikki hosted/games
 * nights as a recurring format. Nikki currently hosts Music Bingo only."
 *
 * Open mic is the other retired format, handled separately by isRetiredEvent()
 * because it has a genuine replacement page and 301s to /live-music. A games
 * night has no equivalent, so the page stays live for anyone with the link and
 * is simply kept out of search (policy case E).
 */
const DISCONTINUED_FORMAT_TOKENS = ['games night']

export function isDiscontinuedFormatEvent(
  event: Partial<Pick<Event, 'name' | 'slug'>>
): boolean {
  const haystack = `${event.name ?? ''} ${event.slug ?? ''}`
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
  return DISCONTINUED_FORMAT_TOKENS.some((token) => haystack.includes(token))
}

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
  /** Whether to show the "event ended" banner */
  showEndedBanner: boolean
  /**
   * Presentation stage only. `archived` does not mean retired: the page is
   * still live and still indexed.
   */
  stage: 'active' | 'recent' | 'archived'
}

/**
 * Determine the SEO strategy for an event page based on its lifecycle stage.
 *
 * Past events are kept live and indexed indefinitely. An event page is only
 * live for a couple of months before the night itself, which is not long
 * enough to earn rankings; retiring it at 30 days threw that away every month
 * and the category page had to start from scratch each time. Keeping the URL
 * lets each night accumulate, and the pages are not near-duplicates: every
 * night carries its own theme, name and highlights.
 *
 * The route into the next date is an on-page link, not a redirect. A redirect
 * would delete the very content this policy exists to keep.
 *
 * Cancelled events are the one exception. Nothing happened on the night, so
 * there is no content worth ranking, and they drop out after
 * CANCELLED_INDEX_DAYS.
 *
 * @param event - The event to evaluate
 */
export function getEventSeoStrategy(
  event: Pick<Event, 'startDate' | 'event_status' | 'eventStatus' | 'category'> &
    Partial<Pick<Event, 'name' | 'slug'>>
): EventSeoStrategy {
  const status = normalizeEventStatus(event)
  const isPast = isEventInPast(event)

  // Discontinued formats stay reachable but out of search, whatever their date.
  // Keeping them indexed would rank a night nobody can attend.
  if (isDiscontinuedFormatEvent(event)) {
    return {
      index: false,
      showEndedBanner: isPast,
      stage: isPast ? 'archived' : 'active',
    }
  }

  // Cancelled events: index for 7 days, then noindex. Never redirect, the page
  // renders with a cancelled banner.
  if (status === 'cancelled') {
    // We can't reliably know when it was cancelled from the event data,
    // so use the event date as proxy, noindex if event date was >7 days ago.
    const eventDate = Date.parse(event.startDate)
    const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)
    return {
      index: daysSinceEvent <= CANCELLED_INDEX_DAYS,
      showEndedBanner: true,
      stage: 'archived',
    }
  }

  // Active events (future, not cancelled)
  if (!isPast) {
    return { index: true, showEndedBanner: false, stage: 'active' }
  }

  // Past events stay indexed. `recent` vs `archived` only changes presentation
  // and how prominently the page is surfaced in listings, never indexability.
  const eventDate = Date.parse(event.startDate)
  const daysSinceEvent = (Date.now() - eventDate) / (1000 * 60 * 60 * 24)

  return {
    index: true,
    showEndedBanner: true,
    stage: daysSinceEvent <= RECENT_EVENT_WINDOW_DAYS ? 'recent' : 'archived',
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

