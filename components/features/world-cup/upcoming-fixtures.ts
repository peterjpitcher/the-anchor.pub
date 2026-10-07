import type { WorldCup2026Match } from '@/lib/world-cup-2026'

/**
 * How long after kick-off a game still counts as on. Three hours covers ninety
 * minutes, half time, extra time and penalties. It only decides when a game
 * drops off the page; it is never shown to anyone as a finish time.
 */
const STILL_ON_FOR_MS = 3 * 60 * 60 * 1000

/**
 * The games in the CheersAI feed that have not finished yet.
 *
 * The feed keeps every fixture of a tournament after it ends: on 7 October 2026
 * it still returned all 104 games of a World Cup that finished on 19 July, and
 * the page listed them with "Showing" labels and booking buttons. The page now
 * asks this instead of trusting the list as it comes, so a finished tournament
 * empties itself and a new one shows up as soon as CheersAI supplies it.
 *
 * Instants are compared as instants, so the answer is the same in every time
 * zone. A kick-off that cannot be read is left out rather than guessed at.
 */
export function getUpcomingFixtures(
  matches: readonly WorldCup2026Match[],
  at: Date = new Date()
): WorldCup2026Match[] {
  const now = at.getTime()

  return matches.filter((match) => {
    const kickOff = Date.parse(match.utcDateTime)
    return Number.isFinite(kickOff) && kickOff + STILL_ON_FOR_MS > now
  })
}
