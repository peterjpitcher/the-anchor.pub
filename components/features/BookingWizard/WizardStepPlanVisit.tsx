'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import type {
  AvailabilityData,
  EventsByDate,
  DateEventSummary,
  TimeSlot,
  WizardStepProps
} from './types'

interface WizardStepPlanVisitProps extends WizardStepProps {
  availabilityData: AvailabilityData
  eventsByDate: EventsByDate
  date: string
  partySize: number
  time: string
  sundayLunchAvailable: boolean
  bookingType: 'regular' | 'sunday_lunch'
  onBookingTypeChange: (type: 'regular' | 'sunday_lunch') => void
}

const MIN_PARTY = 1
const MAX_PARTY = 20

export function WizardStepPlanVisit({
  availabilityData,
  eventsByDate,
  date,
  partySize,
  time,
  bookingType,
  sundayLunchAvailable,
  onBookingTypeChange,
  onNext
}: WizardStepPlanVisitProps) {
  const [selectedDate, setSelectedDate] = useState(date || '')
  const [selectedTime, setSelectedTime] = useState(time || '')
  const [selectedPartySize, setSelectedPartySize] = useState(partySize || 2)
  const [error, setError] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)

  const today = useMemo(() => {
    const now = new Date()
    now.setHours(12, 0, 0, 0)
    return now
  }, [])

  const calendarDays = useMemo(() => {
    const days: Array<{
      date: string
      dayNum: number
      dayName: string
      month: string
      isToday: boolean
      isSunday: boolean
      isBlocked: boolean
      isDrinksOnly: boolean
      hasRoast: boolean
      specialNote?: string
      hasEvent: boolean
      events: DateEventSummary[]
      sundayLunchUnavailable: boolean
    }> = []

    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 30)
    const sundayLunchOverrides = availabilityData.sundayLunchOverrides || []
    const globalSundayLunchEnabled = availabilityData.sundayLunchStatus?.isEnabled ?? true
    const globalSundayLunchMessage = availabilityData.sundayLunchStatus?.message || null

    const cursor = new Date(today)
    while (cursor <= maxDate) {
      const iso = cursor.toISOString().split('T')[0]
      const dayData = availabilityData.days.find(d => d.date === iso)
      const isSunday = cursor.getDay() === 0
      const isMonday = cursor.getDay() === 1
      const events = eventsByDate[iso] ?? []
      const venueClosed = availabilityData.blockedDates.includes(iso) || (dayData?.isClosed ?? false)
      const kitchenClosed =
        dayData !== undefined
          ? dayData.isKitchenClosed
          : isMonday

      const drinksOnly = !venueClosed && kitchenClosed
      const override = sundayLunchOverrides.find(
        (entry) => entry.startDate <= iso && entry.endDate >= iso
      )
      const sundayUnavailable = isSunday && (
        override ? override.isEnabled === false : !globalSundayLunchEnabled
      )

      let specialNote = dayData?.specialNote
      if (!specialNote && drinksOnly) {
        specialNote = 'Kitchen closed - drinks only'
      }
      if (!specialNote && sundayUnavailable) {
        specialNote = override?.message || globalSundayLunchMessage || 'Sunday lunch unavailable'
      }

      days.push({
        date: iso,
        dayNum: cursor.getDate(),
        dayName: cursor.toLocaleDateString('en-GB', { weekday: 'short' }),
        month: cursor.toLocaleDateString('en-GB', { month: 'short' }),
        isToday: iso === today.toISOString().split('T')[0],
        isSunday,
        isBlocked: venueClosed,
        isDrinksOnly: drinksOnly,
        hasRoast: isSunday && !venueClosed && !kitchenClosed && !sundayUnavailable,
        specialNote,
        hasEvent: events.length > 0,
        events,
        sundayLunchUnavailable: sundayUnavailable
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    return days
  }, [availabilityData, eventsByDate, today])

  const selectedDay = useMemo(
    () => calendarDays.find(day => day.date === selectedDate),
    [calendarDays, selectedDate]
  )

  const isSunday = selectedDay?.isSunday ?? false
  const sundayLunchDisabledReason = (() => {
    if (!isSunday) return null
    if (selectedDay?.sundayLunchUnavailable) {
      return selectedDay?.specialNote || 'Sunday lunch is unavailable on this date.'
    }
    const bookingDate = new Date((selectedDate || '') + 'T12:00:00')
    const saturday = new Date(bookingDate)
    saturday.setDate(saturday.getDate() - 1)
    saturday.setHours(13, 0, 0, 0)
    if (new Date() > saturday) {
      return 'Sunday lunch orders close at 1pm on Saturday.'
    }
    return null
  })()
  // Let the user try Sunday lunch on any Sunday unless explicitly disabled or past cutoff
  const canChooseSundayLunch = isSunday && !sundayLunchDisabledReason

  const fetchTimeSlots = useCallback(async (targetDate: string, party: number, type: 'regular' | 'sunday_lunch') => {
    if (!targetDate) {
      setTimeSlots([])
      return
    }

    setLoadingTimes(true)
    setTimeSlots([])
    try {
      const params = new URLSearchParams({
        date: targetDate,
        party_size: String(party)
      })
      if (type) {
        params.set('booking_type', type)
      }
      const response = await fetch(`/api/table-bookings/availability?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.data.time_slots) {
        setTimeSlots(
          data.data.time_slots.map((slot: any) => ({
            time: slot.time,
            available: typeof slot.available === 'boolean'
              ? slot.available
              : (slot.available_capacity ?? slot.tables_available ?? slot.remaining ?? 0) > 0,
            busy: typeof slot.available_capacity === 'number'
              ? slot.available_capacity <= 2
              : undefined,
            remaining: slot.available_capacity ?? slot.tables_available ?? slot.remaining
          }))
        )
      } else {
        setTimeSlots([])
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err)
      setTimeSlots([])
      setError('Unable to load available times. Please try again.')
    } finally {
      setLoadingTimes(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate, selectedPartySize, bookingType)
    }
    // Removed automatic reversion to regular here.
    // The `handleBookingTypeSelect` already prevents selection if !canChooseSundayLunch.
    // If a user manages to select it (e.g., through direct URL manipulation or if
    // conditions change after selection), the time slots will simply be empty,
    // and the system should display "No online slots left."

  }, [selectedDate, selectedPartySize, bookingType, fetchTimeSlots, canChooseSundayLunch, onBookingTypeChange])

  const handleDateSelect = (targetDate: string, blocked: boolean, drinksOnly: boolean) => {
    if (blocked) return
    if (drinksOnly) {
      setError('Kitchen is closed on this day. Please call us for drinks-only reservations.')
      return
    }
    setSelectedDate(targetDate)
    setError('')
  }

  const handlePartySizeChange = (size: number) => {
    if (size < MIN_PARTY || size > MAX_PARTY) return
    setSelectedPartySize(size)
  }

  const handleTimeSelect = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedTime(slot.time)
    setError('')
  }

  const handleBookingTypeSelect = (type: 'regular' | 'sunday_lunch') => {
    if (type === 'sunday_lunch' && !canChooseSundayLunch) return
    if (type !== bookingType) {
      onBookingTypeChange(type)
      setSelectedTime('')
      if (selectedDate) {
        fetchTimeSlots(selectedDate, selectedPartySize, type)
      }
    }
  }

  const handleContinue = () => {
    if (!selectedDate) {
      setError('Please choose a date for your visit.')
      return
    }
    if (!selectedTime) {
      setError('Please select a seating time.')
      return
    }

    if (bookingType === 'sunday_lunch' && !canChooseSundayLunch) {
      setError(sundayLunchDisabledReason || 'Sunday lunch is not available for this date.')
      return
    }

    const finalType = bookingType === 'sunday_lunch' && canChooseSundayLunch ? 'sunday_lunch' : 'regular'
    onNext({ date: selectedDate, partySize: selectedPartySize, time: selectedTime, bookingType: finalType })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-anchor-charcoal">
          Plan your visit
        </h2>
        <p className="text-gray-600">
          Select your date, party size, and preferred time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {(() => {
                if (calendarDays.length === 0) return null
                const first = new Date(calendarDays[0].date + 'T12:00:00')
                const weekday = first.getDay()
                const empty = weekday === 0 ? 6 : weekday - 1
                return Array.from({ length: empty }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))
              })()}

              {calendarDays.map(day => {
                const isSelected = selectedDate === day.date
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleDateSelect(day.date, day.isBlocked, day.isDrinksOnly)}
                    disabled={day.isBlocked}
                    className={cn(
                      'relative p-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-anchor-gold min-h-[60px] flex flex-col items-center justify-center border',
                      isSelected && 'bg-anchor-green text-white border-anchor-green',
                      !isSelected && day.isBlocked && 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
                      !isSelected && day.isDrinksOnly && 'bg-blue-50 hover:bg-blue-100 border-blue-200',
                      !isSelected && day.hasRoast && !day.sundayLunchUnavailable && 'bg-amber-50 hover:bg-amber-100 border-amber-200',
                      !isSelected && day.hasEvent && 'bg-purple-50 hover:bg-purple-100 border-purple-200',
                      !isSelected && day.isToday && 'bg-anchor-cream border-2 border-anchor-gold'
                    )}
                    title={day.specialNote || undefined}
                  >
                    <span className="text-sm font-medium">{day.dayNum}</span>
                    {day.hasEvent && !day.isBlocked && (
                      <Icon
                        name="sparkles"
                        className={cn('w-3 h-3 mt-1', isSelected ? 'text-white' : 'text-purple-500')}
                      />
                    )}
                    {day.isToday && <span className="text-xs mt-1">Today</span>}
                    {day.hasRoast && !day.isBlocked && (
                      <Icon name="utensils" className="w-3 h-3 mt-1" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedDay && selectedDay.events.length > 0 && (
            <div className="flex gap-4 rounded-xl border border-purple-200 bg-purple-50/70 p-4">
              <div className="mt-1">
                <Icon name="sparkles" className="h-6 w-6 text-purple-500" />
              </div>
              <div className="space-y-3 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-anchor-green">
                    {selectedDay.events.length > 1 ? 'Events on this date' : 'Event on this date'}
                  </h3>
                  <p className="text-sm text-gray-700">
                    We&apos;re still open for regular diners. Fancy joining the fun? Tap to read more.
                  </p>
                </div>
                <ul className="space-y-3">
                  {selectedDay.events.map(event => (
                    <li key={event.id} className="rounded-lg border border-purple-100 bg-white p-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={event.slug ? `/events/${event.slug}` : `/events/${event.id}`}
                          className="text-anchor-gold font-semibold hover:text-anchor-gold-light"
                        >
                          {event.name}
                        </a>
                        {event.startDate && (
                          <span className="text-sm text-gray-600">
                            Starts {new Date(event.startDate).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {event.shortDescription && (
                        <p className="mt-1 text-sm text-gray-700">{event.shortDescription}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-anchor-cream rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-anchor-charcoal">Party size</h3>
              <span className="text-sm text-gray-600">(up to {MAX_PARTY})</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handlePartySizeChange(selectedPartySize - 1)}
                disabled={selectedPartySize <= MIN_PARTY}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  selectedPartySize <= MIN_PARTY
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-anchor-green hover:scale-110'
                )}
              >
                <Icon name="minus" className="w-4 h-4" />
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-anchor-green">{selectedPartySize}</div>
                <div className="text-sm text-gray-600">
                  {selectedPartySize === 1 ? 'Person' : 'People'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePartySizeChange(selectedPartySize + 1)}
                disabled={selectedPartySize >= MAX_PARTY}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  selectedPartySize >= MAX_PARTY
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-anchor-green hover:scale-110'
                )}
              >
                <Icon name="plus" className="w-4 h-4" />
              </button>
            </div>
            {selectedPartySize >= 15 && (
              <p className="mt-4 text-sm text-amber-700">
                Planning a celebration? Call us on 01753 682707 so we can arrange the perfect setup.
              </p>
            )}
          </div>

          {isSunday && (
            <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-anchor-charcoal">Choose your menu</h3>
                <span className="text-xs text-gray-600">Pick menu before time</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleBookingTypeSelect('sunday_lunch')}
                  disabled={!canChooseSundayLunch}
                  className={cn(
                    'text-left border rounded-lg p-3 transition-all h-full',
                    bookingType === 'sunday_lunch'
                      ? 'border-amber-400 bg-amber-50 shadow'
                      : 'border-dashed border-amber-200 bg-amber-50/60 hover:border-amber-300',
                    !canChooseSundayLunch && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="utensils" className="w-5 h-5 text-amber-700" />
                    <span className="font-semibold text-anchor-charcoal">Sunday lunch</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Pre-order roasts and pay the £5pp deposit now.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookingTypeSelect('regular')}
                  className={cn(
                    'text-left border rounded-lg p-3 transition-all h-full',
                    bookingType === 'regular'
                      ? 'border-anchor-green bg-white shadow'
                      : 'border-dashed border-gray-200 bg-gray-50 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="bookOpen" className="w-5 h-5 text-anchor-green" />
                    <span className="font-semibold text-anchor-charcoal">Regular menu</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Book a table and order from the main menu on arrival.
                  </p>
                </button>
              </div>
              {sundayLunchDisabledReason && (
                <p className="text-sm text-amber-700">{sundayLunchDisabledReason}</p>
              )}
            </div>
          )}

          <div className="bg-white border rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <h3 className="font-semibold text-anchor-charcoal">Available times</h3>
            <span className="text-xs text-gray-500">
              {bookingType === 'sunday_lunch' ? 'Sunday lunch pre-order' : 'Regular dining'}
            </span>
              {selectedDate && (
                <span className="text-sm text-gray-600">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              )}
            </div>

            {!selectedDate && (
              <p className="text-sm text-gray-600">
                Choose a date to see available times.
              </p>
            )}

            {selectedDate && loadingTimes && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-anchor-green mx-auto" />
                <p className="mt-2 text-sm text-gray-600">Loading times...</p>
              </div>
            )}

            {selectedDate && !loadingTimes && timeSlots.length === 0 && (
              <p className="text-sm text-gray-600">
                No online slots left. Please call us on 01753 682707.
              </p>
            )}

            {selectedDate && timeSlots.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      selectedTime === slot.time
                        ? 'bg-anchor-green text-white border-anchor-green'
                        : slot.available
                          ? 'bg-white border-gray-200 hover:border-anchor-gold'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {slot.time}
                    {slot.busy && slot.available && (
                      <span className="block text-[11px] text-amber-700">Filling fast</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedDay?.hasRoast && sundayLunchAvailable && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-1">Sunday roast available</h4>
              <p className="text-sm text-amber-800">
                Secure roast-preorders and deposits in the next step.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-anchor-cream rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">You selected</p>
          <p className="text-lg font-semibold text-anchor-green">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}{' '}
            · {selectedPartySize} {selectedPartySize === 1 ? 'person' : 'people'}{' '}
            {selectedTime && `· ${selectedTime}`} · {bookingType === 'sunday_lunch' ? 'Sunday lunch' : 'Regular menu'}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-start gap-2">
          <Icon name="info" className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="bg-anchor-green text-white px-8 py-3 rounded-lg font-medium hover:bg-anchor-green-dark transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
