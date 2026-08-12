import type { Event } from '@/lib/api'
import {
  formatEventLocalDate,
  formatEventLocalTime,
  getEventLocalDateTimeParts,
  getEventLocalIsoDate
} from '@/lib/event-calendar'
import { getEventPresentation } from '@/lib/event-presentation'
import { normalizeEventStatus } from '@/lib/event-lifecycle'
import { nowInLondonComponents } from '@/lib/time-london'

export type EventSocialCopy = {
  title: string
  description: string
}

const DAY_MS = 86_400_000

function fullEventDate(startDate: string): string {
  return formatEventLocalDate(startDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(',', '')
}

function eventDay(startDate: string): string {
  return formatEventLocalDate(startDate, { weekday: 'long' })
}

function eventDateProximity(startDate: string, now: number): string {
  const eventIsoDate = getEventLocalIsoDate(startDate)
  const eventParts = getEventLocalDateTimeParts(startDate)
  if (!eventIsoDate || !eventParts) return `on ${fullEventDate(startDate)}`

  const londonNow = nowInLondonComponents(new Date(now))
  const todayMs = Date.UTC(londonNow.year, londonNow.month - 1, londonNow.day)
  const eventDateMs = Date.UTC(eventParts.year, eventParts.month - 1, eventParts.day)
  const dayDifference = Math.round((eventDateMs - todayMs) / DAY_MS)

  if (dayDifference === 0) {
    return eventParts.hour >= 17 ? 'tonight' : 'today'
  }

  if (dayDifference === 1) return 'tomorrow'

  const todayWeekday = new Date(todayMs).getUTCDay()
  const daysSinceMonday = (todayWeekday + 6) % 7
  const thisMondayMs = todayMs - daysSinceMonday * DAY_MS
  const nextMondayMs = thisMondayMs + 7 * DAY_MS
  const followingMondayMs = nextMondayMs + 7 * DAY_MS

  if (eventDateMs > todayMs && eventDateMs < nextMondayMs) {
    return `this ${eventDay(startDate)}`
  }

  if (eventDateMs >= nextMondayMs && eventDateMs < followingMondayMs) {
    return `next ${eventDay(startDate)}`
  }

  return `on ${fullEventDate(startDate)}`
}

function eventLeadName(event: Pick<Event, 'name'>): string {
  if (/cowboys\s*&\s*queens/i.test(event.name)) {
    return 'Cowboys & Queens'
  }

  const shortened = event.name
    .replace(/\s*(?:country\s+)?music\s+bingo.*$/i, '')
    .trim()

  return shortened || event.name
}

/** Personal, booking-focused copy for social previews and the native share sheet. */
export function getEventSocialCopy(
  event: Pick<
    Event,
    | 'name'
    | 'brief'
    | 'shortDescription'
    | 'description'
    | 'startDate'
    | 'event_status'
    | 'eventStatus'
    | 'bookings_enabled'
    | 'booking_cutoff_at'
    | 'category'
  >,
  now: number = Date.now()
): EventSocialCopy | null {
  const presentation = getEventPresentation(event, now)
  const status = normalizeEventStatus(event)

  if (!presentation.showBookingForm || status === 'postponed') {
    return null
  }

  const name = event.name.toLowerCase()
  const category = `${event.category?.slug || ''} ${event.category?.name || ''}`.toLowerCase()
  const isMusicBingo = name.includes('music bingo') || category.includes('music bingo')
  const isQuiz = name.includes('quiz') || category.includes('quiz')
  const isKaraoke = name.includes('karaoke') || category.includes('karaoke')
  const dateAndTime = `${eventDateProximity(event.startDate, now)} from ${formatEventLocalTime(event.startDate)}`
  const leadName = eventLeadName(event)

  if (isMusicBingo) {
    return {
      title: 'You’d love this. Shall we go? 🎶',
      description: `${leadName} Music Bingo is at The Anchor ${dateAndTime}. Tap to book our places.`
    }
  }

  if (isQuiz) {
    return {
      title: 'I need you on my Quiz Night team 🧠',
      description: `${event.name} is at The Anchor ${dateAndTime}. Are you in? Tap to book our table.`
    }
  }

  if (isKaraoke) {
    return {
      title: 'We have to do this 🎤',
      description: `${event.name} is at The Anchor ${dateAndTime}. Fancy it? Tap to see the details.`
    }
  }

  return {
    title: 'This made me think of you 👀',
    description: `${event.name} is coming up at The Anchor ${dateAndTime}. Shall we book it?`
  }
}
