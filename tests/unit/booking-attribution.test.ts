import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
  getBookingAttributionPayload,
  getMarketingConsentSignalPayload,
} from '@/lib/booking-attribution'
import { setConsentStatus } from '@/lib/cookies'

describe('booking attribution persistence', () => {
  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    document.cookie = '_fbp=; path=/; max-age=0'
    document.cookie = '_fbc=; path=/; max-age=0'
  })

  afterEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    document.cookie = '_fbp=; path=/; max-age=0'
    document.cookie = '_fbc=; path=/; max-age=0'
  })

  it('captures only allowed paid-click params and drops customer-like query data', () => {
    window.history.pushState(
      {},
      '',
      '/events/music-bingo?utm_source=facebook&utm_medium=paid_social&utm_campaign=music-bingo&utm_content=ad-1&fbclid=fb-123&gclid=g-123&short_code=ma83ed9d&email=jane@example.com&phone=07700900000',
    )

    const payload = captureBookingAttributionFromLocation(new Date('2026-05-10T10:00:00.000Z'))

    expect(payload).toMatchObject({
      source_url: 'http://localhost/events/music-bingo?utm_source=facebook&utm_medium=paid_social&utm_campaign=music-bingo&utm_content=ad-1&fbclid=fb-123&gclid=g-123&short_code=ma83ed9d',
      landing_path: '/events/music-bingo',
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'music-bingo',
      utm_content: 'ad-1',
      fbclid: 'fb-123',
      gclid: 'g-123',
      short_code: 'ma83ed9d',
      attribution_captured_at: '2026-05-10T10:00:00.000Z',
      attribution_updated_at: '2026-05-10T10:00:00.000Z',
    })
    expect(JSON.stringify(payload)).not.toMatch(/jane@example\.com|07700900000|email|phone/)
    expect(window.localStorage.getItem('anchor-booking-attribution')).toContain('music-bingo')
  })

  it('keeps first landing context while updating latest campaign params', () => {
    window.history.pushState({}, '', '/events/quiz-night?utm_campaign=quiz-night&fbclid=fb-first')
    captureBookingAttributionFromLocation(new Date('2026-05-10T10:00:00.000Z'))

    window.history.pushState({}, '', '/book-table?utm_campaign=sunday-lunch&gclid=g-latest')
    const latestPayload = captureBookingAttributionFromLocation(new Date('2026-05-11T11:00:00.000Z'))

    expect(latestPayload).toMatchObject({
      source_url: 'http://localhost/events/quiz-night?utm_campaign=quiz-night&fbclid=fb-first',
      landing_path: '/events/quiz-night',
      utm_campaign: 'sunday-lunch',
      gclid: 'g-latest',
      attribution_captured_at: '2026-05-10T10:00:00.000Z',
      attribution_updated_at: '2026-05-11T11:00:00.000Z',
    })
  })

  it('returns stored attribution after visitors navigate away from campaign URLs', () => {
    window.history.pushState({}, '', '/events/quiz-night?utm_campaign=quiz-night&short_code=ma-quiz')
    captureBookingAttributionFromLocation(new Date('2026-05-10T10:00:00.000Z'))

    window.history.pushState({}, '', '/book-table')

    expect(getBookingAttributionPayload()).toMatchObject({
      source_url: 'http://localhost/events/quiz-night?utm_campaign=quiz-night&short_code=ma-quiz',
      landing_path: '/events/quiz-night',
      utm_campaign: 'quiz-night',
      short_code: 'ma-quiz',
    })
  })

  it('adds Meta browser IDs only when marketing consent is granted', () => {
    window.history.pushState({}, '', '/events/quiz-night?fbclid=fb-consented')
    document.cookie = '_fbp=fb.1.1710000000.browser-123; path=/'

    expect(getMarketingConsentSignalPayload('fb-consented')).toEqual({
      meta_consent_granted: false,
    })

    setConsentStatus({ marketing: true })

    expect(getMarketingConsentSignalPayload('fb-consented')).toMatchObject({
      meta_consent_granted: true,
      fbp: 'fb.1.1710000000.browser-123',
      fbc: expect.stringContaining('fb-consented'),
    })
  })
})
