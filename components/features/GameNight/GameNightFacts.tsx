import { Badge } from '@/components/ui'
import type { GameNightFact } from '@/lib/game-nights'

/**
 * The at-a-glance chips for a game night, rendered into InteriorHero's `badges`
 * slot (which supplies its own flex-wrap row, so this returns a fragment).
 *
 * These exist because the four game pages previously put every fact a visitor
 * needs to decide with (price, start time, team size, parking) in prose several
 * screens down. A paid click will not scroll for them.
 */
export function GameNightFacts({ facts }: { facts: GameNightFact[] }) {
  return (
    <>
      {facts.map((fact) => (
        <Badge key={fact.label} variant="sand">
          {/* The gap has to be a margin, not a space between the two nodes. Badge
              is `inline-flex`, so a whitespace-only text node between children
              becomes an anonymous flex item and is dropped: that is why these
              rendered as "Entry£3 per person" despite reading correctly in the
              markup. */}
          <span className="mr-1 font-normal opacity-70">{fact.label}</span>
          <span>{fact.value}</span>
        </Badge>
      ))}
    </>
  )
}
