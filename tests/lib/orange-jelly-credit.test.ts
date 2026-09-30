import {
  FALLBACK_CREDIT,
  getOrangeJellyCredit,
  parseOrangeJellyCredit
} from '@/lib/orange-jelly-credit'

// The footer credit is fed by orangejelly.co.uk, so the only hard rules are that
// the line never disappears and the feed can never put a foreign link on this
// site: anything unexpected falls back to the built-in line.

const validFeed = {
  prefix: 'Built and maintained by',
  label: 'Orange Jelly',
  href: 'https://www.orangejelly.co.uk/solutions/hospitality-websites',
  nofollow: false
}

describe('parseOrangeJellyCredit', () => {
  it('accepts a valid feed answer', () => {
    expect(parseOrangeJellyCredit(validFeed)).toEqual({
      prefix: 'Built and maintained by',
      label: 'Orange Jelly',
      href: 'https://www.orangejelly.co.uk/solutions/hospitality-websites'
    })
  })

  it('trims the prefix and the label', () => {
    expect(parseOrangeJellyCredit({ ...validFeed, prefix: '  Built by  ', label: '  Orange Jelly ' })).toMatchObject({
      prefix: 'Built by',
      label: 'Orange Jelly'
    })
  })

  it('allows an empty prefix', () => {
    expect(parseOrangeJellyCredit({ ...validFeed, prefix: '' })).toMatchObject({ prefix: '', label: 'Orange Jelly' })
  })

  it.each([
    ['missing', { prefix: validFeed.prefix, href: validFeed.href }],
    ['empty', { ...validFeed, label: '' }],
    ['blank', { ...validFeed, label: '   ' }],
    ['not a string', { ...validFeed, label: 42 }]
  ])('rejects a %s label', (_case, data) => {
    expect(parseOrangeJellyCredit(data)).toBeNull()
  })

  it('rejects a missing prefix', () => {
    expect(parseOrangeJellyCredit({ label: validFeed.label, href: validFeed.href })).toBeNull()
  })

  it('rejects over-long text', () => {
    expect(parseOrangeJellyCredit({ ...validFeed, prefix: 'a'.repeat(81) })).toBeNull()
    expect(parseOrangeJellyCredit({ ...validFeed, label: 'a'.repeat(81) })).toBeNull()
    expect(parseOrangeJellyCredit({ ...validFeed, label: 'a'.repeat(80) })).not.toBeNull()
  })

  it.each([
    ['non-HTTPS', 'http://www.orangejelly.co.uk/'],
    ['another host', 'https://example.com/'],
    ['the bare domain', 'https://orangejelly.co.uk/'],
    ['a look-alike host', 'https://www.orangejelly.co.uk.evil.test/'],
    ['credentials', 'https://user:pass@www.orangejelly.co.uk/'],
    ['a username', 'https://user@www.orangejelly.co.uk/'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['something that is not a URL', 'not a url']
  ])('rejects a link with %s', (_case, href) => {
    expect(parseOrangeJellyCredit({ ...validFeed, href })).toBeNull()
  })

  it('rejects a link that is not a string', () => {
    expect(parseOrangeJellyCredit({ ...validFeed, href: undefined })).toBeNull()
  })

  it.each([null, undefined, 'Orange Jelly', 42, true, []])('rejects non-object input: %p', (data) => {
    expect(parseOrangeJellyCredit(data)).toBeNull()
  })

  it('gives rel="nofollow" only when nofollow is exactly true', () => {
    expect(parseOrangeJellyCredit({ ...validFeed, nofollow: true })).toMatchObject({ rel: 'nofollow' })
    for (const nofollow of [false, 'true', 1, undefined]) {
      expect(parseOrangeJellyCredit({ ...validFeed, nofollow })).not.toHaveProperty('rel')
    }
  })
})

describe('getOrangeJellyCredit', () => {
  const originalFetch = global.fetch
  const hadTimeout = typeof AbortSignal.timeout === 'function'
  let warnSpy: jest.SpyInstance
  let fetchMock: jest.Mock

  // jsdom 20, this suite's environment, predates AbortSignal.timeout, which the
  // Next.js server runtime has. Supply a stand-in so the loader runs as it does in
  // production; the timeout itself is simulated below by fetch rejecting.
  beforeAll(() => {
    if (!hadTimeout) {
      Object.defineProperty(AbortSignal, 'timeout', {
        configurable: true,
        writable: true,
        value: () => new AbortController().signal
      })
    }
  })

  afterAll(() => {
    if (!hadTimeout) {
      delete (AbortSignal as { timeout?: unknown }).timeout
    }
  })

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    fetchMock = jest.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    global.fetch = originalFetch
    warnSpy.mockRestore()
  })

  function answer(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  it('returns the feed line when the feed answers 200 with a valid body', async () => {
    fetchMock.mockResolvedValue(answer({ ...validFeed, nofollow: true }))

    await expect(getOrangeJellyCredit()).resolves.toEqual({
      prefix: 'Built and maintained by',
      label: 'Orange Jelly',
      href: 'https://www.orangejelly.co.uk/solutions/hospitality-websites',
      rel: 'nofollow'
    })
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('asks for this site\'s entry, cached for a day, with a timeout signal', async () => {
    const timeoutSpy = jest.spyOn(AbortSignal, 'timeout')
    fetchMock.mockResolvedValue(answer(validFeed))

    await getOrangeJellyCredit()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://www.orangejelly.co.uk/api/credit/the-anchor', {
      next: { revalidate: 86400 },
      signal: expect.any(AbortSignal)
    })
    expect(timeoutSpy).toHaveBeenCalledWith(3000)
    timeoutSpy.mockRestore()
  })

  it('falls back when the feed answers anything but 200', async () => {
    fetchMock.mockResolvedValue(answer({ error: 'not found' }, 404))

    await expect(getOrangeJellyCredit()).resolves.toEqual(FALLBACK_CREDIT)
    expect(warnSpy).toHaveBeenCalledWith('[orange-jelly-credit] showing the fallback line:', expect.any(Error))
  })

  it('falls back on a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))

    await expect(getOrangeJellyCredit()).resolves.toEqual(FALLBACK_CREDIT)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('falls back when the feed times out', async () => {
    fetchMock.mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError'))

    await expect(getOrangeJellyCredit()).resolves.toEqual(FALLBACK_CREDIT)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('falls back when the body is not a valid credit', async () => {
    fetchMock.mockResolvedValue(answer({ ...validFeed, href: 'https://www.orangejelly.co.uk.evil.test/' }))

    await expect(getOrangeJellyCredit()).resolves.toEqual(FALLBACK_CREDIT)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('falls back when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }))

    await expect(getOrangeJellyCredit()).resolves.toEqual(FALLBACK_CREDIT)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('rethrows Next.js control-flow errors that carry a digest', async () => {
    const dynamicUsage = Object.assign(new Error('Dynamic server usage'), { digest: 'DYNAMIC_SERVER_USAGE' })
    fetchMock.mockRejectedValue(dynamicUsage)

    await expect(getOrangeJellyCredit()).rejects.toBe(dynamicUsage)
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('falls back to a line linking to the Orange Jelly home page', () => {
    expect(FALLBACK_CREDIT).toEqual({
      prefix: 'Built and maintained by',
      label: 'Orange Jelly',
      href: 'https://www.orangejelly.co.uk/'
    })
  })
})
