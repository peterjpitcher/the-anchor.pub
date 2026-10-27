import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMITS, limitByAddress, tooManyRequests } from '@/lib/rate-limit'

/**
 * Counts the Christmas enquiry forms opening, being submitted and being blocked (BK-190), as one
 * log line each, so a form that has silently stopped working shows up in the server logs as
 * "opened, never submitted". See lib/christmas-enquiry-signal.ts for what is and is not sent.
 *
 * Everything is checked against a fixed list and anything else is dropped, so the line can never
 * carry what a visitor typed. Always answers 204: the form does not wait for, or read, the answer.
 */

const STAGES = new Set(['opened', 'submit_pressed', 'blocked', 'sent'])
const FORMS = new Set(['main', 'quick'])
const MODES = new Set(['meal', 'party'])
const REASONS = new Set(['missing_fields', 'date', 'courses', 'consent', 'no_security_token', 'server_refused', 'network'])

function pick(value: unknown, allowed: Set<string>): string | null {
  return typeof value === 'string' && allowed.has(value) ? value : null
}

export async function POST(request: NextRequest) {
  const rateLimit = limitByAddress(request, 'christmas-enquiry-signal', RATE_LIMITS.beacon)
  if (rateLimit.limited) return tooManyRequests(rateLimit, { error: 'Too many requests' })

  let body: Record<string, unknown> = {}
  try {
    const parsed = (await request.json()) as unknown
    if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const stage = pick(body.stage, STAGES)
  const form = pick(body.form, FORMS)
  if (stage && form) {
    // console.warn, not console.info: next.config.js strips every console call from the
    // production build except error and warn, so an info line would record nothing.
    // It is a record, not a warning (as app/api/web-vitals/route.ts).
    console.warn(
      '[christmas-enquiry-signal]',
      JSON.stringify({
        stage,
        form,
        mode: pick(body.mode, MODES),
        reason: stage === 'blocked' ? pick(body.reason, REASONS) : null
      })
    )
  }

  return new NextResponse(null, { status: 204 })
}
