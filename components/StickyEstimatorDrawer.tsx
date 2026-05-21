'use client'

import { useCallback, useEffect, useState } from 'react'
import { StickyDrawer, StickyDrawerTrigger } from '@/components/ui'
import { PrivateBookingCalculator } from '@/components/PrivateBookingCalculator'
import { Button } from '@/components/ui'
import { trackCtaClick, trackQuoteToolStarted } from '@/lib/gtm-events'

const OPEN_EVENT = 'open-estimator-drawer'

interface StickyEstimatorDrawerProps {
  eventType?: string
  triggerLabel?: string
  source?: string
  showInlineButton?: boolean
  inlineButtonLabel?: string
}

export function StickyEstimatorDrawer({
  eventType,
  triggerLabel = 'Get Instant Quote',
  source = 'estimator_drawer',
  showInlineButton = false,
  inlineButtonLabel = 'Open Cost Estimator'
}: StickyEstimatorDrawerProps) {
  const [open, setOpen] = useState(false)
  const [triggerVisible, setTriggerVisible] = useState(false)
  const [guardVisible, setGuardVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setTriggerVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const guards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-sticky-cta-guard="true"]')
    )
    if (guards.length === 0) {
      setGuardVisible(false)
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        const anyVisible = entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.5)
        setGuardVisible(anyVisible)
      },
      { threshold: [0.25, 0.5, 0.75] }
    )
    guards.forEach(g => observer.observe(g))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  const handleOpen = useCallback(() => {
    trackCtaClick({
      id: `${source}_open`,
      label: triggerLabel,
      location: 'sticky_trigger',
      destination: 'estimator_drawer'
    })
    trackQuoteToolStarted({
      eventType,
      pageSource: source
    })
    setOpen(true)
  }, [eventType, source, triggerLabel])

  const handleInlineOpen = useCallback(() => {
    trackCtaClick({
      id: `${source}_inline_open`,
      label: inlineButtonLabel,
      location: 'inline_section',
      destination: 'estimator_drawer'
    })
    trackQuoteToolStarted({
      eventType,
      pageSource: source
    })
    setOpen(true)
  }, [eventType, source, inlineButtonLabel])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const showTrigger = triggerVisible && !guardVisible && !open

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

      <StickyDrawerTrigger
        onClick={handleOpen}
        visible={showTrigger}
        position="bottom-right"
        testId="estimator-drawer-trigger"
      >
        <span className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {triggerLabel}
        </span>
      </StickyDrawerTrigger>

      <StickyDrawer
        open={open}
        onClose={handleClose}
        title="Event Cost Estimator"
        description="Get an instant quote for your event"
        side="right"
        testId="estimator-drawer"
      >
        <PrivateBookingCalculator eventType={eventType} compact quoteStartedOnMount />
      </StickyDrawer>
    </>
  )
}
