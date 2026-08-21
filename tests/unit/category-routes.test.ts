import { CATEGORY_ROUTES, getCategoryPageUrl } from '@/lib/event-seo-strategy'

/**
 * CATEGORY_ROUTES keys must be the slugs the management API actually sends.
 *
 * This drifted once and failed silently: three of four keys matched no real
 * category, so 44 events linked "View all <category> events" to /whats-on
 * instead of their hub. Nothing threw, no test failed, and the hub pages
 * simply never received the links.
 *
 * Slugs verified against event_categories on 21 Aug 2026.
 */
const LIVE_CATEGORY_SLUGS = [
  'quiz-night-stanwell-moor',
  'bingo-night',
  'music-bingo',
  'karaoke-night',
  'nikkis-karaoke-night',
  'nikkis-games-night',
  'world-cup-2026',
  'parties',
  'tasting-nights',
  'live-music',
  'celebrations',
  'sport',
  'open-mic-night',
  'dining',
] as const

describe('CATEGORY_ROUTES', () => {
  it('only maps slugs that exist in the live category list', () => {
    const unknown = Object.keys(CATEGORY_ROUTES).filter(
      (slug) => !LIVE_CATEGORY_SLUGS.includes(slug as (typeof LIVE_CATEGORY_SLUGS)[number]),
    )
    expect(unknown).toEqual([])
  })

  it('routes each of the four recurring formats to its own hub, not /whats-on', () => {
    expect(getCategoryPageUrl('quiz-night-stanwell-moor')).toBe('/quiz-night')
    expect(getCategoryPageUrl('bingo-night')).toBe('/cash-bingo')
    expect(getCategoryPageUrl('music-bingo')).toBe('/music-bingo')
    expect(getCategoryPageUrl('karaoke-night')).toBe('/karaoke')
  })

  it('falls back to /whats-on only for categories with no hub page', () => {
    expect(getCategoryPageUrl('tasting-nights')).toBe('/whats-on')
    expect(getCategoryPageUrl(undefined)).toBe('/whats-on')
    expect(getCategoryPageUrl(null)).toBe('/whats-on')
  })
})
