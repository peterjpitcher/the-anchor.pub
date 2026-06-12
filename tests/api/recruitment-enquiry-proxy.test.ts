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
    expect(init.body.get('turnstile_token')).toBe('turnstile-1')
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
    expect(payload.error).toBe('Please upload a PDF, DOC or DOCX CV.')
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
