import { NextRequest, NextResponse } from 'next/server'
import { PRIVATE_NO_STORE_HEADERS } from '@/lib/api-cache-policy'

export const dynamic = 'force-dynamic'

/**
 * Handle return from PayPal payment.
 * PayPal appends PayerID on success; it is absent when the user cancels.
 */
export async function GET(request: NextRequest) {
  const payerId = request.nextUrl.searchParams.get('PayerID')

  if (!payerId) {
    // User cancelled the PayPal flow, send them back to the booking form
    return NextResponse.redirect(new URL('/book-table?payment=cancelled', request.url), {
      headers: PRIVATE_NO_STORE_HEADERS,
    })
  }

  // Which way this goes depends on one guest's payment, so it is never stored:
  // a kept redirect would send the next guest the previous guest's answer.
  return NextResponse.redirect(new URL('/book-table', request.url), {
    headers: PRIVATE_NO_STORE_HEADERS,
  })
}
