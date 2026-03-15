'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'

interface Props {
  bookingId: string
  orderId: string
  depositAmount: number    // GBP integer (e.g. 80)
  bookingSummary: string   // e.g. "Sunday 22 March · 1:00pm · 8 guests"
  onSuccess: () => void
  onError: (message: string) => void
}

export function PayPalDepositSection({
  bookingId,
  orderId,
  depositAmount,
  bookingSummary,
  onSuccess,
  onError,
}: Props) {
  const [isPaying, setIsPaying] = useState(false)

  async function handleApprove() {
    setIsPaying(true)
    try {
      const response = await fetch('/api/table-bookings/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, orderId }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        onError(data.error ?? 'Payment failed. Please try again.')
      } else {
        onSuccess()
      }
    } catch {
      onError('Payment could not be processed. Please try again or call us.')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
      <div className="space-y-4">
        <div className="rounded-xl border border-anchor-gold/15 bg-anchor-bg-raised p-4 text-sm space-y-1">
          <p className="font-medium text-anchor-cream-text">{bookingSummary}</p>
          <p className="text-anchor-cream-text/70">
            Deposit: <span className="font-semibold text-anchor-cream-text">£{depositAmount}</span>{' '}
            <span className="text-anchor-cream-text/50">(£10 per person)</span>
          </p>
        </div>

        <PayPalButtons
          style={{ layout: 'vertical', label: 'pay', shape: 'rect' }}
          disabled={isPaying}
          createOrder={() => Promise.resolve(orderId)}
          onApprove={handleApprove}
          onError={() => {
            onError('Payment could not be processed. Please try again or call us.')
          }}
        />

        <p className="text-xs text-anchor-cream-text/50 text-center">
          Your card details are never shared with us. Powered by PayPal.
        </p>
      </div>
    </PayPalScriptProvider>
  )
}
