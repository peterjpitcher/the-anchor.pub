import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Badge } from '@/components/ui/primitives/Badge'

export interface RegularEventCardProps {
  /** Uppercase gold cadence line, e.g. "Monthly". */
  cadence: string
  /** Event title (DM Serif). */
  title: string
  /** Muted supporting line. */
  meta: string
  /** Optional price/entry line, e.g. "£3 entry". Omit when unverified. */
  price?: string
  /** Sand tag label, e.g. "Free entry" or the event category. */
  tag: string
  /** Link to the event's own page. */
  href: string
}

/**
 * Light event card for the "The regulars" grid (spec §7.3.4): uppercase gold
 * cadence line, DM Serif title, muted meta, optional price + a sand tag.
 *
 * Only renders verified, SSOT/existing-page-backed values (see O4); callers
 * must not pass invented figures (exact times, song counts, etc.).
 */
export function RegularEventCard({
  cadence,
  title,
  meta,
  price,
  tag,
  href
}: RegularEventCardProps) {
  return (
    <Link href={href} className="group block h-full focus:outline-none">
      <Card
        hover
        accent
        className="h-full transition-colors group-focus-visible:border-accent"
      >
        <CardBody className="flex h-full flex-col gap-3">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">
            {cadence}
          </span>

          <h3 className="font-display text-h4 text-ink-strong transition-colors group-hover:text-accent-text group-focus-visible:text-accent-text">
            {title}
          </h3>

          <p className="text-ink-muted">{meta}</p>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            {price ? (
              <span className="font-display text-base text-accent-text">{price}</span>
            ) : null}
            <Badge variant="sand">{tag}</Badge>
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
