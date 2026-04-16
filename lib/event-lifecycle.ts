import type { Event } from '@/lib/api'

export type EventStatus =
  | 'draft'
  | 'scheduled'
  | 'cancelled'
  | 'postponed'
  | 'rescheduled'
  | 'sold_out'
  | 'unknown'

export type EventBookingBlockReason = 'draft' | 'cancelled' | 'bookings_disabled' | 'sold_out' | 'past' | null

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function normalizeEventStatus(event: Pick<Event, 'event_status' | 'eventStatus'>): EventStatus {
  const raw = normalizeText(event.event_status)

  if (raw === 'draft') return 'draft'
  if (raw === 'scheduled') return 'scheduled'
  if (raw === 'cancelled') return 'cancelled'
  if (raw === 'postponed') return 'postponed'
  if (raw === 'rescheduled') return 'rescheduled'
  if (raw === 'sold_out') return 'sold_out'

  const schemaStatus = normalizeText(event.eventStatus)
  if (schemaStatus.includes('cancel')) return 'cancelled'
  if (schemaStatus.includes('postpon')) return 'postponed'
  if (schemaStatus.includes('resched')) return 'rescheduled'
  if (schemaStatus.includes('sold')) return 'sold_out'
  if (schemaStatus.includes('sched')) return 'scheduled'

  return 'unknown'
}

export function isEventInPast(event: Pick<Event, 'startDate'>, now: number = Date.now()): boolean {
  const startMs = Date.parse(event.startDate)
  if (!Number.isFinite(startMs)) return false
  return startMs < now
}

export function getEventBookingBlockReason(
  event: Pick<Event, 'event_status' | 'eventStatus' | 'startDate' | 'bookings_enabled'>,
  now: number = Date.now()
): EventBookingBlockReason {
  const status = normalizeEventStatus(event)
  if (status === 'draft') return 'draft'
  if (status === 'cancelled') return 'cancelled'
  if (event.bookings_enabled === false) return 'bookings_disabled'
  if (status === 'sold_out') return 'sold_out'
  if (isEventInPast(event, now)) return 'past'
  return null
}

export function getEventCanonicalSegment(event: Pick<Event, 'slug' | 'id'>): string {
  const slug = typeof event.slug === 'string' ? event.slug.trim() : ''
  if (slug.length > 0) return slug

  const id = typeof event.id === 'string' ? event.id.trim() : ''
  return id
}

export function getEventStatusLabel(status: EventStatus): string {
  if (status === 'cancelled') return 'Cancelled'
  if (status === 'postponed') return 'Postponed'
  if (status === 'rescheduled') return 'Rescheduled'
  if (status === 'sold_out') return 'Sold out'
  if (status === 'draft') return 'Draft'
  if (status === 'scheduled') return 'Scheduled'
  return 'Scheduled'
}

export function getEventBookingModeLabel(mode: string | null | undefined): string | null {
  const normalized = normalizeText(mode)
  if (!normalized) return null
  if (normalized === 'table') return 'Table bookings'
  if (normalized === 'general') return 'General entry'
  if (normalized === 'mixed') return 'Table + general'
  return mode ? mode : null
}

export function formatClockTime(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const localTimeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (localTimeMatch) {
    const hours = Number.parseInt(localTimeMatch[1] || '0', 10)
    const minutes = Number.parseInt(localTimeMatch[2] || '0', 10)
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return trimmed
    const period = hours >= 12 ? 'pm' : 'am'
    const displayHours = hours % 12 || 12
    if (minutes === 0) return `${displayHours}${period}`
    return `${displayHours}:${String(minutes).padStart(2, '0')}${period}`
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/London'
    })
  }

  return trimmed
}
