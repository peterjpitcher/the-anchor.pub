'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { currentPagePath, floatingLayers } from '@/lib/floating-layers'
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
  const releaseLayerRef = useRef<(() => void) | null>(null)

  const close = useCallback((reason: 'dismissed' | 'cta_clicked') => {
    releaseLayerRef.current?.()
    releaseLayerRef.current = null
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

  useEffect(() => () => {
    releaseLayerRef.current?.()
    releaseLayerRef.current = null
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

      // One floating layer at a time, one timed pop-up per page view
      // (lib/floating-layers.ts). Refused while the cookie banner is
      // unanswered or a dialog is open, or when this page view has already had
      // a pop-up. A refusal marks nothing as shown, so it can still open later.
      const release = floatingLayers.claimTimedPopup(currentPagePath())
      if (!release) return
      releaseLayerRef.current = release

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
        <p className="text-base text-ink leading-relaxed">
          Want to grab a table while you&apos;re here?
        </p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={() => close('dismissed')}
          className="rounded-md border border-line-strong bg-transparent px-4 py-2 text-sm text-ink hover:bg-surface-sunk focus:outline-none focus:ring-2 focus:ring-accent-text"
        >
          No thanks
        </button>
        <Link
          href="/book-table?source=sunday_lunch_exit_intent"
          onClick={() => close('cta_clicked')}
          className="inline-flex items-center justify-center rounded-md bg-anchor-gold-dark px-4 py-2 text-sm font-semibold text-white hover:bg-anchor-green focus:outline-none focus:ring-2 focus:ring-accent-text focus:ring-offset-2"
        >
          Book a table
        </Link>
      </ModalFooter>
    </Modal>
  )
}

export default ExitIntentBookingModal
