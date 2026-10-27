import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMITS, limitByAddress, tooManyRequests } from '@/lib/rate-limit'
import { pageFromRequest, scrubPagePath } from '@/lib/report-failure'
import { recordBookingFormSignal, type BookingFormSignalRecord } from '@/lib/booking-funnel-report'

/**
 * Counts the event booking form opening, being submitted, being blocked and sending (BK-191),
 * as one log line each and a count in the management app, so a form that has stopped working
 * shows up as "opened, never sent". See lib/booking-form-signal.ts for what is and is not sent.
 *
 * Everything is checked against a fixed list and anything else is dropped, so nothing a visitor
 * typed can be logged or sent on. The page comes from the Referer header, stripped of ids and
 * query strings by the same rule the failure reporter uses. Always answers 204: the form does
 * not wait for, or read, the answer.
 */

const FORMS = new Set(['event_booking'])
const STEPS = new Set(['opened', 'submit_pressed', 'blocked', 'sent'])
const REASONS = new Set(['missing_fields', 'no_security_token', 'server_refused', 'network'])
const LOG_PREFIX = '[booking-form-signal]'

function pick(value: unknown, allowed: Set<string>): string | null {
  return typeof value === 'string' && allowed.has(value) ? value : null
}

export async function POST(request: NextRequest) {
  const rateLimit = limitByAddress(request, 'booking-form-signal', RATE_LIMITS.beacon)
  if (rateLimit.limited) return tooManyRequests(rateLimit, { error: 'Too many requests' })

  let body: Record<string, unknown> = {}
  try {
    const parsed = (await request.json()) as unknown
    if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const form = pick(body.form, FORMS)
  const step = pick(body.step, STEPS)
  if (form && step) {
    const reason = step === 'blocked' ? pick(body.reason, REASONS) : null
    const page = scrubPagePath(pageFromRequest(request)) ?? null
    try {
      // console.warn, because the production build strips console.log and console.info.
      console.warn(`${LOG_PREFIX} ${JSON.stringify({ form, step, reason, page })}`)
    } catch {
      // A log line must never be what fails.
    }
    await recordBookingFormSignal({
      form: form as BookingFormSignalRecord['form'],
      step: step as BookingFormSignalRecord['step'],
      reason: reason as BookingFormSignalRecord['reason'],
      page
    })
  }

  return new NextResponse(null, { status: 204 })
}
