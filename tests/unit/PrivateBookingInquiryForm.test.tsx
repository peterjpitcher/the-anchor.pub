import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PrivateBookingInquiryForm } from '@/components/PrivateBookingInquiryForm'

// Mock the API module
jest.mock('@/lib/api', () => ({
  createPrivateBooking: jest.fn(),
}))

// Mock gtm-events
jest.mock('@/lib/gtm-events', () => ({
  trackPrivateHireEnquiryStarted: jest.fn(),
  trackPrivateHireEnquirySubmitted: jest.fn(),
}))

import { createPrivateBooking } from '@/lib/api'
import { trackPrivateHireEnquirySubmitted } from '@/lib/gtm-events'

const mockCreatePrivateBooking = createPrivateBooking as jest.MockedFunction<typeof createPrivateBooking>
const mockTrack = trackPrivateHireEnquirySubmitted as jest.MockedFunction<typeof trackPrivateHireEnquirySubmitted>

function mockPhoneLookupSuccess() {
  ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/customers/lookup')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              known: false,
              lookup_degraded: false,
              normalized_phone: '+447700900000',
              customer: null,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

describe('PrivateBookingInquiryForm tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPhoneLookupSuccess()
  })

  it('calls trackPrivateHireEnquirySubmitted when createPrivateBooking returns success', async () => {
    mockCreatePrivateBooking.mockResolvedValue({
      success: true,
      data: {} as any,
    })

    render(<PrivateBookingInquiryForm />)

    // Enter a phone number and pass the phone-verification gate.
    // The label is not associated via htmlFor so we query by display value type.
    const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
    fireEvent.change(phoneInput, { target: { value: '07700900000' } })

    const continueButton = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueButton)

    // Wait for lookup to complete and the form details to appear
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    )

    // Fill required name fields (unknown customer path).
    // Labels have no htmlFor/id so we use placeholder-independent text input order.
    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Jane' } })  // First Name
    fireEvent.change(textInputs[1], { target: { value: 'Doe' } })   // Last Name

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(mockTrack).toHaveBeenCalledTimes(1)
    })

    expect(mockTrack).toHaveBeenCalledWith({
      enquiryType: 'Birthday Party', // default value in formData
      guestCount: 50,
      pageSource: expect.any(String),
    })
  })

  it('does NOT call trackPrivateHireEnquirySubmitted when createPrivateBooking returns an error', async () => {
    mockCreatePrivateBooking.mockResolvedValue({
      success: false,
      error: { message: 'Something went wrong' },
    } as any)

    render(<PrivateBookingInquiryForm />)

    const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
    fireEvent.change(phoneInput, { target: { value: '07700900000' } })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    )

    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Jane' } })  // First Name
    fireEvent.change(textInputs[1], { target: { value: 'Doe' } })   // Last Name

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    expect(mockTrack).not.toHaveBeenCalled()
  })
})
