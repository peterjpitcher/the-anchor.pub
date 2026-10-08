import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMITS, limitByAddress, tooManyRequests } from '@/lib/rate-limit'
import { MAX_BODY_BYTES, formatWebVitalLine, parseWebVitalReport } from '@/lib/web-vitals-record'

/**
 * Records one Core Web Vitals reading (CLS, LCP or INP) as one log line.
 *
 * What is recorded, and what is not, is in lib/web-vitals-record.ts and in the
 * privacy notice, section 5. This handler reads the request body and nothing
 * else: no headers beyond the body's length, so no IP address, user agent,
 * referrer or cookie can reach the line.
 *
 * Exactly one line per request, because the Vercel CLI returns only the first
 * line a request logs. A request that fails the check gets a 4xx and no line.
 */

function reject(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: NextRequest): Promise<Response> {
  // A page sends a handful of these, so the ceiling is 60 a minute for one
  // address. Per server (lib/rate-limit.ts).
  const rateLimit = limitByAddress(request, 'web-vitals', RATE_LIMITS.beacon)
  if (rateLimit.limited) {
    return tooManyRequests(rateLimit, { error: 'Too many requests' })
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return reject('Payload too large', 413)
  }

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return reject('Invalid payload', 400)
  }

  // The header can be missing or wrong, so the body itself is measured too.
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return reject('Payload too large', 413)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return reject('Invalid payload', 400)
  }

  const report = parseWebVitalReport(parsed)
  if (!report) {
    return reject('Invalid payload', 400)
  }

  // console.warn, not console.log: next.config.js strips every console call from
  // the production build except error and warn, which is why the console.log
  // that used to be here recorded nothing. It is a record, not a warning.
  console.warn(formatWebVitalLine(report))

  return NextResponse.json({ received: true }, { status: 200 })
}
