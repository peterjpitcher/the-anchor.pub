import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PayPalEventPaymentSection } from '../PayPalEventPaymentSection'

// The ticket payment box had no test while the table deposit box did (BK-124, customer bookings
// review of 24 October 2026). Modelled on TableBooking/__tests__/PayPalDepositSection.test.tsx.

// The real PayPal buttons need the PayPal script. These stand-ins drive the same callbacks.
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PayPalButtons: ({
    createOrder,
    onApprove,
    onError,
  }: {
    createOrder: () => Promise<string>
    onApprove: (data: { orderID?: string }) => Promise<void>
    onError: (err: Error) => void
  }) => (
    <div>
      <button data-testid="paypal-create" onClick={() => createOrder().catch(() => undefined)}>
        Start
      </button>
      <button data-testid="paypal-approve" onClick={() => onApprove({ orderID: 'PAYPAL-ORDER-1' })}>
        Pay with PayPal
      </button>
      <button data-testid="paypal-error" onClick={() => onError(new Error('fail'))}>
        Trigger Error
      </button>
    </div>
  ),
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

const ORIGINAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
beforeAll(() => {
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
})
afterAll(() => {
  if (ORIGINAL_CLIENT_ID === undefined) delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  else process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = ORIGINAL_CLIENT_ID
})

const BOOKING_ID = '550e8400-e29b-41d4-a716-446655440000'

function renderSection(overrides: Partial<React.ComponentProps<typeof PayPalEventPaymentSection>> = {}) {
  const props: React.ComponentProps<typeof PayPalEventPaymentSection> = {
    bookingId: BOOKING_ID,
    bookingSummary: 'Quiz night · 2 tickets · £80',
    conversionPayload: {
      eventId: 'event-1',
      eventSlug: 'quiz-night',
      eventName: 'Quiz night',
      tickets: 2,
      value: 80,
      foodIntent: null,
    },
    onSuccess: jest.fn(),
    onManualReview: jest.fn(),
    onError: jest.fn(),
    ...overrides,
  }
  render(<PayPalEventPaymentSection {...props} />)
  return props
}

describe('PayPalEventPaymentSection', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('shows the booking summary and the refund rules', () => {
    renderSection()
    expect(screen.getByText('Quiz night · 2 tickets · £80')).toBeInTheDocument()
    expect(screen.getByText(/7 or more days before/)).toBeInTheDocument()
  })

  it('confirms the booking after a successful capture, sending the booking and order', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, state: 'confirmed' }) })
    const props = renderSection()

    fireEvent.click(screen.getByTestId('paypal-approve'))

    await waitFor(() => expect(props.onSuccess).toHaveBeenCalledTimes(1))
    expect(mockFetch).toHaveBeenCalledWith('/api/event-bookings/paypal/capture-order', expect.objectContaining({ method: 'POST' }))
    const body = JSON.parse(String(mockFetch.mock.calls[0]?.[1]?.body))
    expect(body).toMatchObject({ bookingId: BOOKING_ID, orderId: 'PAYPAL-ORDER-1', tickets: 2, value: 80 })
    expect(props.onError).not.toHaveBeenCalled()
  })

  it('does not send contact details without marketing consent', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) })
    const props = renderSection({
      conversionPayload: { eventId: 'event-1', eventName: 'Quiz night', tickets: 2, value: 80, foodIntent: null, email: 'guest@example.com', phone: '07700900000' },
    })

    fireEvent.click(screen.getByTestId('paypal-approve'))

    await waitFor(() => expect(props.onSuccess).toHaveBeenCalled())
    const body = JSON.parse(String(mockFetch.mock.calls[0]?.[1]?.body))
    expect(body.email).toBeUndefined()
    expect(body.phone).toBeUndefined()
  })

  it.each([
    ['a 202 answer', { ok: true, status: 202, json: async () => ({ success: false, state: 'manual_review' }) }],
    ['a manual review state', { ok: false, status: 409, json: async () => ({ success: false, state: 'manual_review' }) }],
  ])('tells the guest staff will check the booking after %s, and offers no second payment', async (_label, response) => {
    mockFetch.mockResolvedValueOnce(response)
    const props = renderSection()

    fireEvent.click(screen.getByTestId('paypal-approve'))

    await waitFor(() => expect(props.onManualReview).toHaveBeenCalledTimes(1))
    expect(screen.getByText(/Staff need to check your booking/)).toBeInTheDocument()
    expect(screen.queryByTestId('paypal-approve')).not.toBeInTheDocument()
    expect(props.onSuccess).not.toHaveBeenCalled()
  })

  describe('when the capture does not go through', () => {
    it.each([
      ['a bare reason code', { ok: false, status: 409, json: async () => ({ success: false, error: 'capture_amount_mismatch' }) }],
      ['a server error', { ok: false, status: 500, json: async () => ({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }) }],
      ['a body that is not JSON', { ok: false, status: 502, json: async () => { throw new SyntaxError('Unexpected token <') } }],
      ['a 200 that does not say it succeeded', { ok: true, status: 200, json: async () => ({}) }],
      ['no connection at all', new TypeError('Failed to fetch')],
    ])('hands the guest one sentence with the phone number and no "try again": %s', async (_label, response) => {
      if (response instanceof Error) mockFetch.mockRejectedValueOnce(response)
      else mockFetch.mockResolvedValueOnce(response)
      const props = renderSection()

      fireEvent.click(screen.getByTestId('paypal-approve'))

      await waitFor(() => expect(props.onError).toHaveBeenCalledTimes(1))
      const message = (props.onError as jest.Mock).mock.calls[0][0]
      expect(typeof message).toBe('string')
      expect(message).toContain('01753 682707')
      // PayPal approved the payment before this ran, so they are told to ring before paying again.
      expect(message).toContain('before paying again')
      expect(message).not.toMatch(/try again|capture_amount_mismatch|Internal server|Unexpected token|Failed to fetch/i)
      expect(screen.getByText(message)).toBeInTheDocument()
      expect(props.onSuccess).not.toHaveBeenCalled()
    })
  })

  it('keeps a sentence the website route wrote', async () => {
    const sentence = 'We could not confirm this payment. Please call 01753 682707 before paying again, so you are not charged twice.'
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ success: false, error: sentence }) })
    const props = renderSection()

    fireEvent.click(screen.getByTestId('paypal-approve'))

    await waitFor(() => expect(props.onError).toHaveBeenCalledWith(sentence))
  })

  it('shows a sentence, not a code, when the order cannot be started', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 410, json: async () => ({ success: false, error: 'hold_expired' }) })
    renderSection()

    fireEvent.click(screen.getByTestId('paypal-create'))

    await waitFor(() => expect(screen.getByText(/01753 682707/)).toBeInTheDocument())
    expect(screen.queryByText('hold_expired')).not.toBeInTheDocument()
  })

  it('offers the payment link instead of the buttons when the PayPal client id is missing', () => {
    const previous = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    try {
      renderSection({ fallbackUrl: 'https://management.example.test/g/token/event-payment' })
      expect(screen.getByText('Online payment is temporarily unavailable.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Open payment link' })).toHaveAttribute('href', 'https://management.example.test/g/token/event-payment')
      expect(screen.queryByTestId('paypal-approve')).not.toBeInTheDocument()
    } finally {
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = previous
    }
  })

  // BK-185: PayPal calls onError straight after createOrder throws. The reason createOrder found
  // used to be replaced by "PayPal encountered an error. Please try again.", which cannot work for
  // a hold that has run out.
  it('passes the hold-expired reason to the form when PayPal reports the failed order', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 410, json: async () => ({ success: false, error: 'hold_expired' }) })
    const props = renderSection()

    fireEvent.click(screen.getByTestId('paypal-create'))
    await waitFor(() => expect(screen.getByText(/run out/)).toBeInTheDocument())
    fireEvent.click(screen.getByTestId('paypal-error'))

    expect(props.onError).toHaveBeenCalledTimes(1)
    const message = (props.onError as jest.Mock).mock.calls[0][0]
    expect(message).toMatch(/run out/)
    expect(message).not.toMatch(/PayPal encountered an error/)
  })

  it('uses the general line only when no order failure explains the error', () => {
    const props = renderSection()

    fireEvent.click(screen.getByTestId('paypal-error'))

    expect(props.onError).toHaveBeenCalledWith('PayPal encountered an error. Please try again.')
  })

  // BK-100: the deadline beside the buttons, on the London clock.
  it('says when to pay by, in London time', () => {
    renderSection({ holdExpiresAt: '2026-07-03T18:42:00Z' })
    expect(screen.getByText('Pay with PayPal by 7:42pm to confirm your booking.')).toBeInTheDocument()
  })

  it('takes the deadline the order step reports', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ orderId: 'ORDER-1', holdExpiresAt: '2026-11-20T19:15:00Z' }) })
    renderSection({ holdExpiresAt: '2026-11-20T19:10:00Z' })

    fireEvent.click(screen.getByTestId('paypal-create'))

    await waitFor(() => expect(screen.getByText('Pay with PayPal by 7:15pm to confirm your booking.')).toBeInTheDocument())
  })
})
