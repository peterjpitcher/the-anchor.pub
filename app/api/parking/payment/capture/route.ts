import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { anchorAPI } from '@/lib/api'
import { pageFromRequest, reportFailure } from '@/lib/report-failure'
import { GUEST_FALLBACK } from '@/lib/guest-error-messages'

const ROUTE = 'api/parking/payment/capture'

// The guest has already paid PayPal by the time this route runs, so a failure
// here is the most expensive kind on the site: money has moved and the booking
// may not exist. It used to swallow the error with a bare `catch {}`, which
// meant nobody here ever found out. Every exit now logs, and the message
// carries the phone number so the guest can reach a human straight away.
const CAPTURE_FAILED_MESSAGE = GUEST_FALLBACK.parking_payment_capture

function upstreamStatusOf(error: unknown): number | null {
  const status = (error as { status?: unknown } | null)?.status
  return typeof status === 'number' ? status : null
}

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
      await reportFailure({
        route: ROUTE,
        payment: true,
        status: 200,
        reason: 'NO_BOOKING_ID',
        reference: parsed.data.bookingId,
        page: pageFromRequest(request),
      })
      return NextResponse.json({ error: CAPTURE_FAILED_MESSAGE }, { status: 502 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    await reportFailure({
      route: ROUTE,
      payment: true,
      status: upstreamStatusOf(error),
      reason: 'CAPTURE_FAILED',
      upstreamCode: (error as { code?: string } | null)?.code ?? null,
      reference: parsed.data.bookingId,
      page: pageFromRequest(request),
      // Only the code of the thrown error: its message is the booking
      // system's own text and can repeat a guest's details.
      error: { code: (error as { code?: string } | null)?.code },
    })
    return NextResponse.json({ error: CAPTURE_FAILED_MESSAGE }, { status: 502 })
  }
}
