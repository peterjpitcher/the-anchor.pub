'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import { CONTACT_INFO } from '@/lib/error-handling'
import { useBusinessHoursContext } from '@/components/providers/BusinessHoursProvider'
import {
  STATIC_BAR_HOURS_SUMMARY,
  STATIC_HOURS_REVIEW_NOTE,
  STATIC_KITCHEN_HOURS_SUMMARY
} from '@/lib/business-hours-fallback'
import { getKitchenWindows, resolveRegularHoursForDate } from '@/lib/hours-utils'

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
      <div className={`bg-surface border border-line rounded-md shadow-sm p-4 ${className}`}>
        <p className="text-sm font-semibold text-accent-text">Opening hours</p>
        <p className="mt-1 text-sm text-ink">{STATIC_BAR_HOURS_SUMMARY}</p>
        <p className="mt-1 text-sm text-ink">{STATIC_KITCHEN_HOURS_SUMMARY}</p>
        <p className="mt-1 text-xs text-ink-muted">{STATIC_HOURS_REVIEW_NOTE}</p>
      </div>
    )
  }

  // --- Error state ---
  if (error || !hours) {
    const errorMessage = error?.message || `We couldn't load our opening hours right now.`
    return (
      <div className={`bg-surface border border-anchor-danger/30 rounded-md shadow-sm p-4 ${className}`}>
        <p className="text-anchor-danger text-sm mb-2">{errorMessage}</p>
        <div className="space-y-1 text-sm text-ink">
          <p>{STATIC_BAR_HOURS_SUMMARY}</p>
          <p>{STATIC_KITCHEN_HOURS_SUMMARY}</p>
          <a href={CONTACT_INFO.phoneLink} className="text-accent-text hover:text-anchor-green font-semibold underline">
            Call {CONTACT_INFO.phone}
          </a>{' '}
          for today&apos;s live status.
        </div>
      </div>
    )
  }

  // --- Data resolution (preserved from existing component) ---

  const londonNow = DateTime.now().setZone('Europe/London')
  const londonToday = londonNow.startOf('day')
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

  const sundayLunchOverrides = (hours.serviceOverrides?.sunday_lunch ?? []) as Array<{
    startDate: string
    endDate: string
    isEnabled: boolean
    message: string | null
  }>
  const sundayLunchStatus = hours.serviceStatus?.sunday_lunch

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
      message: override?.message || sundayLunchStatus?.message || 'Sunday roast service unavailable',
    }
  }

  // --- Build main day list (today + next six days) ---

  const mainDates = new Set<string>()
  const mainDays = Array.from({ length: 7 }, (_, offset) => {
    const date = londonToday.plus({ days: offset })
    const isoDate = date.toISODate()
    const day = date.toFormat('cccc').toLowerCase() as typeof dayOrder[number]
    if (isoDate) mainDates.add(isoDate)
    // Per date, not once for the week: the weekly schedule is effective-dated,
    // so a change starting mid-table governs only the days from its start.
    const dayHours = resolveRegularHoursForDate(
      isoDate || londonToday.toISODate() || '',
      hours.regularHours,
      hours.upcomingVersions
    )[day]
    const specialHours = getSpecialHoursForDate(isoDate)
    const displayHours = specialHours || dayHours
    const hasSpecialHours = !!specialHours
    const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)
    const kitchenWindows = getKitchenWindows({
      kitchen,
      is_kitchen_closed: kitchenClosed,
      schedule_config: specialHours
        ? (specialHours as any).schedule_config ?? []
        : dayHours?.schedule_config ?? []
    })
    const sundayLunchInfo = getSundayLunchInfoForDate(isoDate)
    const hasSundayLunchNotice = !!(sundayLunchInfo && !sundayLunchInfo.available)

    return {
      day,
      isoDate,
      isToday: offset === 0,
      dayHours,
      displayHours,
      hasSpecialHours,
      specialHours,
      kitchenWindows,
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
      const regularForDay = resolveRegularHoursForDate(
        sh.date,
        hours.regularHours,
        hours.upcomingVersions
      )[weekday]
      // Merge: ?? for opens/closes, property-presence for kitchen
      const mergedOpens = sh.opens ?? regularForDay?.opens
      const mergedCloses = sh.closes ?? regularForDay?.closes
      const { kitchen, kitchenClosed } = resolveKitchenInfo(sh, regularForDay)
      const kitchenWindows = getKitchenWindows({
        kitchen,
        is_kitchen_closed: kitchenClosed,
        schedule_config: sh.schedule_config ?? []
      })

      return {
        date: sh.date,
        dateLabel: dt.toFormat('ccc d MMM'),
        is_closed: sh.is_closed,
        opens: mergedOpens,
        closes: mergedCloses,
        kitchenWindows,
        kitchenClosed,
        note: sh.note || sh.reason || 'Special hours',
      }
    })

  // --- Render ---

  const renderKitchen = (
    kitchenWindows: Array<{ opens: string; closes: string }>,
    kitchenClosed: boolean,
    hasSpecialHours: boolean
  ) => {
    if (kitchenClosed) {
      return <span className={hasSpecialHours ? 'text-accent-text font-semibold' : 'text-ink-muted'}>Closed</span>
    }
    if (kitchenWindows.length === 0) {
      return <span className="text-ink-muted">No service</span>
    }
    // A day with a lunch and a dinner sitting reads as both, because the
    // booking form will not take a food booking in the gap between them.
    return (
      <span className={hasSpecialHours ? 'text-accent-text font-semibold' : 'text-ink'}>
        {kitchenWindows
          .map((window) => `${formatTime(window.opens)} - ${formatTime(window.closes)}`)
          .join(', ')}
      </span>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main seven-day list */}
      <div className="space-y-1">
        {mainDays.map(({
          day, isoDate, isToday, displayHours, hasSpecialHours, specialHours,
          kitchenWindows, kitchenClosed, hasSundayLunchNotice, sundayLunchInfo,
        }) => {
          if (!displayHours) return null

          const noteText = specialHours?.note || specialHours?.reason
          const sundayLunchMessage = hasSundayLunchNotice ? (sundayLunchInfo?.message || 'Sunday roast unavailable') : null

          return (
            <div
              key={isoDate || day}
              className={`rounded-sm px-3 py-2 ${
                isToday ? 'bg-surface-sunk ring-1 ring-line-strong' : 'hover:bg-surface-sunk'
              } ${(hasSpecialHours || hasSundayLunchNotice) ? 'ring-1 ring-line-gold' : ''}`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Day */}
                <span className="text-base font-medium capitalize text-ink-strong">
                  {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                  {isToday && <span className="text-sm"> &bull;</span>}
                </span>

                {/* Right: Hours */}
                <div className="text-right space-y-0.5">
                  {displayHours.is_closed ? (
                    <span className={hasSpecialHours ? 'text-accent-text font-semibold' : 'text-ink-strong'}>Closed</span>
                  ) : (
                    <>
                      <div>
                        <span className="text-sm text-ink-muted mr-1">Bar:</span>
                        <span className={hasSpecialHours ? 'text-accent-text font-semibold' : 'text-ink-strong'}>
                          {formatTime(displayHours.opens)} - {formatTime(displayHours.closes)}
                        </span>
                      </div>

                      {showKitchen && (
                        <div className="text-sm">
                          <span className="text-ink-muted mr-1">Kitchen:</span>
                          {renderKitchen(kitchenWindows, kitchenClosed, hasSpecialHours)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Full-width note inside the box */}
              {hasSpecialHours && noteText && (
                <div className="text-xs text-accent-text font-semibold mt-1">
                  {noteText}
                </div>
              )}
              {sundayLunchMessage && (
                <div className="text-xs text-accent-text mt-1">
                  {sundayLunchMessage}
                </div>
              )}
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
            className="text-sm text-ink underline hover:text-ink-strong"
          >
            {showUpcoming ? 'Hide' : 'See'} upcoming changes ({upcomingChanges.length})
          </button>

          {showUpcoming && (
            <div className="space-y-1 mt-2">
              {upcomingChanges.map((entry) => (
                <div
                  key={entry.date}
                  className="px-3 py-2 rounded-sm ring-1 ring-line-gold"
                >
                  {/* Top row: date + hours */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-ink-strong">{entry.dateLabel}</span>
                    <div className="text-right space-y-0.5">
                      {entry.is_closed ? (
                        <span className="text-accent-text font-semibold">Closed</span>
                      ) : (
                        <>
                          <div>
                            <span className="text-sm text-ink-muted mr-1">Bar:</span>
                            <span className="text-accent-text font-semibold">
                              {formatTime(entry.opens)} - {formatTime(entry.closes)}
                            </span>
                          </div>
                          {showKitchen && (
                            <div className="text-sm">
                              <span className="text-ink-muted mr-1">Kitchen:</span>
                              {renderKitchen(entry.kitchenWindows, entry.kitchenClosed, true)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {/* Full-width note below */}
                  <div className="text-xs text-accent-text font-semibold mt-1">
                    {entry.note}
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
