import type { EventTicketType } from '@/lib/api'
import {
  areSelectionNamesComplete,
  buildTicketSelections,
  getMaxForType,
  getSelectionBreakdown,
  getSharedRemaining,
  getTotalSeats,
  isSelectionOverCapacity,
} from '@/lib/event-ticket-selection'

function type(overrides: Partial<EventTicketType> & Pick<EventTicketType, 'id'>): EventTicketType {
  return {
    name: overrides.name ?? overrides.id,
    price: overrides.price ?? 10,
    sort_order: overrides.sort_order ?? 0,
    capacity: overrides.capacity,
    remaining: overrides.remaining,
    description: overrides.description,
    ...overrides,
  }
}

describe('event-ticket-selection helpers', () => {
  it('sums selected seats across types', () => {
    expect(getTotalSeats({ a: 2, b: 3, c: 0 })).toBe(5)
  })

  it('caps a dedicated type at its own remaining', () => {
    const adult = type({ id: 'adult', capacity: 50, remaining: 4 })
    expect(getMaxForType(adult, [adult], {})).toBe(4)
  })

  it('shares one pool across shared-capacity types', () => {
    const adult = type({ id: 'adult', capacity: null, remaining: 6 })
    const child = type({ id: 'child', capacity: null, remaining: 6 })
    const types = [adult, child]

    expect(getSharedRemaining(types)).toBe(6)
    // With 4 adult already chosen, only 2 shared seats remain for child.
    expect(getMaxForType(child, types, { adult: 4 })).toBe(2)
  })

  it('flags an over-capacity dedicated selection', () => {
    const adult = type({ id: 'adult', capacity: 50, remaining: 2 })
    expect(isSelectionOverCapacity([adult], { adult: 3 })).toBe(true)
    expect(isSelectionOverCapacity([adult], { adult: 2 })).toBe(false)
  })

  it('flags an over-capacity shared pool', () => {
    const adult = type({ id: 'adult', capacity: null, remaining: 5 })
    const child = type({ id: 'child', capacity: null, remaining: 5 })
    expect(isSelectionOverCapacity([adult, child], { adult: 3, child: 3 })).toBe(true)
    expect(isSelectionOverCapacity([adult, child], { adult: 3, child: 2 })).toBe(false)
  })

  it('computes a per-line price breakdown and total', () => {
    const adult = type({ id: 'adult', name: 'Adult', price: 12 })
    const child = type({ id: 'child', name: 'Child', price: 6 })
    const { lines, total } = getSelectionBreakdown([adult, child], { adult: 2, child: 1 })

    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatchObject({ quantity: 2, lineTotal: 24 })
    expect(lines[1]).toMatchObject({ quantity: 1, lineTotal: 6 })
    expect(total).toBe(30)
  })

  it('builds ticket_selections with per-line names, dropping zero-quantity lines', () => {
    const adult = type({ id: 'adult', name: 'Adult', price: 12 })
    const child = type({ id: 'child', name: 'Child', price: 6 })
    const selections = buildTicketSelections([adult, child], {
      quantities: { adult: 2, child: 0 },
      attendeeNames: { adult: [' Alice ', 'Bob'] },
    })

    expect(selections).toEqual([
      { ticket_type_id: 'adult', quantity: 2, attendee_names: ['Alice', 'Bob'] },
    ])
  })

  it('reports names complete only when every seat is named', () => {
    const adult = type({ id: 'adult', name: 'Adult', price: 12 })
    const state = { quantities: { adult: 2 }, attendeeNames: { adult: ['Alice', ''] } }
    expect(areSelectionNamesComplete([adult], state)).toBe(false)

    const complete = { quantities: { adult: 2 }, attendeeNames: { adult: ['Alice', 'Bob'] } }
    expect(areSelectionNamesComplete([adult], complete)).toBe(true)
  })
})
