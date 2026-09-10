import { anchorAPI } from '@/lib/api'
import { POST } from '@/app/api/events/[id]/availability/route'

/**
 * Availability comes from the management app or it does not come at all.
 *
 * This route used to calculate availability locally whenever the upstream
 * returned 404, 405 or 500, which is precisely during an outage. It was wrong
 * three ways, and all three are pinned below:
 *
 * 1. It invented a capacity, `maximumAttendeeCapacity || 100`. Every real
 *    capacity is 60, so an event whose capacity did not load was published as
 *    holding 100.
 * 2. It read `remainingAttendeeCapacity ?? 0`, so an event whose remaining
 *    count did not load was reported sold out. Together those two produced
 *    "100 booked of 100, 100% full" for an event nobody had booked.
 * 3. It read only the schema.org spelling, the single-spelling bug that
 *    `getEventRemainingCapacity` records as having silenced every scarcity
 *    readout on the site.
 *
 * Underneath all three: local slot maths cannot see tables, joins or private
 * bookings. The site once advertised times when the pub was physically full.
 * A 503 with a phone number is the correct answer to "we do not know".
 */

jest.mock('@/lib/error-handling', () => {
  const actual = jest.requireActual('@/lib/error-handling')
  return { ...actual, logError: jest.fn() }
})

// jsdom has no static Response.json, which NextResponse.json calls. Without
// this the success path throws inside the route and lands in its own catch,
// so a test asserting a 200 would fail for a reason that has nothing to do
// with the code under test.
if (typeof (Response as unknown as { json?: unknown }).json !== 'function') {
  ;(Response as unknown as { json: unknown }).json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    })
}

function request(seats = 2): Request {
  return new Request('http://localhost/api/events/evt-1/availability', {
    method: 'POST',
    body: JSON.stringify({ seats }),
    headers: { 'content-type': 'application/json' },
  })
}

const params = { params: { id: 'evt-1' } }

describe('event availability fails closed', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('passes a real availability answer straight through', async () => {
    jest.spyOn(anchorAPI, 'getEvent').mockResolvedValue({ bookings_enabled: true } as never)
    jest.spyOn(anchorAPI, 'checkEventAvailability').mockResolvedValue({
      available: true,
      remaining: 12,
    } as never)

    const response = await POST(request(), params)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.remaining).toBe(12)
  })

  it.each([404, 405, 500, 503])(
    'returns 503 rather than a locally calculated answer when the upstream fails with %s',
    async (status) => {
      jest.spyOn(anchorAPI, 'getEvent').mockResolvedValue({
        id: 'evt-1',
        bookings_enabled: true,
        // Deliberately unusable: the old fallback turned exactly this into
        // "100 booked of 100, 100% full".
        maximumAttendeeCapacity: undefined,
        remainingAttendeeCapacity: undefined,
      } as never)
      jest
        .spyOn(anchorAPI, 'checkEventAvailability')
        .mockRejectedValue(Object.assign(new Error('upstream down'), { status }))

      const response = await POST(request(), params)
      const body = await response.json()

      expect(response.status).toBe(503)
      // The reply is the error envelope and nothing else: no availability, no
      // capacity, nothing booked, no percentage. The timestamp is checked by
      // type, never by value, because it is the clock: searching the whole
      // reply for "100" failed whenever the time ended in .100 seconds.
      expect(body).toEqual({
        error: expect.any(String),
        status: 503,
        timestamp: expect.any(String),
      })
    }
  )

  it('never invents a capacity when the event record carries none', async () => {
    jest.spyOn(anchorAPI, 'getEvent').mockResolvedValue({
      id: 'evt-1',
      bookings_enabled: true,
    } as never)
    jest
      .spyOn(anchorAPI, 'checkEventAvailability')
      .mockRejectedValue(Object.assign(new Error('not implemented'), { status: 404 }))

    const response = await POST(request(), params)
    const body = JSON.stringify(await response.json())

    // The invented figures the old fallback produced.
    expect(body).not.toContain('capacity')
    expect(body).not.toContain('percentage_full')
    expect(body).not.toContain('booked')
  })

  it('still reports bookings_disabled without consulting availability', async () => {
    jest
      .spyOn(anchorAPI, 'getEvent')
      .mockResolvedValue({ bookings_enabled: false } as never)
    const check = jest.spyOn(anchorAPI, 'checkEventAvailability')

    const response = await POST(request(), params)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.data.reason).toBe('bookings_disabled')
    expect(check).not.toHaveBeenCalled()
  })
})
