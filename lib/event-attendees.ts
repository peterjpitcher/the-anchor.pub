import type { EventBookingQuestion } from './api/events'

export interface EventAttendee {
  id: string
  name: string
  ticket_type_id?: string | null
  answers: Record<string, string>
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
