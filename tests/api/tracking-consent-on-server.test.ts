/**
 * The two tracking routes check the visitor's cookie choice themselves.
 *
 * Both pass data on with a server secret: /api/analytics to Google Analytics,
 * /api/tracking/booking-conversion to our marketing system. They used to trust
 * the browser: analytics forwarded whenever a Google client id was present, and
 * the conversion route believed a flag in the request body. The consent cookie
 * travels with every same-site request, so the routes read it.
 *
 * Nothing between the request and the outgoing fetch is mocked.
 */

const GOOGLE = 'https://www.google-analytics.com/mp/collect'
const CHEERS = 'https://cheers.example.com'

function consentCookie(choice: { analytics: boolean; marketing: boolean }): string {
  return `anchor-cookie-consent=${encodeURIComponent(JSON.stringify({ necessary: true, ...choice }))}`
}

function jsonRequest(path: string, body: unknown, cookie?: string): any {
  const headers = new Headers({ 'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.50' })
  if (cookie) headers.set('cookie', cookie)
  const url = `https://www.the-anchor.pub${path}`
  return {
    url,
    nextUrl: new URL(url),
    method: 'POST',
    headers,
    json: async () => body,
    text: async () => JSON.stringify(body)
  }
}

function outgoing(to: string): Array<{ url: string; body: any }> {
  return (global.fetch as jest.Mock).mock.calls
    .filter((call) => String(call[0]).startsWith(to))
    .map((call) => ({ url: String(call[0]), body: JSON.parse(String(call[1]?.body)) }))
}

const saved: Record<string, string | undefined> = {}
const ENV = {
  GA4_MEASUREMENT_ID: 'G-TESTSTREAM',
  GA4_API_SECRET: 'test-secret',
  CHEERSAI_BOOKING_CONVERSIONS_SECRET: 'cheers-secret',
  CHEERSAI_BASE_URL: CHEERS
}

beforeEach(() => {
  for (const [key, value] of Object.entries(ENV)) {
    saved[key] = process.env[key]
    process.env[key] = value
  }
  jest.resetModules()
  ;(global as any).fetch = jest.fn(async () => new Response('{}', { status: 202 }))
  if (typeof (Response as any).json !== 'function') {
    ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
      })
  }
})

afterEach(() => {
  for (const key of Object.keys(ENV)) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
})

describe('POST /api/analytics', () => {
  // A batch exactly as a consenting browser would send it, Google ids and all,
  // so the only thing that differs between the cases is the consent cookie.
  const BATCH = {
    events: [{ event: 'table_booking_completed', client_id: '111.222', session_id: '1723334455', page_path: '/book-table' }]
  }

  it.each([
    ['there is no consent cookie (no choice made)', undefined],
    ['analytics was refused', consentCookie({ analytics: false, marketing: false })],
    ['only marketing was accepted', consentCookie({ analytics: false, marketing: true })],
    ['the cookie cannot be read', 'anchor-cookie-consent=%7Bbroken']
  ])('forwards nothing to Google when %s', async (_label, cookie) => {
    const { POST } = await import('@/app/api/analytics/route')

    const response = await POST(jsonRequest('/api/analytics', BATCH, cookie))

    // Still a quiet success: analytics must never surface as an error.
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, count: 0 })
    expect(outgoing(GOOGLE)).toHaveLength(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('forwards the batch once analytics has been accepted', async () => {
    const { POST } = await import('@/app/api/analytics/route')

    await POST(jsonRequest('/api/analytics', BATCH, consentCookie({ analytics: true, marketing: false })))

    const sent = outgoing(GOOGLE)
    expect(sent).toHaveLength(1)
    expect(sent[0].body.client_id).toBe('111.222')
    expect(sent[0].body.events[0].name).toBe('table_booking_completed')
    // Marketing was refused, and Google is told so.
    expect(sent[0].body.consent).toEqual({ ad_user_data: 'DENIED', ad_personalization: 'DENIED' })
    expect(sent[0].body.non_personalized_ads).toBe(true)
  })
})

describe('POST /api/tracking/booking-conversion', () => {
  // What the browser sent before this was fixed, for a guest who refused
  // marketing cookies but booked on a tagged link: the flag false, the tags
  // read off the address bar anyway. And the same body with the flag forged.
  const TAGS = {
    sourceUrl: 'https://www.the-anchor.pub/book-table?utm_source=facebook&fbclid=fb-123',
    landingPath: '/book-table',
    utmSource: 'facebook',
    utmMedium: 'paid_social',
    utmCampaign: 'quiz-night',
    utmContent: 'recipient-row-id',
    fbclid: 'fb-123',
    gclid: 'g-456',
    shortCode: 'abc',
    fbp: 'fb.1.1.1',
    fbc: 'fb.1.1.fb-123',
    clientUserAgent: 'Mozilla/5.0'
  }
  const BOOKING = { sourceSite: 'www.the-anchor.pub', bookingId: 'TB-1', bookingType: 'table', value: 100, currency: 'GBP' }

  it.each([
    ['the browser says no, whatever the cookie says', false, consentCookie({ analytics: true, marketing: true })],
    ['the body claims yes but the cookie says no', true, consentCookie({ analytics: true, marketing: false })],
    ['the body claims yes and there is no cookie', true, undefined]
  ])('passes the booking on without the advert tags when %s', async (_label, flag, cookie) => {
    const { POST } = await import('@/app/api/tracking/booking-conversion/route')

    const response = await POST(
      jsonRequest('/api/tracking/booking-conversion', { ...BOOKING, ...TAGS, metaConsentGranted: flag }, cookie)
    )

    expect(response.status).toBe(202)
    const sent = outgoing(CHEERS)
    expect(sent).toHaveLength(1)
    expect(sent[0].body).toMatchObject({
      bookingId: 'TB-1',
      bookingType: 'table',
      value: 100,
      sourceUrl: 'https://www.the-anchor.pub/book-table',
      landingPath: '/book-table',
      metaConsentGranted: false,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      fbclid: null,
      gclid: null,
      shortCode: null,
      fbp: null,
      fbc: null,
      clientUserAgent: null
    })
    const text = JSON.stringify(sent[0].body)
    for (const leaked of ['fb-123', 'g-456', 'facebook', 'recipient-row-id', 'Mozilla', '?']) {
      expect(text).not.toContain(leaked)
    }
  })

  it('passes the tags on when the browser says yes and the cookie agrees', async () => {
    const { POST } = await import('@/app/api/tracking/booking-conversion/route')

    await POST(
      jsonRequest(
        '/api/tracking/booking-conversion',
        { ...BOOKING, ...TAGS, metaConsentGranted: true },
        consentCookie({ analytics: false, marketing: true })
      )
    )

    expect(outgoing(CHEERS)[0].body).toMatchObject({ ...TAGS, metaConsentGranted: true })
  })
})
