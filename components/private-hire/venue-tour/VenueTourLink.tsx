'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { trackCtaClick } from '@/lib/gtm-events'
import {
  getVenueTourHref,
  type VenueTourEventType,
  type VenueTourSpaceId,
} from './venue-tour-data'

interface VenueTourLinkProps {
  children: ReactNode
  className?: string
  source: string
  label: string
  initialSpaceId?: VenueTourSpaceId
  eventType?: VenueTourEventType
}

export function VenueTourLink({
  children,
  className,
  source,
  label,
  initialSpaceId,
  eventType,
}: VenueTourLinkProps) {
  const href = getVenueTourHref(initialSpaceId, eventType)

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackCtaClick({
          id: `${source}_venue_tour`,
          label,
          location: source,
          destination: href,
          context: 'private_hire',
        })
      }}
    >
      {children}
    </Link>
  )
}
