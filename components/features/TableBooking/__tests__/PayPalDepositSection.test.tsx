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
})
