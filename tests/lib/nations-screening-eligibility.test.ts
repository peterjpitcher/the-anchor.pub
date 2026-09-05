import { isBookableScreening, screeningFixtureSchema } from '@/lib/nations-championship/types'
import { nationsFixture, approvedNationsFixture } from '../fixtures/nations-championship'

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

it.each([false, true])('accepts owner approval without exact channel or final whistle, closing only: %s', closingOnly => {
  expect(isBookableScreening(approvedNationsFixture(closingOnly), now)).toBe(true)
})
it.each(['not_showing', 'not_linear', 'cancelled', 'finished', 'hours_unknown', 'no_broadcast_check', 'no_approval_time', 'unclipped_end', 'stale_hours'])('owner approval still rejects %s', veto => {
  const fixture = approvedNationsFixture(true)
  if (veto === 'not_showing') fixture.screeningDecision = 'not_showing'
  if (veto === 'not_linear') fixture.broadcastDecision = 'not_linear'
  if (veto === 'cancelled' || veto === 'finished') fixture.matchState = veto
  if (veto === 'hours_unknown') fixture.hours.state = 'unknown'
  if (veto === 'no_broadcast_check') fixture.broadcastCheckedAt = null
  if (veto === 'no_approval_time') fixture.screeningConfirmedAt = null
  if (veto === 'unclipped_end') fixture.screening.screeningEndAt = '2026-11-07T22:10:00Z'
  if (veto === 'stale_hours') fixture.screening.hoursFingerprint = 'old'
  expect(isBookableScreening(fixture, now)).toBe(false)
})
it('defaults old feeds to no owner approval', () => {
  const { bookingApproved: _approval, ...legacy } = nationsFixture()
  expect(screeningFixtureSchema.parse(legacy).bookingApproved).toBe(false)
})

it('preserves optional late policy without extending or reopening booking eligibility', () => {
  const fixture = approvedNationsFixture(true)
  fixture.screening.lateFinishPolicy = 'stay_open_if_viewers'
  expect(screeningFixtureSchema.parse(fixture).screening.lateFinishPolicy).toBe('stay_open_if_viewers')
  expect(isBookableScreening(fixture, now)).toBe(true)
  expect(isBookableScreening(fixture, new Date('2026-11-07T22:00:00Z'))).toBe(false)
  fixture.screening.screeningEndAt = '2026-11-07T22:10:00Z'
  expect(isBookableScreening(fixture, now)).toBe(false)
})
