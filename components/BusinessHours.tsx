'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
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
    const errorMessage = error?.message || `We couldn't load our opening hours right now.`
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
                      {hasSundayLunchNotice ? 'Lunch service update' : 'Special hours'}
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
