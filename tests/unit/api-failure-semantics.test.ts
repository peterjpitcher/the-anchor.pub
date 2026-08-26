import { isNotFoundError, isTransientError, rethrowIfTransient } from '@/lib/api/error-kind'
import { getRetiredEventRedirect, RETIRED_THIN_EVENT_SLUGS } from '@/lib/event-seo-strategy'
import redirects from '@/config/redirects/additional-redirects.json'

/**
 * A missing event and a broken dependency must not look the same.
 *
 * app/events/[id]/page.tsx wrapped its fetch in a bare `catch` that issued
 * permanentRedirect('/whats-on'). Every failure took that branch, so a timeout,
 * a 502, a DNS blip or a JSON parse error each told Google that a live,
 * bookable event had PERMANENTLY moved. The 301 is durable and cached. The
 * outage that produced it lasted seconds.
 */
describe('error classification', () => {
  it('treats only a definite 404 as "this does not exist"', () => {
    expect(isNotFoundError({ status: 404 })).toBe(true)
    expect(isNotFoundError({ message: 'Event not found', status: 404 })).toBe(true)
  })

  it.each([
    ['a timeout', new Error('The operation was aborted')],
    ['an abort', Object.assign(new Error('aborted'), { name: 'AbortError' })],
    ['a 500', { status: 500 }],
    ['a 502', { status: 502, message: 'Bad Gateway' }],
    ['a 503', { status: 503 }],
    ['a JSON parse failure', new SyntaxError('Unexpected token < in JSON')],
    ['a bare string', 'something went wrong'],
    ['null', null],
    ['undefined', undefined],
    ['an error with no status at all', new Error('network down')],
  ])('treats %s as transient, never as a retirement', (_label, err) => {
    expect(isNotFoundError(err)).toBe(false)
    expect(isTransientError(err)).toBe(true)
    expect(() => rethrowIfTransient(err)).toThrow()
  })

  it('lets a 404 pass through without throwing, so the route can call notFound()', () => {
    expect(() => rethrowIfTransient({ status: 404 })).not.toThrow()
  })

  it('defaults to transient for an unrecognised shape', () => {
    // Getting this backwards is the expensive direction: a wrongly permanent
    // redirect is durable, a wrongly transient error self-corrects.
    expect(isTransientError({ weird: true })).toBe(true)
  })
})

describe('retirement is resolved from the slug, not the API', () => {
  it('answers without any network call, so an outage cannot fake a retirement', () => {
    expect(getRetiredEventRedirect('quiz-night-april--2025')).toBe('/quiz-night')
    expect(getRetiredEventRedirect('bingo-night-2025-08-29')).toBe('/cash-bingo')
    expect(getRetiredEventRedirect('nikki-s-karaoke-night-2025-08-22')).toBe('/karaoke')
  })

  it('returns null for a live event, so it never redirects one', () => {
    expect(getRetiredEventRedirect('quiz-night-2026-10-07')).toBeNull()
    expect(getRetiredEventRedirect('')).toBeNull()
  })

  it('agrees with the redirect config for every retired slug', () => {
    const cfg = new Map(
      (redirects as Array<{ source: string; destination: string }>).map((r) => [
        r.source,
        r.destination,
      ]),
    )
    const mismatches: string[] = []
    for (const slug of RETIRED_THIN_EVENT_SLUGS) {
      const fromConfig = cfg.get(`/events/${slug}`)
      const fromCode = getRetiredEventRedirect(slug)
      if (fromConfig !== fromCode) {
        mismatches.push(`${slug}: config=${fromConfig} code=${fromCode}`)
      }
    }
    expect(mismatches).toEqual([])
  })
})
