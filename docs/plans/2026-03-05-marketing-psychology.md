# Marketing Psychology Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply marketing psychology principles across the site to increase food bookings (P1), event bookings (P2), and private hire enquiries (P3).

**Architecture:** Build five shared psychology components under `components/psychology/`, then wire them into P1/P2/P3 funnel pages with targeted copy rewrites. All claims sourced from `docs/claims.json`. Tone: confident family-run pub — never pushy or desperate.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, CVA, React Testing Library + Jest. Server components by default; `'use client'` only where interactivity is required.

**Design doc:** `docs/plans/2026-03-05-marketing-psychology-design.md`

---

## Critical context before you start

- `components/psychology/` does not exist yet — create it
- `app/booking-confirmation/page.tsx` just redirects to `/book-table` — the booking success state lives inside `ManagementTableBookingForm` (1300-line wizard in `components/features/TableBooking/ManagementTableBookingForm.tsx`). Apply confirmation psychology there, not to the redirect page.
- `FoodStickyCtaBar` already shows live kitchen status in the sticky bar — do not duplicate; `UrgencyKitchenStatus` is a separate above-fold inline component using server-derived props.
- `food-menu/page.tsx` already fetches `businessHours` server-side and has `revalidate = 3600`. Pass status as props to new components — avoids unnecessary client JS.
- Kitchen is closed Monday. Tue–Fri 16:00–21:00, Sat 12:00–19:00, Sun 13:00–18:00 (from `ops:food-service-hours` in `docs/claims.json`).
- Do NOT use the founding year 1866 — unverified, flagged in `claims.json`.
- `cn()` utility is in `lib/utils`. Import CVA from `class-variance-authority`.

---

## Task 1: Create `TrustBar` component

**Psychology:** Authority (BII award), Social proof, Availability heuristic (specific numbers)

**Files:**
- Create: `components/psychology/TrustBar.tsx`
- Create: `components/psychology/__tests__/TrustBar.test.tsx`
- Create: `components/psychology/index.ts`

**Step 1: Write the failing test**

```tsx
// components/psychology/__tests__/TrustBar.test.tsx
import { render, screen } from '@testing-library/react'
import { TrustBar } from '../TrustBar'

describe('TrustBar', () => {
  it('renders all three default trust signals', () => {
    render(<TrustBar />)
    expect(screen.getByText(/BII Sustainability Champion/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking/i)).toBeInTheDocument()
    expect(screen.getByText(/7 min from Heathrow/i)).toBeInTheDocument()
  })

  it('renders events variant signals', () => {
    render(<TrustBar variant="events" />)
    expect(screen.getByText(/Hosted by Nikki Manfadge/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking/i)).toBeInTheDocument()
    expect(screen.getByText(/Bar open all night/i)).toBeInTheDocument()
  })

  it('renders private-hire variant signals', () => {
    render(<TrustBar variant="private-hire" />)
    expect(screen.getByText(/up to 200 guests/i)).toBeInTheDocument()
    expect(screen.getByText(/BII Sustainability Champion/i)).toBeInTheDocument()
    expect(screen.getByText(/Free parking for all guests/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TrustBar className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="TrustBar" --no-coverage
```
Expected: FAIL — `TrustBar` not found.

**Step 3: Implement `TrustBar`**

```tsx
// components/psychology/TrustBar.tsx
import { cn } from '@/lib/utils'

type TrustBarVariant = 'food' | 'events' | 'private-hire'

interface TrustBarProps {
  variant?: TrustBarVariant
  className?: string
}

const SIGNALS: Record<TrustBarVariant, Array<{ icon: string; text: string }>> = {
  food: [
    { icon: '🏆', text: 'BII Sustainability Champion' },
    { icon: '🅿️', text: 'Free parking for 20 cars' },
    { icon: '✈️', text: '7 min from Heathrow T5' },
  ],
  events: [
    { icon: '🎤', text: 'Hosted by Nikki Manfadge' },
    { icon: '🅿️', text: 'Free parking' },
    { icon: '🍺', text: 'Bar open all night' },
  ],
  'private-hire': [
    { icon: '👥', text: 'Space for up to 200 guests' },
    { icon: '🏆', text: 'BII Sustainability Champion' },
    { icon: '🅿️', text: 'Free parking for all guests' },
  ],
}

export function TrustBar({ variant = 'food', className }: TrustBarProps) {
  const signals = SIGNALS[variant]

  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-x-6 gap-y-2 py-3 px-4',
        'bg-anchor-green/5 border-y border-anchor-green/10',
        className
      )}
    >
      {signals.map(({ icon, text }) => (
        <span
          key={text}
          className="flex items-center gap-1.5 text-sm font-medium text-anchor-green"
        >
          <span aria-hidden="true">{icon}</span>
          {text}
        </span>
      ))}
    </div>
  )
}
```

**Step 4: Create barrel export**

```ts
// components/psychology/index.ts
export { TrustBar } from './TrustBar'
```

**Step 5: Run tests to confirm pass**

```bash
npm test -- --testPathPattern="TrustBar" --no-coverage
```
Expected: PASS (4 tests).

**Step 6: Commit**

```bash
git add components/psychology/TrustBar.tsx components/psychology/__tests__/TrustBar.test.tsx components/psychology/index.ts
git commit -m "feat(psychology): add TrustBar component"
```

---

## Task 2: Create `ValueProofStrip` component

**Psychology:** Anchoring (ULEZ £12.50 saves money), Reciprocity (free things), Zero-price effect

**Files:**
- Create: `components/psychology/ValueProofStrip.tsx`
- Create: `components/psychology/__tests__/ValueProofStrip.test.tsx`
- Modify: `components/psychology/index.ts`

**Step 1: Write the failing test**

```tsx
// components/psychology/__tests__/ValueProofStrip.test.tsx
import { render, screen } from '@testing-library/react'
import { ValueProofStrip } from '../ValueProofStrip'

describe('ValueProofStrip', () => {
  it('renders food variant with ULEZ saving', () => {
    render(<ValueProofStrip variant="food" />)
    expect(screen.getByText(/Skip the ULEZ charge/i)).toBeInTheDocument()
    expect(screen.getByText(/£12\.50/)).toBeInTheDocument()
    expect(screen.getByText(/Free on-site parking/i)).toBeInTheDocument()
    expect(screen.getByText(/Free WiFi/i)).toBeInTheDocument()
  })

  it('renders private-hire variant with guest-focused copy', () => {
    render(<ValueProofStrip variant="private-hire" />)
    expect(screen.getByText(/Free parking for all your guests/i)).toBeInTheDocument()
    expect(screen.getByText(/Outside ULEZ/i)).toBeInTheDocument()
    expect(screen.getByText(/Free WiFi throughout/i)).toBeInTheDocument()
  })

  it('renders with default food variant when no variant given', () => {
    render(<ValueProofStrip />)
    expect(screen.getByText(/Skip the ULEZ charge/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="ValueProofStrip" --no-coverage
```
Expected: FAIL.

**Step 3: Implement `ValueProofStrip`**

```tsx
// components/psychology/ValueProofStrip.tsx
import { cn } from '@/lib/utils'

type ValueProofVariant = 'food' | 'private-hire'

interface ValueProofStripProps {
  variant?: ValueProofVariant
  className?: string
}

const ITEMS: Record<ValueProofVariant, Array<{ icon: string; text: string }>> = {
  food: [
    { icon: '💷', text: 'Skip the ULEZ charge (£12.50/day)' },
    { icon: '🅿️', text: 'Free on-site parking' },
    { icon: '📶', text: 'Free WiFi throughout' },
  ],
  'private-hire': [
    { icon: '🅿️', text: 'Free parking for all your guests' },
    { icon: '💷', text: 'Outside ULEZ — saves each driver £12.50' },
    { icon: '📶', text: 'Free WiFi throughout' },
  ],
}

export function ValueProofStrip({ variant = 'food', className }: ValueProofStripProps) {
  const items = ITEMS[variant]

  return (
    <div
      className={cn(
        'rounded-xl border border-anchor-gold/30 bg-anchor-gold/5 px-4 py-3',
        className
      )}
    >
      <ul className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1.5">
        {items.map(({ icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-1.5 text-sm text-gray-700"
          >
            <span aria-hidden="true">{icon}</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Step 4: Update barrel export**

Add to `components/psychology/index.ts`:
```ts
export { ValueProofStrip } from './ValueProofStrip'
```

**Step 5: Run tests**

```bash
npm test -- --testPathPattern="ValueProofStrip" --no-coverage
```
Expected: PASS (3 tests).

**Step 6: Commit**

```bash
git add components/psychology/ValueProofStrip.tsx components/psychology/__tests__/ValueProofStrip.test.tsx components/psychology/index.ts
git commit -m "feat(psychology): add ValueProofStrip component"
```

---

## Task 3: Create `RegretReduction` component

**Psychology:** Regret aversion, Status-quo bias reduction — removes commitment fear before forms

**Files:**
- Create: `components/psychology/RegretReduction.tsx`
- Create: `components/psychology/__tests__/RegretReduction.test.tsx`
- Modify: `components/psychology/index.ts`

**Step 1: Write the failing test**

```tsx
// components/psychology/__tests__/RegretReduction.test.tsx
import { render, screen } from '@testing-library/react'
import { RegretReduction } from '../RegretReduction'

describe('RegretReduction', () => {
  it('renders booking variant reassurances', () => {
    render(<RegretReduction variant="booking" />)
    expect(screen.getByText(/Free to cancel/i)).toBeInTheDocument()
    expect(screen.getByText(/No card required/i)).toBeInTheDocument()
    expect(screen.getByText(/Confirmation in seconds/i)).toBeInTheDocument()
  })

  it('renders enquiry variant reassurances', () => {
    render(<RegretReduction variant="enquiry" />)
    expect(screen.getByText(/No commitment/i)).toBeInTheDocument()
    expect(screen.getByText(/just a conversation/i)).toBeInTheDocument()
    expect(screen.getByText(/24 hours/i)).toBeInTheDocument()
  })

  it('renders booking variant by default', () => {
    render(<RegretReduction />)
    expect(screen.getByText(/Free to cancel/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="RegretReduction" --no-coverage
```
Expected: FAIL.

**Step 3: Implement `RegretReduction`**

```tsx
// components/psychology/RegretReduction.tsx
import { cn } from '@/lib/utils'

type RegretVariant = 'booking' | 'enquiry'

interface RegretReductionProps {
  variant?: RegretVariant
  className?: string
}

const SIGNALS: Record<RegretVariant, Array<{ icon: string; text: string }>> = {
  booking: [
    { icon: '✓', text: 'Free to cancel' },
    { icon: '✓', text: 'No card required' },
    { icon: '✓', text: 'Confirmation in seconds' },
  ],
  enquiry: [
    { icon: '✓', text: 'No commitment — just a conversation' },
    { icon: '✓', text: "We'll get back to you within 24 hours" },
    { icon: '✓', text: 'Free parking for all your guests' },
  ],
}

export function RegretReduction({ variant = 'booking', className }: RegretReductionProps) {
  const signals = SIGNALS[variant]

  return (
    <div
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600',
        className
      )}
    >
      {signals.map(({ icon, text }) => (
        <span key={text} className="flex items-center gap-1">
          <span className="font-semibold text-anchor-green" aria-hidden="true">
            {icon}
          </span>
          {text}
        </span>
      ))}
    </div>
  )
}
```

**Step 4: Update barrel export**

Add to `components/psychology/index.ts`:
```ts
export { RegretReduction } from './RegretReduction'
```

**Step 5: Run tests**

```bash
npm test -- --testPathPattern="RegretReduction" --no-coverage
```
Expected: PASS (3 tests).

**Step 6: Commit**

```bash
git add components/psychology/RegretReduction.tsx components/psychology/__tests__/RegretReduction.test.tsx components/psychology/index.ts
git commit -m "feat(psychology): add RegretReduction component"
```

---

## Task 4: Create `UrgencyKitchenStatus` component

**Psychology:** Loss aversion, Present bias — real kitchen hours as helpful information, never as pressure

**Key design:** This is a server-renderable display component. The food-menu page already fetches `businessHours` server-side. Derive kitchen state and pass as props. No `'use client'` needed.

**Files:**
- Create: `components/psychology/UrgencyKitchenStatus.tsx`
- Create: `components/psychology/__tests__/UrgencyKitchenStatus.test.tsx`
- Modify: `components/psychology/index.ts`

**Step 1: Write the failing test**

```tsx
// components/psychology/__tests__/UrgencyKitchenStatus.test.tsx
import { render, screen } from '@testing-library/react'
import { UrgencyKitchenStatus } from '../UrgencyKitchenStatus'

describe('UrgencyKitchenStatus', () => {
  it('renders nothing when status is null', () => {
    const { container } = render(<UrgencyKitchenStatus status={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders closed-today message with booking nudge', () => {
    render(<UrgencyKitchenStatus status={{ type: 'closed-today' }} />)
    expect(screen.getByText(/Kitchen's having a rest today/i)).toBeInTheDocument()
    expect(screen.getByText(/book for another day/i)).toBeInTheDocument()
  })

  it('renders opens-later message with time', () => {
    render(<UrgencyKitchenStatus status={{ type: 'opens-later', opensAt: '4pm' }} />)
    expect(screen.getByText(/Kitchen opens at 4pm/i)).toBeInTheDocument()
    expect(screen.getByText(/reserve your table now/i)).toBeInTheDocument()
  })

  it('renders open message when kitchen is open and not near closing', () => {
    render(<UrgencyKitchenStatus status={{ type: 'open', closesAt: '9pm' }} />)
    expect(screen.getByText(/Kitchen open until 9pm/i)).toBeInTheDocument()
  })

  it('renders closing-soon message when within 2 hours of close', () => {
    render(<UrgencyKitchenStatus status={{ type: 'closing-soon', closesAt: '9pm' }} />)
    expect(screen.getByText(/Kitchen closes at 9pm/i)).toBeInTheDocument()
    expect(screen.getByText(/don't leave it too late/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="UrgencyKitchenStatus" --no-coverage
```
Expected: FAIL.

**Step 3: Implement `UrgencyKitchenStatus`**

```tsx
// components/psychology/UrgencyKitchenStatus.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type KitchenStatusData =
  | null
  | { type: 'closed-today' }
  | { type: 'opens-later'; opensAt: string }
  | { type: 'open'; closesAt: string }
  | { type: 'closing-soon'; closesAt: string }

interface UrgencyKitchenStatusProps {
  status: KitchenStatusData
  className?: string
}

interface StatusConfig {
  icon: string
  message: string
  subtext?: string
  showBookingLink: boolean
  colorClass: string
}

function getConfig(status: NonNullable<KitchenStatusData>): StatusConfig {
  switch (status.type) {
    case 'closed-today':
      return {
        icon: '🕐',
        message: "Kitchen's having a rest today",
        subtext: 'book for another day',
        showBookingLink: true,
        colorClass: 'text-gray-600 bg-gray-50 border-gray-200',
      }
    case 'opens-later':
      return {
        icon: '🍽️',
        message: `Kitchen opens at ${status.opensAt}`,
        subtext: 'reserve your table now',
        showBookingLink: true,
        colorClass: 'text-anchor-green bg-anchor-green/5 border-anchor-green/20',
      }
    case 'open':
      return {
        icon: '✅',
        message: `Kitchen open until ${status.closesAt}`,
        showBookingLink: false,
        colorClass: 'text-green-700 bg-green-50 border-green-200',
      }
    case 'closing-soon':
      return {
        icon: '⏰',
        message: `Kitchen closes at ${status.closesAt}`,
        subtext: "don't leave it too late",
        showBookingLink: true,
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      }
  }
}

export function UrgencyKitchenStatus({ status, className }: UrgencyKitchenStatusProps) {
  if (!status) return null

  const config = getConfig(status)

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
        config.colorClass,
        className
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span className="font-medium">{config.message}</span>
      {config.subtext && config.showBookingLink && (
        <>
          <span className="text-gray-400">—</span>
          <Link
            href="/book-table"
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            {config.subtext}
          </Link>
        </>
      )}
      {config.subtext && !config.showBookingLink && (
        <span className="text-gray-500">{config.subtext}</span>
      )}
    </div>
  )
}
```

**Step 4: Update barrel export**

Add to `components/psychology/index.ts`:
```ts
export { UrgencyKitchenStatus } from './UrgencyKitchenStatus'
export type { KitchenStatusData } from './UrgencyKitchenStatus'
```

**Step 5: Run tests**

```bash
npm test -- --testPathPattern="UrgencyKitchenStatus" --no-coverage
```
Expected: PASS (5 tests).

**Step 6: Commit**

```bash
git add components/psychology/UrgencyKitchenStatus.tsx components/psychology/__tests__/UrgencyKitchenStatus.test.tsx components/psychology/index.ts
git commit -m "feat(psychology): add UrgencyKitchenStatus component"
```

---

## Task 5: Create `PsychBadge` component

**Psychology:** Authority, Social proof, Zero-price effect — for event cards and hero sections

**Files:**
- Create: `components/psychology/PsychBadge.tsx`
- Create: `components/psychology/__tests__/PsychBadge.test.tsx`
- Modify: `components/psychology/index.ts`

**Step 1: Write the failing test**

```tsx
// components/psychology/__tests__/PsychBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { PsychBadge } from '../PsychBadge'

describe('PsychBadge', () => {
  it('renders free variant', () => {
    render(<PsychBadge variant="free" />)
    const badge = screen.getByText('Free entry')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100')
  })

  it('renders authority variant', () => {
    render(<PsychBadge variant="authority" label="BII Award Winner" />)
    expect(screen.getByText('BII Award Winner')).toBeInTheDocument()
  })

  it('renders price variant with custom label', () => {
    render(<PsychBadge variant="price" label="£3 per person" />)
    expect(screen.getByText('£3 per person')).toBeInTheDocument()
  })

  it('renders prize variant', () => {
    render(<PsychBadge variant="prize" label="Cash prizes" />)
    expect(screen.getByText('Cash prizes')).toBeInTheDocument()
  })

  it('uses default label when none provided', () => {
    render(<PsychBadge variant="free" />)
    expect(screen.getByText('Free entry')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="PsychBadge" --no-coverage
```
Expected: FAIL.

**Step 3: Implement `PsychBadge`**

```tsx
// components/psychology/PsychBadge.tsx
import { cn } from '@/lib/utils'

type PsychBadgeVariant = 'free' | 'authority' | 'price' | 'prize'

interface PsychBadgeProps {
  variant: PsychBadgeVariant
  label?: string
  className?: string
}

const DEFAULTS: Record<PsychBadgeVariant, { label: string; className: string; icon: string }> = {
  free: {
    label: 'Free entry',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎟️',
  },
  authority: {
    label: 'Award winning',
    className: 'bg-anchor-gold/10 text-anchor-gold border-anchor-gold/30',
    icon: '🏆',
  },
  price: {
    label: 'Great value',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '💷',
  },
  prize: {
    label: 'Prizes every round',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '🎉',
  },
}

export function PsychBadge({ variant, label, className }: PsychBadgeProps) {
  const defaults = DEFAULTS[variant]
  const displayLabel = label ?? defaults.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        defaults.className,
        className
      )}
    >
      <span aria-hidden="true">{defaults.icon}</span>
      {displayLabel}
    </span>
  )
}
```

**Step 4: Update barrel export**

Add to `components/psychology/index.ts`:
```ts
export { PsychBadge } from './PsychBadge'
```

**Step 5: Run tests**

```bash
npm test -- --testPathPattern="PsychBadge" --no-coverage
```
Expected: PASS (5 tests).

**Step 6: Run all psychology tests together**

```bash
npm test -- --testPathPattern="psychology" --no-coverage
```
Expected: All pass.

**Step 7: Commit**

```bash
git add components/psychology/PsychBadge.tsx components/psychology/__tests__/PsychBadge.test.tsx components/psychology/index.ts
git commit -m "feat(psychology): add PsychBadge component"
```

---

## Task 6: Wire psychology into `food-menu` page (P1 entry)

**Psychology:** JTBD framing (hero copy already mostly right — tweak), Loss aversion (UrgencyKitchenStatus), Anchoring + Reciprocity (ValueProofStrip), Authority (TrustBar)

**Files:**
- Modify: `app/food-menu/page.tsx`

**Step 1: Add a helper to derive `KitchenStatusData` from server-fetched `businessHours`**

At the top of `app/food-menu/page.tsx`, after the existing imports and helpers, add this function:

```tsx
import { UrgencyKitchenStatus, TrustBar, ValueProofStrip } from '@/components/psychology'
import type { KitchenStatusData } from '@/components/psychology'
```

Then add the helper function (after `buildKitchenSchedule` around line 109):

```tsx
function deriveKitchenStatusData(hours: BusinessHours | null): KitchenStatusData {
  if (!hours) return null

  const londonNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }))
  const day = londonNow.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  // Monday — kitchen always closed
  if (day === 1) return { type: 'closed-today' }

  const dayKey: keyof typeof hours.regularHours =
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day] as keyof typeof hours.regularHours

  const dayHours = hours.regularHours[dayKey]
  if (!dayHours || dayHours.is_closed) return { type: 'closed-today' }

  const kitchen = (dayHours as any).kitchen
  if (!kitchen || (kitchen as any).is_closed) return { type: 'closed-today' }

  if (!kitchen.opens || !kitchen.closes) return null

  const nowMinutes = londonNow.getHours() * 60 + londonNow.getMinutes()
  const [openH, openM] = kitchen.opens.split(':').map(Number)
  const [closeH, closeM] = kitchen.closes.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const closesAtFormatted = formatTime12Hour(kitchen.closes)
  const opensAtFormatted = formatTime12Hour(kitchen.opens)

  if (nowMinutes < openMinutes) {
    return { type: 'opens-later', opensAt: opensAtFormatted }
  }
  if (nowMinutes >= closeMinutes) {
    return { type: 'closed-today' }
  }
  // Within 2 hours of closing
  if (closeMinutes - nowMinutes <= 120) {
    return { type: 'closing-soon', closesAt: closesAtFormatted }
  }
  return { type: 'open', closesAt: closesAtFormatted }
}
```

**Step 2: Derive the status in the page component**

In `FoodMenuPage()`, after the existing data fetching (around line 164), add:

```tsx
const kitchenStatusData = deriveKitchenStatusData(businessHours)
```

**Step 3: Add components to the JSX**

After the `<HeroWrapper>` closing tag (find it by locating `secondaryInfo` prop — it ends around line 280), add immediately after:

```tsx
<TrustBar variant="food" />

{kitchenStatusData && (
  <div className="mx-auto max-w-5xl px-4 py-3">
    <UrgencyKitchenStatus status={kitchenStatusData} />
  </div>
)}
```

Before the menu sections (find the `<Section>` containing the allergen filter or menu anchor nav), add:

```tsx
<div className="mx-auto max-w-5xl px-4 pb-2">
  <ValueProofStrip variant="food" />
</div>
```

**Step 4: Tweak hero CTA copy**

Find the `BookTableButton` in the hero (around line 254) with `children="Book a Table"`. Change to:
```tsx
Reserve Your Table
```

Find the `secondaryInfo` prop text (around line 277):
```tsx
// Change from:
Working nearby or passing through Heathrow? Pop in for proper pub food, quick service, and free parking.
// Change to:
Proper pub food a stone's throw from Heathrow. Free parking, free WiFi, and kitchen open every evening.
```

**Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```
Expected: Builds successfully, no TypeScript errors.

**Step 6: Lint check**

```bash
npm run lint 2>&1 | tail -10
```
Expected: No errors.

**Step 7: Commit**

```bash
git add app/food-menu/page.tsx
git commit -m "feat(psychology): wire psychology signals into food-menu page (P1)"
```

---

## Task 7: Wire psychology into `book-table` page (P1 conversion)

**Psychology:** Regret aversion (RegretReduction), Anchoring + Reciprocity (ValueProofStrip), Mimetic desire (social proof line), Goal-gradient (progress text in form)

**Files:**
- Modify: `app/book-table/page.tsx`

**Step 1: Add imports**

At the top of `app/book-table/page.tsx`:

```tsx
import { RegretReduction, ValueProofStrip } from '@/components/psychology'
```

**Step 2: Add `RegretReduction` above the booking form**

Find the `<Section background="gray"` section (around line 157) containing `ManagementTableBookingForm`. Add `RegretReduction` directly above the form div:

```tsx
<div className="order-1">
  <div className="mb-4">
    <RegretReduction variant="booking" />
  </div>
  <ManagementTableBookingForm prefill={prefill} />
</div>
```

**Step 3: Add `ValueProofStrip` to the desktop sidebar**

In the aside (around line 163), before the existing "Useful to know" card, add a new card:

```tsx
<div className="hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:block">
  <h3 className="text-base font-semibold text-anchor-green mb-3">Why The Anchor?</h3>
  <ValueProofStrip variant="food" />
</div>
```

**Step 4: Add social proof line to the page intro**

Find the `<p>` tag below `<PageTitle>` (around line 154):
```tsx
// Change from:
<p className="mt-3 text-base text-gray-700 md:text-lg">Choose your date, time, and party size to reserve your table.</p>
// Change to:
<p className="mt-3 text-base text-gray-700 md:text-lg">
  Choose your date, time, and party size to reserve your table. Loved by locals and Heathrow travellers every week.
</p>
```

**Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```
Expected: Clean build.

**Step 6: Commit**

```bash
git add app/book-table/page.tsx
git commit -m "feat(psychology): wire psychology signals into book-table page (P1)"
```

---

## Task 8: Wire psychology into `ManagementTableBookingForm` — progress indicator and success state (P1 confirmation)

**Psychology:** Goal-gradient + Zeigarnik (progress indicator), Peak-End Rule + Commitment/Consistency (success state)

**Files:**
- Modify: `components/features/TableBooking/ManagementTableBookingForm.tsx`

**Step 1: Read the file to understand the step structure**

Before editing, read the file to find:
- How many steps the form has (look for a `step` state variable or `STEPS` constant)
- Where the step number is tracked
- Where the success/confirmation state is rendered

```bash
grep -n "step\|Step\|STEP\|success\|confirmation\|complete" components/features/TableBooking/ManagementTableBookingForm.tsx | head -40
```

**Step 2: Add a `BookingProgressBar` helper inside the file**

After identifying the step count and current step variable, add a progress indicator component at the top of the file (before the main component):

```tsx
function BookingProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  const isAlmostDone = currentStep >= totalSteps - 1

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Step {currentStep} of {totalSteps}</span>
        {isAlmostDone && <span className="text-anchor-green font-medium">Almost there!</span>}
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-anchor-green transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        />
      </div>
    </div>
  )
}
```

**Step 3: Render `BookingProgressBar` in the form JSX**

Place it at the top of the form's rendered output, above the first step content. Use the existing step state variable and total step count.

**Step 4: Enhance the success state**

Find the success/confirmation rendering (search for text like "booking" + "confirmed" or "success"). Update the success headline and add arrival expectations:

```tsx
// Change the success headline from whatever it currently is to:
<h2 className="text-2xl font-bold text-anchor-green">You're all booked in — see you soon!</h2>

// Add below the booking details:
<div className="mt-4 rounded-xl bg-anchor-green/5 border border-anchor-green/10 p-4 text-sm text-gray-700 space-y-1">
  <p className="font-semibold text-anchor-green">When you arrive:</p>
  <p>• Free parking right outside — no ticket needed</p>
  <p>• No need to check in — just head to the bar and we'll find you a table</p>
  <p>• If anything changes, give us a ring on 01753 682707</p>
</div>
```

**Step 5: Build and type check**

```bash
npm run build 2>&1 | tail -20
npx tsc --noEmit 2>&1 | tail -10
```
Expected: Clean.

**Step 6: Commit**

```bash
git add components/features/TableBooking/ManagementTableBookingForm.tsx
git commit -m "feat(psychology): add progress indicator and enhanced success state to booking form (P1)"
```

---

## Task 9: P2 — Wire psychology into `/events` listing page

**Psychology:** PsychBadge on event cards, Unity/mimetic desire in copy, TrustBar events variant

**Files:**
- Modify: `app/events/page.tsx`

**Step 1: Read the events listing page**

```bash
head -80 app/events/page.tsx
```

Understand the structure — look for where event cards are rendered and where the hero is.

**Step 2: Add imports**

```tsx
import { TrustBar, PsychBadge } from '@/components/psychology'
```

**Step 3: Add `TrustBar` (events variant) below the hero**

After the `<HeroWrapper>` for the events page, add:

```tsx
<TrustBar variant="events" />
```

**Step 4: Update hero or intro copy**

Find any intro paragraph or subheading. Add or update to include:

```
Join your neighbours for a proper night out
```

If no suitable location exists for this copy, add it as a `<p>` in a `<Section>` immediately after the TrustBar.

**Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

**Step 6: Commit**

```bash
git add app/events/page.tsx
git commit -m "feat(psychology): wire psychology signals into events listing page (P2)"
```

---

## Task 10: P2 — Wire psychology into event detail pages

**Psychology:** JTBD headlines, Loss aversion via real specifics, Pratfall Effect (quiz second-from-last prize), Zero-price effect (music bingo)

**Files:**
- Modify: `app/cash-bingo/page.tsx`
- Modify: `app/quiz-night/page.tsx` (check if this exists: `ls app/ | grep quiz`)
- Modify: `app/events/[id]/page.tsx` for dynamic events

**Step 1: Check what event pages exist**

```bash
ls app/ | grep -i "bingo\|quiz\|drag\|music"
```

**Step 2: For each event page found, add `RegretReduction` above the booking CTA**

In each event detail page, find the booking CTA section and add above it:

```tsx
import { RegretReduction } from '@/components/psychology'
// ...
<RegretReduction variant="booking" className="mb-4" />
```

**Step 3: Update Cash Bingo page hero/intro copy (JTBD)**

Find the hero title/description. Update:
- Title: "Win Cash, Have a Laugh" (or keep existing if already good — check first)
- Highlight: "£10 cash book covers all 10 games" — frame as value, not cost
- Highlight: "The snowball jackpot grows every month it rolls over" — genuine urgency

**Step 4: Update Quiz Night page copy (if page exists)**

- Headline: "A Proper Night Out With Your Team"
- "Teams of up to 6 — grab your spot before it fills" (real loss aversion)
- Keep the second-from-last prize (bottle of wine) prominent — leave it in, it's the Pratfall Effect in action

**Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

**Step 6: Commit**

```bash
git add app/cash-bingo/page.tsx
git commit -m "feat(psychology): wire psychology signals into event detail pages (P2)"
```

---

## Task 11: P3 — Wire psychology into private hire pages

**Psychology:** Door-in-the-face anchoring (capacity high first), ValueProofStrip private-hire variant, Authority (BII award), RegretReduction on enquiry form

**Files:**
- Modify: `app/corporate-events/page.tsx`
- Modify: `app/christmas-parties/page.tsx`
- Modify: `app/function-room-hire/page.tsx`

**Step 1: Add imports to each private hire page**

```tsx
import { TrustBar, ValueProofStrip, RegretReduction } from '@/components/psychology'
```

**Step 2: Add `TrustBar` (private-hire variant) below each hero**

```tsx
<TrustBar variant="private-hire" />
```

**Step 3: Add `ValueProofStrip` (private-hire variant) before the enquiry form or CTA**

```tsx
<ValueProofStrip variant="private-hire" className="mb-6" />
```

**Step 4: Add `RegretReduction` (enquiry variant) above any contact/enquiry form**

```tsx
<RegretReduction variant="enquiry" className="mb-4" />
```

**Step 5: Check hero copy leads with capacity anchor**

For each page, verify the hero description mentions "up to 200 guests" or equivalent. If it says something smaller or vaguer, update it to lead with the full capacity claim (verified: `usp:versatile-spaces` in `claims.json` — "10–200 guests").

**Step 6: Add self-qualification capacity guide (reciprocity before ask)**

In a section before the enquiry form on `function-room-hire/page.tsx` (or whichever page has the most direct enquiry path), add a simple guide:

```tsx
<div className="rounded-xl bg-anchor-green/5 border border-anchor-green/10 p-5 mb-6">
  <h3 className="font-semibold text-anchor-green mb-3">Which space suits your event?</h3>
  <ul className="space-y-2 text-sm text-gray-700">
    <li>• <strong>10–50 guests</strong> — our private dining room, ideal for dinners and celebrations</li>
    <li>• <strong>50–200 guests</strong> — full venue hire, perfect for large parties and corporate events</li>
  </ul>
</div>
```

**Step 7: Build and type check**

```bash
npm run build 2>&1 | tail -20
npx tsc --noEmit 2>&1 | tail -10
```
Expected: Clean.

**Step 8: Commit**

```bash
git add app/corporate-events/page.tsx app/christmas-parties/page.tsx app/function-room-hire/page.tsx
git commit -m "feat(psychology): wire psychology signals into private hire pages (P3)"
```

---

## Task 12: Run full test suite and verify

**Step 1: Run all tests**

```bash
npm test -- --no-coverage
```
Expected: All pass, no regressions.

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors.

**Step 3: Run lint**

```bash
npm run lint
```
Expected: No errors.

**Step 4: Run build**

```bash
npm run build
```
Expected: Successful build.

**Step 5: Final commit if anything was missed**

```bash
git status
# Stage any unstaged changes, then:
git commit -m "chore(psychology): final cleanup after marketing psychology implementation"
```

---

## Tone sanity check (apply throughout)

Before committing any copy change, ask: **"Would a confident, welcoming local pub say this naturally?"**

- ✅ "Kitchen's having a rest today — book for another day"
- ✅ "Win cash, have a laugh"
- ✅ "You're all booked in — see you soon!"
- ❌ "Only 3 spots left — book NOW before it's too late!!!"
- ❌ "Don't miss out on this AMAZING opportunity"
- ❌ "Hurry — kitchen closes in 47 minutes"

If it reads like an e-commerce flash sale, rewrite it.
