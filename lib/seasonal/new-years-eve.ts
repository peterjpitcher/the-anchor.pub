/**
 * Whether there is food on New Year's Eve, for /new-years-eve.
 *
 * The page used to say "We usually serve food earlier in the evening" and
 * "Book your table if you're planning to dine" as fixed text, while the kitchen
 * was shut for the whole of the Christmas break (site review P13, C1-004 and
 * DT-001).
 *
 * Three answers, in order of authority:
 * 1. The live hours row for 31 December, when the feed carries one. The feed
 *    only looks 90 days ahead, so this is visible from early October.
 * 2. The kitchen's festive break as the SSOT holds it
 *    (lib/festive-kitchen-closure.ts), which covers the rest of the year.
 * 3. Otherwise unknown. The page then makes no food promise at all and asks
 *    people to call. It never falls back to "usually".
 */

import { getEffectiveDayHours, isKitchenClosed } from '@/lib/hours-utils'
import { getFestiveKitchenWording, getNextNewYearsEve } from '@/lib/festive-kitchen-closure'
import { CONTACT } from '@/lib/constants'

export type NewYearsEveFood = 'closed' | 'open' | 'unknown'

type HoursLike = {
  regularHours?: Parameters<typeof getEffectiveDayHours>[1]
  specialHours?: Parameters<typeof getEffectiveDayHours>[2]
  upcomingVersions?: Parameters<typeof getEffectiveDayHours>[3]
} | null | undefined

export function resolveNewYearsEveFood(now: Date = new Date(), hours?: HoursLike): NewYearsEveFood {
  const { date, kitchenShutForBreak } = getNextNewYearsEve(now)

  const liveRow = hours?.specialHours?.find((special) => special.date === date)
  if (liveRow && hours?.regularHours) {
    const effective = getEffectiveDayHours(date, hours.regularHours, hours.specialHours, hours.upcomingVersions)
    return isKitchenClosed(effective) ? 'closed' : 'open'
  }

  return kitchenShutForBreak ? 'closed' : 'unknown'
}

export interface NewYearsEveFoodCopy {
  state: NewYearsEveFood
  /** The Food and drink paragraph. */
  paragraph: string
  /** The answer to "Is food available on New Year's Eve?". */
  faqAnswer: string
  /** The "At a glance" bullet, or null when there is nothing safe to say in five words. */
  glance: string | null
}

export function getNewYearsEveFoodCopy(now: Date = new Date(), hours?: HoursLike): NewYearsEveFoodCopy {
  const state = resolveNewYearsEveFood(now, hours)

  if (state === 'closed') {
    // The dated sentence is only true of the year the SSOT closure covers.
    const dated = getNextNewYearsEve(now).kitchenShutForBreak ? getFestiveKitchenWording() : null
    const sentence = `There's no food on New Year's Eve: our kitchen is closed.${dated ? ` ${dated}` : ''}`
    return {
      state,
      paragraph: `${sentence} The bar is open until 1am.`,
      faqAnswer: `No. Our kitchen is closed on New Year's Eve.${dated ? ` ${dated}` : ''} The bar is open until 1am.`,
      glance: 'No food: the kitchen is closed'
    }
  }

  if (state === 'open') {
    const line = `Our kitchen is open on New Year's Eve. Call us on ${CONTACT.phone} for the kitchen times before you plan your evening.`
    return { state, paragraph: line, faqAnswer: `Yes. ${line}`, glance: 'Kitchen open, call for times' }
  }

  const line = `Kitchen times for New Year's Eve are set nearer the date. Call us on ${CONTACT.phone} before you plan to eat here.`
  return { state, paragraph: line, faqAnswer: line, glance: null }
}
