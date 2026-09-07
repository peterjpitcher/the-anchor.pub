import { anchorAPI } from '@/lib/api/client'
import {
  combineEventsReadResults,
  getRecentEvents,
  getUpcomingEvents,
  getUpcomingEventsByCategory,
  readRecentEvents,
  readUpcomingEvents,
  readUpcomingEventsByCategories,
  readUpcomingEventsByCategory,
  type Event,
  type EventsReadResult
} from '@/lib/api/events'

/**
 * An empty diary and a broken diary must not look the same.
 *
 * The three list helpers used to catch everything and return `[]`, so a page
 * had no way to tell "nothing is on this week" from "the management API is
 * down". This suite injects the failure at the `anchorAPI` boundary, beneath
 * the helpers, which is the only level at which the difference actually exists.
 */

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

const getEventsSpy = jest.spyOn(anchorAPI, 'getEvents')

const DAY_MS = 24 * 60 * 60 * 1000

function futureEvent(id: string, daysAhead = 7): Event {
  return {
    '@type': 'Event',
    id,
    slug: id,
    name: `Test event ${id}`,
    description: 'Fixture',
    startDate: new Date(Date.now() + daysAhead * DAY_MS).toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'The Anchor, Stanwell Moor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Horton Road',
        addressLocality: 'Stanwell Moor',
        addressRegion: 'Surrey',
        postalCode: 'TW19 6AQ',
        addressCountry: 'GB'
      }
    }
  }
}

function pastEvent(id: string, daysBack = 3): Event {
  return { ...futureEvent(id), startDate: new Date(Date.now() - daysBack * DAY_MS).toISOString() }
}

function listResponse(events: Event[]) {
  return { events, pagination: { total: events.length, limit: 100, offset: 0 } }
}

/** The shape lib/api/client.ts actually throws on a non-ok upstream response. */
function upstreamError(status: number) {
  return { code: 'API_EVENTS_ERROR', status, message: `Failed to load events list (${status})` }
}

/** What an aborted fetch surfaces as: an Error with no status at all. */
function timeoutError() {
  return new Error('The operation was aborted due to timeout')
}

beforeEach(() => {
  getEventsSpy.mockReset()
})

afterAll(() => {
  getEventsSpy.mockRestore()
})

describe('a loaded but empty diary', () => {
  it.each([
    ['readUpcomingEvents', () => readUpcomingEvents(10)],
    ['readRecentEvents', () => readRecentEvents(10)],
    ['readUpcomingEventsByCategory', () => readUpcomingEventsByCategory('quiz-nights', 10)]
  ])('%s reports ok, not a failure', async (_name, read) => {
    getEventsSpy.mockResolvedValue(listResponse([]))

    const result = await read()

    expect(result.status).toBe('ok')
    expect(result.events).toEqual([])
    expect(result.failure).toBeUndefined()
  })

  it('reports ok when events are returned', async () => {
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1')]))

    const result = await readUpcomingEvents(10)

    expect(result.status).toBe('ok')
    expect(result.events).toHaveLength(1)
  })
})

describe('an upstream that fails', () => {
  it.each([500, 502, 503, 429])('reports HTTP %s as unavailable and transient', async status => {
    getEventsSpy.mockRejectedValue(upstreamError(status))

    const result = await readUpcomingEvents(10)

    expect(result.status).toBe('unavailable')
    expect(result.failure).toBe('transient')
    expect(result.events).toEqual([])
  })

  it('reports a timeout as unavailable and transient, never as an empty diary', async () => {
    getEventsSpy.mockRejectedValue(timeoutError())

    const result = await readUpcomingEvents(10)

    expect(result.status).toBe('unavailable')
    expect(result.failure).toBe('transient')
  })

  it('reports a definite 404 as not-found, using the shared error-kind taxonomy', async () => {
    getEventsSpy.mockRejectedValue({ status: 404, message: 'Not found' })

    const result = await readUpcomingEvents(10)

    expect(result.status).toBe('unavailable')
    expect(result.failure).toBe('not-found')
  })

  it('reports a failed recent-events read as unavailable', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    const result = await readRecentEvents(10)

    expect(result).toMatchObject({ status: 'unavailable', failure: 'transient', events: [] })
  })

  it('reports a failed category read as unavailable', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    const result = await readUpcomingEventsByCategory('quiz-nights', 10)

    expect(result).toMatchObject({ status: 'unavailable', failure: 'transient', events: [] })
  })

  it('treats a missing category id as a gap, not a verified empty diary', async () => {
    const result = await readUpcomingEventsByCategory('', 10)

    expect(result.status).toBe('unavailable')
    expect(result.failure).toBe('not-found')
    expect(getEventsSpy).not.toHaveBeenCalled()
  })
})

describe('a 200 carrying a payload that is not an events list', () => {
  it.each([
    ['no events key', {}],
    ['a null body', null],
    ['events set to null', { events: null }],
    ['events as an object', { events: { 0: futureEvent('quiz-1') } }],
    ['an error envelope', { success: false, error: { message: 'Unable to load events list' } }]
  ])('reports %s as unavailable and invalid-payload', async (_name, payload) => {
    // The client types this as EventsResponse, so a malformed body has to be
    // cast in. That is exactly the point: the type says it cannot happen and
    // the wire does it anyway, which is why the runtime check exists.
    getEventsSpy.mockResolvedValue(payload as unknown as ReturnType<typeof listResponse>)

    const result = await readUpcomingEvents(10)

    expect(result.status).toBe('unavailable')
    expect(result.failure).toBe('invalid-payload')
    expect(result.events).toEqual([])
  })

  it('reports an invalid payload on the recent-events read too', async () => {
    getEventsSpy.mockResolvedValue({} as unknown as ReturnType<typeof listResponse>)

    const result = await readRecentEvents(10)

    expect(result).toMatchObject({ status: 'unavailable', failure: 'invalid-payload' })
  })
})

describe('a fan-out where only some categories fail', () => {
  it('reports partial, and still hands back what did load', async () => {
    getEventsSpy.mockImplementation(async params => {
      if (params?.category_id === 'quiz-nights') return listResponse([futureEvent('quiz-1')])
      throw upstreamError(503)
    })

    const result = await readUpcomingEventsByCategories(['quiz-nights', 'music-bingo'], 10)

    expect(result.status).toBe('partial')
    expect(result.failure).toBe('transient')
    expect(result.events.map(event => event.id)).toEqual(['quiz-1'])
  })

  it('reports unavailable when every category fails', async () => {
    getEventsSpy.mockRejectedValue(upstreamError(503))

    const result = await readUpcomingEventsByCategories(['quiz-nights', 'music-bingo'], 10)

    expect(result.status).toBe('unavailable')
    expect(result.events).toEqual([])
  })

  it('reports ok when every category loads, and de-duplicates a shared event', async () => {
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1')]))

    const result = await readUpcomingEventsByCategories(['quiz-nights', 'music-bingo'], 10)

    expect(result.status).toBe('ok')
    expect(result.failure).toBeUndefined()
    expect(result.events).toHaveLength(1)
  })

  it('treats an empty category list as a gap, not an empty diary', async () => {
    const result = await readUpcomingEventsByCategories([], 10)

    expect(result.status).toBe('unavailable')
    expect(getEventsSpy).not.toHaveBeenCalled()
  })

  describe('combineEventsReadResults', () => {
    const ok = (id: string): EventsReadResult => ({ status: 'ok', events: [futureEvent(id)] })
    const down: EventsReadResult = { status: 'unavailable', events: [], failure: 'transient' }

    it('is ok only when nothing failed', () => {
      expect(combineEventsReadResults([ok('a'), ok('b')]).status).toBe('ok')
    })

    it('is partial when one of several failed', () => {
      expect(combineEventsReadResults([ok('a'), down]).status).toBe('partial')
    })

    it('stays partial when an input was itself partial', () => {
      const half: EventsReadResult = { status: 'partial', events: [futureEvent('b')], failure: 'transient' }
      expect(combineEventsReadResults([ok('a'), half]).status).toBe('partial')
    })

    it('is unavailable only when everything failed', () => {
      expect(combineEventsReadResults([down, down]).status).toBe('unavailable')
    })
  })
})

describe('the existing Event[] helpers are unchanged', () => {
  it('getUpcomingEvents still returns a bare array on success and on failure', async () => {
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1')]))
    await expect(getUpcomingEvents(5)).resolves.toHaveLength(1)

    getEventsSpy.mockRejectedValue(upstreamError(503))
    await expect(getUpcomingEvents(5)).resolves.toEqual([])
  })

  it('getRecentEvents still returns a bare array on success and on failure', async () => {
    getEventsSpy.mockResolvedValue(listResponse([pastEvent('quiz-old')]))
    await expect(getRecentEvents(5)).resolves.toHaveLength(1)

    getEventsSpy.mockRejectedValue(timeoutError())
    await expect(getRecentEvents(5)).resolves.toEqual([])
  })

  it('getUpcomingEventsByCategory still returns a bare array, including for a blank id', async () => {
    getEventsSpy.mockResolvedValue(listResponse([futureEvent('quiz-1')]))
    await expect(getUpcomingEventsByCategory('quiz-nights', 5)).resolves.toHaveLength(1)

    await expect(getUpcomingEventsByCategory('', 5)).resolves.toEqual([])

    getEventsSpy.mockRejectedValue(upstreamError(500))
    await expect(getUpcomingEventsByCategory('quiz-nights', 5)).resolves.toEqual([])
  })
})

describe('the query window is a Europe/London calendar date', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('asks from today in London, not yesterday in UTC, just after midnight BST', async () => {
    // 00:30 on 1 July in London is still 30 June in UTC. Asking from 30 June
    // offers evenings that have already finished.
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T23:30:00Z'))
    getEventsSpy.mockResolvedValue(listResponse([]))

    await readUpcomingEvents(10, 7)

    expect(getEventsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ from_date: '2026-07-01', to_date: '2026-07-08' })
    )
  })

  it('walks the recent window back by London calendar days', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-30T23:30:00Z'))
    getEventsSpy.mockResolvedValue(listResponse([]))

    await readRecentEvents(10, 30)

    expect(getEventsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ from_date: '2026-06-01', to_date: '2026-07-01' })
    )
  })
})
