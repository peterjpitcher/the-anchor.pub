/**
 * Christmas 2026 service window helpers.
 *
 * The window is 10 November to 20 December 2026, both dates inclusive: a
 * 20 December sitting is bookable. Every question answered here is asked in
 * Europe/London terms, because a UTC server must not flip the season a few
 * hours early or late.
 *
 * Window dates are read from SSOT.json when the `christmas_2026` block is
 * present, so the SSOT stays the source of truth. The constants below are the
 * agreed owner-confirmed fallback used until that block lands.
 */

import ssot from '@/SSOT.json'
import { nowInLondonComponents, parseLondonDate } from '@/lib/time-london'
import { formatTime12h } from '@/lib/hero-context'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const FALLBACK_WINDOW_START = '2026-11-10'
const FALLBACK_WINDOW_END = '2026-12-20'

type SsotChristmasWindow = {
  start?: unknown
  end?: unknown
  start_date?: unknown
  end_date?: unknown
  display?: unknown
}

type SsotChristmasBlock = {
  service_window?: SsotChristmasWindow
  window?: SsotChristmasWindow
  start_date?: unknown
  end_date?: unknown
  booking_rules?: { min_party_size?: unknown }
  christmas_day?: { opens?: unknown, closes?: unknown, food_service?: unknown }
}

type SsotWithChristmas = {
  christmas_2026?: SsotChristmasBlock
}

function asIsoDate(value: unknown): string | undefined {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value.trim())
    ? value.trim()
    : undefined
}

/**
 * Read the window from SSOT.json if it is present and well formed. Any other
 * shape is ignored so a partially written SSOT block can never publish a
 * half-correct window.
 */
function readSsotWindow(): { start: string; end: string; display?: string } | null {
  const christmas = (ssot as SsotWithChristmas).christmas_2026
  if (!christmas || typeof christmas !== 'object') return null

  const candidates: SsotChristmasWindow[] = [
    christmas.service_window || {},
    christmas.window || {},
    { start: christmas.start_date, end: christmas.end_date }
  ]

  for (const candidate of candidates) {
    const start = asIsoDate(candidate.start) || asIsoDate(candidate.start_date)
    const end = asIsoDate(candidate.end) || asIsoDate(candidate.end_date)
    if (start && end && start <= end) {
      const display = typeof candidate.display === 'string' && candidate.display.trim().length > 0
        ? candidate.display.trim()
        : undefined
      return { start, end, ...(display ? { display } : {}) }
    }
  }

  return null
}

const RESOLVED_WINDOW = readSsotWindow()

/** First date of Christmas service, inclusive (YYYY-MM-DD, Europe/London). */
export const CHRISTMAS_WINDOW_START: string = RESOLVED_WINDOW?.start || FALLBACK_WINDOW_START

/** Last date of Christmas service, inclusive (YYYY-MM-DD, Europe/London). */
export const CHRISTMAS_WINDOW_END: string = RESOLVED_WINDOW?.end || FALLBACK_WINDOW_END

/** Minimum notice, in hours, on every Christmas dinner booking. */
export const CHRISTMAS_MINIMUM_NOTICE_HOURS = 24

/**
 * Minimum guests on every Christmas dinner booking, any day of the week.
 *
 * Owner-confirmed 6 September 2026: 4 guests, regardless of the day. An
 * earlier reading of the same conversation had this as 4 midweek and 6 at the
 * weekend; the owner corrected it to a flat 4 the same day. Read from the SSOT
 * so the number cannot drift from the document that owns it.
 *
 * The Sunday roast is a separate offer and has no minimum party size at all.
 * Never copy this figure onto it.
 */
export const CHRISTMAS_MINIMUM_PARTY_SIZE: number = (() => {
  const value = (ssot as SsotWithChristmas).christmas_2026?.booking_rules?.min_party_size
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 4
})()

/** Christmas Day itself, which sits outside the 10 Nov to 20 Dec service window. */
export type ChristmasDayView = {
  /** Human opening time, for example "12pm". */
  opens: string
  /** Human closing time, for example "3pm". */
  closes: string
  /** Whether any food is served. False means drinks only. */
  foodService: boolean
}

/**
 * Christmas Day opening, formatted for pub copy.
 *
 * The SSOT stores 24 hour clock times because that is what the rest of the
 * system reads, but customer copy says "12pm to 3pm" and never "12:00 to
 * 15:00". Building it here rather than in the page means the formatting is
 * covered by tests: on 6 September 2026 the page shipped "from 12:00 to 15:00"
 * to production while a hand-written test fixture said "12pm" and passed.
 *
 * `foodService` defaults to false, the conservative reading: if the SSOT block
 * is missing or malformed, claim no food rather than invent a service.
 */
export function getChristmasDay(): ChristmasDayView {
  const block = (ssot as SsotWithChristmas).christmas_2026?.christmas_day
  const opens = typeof block?.opens === 'string' ? block.opens : undefined
  const closes = typeof block?.closes === 'string' ? block.closes : undefined
  return {
    opens: formatTime12h(opens) ?? '12pm',
    closes: formatTime12h(closes) ?? '3pm',
    foodService: block?.food_service === true
  }
}

/** Deposit per person on every Christmas booking, in pounds. */
export const CHRISTMAS_DEPOSIT_PER_PERSON = 10

export type ChristmasSeasonState = 'upcoming' | 'active' | 'ended'

export type ChristmasSeasonStatus = {
  /** 'upcoming' before the window, 'active' inside it, 'ended' after it. */
  state: ChristmasSeasonState
  /** The Europe/London date the answer was computed for (YYYY-MM-DD). */
  today: string
  /** Window start, inclusive (YYYY-MM-DD). */
  windowStart: string
  /** Window end, inclusive (YYYY-MM-DD). */
  windowEnd: string
  /** True when today sits inside the window. */
  isWindowOpen: boolean
  /** True when the window has not started yet. */
  isWindowUpcoming: boolean
  /** True when the window has finished. */
  hasWindowPassed: boolean
  /**
   * True while at least one date inside the window can still be booked, given
   * the 24 hour notice rule. Bookings open months ahead, so this is true long
   * before the window starts.
   */
  isBookable: boolean
  /** Last date on which a booking can still be taken (YYYY-MM-DD). */
  lastBookableDate: string
  /** Whole days from today to the window start; 0 once the window has started. */
  daysUntilWindowStart: number
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Today's date in Europe/London as YYYY-MM-DD. */
export function getLondonIsoDate(base: Date = new Date()): string {
  const { year, month, day } = nowInLondonComponents(base)
  return `${year}-${pad(month)}-${pad(day)}`
}

function shiftIsoDate(isoDate: string, days: number): string {
  const shifted = new Date(parseLondonDate(isoDate).getTime() + days * MILLISECONDS_PER_DAY)
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

function differenceInDays(fromIsoDate: string, toIsoDate: string): number {
  const from = parseLondonDate(fromIsoDate).getTime()
  const to = parseLondonDate(toIsoDate).getTime()
  return Math.round((to - from) / MILLISECONDS_PER_DAY)
}

function normaliseIsoDate(isoDate?: string): string {
  const candidate = asIsoDate(isoDate)
  return candidate || getLondonIsoDate()
}

/**
 * Last day a Christmas booking can be taken. The 24 hour notice rule means the
 * final sitting on the window end date must be booked the day before at the
 * latest, so date-level logic stops one day short of the window end.
 */
export const CHRISTMAS_LAST_BOOKABLE_DATE: string = shiftIsoDate(
  CHRISTMAS_WINDOW_END,
  -Math.ceil(CHRISTMAS_MINIMUM_NOTICE_HOURS / 24)
)

/** The window as a pair of inclusive ISO dates. */
export function getChristmasWindow(): { start: string; end: string } {
  return { start: CHRISTMAS_WINDOW_START, end: CHRISTMAS_WINDOW_END }
}

/** Is the given Europe/London date inside the service window? */
export function isChristmasWindowOpen(isoDate?: string): boolean {
  const today = normaliseIsoDate(isoDate)
  return today >= CHRISTMAS_WINDOW_START && today <= CHRISTMAS_WINDOW_END
}

/** Is the service window still ahead of the given Europe/London date? */
export function isChristmasWindowUpcoming(isoDate?: string): boolean {
  return normaliseIsoDate(isoDate) < CHRISTMAS_WINDOW_START
}

/** Has the service window finished before the given Europe/London date? */
export function hasChristmasWindowPassed(isoDate?: string): boolean {
  return normaliseIsoDate(isoDate) > CHRISTMAS_WINDOW_END
}

/**
 * Can a Christmas booking still be taken on the given Europe/London date?
 * True whenever a date inside the window remains reachable with 24 hours
 * notice, which includes every date before the window opens.
 */
export function isChristmasBookingOpen(isoDate?: string): boolean {
  return normaliseIsoDate(isoDate) <= CHRISTMAS_LAST_BOOKABLE_DATE
}

/** State of the season on the given Europe/London date. */
export function getChristmasSeasonState(isoDate?: string): ChristmasSeasonState {
  const today = normaliseIsoDate(isoDate)
  if (today < CHRISTMAS_WINDOW_START) return 'upcoming'
  if (today > CHRISTMAS_WINDOW_END) return 'ended'
  return 'active'
}

/** Everything a page needs to decide what Christmas copy to show. */
export function getChristmasSeasonStatus(isoDate?: string): ChristmasSeasonStatus {
  const today = normaliseIsoDate(isoDate)
  const state = getChristmasSeasonState(today)

  return {
    state,
    today,
    windowStart: CHRISTMAS_WINDOW_START,
    windowEnd: CHRISTMAS_WINDOW_END,
    isWindowOpen: state === 'active',
    isWindowUpcoming: state === 'upcoming',
    hasWindowPassed: state === 'ended',
    isBookable: isChristmasBookingOpen(today),
    lastBookableDate: CHRISTMAS_LAST_BOOKABLE_DATE,
    daysUntilWindowStart: state === 'upcoming' ? differenceInDays(today, CHRISTMAS_WINDOW_START) : 0
  }
}

function formatWindowDate(isoDate: string, withYear: boolean): string {
  const date = parseLondonDate(isoDate)
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {})
  }).format(date)
}

/** Human label for the window, for example "10 November to 20 December 2026". */
export function formatChristmasWindowLabel(): string {
  if (RESOLVED_WINDOW?.display) {
    return RESOLVED_WINDOW.display
  }

  const startYear = CHRISTMAS_WINDOW_START.slice(0, 4)
  const endYear = CHRISTMAS_WINDOW_END.slice(0, 4)
  const showStartYear = startYear !== endYear

  return `${formatWindowDate(CHRISTMAS_WINDOW_START, showStartYear)} to ${formatWindowDate(CHRISTMAS_WINDOW_END, true)}`
}
