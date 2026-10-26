/**
 * BK-101 and BK-191: a security check that turns a guest away now says which way it did, so the
 * count can tell "the check never loaded" (a stuck form, the guest's no fault) from a rejected
 * token or an outage at Cloudflare.
 */

const mockReportFailure = jest.fn(async () => undefined)
jest.mock('@/lib/report-failure', () => ({ reportFailure: (...args: unknown[]) => (mockReportFailure as jest.Mock)(...args) }))
jest.mock('@/lib/error-handling', () => ({ logError: jest.fn() }))

import { verifyTurnstileToken } from '@/lib/turnstile'

const ORIGINAL_ENV = process.env
const ORIGINAL_FETCH = global.fetch

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, TURNSTILE_SECRET_KEY: 'secret' }
})

afterEach(() => {
  process.env = ORIGINAL_ENV
  global.fetch = ORIGINAL_FETCH
})

describe('verifyTurnstileToken reasons', () => {
  it('a missing token', async () => {
    await expect(verifyTurnstileToken('')).resolves.toMatchObject({ success: false, reason: 'SECURITY_CHECK_MISSING' })
  })

  it('a token Cloudflare rejects', async () => {
    global.fetch = jest.fn(async () => ({ json: async () => ({ success: false, 'error-codes': ['timeout-or-duplicate'] }) })) as never
    await expect(verifyTurnstileToken('t')).resolves.toMatchObject({ success: false, reason: 'SECURITY_CHECK_REJECTED' })
  })

  it('Cloudflare out of reach', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('fetch failed')
    }) as never
    await expect(verifyTurnstileToken('t')).resolves.toMatchObject({ success: false, reason: 'SECURITY_CHECK_UNAVAILABLE' })
  })

  it('no secret configured', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    await expect(verifyTurnstileToken('t')).resolves.toMatchObject({ success: false, reason: 'TURNSTILE_SECRET_MISSING' })
  })

  it('a good token has no reason', async () => {
    global.fetch = jest.fn(async () => ({ json: async () => ({ success: true }) })) as never
    await expect(verifyTurnstileToken('t')).resolves.toEqual({ success: true })
  })
})
