export type PlaneSpottingWindow = 'from_3pm' | 'until_3pm' | 'unknown'

export interface PlaneSpottingWindowInfo {
  window: PlaneSpottingWindow
  label: string
  statusText: string
  bookingNote: string
  caveat: string
  weekCommencing: string | null
}

export interface AircraftOverheadNote {
  message: string
  caveat: string
}

const ANCHOR_WEEK_COMMENCING = '2026-01-05'
const MS_PER_DAY = 24 * 60 * 60 * 1000
const DAYS_PER_WEEK = 7
const THREE_PM_MINUTES = 15 * 60

export const PLANE_SPOTTING_COMPACT_CAVEAT =
  'Weather and Heathrow operations dependent, not guaranteed.'

export const PLANE_SPOTTING_FULL_CAVEAT =
  'Plane spotting is weather and Heathrow operations dependent. Aircraft overhead cannot be guaranteed.'

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseTimeToMinutes(value: string): number | null {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return null

  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw, 10)

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return hours * 60 + minutes
}

function getMondayForDate(date: Date): Date {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = monday.getUTCDay()
  const daysSinceMonday = (day + 6) % 7
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday)
  return monday
}

export function getLondonIsoDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function getPlaneSpottingWindowForDate(isoDate: string): PlaneSpottingWindowInfo {
  const date = parseIsoDate(isoDate)

  if (!date) {
    return {
      window: 'unknown',
      label: 'schedule unavailable',
      statusText: 'Planes: schedule unavailable',
      bookingNote: `Plane spotting schedule for this date is not available. ${PLANE_SPOTTING_COMPACT_CAVEAT}`,
      caveat: PLANE_SPOTTING_FULL_CAVEAT,
      weekCommencing: null
    }
  }

  const anchor = parseIsoDate(ANCHOR_WEEK_COMMENCING)
  if (!anchor) {
    throw new Error('Invalid Heathrow runway alternation anchor date')
  }

  const weekCommencing = getMondayForDate(date)
  const weekOffset = Math.floor(
    (weekCommencing.getTime() - anchor.getTime()) / (MS_PER_DAY * DAYS_PER_WEEK)
  )
  const normalizedOffset = ((weekOffset % 2) + 2) % 2
  const window: PlaneSpottingWindow = normalizedOffset === 0 ? 'from_3pm' : 'until_3pm'
  const windowLabel = window === 'from_3pm' ? 'expected from 3pm' : 'expected until 3pm'

  return {
    window,
    label: windowLabel,
    statusText: `Planes: ${windowLabel}`,
    bookingNote: `Plane spotting: overhead arrivals ${windowLabel}. ${PLANE_SPOTTING_COMPACT_CAVEAT}`,
    caveat: PLANE_SPOTTING_FULL_CAVEAT,
    weekCommencing: toIsoDate(weekCommencing)
  }
}

export function getTodayPlaneSpottingWindow(date: Date = new Date()): PlaneSpottingWindowInfo {
  return getPlaneSpottingWindowForDate(getLondonIsoDate(date))
}

export function getAircraftOverheadNotePartsForDateTime(
  isoDate: string,
  time: string
): AircraftOverheadNote {
  const schedule = getPlaneSpottingWindowForDate(isoDate)
  const minutes = parseTimeToMinutes(time)

  if (schedule.window === 'unknown' || minutes === null) {
    return {
      message: 'Aircraft overhead follows Heathrow runway alternation.',
      caveat: PLANE_SPOTTING_COMPACT_CAVEAT
    }
  }

  const isExpectedWindow =
    schedule.window === 'from_3pm'
      ? minutes >= THREE_PM_MINUTES
      : minutes < THREE_PM_MINUTES

  if (isExpectedWindow) {
    return {
      message: 'Aircraft overhead are expected around this time.',
      caveat: PLANE_SPOTTING_COMPACT_CAVEAT
    }
  }

  const windowLabel = schedule.window === 'from_3pm' ? 'from 3pm' : 'until 3pm'
  return {
    message: `Aircraft overhead is usually expected ${windowLabel} on this date.`,
    caveat: PLANE_SPOTTING_COMPACT_CAVEAT
  }
}

export function getAircraftOverheadNoteForDateTime(isoDate: string, time: string): string {
  const note = getAircraftOverheadNotePartsForDateTime(isoDate, time)
  return `${note.message} ${note.caveat}`
}
