export {}

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn(async () => ({ blocked: false, response: null })),
}))

function jsonResponse(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
}

function formData(overrides: Record<string, string> = {}) {
  const data = new FormData()
  data.set('name', overrides.name ?? 'Jane Smith')
  data.set('email', overrides.email ?? 'jane@example.com')
  data.set('phone', overrides.phone ?? '07700900123')
  data.set('role', overrides.role ?? 'Bartender')
  data.set('job_posting_id', overrides.job_posting_id ?? 'posting-1')
  data.set('job_slug', overrides.job_slug ?? 'bartender')
  data.set('experience', overrides.experience ?? 'Two years behind a pub bar.')
  data.set('fit', overrides.fit ?? 'Reliable and friendly.')
  data.append('availability', overrides.availability ?? 'Weekends')
  data.set('travel', overrides.travel ?? 'I can drive.')
  data.set('relevantExperience', overrides.relevantExperience ?? 'Yes')
  data.set('startDate', overrides.startDate ?? 'Immediately')
  data.set('consent', overrides.consent ?? 'yes')
  data.set('sms_consent', overrides.sms_consent ?? 'yes')
  data.set('future_recruitment_consent', overrides.future_recruitment_consent ?? 'yes')
  data.set('idempotency_key', overrides.idempotency_key ?? 'idem-1')
  data.set('turnstile_token', overrides.turnstile_token ?? 'turnstile-1')
  data.set('_t', '5')
  return data
}

/**
 * Nothing in a request to the management app may carry the applicant's
 * Turnstile token: not a form field under any name, not a header, not the URL.
 */
function expectNoTurnstileToken(init: { headers: Record<string, string>; body: FormData }, token: string) {
  expect(init.body.has('turnstile_token')).toBe(false)
  const fields = [...init.body.entries()]
  expect(fields.filter(([name]) => /turnstile|captcha/i.test(name))).toEqual([])
  expect(fields.filter(([, value]) => value === token)).toEqual([])
  expect(Object.keys(init.headers).filter((name) => /turnstile|captcha/i.test(name))).toEqual([])
  expect(Object.values(init.headers)).not.toContain(token)
}

describe('recruitment enquiry proxy', () => {
  beforeEach(() => {
    jest.resetModules()
    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {})
          }
        })
    }
    process.env.RECRUITMENT_MANAGEMENT_API_BASE_URL = 'https://manage.example.test'
    process.env.RECRUITMENT_MANAGEMENT_API_KEY = 'api-key-1'
    process.env.MICROSOFT_TENANT_ID = 'tenant-1'
    process.env.MICROSOFT_CLIENT_ID = 'client-1'
    process.env.MICROSOFT_CLIENT_SECRET = 'secret-1'
    process.env.MICROSOFT_USER_EMAIL = 'peter@orangejelly.co.uk'
    process.env.RECRUITMENT_APPLICATION_TO = 'manager@the-anchor.pub'
    process.env.RECRUITMENT_PROXY_RETRY_DELAY_MS = '0'
    ;(global as any).fetch = jest.fn()
  })

  afterEach(() => {
    delete process.env.RECRUITMENT_PROXY_RETRY_DELAY_MS
    delete process.env.RECRUITMENT_MANAGEMENT_API_BASE_URL
    delete process.env.RECRUITMENT_MANAGEMENT_API_KEY
    delete process.env.ANCHOR_API_BASE_URL
    delete process.env.ANCHOR_API_KEY
    delete process.env.MICROSOFT_TENANT_ID
    delete process.env.MICROSOFT_CLIENT_ID
    delete process.env.MICROSOFT_CLIENT_SECRET
    delete process.env.MICROSOFT_USER_EMAIL
    delete process.env.RECRUITMENT_APPLICATION_TO
    jest.clearAllMocks()
  })

  it('forwards valid applications to the management API with idempotency and consent fields', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({
      success: true,
      data: { application_id: 'application-1' },
    }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ success: true, source: 'management' })

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://manage.example.test/api/recruitment/applications')
    expect(init.headers).toMatchObject({
      'x-api-key': 'api-key-1',
      'Idempotency-Key': 'idem-1',
    })
    expect(init.body.get('sms_consent')).toBe('true')
    expect(init.body.get('future_recruitment_consent')).toBe('true')
    expectNoTurnstileToken(init, 'turnstile-1')
  })

  // The website verifies its own widget's token with its own secret and
  // authenticates upstream with the API key. The management app holds a
  // different widget's secret and only checks callers with no API key, so a
  // forwarded token reaches no valid verifier (the August 2026 split brain).
  describe('Turnstile is verified here and never forwarded', () => {
    const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    let consoleError: jest.SpyInstance

    // The rest of this file replaces the guard with a pass. These run the real
    // one, and the real verifier, against a mocked Cloudflare.
    function useRealSpamGuard() {
      const mocked = jest.requireMock('@/lib/spam-protection') as { checkSpamProtection: jest.Mock }
      const actual = jest.requireActual('@/lib/spam-protection') as { checkSpamProtection: (...args: unknown[]) => unknown }
      mocked.checkSpamProtection.mockImplementation(actual.checkSpamProtection)
    }

    function request(data: FormData) {
      return {
        formData: async () => data,
        headers: new Headers({ 'x-forwarded-for': '203.0.113.9' }),
        url: 'https://www.the-anchor.pub/api/enquiry/recruitment',
      } as any
    }

    function calledUrls(): string[] {
      return (global.fetch as jest.Mock).mock.calls.map(([url]) => String(url))
    }

    beforeEach(() => {
      process.env.TURNSTILE_SECRET_KEY = 'website-secret-1'
      // The guard logs every block on purpose; keep the test output readable.
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      useRealSpamGuard()
    })

    afterEach(() => {
      delete process.env.TURNSTILE_SECRET_KEY
      consoleError.mockRestore()
    })

    it('verifies the token with this site, then sends the application upstream without it', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse({ success: true }))
        .mockResolvedValueOnce(jsonResponse({ success: true, data: { application_id: 'application-1' } }))

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST(request(formData({ turnstile_token: 'website-token-1' })))

      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({ success: true, source: 'management' })

      const [verifyUrl, verifyInit] = (global.fetch as jest.Mock).mock.calls[0]
      expect(verifyUrl).toBe(SITEVERIFY_URL)
      expect(verifyInit.body.get('secret')).toBe('website-secret-1')
      expect(verifyInit.body.get('response')).toBe('website-token-1')

      const [upstreamUrl, upstreamInit] = (global.fetch as jest.Mock).mock.calls[1]
      expect(upstreamUrl).toBe('https://manage.example.test/api/recruitment/applications')
      expect(upstreamInit.headers['x-api-key']).toBe('api-key-1')
      expectNoTurnstileToken(upstreamInit, 'website-token-1')
    })

    it('keeps the token out of every retry as well', async () => {
      const abortError = Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(jsonResponse({ success: true }))
        .mockRejectedValueOnce(abortError)
        .mockResolvedValueOnce(jsonResponse({ success: true, data: { application_id: 'application-1' } }))

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST(request(formData({ turnstile_token: 'website-token-1' })))

      expect(response.status).toBe(200)
      expect(global.fetch).toHaveBeenCalledTimes(3)
      for (const [, init] of (global.fetch as jest.Mock).mock.calls.slice(1)) {
        expectNoTurnstileToken(init, 'website-token-1')
      }
    })

    it('answers 403 when there is no token, and sends nothing anywhere', async () => {
      const data = formData()
      data.delete('turnstile_token')

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST(request(data))
      const payload = await response.json()

      expect(response.status).toBe(403)
      expect(payload.success).toBe(false)
      expect(payload.error).toBe('Please complete the security check before submitting.')
      // Not Cloudflare, not the management app, not the fallback email.
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('answers 403 with the phone number when Cloudflare refuses the token, and does not call upstream', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(
        jsonResponse({ success: false, 'error-codes': ['invalid-input-response'] })
      )

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST(request(formData({ turnstile_token: 'forged-token' })))
      const payload = await response.json()

      expect(response.status).toBe(403)
      expect(payload.success).toBe(false)
      expect(payload.error).toContain('01753 682707')
      expect(calledUrls()).toEqual([SITEVERIFY_URL])
    })

    it('answers 403 with the phone number when Cloudflare cannot be reached, and does not call upstream', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'))

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST(request(formData({ turnstile_token: 'website-token-1' })))
      const payload = await response.json()

      expect(response.status).toBe(403)
      expect(payload.success).toBe(false)
      expect(payload.error).toContain('01753 682707')
      expect(calledUrls()).toEqual([SITEVERIFY_URL])
    })
  })

  describe('an upstream failure is never reported as a success', () => {
    it('shows the applicant an error with the phone number when the management API and the fallback email both fail', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      const down = jsonResponse({ success: false, error: { message: 'Database unavailable' } }, { status: 500 })
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(down.clone())
        .mockResolvedValueOnce(down.clone())
        // Microsoft Graph refuses the token request, so no email can be sent.
        .mockResolvedValueOnce(jsonResponse({ error: 'invalid_client' }, { status: 401 }))

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST({ formData: async () => formData() } as any)
      const payload = await response.json()

      expect(response.status).toBe(500)
      expect(payload.success).toBe(false)
      expect(payload.error).toBe('Sorry, we could not send your application. Please call us on 01753 682707.')
      consoleError.mockRestore()
    })

    it('shows the applicant an error when the management API is down and no fallback mailbox is configured', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      delete process.env.MICROSOFT_USER_EMAIL
      const down = jsonResponse({ success: false, error: { message: 'Database unavailable' } }, { status: 500 })
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce(down.clone())
        .mockResolvedValueOnce(down.clone())

      const { POST } = await import('@/app/api/enquiry/recruitment/route')
      const response = await POST({ formData: async () => formData() } as any)
      const payload = await response.json()

      expect(response.status).toBe(500)
      expect(payload.success).toBe(false)
      expect(typeof payload.error).toBe('string')
      // Two tries at the management API and nothing else: no email was attempted.
      expect(global.fetch).toHaveBeenCalledTimes(2)
      consoleError.mockRestore()
    })
  })

  it('falls back to the existing Anchor management API env vars used in production', async () => {
    delete process.env.RECRUITMENT_MANAGEMENT_API_BASE_URL
    delete process.env.RECRUITMENT_MANAGEMENT_API_KEY
    process.env.ANCHOR_API_BASE_URL = 'https://management.example.test/api'
    process.env.ANCHOR_API_KEY = 'anchor-api-key-1'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({
      success: true,
      data: { application_id: 'application-1' },
    }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ success: true, source: 'management' })

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://management.example.test/api/recruitment/applications')
    expect(init.headers).toMatchObject({
      'x-api-key': 'anchor-api-key-1',
      'Idempotency-Key': 'idem-1',
    })
  })

  it('returns upstream validation errors without sending fallback email', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(jsonResponse({
      success: false,
      error: { message: 'Please upload a PDF, DOC or DOCX CV.' },
    }, { status: 400 }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toBe('Please upload a PDF, DOC or DOCX CV. Call 01753 682707 if you need help.')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('uses email fallback only for management infrastructure failures', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({
        success: false,
        error: { message: 'Database unavailable' },
      }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({
        success: false,
        error: { message: 'Database unavailable' },
      }, { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      success: true,
      source: 'email_fallback',
      possibleDuplicate: false,
    })

    expect(global.fetch).toHaveBeenCalledTimes(4)
    const [, sendMailInit] = (global.fetch as jest.Mock).mock.calls[3]
    const sendMailBody = JSON.parse(String(sendMailInit.body))
    expect(sendMailBody.message.subject).toContain('Recruitment application')
    expect(sendMailBody.message.body.content).toContain('Fallback reason')
    expect(sendMailBody.message.body.content).toContain('after 2 attempts')
    expect(sendMailBody.message.replyTo[0].emailAddress.address).toBe('jane@example.com')
  })

  it('retries a timed-out management call with the same idempotency key and succeeds', async () => {
    const abortError = Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })
    ;(global.fetch as jest.Mock)
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        data: { application_id: 'application-1' },
      }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ success: true, source: 'management' })
    expect(global.fetch).toHaveBeenCalledTimes(2)

    const [, firstInit] = (global.fetch as jest.Mock).mock.calls[0]
    const [, secondInit] = (global.fetch as jest.Mock).mock.calls[1]
    expect(firstInit.headers['Idempotency-Key']).toBe('idem-1')
    expect(secondInit.headers['Idempotency-Key']).toBe('idem-1')
  })

  it('retries when the management API reports the key as in progress and accepts the replay', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({
        success: false,
        error: { code: 'IDEMPOTENCY_KEY_IN_PROGRESS', message: 'This request is already being processed. Please retry shortly.' },
      }, { status: 409 }))
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        data: { application_id: 'application-1' },
      }, { status: 201 }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({ success: true, source: 'management' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('falls back to email instead of bouncing the applicant when rate limited', async () => {
    const rateLimited = jsonResponse({
      success: false,
      error: { message: 'Too many recruitment applications from this address. Please try again later.' },
    }, { status: 429 })
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce(rateLimited.clone())
      .mockResolvedValueOnce(rateLimited.clone())
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      success: true,
      source: 'email_fallback',
      possibleDuplicate: false,
    })
  })

  it('falls back to email flagged as possible duplicate when every attempt times out', async () => {
    const abortError = Object.assign(new Error('This operation was aborted'), { name: 'AbortError' })
    ;(global.fetch as jest.Mock)
      .mockRejectedValueOnce(abortError)
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce(jsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))

    const { POST } = await import('@/app/api/enquiry/recruitment/route')
    const response = await POST({ formData: async () => formData() } as any)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      success: true,
      source: 'email_fallback',
      possibleDuplicate: true,
    })

    const [, sendMailInit] = (global.fetch as jest.Mock).mock.calls[3]
    const sendMailBody = JSON.parse(String(sendMailInit.body))
    expect(sendMailBody.message.subject).toContain('Possible duplicate recruitment application')
    expect(sendMailBody.message.body.content).toContain('Management API request timed out (after 2 attempts)')
  })
})
