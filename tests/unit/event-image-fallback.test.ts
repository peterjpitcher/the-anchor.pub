import fs from 'fs'
import path from 'path'
import {
  resolveEventHeroImage,
  resolveEventSocialImage,
  resolveEventSquareImage,
} from '@/lib/event-image'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'
import type { Event } from '@/lib/api'

/**
 * Ten of the fifteen upcoming events on 6 September 2026 carried no artwork of
 * any kind, so every surface fell back to one generic pub photo. These tests
 * pin the category map that replaced it, and pin the two rules the map has to
 * obey: an event's own artwork always wins, and a category with no photography
 * lands on the neutral image rather than borrowing another night's.
 */

const SQUARE = 'https://cdn/events/e1/square.png'
const LANDSCAPE = 'https://cdn/events/e1/landscape.png'
const SOCIAL = 'https://cdn/events/e1/social.png'

function eventInCategory(slug?: string, overrides: Partial<Event> = {}): Event {
  return {
    id: 'e1',
    name: 'Test Event',
    ...(slug ? { category: { id: slug, name: slug, slug, color: '#000' } } : {}),
    ...overrides,
  } as Event
}

/** The six live category slugs, plus the karaoke alias the routes table carries. */
const CATEGORIES_WITH_ARTWORK = ['quiz-night-stanwell-moor', 'bingo-night', 'music-bingo']
const CATEGORIES_WITHOUT_ARTWORK = [
  'karaoke-night',
  'nikkis-karaoke-night',
  'parties',
  'tasting-nights',
]
const ALL_CATEGORIES = [...CATEGORIES_WITH_ARTWORK, ...CATEGORIES_WITHOUT_ARTWORK]

const RESOLVERS = [
  ['square', resolveEventSquareImage],
  ['hero', resolveEventHeroImage],
  ['social', resolveEventSocialImage],
] as const

describe('category fallback images', () => {
  it.each(ALL_CATEGORIES)('resolves an image for every surface of %s', (slug) => {
    const event = eventInCategory(slug)
    for (const [, resolve] of RESOLVERS) {
      expect(resolve(event)).toMatch(/^\/images\//)
    }
  })

  it.each(CATEGORIES_WITH_ARTWORK)('serves %s its own category photography', (slug) => {
    const event = eventInCategory(slug)
    for (const [, resolve] of RESOLVERS) {
      expect(resolve(event)).toMatch(/^\/images\/events\//)
      expect(resolve(event)).not.toBe(DEFAULT_EVENT_IMAGE)
    }
  })

  it.each(CATEGORIES_WITHOUT_ARTWORK)(
    'sends %s to the neutral image, never another night',
    (slug) => {
      const event = eventInCategory(slug)
      for (const [, resolve] of RESOLVERS) {
        // Karaoke, parties and tasting nights have no photography on disk. A
        // bingo crowd standing in for a tasting night would be a claim, not a
        // fallback, so the neutral image is the only honest answer.
        expect(resolve(event)).toBe(DEFAULT_EVENT_IMAGE)
        expect(resolve(event)).not.toContain('/images/events/')
      }
    }
  )

  it('falls back to neutral for an unknown category slug', () => {
    const event = eventInCategory('mystery-format-2027')
    for (const [, resolve] of RESOLVERS) {
      expect(resolve(event)).toBe(DEFAULT_EVENT_IMAGE)
    }
  })

  it('falls back to neutral when the API sends no category at all', () => {
    const event = eventInCategory(undefined)
    for (const [, resolve] of RESOLVERS) {
      expect(resolve(event)).toBe(DEFAULT_EVENT_IMAGE)
    }
  })

  it('matches the slug case insensitively and ignores stray whitespace', () => {
    const event = eventInCategory(' Quiz-Night-Stanwell-Moor ')
    expect(resolveEventSquareImage(event)).toContain('/images/events/quiz-night/')
  })

  it('every file the map points at exists on disk', () => {
    // A fallback that 404s is worse than the generic photo it replaced, and a
    // renamed or optimised-away asset is exactly the kind of change nothing
    // else in the suite would catch.
    const referenced = new Set<string>()
    for (const slug of ALL_CATEGORIES) {
      const event = eventInCategory(slug)
      for (const [, resolve] of RESOLVERS) referenced.add(resolve(event))
    }

    for (const imagePath of referenced) {
      expect(fs.existsSync(path.join(process.cwd(), 'public', imagePath))).toBe(true)
    }
  })
})

describe('the event own artwork always wins', () => {
  it('prefers the event square over the category square', () => {
    const event = eventInCategory('quiz-night-stanwell-moor', { squareImageUrl: SQUARE })
    expect(resolveEventSquareImage(event)).toBe(SQUARE)
  })

  it('prefers the event landscape over the category hero', () => {
    const event = eventInCategory('music-bingo', { landscapeImageUrl: LANDSCAPE })
    expect(resolveEventHeroImage(event)).toBe(LANDSCAPE)
  })

  it('prefers the event social asset over the category social', () => {
    const event = eventInCategory('bingo-night', { socialImageUrl: SOCIAL })
    expect(resolveEventSocialImage(event)).toBe(SOCIAL)
  })

  it('still refuses to put a landscape in a square slot', () => {
    // The square resolver never widens its chain, so a landscape-only event in
    // a category with photography gets the category square, not a crop of its
    // own 16:9. A neutral-category event gets the neutral image.
    const event = eventInCategory('quiz-night-stanwell-moor', { landscapeImageUrl: LANDSCAPE })
    expect(resolveEventSquareImage(event)).not.toBe(LANDSCAPE)
    expect(resolveEventSquareImage(event)).toContain('/images/events/quiz-night/')
  })

  it('ignores a blank artwork field rather than publishing an empty src', () => {
    const event = eventInCategory('music-bingo', { squareImageUrl: '   ' })
    expect(resolveEventSquareImage(event)).toContain('/images/events/music-bingo/')
  })
})
