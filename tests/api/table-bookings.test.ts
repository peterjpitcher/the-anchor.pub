/**
 * Test file for table booking API routes
 * This verifies that all the API routes are correctly configured
 */

// Test imports to ensure TypeScript compilation
import { GET as getAvailability } from '@/app/api/table-bookings/availability/route'
import { POST as createBooking } from '@/app/api/table-bookings/create/route'
import { GET as getBooking, DELETE as cancelBooking } from '@/app/api/table-bookings/[reference]/route'
import { GET as getSundayMenu } from '@/app/api/table-bookings/menu/sunday-lunch/route'

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

  describe('Sunday Lunch Menu Route', () => {
    it('should export GET handler', () => {
      expect(getSundayMenu).toBeDefined()
      expect(typeof getSundayMenu).toBe('function')
    })
  })
})

// Type checks for API integration
import { anchorAPI } from '@/lib/api'
import type { 
  TableAvailabilityResponse, 
  TableBookingRequest, 
  TableBookingResponse,
  SundayLunchMenuResponse 
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
  const cancellation = await anchorAPI.cancelTableBooking('REF123', 'Changed plans')

  // Get Sunday lunch menu
  const menu: SundayLunchMenuResponse = await anchorAPI.getSundayLunchMenu()
}
