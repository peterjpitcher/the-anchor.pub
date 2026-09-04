import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'
import { logError } from '@/lib/error-handling'

// The guest has already paid PayPal by the time this route runs, so a failure
// here is the most expensive kind on the site: money has moved and the booking
// may not exist. It used to swallow the error with a bare `catch {}`, which
// meant nobody here ever found out. Every exit now logs, and the message
// carries the phone number so the guest can reach a human straight away.
const CAPTURE_FAILED_MESSAGE =
  'We could not confirm your parking payment. Please call 01753 682707 before paying again, and we will check whether payment was taken.'

const CaptureSchema = z.object({
  orderID: z.string().min(1),
  bookingId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CaptureSchema.safeParse(body)
  if (!parsed.success) {
    // Zod v4 uses .issues; fall back to .errors for older versions
    const issues = parsed.error.issues ?? (parsed.error as { errors?: { message: string }[] }).errors
    return NextResponse.json(
      { error: issues?.[0]?.message || 'Invalid payload' },
      { status: 400 }
    )
  }

  try {
    const result = await anchorAPI.captureParkingPayment(parsed.data.orderID, parsed.data.bookingId)

    // A capture with no booking reference is not an answer we can trust, so it
    // must not be handed back as a 200. The wizard reads booking_id to build
    // the confirmation URL: returning success without one sent the guest to a
    // confirmation page for a booking that might not exist.
    if (!result || typeof result !== 'object' || !(result as { booking_id?: unknown }).booking_id) {
      logError('api/parking/payment/capture', new Error('Capture response had no booking_id'), {
        bookingId: parsed.data.bookingId,
      })
      return NextResponse.json({ error: CAPTURE_FAILED_MESSAGE }, { status: 502 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    logError('api/parking/payment/capture', error, { bookingId: parsed.data.bookingId })
    return NextResponse.json({ error: CAPTURE_FAILED_MESSAGE }, { status: 502 })
  }
}
