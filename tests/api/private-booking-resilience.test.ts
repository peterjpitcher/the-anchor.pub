export {}

// A private-hire enquiry that reaches this route must never disappear.
//
// On 11 August 2026 a security migration in the management app revoked anon
// EXECUTE on create_private_booking_transaction, and the enquiry endpoint there
// was still writing with the anon-key session client. Every enquiry from this
// site failed with a 500 and was lost: no booking, no email, no record that
// anyone had tried. These tests cover this side of that failure.

jest.mock('@/lib/management-api-base', () => ({
  getManagementApiBaseUrl: () => 'https://example.invalid/api'
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

jest.mock('@/lib/error-handling', () => ({
  logError: jest.fn()
}))

const mockSendEnquiryFallbackEmail = jest.fn()

jest.mock('@/lib/enquiry-fallback-email', () => ({
  sendEnquiryFallbackEmail: (...args: unknown[]) => mockSendEnquiryFallbackEmail(...args),
  escapeHtml: (text: string) => text
}))

const VALID_BODY = {
  customer_first_name: 'Alice',
  customer_last_name: 'Booker',
  contact_phone: '+447700900000',
  contact_email: 'alice@example.com',
  event_type: 'Milestone Birthday',
  event_date: '2026-09-10',
  start_time: '19:00',
  guest_count: 80,
  internal_notes: 'Calculated Estimate: £900.00'
}

const ORIGINAL_ENV = process.env

beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, ANCHOR_API_KEY: 'test-key' }
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

afterAll(() => {
  process.env = ORIGINAL_ENV
})

type Call = { url: string; init: RequestInit }

async function loadRoute(responder: (attempt: number) => Response | Promise<Response>) {
  const calls: Call[] = []
  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: typeof input === 'string' ? input : input.toString(), init: init ?? {} })
    return responder(calls.length)
  })

  jest.resetModules()
  const { POST } = await import('@/app/api/public/private-booking/route')
  return { POST, calls }
}

function post(body: Record<string, unknown> = VALID_BODY): Request {
  return new Request('http://localhost/api/public/private-booking', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

function bodyOf(call: Call): Record<string, unknown> {
  return JSON.parse(String(call.init.body))
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendEnquiryFallbackEmail.mockResolvedValue({ sent: true })
})

describe('the enquiry payload keeps every field the guest typed', () => {
  it('sends email and event_type as real fields, not just notes text', async () => {
    const { POST, calls } = await loadRoute(() =>
      new Response(JSON.stringify({ booking_id: 'pb-1', reference: 'PB-1' }), { status: 201 })
    )

    await POST(post() as any)

    const sent = bodyOf(calls[0])
    // Both used to exist only inside the notes blob, so every website enquiry
    // landed with contact_email and event_type NULL in the management app.
    expect(sent.email).toBe('alice@example.com')
    expect(sent.event_type).toBe('Milestone Birthday')
    expect(sent.group_size).toBe(80)
    expect(String(sent.notes)).toContain('alice@example.com')
  })

  it('forwards a party larger than 50 guests unchanged', async () => {
    const { POST, calls } = await loadRoute(() =>
      new Response(JSON.stringify({ booking_id: 'pb-1' }), { status: 201 })
    )

    await POST(post({ ...VALID_BODY, guest_count: 150 }) as any)

    expect(bodyOf(calls[0]).group_size).toBe(150)
  })
})

describe('a transient management API failure does not cost the booking', () => {
  it('retries a 500 and succeeds on a later attempt', async () => {
    const { POST, calls } = await loadRoute((attempt) =>
      attempt < 3
        ? new Response(JSON.stringify({ error: 'Failed to create enquiry' }), { status: 500 })
        : new Response(JSON.stringify({ booking_id: 'pb-9', reference: 'PB-9' }), { status: 201 })
    )

    const response = await POST(post() as any)
    const body = await response.json()

    expect(calls).toHaveLength(3)
    expect(body.success).toBe(true)
    expect(mockSendEnquiryFallbackEmail).not.toHaveBeenCalled()
  })

  it('reuses one Idempotency-Key across retries so no duplicate can be created', async () => {
    const { POST, calls } = await loadRoute((attempt) =>
      attempt < 3
        ? new Response(JSON.stringify({ error: 'boom' }), { status: 503 })
        : new Response(JSON.stringify({ booking_id: 'pb-9' }), { status: 201 })
    )

    await POST(post() as any)

    const keys = calls.map(call => (call.init.headers as Record<string, string>)['Idempotency-Key'])
    expect(new Set(keys).size).toBe(1)
  })

  it('emails the manager when every attempt fails, and tells the guest it worked', async () => {
    const { POST, calls } = await loadRoute(() =>
      new Response(JSON.stringify({ error: 'Failed to create enquiry' }), { status: 500 })
    )

    const response = await POST(post() as any)
    const body = await response.json()

    expect(calls).toHaveLength(3)
    expect(mockSendEnquiryFallbackEmail).toHaveBeenCalledTimes(1)

    const email = mockSendEnquiryFallbackEmail.mock.calls[0][0]
    expect(email.textContent).toContain('+447700900000')
    expect(email.textContent).toContain('alice@example.com')
    expect(email.textContent).toContain('2026-09-10')
    expect(email.replyTo).toBe('alice@example.com')

    // The enquiry genuinely reached a human, so this is true rather than a
    // comforting lie.
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.state).toBe('enquiry_emailed')
  })

  it('emails the manager when the network never answers', async () => {
    ;(global as any).fetch = jest.fn(async () => {
      throw new Error('network down')
    })
    jest.resetModules()
    const { POST } = await import('@/app/api/public/private-booking/route')

    const response = await POST(post() as any)
    const body = await response.json()

    expect(mockSendEnquiryFallbackEmail).toHaveBeenCalledTimes(1)
    expect(body.success).toBe(true)
  })

  it('refuses to claim success when the fallback email also fails', async () => {
    mockSendEnquiryFallbackEmail.mockResolvedValue({ sent: false, error: 'graph down' })

    const { POST } = await loadRoute(() =>
      new Response(JSON.stringify({ error: 'Failed to create enquiry' }), { status: 500 })
    )

    const response = await POST(post() as any)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).not.toBe(true)
  })
})

describe('a rejection the guest can act on is shown to them', () => {
  it('does not retry a 400, but still captures the lead by email', async () => {
    const { POST, calls } = await loadRoute(() =>
      new Response(JSON.stringify({ success: false, error: 'Please enter a valid email address' }), { status: 400 })
    )

    const response = await POST(post() as any)
    const body = await response.json()

    expect(calls).toHaveLength(1)
    expect(response.status).toBe(400)
    expect(body.error).toBe('Please enter a valid email address')
    expect(mockSendEnquiryFallbackEmail).toHaveBeenCalledTimes(1)
  })

  it('does not email again for a duplicate already held upstream', async () => {
    const { POST } = await loadRoute(() =>
      new Response(JSON.stringify({ success: false, error: 'already being processed' }), { status: 409 })
    )

    await POST(post() as any)

    expect(mockSendEnquiryFallbackEmail).not.toHaveBeenCalled()
  })
})
