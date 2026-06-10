'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/overlays/Modal'
import { pushToDataLayer } from '@/lib/gtm-events'

const SESSION_STORAGE_KEY = 'sunday_lunch_exit_intent_shown'
const DESKTOP_MIN_WIDTH = 1024

/**
 * Desktop-only exit-intent modal for the /sunday-lunch page.
 *
 * - Triggers once per session when the cursor leaves the top of the viewport.
 * - Mobile users see the sticky CTA instead, so we suppress on viewports < 1024px.
 * - Closes on Escape, backdrop click, or "No thanks". Tracks the full
 *   shown/dismissed/cta-clicked funnel via dataLayer events.
 */
export function ExitIntentBookingModal() {
  const [open, setOpen] = useState(false)

  const close = useCallback((reason: 'dismissed' | 'cta_clicked') => {
    setOpen((current) => {
      if (!current) return current
      pushToDataLayer({
        event:
          reason === 'cta_clicked'
            ? 'exit_intent_modal_cta_clicked'
            : 'exit_intent_modal_dismissed',
      })
      return false
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Mobile: bail out, the sticky bar handles the same job.
    if (window.innerWidth < DESKTOP_MIN_WIDTH) return

    try {
      if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true') {
        return
      }
    } catch {
      // Ignore storage errors and continue (modal will still respect once-per-load below).
    }

    let triggered = false

    const handleMouseLeave = (event: MouseEvent) => {
      if (triggered) return
      if (event.clientY > 0) return

      triggered = true
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
      } catch {
        // ignore
      }

      setOpen(true)
      pushToDataLayer({ event: 'exit_intent_modal_shown' })
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <Modal
      open={open}
      onClose={() => close('dismissed')}
      title="Before you go"
      size="md"
      backdrop="blur"
      id="exit_intent_modal"
    >
      <ModalHeader>
        <ModalTitle id="modal-title" className="text-2xl">
          Before you go
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p className="text-base text-anchor-cream-text/90 leading-relaxed">
          Sunday roast books up fast, want to grab a table while you&apos;re here?
        </p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={() => close('dismissed')}
          className="rounded-md border border-anchor-gold-dark/40 bg-transparent px-4 py-2 text-sm text-anchor-cream-text hover:bg-anchor-green-raised focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark"
        >
          No thanks
        </button>
        <Link
          href="/book-table?source=sunday_lunch_exit_intent"
          onClick={() => close('cta_clicked')}
          className="inline-flex items-center justify-center rounded-md bg-anchor-gold-bright px-4 py-2 text-sm font-semibold text-anchor-charcoal hover:bg-anchor-gold-bright focus:outline-none focus:ring-2 focus:ring-anchor-gold-dark focus:ring-offset-2"
        >
          Book a table
        </Link>
      </ModalFooter>
    </Modal>
  )
}

export default ExitIntentBookingModal
