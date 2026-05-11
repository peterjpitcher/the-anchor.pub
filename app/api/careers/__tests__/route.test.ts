/**
 * Tests for the POST /api/careers route.
 *
 * Covers: required-field validation, email format, role allowlist, consent,
 * CV extension/size checks, spam-protection integration, Graph email dispatch
 * with and without attachment, and the guarantee that no management API call
 * is made.
 */

import { NextRequest } from 'next/server'

// ── Polyfill Response.json for JSDOM ─────────────────────────────────────────
// The JSDOM polyfill from node-fetch does not include the static
// `Response.json()` method that NextResponse.json() delegates to.
if (typeof Response.json !== 'function') {
  ;(Response as unknown as Record<string, unknown>).json = function (
    data: unknown,
    init?: ResponseInit
  ) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        ...((init?.headers as Record<string, string>) ?? {}),
        'content-type': 'application/json',
      },
    })
  }
}

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockCheckSpamProtection = jest.fn()
jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: (...args: unknown[]) => mockCheckSpamProtection(...args),
}))

const mockSendMicrosoftGraphEmail = jest.fn()
jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: (...args: unknown[]) =>
    mockSendMicrosoftGraphEmail(...args),
  escapeHtml: (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'),
}))

// ── Env vars ─────────────────────────────────────────────────────────────────

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = {
    ...ORIGINAL_ENV,
    MICROSOFT_USER_EMAIL: 'bot@the-anchor.pub',
    MICROSOFT_TENANT_ID: 'tenant-id',
    MICROSOFT_CLIENT_ID: 'client-id',
    MICROSOFT_CLIENT_SECRET: 'client-secret',
  }
})

afterAll(() => {
  process.env = ORIGINAL_ENV
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFormData(
  overrides?: Record<string, string | Blob>
): FormData {
  const fd = new FormData()
  fd.append('name', 'Test User')
  fd.append('email', 'test@example.com')
  fd.append('phone', '01234567890')
  fd.append('role', 'bar-staff')
  fd.append(
    'experience',
    'I have two years of bar experience at a local pub.'
  )
  fd.append('consent', 'true')
  fd.append('turnstile_token', 'test-token')
  fd.append('_t', '10')
  fd.append('website', '') // honeypot empty
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      fd.set(key, value)
    }
  }
  return fd
}

/**
 * Build a mock NextRequest whose formData() method works in JSDOM.
 * The real NextRequest constructor in jest-environment-jsdom does not
 * support formData() properly, so we wrap it.
 */
function buildRequest(formData: FormData): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/careers', {
    method: 'POST',
  })
  // Override formData to return the prepared FormData
  Object.defineProperty(req, 'formData', {
    value: () => Promise.resolve(formData),
  })
  return req
}

async function getPostHandler(): Promise<
  (request: NextRequest) => Promise<Response>
> {
  const mod = await import('@/app/api/careers/route')
  return mod.POST
}

async function postWithFormData(
  overrides?: Record<string, string | Blob>
): Promise<Response> {
  const POST = await getPostHandler()
  return POST(buildRequest(buildFormData(overrides)))
}

// ── Suite ────────────────────────────────────────────────────────────────────

describe('POST /api/careers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckSpamProtection.mockResolvedValue({ blocked: false })
    mockSendMicrosoftGraphEmail.mockResolvedValue(undefined)
  })

  // 1. Rejects missing required fields
  it.each([
    ['name', { name: '' }],
    ['email', { email: '' }],
    ['phone', { phone: '' }],
    ['role', { role: '' }],
    ['experience', { experience: '' }],
  ])(
    'should return 400 when required field "%s" is missing',
    async (_field, override) => {
      const res = await postWithFormData(override)
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toMatch(/required fields/i)
    }
  )

  // 2. Rejects invalid email format
  it('should return 400 when email format is invalid', async () => {
    const res = await postWithFormData({ email: 'not-an-email' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/valid email/i)
  })

  // 3. Rejects invalid role value
  it('should return 400 when role value is not in the allowlist', async () => {
    const res = await postWithFormData({ role: 'manager' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/valid role/i)
  })

  // 4. Rejects missing consent
  it('should return 400 when consent is not given', async () => {
    const res = await postWithFormData({ consent: 'false' })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/consent/i)
  })

  // 5. Rejects invalid file extension
  it('should return 400 when CV has an invalid file extension', async () => {
    const badFile = new File(['hello'], 'resume.exe', {
      type: 'application/x-msdownload',
    })
    const fd = buildFormData()
    fd.set('cv', badFile)
    const POST = await getPostHandler()
    const res = await POST(buildRequest(fd))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/PDF, DOC, or DOCX/i)
  })

  // 6. Rejects file over 20 MB
  it('should return 400 when CV exceeds 20 MB', async () => {
    const largeFile = new File(['x'], 'huge.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(largeFile, 'size', {
      value: 25 * 1024 * 1024,
    })
    const fd = buildFormData()
    fd.set('cv', largeFile)
    const POST = await getPostHandler()
    const res = await POST(buildRequest(fd))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/too large/i)
  })

  // 7. Converts _t from FormData string to number before spam check
  it('should convert _t from string to number before calling checkSpamProtection', async () => {
    await postWithFormData({ _t: '42' })

    expect(mockCheckSpamProtection).toHaveBeenCalledTimes(1)
    const bodyArg = mockCheckSpamProtection.mock.calls[0][1] as Record<
      string,
      unknown
    >
    expect(bodyArg._t).toBe(42)
    expect(typeof bodyArg._t).toBe('number')
  })

  // 8. Calls checkSpamProtection without skipTurnstile option
  it('should call checkSpamProtection without skipTurnstile option', async () => {
    await postWithFormData()

    expect(mockCheckSpamProtection).toHaveBeenCalledTimes(1)
    // The third argument (options) should be undefined — no skipTurnstile
    const optionsArg = mockCheckSpamProtection.mock.calls[0][2]
    expect(optionsArg).toBeUndefined()
  })

  // 9. Sends Graph payload without attachment when no CV is present
  it('should send email without attachment when no CV is uploaded', async () => {
    const res = await postWithFormData()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    expect(mockSendMicrosoftGraphEmail).toHaveBeenCalledTimes(1)
    const emailArg = mockSendMicrosoftGraphEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(emailArg.to).toBe('manager@the-anchor.pub')
    expect(emailArg.attachments).toBeUndefined()
  })

  // 10. Sends Graph payload with attachment when a small CV is present
  it('should send email with attachment when CV is uploaded', async () => {
    const fileContent = 'test content'
    const fileBuf = Buffer.from(fileContent, 'utf-8')
    const fileBytes = new Uint8Array(fileBuf)

    // Build a File-like object with a working arrayBuffer() for JSDOM.
    // JSDOM's File stored via FormData can lose arrayBuffer support.
    const smallPdf = {
      name: 'cv.pdf',
      type: 'application/pdf',
      size: fileBytes.byteLength,
      arrayBuffer: () => Promise.resolve(fileBytes.buffer),
    }

    // Use a custom FormData whose get('cv') returns our File-like object
    const baseFd = buildFormData()
    const fd = new FormData()
    // Copy all non-cv fields
    for (const [key, value] of baseFd.entries()) {
      fd.append(key, value)
    }

    // Build the request with a formData() that patches in our cv
    const req = new NextRequest('http://localhost:3000/api/careers', {
      method: 'POST',
    })
    const originalGet = fd.get.bind(fd)
    Object.defineProperty(req, 'formData', {
      value: () => {
        // Monkey-patch fd.get to return our File-like for 'cv'
        fd.get = (name: string) => {
          if (name === 'cv') return smallPdf as unknown as FormDataEntryValue
          return originalGet(name)
        }
        return Promise.resolve(fd)
      },
    })

    const POST = await getPostHandler()
    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)

    expect(mockSendMicrosoftGraphEmail).toHaveBeenCalledTimes(1)
    const emailArg = mockSendMicrosoftGraphEmail.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(emailArg.attachments).toBeDefined()
    expect(Array.isArray(emailArg.attachments)).toBe(true)
    const attachments = emailArg.attachments as Array<{
      name: string
      contentType: string
      contentBytes: string
      size: number
    }>
    expect(attachments).toHaveLength(1)
    expect(attachments[0].name).toBe('cv.pdf')
    expect(attachments[0].contentType).toBe('application/pdf')
  })

  // 11. Does not call any management API (no fetch to management URL)
  it('should not make any fetch calls to the management API', async () => {
    const originalFetch = global.fetch
    const fetchCalls: string[] = []
    ;(global as Record<string, unknown>).fetch = jest.fn(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url
        fetchCalls.push(url)
        return originalFetch(input, init)
      }
    )

    try {
      await postWithFormData()
      const managementCalls = fetchCalls.filter((url) =>
        url.includes('management.orangejelly.co.uk')
      )
      expect(managementCalls).toHaveLength(0)
    } finally {
      global.fetch = originalFetch
    }
  })

  // 12. Returns success for a valid submission
  it('should return success for a valid submission', async () => {
    const res = await postWithFormData()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
