import { DateTime } from 'luxon'
import type { ScreeningFixture } from './types'

export interface FixtureFoodMenu {
  href: '/sunday-roast' | '/food-menu'
  label: string
}

/** Link only to food service supported by the resolved fixture promotion. */
export function fixtureFoodMenu(fixture: ScreeningFixture): FixtureFoodMenu | null {
  const promotion = fixture.screening.foodPromotion
  if (fixture.hours.kitchenState !== 'known' || !promotion.message) return null
  const windows = promotion.kind === 'during_screening' ? promotion.overlapWindows
    : promotion.kind === 'before_match' ? promotion.serviceWindows : []
  const kickoff = DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London')
  const service = windows.filter(window => {
    const start = DateTime.fromISO(window.startAt).setZone('Europe/London')
    return start.toISODate() === kickoff.toISODate() && Date.parse(window.endAt) > Date.parse(window.startAt)
  })
  if (!service.length) return null
  return kickoff.weekday === 7
    ? { href: '/sunday-roast', label: 'View the Sunday roast menu' }
    : { href: '/food-menu', label: 'View the food menu' }
}
