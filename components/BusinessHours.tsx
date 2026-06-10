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
      <div className={`bg-anchor-green-raised border border-anchor-gold-dark/15 rounded-lg p-4 ${className}`}>
        <p className="text-sm font-semibold text-anchor-gold-bright">Opening hours</p>
        <p className="mt-1 text-sm text-anchor-cream-text/70">{STATIC_BAR_HOURS_SUMMARY}</p>
        <p className="mt-1 text-sm text-anchor-cream-text/70">{STATIC_KITCHEN_HOURS_SUMMARY}</p>
        <p className="mt-1 text-xs text-anchor-cream-text/55">{STATIC_HOURS_REVIEW_NOTE}</p>
      </div>
    )
  }

  // --- Error state ---
  if (error || !hours) {
    const errorMessage = error?.message || `We couldn't load our opening hours right now.`
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <p className="text-red-400 text-sm mb-2">{errorMessage}</p>
        <div className="space-y-1 text-sm text-anchor-cream-text/70">
          <p>{STATIC_BAR_HOURS_SUMMARY}</p>
          <p>{STATIC_KITCHEN_HOURS_SUMMARY}</p>
          <a href={CONTACT_INFO.phoneLink} className="text-anchor-gold-dark hover:text-anchor-gold font-semibold underline">
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
      isToday: offset === 0,
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
      {/* Main seven-day list */}
      <div className="space-y-1">
        {mainDays.map(({
          day, isoDate, isToday, displayHours, hasSpecialHours, specialHours,
          kitchen, kitchenClosed, hasSundayLunchNotice, sundayLunchInfo,
        }) => {
          if (!displayHours) return null

          const noteText = specialHours?.note || specialHours?.reason
          const sundayLunchMessage = hasSundayLunchNotice ? (sundayLunchInfo?.message || 'Sunday roast unavailable') : null

          return (
            <div
              key={isoDate || day}
              className={`rounded px-3 py-2 ${
                isToday ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/5'
              } ${(hasSpecialHours || hasSundayLunchNotice) ? 'ring-1 ring-yellow-400/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Day */}
                <span className="text-base font-medium capitalize text-white">
                  {day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
                  {isToday && <span className="text-sm"> &bull;</span>}
                </span>

                {/* Right: Hours */}
                <div className="text-right space-y-0.5">
                  {displayHours.is_closed ? (
                    <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>Closed</span>
                  ) : (
                    <>
                      <div>
                        <span className="text-sm text-white/60 mr-1">Bar:</span>
                        <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>
                          {formatTime(displayHours.opens)} - {formatTime(displayHours.closes)}
                        </span>
                      </div>

                      {showKitchen && (
                        <div className="text-sm">
                          <span className="text-white/60 mr-1">Kitchen:</span>
                          {renderKitchen(kitchen, kitchenClosed, hasSpecialHours)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Full-width note inside the box */}
              {hasSpecialHours && noteText && (
                <div className="text-xs text-amber-300 font-semibold mt-1">
                  {noteText}
                </div>
              )}
              {sundayLunchMessage && (
                <div className="text-xs text-amber-200 mt-1">
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
            className="text-sm text-white/80 underline hover:text-white"
          >
            {showUpcoming ? 'Hide' : 'See'} upcoming changes ({upcomingChanges.length})
          </button>

          {showUpcoming && (
            <div className="space-y-1 mt-2">
              {upcomingChanges.map((entry) => (
                <div
                  key={entry.date}
                  className="px-3 py-2 rounded ring-1 ring-yellow-400/50"
                >
                  {/* Top row: date + hours */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-white">{entry.dateLabel}</span>
                    <div className="text-right space-y-0.5">
                      {entry.is_closed ? (
                        <span className="text-yellow-400">Closed</span>
                      ) : (
                        <>
                          <div>
                            <span className="text-sm text-white/60 mr-1">Bar:</span>
                            <span className="text-yellow-400">
                              {formatTime(entry.opens)} - {formatTime(entry.closes)}
                            </span>
                          </div>
                          {showKitchen && (
                            <div className="text-sm">
                              <span className="text-white/60 mr-1">Kitchen:</span>
                              {renderKitchen(entry.kitchen, entry.kitchenClosed, true)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {/* Full-width note below */}
                  <div className="text-xs text-amber-300 font-semibold mt-1">
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
