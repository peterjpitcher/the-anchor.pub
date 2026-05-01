import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Handle return from PayPal payment.
 * PayPal appends PayerID on success; it is absent when the user cancels.
 */
export async function GET(request: NextRequest) {
  const payerId = request.nextUrl.searchParams.get('PayerID')

  if (!payerId) {
    // User cancelled the PayPal flow, send them back to the booking form
    return NextResponse.redirect(new URL('/book-table?payment=cancelled', request.url))
  }

  return NextResponse.redirect(new URL('/book-table', request.url))
}
