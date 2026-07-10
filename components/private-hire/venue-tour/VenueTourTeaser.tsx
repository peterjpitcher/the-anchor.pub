'use client'

import { useId, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Camera, ChevronDown, ChevronUp, Map } from 'lucide-react'
import { Button } from '@/components/ui'
import { trackCtaClick } from '@/lib/gtm-events'
import { cn } from '@/lib/utils'
import {
  getVenueTourHref,
  VENUE_TOUR_PHOTOS,
  VENUE_TOUR_SPACES,
  type VenueTourEventType,
  type VenueTourSpaceId,
} from './venue-tour-data'

const LazyInteractiveVenueFloorPlan = dynamic(
  () => import('./InteractiveVenueFloorPlan').then((module) => module.InteractiveVenueFloorPlan),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-md border border-line bg-surface-sunk" aria-label="Loading venue tour" />
    ),
  }
)

export interface VenueTourTeaserProps {
  source: string
  mode?: 'link' | 'expand'
  initialSpaceId?: VenueTourSpaceId
  eventType?: VenueTourEventType
  title?: string
  copy?: string
  ctaLabel?: string
  className?: string
}

export function VenueTourTeaser({
  source,
  mode = 'link',
  initialSpaceId = 'dining-room',
  eventType,
  title = 'See how your event could fit',
  copy = 'Explore the dining room, beer garden and real photo viewpoints before you enquire.',
  ctaLabel,
  className,
}: VenueTourTeaserProps) {
  const [expanded, setExpanded] = useState(false)
  const expandedId = `venue-tour-expanded-${useId().replace(/:/g, '')}`
  const href = getVenueTourHref(initialSpaceId, eventType)

  const trackOpen = (destination: string) => {
    trackCtaClick({
      id: `${source}_venue_tour_open`,
      label: ctaLabel || (mode === 'expand' ? 'Explore the venue here' : 'Explore the venue'),
      location: source,
      destination,
      context: 'private_hire',
    })
  }

  return (
    <div className={cn('mx-auto max-w-6xl', className)} data-venue-tour="teaser">
      <div className="overflow-hidden rounded-md border border-line bg-surface shadow-md">
        <div className="grid items-stretch lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex items-center overflow-hidden bg-surface-sunk">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/private-hire/venue-floor-plan-preview.webp"
                alt="Preview of The Anchor floor plan"
                fill
                className="object-contain"
                sizes="(max-width: 1023px) 100vw, 55vw"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {VENUE_TOUR_SPACES.map((space) => (
                  <span
                    key={space.id}
                    className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-anchor-gold-dark text-xs font-bold text-white shadow-md"
                    style={{ left: `${space.position.left}%`, top: `${space.position.top}%` }}
                  >
                    {space.number}
                  </span>
                ))}
                {VENUE_TOUR_PHOTOS.slice(0, 2).map((photo) => (
                  <span
                    key={photo.id}
                    className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-anchor-green text-white shadow-md"
                    style={{ left: `${photo.position.left}%`, top: `${photo.position.top}%` }}
                  >
                    <Camera className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
              <Map className="h-4 w-4" aria-hidden />
              Interactive venue tour
            </p>
            <h2 className="font-display text-h2 text-ink-strong">{title}</h2>
            <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-muted">{copy}</p>

            <div className="mt-6">
              {mode === 'expand' ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  aria-expanded={expanded}
                  aria-controls={expandedId}
                  onClick={() => {
                    if (!expanded) trackOpen(`#${expandedId}`)
                    setExpanded((value) => !value)
                  }}
                >
                  {expanded ? 'Hide the floor plan' : ctaLabel || 'Explore the venue here'}
                  {expanded ? (
                    <ChevronUp className="h-5 w-5" aria-hidden />
                  ) : (
                    <ChevronDown className="h-5 w-5" aria-hidden />
                  )}
                </Button>
              ) : (
                <Button asChild variant="primary" size="md">
                  <Link href={href} onClick={() => trackOpen(href)}>
                    {ctaLabel || 'Explore the venue'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {mode === 'expand' && expanded ? (
        <div id={expandedId} className="mt-8 scroll-mt-24">
          <LazyInteractiveVenueFloorPlan
            source={`${source}_expanded`}
            initialSpaceId={initialSpaceId}
            eventType={eventType}
          />
        </div>
      ) : null}
    </div>
  )
}
