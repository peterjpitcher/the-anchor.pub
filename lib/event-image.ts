import type { Event } from '@/lib/api'

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
