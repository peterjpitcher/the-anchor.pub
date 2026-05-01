import { NextRequest } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile'

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

// ── Phone country allowlist ─────────────────────────────────────────────────
// Accepted calling codes for a pub near Heathrow. Add more as needed.
const ALLOWED_PHONE_PREFIXES = [
  '+44',   // UK
  '+1',    // US / Canada
  '+33',   // France
  '+34',   // Spain
  '+353',  // Ireland
  '+49',   // Germany
  '+31',   // Netherlands
  '+32',   // Belgium
  '+39',   // Italy
  '+351',  // Portugal
  '+41',   // Switzerland
  '+45',   // Denmark
  '+46',   // Sweden
  '+47',   // Norway
  '+48',   // Poland
  '+43',   // Austria
  '+61',   // Australia
  '+64',   // New Zealand
  '+971',  // UAE (Dubai layover traffic near Heathrow)
]

/**
 * Extract a phone number from common payload shapes and check its country prefix.
 * Returns true if the number looks suspicious (non-allowlisted country).
 */
function hasSuspiciousPhone(body: Record<string, unknown>): boolean {
  // Find the phone value from various payload shapes
  const phone =
    (typeof body.phone === 'string' && body.phone) ||
    (typeof body.contact_phone === 'string' && body.contact_phone) ||
    (typeof body.customer_phone === 'string' && body.customer_phone) ||
    (typeof (body.customer as Record<string, unknown>)?.mobile_number === 'string'
      && (body.customer as Record<string, unknown>).mobile_number as string) ||
    null

  if (!phone) return false // no phone to check, let other validation handle it

  const trimmed = phone.trim()

  // Only check numbers that start with + (international format)
  if (!trimmed.startsWith('+')) return false

  return !ALLOWED_PHONE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))
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

  // 2. Honeypot, if a hidden field has a value, return fake success
  if (body?.website || body?.honeypot_field) {
    return {
      blocked: true,
      response: Response.json({ success: true })
    }
  }

  // 3. Phone country check, block numbers from non-allowlisted countries
  if (hasSuspiciousPhone(body)) {
    return {
      blocked: true,
      response: Response.json({ success: true })
    }
  }

  // 4. Timing, reject if too fast OR if timing field is missing entirely
  //    (missing _t means the request didn't come from our form)
  const formDuration = typeof body?._t === 'number' ? body._t : null
  if (formDuration === null || formDuration < MIN_FORM_DURATION_SECONDS) {
    return {
      blocked: true,
      response: Response.json({ success: true })
    }
  }

  // 5. Turnstile CAPTCHA verification
  //    Skip when the upstream management API will verify the token itself
  //    (Turnstile tokens are single-use, verifying here would consume it)
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
