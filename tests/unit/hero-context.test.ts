import {
  getTodaysActiveEvents,
  isSundayLunchAvailableNow,
  resolveHeroContext,
  resolveHeroCtas,
  normaliseRouteToSource,
  formatTime12h,
  truncate,
  getLondonDateStr,
  getLondonDayName,
  MAX_CTA_LABEL_LENGTH,
  MAX_EVENT_NAME_LENGTH,
  PHONE_NUMBER,
} from '@/lib/hero-context'
import type { HeroContext } from '@/lib/hero-context'

// Mock getEventDateRangeUtc via the module it lives in
jest.mock('@/lib/event-calendar', () => ({
  ...jest.requireActual('@/lib/event-calendar'),
  getEventDateRangeUtc: jest.fn((event: any) => {
    const start = new Date(event.startDate)
    const end = event.endDate
      ? new Date(event.endDate)
      : new Date(start.getTime() + 4 * 60 * 60 * 1000) // 4h default
    return { start, end }
  })
}))

function makeEvent(overrides: Partial<any> = {}): any {
  return {
    id: 'evt-1',
    name: 'Music Bingo',
    slug: 'music-bingo-2026-05-08',
    startDate: '2026-05-08T20:00:00Z',
    endDate: null,
    duration: null,
    ...overrides
  }
}

function makeBusinessHours(overrides: Partial<any> = {}): any {
  return {
    regularHours: {
      sunday: {
        opens: '12:00:00',
        closes: '22:00:00',
        kitchen: { opens: '13:00:00', closes: '18:00:00' },
        is_closed: false,
        is_kitchen_closed: false,
        schedule_config: [
          { starts_at: '13:00', ends_at: '18:00', booking_type: 'sunday_lunch', capacity: 50 }
        ]
      }
    },
    specialHours: [],
    serviceStatus: {},
    serviceOverrides: {},
    currentStatus: { isOpen: true, kitchenOpen: true, closesIn: null, opensIn: null },
    ...overrides
  }
}

// --- Helpers ---

describe('formatTime12h', () => {
  it('should format 22:00:00 as 10pm', () => {
    expect(formatTime12h('22:00:00')).toBe('10pm')
  })

  it('should format 16:30:00 with minutes', () => {
    expect(formatTime12h('16:30:00')).toBe('4:30pm')
  })

  it('should format midnight as 12am', () => {
    expect(formatTime12h('00:00:00')).toBe('12am')
  })

  it('should return null for null input', () => {
    expect(formatTime12h(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(formatTime12h(undefined)).toBeNull()
  })
})

describe('truncate', () => {
  it('should not truncate short text', () => {
    expect(truncate('Hello', 20)).toBe('Hello')
  })

  it('should truncate long text with ellipsis', () => {
    const result = truncate('Super Mega Bingo Extravaganza Night', 20)
    expect(result.length).toBeLessThanOrEqual(20)
    expect(result).toContain('…')
  })
})

describe('normaliseRouteToSource', () => {
  it('should normalise /food-menu', () => {
    expect(normaliseRouteToSource('/food-menu')).toBe('smart_hero_food_menu')
  })

  it('should normalise homepage', () => {
    expect(normaliseRouteToSource('/')).toBe('smart_hero_home')
  })

  it('should normalise dynamic segments', () => {
    expect(normaliseRouteToSource('/events/[id]')).toBe('smart_hero_events_detail')
  })
})

describe('getLondonDateStr', () => {
  it('should return date in en-CA format', () => {
    const result = getLondonDateStr(new Date('2026-05-08T12:00:00Z'))
    expect(result).toBe('2026-05-08')
  })
})

describe('getLondonDayName', () => {
  it('should return lowercase day name', () => {
    // 8 May 2026 is a Friday
    const result = getLondonDayName(new Date('2026-05-08T12:00:00Z'))
    expect(result).toBe('friday')
  })
})

// --- getTodaysActiveEvents ---

describe('getTodaysActiveEvents', () => {
  it('should return events starting later today', () => {
    // Friday 8 May 2026, 6pm London (5pm UTC in BST)
    const now = new Date('2026-05-08T17:00:00Z')
    const events = [makeEvent({ startDate: '2026-05-08T19:00:00Z' })]
    const result = getTodaysActiveEvents(events, now)
    expect(result).toHaveLength(1)
  })

  it('should return events currently in progress', () => {
    // Event started at 8pm, now is 9pm
    const now = new Date('2026-05-08T21:00:00Z')
    const events = [makeEvent({
      startDate: '2026-05-08T19:00:00Z',
      endDate: '2026-05-08T23:00:00Z'
    })]
    const result = getTodaysActiveEvents(events, now)
    expect(result).toHaveLength(1)
  })

  it('should exclude events that have ended', () => {
    // Event ended at 11pm, now is 11:30pm
    const now = new Date('2026-05-08T22:30:00Z')
    const events = [makeEvent({
      startDate: '2026-05-08T19:00:00Z',
      endDate: '2026-05-08T22:00:00Z'
    })]
    const result = getTodaysActiveEvents(events, now)
    expect(result).toHaveLength(0)
  })

  it('should exclude events from different days', () => {
    // Now is Saturday, event is Friday
    const now = new Date('2026-05-09T10:00:00Z')
    const events = [makeEvent({ startDate: '2026-05-08T19:00:00Z' })]
    const result = getTodaysActiveEvents(events, now)
    expect(result).toHaveLength(0)
  })

  it('should use 4-hour fallback when no end time', () => {
    // Event started at 7pm, 4h fallback = 11pm, now is 10pm → still active
    const now = new Date('2026-05-08T21:00:00Z')
    const events = [makeEvent({ startDate: '2026-05-08T19:00:00Z' })]
    const result = getTodaysActiveEvents(events, now)
    expect(result).toHaveLength(1)
  })

  it('should sort by start time', () => {
    const now = new Date('2026-05-08T17:00:00Z')
    const events = [
      makeEvent({ id: 'late', startDate: '2026-05-08T21:00:00Z' }),
      makeEvent({ id: 'early', startDate: '2026-05-08T19:00:00Z' })
    ]
    const result = getTodaysActiveEvents(events, now)
    expect(result[0].id).toBe('early')
    expect(result[1].id).toBe('late')
  })

  it('should return empty array for empty input', () => {
    const now = new Date('2026-05-08T17:00:00Z')
    expect(getTodaysActiveEvents([], now)).toHaveLength(0)
  })
})

// --- isSundayLunchAvailableNow ---

describe('isSundayLunchAvailableNow', () => {
  it('should return true on Sunday before cutoff with sunday_lunch in schedule', () => {
    // Sunday 2pm London (1pm UTC in BST)
    const now = new Date('2026-05-10T13:00:00Z')
    expect(isSundayLunchAvailableNow(makeBusinessHours(), now)).toBe(true)
  })

  it('should return false on a non-Sunday', () => {
    // Monday
    const now = new Date('2026-05-11T13:00:00Z')
    expect(isSundayLunchAvailableNow(makeBusinessHours(), now)).toBe(false)
  })

  it('should return false on Sunday after last slot ends_at', () => {
    // Sunday 7pm London (6pm UTC in BST)
    const now = new Date('2026-05-10T17:00:00Z')
    expect(isSundayLunchAvailableNow(makeBusinessHours(), now)).toBe(false)
  })

  it('should return false when serviceStatus.sunday_lunch is disabled', () => {
    const now = new Date('2026-05-10T13:00:00Z')
    const hours = makeBusinessHours({
      serviceStatus: { sunday_lunch: { isEnabled: false, message: 'Suspended' } }
    })
    expect(isSundayLunchAvailableNow(hours, now)).toBe(false)
  })

  it('should return false when serviceOverride disables it for today', () => {
    const now = new Date('2026-05-10T13:00:00Z')
    const hours = makeBusinessHours({
      serviceOverrides: {
        sunday_lunch: [{
          startDate: '2026-05-10',
          endDate: '2026-05-10',
          isEnabled: false,
          message: 'Closed for menu change',
          updatedAt: '2026-05-01T00:00:00Z'
        }]
      }
    })
    expect(isSundayLunchAvailableNow(hours, now)).toBe(false)
  })

  it('should return false when special hours have no sunday_lunch schedule_config', () => {
    const now = new Date('2026-05-10T13:00:00Z')
    const hours = makeBusinessHours({
      specialHours: [{
        date: '2026-05-10',
        opens: '12:00:00',
        closes: '22:00:00',
        kitchen: null,
        is_kitchen_closed: true,
        status: 'modified',
        note: 'No Sunday lunch today',
        schedule_config: []
      }]
    })
    expect(isSundayLunchAvailableNow(hours, now)).toBe(false)
  })
})

// --- resolveHeroContext ---

describe('resolveHeroContext', () => {
  it('should return closed state when currentStatus.isOpen is false', () => {
    const hours = makeBusinessHours({
      currentStatus: { isOpen: false, kitchenOpen: false, closesIn: null, opensIn: '2 hours' }
    })
    const result = resolveHeroContext(hours, null, new Date('2026-05-08T10:00:00Z'))
    expect(result.isOpen).toBe(false)
    expect(result.kitchenOpen).toBe(false)
  })

  it('should trust currentStatus for open/kitchen state', () => {
    const hours = makeBusinessHours({
      currentStatus: { isOpen: true, kitchenOpen: true, closesIn: '4 hours', opensIn: null }
    })
    const result = resolveHeroContext(hours, null, new Date('2026-05-08T18:00:00Z'))
    expect(result.isOpen).toBe(true)
    expect(result.kitchenOpen).toBe(true)
  })

  it('should get bar/kitchen closing times from effective schedule, not closesIn', () => {
    const hours = makeBusinessHours({
      regularHours: {
        ...makeBusinessHours().regularHours,
        friday: {
          opens: '16:00:00',
          closes: '22:00:00',
          kitchen: { opens: '16:00:00', closes: '21:00:00' },
          is_closed: false,
          is_kitchen_closed: false,
          schedule_config: []
        }
      },
      currentStatus: { isOpen: true, kitchenOpen: true, closesIn: '4 hours', opensIn: null }
    })
    // Friday 6pm London
    const result = resolveHeroContext(hours, null, new Date('2026-05-08T17:00:00Z'))
    expect(result.barClosesAt).toBe('10pm')
    expect(result.kitchenClosesAt).toBe('9pm')
  })

  it('should default bookingsAccepting to true when services.bookings absent', () => {
    const hours = makeBusinessHours()
    const result = resolveHeroContext(hours, null, new Date('2026-05-08T18:00:00Z'))
    expect(result.bookingsAccepting).toBe(true)
  })

  it('should read bookingsAccepting from services.bookings.accepting', () => {
    const hours = makeBusinessHours({
      currentStatus: {
        isOpen: true, kitchenOpen: true, closesIn: null, opensIn: null,
        services: { bookings: { accepting: false, availableSlots: [] } }
      }
    })
    const result = resolveHeroContext(hours, null, new Date('2026-05-08T18:00:00Z'))
    expect(result.bookingsAccepting).toBe(false)
  })

  it('should find todayActiveEvent from heroEvents', () => {
    const now = new Date('2026-05-08T17:00:00Z')
    const events = [makeEvent({ startDate: '2026-05-08T19:00:00Z' })]
    const result = resolveHeroContext(makeBusinessHours(), events, now)
    expect(result.todayActiveEvent).not.toBeNull()
    expect(result.todayActiveEvent!.id).toBe('evt-1')
  })

  it('should set todayActiveEvent to null when no events provided', () => {
    const result = resolveHeroContext(makeBusinessHours(), null, new Date('2026-05-08T18:00:00Z'))
    expect(result.todayActiveEvent).toBeNull()
  })

  it('should find nextUpcomingEvent from heroEvents when no event today', () => {
    const now = new Date('2026-05-06T18:00:00Z') // Tuesday
    const events = [makeEvent({ startDate: '2026-05-08T19:00:00Z' })] // Friday
    const result = resolveHeroContext(makeBusinessHours(), events, now)
    expect(result.todayActiveEvent).toBeNull()
    expect(result.nextUpcomingEvent).not.toBeNull()
  })

  it('should pick up special hours note', () => {
    const now = new Date('2026-05-25T12:00:00Z')
    const hours = makeBusinessHours({
      specialHours: [{
        date: '2026-05-25',
        opens: '12:00:00',
        closes: '22:00:00',
        kitchen: { opens: '12:00:00', closes: '19:00:00' },
        is_kitchen_closed: false,
        status: 'modified',
        note: 'Bank Holiday hours'
      }]
    })
    const result = resolveHeroContext(hours, null, now)
    expect(result.specialNote).toBe('Bank Holiday hours')
  })

  it('should return safe defaults when businessHours is null', () => {
    const result = resolveHeroContext(null, null, new Date())
    expect(result.isOpen).toBe(false)
    expect(result.kitchenOpen).toBe(false)
    expect(result.bookingsAccepting).toBe(true)
    expect(result.todayActiveEvent).toBeNull()
    expect(result.specialNote).toBeNull()
    expect(result.sundayLunchAvailable).toBe(false)
  })
})

// --- resolveHeroCtas ---

describe('resolveHeroCtas', () => {
  const baseContext: HeroContext = {
    isOpen: true,
    barClosesAt: '10pm',
    nextOpensLabel: null,
    kitchenOpen: true,
    kitchenClosesAt: '9pm',
    bookingsAccepting: true,
    todayActiveEvent: null,
    nextUpcomingEvent: null,
    specialNote: null,
    sundayLunchAvailable: false
  }

  it('P1: event today → event-link CTA', () => {
    const ctx = {
      ...baseContext,
      todayActiveEvent: makeEvent({ name: 'Music Bingo', slug: 'music-bingo-2026-05-08', startDate: '2026-05-08T19:00:00Z' })
    }
    const { primary, secondary } = resolveHeroCtas(ctx, '/food-menu', new Date('2026-05-08T17:00:00Z'))
    expect(primary.kind).toBe('event-link')
    expect(primary.label).toContain('Music Bingo')
    expect(secondary.kind).toBe('phone')
  })

  it('P1: event CTA does NOT check bookingsAccepting', () => {
    const ctx = {
      ...baseContext,
      bookingsAccepting: false,
      todayActiveEvent: makeEvent({ startDate: '2026-05-08T19:00:00Z' })
    }
    const { primary } = resolveHeroCtas(ctx, '/drinks', new Date('2026-05-08T17:00:00Z'))
    expect(primary.kind).toBe('event-link')
  })

  it('P2: Sunday lunch available + bookings accepting', () => {
    const ctx = { ...baseContext, sundayLunchAvailable: true }
    const { primary, secondary } = resolveHeroCtas(ctx, '/about', new Date('2026-05-10T13:00:00Z'))
    expect(primary.kind).toBe('booking')
    expect(primary.label).toBe('Book Sunday Lunch')
    expect(secondary.kind).toBe('link')
    expect((secondary as any).href).toBe('/sunday-lunch')
  })

  it('P3: kitchen open + bookings accepting', () => {
    const { primary, secondary } = resolveHeroCtas(baseContext, '/about', new Date())
    expect(primary.kind).toBe('booking')
    expect(primary.label).toBe('Book a Table')
    expect(secondary.kind).toBe('link')
    expect((secondary as any).href).toBe('/food-menu')
  })

  it('P4: kitchen open + bookings NOT accepting', () => {
    const ctx = { ...baseContext, bookingsAccepting: false }
    const { primary } = resolveHeroCtas(ctx, '/about', new Date())
    expect(primary.kind).toBe('phone')
    expect(primary.label).toBe('Call to Book')
  })

  it('P5: bar open, kitchen closed + bookings accepting', () => {
    const ctx = { ...baseContext, kitchenOpen: false, kitchenClosesAt: null }
    const { primary, secondary } = resolveHeroCtas(ctx, '/about', new Date())
    expect(primary.kind).toBe('booking')
    expect(primary.label).toBe('Book a Table')
    expect((secondary as any).href).toBe('/drinks')
  })

  it('P6: bar open, kitchen closed + bookings NOT accepting', () => {
    const ctx = { ...baseContext, kitchenOpen: false, kitchenClosesAt: null, bookingsAccepting: false }
    const { primary } = resolveHeroCtas(ctx, '/about', new Date())
    expect(primary.kind).toBe('phone')
  })

  it('P7: closed + bookings accepting', () => {
    const ctx = { ...baseContext, isOpen: false, kitchenOpen: false }
    const { primary, secondary } = resolveHeroCtas(ctx, '/about', new Date())
    expect(primary.kind).toBe('booking')
    expect((secondary as any).href).toBe('/whats-on')
  })

  it('P8: closed + bookings NOT accepting', () => {
    const ctx = { ...baseContext, isOpen: false, kitchenOpen: false, bookingsAccepting: false }
    const { primary } = resolveHeroCtas(ctx, '/about', new Date())
    expect(primary.kind).toBe('phone')
    expect(primary.label).toBe('Call to Book')
  })

  it('should truncate long event names at 20 chars', () => {
    const ctx = {
      ...baseContext,
      todayActiveEvent: makeEvent({ name: 'Super Mega Bingo Extravaganza Night', startDate: '2026-05-08T19:00:00Z' })
    }
    const { primary } = resolveHeroCtas(ctx, '/', new Date('2026-05-08T17:00:00Z'))
    expect(primary.label.length).toBeLessThanOrEqual(MAX_CTA_LABEL_LENGTH)
  })

  it('should use "Tonight" for events after 5pm', () => {
    const ctx = {
      ...baseContext,
      todayActiveEvent: makeEvent({ name: 'Quiz', startDate: '2026-05-08T19:00:00Z' })
    }
    const { primary } = resolveHeroCtas(ctx, '/', new Date('2026-05-08T15:00:00Z'))
    expect(primary.label).toContain('Tonight')
  })

  it('should use "Today" for events before 5pm', () => {
    const ctx = {
      ...baseContext,
      todayActiveEvent: makeEvent({ name: 'Quiz', startDate: '2026-05-08T14:00:00Z' })
    }
    const { primary } = resolveHeroCtas(ctx, '/', new Date('2026-05-08T10:00:00Z'))
    expect(primary.label).toContain('Today')
  })

  it('should use "On Now" for events in progress', () => {
    const ctx = {
      ...baseContext,
      todayActiveEvent: makeEvent({ name: 'Quiz', startDate: '2026-05-08T19:00:00Z', endDate: '2026-05-08T22:00:00Z' })
    }
    const { primary } = resolveHeroCtas(ctx, '/', new Date('2026-05-08T20:00:00Z'))
    expect(primary.label).toContain('On Now')
  })
})
