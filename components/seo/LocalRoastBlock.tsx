import Link from 'next/link'
import { Button, Container, SectionHeading } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { FestiveKitchenNotice } from '@/components/seasonal/FestiveKitchenNotice'
import { PARKING_WORDING } from '@/lib/approved-wording'

interface LocalRoastBlockProps {
  /** The place this page is for, as it reads in a heading: "Staines". */
  area: string
  /** One sentence on how far away we are, in the SSOT's words. */
  travelLine: string
  /** Tracking label for the booking button. */
  source: string
}

/**
 * A short Sunday roast and booking section for the area pages, so someone
 * arriving from a local search can see the roast and act on it. "On Sundays",
 * never "every Sunday": FestiveKitchenNotice carries the kitchen's winter break.
 */
export function LocalRoastBlock({ area, travelLine, source }: LocalRoastBlockProps): React.JSX.Element {
  return (
    <section className="py-section-y bg-surface-sunk">
      <Container>
        <SectionHeading title={`Sunday Roast Near ${area}`} />
        <div className="space-y-4 text-center text-ink-muted">
          <p>
            Roasts carved fresh from 1pm to 6pm on Sundays. Walk in whenever suits you, or book if you&apos;re a group or want a set time. There&apos;s nothing to order in advance, and last seating is 5:30pm.
          </p>
          <p>
            Choose from beef, pork, turkey or our vegan Wellington. {travelLine} {PARKING_WORDING}
          </p>
          <p>
            Not a Sunday? See the{' '}
            <Link href="/food-menu" className="font-semibold text-accent-text underline">food menu</Link>
            {' '}for pub classics, stone-baked pizzas and fish and chips, then book for lunch or dinner.
          </p>
          <FestiveKitchenNotice />
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <Link href="/sunday-roast">See the Sunday roast</Link>
            </Button>
            <BookTableButton source={source} context="local_pub" variant="outline" size="lg">
              Book a table
            </BookTableButton>
          </div>
        </div>
      </Container>
    </section>
  )
}
