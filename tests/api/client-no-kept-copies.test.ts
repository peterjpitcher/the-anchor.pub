import { anchorAPI } from '@/lib/api'

/**
 * What the website keeps of its own calls to the management app.
 *
 * On the server every call gets a five minute lifetime unless it asks for
 * something else, and Next keeps any fetch that carries a lifetime above zero,
 * whatever its method. So a parking booking read twice inside five minutes gave
 * the first answer twice (a guest who had just paid could be told they had
 * not), live parking spaces were up to five minutes old, and a payment capture
 * carried a lifetime too.
 *
 * The client only sets a lifetime when there is no `window`, so these run with
 * it taken away, which is how the server sees it.
 */
describe('anchorAPI: nothing personal, live or written is kept', () => {
  const originalFetch = global.fetch
  const originalWindow = (globalThis as any).window
  let fetchMock: jest.Mock

  const lastFetchOptions = () =>
    fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1] as RequestInit & {
      next?: { revalidate?: number }
    }

  beforeEach(() => {
    fetchMock = jest.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: {} }),
      text: async () => JSON.stringify({ success: true, data: {} }),
    }))
    ;(global as any).fetch = fetchMock
    delete (globalThis as any).window
  })

  afterEach(() => {
    ;(globalThis as any).window = originalWindow
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('is running as the server would (no window)', () => {
    expect(typeof window).toBe('undefined')
  })

  it("a parking booking is read fresh every time: it is one customer's details and a live payment state", async () => {
    await anchorAPI.getParkingBooking('11111111-1111-4111-8111-111111111111')

    expect(String(fetchMock.mock.calls[0][0])).toContain('/parking/bookings/11111111-1111-4111-8111-111111111111')
    expect(lastFetchOptions().next).toEqual({ revalidate: 0 })
  })

  it('parking availability is read fresh every time', async () => {
    await anchorAPI.getParkingAvailability({ start: '2026-11-02', end: '2026-11-09' })

    expect(String(fetchMock.mock.calls[0][0])).toContain('/parking/availability')
    expect(lastFetchOptions().next).toEqual({ revalidate: 0 })
  })

  it('a payment capture is never kept', async () => {
    await anchorAPI.captureParkingPayment('ORDER-1', 'booking-1')

    expect(lastFetchOptions().method).toBe('POST')
    expect(lastFetchOptions().next).toEqual({ revalidate: 0 })
  })

  it('no write is kept, whichever one it is', async () => {
    await anchorAPI.createParkingPaymentOrder({} as any, 'idem-1')

    expect(lastFetchOptions().method).toBe('POST')
    expect(lastFetchOptions().next).toEqual({ revalidate: 0 })
  })

  it('a catalogue read keeps its five minute lifetime', async () => {
    await anchorAPI.getMenuSpecials()

    expect(lastFetchOptions().next).toEqual({ revalidate: 300 })
  })
})
