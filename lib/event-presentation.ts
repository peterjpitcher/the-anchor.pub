import type { Event } from '@/lib/api'
import { isEventOver } from '@/lib/event-calendar'
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

/**
 * How the facts strip presents itself: live booking facts, the record of a
 * night that happened, or the plan for a night that did not.
 *
 * `did-not-run` exists because `historic` labels its facts "Took place",
 * "Entry was" and "Started", and the strip used that for anything that was not
 * upcoming. A cancelled night got all three under a banner saying it was
 * cancelled (site review finding C2-008).
 */
export type EventFactsVariant = 'live' | 'historic' | 'did-not-run'

export interface EventPresentation {
  phase: EventPhase
  /**
   * True once the event has FINISHED, whatever its status: after its end time,
   * not its start. A night that is under way has not ended.
   */
  hasEnded: boolean
  /**
   * True from the start time onwards. Between the start and the finish the
   * event is under way: it cannot be booked, but it has not "taken place".
   */
  hasStarted: boolean
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
  /**
   * The add-to-calendar control (Google Calendar link and .ics download).
   *
   * Upcoming only. A blocked or cutoff-closed event still offers it, because
   * the visitor can turn up or book by phone. A cancelled, postponed or ended
   * event never does: asking somebody to diarise a night that is not happening
   * is worse than offering nothing at all.
   */
  showAddToCalendar: boolean
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
> & { endDate?: string | null; duration?: string | null }

export function getEventPhase(event: EventPresentationSource, now: number = Date.now()): EventPhase {
  if (normalizeEventStatus(event) === 'cancelled') return 'cancelled'
  // Keyed to the finish, so a night that is under way is not called "ended".
  if (isEventOver(event, now)) return 'ended'
  return 'upcoming'
}

export function getEventPresentation(
  event: EventPresentationSource,
  now: number = Date.now()
): EventPresentation {
  const phase = getEventPhase(event, now)
  const hasEnded = isEventOver(event, now)
  const hasStarted = isEventInPast(event, now)
  const isUpcoming = phase === 'upcoming'
  // Everything that invites a booking or a diary entry stops at the START, as
  // it always has. Only the "this is over" presentation waits for the finish.
  const isBookable = isUpcoming && !hasStarted

  // A blocked or cutoff-closed upcoming event still shows its policy and FAQs,
  // because the visitor may yet book by phone. An ended or cancelled event
  // shows neither.
  const bookingBlocked =
    Boolean(getEventBookingBlockReason(event, now)) || isEventBookingClosed(event, now)

  // `getEventPhase` reports both postponed and rescheduled as upcoming, so the
  // calendar decision is made here on the raw status instead.
  //
  // Postponed: the listed date is precisely the night that is NOT going ahead,
  // so a calendar entry for it would be wrong the moment it was saved.
  // Rescheduled: `startDate` already carries the new date (schema.org keeps the
  // old one in `previousStartDate`), so the entry would be right.
  const status = normalizeEventStatus(event)

  return {
    phase,
    hasEnded,
    hasStarted,
    showBookingForm: isBookable && !bookingBlocked,
    showBookingPolicy: isBookable,
    showBookingFaqs: isBookable,
    showBookingCtaBand: isBookable,
    showShareButton: isUpcoming,
    // "Cancelled" is worth showing. "Scheduled" on a night that already
    // happened reads as though it is still going ahead.
    showStatusRow: phase !== 'ended',
    // Postponed and draft are both excluded for the same reason: the listed
    // startDate is not a night we have committed to. A saved diary entry would
    // be wrong the moment it is created, and unlike a booking it does not come
    // back to us to be corrected. Rescheduled stays true, because startDate
    // already carries the new date and schema.org keeps the old one in
    // previousStartDate. A draft cannot reach the detail page anyway, which
    // redirects at app/events/[id]/page.tsx:344, but the control also mounts on
    // category date cards, so the flag guards it rather than the route.
    showAddToCalendar: isBookable && status !== 'postponed' && status !== 'draft',
    // Cancelled at any date, and postponed once the listed date has gone: in
    // both cases the night on this page did not happen.
    factsVariant:
      phase === 'cancelled' || (status === 'postponed' && hasEnded)
        ? 'did-not-run'
        : isUpcoming
          ? 'live'
          : 'historic',
    includeSchemaOffers: isBookable
  }
}
