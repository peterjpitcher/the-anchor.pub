/**
 * Cash bingo is "Arrive by 6:30pm"; every other night is "Arrive from"
 * (docs/SSOT.md section 10, site review finding C2-027).
 */
import { getEventArrivalLabel } from '@/lib/event-arrival-label'

describe("the words in front of a night's arrival time", () => {
  it('says "Arrive by" for cash bingo, whose category the management app calls Bingo Night', () => {
    expect(getEventArrivalLabel({ name: 'Cash Bingo', category: { slug: 'bingo-night', name: 'Bingo Night' } })).toBe('Arrive by')
    expect(getEventArrivalLabel({ name: 'Christmas Cash Bingo', category: null })).toBe('Arrive by')
  })

  it('says "Arrive from" for music bingo, the quiz and anything else', () => {
    expect(getEventArrivalLabel({ name: 'Christmas Music Bingo', category: { slug: 'music-bingo', name: 'Music Bingo' } })).toBe('Arrive from')
    expect(getEventArrivalLabel({ name: 'Quiz Night', category: { slug: 'quiz-night', name: 'Quiz Night' } })).toBe('Arrive from')
    expect(getEventArrivalLabel({ name: 'Tasting Night', category: null })).toBe('Arrive from')
    expect(getEventArrivalLabel({})).toBe('Arrive from')
  })
})
