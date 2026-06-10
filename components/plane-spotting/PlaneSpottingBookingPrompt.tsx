'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plane, X } from 'lucide-react'
import { pushToDataLayer } from '@/lib/gtm-events'
import {
  getLondonIsoDate,
  getTodayPlaneSpottingWindow,
  type PlaneSpottingWindowInfo,
} from '@/lib/heathrow-runway-alternation'

export const PLANE_SPOTTING_PROMPT_SESSION_KEY = 'plane_spotting_booking_prompt_shown'

const SCROLL_PERCENT_THRESHOLD = 0.55
const DESKTOP_EXIT_INTENT_MIN_WIDTH = 1024

interface PlaneSpottingBookingPromptProps {
  source?: string
}

function buildBookingHref(source: string) {
  const params = new URLSearchParams({ source })
  params.set('date', getLondonIsoDate())
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
    })
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    pushToDataLayer({
      event: 'plane_spotting_prompt_dismissed',
      source,
    })
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

  const href = buildBookingHref(source)

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="plane-spotting-booking-prompt"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg border border-anchor-gold-dark/25 bg-anchor-green-card text-anchor-cream-text shadow-lg"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-anchor-gold-dark/10 text-anchor-gold-bright">
          <Plane className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-anchor-gold-bright">Planning a spotting visit?</p>
          <p className="mt-1 text-anchor-cream-text/80">
            Overhead arrivals {schedule.label}. {schedule.caveat}
          </p>
          <Link
            href={href}
            className="mt-3 inline-flex rounded-full bg-anchor-gold-dark px-4 py-2 text-sm font-semibold text-white hover:bg-anchor-gold focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2"
            onClick={() => {
              pushToDataLayer({
                event: 'plane_spotting_prompt_cta_clicked',
                source,
                plane_spotting_window: schedule.window,
              })
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
          className="rounded-sm p-1 text-anchor-cream-text/70 hover:text-anchor-cream-text focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default PlaneSpottingBookingPrompt
