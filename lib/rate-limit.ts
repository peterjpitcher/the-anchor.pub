import { logError } from '@/lib/error-handling'
import { GUEST_PHONE } from '@/lib/guest-error-messages'

/**
 * The one rate limiter for the site's public routes.
 *
 * Counts are kept in memory, per server. Owner decision 13 (7 October 2026) is
 * that the site has no shared store, and Vercel runs several copies of each
 * function, so a limit of 5 a minute is 5 a minute from each copy rather than 5
 * in all. That slows a careless script and protects one warm copy from a burst;
 * it is not a promise. Turnstile is the check that stops bots on the forms, and
 * the management app's own allowance is the last line for everything else.
 *
 * Three rules hold wherever this is used:
 *
 *   1. A refusal is a 429 with a `Retry-After` header and a sentence carrying
 *      the pub's phone number. A guest who is refused always has a way forward.
 *   2. It fails open. A request whose address cannot be read, or a fault in
 *      here, lets the request through and writes a log line. A limiter must
 *      never be the reason a real booking is lost.
 *   3. No address is ever written to a log. It is personal data.
 */

export type RateLimitRule = {
  /** How many requests one key may make inside the window. */
  limit: number
  /** The length of the window, in milliseconds. */
  windowMs: number
}

export type RateLimitResult = {
  limited: boolean
  /** Whole seconds until the oldest counted request leaves the window. 0 when not limited. */
  retryAfterSeconds: number
}

const ONE_MINUTE_MS = 60_000
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS

/**
 * The limits in use. The figures for reads and payments are the workspace
 * standard's (20 a minute for an unauthenticated read, 10 payment orders an
 * hour); the form and lookup figures are the ones the site already had.
 */
export const RATE_LIMITS = {
  /** Every form submission that goes through checkSpamProtection, counted together. */
  formSubmission: { limit: 5, windowMs: ONE_MINUTE_MS },
  /** The "is this number known" lookup on the booking forms. */
  customerLookup: { limit: 6, windowMs: ONE_MINUTE_MS },
  /** A public read or check that spends the management app's shared key. */
  publicRead: { limit: 20, windowMs: ONE_MINUTE_MS },
  /** Analytics and page speed beacons: several per page view, so a higher ceiling. */
  beacon: { limit: 60, windowMs: ONE_MINUTE_MS },
  /** Starting a PayPal order. */
  paymentCreate: { limit: 10, windowMs: ONE_HOUR_MS }
} as const satisfies Record<string, RateLimitRule>

/** What a guest is told when a form or a read is refused for a minute. */
export const RATE_LIMIT_MESSAGE = `Too many attempts. Please wait a minute and try again, or call ${GUEST_PHONE}.`

/** What a guest is told when a payment step is refused. The window is an hour, so no "wait a minute". */
export const PAYMENT_RATE_LIMIT_MESSAGE = `Too many attempts. Please try again later, or call ${GUEST_PHONE} and we will sort it out over the phone.`

// Sweep a bucket's expired keys once it holds this many, so a flood of
// different addresses cannot grow the map without limit.
const MAX_KEYS_PER_BUCKET = 5000

const buckets = new Map<string, Map<string, number[]>>()

type HeaderCarrier = { headers: { get(name: string): string | null } }

function firstHop(value: string | null): string | null {
  const first = value?.split(',')[0]?.trim()
  return first && first.length > 0 && first.length <= 64 ? first : null
}

/**
 * The visitor's address, or null when it cannot be read.
 *
 * `cf-connecting-ip` first: the site sits behind Cloudflare, and Vercel
 * overwrites `x-forwarded-for` with the address that connected to it, which is
 * then Cloudflare's and shared by unrelated visitors. `x-forwarded-for` is the
 * fallback for a request that reached Vercel directly.
 */
export function getClientAddress(request: HeaderCarrier): string | null {
  try {
    return firstHop(request.headers.get('cf-connecting-ip')) ?? firstHop(request.headers.get('x-forwarded-for'))
  } catch {
    return null
  }
}

function sweep(bucket: Map<string, number[]>, windowMs: number, now: number): void {
  bucket.forEach((timestamps, key) => {
    if (timestamps.every((timestamp) => now - timestamp >= windowMs)) {
      bucket.delete(key)
    }
  })
  // Still full of live keys: start again rather than grow. Fail open.
  if (bucket.size >= MAX_KEYS_PER_BUCKET) {
    bucket.clear()
  }
}

const ALLOWED: RateLimitResult = { limited: false, retryAfterSeconds: 0 }

// One log line a minute for each bucket and reason, so a flood of refused
// requests cannot become a flood of log lines.
const lastLoggedAt = new Map<string, number>()

function logOncePerMinute(context: string, name: string, error: unknown): void {
  const now = Date.now()
  const logKey = `${context}:${name}`
  if (now - (lastLoggedAt.get(logKey) ?? 0) < ONE_MINUTE_MS) return
  lastLoggedAt.set(logKey, now)
  logError(context, error, { bucket: name })
}

/**
 * Count one request against `key` in the bucket called `name`.
 *
 * A request that is refused is not counted, so somebody who keeps pressing the
 * button is let back in a full window after their last accepted request, not
 * after their last press.
 */
export function checkRateLimit(name: string, key: string | null, rule: RateLimitRule): RateLimitResult {
  if (!key) {
    // Fail open, and say so: on Vercel an address is always present, so this
    // line appearing in production means the headers have changed.
    logOncePerMinute('lib/rate-limit/no-address', name, new Error('Rate limit skipped: no client address'))
    return ALLOWED
  }

  try {
    const now = Date.now()
    let bucket = buckets.get(name)
    if (!bucket) {
      bucket = new Map()
      buckets.set(name, bucket)
    }

    const recent = (bucket.get(key) ?? []).filter((timestamp) => now - timestamp < rule.windowMs)

    if (recent.length >= rule.limit) {
      bucket.set(key, recent)
      const oldest = recent[0] ?? now
      return {
        limited: true,
        retryAfterSeconds: Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000))
      }
    }

    if (!bucket.has(key) && bucket.size >= MAX_KEYS_PER_BUCKET) {
      sweep(bucket, rule.windowMs, now)
    }

    recent.push(now)
    bucket.set(key, recent)
    return ALLOWED
  } catch (error) {
    logOncePerMinute('lib/rate-limit/failed', name, error)
    return ALLOWED
  }
}

/** Count one request against the visitor's address. */
export function limitByAddress(request: HeaderCarrier, name: string, rule: RateLimitRule): RateLimitResult {
  const result = checkRateLimit(name, getClientAddress(request), rule)
  if (result.limited) {
    // The bucket only: which route is being pressed, never by whom.
    logOncePerMinute('lib/rate-limit/limited', name, new Error('Rate limit reached'))
  }
  return result
}

/** The headers every 429 from this site carries. Never cached. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'Retry-After': String(Math.max(1, result.retryAfterSeconds)),
    'Cache-Control': 'private, no-store'
  }
}

/** A 429 with `Retry-After`, for a body the calling route has shaped. */
export function tooManyRequests(result: RateLimitResult, body: unknown): Response {
  // Built by hand: the static Response.json is missing from some runtimes the
  // tests use, and a limiter must not be the thing that throws.
  return new Response(JSON.stringify(body), {
    status: 429,
    headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(result) }
  })
}

/** Test seam: forget every count. */
export function resetRateLimitsForTests(): void {
  buckets.clear()
  lastLoggedAt.clear()
}
