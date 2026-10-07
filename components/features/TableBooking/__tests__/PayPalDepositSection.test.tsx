import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PayPalDepositSection } from '../PayPalDepositSection'

// Mock @paypal/react-paypal-js
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PayPalButtons: ({
    onApprove,
    onError,
  }: {
    onApprove: () => void
    onError: (err: Error) => void
  }) => (
    <div>
      <button data-testid="paypal-approve" onClick={() => onApprove()}>
        Pay with PayPal
      </button>
      <button data-testid="paypal-error" onClick={() => onError(new Error('fail'))}>
        Trigger Error
      </button>
    </div>
  ),
}))

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// The section shows a "call us" message instead of the buttons when the PayPal
// client id is missing, so the tests of the buttons need one set.
const ORIGINAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
beforeAll(() => {
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'test-client-id'
})
afterAll(() => {
  if (ORIGINAL_CLIENT_ID === undefined) delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  else process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = ORIGINAL_CLIENT_ID
})

describe('PayPalDepositSection', () => {
  const defaultProps = {
    bookingId: '550e8400-e29b-41d4-a716-446655440000',
    // Walk-in launch threshold: deposit applies at 10+. £10 per person, so 10 guests = £100.
    depositAmount: 100,
    bookingSummary: 'Saturday 23 May · 7:30pm · 10 guests',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    orderId: 'PAYPAL-ORDER-123',
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders booking summary and deposit amount', () => {
    render(<PayPalDepositSection {...defaultProps} />)
    expect(screen.getByText('Saturday 23 May · 7:30pm · 10 guests')).toBeInTheDocument()
    expect(screen.getByText(/£100/)).toBeInTheDocument()
  })

  it('calls onSuccess after successful capture', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-approve').click()

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })

  it('submits conversion attribution with successful capture requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(
      <PayPalDepositSection
        {...defaultProps}
        conversionPayload={{
          bookingReference: 'TB-PAID-123',
          depositAmount: 100,
          bookingDate: '2026-05-23',
          bookingTime: '19:30',
          partySize: 10,
          purpose: 'food',
          bookingSource: 'website',
          attribution: {
            source_url: 'https://www.the-anchor.pub/book-table?utm_campaign=party-booking&short_code=ma-party',
            landing_path: '/book-table',
            utm_source: 'facebook',
            utm_medium: 'paid_social',
            utm_campaign: 'party-booking',
            gclid: 'g-123',
            short_code: 'ma-party',
            attribution_captured_at: '2026-05-23T18:00:00.000Z',
            attribution_updated_at: '2026-05-23T18:20:00.000Z',
          },
        }}
      />,
    )
    screen.getByTestId('paypal-approve').click()

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
    const body = JSON.parse(String(mockFetch.mock.calls[0]?.[1]?.body))
    expect(body).toMatchObject({
      bookingId: defaultProps.bookingId,
      orderId: defaultProps.orderId,
      bookingReference: 'TB-PAID-123',
      depositAmount: 100,
      bookingDate: '2026-05-23',
      bookingTime: '19:30',
      partySize: 10,
      purpose: 'food',
      bookingSource: 'website',
      utm_campaign: 'party-booking',
      gclid: 'g-123',
      short_code: 'ma-party',
    })
  })

  it('calls onError on PayPal error', async () => {
    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-error').click()

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled()
    })
  })

  it('calls onError when capture API returns failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Capture failed' }),
    })

    render(<PayPalDepositSection {...defaultProps} />)
    screen.getByTestId('paypal-approve').click()

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalled()
    })
  })
  // The management app answers some refusals with `error` as an object. The
  // section handed it to the form as it stood, the form rendered it, and React
  // threw: the page was lost at the moment a deposit was owed.
  describe('when the capture does not go through', () => {
    beforeEach(() => {
      defaultProps.onError.mockClear()
      defaultProps.onSuccess.mockClear()
    })

    async function approveWith(response: unknown) {
      mockFetch.mockReset()
      if (response instanceof Error) mockFetch.mockRejectedValueOnce(response)
      else mockFetch.mockResolvedValueOnce(response)

      render(<PayPalDepositSection {...defaultProps} />)
      screen.getByTestId('paypal-approve').click()

      await waitFor(() => expect(defaultProps.onError).toHaveBeenCalledTimes(1))
      const message = defaultProps.onError.mock.calls[0][0]
      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      return message as unknown
    }

    it.each([
      ['an object-shaped error (the shared key ran out of allowance)', { ok: false, status: 429, json: async () => ({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' } }) }],
      ['an object-shaped error (the key was rejected)', { ok: false, status: 401, json: async () => ({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } }) }],
      ['a bare string from a developer', { ok: false, status: 500, json: async () => ({ error: 'Failed to capture PayPal payment. Please try again.' }) }],
      ['a body that is not JSON', { ok: false, status: 502, json: async () => { throw new SyntaxError('Unexpected token <') } }],
      ['a 200 that does not say it succeeded', { ok: true, status: 200, json: async () => ({}) }],
      ['no connection at all', new TypeError('Failed to fetch')],
    ])('hands the form one sentence with the phone number: %s', async (_label, response) => {
      const message = await approveWith(response)

      // A string, so the form can render it.
      expect(typeof message).toBe('string')
      expect(message).toContain('01753 682707')
      // The guest has approved the payment, so "try again" is the wrong advice.
      expect(message).toContain('before paying again')
      expect(message).not.toMatch(/Rate limit|API key|Failed to|Unexpected token|\[object Object\]/)

      // Rendered the way the form renders it: this is what used to throw.
      const { getByRole } = render(<p role="alert">{message as string}</p>)
      expect(getByRole('alert')).toHaveTextContent('01753 682707')
    })

    it('keeps a sentence our own route wrote', async () => {
      const sentence = 'We could not confirm your payment. Please call us on 01753 682707 before paying again, and we will check whether it went through.'
      const message = await approveWith({ ok: false, status: 502, json: async () => ({ success: false, error: sentence }) })

      expect(message).toBe(sentence)
    })
  })

  it('shows the phone number instead of nothing when the PayPal client id is missing', () => {
    const previous = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    delete process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    try {
      render(<PayPalDepositSection {...defaultProps} />)

      expect(screen.getByRole('alert')).toHaveTextContent('01753 682707')
      expect(screen.queryByTestId('paypal-approve')).not.toBeInTheDocument()
    } finally {
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = previous
    }
  })
})
