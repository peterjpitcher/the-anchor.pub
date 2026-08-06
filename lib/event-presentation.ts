import type { Event } from '@/lib/api'
import {
  getEventBookingBlockReason,
  isEventBookingClosed,
  isEventInPast,
  normalizeEventStatus
} from '@/lib/event-lifecycle'

/**
 * Single source of truth for how an event page renders.
 *
 * Both the page (`app/events/[id]/page.tsx`) and the structured data
 * (`lib/structured-data/event-schema.ts`) resolve their conditionals from this
 * module. That is deliberate: before it existed, the page derived
 * `bookingFormSuppressed` locally and gated only three of nine booking-related
 * surfaces with it, so an ended event still rendered a booking policy card,
 * booking FAQs and a "Ready to book" CTA, while the JSON-LD advertised the
 * event as `InStock`. Any new booking surface must read its flag from here
 * rather than recomputing "is this event over" locally.
 */

export type EventPhase = 'upcoming' | 'ended' | 'cancelled'

/** How the facts strip presents itself: live booking facts vs historical record. */
export type EventFactsVariant = 'live' | 'historic'

export interface EventPresentation {
  phase: EventPhase
  /** True once the event date has passed, whatever its status. */
  hasEnded: boolean
  /** The online booking form itself. */
  showBookingForm: boolean
  /** The "Booking and payment" policy card. */
  showBookingPolicy: boolean
  /** Event FAQs, which are overwhelmingly booking questions. */
  showBookingFaqs: boolean
  /** The closing "Ready to book" band. */
  showBookingCtaBand: boolean
  /** Share button, which invites sharing a night nobody can attend. */
  showShareButton: boolean
  /** The "Status: Scheduled" row in the event information list. */
  showStatusRow: boolean
  factsVariant: EventFactsVariant
  /** Whether the JSON-LD should carry an `offers` object. */
  includeSchemaOffers: boolean
}

type EventPresentationSource = Pick<
  Event,
  | 'startDate'
  | 'event_status'
  | 'eventStatus'
  | 'bookings_enabled'
  | 'booking_cutoff_at'
>

export function getEventPhase(event: EventPresentationSource, now: number = Date.now()): EventPhase {
  if (normalizeEventStatus(event) === 'cancelled') return 'cancelled'
  if (isEventInPast(event, now)) return 'ended'
  return 'upcoming'
}

export function getEventPresentation(
  event: EventPresentationSource,
  now: number = Date.now()
): EventPresentation {
  const phase = getEventPhase(event, now)
  const hasEnded = isEventInPast(event, now)
  const isUpcoming = phase === 'upcoming'

  // A blocked or cutoff-closed upcoming event still shows its policy and FAQs,
  // because the visitor may yet book by phone. An ended or cancelled event
  // shows neither.
  const bookingBlocked =
    Boolean(getEventBookingBlockReason(event, now)) || isEventBookingClosed(event, now)

  return {
    phase,
    hasEnded,
    showBookingForm: isUpcoming && !bookingBlocked,
    showBookingPolicy: isUpcoming,
    showBookingFaqs: isUpcoming,
    showBookingCtaBand: isUpcoming,
    showShareButton: isUpcoming,
    // "Cancelled" is worth showing. "Scheduled" on a night that already
    // happened reads as though it is still going ahead.
    showStatusRow: phase !== 'ended',
    factsVariant: isUpcoming ? 'live' : 'historic',
    includeSchemaOffers: isUpcoming
  }
}
