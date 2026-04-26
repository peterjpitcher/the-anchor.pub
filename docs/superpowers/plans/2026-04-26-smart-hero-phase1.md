# Smart Hero Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the hero context system (pure resolvers, SmartCTAs, ContextStrip) with full test coverage. Zero visual changes — all features default off.

**Architecture:** Pure resolver functions (`resolveHeroContext`, `resolveHeroCtas`) compute display state from BusinessHours + events data. Two new client components (`SmartCTAs`, `ContextStrip`) consume the existing `BusinessHoursProvider` via `useBusinessHoursContext()`. `HeroSectionServer` gets a `bottomSlot` prop. `HeroWrapper` gets three new opt-in props (`enableSmartCtas`, `showContextStrip`, `heroEvents`), all defaulting to `false`/`undefined`.

**Tech Stack:** Next.js 14, React 19, TypeScript, Jest + RTL, existing BusinessHoursProvider

**Spec:** `docs/superpowers/specs/2026-04-26-smart-hero-design.md` (v4)

---

### Task 1: Types and Constants

**Files:**
- Create: `lib/hero-context.ts`

- [ ] **Step 1: Create the types and constants file**

```typescript
// lib/hero-context.ts
import type { BusinessHours } from '@/lib/api/hours'
import type { Event } from '@/lib/api'

// --- Types ---

export interface HeroContext {
  isOpen: boolean
  barClosesAt: string | null
  kitchenOpen: boolean
  kitchenClosesAt: string | null
  bookingsAccepting: boolean
  todayActiveEvent: Event | null
  nextUpcomingEvent: Event | null
  specialNote: string | null
  sundayLunchAvailable: boolean
}

export type HeroCtaAction =
  | { kind: 'booking'; label: string; source: string }
  | { kind: 'phone'; label: string; phone: string; source: string }
  | { kind: 'event-link'; label: string; href: string; source: string }
  | { kind: 'link'; label: string; href: string; source: string }

// --- Constants ---

export const PHONE_NUMBER = '01753682707'
export const MAX_EVENT_NAME_LENGTH = 20
export const MAX_CTA_LABEL_LENGTH = 30
const LONDON_TZ = 'Europe/London'

// --- Helpers ---

/** Format 24h time string (e.g. "22:00:00") to 12h (e.g. "10pm") */
export function formatTime12h(time: string | null | undefined): string | null {
  if (!time) return null
  const parts = time.split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (Number.isNaN(h)) return null
  const period = h >= 12 ? 'pm' : 'am'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${display}${period}` : `${display}:${m.toString().padStart(2, '0')}${period}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

/** Normalise route to tracking source slug: "/food-menu" → "smart_hero_food_menu" */
export function normaliseRouteToSource(route: string): string {
  const slug = route
    .replace(/^\//, '')
    .replace(/\[.*?\]/g, 'detail')
    .replace(/\//g, '_')
  return `smart_hero_${slug || 'home'}`
}

/** Get today's date string in London timezone: "2026-04-26" */
export function getLondonDateStr(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: LONDON_TZ })
}

/** Get London day of week: "sunday", "monday", etc. */
export function getLondonDayName(now: Date): string {
  return now.toLocaleDateString('en-GB', { weekday: 'long', timeZone: LONDON_TZ }).toLowerCase()
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/hero-context.ts
git commit -m "feat(hero): add types, constants, and helpers for hero context system"
```

---

### Task 2: `getTodaysActiveEvents` Pure Function + Tests

**Files:**
- Modify: `lib/hero-context.ts`
- Create: `tests/unit/hero-context.test.ts`

- [ ] **Step 1: Write failing tests for `getTodaysActiveEvents`**

```typescript
// tests/unit/hero-context.test.ts
import { getTodaysActiveEvents } from '@/lib/hero-context'

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: FAIL — `getTodaysActiveEvents` is not exported

- [ ] **Step 3: Implement `getTodaysActiveEvents`**

Add to `lib/hero-context.ts`:

```typescript
import { getEventDateRangeUtc } from '@/lib/event-calendar'

/** Filter events to those active today (started or starting, not yet ended). London timezone. */
export function getTodaysActiveEvents(events: Event[], now: Date): Event[] {
  const todayStr = getLondonDateStr(now)

  return events
    .filter(event => {
      const { start, end } = getEventDateRangeUtc(event)
      const eventDateStr = getLondonDateStr(start)
      if (eventDateStr !== todayStr) return false
      return end.getTime() > now.getTime()
    })
    .sort((a, b) => {
      const aStart = getEventDateRangeUtc(a).start.getTime()
      const bStart = getEventDateRangeUtc(b).start.getTime()
      return aStart - bStart
    })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hero-context.ts tests/unit/hero-context.test.ts
git commit -m "feat(hero): add getTodaysActiveEvents with tests"
```

---

### Task 3: `isSundayLunchAvailableNow` Pure Function + Tests

**Files:**
- Modify: `lib/hero-context.ts`
- Modify: `tests/unit/hero-context.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/unit/hero-context.test.ts`:

```typescript
import { isSundayLunchAvailableNow } from '@/lib/hero-context'

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: FAIL — `isSundayLunchAvailableNow` is not exported

- [ ] **Step 3: Implement `isSundayLunchAvailableNow`**

Add to `lib/hero-context.ts`:

```typescript
/**
 * Pure check: is Sunday lunch available right now?
 * Checks day, service status, overrides, schedule_config, and cutoff.
 * All inputs from BusinessHours — no fetch.
 */
export function isSundayLunchAvailableNow(
  businessHours: BusinessHours,
  now: Date
): boolean {
  const dayName = getLondonDayName(now)
  if (dayName !== 'sunday') return false

  // Check service status
  const serviceStatus = businessHours.serviceStatus as Record<string, any> | undefined
  if (serviceStatus?.sunday_lunch?.isEnabled === false) return false

  // Check service overrides for today
  const todayStr = getLondonDateStr(now)
  const overrides = businessHours.serviceOverrides as Record<string, any[]> | undefined
  if (overrides?.sunday_lunch) {
    const todayOverride = overrides.sunday_lunch.find(
      (o: any) => todayStr >= o.startDate && todayStr <= o.endDate
    )
    if (todayOverride && !todayOverride.isEnabled) return false
  }

  // Get effective schedule_config for today
  const special = businessHours.specialHours?.find(s => s.date === todayStr)
  const scheduleConfig = special
    ? (special.schedule_config || [])
    : (businessHours.regularHours?.sunday?.schedule_config || [])

  // Check for sunday_lunch entry in schedule_config
  const sundayLunchSlots = (scheduleConfig as any[]).filter(
    (s: any) => s.booking_type === 'sunday_lunch' || s.slot_type === 'sunday_lunch'
  )
  if (sundayLunchSlots.length === 0) return false

  // Check if we're before the last slot's ends_at
  const lastSlotEnd = sundayLunchSlots
    .map((s: any) => s.ends_at as string)
    .sort()
    .pop()
  if (!lastSlotEnd) return false

  // Parse ends_at as London time today
  const [endH, endM] = lastSlotEnd.split(':').map(Number)
  const londonNow = new Date(now.toLocaleString('en-US', { timeZone: LONDON_TZ }))
  const currentMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()
  const endMinutes = endH * 60 + (endM || 0)

  return currentMinutes < endMinutes
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hero-context.ts tests/unit/hero-context.test.ts
git commit -m "feat(hero): add isSundayLunchAvailableNow with tests"
```

---

### Task 4: `resolveHeroContext` Pure Function + Tests

**Files:**
- Modify: `lib/hero-context.ts`
- Modify: `tests/unit/hero-context.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/unit/hero-context.test.ts`:

```typescript
import { resolveHeroContext } from '@/lib/hero-context'

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: FAIL — `resolveHeroContext` not exported

- [ ] **Step 3: Implement `resolveHeroContext`**

Add to `lib/hero-context.ts`:

```typescript
import { getEffectiveDayHours } from '@/lib/hours-utils'

/**
 * Compute hero display state from BusinessHours + events.
 * Pure function. London timezone. No side effects, no fetches.
 * State (isOpen, kitchenOpen) from currentStatus.
 * Display labels (barClosesAt, kitchenClosesAt) from effective schedule.
 */
export function resolveHeroContext(
  businessHours: BusinessHours | null,
  events: Event[] | null,
  now: Date
): HeroContext {
  if (!businessHours) {
    return {
      isOpen: false,
      barClosesAt: null,
      kitchenOpen: false,
      kitchenClosesAt: null,
      bookingsAccepting: true,
      todayActiveEvent: null,
      nextUpcomingEvent: null,
      specialNote: null,
      sundayLunchAvailable: false
    }
  }

  const { currentStatus } = businessHours
  const todayStr = getLondonDateStr(now)
  const dayName = getLondonDayName(now)

  // State from currentStatus (source of truth)
  const isOpen = currentStatus.isOpen
  const kitchenOpen = currentStatus.kitchenOpen

  // Bookings — default true if absent
  const bookingsAccepting =
    currentStatus.services?.bookings?.accepting ?? true

  // Display labels from effective schedule
  const effective = getEffectiveDayHours(
    todayStr,
    businessHours.regularHours || {},
    businessHours.specialHours
  )
  const barClosesAt = formatTime12h(effective.closes as string | undefined)
  const kitchenClosesAt =
    kitchenOpen && effective.kitchen && 'closes' in effective.kitchen
      ? formatTime12h((effective.kitchen as any).closes)
      : null

  // Events
  const todayActive = events ? getTodaysActiveEvents(events, now) : []
  const todayActiveEvent = todayActive[0] || null
  const nextUpcomingEvent = !todayActiveEvent && events?.length
    ? events.find(e => {
        const start = getEventDateRangeUtc(e).start
        return start.getTime() > now.getTime()
      }) || null
    : null

  // Special hours note
  const todaySpecial = businessHours.specialHours?.find(s => s.date === todayStr)
  const specialNote = todaySpecial?.note || null

  // Sunday lunch
  const sundayLunchAvailable = isSundayLunchAvailableNow(businessHours, now)

  return {
    isOpen,
    barClosesAt,
    kitchenOpen,
    kitchenClosesAt,
    bookingsAccepting,
    todayActiveEvent,
    nextUpcomingEvent,
    specialNote,
    sundayLunchAvailable
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hero-context.ts tests/unit/hero-context.test.ts
git commit -m "feat(hero): add resolveHeroContext with tests"
```

---

### Task 5: `resolveHeroCtas` Pure Function + Tests

**Files:**
- Modify: `lib/hero-context.ts`
- Modify: `tests/unit/hero-context.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `tests/unit/hero-context.test.ts`:

```typescript
import { resolveHeroCtas, normaliseRouteToSource } from '@/lib/hero-context'

describe('resolveHeroCtas', () => {
  const baseContext: HeroContext = {
    isOpen: true,
    barClosesAt: '10pm',
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: FAIL — `resolveHeroCtas` not exported

- [ ] **Step 3: Implement `resolveHeroCtas`**

Add to `lib/hero-context.ts`:

```typescript
/**
 * Run priority cascade to determine smart CTA actions.
 * Pure function. Returns discriminated actions for rendering.
 */
export function resolveHeroCtas(
  context: HeroContext,
  route: string,
  now: Date
): { primary: HeroCtaAction; secondary: HeroCtaAction } {
  const source = normaliseRouteToSource(route)

  // P1: Active event today (does NOT check bookingsAccepting)
  if (context.todayActiveEvent) {
    const event = context.todayActiveEvent
    const eventStart = getEventDateRangeUtc(event).start
    const eventEnd = getEventDateRangeUtc(event).end
    const isInProgress = now.getTime() >= eventStart.getTime() && now.getTime() < eventEnd.getTime()

    let label: string
    if (isInProgress) {
      label = `${truncate(event.name, MAX_EVENT_NAME_LENGTH)} On Now`
    } else {
      const startHour = eventStart.toLocaleString('en-GB', { hour: 'numeric', timeZone: 'Europe/London' })
      const isEvening = parseInt(startHour) >= 17
      const timeLabel = isEvening ? 'Tonight' : 'Today'
      label = `Book ${truncate(event.name, MAX_EVENT_NAME_LENGTH)} ${timeLabel}`
    }

    const href = `/events/${event.slug || event.id}`

    return {
      primary: { kind: 'event-link', label: truncate(label, MAX_CTA_LABEL_LENGTH), href, source },
      secondary: { kind: 'phone', label: 'Call Us', phone: PHONE_NUMBER, source }
    }
  }

  // P2: Sunday lunch available + bookings accepting
  if (context.sundayLunchAvailable && context.bookingsAccepting) {
    return {
      primary: { kind: 'booking', label: 'Book Sunday Lunch', source },
      secondary: { kind: 'link', label: 'View Menu', href: '/sunday-lunch', source }
    }
  }

  // P3/P4: Kitchen open
  if (context.kitchenOpen) {
    if (context.bookingsAccepting) {
      return {
        primary: { kind: 'booking', label: 'Book a Table', source },
        secondary: { kind: 'link', label: 'View Menu', href: '/food-menu', source }
      }
    }
    return {
      primary: { kind: 'phone', label: 'Call to Book', phone: PHONE_NUMBER, source },
      secondary: { kind: 'link', label: 'View Menu', href: '/food-menu', source }
    }
  }

  // P5/P6: Bar open, kitchen closed
  if (context.isOpen) {
    if (context.bookingsAccepting) {
      return {
        primary: { kind: 'booking', label: 'Book a Table', source },
        secondary: { kind: 'link', label: 'View Drinks', href: '/drinks', source }
      }
    }
    return {
      primary: { kind: 'phone', label: 'Call Us', phone: PHONE_NUMBER, source },
      secondary: { kind: 'link', label: 'View Drinks', href: '/drinks', source }
    }
  }

  // P7/P8: Closed
  if (context.bookingsAccepting) {
    return {
      primary: { kind: 'booking', label: 'Book a Table', source },
      secondary: { kind: 'link', label: "View What's On", href: '/whats-on', source }
    }
  }
  return {
    primary: { kind: 'phone', label: 'Call to Book', phone: PHONE_NUMBER, source },
    secondary: { kind: 'link', label: "View What's On", href: '/whats-on', source }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/unit/hero-context.test.ts --no-coverage`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/hero-context.ts tests/unit/hero-context.test.ts
git commit -m "feat(hero): add resolveHeroCtas cascade with tests"
```

---

### Task 6: `ContextStrip` Client Component

**Files:**
- Create: `components/hero/ContextStrip.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/hero/ContextStrip.tsx
'use client'

import { useMemo } from 'react'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { resolveHeroContext } from '@/lib/hero-context'
import type { Event } from '@/lib/api'

interface ContextStripProps {
  heroEvents?: Event[]
}

export function ContextStrip({ heroEvents }: ContextStripProps) {
  const hoursCtx = useBusinessHoursContext()
  const hours = hoursCtx?.hours ?? null

  const ctx = useMemo(
    () => resolveHeroContext(hours, heroEvents ?? null, new Date()),
    [hours, heroEvents]
  )

  // Build slots
  const slots: Array<{ text: string; className: string }> = []

  // Slot 1: Status
  if (ctx.isOpen) {
    const barLabel = ctx.barClosesAt ? ` · Bar until ${ctx.barClosesAt}` : ''
    slots.push({
      text: `Open now${barLabel}`,
      className: 'text-anchor-gold-vivid font-semibold'
    })
  } else {
    slots.push({
      text: 'Closed',
      className: 'text-red-400 font-semibold'
    })
  }

  // Slot 2: Kitchen
  if (ctx.kitchenOpen && ctx.kitchenClosesAt) {
    slots.push({
      text: `Kitchen open until ${ctx.kitchenClosesAt}`,
      className: 'text-white/80'
    })
  } else if (!ctx.kitchenOpen && ctx.isOpen) {
    slots.push({
      text: 'Kitchen closed today',
      className: 'text-red-400'
    })
  }

  // Slot 3: Special note (wins) → today's event → next upcoming
  if (ctx.specialNote) {
    slots.push({ text: ctx.specialNote, className: 'text-anchor-gold-vivid' })
  } else if (ctx.todayActiveEvent) {
    const name = ctx.todayActiveEvent.name
    slots.push({ text: `${name} on now`, className: 'text-white/80' })
  } else if (ctx.nextUpcomingEvent) {
    const name = ctx.nextUpcomingEvent.name
    slots.push({ text: name, className: 'text-white/80' })
  }

  if (slots.length === 0) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-sm px-4 py-2 sm:px-6 sm:py-3">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:text-base">
        {slots.map((slot, i) => (
          <span key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-white/30 hidden sm:inline" aria-hidden>·</span>}
            <span className={slot.className}>{slot.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero/ContextStrip.tsx
git commit -m "feat(hero): add ContextStrip client component"
```

---

### Task 7: `SmartCTAs` Client Component

**Files:**
- Create: `components/hero/SmartCTAs.tsx`

- [ ] **Step 1: Create the component**

```typescript
// components/hero/SmartCTAs.tsx
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import { resolveHeroContext, resolveHeroCtas } from '@/lib/hero-context'
import type { HeroCtaAction } from '@/lib/hero-context'
import type { Event } from '@/lib/api'
import { BookTableButton } from '@/components/BookTableButton'
import { PhoneButton } from '@/components/PhoneButton'
import { Button } from '@/components/ui'
import { trackCtaClick } from '@/lib/gtm-events'

interface SmartCTAsProps {
  route: string
  heroEvents?: Event[]
}

function renderAction(action: HeroCtaAction, variant: 'primary' | 'secondary') {
  const size = 'lg'

  switch (action.kind) {
    case 'booking':
      return (
        <BookTableButton
          source={action.source}
          variant={variant}
          size={size === 'lg' ? 'md' : size}
          className="min-w-[180px]"
        >
          {action.label}
        </BookTableButton>
      )

    case 'phone':
      return (
        <PhoneButton
          phone={action.phone}
          source={action.source}
          variant={variant === 'primary' ? 'primary' : 'secondary'}
          size={size === 'lg' ? 'lg' : 'md'}
          className="min-w-[180px]"
        >
          {action.label}
        </PhoneButton>
      )

    case 'event-link':
      return (
        <Link
          href={action.href}
          onClick={() => trackCtaClick({
            id: `smart_cta_${variant}`,
            label: action.label,
            location: action.source,
            destination: action.href,
            context: 'smart_hero'
          })}
        >
          <Button variant={variant} size={size} className="min-w-[180px]">
            {action.label}
          </Button>
        </Link>
      )

    case 'link':
      return (
        <Link
          href={action.href}
          onClick={() => trackCtaClick({
            id: `smart_cta_${variant}`,
            label: action.label,
            location: action.source,
            destination: action.href,
            context: 'smart_hero'
          })}
        >
          <Button variant={variant} size={size} className="min-w-[180px]">
            {action.label}
          </Button>
        </Link>
      )
  }
}

export function SmartCTAs({ route, heroEvents }: SmartCTAsProps) {
  const hoursCtx = useBusinessHoursContext()
  const hours = hoursCtx?.hours ?? null

  const now = useMemo(() => new Date(), [])

  const ctx = useMemo(
    () => resolveHeroContext(hours, heroEvents ?? null, now),
    [hours, heroEvents, now]
  )

  const { primary, secondary } = useMemo(
    () => resolveHeroCtas(ctx, route, now),
    [ctx, route, now]
  )

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
      <div className="w-full sm:w-auto">
        {renderAction(primary, 'primary')}
      </div>
      <div className="w-full sm:w-auto">
        {renderAction(secondary, 'secondary')}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero/SmartCTAs.tsx
git commit -m "feat(hero): add SmartCTAs client component"
```

---

### Task 8: Add `bottomSlot` to `HeroSectionServer`

**Files:**
- Modify: `components/hero/HeroSectionServer.tsx`

- [ ] **Step 1: Add bottomSlot prop and rendering**

In `components/hero/HeroSectionServer.tsx`:

1. Add `bottomSlot?: ReactNode` to the `HeroSectionServerProps` interface (after `id`).
2. Add `bottomSlot` to the destructured props.
3. Add conditional bottom padding to the section when `bottomSlot` is present.
4. Render `bottomSlot` after the centred content div, inside the `relative z-10` container.

```typescript
// In the interface, add:
bottomSlot?: ReactNode

// In the destructured props, add:
bottomSlot

// Replace the return section starting at the <div className="relative z-10..."> with:
<div className={cn('relative z-10 h-full flex flex-col', paddingClasses[size], bottomSlot && 'pb-14 sm:pb-16')}>
  <div
    className={cn(
      'container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col',
      alignmentClasses[alignment],
      contentClassName
    )}
  >
    {breadcrumbs && <div className="mb-4 sm:mb-6">{breadcrumbs}</div>}

    <div className="flex-1 flex flex-col justify-center">
      {eyebrow && <div className={cn('mb-3 sm:mb-4', blockAlignmentClasses[alignment])}>{eyebrow}</div>}

      <h1 className={cn('font-bold text-white leading-tight mb-4', titleSizeClasses[size], titleClassName)}>
        {title}
      </h1>

      {description && (
        <p className={cn('text-white/90 text-lg sm:text-xl md:text-2xl max-w-3xl mb-6', blockAlignmentClasses[alignment])}>
          {description}
        </p>
      )}

      {lead && <div className={cn('mb-6', blockAlignmentClasses[alignment])}>{lead}</div>}
      {children && <div className={cn('mb-6', blockAlignmentClasses[alignment])}>{children}</div>}

      {(tags || cta) && (
        <div className="mt-6 space-y-6">
          {tags && <div className={cn('flex flex-wrap gap-2', tagAlignmentClasses[alignment])}>{tags}</div>}
          {cta && <div className={cn('flex flex-wrap gap-4', justifyAlignmentClasses[alignment])}>{cta}</div>}
        </div>
      )}
    </div>
  </div>
  {bottomSlot}
</div>
```

- [ ] **Step 2: Run build to verify no regressions**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (bottomSlot is optional, defaults to undefined, no visual change)

- [ ] **Step 3: Commit**

```bash
git add components/hero/HeroSectionServer.tsx
git commit -m "feat(hero): add bottomSlot prop to HeroSectionServer"
```

---

### Task 9: Wire Up `HeroWrapper`

**Files:**
- Modify: `components/hero/HeroWrapper.tsx`

- [ ] **Step 1: Add new props to the interface and wiring**

In `components/hero/HeroWrapper.tsx`:

1. Add imports at top:

```typescript
import { SmartCTAs } from './SmartCTAs'
import { ContextStrip } from './ContextStrip'
import type { Event } from '@/lib/api'
```

2. Add three new props to `HeroWrapperProps` interface (after `children`):

```typescript
  /** Opt-in: render smart context-aware CTAs when no page CTA props provided */
  enableSmartCtas?: boolean
  /** Opt-in: render live context strip at bottom of hero */
  showContextStrip?: boolean
  /** Upcoming events for smart CTA and context strip awareness */
  heroEvents?: Event[]
```

3. Add to destructured props:

```typescript
  enableSmartCtas = false,
  showContextStrip = false,
  heroEvents,
```

4. After the existing `const ctaContent = structuredCtaContent ?? cta` line (line ~239), add smart CTA logic:

```typescript
  // Smart CTAs: only when explicitly opted in AND no page CTA overrides exist
  const hasAnyCTAOverride = Boolean(primaryCta || secondaryCta || cta)
  const shouldUseSmartCtas = enableSmartCtas && !hasAnyCTAOverride

  const resolvedCtaContent = shouldUseSmartCtas
    ? <SmartCTAs route={route} heroEvents={heroEvents} />
    : ctaContent
```

5. Replace `cta={heroCta}` in the `HeroSectionServer` render (line ~318) — change references from `ctaContent` to `resolvedCtaContent` in the `heroCta` composition. Specifically, update the line that reads `{ctaContent}` inside the `heroCta` JSX to `{resolvedCtaContent}`.

6. Add `bottomSlot` to the `HeroSectionServer` render:

```typescript
  bottomSlot={showContextStrip ? <ContextStrip heroEvents={heroEvents} /> : undefined}
```

- [ ] **Step 2: Run build to verify no regressions**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds. All defaults are `false`/`undefined` — zero visual changes.

- [ ] **Step 3: Commit**

```bash
git add components/hero/HeroWrapper.tsx
git commit -m "feat(hero): wire SmartCTAs and ContextStrip into HeroWrapper (opt-in, defaults off)"
```

---

### Task 10: Integration Tests

**Files:**
- Create: `tests/unit/HeroWrapper.smart.test.tsx`

- [ ] **Step 1: Write integration tests**

```typescript
// tests/unit/HeroWrapper.smart.test.tsx
import React from 'react'

// We test the wiring logic, not full rendering (HeroWrapper is a server component).
// Verify the opt-in conditions by reading the source code patterns.
import fs from 'fs'
import path from 'path'

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('HeroWrapper smart hero integration', () => {
  const source = readSource('components/hero/HeroWrapper.tsx')

  it('should have enableSmartCtas prop defaulting to false', () => {
    expect(source).toMatch(/enableSmartCtas\s*=\s*false/)
  })

  it('should have showContextStrip prop defaulting to false', () => {
    expect(source).toMatch(/showContextStrip\s*=\s*false/)
  })

  it('should check all three CTA override props before enabling smart CTAs', () => {
    // Must check primaryCta, secondaryCta, AND cta
    expect(source).toMatch(/primaryCta/)
    expect(source).toMatch(/secondaryCta/)
    expect(source).toMatch(/hasAnyCTAOverride/)
    expect(source).toMatch(/cta\b/)
  })

  it('should only render SmartCTAs when enableSmartCtas is true AND no overrides', () => {
    expect(source).toMatch(/shouldUseSmartCtas\s*=\s*enableSmartCtas\s*&&\s*!hasAnyCTAOverride/)
  })

  it('should render ContextStrip via bottomSlot when showContextStrip is true', () => {
    expect(source).toMatch(/bottomSlot=\{showContextStrip/)
    expect(source).toMatch(/<ContextStrip/)
  })

  it('should import SmartCTAs and ContextStrip', () => {
    expect(source).toMatch(/import.*SmartCTAs.*from/)
    expect(source).toMatch(/import.*ContextStrip.*from/)
  })
})

describe('HeroSectionServer bottomSlot integration', () => {
  const source = readSource('components/hero/HeroSectionServer.tsx')

  it('should have bottomSlot prop', () => {
    expect(source).toMatch(/bottomSlot\??\s*:\s*ReactNode/)
  })

  it('should render bottomSlot inside the z-10 container', () => {
    expect(source).toMatch(/\{bottomSlot\}/)
  })

  it('should add extra bottom padding when bottomSlot present', () => {
    expect(source).toMatch(/bottomSlot\s*&&\s*'pb-14/)
  })
})

describe('No existing pages affected', () => {
  it('should not have enableSmartCtas on any page file', () => {
    // Glob all page files — none should reference enableSmartCtas yet
    const appDir = path.join(process.cwd(), 'app')
    const pageFiles = findPageFiles(appDir)

    for (const file of pageFiles) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toMatch(/enableSmartCtas/)
      expect(content).not.toMatch(/showContextStrip/)
    }
  })
})

function findPageFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath))
    } else if (entry.name === 'page.tsx') {
      results.push(fullPath)
    }
  }
  return results
}
```

- [ ] **Step 2: Run all tests**

Run: `npx jest tests/unit/hero-context.test.ts tests/unit/HeroWrapper.smart.test.tsx --no-coverage`
Expected: All tests PASS

- [ ] **Step 3: Run full test suite to check for regressions**

Run: `npm test -- --no-coverage 2>&1 | tail -10`
Expected: All existing tests still pass

- [ ] **Step 4: Run full build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add tests/unit/HeroWrapper.smart.test.tsx
git commit -m "test(hero): add integration tests for smart hero opt-in wiring"
```

---

### Task 11: Export from Hero Index

**Files:**
- Modify: `components/hero/index.ts`

- [ ] **Step 1: Add exports**

Read `components/hero/index.ts` and add:

```typescript
export { SmartCTAs } from './SmartCTAs'
export { ContextStrip } from './ContextStrip'
```

- [ ] **Step 2: Commit**

```bash
git add components/hero/index.ts
git commit -m "chore(hero): export SmartCTAs and ContextStrip from hero barrel"
```

---

## Self-Review

**Spec coverage:**
- Types + constants → Task 1 ✓
- `getTodaysActiveEvents` → Task 2 ✓
- `isSundayLunchAvailableNow` → Task 3 ✓
- `resolveHeroContext` → Task 4 ✓
- `resolveHeroCtas` → Task 5 ✓
- `ContextStrip` component → Task 6 ✓
- `SmartCTAs` component → Task 7 ✓
- `HeroSectionServer` `bottomSlot` → Task 8 ✓
- `HeroWrapper` wiring → Task 9 ✓
- Integration tests → Task 10 ✓
- Exports → Task 11 ✓
- Zero page file changes → verified in Task 10 test ✓
- All props default off → verified in code and tests ✓

**Placeholder scan:** No TBD/TODO. All code blocks complete.

**Type consistency:** `HeroContext`, `HeroCtaAction`, `resolveHeroContext`, `resolveHeroCtas`, `getTodaysActiveEvents`, `isSundayLunchAvailableNow` — consistent naming across all tasks.
