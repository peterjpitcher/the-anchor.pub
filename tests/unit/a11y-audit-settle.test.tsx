import { act, render, waitFor } from '@testing-library/react'
import CookieBanner from '@/components/CookieBanner'
import { GoogleReviews } from '@/components/reviews/GoogleReviews'
import { approvedReviews } from '@/lib/google/review-utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const audit = require('../../scripts/audit-a11y.js')

/**
 * The accessibility audit must not look at a page before the page has finished
 * loading its own content.
 *
 * `scripts/audit-a11y.js` used to run axe the moment a page hydrated. A client
 * component that fetches after mount is hydrated and still empty, so whether
 * axe saw its content came down to whether the reply beat it. On 5 October 2026
 * a run against the live site passed /heathrow-parking while six buttons in the
 * reviews carousel were failing WCAG 2.2 AA target-size. Against localhost,
 * where the same reply takes 20ms, the same audit caught all six every time.
 *
 * The audit needs a real browser and CI does not have one, so the measuring is
 * done by hand against a production build. What CI can hold on to is the rule
 * that decides a page is ready. These specs play a page's network and DOM to
 * that rule on a clock, with a stand-in for the browser, and check when it lets
 * axe in. The last two render the real components, so the content the audit
 * waits for by name cannot be renamed out from under it.
 */

const {
  COOKIE_BANNER,
  REVIEWS_CAROUSEL,
  PAGES,
  SETTLE_QUIET_MS,
  SETTLE_TIMEOUT_MS,
  isContentRequest,
  trackContentRequests,
  settle,
} = audit as {
  COOKIE_BANNER: string
  REVIEWS_CAROUSEL: string
  PAGES: Array<[string, string, string?]>
  SETTLE_QUIET_MS: number
  SETTLE_TIMEOUT_MS: number
  isContentRequest: (request: RequestFacts, pageOrigin: string) => boolean
  trackContentRequests: (page: FakePage) => Tracker
  settle: (page: FakePage, requests: Tracker, ready?: string[]) => Promise<string | null>
}

type RequestFacts = { url: string; method: string; resourceType: string; headers: Record<string, string> }
type FakeRequest = {
  url: () => string
  method: () => string
  resourceType: () => string
  headers: () => Record<string, string>
  failure: () => { errorText: string } | null
}
type FakeResponse = { request: () => FakeRequest; status: () => number }
type Tracker = { waitingOn: () => string[]; quietFor: () => number; failed: () => string[]; startOver: () => void }
type FakePage = ReturnType<typeof fakePage>

const ORIGIN = 'http://localhost:3100'

// Requests as the audit saw them on /heathrow-parking on 5 October 2026.
const facts = (over: Partial<RequestFacts>): RequestFacts => ({
  url: `${ORIGIN}/api/reviews?minRating=4&limit=6&sortBy=newest`,
  method: 'GET',
  resourceType: 'fetch',
  headers: {},
  ...over,
})
const REVIEWS = facts({})
const HOURS = facts({ url: `${ORIGIN}/api/business/hours?_=1791209318955` })
const EVENTS = facts({ url: `${ORIGIN}/api/events?limit=5` })
const LAZY_CHUNK = facts({ url: `${ORIGIN}/_next/static/chunks/1535.2dfc19c3ded4993e.js`, resourceType: 'script' })
const WEB_VITALS = facts({ url: `${ORIGIN}/api/web-vitals`, method: 'POST' })
const PREFETCH = facts({ url: `${ORIGIN}/privacy-policy?_rsc=1ld0r`, headers: { rsc: '1', 'next-router-prefetch': '1' } })
const TAG_MANAGER = facts({ url: 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXX', resourceType: 'script' })
const TURNSTILE = facts({ url: 'blob:https://challenges.cloudflare.com/c5c20433-ed59-458c-b1d2-693ae4b5a4bd', resourceType: 'script' })

/** `failure` is what the browser will say went wrong, if the spec has the request fail. */
const asRequest = (request: RequestFacts, failure?: string): FakeRequest => ({
  url: () => request.url,
  method: () => request.method,
  resourceType: () => request.resourceType,
  headers: () => request.headers,
  failure: () => (failure ? { errorText: failure } : null),
})
const asResponse = (request: FakeRequest, status: number): FakeResponse => ({ request: () => request, status: () => status })

/**
 * A stand-in for the browser page. The spec says what the network and the DOM
 * do and when; `waitForTimeout` moves the clock, so events fire in order.
 */
function fakePage() {
  const handlers: Record<string, Array<(subject: FakeRequest | FakeResponse) => void>> = {}
  const present = new Set<string>()
  let lastChange = Date.now()
  return {
    url: () => `${ORIGIN}/heathrow-parking`,
    on: (event: string, handler: (subject: FakeRequest | FakeResponse) => void) => {
      handlers[event] = [...(handlers[event] || []), handler]
    },
    evaluate: async (_inPage: unknown, selectors: string[]) => ({
      missing: selectors.filter((selector) => !present.has(selector)),
      quietFor: Date.now() - lastChange,
    }),
    waitForTimeout: async (ms: number) => {
      jest.advanceTimersByTime(ms)
    },
    emit: (event: string, subject: FakeRequest | FakeResponse) =>
      (handlers[event] || []).forEach((handler) => handler(subject)),
    /** Something was added to the page; optionally, content the audit waits for by name. */
    render: (selector?: string) => {
      if (selector) present.add(selector)
      lastChange = Date.now()
    },
    shows: (selector: string) => present.has(selector),
  }
}

const at = (ms: number, happens: () => void) => setTimeout(happens, ms)

async function runSettle(page: FakePage, requests: Tracker, ready?: string[]) {
  const started = Date.now()
  const problem = await settle(page, requests, ready)
  return { problem, took: Date.now() - started }
}

describe('which requests a page is waiting on for its content', () => {
  it.each([
    ['data a client component fetches after mount', REVIEWS],
    ['the opening hours', HOURS],
    ['the code for a lazily loaded component', LAZY_CHUNK],
  ])('counts %s', (_what, request) => {
    expect(isContentRequest(request, ORIGIN)).toBe(true)
  })

  it.each([
    ['the web-vitals beacon, which the browser never reports as finished', WEB_VITALS],
    ["the router's link prefetches", PREFETCH],
    ['Tag Manager', TAG_MANAGER],
    ['Turnstile', TURNSTILE],
    ['an image', facts({ url: `${ORIGIN}/images/hero.webp`, resourceType: 'image' })],
    ['the page itself', facts({ url: `${ORIGIN}/heathrow-parking`, resourceType: 'document' })],
  ])('leaves out %s', (_what, request) => {
    expect(isContentRequest(request, ORIGIN)).toBe(false)
  })

  it('goes by the origin the page ended up on, not the one it was asked for', () => {
    // --base https://the-anchor.pub redirects to www before anything loads.
    const onWww = facts({ url: 'https://www.the-anchor.pub/api/reviews?sortBy=newest' })
    expect(isContentRequest(onWww, 'https://www.the-anchor.pub')).toBe(true)
    expect(isContentRequest(onWww, 'https://the-anchor.pub')).toBe(false)
  })
})

describe('when the audit lets axe look at a page', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('waits for a slow reply and for what it renders: the 5 October miss', async () => {
    const page = fakePage()
    const requests = trackContentRequests(page)
    const reviews = asRequest(REVIEWS)
    page.emit('request', reviews)
    at(2000, () => page.emit('requestfinished', reviews))
    at(2010, () => page.render(REVIEWS_CAROUSEL))

    // No content is named here: the network alone has to hold axe back.
    const { problem, took } = await runSettle(page, requests)

    expect(problem).toBeNull()
    expect(page.shows(REVIEWS_CAROUSEL)).toBe(true)
    expect(took).toBeGreaterThanOrEqual(2010 + SETTLE_QUIET_MS)
    // And no longer than it has to: the audit runs this on every page.
    expect(took).toBeLessThan(2010 + SETTLE_QUIET_MS + 100)
  })

  it('waits for the render when it lags well behind the reply', async () => {
    const page = fakePage()
    const requests = trackContentRequests(page)
    const reviews = asRequest(REVIEWS)
    page.emit('request', reviews)
    at(1000, () => page.emit('requestfinished', reviews))
    at(1400, () => page.render(REVIEWS_CAROUSEL))

    const { problem, took } = await runSettle(page, requests)

    expect(problem).toBeNull()
    expect(took).toBeGreaterThanOrEqual(1400 + SETTLE_QUIET_MS)
  })

  it('waits for a second request the first reply sets off', async () => {
    const page = fakePage()
    const requests = trackContentRequests(page)
    const chunk = asRequest(LAZY_CHUNK)
    const reviews = asRequest(REVIEWS)
    page.emit('request', chunk)
    at(1000, () => page.emit('requestfinished', chunk))
    at(1300, () => page.emit('request', reviews))
    at(2500, () => page.emit('requestfinished', reviews))
    at(2510, () => page.render())

    const { problem, took } = await runSettle(page, requests)

    expect(problem).toBeNull()
    expect(took).toBeGreaterThanOrEqual(2510 + SETTLE_QUIET_MS)
  })

  it('waits for content held back on a timer, when nothing is in flight to give it away', async () => {
    // The cookie banner: components/CookieBanner.tsx shows it after a second.
    const page = fakePage()
    const requests = trackContentRequests(page)
    at(1000, () => page.render(COOKIE_BANNER))

    const { problem, took } = await runSettle(page, requests, [COOKIE_BANNER])

    expect(problem).toBeNull()
    expect(took).toBeGreaterThanOrEqual(1000 + SETTLE_QUIET_MS)
  })

  it('is not held up by requests that never finish and put nothing on the page', async () => {
    // These are why `networkidle` never arrives on any page of this site.
    const page = fakePage()
    const requests = trackContentRequests(page)
    for (const request of [WEB_VITALS, PREFETCH, TAG_MANAGER, TURNSTILE]) page.emit('request', asRequest(request))

    const { problem, took } = await runSettle(page, requests)

    expect(problem).toBeNull()
    expect(took).toBeLessThan(SETTLE_QUIET_MS + 100)
  })

  describe('fails closed', () => {
    it('reports named content that never appears, rather than checking the page without it', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      page.render(COOKIE_BANNER)

      const { problem, took } = await runSettle(page, requests, [COOKIE_BANNER, REVIEWS_CAROUSEL])

      expect(problem).toContain('never appeared')
      expect(problem).toContain(REVIEWS_CAROUSEL)
      expect(problem).not.toContain(COOKIE_BANNER)
      expect(took).toBeGreaterThanOrEqual(SETTLE_TIMEOUT_MS)
    })

    it('reports a request that never comes back, and names it', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      page.emit('request', asRequest(REVIEWS))

      const { problem } = await runSettle(page, requests)

      expect(problem).toContain('still loading')
      expect(problem).toContain('/api/reviews?minRating=4&limit=6&sortBy=newest')
    })

    it('reports a page that never stops changing', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      setInterval(() => page.render(), 100)

      const { problem } = await runSettle(page, requests)

      expect(problem).toContain('still changing')
    })

    /**
     * A reply is not the same as content. The event banner renders nothing when
     * /api/events is not OK, and the carousel nothing when /api/reviews is not,
     * so a page whose content request failed is a page with content missing.
     * Raised in review of PR #191: the first version of the settle step treated
     * any reply, and any failure, as the request being done.
     */
    it.each([404, 500, 503])('reports a content request answered with a %i, with its path and status', async (status) => {
      // The reply arrives, so the browser calls the request finished, not failed.
      const page = fakePage()
      const requests = trackContentRequests(page)
      const events = asRequest(EVENTS)
      page.emit('request', events)
      at(100, () => page.emit('response', asResponse(events, status)))
      at(110, () => page.emit('requestfinished', events))

      const { problem, took } = await runSettle(page, requests)

      expect(problem).toContain('/api/events?limit=5')
      expect(problem).toContain(`status ${status}`)
      // The page is still left to settle, so the other checks see all there is to see.
      expect(took).toBeGreaterThanOrEqual(110 + SETTLE_QUIET_MS)
      expect(took).toBeLessThan(SETTLE_TIMEOUT_MS)
    })

    it.each([200, 204, 304])('does not report a reply of %i', async (status) => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      const events = asRequest(EVENTS)
      page.emit('request', events)
      at(100, () => page.emit('response', asResponse(events, status)))
      at(110, () => page.emit('requestfinished', events))

      const { problem } = await runSettle(page, requests)

      expect(problem).toBeNull()
    })

    it('reports a content request the network dropped, with its path and the reason', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      const events = asRequest(EVENTS, 'net::ERR_EMPTY_RESPONSE')
      page.emit('request', events)
      at(100, () => page.emit('requestfailed', events))

      const { problem, took } = await runSettle(page, requests)

      expect(problem).toContain('/api/events?limit=5')
      expect(problem).toContain('net::ERR_EMPTY_RESPONSE')
      expect(took).toBeLessThan(SETTLE_TIMEOUT_MS)
    })

    it('does not report a request the page cancelled itself, and stops waiting on it', async () => {
      // A fetch the page aborts, or one cut short when the audit reloads a page.
      const page = fakePage()
      const requests = trackContentRequests(page)
      const events = asRequest(EVENTS, 'net::ERR_ABORTED')
      page.emit('request', events)
      at(100, () => page.emit('requestfailed', events))

      const { problem, took } = await runSettle(page, requests)

      expect(problem).toBeNull()
      expect(took).toBeLessThan(100 + SETTLE_QUIET_MS + 100)
    })

    it('does not report an error on a request it is not waiting on', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      const beacon = asRequest(WEB_VITALS)
      const tagManager = asRequest(TAG_MANAGER, 'net::ERR_BLOCKED_BY_CLIENT')
      page.emit('request', beacon)
      page.emit('request', tagManager)
      at(100, () => page.emit('response', asResponse(beacon, 400)))
      at(100, () => page.emit('requestfailed', tagManager))

      const { problem } = await runSettle(page, requests)

      expect(problem).toBeNull()
    })

    it('says both things when named content is missing and its request failed', async () => {
      const page = fakePage()
      const requests = trackContentRequests(page)
      const reviews = asRequest(REVIEWS)
      page.emit('request', reviews)
      at(100, () => page.emit('response', asResponse(reviews, 500)))
      at(110, () => page.emit('requestfinished', reviews))

      const { problem } = await runSettle(page, requests, [REVIEWS_CAROUSEL])

      expect(problem).toContain('never appeared')
      expect(problem).toContain(REVIEWS_CAROUSEL)
      expect(problem).toContain('/api/reviews?minRating=4&limit=6&sortBy=newest (status 500)')
    })

    it('forgets a first attempt when the audit loads the page again', async () => {
      // A dev server answers 500 while it compiles a route; the audit retries once.
      const page = fakePage()
      const requests = trackContentRequests(page)
      const first = asRequest(EVENTS)
      const stuck = asRequest(HOURS)
      page.emit('request', first)
      page.emit('response', asResponse(first, 500))
      page.emit('requestfinished', first)
      page.emit('request', stuck)

      requests.startOver()
      const { problem, took } = await runSettle(page, requests)

      expect(problem).toBeNull()
      expect(took).toBeLessThan(SETTLE_QUIET_MS + 100)
    })
  })
})

describe('the content the audit waits for by name', () => {
  beforeAll(() => {
    // The banner measures its own height for the sticky booking bar. jsdom has no layout
    // and no ResizeObserver, and the measurement is not what is being checked here.
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('names the carousel on both pages that show it', () => {
    const named = Object.fromEntries(PAGES.map(([pathname, , ready]) => [pathname, ready]))
    expect(named['/heathrow-parking']).toBe(REVIEWS_CAROUSEL)
    expect(named['/beer-garden']).toBe(REVIEWS_CAROUSEL)
  })

  it('finds the real cookie banner, and only once its one-second delay is up', () => {
    jest.useFakeTimers()
    try {
      render(<CookieBanner />)
      expect(document.querySelector(COOKIE_BANNER)).toBeNull()
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(document.querySelector(COOKIE_BANNER)).not.toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })

  it('finds the real reviews carousel, and only once its reviews have arrived', async () => {
    const realFetch = global.fetch
    let reply: (response: unknown) => void = () => undefined
    global.fetch = jest.fn(() => new Promise((resolve) => { reply = resolve })) as unknown as typeof fetch
    try {
      render(<GoogleReviews layout="carousel" filter={{ minRating: 4, limit: 6 }} />)
      expect(document.querySelector(REVIEWS_CAROUSEL)).toBeNull()

      // The reviews the real /api/reviews route serves.
      const reviews = approvedReviews.slice(0, 6)
      expect(reviews.length).toBeGreaterThan(1)
      await act(async () => {
        reply({ ok: true, json: async () => ({ reviews, rating: null, totalReviews: null }) })
      })

      await waitFor(() => expect(document.querySelector(REVIEWS_CAROUSEL)).not.toBeNull())
    } finally {
      global.fetch = realFetch
    }
  })
})
