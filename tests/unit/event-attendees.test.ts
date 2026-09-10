import { reconcileAttendees, validateEventAttendees } from '@/lib/event-attendees'

const alice = { id: 'alice', name: 'Alice', ticket_type_id: 'adult', answers: { question: 'no' } }
const bob = { id: 'bob', name: 'Bob', ticket_type_id: 'child', answers: {} }
it('preserves remaining people when a different ticket type is removed', () => {
  expect(reconcileAttendees([alice, bob], ['child'], () => 'new')).toEqual([bob])
})
it('keeps identity and answers when a ticket changes type', () => {
  expect(reconcileAttendees([alice], ['child'], () => 'new')).toEqual([{ ...alice, ticket_type_id: 'child' }])
})
it('requires every person and required answer', () => {
  const questions = [{ id: 'question', label: 'Any requirements?', type: 'yes_no' as const, required: true }]
  expect(validateEventAttendees([alice], 2, questions)).toBeTruthy()
  expect(validateEventAttendees([bob], 1, questions)).toBeTruthy()
  expect(validateEventAttendees([alice], 1, questions)).toBeNull()
})

import { getEventUnitPrice, getEventOnlineSaving } from '@/lib/event-booking-experience'
import { getEventTicketTypes } from '@/lib/api/events'
it('ends the online saving at the deadline and shows the base price', () => {
  const event = { price: 15, ticket_price: 20, online_discount_type: 'fixed', online_discount_value: 5, online_discount_ends_at: '2000-01-01T00:00:00Z' }
  expect(getEventUnitPrice(event)).toBe(20)
  expect(getEventOnlineSaving(event)).toBe(0)
  expect(getEventTicketTypes({ ...event, ticket_types: [{ id: 'type', name: 'Standard', price: 15, base_price: 20, sort_order: 0 }] })[0].price).toBe(20)
})
