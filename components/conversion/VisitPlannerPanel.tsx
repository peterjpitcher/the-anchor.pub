import Link from 'next/link'
import { Plane, Car, Beer, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { BookTableButton } from '@/components/BookTableButton'
import { PlaneSpottingScheduleNote } from '@/components/plane-spotting/PlaneSpottingScheduleNote'

interface VisitPlannerPanelProps {
  /**
   * Tracking source passed through to {@link BookTableButton} and the menu
   * links so this panel's conversions can be attributed in GTM.
   * @default 'blog_visit_planner_panel'
   */
  source?: string
  /**
   * When true, surface the live plane-spotting schedule note (today's overhead
   * arrivals window). Use for the plane-spotting posts; omit for general
   * travel / things-to-do posts.
   * @default false
   */
  showScheduleNote?: boolean
  /** Optional wrapper className. */
  className?: string
}

interface PlannerHighlight {
  icon: typeof Plane
  title: string
  body: string
}

const HIGHLIGHTS: PlannerHighlight[] = [
  {
    icon: Beer,
    title: 'Beer garden under the flight path',
    body: 'Watch arrivals come in low over our garden with a drink in hand.',
  },
  {
    icon: Car,
    title: 'Free parking for all guests',
    body: 'Park on site for free, just 7 minutes from Heathrow Terminal 5.',
  },
  {
    icon: Plane,
    title: 'Walk in, no booking needed',
    body: 'Drop in whenever suits your day. Booking a table just guarantees your spot.',
  },
]

/**
 * WP5 inline conversion panel for high-intent plane-spotting and Heathrow-travel
 * blog posts ("Plan your visit"). Additive in-body block: it converts readers
 * toward a booking without touching the surrounding editorial copy.
 *
 * Reuses {@link BookTableButton} (carries the existing GTM tracking) and links
 * to the food and Sunday roast menus. Food and drink prices are intentionally
 * not shown here, they are live from the management DB on the menu pages.
 */
export function VisitPlannerPanel({
  source = 'blog_visit_planner_panel',
  showScheduleNote = false,
  className,
}: VisitPlannerPanelProps) {
  return (
    <section
      aria-labelledby="visit-planner-heading"
      className={cn('py-section-y bg-surface border-y border-line', className)}
    >
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-md border border-line bg-canvas p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-anchor-gold/10 text-accent-text"
              aria-hidden="true"
            >
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-text">
                Plan your visit
              </p>
              <h2
                id="visit-planner-heading"
                className="font-display text-h4 text-ink-strong"
              >
                Spend the day at The Anchor while you spot
              </h2>
            </div>
          </div>

          <p className="mt-4 text-ink-muted">
            The Anchor sits in Stanwell Moor, minutes from Heathrow, with a beer
            garden right under the flight path. Make a proper day of it with food,
            cold drinks and a comfortable base between planes.
          </p>

          {showScheduleNote ? (
            <PlaneSpottingScheduleNote variant="compact" className="mt-3" />
          ) : null}

          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex flex-col gap-2">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-anchor-gold/10 text-accent-text"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-semibold text-ink-strong">{title}</span>
                <span className="text-sm text-ink-muted">{body}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BookTableButton
              source={source}
              context="heathrow_visitor"
              size="lg"
            >
              Book a Table
            </BookTableButton>
            <Button asChild variant="outline" size="lg">
              <Link href="/food-menu">View Food Menu</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/sunday-roast">
                <UtensilsCrossed className="mr-2 h-5 w-5" aria-hidden="true" />
                Sunday Roast
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VisitPlannerPanel
