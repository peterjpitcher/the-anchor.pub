'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { trackVenueTourEnquiryClicked } from '@/lib/gtm-events'
import {
  getPrivateHireEnquiryHref,
  getVenueTourSpace,
  isVenueTourSpaceId,
  VENUE_TOUR_SPACE_SELECTED_EVENT,
  type VenueTourEventType,
  type VenueTourSpaceId,
} from './venue-tour-data'

interface VenueTourEnquiryLinkProps {
  children: ReactNode
  className?: string
  source: string
  initialSpaceId?: VenueTourSpaceId
  eventType?: VenueTourEventType
}

export function VenueTourEnquiryLink({
  children,
  className,
  source,
  initialSpaceId,
  eventType,
}: VenueTourEnquiryLinkProps) {
  const [spaceId, setSpaceId] = useState<VenueTourSpaceId>(
    getVenueTourSpace(initialSpaceId).id
  )
  const space = getVenueTourSpace(spaceId)
  const href = getPrivateHireEnquiryHref(space.id, eventType)

  useEffect(() => {
    if (initialSpaceId) setSpaceId(initialSpaceId)
  }, [initialSpaceId])

  useEffect(() => {
    const handleSpaceSelected = (event: Event) => {
      const selectedSpaceId = (event as CustomEvent<{ spaceId?: string }>).detail?.spaceId
      if (isVenueTourSpaceId(selectedSpaceId)) setSpaceId(selectedSpaceId)
    }

    window.addEventListener(VENUE_TOUR_SPACE_SELECTED_EVENT, handleSpaceSelected)
    return () => window.removeEventListener(VENUE_TOUR_SPACE_SELECTED_EVENT, handleSpaceSelected)
  }, [])

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackVenueTourEnquiryClicked({
          sourcePage: window.location.pathname,
          sourceComponent: source,
          destination: href,
          spaceId: space.id,
          spaceName: space.name,
        })
      }}
    >
      {children}
    </Link>
  )
}
