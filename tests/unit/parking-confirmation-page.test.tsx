import { render, screen } from '@testing-library/react'

/**
 * "Parking confirmed" and "Amount paid" are only ever said about a booking the
 * management app reports as paid.
 *
 * The page used to say both for any booking it could find, paid or not, and to
 * thank anyone who opened a made-up address with a green tick and "Thank you
 * for your booking". A guest only lands here after paying, so the real risk was
 * somebody showing staff a "paid" screen for a booking that was not.
 */
const mockGetParkingBooking = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: { getParkingBooking: (...args: unknown[]) => mockGetParkingBooking(...args) },
}))
jest.mock('@/lib/gtm-events')

import ParkingConfirmationPage, { metadata } from '@/app/heathrow-parking/confirmation/[bookingId]/page'

const PAID_BOOKING = {
  id: '11111111-1111-4111-8111-111111111111',
  reference: 'PK-TEST1',
  status: 'confirmed',
  payment_status: 'paid',
  customer_first_name: 'Jane',
  customer_last_name: 'Doe',
  customer_mobile: '+447700900000',
  vehicle_registration: 'AB12 CDE',
  start_at: '2026-11-02T08:00:00Z',
  end_at: '2026-11-09T18:00:00Z',
  calculated_price: 75,
  override_price: null,
  payment_due_at: '2026-10-08T08:00:00Z',
  created_at: '2026-10-07T08:00:00Z',
  updated_at: '2026-10-07T08:05:00Z',
}

async function renderPage(bookingId = PAID_BOOKING.id) {
  render(await ParkingConfirmationPage({ params: Promise.resolve({ bookingId }) }))
}

function expectNotConfirmed() {
  expect(
    screen.getByRole('heading', { level: 1, name: "We can't find a paid booking for that reference" })
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /01753 682707/ })).toHaveAttribute('href', 'tel:+441753682707')

  expect(screen.queryByText(/Parking confirmed/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Amount paid/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Thank you for your booking/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/being processed/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Confirmation text sent/i)).not.toBeInTheDocument()
  // Nothing about a booking that is not theirs to see, and no price.
  expect(screen.queryByText(PAID_BOOKING.reference)).not.toBeInTheDocument()
  expect(screen.queryByText(PAID_BOOKING.vehicle_registration)).not.toBeInTheDocument()
  expect(screen.queryByText(/£/)).not.toBeInTheDocument()
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('parking confirmation page', () => {
  it('a paid booking is confirmed, with the amount paid', async () => {
    mockGetParkingBooking.mockResolvedValue(PAID_BOOKING)

    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Parking confirmed' })).toBeInTheDocument()
    expect(screen.getByText('PK-TEST1')).toBeInTheDocument()
    expect(screen.getByText('Amount paid')).toBeInTheDocument()
    expect(screen.getByText('£75.00')).toBeInTheDocument()
    expect(screen.queryByText(/can't find a paid booking/i)).not.toBeInTheDocument()
  })

  it('a completed stay that was paid for still reads as confirmed', async () => {
    mockGetParkingBooking.mockResolvedValue({ ...PAID_BOOKING, status: 'completed' })

    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Parking confirmed' })).toBeInTheDocument()
    expect(screen.getByText('Amount paid')).toBeInTheDocument()
  })

  it.each([
    ['still waiting for payment', { status: 'pending_payment', payment_status: 'pending' }],
    ['a failed payment', { status: 'pending_payment', payment_status: 'failed' }],
    ['expired unpaid', { status: 'expired', payment_status: 'expired' }],
    ['cancelled', { status: 'cancelled', payment_status: 'pending' }],
    ['cancelled and refunded', { status: 'cancelled', payment_status: 'refunded' }],
    // Each half on its own is not enough.
    ['confirmed but not recorded as paid', { status: 'confirmed', payment_status: 'pending' }],
    ['paid but cancelled', { status: 'cancelled', payment_status: 'paid' }],
    // A value this code has never seen is not a yes.
    ['an unknown status', { status: 'on_hold', payment_status: 'paid' }],
    ['no status at all', { status: undefined, payment_status: undefined }],
  ])('%s is not shown as confirmed or paid', async (_label, state) => {
    mockGetParkingBooking.mockResolvedValue({ ...PAID_BOOKING, ...state })

    await renderPage()

    expectNotConfirmed()
  })

  it('a reference that does not exist gets the plain message, not a thank you', async () => {
    mockGetParkingBooking.mockRejectedValue(Object.assign(new Error('Parking booking not found'), { status: 404 }))

    await renderPage('not-a-real-booking')

    expectNotConfirmed()
  })

  it('a lookup that fails gets the plain message and the phone number', async () => {
    mockGetParkingBooking.mockRejectedValue(Object.assign(new Error('upstream down'), { status: 503 }))

    await renderPage()

    expectNotConfirmed()
  })

  it('an empty answer gets the plain message', async () => {
    mockGetParkingBooking.mockResolvedValue(null)

    await renderPage()

    expectNotConfirmed()
  })

  it('does not say "confirmed" in the page title, which is set before the booking is read', () => {
    expect(String(metadata.title)).not.toMatch(/confirmed/i)
    expect(metadata.robots).toEqual({ index: false })
  })
})
