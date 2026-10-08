/**
 * Test file for table booking API routes
 * This verifies that all the API routes are correctly configured
 */

// Test imports to ensure TypeScript compilation
import { GET as getAvailability } from '@/app/api/table-bookings/availability/route'
import fs from 'fs'
import path from 'path'
import { POST as createBooking } from '@/app/api/table-bookings/route'

describe('Table Booking API Routes', () => {
  beforeEach(() => {
    // Mock environment variable
    process.env.ANCHOR_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
  })

  describe('Availability Route', () => {
    it('should export GET handler', () => {
      expect(getAvailability).toBeDefined()
      expect(typeof getAvailability).toBe('function')
    })

    it('should require date, time, and party_size parameters', async () => {
      const request = { url: 'http://localhost:3000/api/table-bookings/availability' } as any
      const response = await getAvailability(request)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('required parameters')
    })
  })

  describe('Create Booking Route', () => {
    it('should export POST handler', () => {
      expect(createBooking).toBeDefined()
      expect(typeof createBooking).toBe('function')
    })
  })

  describe('Booking addresses nothing on the site used', () => {
    // Deleted on 8 October 2026 (site review PY-009 and WP-015, owner decision 20).
    // The cancel address could only ever answer 501, the alias re-exported the
    // real route, and the parking POST created a booking the management app
    // treated as made by staff. A deleted route answers 404.
    it.each([
      'app/api/table-bookings/[reference]/route.ts',
      'app/api/table-bookings/create/route.ts',
      'app/api/parking/bookings/route.ts',
      'app/api/booking/payment-return/route.ts'
    ])('%s is gone', (file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false)
    })
  })

  describe('Other addresses nothing on the site used', () => {
    // Deleted on 8 October 2026 (the rest of site review finding WP-015, owner
    // answer of that day). Nothing in app, components, lib, content, the
    // redirect rules or the management app called or linked any of them.
    // /api/calendar/event/[id], which the Add to calendar button uses, stays.
    it.each([
      'app/api/calendar/upcoming/route.ts',
      'app/api/reviews/status/route.ts',
      'app/api/events/[id]/availability/route.ts'
    ])('%s is gone', (file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false)
    })

    it('keeps the addresses the site does use', () => {
      for (const file of [
        'app/api/calendar/event/[id]/route.ts',
        'app/api/reviews/route.ts',
        'app/api/events/[id]/route.ts',
        'app/api/events/route.ts',
        // The uptime monitor watches this one from outside, so no code calls it.
        'app/api/health/route.ts'
      ]) {
        expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true)
      }
    })
  })
})

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

describe('Table Booking Route - Party Size Validation', () => {
  let createTableBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    ;(global as any).fetch = jest.fn()

    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    delete process.env.ANCHOR_API_KEY
    jest.clearAllMocks()
  })

  it('rejects party size above 20 with a clear error message', async () => {
    const request = {
      json: async () => ({
        phone: '07700900000',
        date: '2026-03-22',
        time: '19:00',
        party_size: 21,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toMatch(/party size|between 1 and 20/i)
    // Must not reach the management API
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  // Owner decision 4. The form puts `max` on its date input, but a browser
  // attribute is not a control: this is the check that actually binds, for any
  // caller at all.
  it('rejects a date more than twelve months ahead, before it reaches AMS', async () => {
    const { maxBookingIsoDate } = await import('@/lib/table-booking/horizon')
    const { londonNowParts } = await import('@/lib/table-booking-service-windows')
    const { addDays } = await import('@/lib/table-booking/formatting')
    const beyondHorizon = addDays(maxBookingIsoDate(londonNowParts().isoDate), 1)

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: beyondHorizon,
        time: '19:00',
        party_size: 4,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(String(data.error)).toMatch(/12 months/i)
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled()
  })

  it('does not refuse the last date inside the horizon', async () => {
    const { maxBookingIsoDate } = await import('@/lib/table-booking/horizon')
    const { londonNowParts } = await import('@/lib/table-booking-service-windows')
    const lastAllowed = maxBookingIsoDate(londonNowParts().isoDate)

    const request = {
      json: async () => ({
        phone: '07700900000',
        date: lastAllowed,
        time: '19:00',
        party_size: 4,
        purpose: 'food'
      }),
      headers: new Headers()
    } as any

    const response = await createTableBooking(request)
    const data = await response.json()

    // It may still be refused for other reasons (service windows, upstream),
    // but never for the horizon.
    expect(String(data?.error ?? '')).not.toMatch(/12 months/i)
  })
})

// Type checks for API integration
import { anchorAPI } from '@/lib/api'
import type {
  TableAvailabilityResponse,
  TableBookingRequest,
  TableBookingResponse
} from '@/lib/api'

// Ensure methods exist on anchorAPI
const typeChecks = async () => {
  // Check availability
  const availability: TableAvailabilityResponse = await anchorAPI.checkTableAvailability({
    date: '2024-01-20',
    time: '19:00',
    party_size: 4
  })

  // Create booking
  const bookingRequest: TableBookingRequest = {
    booking_type: 'regular',
    date: '2024-01-20',
    time: '19:00',
  party_size: 4,
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    mobile_number: '07700900000'
  },
    celebration_type: 'birthday'
  }
  const booking: TableBookingResponse = await anchorAPI.createTableBooking(bookingRequest)

}
