'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Card, CardBody } from '@/components/ui/layout/Card'
import { Button } from '@/components/ui/primitives/Button'
import { ManagementEventBookingForm } from '@/components/features/EventBooking/ManagementEventBookingForm'
import { PhoneLink } from '@/components/PhoneLink'
import { useFocusOnChange } from '@/hooks/useFocusOnChange'
import { CONTACT } from '@/lib/constants'
import type { Event } from '@/lib/api'
import { getEventBookingActionLabel, getEventBookingAnchorHref } from '@/lib/event-booking-experience'
import { formatDateForDisplay } from '@/lib/table-booking/formatting'
import {
  formatEventTimeLabel,
  getLondonIsoDate,
  type SuggestedEvent,
} from '@/lib/table-booking/suggested-events'

/**
 * Booking an event chosen from the "events on this date" panel on /book-table.
 *
 * The suggestion carries only enough to draw its card: name, date, a price
 * label and a seat count. The booking form needs the whole event, because the
 * price, the payment mode, the booking mode, the ticket types and the guest
 * questions decide what it asks for and what it says. Handed the slim card it
 * showed no price or total, promised a table on shared-seating and standing
 * nights, told cash-on-the-door guests "the next step will explain" a payment
 * that never comes, and sent a paid night with questions to AMS without the
 * answers, which refused it (review BK-099). So the full event is fetched
 * first, fresh, and the form only appears once it has arrived.
 *
 * If the event cannot be loaded the guest is never given a form that might
 * say the wrong thing: they get the event's own page, which loads it on the
 * server, and the phone number.
 */

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; event: Event }
  | { status: 'failed' }

/**
 * The full event, through the website's own proxy and never from a cache: the
 * price and the questions must be the ones AMS will check the booking against.
 * Throws when the answer is not this event.
 */
export async function fetchSuggestedEventDetails(eventId: string, signal?: AbortSignal): Promise<Event> {
  const response = await fetch(`/api/events/${encodeURIComponent(eventId)}`, { cache: 'no-store', signal })
  const body = await response.json()
  if (!response.ok || body?.success !== true || body?.data?.id !== eventId) {
    throw new Error('Event details unavailable')
  }
  return body.data as Event
}

interface SuggestedEventBookingProps {
  suggestion: SuggestedEvent
  onBack: () => void
}

export function SuggestedEventBooking({ suggestion, onBack }: SuggestedEventBookingProps) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })

  // "Book this event" goes with the table booking it sat in, so focus moves to
  // this screen's heading and a screen reader says where the guest now is.
  const headingRef = useRef<HTMLHeadingElement>(null)
  useFocusOnChange(headingRef, suggestion.id, { onMount: true })

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    setLoad({ status: 'loading' })

    fetchSuggestedEventDetails(suggestion.id, controller.signal)
      .then((event) => {
        if (!cancelled) setLoad({ status: 'ready', event })
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: 'failed' })
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [suggestion.id])

  const eventDate = getLondonIsoDate(suggestion.startDate)
  const eventDateLabel = eventDate ? formatDateForDisplay(eventDate) : 'Date TBC'
  const eventTimeLabel = formatEventTimeLabel(suggestion.startDate)
  const eventPageHref = getEventBookingAnchorHref({
    id: suggestion.id,
    slug: suggestion.slug ?? undefined
  })

  return (
    <div className="mx-auto space-y-4">
      <Card accent>
        <CardBody className="space-y-3 p-6">
          <h3 ref={headingRef} tabIndex={-1} className="font-display text-h4 text-ink-strong">
            Event booking
          </h3>
          <p className="text-sm text-ink-muted">
            You&apos;re booking <strong className="text-ink-strong">{suggestion.name}</strong> on{' '}
            <strong className="text-ink-strong">{eventDateLabel}</strong> at{' '}
            <strong className="text-ink-strong">{eventTimeLabel}</strong>.
          </p>
          <p className="text-sm text-ink-muted">
            Complete your event booking below without leaving this page.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto min-h-12"
            onClick={onBack}
          >
            Back to table booking
          </Button>
        </CardBody>
      </Card>

      {/* Mounted from the start and only its text changes, so a screen reader
          hears the wait begin. */}
      <p role="status" className={load.status === 'loading' ? 'text-sm text-ink-muted' : 'sr-only'}>
        {load.status === 'loading' ? 'Getting the latest details for this event...' : ''}
      </p>

      {load.status === 'ready' ? (
        <ManagementEventBookingForm
          key={load.event.id}
          event={load.event}
          title={getEventBookingActionLabel(load.event)}
          compact
        />
      ) : null}

      {load.status === 'failed' ? (
        <Card>
          <CardBody className="space-y-3 p-6 text-sm text-ink">
            <p className="font-semibold text-ink-strong">We could not load this event just now</p>
            <p>
              You can book it on the event page, or call us on{' '}
              <PhoneLink
                phone={CONTACT.phone}
                source="table_booking_suggested_event_unavailable"
                showIcon={false}
                className="font-semibold underline"
              >
                01753 682707
              </PhoneLink>{' '}
              and we will book you in.
            </p>
            <Button asChild variant="primary" className="w-full sm:w-auto min-h-12">
              <Link href={eventPageHref}>Book on the event page</Link>
            </Button>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
