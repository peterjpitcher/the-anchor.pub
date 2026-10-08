'use client'

import { useCallback, useEffect, useState } from 'react'
import { StickyDrawer, Button } from '@/components/ui'
import { PrivateBookingCalculator } from '@/components/PrivateBookingCalculator'
import { trackCtaClick } from '@/lib/gtm-events'
import type { VenueTourSpaceId } from '@/components/private-hire/venue-tour/venue-tour-data'

const OPEN_EVENT = 'open-estimator-drawer'

interface StickyEstimatorDrawerProps {
  eventType?: string
  source?: string
  showInlineButton?: boolean
  inlineButtonLabel?: string
  initialSpaceId?: VenueTourSpaceId
}

export function StickyEstimatorDrawer({
  eventType,
  source = 'estimator_drawer',
  showInlineButton = false,
  inlineButtonLabel = 'Open Cost Estimator',
  initialSpaceId,
}: StickyEstimatorDrawerProps) {
  const [open, setOpen] = useState(false)

  // The floating "Get Instant Quote" button was removed on 8 October 2026
  // (owner decision 12, site review LS-006). It sat in the strip at the bottom
  // of the screen that the booking bar now occupies, so on all 27 private hire
  // pages it was behind the bar, and the bar already offers "Enquire about your
  // date" there. The drawer still opens from the button in the page and from
  // the 'open-estimator-drawer' event.
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  const handleInlineOpen = useCallback(() => {
    trackCtaClick({
      id: `${source}_inline_open`,
      label: inlineButtonLabel,
      location: 'inline_section',
      destination: 'estimator_drawer'
    })
    setOpen(true)
  }, [source, inlineButtonLabel])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      {showInlineButton && (
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleInlineOpen}
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {inlineButtonLabel}
          </span>
        </Button>
      )}

      <StickyDrawer
        open={open}
        onClose={handleClose}
        title="Event Cost Estimator"
        description="Get an instant quote for your event"
        side="right"
        testId="estimator-drawer"
      >
        <PrivateBookingCalculator
          eventType={eventType}
          initialSpaceId={initialSpaceId}
          source={source}
          compact
          quoteStartedOnMount={open}
        />
      </StickyDrawer>
    </>
  )
}
