import { mapSpecialHoursToEvents } from '@/components/FilteredUpcomingEvents'
import type { BusinessHours } from '@/lib/api'

const BASE_DATE = new Date('2024-01-01T12:00:00Z')

function dateOffset(days: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildRegularHours(): BusinessHours['regularHours'] {
  return {
    monday: { opens: '00:00', closes: '00:00', is_closed: true },
    tuesday: { opens: '16:00', closes: '22:00', is_closed: false },
    wednesday: { opens: '16:00', closes: '22:00', is_closed: false },
    thursday: { opens: '16:00', closes: '22:00', is_closed: false },
    friday: { opens: '16:00', closes: '23:00', is_closed: false },
    saturday: { opens: '12:00', closes: '23:00', is_closed: false },
    sunday: { opens: '12:00', closes: '21:00', is_closed: false }
  }
}

function buildHours(specialHours: BusinessHours['specialHours']): BusinessHours {
  return {
    regularHours: buildRegularHours(),
    specialHours,
    currentStatus: {
      isOpen: false,
      kitchenOpen: false,
      closesIn: null,
      opensIn: null
    }
  }
}

describe('mapSpecialHoursToEvents', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(BASE_DATE)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('includes special hours within the next 30 days', () => {
    const hours = buildHours([
      { date: dateOffset(5), opens: '10:00', closes: '20:00', is_closed: false, reason: 'Test' }
    ])

    const events = mapSpecialHoursToEvents(hours)
    expect(events).toHaveLength(1)
    expect(events[0].slug).toBe(`opening-hours-${dateOffset(5)}`)
  })

  it('excludes special hours beyond 30 days', () => {
    const hours = buildHours([
      { date: dateOffset(40), opens: '10:00', closes: '20:00', is_closed: false, reason: 'Late' }
    ])

    const events = mapSpecialHoursToEvents(hours)
    expect(events).toHaveLength(0)
  })

  it('keeps each special hour ungrouped per date', () => {
    const first = dateOffset(2)
    const second = dateOffset(3)
    const hours = buildHours([
      { date: first, opens: '12:00', closes: '18:00', is_closed: false, status: 'modified' },
      { date: second, opens: '12:00', closes: '18:00', is_closed: false, status: 'modified' }
    ])

    const events = mapSpecialHoursToEvents(hours)
    expect(events.map(e => e.slug)).toEqual([`opening-hours-${first}`, `opening-hours-${second}`])
  })
})
