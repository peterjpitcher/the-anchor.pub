export {}

// A blocked submission must never be reported to the caller as a success.
//
// Until August 2026 the honeypot, timing and phone-prefix checks each answered
// HTTP 200 {"success": true} and discarded the submission. A real guest saw the
// "Inquiry Received!" screen and nothing was recorded anywhere, so a lost
// private-hire enquiry was indistinguishable from one that was never made.
// Every test here fails if that behaviour comes back.

const mockVerifyTurnstileToken = jest.fn()

jest.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: (...args: unknown[]) => mockVerifyTurnstileToken(...args)
}))

jest.mock('@/lib/error-handling', () => ({
  logError: jest.fn()
}))

import { checkSpamProtection } from '@/lib/spam-protection'
import { logError } from '@/lib/error-handling'

function requestFrom(ip: string): Request {
  return new Request('http://localhost/api/public/private-booking', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip }
  })
}

const VALID_BODY = {
  contact_phone: '+447700900000',
  _t: 45,
  turnstile_token: 'good-token'
}

// jsdom does not provide the static Response.json helper the route code uses.
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

let ipCounter = 0
function freshIp(): string {
  ipCounter += 1
  return `203.0.113.${ipCounter % 250}`
}

beforeEach(() => {
  jest.clearAllMocks()
  mockVerifyTurnstileToken.mockResolvedValue({ success: true })
})

describe('checkSpamProtection never fakes success', () => {
  it('blocks a filled honeypot without claiming success', async () => {
    const result = await checkSpamProtection(requestFrom(freshIp()), { ...VALID_BODY, website: 'http://spam' })

    expect(result.blocked).toBe(true)
    if (!result.blocked) throw new Error('expected blocked')

    expect(result.response.status).toBe(400)
    const body = await result.response.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/01753 682707/)
  })

  it('blocks an implausibly fast submission without claiming success', async () => {
    const result = await checkSpamProtection(requestFrom(freshIp()), { ...VALID_BODY, _t: 1 })

    expect(result.blocked).toBe(true)
    if (!result.blocked) throw new Error('expected blocked')

    expect(result.response.status).toBe(400)
    const body = await result.response.json()
    expect(body.success).toBe(false)
  })

  it('blocks a missing timing field without claiming success', async () => {
    const { _t, ...withoutTiming } = VALID_BODY
    const result = await checkSpamProtection(requestFrom(freshIp()), withoutTiming)

    expect(result.blocked).toBe(true)
    if (!result.blocked) throw new Error('expected blocked')

    const body = await result.response.json()
    expect(body.success).toBe(false)
  })

  it('logs every block so a false positive is discoverable', async () => {
    await checkSpamProtection(requestFrom(freshIp()), { ...VALID_BODY, website: 'http://spam' })
    expect(logError).toHaveBeenCalledWith(
      'lib/spam-protection/blocked',
      expect.any(Error),
      expect.objectContaining({ reason: 'honeypot' })
    )
  })
})

describe('checkSpamProtection does not judge callers by phone country', () => {
  // The old allowlist covered 19 calling codes and silently discarded anything
  // else. For a pub beside Heathrow that binned real guests: an Indian,
  // Romanian, Nigerian or Turkish mobile was thrown away and shown a success
  // screen. Turnstile is what stops bots, and it fails loudly.
  it.each([
    ['India', '+919876543210'],
    ['Romania', '+40721234567'],
    ['Nigeria', '+2348012345678'],
    ['Turkey', '+905321234567'],
    ['UK', '+447700900000']
  ])('accepts a %s number', async (_country, phone) => {
    const result = await checkSpamProtection(requestFrom(freshIp()), { ...VALID_BODY, contact_phone: phone })
    expect(result.blocked).toBe(false)
  })
})

describe('checkSpamProtection still blocks bots', () => {
  it('rejects a failed Turnstile check with an honest 403', async () => {
    mockVerifyTurnstileToken.mockResolvedValue({ success: false, error: 'Security check failed.' })

    const result = await checkSpamProtection(requestFrom(freshIp()), VALID_BODY)

    expect(result.blocked).toBe(true)
    if (!result.blocked) throw new Error('expected blocked')
    expect(result.response.status).toBe(403)
    const body = await result.response.json()
    expect(body.success).toBe(false)
  })
})
