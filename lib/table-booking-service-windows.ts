import type { BusinessHours } from '@/lib/api'

export type BookingPurpose = 'food' | 'drinks'
export type BookingType = 'regular' | 'sunday_lunch'

type ScheduleConfigEntry = {
  starts_at?: string
  ends_at?: string
  booking_type?: string
  capacity?: number
}

export type ServiceRange = {
  startsAt: string
  endsAt: string
  capacity: number
}

export type ServiceRangeResolution = {
  ranges: ServiceRange[]
  closed: boolean
  message?: string
}

export function normalizeTime(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) return value
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5)
  return value
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)
}

export function toMinutes(time: string): number {
  const normalized = normalizeTime(time)
  const [hoursRaw, minutesRaw] = normalized.split(':')
  const hours = Number.parseInt(hoursRaw || '0', 10)
  const minutes = Number.parseInt(minutesRaw || '0', 10)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

export function toTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function londonNowParts(): { isoDate: string; minutes: number } {
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

function toServiceRanges(entries: ScheduleConfigEntry[]): ServiceRange[] {
  return entries
    .map((entry) => ({
      startsAt: normalizeTime(entry.starts_at || ''),
      endsAt: normalizeTime(entry.ends_at || ''),
      capacity: Number.isFinite(entry.capacity) ? Number(entry.capacity) : 50
    }))
    .filter((entry) => isValidTime(entry.startsAt) && isValidTime(entry.endsAt) && toMinutes(entry.endsAt) > toMinutes(entry.startsAt))
}

function isInWindow(targetMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (endMinutes > startMinutes) {
    return targetMinutes >= startMinutes && targetMinutes < endMinutes
  }

  return targetMinutes >= startMinutes || targetMinutes < endMinutes
}

export function isTimeWithinRanges(time: string, ranges: ServiceRange[]): boolean {
  if (!isValidTime(time)) return false
  const targetMinutes = toMinutes(time)

  return ranges.some((range) => {
    if (!isValidTime(range.startsAt) || !isValidTime(range.endsAt)) return false
    return isInWindow(targetMinutes, toMinutes(range.startsAt), toMinutes(range.endsAt))
  })
}

export function buildSlotsFromRanges(
  ranges: ServiceRange[],
  partySize: number,
  slotIntervalMinutes = 30,
  minMinutesForToday?: number
): Array<{
  time: string
  available: boolean
  available_capacity: number
  reason?: string
}> {
  const slots = new Map<string, { time: string; available: boolean; available_capacity: number; reason?: string }>()

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

export function resolveServiceRanges(
  businessHours: BusinessHours,
  isoDate: string,
  options: {
    bookingType: BookingType
    purpose: BookingPurpose
  }
): ServiceRangeResolution {
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

  const scheduleConfig = extractScheduleConfig(specialDay !== undefined
    ? (specialDay.schedule_config ?? [])
    : (regularDay?.schedule_config ?? []))
  const normalizedSchedule = scheduleConfig.map((entry) => ({
    ...entry,
    booking_type: (entry.booking_type || '').trim().toLowerCase()
  }))

  const byBookingType = (bookingType: string): ScheduleConfigEntry[] =>
    normalizedSchedule.filter((entry) => entry.booking_type === bookingType)

  const kitchenData = (specialDay !== undefined
    ? (specialDay.kitchen ?? null)
    : (regularDay?.kitchen ?? null)) as Record<string, unknown> | null
  const kitchenClosed =
    specialDay?.is_kitchen_closed === true ||
    regularDay?.is_kitchen_closed === true ||
    kitchenData?.is_closed === true

  const kitchenOpens = typeof kitchenData?.opens === 'string' ? normalizeTime(kitchenData.opens) : null
  const kitchenCloses = typeof kitchenData?.closes === 'string' ? normalizeTime(kitchenData.closes) : null
  const hasKitchenWindow =
    !kitchenClosed &&
    !!kitchenOpens &&
    !!kitchenCloses &&
    isValidTime(kitchenOpens) &&
    isValidTime(kitchenCloses) &&
    toMinutes(kitchenCloses) > toMinutes(kitchenOpens)

  if (options.bookingType === 'sunday_lunch') {
    const sundayLunchRanges = toServiceRanges(byBookingType('sunday_lunch'))
    if (sundayLunchRanges.length > 0) {
      return { ranges: sundayLunchRanges, closed: false }
    }

    if (hasKitchenWindow && kitchenOpens && kitchenCloses) {
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

    return {
      ranges: [],
      closed: false,
      message: 'Sunday lunch is unavailable for that date. Please choose another date or call us.'
    }
  }

  if (options.purpose === 'food') {
    const foodRanges = toServiceRanges(byBookingType('food'))
    if (foodRanges.length > 0) {
      return { ranges: foodRanges, closed: false }
    }

    if (hasKitchenWindow && kitchenOpens && kitchenCloses) {
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

    return {
      ranges: [],
      closed: false,
      message: 'Food is unavailable for that date. Please choose drinks-only or call us for help.'
    }
  }

  const drinksRanges = toServiceRanges(byBookingType('drinks'))
  if (drinksRanges.length > 0) {
    return { ranges: drinksRanges, closed: false }
  }

  const regularRanges = toServiceRanges(byBookingType('regular'))
  if (regularRanges.length > 0) {
    return { ranges: regularRanges, closed: false }
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
