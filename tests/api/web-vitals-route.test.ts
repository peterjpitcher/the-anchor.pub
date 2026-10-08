export {}

/**
 * POST /api/web-vitals writes one log line for a good report and nothing for a
 * bad one.
 *
 * The line is the whole record, so it is pinned exactly: a fixed prefix and
 * compact JSON holding the metric, value, rating, page path, size class and, for
 * CLS, the element that moved and how far. Nothing from the request's headers
 * may reach it: no IP address, user agent, referrer or cookie.
 *
 * It is written with console.warn because the production build strips
 * console.log (next.config.js, removeConsole), which is how this endpoint came
 * to record nothing for months.
 */

import { WEB_VITAL_LOG_PREFIX, formatWebVitalLine, parseWebVitalReport } from '@/lib/web-vitals-record'

if (typeof (Response as any).json !== 'function') {
  ;(Response as any).json = (body: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...((init as any)?.headers || {}) }
    })
}

// What a real browser sends alongside the body. None of it may be logged.
const VISITOR_HEADERS = {
  'content-type': 'application/json',
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) SentinelBrowser/1.0',
  'x-forwarded-for': '203.0.113.77',
  'x-real-ip': '203.0.113.77',
  referer: 'https://www.the-anchor.pub/whats-on?utm_source=sentinel-referrer',
  cookie: 'anchor-cookie-consent=sentinel-cookie; _ga=GA1.1.sentinel-ga'
}

const SENTINELS = /Sentinel|sentinel|203\.0\.113\.77|Mozilla|iPhone|utm_source|GA1/

const FORBIDDEN_KEYS = [
  'ip',
  'userAgent',
  'user_agent',
  'ua',
  'id',
  'metricId',
  'sessionId',
  'clientId',
  'referrer',
  'referer',
  'query',
  'search',
  'url',
  'delta',
  'navigationType',
  'width',
  'cookie',
  'timestamp'
]

const CLS = {
  name: 'CLS',
  value: 0.15324,
  rating: 'needs-improvement',
  path: '/whats-on',
  size: 'phone',
  moved: 'div.event-banner>img',
  dx: 0,
  dy: 84
}
const LCP = { name: 'LCP', value: 2480.4, rating: 'good', path: '/', size: 'desktop' }
const INP = { name: 'INP', value: 187.6, rating: 'good', path: '/sunday-lunch', size: 'tablet' }

function requestWith(raw: string, headers: Record<string, string> = VISITOR_HEADERS): any {
  return { headers: new Headers(headers), text: async () => raw }
}

let POST: (request: any) => Promise<Response>
let logged: Record<'log' | 'info' | 'warn' | 'error' | 'debug', jest.SpyInstance>

beforeEach(async () => {
  logged = {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    info: jest.spyOn(console, 'info').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
  }
  ;({ POST } = await import('@/app/api/web-vitals/route'))
  // The route counts requests per address. Each test starts from nothing, so
  // the count belongs to the limiter's own suite and not to this one.
  ;(await import('@/lib/rate-limit')).resetRateLimitsForTests()
})

afterEach(() => {
  jest.restoreAllMocks()
})

function linesLogged(): string[] {
  return Object.values(logged).flatMap(spy => spy.mock.calls.map(call => call.join(' ')))
}

describe('POST /api/web-vitals with a good report', () => {
  it.each([
    [
      'CLS',
      CLS,
      '[web-vital] {"metric":"CLS","value":0.1532,"rating":"needs-improvement","path":"/whats-on","size":"phone","moved":"div.event-banner>img","dx":0,"dy":84}'
    ],
    ['LCP', LCP, '[web-vital] {"metric":"LCP","value":2480,"rating":"good","path":"/","size":"desktop"}'],
    ['INP', INP, '[web-vital] {"metric":"INP","value":188,"rating":"good","path":"/sunday-lunch","size":"tablet"}']
  ])('answers 200 and writes exactly one line for %s', async (_name, body, expectedLine) => {
    const response = await POST(requestWith(JSON.stringify(body)))

    expect(response.status).toBe(200)
    expect(linesLogged()).toEqual([expectedLine])
    // console.warn is one of the two calls the production build keeps.
    expect(logged.warn).toHaveBeenCalledTimes(1)
    expect(logged.warn.mock.calls[0]).toHaveLength(1)
  })

  it.each([
    ['CLS', CLS],
    ['LCP', LCP],
    ['INP', INP]
  ])('writes a %s line with no empty value, no forbidden field and nothing from the headers', async (_name, body) => {
    await POST(requestWith(JSON.stringify(body)))

    const [line] = linesLogged()
    expect(line.startsWith(`${WEB_VITAL_LOG_PREFIX} {`)).toBe(true)
    expect(line).not.toMatch(/\n|\r/)
    expect(line).not.toMatch(/undefined|NaN|Infinity|null|Invalid Date|""|\[object/)
    expect(line).not.toMatch(SENTINELS)
    expect(line).not.toContain('?')

    const record = JSON.parse(line.slice(WEB_VITAL_LOG_PREFIX.length + 1)) as Record<string, unknown>
    for (const [key, value] of Object.entries(record)) {
      expect(FORBIDDEN_KEYS).not.toContain(key)
      expect(value === '' || value === null || value === undefined).toBe(false)
      if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true)
    }
    expect(Object.keys(record)).toEqual(
      body.name === 'CLS'
        ? ['metric', 'value', 'rating', 'path', 'size', 'moved', 'dx', 'dy']
        : ['metric', 'value', 'rating', 'path', 'size']
    )
  })

  it('accepts CLS with no element, and with an element but no distance', async () => {
    const { moved, dx, dy, ...bare } = CLS
    await POST(requestWith(JSON.stringify(bare)))
    await POST(requestWith(JSON.stringify({ ...bare, moved })))

    expect(linesLogged()).toEqual([
      '[web-vital] {"metric":"CLS","value":0.1532,"rating":"needs-improvement","path":"/whats-on","size":"phone"}',
      '[web-vital] {"metric":"CLS","value":0.1532,"rating":"needs-improvement","path":"/whats-on","size":"phone","moved":"div.event-banner>img"}'
    ])
    expect(dx).toBe(0)
    expect(dy).toBe(84)
  })
})

describe('POST /api/web-vitals with a bad report', () => {
  const bad: Array<[string, string]> = [
    ['a body that is not JSON', '{not json'],
    ['an empty body', ''],
    ['null', 'null'],
    ['an array', JSON.stringify([LCP])],
    ['a string', '"LCP"'],
    ['a metric we do not record (FCP)', JSON.stringify({ ...LCP, name: 'FCP' })],
    ['a metric we do not record (TTFB)', JSON.stringify({ ...LCP, name: 'TTFB' })],
    ['a metric we do not record (FID)', JSON.stringify({ ...LCP, name: 'FID' })],
    ['a made-up metric', JSON.stringify({ ...LCP, name: 'HACK' })],
    ['a metric name in the wrong case', JSON.stringify({ ...LCP, name: 'lcp' })],
    ['no metric name', JSON.stringify({ ...LCP, name: undefined })],
    ['a value sent as a string', JSON.stringify({ ...LCP, value: '2480' })],
    ['a value of null, which is what NaN and Infinity become in JSON', JSON.stringify({ ...LCP, value: Number.NaN })],
    ['a value too large for JSON to hold', '{"name":"LCP","value":1e999,"rating":"good","path":"/","size":"desktop"}'],
    ['a negative value', JSON.stringify({ ...LCP, value: -1 })],
    ['a value past the ceiling', JSON.stringify({ ...LCP, value: 600_001 })],
    ['no value', JSON.stringify({ ...LCP, value: undefined })],
    ['an unknown rating', JSON.stringify({ ...LCP, rating: 'excellent' })],
    ['an unknown size class', JSON.stringify({ ...LCP, size: 'watch' })],
    ['a size sent as a width', JSON.stringify({ ...LCP, size: 390 })],
    ['a path with a query string', JSON.stringify({ ...LCP, path: '/whats-on?utm_source=x' })],
    ['a path with a fragment', JSON.stringify({ ...LCP, path: '/whats-on#tonight' })],
    ['a full address for a path', JSON.stringify({ ...LCP, path: 'https://www.the-anchor.pub/' })],
    ['a path holding an email address', JSON.stringify({ ...LCP, path: '/x/jo@example.com' })],
    ['a path holding a booking reference', JSON.stringify({ ...LCP, path: '/parking/bookings/PB-2026-00417' })],
    ['a path holding a line break', JSON.stringify({ ...LCP, path: '/whats-on\n[web-vital] forged' })],
    ['an over-long path', JSON.stringify({ ...LCP, path: `/${'a'.repeat(200)}` })],
    ['no path', JSON.stringify({ ...LCP, path: undefined })],
    ['an over-long selector', JSON.stringify({ ...CLS, moved: 'a'.repeat(121) })],
    ['an empty selector', JSON.stringify({ ...CLS, moved: '' })],
    ['a selector holding a line break', JSON.stringify({ ...CLS, moved: 'div\n[web-vital] forged' })],
    ['a selector that is not a string', JSON.stringify({ ...CLS, moved: { a: 1 } })],
    ['a distance with no element', JSON.stringify({ ...CLS, moved: undefined })],
    ['half a distance', JSON.stringify({ ...CLS, dy: undefined })],
    ['a distance sent as a string', JSON.stringify({ ...CLS, dx: '0' })],
    ['a distance past the ceiling', JSON.stringify({ ...CLS, dy: 100_001 })],
    ['an element on a metric that is not CLS', JSON.stringify({ ...LCP, moved: 'img.hero' })],
    ['a metric id', JSON.stringify({ ...LCP, id: 'v3-1759827600000-4821093755123' })],
    ['the old payload', JSON.stringify({ name: 'LCP', value: 2480, rating: 'good', delta: 2480, id: 'v3-1', navigationType: 'navigate' })],
    ['an extra field', JSON.stringify({ ...LCP, userAgent: 'Mozilla/5.0' })]
  ]

  it.each(bad)('answers 400 and logs nothing for %s', async (_label, raw) => {
    const response = await POST(requestWith(raw))

    expect(response.status).toBe(400)
    expect(linesLogged()).toEqual([])
  })

  it('answers 413 and logs nothing for a body over the size limit', async () => {
    const raw = JSON.stringify({ ...LCP, padding: 'x'.repeat(2000) })

    const response = await POST(requestWith(raw))

    expect(response.status).toBe(413)
    expect(linesLogged()).toEqual([])
  })

  it('answers 413 without reading the body when the declared length is over the limit', async () => {
    const text = jest.fn(async () => JSON.stringify(LCP))

    const response = await POST({
      headers: new Headers({ 'content-length': '5000000', 'x-forwarded-for': '203.0.113.77' }),
      text
    })

    expect(response.status).toBe(413)
    expect(text).not.toHaveBeenCalled()
    expect(linesLogged()).toEqual([])
  })

  it('answers 400 and logs nothing when the body cannot be read', async () => {
    const response = await POST({
      headers: new Headers({ 'x-forwarded-for': '203.0.113.77' }),
      text: async () => {
        throw new Error('stream closed')
      }
    })

    expect(response.status).toBe(400)
    expect(linesLogged()).toEqual([])
  })
})

describe('the log line', () => {
  it('cannot be given a field the check did not pass', () => {
    const report = parseWebVitalReport(LCP)
    expect(report).not.toBeNull()

    // A field added to the object after the check is still not written.
    const line = formatWebVitalLine({ ...report!, ip: '203.0.113.77' } as any)

    expect(line).toBe('[web-vital] {"metric":"LCP","value":2480,"rating":"good","path":"/","size":"desktop"}')
  })
})

describe('POST /api/web-vitals rate limit', () => {
  it('answers 429 with Retry-After once one address passes 60 a minute, and logs no address', async () => {
    const raw = JSON.stringify(LCP)
    for (let i = 0; i < 60; i += 1) {
      expect((await POST(requestWith(raw))).status).toBe(200)
    }

    const refused = await POST(requestWith(raw))

    expect(refused.status).toBe(429)
    expect(Number(refused.headers.get('Retry-After'))).toBeGreaterThan(0)
    expect(linesLogged().join('\n')).not.toMatch(/203\.0\.113\.77/)

    // Another visitor is not affected.
    const other = await POST(requestWith(raw, { ...VISITOR_HEADERS, 'x-forwarded-for': '203.0.113.78' }))
    expect(other.status).toBe(200)
  })
})
