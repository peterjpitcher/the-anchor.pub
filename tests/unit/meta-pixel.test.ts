import { canUseCookieCategory } from '@/lib/cookies'
import { ensureMetaPixel, trackMetaBookingPurchase } from '@/lib/meta-pixel'
import { trackEventBookingComplete, trackTableBookingFunnel } from '@/lib/gtm-events'

jest.mock('@/lib/cookies', () => ({
  canUseCookieCategory: jest.fn()
}))

const mockedCanUseCookieCategory = canUseCookieCategory as jest.MockedFunction<typeof canUseCookieCategory>

function fbqQueue() {
  return (window.fbq?.queue ?? []) as unknown[][]
}

describe('Meta Pixel booking tracking', () => {
  beforeEach(() => {
    mockedCanUseCookieCategory.mockImplementation((category) => category === 'marketing' || category === 'analytics')
    delete window.fbq
    delete window._fbq
    delete window.__anchorMetaPixelInitialized
    delete window.__anchorMetaPixelPurchaseEvents
    document.head.innerHTML = '<script id="first-script"></script>'
    window.dataLayer = []
  })

  it('initialises the configured Pixel only when marketing consent is granted', () => {
    mockedCanUseCookieCategory.mockReturnValue(false)

    expect(ensureMetaPixel()).toBe(false)
    expect(window.fbq).toBeUndefined()

    mockedCanUseCookieCategory.mockImplementation((category) => category === 'marketing')

    expect(ensureMetaPixel()).toBe(true)
    expect(fbqQueue()[0]).toEqual(['init', '757659911002159'])
    expect(fbqQueue()[1]).toEqual(['track', 'PageView'])
  })

  it('fires one Purchase for a confirmed table booking and deduplicates by booking reference', () => {
    trackTableBookingFunnel({
      step: 'success',
      bookingReference: 'BK-123',
      bookingType: 'table',
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

    const purchases = fbqQueue().filter((entry) => entry[0] === 'track' && entry[1] === 'Purchase')
    expect(purchases).toHaveLength(1)
    expect(purchases[0]?.[2]).toMatchObject({
      currency: 'GBP',
      value: 0,
      booking_type: 'table',
      booking_source: 'booking_widget'
    })
    expect(purchases[0]?.[3]).toEqual({ eventID: 'BK-123' })
  })

  it('fires one Purchase for a confirmed event booking', () => {
    trackEventBookingComplete({
      eventId: 'event-1',
      eventName: 'Quiz Night',
      eventDate: '2026-05-10',
      tickets: 2,
      totalValue: 12,
      bookingId: 'EVT-456'
    })

    const purchases = fbqQueue().filter((entry) => entry[0] === 'track' && entry[1] === 'Purchase')
    expect(purchases).toHaveLength(1)
    expect(purchases[0]?.[2]).toMatchObject({
      currency: 'GBP',
      value: 12,
      booking_type: 'event',
      content_name: 'Quiz Night'
    })
    expect(purchases[0]?.[3]).toEqual({ eventID: 'EVT-456' })
  })

  it('does not fire Purchase for pending/error booking states or without marketing consent', () => {
    trackTableBookingFunnel({
      step: 'error',
      bookingReference: 'ERR-1',
      source: 'booking_widget',
      deviceType: 'mobile'
    })
    expect(fbqQueue().filter((entry) => entry[1] === 'Purchase')).toHaveLength(0)

    mockedCanUseCookieCategory.mockReturnValue(false)
    expect(trackMetaBookingPurchase({
      eventId: 'BK-789',
      value: 20,
      bookingType: 'table',
      bookingSource: 'booking_widget'
    })).toBe(false)
    expect(fbqQueue().filter((entry) => entry[1] === 'Purchase')).toHaveLength(0)
  })
})
