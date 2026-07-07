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
      value: 0,
      booking_type: 'sunday_roast',
      booking_source: 'booking_widget'
    })
    expect(purchases[0]?.[3]).toEqual({ eventID: 'BK-123' })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const forwardedPayload = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-123',
      metaEventId: 'BK-123',
      bookingType: 'table',
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

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const forwardedPayload = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0]?.[1]?.body))
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
    expect(global.fetch).toHaveBeenCalledTimes(1)
    const forwardedPayload = JSON.parse(String((global.fetch as jest.Mock).mock.calls[0]?.[1]?.body))
    expect(forwardedPayload).toMatchObject({
      bookingId: 'BK-789',
      metaConsentGranted: false,
      fbp: null,
      fbc: null,
      clientUserAgent: null
    })
  })
})
