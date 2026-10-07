'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import type { BookingAttributionPayload } from '@/lib/booking-attribution'
import { GUEST_FALLBACK, toGuestMessage } from '@/lib/guest-error-messages'

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
  /** Raw contact details. Sent only with marketing consent, so the server can hash them. */
  email?: string | null
  phone?: string | null
}

/** UK default, matching the booking forms' hardcoded dialling code. */
const DEFAULT_COUNTRY_CODE = '44'

interface Props {
  bookingId: string
  orderId: string
  depositAmount: number    // GBP integer (e.g. 80)
  bookingSummary: string   // e.g. "Sunday 22 March · 1:00pm · 8 guests"
  /**
   * When the deposit is refunded, shown beside the pay button. The form passes
   * the group deposit bands, and nothing for a Christmas sitting, whose own
   * refund terms it has already shown.
   */
  refundNote?: string
  conversionPayload?: TableDepositConversionPayload
  onSuccess: () => void
  onError: (message: string) => void
}

export function PayPalDepositSection({
  bookingId,
  orderId,
  depositAmount,
  bookingSummary,
  refundNote,
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
          // PII minimisation: only send contact details when the visitor granted
          // marketing consent, since their only purpose is Meta advanced matching.
          ...(conversionPayload?.attribution?.meta_consent_granted === true
            ? {
                email: conversionPayload.email ?? null,
                phone: conversionPayload.phone ?? null,
                default_country_code: DEFAULT_COUNTRY_CODE,
              }
            : {}),
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        // The guest has approved the payment by now, so whatever went wrong
        // they are told to ring before paying again. `error` can arrive as an
        // object; it is turned into a sentence before it reaches the form.
        onError(toGuestMessage(data?.error, 'table_deposit_capture'))
      } else {
        onSuccess()
      }
    } catch {
      onError(GUEST_FALLBACK.table_deposit_capture)
    } finally {
      setIsPaying(false)
    }
  }

  // Without the client id PayPal loads nothing: no button and no message. The
  // event payment step already says so; this one left the guest looking at a
  // deposit summary with no way to pay it.
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!clientId) {
    return (
      <div role="alert" className="rounded-md border border-line bg-surface-sunk p-4 text-sm text-ink">
        <p>Online payment is not available just now. Please call 01753 682707 and we will take your deposit over the phone.</p>
      </div>
    )
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: 'GBP' }}>
      <div className="space-y-4">
        <div className="rounded-md border border-line bg-surface-sunk p-4 text-sm space-y-1">
          <p className="font-medium text-ink">{bookingSummary}</p>
          <p className="text-ink-muted">
            Deposit: <span className="font-semibold text-ink">£{depositAmount}</span>{' '}
            <span className="text-ink-muted">(£10 per person)</span>
          </p>
          <p className="text-ink-muted text-xs">This deposit is deducted from your final bill.</p>
          {refundNote ? <p className="text-ink-muted text-xs">{refundNote}</p> : null}
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
