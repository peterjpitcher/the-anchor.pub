import { nowInLondonComponents } from './time-london'

/**
 * The seasonal skin: dark theme through the colder months, plus icicle lights
 * and a frosted hero edge for November and December.
 *
 * Deliberately a pure function of the London date so it can be unit-tested the
 * way lib/christmas-season.ts is, and so a UTC server never flips the season a
 * few hours early. No client clock, no effects, no state. The root layout reads
 * it once per render and writes the result onto <html> as a data attribute plus
 * two custom properties.
 *
 * This owns the SKIN only. Which homepage photo is served stays with
 * getSeasonalHomepageImage() in lib/seasonal-utils.ts. Do not fork that logic.
 */

export type SeasonalSkinStage = 'off' | 'dark' | 'festive'

export interface SeasonalSkin {
  /** Which stage the London date falls in. */
  stage: SeasonalSkinStage
  /** Dark surface treatment across the whole site (1 September to 31 March). */
  dark: boolean
  /** Icicle strand opacity, 0 to 1 (1 November to 31 December). */
  lights: number
  /** Frost layer opacity, 0 to 1 (1 November to 31 December). */
  frost: number
}

const SKIN_OFF: SeasonalSkin = { stage: 'off', dark: false, lights: 0, frost: 0 }
const SKIN_DARK: SeasonalSkin = { stage: 'dark', dark: true, lights: 0, frost: 0 }
const SKIN_FESTIVE: SeasonalSkin = { stage: 'festive', dark: true, lights: 1, frost: 1 }

const STAGES: Record<SeasonalSkinStage, SeasonalSkin> = {
  off: SKIN_OFF,
  dark: SKIN_DARK,
  festive: SKIN_FESTIVE
}

function isSkinStage(value: string): value is SeasonalSkinStage {
  return value === 'off' || value === 'dark' || value === 'festive'
}

/**
 * Resolves the skin for a given moment, in Europe/London.
 *
 * Windows, as agreed with the owner on 12 August 2026:
 * - Dark theme:      1 September to 31 March (months 9 to 12 and 1 to 3)
 * - Lights + frost:  1 November to 31 December, at full strength from day one
 *
 * Note there is no Remembrance hold-back here. The owner is handling 1 to 11
 * November separately, so the decorative layers run the full two months.
 *
 * `NEXT_PUBLIC_FORCE_WINTER_SKIN` ('off' | 'dark' | 'festive') overrides the
 * date on preview deploys, mirroring how NEXT_PUBLIC_FORCE_SEASON already works
 * for the hero photo. An unrecognised value is ignored rather than throwing, so
 * a typo in a Vercel env var can never take the live site down.
 */
export function getSeasonalSkin(testDate?: Date): SeasonalSkin {
  const forced = process.env.NEXT_PUBLIC_FORCE_WINTER_SKIN
  if (forced && isSkinStage(forced)) {
    return STAGES[forced]
  }

  const { month } = nowInLondonComponents(testDate ?? new Date())

  if (month === 11 || month === 12) return SKIN_FESTIVE
  if (month === 9 || month === 10 || month <= 3) return SKIN_DARK
  return SKIN_OFF
}

/**
 * The inline style object for <html>, exposing the two intensities to CSS as
 * custom properties. Returns an empty object when the skin is off so no unused
 * variables ship in the April to August markup.
 */
export function getSeasonalSkinStyle(skin: SeasonalSkin): Record<string, string> {
  if (skin.stage === 'off') return {}
  return {
    '--winter-lights': String(skin.lights),
    '--winter-frost': String(skin.frost)
  }
}
