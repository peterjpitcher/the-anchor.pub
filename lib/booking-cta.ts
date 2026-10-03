import { getEventRemainingCapacity, type EventCapacitySource, type Event } from '@/lib/api/events'
import { getEventPresentation } from '@/lib/event-presentation'

/**
 * The `?source=` every "Book a table" on /lunch-and-dinner sends, so a booking
 * can be traced back to the paid-ads landing page.
 *
 * Never put "sunday" in this: the booking form reads any source containing it
 * as a Sunday roast booking.
 */
export const LUNCH_DINNER_BOOKING_SOURCE = 'lunch_dinner_lp'

/**
 * Where "Book a table" goes from /lunch-and-dinner: straight to the form on
 * the booking page, past its hero, which on a phone pushed the form below the
 * first screen. The query has to come before the `#` fragment, or the browser
 * reads it as part of the fragment and the source is lost.
 *
 * Shared by the page's hero and footer buttons and by the sticky bar below, so
 * all three count as the same source. It lives here, not with the page's own
 * helpers, because the sticky bar loads on every page and should not pull the
 * landing page's code in with it.
 */
export const LUNCH_DINNER_BOOKING_HREF = `/book-table?source=${LUNCH_DINNER_BOOKING_SOURCE}#booking-form`

export type BookingCta =
  | { kind: 'table'; label: 'Book a table' }
  | {
      kind: 'link'
      label: string
      href: string
      /**
       * A link into the booking page. The sticky bar copies the ad tags on the
       * current address onto it when it is followed, as BookTableButton does,
       * so the booking can be traced to the ad. Left off every other link.
       */
      carryAttribution?: true
    }
  | { kind: 'christmas'; label: 'Christmas enquiry' }

export function resolveBookingCta(pathname: string): BookingCta {
  const path = pathname.replace(/\/$/, '')
  if (path === '/christmas-parties') return { kind: 'christmas', label: 'Christmas enquiry' }
  // The paid-ads landing page. The generic quick-book sheet took its bookings
  // without the landing page source, so they could not be told apart from any
  // other. Its sticky "Book a table" goes to the same place as the page's own
  // buttons: straight to the form, tagged as coming from this page.
  if (path === '/lunch-and-dinner') {
    return { kind: 'link', label: 'Book a table', href: LUNCH_DINNER_BOOKING_HREF, carryAttribution: true }
  }
  if (path === '/live-sport/nations-championship') return { kind: 'link', label: 'Choose a game', href: '#fixtures' }
  // A route alone cannot establish that an event is still on sale. Its page
  // supplies the live action after resolving the same state as its booking form.
  if (/^\/events\/[^/]+$/.test(path)) return { kind: 'link', label: 'View upcoming dates', href: '/whats-on' }
  if (['/quiz-night', '/cash-bingo', '/music-bingo', '/karaoke'].includes(path)) {
    return { kind: 'link', label: 'View upcoming dates', href: '#book' }
  }
  // The events hub lists every upcoming night on the page itself. Falling
  // through to "Book a table" offered the dining quick-book to people who had
  // come to pick a night.
  if (path === '/whats-on') return { kind: 'link', label: 'View upcoming dates', href: '#upcoming-events' }
  // The themed quiz page lists its own nights; "Book a table" sent people to
  // the dining quick-book instead.
  if (path === '/quiz-night/themed') return { kind: 'link', label: 'View themed quiz dates', href: '#themed-dates' }
  if (path === '/private-hire' || path.startsWith('/private-hire/')) {
    return { kind: 'link', label: 'Enquire about your date', href: path === '/private-hire' || path === '/private-hire/wakes' ? '#enquiry' : '/private-hire#enquiry' }
  }
  return { kind: 'table', label: 'Book a table' }
}

export function resolveEventBookingCta(
  event: Parameters<typeof getEventPresentation>[0] & EventCapacitySource & Pick<Event, 'offers' | 'is_full'>,
  now: number = Date.now()
): Extract<BookingCta, { kind: 'link' }> {
  return getEventPresentation(event, now).showBookingForm &&
    getEventRemainingCapacity(event) !== 0 && event.is_full !== true && event.offers?.availability !== 'https://schema.org/SoldOut'
    ? { kind: 'link', label: 'Reserve seats', href: '#event-booking' }
    : { kind: 'link', label: 'View upcoming dates', href: '/whats-on' }
}
