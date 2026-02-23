const mockGetBusinessHours = jest.fn()
const mockCreateTableBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createTableBooking: (...args: unknown[]) => mockCreateTableBooking(...args)
  }
}))

const SUNDAY_HOURS = {
  regularHours: {
    sunday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: {
        opens: '12:00',
        closes: '21:00'
      }
    }
  },
  specialHours: []
} as any

const SUNDAY_MENU_SELECTIONS = [
  {
    custom_item_name: 'Roast Beef',
    item_type: 'main',
    quantity: 1,
    guest_name: 'Guest 1',
    price_at_booking: 19.99
  },
  {
    custom_item_name: 'Roast Chicken',
    item_type: 'main',
    quantity: 1,
    guest_name: 'Guest 2',
    price_at_booking: 18.99
  },
  {
    custom_item_name: 'Roast Pork',
    item_type: 'main',
    quantity: 1,
    guest_name: 'Guest 3',
    price_at_booking: 20.99
  }
]

describe('Booking Submit API - Sunday Deposit Flow', () => {
  let submitBooking: (request: any) => Promise<Response>

  beforeEach(async () => {
    mockGetBusinessHours.mockResolvedValue(SUNDAY_HOURS)
    mockCreateTableBooking.mockReset()

    jest.resetModules()
    ;({ POST: submitBooking } = await import('@/app/api/booking/submit/route'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns canonical fallback deposit amount for pending Sunday lunch payment links', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-PENDING-1',
      status: 'pending_payment',
      state: 'pending_payment',
      next_step_url: 'https://payments.example.com/table/tb-pending-1',
      hold_expires_at: '2026-03-01T12:15:00.000Z',
      confirmation_details: {
        date: '2026-03-01',
        time: '13:00',
        party_size: 3
      }
    })

    const request = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        date: '2026-03-01',
        time: '13:00',
        partySize: 3,
        bookingType: 'sunday_lunch',
        purpose: 'food',
        firstName: 'Pat',
        lastName: 'Guest',
        phone: '07700900000',
        email: 'pat@example.com',
        menuSelections: SUNDAY_MENU_SELECTIONS
      })
    } as any

    const response = await submitBooking(request)

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.payment_required).toBe(true)
    expect(payload.payment_details.payment_url).toBe('https://payments.example.com/table/tb-pending-1')
    expect(payload.payment_details.deposit_amount).toBe(30)
    expect(payload.payment_details.amount).toBe(30)

    expect(mockCreateTableBooking).toHaveBeenCalledTimes(1)
    const [bookingRequest] = mockCreateTableBooking.mock.calls[0]
    expect(bookingRequest.booking_type).toBe('sunday_lunch')
    expect(Array.isArray(bookingRequest.menu_selections)).toBe(true)
    expect(bookingRequest.menu_selections).toHaveLength(3)
  })

  it('returns an error when a pending Sunday lunch booking has no payment link', async () => {
    mockCreateTableBooking.mockResolvedValue({
      booking_reference: 'TB-PENDING-2',
      status: 'pending_payment',
      state: 'pending_payment',
      confirmation_details: {
        date: '2026-03-01',
        time: '13:00',
        party_size: 2
      }
    })

    const request = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        date: '2026-03-01',
        time: '13:00',
        partySize: 2,
        bookingType: 'sunday_lunch',
        purpose: 'food',
        firstName: 'Alex',
        lastName: 'Guest',
        phone: '07700900000',
        email: 'alex@example.com',
        menuSelections: SUNDAY_MENU_SELECTIONS.slice(0, 2)
      })
    } as any

    const response = await submitBooking(request)

    expect(response.status).toBe(502)
    const payload = await response.json()
    expect(payload.success).toBe(false)
    expect(payload.error.code).toBe('PAYMENT_LINK_UNAVAILABLE')
  })
})
