import { buildFallbackHomeRedirect } from '@/lib/routing/buildFallbackHomeRedirect'

describe('buildFallbackHomeRedirect', () => {
  it('returns root when no query params are provided', () => {
    expect(buildFallbackHomeRedirect()).toBe('/')
    expect(buildFallbackHomeRedirect({})).toBe('/')
  })

  it('preserves single-value query params', () => {
    const redirectUrl = buildFallbackHomeRedirect({
      utm_source: 'newsletter',
      ref: 'spring-campaign',
    })

    expect(redirectUrl).toBe('/?utm_source=newsletter&ref=spring-campaign')
  })

  it('preserves multi-value query params', () => {
    const redirectUrl = buildFallbackHomeRedirect({
      tag: ['events', 'food'],
      utm_source: 'google',
    })

    expect(redirectUrl).toBe('/?tag=events&tag=food&utm_source=google')
  })

  it('skips undefined values', () => {
    const redirectUrl = buildFallbackHomeRedirect({
      utm_source: 'email',
      empty: undefined,
      term: 'test',
    })

    expect(redirectUrl).toBe('/?utm_source=email&term=test')
  })
})
