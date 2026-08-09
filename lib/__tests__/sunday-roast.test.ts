import { getSundayRoastContent, getSundayRoastStatus } from '@/lib/sunday-roast'

describe('Sunday roast availability copy', () => {
  it('uses launch copy before 17 May 2026', () => {
    const now = new Date('2026-04-30T12:00:00+01:00')

    expect(getSundayRoastStatus(now)).toBe('pre-launch')
    expect(getSundayRoastContent(now).availabilityLong).toBe(
      'Sunday roast starts Sunday 17 May 2026. Until then, our normal Sunday menu is available.'
    )
  })

  it('uses live copy from 17 May 2026', () => {
    const now = new Date('2026-05-17T12:00:00+01:00')
    const content = getSundayRoastContent(now)

    expect(content.status).toBe('live')
    expect(content.availabilityLong).toContain('Sunday roast served Sundays, 1pm to 6pm.')
    expect(content.availabilityLong).toContain('Groups of 15 or more')
  })
})
