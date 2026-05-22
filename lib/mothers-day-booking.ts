import type { Event } from '@/lib/api'

export const MOTHERS_DAY_SERVICE_DATE = '2026-03-15'
export const MOTHERS_DAY_PAGE_PATH = '/mothers-day'
export const MOTHERS_DAY_BOOKING_CTA_LABEL = 'Book Mother’s Day Sunday Roast'
export const MOTHERS_DAY_DEFAULT_TIME = '12:30'

const MOTHERS_DAY_MATCHER = /mother'?s day|mothering sunday/i

type MothersDayEventLike = Pick<
  Event,
  | 'startDate'
  | 'name'
  | 'shortDescription'
  | 'description'
  | 'about'
  | 'slug'
  | 'identifier'
  | 'keywords'
  | 'time'
>

function toLondonDate(value: string | null | undefined): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(parsed)
}

function normalizeTime(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5)
  return undefined
}

function toPositiveInteger(value: number | null | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const rounded = Math.floor(value)
  return rounded > 0 ? rounded : undefined
}

function buildOptionalBookingQuery(options?: {
  partySize?: number | null
  time?: string | null
}): URLSearchParams {
  const params = new URLSearchParams()

  const partySize = toPositiveInteger(options?.partySize)
  if (partySize) {
    params.set('party_size', String(Math.min(partySize, 50)))
  }

  const time = normalizeTime(options?.time)
  if (time) {
    params.set('time', time)
  }

  return params
}

export function isMothersDayDate(value: string | null | undefined): boolean {
  return toLondonDate(value) === MOTHERS_DAY_SERVICE_DATE
}

export function isMothersDayEvent(event: Partial<MothersDayEventLike> | null | undefined): boolean {
  if (!event) return false
  if (!isMothersDayDate(event.startDate || null)) return false

  const haystack = [
    event.name,
    event.shortDescription,
    event.description,
    event.about,
    event.slug,
    event.identifier,
    event.keywords
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return MOTHERS_DAY_MATCHER.test(haystack)
}

export function getMothersDayEventStartTime(event: Pick<MothersDayEventLike, 'startDate' | 'time'>): string | undefined {
  const directTime = normalizeTime(event.time)
  if (directTime) return directTime

  const parsed = new Date(event.startDate)
  if (Number.isNaN(parsed.getTime())) return undefined

  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(parsed)

  return normalizeTime(formatted)
}

export function buildMothersDayBookingUrl(options?: {
  partySize?: number | null
  time?: string | null
}): string {
  const params = new URLSearchParams({
    date: MOTHERS_DAY_SERVICE_DATE,
    purpose: 'food',
    sunday_lunch: 'true',
    mothers_day: 'true'
  })

  const optionalParams = buildOptionalBookingQuery(options)
  optionalParams.forEach((value, key) => {
    params.set(key, value)
  })

  return `/book-table?${params.toString()}`
}

export function buildMothersDayLandingUrl(options?: {
  partySize?: number | null
  time?: string | null
}): string {
  const params = buildOptionalBookingQuery(options)
  const query = params.toString()

  if (query) {
    return `${MOTHERS_DAY_PAGE_PATH}?${query}`
  }

  return MOTHERS_DAY_PAGE_PATH
}
