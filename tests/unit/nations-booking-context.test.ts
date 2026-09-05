jest.mock('server-only', () => ({}), { virtual: true })
jest.mock('@/lib/nations-championship/feed', () => ({ getNationsChampionshipFeed: jest.fn() }))
import { getNationsChampionshipFeed } from '@/lib/nations-championship/feed'
import { resolveFixtureBookingContext } from '@/lib/nations-championship/booking-context'
import { composeFixtureNotes, fixtureNotesAllowance, isFixtureArrivalAllowed, fixtureBookingContext } from '@/lib/nations-championship/booking-context-shared'
import { nationsFeed, nationsFixture, approvedNationsFixture, sundayNationsFixture } from '../fixtures/nations-championship'
const getFeed = getNationsChampionshipFeed as jest.Mock
beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date('2026-09-05T07:00:00Z')); getFeed.mockReset().mockResolvedValue(nationsFeed()) })
afterEach(() => jest.useRealTimers())
it('resolves only trusted feed labels and dates', async () => {
  expect(await resolveFixtureBookingContext(nationsFixture().id)).toMatchObject({ label: 'Italy v South Africa', date: '2026-11-07', partial: true })
  expect(await resolveFixtureBookingContext('made-up-label')).toBeNull()
})
it('rejects removed, cancelled and unconfirmed fixtures', async () => {
  for (const fixture of [null, nationsFixture({ matchState: 'cancelled' }), nationsFixture({ screeningDecision: 'unconfirmed' })]) {
    getFeed.mockResolvedValue(nationsFeed(fixture ? [fixture] : []))
    expect(await resolveFixtureBookingContext(nationsFixture().id)).toBeNull()
  }
})
it('propagates feed outages instead of guessing', async () => {
  getFeed.mockRejectedValue(new Error('unavailable'))
  await expect(resolveFixtureBookingContext(nationsFixture().id)).rejects.toThrow()
})
it('retains exact user notes and rejects excess rather than truncating', () => {
  const context = fixtureBookingContext(nationsFixture())!
  expect(composeFixtureNotes(context, '  Near the screen please  ')).toBe(`Nations Championship: Italy v South Africa [${context.fixtureId}]\nNear the screen please`)
  const allowance = fixtureNotesAllowance(context)
  expect(composeFixtureNotes(context, 'x'.repeat(allowance))).toHaveLength(500)
  expect(() => composeFixtureNotes(context, 'x'.repeat(allowance + 1))).toThrow()
})
it('checks the date and actual opening to screening-end interval', () => {
  const context = fixtureBookingContext(nationsFixture())!
  expect(isFixtureArrivalAllowed(context, context.date, '11:40')).toBe(false)
  expect(isFixtureArrivalAllowed(context, context.date, '12:00')).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '13:40')).toBe(false)
  expect(isFixtureArrivalAllowed(context, '2026-11-08', '12:00')).toBe(false)
})
it('converts BST arrival in the business zone and allows food before kick-off', () => {
  const context = { ...fixtureBookingContext(nationsFixture())!, date: '2026-07-04', barStartAt: '2026-07-04T11:00:00Z', screeningEndAt: '2026-07-04T16:00:00Z' }
  expect(isFixtureArrivalAllowed(context, context.date, '11:30')).toBe(false)
  expect(isFixtureArrivalAllowed(context, context.date, '12:00')).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '17:00')).toBe(false)
})

it('accepts owner-approved late arrival until closing without claiming a missed start', () => {
  const context = fixtureBookingContext(approvedNationsFixture(true))!
  expect(context).toMatchObject({ partial: false, untilClosing: true, screeningEndAt: '2026-11-07T22:00:00Z' })
  expect(isFixtureArrivalAllowed(context, context.date, '20:00')).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '20:10')).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '22:00')).toBe(false)
})
it('accepts owner-approved early game from opening only', () => {
  const context = fixtureBookingContext(approvedNationsFixture())!
  expect(context.partial).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '11:40')).toBe(false)
  expect(isFixtureArrivalAllowed(context, context.date, '12:00')).toBe(true)
})

it('carries the Sunday roast menu and verified kitchen times into the booking form', () => {
  const context = fixtureBookingContext(sundayNationsFixture())!
  expect(context.foodMenu).toEqual({ href: '/sunday-roast', label: 'View the Sunday roast menu' })
  expect(context.foodMessage).toContain('1pm to 6pm')
  expect(context.barStartAt).toBe('2026-11-08T12:00:00Z')
})

it('retains normal arrival limits when existing viewers may stay until the finish', () => {
  const fixture = approvedNationsFixture(true)
  fixture.screening.lateFinishPolicy = 'stay_open_if_viewers'
  const context = fixtureBookingContext(fixture)!
  expect(context.lateFinishPolicy).toBe('stay_open_if_viewers')
  expect(context.screeningEndAt).toBe('2026-11-07T22:00:00Z')
  expect(isFixtureArrivalAllowed(context, context.date, '21:30')).toBe(true)
  expect(isFixtureArrivalAllowed(context, context.date, '22:00')).toBe(false)
  expect(isFixtureArrivalAllowed(context, context.date, '22:10')).toBe(false)
})
