export {}

/**
 * POST /api/table-bookings and the booking's page source.
 *
 * The booking form sends a `page_source` object built from the page address:
 * which of our pages the booking came from (`booking_source`) and the ad tags
 * on that address. The route passes six bounded labels to the management app
 * and nowhere else.
 *
 * Three things are pinned here:
 *  1. The labels reach the management app whatever the guest chose about
 *     cookies: they come from the address, not from a cookie.
 *  2. They never reach CheersAI (and so never reach Meta). That forward, and
 *     its consent flags, must be byte for byte what it was before
 *     `page_source` existed.
 *  3. A bad `page_source` is dropped quietly. It is never a reason to refuse a
 *     booking, and never a way to change one.
 *
 * Every outbound call is mocked: nothing here reaches the management app or
 * CheersAI.
 */

const mockGetBusinessHours = jest.fn()

jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args)
  }
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn().mockResolvedValue({ blocked: false })
}))

const OPEN_HOURS = {
  regularHours: {
    tuesday: {
      opens: '12:00',
      closes: '23:00',
      is_closed: false,
      kitchen: { opens: '12:00', closes: '21:00' }
    }
  },
  specialHours: []
} as any

const CHEERSAI_ORIGIN = 'https://cheers.example.test'
const CHEERSAI_INGEST_URL = `${CHEERSAI_ORIGIN}/api/booking-conversions`

// 2026-10-06 is a Tuesday, inside both bar and kitchen hours.
const BOOKING = {
  phone: '07700900000',
  first_name: 'Sam',
  email: 'sam@example.com',
  date: '2026-10-06',
  time: '12:30',
  party_size: 2,
  purpose: 'food',
  default_country_code: '44'
}

// What the form builds from /book-table?source=lunch_dinner_lp&utm_...
const PAGE_SOURCE = {
  booking_source: 'lunch_dinner_lp',
  utm_source: 'ps_facebook',
  utm_medium: 'ps_paid_social',
  utm_campaign: 'weekday_lunch_a_cod_and_chips',
  utm_content: 'ps_ad__var_1',
  short_code: 'jbozdk'
}

const PAGE_SOURCE_FIELDS = Object.keys(PAGE_SOURCE)

// What the form adds at the top level ONLY once the guest has accepted
// marketing cookies (lib/booking-attribution.ts). Deliberately different from
// PAGE_SOURCE, so a leak from one to the other shows.
const CONSENTED_ATTRIBUTION = {
  source_url: 'https://www.the-anchor.pub/lunch-and-dinner',
  landing_path: '/lunch-and-dinner',
  utm_source: 'stored_facebook',
  utm_medium: 'stored_paid_social',
  utm_campaign: 'stored_campaign',
  utm_content: 'stored_ad',
  short_code: 'stored1',
  fbclid: 'fb-click-1',
  attribution_captured_at: '2026-10-05T10:00:00.000Z',
  attribution_updated_at: '2026-10-05T10:05:00.000Z',
  meta_consent_granted: true,
  fbp: 'fb.1.1700000000000.1234567890',
  fbc: 'fb.1.1700000000000.fb-click-1',
  client_user_agent: 'jest-browser'
}

// What the form sends about cookies in each state. Before a choice, after
// declining and after withdrawing, the stored ad record is gone or never
// existed, so no top-level tags are sent.
const CONSENT_STATES: Array<[string, Record<string, unknown>]> = [
  ['no cookie choice yet', {}],
  ['cookies declined', { meta_consent_granted: false }],
  ['cookies accepted', CONSENTED_ATTRIBUTION],
  ['consent withdrawn', { meta_consent_granted: false }]
]

type Call = [string, RequestInit]

describe('POST /api/table-bookings: page_source', () => {
  let createTableBooking: (request: any) => Promise<Response>
  const originalEnv = { ...process.env }

  beforeEach(async () => {
    process.env.ANCHOR_API_KEY = 'test-api-key'
    process.env.CHEERSAI_BOOKING_CONVERSIONS_SECRET = 'test-conversions-secret'
    process.env.CHEERSAI_BASE_URL = CHEERSAI_ORIGIN
    mockGetBusinessHours.mockResolvedValue(OPEN_HOURS)

    ;(global as any).fetch = jest.fn().mockImplementation((url: string) =>
      Promise.resolve(
        String(url) === CHEERSAI_INGEST_URL
          ? new Response(JSON.stringify({ success: true }), { status: 200 })
          : new Response(
              JSON.stringify({ success: true, data: { state: 'confirmed', booking_reference: 'TB-PS-1' } }),
              { status: 201, headers: { 'Content-Type': 'application/json' } }
            )
      )
    )

    if (typeof (Response as any).json !== 'function') {
      ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(body), {
          ...init,
          headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) }
        })
    }

    jest.resetModules()
    ;({ POST: createTableBooking } = await import('@/app/api/table-bookings/route'))
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    jest.clearAllMocks()
  })

  function calls(): Call[] {
    return (global.fetch as jest.Mock).mock.calls as Call[]
  }

  /** The body sent to the management app's create-booking endpoint. */
  function managementBody(): Record<string, unknown> {
    const matches = calls().filter(([url]) => String(url).endsWith('/table-bookings'))
    expect(matches).toHaveLength(1)
    return JSON.parse(String(matches[0][1].body))
  }

  function managementHeaders(): Record<string, string> {
    const [, init] = calls().find(([url]) => String(url).endsWith('/table-bookings')) as Call
    return init.headers as Record<string, string>
  }

  /** The body sent to CheersAI, without the one field that is the clock. */
  function cheersAiBody(): Record<string, unknown> {
    const matches = calls().filter(([url]) => String(url) === CHEERSAI_INGEST_URL)
    expect(matches).toHaveLength(1)
    const { occurredAt, ...rest } = JSON.parse(String(matches[0][1].body))
    expect(typeof occurredAt).toBe('string')
    return rest
  }

  async function post(body: Record<string, unknown>, headers: Record<string, string> = {}) {
    ;(global.fetch as jest.Mock).mockClear()
    const response = await createTableBooking({
      json: async () => body,
      headers: new Headers({
        referer: 'https://www.the-anchor.pub/book-table?source=lunch_dinner_lp&utm_campaign=weekday_lunch_a_cod_and_chips',
        'user-agent': 'jest-request-agent',
        ...headers
      })
    })
    return response
  }

  describe.each(CONSENT_STATES)('with %s', (_state, consentFields) => {
    it('sends the six labels to the management app as flat fields', async () => {
      const response = await post({ ...BOOKING, ...consentFields, page_source: PAGE_SOURCE })

      expect(response.status).toBe(201)
      const body = managementBody()
      expect(body).toMatchObject(PAGE_SOURCE)
      // Flat, as the management app's schema reads them: no nested object.
      expect(body).not.toHaveProperty('page_source')
      // The booking itself is untouched.
      expect(body).toMatchObject({
        phone: BOOKING.phone,
        date: BOOKING.date,
        time: BOOKING.time,
        party_size: BOOKING.party_size,
        purpose: BOOKING.purpose,
        booking_type: 'regular',
        skip_customer_sms: true
      })
    })

    it('sends CheersAI exactly what it sent before page_source existed', async () => {
      await post({ ...BOOKING, ...consentFields })
      const before = cheersAiBody()

      await post({ ...BOOKING, ...consentFields, page_source: PAGE_SOURCE })
      const after = cheersAiBody()

      expect(after).toEqual(before)
    })

    it('never puts a page_source label in the CheersAI forward', async () => {
      await post({ ...BOOKING, ...consentFields, page_source: PAGE_SOURCE })

      const forwarded = JSON.stringify(cheersAiBody())
      for (const value of Object.values(PAGE_SOURCE)) {
        expect(forwarded).not.toContain(value)
      }
      expect(forwarded).not.toContain('page_source')
      expect(forwarded).not.toContain('booking_source')
    })
  })

  it.each([
    ['no cookie choice yet', {}],
    ['cookies declined', { meta_consent_granted: false }],
    ['consent withdrawn', { meta_consent_granted: false }]
  ])('with %s, CheersAI gets no ad tags and no Meta signals, as today', async (_state, consentFields) => {
    await post({ ...BOOKING, ...consentFields, page_source: PAGE_SOURCE })

    expect(cheersAiBody()).toEqual({
      sourceSite: 'www.the-anchor.pub',
      bookingId: 'TB-PS-1',
      metaEventId: 'TB-PS-1',
      bookingType: 'table',
      eventDate: BOOKING.date,
      tickets: BOOKING.party_size,
      value: expect.any(Number),
      currency: 'GBP',
      foodIntent: 'food',
      // From the Referer header, path only. The query, with its tags, is cut.
      sourceUrl: 'https://www.the-anchor.pub/book-table',
      landingPath: '/book-table',
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      fbclid: null,
      gclid: null,
      shortCode: null,
      attributionCapturedAt: null,
      attributionUpdatedAt: null,
      metaConsentGranted: false,
      fbp: null,
      fbc: null,
      clientUserAgent: null,
      emailSha256: null,
      phoneSha256: null,
      clientIpAddress: null
    })
  })

  it('with cookies accepted, CheersAI gets the stored tags and Meta signals, as today, not the page labels', async () => {
    await post(
      { ...BOOKING, ...CONSENTED_ATTRIBUTION, page_source: PAGE_SOURCE },
      {
        'x-forwarded-for': '203.0.113.9',
        // The consent cookie travels with the request, and the route reads it:
        // the body's word alone is not enough (lib/booking-conversion-consent.ts).
        cookie: 'anchor-cookie-consent=' + encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, marketing: true }))
      }
    )

    expect(cheersAiBody()).toEqual({
      sourceSite: 'www.the-anchor.pub',
      bookingId: 'TB-PS-1',
      metaEventId: 'TB-PS-1',
      bookingType: 'table',
      eventDate: BOOKING.date,
      tickets: BOOKING.party_size,
      value: expect.any(Number),
      currency: 'GBP',
      foodIntent: 'food',
      sourceUrl: CONSENTED_ATTRIBUTION.source_url,
      landingPath: CONSENTED_ATTRIBUTION.landing_path,
      utmSource: 'stored_facebook',
      utmMedium: 'stored_paid_social',
      utmCampaign: 'stored_campaign',
      utmContent: 'stored_ad',
      utmTerm: null,
      fbclid: 'fb-click-1',
      gclid: null,
      shortCode: 'stored1',
      attributionCapturedAt: CONSENTED_ATTRIBUTION.attribution_captured_at,
      attributionUpdatedAt: CONSENTED_ATTRIBUTION.attribution_updated_at,
      metaConsentGranted: true,
      fbp: CONSENTED_ATTRIBUTION.fbp,
      fbc: CONSENTED_ATTRIBUTION.fbc,
      clientUserAgent: 'jest-browser',
      emailSha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      phoneSha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      clientIpAddress: expect.any(String)
    })

    // And the other way round: the management app gets the page labels, not
    // the consent-gated record meant for CheersAI.
    const management = managementBody()
    expect(management).toMatchObject(PAGE_SOURCE)
    const sent = JSON.stringify(management)
    for (const marker of ['stored_facebook', 'stored_campaign', 'stored_ad', 'stored1', 'fb-click-1', 'fb.1.', 'jest-browser']) {
      expect(sent).not.toContain(marker)
    }
  })

  it('sends the management app no labels when the form sent no page_source, even with consented tags', async () => {
    const response = await post({ ...BOOKING, ...CONSENTED_ATTRIBUTION })

    expect(response.status).toBe(201)
    const body = managementBody()
    for (const field of PAGE_SOURCE_FIELDS) {
      expect(body).not.toHaveProperty(field)
    }
  })

  describe('a bad page_source never stops or changes a booking', () => {
    it.each([
      ['a string', 'lunch_dinner_lp'],
      ['a number', 42],
      ['true', true],
      ['null', null],
      ['an array', [PAGE_SOURCE]],
      ['an empty object', {}]
    ])('drops a page_source that is %s and still books', async (_label, pageSource) => {
      const response = await post({ ...BOOKING, page_source: pageSource })

      expect(response.status).toBe(201)
      const body = managementBody()
      for (const field of PAGE_SOURCE_FIELDS) {
        expect(body).not.toHaveProperty(field)
      }
      expect(body).not.toHaveProperty('page_source')
      expect(body).toMatchObject({ phone: BOOKING.phone, date: BOOKING.date, party_size: BOOKING.party_size })
    })

    it.each([
      ['null', null],
      ['a number', 7],
      ['an object', { nested: 'x' }],
      ['an array', ['weekday_lunch_a_cod_and_chips']],
      ['true', true],
      ['an empty string', ''],
      ['only spaces', '    ']
    ])('drops a field that is %s, keeps the good ones, and still books', async (_label, bad) => {
      const response = await post({
        ...BOOKING,
        page_source: { ...PAGE_SOURCE, utm_campaign: bad, utm_medium: bad }
      })

      expect(response.status).toBe(201)
      const body = managementBody()
      expect(body).not.toHaveProperty('utm_campaign')
      expect(body).not.toHaveProperty('utm_medium')
      expect(body).toMatchObject({
        booking_source: 'lunch_dinner_lp',
        utm_source: 'ps_facebook',
        utm_content: 'ps_ad__var_1',
        short_code: 'jbozdk'
      })
    })

    it('still books when all six fields are bad at once, and forwards none of them', async () => {
      const response = await post({
        ...BOOKING,
        page_source: {
          booking_source: null,
          utm_source: 12,
          utm_medium: { a: 1 },
          utm_campaign: ['x'],
          utm_content: '',
          short_code: '   '
        }
      })

      expect(response.status).toBe(201)
      const body = managementBody()
      for (const field of PAGE_SOURCE_FIELDS) {
        expect(body).not.toHaveProperty(field)
      }
    })

    it('trims each label and cuts it to its limit', async () => {
      const response = await post({
        ...BOOKING,
        page_source: {
          booking_source: `  ${'b'.repeat(200)}  `,
          utm_source: 's'.repeat(200),
          utm_medium: 'm'.repeat(200),
          utm_campaign: 'c'.repeat(300),
          utm_content: 'x'.repeat(500),
          short_code: '  jbozdk  '
        }
      })

      expect(response.status).toBe(201)
      const body = managementBody() as Record<string, string>
      expect(body.booking_source).toBe('b'.repeat(80))
      expect(body.utm_source).toBe('s'.repeat(80))
      expect(body.utm_medium).toBe('m'.repeat(80))
      expect(body.utm_campaign).toBe('c'.repeat(160))
      expect(body.utm_content).toBe('x'.repeat(160))
      expect(body.short_code).toBe('jbozdk')
    })

    it('cuts a long short code to 32 characters', async () => {
      await post({ ...BOOKING, page_source: { short_code: 'k'.repeat(100) } })

      expect(managementBody().short_code).toBe('k'.repeat(32))
    })

    it('forwards nothing but the six labels, so a page_source cannot change the booking', async () => {
      const response = await post({
        ...BOOKING,
        page_source: {
          ...PAGE_SOURCE,
          // Not labels: click ids and anything else on the address.
          fbclid: 'fb-should-not-pass',
          gclid: 'g-should-not-pass',
          utm_term: 'term-should-not-pass',
          anything_else: 'extra-should-not-pass',
          // An attempt to overwrite the booking through the label object.
          phone: '07000000000',
          date: '2030-01-01',
          time: '03:00',
          party_size: 20,
          purpose: 'drinks',
          booking_type: 'sunday_lunch',
          skip_customer_sms: false,
          notes: 'injected'
        }
      })

      expect(response.status).toBe(201)
      const body = managementBody()
      expect(body).toMatchObject(PAGE_SOURCE)
      expect(body).toMatchObject({
        phone: BOOKING.phone,
        date: BOOKING.date,
        time: BOOKING.time,
        party_size: BOOKING.party_size,
        purpose: BOOKING.purpose,
        booking_type: 'regular',
        skip_customer_sms: true
      })
      expect(body).not.toHaveProperty('notes')
      expect(body).not.toHaveProperty('fbclid')
      expect(body).not.toHaveProperty('gclid')
      expect(body).not.toHaveProperty('utm_term')
      expect(body).not.toHaveProperty('anything_else')
      expect(JSON.stringify(body)).not.toContain('should-not-pass')
    })

    it('does not loosen the checks on the booking itself', async () => {
      const response = await post({ ...BOOKING, party_size: 21, page_source: PAGE_SOURCE })

      expect(response.status).toBe(400)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('does not rescue a booking with a required field missing', async () => {
      const { phone: _phone, ...withoutPhone } = BOOKING
      const response = await post({ ...withoutPhone, page_source: { ...PAGE_SOURCE, phone: BOOKING.phone } })

      expect(response.status).toBe(400)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  it('keeps the labels out of the fallback Idempotency-Key, so a retry with other tags is the same booking', async () => {
    await post({ ...BOOKING })
    const plain = managementHeaders()['Idempotency-Key']

    await post({ ...BOOKING, page_source: PAGE_SOURCE })
    const tagged = managementHeaders()['Idempotency-Key']

    await post({ ...BOOKING, page_source: { ...PAGE_SOURCE, utm_campaign: 'weekday_dinner_a_pizza', short_code: 'zzzzzz' } })
    const retagged = managementHeaders()['Idempotency-Key']

    expect(plain).toMatch(/^tbl_[0-9a-f]{64}$/)
    expect(tagged).toBe(plain)
    expect(retagged).toBe(plain)
  })
})
