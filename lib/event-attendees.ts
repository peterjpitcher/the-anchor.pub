import type { EventBookingQuestion } from './api/events'

/**
 * Shown under "Who is coming?" whenever a booking asks for each guest's details (BK-017,
 * customer bookings review of 24 October 2026). The booker is sharing other people's details,
 * and an answer can be health data such as an allergy. Owner decision D6: answers are deleted
 * 90 days after the event. The privacy policy (section 7) says the same.
 */
export const GUEST_DETAILS_PRIVACY_LINE =
  "Only add people who are happy to share these details with us. We use their answers for this event only, and delete them 90 days after it."

/** The booker's confirmation, recorded against each guest with the time it was saved (BK-017). */
export const GUEST_DETAILS_CONFIRM_LABEL = "Everyone I've added is happy to share these details."
export const GUEST_DETAILS_CONFIRM_ERROR = "Please confirm everyone you've added is happy to share these details."

/**
 * Whether the form asks for each ticket's name and answers. The management app sends the answer
 * (guest_details_required, from the event's own setting). The fallback is the old rule, for an
 * event read before the management app sent it; it never asks for less than that rule did.
 */
export function eventCollectsGuestDetails(event: { guest_details_required?: boolean; booking_questions?: unknown[] }, fallback: { takesPayment: boolean; prepaid: boolean }): boolean {
  if (typeof event.guest_details_required === 'boolean') return event.guest_details_required
  return fallback.takesPayment && (fallback.prepaid || (event.booking_questions?.length ?? 0) > 0)
}

export interface EventAttendee {
  id: string
  name: string
  ticket_type_id?: string | null
  answers: Record<string, string>
  /** Sent only as true, when the booker ticked the confirmation (BK-017). */
  details_confirmed?: true
}

/** Keep each person's identity and answers attached to their ticket. */
export function reconcileAttendees(previous: EventAttendee[], slots: (string | null)[], createId: () => string): EventAttendee[] {
  const remaining = [...previous]
  const matched = slots.map(ticketTypeId => {
    const index = remaining.findIndex(person => (person.ticket_type_id ?? null) === ticketTypeId)
    return index >= 0 ? remaining.splice(index, 1)[0] : null
  })
  return slots.map((ticketTypeId, index) => {
    const person = matched[index] ?? remaining.shift()
    return person ? { ...person, ticket_type_id: ticketTypeId } : { id: createId(), name: '', ticket_type_id: ticketTypeId, answers: {} }
  })
}

export function validateEventAttendees(attendees: EventAttendee[], seats: number, questions: EventBookingQuestion[]): string | null {
  if (attendees.length !== seats) return 'Please enter details for every ticket.'
  for (const [index, person] of attendees.entries()) {
    if (!person.name.trim() || person.name.trim().length > 120) return `Please enter a name for ticket ${index + 1} (up to 120 characters).`
    for (const question of questions) {
      const answer = person.answers[question.id]?.trim() ?? ''
      if (question.required && !answer) return `Ticket ${index + 1}: please answer “${question.label}”.`
      if (answer.length > 2000) return `Ticket ${index + 1}: please shorten your answer to 2,000 characters.`
      if (answer && question.type === 'yes_no' && !['yes', 'no'].includes(answer)) return 'Please choose yes or no.'
      if (answer && question.type === 'choice' && !question.options?.includes(answer)) return 'Please select one of the available answers.'
    }
  }
  return null
}
