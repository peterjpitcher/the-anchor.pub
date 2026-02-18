import { NextResponse } from 'next/server'
import { anchorAPI, type BusinessHours, type TableAvailabilityResponse, type TableAvailabilitySlot } from '@/lib/api'
import { createApiErrorResponse, logError } from '@/lib/error-handling'

type BookingType = 'regular' | 'sunday_lunch'

type ScheduleConfigEntry = {
  starts_at?: string
  ends_at?: string
  booking_type?: string
  capacity?: number
}

type ServiceRange = {
  startsAt: string
  endsAt: string
  capacity: number
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return value
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)
}

function toMinutes(time: string): number {
  const normalized = normalizeTime(time)
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

function toTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function londonNowParts(): { isoDate: string; minutes: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(new Date())
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const isoDate = `${map.year}-${map.month}-${map.day}`
  const hours = Number.parseInt(map.hour || '0', 10)
  const minutes = Number.parseInt(map.minute || '0', 10)

  return {
    isoDate,
    minutes: hours * 60 + minutes
  }
}

function getDayKey(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10))
  return new Date(Date.UTC(year, month - 1, day))
    .toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
    .toLowerCase()
}

function extractScheduleConfig(input: unknown): ScheduleConfigEntry[] {
  if (!Array.isArray(input)) return []

  const entries: ScheduleConfigEntry[] = []

  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue

    const source = entry as Record<string, unknown>
    const startsAt = typeof source.starts_at === 'string' ? normalizeTime(source.starts_at) : undefined
    const endsAt = typeof source.ends_at === 'string' ? normalizeTime(source.ends_at) : undefined
    if (!startsAt || !endsAt || !isValidTime(startsAt) || !isValidTime(endsAt)) continue

    entries.push({
      starts_at: startsAt,
      ends_at: endsAt,
      booking_type: typeof source.booking_type === 'string' ? source.booking_type : undefined,
      capacity:
        typeof source.capacity === 'number'
          ? source.capacity
          : typeof source.capacity === 'string'
          ? Number.parseInt(source.capacity, 10)
          : undefined
    })
  }

  return entries
}

function buildSlotsFromRanges(
  ranges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes = 30,
  minMinutesForToday?: number
): TableAvailabilitySlot[] {
  const slots = new Map<string, TableAvailabilitySlot>()

  for (const range of ranges) {
    const start = toMinutes(range.startsAt)
    const end = toMinutes(range.endsAt)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      continue
    }

    for (let cursor = start; cursor < end; cursor += slotIntervalMinutes) {
      if (typeof minMinutesForToday === 'number' && cursor < minMinutesForToday) {
        continue
      }

      const slotTime = toTimeString(cursor)
      const availableCapacity = Math.max(range.capacity, 0)
      const isAvailable = availableCapacity >= partySize

      if (!slots.has(slotTime)) {
        slots.set(slotTime, {
          time: slotTime,
          available: isAvailable,
          available_capacity: availableCapacity,
          reason: isAvailable ? undefined : 'party_too_large'
        })
        continue
      }

      const existing = slots.get(slotTime)
      if (!existing) continue

      const mergedCapacity = Math.max(existing.available_capacity || 0, availableCapacity)
      const mergedAvailable = mergedCapacity >= partySize
      slots.set(slotTime, {
        ...existing,
        available_capacity: mergedCapacity,
        available: mergedAvailable,
        reason: mergedAvailable ? undefined : existing.reason || 'party_too_large'
      })
    }
  }

  return Array.from(slots.values()).sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
}

function resolveServiceRanges(
  businessHours: BusinessHours,
  isoDate: string,
  bookingType: BookingType
): {
  ranges: ServiceRange[]
  closed: boolean
  message?: string
} {
  const dayKey = getDayKey(isoDate)
  const regularDay = (businessHours.regularHours?.[dayKey] || null) as Record<string, unknown> | null
  const specialDay = ((businessHours.specialHours || []) as Array<Record<string, unknown>>).find(
    (entry) => entry.date === isoDate
  )

  const isClosed =
    specialDay?.status === 'closed' ||
    specialDay?.is_closed === true ||
    (specialDay && specialDay.opens === null && specialDay.closes === null) ||
    regularDay?.is_closed === true

  if (isClosed) {
    return {
      ranges: [],
      closed: true,
      message: 'We are closed on that date. Please choose another day.'
    }
  }

  const scheduleConfig = extractScheduleConfig(specialDay?.schedule_config || regularDay?.schedule_config)
  const typedSchedule = scheduleConfig.filter((entry) => entry.booking_type === bookingType)
  const fallbackSchedule = bookingType === 'regular' && typedSchedule.length === 0 ? scheduleConfig : typedSchedule

  const scheduleRanges = fallbackSchedule
    .map((entry) => ({
      startsAt: normalizeTime(entry.starts_at || ''),
      endsAt: normalizeTime(entry.ends_at || ''),
      capacity: Number.isFinite(entry.capacity) ? Number(entry.capacity) : 50
    }))
    .filter((entry) => isValidTime(entry.startsAt) && isValidTime(entry.endsAt) && toMinutes(entry.endsAt) > toMinutes(entry.startsAt))

  if (scheduleRanges.length > 0) {
    return { ranges: scheduleRanges, closed: false }
  }

  const kitchen = (specialDay?.kitchen || regularDay?.kitchen || null) as Record<string, unknown> | null
  const kitchenOpens = typeof kitchen?.opens === 'string' ? normalizeTime(kitchen.opens) : null
  const kitchenCloses = typeof kitchen?.closes === 'string' ? normalizeTime(kitchen.closes) : null

  if (bookingType === 'sunday_lunch') {
    if (!kitchenOpens || !kitchenCloses) {
      return {
        ranges: [],
        closed: false,
        message: 'Sunday lunch is unavailable for that date. Please choose another date or call us.'
      }
    }

    return {
      ranges: [
        {
          startsAt: kitchenOpens,
          endsAt: kitchenCloses,
          capacity: 50
        }
      ],
      closed: false
    }
  }

  const venueOpens = normalizeTime(
    String(specialDay?.opens || regularDay?.opens || kitchenOpens || '12:00')
  )
  const venueCloses = normalizeTime(
    String(specialDay?.closes || regularDay?.closes || kitchenCloses || '22:00')
  )

  if (!isValidTime(venueOpens) || !isValidTime(venueCloses) || toMinutes(venueCloses) <= toMinutes(venueOpens)) {
    return {
      ranges: [],
      closed: false,
      message: 'We could not determine available times for that date.'
    }
  }

  return {
    ranges: [
      {
        startsAt: venueOpens,
        endsAt: venueCloses,
        capacity: 50
      }
    ],
    closed: false
  }
}

function buildFallbackAvailability(
  businessHours: BusinessHours,
  options: {
    date: string
    partySize: number
    time: string
    bookingType: BookingType
  }
): TableAvailabilityResponse {
  const { ranges, closed, message } = resolveServiceRanges(businessHours, options.date, options.bookingType)

  const londonNow = londonNowParts()
  const minMinutesForToday =
    londonNow.isoDate === options.date
      ? Math.ceil((londonNow.minutes + 60) / 30) * 30
      : undefined

  const timeSlots = buildSlotsFromRanges(ranges, options.partySize, 30, minMinutesForToday)
  const available = timeSlots.some((slot) => slot.available === true || (slot.available_capacity || 0) >= options.partySize)

  const fallbackMessage =
    message ||
    (available
      ? 'These times are based on current service windows and will be confirmed instantly when you continue.'
      : 'No online times are currently available for this request. Please choose an alternative or join the waitlist.')

  return {
    date: options.date,
    time: options.time,
    party_size: options.partySize,
    available,
    time_slots: timeSlots,
    message: fallbackMessage,
    special_notes:
      'If your preferred time is unavailable, choose a nearby slot or call 01753 682707 to join the waitlist.'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const partySizeRaw = searchParams.get('party_size')
  const requestedTime = searchParams.get('time') || '19:00'
  const bookingType =
    searchParams.get('booking_type') === 'sunday_lunch' ? 'sunday_lunch' : 'regular'

  if (!date || !partySizeRaw) {
    return createApiErrorResponse(
      'Missing required parameters: date and party_size are required',
      400
    )
  }

  if (!isValidIsoDate(date)) {
    return createApiErrorResponse('Date must use YYYY-MM-DD format', 400)
  }

  const normalizedTime = normalizeTime(requestedTime)
  if (!isValidTime(normalizedTime)) {
    return createApiErrorResponse('Time must use HH:mm or HH:mm:ss format', 400)
  }

  const partySize = parsePositiveInt(partySizeRaw, 2)

  // Management API no longer exposes table availability directly; use schedule-based availability.
  try {
    const businessHours = await anchorAPI.getBusinessHours()
    const fallback = buildFallbackAvailability(businessHours, {
      date,
      partySize,
      time: normalizedTime,
      bookingType
    })

    return NextResponse.json({
      success: true,
      data: fallback,
      meta: {
        source: 'schedule_fallback'
      }
    })
  } catch (fallbackError: any) {
    logError('api/table-bookings/availability-fallback', fallbackError, {
      date,
      time: normalizedTime,
      partySize,
      bookingType
    })

    return createApiErrorResponse(
      'We couldn\'t check table availability right now. Please try again or call us at 01753 682707.',
      503
    )
  }
}
