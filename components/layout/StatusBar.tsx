'use client'

import { cn } from '@/lib/utils'
import { useBusinessHours } from '@/hooks/useBusinessHours'
import { PhoneLink } from '@/components/PhoneLink'
import { CONTACT } from '@/lib/constants'
import { formatTime12Hour, getTodayHours, getTomorrowHours, findNextKitchenOpening } from '@/lib/status-boundary-calculator'
import { KitchenStatus } from '@/lib/api'
import { getKitchenWindows } from '@/lib/hours-utils'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import {
  STATIC_BAR_HOURS_SHORT,
  STATIC_KITCHEN_HOURS_SHORT
} from '@/lib/business-hours-fallback'
import {
  getTodayPlaneSpottingWindow,
  PLANE_SPOTTING_COMPACT_CAVEAT
} from '@/lib/heathrow-runway-alternation'

/**
 * StatusBar — live "Bar / Kitchen / Planes" status row.
 *
 * Redesign §5.6: two presentation variants only.
 *   - `nav`  — inline rows on the desktop utility strip, ink text on the cream surface.
 *   - `pill` — standalone green pill (homepage hero / mobile drawer) with gold border.
 *
 * ALL data logic is preserved verbatim from the previous implementation:
 * `useBusinessHours` / `BusinessHoursProvider`, the 60s + boundary-scheduled refresh,
 * `??`-based kitchen resolution, and the static fallback from `business-hours-fallback`.
 * Only the markup/styling changed.
 */

type StatusDot = 'open' | 'warning' | 'closed'

interface StatusBarProps {
  /** `nav` for the utility strip (inline, ink); `pill` for a standalone green pill. */
  variant?: 'nav' | 'pill'
  showKitchen?: boolean
  /** Show the plane-spotting row. Defaults to true for `nav`. */
  showPlaneSpotting?: boolean
  className?: string
  apiEndpoint?: string
}

// Fixed open-state green from the spec (not a token — a deliberate exact value).
const OPEN_DOT = '#2fbf71'

/**
 * Check if kitchen has opening hours
 */
function isKitchenOpen(kitchen: KitchenStatus): kitchen is { opens: string; closes: string } {
  return kitchen !== null && 'opens' in kitchen && 'closes' in kitchen
}

/**
 * Check if kitchen is explicitly closed
 */
function isKitchenClosed(kitchen: KitchenStatus): boolean {
  return kitchen !== null && 'is_closed' in kitchen && kitchen.is_closed === true
}

function minutesOfDay(time: string): number {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(time).trim())
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * Minutes since midnight in Europe/London.
 *
 * This runs in the browser, so the visitor's own clock is the wrong reference:
 * a customer reading the site from another timezone must still be told the
 * pub's hours in the pub's time.
 */
function londonMinutesNow(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date())
  return minutesOfDay(parts)
}

function resolveTodaySchedule(hours: any) {
  const todayFromApi = hours?.today
  if (todayFromApi && typeof todayFromApi === 'object' && ('opens' in todayFromApi || 'closes' in todayFromApi)) {
    return todayFromApi
  }
  return getTodayHours(hours)
}

function getBarStatus(hours: any): string {
  const { currentStatus } = hours
  const todayHours = resolveTodaySchedule(hours)

  if (currentStatus.isOpen) {
    const closes = todayHours?.closes
    if (closes) {
      return `Bar: Open · closes ${formatTime12Hour(closes)}`
    }
    return 'Bar: Open'
  }

  if (todayHours?.opens && !todayHours.is_closed) {
    const now = new Date()
    const [openHour, openMin] = todayHours.opens.split(':').map(Number)
    const openingTime = new Date()
    openingTime.setHours(openHour, openMin, 0, 0)

    if (openingTime > now) {
      return `Bar: Opens at ${formatTime12Hour(todayHours.opens)}`
    }
  }

  const tomorrowHours = getTomorrowHours(hours)
  if (tomorrowHours?.opens && !tomorrowHours.is_closed) {
    return `Bar: Opens tomorrow at ${formatTime12Hour(tomorrowHours.opens)}`
  }

  return 'Bar: Closed'
}

/**
 * Get kitchen status with robust null handling.
 * `kitchen === null` / `is_kitchen_closed` are deliberate "closed" signals — never
 * fall through to regular hours (the `??` discipline from CLAUDE.md is encoded here).
 */
function getKitchenStatus(hours: any): {
  status: string
  indicator: StatusDot
} {
  const { currentStatus } = hours
  const todayHours = resolveTodaySchedule(hours)

  const futureOpeningMessage = (
    fallbackStatus: string,
    fallbackIndicator: StatusDot = 'closed',
    options: { includeToday?: boolean } = {}
  ): { status: string; indicator: StatusDot } => {
    const nextOpening = findNextKitchenOpening(hours, {
      includeToday: options.includeToday ?? false
    })

    if (!nextOpening) {
      return {
        status: fallbackStatus,
        indicator: fallbackIndicator
      }
    }

    const timeLabel = formatTime12Hour(nextOpening.opens)
    const whenLabel =
      nextOpening.offset === 0
        ? `at ${timeLabel}`
        : nextOpening.offset === 1
          ? `tomorrow at ${timeLabel}`
          : `${nextOpening.dayName} at ${timeLabel}`

    return {
      status: `Kitchen: Opens ${whenLabel}`,
      indicator: currentStatus.isOpen ? 'warning' : 'closed'
    }
  }

  if (!todayHours) {
    return futureOpeningMessage('Kitchen: Closed')
  }

  const kitchenHours = todayHours.kitchen
  const kitchenClosedToday = (todayHours as any).is_kitchen_closed === true

  if (kitchenClosedToday) {
    return futureOpeningMessage('Kitchen: Closed today')
  }

  if (kitchenHours === null || kitchenHours === undefined) {
    return futureOpeningMessage('Kitchen: Closed today')
  }

  if (isKitchenClosed(kitchenHours)) {
    return futureOpeningMessage('Kitchen: Closed today')
  }

  // Sittings, not the flattened `kitchen` span. A day serving lunch and then
  // dinner arrives as one 12:00-21:00 window, so reading `kitchen.closes` put
  // "closes 9pm" in the header right through the afternoon closure, while the
  // hours table and the booking form both said the kitchen was shut.
  const kitchenWindows = getKitchenWindows(todayHours)

  if (kitchenWindows.length === 0) {
    return futureOpeningMessage('Kitchen: Closed today')
  }

  const nowMinutes = londonMinutesNow()
  const openWindow = kitchenWindows.find(
    (window) =>
      nowMinutes >= minutesOfDay(window.opens) && nowMinutes < minutesOfDay(window.closes)
  )

  // `currentStatus.kitchenOpen` stays the authority on whether food is being
  // served right now, because it also reflects live closures the schedule does
  // not carry. The windows decide which time to print.
  if (openWindow && currentStatus.kitchenOpen) {
    return {
      status: `Kitchen: Open · closes ${formatTime12Hour(openWindow.closes)}`,
      indicator: 'open'
    }
  }

  // Covers both "before the first sitting" and "in the gap between sittings",
  // so the afternoon closure reads "Opens at 4pm" rather than jumping to tomorrow.
  const nextWindowToday = kitchenWindows.find(
    (window) => minutesOfDay(window.opens) > nowMinutes
  )

  if (nextWindowToday) {
    return {
      status: `Kitchen: Opens at ${formatTime12Hour(nextWindowToday.opens)}`,
      indicator: currentStatus.isOpen ? 'warning' : 'closed'
    }
  }

  return futureOpeningMessage(
    'Kitchen: Closed today',
    currentStatus.isOpen ? 'warning' : 'closed'
  )
}

/** A single status row: a coloured dot plus its label. Dot colour is never the only
 *  signal — the text always states the open/closed state explicitly. */
function StatusRow({
  dot,
  children,
  title,
  ariaLabel
}: {
  dot: StatusDot
  children: React.ReactNode
  title?: string
  ariaLabel?: string
}) {
  const dotStyle =
    dot === 'open'
      ? { backgroundColor: OPEN_DOT }
      : dot === 'warning'
        ? { backgroundColor: 'var(--anchor-gold)' }
        : { backgroundColor: 'var(--anchor-danger, #b1372f)' }

  return (
    <span className="inline-flex items-center gap-2" title={title}>
      <span
        className="inline-block h-[9px] w-[9px] flex-shrink-0 rounded-full"
        style={dotStyle}
        aria-hidden="true"
      />
      <span className="font-sans text-sm font-semibold leading-snug" aria-label={ariaLabel}>
        {children}
      </span>
    </span>
  )
}

export function StatusBar({
  variant = 'nav',
  showKitchen = true,
  showPlaneSpotting,
  className = '',
  apiEndpoint = '/api/business/hours'
}: StatusBarProps) {
  const contextValue = useBusinessHoursContext()
  const hookValue = useBusinessHours({ apiEndpoint, enabled: !contextValue })
  const { hours, loading, error, isStale } = contextValue ?? hookValue

  const shouldShowPlaneSpotting = showPlaneSpotting ?? variant === 'nav'
  const planeSpottingInfo = shouldShowPlaneSpotting ? getTodayPlaneSpottingWindow() : null

  const isPill = variant === 'pill'

  // Container styling per variant.
  const containerClass = isPill
    ? cn(
        'inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-pill border-2 border-anchor-gold bg-anchor-green px-6 py-2 text-white shadow-md',
        className
      )
    : cn('flex flex-wrap items-center gap-x-5 gap-y-1 text-ink', className)

  // Build the rows. When live data is unavailable we fall back to the static hours
  // (warning dots) so a contact path always stays visible.
  let rows: React.ReactNode

  if (!hours) {
    // STATIC_*_SHORT already start with "Bar:" / "Kitchen:" — never re-prefix.
    const reason = error ? ' (live status unavailable)' : ''
    rows = (
      <>
        <StatusRow dot="warning">{`${STATIC_BAR_HOURS_SHORT}${reason}`}</StatusRow>
        {showKitchen && (
          <StatusRow dot="warning">
            <PhoneLink
              phone={CONTACT.phone}
              source={isPill ? 'status_bar_pill' : 'status_bar_nav'}
              showIcon={false}
              className="underline decoration-current/40 underline-offset-2"
            >
              {STATIC_KITCHEN_HOURS_SHORT}
            </PhoneLink>
          </StatusRow>
        )}
      </>
    )
  } else {
    const barStatus = getBarStatus(hours)
    const kitchenInfo = showKitchen ? getKitchenStatus(hours) : null
    const isOpen = hours.currentStatus.isOpen

    rows = (
      <>
        <StatusRow dot={isOpen ? 'open' : 'closed'}>{barStatus}</StatusRow>
        {kitchenInfo && (
          <StatusRow dot={kitchenInfo.indicator}>{kitchenInfo.status}</StatusRow>
        )}
        {planeSpottingInfo && (
          <StatusRow
            dot="open"
            title={PLANE_SPOTTING_COMPACT_CAVEAT}
            ariaLabel={`${planeSpottingInfo.statusText}. ${PLANE_SPOTTING_COMPACT_CAVEAT}`}
          >
            {planeSpottingInfo.statusText}
          </StatusRow>
        )}
        {isStale && (
          <span className="font-sans text-xs text-accent-text" title="Status may be outdated">
            (updating...)
          </span>
        )}
      </>
    )
  }

  // The fallback branch already renders when there is no cached data, so background
  // refreshes (`loading` true with cached `hours`) keep the current rows visible.
  void loading

  return (
    <div className={containerClass} role="status" aria-live="polite">
      {rows}
    </div>
  )
}
