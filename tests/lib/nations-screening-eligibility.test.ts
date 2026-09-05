import { isBookableScreening } from '@/lib/nations-championship/types'
import { nationsFixture } from '../fixtures/nations-championship'

const now = new Date('2026-09-05T07:00:00Z')
it('allows an early game from current opening', () => {
  expect(isBookableScreening(nationsFixture(), now)).toBe(true)
})
it.each(['before_opening', 'after_closing', 'missing_channel', 'stale_hours', 'missing_planned_end'])('rejects inconsistent feed promises: %s', problem => {
  const fixture = nationsFixture()
  if (problem === 'before_opening') fixture.screening.screeningStartAt = fixture.kickOffAt
  if (problem === 'after_closing') fixture.hours.bar!.endAt = '2026-11-07T13:00:00Z'
  if (problem === 'missing_channel') fixture.linearChannel = null
  if (problem === 'stale_hours') fixture.screening.hoursFingerprint = 'old-hours'
  if (problem === 'missing_planned_end') fixture.plannedEndAt = null
  expect(isBookableScreening(fixture, now)).toBe(false)
})
