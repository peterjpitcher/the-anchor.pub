import { fixtureFoodMenu } from '@/lib/nations-championship/food-menu'
import { nationsFixture, sundayNationsFixture } from '../fixtures/nations-championship'

it('links Sunday food service to the roast menu without moving kitchen opening to pub opening', () => {
  const fixture = sundayNationsFixture()
  expect(fixtureFoodMenu(fixture)).toEqual({ href: '/sunday-roast', label: 'View the Sunday roast menu' })
  expect(fixture.screening.foodPromotion.message).toContain('1pm to 6pm')
  expect(fixture.hours.bar?.startAt).toBe('2026-11-08T12:00:00Z')
})
it('keeps the regular menu for a Saturday screening', () => {
  expect(fixtureFoodMenu(nationsFixture())?.href).toBe('/food-menu')
})
it('offers Sunday roasts for verified pre-match food', () => {
  const fixture = sundayNationsFixture()
  fixture.screening.foodPromotion.kind = 'before_match'
  fixture.screening.foodPromotion.overlapWindows = []
  expect(fixtureFoodMenu(fixture)?.href).toBe('/sunday-roast')
})
it('does not promote a menu with missing or unknown service windows', () => {
  const fixture = sundayNationsFixture()
  fixture.screening.foodPromotion.overlapWindows = []
  expect(fixtureFoodMenu(fixture)).toBeNull()
  fixture.screening.foodPromotion.kind = 'unknown'
  expect(fixtureFoodMenu(fixture)).toBeNull()
  fixture.hours.kitchenState = 'unknown'
  expect(fixtureFoodMenu(fixture)).toBeNull()
})
it('uses London Sunday when the UTC kickoff is still Saturday', () => {
  const fixture = sundayNationsFixture()
  fixture.kickOffAt = '2026-07-11T23:30:00Z'
  fixture.screening.foodPromotion.overlapWindows = [{ startAt: '2026-07-11T23:30:00Z', endAt: '2026-07-12T00:00:00Z' }]
  expect(fixtureFoodMenu(fixture)?.href).toBe('/sunday-roast')
})
