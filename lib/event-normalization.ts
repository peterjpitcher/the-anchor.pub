import type { Event } from '@/lib/api/events'
import { getEventDateRangeUtc, formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'
import { getEventCanonicalSegment } from '@/lib/event-lifecycle'

export type AnchorEventType =
  | 'quiz'
  | 'music_bingo'
  | 'cash_bingo'
  | 'live_music'
  | 'karaoke'
  | 'sport'
  | 'other'

function normaliseToken(value?: string | null): string {
  return value?.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
}

export function getEventIdentity(event: Pick<Event, 'id' | 'slug' | 'name' | 'startDate'>): string {
  const id = event.id?.trim()
  if (id) return `id:${id}`

  const slug = event.slug?.trim()
  if (slug) return `slug:${slug}`

  return `fallback:${normaliseToken(event.name)}:${event.startDate}`
}

export function isFutureEvent(event: Pick<Event, 'startDate' | 'endDate' | 'duration'>, now: number = Date.now()): boolean {
  const { start } = getEventDateRangeUtc(event)
  return Number.isFinite(start.getTime()) && start.getTime() >= now
}

export function isBookableEvent(
  event: Pick<Event, 'startDate' | 'endDate' | 'duration' | 'event_status' | 'eventStatus' | 'bookings_enabled'>,
  now: number = Date.now()
): boolean {
  if (!isFutureEvent(event, now)) return false

  const rawStatus = normaliseToken(event.event_status || event.eventStatus)
  if (rawStatus.includes('cancel')) return false
  if (rawStatus.includes('draft')) return false
  if (rawStatus.includes('sold out')) return false

  return event.bookings_enabled !== false
}

export function getEventType(event: Pick<Event, 'name' | 'slug' | 'category'>): AnchorEventType {
  const joined = [
    event.category?.slug,
    event.category?.name,
    event.slug,
    event.name
  ].map(normaliseToken).filter(Boolean).join(' ')

  if (joined.includes('music bingo')) return 'music_bingo'
  if (joined.includes('cash bingo') || (joined.includes('bingo') && !joined.includes('music'))) return 'cash_bingo'
  if (joined.includes('quiz') || joined.includes('trivia')) return 'quiz'
  if (joined.includes('karaoke')) return 'karaoke'
  if (joined.includes('live music') || joined.includes('band') || joined.includes('acoustic')) return 'live_music'
  if (joined.includes('sport') || joined.includes('football') || joined.includes('rugby') || joined.includes('f1')) return 'sport'

  return 'other'
}

export function canonicalEventUrl(event: Pick<Event, 'id' | 'slug'>, absolute = false): string {
  const segment = getEventCanonicalSegment(event)
  const path = `/events/${encodeURIComponent(segment)}`
  return absolute ? `https://www.the-anchor.pub${path}` : path
}

export function displayEventDateTime(event: Pick<Event, 'startDate'>): string {
  return `${formatEventLocalDate(event.startDate)} at ${formatEventLocalTime(event.startDate)}`
}

export function dedupeUpcomingEvents<T extends Event>(events: T[], now: number = Date.now()): T[] {
  const unique = new Map<string, T>()

  for (const event of events) {
    if (!isFutureEvent(event, now)) continue
    const key = getEventIdentity(event)
    if (!unique.has(key)) {
      unique.set(key, event)
    }
  }

  return Array.from(unique.values()).sort((a, b) => {
    return getEventDateRangeUtc(a).start.getTime() - getEventDateRangeUtc(b).start.getTime()
  })
}
