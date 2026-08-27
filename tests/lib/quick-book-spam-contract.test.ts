export {}

// The quick-book sheet is the sticky "Book a table" CTA on nearly every page.
// It POSTs to /api/table-bookings, which runs the shared spam guard. The sheet
// sent no `_t` and no Turnstile token, so every submission was rejected at the
// timing check. Because that guard used to answer a rejection with a fake
// HTTP 200 {"success":true}, the sheet showed "You're booked in.", fired a
// form_complete event, and created nothing. Verified against production on
// 27 August 2026: the exact payload returned {"success":true} with no booking.
//
// This is a contract test: the body the sheet builds is run through the REAL
// spam guard, so the two can never drift apart again.

const mockVerifyTurnstileToken = jest.fn()

jest.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => mockVerifyTurnstileToken(...args)
}))

jest.mock('@/lib/error-handling', () => ({
  logError: jest.fn()
}))

import {
  buildQuickBookPayload,
  buildQuickBookRequestBody,
  buildQuickBookIntentFingerprint,
  defaultQuickBookState,
} from '@/lib/table-booking/quick-book'
import { checkSpamProtection } from '@/lib/spam-protection'

beforeAll(() => {
  const ResponseCtor = global.Response as unknown as {
    json?: (data: unknown, init?: ResponseInit) => Response
  }
  if (typeof ResponseCtor.json !== 'function') {
    ResponseCtor.json = (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        ...init,
        headers: { 'content-type': 'application/json', ...(init?.headers as Record<string, string> | undefined) }
      })
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  mockVerifyTurnstileToken.mockResolvedValue({ success: true })
})

function payload() {
  const state = { ...defaultQuickBookState(), date: '2026-09-10', partySize: 2, purpose: 'food' as const }
  return buildQuickBookPayload({
    state,
    time: '19:00',
    slotPurpose: 'food',
    phone: '07700900123',
    firstName: 'Jane',
  } as never)
}

let ip = 0
function request(): Request {
  ip += 1
  return new Request('http://localhost/api/table-bookings', {
    method: 'POST',
    headers: { 'x-forwarded-for': `198.51.100.${ip % 250}` }
  })
}

describe('the quick-book body satisfies the guard on the route it posts to', () => {
  it('passes the real spam guard', async () => {
    const body = buildQuickBookRequestBody(payload(), {
      turnstileToken: 'a-real-token',
      secondsOnSheet: 30,
    })

    const result = await checkSpamProtection(request(), body as Record<string, unknown>)
    expect(result.blocked).toBe(false)
  })

  it('always sends a numeric _t, which is what the sheet omitted', async () => {
    const body = buildQuickBookRequestBody(payload(), { turnstileToken: 't', secondsOnSheet: 12 })
    expect(typeof body._t).toBe('number')
    expect(body._t).toBe(12)
  })

  it('sends the Turnstile token so the guard can verify it', () => {
    const body = buildQuickBookRequestBody(payload(), { turnstileToken: 'tok-123', secondsOnSheet: 12 })
    expect(body.turnstile_token).toBe('tok-123')
  })

  it('is still blocked without a token, and never with a fake success', async () => {
    mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'Security check failed.' })

    const body = buildQuickBookRequestBody(payload(), { turnstileToken: null, secondsOnSheet: 30 })
    const result = await checkSpamProtection(request(), body as Record<string, unknown>)

    expect(result.blocked).toBe(true)
    if (!result.blocked) throw new Error('expected blocked')
    expect(result.response.status).toBe(403)
    const parsed = await result.response.json()
    expect(parsed.success).toBe(false)
  })
})

describe('the volatile fields cannot affect the idempotency key', () => {
  it('fingerprints the clean payload, not the request body', () => {
    // If these two ever diverge, a refreshed token or one more second on the
    // sheet mints a new key and a double tap becomes two real bookings.
    const clean = payload()
    const first = buildQuickBookIntentFingerprint(clean)
    const second = buildQuickBookIntentFingerprint(clean)
    expect(first).toBe(second)

    const bodyA = buildQuickBookRequestBody(clean, { turnstileToken: 'tok-a', secondsOnSheet: 5 })
    const bodyB = buildQuickBookRequestBody(clean, { turnstileToken: 'tok-b', secondsOnSheet: 90 })

    expect(bodyA.turnstile_token).not.toBe(bodyB.turnstile_token)
    expect(bodyA._t).not.toBe(bodyB._t)
    // The payload the fingerprint is taken from is untouched by either.
    expect(buildQuickBookIntentFingerprint(clean)).toBe(first)
  })
})
