'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import type { BookingAttributionPayload } from '@/lib/booking-attribution'

interface TableDepositConversionPayload {
  bookingReference?: string | null
  depositAmount?: number | null
  bookingDate?: string | null
  bookingTime?: string | null
  partySize?: number | null
  bookingType?: string | null
  purpose?: string | null
  bookingSource?: string | null
  attribution?: BookingAttributionPayload | null
}

interface Props {
  bookingId: string
  orderId: string
  depositAmount: number    // GBP integer (e.g. 80)
  bookingSummary: string   // e.g. "Sunday 22 March · 1:00pm · 8 guests"
  conversionPayload?: TableDepositConversionPayload
  onSuccess: () => void
  onError: (message: string) => void
}

export function PayPalDepositSection({
  bookingId,
  orderId,
  depositAmount,
  bookingSummary,
  conversionPayload,
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
        body: JSON.stringify({
          bookingId,
          orderId,
          bookingReference: conversionPayload?.bookingReference ?? null,
          depositAmount: conversionPayload?.depositAmount ?? depositAmount,
          bookingDate: conversionPayload?.bookingDate ?? null,
          bookingTime: conversionPayload?.bookingTime ?? null,
          partySize: conversionPayload?.partySize ?? null,
          bookingType: conversionPayload?.bookingType ?? null,
          purpose: conversionPayload?.purpose ?? null,
          bookingSource: conversionPayload?.bookingSource ?? null,
          ...(conversionPayload?.attribution ?? {}),
        }),
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
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: 'GBP' }}>
      <div className="space-y-4">
        <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm space-y-1">
          <p className="font-medium text-ink">{bookingSummary}</p>
          <p className="text-ink-muted">
            Deposit: <span className="font-semibold text-ink">£{depositAmount}</span>{' '}
            <span className="text-ink-muted">(£10 per person)</span>
          </p>
          <p className="text-ink-muted text-xs">This deposit is deducted from your final bill.</p>
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

        <p className="text-xs text-ink-muted text-center">
          Your card details are never shared with us. Powered by PayPal.
        </p>
      </div>
    </PayPalScriptProvider>
  )
}
