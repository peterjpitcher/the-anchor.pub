import {
  londonIsoDate,
  londonNowParts,
  toTimeString,
} from '@/lib/table-booking-service-windows'

/**
 * Date, time and currency parsing plus display formatting for the booking
 * journey.
 *
 * Everything here is pure and clock-aware only through the Europe/London
 * helpers. Nothing in this module may read the browser-local clock: the whole
 * point of the London helpers is that a visitor on a device set to another
 * timezone still sees, and books, UK times.
 */

export function toIsoDateInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return londonIsoDate(date)
}

export function getDefaultTimeValue(): string {
  // Compute "now + 1 hour, rounded up to the next 30-minute slot" in
  // Europe/London. The previous implementation used the browser-local clock,
  // which is wrong for any visitor whose device is not on UK time.
  const { minutes } = londonNowParts()
  const next = Math.ceil((minutes + 60) / 30) * 30
  if (next >= 1440) {
    // Crosses midnight; clamp to last valid 30-min slot of today instead of
    // wrapping to 00:00. Wrapping with `% 1440` while the date stays today
    // confuses the customer and causes the search to submit a time that has
    // already passed earlier on the same London day. We deliberately do not
    // auto-advance the date here because that would also need to coordinate
    // with the date input default; the customer can change either field.
    // See codex AB-002 / WF-003.
    return '23:30'
  }
  return toTimeString(next)
}

export function toTimeInputValue(value: string | undefined): string {
  if (!value) return ''
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return ''
}

export function formatHoldExpiry(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Europe/London'
  })
}

export function formatGbpCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
}

export function toMinutes(time: string): number {
  const normalized = toTimeInputValue(time)
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

export function formatDateForDisplay(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export function formatTimeForDisplay(time: string): string {
  const normalized = toTimeInputValue(time)
  if (!normalized) return time
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  const period = hours >= 12 ? 'pm' : 'am'
  const displayHour = hours % 12 || 12
  return minutes === 0 ? `${displayHour}${period}` : `${displayHour}:${String(minutes).padStart(2, '0')}${period}`
}

export function formatTimeList(times: string[]): string {
  if (times.length === 0) return ''
  if (times.length === 1) return times[0]
  return `${times.slice(0, -1).join(', ')} and ${times[times.length - 1]}`
}

export function addDays(isoDate: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  // Pure UTC arithmetic, no London-format roundtrip. We never go through a
  // timezone formatter, so BST/GMT transitions cannot affect the calendar
  // date result. See codex AB-001.
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const resultYear = date.getUTCFullYear()
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const resultDay = String(date.getUTCDate()).padStart(2, '0')
  return `${resultYear}-${resultMonth}-${resultDay}`
}

export function isPastLondonDate(value: string): boolean {
  // Compare YYYY-MM-DD strings against London today. We deliberately do NOT
  // parse `value` with `new Date(...)`, that would re-introduce browser-local
  // timezone drift on the customer's device.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < londonNowParts().isoDate
}
