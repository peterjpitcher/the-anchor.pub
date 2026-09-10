import { canUseCookieCategory } from '@/lib/cookies'
import { trackMetaBookingPurchase } from '@/lib/meta-pixel'
import { trackEventBookingComplete, trackTableBookingFunnel } from '@/lib/gtm-events'

jest.mock('@/lib/cookies', () => ({
  canUseCookieCategory: jest.fn()
}))

const mockedCanUseCookieCategory = canUseCookieCategory as jest.MockedFunction<typeof canUseCookieCategory>

// The Meta Pixel base tag (init + PageView) is owned by GTM. These tests treat window.fbq as the
// pixel GTM has already installed, and verify this module only fires Purchase + forwards server-side.
function fbqMock() {
  return window.fbq as unknown as jest.Mock
}

function purchaseCalls() {
  return fbqMock().mock.calls.filter((entry) => entry[0] === 'track' && entry[1] === 'Purchase')
}

// The conversion forward is no longer the only fetch on this path: since GA4
// delivery became the default, dispatchTrackingEvent also POSTs to
// /api/analytics. Select the call under test by URL rather than assuming the
// page makes exactly one request.
function conversionCalls() {
  return (global.fetch as jest.Mock).mock.calls.filter(
    (call) => String(call[0]).includes('/api/tracking/booking-conversion')
  )
}

describe('Meta Pixel booking tracking', () => {
  beforeEach(() => {
    mockedCanUseCookieCategory.mockImplementation((category) => category === 'marketing' || category === 'analytics')
    window.fbq = jest.fn() as unknown as typeof window.fbq
    delete window.__anchorMetaPixelPurchaseEvents
    window.localStorage.clear()
    window.dataLayer = []
    window.history.pushState({}, '', '/book-table?utm_source=facebook&utm_medium=paid_social&utm_campaign=quiz-night&fbclid=fb-123')
    document.cookie = '_fbp=fb.1.1710000000.browser-123; path=/'
    ;(global as any).fetch = jest.fn().mockResolvedValue(new Response('{}', { status: 202 }))
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('never initialises a pixel — GTM owns init + PageView', () => {
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-INIT',
      bookingType: 'table',
      source: 'booking_widget',
      deviceType: 'desktop'
    })

    const inits = fbqMock().mock.calls.filter((entry) => entry[0] === 'init')
    const pageViews = fbqMock().mock.calls.filter((entry) => entry[0] === 'track' && entry[1] === 'PageView')
    expect(inits).toHaveLength(0)
    expect(pageViews).toHaveLength(0)
  })

  it('fires one Purchase on GTM\'s pixel for a confirmed table booking and deduplicates by reference', () => {
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-123',
      bookingType: 'sunday_roast',
      partySize: 4,
      bookingDate: '2026-05-10',
      bookingTime: '19:00',
      source: 'booking_widget',
      deviceType: 'desktop'
    })
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-123',
      bookingType: 'table',
      source: 'booking_widget',
      deviceType: 'desktop'
    })

    const purchases = purchaseCalls()
    expect(purchases).toHaveLength(1)
    expect(purchases[0]?.[2]).toMatchObject({
      currency: 'GBP',
      // Estimated covers revenue (4 x GBP 25), the same figure the server-side forward
      // reports for this booking reference. The pixel used to say GBP 0 here.
      value: 100,
      num_items: 4,
      event_date: '2026-05-10',
      booking_type: 'sunday_roast',
      booking_source: 'booking_widget'
    })
    expect(purchases[0]?.[3]).toEqual({ eventID: 'BK-123' })

    expect(conversionCalls()).toHaveLength(1)
    const forwardedPayload = JSON.parse(String(conversionCalls()[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-123',
      metaEventId: 'BK-123',
      bookingType: 'table',
      // Regression: these three arrived as null, 0 and null, and because the browser
      // forward shares a booking reference with the server-side one, CheersAI's
      // idempotent upsert wrote the placeholders over the real figures.
      tickets: 4,
      value: 100,
      eventDate: '2026-05-10',
      sourceSite: 'localhost',
      landingPath: '/book-table',
      utmSource: 'facebook',
      utmMedium: 'paid_social',
      utmCampaign: 'quiz-night',
      fbclid: 'fb-123',
      metaConsentGranted: true,
      fbp: 'fb.1.1710000000.browser-123',
      fbc: expect.stringContaining('fb-123')
    })
    expect(JSON.stringify(forwardedPayload)).not.toMatch(/07700900000|Jane|Smith|@/)
  })

  it('fires one Purchase for a confirmed event booking with event metadata', () => {
    trackEventBookingComplete({
      eventId: 'event-1',
      eventName: 'Quiz Night',
      eventSlug: 'quiz-night',
      eventCategoryName: 'Quiz',
      eventCategorySlug: 'quiz',
      eventDate: '2026-05-10T20:00:00+01:00',
      tickets: 2,
      totalValue: 12,
      foodIntent: 'planning_to_eat',
      bookingId: 'EVT-456'
    })

    const purchases = purchaseCalls()
    expect(purchases).toHaveLength(1)
    expect(purchases[0]?.[2]).toMatchObject({
      currency: 'GBP',
      value: 12,
      booking_type: 'event',
      content_ids: ['event-1'],
      content_name: 'Quiz Night',
      content_category: 'Quiz',
      content_type: 'event_booking',
      num_items: 2,
      event_date: '2026-05-10T20:00:00+01:00',
      food_intent: 'planning_to_eat'
    })
    expect(purchases[0]?.[3]).toEqual({ eventID: 'EVT-456' })

    expect(conversionCalls()).toHaveLength(1)
    const forwardedPayload = JSON.parse(String(conversionCalls()[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'EVT-456',
      bookingType: 'event',
      eventId: 'event-1',
      eventSlug: 'quiz-night',
      eventName: 'Quiz Night',
      eventCategoryName: 'Quiz',
      eventCategorySlug: 'quiz',
      eventDate: '2026-05-10T20:00:00+01:00',
      tickets: 2,
      value: 12,
      currency: 'GBP',
      foodIntent: 'planning_to_eat'
    })
  })

  it('forwards an unknown table booking value as null rather than as zero', () => {
    // No party size, so there is nothing to estimate from. The server-side forward for
    // this same reference may well know the covers, so the browser must say "unknown"
    // rather than claim the booking was worth nothing.
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-NO-COVERS',
      bookingType: 'table',
      source: 'booking_widget',
      deviceType: 'desktop'
    })

    expect(conversionCalls()).toHaveLength(1)
    const forwardedPayload = JSON.parse(String(conversionCalls()[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-NO-COVERS',
      tickets: null,
      value: null
    })
    // The pixel still needs a number.
    expect(purchaseCalls()[0]?.[2]).toMatchObject({ value: 0 })
  })

  it('reports the estimated covers revenue on the deposit path, not the deposit taken', () => {
    // The PayPal branch passes the deposit as `value`. Sending that to Meta valued the
    // booking at what was paid up front rather than what it is worth, and disagreed
    // with the server-side forward for the same booking reference.
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-DEPOSIT',
      bookingType: 'table',
      partySize: 10,
      bookingDate: '2026-05-23',
      bookingTime: '19:30',
      source: 'booking_widget',
      deviceType: 'desktop',
      value: 100
    })

    const forwardedPayload = JSON.parse(String(conversionCalls()[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-DEPOSIT',
      tickets: 10,
      value: 250,
      eventDate: '2026-05-23'
    })
    expect(purchaseCalls()[0]?.[2]).toMatchObject({ value: 250, num_items: 10 })
  })

  it('does not fire a client Purchase for error states or without marketing consent, but still forwards server-side', () => {
    trackTableBookingFunnel({
      step: 'error',
      bookingReference: 'ERR-1',
      source: 'booking_widget',
      deviceType: 'mobile'
    })
    expect(purchaseCalls()).toHaveLength(0)

    mockedCanUseCookieCategory.mockReturnValue(false)
    trackMetaBookingPurchase({
      eventId: 'BK-789',
      value: 20,
      bookingType: 'table',
      bookingSource: 'booking_widget'
    })
    expect(purchaseCalls()).toHaveLength(0)
    expect(conversionCalls()).toHaveLength(1)
    const forwardedPayload = JSON.parse(String(conversionCalls()[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-789',
      metaConsentGranted: false,
      fbp: null,
      fbc: null,
      clientUserAgent: null
    })
  })
})
