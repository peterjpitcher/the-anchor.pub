'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plane, X } from 'lucide-react'
import { pushToDataLayer } from '@/lib/gtm-events'
import {
  getLondonIsoDate,
  getPlaneSpottingBookingTime,
  getTodayPlaneSpottingWindow,
  type PlaneSpottingWindowInfo,
} from '@/lib/heathrow-runway-alternation'

// Every event here is sent through the Measurement Protocol.
//
// Plane spotting is the biggest audience on the site, roughly 227 users in
// 28 days across the two pages, and GA4 showed it producing nothing at all.
// That was never true: this prompt existed the whole time, but its events only
// reached the dataLayer, and the published GTM container has no triggers for
// our custom events, so none of them reached GA4. The funnel was not failing,
// it was invisible. See lib/gtm-events.ts trackFormComplete for the same fault.
export const PLANE_SPOTTING_PROMPT_SESSION_KEY = 'plane_spotting_booking_prompt_shown'

const SCROLL_PERCENT_THRESHOLD = 0.55
const DESKTOP_EXIT_INTENT_MIN_WIDTH = 1024

interface PlaneSpottingBookingPromptProps {
  source?: string
}

function buildBookingHref(source: string, info?: PlaneSpottingWindowInfo | null) {
  const params = new URLSearchParams({ source })
  params.set('date', getLondonIsoDate())
  // Prefill the time with today's overhead window, so the booking matches what
  // the reader came for rather than dropping them on an empty form.
  const time = info ? getPlaneSpottingBookingTime(info.window) : undefined
  if (time) params.set('time', time)
  return `/book-table?${params.toString()}`
}

export function PlaneSpottingBookingPrompt({
  source = 'plane_spotting_prompt'
}: PlaneSpottingBookingPromptProps) {
  const [visible, setVisible] = useState(false)
  const [schedule, setSchedule] = useState<PlaneSpottingWindowInfo | null>(null)
  const triggeredRef = useRef(false)

  const markShown = useCallback((trigger: 'scroll' | 'exit_intent') => {
    if (triggeredRef.current) return
    triggeredRef.current = true

    const todaySchedule = getTodayPlaneSpottingWindow()
    setSchedule(todaySchedule)
    setVisible(true)

    try {
      window.sessionStorage.setItem(PLANE_SPOTTING_PROMPT_SESSION_KEY, 'true')
    } catch {
      // Ignore storage failures, the prompt still only shows once per page load.
    }

    pushToDataLayer({
      event: 'plane_spotting_prompt_shown',
      trigger,
      plane_spotting_window: todaySchedule.window,
      plane_spotting_label: todaySchedule.label,
    }, { sendToApi: true })
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    pushToDataLayer({
      event: 'plane_spotting_prompt_dismissed',
      source,
    }, { sendToApi: true })
  }, [source])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (window.sessionStorage.getItem(PLANE_SPOTTING_PROMPT_SESSION_KEY) === 'true') {
        return
      }
    } catch {
      // Continue without session suppression in restricted storage contexts.
    }

    const handleScroll = () => {
      if (triggeredRef.current) return

      const viewport = window.innerHeight
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      )
      const scrollable = Math.max(docHeight - viewport, 1)
      const progress = window.scrollY / scrollable

      if (progress >= SCROLL_PERCENT_THRESHOLD) {
        markShown('scroll')
        window.removeEventListener('scroll', handleScroll)
      }
    }

    const handleMouseLeave = (event: MouseEvent) => {
      if (triggeredRef.current) return
      if (window.innerWidth < DESKTOP_EXIT_INTENT_MIN_WIDTH) return
      if (event.clientY > 0) return

      markShown('exit_intent')
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [markShown])

  if (!visible || !schedule) {
    return null
  }

  const href = buildBookingHref(source, schedule)

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="plane-spotting-booking-prompt"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-md border border-line bg-surface text-ink shadow-lg"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-anchor-gold/10 text-accent-text">
          <Plane className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-ink-strong">Planning a spotting visit?</p>
          <p className="mt-1 text-ink-muted">
            Overhead arrivals {schedule.label}. {schedule.caveat}
          </p>
          <Link
            href={href}
            className="mt-3 inline-flex rounded-full bg-anchor-gold-dark px-4 py-2 text-sm font-semibold text-white hover:bg-anchor-green focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2"
            onClick={() => {
              pushToDataLayer({
                event: 'plane_spotting_prompt_cta_clicked',
                source,
                plane_spotting_window: schedule.window,
              }, { sendToApi: true })
              setVisible(false)
            }}
          >
            Book a Table
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss plane spotting booking prompt"
          className="rounded-sm p-1 text-ink-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default PlaneSpottingBookingPrompt
