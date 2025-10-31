'use client'

import { DateTime } from 'luxon'
import { type BusinessHours } from '@/lib/api'
import { StatusBar } from './StatusBar'
import { CONTACT_INFO } from '@/lib/error-handling'
import { LoadingState } from '@/components/ui/LoadingState'
import { parseApiDuration } from '@/lib/time-utils'
import { useBusinessHours } from '@/hooks/useBusinessHours'

interface BusinessHoursProps {
  variant?: 'compact' | 'full' | 'status' | 'dark' | 'condensed'
  showKitchen?: boolean
}

export function BusinessHours({ variant = 'full', showKitchen = true }: BusinessHoursProps) {
  // Use the useBusinessHours hook instead of manual fetching
  const { hours, loading, error } = useBusinessHours({
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  })

  if (loading) {
    if (variant === 'status') {
      return <LoadingState variant="dots" size="sm" className="inline-flex" />
    }
    return <LoadingState variant="skeleton" className="h-20 w-full" />
  }

  if (error || !hours) {
    const errorMessage = error?.message || `We couldn't load our opening hours. We're typically open 4pm-10pm Mon, 12pm-10pm Tue-Thu, 12pm-11pm Fri-Sat, and 12pm-9pm Sun. Call us at ${CONTACT_INFO.phone} for today's hours.`
    
    if (variant === 'status') {
      return (
        <span className="text-sm text-red-600">
          <a href={CONTACT_INFO.phoneLink} className="underline">
            Call for hours
          </a>
        </span>
      )
    }
    // Show fallback hours
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm mb-2">{errorMessage}</p>
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">Regular Hours:</p>
          <ul className="space-y-1 text-sm">
            <li>Mon: 4pm-10pm (No kitchen service)</li>
            <li>Tue-Thu: 12pm-10pm</li>
            <li>Fri-Sat: 12pm-11pm</li>
            <li>Sun: 12pm-9pm</li>
          </ul>
          <p className="mt-2">
            <a href={CONTACT_INFO.phoneLink} className="text-anchor-gold hover:text-anchor-gold-light font-semibold underline">
              Call {CONTACT_INFO.phone}
            </a> for today's hours
          </p>
        </div>
      </div>
    )
  }

  const londonNow = DateTime.now().setZone('Europe/London')
  const todayKey = londonNow.toFormat('cccc').toLowerCase()
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const upcomingDays = Array.from({ length: 7 }, (_, index) => {
    const target = londonNow.plus({ days: index })
    return {
      key: target.toFormat('cccc').toLowerCase(),
      isoDate: target.toISODate(),
      label: target.toFormat('cccc'),
      isToday: index === 0
    }
  })

  const getSpecialHoursForDate = (isoDate?: string | null) => {
    if (!isoDate || !hours.specialHours || hours.specialHours.length === 0) {
      return null
    }
    return hours.specialHours.find(sh => sh.date === isoDate) || null
  }

  const getIsoForDayKey = (key: string) => {
    const targetIndex = dayOrder.indexOf(key)
    const todayIndex = dayOrder.indexOf(todayKey)
    if (targetIndex === -1 || todayIndex === -1) return null

    let delta = targetIndex - todayIndex
    if (delta < 0) {
      delta += 7
    }

    return londonNow.plus({ days: delta }).toISODate()
  }

  // Format time from 24h to 12h
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'pm' : 'am'
    const displayHour = hour % 12 || 12
    return minutes === '00' ? `${displayHour}${ampm}` : `${displayHour}:${minutes}${ampm}`
  }

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

    return {
      kitchen,
      kitchenClosed
    }
  }

  // Status variant - just shows open/closed
  if (variant === 'status') {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${hours.currentStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">
          {hours.currentStatus.isOpen ? (
            <>Open now • Closes {parseApiDuration(hours.currentStatus.closesIn) || hours.currentStatus.closesIn}</>
          ) : (
            <>Closed • Opens {parseApiDuration(hours.currentStatus.opensIn) || hours.currentStatus.opensIn}</>
          )}
        </span>
      </div>
    )
  }

  // Compact variant - for header/footer
  if (variant === 'compact') {
    const todayHours = hours.regularHours[todayKey]
    return (
      <div className="text-sm">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${hours.currentStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">
            {hours.currentStatus.isOpen ? 'Open' : 'Closed'}
          </span>
          {todayHours && !todayHours.is_closed && (
            <span className="text-gray-700">
              {formatTime(todayHours.opens)} - {formatTime(todayHours.closes)}
            </span>
          )}
        </div>
        {hours.currentStatus.isOpen && hours.currentStatus.closesIn && (
          <p className="text-sm sm:text-xs text-gray-700 mt-1">Closes in {parseApiDuration(hours.currentStatus.closesIn) || hours.currentStatus.closesIn}</p>
        )}
      </div>
    )
  }

  // Dark variant - for dark backgrounds
  if (variant === 'dark') {
    return (
      <div className="space-y-4">
        {/* Current Status */}
        <div className={`p-4 rounded-lg ${hours.currentStatus.isOpen ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-block w-3 h-3 rounded-full ${hours.currentStatus.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-semibold text-lg text-white">
                {hours.currentStatus.isOpen ? 'We\'re Open!' : 'We\'re Closed'}
              </span>
            </div>
            {hours.currentStatus.isOpen && hours.currentStatus.closesIn && (
              <span className="text-sm text-gray-600">Closes in {parseApiDuration(hours.currentStatus.closesIn) || hours.currentStatus.closesIn}</span>
            )}
            {!hours.currentStatus.isOpen && hours.currentStatus.opensIn && (
              <span className="text-sm text-gray-600">Opens in {parseApiDuration(hours.currentStatus.opensIn) || hours.currentStatus.opensIn}</span>
            )}
          </div>
          {showKitchen && (
            <p className="text-sm mt-2 text-gray-600">
              Kitchen: {hours.currentStatus.kitchenOpen ? 
                <span className="text-green-400 font-medium">Open for food orders</span> : 
                <span className="text-red-400 font-medium">Closed</span>
              }
            </p>
          )}
        </div>

        {/* Regular Hours */}
        <div className="space-y-2">
          {upcomingDays.map((day, index) => {
            const dayHours = hours.regularHours[day.key]
            const specialHours = getSpecialHoursForDate(day.isoDate)
            const displayHours = specialHours || dayHours
            const hasSpecialHours = !!specialHours
            const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)

            return (
              <div
                key={day.isoDate || day.key}
                className={`flex justify-between items-start py-2 px-3 rounded ${
                  day.isToday ? 'bg-white/10' : ''
                } ${hasSpecialHours ? 'ring-1 ring-yellow-400/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-medium capitalize ${day.isToday ? 'text-white' : 'text-white'}`}>
                    {day.label}
                    {day.isToday && <span className="text-sm sm:text-xs ml-2 text-white">(Today)</span>}
                    {hasSpecialHours && <span className="text-sm sm:text-xs ml-2 text-yellow-400">({specialHours?.note || specialHours?.reason || 'Special hours'})</span>}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  {displayHours.is_closed ? (
                    <span className={hasSpecialHours ? 'text-yellow-400' : 'text-gray-600'}>Closed</span>
                  ) : (
                    <>
                      {/* Bar Hours */}
                      <div>
                        <span className="text-sm text-gray-400 mr-2">Bar:</span>
                        <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>
                          {formatTime(displayHours.opens!)} - {formatTime(displayHours.closes!)}
                        </span>
                      </div>
                      
                      {/* Kitchen Hours */}
                      {showKitchen && (
                        <div className="text-sm">
                          <span className="text-gray-400 mr-2">Kitchen:</span>
                          {(() => {
                            if (kitchenClosed) {
                              return <span className={hasSpecialHours ? 'text-yellow-400' : 'text-amber-400'}>Closed</span>
                            } else if (!kitchen || kitchen === null) {
                              return <span className="text-gray-500">No service</span>
                            } else if ('opens' in kitchen && 'closes' in kitchen) {
                              return (
                                <span className={hasSpecialHours ? 'text-yellow-400' : 'text-white'}>
                                  {formatTime(kitchen.opens)} - {formatTime(kitchen.closes)}
                                </span>
                              )
                            } else {
                              return <span className="text-gray-500">No service</span>
                            }
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Condensed variant - compact vertical layout
  if (variant === 'condensed') {
    return (
      <div className="space-y-3">
        {/* Status Bar */}
        <div className="flex justify-center">
          <StatusBar showKitchen={showKitchen} />
        </div>

        {/* All Days Vertical List - Compact */}
        <div className="space-y-1">
          {upcomingDays.map((day) => {
            const dayHours = hours.regularHours[day.key]
            const specialHours = getSpecialHoursForDate(day.isoDate)
            const displayHours = specialHours || dayHours
            const hasSpecialHours = !!specialHours
            const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)

            if (!displayHours) {
              return null
            }

            return (
              <div
                key={day.isoDate || day.key}
                className={`flex items-center justify-between px-3 py-1.5 rounded ${
                  day.isToday ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/5'
                } ${hasSpecialHours ? 'ring-1 ring-yellow-400/50' : ''}`}
              >
                {/* Left: Day */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-sm font-medium capitalize w-16 ${day.isToday ? 'text-white' : 'text-white'}`}>
                    {day.label.slice(0, 3)}
                    {day.isToday && <span className="text-sm sm:text-xs"> •</span>}
                  </span>
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
                          {formatTime(displayHours.opens!)} - {formatTime(displayHours.closes!)}
                        </span>
                      </div>

                      {showKitchen && (
                        <div className="text-xs">
                          <span className="text-white/60 mr-1">Kitchen:</span>
                          {(() => {
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
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Full variant - for dedicated sections
  return (
    <div className="space-y-4">
      {/* Schema.org OpeningHoursSpecification */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OpeningHoursSpecification",
            "@id": "https://www.the-anchor.pub/#opening-hours",
            "dayOfWeek": Object.entries(hours.regularHours)
              .filter(([_, h]) => !h.is_closed)
              .map(([day, h]) => day.charAt(0).toUpperCase() + day.slice(1)),
            "opens": hours.regularHours[todayKey]?.opens || "16:00",
            "closes": hours.regularHours[todayKey]?.closes || "22:00",
            "validFrom": new Date().toISOString().split('T')[0],
            "validThrough": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          })
        }}
      />
      {/* Current Status */}
      <div className={`p-4 rounded-lg ${hours.currentStatus.isOpen ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-block w-3 h-3 rounded-full ${hours.currentStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-semibold text-lg">
              {hours.currentStatus.isOpen ? 'We\'re Open!' : 'We\'re Closed'}
            </span>
          </div>
          {hours.currentStatus.isOpen && hours.currentStatus.closesIn && (
            <span className="text-sm text-gray-700">Closes in {parseApiDuration(hours.currentStatus.closesIn) || hours.currentStatus.closesIn}</span>
          )}
          {!hours.currentStatus.isOpen && hours.currentStatus.opensIn && (
            <span className="text-sm text-gray-700">Opens in {parseApiDuration(hours.currentStatus.opensIn) || hours.currentStatus.opensIn}</span>
          )}
        </div>
        {showKitchen && (
          <p className="text-sm mt-2 text-gray-700">
            Kitchen: {hours.currentStatus.kitchenOpen ? 
              <span className="text-green-700 font-medium">Open for food orders</span> : 
              <span className="text-red-700 font-medium">Closed</span>
            }
          </p>
        )}
      </div>

      {/* Regular Hours */}
      <div itemProp="openingHours" itemScope itemType="https://schema.org/OpeningHoursSpecification">
        <h3 className="font-bold text-lg mb-3">Opening Hours</h3>
        <div className="space-y-2">
          {dayOrder.map((day) => {
            const dayHours = hours.regularHours[day]
            const isoDate = getIsoForDayKey(day)
            const specialHours = getSpecialHoursForDate(isoDate)
            const displayHours = specialHours || dayHours
            const hasSpecialHours = !!specialHours
            const isToday = day === todayKey
            const { kitchen, kitchenClosed } = resolveKitchenInfo(specialHours, dayHours)

            if (!displayHours) {
              return null
            }

            return (
              <div
                key={day}
                className={`flex justify-between items-start py-2 px-3 rounded ${
                  isToday ? 'bg-anchor-cream' : ''
                } ${hasSpecialHours ? 'ring-2 ring-yellow-400' : ''}`}
              >
                <span className={`font-medium capitalize ${isToday ? 'text-anchor-green' : ''}`} itemProp="dayOfWeek">
                  {day}
                  {isToday && <span className="text-sm sm:text-xs ml-2 text-white">(Today)</span>}
                  {hasSpecialHours && <span className="text-sm sm:text-xs ml-2 text-yellow-600">({specialHours?.note || specialHours?.reason || 'Special hours'})</span>}
                </span>
                <div className="text-right space-y-1">
                  {displayHours.is_closed ? (
                    <span className={hasSpecialHours ? 'text-yellow-600 font-medium' : 'text-gray-700'}>Closed</span>
                  ) : (
                    <>
                      <div>
                        <span className="text-sm text-gray-500 mr-2">Bar:</span>
                        <span className={hasSpecialHours ? 'text-yellow-600 font-medium' : ''}>
                          <time itemProp="opens" content={displayHours.opens}>{formatTime(displayHours.opens!)}</time> - <time itemProp="closes" content={displayHours.closes}>{formatTime(displayHours.closes!)}</time>
                        </span>
                      </div>

                      {showKitchen && (
                        <div className="text-sm">
                          <span className="text-gray-500 mr-2">Kitchen:</span>
                          {(() => {
                            if (kitchenClosed) {
                              return <span className={hasSpecialHours ? 'text-yellow-600 font-medium' : 'text-amber-600 font-medium'}>Closed</span>
                            }
                            if (!kitchen || kitchen === null) {
                              return <span className="text-gray-500">No service</span>
                            } else if ('opens' in kitchen && 'closes' in kitchen) {
                              return (
                                <span className={hasSpecialHours ? 'text-yellow-600 font-medium' : ''}>
                                  {formatTime(kitchen.opens)} - {formatTime(kitchen.closes)}
                                </span>
                              )
                            }
                            return <span className="text-gray-500">No service</span>
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
