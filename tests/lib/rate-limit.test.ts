export {}

/**
 * The site's one rate limiter (site review 7 October 2026, P05).
 *
 * It is per server by owner decision, so what is pinned here is what a guest
 * and a log reader can rely on whichever copy of the site answers: a refusal
 * carries Retry-After and the phone number, an address that cannot be read is
 * let through, and no address is ever written to a log.
 */

const mockLogError = jest.fn()
jest.mock('@/lib/error-handling', () => ({
  logError: (...args: unknown[]) => mockLogError(...args)
}))

import {
  PAYMENT_RATE_LIMIT_MESSAGE,
  RATE_LIMITS,
  RATE_LIMIT_MESSAGE,
  checkRateLimit,
  getClientAddress,
  limitByAddress,
  resetRateLimitsForTests,
  tooManyRequests
} from '@/lib/rate-limit'

const PHONE_NUMBER = '01753 682707'

function requestWith(headers: Record<string, string>): { headers: Headers } {
  return { headers: new Headers(headers) }
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-10-08T12:00:00Z'))
  mockLogError.mockClear()
  resetRateLimitsForTests()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('getClientAddress', () => {
  it('prefers the address Cloudflare reports over the forwarded one', () => {
    const request = requestWith({ 'cf-connecting-ip': '198.51.100.7', 'x-forwarded-for': '203.0.113.1, 10.0.0.1' })

    expect(getClientAddress(request)).toBe('198.51.100.7')
  })

  it('falls back to the first forwarded hop when Cloudflare sent nothing', () => {
    expect(getClientAddress(requestWith({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' }))).toBe('203.0.113.1')
  })

  it('answers null when neither header is there, or the value is empty or absurdly long', () => {
    expect(getClientAddress(requestWith({}))).toBeNull()
    expect(getClientAddress(requestWith({ 'x-forwarded-for': ' , 10.0.0.1' }))).toBeNull()
    expect(getClientAddress(requestWith({ 'cf-connecting-ip': 'x'.repeat(65) }))).toBeNull()
  })

  it('answers null when the headers cannot be read at all', () => {
    const broken = {
      headers: {
        get: () => {
          throw new Error('no headers')
        }
      }
    }

    expect(getClientAddress(broken)).toBeNull()
  })
})

describe('checkRateLimit', () => {
  const rule = { limit: 5, windowMs: 60_000 }

  it('lets the first five through and refuses the sixth with the seconds left to wait', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit('test', '203.0.113.1', rule)).toEqual({ limited: false, retryAfterSeconds: 0 })
      jest.advanceTimersByTime(1000)
    }

    // Five seconds have passed since the first, so 55 remain.
    expect(checkRateLimit('test', '203.0.113.1', rule)).toEqual({ limited: true, retryAfterSeconds: 55 })
  })

  it('lets the visitor back in once the window has passed', () => {
    for (let i = 0; i < 5; i += 1) checkRateLimit('test', '203.0.113.1', rule)
    expect(checkRateLimit('test', '203.0.113.1', rule).limited).toBe(true)

    jest.advanceTimersByTime(60_000)

    expect(checkRateLimit('test', '203.0.113.1', rule).limited).toBe(false)
  })

  it('does not count a refused request, so pressing again does not extend the wait', () => {
    for (let i = 0; i < 5; i += 1) checkRateLimit('test', '203.0.113.1', rule)

    jest.advanceTimersByTime(30_000)
    expect(checkRateLimit('test', '203.0.113.1', rule)).toEqual({ limited: true, retryAfterSeconds: 30 })
    jest.advanceTimersByTime(30_000)

    expect(checkRateLimit('test', '203.0.113.1', rule).limited).toBe(false)
  })

  it('counts each address and each bucket separately', () => {
    for (let i = 0; i < 5; i += 1) checkRateLimit('forms', '203.0.113.1', rule)

    expect(checkRateLimit('forms', '203.0.113.1', rule).limited).toBe(true)
    expect(checkRateLimit('forms', '203.0.113.2', rule).limited).toBe(false)
    expect(checkRateLimit('reads', '203.0.113.1', rule).limited).toBe(false)
  })

  it('fails open and logs when there is no address to count', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(checkRateLimit('test', null, rule).limited).toBe(false)
    }

    // One line a minute for the bucket, not one per request.
    expect(mockLogError).toHaveBeenCalledTimes(1)
    expect(mockLogError.mock.calls[0][0]).toBe('lib/rate-limit/no-address')
  })

  it('fails open and logs when the count itself throws', () => {
    const now = jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      throw new Error('clock broke')
    })

    expect(checkRateLimit('test', '203.0.113.1', rule)).toEqual({ limited: false, retryAfterSeconds: 0 })
    expect(mockLogError.mock.calls[0][0]).toBe('lib/rate-limit/failed')

    now.mockRestore()
  })

  it('keeps counting correctly when a flood of different addresses fills the bucket', () => {
    for (let i = 0; i < 5000; i += 1) checkRateLimit('flood', `addr-${i}`, rule)
    jest.advanceTimersByTime(60_000)

    // The stale keys are swept; a new visitor is counted from one.
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit('flood', '203.0.113.9', rule).limited).toBe(false)
    }
    expect(checkRateLimit('flood', '203.0.113.9', rule).limited).toBe(true)
  })
})

describe('limitByAddress', () => {
  it('logs the bucket and never the address when a visitor is refused', () => {
    const request = requestWith({ 'cf-connecting-ip': '198.51.100.7' })
    for (let i = 0; i < RATE_LIMITS.formSubmission.limit; i += 1) {
      limitByAddress(request, 'form-submission', RATE_LIMITS.formSubmission)
    }

    expect(limitByAddress(request, 'form-submission', RATE_LIMITS.formSubmission).limited).toBe(true)
    expect(limitByAddress(request, 'form-submission', RATE_LIMITS.formSubmission).limited).toBe(true)

    expect(mockLogError).toHaveBeenCalledTimes(1)
    expect(mockLogError.mock.calls[0][0]).toBe('lib/rate-limit/limited')
    expect(JSON.stringify(mockLogError.mock.calls.map(([context, error, extra]) => [context, String(error), extra]))).not.toContain(
      '198.51.100.7'
    )
  })

  it('counts by the Cloudflare address, so two visitors behind one forwarded address do not share a limit', () => {
    const first = requestWith({ 'cf-connecting-ip': '198.51.100.7', 'x-forwarded-for': '203.0.113.1' })
    const second = requestWith({ 'cf-connecting-ip': '198.51.100.8', 'x-forwarded-for': '203.0.113.1' })
    for (let i = 0; i < 5; i += 1) limitByAddress(first, 'form-submission', RATE_LIMITS.formSubmission)

    expect(limitByAddress(first, 'form-submission', RATE_LIMITS.formSubmission).limited).toBe(true)
    expect(limitByAddress(second, 'form-submission', RATE_LIMITS.formSubmission).limited).toBe(false)
  })
})

describe('tooManyRequests', () => {
  it('answers 429 with Retry-After, never cached, and the body it was given', async () => {
    const response = tooManyRequests({ limited: true, retryAfterSeconds: 42 }, { success: false, error: RATE_LIMIT_MESSAGE })

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('42')
    expect(response.headers.get('Cache-Control')).toContain('no-store')
    expect(await response.json()).toEqual({ success: false, error: RATE_LIMIT_MESSAGE })
  })

  it('never sends a Retry-After of zero', () => {
    expect(tooManyRequests({ limited: true, retryAfterSeconds: 0 }, {}).headers.get('Retry-After')).toBe('1')
  })
})

describe('what a refused guest is told', () => {
  it.each([
    ['a form or a read', RATE_LIMIT_MESSAGE],
    ['a payment step', PAYMENT_RATE_LIMIT_MESSAGE]
  ])('%s: the sentence carries the phone number', (_label, message) => {
    expect(message).toContain(PHONE_NUMBER)
  })

  it('does not tell a guest refused at a payment step to wait a minute, because the window is an hour', () => {
    expect(RATE_LIMITS.paymentCreate.windowMs).toBe(60 * 60 * 1000)
    expect(PAYMENT_RATE_LIMIT_MESSAGE).not.toMatch(/minute/)
  })
})
