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
