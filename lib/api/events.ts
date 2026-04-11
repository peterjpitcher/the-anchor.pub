// Events domain types and helper functions

import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import { logError } from '@/lib/error-handling'

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
  heroImageUrl?: string | null // Legacy field
  thumbnailImageUrl?: string | null // Legacy field
  posterImageUrl?: string | null // Legacy field
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
  booking_mode?: 'table' | 'general' | 'mixed' | string | null
  payment_mode?: string | null
  price?: number | null
  price_per_seat?: number | null
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
  event_id: string
  capacity: number
  booked: number
  remaining: number
  percentage_full: number
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
      description: 'Hosted nights with special guests (including Nikki Manfadge), plus one-off event evenings. See /whats-on for details.',
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
    },
    {
      id: 'live-music',
      name: 'Live Music',
      slug: 'live-music',
      description: 'Acoustic sets, tribute nights, and live bands.',
      color: '#22c55e',
      icon: '',
      is_active: true,
      default_start_time: '20:00',
      default_capacity: 100,
      event_count: 0
    }
  ],
  meta: {
    total: 3,
    lastUpdated: '2024-01-01T00:00:00.000Z'
  }
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
  // Parse the date string and display in UK timezone
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/London'
  })
}

export function formatEventTime(dateString: string): string {
  let date: Date

  // IMPORTANT: The API returns times like "2025-07-18T19:00+00:00" which are UTC
  // But these events are actually scheduled for local UK time (7pm local, not 7pm UTC)
  // So we need to treat the numeric time as local time, ignoring the timezone offset

  // Extract just the date and time part, ignoring any timezone info
  let cleanDateString = dateString

  // Remove timezone offset (+00:00, -05:00, etc) or Z
  if (dateString.includes('+') || dateString.includes('Z')) {
    cleanDateString = dateString.split('+')[0].split('Z')[0]
  } else if (dateString.includes('-') && dateString.lastIndexOf('-') > 10) {
    // Handle negative offsets (but not the date separators)
    cleanDateString = dateString.substring(0, dateString.lastIndexOf('-'))
  }

  // Parse as local time
  if (cleanDateString.includes('T')) {
    date = new Date(cleanDateString)
  } else {
    // Format like "2024-03-20 19:00:00"
    const isoString = cleanDateString.replace(' ', 'T')
    date = new Date(isoString)
  }

  // Format the time
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12

  // Convert to the desired format (8pm instead of 8:00 pm)
  if (minutes === 0) {
    return `${displayHours}${period}`
  } else {
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`
  }
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

export function isEventSoldOut(event: Event): boolean {
  return event.remainingAttendeeCapacity === 0 ||
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
      return 'Join us for a Nikki Manfadge-hosted night and special entertainment. See /whats-on for the latest details.'
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

// Helper to format door time
export function formatDoorTime(doorTimeString: string | null | undefined): string | null {
  if (!doorTimeString) return null

  // Use the same logic as formatEventTime - strip timezone and treat as local time
  let cleanDateString = doorTimeString

  // Remove timezone offset (+00:00, -05:00, etc) or Z
  if (doorTimeString.includes('+') || doorTimeString.includes('Z')) {
    cleanDateString = doorTimeString.split('+')[0].split('Z')[0]
  } else if (doorTimeString.includes('-') && doorTimeString.lastIndexOf('-') > 10) {
    // Handle negative offsets (but not the date separators)
    cleanDateString = doorTimeString.substring(0, doorTimeString.lastIndexOf('-'))
  }

  // Parse as local time
  let date: Date
  if (cleanDateString.includes('T')) {
    date = new Date(cleanDateString)
  } else {
    // Format like "2024-03-20 19:00:00"
    const isoString = cleanDateString.replace(' ', 'T')
    date = new Date(isoString)
  }

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHours = hours % 12 || 12

  const timeString = minutes === 0
    ? `${displayHours}${period}`
    : `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`

  return 'Doors: ' + timeString
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
  return event.offers?.availability === 'https://schema.org/LimitedAvailability' ||
    (event.remainingAttendeeCapacity !== undefined && event.remainingAttendeeCapacity < 10)
}

// Standalone helpers that use the singleton (imported lazily to avoid circulars)
const MAX_EVENTS_LIMIT = 100

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

    return events.filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
  } catch (error) {
    logError('api-upcoming-events', error, { limit, daysLookahead })
    return createFallbackEventsResponse().events
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

    return events.filter(event => {
      const startMs = Date.parse(event.startDate)
      return Number.isFinite(startMs) && startMs > nowMs
    })
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

    return events.filter(event => {
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
    return response.events || []
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
    return response.categories || []
  } catch (error) {
    logError('api-event-categories', error)
    return []
  }
}
