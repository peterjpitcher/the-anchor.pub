'use client'

import { useEffect, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/overlays/Modal'
import { BookTableButton } from '@/components/BookTableButton'
import { pushToDataLayer } from '@/lib/gtm-events'
import { getSundayRoastContent, SUNDAY_ROAST } from '@/lib/sunday-roast'

const SESSION_DISMISS_KEY = 'sunday_lunch_booking_prompt_dismissed'
const DEFAULT_DELAY_MS = 15_000
const PROMPT_ID = 'sunday_lunch_timed'

export interface TimedBookingPromptProps {
  /**
   * Override the auto-trigger delay. Mainly useful for tests; production
   * pages should leave the default (15s).
   */
  delayMs?: number
  /**
   * Override the analytics prompt id, keeps the prompt reusable on
   * other pages later without the events colliding.
   */
  promptId?: string
}

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true'
  } catch {
    // sessionStorage can throw in private browsing, treat as not-dismissed
    // so the user still sees the prompt at most once per page load.
    return false
  }
}

function writeDismissed(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, 'true')
  } catch {
    // ignore, see readDismissed
  }
}

/**
 * Auto-fires a booking prompt 15 seconds into the page view.
 *
 * - One shot per session: dismissal (close, backdrop, escape, or CTA click)
 *   stores a sessionStorage flag and no further prompts fire on subsequent
 *   page views in the same tab/session.
 * - Tracks `booking_prompt_open`, `booking_prompt_dismiss`, `booking_prompt_cta`
 *   so we can measure how often the prompt converts vs. annoys.
 * - Uses the shared {@link Modal} primitive, focus trap, Escape, backdrop
 *   click, scroll lock all come for free.
 *
 * Replaces the per-dish click-to-lightbox feature. The brief was always to
 * gently nudge a booking after the user has had time to read the menu, not
 * to gate dish details behind a click.
 */
export function TimedBookingPrompt({
  delayMs = DEFAULT_DELAY_MS,
  promptId = PROMPT_ID,
}: TimedBookingPromptProps = {}) {
  const [open, setOpen] = useState(false)
  const sunday = getSundayRoastContent()

  useEffect(() => {
    if (readDismissed()) return

    const timer = window.setTimeout(() => {
      // Re-check at fire time, protects against the (unlikely) race where
      // another tab dismissed the prompt while ours was waiting.
      if (readDismissed()) return
      setOpen(true)
      pushToDataLayer({
        event: 'booking_prompt_open',
        prompt_id: promptId,
      })
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [delayMs, promptId])

  function dismiss(reason: 'close' | 'cta') {
    writeDismissed()
    setOpen(false)
    pushToDataLayer({
      event: reason === 'cta' ? 'booking_prompt_cta' : 'booking_prompt_dismiss',
      prompt_id: promptId,
      dismiss_reason: reason,
    })
  }

  return (
    <Modal
      open={open}
      onClose={() => dismiss('close')}
      title="Save your Sunday roast table"
      size="md"
      backdrop="blur"
      id={`prompt_${promptId}`}
    >
      <ModalHeader>
        <ModalTitle id="modal-title">Save your Sunday roast table</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p className="text-base text-anchor-cream-text/85 leading-relaxed">
          {sunday.isLive
            ? 'Sundays book up fast at The Anchor. We are 7 minutes from Heathrow Terminal 5. Walk-ins are welcome 1pm to 6pm, but a quick booking guarantees your table.'
            : `${sunday.availabilityLong} We are 7 minutes from Heathrow Terminal 5, and booking ahead is recommended for launch Sundays.`}
        </p>
        <p className="mt-3 text-sm text-anchor-cream-text/65 leading-relaxed">
          Larger group? Parties of ten or more take a £10-per-person deposit
          on booking, fully deducted from the bill on the day.
        </p>
      </ModalBody>
      <ModalFooter>
        <BookTableButton
          source="sunday_lunch_timed_prompt"
          context="sunday_roast"
          customHref={SUNDAY_ROAST.bookingHref}
          variant="primary"
          size="md"
          onClickAfterTracking={() => dismiss('cta')}
        >
          Book Sunday Roast
        </BookTableButton>
      </ModalFooter>
    </Modal>
  )
}

export default TimedBookingPrompt
