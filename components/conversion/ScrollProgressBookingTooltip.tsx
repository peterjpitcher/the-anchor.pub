'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { pushToDataLayer } from '@/lib/gtm-events'

const SCROLL_PERCENT_THRESHOLD = 0.7
const AUTO_DISMISS_MS = 5000
const SESSION_STORAGE_KEY = 'sunday_lunch_scroll_tooltip_shown'

/**
 * Shows a one-time tooltip in the bottom-right corner once the user has
 * scrolled past 70% of the page height. Auto-dismisses after 5s, on
 * close, or on outside click. Honours sessionStorage so it appears at
 * most once per session.
 */
export function ScrollProgressBookingTooltip() {
  const [visible, setVisible] = useState(false)
  const [allowRender, setAllowRender] = useState(false)
  const dismissedRef = useRef(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        return
      }
    } catch {
      // sessionStorage may be unavailable (e.g. privacy mode); fall through.
    }

    setAllowRender(true)

    const handleScroll = () => {
      if (dismissedRef.current) return

      const scrolled = window.scrollY
      const viewport = window.innerHeight
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      )
      const scrollable = Math.max(docHeight - viewport, 1)
      const progress = scrolled / scrollable

      if (progress >= SCROLL_PERCENT_THRESHOLD) {
        try {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
        } catch {
          // ignore
        }

        setVisible(true)
        pushToDataLayer({ event: 'scroll_tooltip_shown' })

        autoDismissTimerRef.current = setTimeout(() => {
          dismiss()
        }, AUTO_DISMISS_MS)

        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Run once in case the page is already scrolled past the threshold.
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current)
      }
    }
  }, [dismiss])

  // Tap-outside dismissal.
  useEffect(() => {
    if (!visible) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (tooltipRef.current && target && !tooltipRef.current.contains(target)) {
        dismiss()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [visible, dismiss])

  if (!allowRender || !visible) {
    return null
  }

  return (
    <div
      ref={tooltipRef}
      role="status"
      aria-live="polite"
      data-testid="scroll-progress-booking-tooltip"
      className="fixed right-4 bottom-20 z-30 max-w-xs rounded-md border border-line bg-surface text-ink shadow-lg lg:bottom-4 transition-opacity motion-reduce:transition-none"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-ink-strong">Ready to book?</p>
          <p className="mt-1 text-ink-muted">
            Sunday roast books up fast.
          </p>
          <Link
            href="/book-table?source=sunday_lunch_scroll_tooltip"
            className="mt-2 inline-flex items-center text-accent-text underline hover:text-accent focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark rounded-sm"
            onClick={() => dismiss()}
          >
            Book a table
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss booking tooltip"
          className="rounded-sm p-1 text-ink-muted hover:text-ink focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default ScrollProgressBookingTooltip
