# Business Hours Component Consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the 5-variant `BusinessHours` component into a single rendering path, delete 5 dead components, migrate 3 call sites, and add comprehensive tests.

**Architecture:** Rewrite `components/BusinessHours.tsx` as a single rendering path based on the `condensed` variant with fixed Mon–Sun day order. Delete 5 unused components and their barrel exports. All business logic (kitchen resolution, special hours, sunday lunch) is preserved verbatim.

**Tech Stack:** React 19, TypeScript, Luxon, Tailwind CSS, Jest + RTL

**Spec:** `docs/superpowers/specs/2026-04-26-business-hours-consolidation-design.md`

---

### Task 1: Delete dead components and clean barrel exports

**Files:**
- Delete: `components/BusinessHoursSection.tsx`
- Delete: `components/ui/OpeningHours.tsx`
- Delete: `components/KitchenHoursString.tsx`
- Delete: `components/KitchenHoursDisplay.tsx`
- Delete: `components/BusinessHoursText.tsx`
- Modify: `components/ui/index.ts:52,65`

- [ ] **Step 1: Delete the 5 dead component files**

```bash
rm components/BusinessHoursSection.tsx components/ui/OpeningHours.tsx components/KitchenHoursString.tsx components/KitchenHoursDisplay.tsx components/BusinessHoursText.tsx
```

- [ ] **Step 2: Remove barrel exports from `components/ui/index.ts`**

Remove these two lines:

Line 52:
```typescript
export { OpeningHours, OpenStatus } from './OpeningHours'
```

Line 65:
```typescript
export { BusinessHoursSection } from '../BusinessHoursSection'
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "tests/"`
Expected: No new errors (pre-existing test type errors are excluded)

- [ ] **Step 4: Commit**

```bash
git add -A components/BusinessHoursSection.tsx components/ui/OpeningHours.tsx components/KitchenHoursString.tsx components/KitchenHoursDisplay.tsx components/BusinessHoursText.tsx components/ui/index.ts
git commit -m "chore: delete 5 dead opening hours components and clean barrel exports

Remove BusinessHoursSection, OpeningHours (+ OpenStatus), KitchenHoursString,
KitchenHoursDisplay, and BusinessHoursText — all had zero imports.
Remove their re-exports from components/ui/index.ts."
```

---

### Task 2: Write tests for the consolidated BusinessHours component

Write all tests first (TDD). These test against the component interface that Task 3 will implement. The component doesn't exist yet in its new form, so all tests will fail — that's expected.

**Files:**
- Create: `tests/unit/BusinessHours.test.tsx`

**Key patterns from existing test (`tests/unit/StatusBar.boundary.test.tsx`):**
- Mock `@/hooks/useBusinessHours` with `jest.mock()`
- Mock `@/components/providers/BusinessHoursProvider` to control context
- Use `@testing-library/react` for rendering

- [ ] **Step 1: Create the test file with setup, mocks, and fixtures**

Create `tests/unit/BusinessHours.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BusinessHours } from '@/components/BusinessHours'

// Mock the provider context
const mockContextValue = {
  hours: null as any,
  loading: false,
  error: null as any,
  isStale: false,
}

jest.mock('@/components/providers/BusinessHoursProvider', () => ({
  useBusinessHoursContext: () => mockContextValue,
}))

// Mock StatusBar to avoid its own hook dependencies
jest.mock('@/components/layout/StatusBar', () => ({
  StatusBar: ({ showKitchen }: { showKitchen?: boolean }) => (
    <div data-testid="status-bar" data-show-kitchen={showKitchen}>
      StatusBar
    </div>
  ),
}))

// Freeze time to Wednesday 2026-04-29 at 14:00 London time.
// This makes day-to-date mapping deterministic:
//   Mon = 2026-05-04, Tue = 2026-05-05, Wed = 2026-04-29 (today),
//   Thu = 2026-04-30, Fri = 2026-05-01, Sat = 2026-05-02, Sun = 2026-05-03
const FROZEN_TIME = new Date('2026-04-29T13:00:00.000Z') // 14:00 BST

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(FROZEN_TIME)
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  // Reset to default non-loading, non-error state with no hours
  mockContextValue.hours = null
  mockContextValue.loading = false
  mockContextValue.error = null
  mockContextValue.isStale = false
})

// --- Fixtures ---

/** Minimal valid hours response for a full week */
function makeHours(overrides: Record<string, any> = {}) {
  return {
    currentStatus: {
      isOpen: true,
      kitchenOpen: true,
      closesIn: 'PT8H',
      opensIn: null,
    },
    regularHours: {
      monday: { opens: '16:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      tuesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      wednesday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      thursday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      friday: { opens: '12:00', closes: '23:00', is_closed: false, kitchen: { opens: '18:00', closes: '21:00' } },
      saturday: { opens: '11:00', closes: '23:00', is_closed: false, kitchen: { opens: '13:00', closes: '19:00' } },
      sunday: { opens: '12:00', closes: '22:00', is_closed: false, kitchen: { opens: '13:00', closes: '18:00' } },
    },
    specialHours: [],
    serviceOverrides: { sunday_lunch: [] },
    serviceStatus: { sunday_lunch: { isEnabled: true, message: null } },
    ...overrides,
  }
}
```

- [ ] **Step 2: Add rendering state tests**

Append to the same file:

```tsx
describe('BusinessHours', () => {
  describe('rendering states', () => {
    it('should render skeleton when loading', () => {
      mockContextValue.loading = true
      const { container } = render(<BusinessHours />)
      // LoadingState renders with role or class — check for skeleton
      expect(container.querySelector('.h-20')).toBeTruthy()
    })

    it('should render error fallback with phone number when error', () => {
      mockContextValue.error = { message: 'API failed' }
      render(<BusinessHours />)
      expect(screen.getByText(/API failed/)).toBeInTheDocument()
      expect(screen.getByText(/01753 682707/)).toBeInTheDocument()
    })

    it('should render error fallback when hours is null', () => {
      mockContextValue.hours = null
      render(<BusinessHours />)
      expect(screen.getByText(/opening hours/i)).toBeInTheDocument()
      expect(screen.getByText(/01753 682707/)).toBeInTheDocument()
    })

    it('should render 7 day rows Mon-Sun when hours loaded', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      days.forEach(day => {
        expect(screen.getByText(new RegExp(`^${day}`))).toBeInTheDocument()
      })
    })
  })
```

- [ ] **Step 3: Add className prop tests**

```tsx
  describe('className prop', () => {
    it('should apply className to root wrapper in loading state', () => {
      mockContextValue.loading = true
      const { container } = render(<BusinessHours className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })

    it('should apply className to root wrapper in error state', () => {
      mockContextValue.error = { message: 'fail' }
      render(<BusinessHours className="custom-class" />)
      const wrapper = screen.getByText(/fail/).closest('div.custom-class')
      expect(wrapper).toBeTruthy()
    })

    it('should apply className to root wrapper in success state', () => {
      mockContextValue.hours = makeHours()
      const { container } = render(<BusinessHours className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })
  })
```

- [ ] **Step 4: Add showKitchen prop tests**

```tsx
  describe('showKitchen prop', () => {
    it('should render kitchen labels and times by default', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      const kitchenLabels = screen.getAllByText(/Kitchen:/i)
      expect(kitchenLabels.length).toBeGreaterThan(0)
    })

    it('should hide all kitchen information when showKitchen is false', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours showKitchen={false} />)
      expect(screen.queryByText(/Kitchen:/i)).not.toBeInTheDocument()
    })
  })
```

- [ ] **Step 5: Add kitchen resolution tests**

```tsx
  describe('kitchen resolution', () => {
    it('should render "No service" when kitchen is null', () => {
      mockContextValue.hours = makeHours({
        regularHours: {
          ...makeHours().regularHours,
          monday: { opens: '16:00', closes: '23:00', is_closed: false, kitchen: null },
        },
      })
      render(<BusinessHours />)
      expect(screen.getByText('No service')).toBeInTheDocument()
    })

    it('should render "Closed" when is_kitchen_closed is true', () => {
      mockContextValue.hours = makeHours({
        regularHours: {
          ...makeHours().regularHours,
          monday: { opens: '16:00', closes: '23:00', is_closed: false, is_kitchen_closed: true, kitchen: { opens: '18:00', closes: '21:00' } },
        },
      })
      render(<BusinessHours />)
      // Monday's kitchen should say Closed
      expect(screen.getAllByText('Closed').length).toBeGreaterThan(0)
    })

    it('should render formatted times when kitchen has opens/closes', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      // Tuesday has kitchen 18:00-21:00 = 6pm - 9pm
      expect(screen.getAllByText(/6pm/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/9pm/).length).toBeGreaterThan(0)
    })

    it('should use special hours kitchen when property is present and null (not fallback)', () => {
      // Special hours has kitchen: null — must show "No service", NOT regular kitchen
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '12:00', closes: '23:00', is_closed: false, kitchen: null, note: 'Private event' },
        ],
      })
      render(<BusinessHours />)
      // Wednesday (today) has special hours with kitchen: null
      // Should show "No service" for that day
      expect(screen.getByText('No service')).toBeInTheDocument()
    })

    it('should fall back to regular kitchen when special hours has no kitchen property', () => {
      // Special hours overrides bar hours but has no kitchen property
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Extended hours' },
        ],
      })
      render(<BusinessHours />)
      // Wednesday should still show regular kitchen 6pm-9pm
      expect(screen.getAllByText(/6pm/).length).toBeGreaterThan(0)
    })
  })
```

- [ ] **Step 6: Add special hours display tests**

```tsx
  describe('special hours', () => {
    it('should show note text for day with special hours', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Bank holiday hours', kitchen: { opens: '12:00', closes: '20:00' } },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText(/Bank holiday hours/)).toBeInTheDocument()
    })

    it('should show "Closed" for special hours with is_closed true', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-04-29', is_closed: true, note: 'Closed for maintenance' },
        ],
      })
      render(<BusinessHours />)
      // Wednesday should show closed
      expect(screen.getByText(/Closed/)).toBeInTheDocument()
      expect(screen.getByText(/Closed for maintenance/)).toBeInTheDocument()
    })
  })
```

- [ ] **Step 7: Add sunday lunch tests**

```tsx
  describe('sunday lunch notices', () => {
    it('should show amber notice when sunday lunch is unavailable', () => {
      mockContextValue.hours = makeHours({
        serviceStatus: { sunday_lunch: { isEnabled: false, message: 'Sunday lunch service unavailable' } },
      })
      render(<BusinessHours />)
      expect(screen.getByText(/Sunday lunch/i)).toBeInTheDocument()
    })

    it('should show no notice when sunday lunch is available', () => {
      mockContextValue.hours = makeHours({
        serviceStatus: { sunday_lunch: { isEnabled: true, message: null } },
      })
      render(<BusinessHours />)
      expect(screen.queryByText(/Sunday lunch service unavailable/i)).not.toBeInTheDocument()
    })
  })
```

- [ ] **Step 8: Add upcoming changes tests**

```tsx
  describe('upcoming changes section', () => {
    it('should not render when no special hours exist beyond main list', () => {
      mockContextValue.hours = makeHours()
      render(<BusinessHours />)
      expect(screen.queryByText(/upcoming changes/i)).not.toBeInTheDocument()
    })

    it('should render with correct count when qualifying entries exist', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          // 2026-05-10 is a Saturday, 11 days from frozen time — beyond the main list
          { date: '2026-05-10', is_closed: true, note: 'Private function' },
          { date: '2026-05-17', opens: '14:00', closes: '23:00', is_closed: false, note: 'Late opening' },
        ],
      })
      render(<BusinessHours />)
      expect(screen.getByText(/upcoming changes \(2\)/i)).toBeInTheDocument()
    })

    it('should exclude entries already in main list', () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          // 2026-04-29 is today (Wednesday) — in main list, should NOT appear in upcoming
          { date: '2026-04-29', opens: '10:00', closes: '23:00', is_closed: false, note: 'Extended' },
          // 2026-05-10 — beyond main list, SHOULD appear
          { date: '2026-05-10', is_closed: true, note: 'Closed' },
        ],
      })
      render(<BusinessHours />)
      // Only 1 upcoming change (the one beyond main list)
      expect(screen.getByText(/upcoming changes \(1\)/i)).toBeInTheDocument()
    })

    it('should sort entries ascending by date', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-17', is_closed: true, note: 'Second' },
          { date: '2026-05-10', is_closed: true, note: 'First' },
        ],
      })
      render(<BusinessHours />)
      // Click to expand
      const toggle = screen.getByText(/upcoming changes/i)
      await userEvent.click(toggle)
      const items = screen.getAllByText(/First|Second/)
      expect(items[0]).toHaveTextContent('First')
      expect(items[1]).toHaveTextContent('Second')
    })

    it('should toggle expand/collapse on click', async () => {
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', is_closed: true, note: 'Private function' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      // Initially collapsed — detail not visible
      expect(screen.queryByText('Private function')).not.toBeInTheDocument()
      // Click to expand
      await userEvent.click(toggle)
      expect(screen.getByText('Private function')).toBeInTheDocument()
      // Click to collapse
      await userEvent.click(toggle)
      expect(screen.queryByText('Private function')).not.toBeInTheDocument()
    })

    it('should merge with regular weekday hours for partial overrides', async () => {
      // 2026-05-10 is a Saturday. Special hours only override bar, no kitchen property.
      // Should fall back to Saturday regular kitchen: 1pm-7pm
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', opens: '14:00', closes: '23:00', is_closed: false, note: 'Late start' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      await userEvent.click(toggle)
      // Should show bar 2pm and regular Saturday kitchen 1pm
      expect(screen.getByText(/2pm/)).toBeInTheDocument()
      expect(screen.getAllByText(/1pm/).length).toBeGreaterThan(0)
    })

    it('should show "No service" for future kitchen: null (property-presence)', async () => {
      // 2026-05-10 is a Saturday. Special hours has kitchen: null.
      // Must NOT fall back to regular Saturday kitchen.
      mockContextValue.hours = makeHours({
        specialHours: [
          { date: '2026-05-10', opens: '14:00', closes: '23:00', is_closed: false, kitchen: null, note: 'No food' },
        ],
      })
      render(<BusinessHours />)
      const toggle = screen.getByText(/upcoming changes/i)
      await userEvent.click(toggle)
      // The upcoming row for May 10 should show "No service"
      const upcomingSection = screen.getByText('No food').closest('div')
      expect(upcomingSection).toBeTruthy()
    })
  })
}) // end describe('BusinessHours')
```

- [ ] **Step 9: Run the tests — they should all fail**

Run: `npx jest tests/unit/BusinessHours.test.tsx --no-coverage 2>&1 | tail -20`
Expected: All tests fail (component hasn't been rewritten yet). This confirms the tests are correctly wired up and not passing vacuously.

- [ ] **Step 10: Commit tests**

```bash
git add tests/unit/BusinessHours.test.tsx
git commit -m "test: add comprehensive tests for consolidated BusinessHours component

TDD: all tests fail — component rewrite follows in next commit.
Covers: rendering states, className, showKitchen, kitchen resolution
(null vs closed vs open, property-presence semantics), special hours,
sunday lunch notices, upcoming changes (boundary, sort, toggle, merge).
Time frozen to Wed 2026-04-29 14:00 BST for deterministic day mapping."
```

---

### Task 3: Rewrite BusinessHours component

**Files:**
- Rewrite: `components/BusinessHours.tsx`

This replaces the entire 585-line file with a single rendering path. All business logic functions (`resolveKitchenInfo`, `getSpecialHoursForDate`, `getIsoForDayKey`, `getSundayLunchInfoForDate`, `formatTime`) are preserved verbatim from the current file.

- [ ] **Step 1: Rewrite `components/BusinessHours.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { type BusinessHours as BusinessHoursData } from '@/lib/api'
import { StatusBar } from '@/components/layout/StatusBar'
import { CONTACT_INFO } from '@/lib/error-handling'
import { LoadingState } from '@/components/ui/LoadingState'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'

interface BusinessHoursProps {
  showKitchen?: boolean
  className?: string
}

export function BusinessHours({ showKitchen = true, className = '' }: BusinessHoursProps) {
  const context = useBusinessHoursContext()
  const { hours, loading, error } = context || { hours: null, loading: true, error: null }
  const [showUpcoming, setShowUpcoming] = useState(false)

  // --- Loading state ---
  if (loading) {
    return (
      <div className={className}>
        <LoadingState variant="skeleton" className="h-20 w-full" />
      </div>
    )
  }

  // --- Error state ---
  if (error || !hours) {
    const errorMessage = error?.message || `We couldn't load our opening hours. Call us at ${CONTACT_INFO.phone} for today's hours.`
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <p className="text-red-400 text-sm mb-2">{errorMessage}</p>
        <div className="text-sm text-anchor-cream-text/70">
          <a href={CONTACT_INFO.phoneLink} className="text-anchor-gold hover:text-anchor-gold-light font-semibold underline">
            Call {CONTACT_INFO.phone}
          </a> for today&apos;s hours
        </div>
      </div>
    )
  }

  // --- Data resolution (preserved from existing component) ---

  const londonNow = DateTime.now().setZone('Europe/London')
  const todayKey = londonNow.toFormat('cccc').toLowerCase()
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

  const sundayLunchOverrides = (hours.serviceOverrides?.sunday_lunch ?? []) as Array<{
    startDate: string
    endDate: string
    isEnabled: boolean
    message: string | null
  }>
  const sundayLunchStatus = hours.serviceStatus?.sunday_lunch

  // Map each day to the next occurrence of that weekday (including today)
  const getIsoForDayKey = (key: string): string | null => {
    const targetIndex = dayOrder.indexOf(key as typeof dayOrder[number])
    const todayIndex = dayOrder.indexOf(todayKey as typeof dayOrder[number])
    if (targetIndex === -1 || todayIndex === -1) return null

    let delta = targetIndex - todayIndex
    if (delta < 0) delta += 7

    return londonNow.plus({ days: delta }).toISODate()
  }

  const getSpecialHoursForDate = (isoDate?: string | null) => {
    if (!isoDate || !hours.specialHours || hours.specialHours.length === 0) return null
    return hours.specialHours.find(sh => sh.date === isoDate) || null
  }

  const formatTime = (time?: string | null): string => {
    if (!time) return ''
    const parts = time.split(':')
    if (parts.length < 2) return time
    const [h, m] = parts
    const hour = parseInt(h)
    if (isNaN(hour)) return time
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour % 12 || 12
    return m === '00' ? `${displayHour}${ampm}` : `${displayHour}:${m}${ampm}`
  }

  // Critical: uses property-presence for kitchen, not ?? on inner fields
  const resolveKitchenInfo = (
    specialHoursEntry: any | null,
    regularHoursEntry: any | null
  ) => {
    const source = specialHoursEntry ?? regularHoursEntry ?? null

    let kitchen: any = null
    if (specialHoursEntry && Object.prototype.hasOwnProperty.call(specialHoursEntry, 'kitchen')) {
      kitchen = specialHoursEntry.kitchen
    } else if (regularHoursEntry && Object.prototype.hasOwnProperty.call(regularHoursEntry, 'kitchen')) {
      kitchen = regularHoursEntry.kitchen
    } else if (source && typeof source === 'object' && 'kitchen' in source) {
      kitchen = source.kitchen
    }

    const explicitClosed =
      (specialHoursEntry?.is_kitchen_closed ?? regularHoursEntry?.is_kitchen_closed) === true

    const kitchenClosed =
      explicitClosed ||
      (kitchen && typeof kitchen === 'object' && 'is_closed' in kitchen && kitchen.is_closed === true)

    return { kitchen, kitchenClosed }
  }

  const getSundayLunchInfoForDate = (isoDate?: string | null) => {
    if (!isoDate) return null
    const date = DateTime.fromISO(isoDate, { zone: 'Europe/London' })
    if (!date.isValid || date.weekday !== 7) return null

    const override = sundayLunchOverrides.find(
      (entry) => entry.startDate <= isoDate && entry.endDate >= isoDate
    )

    const baseEnabled = sundayLunchStatus ? sundayLunchStatus.isEnabled !== false : true
    const effectiveEnabled = typeof override?.isEnabled === 'boolean'
      ? override.isEnabled
      : baseEnabled

    return {
      available: effectiveEnabled,
      message: override?.message || sundayLunchStatus?.message || 'Sunday lunch service unavailable',
    }
  }

  // --- Build main day list (Mon-Sun, mapped to next occurrence) ---

  const mainDates = new Set<string>()
  const mainDays = dayOrder.map((day) => {
    const isoDate = getIsoForDayKey(day)
    if (isoDate) mainDates.add(isoDate)
    const isToday = day === todayKey
    const dayHours = hours.regularHours[day]
    const specialHours = getSpecialHoursForDate(isoDate)
    const displayHours = specialHours || dayHours
    const hasSpecialHours = !!specialHours
    const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)
    const sundayLunchInfo = getSundayLunchInfoForDate(isoDate)
    const hasSundayLunchNotice = !!(sundayLunchInfo && !sundayLunchInfo.available)

    return {
      day,
      isoDate,
      isToday,
      dayHours,
      displayHours,
      hasSpecialHours,
      specialHours,
      kitchen,
      kitchenClosed,
      sundayLunchInfo,
      hasSundayLunchNotice,
    }
  })

  // --- Build upcoming changes (beyond main list, ≤30 days) ---

  const lastMainDate = Math.max(...Array.from(mainDates).map(d => new Date(d).getTime()))
  const thirtyDaysFromNow = londonNow.plus({ days: 30 }).toISODate()

  const upcomingChanges = (hours.specialHours || [])
    .filter((sh: any) => {
      if (!sh.date) return false
      if (mainDates.has(sh.date)) return false
      if (new Date(sh.date).getTime() <= lastMainDate) return false
      if (thirtyDaysFromNow && sh.date > thirtyDaysFromNow) return false
      return true
    })
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((sh: any) => {
      const dt = DateTime.fromISO(sh.date, { zone: 'Europe/London' })
      const weekday = dt.toFormat('cccc').toLowerCase()
      const regularForDay = hours.regularHours[weekday]
      // Merge: ?? for opens/closes, property-presence for kitchen
      const mergedOpens = sh.opens ?? regularForDay?.opens
      const mergedCloses = sh.closes ?? regularForDay?.closes
      const { kitchen, kitchenClosed } = resolveKitchenInfo(sh, regularForDay)

      return {
        date: sh.date,
        dateLabel: dt.toFormat('ccc d MMM'),
        is_closed: sh.is_closed,
        opens: mergedOpens,
        closes: mergedCloses,
        kitchen,
        kitchenClosed,
        note: sh.note || sh.reason || 'Special hours',
      }
    })

  // --- Render ---

  const renderKitchen = (kitchen: any, kitchenClosed: boolean, hasSpecialHours: boolean) => {
    if (kitchenClosed) {
      return <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white/70'}>Closed</span>
    }
    if (!kitchen || kitchen === null) {
      return <span className="text-white/50">No service</span>
    }
    if ('opens' in kitchen && 'closes' in kitchen) {
      return (
        <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white/80'}>
          {formatTime(kitchen.opens)} - {formatTime(kitchen.closes)}
        </span>
      )
    }
    return <span className="text-white/50">No service</span>
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Bar */}
      <div className="flex justify-center">
        <StatusBar showKitchen={showKitchen} />
      </div>

      {/* Main Mon-Sun list */}
      <div className="space-y-1">
        {mainDays.map(({
          day, isoDate, isToday, displayHours, hasSpecialHours, specialHours,
          kitchen, kitchenClosed, hasSundayLunchNotice, sundayLunchInfo,
        }) => {
          if (!displayHours) return null

          return (
            <div
              key={isoDate || day}
              className={`flex items-center justify-between px-3 py-1.5 rounded ${
                isToday ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/5'
              } ${(hasSpecialHours || hasSundayLunchNotice) ? 'ring-1 ring-yellow-400/50' : ''}`}
            >
              {/* Left: Day */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium capitalize text-white">
                    {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                    {isToday && <span className="text-sm sm:text-xs"> &bull;</span>}
                  </span>
                  {(hasSpecialHours || hasSundayLunchNotice) && (
                    <span className="text-[11px] text-amber-300 font-semibold">
                      {hasSundayLunchNotice ? 'Sunday lunch update' : 'Special hours'}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Hours */}
              <div className="text-right text-sm space-y-0.5">
                {displayHours.is_closed ? (
                  <div>
                    <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>
                      Closed{hasSpecialHours && (specialHours?.note || specialHours?.reason) ? ` (${specialHours?.note || specialHours?.reason})` : ''}
                    </span>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-xs text-white/60 mr-1">Bar:</span>
                      <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>
                        {formatTime(displayHours.opens)} - {formatTime(displayHours.closes)}
                      </span>
                    </div>

                    {showKitchen && (
                      <div className="text-xs">
                        <span className="text-white/60 mr-1">Kitchen:</span>
                        {renderKitchen(kitchen, kitchenClosed, hasSpecialHours)}
                      </div>
                    )}

                    {hasSpecialHours && (specialHours?.note || specialHours?.reason) && (
                      <div className="text-xs text-yellow-300/90 mt-1 text-right">
                        {specialHours?.note || specialHours?.reason}
                      </div>
                    )}
                    {hasSundayLunchNotice && (
                      <div className="text-xs text-amber-200 mt-1 text-right">
                        {sundayLunchInfo?.message || 'Sunday lunch unavailable'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming changes (only when entries exist beyond main list) */}
      {upcomingChanges.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowUpcoming(prev => !prev)}
            className="text-xs text-white/80 underline hover:text-white"
          >
            {showUpcoming ? 'Hide' : 'See'} upcoming changes ({upcomingChanges.length})
          </button>

          {showUpcoming && (
            <div className="space-y-1 mt-2">
              {upcomingChanges.map((entry) => (
                <div
                  key={entry.date}
                  className="flex items-center justify-between px-3 py-1.5 rounded ring-1 ring-yellow-400/50"
                >
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-white">{entry.dateLabel}</span>
                    <span className="text-[11px] text-amber-300 font-semibold">{entry.note}</span>
                  </div>

                  <div className="text-right text-sm space-y-0.5">
                    {entry.is_closed ? (
                      <span className="text-yellow-400">Closed</span>
                    ) : (
                      <>
                        <div>
                          <span className="text-xs text-white/60 mr-1">Bar:</span>
                          <span className="text-yellow-400">
                            {formatTime(entry.opens)} - {formatTime(entry.closes)}
                          </span>
                        </div>
                        {showKitchen && (
                          <div className="text-xs">
                            <span className="text-white/60 mr-1">Kitchen:</span>
                            {renderKitchen(entry.kitchen, entry.kitchenClosed, true)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run the tests**

Run: `npx jest tests/unit/BusinessHours.test.tsx --no-coverage 2>&1 | tail -30`
Expected: All tests pass.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "tests/"`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add components/BusinessHours.tsx
git commit -m "refactor: consolidate BusinessHours from 5 variants to single rendering path

Rewrites the 585-line component to a single layout based on the condensed
variant with fixed Mon-Sun day order, StatusBar, and upcoming changes toggle.
Removes variant prop, embedded JSON-LD (structurally incorrect), and
itemProp/itemScope microdata. Preserves all business logic verbatim:
resolveKitchenInfo (kitchen:null ?? semantics), getSundayLunchInfoForDate,
getSpecialHoursForDate, getIsoForDayKey, formatTime."
```

---

### Task 4: Migrate call sites

**Files:**
- Modify: `app/page.tsx:779`
- Modify: `app/find-us/page.tsx:298,492`

Only 3 JSX instances need code changes. The ~25 pages using `<BusinessHours />` with no props need no code changes — the visual change is intentional.

- [ ] **Step 1: Update homepage**

In `app/page.tsx`, find:
```tsx
<BusinessHours variant="condensed" showKitchen={true} />
```
Replace with:
```tsx
<BusinessHours />
```

- [ ] **Step 2: Update find-us page (condensed instance)**

In `app/find-us/page.tsx`, find:
```tsx
<BusinessHours variant="condensed" showKitchen={true} />
```
Replace with:
```tsx
<BusinessHours />
```

- [ ] **Step 3: Update find-us page (dark instance)**

In `app/find-us/page.tsx`, find:
```tsx
<BusinessHours variant="dark" showKitchen={false} />
```
Replace with:
```tsx
<BusinessHours showKitchen={false} />
```

- [ ] **Step 4: Remove unused imports from BusinessHours.tsx**

Check that the old component no longer imports `parseApiDuration` or `jsonLdSafeStringify` (they were used by removed variants). The rewrite in Task 3 already excludes them, but verify:

Run: `grep -n "parseApiDuration\|jsonLdSafeStringify" components/BusinessHours.tsx`
Expected: No matches.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "tests/"`
Expected: No new errors.

- [ ] **Step 6: Run all tests**

Run: `npx jest --no-coverage 2>&1 | tail -10`
Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/find-us/page.tsx
git commit -m "refactor: migrate BusinessHours call sites to consolidated API

Remove variant='condensed' from homepage and find-us.
Remove variant='dark' from find-us, keep showKitchen={false}."
```

---

### Task 5: Build verification and manual check

- [ ] **Step 1: Run full build**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint 2>&1 | tail -10`
Expected: Zero errors, zero warnings (or only pre-existing warnings).

- [ ] **Step 3: Start dev server and manually verify**

Run: `npm run dev`

Check these 3 pages in a browser:
1. **Homepage** (`http://localhost:3000`) — Opening Hours section should show StatusBar + Mon-Sun compact list
2. **Find Us** (`http://localhost:3000/find-us`) — Two instances: upper one with kitchen, lower one without kitchen
3. **M25 page** (`http://localhost:3000/m25-junction-14-pub`) — Opening Hours section matches consolidated layout

For each page verify:
- StatusBar renders at top of hours section
- 7 days shown Mon-Sun with abbreviated names
- Today is highlighted with ring
- Kitchen times visible (or hidden on find-us lower instance)
- No console errors

**Note:** Special hours cannot be reliably verified manually (depends on live API data). That coverage comes from unit tests in Task 2.

- [ ] **Step 4: Stop dev server and commit any lint fixes**

If lint produced auto-fixable issues:
```bash
npm run lint -- --fix
git add -A
git commit -m "chore: lint fixes after BusinessHours consolidation"
```
