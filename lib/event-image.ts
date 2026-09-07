import type { Event } from '@/lib/api'
import { DEFAULT_EVENT_IMAGE } from '@/lib/image-fallbacks'

/**
 * Event artwork comes in three web shapes: 1:1 square, 16:9 landscape and
 * 1.91:1 social. Each surface needs a specific one, so there is a resolver per
 * shape rather than one context-free helper: a square slot given a landscape
 * crops the sides off designed artwork, and a wide hero given a square is worse
 * still.
 *
 * All three degrade to whatever the event actually has, so events with only the
 * legacy square keep working, as does an older API response that carries no
 * variant fields at all.
 */

function firstUsable(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate
  }
  return null
}

/** The square published by the API, which is always image[0] when one exists. */
function squareOf(event: Event): string | null {
  return firstUsable(
    event.squareImageUrl,
    event.heroImageUrl,
    event.thumbnailImageUrl,
    event.image?.[0]
  )
}

/** Square slots: cards, listings, related events, countdown banners. */
export function getEventSquareImage(event: Event): string | null {
  return squareOf(event)
}

/** Wide slots: the event page hero and campaign landing pages. */
export function getEventHeroImage(event: Event): string | null {
  return firstUsable(event.landscapeImageUrl, squareOf(event))
}

/** Link previews and Facebook event covers. */
export function getEventSocialImage(event: Event): string | null {
  return firstUsable(event.socialImageUrl, event.landscapeImageUrl, squareOf(event))
}

/**
 * Kept for callers that just want "this event's own artwork, whatever shape".
 *
 * It no longer prefers posterImageUrl. That only ever worked because
 * poster_image_url holds the square, which was accidental rather than intended.
 */
export function getEventImage(event: Event): string | null {
  return squareOf(event)
}

/**
 * The three shapes a surface can ask for, resolved for one event category.
 */
export interface EventFallbackImages {
  /** 1:1 slots: cards, listings, related events, JSON-LD image. */
  square: string
  /** Wide slots: the event page hero. */
  hero: string
  /** Link previews and Facebook covers. */
  social: string
}

/**
 * The image every surface lands on when we have nothing category specific.
 *
 * It is a real Anchor event night, so it never claims a format we do not run.
 * That is the whole test a fallback has to pass: it outlives the night it was
 * shot for, so it must stay true on a date nobody has thought about yet.
 */
const NEUTRAL_FALLBACK_IMAGES: EventFallbackImages = {
  square: DEFAULT_EVENT_IMAGE,
  hero: DEFAULT_EVENT_IMAGE,
  social: DEFAULT_EVENT_IMAGE,
}

/**
 * Category artwork for events the management app publishes without their own
 * images, which is most of them: ten of the fifteen upcoming events on 6
 * September 2026 had none at all, so every one of them showed the same generic
 * pub interior on cards, heroes, link previews and in JSON-LD.
 *
 * Keyed on the live category slugs. Only quiz night, cash bingo and music bingo
 * have photography on disk. Karaoke, parties and tasting nights deliberately
 * resolve to the neutral image rather than borrowing another night's pictures:
 * a bingo crowd standing in for a tasting night is a claim we cannot make.
 *
 * Every file here is evergreen room photography with no date, price or named
 * performer in shot, and none of it is designed artwork, so the crops a square
 * or wide container applies are safe. Event posters are square and must never
 * be cropped, which is exactly why no poster is used as a wide fallback.
 */
const CATEGORY_FALLBACK_IMAGES: Record<string, EventFallbackImages> = {
  // Quiz Night. Both files are full rooms of teams at tables, no host in focus.
  'quiz-night-stanwell-moor': {
    square: '/images/events/quiz-night/quiz-night-team-writing.jpg',
    hero: '/images/events/quiz-night/quiz-night-hero-tables-full.jpg',
    social: '/images/events/quiz-night/quiz-night-hero-tables-full.jpg',
  },
  // Cash Bingo. The indoor shot is used on all three surfaces on purpose: the
  // rest of that folder is summer garden photography, which dates itself the
  // moment a January game falls back to it.
  'bingo-night': {
    square: '/images/events/cash-bingo/cash-bingo-hero-eyes-down.jpg',
    hero: '/images/events/cash-bingo/cash-bingo-hero-eyes-down.jpg',
    social: '/images/events/cash-bingo/cash-bingo-hero-eyes-down.jpg',
  },
  // Music Bingo. The wide room shot is the only 16:9 in the folder; the square
  // uses a table group rather than a shot built around the host.
  'music-bingo': {
    square: '/images/events/music-bingo/music-bingo-table-of-friends.jpg',
    hero: '/images/events/music-bingo/music-bingo-hero-room-wide.jpg',
    social: '/images/events/music-bingo/music-bingo-hero-room-wide.jpg',
  },
  // No photography on disk for these three. Listed explicitly so the map reads
  // as the full set of live categories rather than leaving a reader to guess
  // whether an omission was an oversight.
  'karaoke-night': NEUTRAL_FALLBACK_IMAGES,
  'nikkis-karaoke-night': NEUTRAL_FALLBACK_IMAGES,
  parties: NEUTRAL_FALLBACK_IMAGES,
  'tasting-nights': NEUTRAL_FALLBACK_IMAGES,
}

/**
 * The fallback set for an event's category. An unknown slug, and an event the
 * API sent with no category at all, both land on the neutral set.
 */
function fallbackImagesFor(event: Event): EventFallbackImages {
  const slug = event.category?.slug?.toLowerCase().trim()
  if (!slug) return NEUTRAL_FALLBACK_IMAGES
  return CATEGORY_FALLBACK_IMAGES[slug] ?? NEUTRAL_FALLBACK_IMAGES
}

/**
 * Square slot with a guaranteed image: the event's own square if it has one,
 * otherwise its category's.
 */
export function resolveEventSquareImage(event: Event): string {
  return getEventSquareImage(event) ?? fallbackImagesFor(event).square
}

/** Wide slot with a guaranteed image. */
export function resolveEventHeroImage(event: Event): string {
  return getEventHeroImage(event) ?? fallbackImagesFor(event).hero
}

/** Link preview with a guaranteed image. */
export function resolveEventSocialImage(event: Event): string {
  return getEventSocialImage(event) ?? fallbackImagesFor(event).social
}
