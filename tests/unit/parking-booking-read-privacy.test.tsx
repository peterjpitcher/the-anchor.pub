import fs from 'fs'
import path from 'path'

import { anchorAPI } from '@/lib/api'
import { PUBLIC_PARKING_BOOKING_FIELDS, toPublicParkingBooking } from '@/lib/api/parking'

/**
 * A parking booking read back from the management app never carries a name, a
 * mobile number or an email address past the site's own client.
 *
 * The management app answers with the whole booking row. The name and email on
 * that row can be the ones already on file for the mobile number typed into
 * the form, and the only key to the read is the booking id, so anyone holding
 * an id was one request from somebody else's details (site review, 7 October
 * 2026). The fix that closes it for good belongs to the management app. These
 * pin the website's half: the details are dropped at the client, which is the
 * only way a page gets a booking. The old read route and the old status page,
 * which nothing on the site used, were deleted on 8 October 2026 (PY-009).
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

    const booking = await anchorAPI.getParkingBooking(FULL_ROW.id)

    expect(booking.reference).toBe('PK-TEST1')
    expect(booking.vehicle_registration).toBe('AB12 CDE')
    expectNothingPersonal(JSON.stringify(booking))
  })
})

describe('the old read route and the old status page', () => {
  // Deleted on 8 October 2026 (site review PY-009). Neither was linked, called
  // or sent to a guest, and each was one more place a booking id alone opened
  // a booking. The confirmation page is the only read left.
  it.each(['app/api/parking/bookings/[id]', 'app/parking/bookings/[id]', 'app/parking'])(
    '%s is gone',
    folder => {
      expect(fs.existsSync(path.join(process.cwd(), folder))).toBe(false)
    }
  )

  it('leaves one page reading a parking booking, the confirmation page', () => {
    const readers: string[] = []
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (/\.tsx?$/.test(entry.name) && fs.readFileSync(full, 'utf8').includes('getParkingBooking(')) {
          readers.push(path.relative(process.cwd(), full))
        }
      }
    }
    for (const top of ['app', 'components']) walk(path.join(process.cwd(), top))

    expect(readers).toEqual(['app/heathrow-parking/confirmation/[bookingId]/page.tsx'])
  })
})
