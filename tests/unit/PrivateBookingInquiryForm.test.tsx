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

// The form makes no request of its own before the enquiry is sent: the number
// is no longer looked up first (review BK-107). Any fetch at all is a failure.
function failOnAnyFetch(): jest.Mock {
  const fetchMock = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
  ;(global as any).fetch = fetchMock
  return fetchMock
}

function typePhone(value = '07700900000') {
  const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
  fireEvent.change(phoneInput, { target: { value } })
}

describe('PrivateBookingInquiryForm tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    failOnAnyFetch()
  })

  it('calls trackPrivateHireEnquirySubmitted when createPrivateBooking returns success', async () => {
    mockCreatePrivateBooking.mockResolvedValue({
      success: true,
      data: {} as any,
    })

    render(<PrivateBookingInquiryForm />)
    typePhone()

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
    typePhone()

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

// The form used to look the number up before showing anything else, greet a
// customer it recognised ("Welcome back") and hold the enquiry back until the
// lookup answered, which told anyone typing a number whether it belonged to a
// customer (review BK-107, owner decision D31). Every box is now on screen
// from the start, nothing is checked, and the management API matches the
// customer by phone when the enquiry arrives.
describe('PrivateBookingInquiryForm: no number check', () => {
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock = failOnAnyFetch()
  })

  it('shows the name, email and phone boxes and the send button from the start', () => {
    render(<PrivateBookingInquiryForm />)

    expect(document.querySelector('input[type="tel"]')).not.toBeDisabled()
    expect(screen.getByText('Personal Details')).toBeInTheDocument()
    expect(screen.getByText(/First Name/)).toBeInTheDocument()
    expect(screen.getByText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByText(/Email \(Optional\)/)).toBeInTheDocument()
    expect(document.querySelector('input[type="email"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^continue$/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/already in our system/i)).not.toBeInTheDocument()
  })

  it('sends what the guest typed without looking the number up, and never greets anyone', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    render(<PrivateBookingInquiryForm />)

    typePhone('07700900000')
    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Priya' } })
    fireEvent.change(textInputs[1], { target: { value: 'Kaur' } })
    fireEvent.change(document.querySelector('input[type="email"]') as HTMLInputElement, {
      target: { value: 'priya@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => expect(mockCreatePrivateBooking).toHaveBeenCalledTimes(1))
    const payload = mockCreatePrivateBooking.mock.calls[0][0] as unknown as Record<string, unknown>

    expect(payload.contact_phone).toBe('07700900000')
    expect(payload.customer_first_name).toBe('Priya')
    expect(payload.customer_last_name).toBe('Kaur')
    expect(payload.contact_email).toBe('priya@example.com')
    // The service notice and its tick boxes are what this form shows (review BK-080).
    expect(payload.communication_consent).toMatchObject({ notice_key: 'service_notice_v6' })
    expect(JSON.stringify(payload)).not.toContain('Guest')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/New customer detected/i)).not.toBeInTheDocument()
  })

  it('refuses to submit with no name, rather than inventing one', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    render(<PrivateBookingInquiryForm />)
    typePhone()

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    // Nothing is sent. The name inputs are marked required, so the browser's
    // own constraint validation stops the submit first; the handler's check is
    // the backstop for anything that gets past it. Either way the guest is
    // asked for a name and no placeholder reaches AMS.
    await waitFor(() => expect(mockCreatePrivateBooking).not.toHaveBeenCalled())

    const textInputs = document.querySelectorAll('input[type="text"]')
    expect((textInputs[0] as HTMLInputElement).required).toBe(true)
    expect((textInputs[1] as HTMLInputElement).required).toBe(true)
    expect((textInputs[0] as HTMLInputElement).value).toBe('')
  })

  it('asks for the number when the guest sends without one', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    render(<PrivateBookingInquiryForm />)

    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Sam' } })
    fireEvent.change(textInputs[1], { target: { value: 'Walker' } })
    // Past the browser's own check, to reach the handler's.
    fireEvent.submit(screen.getByRole('button', { name: /send inquiry/i }).closest('form') as HTMLFormElement)

    expect(await screen.findByText('Please enter your mobile number.')).toBeInTheDocument()
    expect(mockCreatePrivateBooking).not.toHaveBeenCalled()
  })
})
