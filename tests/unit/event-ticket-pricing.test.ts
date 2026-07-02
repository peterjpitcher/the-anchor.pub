import {
  getEventTicketTypes,
  getLowestTicketTypePrice,
  hasMultipleTicketPrices,
  type Event,
  type EventTicketType,
} from '@/lib/api'
import { getEventPriceLabel } from '@/lib/event-pricing'
import { getEventTicketPrice, getEventUnitPrice } from '@/lib/event-booking-experience'

function ticketType(overrides: Partial<EventTicketType> & Pick<EventTicketType, 'id' | 'price'>): EventTicketType {
  return {
    name: overrides.name ?? overrides.id,
    sort_order: overrides.sort_order ?? 0,
    ...overrides,
  }
}

const MULTI = {
  name: 'Cabaret Night',
  ticket_types: [
    ticketType({ id: 'vip', name: 'VIP', price: 25, sort_order: 2 }),
    ticketType({ id: 'adult', name: 'Adult', price: 12, sort_order: 0 }),
    ticketType({ id: 'child', name: 'Child', price: 6, sort_order: 1 }),
  ],
} as Partial<Event>

describe('ticket-type accessors', () => {
  it('reads and orders types from snake_case ticket_types', () => {
    const types = getEventTicketTypes(MULTI as Event)
    expect(types.map((t) => t.id)).toEqual(['adult', 'child', 'vip'])
  })

  it('reads types from camelCase ticketTypes too', () => {
    const event = { ticketTypes: [ticketType({ id: 'a', price: 5 }), ticketType({ id: 'b', price: 8 })] }
    expect(getEventTicketTypes(event as Event).map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('detects multiple differing prices', () => {
    expect(hasMultipleTicketPrices(MULTI as Event)).toBe(true)
  })

  it('treats a single type as single-price', () => {
    const event = { ticket_types: [ticketType({ id: 'only', price: 10 })] } as Partial<Event>
    expect(hasMultipleTicketPrices(event as Event)).toBe(false)
  })

  it('treats several identically-priced types as single-price', () => {
    const event = {
      ticket_types: [ticketType({ id: 'a', price: 10 }), ticketType({ id: 'b', price: 10 })],
    } as Partial<Event>
    expect(hasMultipleTicketPrices(event as Event)).toBe(false)
  })

  it('returns the lowest active price', () => {
    expect(getLowestTicketTypePrice(MULTI as Event)).toBe(6)
  })
})

describe('multi-type price display', () => {
  it('labels a multi-type event "from £X"', () => {
    expect(getEventPriceLabel(MULTI as Event)).toBe('from £6')
  })

  it('surfaces the lowest type price as the ticket/unit price', () => {
    expect(getEventTicketPrice(MULTI as Event)).toBe(6)
    expect(getEventUnitPrice(MULTI as Event)).toBe(6)
  })

  it('leaves single-price events on the existing label path', () => {
    const single = {
      name: 'Quiz Night',
      payment_mode: 'cash_only',
      price_per_seat: 3,
    } as Partial<Event>
    expect(getEventPriceLabel(single as Event)).toBe('£3')
  })
})
