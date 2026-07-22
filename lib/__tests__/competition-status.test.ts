import { getCompetitionStatus } from '@/lib/competition-status'

const schedule = {
  openingDateTime: '2026-07-22T00:00:00+01:00',
  closingDateTime: '2026-07-22T19:00:00+01:00'
}

describe('getCompetitionStatus', () => {
  it('returns upcoming before entries open', () => {
    expect(getCompetitionStatus(schedule, new Date('2026-07-21T22:59:59Z'))).toBe('upcoming')
  })

  it('returns open while entries are being accepted', () => {
    expect(getCompetitionStatus(schedule, new Date('2026-07-22T17:59:59Z'))).toBe('open')
  })

  it('returns closed at the closing time', () => {
    expect(getCompetitionStatus(schedule, new Date('2026-07-22T18:00:00Z'))).toBe('closed')
  })
})
