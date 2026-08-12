import {
  getEventHeroImage,
  getEventImage,
  getEventSocialImage,
  getEventSquareImage,
} from '@/lib/event-image'
import type { Event } from '@/lib/api'

const SQUARE = 'https://cdn/events/e1/square.png'
const LANDSCAPE = 'https://cdn/events/e1/landscape.png'
const SOCIAL = 'https://cdn/events/e1/social.png'

function makeEvent(overrides: Partial<Event> = {}): Event {
  return { id: 'e1', name: 'Quiz Night', ...overrides } as Event
}

/**
 * What the API returned before the variant work, and still returns for every
 * event that only has a square: one URL repeated across the legacy fields.
 */
const legacyEvent = makeEvent({
  image: [SQUARE],
  heroImageUrl: SQUARE,
  thumbnailImageUrl: SQUARE,
  posterImageUrl: SQUARE,
})

const fullyKittedEvent = makeEvent({
  ...legacyEvent,
  image: [SQUARE, LANDSCAPE, SOCIAL],
  squareImageUrl: SQUARE,
  landscapeImageUrl: LANDSCAPE,
  socialImageUrl: SOCIAL,
})

describe('getEventSquareImage', () => {
  it('returns the square when the event has variants', () => {
    expect(getEventSquareImage(fullyKittedEvent)).toBe(SQUARE)
  })

  it('never returns the landscape for a square slot', () => {
    // Square card slots are aspect-square with object-cover, so a 16:9 image
    // loses its edges, which is exactly what the artwork cannot afford.
    const noSquare = makeEvent({ landscapeImageUrl: LANDSCAPE, socialImageUrl: SOCIAL })
    expect(getEventSquareImage(noSquare)).toBeNull()
  })

  it('falls back through the legacy fields on an older API response', () => {
    expect(getEventSquareImage(legacyEvent)).toBe(SQUARE)
    expect(getEventSquareImage(makeEvent({ thumbnailImageUrl: SQUARE }))).toBe(SQUARE)
    expect(getEventSquareImage(makeEvent({ image: [SQUARE] }))).toBe(SQUARE)
  })

  it('returns null when the event has no artwork', () => {
    expect(getEventSquareImage(makeEvent())).toBeNull()
  })
})

describe('getEventHeroImage', () => {
  it('prefers the landscape for wide slots', () => {
    expect(getEventHeroImage(fullyKittedEvent)).toBe(LANDSCAPE)
  })

  it('falls back to the square when there is no landscape', () => {
    expect(getEventHeroImage(legacyEvent)).toBe(SQUARE)
  })

  it('returns null when the event has no artwork', () => {
    expect(getEventHeroImage(makeEvent())).toBeNull()
  })
})

describe('getEventSocialImage', () => {
  it('prefers the 1.91:1 asset', () => {
    expect(getEventSocialImage(fullyKittedEvent)).toBe(SOCIAL)
  })

  it('falls back to landscape, then square', () => {
    expect(getEventSocialImage(makeEvent({ landscapeImageUrl: LANDSCAPE }))).toBe(LANDSCAPE)
    expect(getEventSocialImage(legacyEvent)).toBe(SQUARE)
  })
})

describe('shared behaviour', () => {
  it('ignores blank strings', () => {
    const blank = makeEvent({ squareImageUrl: '   ', heroImageUrl: SQUARE })
    expect(getEventSquareImage(blank)).toBe(SQUARE)
  })

  it('no longer prefers posterImageUrl above everything', () => {
    // It only ever worked because poster_image_url holds the square. Preferring
    // it would serve a print poster the moment that column meant what it says.
    const posterIsDifferent = makeEvent({
      squareImageUrl: SQUARE,
      posterImageUrl: 'https://cdn/events/e1/print.pdf',
    })
    expect(getEventImage(posterIsDifferent)).toBe(SQUARE)
    expect(getEventSquareImage(posterIsDifferent)).toBe(SQUARE)
    expect(getEventHeroImage(posterIsDifferent)).toBe(SQUARE)
    expect(getEventSocialImage(posterIsDifferent)).toBe(SQUARE)
  })

  it('never surfaces a story or print poster, which the API does not send', () => {
    const withInternal = makeEvent({
      squareImageUrl: SQUARE,
      ...({ storyImageUrl: 'https://cdn/story.png', printPosterUrl: 'https://cdn/a4.pdf' } as object),
    })
    for (const resolve of [getEventSquareImage, getEventHeroImage, getEventSocialImage]) {
      expect(resolve(withInternal)).toBe(SQUARE)
    }
  })
})
