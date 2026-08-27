import { NextRequest } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { logError } from '@/lib/error-handling'

// ── Rate limiter ────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5
const rateLimitMap = new Map<string, number[]>()

function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, recent)
    return true
  }
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

// Minimum seconds a real user needs to fill any form
const MIN_FORM_DURATION_SECONDS = 3

// Every rejection a human could plausibly trigger says the same thing, and
// always offers the phone. See the note on silent success below.
const CALL_US_INSTEAD =
  'We could not accept that submission. Please try again, or call us on 01753 682707 and we will take your details.'

/**
 * A blocked submission must never be reported to the caller as a success.
 *
 * This module used to answer the honeypot, timing and phone-prefix checks with
 * HTTP 200 {"success": true}, so that a bot learned nothing from being caught.
 * The cost of that trade was invisible and severe: a real guest whose
 * submission tripped any of the three saw the "Inquiry Received!" screen, and
 * the enquiry was discarded with no record kept anywhere. Nobody could tell
 * afterwards that they had ever tried. Private-hire enquiries are worth four
 * figures each.
 *
 * Turnstile is the check that actually stops bots, and it fails loudly. The
 * cheap heuristics below stay as a second layer, but they now fail honestly and
 * are logged, so a false positive costs the guest one phone call instead of the
 * whole booking.
 */
function blockedResponse(reason: string, request: NextRequest | Request, status = 400): { blocked: true; response: Response } {
  // Logged so a false positive is discoverable in Vercel logs rather than
  // silently absorbed. No personal data: the reason and the path only.
  logError('lib/spam-protection/blocked', new Error(`Submission blocked: ${reason}`), {
    reason,
    path: (() => {
      try {
        return new URL(request.url).pathname
      } catch {
        return 'unknown'
      }
    })()
  })

  return {
    blocked: true,
    response: Response.json({ success: false, error: CALL_US_INSTEAD, reason }, { status })
  }
}

type SpamCheckResult =
  | { blocked: false }
  | { blocked: true; response: Response }

/**
 * Run all spam-protection checks against a parsed request body.
 * Call this at the top of every POST handler that accepts user form submissions.
 *
 * Returns `{ blocked: false }` when the request is clean, or
 * `{ blocked: true, response }` with a ready-to-return Response when it should be rejected.
 */
export async function checkSpamProtection(
  request: NextRequest | Request,
  body: Record<string, unknown>,
  options?: { skipTurnstile?: boolean }
): Promise<SpamCheckResult> {
  // 1. Rate limit by IP
  const clientIp = getClientIp(request)
  if (isRateLimited(clientIp)) {
    return {
      blocked: true,
      response: Response.json(
        { success: false, error: 'Too many attempts. Please wait a minute and try again.' },
        { status: 429 }
      )
    }
  }

  // 2. Honeypot. Bots fill the hidden field; browser autofill and password
  //    managers occasionally do too, which is why this no longer fakes success.
  if (body?.website || body?.honeypot_field) {
    return blockedResponse('honeypot', request)
  }

  // 3. Timing, reject if the form was completed implausibly fast, or if the
  //    timing field is missing entirely (the request did not come from our form).
  const formDuration = typeof body?._t === 'number' ? body._t : null
  if (formDuration === null || formDuration < MIN_FORM_DURATION_SECONDS) {
    return blockedResponse(formDuration === null ? 'timing_missing' : 'timing_too_fast', request)
  }

  // 4. Turnstile CAPTCHA verification
  //    This is the ONLY place a token from one of our widgets gets verified.
  //    Do not skip it on the assumption that the management API will do it
  //    instead: it holds a different widget's secret and only checks callers
  //    that present no API key, so a forwarded token reaches no valid verifier.
  //    skipTurnstile is for routes whose form mints no token at all (they fall
  //    back to the honeypot and timing checks above). Turning it on for a form
  //    that DOES have a widget silently disables the widget; turning it off for
  //    a form that does NOT have one blocks every guest.
  if (!options?.skipTurnstile) {
    const turnstile = await verifyTurnstileToken(
      (body?.turnstile_token as string | null | undefined) ?? null
    )
    if (!turnstile.success) {
      return {
        blocked: true,
        response: Response.json(
          { success: false, error: turnstile.error || 'Security check failed.' },
          { status: 403 }
        )
      }
    }
  }

  return { blocked: false }
}
