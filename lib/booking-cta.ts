import { getEventRemainingCapacity, type EventCapacitySource, type Event } from '@/lib/api/events'
import { getEventPresentation } from '@/lib/event-presentation'

export type BookingCta =
  | { kind: 'table'; label: 'Book a table' }
  | { kind: 'link'; label: string; href: string }
  | { kind: 'christmas'; label: 'Christmas enquiry' }

export function resolveBookingCta(pathname: string): BookingCta {
  const path = pathname.replace(/\/$/, '')
  if (path === '/christmas-parties') return { kind: 'christmas', label: 'Christmas enquiry' }
  if (path === '/live-sport/nations-championship') return { kind: 'link', label: 'Choose a game', href: '#fixtures' }
  // A route alone cannot establish that an event is still on sale. Its page
  // supplies the live action after resolving the same state as its booking form.
  if (/^\/events\/[^/]+$/.test(path)) return { kind: 'link', label: 'View upcoming dates', href: '/whats-on' }
  if (['/quiz-night', '/cash-bingo', '/music-bingo'].includes(path)) {
    return { kind: 'link', label: 'View upcoming dates', href: '#book' }
  }
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
