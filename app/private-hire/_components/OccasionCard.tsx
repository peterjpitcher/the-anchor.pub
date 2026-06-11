import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card, CardBody } from '@/components/ui'

export interface OccasionCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Linked occasion card for the Private Hire "Occasions" grid (spec §7.4).
 * Light accent card with a sand icon tile, used on the cream surface.
 */
export function OccasionCard({ href, icon: Icon, title, description }: OccasionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card accent hover className="h-full">
        <CardBody className="flex h-full flex-col gap-3">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xs bg-anchor-sand text-anchor-green"
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h3 className="font-display text-h4 text-ink-strong">{title}</h3>
          <p className="text-base text-ink-muted">{description}</p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent-text">
            Find out more
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </span>
        </CardBody>
      </Card>
    </Link>
  )
}
