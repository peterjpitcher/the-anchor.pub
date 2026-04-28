/**
 * Test file for table booking API routes
 * This verifies that all the API routes are correctly configured
 */

// Test imports to ensure TypeScript compilation
import { GET as getAvailability } from '@/app/api/table-bookings/availability/route'
import { POST as createBooking } from '@/app/api/table-bookings/create/route'
import { GET as getBooking, DELETE as cancelBooking } from '@/app/api/table-bookings/[reference]/route'

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

  describe('Booking Details Route', () => {
    it('should export GET and DELETE handlers', () => {
      expect(getBooking).toBeDefined()
      expect(typeof getBooking).toBe('function')
      expect(cancelBooking).toBeDefined()
      expect(typeof cancelBooking).toBe('function')
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

  // Get booking
  const bookingDetails: TableBookingResponse = await anchorAPI.getTableBooking(
    'REF123',
    'guest@example.com'
  )

  // Cancel booking
  const cancellation = await anchorAPI.cancelTableBooking('REF123', {
    reason: 'Changed plans',
    customerEmail: 'guest@example.com'
  })
}
