/**
 * Review BK-080: every website route that passes a consent record to the
 * management app passes on which notice the guest was shown, and passes on
 * nothing it does not recognise.
 *
 * Only the outside world is mocked (fetch, the API client, the mail senders and
 * the bot check), so nothing here can book, charge or email anybody.
 */

// A module, so its names do not collide with other script-style test files.
export {}

jest.mock('@/lib/microsoft-graph-mail', () => ({
  sendMicrosoftGraphEmail: jest.fn(async () => undefined),
  escapeHtml: (text: string) => text
}))

jest.mock('@/lib/enquiry-fallback-email', () => ({
  sendEnquiryFallbackEmail: jest.fn(async () => ({ sent: true })),
  escapeHtml: (text: string) => text
}))

jest.mock('@/lib/spam-protection', () => ({
  checkSpamProtection: jest.fn(async () => ({ blocked: false }))
}))

jest.mock('@/lib/booking-conversion-forwarding', () => ({
  forwardBookingConversionToCheersAI: jest.fn(async () => undefined)
}))

const mockGetBusinessHours = jest.fn()
const mockCreateParkingPaymentOrder = jest.fn()
jest.mock('@/lib/api', () => ({
  anchorAPI: {
    getBusinessHours: (...args: unknown[]) => mockGetBusinessHours(...args),
    createParkingPaymentOrder: (...args: unknown[]) => mockCreateParkingPaymentOrder(...args)
  }
}))

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init?.headers as Record<string, string>) || {}) }
    })
}

const EVENT_ID = '0b6f1c1e-6f6a-4c58-9a57-0d6d0c5d7f11'

const CONSENT = {
  service_contact_notice_shown: true,
  marketing_email_opt_in: false,
  marketing_sms_opt_in: false,
  whatsapp_opt_in: false,
  marketing_whatsapp_opt_in: false,
  consent_text_version: 'guest-comms-consent-v6'
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function jsonRequest(body: unknown) {
  return {
    json: async () => body,
    headers: new Headers({ 'content-type': 'application/json', referer: 'https://www.the-anchor.pub/book-table' }),
    url: 'http://localhost/api/test'
  } as never
}

const ORIGINAL_ENV = process.env
let sentUpstream: Array<{ url: string; body: Record<string, any> }>
let answer: () => Response

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
  process.env = {
    ...ORIGINAL_ENV,
    ANCHOR_API_KEY: 'test-key',
    ANCHOR_API_BASE_URL: 'https://management.example.test/api'
  }
  sentUpstream = []
  answer = () => json({ success: true })
  mockGetBusinessHours.mockResolvedValue({
    regularHours: {
      tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '12:00', closes: '21:00' } }
    },
    specialHours: []
  })
  ;(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    sentUpstream.push({ url: String(input), body: JSON.parse(String(init?.body ?? '{}')) })
    return answer()
  })
})

afterEach(() => {
  process.env = ORIGINAL_ENV
})

type RouteCase = {
  label: string
  noticeKey: string
  send: (consent: Record<string, unknown>) => Promise<Record<string, any>>
}

const ROUTES: RouteCase[] = [
  {
    label: 'POST /api/table-bookings',
    noticeKey: 'table_compact_v6',
    send: async (consent) => {
      answer = () => json({ success: true, data: { state: 'confirmed', booking_reference: 'TB-1' } }, 201)
      const { POST } = await import('@/app/api/table-bookings/route')
      // 2026-08-04 is a Tuesday, inside both bar and kitchen hours.
      await POST(jsonRequest({
        phone: '07700900123', first_name: 'Alice', email: 'alice@example.com',
        date: '2026-08-04', time: '19:00', party_size: 2, purpose: 'food',
        communication_consent: consent
      }))
      return sentUpstream.find((call) => call.url.endsWith('/table-bookings'))!.body
    }
  },
  {
    label: 'POST /api/table-bookings from the quick-book sheet',
    noticeKey: 'table_quick_book_v1',
    send: async (consent) => {
      answer = () => json({ success: true, data: { state: 'confirmed', booking_reference: 'TB-2' } }, 201)
      const { POST } = await import('@/app/api/table-bookings/route')
      await POST(jsonRequest({
        phone: '07700900123', first_name: 'Alice', date: '2026-08-04', time: '19:00', party_size: 2,
        purpose: 'food', default_country_code: '44', communication_consent: consent
      }))
      return sentUpstream.find((call) => call.url.endsWith('/table-bookings'))!.body
    }
  },
  {
    label: 'POST /api/event-bookings',
    noticeKey: 'event_compact_v6',
    send: async (consent) => {
      answer = () => json({ success: true, data: { state: 'confirmed', booking_id: 'b-1' } }, 201)
      const { POST } = await import('@/app/api/event-bookings/route')
      await POST(jsonRequest({
        event_id: EVENT_ID, phone: '07700900123', first_name: 'Alice', last_name: 'Booker',
        email: 'alice@example.com', seats: 2, communication_consent: consent
      }))
      return sentUpstream.find((call) => call.url.endsWith('/event-bookings'))!.body
    }
  },
  {
    label: 'POST /api/event-waitlist',
    noticeKey: 'event_compact_v6',
    send: async (consent) => {
      answer = () => json({ success: true, data: { state: 'queued' } })
      const { POST } = await import('@/app/api/event-waitlist/route')
      await POST(jsonRequest({
        event_id: EVENT_ID, phone: '07700900123', requested_seats: 2, first_name: 'Alice',
        email: 'alice@example.com', communication_consent: consent
      }))
      return sentUpstream.find((call) => call.url.endsWith('/event-waitlist'))!.body
    }
  },
  {
    label: 'POST /api/public/private-booking',
    noticeKey: 'service_notice_v6',
    send: async (consent) => {
      answer = () => json({ booking_id: 'pb-1', reference: 'PB-1', state: 'enquiry_created' }, 201)
      const { POST } = await import('@/app/api/public/private-booking/route')
      await POST(jsonRequest({
        customer_first_name: 'Alice', customer_last_name: 'Booker', contact_phone: '07700900123',
        event_date: '2026-12-01', start_time: '19:00', guest_count: 30, communication_consent: consent
      }))
      return sentUpstream[sentUpstream.length - 1].body
    }
  },
  {
    label: 'POST /api/parking/payment/create-order',
    noticeKey: 'service_notice_v6',
    send: async (consent) => {
      mockCreateParkingPaymentOrder.mockResolvedValue({ paypal_order_id: 'ORDER-1', booking_id: 'park-1' })
      const { POST } = await import('@/app/api/parking/payment/create-order/route')
      await POST(jsonRequest({
        customer: { first_name: 'Alice', last_name: 'Booker', email: 'alice@example.com', mobile_number: '07700900123' },
        vehicle: { registration: 'AB12 CDE' },
        start_at: '2026-11-01T08:00:00+00:00',
        end_at: '2026-11-05T08:00:00+00:00',
        communication_consent: consent
      }))
      expect(mockCreateParkingPaymentOrder).toHaveBeenCalledTimes(1)
      return mockCreateParkingPaymentOrder.mock.calls[0][0]
    }
  }
]

describe.each(ROUTES)('$label', ({ noticeKey, send }) => {
  it(`passes on the notice key ${noticeKey}`, async () => {
    const forwarded = await send({ ...CONSENT, notice_key: noticeKey })
    expect(forwarded.communication_consent).toEqual({ ...CONSENT, notice_key: noticeKey })
  })

  it('drops a key it does not recognise, and still passes on the rest of the record', async () => {
    const forwarded = await send({ ...CONSENT, notice_key: 'table_compact_v5' })
    expect(forwarded.communication_consent).toEqual(CONSENT)
  })
})

describe('the private hire enquiry key', () => {
  // That route hashes the whole enquiry, consent included, when no key is sent. The notice
  // key is left out of that hash, so an enquiry gets the key it got before notice keys
  // existed, and a retry across the deploy is still the same enquiry.
  it('is the same with or without a notice key', async () => {
    answer = () => json({ booking_id: 'pb-1', reference: 'PB-1', state: 'enquiry_created' }, 201)
    const keys: string[] = []
    ;(global as any).fetch = jest.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      keys.push((init?.headers as Record<string, string>)['Idempotency-Key'])
      return answer()
    })
    const { POST } = await import('@/app/api/public/private-booking/route')
    const enquiry = {
      customer_first_name: 'Alice', customer_last_name: 'Booker', contact_phone: '07700900123',
      event_date: '2026-12-01', start_time: '19:00', guest_count: 30
    }

    await POST(jsonRequest({ ...enquiry, communication_consent: CONSENT }))
    await POST(jsonRequest({ ...enquiry, communication_consent: { ...CONSENT, notice_key: 'service_notice_v6' } }))

    expect(keys).toHaveLength(2)
    expect(keys[0]).toMatch(/^prv_[0-9a-f]{64}$/)
    expect(keys[1]).toBe(keys[0])
  })
})
