/**
 * The dark wash over every interior hero photo, and the arithmetic that proves
 * the text on it can be read.
 *
 * Owner decision 19 (7 October 2026): darken behind text over photos, and move
 * the festive frost off the corners where text sits.
 *
 * What was wrong. The old wash ran 0.92 on the left to 0.34 on the right, and
 * the text column had no width limit, so the ends of the intro lines, the
 * breadcrumb on a phone and the badges sat over a part of the photo the wash
 * barely covered. Where the photo was light the text failed contrast on about
 * half the site (site review AX-005), and the frost, drawn on top of the wash,
 * lightened those same corners and roughly doubled the failures (AX-006).
 *
 * What holds now. Under the whole text column the wash never drops below
 * HERO_SCRIM_HOLD. That figure is high enough that every text style in the
 * hero reaches 4.5:1 even over a pure white photo, so no photo can break it.
 * The wash only fades out to the right of the column, where there is no text.
 * The frost is drawn underneath the wash, so it shows where the wash is thin
 * and can never lighten what the text sits on.
 *
 * tests/unit/hero-scrim-contrast.test.ts recomputes all of this from the
 * numbers below, so a later change to a stop, a breakpoint, a text colour or an
 * opacity fails there rather than on a customer's phone.
 */

/** The wash colour: --anchor-green-deep, #0c1d11. */
export const HERO_SCRIM_RGB: readonly [number, number, number] = [12, 29, 17]

/** The least the wash may be under the text column. */
export const HERO_SCRIM_HOLD = 0.82

/** The text column's width cap from the lg breakpoint up, in pixels. */
export const HERO_TEXT_COLUMN_MAX_PX = 760

export interface ScrimStop {
  /** Position across the hero, 0 (left) to 1 (right). */
  at: number
  /** Opacity of the wash at that position. */
  alpha: number
}

export interface HeroScrimBand {
  /** Smallest viewport width this band applies from, in pixels. */
  minWidth: number
  stops: readonly ScrimStop[]
}

/**
 * Three bands, because the text column covers a different share of the hero at
 * each width.
 *
 * Below 1024px the column is the full width of the page, so the wash holds all
 * the way across. From 1024px the column is capped at 760px and ends no further
 * than 76% across; from 1280px no further than 61%. Each band holds a little
 * past that and then fades to show the photo.
 */
export const HERO_SCRIM_BANDS: readonly HeroScrimBand[] = [
  { minWidth: 0, stops: [{ at: 0, alpha: 0.92 }, { at: 1, alpha: HERO_SCRIM_HOLD }] },
  { minWidth: 1024, stops: [{ at: 0, alpha: 0.92 }, { at: 0.78, alpha: HERO_SCRIM_HOLD }, { at: 1, alpha: 0.4 }] },
  { minWidth: 1280, stops: [{ at: 0, alpha: 0.92 }, { at: 0.63, alpha: HERO_SCRIM_HOLD }, { at: 1, alpha: 0.34 }] }
]

/** The lift at the foot of the hero, unchanged from the original design. */
const FOOT_GRADIENT = `linear-gradient(0deg, rgba(${HERO_SCRIM_RGB.join(',')},0.55) 0%, rgba(${HERO_SCRIM_RGB.join(',')},0) 45%)`

/** The CSS `background` value for one band. Horizontal, so it can be checked by hand. */
export function heroScrimBackground(band: HeroScrimBand): string {
  const stops = band.stops
    .map((stop) => `rgba(${HERO_SCRIM_RGB.join(',')},${stop.alpha}) ${Math.round(stop.at * 100)}%`)
    .join(', ')
  return `linear-gradient(90deg, ${stops}), ${FOOT_GRADIENT}`
}

/** The band in force at a viewport width. */
export function heroScrimBandFor(viewportWidth: number): HeroScrimBand {
  return [...HERO_SCRIM_BANDS].reverse().find((band) => viewportWidth >= band.minWidth) ?? HERO_SCRIM_BANDS[0]
}

/** The wash's opacity at a position across the hero (0 to 1), by straight-line interpolation. */
export function heroScrimAlphaAt(band: HeroScrimBand, x: number): number {
  const stops = band.stops
  if (x <= stops[0].at) return stops[0].alpha
  for (let i = 1; i < stops.length; i += 1) {
    const from = stops[i - 1]
    const to = stops[i]
    if (x <= to.at) {
      const share = (x - from.at) / (to.at - from.at)
      return from.alpha + (to.alpha - from.alpha) * share
    }
  }
  return stops[stops.length - 1].alpha
}

/**
 * The sand badge's fill inside a hero, made solid.
 *
 * On a dark surface the sand badge is gold at 16% (--tile), which let the photo
 * show through the pill. This is that same tint laid over --anchor-green-deep
 * and flattened, so the pill looks as it did on a dark photo and no longer
 * depends on what is behind it.
 */
export const HERO_BADGE_FILL = '#2a3213'
