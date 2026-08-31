// lib/hero-context.ts
import type { BusinessHours } from '@/lib/api/hours'
import type { Event } from '@/lib/api'
import { getEventDateRangeUtc } from '@/lib/event-calendar'
import { getEffectiveDayHours } from '@/lib/hours-utils'

// --- Types ---

export interface HeroContext {
  isOpen: boolean
  barClosesAt: string | null
  /**
   * Human-friendly label for when the bar will next be open, computed only
   * when isOpen === false. Examples: "today at 4pm", "tomorrow at 12pm",
   * "Friday at 12pm". Null when no upcoming opening can be found within the
   * lookahead window.
   */
  nextOpensLabel: string | null
  kitchenOpen: boolean
  kitchenClosesAt: string | null
  bookingsAccepting: boolean
  todayActiveEvent: Event | null
  nextUpcomingEvent: Event | null
  specialNote: string | null
  sundayLunchAvailable: boolean
}

export type HeroCtaAction =
  | { kind: 'booking'; label: string; source: string }
  | { kind: 'phone'; label: string; phone: string; source: string }
  | { kind: 'event-link'; label: string; href: string; source: string }
  | { kind: 'link'; label: string; href: string; source: string }

// --- Constants ---

export const PHONE_NUMBER = '01753682707'
export const MAX_EVENT_NAME_LENGTH = 20
export const MAX_CTA_LABEL_LENGTH = 30
const LONDON_TZ = 'Europe/London'

// --- Helpers ---

/** Format 24h time string (e.g. "22:00:00") to 12h (e.g. "10pm") */
export function formatTime12h(time: string | null | undefined): string | null {
  if (!time) return null
  const parts = time.split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (Number.isNaN(h)) return null
  const period = h >= 12 ? 'pm' : 'am'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${display}${period}` : `${display}:${m.toString().padStart(2, '0')}${period}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

/** Normalise route to tracking source slug: "/food-menu" → "smart_hero_food_menu" */
export function normaliseRouteToSource(route: string): string {
  const slug = route
    .replace(/^\//, '')
    .replace(/\[.*?\]/g, 'detail')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
  return `smart_hero_${slug || 'home'}`
}

/** Get today's date string in London timezone: "2026-04-26" */
export function getLondonDateStr(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: LONDON_TZ })
}

/** Get London day of week: "sunday", "monday", etc. */
export function getLondonDayName(now: Date): string {
  return now.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TZ }).toLowerCase()
}

// --- Pure Functions ---

/** Filter events to those active today (started or starting, not yet ended). London timezone. */
export function getTodaysActiveEvents(events: Event[], now: Date): Event[] {
  const todayStr = getLondonDateStr(now)

  return events
    .filter(event => {
      const { start, end } = getEventDateRangeUtc(event)
      const eventDateStr = getLondonDateStr(start)
      if (eventDateStr !== todayStr) return false
      return end.getTime() > now.getTime()
    })
    .sort((a, b) => {
      const aStart = getEventDateRangeUtc(a).start.getTime()
      const bStart = getEventDateRangeUtc(b).start.getTime()
      return aStart - bStart
    })
}

/**
 * Pure check: is Sunday roast available right now?
 * Checks day, service status, overrides, schedule_config, and cutoff.
 * All inputs from BusinessHours, no fetch.
 */
export function isSundayLunchAvailableNow(
  businessHours: BusinessHours,
  now: Date
): boolean {
  const dayName = getLondonDayName(now)
  if (dayName !== 'sunday') return false

  // Check service status
  const serviceStatus = businessHours.serviceStatus as Record<string, { isEnabled?: boolean }> | undefined
  if (serviceStatus?.sunday_lunch?.isEnabled === false) return false

  // Check service overrides for today
  const todayStr = getLondonDateStr(now)
  const overrides = businessHours.serviceOverrides as Record<string, Array<{ startDate: string; endDate: string; isEnabled: boolean }>> | undefined
  if (overrides?.sunday_lunch) {
    const todayOverride = overrides.sunday_lunch.find(
      (o) => todayStr >= o.startDate && todayStr <= o.endDate
    )
    if (todayOverride && !todayOverride.isEnabled) return false
  }

  // Get effective schedule_config for today
  const special = businessHours.specialHours?.find(s => s.date === todayStr)
  const scheduleConfig = special
    ? (special.schedule_config || [])
    : (businessHours.regularHours?.sunday?.schedule_config || [])

  // Check for sunday_lunch entry in schedule_config
  const sundayLunchSlots = (scheduleConfig as Array<{ booking_type?: string; slot_type?: string; ends_at?: string }>).filter(
    (s) => s.booking_type === 'sunday_lunch' || s.slot_type === 'sunday_lunch'
  )
  if (sundayLunchSlots.length === 0) return false

  // Check if we're before the last slot's ends_at
  const lastSlotEnd = sundayLunchSlots
    .map((s) => s.ends_at as string)
    .sort()
    .pop()
  if (!lastSlotEnd) return false

  // Parse ends_at as London time today
  const [endH, endM] = lastSlotEnd.split(':').map(Number)
  const londonNow = new Date(now.toLocaleString('en-US', { timeZone: LONDON_TZ }))
  const currentMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()
  const endMinutes = endH * 60 + (endM || 0)

  return currentMinutes < endMinutes
}

/** Add `days` London-calendar days to a YYYY-MM-DD date string. */
function addLondonDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map((p) => parseInt(p, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** Day-of-week label for an offset in days from today. */
function dayLabelForOffset(offset: number, baseDate: string): string {
  if (offset === 0) return 'today'
  if (offset === 1) return 'tomorrow'
  const target = addLondonDays(baseDate, offset)
  const [y, m, d] = target.split('-').map((p) => parseInt(p, 10))
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  return dt.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TZ })
}

/** "HH:MM" → minutes since midnight (London local). */
function parseTimeToMinutes(time: string): number | null {
  const parts = time.split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/**
 * Find the next time the bar will be open, scanning today + the next 6 days.
 * Returns a label like "today at 4pm" / "tomorrow at 12pm" / "Friday at 12pm".
 * Today is included only if its `opens` time is still in the future (London local).
 */
export function findNextBarOpening(
  businessHours: BusinessHours,
  now: Date
): string | null {
  const todayStr = getLondonDateStr(now)

  // London local minutes since midnight
  const londonNow = new Date(now.toLocaleString('en-US', { timeZone: LONDON_TZ }))
  const nowMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()

  for (let offset = 0; offset <= 6; offset += 1) {
    const dateStr = addLondonDays(todayStr, offset)
    const effective = getEffectiveDayHours(
      dateStr,
      businessHours.regularHours || {},
      businessHours.specialHours,
      businessHours.upcomingVersions
    )
    if ((effective as { is_closed?: boolean }).is_closed === true) continue
    const opens = (effective as { opens?: string | null }).opens
    if (!opens) continue
    const opensMinutes = parseTimeToMinutes(opens)
    if (opensMinutes === null) continue
    // Skip today if the opens time has already passed (we'd already be open then,
    // which is contradicted by isOpen === false, but defensively skip).
    if (offset === 0 && opensMinutes <= nowMinutes) continue
    const timeLabel = formatTime12h(opens)
    if (!timeLabel) continue
    const dayLabel = dayLabelForOffset(offset, todayStr)
    return `${dayLabel} at ${timeLabel}`
  }

  return null
}

/**
 * Compute hero display state from BusinessHours + events.
 * Pure function. London timezone. No side effects, no fetches.
 * State (isOpen, kitchenOpen) from currentStatus.
 * Display labels (barClosesAt, kitchenClosesAt) from effective schedule.
 */
export function resolveHeroContext(
  businessHours: BusinessHours | null,
  events: Event[] | null,
  now: Date
): HeroContext {
  if (!businessHours) {
    return {
      isOpen: false,
      barClosesAt: null,
      nextOpensLabel: null,
      kitchenOpen: false,
      kitchenClosesAt: null,
      bookingsAccepting: true,
      todayActiveEvent: null,
      nextUpcomingEvent: null,
      specialNote: null,
      sundayLunchAvailable: false
    }
  }

  const { currentStatus } = businessHours
  const todayStr = getLondonDateStr(now)

  // State from currentStatus (source of truth)
  const isOpen = currentStatus.isOpen
  const kitchenOpen = currentStatus.kitchenOpen

  // Bookings, default true if absent
  const statusAny = currentStatus as Record<string, unknown>
  const services = statusAny.services as Record<string, Record<string, unknown>> | undefined
  const bookingsAccepting =
    (services?.bookings?.accepting as boolean | undefined) ?? true

  // Display labels from effective schedule
  const effective = getEffectiveDayHours(
    todayStr,
    businessHours.regularHours || {},
    businessHours.specialHours,
    businessHours.upcomingVersions
  )
  const barClosesAt = formatTime12h(effective.closes as string | undefined)
  const kitchenClosesAt =
    kitchenOpen && effective.kitchen && 'closes' in effective.kitchen
      ? formatTime12h((effective.kitchen as { closes: string }).closes)
      : null

  // Events
  const todayActive = events ? getTodaysActiveEvents(events, now) : []
  const todayActiveEvent = todayActive[0] || null
  const nextUpcomingEvent = !todayActiveEvent && events?.length
    ? events.find(e => {
        const start = getEventDateRangeUtc(e).start
        return start.getTime() > now.getTime()
      }) || null
    : null

  // Special hours note
  const todaySpecial = businessHours.specialHours?.find(s => s.date === todayStr)
  const specialNote = todaySpecial?.note || null

  // Sunday roast
  const sundayLunchAvailable = isSundayLunchAvailableNow(businessHours, now)

  // Next-opens label, only computed when currently closed, so the hero
  // ContextStrip can replace bare "Closed" with "Closed · Opens at 4pm" etc.
  const nextOpensLabel = isOpen ? null : findNextBarOpening(businessHours, now)

  return {
    isOpen,
    barClosesAt,
    nextOpensLabel,
    kitchenOpen,
    kitchenClosesAt,
    bookingsAccepting,
    todayActiveEvent,
    nextUpcomingEvent,
    specialNote,
    sundayLunchAvailable
  }
}

/**
 * Run priority cascade to determine smart CTA actions.
 * Pure function. Returns discriminated actions for rendering.
 */
export function resolveHeroCtas(
  context: HeroContext,
  route: string,
  now: Date
): { primary: HeroCtaAction; secondary: HeroCtaAction } {
  const source = normaliseRouteToSource(route)

  // P1: Active event today (does NOT check bookingsAccepting)
  if (context.todayActiveEvent) {
    const event = context.todayActiveEvent
    const eventStart = getEventDateRangeUtc(event).start
    const eventEnd = getEventDateRangeUtc(event).end
    const isInProgress = now.getTime() >= eventStart.getTime() && now.getTime() < eventEnd.getTime()

    let label: string
    if (isInProgress) {
      label = `${truncate(event.name, MAX_EVENT_NAME_LENGTH)} On Now`
    } else {
      const startHour = parseInt(eventStart.toLocaleString('en-GB', { hour: 'numeric', timeZone: 'Europe/London' }), 10)
      const isEvening = startHour >= 17
      const timeLabel = isEvening ? 'Tonight' : 'Today'
      label = `Book ${truncate(event.name, MAX_EVENT_NAME_LENGTH)} ${timeLabel}`
    }

    const href = `/events/${event.slug || event.id}`

    return {
      primary: { kind: 'event-link', label: truncate(label, MAX_CTA_LABEL_LENGTH), href, source },
      secondary: { kind: 'phone', label: 'Call Us', phone: PHONE_NUMBER, source }
    }
  }

  // P2: Sunday roast available + bookings accepting
  if (context.sundayLunchAvailable && context.bookingsAccepting) {
    return {
      primary: { kind: 'booking', label: 'Book Sunday Roast', source },
      secondary: { kind: 'link', label: 'View Menu', href: '/sunday-roast', source }
    }
  }

  // P3/P4: Kitchen open
  if (context.kitchenOpen) {
    if (context.bookingsAccepting) {
      return {
        primary: { kind: 'booking', label: 'Book a Table', source },
        secondary: { kind: 'link', label: 'View Menu', href: '/food-menu', source }
      }
    }
    return {
      primary: { kind: 'phone', label: 'Call to Book', phone: PHONE_NUMBER, source },
      secondary: { kind: 'link', label: 'View Menu', href: '/food-menu', source }
    }
  }

  // P5/P6: Bar open, kitchen closed
  if (context.isOpen) {
    if (context.bookingsAccepting) {
      return {
        primary: { kind: 'booking', label: 'Book a Table', source },
        secondary: { kind: 'link', label: 'View Drinks', href: '/drinks', source }
      }
    }
    return {
      primary: { kind: 'phone', label: 'Call Us', phone: PHONE_NUMBER, source },
      secondary: { kind: 'link', label: 'View Drinks', href: '/drinks', source }
    }
  }

  // P7/P8: Closed
  if (context.bookingsAccepting) {
    return {
      primary: { kind: 'booking', label: 'Book a Table', source },
      secondary: { kind: 'link', label: "View What's On", href: '/whats-on', source }
    }
  }
  return {
    primary: { kind: 'phone', label: 'Call to Book', phone: PHONE_NUMBER, source },
    secondary: { kind: 'link', label: "View What's On", href: '/whats-on', source }
  }
}
