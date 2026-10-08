/**
 * What the browser sends to /api/web-vitals, and when it sends nothing.
 *
 * The site's own page speed record sets no cookie and carries nothing about the
 * visitor, so it runs until someone switches analytics off:
 *   - no choice made yet: sent
 *   - analytics accepted: sent
 *   - analytics refused or switched off: not sent at all
 * Only CLS, LCP and INP are sent, with the page path, the size class, the value
 * and rating, and for CLS the element that moved and how far.
 *
 * It used to send all six metrics, for every visitor, with the metric's id.
 *
 * Two sources feed it. LCP and INP come from Next's useReportWebVitals hook.
 * CLS comes from the web-vitals attribution build, because the hook's CLS has
 * no record of what moved; the hook's own CLS reading is not sent, or every
 * page would be counted twice.
 */

import { render } from '@testing-library/react'
import { WebVitals } from '@/app/web-vitals'
import { hasSwitchedAnalyticsOff } from '@/lib/cookies'
import { trackWebVitals } from '@/lib/gtm-events'
import { buildWebVitalReport, recordablePath, sizeClassForWidth } from '@/lib/web-vitals-record'

type Reporter = (metric: Record<string, unknown>) => void

let report: Reporter = () => {
  throw new Error('WebVitals has not registered a reporter')
}

jest.mock('next/web-vitals', () => ({
  useReportWebVitals: (callback: Reporter) => {
    report = callback
  }
}))

let reportShift: Reporter = () => {
  throw new Error('WebVitals has not registered a CLS reporter')
}

jest.mock('next/dist/compiled/web-vitals-attribution', () => ({
  onCLS: (callback: Reporter) => {
    reportShift = callback
  }
}))

jest.mock('@/lib/gtm-events', () => ({
  trackWebVitals: jest.fn()
}))

const CONSENT_COOKIE = 'anchor-cookie-consent'

function storeChoice(choice: { analytics: boolean; marketing?: boolean }): void {
  const value = JSON.stringify({
    necessary: true,
    marketing: false,
    preferences: false,
    timestamp: '2026-10-07T09:00:00.000Z',
    ...choice
  })
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; path=/`
}

function clearChoice(): void {
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0`
}

function setWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width })
}

function metric(name: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name,
    value: name === 'CLS' ? 0.1234 : 2480.4,
    rating: 'needs-improvement',
    delta: 12,
    id: 'v3-1759827600000-4821093755123',
    navigationType: 'navigate',
    ...overrides
  }
}

const CLS_ATTRIBUTION = {
  largestShiftTarget: 'div.event-banner>img',
  largestShiftTime: 812.5,
  largestShiftValue: 0.11,
  largestShiftSource: {
    previousRect: { x: 16, y: 240, width: 343, height: 200 },
    currentRect: { x: 16, y: 324, width: 343, height: 200 }
  }
}

let fetchMock: jest.Mock
const originalFetch = global.fetch

function sentBodies(): Array<Record<string, unknown>> {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string))
}

beforeEach(() => {
  fetchMock = jest.fn(async () => new Response('{"received":true}', { status: 200 }))
  global.fetch = fetchMock as unknown as typeof fetch
  ;(trackWebVitals as jest.Mock).mockClear()
  clearChoice()
  setWidth(390)
  window.history.pushState({}, '', '/whats-on?utm_source=facebook&fbclid=abc123#tonight')
  render(<WebVitals />)
})

afterEach(() => {
  global.fetch = originalFetch
  clearChoice()
  jest.restoreAllMocks()
})

describe('when the page speed record is sent', () => {
  it('is sent when the visitor has made no choice yet', () => {
    expect(hasSwitchedAnalyticsOff()).toBe(false)

    report(metric('LCP'))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/web-vitals')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST')
  })

  it('is sent when analytics is accepted', () => {
    storeChoice({ analytics: true })
    expect(hasSwitchedAnalyticsOff()).toBe(false)

    report(metric('LCP'))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('is not sent when the visitor rejected all cookies', () => {
    storeChoice({ analytics: false })
    expect(hasSwitchedAnalyticsOff()).toBe(true)

    for (const name of ['LCP', 'INP']) report(metric(name))
    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is not sent when analytics is off and marketing is on', () => {
    storeChoice({ analytics: false, marketing: true })

    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is not sent when a choice is stored but cannot be read', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent('{not json')}; path=/`
    expect(hasSwitchedAnalyticsOff()).toBe(true)

    report(metric('LCP'))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stops as soon as analytics is switched off, with no reload needed', () => {
    report(metric('LCP'))
    storeChoice({ analytics: false })
    report(metric('INP'))

    expect(sentBodies().map(body => body.name)).toEqual(['LCP'])
  })

  it('does not throw when the request fails', async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error('offline')
    })

    expect(() => report(metric('LCP'))).not.toThrow()
    await Promise.resolve()
  })
})

describe('what the page speed record holds', () => {
  it('sends only CLS, LCP and INP out of the six metrics the browser reports', () => {
    for (const name of ['TTFB', 'FCP', 'LCP', 'FID', 'INP', 'CLS']) report(metric(name))
    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))

    expect(sentBodies().map(body => body.name)).toEqual(['LCP', 'INP', 'CLS'])
  })

  it('sends CLS once, from the reading that says what moved', () => {
    report(metric('CLS'))
    expect(fetchMock).not.toHaveBeenCalled()

    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))
    expect(sentBodies().map(body => body.moved)).toEqual(['div.event-banner>img'])
  })

  it('still hands all six metrics to Tag Manager, which has its own consent check', () => {
    const names = ['TTFB', 'FCP', 'LCP', 'FID', 'INP', 'CLS']
    for (const name of names) report(metric(name))

    expect((trackWebVitals as jest.Mock).mock.calls.map(([data]) => data.metricName)).toEqual(names)
  })

  it('sends the path with no query string, the size class, the value and the rating', () => {
    report(metric('INP', { value: 187.6, rating: 'good' }))

    expect(sentBodies()).toEqual([
      { name: 'INP', value: 188, rating: 'good', path: '/whats-on', size: 'phone' }
    ])
  })

  it('adds the element that moved and how far across and down, for CLS', () => {
    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))

    expect(sentBodies()).toEqual([
      {
        name: 'CLS',
        value: 0.1234,
        rating: 'needs-improvement',
        path: '/whats-on',
        size: 'phone',
        moved: 'div.event-banner>img',
        dx: 0,
        dy: 84
      }
    ])
  })

  it('sends CLS without an element when nothing moved', () => {
    reportShift(metric('CLS', { value: 0, rating: 'good', attribution: {} }))

    expect(sentBodies()).toEqual([{ name: 'CLS', value: 0, rating: 'good', path: '/whats-on', size: 'phone' }])
  })

  it('never sends an id, the query string, the width in pixels or anything else about the visitor', () => {
    for (const name of ['LCP', 'INP']) report(metric(name, { attribution: CLS_ATTRIBUTION }))
    reportShift(metric('CLS', { attribution: CLS_ATTRIBUTION }))
    expect(fetchMock).toHaveBeenCalledTimes(3)

    const allowed = ['name', 'value', 'rating', 'path', 'size', 'moved', 'dx', 'dy']
    for (const [, init] of fetchMock.mock.calls) {
      const raw = (init as RequestInit).body as string
      expect(Object.keys(JSON.parse(raw)).every(key => allowed.includes(key))).toBe(true)
      expect(raw).not.toMatch(/v3-1759827600000|utm_source|fbclid|abc123|tonight|navigate|390|"delta"|"id"/)
      expect(Object.keys((init as RequestInit).headers as Record<string, string>)).toEqual(['Content-Type'])
    }
  })

  it('replaces a booking reference in the path before it leaves the browser', () => {
    window.history.pushState({}, '', '/parking/bookings/PB-2026-00417')

    report(metric('INP'))

    expect(sentBodies()[0].path).toBe('/parking/bookings/[id]')
  })
})

describe('the same reading reported twice is counted once (site review FD-010)', () => {
  it('sends one request when the same INP reading arrives twice', () => {
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends one request when the same CLS reading arrives twice', () => {
    reportShift(metric('CLS', { id: 'v4-cls-1', attribution: CLS_ATTRIBUTION }))
    reportShift(metric('CLS', { id: 'v4-cls-1', attribution: CLS_ATTRIBUTION }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('still sends an update: the same id with a new value', () => {
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))
    report(metric('INP', { value: 160, id: 'v4-inp-1' }))

    expect(sentBodies().map((body) => body.value)).toEqual([72, 160])
  })

  it('still sends two different readings that happen to share a value', () => {
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))
    report(metric('INP', { value: 72, id: 'v4-inp-2' }))

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not hold back a reading that carries no id, because it cannot be told apart', () => {
    report(metric('LCP', { id: undefined }))
    report(metric('LCP', { id: undefined }))

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('sends a reading that was held back while analytics was off, once it is back on', () => {
    storeChoice({ analytics: false })
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))
    expect(fetchMock).not.toHaveBeenCalled()

    storeChoice({ analytics: true })
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('still never sends the id itself', () => {
    report(metric('INP', { value: 72, id: 'v4-inp-1' }))

    expect(JSON.stringify(sentBodies())).not.toContain('v4-inp-1')
  })
})

describe('recordablePath', () => {
  it.each([
    ['/', '/'],
    ['/whats-on', '/whats-on'],
    ['/blog/top-10-things-to-do-near-heathrow-2026', '/blog/top-10-things-to-do-near-heathrow-2026'],
    ['/whats-on?utm_source=x', '/whats-on'],
    ['/whats-on#tonight', '/whats-on'],
    ['/parking/bookings/PB-2026-00417', '/parking/bookings/[id]'],
    ['/heathrow-parking/confirmation/abc', '/heathrow-parking/confirmation/[id]'],
    ['/events/3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b', '/events/[id]'],
    ['/x/12345678', '/x/[id]'],
    ['/x/9f86d081884c7d659a2feaa0c55ad015', '/x/[id]'],
    ['/x/tok_4f9a8b7c6d5e4f3a2b1c', '/x/[id]']
  ])('records %s as %s', (input, expected) => {
    expect(recordablePath(input)).toBe(expected)
  })

  it.each([
    ['an email address in the path', '/unsubscribe/jo@example.com'],
    ['an encoded character', '/find%20us'],
    ['no leading slash', 'whats-on'],
    ['a full address', 'https://www.the-anchor.pub/whats-on'],
    ['an empty string', ''],
    ['a path past the length limit', `/${'a'.repeat(200)}`],
    ['something that is not a string', 42]
  ])('refuses %s', (_label, input) => {
    expect(recordablePath(input)).toBeNull()
  })
})

describe('size class and landing page', () => {
  it.each([
    [320, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1920, 'desktop']
  ])('calls a %ipx window %s', (width, expected) => {
    expect(sizeClassForWidth(width)).toBe(expected)
  })

  const page = { pathname: '/book-table', landingPathname: '/sunday-lunch', width: 800 }

  it('records LCP against the page the visit loaded first', () => {
    expect(buildWebVitalReport({ name: 'LCP', value: 1900, rating: 'good' }, page)?.path).toBe('/sunday-lunch')
  })

  it('records CLS and INP against the page the visitor is on', () => {
    expect(buildWebVitalReport({ name: 'CLS', value: 0.02, rating: 'good' }, page)?.path).toBe('/book-table')
    expect(buildWebVitalReport({ name: 'INP', value: 90, rating: 'good' }, page)?.path).toBe('/book-table')
  })

  it('sends nothing rather than a value that is not a number', () => {
    expect(buildWebVitalReport({ name: 'LCP', value: Number.NaN, rating: 'good' }, page)).toBeNull()
    expect(buildWebVitalReport({ name: 'LCP', value: Number.POSITIVE_INFINITY, rating: 'good' }, page)).toBeNull()
  })
})
