/**
 * The kitchen's break over Christmas and New Year.
 *
 * SSOT section 7: "The kitchen serves up to and including Sunday 20 December,
 * then closes until Tuesday 12 January; the bar stays open." The two dates are
 * held in SSOT.json at christmas_2026.christmas_day.kitchen_festive_closure,
 * which transcribes the management app's business hours.
 *
 * Why this exists when the hours feed is the source of truth: the feed only
 * returns special hours 90 days ahead (SSOT section 7). For most of the year a
 * page cannot see 31 December or the January Sundays in it, and a missing row
 * looks exactly like an ordinary day. Pages that make a food promise about a
 * date inside the break (the New Year's Eve page, "every Sunday" roast lines,
 * the homepage in late December and early January) read this instead, so the
 * promise stops by itself on the right day. Where a page can see the live row
 * for a date, the live row wins.
 *
 * Every question is asked in Europe/London terms. If the block is missing or
 * malformed (a new year nobody has filled in), every function answers "no
 * closure", which leaves the ordinary copy in place rather than inventing dates.
 */

import ssot from '@/SSOT.json'
import { getLondonIsoDate } from '@/lib/christmas-season'
import { parseLondonDate } from '@/lib/time-london'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

/** How long before the last service day the notice starts to show. */
export const FESTIVE_KITCHEN_NOTICE_LEAD_DAYS = 30

export interface FestiveKitchenClosure {
  /** The last day the kitchen serves, inclusive (YYYY-MM-DD). */
  lastService: string
  /** The first day the kitchen serves again (YYYY-MM-DD). */
  returns: string
}

type SsotWithClosure = {
  christmas_2026?: {
    christmas_day?: {
      kitchen_festive_closure?: { last_service?: unknown; returns?: unknown }
    }
  }
}

function asIsoDate(value: unknown): string | undefined {
  return typeof value === 'string' && ISO_DATE_PATTERN.test(value.trim()) ? value.trim() : undefined
}

/** The closure as the SSOT holds it, or null when it holds none. */
export function getFestiveKitchenClosure(): FestiveKitchenClosure | null {
  const block = (ssot as SsotWithClosure).christmas_2026?.christmas_day?.kitchen_festive_closure
  const lastService = asIsoDate(block?.last_service)
  const returns = asIsoDate(block?.returns)
  if (!lastService || !returns || lastService >= returns) return null
  return { lastService, returns }
}

/** True when the kitchen is shut for the break on this London date (YYYY-MM-DD). */
export function isKitchenShutForFestiveBreak(isoDate: string): boolean {
  const closure = getFestiveKitchenClosure()
  if (!closure) return false
  // ISO dates compare correctly as strings.
  return isoDate > closure.lastService && isoDate < closure.returns
}

export type FestiveKitchenState =
  /** No closure on file, or it is more than the lead time away, or it is over. */
  | 'none'
  /** The kitchen is still serving, and the break starts within the lead time. */
  | 'ahead'
  /** The kitchen is shut today. */
  | 'closed'

export interface FestiveKitchenStatus {
  state: FestiveKitchenState
  /** Today's London date (YYYY-MM-DD). */
  today: string
  closure: FestiveKitchenClosure | null
}

function shiftIsoDate(isoDate: string, days: number): string {
  const shifted = new Date(parseLondonDate(isoDate).getTime() + days * MILLISECONDS_PER_DAY)
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

/** Where today sits against the break, in London. */
export function getFestiveKitchenStatus(now: Date = new Date()): FestiveKitchenStatus {
  const today = getLondonIsoDate(now)
  const closure = getFestiveKitchenClosure()
  if (!closure) return { state: 'none', today, closure: null }

  if (isKitchenShutForFestiveBreak(today)) return { state: 'closed', today, closure }

  const noticeFrom = shiftIsoDate(closure.lastService, -FESTIVE_KITCHEN_NOTICE_LEAD_DAYS)
  if (today >= noticeFrom && today <= closure.lastService) return { state: 'ahead', today, closure }

  return { state: 'none', today, closure }
}

/** "Sunday 20 December", from a YYYY-MM-DD date. No year: the wording names none. */
export function formatFestiveDay(isoDate: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  }).formatToParts(parseLondonDate(isoDate))
  const pick = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('weekday')} ${pick('day')} ${pick('month')}`
}

/**
 * The kitchen sentence from SSOT section 16, "Over Christmas and New Year",
 * built from the two dates so it cannot drift from them:
 * "Our kitchen's last day of the year is Sunday 20 December, and it's back on
 * Tuesday 12 January." Null when there is no closure on file.
 */
export function getFestiveKitchenWording(): string | null {
  const closure = getFestiveKitchenClosure()
  if (!closure) return null
  return `Our kitchen's last day of the year is ${formatFestiveDay(closure.lastService)}, and it's back on ${formatFestiveDay(closure.returns)}.`
}

/** "Tuesday 12 January", the day the kitchen is back. Null when no closure is on file. */
export function getFestiveKitchenReturnDay(): string | null {
  const closure = getFestiveKitchenClosure()
  return closure ? formatFestiveDay(closure.returns) : null
}

/**
 * The next 31 December on or after today's London date (YYYY-MM-DD), and
 * whether the break covers it.
 */
export function getNextNewYearsEve(now: Date = new Date()): { date: string; kitchenShutForBreak: boolean } {
  const today = getLondonIsoDate(now)
  const date = `${today.slice(0, 4)}-12-31`
  return { date, kitchenShutForBreak: isKitchenShutForFestiveBreak(date) }
}
