import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Handle return from PayPal payment
 * PayPal will redirect here after successful payment
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // PayPal typically sends these params
  const token = searchParams.get('token')
  const payerID = searchParams.get('PayerID')
  const bookingRef = searchParams.get('ref')

  // If we have a booking reference, redirect to confirmation page
  if (bookingRef) {
    return NextResponse.redirect(
      new URL(`/booking-confirmation?ref=${bookingRef}&payment=success`, request.url)
    )
  }

  // Otherwise try to extract from token or redirect to generic success
  return NextResponse.redirect(
    new URL('/booking-confirmation?payment=success', request.url)
  )
}