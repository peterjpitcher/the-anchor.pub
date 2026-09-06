import Link from 'next/link'
import { Button } from '@/components/ui'
import {
  CHRISTMAS_DEPOSIT_PER_PERSON,
  CHRISTMAS_MIN_PARTY_SIZE_SUMMARY,
  formatChristmasWindowLabel,
  getChristmasSeasonStatus
} from '@/lib/christmas-season'

/**
 * Days before the service window opens that the cross-link starts showing.
 * Matches the lead the food-menu page uses for its Christmas pointer, so the
 * season appears across the site at the same moment.
 */
const CHRISTMAS_LINK_LEAD_DAYS = 120

interface ChristmasCrossLinkProps {
  /**
   * One page-specific sentence that ties the host page to Christmas. The
   * standing facts (window, group size, deposit) are added here so every
   * mount quotes the same SSOT-backed numbers.
   */
  hook: string
}

/**
 * Seasonal in-content pointer to /christmas-parties for pages locals actually
 * read. Renders nothing outside the season: it appears when the window is
 * within the lead time and removes itself once the last bookable date has
 * passed, provided the host page revalidates (all three current hosts do).
 *
 * A self-contained full-bleed section, mounted bare like the FAQ accordion.
 * Never wrap it in Section or Container: that is the double-padding trap the
 * Christmas FAQ fell into.
 */
export function ChristmasCrossLink({ hook }: ChristmasCrossLinkProps) {
  const christmas = getChristmasSeasonStatus()
  const show = christmas.isBookable && christmas.daysUntilWindowStart <= CHRISTMAS_LINK_LEAD_DAYS
  if (!show) return null

  return (
    <section className="py-section-y bg-canvas">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-text">Christmas 2026</p>
          <h2 className="mt-2 font-display text-h3 text-ink-strong">Christmas at The Anchor</h2>
          <p className="mt-3 text-ink-muted">
            {hook} Christmas dinner runs {formatChristmasWindowLabel()},{' '}
            {CHRISTMAS_MIN_PARTY_SIZE_SUMMARY}, with a £{CHRISTMAS_DEPOSIT_PER_PERSON} per person
            deposit that comes off your bill. The full menu and prices are on the Christmas page.
          </p>
          <div className="mt-5">
            <Button asChild variant="primary">
              <Link href="/christmas-parties">See the Christmas menu and prices</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
