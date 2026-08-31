'use client'

import { DateTime } from 'luxon'
import { Plane } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { CONTACT_INFO } from '@/lib/error-handling'
import type { BusinessHours } from '@/lib/api'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import {
  STATIC_BAR_HOURS_SUMMARY,
  STATIC_KITCHEN_HOURS_SUMMARY,
  STATIC_HOURS_REVIEW_NOTE
} from '@/lib/business-hours-fallback'
import { getPlaneSpottingWindowForDate } from '@/lib/heathrow-runway-alternation'
import { getKitchenWindows, resolveRegularHoursForDate } from '@/lib/hours-utils'

interface WeekHoursProps {
  showKitchen?: boolean
  className?: string
  /**
   * Server-fetched hours snapshot. Supplying this puts the seven-day table in the
   * initial HTML, so crawlers, AI assistants and no-JS clients read real times
   * instead of the "loading" fallback. The client provider still takes over on
   * hydration, so live data always wins.
   */
  initialHours?: BusinessHours | null
  /**
   * How many columns the seven days are laid out in on wider screens.
   *
   * Two by default. Pass 1 where the table sits in a narrow slot beside other
   * content: at that width a two-column split leaves each day too tight for the
   * kitchen line, which now carries two sittings on most days.
   */
  columns?: 1 | 2
}

const FOOTER_NOTE =
  'Bar and kitchen live from /api/business/hours. Flight-path times are approximate, Heathrow alternates runways around 3pm.'

const dayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

/**
 * WeekHours — design-system 7-day opening-hours panel (spec §6.1).
 *
 * The data-resolution logic is reused verbatim from `components/BusinessHours.tsx`:
 * the same property-presence kitchen handling so `kitchen: null` (and the
 * `is_kitchen_closed` flag) is treated as a deliberate "closed" signal and never
 * falls through to regular hours. The static fallback path
 * (`business-hours-fallback`) is preserved for loading/error states.
 *
 * Only the presentation differs — this is the redesign DS layout, not the legacy
 * green-surface markup.
 */
export function WeekHours({
  showKitchen = true,
  className = '',
  initialHours = null,
  columns = 2
}: WeekHoursProps) {
  const context = useBusinessHoursContext()
  const {
    hours: liveHours,
    loading,
    error
  } = context || { hours: null, loading: true, error: null }

  // Live client data wins as soon as it arrives; the server snapshot covers SSR
  // and any client fetch failure. Only live data may drive the open/closed badge,
  // because the snapshot is regenerated hourly and its currentStatus goes stale.
  const hours = liveHours ?? initialHours
  const isLive = Boolean(liveHours)

  // --- Loading state (static fallback, contact path stays visible) ---
  if (loading && !hours) {
    return (
      <div className={`rounded-md border border-line bg-surface p-4 ${className}`}>
        <p className="text-sm font-semibold text-ink">Opening hours</p>
        <p className="mt-1 text-sm text-ink-muted">{STATIC_BAR_HOURS_SUMMARY}</p>
        <p className="mt-1 text-sm text-ink-muted">{STATIC_KITCHEN_HOURS_SUMMARY}</p>
        <p className="mt-1 text-xs text-ink-muted">{STATIC_HOURS_REVIEW_NOTE}</p>
      </div>
    )
  }

  // --- Error state (static fallback + contact path) ---
  // A usable snapshot beats an error box, so this only fires when we have no data
  // from either source.
  if (!hours) {
    const errorMessage = error?.message || `We couldn't load our opening hours right now.`
    return (
      <div className={`rounded-md border border-anchor-danger/30 bg-anchor-danger/[0.08] p-4 ${className}`}>
        <p className="mb-2 text-sm text-anchor-danger">{errorMessage}</p>
        <div className="space-y-1 text-sm text-ink-muted">
          <p>{STATIC_BAR_HOURS_SUMMARY}</p>
          <p>{STATIC_KITCHEN_HOURS_SUMMARY}</p>
          <p>
            <a
              href={CONTACT_INFO.phoneLink}
              className="font-semibold text-accent-text underline underline-offset-2"
            >
              Call {CONTACT_INFO.phone}
            </a>{' '}
            for today&apos;s live status.
          </p>
        </div>
      </div>
    )
  }

  // --- Data resolution (preserved from BusinessHours.tsx) ---

  const londonNow = DateTime.now().setZone('Europe/London')
  const londonToday = londonNow.startOf('day')
  const isOpenNow = hours.currentStatus?.isOpen === true

  const sundayLunchOverrides = (hours.serviceOverrides?.sunday_lunch ?? []) as Array<{
    startDate: string
    endDate: string
    isEnabled: boolean
    message: string | null
  }>
  const sundayLunchStatus = hours.serviceStatus?.sunday_lunch

  const getSpecialHoursForDate = (isoDate?: string | null) => {
    if (!isoDate || !hours.specialHours || hours.specialHours.length === 0) return null
    return hours.specialHours.find((sh) => sh.date === isoDate) || null
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

  // Critical: uses property-presence for kitchen, not ?? on inner fields, so that
  // an explicit `kitchen: null` on the special-hours entry stays "closed" and does
  // not silently fall through to the regular-hours kitchen. (Mirrors BusinessHours.tsx.)
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
    const effectiveEnabled =
      typeof override?.isEnabled === 'boolean' ? override.isEnabled : baseEnabled

    return {
      available: effectiveEnabled,
      message: override?.message || sundayLunchStatus?.message || 'Sunday roast service unavailable'
    }
  }

  // --- Build day list (today + next six days) ---

  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = londonToday.plus({ days: offset })
    const isoDate = date.toISODate()
    const day = date.toFormat('cccc').toLowerCase() as (typeof dayOrder)[number]
    // Resolved per date, not once for the week: the weekly schedule is
    // effective-dated, so a change starting mid-table must show on the days it
    // actually governs instead of the whole week wearing today's hours.
    const dayHours = resolveRegularHoursForDate(
      isoDate || londonToday.toISODate() || '',
      hours.regularHours,
      hours.upcomingVersions
    )[day]
    const specialHours = getSpecialHoursForDate(isoDate)
    const displayHours = specialHours || dayHours
    const hasSpecialHours = !!specialHours
    const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)
    // Sittings come from whichever entry supplied the kitchen, so a split
    // service reads "12pm – 3pm, 4pm – 9pm" instead of one 12-to-9 window the
    // booking form would refuse food bookings inside.
    const kitchenWindows = getKitchenWindows({
      kitchen,
      is_kitchen_closed: kitchenClosed,
      schedule_config: specialHours
        ? specialHours.schedule_config ?? []
        : dayHours?.schedule_config ?? []
    })
    const sundayLunchInfo = getSundayLunchInfoForDate(isoDate)
    const hasSundayLunchNotice = !!(sundayLunchInfo && !sundayLunchInfo.available)
    const planeWindow = isoDate ? getPlaneSpottingWindowForDate(isoDate) : null

    return {
      day,
      isoDate,
      isToday: offset === 0,
      dayLabel: date.toFormat('cccc'),
      dateSub: offset === 0 ? 'Today' : date.toFormat('d MMM'),
      displayHours,
      hasSpecialHours,
      specialHours,
      kitchen,
      kitchenClosed,
      kitchenWindows,
      sundayLunchInfo,
      hasSundayLunchNotice,
      planeWindow
    }
  })

  // --- Kitchen line text (special-hours note replaces it when present) ---

  const kitchenLineText = (
    kitchenWindows: Array<{ opens: string; closes: string }>,
    kitchenClosed: boolean
  ): { text: string; closed: boolean } => {
    if (kitchenClosed || kitchenWindows.length === 0) {
      return { text: 'Kitchen closed', closed: true }
    }
    const ranges = kitchenWindows
      .map((window) => `${formatTime(window.opens)} – ${formatTime(window.closes)}`)
      .join(', ')
    return { text: `Kitchen ${ranges}`, closed: false }
  }

  return (
    <div className={`rounded-md border border-line bg-surface p-5 ${className}`}>
      {/* Header: open/closed badge + status text. Rendered only from live client
          data, never from the hourly server snapshot, so a stale "Open now" is
          never published to a crawler. */}
      {isLive && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge variant={isOpenNow ? 'success' : 'danger'} dot>
            {isOpenNow ? 'Open now' : 'Closed now'}
          </Badge>
          <span className="text-sm text-ink-muted">
            {isOpenNow ? 'The bar is open, come on in.' : 'See this week’s hours below.'}
          </span>
        </div>
      )}

      {/* 2-column day list (1-col under 640px) */}
      {/* Days read down each column, not across the rows: Monday to Thursday,
          then Friday to Sunday. Filling row-wise put Monday beside Tuesday and
          Wednesday underneath, so the week had to be read in a zigzag. */}
      <ul
        // `grid-rows-[repeat(4,auto)]` rather than `grid-rows-4`, which is
        // repeat(4, minmax(0,1fr)) and would stretch every row to match the
        // tallest day. Days need four rows to flow down, not equal heights.
        //
        // columns={1} still splits in two between sm and lg, because the pages
        // that ask for one column only put the table in a narrow slot at lg.
        className={`grid grid-cols-1 gap-px overflow-hidden rounded-md sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(4,auto)] ${
          columns === 1 ? 'lg:grid-flow-row lg:grid-cols-1 lg:grid-rows-none' : ''
        }`}
      >
        {days.map(
          ({
            day,
            isoDate,
            isToday,
            dayLabel,
            dateSub,
            displayHours,
            hasSpecialHours,
            specialHours,
            kitchenWindows,
            kitchenClosed,
            hasSundayLunchNotice,
            sundayLunchInfo,
            planeWindow
          }) => {
            const noteText = hasSpecialHours
              ? specialHours?.note || specialHours?.reason || null
              : null
            const closedAllDay = !displayHours || displayHours.is_closed
            const barText = closedAllDay
              ? 'Closed'
              : `${formatTime(displayHours?.opens)} – ${formatTime(displayHours?.closes)}`

            const kitchenInfo = kitchenLineText(kitchenWindows, kitchenClosed)
            // A special-hours note replaces the kitchen line when present.
            const sundayNotice = hasSundayLunchNotice
              ? sundayLunchInfo?.message || 'Sunday roast unavailable'
              : null
            const secondaryLine = noteText || sundayNotice

            // Accessible summary so state is conveyed in text, not colour alone.
            const ariaSummary = [
              `${dayLabel}${isToday ? ' (today)' : ''}`,
              closedAllDay ? 'Closed' : `Bar open ${barText}`,
              showKitchen && !closedAllDay ? kitchenInfo.text : null
            ]
              .filter(Boolean)
              .join('. ')

            return (
              <li
                key={isoDate || day}
                aria-label={ariaSummary}
                className={`flex items-start justify-between gap-3 px-4 py-3 max-[360px]:flex-col max-[360px]:gap-1 ${
                  isToday ? 'bg-tile text-ink' : 'bg-surface'
                }`}
              >
                {/* Left: day + date sub */}
                <div className="min-w-0">
                  <span className="block font-medium text-ink">{dayLabel}</span>
                  <span
                    className={`block text-xs ${isToday ? 'font-semibold text-accent-text' : 'text-ink-muted'}`}
                  >
                    {dateSub}
                  </span>
                </div>

                {/* Right: bar times, kitchen line, plane window */}
                <div className="text-right max-[360px]:text-left">
                  <span
                    className={`block font-semibold ${closedAllDay ? 'text-anchor-danger' : 'text-ink'}`}
                  >
                    {barText}
                  </span>

                  {showKitchen && !closedAllDay && (
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {secondaryLine ?? kitchenInfo.text}
                    </span>
                  )}

                  {planeWindow && planeWindow.window !== 'unknown' && (
                    <span className="mt-0.5 flex items-center justify-end gap-1 text-xs text-accent-text max-[360px]:justify-start">
                      <Plane size={13} aria-hidden="true" className="flex-shrink-0" />
                      <span>Planes {planeWindow.label}</span>
                    </span>
                  )}
                </div>
              </li>
            )
          }
        )}
      </ul>

      {/* Footer note */}
      <p className="mt-4 text-xs text-ink-muted">{FOOTER_NOTE}</p>
    </div>
  )
}
