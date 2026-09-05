import { fixtureFoodMenu, type FixtureFoodMenu } from './food-menu'
import { DateTime } from 'luxon'
import { isBookableScreening, type ScreeningFixture } from './types'

export interface FixtureBookingContext {
  fixtureId: string
  label: string
  date: string
  kickoff: string
  barStartAt: string
  screeningEndAt: string
  openingLabel: string
  partial: boolean
  untilClosing?: boolean
  foodMessage: string | null
  foodMenu?: FixtureFoodMenu | null
}

export function fixtureBookingContext(fixture: ScreeningFixture): FixtureBookingContext | null {
  if (!isBookableScreening(fixture) || !fixture.hours.bar || !fixture.screening.screeningEndAt) return null
  return {
    fixtureId: fixture.id,
    label: `${fixture.teamA} v ${fixture.teamB}`,
    date: DateTime.fromISO(fixture.kickOffAt).setZone('Europe/London').toISODate()!,
    kickoff: fixture.kickOffAt,
    barStartAt: fixture.hours.bar.startAt,
    screeningEndAt: fixture.screening.screeningEndAt,
    openingLabel: fixture.screening.openingLabel,
    partial: ['from_opening', 'from_opening_until_closing'].includes(fixture.coverage),
    untilClosing: ['until_closing', 'from_opening_until_closing'].includes(fixture.coverage),
    foodMenu: fixtureFoodMenu(fixture),
    foodMessage: fixture.hours.kitchenState === 'known' && ['during_screening', 'before_match'].includes(fixture.screening.foodPromotion.kind)
      ? fixture.screening.foodPromotion.message : null,
  }
}

export function composeFixtureNotes(context: FixtureBookingContext, customerNotes = ''): string {
  const fixed = `Nations Championship: ${context.label} [${context.fixtureId}]`
  const combined = customerNotes.trim() ? `${fixed}\n${customerNotes.trim()}` : fixed
  if (combined.length > 500) throw new Error('Booking notes are too long')
  return combined
}

export function fixtureNotesAllowance(context: FixtureBookingContext | null): number {
  return context ? Math.max(0, 499 - composeFixtureNotes(context).length) : 500
}

/** Arrival may precede kick-off for food, but never opening or follow the screening. */
export function isFixtureArrivalAllowed(context: FixtureBookingContext, date: string, time: string): boolean {
  if (date !== context.date || !/^\d{2}:\d{2}$/.test(time)) return false
  const arrival = DateTime.fromISO(`${date}T${time}`, { zone: 'Europe/London' })
  return arrival.isValid && arrival.toMillis() >= Date.parse(context.barStartAt) && arrival.toMillis() < Date.parse(context.screeningEndAt)
}

export function fixtureKickoffLabel(context: FixtureBookingContext): string {
  return DateTime.fromISO(context.kickoff).setZone('Europe/London').toFormat('d MMMM yyyy, HH:mm')
}
