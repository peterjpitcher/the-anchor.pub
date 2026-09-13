import {
  captureBookingAttributionFromLocation,
  clearBookingAttributionForTest,
  getBookingAttributionPayload,
  getMarketingConsentSignalPayload,
  resetPendingAttributionForTest,
  syncBookingAttributionWithConsent,
  withCarriedAttributionParams,
} from '@/lib/booking-attribution'
import { setConsentStatus } from '@/lib/cookies'

/**
 * Capture times held relative to whenever the suite runs.
 *
 * These were the literals '2026-05-10T10:00:00.000Z' and
 * '2026-05-11T11:00:00.000Z'. Attribution has a 90 day TTL
 * (ATTRIBUTION_TTL_DAYS in lib/booking-attribution.ts), so those fixtures were
 * two days from ageing out, at which point getBookingAttributionPayload would
 * start returning nothing and these tests would fail for a reason that has
 * nothing to do with the behaviour under test.
 *
 * FIRST_SEEN stays older than LATER_SEEN so the "keeps first landing context
 * while updating latest campaign params" case still exercises real ordering.
 */
const DAY_MS = 24 * 60 * 60 * 1000
const FIRST_SEEN = new Date(Date.now() - 5 * DAY_MS)
const LATER_SEEN = new Date(Date.now() - 4 * DAY_MS)

describe('booking attribution persistence', () => {
  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    document.cookie = '_fbp=; path=/; max-age=0'
    document.cookie = '_fbc=; path=/; max-age=0'
    // Storing the ad click is advertising measurement, so these cases run with
    // marketing consent granted. The no-consent behaviour has its own block below.
    setConsentStatus({ marketing: true })
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

    const payload = captureBookingAttributionFromLocation(FIRST_SEEN)

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
      attribution_captured_at: FIRST_SEEN.toISOString(),
      attribution_updated_at: FIRST_SEEN.toISOString(),
    })
    expect(JSON.stringify(payload)).not.toMatch(/jane@example\.com|07700900000|email|phone/)
    expect(window.localStorage.getItem('anchor-booking-attribution')).toContain('music-bingo')
  })

  it('keeps first landing context while updating latest campaign params', () => {
    window.history.pushState({}, '', '/events/quiz-night?utm_campaign=quiz-night&fbclid=fb-first')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    window.history.pushState({}, '', '/book-table?utm_campaign=sunday-lunch&gclid=g-latest')
    const latestPayload = captureBookingAttributionFromLocation(LATER_SEEN)

    expect(latestPayload).toMatchObject({
      source_url: 'http://localhost/events/quiz-night?utm_campaign=quiz-night&fbclid=fb-first',
      landing_path: '/events/quiz-night',
      utm_campaign: 'sunday-lunch',
      gclid: 'g-latest',
      attribution_captured_at: FIRST_SEEN.toISOString(),
      attribution_updated_at: LATER_SEEN.toISOString(),
    })
  })

  it('carries the Meta click ID forward when a later campaign URL has none', () => {
    window.history.pushState({}, '', '/events/quiz-night?utm_source=facebook&fbclid=fb-from-ad')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    // A second short link (SMS, organic post) with UTMs but no fbclid used to wipe
    // the click ID the ad brought in, leaving the booking unattributable.
    window.history.pushState({}, '', '/book-table?utm_source=sms&utm_campaign=sunday-lunch')
    const latestPayload = captureBookingAttributionFromLocation(LATER_SEEN)

    expect(latestPayload).toMatchObject({
      utm_source: 'sms',
      utm_campaign: 'sunday-lunch',
      fbclid: 'fb-from-ad',
    })
  })

  it('returns stored attribution after visitors navigate away from campaign URLs', () => {
    window.history.pushState({}, '', '/events/quiz-night?utm_campaign=quiz-night&short_code=ma-quiz')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    window.history.pushState({}, '', '/book-table')

    expect(getBookingAttributionPayload()).toMatchObject({
      source_url: 'http://localhost/events/quiz-night?utm_campaign=quiz-night&short_code=ma-quiz',
      landing_path: '/events/quiz-night',
      utm_campaign: 'quiz-night',
      short_code: 'ma-quiz',
    })
  })

  it('keeps the stored record for a returning visitor who consented', () => {
    window.history.pushState({}, '', '/lunch-and-dinner?utm_campaign=weekday_lunch_a&short_code=jbozdk')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    // A new page load: the in-memory record is gone, the consented device record is not.
    resetPendingAttributionForTest()
    window.history.pushState({}, '', '/book-table')

    expect(getBookingAttributionPayload()).toMatchObject({
      landing_path: '/lunch-and-dinner',
      utm_campaign: 'weekday_lunch_a',
      short_code: 'jbozdk',
    })
  })

  it('adds Meta browser IDs only when marketing consent is granted', () => {
    setConsentStatus({ marketing: false })
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

/**
 * Independent review F01 (10 September 2026): the site stored the ad click for
 * 90 days before anyone accepted marketing cookies. Linking a booking to an ad
 * click needs consent, so without it nothing may reach the device or the booking.
 */
describe('booking attribution without marketing consent', () => {
  const LANDING = '/lunch-and-dinner?utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_lunch_a&utm_content=ad__var_1&fbclid=fb-ad-click&short_code=jbozdk'

  const storedOnDevice = () => ({
    localStorage: window.localStorage.getItem('anchor-booking-attribution'),
    cookie: document.cookie.includes('anchor-booking-attribution='),
  })

  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
  })

  afterEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
  })

  it('stores nothing on the device and sends nothing with a booking before any choice', () => {
    window.history.pushState({}, '', LANDING)

    expect(captureBookingAttributionFromLocation(FIRST_SEEN)).toEqual({})
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })

    window.history.pushState({}, '', '/book-table')
    expect(getBookingAttributionPayload()).toEqual({})
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })
  })

  it('stores nothing and sends nothing after the visitor rejects marketing cookies', () => {
    setConsentStatus({ marketing: false })
    syncBookingAttributionWithConsent()
    window.history.pushState({}, '', LANDING)

    expect(captureBookingAttributionFromLocation(FIRST_SEEN)).toEqual({})
    expect(getBookingAttributionPayload()).toEqual({})
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })
  })

  it('saves the landing page tags when the visitor accepts later in the same visit', () => {
    window.history.pushState({}, '', LANDING)
    captureBookingAttributionFromLocation(FIRST_SEEN)
    window.history.pushState({}, '', '/book-table')
    captureBookingAttributionFromLocation(LATER_SEEN)

    setConsentStatus({ marketing: true })
    syncBookingAttributionWithConsent()

    expect(storedOnDevice().localStorage).not.toBeNull()
    expect(getBookingAttributionPayload()).toMatchObject({
      landing_path: '/lunch-and-dinner',
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'weekday_lunch_a',
      utm_content: 'ad__var_1',
      fbclid: 'fb-ad-click',
      short_code: 'jbozdk',
    })
  })

  it('deletes the stored record when the visitor withdraws consent', () => {
    setConsentStatus({ marketing: true })
    window.history.pushState({}, '', LANDING)
    captureBookingAttributionFromLocation(FIRST_SEEN)
    expect(storedOnDevice().localStorage).not.toBeNull()

    setConsentStatus({ marketing: false })
    syncBookingAttributionWithConsent()

    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })
    expect(getBookingAttributionPayload()).toEqual({})
  })

  it('does not bring back tags the visitor refused if they accept later', () => {
    window.history.pushState({}, '', LANDING)
    captureBookingAttributionFromLocation(FIRST_SEEN)

    setConsentStatus({ marketing: false })
    syncBookingAttributionWithConsent()
    window.history.pushState({}, '', '/book-table')
    setConsentStatus({ marketing: true })
    syncBookingAttributionWithConsent()

    const payload = getBookingAttributionPayload()
    expect(payload.utm_campaign).toBeUndefined()
    expect(payload.fbclid).toBeUndefined()
    expect(payload.short_code).toBeUndefined()
    expect(payload.landing_path).toBe('/book-table')
  })

  it('keeps an earlier consented landing as first touch when a new visit accepts', () => {
    setConsentStatus({ marketing: true })
    window.history.pushState({}, '', '/events/quiz-night?utm_campaign=quiz-night')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    // A later visit that only accepts again on the booking page.
    resetPendingAttributionForTest()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    window.history.pushState({}, '', LANDING)
    captureBookingAttributionFromLocation(LATER_SEEN)
    setConsentStatus({ marketing: true })
    syncBookingAttributionWithConsent()

    expect(getBookingAttributionPayload()).toMatchObject({
      landing_path: '/events/quiz-night',
      utm_campaign: 'weekday_lunch_a',
      short_code: 'jbozdk',
    })
  })
})

/**
 * BookTableButton loads the booking page with `window.location.href`, which wipes
 * the in-memory record a visitor without consent is holding. The tags travel in the
 * booking URL instead, so accepting on the booking page still attributes the booking.
 */
describe('carrying ad tags onto internal booking links', () => {
  const LANDING_HREF = 'https://www.the-anchor.pub/lunch-and-dinner?utm_source=facebook&utm_medium=paid_social&utm_campaign=weekday_lunch_a&utm_content=ad__var_1&utm_term=lunch&fbclid=fb-ad-click&gclid=g-ad-click&short_code=jbozdk&email=jane@example.com&phone=07700900000&name=Jane'

  const storedOnDevice = () => ({
    localStorage: window.localStorage.getItem('anchor-booking-attribution'),
    cookie: document.cookie.includes('anchor-booking-attribution='),
  })

  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
  })

  afterEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    window.history.pushState({}, '', '/')
  })

  it('copies only the allowed ad tags and drops customer-like query data', () => {
    const carried = withCarriedAttributionParams('/book-table?source=lunch_dinner_lp', LANDING_HREF)
    const url = new URL(carried, 'https://www.the-anchor.pub')

    expect(carried.startsWith('/book-table?')).toBe(true)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      source: 'lunch_dinner_lp',
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'weekday_lunch_a',
      utm_content: 'ad__var_1',
      utm_term: 'lunch',
      fbclid: 'fb-ad-click',
      gclid: 'g-ad-click',
      short_code: 'jbozdk',
    })
    expect(carried).not.toMatch(/email|phone|name=|jane|07700900000/i)
  })

  it('keeps a param the booking link already has', () => {
    const carried = withCarriedAttributionParams('/book-table?utm_campaign=christmas&short_code=xmas1', LANDING_HREF)
    const params = new URL(carried, 'https://www.the-anchor.pub').searchParams

    expect(params.get('utm_campaign')).toBe('christmas')
    expect(params.get('short_code')).toBe('xmas1')
    expect(params.get('utm_source')).toBe('facebook')
    expect(params.getAll('utm_campaign')).toHaveLength(1)
  })

  it('leaves the link alone when the page has no ad tags', () => {
    expect(withCarriedAttributionParams('/book-table?source=hero', 'https://www.the-anchor.pub/lunch-and-dinner?ref=menu')).toBe('/book-table?source=hero')
    expect(withCarriedAttributionParams('/book-table', 'https://www.the-anchor.pub/')).toBe('/book-table')
  })

  it('never decorates an external link', () => {
    expect(withCarriedAttributionParams('https://example.com/book', LANDING_HREF)).toBe('https://example.com/book')
  })

  it('keeps an absolute internal link absolute and caps over-long values', () => {
    const long = 'x'.repeat(400)
    const carried = withCarriedAttributionParams(
      'https://www.the-anchor.pub/book-table#times',
      `https://www.the-anchor.pub/lunch-and-dinner?utm_campaign=${long}&utm_source=%20facebook%20`,
    )
    const url = new URL(carried)

    expect(url.origin).toBe('https://www.the-anchor.pub')
    expect(url.hash).toBe('#times')
    expect(url.searchParams.get('utm_campaign')).toHaveLength(240)
    expect(url.searchParams.get('utm_source')).toBe('facebook')
  })

  it('reads the current page when no URL is passed and writes nothing to the device', () => {
    window.history.pushState({}, '', '/lunch-and-dinner?utm_campaign=weekday_dinner_a&short_code=jse8x1&email=jane@example.com')

    expect(withCarriedAttributionParams('/book-table')).toBe('/book-table?utm_campaign=weekday_dinner_a&short_code=jse8x1')
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })

    setConsentStatus({ marketing: true })
    expect(withCarriedAttributionParams('/book-table')).toBe('/book-table?utm_campaign=weekday_dinner_a&short_code=jse8x1')
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })
  })

  it('saves the landing tags when the visitor accepts on the booking page after a full page load', () => {
    // Landing page, no cookie choice yet: the tags wait in memory only.
    window.history.pushState({}, '', LANDING_HREF.replace('https://www.the-anchor.pub', ''))
    captureBookingAttributionFromLocation(FIRST_SEEN)
    const bookingHref = withCarriedAttributionParams('/book-table?source=lunch_dinner_lp')

    // "Book a table" loads a new page: memory is gone, the tags are in the URL.
    resetPendingAttributionForTest()
    window.history.pushState({}, '', bookingHref)
    expect(captureBookingAttributionFromLocation(LATER_SEEN)).toEqual({})
    expect(storedOnDevice()).toEqual({ localStorage: null, cookie: false })

    // The visitor accepts on the booking page.
    setConsentStatus({ marketing: true })
    syncBookingAttributionWithConsent()

    expect(storedOnDevice().localStorage).not.toBeNull()
    expect(getBookingAttributionPayload()).toMatchObject({
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'weekday_lunch_a',
      utm_content: 'ad__var_1',
      fbclid: 'fb-ad-click',
      short_code: 'jbozdk',
      // The landing path is the booking page's: only the tags travel, not the path.
      landing_path: '/book-table',
    })
  })

  it('loses the tags on a plain full page load, which is why the link carries them', () => {
    window.history.pushState({}, '', LANDING_HREF.replace('https://www.the-anchor.pub', ''))
    captureBookingAttributionFromLocation(FIRST_SEEN)

    resetPendingAttributionForTest()
    window.history.pushState({}, '', '/book-table?source=lunch_dinner_lp')
    captureBookingAttributionFromLocation(LATER_SEEN)
    setConsentStatus({ marketing: true })
    syncBookingAttributionWithConsent()

    const payload = getBookingAttributionPayload()
    expect(payload.utm_campaign).toBeUndefined()
    expect(payload.short_code).toBeUndefined()
  })
})

describe('Meta fbc resolution', () => {
  beforeEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    document.cookie = '_fbc=; path=/; max-age=0'
    setConsentStatus({ marketing: true })
  })

  afterEach(() => {
    clearBookingAttributionForTest()
    window.localStorage.clear()
    document.cookie = 'anchor-cookie-consent=; path=/; max-age=0'
    document.cookie = '_fbc=; path=/; max-age=0'
  })

  it('stamps fbc with the click time, not the booking time', () => {
    window.history.pushState({}, '', '/events/quiz-night?fbclid=fb-clicked-earlier')
    captureBookingAttributionFromLocation(FIRST_SEEN)

    window.history.pushState({}, '', '/book-table')

    expect(getMarketingConsentSignalPayload().fbc).toBe(`fb.1.${FIRST_SEEN.getTime()}.fb-clicked-earlier`)
  })

  it('prefers a freshly captured click over a stale _fbc cookie holding a different one', () => {
    const staleClickMs = Date.now() - 180 * DAY_MS
    document.cookie = `_fbc=fb.1.${staleClickMs}.fb-january-click; path=/`
    window.history.pushState({}, '', '/events/quiz-night?fbclid=fb-todays-click')

    const fbc = getMarketingConsentSignalPayload().fbc

    expect(fbc).toContain('fb-todays-click')
    expect(fbc).not.toContain('fb-january-click')
  })

  it('keeps the pixel-written cookie when it holds the same click, so the real click time survives', () => {
    const clickMs = Date.now() - 2 * DAY_MS
    document.cookie = `_fbc=fb.1.${clickMs}.fb-same-click; path=/`
    window.history.pushState({}, '', '/events/quiz-night?fbclid=fb-same-click')

    expect(getMarketingConsentSignalPayload().fbc).toBe(`fb.1.${clickMs}.fb-same-click`)
  })

  it('uses an in-window _fbc cookie when this visit captured no click ID', () => {
    const clickMs = Date.now() - 10 * DAY_MS
    document.cookie = `_fbc=fb.1.${clickMs}.fb-recent-click; path=/`
    window.history.pushState({}, '', '/book-table')

    expect(getMarketingConsentSignalPayload().fbc).toBe(`fb.1.${clickMs}.fb-recent-click`)
  })

  it('drops an _fbc cookie older than Metas own 90 day cookie lifetime', () => {
    // The pixel refreshes _fbc expiry on every page view, so a returning visitor can
    // carry a click ID for months. Sending it makes an organic booking look like an
    // ad conversion, and it is far outside any Meta attribution window.
    document.cookie = `_fbc=fb.1.${Date.now() - 120 * DAY_MS}.fb-ancient-click; path=/`
    window.history.pushState({}, '', '/book-table')

    const payload = getMarketingConsentSignalPayload()

    expect(payload.meta_consent_granted).toBe(true)
    expect(payload.fbc).toBeUndefined()
  })

  it('ignores a malformed _fbc cookie', () => {
    document.cookie = '_fbc=not-a-valid-fbc-value; path=/'
    window.history.pushState({}, '', '/book-table')

    expect(getMarketingConsentSignalPayload().fbc).toBeUndefined()
  })
})
