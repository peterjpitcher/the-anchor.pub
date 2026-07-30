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

function mockPhoneLookup(known = false) {
  ;(global as any).fetch = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/customers/lookup')) {
      return Promise.resolve(
        new Response(
          // The lookup identifies nobody: it answers whether the number is
          // known and nothing else (review F10).
          JSON.stringify({ success: true, data: { known } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

function mockPhoneLookupSuccess() {
  mockPhoneLookup(false)
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

// The privacy fix stopped the lookup returning any personal data, but the name
// and email fields were still hidden for recognised numbers because they used
// to be prefilled from it. Nothing filled them any more, so a regular whose
// number the pub already held filed an enquiry as "Guest" with no email to
// reply to, and AMS stores that verbatim.
describe('PrivateBookingInquiryForm: recognised numbers still give their details', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  async function verifyPhoneAs(known: boolean) {
    mockPhoneLookup(known)
    render(<PrivateBookingInquiryForm />)

    const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
    fireEvent.change(phoneInput, { target: { value: '07700900000' } })
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    )
  }

  it('renders the name and email fields for a recognised number', async () => {
    await verifyPhoneAs(true)

    expect(screen.getByText('Personal Details')).toBeInTheDocument()
    expect(screen.getByText(/First Name/)).toBeInTheDocument()
    expect(screen.getByText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByText(/Email \(Optional\)/)).toBeInTheDocument()
    expect(document.querySelector('input[type="email"]')).toBeInTheDocument()
  })

  it('submits what a recognised guest typed, never a placeholder', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    await verifyPhoneAs(true)

    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Priya' } })
    fireEvent.change(textInputs[1], { target: { value: 'Kaur' } })
    fireEvent.change(document.querySelector('input[type="email"]') as HTMLInputElement, {
      target: { value: 'priya@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => expect(mockCreatePrivateBooking).toHaveBeenCalledTimes(1))
    const payload = mockCreatePrivateBooking.mock.calls[0][0] as unknown as Record<string, unknown>

    expect(payload.customer_first_name).toBe('Priya')
    expect(payload.customer_last_name).toBe('Kaur')
    expect(payload.contact_email).toBe('priya@example.com')
    expect(JSON.stringify(payload)).not.toContain('Guest')
  })

  it('refuses to submit a recognised number with no name, rather than inventing one', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    await verifyPhoneAs(true)

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

  it('never sends a placeholder name on the unrecognised path either', async () => {
    mockCreatePrivateBooking.mockResolvedValue({ success: true, data: {} as any })
    await verifyPhoneAs(false)

    const textInputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Sam' } })
    fireEvent.change(textInputs[1], { target: { value: 'Walker' } })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => expect(mockCreatePrivateBooking).toHaveBeenCalledTimes(1))
    const payload = mockCreatePrivateBooking.mock.calls[0][0] as unknown as Record<string, unknown>

    expect(payload.customer_first_name).toBe('Sam')
    expect(JSON.stringify(payload)).not.toContain('Guest')
  })
})
