/**
 * Valentine's: what the diary holds, and nothing the diary does not.
 *
 * The SSOT's events section does not record a Valentine's night, and the rule
 * is "no seasonal event content unless the SSOT confirms the event is running".
 * So the page and the header link both key off one question: is there a
 * Valentine's event in the management app's diary for the coming February?
 *
 * - /valentines-day shows the event when there is one, and a plain holding
 *   page with no date and no promise when there is not.
 * - The header link shows only when there is one (site review DT-007). It used
 *   to appear on 20 December on the calendar alone, pointing at a page with
 *   nothing confirmed.
 */

import { unstable_cache } from 'next/cache'
import { anchorAPI, type Event } from '@/lib/api'
import { nowInLondonComponents, parseLondonDate } from '@/lib/time-london'
import { getValentinesDay } from '@/lib/recurring-dates'

const MS_IN_DAY = 24 * 60 * 60 * 1000

/** How long before 14 February the header link may show, when an event is listed. */
export const VALENTINES_PROMO_LEAD_DAYS = 56

/** The year of the next Valentine's Day on or after today's London date. */
export function getNextValentinesYear(now: Date = new Date()): number {
  const { year, month, day } = nowInLondonComponents(now)
  return month > 2 || (month === 2 && day > 14) ? year + 1 : year
}

export function isValentinesCandidate(event: Event): boolean {
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

  return haystack.includes('valentin')
}

/** True from the lead time before 14 February up to and including the day, in London. */
export function isValentinesPromoSeason(now: Date = new Date()): boolean {
  const { year, month, day } = nowInLondonComponents(now)
  const today = Date.UTC(year, month - 1, day)
  const target = parseLondonDate(getValentinesDay(getNextValentinesYear(now))).getTime()
  return today >= target - VALENTINES_PROMO_LEAD_DAYS * MS_IN_DAY && today <= target
}

async function fetchValentinesListed(year: number): Promise<boolean> {
  const response = await anchorAPI.getEvents({
    from_date: `${year}-02-01`,
    to_date: `${year}-02-28`,
    limit: 200,
    status: 'scheduled'
  })
  return (response.events || []).some(isValentinesCandidate)
}

const cachedValentinesListed = unstable_cache(fetchValentinesListed, ['valentines-listed'], { revalidate: 3600 })

/**
 * Is a Valentine's event in the diary for the coming February?
 *
 * Asked by the root layout for the header link, so it is cheap and cannot
 * fail a page: outside the weeks the link could show it answers false without
 * a request, the answer is cached for an hour, and any error is "no".
 */
export async function isValentinesInDiary(now: Date = new Date()): Promise<boolean> {
  if (!isValentinesPromoSeason(now)) return false
  try {
    return await cachedValentinesListed(getNextValentinesYear(now))
  } catch {
    return false
  }
}
