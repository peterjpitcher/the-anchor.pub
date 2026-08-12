import type { GameNightConfig } from './types'
import { quizNight } from './quiz-night'
import { cashBingo } from './cash-bingo'
import { musicBingo } from './music-bingo'
import { karaoke } from './karaoke'

export type { GameNightConfig, GameNightFact, GameNightObjection } from './types'
export { quizNight, cashBingo, musicBingo, karaoke }

/** Every hosted-game category page, keyed by route segment. */
export const GAME_NIGHTS: Record<GameNightConfig['slug'], GameNightConfig> = {
  'quiz-night': quizNight,
  'cash-bingo': cashBingo,
  'music-bingo': musicBingo,
  karaoke
}

/**
 * The other game nights worth cross-selling from `slug`.
 *
 * Karaoke is never offered as a destination: the SSOT forbids promoting it, and
 * pointing traffic at a page whose normal state is "no dates" wastes the click.
 * It can still link out to the others, which is why the filter is on the
 * returned nights rather than on the caller.
 */
export function getRelatedGameNights(slug: GameNightConfig['slug']): GameNightConfig[] {
  return Object.values(GAME_NIGHTS).filter(
    (night) => night.slug !== slug && night.promotable
  )
}
