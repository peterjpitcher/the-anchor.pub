// Events domain types and helper functions

import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { logError } from '@/lib/error-handling'
import { formatEventLocalDate, formatEventLocalTime } from '@/lib/event-calendar'
import { dedupeUpcomingEvents } from '@/lib/event-normalization'
import { RECENT_EVENT_WINDOW_DAYS } from '@/lib/event-seo-strategy'

/**
 * A purchasable ticket type on an event (e.g. Adult / Child / Concession, or
 * Standard / VIP tiers). `price` is the final, post-discount price per seat in
 * GBP. An event only carries multiple entries once the management API is
 * configured for it; most events expose zero or one type and behave as before.
 */
export interface EventTicketType {
  id: string
  name: string
  description?: string | null
  /** Final, post-discount price per seat, in GBP. */
  price: number
  /** Per-type capacity (null/undefined = shares the event pool). */
  capacity?: number | null
  /** Seats still available for this type (null/undefined = unknown). */
  remaining?: number | null
  sort_order: number
}

export interface Event {
  '@type': 'Event'
  id: string
  slug: string
  name: string
  brief?: string | null
  event_type?: string | null
  description: string | null // Short description (same as shortDescription)
  shortDescription?: string | null
  longDescription?: string | null
  highlights?: string[]
  keywords?: string | string[] // Can be string or array
  startDate: string
  endDate?: string | null
  doorTime?: string | null // New field: doors open time
  duration?: string | null // New field: ISO 8601 duration
  about?: string | null // New field: extended description
  eventStatus: string
  event_status?: string // Exposed raw status from API
  date?: string | null
  time?: string | null
  end_time?: string | null
  doors_time?: string | null
  duration_minutes?: number | null
  last_entry_time?: string | null
  eventAttendanceMode: string
  location: {
    '@type': 'Place'
    name: string
    address: {
      '@type': 'PostalAddress'
      streetAddress: string
      addressLocality: string
      addressRegion: string
      postalCode: string
      addressCountry: string
    }
  }
  performer?: {
    '@type': 'MusicGroup' | 'Person' | 'Organization'
    name: string
  }
  offers?: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    validFrom: string
    url?: string
    inventoryLevel?: {
      '@type': 'QuantitativeValue'
      value: number
    }
  }
  image?: string[]
  video?: string[] // New field: event video URLs
  heroImageUrl?: string | null // Legacy field, holds the square
  thumbnailImageUrl?: string | null // Legacy field, holds the square
  posterImageUrl?: string | null // Legacy field, holds the square. Never a print poster
  // Variant artwork. Absent on older API responses, so every consumer falls
  // back. The management API never sends the story or the A4 print poster.
  squareImageUrl?: string | null // 1:1, cards and listings
  landscapeImageUrl?: string | null // 16:9, page heroes
  socialImageUrl?: string | null // 1.91:1, link previews and Facebook covers
  galleryImages?: string[] // Legacy field
  promoVideoUrl?: string | null // Legacy field
  highlightVideos?: string[] // Legacy field
  organizer?: {
    '@type': 'Organization'
    name: string
    url?: string
  }
  isAccessibleForFree?: boolean
  remainingAttendeeCapacity?: number // Available tickets
  maximumAttendeeCapacity?: number // Total capacity
  capacity?: number | null
  seats_remaining?: number | null
  is_full?: boolean
  waitlist_enabled?: boolean
  booking_mode?: 'table' | 'general' | 'mixed' | 'communal' | string | null
  seated_remaining?: number | null
  standing_remaining?: number | null
  total_remaining?: number | null
  payment_mode?: string | null
  price?: number | null
  ticket_price?: number | null
  price_per_seat?: number | null
  online_discount_type?: 'fixed' | 'percent' | string | null
  online_discount_value?: number | null
  // Multiple ticket options. The management API returns snake_case `ticket_types`;
  // `ticketTypes` is the camelCase alias. Read both via `getEventTicketTypes()`.
  ticketTypes?: EventTicketType[] | null
  ticket_types?: EventTicketType[] | null
  is_free?: boolean | null
  bookingUrl?: string | null // External booking link
  booking_url?: string | null
  url?: string // New field: event page URL
  identifier?: string // New field: same as id
  created_at?: string
  updated_at?: string
  performer_name?: string | null
  performer_type?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  // SEO Keyword Engine fields
  primary_keywords?: string[]
  secondary_keywords?: string[]
  local_seo_keywords?: string[]
  image_alt_text?: string | null
  bookings_enabled?: boolean
  // Optional absolute instant (ISO-8601) after which ONLINE ticket sales close.
  // null/undefined = no explicit cutoff (sales open until the event starts).
  booking_cutoff_at?: string | null
  cancellation_policy?: string | null
  accessibility_notes?: string | null
  previous_event_summary?: string | null
  attendance_note?: string | null
  category?: {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
  }
  booking_rules?: {
    max_seats_per_booking: number
    requires_customer_details: boolean
    allows_notes: boolean
    sms_confirmation_enabled: boolean
  }
  custom_messages?: {
    confirmation?: string
    reminder?: string
  }
  mainEntityOfPage?: {
    '@type': 'WebPage'
    '@id': string
  }
  potentialAction?: {
    '@type': 'ReserveAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
      inLanguage: string
    }
    result: {
      '@type': 'Reservation'
      name: string
    }
  }
  faq?: Array<{ // Updated field name from faqPage
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
  faqPage?: { // Keep legacy field for compatibility
    '@type': 'FAQPage'
    mainEntity: Array<{
      '@type': 'Question'
      name: string
      acceptedAnswer: {
        '@type': 'Answer'
        text: string
      }
    }>
  }
  _meta?: {
    lastUpdated: string
  }
}

export interface EventsResponse {
  events: Event[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

// Event availability check
export interface EventAvailability {
  available: boolean
  event_id?: string
  capacity?: number
  booked?: number
  remaining?: number
  percentage_full?: number
  reason?: string
  message?: string
}

// Event categories
export interface EventCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  is_active: boolean
  default_start_time: string
  default_capacity: number
  event_count: number
}

export interface EventCategoriesResponse {
  categories: EventCategory[]
  meta: {
    total: number
    lastUpdated: string
  }
}

export const FALLBACK_EVENT_CATEGORIES: EventCategoriesResponse = {
  categories: [
    {
      id: 'drag-shows',
      name: 'Hosted Nights',
      slug: 'drag-shows',
      description: 'Listed hosted nights and one-off event evenings. Nikki Manfadge currently hosts Music Bingo. See /whats-on for details.',
      color: '#8b5cf6',
      icon: '',
      is_active: true,
      default_start_time: '20:00',
      default_capacity: 120,
      event_count: 0
    },
    {
      id: 'quiz-nights',
      name: 'Quiz Nights',
      slug: 'quiz-nights',
      description: 'Weekly quiz nights with rolling jackpots and prizes.',
      color: '#0ea5e9',
      icon: '',
      is_active: true,
      default_start_time: '19:30',
      default_capacity: 80,
      event_count: 0
    }
    // No live music category. Live music is discontinued in full
    // (docs/SSOT.md §"Live Music, DISCONTINUED", owner-confirmed 11 August
    // 2026). This list is what the site falls back to when the management API
    // is unreachable, so an entry here would advertise the format on exactly
    // the days we cannot check whether anything is actually on.
  ],
  meta: {
    total: 2,
    lastUpdated: '2024-01-01T00:00:00.000Z'
  }
}

const RETIRED_EVENT_CATEGORY_SLUGS = new Set(['open-mic', 'open-mic-night'])
const RETIRED_EVENT_CATEGORY_NAMES = new Set(['open mic', 'open mic night'])

function normalizeRetiredEventToken(value?: string | null): string {
  return value?.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
}

export function isRetiredEventCategory(category?: Pick<EventCategory, 'name' | 'slug'> | null): boolean {
  const slug = category?.slug?.toLowerCase().trim()
  const name = normalizeRetiredEventToken(category?.name)

  return Boolean(
    (slug && (RETIRED_EVENT_CATEGORY_SLUGS.has(slug) || slug.includes('open-mic'))) ||
    (name && (RETIRED_EVENT_CATEGORY_NAMES.has(name) || name.includes('open mic')))
  )
}

export function isRetiredEvent(event: Pick<Event, 'category' | 'slug' | 'name'>): boolean {
  if (isRetiredEventCategory(event.category)) return true

  const slug = event.slug?.toLowerCase().trim()
  const name = normalizeRetiredEventToken(event.name)

  return Boolean(
    (slug && (RETIRED_EVENT_CATEGORY_SLUGS.has(slug) || slug.includes('open-mic'))) ||
    (name && (RETIRED_EVENT_CATEGORY_NAMES.has(name) || name.includes('open mic')))
  )
}

function removeRetiredEvents(events: Event[]): Event[] {
  return events.filter(event => !isRetiredEvent(event))
}

/**
 * Marks an event object as fabricated by the offline fallback rather than
 * fetched from the management database.
 *
 * The fallback exists so a list UI degrades instead of crashing. The problem is
 * that it resolves SUCCESSFULLY, so callers that reasonably assume "no throw
 * means real data" publish it. The sitemap did exactly that: on a network
 * failure it emitted /events/the-anchor-showcase, advertising an event that has
 * never existed, and that URL then permanently redirects when crawled.
 *
 * Any consumer that publishes URLs or makes an indexing decision must check
 * this before trusting the payload.
 */
export const FALLBACK_EVENT_MARKER = '__fallback__' as const

export function isFallbackEvent(event: Pick<Event, 'id'> | { id?: string | null } | null | undefined): boolean {
  return Boolean(event && (event as { [FALLBACK_EVENT_MARKER]?: boolean })[FALLBACK_EVENT_MARKER])
}

export function createFallbackEvent(eventId: string): Event {
  const normalizedId = eventId.replace(/\/+$/, '')
  const id = normalizedId || 'the-anchor-event'
  const now = new Date()
  const nextSaturday = new Date(now)
  nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7)
  nextSaturday.setHours(20, 0, 0, 0)

  return {
    '@type': 'Event',
    id,
    slug: id,
    name: 'The Anchor Live Event',
    description: 'Offline placeholder for our live events. Call 01753 682707 for the latest lineup.',
    shortDescription: 'Offline event placeholder.',
    startDate: nextSaturday.toISOString(),
    endDate: null,
    doorTime: '2025-01-01T19:00:00+00:00',
    duration: 'PT3H',
    about: null,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor, Stanwell Moor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    },
    performer: {
      '@type': 'MusicGroup',
      name: 'Resident Entertainers'
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      validFrom: now.toISOString(),
      url: 'https://www.the-anchor.pub/private-hire'
    },
    image: [DEFAULT_EVENT_IMAGE],
    video: [],
    heroImageUrl: DEFAULT_EVENT_IMAGE,
    thumbnailImageUrl: DEFAULT_EVENT_IMAGE,
    posterImageUrl: DEFAULT_EVENT_IMAGE,
    galleryImages: [],
    promoVideoUrl: null,
    highlightVideos: [],
    organizer: {
      '@type': 'Organization',
      name: 'The Anchor'
    },
    isAccessibleForFree: true,
    remainingAttendeeCapacity: 60,
    maximumAttendeeCapacity: 120,
    url: `https://www.the-anchor.pub/events/${id}`,
    identifier: id,
    metaTitle: 'Event at The Anchor',
    metaDescription: 'Join us at The Anchor for live entertainment near Heathrow Airport.',
    category: {
      id: 'fallback',
      name: 'Venue Event',
      slug: 'venue-event',
      color: '#005131',
      icon: ''
    },
    booking_rules: {
      max_seats_per_booking: 6,
      requires_customer_details: true,
      allows_notes: true,
      sms_confirmation_enabled: true
    },
    custom_messages: {},
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.the-anchor.pub/events/${id}`
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.the-anchor.pub/private-hire',
        inLanguage: 'en-GB'
      },
      result: {
        '@type': 'Reservation',
        name: 'Event Reservation'
      }
    },
    faq: [],
    faqPage: undefined
  }
}

export function createFallbackEventsResponse(): EventsResponse {
  const event = createFallbackEvent('the-anchor-showcase')
  Object.defineProperty(event, FALLBACK_EVENT_MARKER, { value: true, enumerable: false })
  return {
    events: [event],
    pagination: {
      total: 1,
      limit: 1,
      offset: 0
    }
  }
}

// Format helpers
export function formatEventDate(dateString: string): string {
  return formatEventLocalDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatEventTime(dateString: string): string {
  return formatEventLocalTime(dateString)
}

export function formatPrice(price: string | number, currency: string = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  })
  return formatter
    .format(typeof price === 'string' ? parseFloat(price) : price)
    .replace(/\u00A0/g, ' ')
}

// A minimal event shape carrying ticket-type data, so helpers can be reused by
// callers that only hold a partial event (booking form, price helpers, etc.).
type EventTicketTypeSource = {
  ticketTypes?: EventTicketType[] | null
  ticket_types?: EventTicketType[] | null
}

function parseTicketTypePrice(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }
  return null
}

/**
 * Normalised, ordered list of active ticket types for an event, reading from
 * either the camelCase `ticketTypes` or the raw snake_case `ticket_types`
 * (whichever the API supplied). Returns `[]` when the event has no types, so
 * existing single-price behaviour is preserved for every current event.
 */
export function getEventTicketTypes(event: EventTicketTypeSource): EventTicketType[] {
  const raw = event.ticketTypes ?? event.ticket_types
  if (!Array.isArray(raw)) return []

  return raw
    .filter((type): type is EventTicketType => {
      if (!type || typeof type !== 'object') return false
      return parseTicketTypePrice((type as EventTicketType).price) !== null
    })
    .map((type) => ({
      ...type,
      price: parseTicketTypePrice(type.price) ?? 0,
      sort_order: typeof type.sort_order === 'number' ? type.sort_order : 0,
    }))
    .sort((a, b) => a.sort_order - b.sort_order)
}

/**
 * True only when the event offers 2+ ticket types whose prices differ — the
 * condition under which the "from £X" / multi-type UI is shown. A single type
 * (or several identically-priced types) keeps the existing single-price path.
 */
export function hasMultipleTicketPrices(event: EventTicketTypeSource): boolean {
  const types = getEventTicketTypes(event)
  if (types.length < 2) return false
  const first = types[0].price
  return types.some((type) => type.price !== first)
}

/** Lowest active ticket-type price, or null when there are none. */
export function getLowestTicketTypePrice(event: EventTicketTypeSource): number | null {
  const types = getEventTicketTypes(event)
  if (types.length === 0) return null
  return types.reduce((min, type) => (type.price < min ? type.price : min), types[0].price)
}

/**
 * Anything that might carry a "places left" number. Values are `unknown`
 * because these arrive straight off the wire in some call sites (the booking
 * page's suggested-events panel reads a raw payload), and each candidate is
 * validated below rather than trusted.
 */
export type EventCapacitySource = {
  total_remaining?: unknown
  seats_remaining?: unknown
  remainingAttendeeCapacity?: unknown
  remaining_attendee_capacity?: unknown
}

/**
 * Places still available on an event, whatever the management API called the
 * field, or null when none of them carry a usable number.
 *
 * Three spellings exist. The capacity snapshot behind /events emits snake_case
 * `total_remaining` and `seats_remaining` (the same number: the snapshot
 * function assigns seats_remaining := total_remaining in both booking modes),
 * while `remainingAttendeeCapacity` is the schema.org spelling. Reading only
 * the schema.org one is how every scarcity readout on the site went quiet when
 * the list response stopped carrying it, so read all of them and depend on no
 * single spelling.
 *
 * lib/event-booking-experience.ts keeps a booking-mode-aware variant for the
 * booking flow itself. The two agree, for the seats_remaining := total_remaining
 * reason above.
 */
export function getEventRemainingCapacity(source: EventCapacitySource): number | null {
  const candidates = [
    source.total_remaining,
    source.seats_remaining,
    source.remainingAttendeeCapacity,
    source.remaining_attendee_capacity
  ]

  for (const candidate of candidates) {
    const parsed = typeof candidate === 'string' ? Number.parseInt(candidate, 10) : candidate
    if (typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed)
    }
  }

  return null
}

export function isEventSoldOut(event: Event): boolean {
  return getEventRemainingCapacity(event) === 0 ||
    event.offers?.availability === 'https://schema.org/SoldOut'
}

export function isEventFree(event: Event): boolean {
  return event.isAccessibleForFree === true ||
    event.offers?.price === '0' ||
    event.offers?.price === '0.00'
}

export function getEventShortDescription(event: Event, maxLength: number = 150): string {
  // Use shortDescription if available
  if (event.shortDescription) {
    return event.shortDescription
  }

  // Otherwise use description
  if (!event.description) {
    // Generate a default description based on event type
    const name = event.name.toLowerCase()
    if (name.includes('drag')) {
      return 'Join us for a listed hosted night or special entertainment. See /whats-on for the latest details.'
    } else if (name.includes('quiz')) {
      return 'Test your knowledge at our popular quiz night. Great prizes to be won!'
    } else if (name.includes('bingo')) {
      return 'Eyes down for a fun-filled bingo session with cash prizes.'
    } else if (name.includes('celebration') || name.includes('party')) {
      return 'Special celebration event - join us for a great time!'
    } else if (name.includes('tasting')) {
      return 'Join us for an exclusive tasting event with expert guidance.'
    } else if (name.includes('roast')) {
      return 'Traditional British Sunday roast with all the trimmings.'
    }
    return `Join us for ${event.name} at The Anchor.`
  }

  // Truncate long descriptions
  if (event.description.length > maxLength) {
    return event.description.substring(0, maxLength).trim() + '...'
  }

  return event.description
}

// Helper to format the arrival time as a bare clock time, e.g. "6:30pm".
// Use this wherever the caller renders its own "Arrive from" label, otherwise the
// label is printed twice.
export function formatDoorClockTime(doorTimeString: string | null | undefined): string | null {
  if (!doorTimeString) return null

  return formatEventLocalTime(doorTimeString)
}

// Helper to format the arrival time as a self-describing label, e.g.
// "Arrive from 6:30pm". Only for standalone use (badges, metadata rows with no
// label of their own).
//
// The label was "Doors: 6:30pm" until 17 August 2026. docs/SSOT.md §10 bans
// "Doors" wording outright: the pub opens at 12pm, hours before any event, so a
// "Doors 6:30pm" badge tells a customer the place is shut until then and costs
// the earlier food trade. The four category pages had already been fixed; this
// was the last place the banned wording still reached a customer, in the hero
// badge strip on every individual event page.
export function formatDoorTime(doorTimeString: string | null | undefined): string | null {
  const clockTime = formatDoorClockTime(doorTimeString)

  return clockTime ? `Arrive from ${clockTime}` : null
}

// Helper to format event duration
export function formatEventDuration(duration: string | null | undefined): string | null {
  if (!duration) return null

  // Parse ISO 8601 duration (e.g., PT3H30M)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return null

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')

  if (hours && minutes) {
    return `${hours}h ${minutes}m`
  } else if (hours) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else if (minutes) {
    return `${minutes} minutes`
  }

  return null
}

// Helper to check if event has limited availability
export function hasLimitedAvailability(event: Event): boolean {
  const remaining = getEventRemainingCapacity(event)
  return event.offers?.availability === 'https://schema.org/LimitedAvailability' ||
    (remaining !== null && remaining < 10)
}

// Standalone helpers that use the singleton (imported lazily to avoid circulars)
const MAX_EVENTS_LIMIT = 100
// Shared with the event page's own "recent" wording. Previously a separate 30
// declared here, which had to agree with the one in event-seo-strategy by hand.
const RECENT_EVENT_DEFAULT_DAYS = RECENT_EVENT_WINDOW_DAYS

export async function getUpcomingEvents(limit: number = 10, daysLookahead?: number): Promise<Event[]> {
  // Import lazily to avoid circular dependency with client.ts
  const { anchorAPI } = await import('./client')
  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_EVENTS_LIMIT)

    const now = new Date()
    const params: {
      from_date: string
      to_date?: string
      limit: number
      status: string
    } = {
      from_date: now.toISOString().split('T')[0],
      limit: safeLimit,
      status: 'scheduled'
    }

    if (typeof daysLookahead === 'number' && Number.isFinite(daysLookahead)) {
      const toDate = new Date(now)
      toDate.setDate(now.getDate() + daysLookahead)
      params.to_date = toDate.toISOString().split('T')[0]
    }

    const response = await anchorAPI.getEvents(params)
    const events = response.events || []
    const nowMs = Date.now()

    return dedupeUpcomingEvents(removeRetiredEvents(events), nowMs)
  } catch (error) {
    logError('api-upcoming-events', error, { limit, daysLookahead })
    // Return empty array on failure, UI components should handle the empty state.
    // Previously this returned a hardcoded fallback event ("the-anchor-showcase")
    // which rendered as a real event on the homepage but produced 404s on
    // calendar link endpoints (e.g. /api/calendar/event/the-anchor-showcase).
    return []
  }
}

export async function getRecentEvents(
  limit: number = 10,
  daysBack: number = RECENT_EVENT_DEFAULT_DAYS
): Promise<Event[]> {
  const { anchorAPI } = await import('./client')
  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_EVENTS_LIMIT)
    const safeDaysBack = Math.min(Math.max(Math.floor(daysBack), 1), 90)
    const fetchLimit = Math.min(Math.max(safeLimit * 3, 20), MAX_EVENTS_LIMIT)

    const now = new Date()
    const fromDate = new Date(now)
    fromDate.setDate(now.getDate() - safeDaysBack)

    const response = await anchorAPI.getEvents({
      from_date: fromDate.toISOString().split('T')[0],
      to_date: now.toISOString().split('T')[0],
      limit: fetchLimit,
      status: 'scheduled,rescheduled,postponed,sold_out,cancelled',
    })

    const nowMs = Date.now()
    const earliestMs = fromDate.getTime()

    return removeRetiredEvents(response.events || [])
      .filter(event => {
        const startMs = Date.parse(event.startDate)
        return Number.isFinite(startMs) && startMs < nowMs && startMs >= earliestMs
      })
      .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
      .slice(0, safeLimit)
  } catch (error) {
    logError('api-recent-events', error, { limit, daysBack })
    return []
  }
}

/**
 * Every past event, newest first, with no day window.
 *
 * getRecentEvents caps daysBack at 90 and is built for the short "recent
 * nights" strip. Past event pages are now kept live and indexed indefinitely,
 * so they need a listing that reaches all of them: without one they are
 * orphans, reachable only from Google, and an orphan page cannot accumulate
 * the authority that keeping it was meant to build. Measured before this
 * existed: 3 of 39 past events were reachable by clicking.
 *
 * Applies the same exclusions as the sitemap, so the archive never links to a
 * page we are telling search engines to ignore.
 */
export async function getPastEvents(limit: number = 200): Promise<Event[]> {
  const { anchorAPI } = await import('./client')
  const { getEventSeoStrategy } = await import('@/lib/event-seo-strategy')
  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 500)
    const collected = new Map<string, Event>()

    // Page backwards through the whole history rather than guessing a window.
    for (let page = 0; page < 5; page += 1) {
      const response = await anchorAPI.getEvents({
        from_date: '2000-01-01',
        limit: MAX_EVENTS_LIMIT,
        offset: page * MAX_EVENTS_LIMIT,
        status: 'scheduled,rescheduled,postponed,sold_out',
      })
      const batch = response.events || []
      for (const event of batch) {
        const key = `${event.id || event.slug || ''}`.trim()
        if (key) collected.set(key, event)
      }
      if (batch.length < MAX_EVENTS_LIMIT) break
    }

    const nowMs = Date.now()
    return removeRetiredEvents(Array.from(collected.values()))
      .filter(event => {
        const startMs = Date.parse(event.startDate)
        return Number.isFinite(startMs) && startMs < nowMs
      })
      .filter(event => getEventSeoStrategy(event).index)
      .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
      .slice(0, safeLimit)
  } catch (error) {
    logError('api-past-events', error, { limit })
    return []
  }
}

export async function getUpcomingEventsByCategory(
  categoryId: string,
  limit: number = 10,
  daysLookahead?: number
): Promise<Event[]> {
  if (!categoryId) return []

  const { anchorAPI } = await import('./client')
  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), MAX_EVENTS_LIMIT)

    const now = new Date()
    const params: {
      from_date: string
      to_date?: string
      limit: number
      status: string
      category_id: string
    } = {
      from_date: now.toISOString().split('T')[0],
      limit: safeLimit,
      status: 'scheduled',
      category_id: categoryId
    }

    if (typeof daysLookahead === 'number' && Number.isFinite(daysLookahead)) {
      const toDate = new Date(now)
      toDate.setDate(now.getDate() + daysLookahead)
      params.to_date = toDate.toISOString().split('T')[0]
    }

    const response = await anchorAPI.getEvents(params)
    const events = response.events || []
    const nowMs = Date.now()

    return dedupeUpcomingEvents(removeRetiredEvents(events), nowMs)
  } catch (error) {
    logError('api-upcoming-events-by-category', error, { categoryId, limit, daysLookahead })
    return []
  }
}

export async function getTodaysEvents(): Promise<Event[]> {
  const { anchorAPI } = await import('./client')
  try {
    const response = await anchorAPI.getTodaysEvents('scheduled')
    const events = response.events || []
    const nowMs = Date.now()

    return removeRetiredEvents(events).filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
  } catch (error) {
    logError('api-todays-events', error)
    return []
  }
}

export async function getEventsByCategory(category: string, limit: number = 20): Promise<Event[]> {
  const { anchorAPI } = await import('./client')
  try {
    const response = await anchorAPI.getEvents({
      category_id: category,
      limit,
    })
    return removeRetiredEvents(response.events || [])
  } catch (error) {
    logError('api-events-by-category', error, { category, limit })
    return []
  }
}

export async function checkEventAvailability(eventId: string, seats: number = 1): Promise<EventAvailability | null> {
  const { anchorAPI } = await import('./client')
  try {
    return await anchorAPI.checkEventAvailability(eventId, seats)
  } catch (error) {
    logError('api-check-availability', error, { eventId, seats })
    return null
  }
}

export async function getEventCategories(): Promise<EventCategory[]> {
  const { anchorAPI } = await import('./client')
  try {
    const response = await anchorAPI.getEventCategories()
    return (response.categories || []).filter(category => !isRetiredEventCategory(category))
  } catch (error) {
    logError('api-event-categories', error)
    return []
  }
}
