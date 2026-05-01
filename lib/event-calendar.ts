import type { Event } from '@/lib/api'
import { getEventWebsiteUrl } from '@/lib/event-url'

const EVENT_TIME_ZONE = 'Europe/London'
const DEFAULT_EVENT_DURATION_MINUTES = 120

type DateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export function stripEventTimeZoneOffset(value: string): string {
  if (!value) return value

  if (value.includes('+') || value.includes('Z')) {
    return value.split('+')[0].split('Z')[0]
  }

  if (value.includes('-') && value.lastIndexOf('-') > 10) {
    return value.substring(0, value.lastIndexOf('-'))
  }

  return value
}

function parseDateTimeParts(value: string): DateTimeParts | null {
  const clean = stripEventTimeZoneOffset(value).trim()
  if (!clean) return null

  const separator = clean.includes('T') ? 'T' : clean.includes(' ') ? ' ' : null
  if (!separator) return null

  const [datePart, timePartRaw] = clean.split(separator)
  if (!datePart || !timePartRaw) return null

  const [yearStr, monthStr, dayStr] = datePart.split('-')
  const [hourStr, minuteStr, secondStr = '0'] = timePartRaw.split(':')

  const year = Number.parseInt(yearStr, 10)
  const month = Number.parseInt(monthStr, 10)
  const day = Number.parseInt(dayStr, 10)
  const hour = Number.parseInt(hourStr, 10)
  const minute = Number.parseInt(minuteStr, 10)
  const second = Number.parseInt(secondStr, 10)

  const numbers = [year, month, day, hour, minute, second]
  if (numbers.some((num) => !Number.isFinite(num))) return null

  return { year, month, day, hour, minute, second }
}

function getLondonDatePartsFromInstant(value: string): DateTimeParts | null {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(parsed)

  const lookup = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value
  const result = {
    year: Number.parseInt(lookup('year') ?? '', 10),
    month: Number.parseInt(lookup('month') ?? '', 10),
    day: Number.parseInt(lookup('day') ?? '', 10),
    hour: Number.parseInt(lookup('hour') ?? '', 10),
    minute: Number.parseInt(lookup('minute') ?? '', 10),
    second: Number.parseInt(lookup('second') ?? '0', 10)
  }

  return Object.values(result).every((num) => Number.isFinite(num)) ? result : null
}

export function getEventLocalDateTimeParts(value: string): DateTimeParts | null {
  return parseDateTimeParts(value) ?? getLondonDatePartsFromInstant(value)
}

export function getEventLocalIsoDate(value: string): string | null {
  const parts = getEventLocalDateTimeParts(value)
  if (!parts) return null

  return [
    parts.year.toString().padStart(4, '0'),
    parts.month.toString().padStart(2, '0'),
    parts.day.toString().padStart(2, '0')
  ].join('-')
}

export function formatEventLocalDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const parts = getEventLocalDateTimeParts(value)
  if (!parts) return 'Date TBC'

  const localDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0))
  return localDate.toLocaleDateString('en-GB', {
    ...options,
    timeZone: 'UTC'
  })
}

export function formatEventLocalTime(
  value: string,
  options: { includeMinutesWhenZero?: boolean; fallback?: string } = {}
): string {
  const parts = getEventLocalDateTimeParts(value)
  if (!parts) return options.fallback ?? 'Time TBC'

  const period = parts.hour >= 12 ? 'pm' : 'am'
  const displayHours = parts.hour % 12 || 12

  if (parts.minute === 0 && !options.includeMinutesWhenZero) {
    return `${displayHours}${period}`
  }

  return `${displayHours}:${parts.minute.toString().padStart(2, '0')}${period}`
}

function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)
  const lookup = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value

  const year = Number.parseInt(lookup('year') ?? '', 10)
  const month = Number.parseInt(lookup('month') ?? '', 10)
  const day = Number.parseInt(lookup('day') ?? '', 10)
  const hour = Number.parseInt(lookup('hour') ?? '', 10)
  const minute = Number.parseInt(lookup('minute') ?? '', 10)
  const second = Number.parseInt(lookup('second') ?? '', 10)

  const utcTimestampFromTzParts = Date.UTC(year, month - 1, day, hour, minute, second)
  return utcTimestampFromTzParts - date.getTime()
}

function zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
  const utcAssumption = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second))
  const offsetMs = getTimeZoneOffsetMs(timeZone, utcAssumption)
  return new Date(utcAssumption.getTime() - offsetMs)
}

function parseEventDateUtc(value: string): Date {
  const parts = parseDateTimeParts(value)
  if (!parts) return new Date(value)
  return zonedTimeToUtc(parts, EVENT_TIME_ZONE)
}

function parseIsoDurationToMs(value?: string | null): number | null {
  if (!value) return null
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/)
  if (!match) return null

  const days = Number.parseInt(match[1] ?? '0', 10)
  const hours = Number.parseInt(match[2] ?? '0', 10)
  const minutes = Number.parseInt(match[3] ?? '0', 10)
  const seconds = Number.parseInt(match[4] ?? '0', 10)

  if (![days, hours, minutes, seconds].every((num) => Number.isFinite(num))) return null
  return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000
}

export function getEventDateRangeUtc(event: Pick<Event, 'startDate' | 'endDate' | 'duration'>): { start: Date; end: Date } {
  const start = parseEventDateUtc(event.startDate)

  const explicitEnd = event.endDate ? parseEventDateUtc(event.endDate) : null
  if (explicitEnd) {
    return { start, end: explicitEnd }
  }

  const durationMs = parseIsoDurationToMs(event.duration)
  const end = durationMs
    ? new Date(start.getTime() + durationMs)
    : new Date(start.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60 * 1000)

  return { start, end }
}

export function getEventLocationText(event: Pick<Event, 'location'>): string {
  const address = event.location?.address
  const parts = [
    event.location?.name,
    address?.streetAddress,
    address?.addressLocality,
    address?.addressRegion,
    address?.postalCode
  ].filter(Boolean)

  return parts.join(', ')
}

function formatCalendarUtc(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d{3}/g, '')
}

export function buildGoogleCalendarUrl(event: Event): string {
  const { start, end } = getEventDateRangeUtc(event)
  const eventUrl = getEventWebsiteUrl(event, { absolute: true })
  const location = getEventLocationText(event)
  const description = `${event.shortDescription || event.description || 'Event at The Anchor'}\n\nMore info: ${eventUrl}`

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatCalendarUtc(start)}/${formatCalendarUtc(end)}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function buildEventIcs(event: Event): string {
  const { start, end } = getEventDateRangeUtc(event)
  const url = getEventWebsiteUrl(event, { absolute: true })
  const location = getEventLocationText(event)
  const description = `${event.shortDescription || event.description || 'Event at The Anchor'}\n\nMore info: ${url}`
  const uid = `${event.id}@the-anchor.pub`
  const dtstamp = formatCalendarUtc(new Date())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Anchor//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatCalendarUtc(start)}`,
    `DTEND:${formatCalendarUtc(end)}`,
    `SUMMARY:${escapeIcsText(event.name)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${escapeIcsText(url)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]

  return `${lines.join('\r\n')}\r\n`
}

type EventsCalendarIcsOptions = {
  calendarName?: string
  calendarDescription?: string
  prodId?: string
}

function buildVEventLines(event: Event, dtstamp: string): string[] | null {
  const { start, end } = getEventDateRangeUtc(event)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  const url = getEventWebsiteUrl(event, { absolute: true })
  const location = getEventLocationText(event)
  const description = `${event.shortDescription || event.description || 'Event at The Anchor'}\n\nMore info: ${url}`
  const uid = `${event.id}@the-anchor.pub`

  return [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatCalendarUtc(start)}`,
    `DTEND:${formatCalendarUtc(end)}`,
    `SUMMARY:${escapeIcsText(event.name)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${escapeIcsText(url)}`,
    'END:VEVENT'
  ]
}

export function buildEventsCalendarIcs(events: Event[], options: EventsCalendarIcsOptions = {}): string {
  const dtstamp = formatCalendarUtc(new Date())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${escapeIcsText(options.prodId || '-//The Anchor//Events//EN')}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...(options.calendarName ? [`X-WR-CALNAME:${escapeIcsText(options.calendarName)}`] : []),
    ...(options.calendarDescription ? [`X-WR-CALDESC:${escapeIcsText(options.calendarDescription)}`] : []),
    `X-WR-TIMEZONE:${EVENT_TIME_ZONE}`
  ]

  for (const event of events) {
    const eventLines = buildVEventLines(event, dtstamp)
    if (eventLines) {
      lines.push(...eventLines)
    }
  }

  lines.push('END:VCALENDAR')

  return `${lines.join('\r\n')}\r\n`
}
