/**
 * BK-192 (customer bookings review, 24 October 2026). Old event addresses landed on 'not found'.
 * The management app now says where an unknown address lives: a renamed event redirects
 * permanently, and a gone night sends the visitor to the next one of the same name.
 */

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('NOT_FOUND') }),
  permanentRedirect: jest.fn((url: string) => { throw new Error(`PERMANENT:${url}`) }),
  redirect: jest.fn((url: string) => { throw new Error(`TEMPORARY:${url}`) }),
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api')
  return {
    ...actual,
    anchorAPI: {
      getEvent: jest.fn(),
      getMovedEventAddress: jest.fn(),
    },
  }
})

import EventPage from '@/app/events/[id]/page'
import { anchorAPI } from '@/lib/api'

const getEvent = anchorAPI.getEvent as jest.Mock
const getMoved = anchorAPI.getMovedEventAddress as jest.Mock

describe('event page for an old address', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getEvent.mockRejectedValue({ message: 'Event not found', status: 404 })
  })

  it('redirects a renamed event permanently to its current address', async () => {
    getMoved.mockResolvedValue({ slug: 'pub-quiz-2026-11-04', reason: 'renamed' })
    await expect(EventPage({ params: { id: 'quiz-night-2026-11-04' } })).rejects.toThrow('PERMANENT:/events/pub-quiz-2026-11-04')
  })

  it('sends a gone night, temporarily, to the next one of the same name', async () => {
    getMoved.mockResolvedValue({ slug: 'pub-quiz-2026-11-04', reason: 'next_in_series' })
    await expect(EventPage({ params: { id: 'quiz-night-2026-09-16' } })).rejects.toThrow('TEMPORARY:/events/pub-quiz-2026-11-04?from=passed')
  })

  it('still answers not found when there is nowhere to send the visitor', async () => {
    getMoved.mockResolvedValue(null)
    await expect(EventPage({ params: { id: 'no-such-night' } })).rejects.toThrow('NOT_FOUND')
  })
})
