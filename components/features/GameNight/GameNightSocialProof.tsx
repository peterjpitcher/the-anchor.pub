import type { ReactElement } from 'react'
import { Card, CardBody } from '@/components/ui'
import { HeroBadge } from '@/components/HeroBadge'
import { cn } from '@/lib/utils'

/**
 * Venue-wide trust badges, shown against the booking form.
 *
 * The rating badge appeared on /karaoke and /live-sport only, which are the two
 * pages that sell nothing. The three that take an actual booking showed no proof
 * at all at the point where somebody is deciding whether to hand over their
 * name and phone number.
 *
 * The caption is not decoration. This is The Anchor's overall Google rating and
 * the pub's food hygiene score, neither of which is a rating of quiz night, of
 * bingo, or of any single event. Presented next to an event booking form with no
 * qualifier it reads as "this night is rated 4.6", which nothing supports. Say
 * whose rating it is, and where it comes from.
 *
 * No `aggregateRating` and no `review` markup goes with it, deliberately. Google
 * restricts those to a site reviewing another business, not a business
 * publishing its own score, and this site is currently clean of both.
 */
export function GameNightSocialProof({
  gameName,
  className
}: {
  /** Lower-case game name, e.g. "quiz night". Used to say what is NOT rated. */
  gameName: string
  className?: string
}): ReactElement {
  return (
    <Card className={cn('bg-surface-sunk', className)}>
      <CardBody className="space-y-2 py-4">
        <HeroBadge className="justify-start text-sm" />
        <p className="text-xs text-ink-muted">
          These are venue-wide ratings for The Anchor, not ratings of {gameName}. The star score is
          our overall Google rating, and the hygiene score is for the pub&rsquo;s kitchen.
        </p>
      </CardBody>
    </Card>
  )
}
