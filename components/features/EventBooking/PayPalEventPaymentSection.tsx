'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import type { BookingAttributionPayload } from '@/lib/booking-attribution'

export interface EventPaymentConversionPayload {
  eventId: string
  eventSlug?: string | null
  eventName: string
  eventCategoryName?: string | null
  eventCategorySlug?: string | null
  eventDate?: string | null
  tickets: number
  value: number | null
  foodIntent: string | null
  attribution?: BookingAttributionPayload | null
}

interface Props {
  bookingId: string
  bookingSummary: string
  fallbackUrl?: string | null
  conversionPayload: EventPaymentConversionPayload
  onSuccess: () => void
  onManualReview: () => void
  onError: (message: string) => void
}

type PaymentState = 'idle' | 'creating' | 'paying' | 'manual_review' | 'error'

export function PayPalEventPaymentSection({
  bookingId,
  bookingSummary,
  fallbackUrl,
  conversionPayload,
  onSuccess,
  onManualReview,
  onError,
}: Props) {
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    return (
      <div className="mt-3 rounded-sm border border-line bg-surface p-3 text-sm text-ink">
        <p>Online payment is temporarily unavailable.</p>
        {fallbackUrl ? (
          <p className="mt-2">
            <a className="font-semibold underline" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
              Open payment link
            </a>
          </p>
        ) : null}
      </div>
    )
  }

  async function handleApprove(paypalOrderId: string) {
    setPaymentState('paying')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/event-bookings/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          bookingId,
          orderId: paypalOrderId,
          eventId: conversionPayload.eventId,
          eventSlug: conversionPayload.eventSlug ?? null,
          eventName: conversionPayload.eventName,
          eventCategoryName: conversionPayload.eventCategoryName ?? null,
          eventCategorySlug: conversionPayload.eventCategorySlug ?? null,
          eventDate: conversionPayload.eventDate ?? null,
          tickets: conversionPayload.tickets,
          value: conversionPayload.value,
          foodIntent: conversionPayload.foodIntent,
          ...(conversionPayload.attribution ?? {}),
        }),
      })
      const data = await response.json().catch(() => null)

      if (response.ok && data?.success === true) {
        onSuccess()
        return
      }

      if (response.status === 202 || data?.state === 'manual_review') {
        setPaymentState('manual_review')
        onManualReview()
        return
      }

      const message = data?.error || 'Payment could not be confirmed. Please try again or call us.'
      setErrorMessage(message)
      setPaymentState('error')
      onError(message)
    } catch {
      const message = 'Payment could not be processed. Please try again or call us.'
      setErrorMessage(message)
      setPaymentState('error')
      onError(message)
    }
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'GBP', intent: 'capture' }}>
      <div className="mt-3 space-y-3">
        <div className="rounded-sm border border-line bg-surface p-3 text-sm">
          <p className="font-semibold text-ink">{bookingSummary}</p>
          <p className="text-ink-muted">Pay with PayPal to confirm your booking.</p>
        </div>

        {paymentState === 'error' ? (
          <p className="text-sm text-anchor-danger">{errorMessage || 'Payment failed. Please try again.'}</p>
        ) : null}

        {paymentState === 'manual_review' ? (
          <p className="text-sm font-semibold text-accent-text">
            Payment received. Staff need to check your booking before confirming.
          </p>
        ) : (
          <PayPalButtons
            style={{ layout: 'vertical', label: 'pay', shape: 'rect' }}
            disabled={paymentState === 'creating' || paymentState === 'paying'}
            createOrder={async () => {
              setPaymentState('creating')
              setErrorMessage(null)
              const response = await fetch('/api/event-bookings/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ bookingId }),
              })
              const data = await response.json().catch(() => null)
              if (!response.ok || !data?.orderId) {
                const message = data?.error || 'Could not start PayPal payment.'
                setErrorMessage(message)
                setPaymentState('error')
                throw new Error(message)
              }
              setOrderId(data.orderId)
              setPaymentState('paying')
              return data.orderId
            }}
            onApprove={async (data) => {
              const approvedOrderId = data.orderID || orderId
              if (!approvedOrderId) {
                const message = 'PayPal did not return an order ID.'
                setErrorMessage(message)
                setPaymentState('error')
                onError(message)
                return
              }
              await handleApprove(approvedOrderId)
            }}
            onCancel={() => setPaymentState('idle')}
            onError={() => {
              const message = 'PayPal encountered an error. Please try again.'
              setErrorMessage(message)
              setPaymentState('error')
              onError(message)
            }}
          />
        )}

        {paymentState === 'creating' || paymentState === 'paying' ? (
          <p className="text-center text-xs text-ink-muted">Processing payment, please wait.</p>
        ) : null}

        {fallbackUrl ? (
          <p className="text-center text-xs text-ink-muted">
            If PayPal does not load,{' '}
            <a className="underline" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
              open the payment link
            </a>
            .
          </p>
        ) : null}
      </div>
    </PayPalScriptProvider>
  )
}
