import { render } from '@testing-library/react'

const mockGetParkingBooking = jest.fn()

// The client is replaced for the route and the page, which are handed the
// whole row as they were before this change, so their own handling is what is
// under test. The client itself is tested against the real module.
jest.mock('@/lib/api', () => ({
  ...(jest.requireActual('@/lib/api') as object),
  anchorAPI: { getParkingBooking: (...args: unknown[]) => mockGetParkingBooking(...args) },
}))
jest.mock('@/lib/gtm-events')

import { PUBLIC_PARKING_BOOKING_FIELDS, toPublicParkingBooking } from '@/lib/api/parking'
import { GET } from '@/app/api/parking/bookings/[id]/route'
import ParkingBookingStatusPage, * as statusPage from '@/app/parking/bookings/[id]/page'

/**
 * A parking booking read back from the management app never carries a name, a
 * mobile number or an email address past the site's own client.
 *
 * The management app answers with the whole booking row. The name and email on
 * that row can be the ones already on file for the mobile number typed into
 * the form, and the only key to the read is the booking id, so anyone holding
 * an id was one request from somebody else's details (site review, 7 October
 * 2026). The fix that closes it for good belongs to the management app. These
 * pin the website's half: the details are dropped at the client, again at the
 * read route, and no page prints them.
 */
const FULL_ROW = {
  id: '11111111-1111-4111-8111-111111111111',
  reference: 'PK-TEST1',
  status: 'pending_payment',
  payment_status: 'pending',
  customer_id: 'cus-fixture-1',
  customer_first_name: 'Fixturefirst',
  customer_last_name: 'Fixturelast',
  customer_mobile: '+447700900123',
  customer_email: 'fixture.guest@example.invalid',
  notes: 'Fixture note about the guest',
  vehicle_registration: 'AB12 CDE',
  vehicle_make: 'Ford',
  vehicle_model: 'Focus',
  vehicle_colour: 'Blue',
  start_at: '2026-11-02T08:00:00Z',
  end_at: '2026-11-09T18:00:00Z',
  calculated_price: 75,
  override_price: null,
  payment_due_at: '2026-10-08T08:00:00Z',
  created_at: '2026-10-07T08:00:00Z',
  updated_at: '2026-10-07T08:05:00Z',
  // A field the management app might add later. It stays out until named.
  customer_date_of_birth: '1990-01-01',
}

const PERSONAL = [
  'Fixturefirst',
  'Fixturelast',
  '+447700900123',
  'fixture.guest@example.invalid',
  'Fixture note about the guest',
  'cus-fixture-1',
  '1990-01-01',
  'customer_',
  'notes',
]

function expectNothingPersonal(serialised: string) {
  for (const value of PERSONAL) expect(serialised).not.toContain(value)
}

describe('toPublicParkingBooking', () => {
  it('keeps the reference, times, vehicle, amount and status, and nothing else', () => {
    const cut = toPublicParkingBooking(FULL_ROW)

    expect(Object.keys(cut ?? {}).sort()).toEqual([...PUBLIC_PARKING_BOOKING_FIELDS].sort())
    expect(cut).toMatchObject({
      id: FULL_ROW.id,
      reference: 'PK-TEST1',
      status: 'pending_payment',
      payment_status: 'pending',
      vehicle_registration: 'AB12 CDE',
      start_at: FULL_ROW.start_at,
      end_at: FULL_ROW.end_at,
      calculated_price: 75,
    })
    expectNothingPersonal(JSON.stringify(cut))
  })

  it('names no personal field in its allow-list', () => {
    for (const field of PUBLIC_PARKING_BOOKING_FIELDS) {
      expect(field).not.toMatch(/customer|name|email|mobile|phone|note/i)
    }
  })

  it.each([null, undefined, 'a string', 42, ['an', 'array']])('answers null for %p', value => {
    expect(toPublicParkingBooking(value)).toBeNull()
  })
})

describe('anchorAPI.getParkingBooking', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('hands back the cut booking, whatever the management app sent', async () => {
    const body = JSON.stringify({ success: true, data: FULL_ROW })
    ;(global as any).fetch = jest.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => JSON.parse(body),
      text: async () => body,
    }))

    const { anchorAPI } = jest.requireActual('@/lib/api') as typeof import('@/lib/api')
    const booking = await anchorAPI.getParkingBooking(FULL_ROW.id)

    expect(booking.reference).toBe('PK-TEST1')
    expect(booking.vehicle_registration).toBe('AB12 CDE')
    expectNothingPersonal(JSON.stringify(booking))
  })
})

describe('GET /api/parking/bookings/[id]', () => {
  beforeAll(() => {
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) },
        })
    }
  })

  it('returns no customer field even if the client were to hand it the whole row', async () => {
    mockGetParkingBooking.mockResolvedValue(FULL_ROW)

    const response = await GET(new Request(`https://www.the-anchor.pub/api/parking/bookings/${FULL_ROW.id}`), {
      params: { id: FULL_ROW.id },
    })
    const answer = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(answer.success).toBe(true)
    expect(Object.keys(answer.data).sort()).toEqual([...PUBLIC_PARKING_BOOKING_FIELDS].sort())
    expectNothingPersonal(JSON.stringify(answer))
  })
})

describe('the old parking status page, /parking/bookings/[id]', () => {
  it('prints no name, mobile or email, and keeps the booking id out of its title', async () => {
    mockGetParkingBooking.mockResolvedValue(FULL_ROW)

    const { container } = render(
      await ParkingBookingStatusPage({ params: { id: FULL_ROW.id }, searchParams: {} })
    )

    const text = container.textContent ?? ''
    expect(text).toContain('PK-TEST1')
    expect(text).toContain('AB12 CDE')
    for (const value of ['Fixturefirst', 'Fixturelast', '+447700900123', 'fixture.guest@example.invalid']) {
      expect(container.innerHTML).not.toContain(value)
    }
    expect(text).not.toMatch(/Name:|Mobile:|Email:/)

    expect((statusPage as Record<string, unknown>).generateMetadata).toBeUndefined()
    expect(statusPage.metadata.title).toBe('Your parking booking')
    expect(JSON.stringify(statusPage.metadata)).not.toContain(FULL_ROW.id)
    expect(statusPage.metadata.robots).toBe('noindex, nofollow')
  })
})
