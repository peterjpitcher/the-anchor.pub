import { quizNightEventSeries, bingoEventSeries, specialAnnouncementSchema } from '@/lib/schema'

describe('schema dates', () => {
  it('quizNightEventSeries endDate is in the future', () => {
    const endDate = new Date(quizNightEventSeries.endDate as string)
    expect(endDate.getTime()).toBeGreaterThan(Date.now())
  })

  it('bingoEventSeries endDate is in the future', () => {
    const endDate = new Date(bingoEventSeries.endDate as string)
    expect(endDate.getTime()).toBeGreaterThan(Date.now())
  })

  it('specialAnnouncementSchema expires in the future', () => {
    const expires = new Date(specialAnnouncementSchema.expires as string)
    expect(expires.getTime()).toBeGreaterThan(Date.now())
  })
})
