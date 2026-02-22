import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'

const mockBuildMothersDayBookingUrl = jest.fn(() => '/book-table?mothers-day-fallback')
const mockGetMothersDayEventStartTime = jest.fn(() => '13:00')

jest.mock('@/lib/gtm-events', () => ({
  trackEventBookingStart: jest.fn()
}))

jest.mock('@/lib/mothers-day-booking', () => ({
  buildMothersDayBookingUrl: (...args: unknown[]) => mockBuildMothersDayBookingUrl(...args),
  getMothersDayEventStartTime: (...args: unknown[]) => mockGetMothersDayEventStartTime(...args)
}))

describe('ManagementEventBookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()

      if (url.startsWith('/api/customers/lookup')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              data: {
                known: false,
                lookup_degraded: false
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      if (url === '/api/event-bookings') {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'POLICY_VIOLATION',
                message: 'Sunday lunch only'
              }
            }),
            {
              status: 409,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        )
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })
  })

  it('falls back to buildMothersDayBookingUrl when policy violation has no redirect_to', async () => {
    render(
      <ManagementEventBookingForm
        event={{
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: "Mother's Day Sunday Lunch",
          startDate: '2026-03-15T13:00:00+00:00',
          time: '13:00'
        }}
      />
    )

    fireEvent.change(screen.getByLabelText('Mobile Number'), { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Guest' } })
    fireEvent.click(screen.getByRole('button', { name: 'Book Event' }))

    await waitFor(() =>
      expect(mockBuildMothersDayBookingUrl).toHaveBeenCalledWith({
        partySize: 2,
        time: '13:00'
      })
    )
    expect(mockGetMothersDayEventStartTime).toHaveBeenCalled()
  })
})
