import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Handle return from PayPal payment
 * PayPal will redirect here after successful payment
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/book-table', request.url))
}
